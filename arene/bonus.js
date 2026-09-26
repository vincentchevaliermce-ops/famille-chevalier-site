// =====================================================================
//  BONUS : codes secrets, GOD MODE et quête du légendaire, défis entre copains, défi du jour,
//  invitation (QR), photo de victoire, nom de champion, espace parents, tutoriel.
//  Rien ne sort de l'appareil : pas de compte, pas de nom réel, pas de serveur (les défis passent par le lien).
// =====================================================================
const PUBLIC = 'https://editions-chevalier.fr/arene/'; // adresse publique du jeu (liens partagés, QR)
const EMOJI = { tigre: '🐯', gorille: '🦍', lion: '🦁', ours: '🐻‍❄️', croco: '🐊', hippo: '🦛', ratel: '🦡', komodo: '🦎', grizzly: '🐻', hyene: '🐾', buffle: '🐃', morse: '🦭', trex: '🦖', leopard: '🐆', porcepic: '🦔', guepard: '⚡', autruche: '🪶', orque: '🐋', requin: '🦈', pieuvre: '🐙', aiguillat: '🦈', espadon: '🐟', requinbleu: '💙', megalo: '🦷', jaguar: '🐆', anaconda: '🐍', caiman: '🐊', puma: '🐈', loup: '🐺', mangouste: '🐾', cobra: '🐍', oursnoir: '🐻', glouton: '🦡', python: '🐍', alligator: '🐊', lionne: '🦁', girafe: '🦒', frelon: '🐝', abeille: '🍯', mygale: '🕷️', guepe: '🐝', scolopendre: '🐛', chauvesouris: '🦇', mante: '🦗', colibri: '🐦', serpentbrun: '🐍', veuve: '🕷️', meganeura: '🪰', bouledogue: '🦈', baleine: '🐳', crabe: '🦀', crevette: '🦐' }; // (sans émoji, le défi du jour affichait « contre » tout seul)
const NIVEAUX = ['FACILE', 'NORMAL', 'COSTAUD'];
SAVE.codes = SAVE.codes || {}; SAVE.godBattus = SAVE.godBattus || {};
// ---------------------------------------------------------------------
//  Codes secrets : des mots du livre (les enfants se les échangent)
// ---------------------------------------------------------------------
// 24/09 : mots du livre qu'on ne devine pas sans l'avoir lu, et que le jeu n'affiche jamais avant le déblocage (contrôle : verif/sync_livre.py)
const CODES_ANIMAUX = { LOLONG: 'croco', PEPERE: 'hippo', VIPERE: 'ratel', MICROBES: 'komodo', MAMIE: 'grizzly', GNOUS: 'hyene', INDONESIE: 'buffle', BOUSCULADE: 'morse' }; // pas de code pour les 10 champions du livre (LIVRE_EN_MAIN) : seul le livre les débloque
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
    msg('⚡ GOD MODE ACTIVÉ ! Invincible, SUPER illimité, et presque tous les animaux pour tes combats (pas les champions du livre ni les légendes).'); majGodBtn(); return;
  }
  if (v === 'PROUT') { G.prout = !G.prout; sfx('prout', 1); msg(G.prout ? 'MODE PROUT activé pour ta partie. Tu es prévenu…' : 'Mode prout désactivé. Ouf.'); return }
  const k = CODES_ANIMAUX[v] || (typeof CODES !== 'undefined' && CODES[v]);
  if (!k) { sfx('erreur'); msg('Ce code ne marche pas… Gagne des animaux à 1 JOUEUR pour recevoir leur code, ou demande à un copain !'); return }
  if (!pret(k)) { msg(`Bien trouvé ! Cet animal arrive bientôt dans l’arène : garde ton code !`); return }
  if (debloqueVrai(k)) { msg(`Tu as déjà ${CHARS[k].art} !`); return }
  SAVE.debloques.push(k); const nv = []; badge('secret', nv); sauve(); sonInit(); sfx('super'); sfx(k, 1);
  msg(`BRAVO ! ${CHARS[k].art} rejoint l’arène !`);
  setTimeout(() => { if (G.screen === 'code') { G.phase = 'menu'; show('choix'); selStage = 0; vaVers(k); construitCartes() } }, 1500);
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
const LEGENDAIRE = 'trex'; // (le légendaire de la TERRE ; celui de la MER est le mégalodon : MONDES.mer.legende)
const LEGENDAIRES = () => Object.values(MONDES).map(m => m.legende).filter(Boolean);
const estLegendaire = k => LEGENDAIRES().includes(k);
// Dans chaque monde : tous les animaux (le GOD MODE ouvre ceux des défis) ; les champions du livre comptent une fois débloqués avec le livre.
const aBattre = (m = 'terre') => ORDRE.filter(k => !estLegendaire(k) && mondeDe(k) === m && (!LIVRE_EN_MAIN[k] || debloqueVrai(k)));
function questeTxt(m = 'terre') { const l = aBattre(m), n = l.filter(k => SAVE.godBattus[k]).length; return { n, tot: l.length } }
function apresMatch(v, n, nv) {
  G.dernier = null; G.dernierJour = !!G.jour; G.finExtra = ''; // G.finExtra : messages ajoutés sous le résultat (écran de fin ou verdict du livre)
  if (!G.f.length) return;
  const [a, b] = G.f, moi = a, adv = b, gagne = v === a && !a.cpu;
  G.dernier = { moi: moi.kind, adv: adv.kind, arene: G.arene, niv: G.niv, gagne, etoiles: gagne ? n : 0, temps: Math.max(1, Math.round((G.chrono || 0) / 60)), god: !!G.god };
  // (25/09 : la quête du légendaire en GOD MODE est retirée — les LÉGENDES se réveillent après la finale de L'AVENTURE)
  // défi d'un copain : on compare
  if (G.defi && G.defi.enCours && G.mode === 1) { G.defi.enCours = false; const d = G.defi, moiRes = G.dernier;
    const mieux = moiRes.gagne && (moiRes.etoiles > d.etoiles || (moiRes.etoiles === d.etoiles && moiRes.temps < d.temps));
    G.finExtra += `<span class="defi-res ${mieux ? 'ok' : ''}">${mieux ? `DÉFI RÉUSSI ! Tu as fait mieux que ${d.nom} !` : moiRes.gagne ? `Gagné… mais ${d.nom} avait fait mieux (${d.temps} s, ${'★'.repeat(d.etoiles)}). Réessaie !` : `DÉFI RATÉ… ${d.nom} rigole. Réessaie !`}</span>`;
    if (mieux) { sfx('badge'); if (window.trophee) trophee('defi', true) } }
  // défi du jour
  if (G.jour && G.mode === 1) { const j = G.jour, r = G.dernier; G.jour = null;
    const best = SAVE.jour && SAVE.jour.date === j.date ? SAVE.jour : null;
    if (!best || (r.gagne && (!best.gagne || r.etoiles > best.etoiles || (r.etoiles === best.etoiles && r.temps < best.temps)))) SAVE.jour = { date: j.date, gagne: r.gagne, etoiles: r.etoiles, temps: r.temps, a: j.a, b: j.b };
    if (r.gagne && window.trophee) { SAVE.joursReussis = SAVE.joursReussis || {}; SAVE.joursReussis[j.date] = 1; trophee('jour', true); if (Object.keys(SAVE.joursReussis).length >= 5) trophee('jour5', true) }
    sauve(); G.finExtra += `<span class="defi-res ${r.gagne ? 'ok' : ''}">⚡ DÉFI DU JOUR : ${r.gagne ? 'RÉUSSI !' : 'raté… réessaie !'}</span>` }
  majBoutonsFin();
}
function ceremonieLegendaire(k = LEGENDAIRE) {
  G.phase = 'menu'; show('legende'); G.legendeVu = k; sfx(k === 'trex' ? 'dino' : k === 'meganeura' ? 'ailes' : 'requin', 1); sfx('boum', 1); vibre([100, 60, 200]);
  $('legende-img').src = k + '_vs.webp'; { const o = $('legende-ok'); if (o) o.textContent = CHARS[k] && CHARS[k].fem ? 'JOUER AVEC ELLE ▶' : 'JOUER AVEC LUI ▶' } // (la méganeura, le mégalodon…)
  if (window.trophee && (k === 'trex' || k === 'megalo' || k === 'meganeura')) trophee(k, true); // le trophée tout de suite (pas au combat suivant)
  const t = $('legende-txt'); if (t) t.textContent = k === 'meganeura' ? 'Tu as battu la MÉGANEURA, une libellule géante de la préhistoire, grande comme un corbeau ! Elle est à toi pour toujours.' : k === 'trex' ? 'Tu as battu le T. REX, le roi des dinosaures ! Il est à toi pour toujours.' : 'Tu as battu le MÉGALODON, le plus grand requin de tous les temps ! Il est à toi pour toujours.';
}
// ---------------------------------------------------------------------
//  Nom de champion (inventé : jamais le vrai prénom)
// ---------------------------------------------------------------------
const MOTS_NOM = ['TONNERRE', 'ÉCLAIR', 'TORNADE', 'VOLCAN', 'TURBO', 'NINJA', 'COMÈTE', 'TEMPÊTE', 'MÉTÉORE', 'BOLIDE', 'FANTÔME', 'MYSTÈRE', 'DE FEU', 'DES NEIGES', 'SUPERSTAR', 'PIRATE', 'COSMIQUE', 'GÉANT'];
function nomsAuHasard() { const a = ORDRE.filter(k => !estLegendaire(k)), r = []; while (r.length < 3) { const n = (CHARS[a[Math.floor(Math.random() * a.length)]].nom.split(' ')[0]) + ' ' + MOTS_NOM[Math.floor(Math.random() * MOTS_NOM.length)]; if (!r.includes(n)) r.push(n) } return r }
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
  if (!CHARS[moi] || !CHARS[adv] || !memeMonde(moi, adv)) return null; // un animal n'affronte que son monde (le crocodile nage aussi en mer)
  const L = arenesDe(mondeDuel(moi, adv));
  return { moi, adv, arene: L.some(a => a.k === arene) ? arene : L[0].k, niv: Math.max(0, Math.min(2, +niv || 0)), temps: +temps || 99, etoiles: Math.max(0, Math.min(3, +etoiles || 0)), nom: nom.replace(/[<>&"]/g, '') };
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
    const txt = `⚔️ DÉFI ! ${SAVE.nom} a ${r.gagne ? 'battu' : 'affronté'} ${leNom(r.adv)} avec ${leNom(r.moi)}${r.gagne ? ` en ${r.temps} s ${'★'.repeat(r.etoiles)}` : ''}. Fais mieux dans « C’est qui le plus fort ? — L’Arène des Duels », le jeu vidéo du livre :`;
    partage('Défi : C’est qui le plus fort ? — L’Arène des Duels', txt, lienDefi(r));
  });
}
function invite() {
  sfx('clic'); G.retourInvite = G.screen || 'titre'; show('invite');
}
function envoieJeu() { partage('C’est qui le plus fort ? — L’Arène des Duels', '🐯🦍 Viens jouer à « C’est qui le plus fort ? — L’Arène des Duels », le jeu vidéo du livre. Gratuit, sans inscription, sans pub :', PUBLIC) }
// photo de victoire (1080 × 1080) : le gagnant, les étoiles, le QR du jeu
const charge1 = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src });
async function photoVictoire() {
  const r = G.dernier; if (!r) return; sfx('clic');
  const c = document.createElement('canvas'); c.width = c.height = 1080; const x = c.getContext('2d');
  const gagnant = r.gagne ? r.moi : r.adv;
  let img, qr, logo; try { [img, qr, logo] = await Promise.all([charge1(gagnant + '_fin.webp'), charge1('qr_arene.png'), charge1('titre_cqpf.webp')]) } catch (e) { montreBulle('Oups, la photo n’a pas pu se faire.'); return }
  // fond : rayons jaune/orange comme la couverture
  x.fillStyle = '#FFC629'; x.fillRect(0, 0, 1080, 1080);
  x.save(); x.translate(540, 620); for (let i = 0; i < 24; i++) { x.rotate(Math.PI / 12); x.fillStyle = i % 2 ? '#FF8A4C' : '#FFB13B'; x.beginPath(); x.moveTo(0, 0); x.lineTo(1200, -120); x.lineTo(1200, 120); x.closePath(); x.fill() } x.restore();
  x.drawImage(logo, 540 - 265, 8, 530, 530 * logo.height / logo.width); // 25/09, décision B : le titre du livre en grand…
  const h = 510, w = h * img.width / img.height; x.drawImage(img, 540 - w / 2, 382, w, h);
  const bandeau = (t, y, s, fond = '#0B2A5B', coul = '#FFF8EC') => { x.font = `900 ${s}px Rubik, "Arial Black", sans-serif`; const tw = x.measureText(t).width; x.fillStyle = fond; x.beginPath(); x.roundRect(540 - tw / 2 - 30, y - s * .8, tw + 60, s * 1.3, 24); x.fill(); x.fillStyle = coul; x.textAlign = 'center'; x.fillText(t, 540, y + s * .15) };
  bandeau('L’ARÈNE DES DUELS · LE JEU VIDÉO DU LIVRE', 349, 28, '#0B2A5B', '#FFC629'); // …puis le nom du jeu
  bandeau(r.gagne ? `${CHARS[r.moi].nom} GAGNE !` : `${CHARS[r.adv].nom} GAGNE…`, 880, 64);
  if (r.gagne) { x.font = '900 70px Rubik, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#0B2A5B'; x.fillText('★'.repeat(r.etoiles) + '☆'.repeat(3 - r.etoiles), 540, 975) }
  if (SAVE.nom) { x.font = '900 36px Rubik, sans-serif'; x.fillStyle = '#0B2A5B'; x.textAlign = 'left'; x.fillText('CHAMPION : ' + SAVE.nom, 40, 1050) }
  x.fillStyle = '#fff'; x.fillRect(880, 880, 180, 180); x.drawImage(qr, 885, 885, 170, 170);
  x.font = '900 24px Rubik, sans-serif'; x.fillStyle = '#0B2A5B'; x.textAlign = 'right'; x.fillText('editions-chevalier.fr/arene', 870, 1050);
  const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
  const fichier = new File([blob], 'victoire-arene-des-duels.png', { type: 'image/png' });
  const res = await partage('Ma victoire dans C’est qui le plus fort ? — L’Arène des Duels', `${r.gagne ? '🏆 ' + CHARS[r.moi].nom + ' GAGNE !' : 'Revanche demain !'} « C’est qui le plus fort ? — L’Arène des Duels », le jeu vidéo du livre :`, PUBLIC, fichier);
  if (res === 'montre' || res === 'copie') { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fichier.name; document.body.appendChild(a); a.click(); a.remove(); montreBulle('La photo est enregistrée !') }
}
// ---------------------------------------------------------------------
//  Défi du jour : le même pour tous les enfants, change chaque jour
// ---------------------------------------------------------------------
function dateDuJour() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
function defiDuJour() {
  const date = dateDuJour(); let s = 0; for (const ch of 'arene' + date) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  // un jour sur cinq, le défi se passe dans la MER (s'il y a au moins deux animaux marins) ; même pour tous les enfants
  const x = r(), monde = ORDRE.filter(k => mondeDe(k) === 'mer').length >= 2 && x < .2 ? 'mer' : mondeOuvert('betes') && x >= .2 && x < .35 ? 'betes' : 'terre'; // (et parfois chez les PETITES BÊTES)
  const l = ORDRE.filter(k => !estLegendaire(k) && mondeDe(k) === monde); const a = l[Math.floor(r() * l.length)]; let b = l[Math.floor(r() * l.length)]; if (b === a) b = l[(l.indexOf(a) + 1) % l.length];
  const A = arenesDe(monde), arene = A[Math.floor(r() * A.length)].k;
  return { date, a, b, arene, niv: 1 };
}
function lanceJour() {
  const j = defiDuJour(); sonInit(); sfx('valide'); finEpreuve(); G.jour = j; G.livre = null; G.defi = null; G.mode = 1; G.tournoi = null; G.niv = j.niv; G.pick = [j.a, j.b]; G.arene = j.arene; G.areneHasard = false; vs();
}
function partageJour() {
  const j = SAVE.jour; if (!j) return; const d = j.date.split('-');
  const txt = `⚡ Défi du jour ${d[2]}/${d[1]} · « C’est qui le plus fort ? — L’Arène des Duels »\n${EMOJI[j.a] || ''} ${CHARS[j.a].nom} contre ${EMOJI[j.b] || ''} ${CHARS[j.b].nom}\n${j.gagne ? `✅ Gagné en ${j.temps} s ${'★'.repeat(j.etoiles)}${'☆'.repeat(3 - j.etoiles)}` : '❌ Pas encore gagné…'}\nÀ toi :`;
  partage('Défi du jour', txt, PUBLIC + '#jour');
}
// ---------------------------------------------------------------------
//  JOUER SANS INTERNET (25/09, demandé par Vincent : « je n'arrive pas à jouer quand je ne suis pas en wifi »)
//  • sw.js (fabriqué par deploy.sh à partir de sw_modele.js) garde le jeu sur l'appareil ;
//  • tout ce qui a servi pendant la visite est gardé ; l'espace parents peut tout télécharger d'un coup.
// ---------------------------------------------------------------------
const HL = { liste: null, enCours: false, MEDIA: 'arene-media' };
try { performance.setResourceTimingBufferSize(3000) } catch (e) { } // (pour retrouver tout ce qui a servi pendant la 1re visite)
const hlPossible = () => 'serviceWorker' in navigator && 'caches' in window && (location.protocol === 'https:' || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port !== '8765')); // (8765 : la page de test du développement, sans mémoire)
const hlVersion = () => { const m = document.querySelector('meta[name="version-jeu"]'); return m ? m.content : '' };
const hlAdresse = p => new URL(p, location.href).href.split('?')[0];
async function hlEnregistre() {
  if (!hlPossible()) return;
  try { await navigator.serviceWorker.register('sw.js') } catch (e) { return }
  try { // ce qui a déjà servi pendant cette visite (l'accueil, le tigre, le gorille, la savane, les sons…)
    await navigator.serviceWorker.ready; const c = await caches.open(HL.MEDIA), ici = new URL('./', location.href).href;
    const urls = [...new Set(performance.getEntriesByType('resource').map(r => r.name.split('#')[0].split('?')[0]).filter(u => u.startsWith(ici) && !/\.(js|html)$/.test(u) && !/\/sons\/mus_/.test(u) && !/hors-ligne\.json$/.test(u)))];
    for (const u of urls) if (!(await c.match(u))) { try { await c.add(u) } catch (e) { } }
  } catch (e) { }
}
// ---------------------------------------------------------------------
//  MISE À JOUR AUTOMATIQUE (26/09) : Safari garde parfois un onglet ouvert des jours entiers, avec l'ancienne version du jeu
//  (Vincent voyait encore celle du 24/09 après 5 mises à jour). Quand le jeu revient à l'écran, et toutes les 15 minutes,
//  on regarde sur internet s'il existe une version plus récente : sur un écran de menu, le jeu se recharge tout seul ;
//  en plein combat ou au milieu d'un duel du livre, il attend le retour à un menu. Jamais pendant un match en ligne.
// ---------------------------------------------------------------------
const MAJ = { attend: false, dernier: 0 };
const MAJ_ECRANS = ['titre', 'mode', 'livre', 'choix', 'arenes', 'trophees', 'adeux', 'parents', 'code', 'invite', 'appli', 'nom'];
async function verifieMaj(force) {
  const v = hlVersion(); if (!v || MAJ.attend || !navigator.onLine || (window.NET && NET.on)) return;
  if (!force && Date.now() - MAJ.dernier < 60000) return; MAJ.dernier = Date.now();
  try { const r = await fetch('./?maj=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return;
    const m = (await r.text()).match(/name="version-jeu" content="(\d+)"/); if (m && +m[1] > +v) { MAJ.attend = true; appliqueMaj() } } catch (e) { }
}
function appliqueMaj() {
  if (!MAJ.attend || MAJ.fait || G.phase !== 'menu' || !MAJ_ECRANS.includes(G.screen) || (window.NET && NET.on)) return;
  MAJ.fait = true; if (window.bandeau) bandeau('✨ NOUVELLE VERSION DU JEU !', true); setTimeout(() => location.reload(), 1600);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) verifieMaj() });
addEventListener('pageshow', e => { if (e.persisted) verifieMaj(true) });
setInterval(() => { if (!document.hidden) verifieMaj(true) }, 15 * 60 * 1000);
async function hlListe() { if (!HL.liste) { const r = await fetch('hors-ligne.json?v=' + hlVersion()); if (!r.ok) throw new Error('liste'); HL.liste = await r.json() } return HL.liste }
async function hlEtat() {
  const L = await hlListe(), c = await caches.open(HL.MEDIA); let o = 0, tot = 0, n = 0;
  for (const [p, t] of L.fichiers) { tot += t; if (await c.match(hlAdresse(p))) { o += t; n++ } }
  return { o, tot, n, N: L.fichiers.length };
}
const Mo = o => Math.max(1, Math.round(o / 1e6)) + ' Mo';
async function hlAffiche() {
  const e = $('hl-etat'), b = $('hl-go'); if (!e || !b) return;
  if (!hlPossible()) { b.hidden = true; e.textContent = 'Ce navigateur ne permet pas de garder le jeu sans internet.'; return }
  try { const s = await hlEtat(); b.textContent = `📥 TOUT TÉLÉCHARGER (${Mo(s.tot)})`;
    if (s.n >= s.N) { b.hidden = true; e.textContent = '✓ Tout est prêt : le jeu marche sans internet sur cet appareil.' }
    else { b.hidden = false; e.textContent = `Déjà sur cet appareil : ${Math.floor(100 * s.o / s.tot)} % (${Mo(s.o)} sur ${Mo(s.tot)}).` } }
  catch (err) { e.textContent = navigator.onLine ? '' : 'Pas d’internet pour l’instant.' }
}
async function hlTelecharge() {
  if (HL.enCours || !hlPossible()) return; HL.enCours = true; sfx('clic');
  const e = $('hl-etat'), b = $('hl-go'); b.disabled = true;
  try {
    const L = await hlListe(), c = await caches.open(HL.MEDIA), tot = L.fichiers.reduce((s, f) => s + f[1], 0); let o = 0, rates = 0; const aFaire = [];
    for (const f of L.fichiers) { if (await c.match(hlAdresse(f[0]))) o += f[1]; else aFaire.push(f) }
    const maj = () => { e.textContent = `Téléchargement : ${Math.floor(100 * o / tot)} % (${Mo(o)} sur ${Mo(tot)})… Laisse cet écran ouvert.` }; maj();
    let i = 0; const ouvrier = async () => { while (i < aFaire.length) { const f = aFaire[i++]; try { const r = await fetch(f[0], { cache: 'no-cache' }); if (r.ok) { await c.put(hlAdresse(f[0]), r); o += f[1] } else rates++ } catch (err) { rates++ } maj() } };
    await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
    if (rates) { e.textContent = `Presque fini : ${rates} fichier(s) n’ont pas pu venir (connexion coupée ?). Appuie encore sur le bouton pour finir.`; b.disabled = false; sfx('erreur') }
    else { sfx('valide'); await hlAffiche() }
  } catch (err) { e.textContent = 'Il faut internet (du wifi, de préférence) pour tout télécharger.'; b.disabled = false }
  finally { HL.enCours = false; b.disabled = false }
}
// les animaux pas encore sur l'appareil, quand il n'y a pas internet : carte grisée (☁️)
async function hlMarqueCartes() {
  if (navigator.onLine || !('caches' in window)) return;
  try { const c = await caches.open(HL.MEDIA); for (const b of document.querySelectorAll('#cartes .carte[id^="c-"]')) { const k = b.id.slice(2); if (!(await c.match(hlAdresse(k + '.meta.json')))) b.classList.add('absent') } } catch (e) { }
}
// ---------------------------------------------------------------------
//  Espace parents (petite porte : une multiplication)
// ---------------------------------------------------------------------
function ouvreParents() { sfx('clic'); G.retourParents = G.screen || 'titre'; show('parents'); const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7); G.porte = a * b; $('porte-q').textContent = `Pour les grands : combien font ${a} × ${b} ?`; $('porte-in').value = ''; $('parents-porte').hidden = false; $('parents-contenu').hidden = true }
function valideParents() { if (+$('porte-in').value === G.porte) { sfx('valide'); $('parents-porte').hidden = true; $('parents-contenu').hidden = false; hlAffiche() } else { sfx('erreur'); $('porte-q').textContent = 'Ce n’est pas ça… (demande à un grand !)' } }
// ---------------------------------------------------------------------
//  Tutoriel interactif (30 s) : la première fois qu'on appuie sur JOUER
// ---------------------------------------------------------------------
const TUTO = [
  { t: 'AVANCE vers ton adversaire !', tt: 'Pousse le joystick vers lui', tc: 'Flèche → (ou D)', k: 'avance' },
  { t: 'TAPE avec A (coup rapide) !', tk: 'TAPE : coup rapide !', tt: 'Appuie sur le bouton A', tc: 'Touche J (ou F)', k: 'L' },
  { t: 'Et maintenant B (coup fort) !', tk: 'Et maintenant : coup fort !', tt: 'Appuie sur le bouton B', tc: 'Touche K (ou G)', k: 'H' },
  { t: 'SAUTE !', tt: 'Pousse le joystick VERS LE HAUT ▲', tc: 'Flèche ↑ (ou Espace)', k: 'saut' },
  { t: 'ATTAQUE EN L’AIR !', tt: 'Saute ▲… et PENDANT le saut, appuie sur A (il s’allume : EN L’AIR !)', tc: 'Saute (↑), puis J pendant le saut', k: 'A' },
  { t: 'COUP EN BAS !', tt: 'Garde le joystick EN BAS ▼ et appuie sur A', tc: 'Garde ↓ et appuie sur J', k: 'cL' },
  { t: 'LA BALAYETTE : il tombe !', tt: 'Garde le joystick EN BAS ▼ et appuie sur B', tc: 'Garde ↓ et appuie sur K', k: 'cH' },
  { t: 'IL ATTAQUE ! Protège-toi : tire VERS LE BAS', tt: 'Joystick vers le bas pendant son attaque', tc: 'Flèche ↓ (ou S) pendant son attaque', k: 'garde' },
  { t: '★ : TON COUP SPÉCIAL !', tt: 'Appuie sur ★', tc: 'Touche L (ou H)', k: 'S' },
  { t: 'JAUGE PLEINE : ★ = SUPER !', tt: 'Appuie encore sur ★', tc: 'Encore la touche L (ou H)', k: 'SUPER' },
];
const TUTO_NOUVEAU = ['saut', 'A', 'cL', 'cH']; // pour ceux qui avaient déjà fait l'ancien tutoriel (25/09) : seulement ce qui est nouveau
const TUTO_VERSION = 2;
// (25/09, bonnes pratiques des jeux mobiles) : la 1re fois, l'essentiel en 6 étapes ; les coups avancés s'apprennent PENDANT les premiers combats (astuces)
const TUTO_BASE = ['avance', 'L', 'H', 'garde', 'S', 'SUPER'];
function tutoAFaire() { if (!window.lanceTuto) return false; if ((SAVE.tuto || 0) >= TUTO_VERSION) return false; if (SAVE.tuto) { SAVE.tuto = TUTO_VERSION; sauve(); return false } return true } // (l'ancien tutoriel fait : les astuces suffisent)
function lanceTuto(ensuite, quoi) {
  const L = quoi === 'tout' ? TUTO : quoi === 'nouveau' ? TUTO.filter(e => TUTO_NOUVEAU.includes(e.k)) : TUTO.filter(e => TUTO_BASE.includes(e.k));
  G.tutoApres = ensuite; G.tuto = { i: 0, t: 0, ok: 0, L, nouveau: quoi === 'nouveau' }; G.livre = null; G.defi = null; G.jour = null;
  G.mode = 1; G.niv = 0; G.tournoi = null; G.pick = ['tigre', 'gorille']; G.arene = 'savane'; startMatch();
  G.phase = 'fight'; G.pt = 0; for (const f of G.f) setS(f, 'idle'); G.f[1].tuto = true;
  G.f[0].x = quoi === 'nouveau' ? 700 : 380; G.f[1].x = 1420; /* assez loin pour que « avance » demande un vrai geste */ $('tuto-passer').hidden = false; majTuto();
}
function majTuto() { const T = G.tuto; if (!T) return; const e = T.L[T.i], tact = document.body.classList.contains('tactile'); $('tuto-bulle').hidden = false; $('tuto-bulle').innerHTML = `<small>${T.nouveau ? 'NOUVEAU ! · ' : ''}${T.i + 1} / ${T.L.length}</small><b class="R">${tact ? e.t : e.tk || e.t}</b><span>${tact ? e.tt : e.tc}</span>` }
function finTuto(passe) {
  SAVE.tuto = TUTO_VERSION; sauve(); $('tuto-bulle').hidden = true; $('tuto-passer').hidden = true; const f = G.tutoApres; G.tuto = null; G.tutoApres = null;
  if (!passe) { addFx({ k: 'mot', x: 960, y: 420, mot: 'BRAVO, TU ES PRÊT !', col: JA }); sfx('badge'); setTimeout(() => { G.phase = 'menu'; G.f = []; if (f) f() }, 1400) } else { G.phase = 'menu'; G.f = []; if (f) f() }
}
// appelé à chaque image pendant le tutoriel : l'adversaire « mannequin » et la validation des étapes
function tutoPas() {
  const T = G.tuto; if (!T || !G.f.length) return; const [a, b] = G.f, e = T.L[T.i]; T.t++;
  b.hp = Math.max(b.hp, 40); a.hp = a.d.hp; G.timer = 99 * 60; // personne ne perd pendant le tutoriel
  let fait = false;
  if (e.k === 'avance') fait = Math.abs(a.x - b.x) < 620;
  if (e.k === 'L' || e.k === 'H' || e.k === 'S') fait = a.state === 'atk' && (a.mk === e.k || (e.k === 'S' && ['S', 'SF', 'SD'].includes(a.mk)));
  if (e.k === 'saut') fait = a.state === 'air' || (a.h > 60 && a.state !== 'atk');
  if (e.k === 'A' || e.k === 'cL' || e.k === 'cH') fait = a.state === 'atk' && a.mk === e.k;
  if (e.k === 'garde') fait = a.state === 'bstun';
  if (e.k === 'SUPER') { a.meter = 100; fait = a.state === 'atk' && a.mk === 'SUPER' }
  if (fait && T.t > 20) { T.i++; T.t = 0; sfx('valide'); addFx({ k: 'mot', x: a.x, y: FLOOR - a.h - 560, mot: hasard(['BRAVO !', 'SUPER !', 'OUI !', 'BIEN JOUÉ !']), col: JA }); if (T.i >= T.L.length) { finTuto(false); return } majTuto() }
}
// ASTUCES (25/09) : pendant les premiers combats, UN coup avancé à essayer (au plus 3 fois chacun), dans l'ordre ; réussi → BRAVO et on passe au suivant
const ASTUCES = [
  { k: 'air', t: 'ATTAQUE EN L’AIR !', tt: 'Saute (▲) puis A pendant le saut', tc: 'Saute (↑) puis J pendant le saut', ok: f => f.state === 'atk' && f.mk === 'A', peut: f => !vol2d(f) && f.d.moves.A },
  { k: 'bas', t: 'LE COUP EN BAS !', tt: 'Joystick en bas (▼) et A', tc: 'Garde ↓ et appuie sur J', ok: f => f.state === 'atk' && f.mk === 'cL', peut: f => !vol2d(f) && f.d.moves.cL },
  { k: 'balayette', t: 'LA BALAYETTE !', tt: 'Joystick en bas (▼) et B : il tombe !', tc: 'Garde ↓ et appuie sur K', ok: f => f.state === 'atk' && f.mk === 'cH', peut: f => !vol2d(f) && f.d.moves.cH },
];
function astuceDebut() {
  if (G.mode !== 1 || NET.on || !G.f.length || G.f[0].cpu) return; SAVE.astuces = SAVE.astuces || {};
  const f = G.f[0], a = ASTUCES.find(x => (SAVE.astuces[x.k] || 0) < 3 && SAVE.astuces[x.k] !== 'ok' && x.peut(f)); if (!a) return;
  SAVE.astuces[a.k] = (SAVE.astuces[a.k] || 0) + 1; sauve(); G.astuce = { a, t: 0, fini: false };
}
function astucePas() {
  const A = G.astuce, f = G.f[0], e = $('tuto-bulle'); if (!A || !f || !e) return; A.t++;
  if (G.phase !== 'fight') { if (A.t > 1 && !e.hidden && A.montre) { e.hidden = true; A.montre = false } return }
  if (!A.montre && !A.fini && A.t > 40) { const tact = document.body.classList.contains('tactile'); A.montre = true; A.t0 = A.t;
    e.innerHTML = `<small>NOUVEAU COUP · ESSAIE !</small><b class="R">${A.a.t}</b><span>${tact ? A.a.tt : A.a.tc}</span>`; e.hidden = false }
  if (A.montre && !A.fini && A.a.ok(f)) { A.fini = true; SAVE.astuces[A.a.k] = 'ok'; sauve(); sfx('valide'); addFx({ k: 'mot', x: f.x, y: FLOOR - f.h - 560, mot: hasard(['BRAVO !', 'SUPER !', 'BIEN JOUÉ !']), col: JA }); e.hidden = true; A.montre = false }
  if (A.montre && A.t - A.t0 > 600) { e.hidden = true; A.montre = false; A.fini = true } // 10 s au plus : on n'insiste pas
}
// cerveau du mannequin : il attend, et attaque seulement à l'étape « protège-toi »
function tutoBrain(f, o) {
  const r = { left: false, right: false, up: false, down: false, L: false, H: false, S: false }, T = G.tuto; if (!T) return r;
  if (T.L[T.i].k === 'garde' && neutral(f) && T.t % 70 === 30) { if (Math.abs(o.x - f.x) > 700) r[o.x > f.x ? 'right' : 'left'] = true; else r.H = !f.prev.H }
  if (T.L[T.i].k === 'garde' && Math.abs(o.x - f.x) > 650) r[o.x > f.x ? 'right' : 'left'] = true;
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
function releveDefi() { const d = G.defi; if (!d) return; sonInit(); sfx('valide'); finEpreuve(); d.enCours = true; G.livre = null; G.jour = null; G.mode = 1; G.tournoi = null; G.niv = d.niv; G.pick = [d.moi, d.adv]; G.arene = d.arene; G.areneHasard = false; vs() }
function initBonus() {
  const on = (id, f) => { const e = $(id); if (e) e.onclick = f };
  on('codes-titre', ouvreCodes); on('codes-collec', () => { G.retourCode = 'trophees'; ouvreCodes() }); on('code-ok', valideCodeSecret); on('code-retour', () => { sfx('retour'); const r = G.retourCode; G.retourCode = null; if (r === 'trophees') ouvreTrophees(); else show('titre') });
  on('god-btn', basculeGod);
  on('invite-titre', invite); on('invite-adeux', invite); on('invite-envoie', envoieJeu); on('invite-retour', () => { sfx('retour'); show(G.retourInvite || 'titre') });
  on('parents-titre', ouvreParents); on('porte-ok', valideParents); on('hl-go', hlTelecharge); hlEnregistre(); on('parents-retour', () => { sfx('retour'); show(G.retourParents || 'titre') });
  on('jour-titre', lanceJour); on('fin-jour', partageJour);
  on('fin-photo', photoVictoire); on('fin-defi', partageDefi); on('v-defi', () => { partageDefi() });
  on('nom-autre', () => { sfx('clic'); proposeNoms() }); on('nom-retour', () => { sfx('retour'); show(G.retourNom || 'titre') });
  on('defi-go', releveDefi); on('defi-non', () => { sfx('retour'); G.defi = null; history.replaceState(null, '', location.pathname); show('titre') });
  on('legende-ok', () => { sfx('valide'); G.phase = 'menu'; selStage = 0; show('choix'); vaVers(G.legendeVu || LEGENDAIRE); construitCartes() });
  on('tuto-passer', () => { sfx('clic'); finTuto(true) });
  on('comment-jouer', () => { sfx('clic'); lanceTuto(() => { show('choix'); construitCartes() }, 'tout') });
  const pi = $('porte-in'); if (pi) pi.addEventListener('keydown', e => { if (e.key === 'Enter') valideParents() });
  // défi du jour : l'autocollant de l'accueil montre les deux animaux du jour
  const j = defiDuJour(), jt = $('jour-tetes'), jx = $('jour-txt'); if (jt) jt.innerHTML = `<img src="${j.a}_tete.webp" alt=""><em>VS</em><img src="${j.b}_tete.webp" alt="">`; if (jx) jx.textContent = 'Chaque jour !'; if (false) jx.textContent = `${CHARS[j.a].nom} contre ${CHARS[j.b].nom}`;
  majGodBtn();
}
// au chargement : lien de défi reçu, lien « défi du jour »
function lienRecu() {
  const d = lisDefi(); if (d) { ouvreDefiRecu(d); return true }
  if (/#jour/.test(location.hash)) { G.phase = 'menu'; if (typeof tutoAFaire === 'function' && !tutoAFaire()) { ouvreTrophees('titre'); setTimeout(() => { const b = $('jour-titre'); if (b) b.classList.add('appel') }, 300) } else show('titre') } // (M8 : le ⚡ défi du jour est dans MES ANIMAUX)
  return false;
}
