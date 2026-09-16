/* Mesure d'audience du site et des emails (voir la politique de confidentialité).
   1. Un lien d'email porte ?u=<jeton> : la visite est signalée une fois par
      session, le jeton est gardé le temps de la session, puis l'adresse est nettoyée.
   2. Les clics vers Amazon (commander, avis, boutique) sont comptés : avec le
      jeton si la visite vient d'un email, sans aucun identifiant sinon.
   3. Sur /go/, le clic d'un email est noté puis le lecteur est redirigé aussitôt.
   4. Chaque page vue est comptée : la page et le type de provenance (moteur de
      recherche, réseau social, email, accès direct...), sans aucun identifiant.
   Aucun cookie. */
(function () {
    'use strict';
    var ENDPOINT = 'https://script.google.com/macros/s/AKfycbz7HmkseaDtIbT70xaE7Sqhhik7ZKOYYFcPkMzWCB-ML--BAWutLYwUYuyHhJM4fKJM6A/exec';
    var AMAZON = 'https://www.amazon.fr';
    var BOUTIQUE = AMAZON + '/stores/author/B0CJ6VJG76';

    /* Liens Amazon Attribution (console Amazon Ads), un par livre : { "ASIN": "https://www.amazon.fr/dp/ASIN?maas=..." }.
       site  : boutons « Commander » des pages du site
       email : liens « Commander » des emails (passent par /go/)
       Tant qu'un livre n'a pas de lien ici, on garde le lien Amazon simple. */
    var ATTRIBUTION = {
        site: {},
        email: {}
    };

    var RE_JETON = /^[a-z0-9]{4,12}$/;
    var RE_ASIN = /^[A-Z0-9]{10}$/;
    var RE_CHEMIN = /^(livres|livre|ressources)\/[A-Za-z0-9._-]+\.(pdf|html)$/;

    function lire(cle) { try { return window.sessionStorage.getItem(cle); } catch (e) { return null; } }
    function ecrire(cle, v) { try { window.sessionStorage.setItem(cle, v); } catch (e) {} }

    function signaler(type, jeton, asin, page) {
        var url = ENDPOINT + '?action=clic&t=' + encodeURIComponent(type) +
            '&u=' + encodeURIComponent(jeton || '') +
            '&a=' + encodeURIComponent(asin || '') +
            '&p=' + encodeURIComponent(page || window.location.pathname);
        try {
            window.fetch(url, { mode: 'no-cors', keepalive: true });
        } catch (e) {
            try { new Image().src = url; } catch (e2) {}
        }
    }

    function lienAchat(asin, canal) {
        var tag = ATTRIBUTION[canal] && ATTRIBUTION[canal][asin];
        if (tag && tag.indexOf(AMAZON + '/') === 0) return tag;
        return AMAZON + '/dp/' + asin;
    }

    function asinDe(href) {
        var m = href.match(/\/dp\/([A-Z0-9]{10})/) || href.match(/[?&]asin=([A-Z0-9]{10})/);
        return m ? m[1] : '';
    }

    function nature(href) {
        if (/\/review\//.test(href)) return 'avis';
        if (/\/stores\//.test(href)) return 'boutique';
        if (/\/dp\//.test(href)) return 'achat';
        return '';
    }

    var qs;
    try { qs = new URLSearchParams(window.location.search); } catch (e) { return; }
    var jeton = (qs.get('u') || '').toLowerCase();
    if (!RE_JETON.test(jeton)) jeton = '';
    var depuisEmail = !!jeton;

    /* 3. Page /go/ : noter, puis rediriger. */
    if (/\/go\/?(index\.html)?$/.test(window.location.pathname)) {
        var k = qs.get('k') || '';
        var asin = (qs.get('a') || '').toUpperCase();
        var to = qs.get('to') || '';
        var dest = '/';
        if (!RE_ASIN.test(asin)) asin = '';
        if (!RE_CHEMIN.test(to)) to = '';
        if (k === 'achat' && asin) {
            dest = lienAchat(asin, 'email');
        } else if (k === 'avis' && asin) {
            dest = AMAZON + '/review/create-review?asin=' + asin;
        } else if (k === 'achat' || k === 'avis' || k === 'boutique') {
            k = 'boutique';
            dest = BOUTIQUE;
        } else {
            k = (k === 'livre' && to) ? 'livre' : 'page';
            dest = '/' + to;
        }
        if (jeton) ecrire('fc_u', jeton);
        signaler(k, jeton, asin, to ? '/' + to : '/go/');
        var suite = document.getElementById('suite');
        if (suite) suite.setAttribute('href', dest);
        window.setTimeout(function () { window.location.replace(dest); }, 150);
        return;
    }

    /* 1. Arrivée depuis un email. */
    if (jeton) {
        ecrire('fc_u', jeton);
        if (!lire('fc_u_' + jeton)) {
            ecrire('fc_u_' + jeton, '1');
            signaler('visite', jeton, '', window.location.pathname);
        }
        qs.delete('u');
        var reste = qs.toString();
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, '',
                window.location.pathname + (reste ? '?' + reste : '') + window.location.hash);
        }
    } else {
        jeton = lire('fc_u') || '';
        if (!RE_JETON.test(jeton)) jeton = '';
    }

    /* 4. Page vue : la page et le type de provenance, rien d'autre. */
    function provenance() {
        if (depuisEmail) return 'email';
        var src = (qs.get('src') || '').toLowerCase();
        if (src === 'instagram' || src === 'facebook' || src === 'pinterest') return src;
        var ref = document.referrer || '';
        if (!ref) return 'direct';
        var hote = '';
        try { hote = new URL(ref).hostname.toLowerCase(); } catch (e) { return 'autre'; }
        if (hote === window.location.hostname) return 'interne';
        if (/(^|\.)google\./.test(hote)) return 'google';
        if (/(^|\.)bing\.com$/.test(hote)) return 'bing';
        if (/(^|\.)instagram\.com$/.test(hote)) return 'instagram';
        if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(hote)) return 'facebook';
        if (/(^|\.)pinterest\./.test(hote)) return 'pinterest';
        if (/(^|\.)amazon\./.test(hote)) return 'amazon';
        return 'autre';
    }
    function signalerVue() {
        var url = ENDPOINT + '?action=vue&s=' + encodeURIComponent(provenance()) +
            '&p=' + encodeURIComponent(window.location.pathname);
        try { window.fetch(url, { mode: 'no-cors', keepalive: true }); } catch (e) {}
    }
    if (document.prerendering) {
        document.addEventListener('prerenderingchange', signalerVue, { once: true });
    } else {
        signalerVue();
    }

    /* 2. Clics vers Amazon. */
    function preparer() {
        var liens = document.querySelectorAll('a[href*="amazon.fr/dp/"]');
        for (var i = 0; i < liens.length; i++) {
            var a = asinDe(liens[i].getAttribute('href') || '');
            if (a) liens[i].setAttribute('href', lienAchat(a, 'site'));
        }
    }
    function surClic(ev) {
        var el = ev.target;
        while (el && el.nodeName !== 'A') el = el.parentNode;
        if (!el || !el.getAttribute) return;
        var href = el.getAttribute('href') || '';
        if (href.indexOf('amazon.fr') < 0) return;
        var type = nature(href);
        if (type) signaler(type, jeton, asinDe(href), window.location.pathname);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preparer);
    } else {
        preparer();
    }
    document.addEventListener('click', surClic, true);
    document.addEventListener('auxclick', function (ev) { if (ev.button === 1) surClic(ev); }, true);
})();
