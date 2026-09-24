// =====================================================================
//  BONUS : codes secrets, GOD MODE et quête du légendaire, défis entre copains, défi du jour,
//  invitation (QR), photo de victoire, nom de champion, espace parents, tutoriel.
//  Rien ne sort de l'appareil : pas de compte, pas de nom réel, pas de serveur (les défis passent par le lien).
// =====================================================================
const PUBLIC = 'https://editions-chevalier.fr/arene/'; // adresse publique du jeu (liens partagés, QR)
const EMOJI = { tigre: '🐯', gorille: '🦍', lion: '🦁', ours: '🐻‍❄️', croco: '🐊', hippo: '🦛', ratel: '🦡', komodo: '🦎', grizzly: '🐻', hyene: '🐾', buffle: '🐃', morse: '🦭', trex: '🦖' };
const NIVEAUX = ['FACILE', 'NORMAL', 'COSTAUD'];
SAVE.codes = SAVE.codes || {}; SAVE.godBattus = SAVE.godBattus || {};
// ---------------------------------------------------------------------
//  Codes secrets : des mots du livre (les enfants se les échangent)
// ---------------------------------------------------------------------
// 24/09 : mots du livre qu'on ne devine pas sans l'avoir lu, et que le jeu n'affiche jamais avant le déblocage (contrôle : verif/sync_livre.py)
const CODES_ANIMAUX = { LOLONG: 'croco', PEPERE: 'hippo', VIPERE: 'ratel', MICROBES: 'komodo', MAMIE: 'grizzly', GNOUS: 'hyene', INDONESIE: 'buffle', BOUSCULADE: 'morse' };
const CODE_GOD = 'GIGI';
const codeDe = k => Object.keys(CODES_ANIMAUX).find(c => CODES_ANIMAUX[c] === k);
// quiz réussi : l'enfant reçoit le code de l'animal, à offrir à un copain (qui le débloque sans le quiz)
function codeAOffrir(k) { const c = codeDe(k); return c ? `<span class="cadeau-quiz"><small>🎁 TON CODE À OFFRIR À UN COPAIN</small><b>${c}</b><small>Il le tape dans 🔑 CODES et débloque ${CHARS[k].art} !</small></span>` : '' }
const normCode = v => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function ouvreCodes() { sonInit(); sfx('clic'); G.phase = 'menu'; show('code'); $('code-msg').textContent = ''; $('code-in').value = ''; majGodBtn(); setTimeout(() => $('code-in').focus(), 60) }
function valideCodeSecret() {
  const v = normCode($('code-in').value), msg = t => { $('code-msg').textContent = t };
  if (!v) return;
  if (v === CODE_GOD) {
    SAVE.codes.god = 1; G.god = true; sauve(); sonInit(); sfx('super'); sfx('tigre', .8); vibre([60, 40, 90]);
    msg(`⚡ GOD MODE ACTIVÉ ! Invincible, SUPER illimité, tous les animaux. Bats les ${questeTxt().tot} animaux pour réveiller… le LÉGENDAIRE !`); majGodBtn(); return;
  }
  if (v === 'PROUT') { G.prout = !G.prout; sfx('prout', 1); msg(G.prout ? 'MODE PROUT activé pour ta partie. Tu es prévenu…' : 'Mode prout désactivé. Ouf.'); return }
  const k = CODES_ANIMAUX[v] || (typeof CODES !== 'undefined' && CODES[v]);
  if (!k) { sfx('erreur'); msg('Ce code ne marche pas… Réussis un quiz du livre pour gagner un code, ou demande à un copain !'); return }
  if (!pret(k)) { msg(`Bien trouvé ! Cet animal arrive bientôt dans l’arène : garde ton code !`); return }
  if (debloqueVrai(k)) { msg(`Tu as déjà ${CHARS[k].art} !`); return }
  SAVE.debloques.push(k); const nv = []; badge('secret', nv); sauve(); sonInit(); sfx('super'); sfx(k, 1);
  msg(`BRAVO ! ${CHARS[k].art} rejoint l’arène !`);
  setTimeout(() => { if (G.screen === 'code') { G.phase = 'menu'; show('choix'); selStage = 0; construitCartes(); selCursor = ORDRE.indexOf(k); majChoix() } }, 1500);
}
// ---------------------------------------------------------------------
//  GOD MODE : invincible, SUPER toujours plein, tous les animaux (en solo seulement)
// ---------------------------------------------------------------------
const debloqueVrai = k => SAVE.debloques.includes(k);
function majGodBtn() {
  const b = $('god-btn'); if (!b) return;
  b.hidden = !SAVE.codes.god; b.textContent = G.god ? '⚡ GOD MODE : OUI' : '⚡ GOD MODE : NON'; b.classList.toggle('on', !!G.god);
  document.body.classList.toggle('god', !!G.god);
}
function basculeGod() { G.god = !G.god; sfx(G.god ? 'super' : 'clic'); majGodBtn(); if (G.screen === 'choix') construitCartes() }
function revelerCodeGod() {
  SAVE.codes.godVu = 1; sauve();
  const e = $('v-badges'); if (!e) return;
  e.innerHTML += `<span class="code-cadeau">🎁 CODE SECRET GAGNÉ : <b>${CODE_GOD}</b> · tape-le dans 🔑 CODES. Chut… ne le donne qu’à tes meilleurs copains !</span>`;
  sfx('badge'); setTimeout(() => sfx('super'), 400);
}
// ---------------------------------------------------------------------
//  La quête du légendaire : en GOD MODE, battre les 12 animaux réveille le T. REX
// ---------------------------------------------------------------------
const LEGENDAIRE = 'trex';
const aBattre = () => ORDRE.filter(k => k !== LEGENDAIRE);
function questeTxt() { const l = aBattre(), n = l.filter(k => SAVE.godBattus[k]).length; return { n, tot: l.length } }
function apresMatch(v, n, nv) {
  G.dernier = null; G.dernierJour = !!G.jour; G.finExtra = ''; // G.finExtra : messages ajoutés sous le résultat (écran de fin ou verdict du livre)
  if (!G.f.length) return;
  const [a, b] = G.f, moi = a, adv = b, gagne = v === a && !a.cpu;
  G.dernier = { moi: moi.kind, adv: adv.kind, arene: G.arene, niv: G.niv, gagne, etoiles: gagne ? n : 0, temps: Math.max(1, Math.round((G.chrono || 0) / 60)), god: !!G.god };
  // quête du légendaire (GOD MODE, en solo)
  if (G.god && G.mode === 1 && !NET.on && gagne && adv.kind !== LEGENDAIRE) {
    SAVE.godBattus[adv.kind] = 1; const q = questeTxt(); sauve();
    G.finExtra += `<span class="quete">⚡ QUÊTE DU LÉGENDAIRE : ${q.n} / ${q.tot}</span>`;
    if (q.n >= q.tot && !debloqueVrai(LEGENDAIRE) && pret(LEGENDAIRE)) { SAVE.debloques.push(LEGENDAIRE); sauve(); setTimeout(ceremonieLegendaire, 1800) }
  }
  // défi d'un copain : on compare
  if (G.defi && G.defi.enCours && G.mode === 1) { G.defi.enCours = false; const d = G.defi, moiRes = G.dernier;
    const mieux = moiRes.gagne && (moiRes.etoiles > d.etoiles || (moiRes.etoiles === d.etoiles && moiRes.temps < d.temps));
    G.finExtra += `<span class="defi-res ${mieux ? 'ok' : ''}">${mieux ? `DÉFI RÉUSSI ! Tu as fait mieux que ${d.nom} !` : moiRes.gagne ? `Gagné… mais ${d.nom} avait fait mieux (${d.temps} s, ${'★'.repeat(d.etoiles)}). Réessaie !` : `DÉFI RATÉ… ${d.nom} rigole. Réessaie !`}</span>`;
    if (mieux) sfx('badge') }
  // défi du jour
  if (G.jour && G.mode === 1) { const j = G.jour, r = G.dernier; G.jour = null;
    const best = SAVE.jour && SAVE.jour.date === j.date ? SAVE.jour : null;
    if (!best || (r.gagne && (!best.gagne || r.etoiles > best.etoiles || (r.etoiles === best.etoiles && r.temps < best.temps)))) SAVE.jour = { date: j.date, gagne: r.gagne, etoiles: r.etoiles, temps: r.temps, a: j.a, b: j.b };
    sauve(); G.finExtra += `<span class="defi-res ${r.gagne ? 'ok' : ''}">⚡ DÉFI DU JOUR : ${r.gagne ? 'RÉUSSI !' : 'raté… réessaie !'}</span>` }
  majBoutonsFin();
}
function ceremonieLegendaire() {
  G.phase = 'menu'; show('legende'); sfx('dino', 1); sfx('boum', 1); vibre([100, 60, 200]);
  $('legende-img').src = LEGENDAIRE + '_vs.webp';
}
// ---------------------------------------------------------------------
//  Nom de champion (inventé : jamais le vrai prénom)
// ---------------------------------------------------------------------
const MOTS_NOM = ['TONNERRE', 'ÉCLAIR', 'TORNADE', 'VOLCAN', 'TURBO', 'NINJA', 'COMÈTE', 'TEMPÊTE', 'MÉTÉORE', 'BOLIDE', 'FANTÔME', 'MYSTÈRE', 'DE FEU', 'DES NEIGES', 'SUPERSTAR', 'PIRATE', 'COSMIQUE', 'GÉANT'];
function nomsAuHasard() { const a = ORDRE.filter(k => k !== LEGENDAIRE), r = []; while (r.length < 3) { const n = (CHARS[a[Math.floor(Math.random() * a.length)]].nom.split(' ')[0]) + ' ' + MOTS_NOM[Math.floor(Math.random() * MOTS_NOM.length)]; if (!r.includes(n)) r.push(n) } return r }
function demandeNom(ensuite) {
  if (SAVE.nom) { ensuite(); return }
  G.apresNom = ensuite; G.retourNom = G.screen; show('nom'); proposeNoms();
}
function proposeNoms() {
  const box = $('nom-choix'); box.innerHTML = '';
  for (const n of nomsAuHasard()) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn nom-btn R'; b.textContent = n;
    b.onclick = () => { SAVE.nom = n; sauve(); sfx('valide'); const f = G.apresNom; G.apresNom = null; show(G.retourNom || 'titre'); if (f) f() }; box.appendChild(b) }
}
// ---------------------------------------------------------------------
//  Partage : défi par lien, invitation, photo de victoire
// ---------------------------------------------------------------------
function lienDefi(r) { return PUBLIC + '#defi=' + [r.moi, r.adv, r.arene, r.niv, r.temps, r.etoiles, encodeURIComponent(SAVE.nom || 'UN CHAMPION')].join('.') }
function lisDefi() {
  const m = location.hash.match(/#defi=([^&]+)/); if (!m) return null;
  const p = m[1].split('.'); if (p.length < 7) return null;
  const [moi, adv, arene, niv, temps, etoiles] = p, nom = decodeURIComponent(p.slice(6).join('.')).slice(0, 24);
  if (!CHARS[moi] || !CHARS[adv]) return null;
  return { moi, adv, arene: ARENES.some(a => a.k === arene) ? arene : 'savane', niv: Math.max(0, Math.min(2, +niv || 0)), temps: +temps || 99, etoiles: Math.max(0, Math.min(3, +etoiles || 0)), nom: nom.replace(/[<>&"]/g, '') };
}
async function partage(titre, texte, url, fichier) {
  const data = { title: titre, text: texte }; if (url) data.url = url;
  try {
    if (fichier && navigator.canShare && navigator.canShare({ files: [fichier] })) { await navigator.share(Object.assign({ files: [fichier] }, data)); return 'ok' }
    if (navigator.share) { await navigator.share(data); return 'ok' }
  } catch (e) { if (e && e.name === 'AbortError') return 'annule' }
  // secours : copier le lien (ou le montrer)
  const t = texte + (url ? ' ' + url : '');
  try { await navigator.clipboard.writeText(t); montreBulle('Lien copié ! Colle-le dans un message à un copain.'); return 'copie' } catch (e) { }
  montreBulle(t, true); return 'montre';
}
function montreBulle(t, long) { const b = $('bulle-info'); b.textContent = t; b.classList.toggle('long', !!long); b.hidden = false; clearTimeout(montreBulle.t); montreBulle.t = setTimeout(() => b.hidden = true, long ? 9000 : 3500) }
function partageDefi() {
  const r = G.dernier; if (!r) return;
  demandeNom(() => {
    const txt = `⚔️ DÉFI ! ${SAVE.nom} a ${r.gagne ? 'battu' : 'affronté'} ${leNom(r.adv)} avec ${leNom(r.moi)}${r.gagne ? ` en ${r.temps} s ${'★'.repeat(r.etoiles)}` : ''}. Fais mieux dans L’Arène des Duels, avec les animaux du livre « C’est qui le plus fort ? » :`;
    partage('Défi : L’Arène des Duels', txt, lienDefi(r));
  });
}
function invite() {
  sfx('clic'); G.retourInvite = G.screen || 'titre'; show('invite');
}
function envoieJeu() { partage('L’Arène des Duels', '🐯🦍 Viens jouer à L’Arène des Duels, avec les animaux du livre « C’est qui le plus fort ? ». Gratuit, sans inscription, sans pub :', PUBLIC) }
// photo de victoire (1080 × 1080) : le gagnant, les étoiles, le QR du jeu
const charge1 = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src });
async function photoVictoire() {
  const r = G.dernier; if (!r) return; sfx('clic');
  const c = document.createElement('canvas'); c.width = c.height = 1080; const x = c.getContext('2d');
  const gagnant = r.gagne ? r.moi : r.adv;
  let img, qr, logo; try { [img, qr, logo] = await Promise.all([charge1(gagnant + '_fin.webp'), charge1('qr_arene.png'), charge1('titre_logo.webp')]) } catch (e) { montreBulle('Oups, la photo n’a pas pu se faire.'); return }
  // fond : rayons jaune/orange comme la couverture
  x.fillStyle = '#FFC629'; x.fillRect(0, 0, 1080, 1080);
  x.save(); x.translate(540, 620); for (let i = 0; i < 24; i++) { x.rotate(Math.PI / 12); x.fillStyle = i % 2 ? '#FF8A4C' : '#FFB13B'; x.beginPath(); x.moveTo(0, 0); x.lineTo(1200, -120); x.lineTo(1200, 120); x.closePath(); x.fill() } x.restore();
  x.drawImage(logo, 540 - 330, 20, 660, 660 * logo.height / logo.width);
  const h = 560, w = h * img.width / img.height; x.drawImage(img, 540 - w / 2, 330, w, h);
  const bandeau = (t, y, s, fond = '#0B2A5B', coul = '#FFF8EC') => { x.font = `900 ${s}px Rubik, "Arial Black", sans-serif`; const tw = x.measureText(t).width; x.fillStyle = fond; x.beginPath(); x.roundRect(540 - tw / 2 - 30, y - s * .8, tw + 60, s * 1.3, 24); x.fill(); x.fillStyle = coul; x.textAlign = 'center'; x.fillText(t, 540, y + s * .15) };
  bandeau(r.gagne ? `${CHARS[r.moi].nom} GAGNE !` : `${CHARS[r.adv].nom} GAGNE…`, 880, 64);
  if (r.gagne) { x.font = '900 70px Rubik, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#0B2A5B'; x.fillText('★'.repeat(r.etoiles) + '☆'.repeat(3 - r.etoiles), 540, 975) }
  if (SAVE.nom) { x.font = '900 36px Rubik, sans-serif'; x.fillStyle = '#0B2A5B'; x.textAlign = 'left'; x.fillText('CHAMPION : ' + SAVE.nom, 40, 1050) }
  x.fillStyle = '#fff'; x.fillRect(880, 880, 180, 180); x.drawImage(qr, 885, 885, 170, 170);
  x.font = '900 24px Rubik, sans-serif'; x.fillStyle = '#0B2A5B'; x.textAlign = 'right'; x.fillText('editions-chevalier.fr/arene', 870, 1050);
  const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
  const fichier = new File([blob], 'victoire-arene-des-duels.png', { type: 'image/png' });
  const res = await partage('Ma victoire dans L’Arène des Duels', `${r.gagne ? '🏆 ' + CHARS[r.moi].nom + ' GAGNE !' : 'Revanche demain !'} L’Arène des Duels, avec les animaux du livre « C’est qui le plus fort ? » :`, PUBLIC, fichier);
  if (res === 'montre' || res === 'copie') { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fichier.name; document.body.appendChild(a); a.click(); a.remove(); montreBulle('La photo est enregistrée !') }
}
// ---------------------------------------------------------------------
//  Défi du jour : le même pour tous les enfants, change chaque jour
// ---------------------------------------------------------------------
function dateDuJour() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
function defiDuJour() {
  const date = dateDuJour(); let s = 0; for (const ch of 'arene' + date) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  const l = ORDRE.filter(k => k !== LEGENDAIRE); const a = l[Math.floor(r() * l.length)]; let b = l[Math.floor(r() * l.length)]; if (b === a) b = l[(l.indexOf(a) + 1) % l.length];
  const arene = ARENES[Math.floor(r() * ARENES.length)].k;
  return { date, a, b, arene, niv: 1 };
}
function lanceJour() {
  const j = defiDuJour(); sonInit(); sfx('valide'); G.jour = j; G.livre = null; G.defi = null; G.mode = 1; G.tournoi = null; G.niv = j.niv; G.pick = [j.a, j.b]; G.arene = j.arene; G.areneHasard = false; vs();
}
function partageJour() {
  const j = SAVE.jour; if (!j) return; const d = j.date.split('-');
  const txt = `⚡ Défi du jour ${d[2]}/${d[1]} — L’Arène des Duels\n${EMOJI[j.a] || ''} ${CHARS[j.a].nom} contre ${EMOJI[j.b] || ''} ${CHARS[j.b].nom}\n${j.gagne ? `✅ Gagné en ${j.temps} s ${'★'.repeat(j.etoiles)}${'☆'.repeat(3 - j.etoiles)}` : '❌ Pas encore gagné…'}\nÀ toi :`;
  partage('Défi du jour', txt, PUBLIC + '#jour');
}
// ---------------------------------------------------------------------
//  Espace parents (petite porte : une multiplication)
// ---------------------------------------------------------------------
function ouvreParents() { sfx('clic'); G.retourParents = G.screen || 'titre'; show('parents'); const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7); G.porte = a * b; $('porte-q').textContent = `Pour les grands : combien font ${a} × ${b} ?`; $('porte-in').value = ''; $('parents-porte').hidden = false; $('parents-contenu').hidden = true }
function valideParents() { if (+$('porte-in').value === G.porte) { sfx('valide'); $('parents-porte').hidden = true; $('parents-contenu').hidden = false } else { sfx('erreur'); $('porte-q').textContent = 'Ce n’est pas ça… (demande à un grand !)' } }
// ---------------------------------------------------------------------
//  Tutoriel interactif (30 s) : la première fois qu'on appuie sur JOUER
// ---------------------------------------------------------------------
const TUTO = [
  { t: 'AVANCE vers ton adversaire !', tt: 'Pousse le joystick vers lui', tc: 'Flèche → (ou D)', k: 'avance' },
  { t: 'TAPE avec A (coup rapide) !', tk: 'TAPE : coup rapide !', tt: 'Appuie sur le bouton A', tc: 'Touche J (ou F)', k: 'L' },
  { t: 'Et maintenant B (coup fort) !', tk: 'Et maintenant : coup fort !', tt: 'Appuie sur le bouton B', tc: 'Touche K (ou G)', k: 'H' },
  { t: 'IL ATTAQUE ! Protège-toi : tire VERS LE BAS', tt: 'Joystick vers le bas pendant son attaque', tc: 'Flèche ↓ (ou S) pendant son attaque', k: 'garde' },
  { t: '★ : TON COUP SPÉCIAL !', tt: 'Appuie sur ★', tc: 'Touche L (ou H)', k: 'S' },
  { t: 'JAUGE PLEINE : ★ = SUPER !', tt: 'Appuie encore sur ★', tc: 'Encore la touche L (ou H)', k: 'SUPER' },
];
function lanceTuto(ensuite) {
  G.tutoApres = ensuite; G.tuto = { i: 0, t: 0, ok: 0 }; G.livre = null; G.defi = null; G.jour = null;
  G.mode = 1; G.niv = 0; G.tournoi = null; G.pick = ['tigre', 'gorille']; G.arene = 'savane'; startMatch();
  G.phase = 'fight'; G.pt = 0; for (const f of G.f) setS(f, 'idle'); G.f[1].tuto = true;
  G.f[0].x = 380; G.f[1].x = 1420; /* assez loin pour que « avance » demande un vrai geste */ $('tuto-passer').hidden = false; majTuto();
}
function majTuto() { const T = G.tuto; if (!T) return; const e = TUTO[T.i], tact = document.body.classList.contains('tactile'); $('tuto-bulle').hidden = false; $('tuto-bulle').innerHTML = `<small>${T.i + 1} / ${TUTO.length}</small><b class="R">${tact ? e.t : e.tk || e.t}</b><span>${tact ? e.tt : e.tc}</span>` }
function finTuto(passe) {
  SAVE.tuto = 1; sauve(); $('tuto-bulle').hidden = true; $('tuto-passer').hidden = true; const f = G.tutoApres; G.tuto = null; G.tutoApres = null;
  if (!passe) { addFx({ k: 'mot', x: 960, y: 420, mot: 'BRAVO, TU ES PRÊT !', col: JA }); sfx('badge'); setTimeout(() => { G.phase = 'menu'; G.f = []; if (f) f() }, 1400) } else { G.phase = 'menu'; G.f = []; if (f) f() }
}
// appelé à chaque image pendant le tutoriel : l'adversaire « mannequin » et la validation des étapes
function tutoPas() {
  const T = G.tuto; if (!T || !G.f.length) return; const [a, b] = G.f, e = TUTO[T.i]; T.t++;
  b.hp = Math.max(b.hp, 40); a.hp = a.d.hp; G.timer = 99 * 60; // personne ne perd pendant le tutoriel
  let fait = false;
  if (e.k === 'avance') fait = Math.abs(a.x - b.x) < 620;
  if (e.k === 'L' || e.k === 'H' || e.k === 'S') fait = a.state === 'atk' && (a.mk === e.k || (e.k === 'S' && ['S', 'SF', 'SD'].includes(a.mk)));
  if (e.k === 'garde') fait = a.state === 'bstun';
  if (e.k === 'SUPER') { a.meter = 100; fait = a.state === 'atk' && a.mk === 'SUPER' }
  if (fait && T.t > 20) { T.i++; T.t = 0; sfx('valide'); if (T.i >= TUTO.length) { finTuto(false); return } majTuto() }
}
// cerveau du mannequin : il attend, et attaque seulement à l'étape « protège-toi »
function tutoBrain(f, o) {
  const r = { left: false, right: false, up: false, down: false, L: false, H: false, S: false }, T = G.tuto; if (!T) return r;
  if (TUTO[T.i].k === 'garde' && neutral(f) && T.t % 70 === 30) { if (Math.abs(o.x - f.x) > 700) r[o.x > f.x ? 'right' : 'left'] = true; else r.H = !f.prev.H }
  if (TUTO[T.i].k === 'garde' && Math.abs(o.x - f.x) > 650) r[o.x > f.x ? 'right' : 'left'] = true;
  return r;
}
// ---------------------------------------------------------------------
//  Branchements (écrans, boutons, lien de défi reçu)
// ---------------------------------------------------------------------
function majBoutonsFin() {
  const r = G.dernier, solo = G.mode === 1 && !NET.on;
  $('fin-photo').hidden = !r || !solo; $('fin-defi').hidden = !r || !solo || r.god;
  $('fin-jour').hidden = !(r && SAVE.jour && SAVE.jour.date === dateDuJour() && G.dernierJour);
}
function ouvreDefiRecu(d) {
  G.defi = d; G.phase = 'menu'; show('defi');
  $('defi-txt').innerHTML = `<b>${d.nom}</b> te lance un défi !<br>Il a ${d.etoiles ? 'battu' : 'affronté'} ${leNom(d.adv, true)} avec ${leNom(d.moi, true)}${d.etoiles ? ` en <b>${d.temps} s</b> ${'★'.repeat(d.etoiles)}` : ''} (niveau ${NIVEAUX[d.niv]}).<br>Prends le même animal et fais mieux !`;
  $('defi-g').src = d.moi + '_vs.webp'; $('defi-d').src = d.adv + '_vs.webp';
}
function releveDefi() { const d = G.defi; if (!d) return; sonInit(); sfx('valide'); d.enCours = true; G.livre = null; G.jour = null; G.mode = 1; G.tournoi = null; G.niv = d.niv; G.pick = [d.moi, d.adv]; G.arene = d.arene; G.areneHasard = false; vs() }
function initBonus() {
  const on = (id, f) => { const e = $(id); if (e) e.onclick = f };
  on('codes-titre', ouvreCodes); on('code-ok', valideCodeSecret); on('code-retour', () => { sfx('retour'); show('titre') });
  on('god-btn', basculeGod);
  on('invite-titre', invite); on('invite-envoie', envoieJeu); on('invite-retour', () => { sfx('retour'); show(G.retourInvite || 'titre') });
  on('parents-titre', ouvreParents); on('porte-ok', valideParents); on('parents-retour', () => { sfx('retour'); show(G.retourParents || 'titre') });
  on('jour-titre', lanceJour); on('fin-jour', partageJour);
  on('fin-photo', photoVictoire); on('fin-defi', partageDefi); on('v-defi', () => { partageDefi() });
  on('nom-autre', () => { sfx('clic'); proposeNoms() }); on('nom-retour', () => { sfx('retour'); show(G.retourNom || 'titre') });
  on('defi-go', releveDefi); on('defi-non', () => { sfx('retour'); G.defi = null; history.replaceState(null, '', location.pathname); show('titre') });
  on('legende-ok', () => { sfx('valide'); G.phase = 'menu'; selStage = 0; show('choix'); construitCartes(); selCursor = Math.max(0, ORDRE.indexOf(LEGENDAIRE)); majChoix() });
  on('tuto-passer', () => { sfx('clic'); finTuto(true) });
  on('comment-jouer', () => { sfx('clic'); lanceTuto(() => { show('choix'); construitCartes() }) });
  const pi = $('porte-in'); if (pi) pi.addEventListener('keydown', e => { if (e.key === 'Enter') valideParents() });
  // défi du jour : l'autocollant de l'accueil montre les deux animaux du jour
  const j = defiDuJour(), dj = $('jour-titre'); if (dj) dj.innerHTML = `<small>⚡ DÉFI DU JOUR</small><span>${EMOJI[j.a] || ''} contre ${EMOJI[j.b] || ''}</span>`;
  majGodBtn();
}
// au chargement : lien de défi reçu, lien « défi du jour »
function lienRecu() {
  const d = lisDefi(); if (d) { ouvreDefiRecu(d); return true }
  if (/#jour/.test(location.hash)) { G.phase = 'menu'; show('titre'); setTimeout(() => { const b = $('jour-titre'); if (b) b.classList.add('appel') }, 300) }
  return false;
}
