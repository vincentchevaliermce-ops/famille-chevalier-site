/* Mesure d'audience des emails d'annonce.
   Un lien d'email peut porter ?u=<jeton> : on le signale une seule fois
   par session, puis on nettoie l'adresse pour ne pas le laisser trainer
   dans la barre du navigateur ni dans les liens partages. */
(function () {
    'use strict';
    var ENDPOINT = 'https://script.google.com/macros/s/AKfycbz7HmkseaDtIbT70xaE7Sqhhik7ZKOYYFcPkMzWCB-ML--BAWutLYwUYuyHhJM4fKJM6A/exec';
    try {
        var qs = new URLSearchParams(window.location.search);
        var u = qs.get('u');
        if (!u || !/^[a-z0-9]{4,12}$/.test(u)) return;

        var cle = 'fc_u_' + u;
        var vu = false;
        try { vu = !!sessionStorage.getItem(cle); sessionStorage.setItem(cle, '1'); } catch (e) {}

        if (!vu) {
            fetch(ENDPOINT + '?action=clic&u=' + encodeURIComponent(u) +
                  '&p=' + encodeURIComponent(window.location.pathname), { mode: 'no-cors' });
        }

        qs.delete('u');
        var reste = qs.toString();
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, '',
                window.location.pathname + (reste ? '?' + reste : '') + window.location.hash);
        }
    } catch (e) {}
})();
