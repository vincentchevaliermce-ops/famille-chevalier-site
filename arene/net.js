// =====================================================================
//  DUEL EN LIGNE — chacun sur son téléphone
//  • jeu servi par le Mac (arene_serveur.py) : c'est le Mac qui relie les 2 téléphones du même Wi-Fi (/relais, WebSocket)
//  • jeu hébergé ailleurs : mise en relation par le service gratuit PeerJS (sans compte), puis liaison directe (WebRTC)
//  • le téléphone qui crée la partie (« hôte ») fait tourner le combat ; l'autre (« invité ») envoie ses touches
//    et affiche ce que l'hôte lui renvoie 60 fois par seconde
//  • rien d'autre ne circule : pas de pseudo, pas de discussion, pas de donnée personnelle — un code à 4 chiffres, c'est tout
// =====================================================================
const NET = { on: false, role: null, peer: null, conn: null, moi: 0, entree: {}, fx: [], sons: [], snap: null, pret: {}, lu: 0 };
const PREFIXE = 'arene-des-duels-cqpf-';
// (tests) serveur de mise en relation local : ?peerhost=localhost&peerport=9000
const QS = new URLSearchParams(location.search), PEER_OPTS = QS.get('peerhost') ? { host: QS.get('peerhost'), port: +QS.get('peerport'), path: QS.get('peerpath') || '/', secure: false } : {};
// serveurs STUN (les serveurs relais « TURN » fournis par défaut avec PeerJS n'existent plus en 2026)
const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }, { urls: 'stun:stun.cloudflare.com:3478' }] };

// ---------------------------------------------------------------------
//  Liaison par le Mac : quand le jeu est servi par arene_serveur.py, c'est le Mac qui relie les deux téléphones
//  (même Wi-Fi, pas besoin d'Internet). Sinon (jeu hébergé ailleurs), on passe par PeerJS.
// ---------------------------------------------------------------------
let RELAIS = null;
async function relaisDispo() {
  if (RELAIS !== null) return RELAIS;
  if (QS.get('peerhost') || !/^https?:$/.test(location.protocol) || !window.WebSocket) return (RELAIS = false);
  try { const r = await fetch('relais', { cache: 'no-store' }); RELAIS = r.ok && !!(await r.json()).relais } catch (e) { RELAIS = false }
  return RELAIS;
}
// connexion au relais du Mac, qui se comporte comme une connexion PeerJS : on('open'|'data'|'close'|'error'), send(), close(), open
function connexionRelais(params) {
  const url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + location.pathname.replace(/[^/]*$/, '') + 'relais?' + params;
  const h = {}, emet = (k, v) => (h[k] || []).forEach(f => f(v));
  const ws = new WebSocket(url);
  let vie = null;
  const c = {
    open: false, refus: null,
    on(k, f) { (h[k] = h[k] || []).push(f); return c },
    // les images du combat (t:'s') sont sautées si le Wi-Fi n'arrive plus à suivre : la suivante les remplace
    send(m) { if (ws.readyState === 1 && !(m.t === 's' && ws.bufferedAmount > 200000)) ws.send(JSON.stringify(m)) },
    close() { try { ws.close() } catch (e) { } },
  };
  ws.onopen = () => { vie = setInterval(() => { if (ws.readyState === 1) ws.send('{"t":"_p"}') }, 15000) };
  ws.onmessage = e => {
    let m; try { m = JSON.parse(e.data) } catch (x) { return }
    if (m.t === '_code') emet('code', m.code);
    else if (m.t === '_open') { c.open = true; emet('open') }
    else if (m.t === '_err') { c.refus = m.e; emet('refus', m.e) }
    else if (m.t === '_close') { c.parti = true; c.close() }
    else emet('data', m);
  };
  // 'close' = l'autre joueur est parti ; 'error' = liaison avec le Mac coupée ; 'fin' = fermé avant d'être relié
  ws.onclose = () => { clearInterval(vie); const etait = c.open; c.open = false; emet(etait ? (c.parti ? 'close' : 'error') : 'fin') };
  return c;
}
function chargePeer() {
  return new Promise((ok, ko) => {
    if (window.Peer) return ok();
    const s = document.createElement('script'); s.src = 'peerjs.min.js'; // hébergé avec le jeu (licence MIT)
    s.onload = () => ok(); s.onerror = () => ko(new Error('script')); document.head.appendChild(s);
  });
}
function netStatut(t) { const e = $('net-msg'); if (e) e.textContent = t }
function netFerme(msg) {
  NET.essai = (NET.essai || 0) + 1; // toute tentative en cours devient caduque
  const etait = NET.on; try { NET.conn && NET.conn.close() } catch (e) { } try { NET.peer && NET.peer.destroy() } catch (e) { }
  Object.assign(NET, { on: false, role: null, peer: null, conn: null, snap: null, pret: {} }); document.body.classList.remove('en-ligne');
  if (etait && msg) { G.phase = 'menu'; G.f = []; show('enligne'); netEcran('accueil'); netStatut(msg) }
}
function netEcran(v) { for (const id of ['net-accueil', 'net-hote', 'net-invite']) $(id).hidden = id !== 'net-' + v }
const MSG_LIEN = 'Les deux téléphones n’arrivent pas à se relier. Vérifiez qu’ils sont sur le même Wi-Fi, puis réessayez.';
const MSG_MAC = 'Le Mac ne répond pas : vérifie que le jeu tourne sur le Mac et que ton téléphone est sur son Wi-Fi.';
async function netCree() {
  netFerme(); const essaiN = NET.essai = (NET.essai || 0) + 1, actuel = () => essaiN === NET.essai;
  netEcran('hote'); $('net-code').textContent = '····'; netStatut('Préparation…');
  if (await relaisDispo()) {
    if (!actuel()) return;
    const c = connexionRelais('creer=1'); NET.role = 'hote'; NET.moi = 0;
    c.on('code', code => { if (!actuel()) return; $('net-code').textContent = code.split('').join(' '); netStatut('Donne ce code à l’autre joueur. En attente…') });
    c.on('refus', () => { if (actuel()) netStatut('Le Mac est occupé. Réessaie dans un instant.') });
    c.on('fin', () => { if (actuel() && !c.refus) netStatut(MSG_MAC) });
    branche(c); return;
  }
  try { await chargePeer() } catch (e) { if (actuel()) netStatut('Pas de connexion Internet : impossible de créer une partie.'); return }
  if (!actuel()) return;
  const essai = n => {
    const code = String(1000 + Math.floor(Math.random() * 9000));
    const p = new Peer(PREFIXE + code, Object.assign({ debug: 0, config: ICE }, PEER_OPTS)); NET.peer = p;
    p.on('open', () => { if (!actuel()) return; NET.role = 'hote'; NET.moi = 0; $('net-code').textContent = code.split('').join(' '); netStatut('Donne ce code à l’autre joueur. En attente…') });
    p.on('error', e => { if (!actuel()) return; if (e.type === 'unavailable-id' && n < 5) { p.destroy(); essai(n + 1) } else netStatut('Oups, la mise en relation ne marche pas (' + e.type + '). Réessaie.') });
    // un essai précédent qui n'a jamais abouti ne doit pas bloquer les suivants
    p.on('connection', c => { if (!actuel() || NET.on) { c.close(); return } if (NET.conn) try { NET.conn.close() } catch (x) { } branche(c) });
  };
  essai(0);
}
async function netRejoint() {
  const code = $('net-in').value.replace(/\D/g, '');
  if (code.length !== 4) { netStatut('Le code a 4 chiffres.'); return }
  netFerme(); const essaiN = NET.essai = (NET.essai || 0) + 1, actuel = () => essaiN === NET.essai;
  netStatut('Connexion…');
  if (await relaisDispo()) {
    if (!actuel()) return;
    const c = connexionRelais('code=' + code); NET.role = 'invite'; NET.moi = 1;
    c.on('refus', e => { if (actuel()) netStatut(e === 'plein' ? 'Cette partie a déjà deux joueurs.' : 'Aucune partie avec ce code. Vérifie les 4 chiffres.') });
    c.on('fin', () => { if (actuel() && !c.refus) netStatut(MSG_MAC) });
    branche(c); return;
  }
  try { await chargePeer() } catch (e) { if (actuel()) netStatut('Pas de connexion Internet.'); return }
  if (!actuel()) return;
  const p = new Peer(Object.assign({ debug: 0, config: ICE }, PEER_OPTS)); NET.peer = p; NET.role = 'invite'; NET.moi = 1;
  p.on('open', () => {
    if (!actuel()) return;
    const c = p.connect(PREFIXE + code, { serialization: 'json' }); branche(c);
    setTimeout(() => { if (actuel() && !NET.on) netStatut(MSG_LIEN) }, 15000);
  });
  p.on('error', e => { if (actuel()) netStatut(e.type === 'peer-unavailable' ? 'Aucune partie avec ce code. Vérifie les 4 chiffres.' : 'Oups, la connexion ne marche pas (' + e.type + ').') });
}
function branche(c) {
  NET.conn = c;
  c.on('open', () => {
    if (NET.conn !== c) return;
    NET.on = true; document.body.classList.add('en-ligne'); sfx('valide');
    G.mode = 2; selStage = 0; NET.pret = {}; G.phase = 'menu'; show('choix'); construitCartes();
    $('choix-titre').textContent = NET.role === 'hote' ? 'CHOISIS TON ANIMAL (tu es J1, à gauche)' : 'CHOISIS TON ANIMAL (tu es J2, à droite)';
  });
  c.on('data', m => { if (NET.conn === c) recoit(m) });
  c.on('close', () => { if (NET.conn === c) netFerme('L’autre joueur est parti.') });
  c.on('error', () => { if (NET.conn === c) netFerme('La connexion a été coupée.') });
}
const envoie = m => { try { NET.conn && NET.conn.open && NET.conn.send(m) } catch (e) { } };
// choix des animaux : chacun choisit sur son téléphone ; l'hôte lance quand les deux sont prêts
function netChoisit(k) {
  NET.pret[NET.moi] = k; $('choix-titre').textContent = 'EN ATTENTE DE L’AUTRE JOUEUR…';
  if (NET.role === 'invite') envoie({ t: 'choix', k }); else netLance();
}
function netLance() {
  if (NET.role !== 'hote' || !NET.pret[0] || !NET.pret[1]) return;
  G.pick = [NET.pret[0], NET.pret[1]]; envoie({ t: 'arene' }); ouvreArenes(); // l'hôte choisit l'arène
}
function recoit(m) {
  if (m.t === 'choix') { NET.pret[1] = m.k; netLance() }
  else if (m.t === 'arene') { $('choix-titre').textContent = 'TON AMI CHOISIT L’ARÈNE…' }
  else if (m.t === 'go') { G.pick = m.pick; G.mode = 2; if (m.arene) G.arene = m.arene; vs() }
  else if (m.t === 'i') { NET.entree = m.k }
  else if (m.t === 's') { NET.snap = m }
  else if (m.t === 'fin') { appliqueSnap(m.s); G.f.forEach((f, i) => { f.st = m.st[i]; f.parfait = m.pf[i] }); endMatch() }
  else if (m.t === 'rejoue') { NET.pret = {}; selStage = 0; G.phase = 'menu'; show('choix'); construitCartes(); $('choix-titre').textContent = 'CHOISIS TON ANIMAL' }
}
// --- pendant le combat
const TOUCHES = ['left', 'right', 'up', 'down', 'L', 'H', 'S', 'G'];
function netEntreeDistante() { const r = {}; for (const k of TOUCHES) r[k] = !!(NET.entree && NET.entree[k]); return r }
function capture() {
  const [a, b] = G.f;
  const F = f => [Math.round(f.x), Math.round(f.h * 10) / 10, f.face, f.state, f.t, Math.round(f.u * 100) / 100, f.ph, f.mk, f.hp, Math.round(f.meter), f.wins, Math.round(f.dist), Math.round(f.vy * 10) / 10, Math.round(f.hurtK * 100) / 100, f.flash, f.landed ? 1 : 0, f.crouchB ? 1 : 0, f.cache ? 1 : 0, f.poison ? 1 : 0, f.sale || 0];
  return { t: 's', a: F(a), b: F(b), g: [G.phase, G.pt, G.timer, G.round, G.freeze, G.superBy ? G.superBy.side : -1, G.stop, Math.round(G.shake), G.timeUp ? 1 : 0, G.roundWinner ? G.roundWinner.side : -1, G.perfect ? 1 : 0],
    p: G.proj.map(p => [Math.round(p.x), p.t, p.life, p.dir, p.y0, p.y1, p.w, p.a.side, p.blob ? Math.round(p.yy) : null]), z: (G.zones || []).map(z => [Math.round(z.x), z.r, z.t, z.life]), fx: NET.fx.splice(0), so: NET.sons.splice(0) };
}
function appliqueSnap(s) {
  const put = (f, v) => { [f.x, f.h, f.face, f.state, f.t, f.u, f.ph, f.mk, f.hp, f.meter, f.wins, f.dist, f.vy, f.hurtK, f.flash] = v; f.landed = !!v[15]; f.crouchB = !!v[16]; f.cache = !!v[17]; f.poison = v[18] ? (f.poison || { t: 1, n: 0, tick: 999, dmg: 0 }) : null; f.sale = v[19] || 0; if (f.mk) f.move = f.d.moves[f.mk] };
  const [a, b] = G.f; put(a, s.a); put(b, s.b);
  const g = s.g; G.phase = g[0] === 'fin' ? G.phase : g[0]; G.pt = g[1]; G.timer = g[2]; G.round = g[3]; G.freeze = g[4]; G.superBy = g[5] >= 0 ? G.f[g[5]] : null;
  G.stop = g[6]; G.shake = g[7]; G.timeUp = !!g[8]; G.roundWinner = g[9] >= 0 ? G.f[g[9]] : null; G.perfect = !!g[10];
  G.proj = (s.p || []).map(p => ({ x: p[0], t: p[1], life: p[2], dir: p[3], y0: p[4], y1: p[5], w: p[6], a: G.f[p[7]], blob: p[8] != null, yy: p[8] }));
  G.zones = (s.z || []).map(z => ({ x: z[0], r: z[1], t: z[2], life: z[3], a: null }));
  for (const e of s.fx || []) { e.t0 = G.time; if (e.k === 'combo' || e.k === 'mot') FX = FX.filter(x => x.k !== e.k || e.k === 'mot'); FX.push(e) }
  for (const [k, v] of s.so || []) sfx(k, v, true);
}
// l'invité : envoie ses touches, affiche l'image reçue
function netPasInvite() {
  G.time += 1 / 60; G.frame++;
  if (G.phase === 'fight' || G.phase === 'intro' || G.phase === 'ko') { const r = lire(0), k = {}; for (const x of TOUCHES) if (r[x]) k[x] = 1; if (JSON.stringify(k) !== NET.dernier) { envoie({ t: 'i', k }); NET.dernier = JSON.stringify(k) } }
  // on attend d'avoir soi-même lancé le combat (fin de l'écran VS) avant d'afficher l'image de l'hôte
  if (NET.snap && G.f.length === 2 && ['intro', 'fight', 'ko'].includes(G.phase)) { appliqueSnap(NET.snap); NET.snap = null; for (const f of G.f) poseOf(f) }
  if (G.f.length) updateCam();
}
