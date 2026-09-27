// =====================================================================
//  SUIVI ANONYME DU JEU ET CHAMPION SECRET DES PARENTS — suivi.js (27/09/2026, session LANCEMENT)
//  Fichier autonome : s'il manque, le jeu marche exactement pareil. Il ne change aucune règle du jeu.
//  1) Compteurs anonymes (mesure d'audience) : combien d'appareils ouvrent le jeu, combien de parties, quels animaux.
//     Aucun cookie, aucun identifiant, rien qui permette de reconnaître un enfant ou un appareil : des compteurs,
//     envoyés par petits paquets au script de Famille Chevalier (Google Apps Script, le même que pour le site).
//     Hors ligne, ils attendent sur l'appareil (60 au plus). « Compter cet appareil : NON » (espace parents) coupe tout.
//     Rien n'est envoyé hors de editions-chevalier.fr ni depuis un navigateur piloté (tests automatiques) ;
//     pour tester l'envoi : localStorage « suivi-test » = « 1 ».
//     Cadre : mesure d'audience exemptée de consentement (CNIL) : statistiques anonymes pour l'éditeur seul,
//     information et opposition dans l'espace parents, repères gardés sur l'appareil 13 mois au plus.
//  2) Espace parents : ce fichier y ajoute le paragraphe « Mesure d'audience » (bouton OUI/NON) et le bloc
//     « 🎁 Un champion secret pour votre enfant » (e-mail d'un parent → le script envoie le code TROPHEE-2026).
//  3) Le code TROPHEE-2026, tapé dans MES ANIMAUX → 🔑, est reconnu par l'écran du jeu grâce à une entrée ajoutée
//     à CODES (game.js), sans toucher à bonus.js : l'animal donné est le premier de BONUS_ANIMAUX que l'enfant n'a
//     pas encore, une seule fois par appareil (ensuite : « Tu as déjà … »).
//  Le fichier observe (SAVE.debloques, écrans, boutons) et enveloppe deux fonctions globales, startMatch() et
//  apresMatch(), sans changer ce qu'elles font.
//  Événements : arrivee:<provenance> (chaque visite) · ouverture[:app] (1 fois par jour et par appareil)
//    · semaine (1 fois par semaine) · nouveau (1er lancement)
//    · partie:<mode>:<animal> · fin:<v|d|n|x> · gagne:<animal> · livre:<animal> · legende:<animal> · monde:<monde>
//    · duel:<n> · tuto · photo · defi:<envoye|recu> · partage:<accueil|parents|invite> · installe[:fait] · parents · bonus[:code]
//  Modes : 1j combat libre · 1d pour gagner un animal · 1l duel du livre · 1q défi du jour · 1c défi d'un copain
//          · 2e à deux, même écran · 2t à deux, deux téléphones          fin : v gagné · d perdu · n nul · x à deux
//  Provenance d'une visite : le paramètre ?s= du lien s'il existe (ex. ?s=x pour le fil X, ?s=ig pour Instagram),
//    sinon le type de site d'où l'on vient (x, instagram, facebook, tiktok, youtube, recherche, mail, site, autre)
//    ou « direct » (QR code, adresse tapée, appli). Jamais l'adresse exacte de la page d'origine.
//  Serveur : action=jeu (compteurs) et action=email&book=Arene (bonus) du script « Envoi-Livre-Gratuit-Chevalier ».
// =====================================================================
(function () {
  'use strict';
  var SCRIPT = 'https://script.google.com/macros/s/AKfycbz7HmkseaDtIbT70xaE7Sqhhik7ZKOYYFcPkMzWCB-ML--BAWutLYwUYuyHhJM4fKJM6A/exec';
  var CODE_BONUS = 'TROPHEE2026'; // = propriété ARENE_CODE_BONUS du script (« TROPHEE-2026 »), écrit comme normCode() le lit
  var BONUS_ANIMAUX = ['alligator', 'girafe', 'lionne', 'python', 'puma', 'oursnoir', 'cobra', 'mangouste', 'caiman', 'autruche', 'porcepic'];
  var CONFIDENTIALITE = 'https://editions-chevalier.fr/#confidentialite';
  var MAX_FILE = 60, PAR_ENVOI = 40, DELAI = 20000, TREIZE_MOIS = 395 * 864e5;

  var ls = {
    get: function (k) { try { return localStorage.getItem(k) } catch (e) { return null } },
    set: function (k, v) { try { localStorage.setItem(k, v) } catch (e) { } },
    del: function (k) { try { localStorage.removeItem(k) } catch (e) { } }
  };
  var coupe = function () { return ls.get('suivi-non') === '1' };
  var actif = function () {
    if (coupe()) return false;
    if (ls.get('suivi-test') === '1') return true;
    return /(^|\.)editions-chevalier\.fr$/.test(location.hostname) && !navigator.webdriver;
  };
  var file = [];
  try { file = JSON.parse(ls.get('suivi-file') || '[]'); if (!Array.isArray(file)) file = [] } catch (e) { file = [] }
  var minuterie = null;
  var version = (function () { var s = (document.currentScript && document.currentScript.src) || '', m = s.match(/[?&]v=(\d+)/); return m ? m[1] : '' })();
  var plateforme = (function () {
    var tactile = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches), cote = Math.min(screen.width || 0, screen.height || 0);
    return !tactile ? 'ordi' : cote >= 600 ? 'tablette' : 'tel';
  })();
  var jeu = function () { try { return (window.__jeu && window.__jeu.G) || (typeof G !== 'undefined' ? G : null) } catch (e) { return null } };
  var enLigne = function () { try { return typeof NET !== 'undefined' && NET && NET.on } catch (e) { return false } };
  var nettoie = function (t) { return String(t == null ? '' : t).toLowerCase().replace(/[^a-z0-9_:-]/g, '').slice(0, 40) };
  var garde = function () { ls.set('suivi-file', JSON.stringify(file)) };
  var son = function () { try { if (typeof sfx === 'function') sfx('clic') } catch (e) { } };

  function ev(nom, detail) {
    if (!actif()) return;
    file.push(nettoie(nom) + (detail ? ':' + nettoie(detail) : ''));
    if (file.length > MAX_FILE) file = file.slice(-MAX_FILE);
    garde();
    if (!minuterie) minuterie = setTimeout(envoie, DELAI);
  }

  function envoie() {
    minuterie = null;
    if (!actif()) { file = []; ls.del('suivi-file'); return }
    if (!file.length || navigator.onLine === false || typeof fetch !== 'function') return;
    var lot = file.slice(0, PAR_ENVOI);
    file = file.slice(lot.length); garde();
    var url = SCRIPT + '?action=jeu&p=' + plateforme + '&v=' + encodeURIComponent(version) + '&ev=' + encodeURIComponent(lot.join('|'));
    var remet = function () { file = lot.concat(file).slice(-MAX_FILE); garde() }; // pas de réseau : on réessaiera
    try { fetch(url, { mode: 'no-cors', keepalive: true, cache: 'no-store', credentials: 'omit' }).catch(remet) } catch (e) { remet() }
    if (file.length && !minuterie) minuterie = setTimeout(envoie, DELAI);
  }

  // --- les animaux gagnés, lus dans la sauvegarde du jeu (le GOD MODE n'y écrit rien : il ne compte pas)
  var mondeDeK = function (k) { try { return (typeof CHARS !== 'undefined' && CHARS[k] && CHARS[k].monde) || 'terre' } catch (e) { return 'terre' } };
  var estLegende = function (k) {
    try { if (typeof estLegendaire === 'function') return !!estLegendaire(k) } catch (e) { }
    try { return typeof MONDES !== 'undefined' && Object.keys(MONDES).some(function (m) { return MONDES[m].legende === k }) } catch (e) { return false }
  };
  var duLivre = function (k) { try { return typeof LIVRE_EN_MAIN !== 'undefined' && !!LIVRE_EN_MAIN[k] } catch (e) { return false } };
  function debloques() { try { return typeof SAVE !== 'undefined' && SAVE && Array.isArray(SAVE.debloques) ? SAVE.debloques.slice() : null } catch (e) { return null } }
  function verifieGains() {
    var a = debloques(); if (!a) return;
    var brut = ls.get('suivi-animaux');
    if (brut === null) { ls.set('suivi-animaux', JSON.stringify(a)); return } // premier passage : on note sans compter
    var avant = []; try { avant = JSON.parse(brut) || [] } catch (e) { avant = [] }
    var neufs = a.filter(function (k) { return avant.indexOf(k) < 0 });
    if (!neufs.length) return;
    var mondes = {}; avant.forEach(function (k) { mondes[mondeDeK(k)] = 1 });
    var recu = ls.get('bonus-champion');
    neufs.forEach(function (k) {
      ev('gagne', k);
      if (duLivre(k)) ev('livre', k);
      if (estLegende(k)) ev('legende', k);
      if (k === recu) ev('bonus', 'code'); // le champion secret vient d'arriver par le code du bonus
      var m = mondeDeK(k); if (!mondes[m] && m !== 'terre') { mondes[m] = 1; ev('monde', m) }
    });
    ls.set('suivi-animaux', JSON.stringify(a));
  }

  // --- une partie commence (startMatch) et se termine (apresMatch, appelé par le jeu à chaque fin de match)
  function modeActuel() {
    var g = jeu(); if (!g) return '1j';
    if (enLigne()) return '2t';
    if (g.mode === 2) return '2e';
    if (g.livre) return '1l';
    if (g.epreuve) return '1d';
    if (g.jour) return '1q';
    if (g.defi) return '1c';
    return '1j';
  }
  function partie() {
    var g = jeu(); if (!g) return;
    if (g.tuto) { ev('tuto'); return } // le tutoriel (1re fois) n'est pas compté comme une partie
    ev('partie', modeActuel() + ':' + ((g.pick && g.pick[0]) || ''));
    if (g.livre && g.livre.D && g.livre.D.n) ev('duel', String(g.livre.D.n));
  }
  function finMatch(v) {
    var g = jeu(), r; if (g && g.tuto) return;
    if (!v) r = 'n'; else if (enLigne() || (g && g.mode === 2)) r = 'x'; else r = v.cpu ? 'd' : 'v';
    ev('fin', r);
  }
  function enveloppe(nom, avant, apres) {
    var f = window[nom]; if (typeof f !== 'function' || f.__suivi) return;
    var w = function () {
      try { if (avant) avant.apply(this, arguments) } catch (e) { }
      var r = f.apply(this, arguments);
      try { if (apres) apres.apply(this, arguments) } catch (e) { }
      return r;
    };
    w.__suivi = true;
    try { window[nom] = w } catch (e) { }
  }

  // --- le code du champion secret, reconnu par l'écran 🔑 du jeu (CODES de game.js, lu par valideCodeSecret)
  function champion() {
    var c = null; try { c = typeof SAVE !== 'undefined' && SAVE && SAVE.codes } catch (e) { }
    var deja = (c && c.bonus) || ls.get('bonus-champion');
    if (deja && BONUS_ANIMAUX.indexOf(deja) >= 0) return deja; // déjà reçu sur cet appareil : « Tu as déjà … »
    var a = debloques() || [];
    var k = BONUS_ANIMAUX.filter(function (x) { return a.indexOf(x) < 0 && typeof CHARS !== 'undefined' && !!CHARS[x] })[0] || BONUS_ANIMAUX[0];
    if (c) c.bonus = k; // gardé avec la partie (valideCodeSecret appelle sauve() juste après)
    ls.set('bonus-champion', k);
    return k;
  }
  function brancheCode() {
    try {
      if (typeof CODES === 'undefined' || !CODES || Object.prototype.hasOwnProperty.call(CODES, CODE_BONUS)) return;
      Object.defineProperty(CODES, CODE_BONUS, { get: champion, enumerable: false, configurable: true });
    } catch (e) { }
  }

  // --- espace parents : « Mesure d'audience » et « Un champion secret pour votre enfant »
  var CSS = '#cadre #parents .pl-bonus{border:.25cqw solid var(--jaune);border-radius:1cqw;padding:1cqw 1.4cqw;display:flex;flex-direction:column;gap:.7cqw;align-items:flex-start}' +
    '#cadre #parents .pl-bonus .bonus-ligne{display:flex;flex-wrap:wrap;gap:1cqw;align-items:center}' +
    '#cadre #parents .pl-bonus .bonus-in{font:inherit;font-weight:700;width:46cqw;max-width:100%;padding:.7cqw 1.2cqw;border-radius:1cqw;border:.3cqw solid var(--jaune);background:var(--creme);color:var(--marine);text-transform:none;letter-spacing:0}' +
    '#cadre #parents .pl-bonus .bonus-in::placeholder{color:#6b7280;font-weight:400}' +
    '#cadre #parents .pl-bonus .bonus-accord{display:flex;gap:1cqw;align-items:flex-start;font-size:var(--t-min);line-height:1.35;cursor:pointer}' +
    '#cadre #parents .pl-bonus .bonus-accord input{width:2.6cqw;height:2.6cqw;min-width:18px;min-height:18px;flex:none;margin:.3cqw 0 0;accent-color:var(--jaune)}' +
    '#cadre #parents .pl-bonus .bonus-msg{margin:0;font-weight:700;color:var(--jaune)}' +
    '#cadre #parents .pl-bonus .bonus-msg:empty{display:none}';
  var HTML_BONUS = '<p><b>🎁 Un champion secret pour votre enfant</b></p>' +
    '<p>Laissez votre adresse e-mail&nbsp;: vous recevez un code qui fait entrer un champion secret dans l’arène. Votre enfant le tape dans <b>MES ANIMAUX → 🔑</b>… et découvre lequel.</p>' +
    '<div class="bonus-ligne"><input id="bonus-email" class="bonus-in" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="120" placeholder="adresse e-mail d’un parent" aria-label="Adresse e-mail d’un parent">' +
    '<button class="btn go" id="bonus-go" type="button">RECEVOIR LE CODE</button></div>' +
    '<label class="bonus-accord"><input type="checkbox" id="bonus-accord"><span>Je suis le parent (18 ans ou plus) et j’accepte de recevoir ce code et, quelques fois par an, l’annonce de nos parutions et de nos grands rendez-vous. Désinscription sur simple demande. <a href="' + CONFIDENTIALITE + '" target="_blank" rel="noopener">Confidentialité ↗</a></span></label>' +
    '<p id="bonus-msg" class="bonus-msg" role="status" aria-live="polite"></p>';
  var HTML_MESURE = '<b>Mesure d’audience</b>&nbsp;: pour savoir si le jeu plaît, il compte les ouvertures, les parties et les animaux gagnés, sans cookie et sans rien qui permette de reconnaître l’enfant ou l’appareil (on sait seulement s’il s’agit d’un téléphone, d’une tablette ou d’un ordinateur). Compter cet appareil&nbsp;: <button class="btn" id="opt-suivi" type="button">OUI ✔</button>';

  function injecteParents() {
    var zone = document.getElementById('parents-contenu');
    if (!zone || document.getElementById('pl-bonus')) return;
    var st = document.createElement('style'); st.id = 'suivi-css'; st.textContent = CSS; document.head.appendChild(st);
    var bloc = document.createElement('div'); bloc.className = 'pl-bonus'; bloc.id = 'pl-bonus'; bloc.innerHTML = HTML_BONUS;
    var livre = zone.querySelector('.pl-livre');
    if (livre && livre.parentNode === zone) livre.insertAdjacentElement('afterend', bloc); else zone.insertBefore(bloc, zone.children[1] || null);
    var p = document.createElement('p'); p.id = 'suivi-ligne'; p.innerHTML = HTML_MESURE;
    var peer = Array.prototype.filter.call(zone.querySelectorAll('p'), function (x) { return /PeerJS/.test(x.textContent) })[0];
    var credits = zone.querySelector('.credits');
    if (peer) peer.insertAdjacentElement('afterend', p); else if (credits) zone.insertBefore(p, credits); else zone.appendChild(p);
  }
  function majOption() {
    var b = document.getElementById('opt-suivi'); if (!b) return;
    b.textContent = coupe() ? 'NON' : 'OUI ✔'; b.setAttribute('aria-pressed', String(!coupe()));
  }
  function brancheOption() {
    var b = document.getElementById('opt-suivi'); if (!b) return;
    b.addEventListener('click', function () {
      if (coupe()) ls.del('suivi-non'); else { ls.set('suivi-non', '1'); file = []; ls.del('suivi-file') }
      son(); majOption();
    });
    majOption();
  }
  function brancheBonus() {
    var email = document.getElementById('bonus-email'), accord = document.getElementById('bonus-accord'), msg = document.getElementById('bonus-msg'), go = document.getElementById('bonus-go');
    if (!email || !go) return;
    var dit = function (t, voir) {
      if (!msg) return; msg.textContent = t;
      if (voir) try { msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) } catch (e) { } // le message peut être sous le bord de l'écran
    };
    if (ls.get('bonus-envoye')) dit('Code déjà demandé sur cet appareil. Pas reçu ? Regardez dans les courriers indésirables, ou demandez-le à nouveau.');
    var envoi = function () {
      var e = String(email.value || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { dit('Cette adresse e-mail ne semble pas complète.', 1); email.focus(); return }
      if (accord && !accord.checked) { dit('Cochez la case juste en dessous pour recevoir le code.', 1); try { accord.focus() } catch (err) { } return }
      if (navigator.onLine === false || typeof fetch !== 'function') { dit('Il faut une connexion à internet pour recevoir le code.', 1); return }
      son(); go.disabled = true; dit('Envoi…');
      var url = SCRIPT + '?action=email&email=' + encodeURIComponent(e) + '&book=Arene&source=arene';
      var fini = function () {
        go.disabled = false; ls.set('bonus-envoye', '1'); ev('bonus'); email.value = ''; if (accord) accord.checked = false;
        dit('C’est parti ! Le code arrive par e-mail dans quelques minutes (pensez aux courriers indésirables). Votre enfant le tape dans MES ANIMAUX → 🔑.', 1);
      };
      var rate = function () { go.disabled = false; dit('L’envoi n’a pas marché. Vérifiez la connexion et réessayez.', 1) };
      try { fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit' }).then(fini, rate) } catch (err) { rate() }
    };
    go.addEventListener('click', envoi);
    email.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); envoi() } });
  }

  // --- repères gardés sur l'appareil (jamais envoyés) : jour, semaine, premier lancement (13 mois au plus)
  function jourCle(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() }
  function semaineCle(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), j = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - j);
    var a = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return t.getUTCFullYear() + '-' + Math.ceil(((t - a) / 864e5 + 1) / 7);
  }
  function provenance() {
    var s = (location.search.match(/[?&](?:s|utm_source)=([A-Za-z0-9_-]{1,24})/) || [])[1];
    if (s) return s.toLowerCase();
    var h = ''; try { h = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '' } catch (e) { }
    if (!h) return 'direct';
    if (/(^|\.)editions-chevalier\.fr$/.test(h)) return 'site';
    if (/(^|\.)(t\.co|x\.com|twitter\.com)$/.test(h)) return 'x';
    if (/instagram\./.test(h)) return 'instagram';
    if (/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/.test(h)) return 'facebook';
    if (/tiktok\./.test(h)) return 'tiktok';
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return 'youtube';
    if (/(^|\.)(mail\.google\.com|outlook\.[a-z.]+|live\.com|mail\.yahoo\.com|orange\.fr|free\.fr|sfr\.fr|laposte\.net|proton\.me|icloud\.com)$/.test(h)) return 'mail';
    if (/(^|\.)(google\.[a-z.]+|bing\.com|qwant\.com|duckduckgo\.com|ecosia\.org|search\.yahoo\.com|search\.brave\.com|lilo\.org)$/.test(h)) return 'recherche';
    return 'autre';
  }
  function horsAppli() {
    try { return !(navigator.standalone === true || (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches))) } catch (e) { return true }
  }

  function demarre() {
    try { injecteParents(); brancheOption(); brancheBonus() } catch (e) { }
    brancheCode();
    enveloppe('startMatch', partie, null);
    enveloppe('apresMatch', finMatch, function () { setTimeout(verifieGains, 3000) });
    var maintenant = new Date(), jour = jourCle(maintenant), sem = semaineCle(maintenant);
    ev('arrivee', provenance()); // chaque visite, avec sa provenance
    if (ls.get('suivi-jour') !== jour) { ls.set('suivi-jour', jour); ev('ouverture', horsAppli() ? '' : 'app') }
    if (ls.get('suivi-semaine') !== sem) { ls.set('suivi-semaine', sem); ev('semaine') }
    var ne = +ls.get('suivi-ne') || 0;
    if (!ne) { var a = debloques(); if (!a || a.length <= 4) ev('nouveau'); ls.set('suivi-ne', String(maintenant.getTime())) }
    else if (maintenant.getTime() - ne > TREIZE_MOIS) ls.set('suivi-ne', String(maintenant.getTime())); // durée de vie limitée (CNIL)
    verifieGains();
    if (/#defi=/.test(location.hash)) ev('defi', 'recu');
    // l'espace parents ouvert (après la question pour les grands), une fois par visite
    var parentsVu = false, contenu = document.getElementById('parents-contenu');
    if (contenu) try {
      new MutationObserver(function () { if (!contenu.hidden && !parentsVu) { parentsVu = true; ev('parents') } })
        .observe(contenu, { attributes: true, attributeFilter: ['hidden'] });
    } catch (e) { }
    // boutons observés (sans rien changer à ce qu'ils font)
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t) return;
      if (t.closest('#fin-photo')) ev('photo');
      else if (t.closest('#fin-defi')) ev('defi', 'envoye');
      else if (t.closest('#partage-titre')) ev('partage', 'accueil');
      else if (t.closest('#par-partage')) ev('partage', 'parents');
      else if (t.closest('#invite-envoie')) ev('partage', 'invite');
      else if (t.closest('#par-installe')) ev('installe');
    }, true);
    window.addEventListener('appinstalled', function () { ev('installe', 'fait') });
    setInterval(verifieGains, 15000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { verifieGains(); envoie() } });
    window.addEventListener('pagehide', function () { verifieGains(); envoie() });
    if (file.length && !minuterie) minuterie = setTimeout(envoie, 3000); // ce qui attendait (hors ligne la dernière fois)
  }
  window.SUIVI = { ev: ev, envoie: envoie, coupe: coupe, actif: actif, verifie: verifieGains, file: function () { return file.slice() } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarre); else demarre();
})();
