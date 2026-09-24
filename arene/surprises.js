// =====================================================================
//  SURPRISES (25/09) : caisses surprises pendant le combat, pièges d'arène, trophées
//  • une caisse (une bulle sous la mer) tombe de temps en temps : l'animal qui la touche reçoit un bonus
//  • chaque arène a son piège, annoncé à l'avance (ombre, bulles, flèches) : on peut l'éviter
//  • tout se règle dans l'espace parents (« Surprises : oui / non ») ; jamais dans le tutoriel ni dans les tests d'équilibre
//  • en ligne, c'est l'hôte qui décide : l'invité reçoit tout dans l'image envoyée (net.js)
// =====================================================================
const BONUS = {
  soin: { ico: '🍗', icoMer: '🐟', nom: 'MIAM ! +20', p: 3, col: '#7BD35A' },
  super: { ico: '⚡', nom: 'SUPER PLEIN !', p: 3, col: '#FFD23F' },
  piment: { ico: '🌶️', nom: 'PIMENT : COUPS DE FEU !', p: 2, t: 420, col: '#FF5A3C' },
  turbo: { ico: '👟', icoMer: '🐬', nom: 'TURBO !', p: 2, t: 420, col: '#5AD1FF' },
  bouclier: { ico: '🛡️', nom: 'BOUCLIER !', p: 2, t: 360, col: '#9FD8FF' },
  geant: { ico: '💪', nom: 'GÉANT !', p: 1.5, t: 420, col: '#FFB23F' },
  mini: { ico: '🐜', nom: 'TOUT PETIT !', p: 1.5, t: 420, col: '#C99BFF', autre: true }, // c'est l'adversaire qui rétrécit
  banane: { ico: '🍌', icoMer: '🪼', nom: 'PEAU DE BANANE !', nomMer: 'MÉDUSE !', p: 2, col: '#FFE14D', autre: true },
  orage: { ico: '⛈️', nom: 'ZAP ! L’ÉCLAIR !', p: 1.5, col: '#FFF36B', autre: true },
};
const surprisesOn = () => G.phase === 'fight' && !G.tuto && !G.sansSurprise && G.mode !== 3 && (SAVE.opt || {}).surprises !== false;
// le bonus change l'animal pour un moment : on lui donne une « fiche » qui hérite de la vraie (taille, vitesse, force…)
function appliqueBoost(f) {
  const base = CHARS[f.kind], b = f.boost; if (!base) return;
  if (!b) { f.d = base; return }
  const d = Object.create(base);
  if (b.k === 'geant') { d.K = base.K * 1.3; d.force = (base.force || 1) * 1.2; d.push = [base.push[0] * 1.3, base.push[1] * 1.3] }
  if (b.k === 'mini') { d.K = base.K * .7; d.force = (base.force || 1) * .85; d.push = [base.push[0] * .7, base.push[1] * .7] }
  if (b.k === 'piment') d.force = (base.force || 1) * 1.35;
  if (b.k === 'turbo') { d.walk = base.walk * 1.5; d.back = base.back * 1.5; d.dash = base.dash * 1.3; d.jumpX = base.jumpX * 1.25 }
  if (b.k === 'bouclier') d.peau = (base.peau || 1) * .5;
  f.d = d;
}
function donneBoost(f, k, t) { f.boost = { k, t, T: t }; appliqueBoost(f) }
function finBoost(f) { if (!f.boost) return; f.boost = null; appliqueBoost(f) }
// dégâts « de l'arène » (piège, banane, éclair) : pas d'attaquant, pas de jauge
function blesse(d, dmg, o = {}) {
  if (!d || d.hp <= 0 || ['ko', 'tenu'].includes(d.state) || d.cache) return false;
  if (o.sol && d.h > 60) return false;
  if (invincible(d)) dmg = 0;
  d.hp = Math.max(1, d.hp - dmg); d.flash = 4; // un piège ne met jamais K.-O.
  if (o.chute || d.h > 0) { setS(d, 'hurt'); d.stun = 99; d.knock = true; d.vy = -(o.haut || 11); d.h = Math.max(d.h, .1); d.vx = (o.dir || (Math.random() < .5 ? -1 : 1)) * (o.vx || 4) }
  else { setS(d, 'hurt'); d.stun = o.stun || 26; d.hurtK = 1; d.vx = (o.dir || 0) * (o.vx || 0) }
  if (o.mot) addFx({ k: 'mot', x: d.x, y: FLOOR - 640 * d.d.K / .44, mot: o.mot, col: o.col || JA });
  addFx({ k: 'impact', x: d.x, y: FLOOR - 300 * d.d.K / .44, size: .7, col: o.col || JA });
  G.shake = Math.max(G.shake, 10); vibre(30);
  return true;
}
// ---------------------------------------------------------------------
//  Caisses surprises
// ---------------------------------------------------------------------
function tireBonus() { const mer = estMer(), l = Object.entries(BONUS), tot = l.reduce((s, [, b]) => s + b.p, 0); let r = Math.random() * tot; for (const [k, b] of l) { r -= b.p; if (r <= 0) return k } return 'soin' }
function nouvelleCaisse() {
  const [a, b] = G.f, fa = a.hp / a.d.hp, fb = b.hp / b.d.hp;
  // un peu plus souvent près de celui qui est en difficulté (sans que ce soit sûr)
  const vers = Math.random() < .6 ? (fa < fb ? a : b) : (Math.random() < .5 ? a : b);
  const x = Math.max(STAGE_L + 220, Math.min(STAGE_R - 220, vers.x + (Math.random() - .5) * 700));
  G.caisse = { x, y: FLOOR - 1250, vy: 0, t: 0, life: 560, mer: estMer(), pose: false, k: tireBonus() };
  sfx('sifflet', .5);
}
function prendCaisse(f) {
  const c = G.caisse; G.caisse = null; G.nbCaisses = (G.nbCaisses || 0) + 1;
  const o = G.f.find(g => g !== f), B = BONUS[c.k], mer = c.mer;
  sfx('pop', 1); sfx('badge', .7); vibre([30, 30, 60]);
  addFx({ k: 'etincelles', x: c.x, y: c.y - 60 });
  G.bonusAff = { ico: (mer && B.icoMer) || B.ico, nom: (mer && B.nomMer) || B.nom, col: B.col, x: c.x, t0: G.time, qui: f.side };
  if (!f.cpu && !f.distant) { SAVE.compte = SAVE.compte || {}; SAVE.compte.caisses = (SAVE.compte.caisses || 0) + 1; trophee('caisse1', f); if (SAVE.compte.caisses >= 25) trophee('caisse25', f) }
  switch (c.k) {
    case 'soin': { const g = f.d.gourmand ? 2 : 1; f.hp = Math.min(f.d.hp, f.hp + 20 * g); addFx({ k: 'mot', x: f.x, y: FLOOR - 700 * f.d.K / .44, mot: g > 1 ? 'GOURMAND ! +40' : '+20', col: '#7BD35A' }); sfx('slurp', .7); break } // l'ours noir, « plus gourmand que bagarreur » (livre) : deux fois plus
    case 'super': jauge(f, 100); sfx('super', .6); break;
    case 'mini': donneBoost(o, 'mini', B.t); sfx('pouet', .8); break;
    case 'banane': if (mer) { if (blesse(o, 6, { mot: 'BZZZ ! MÉDUSE !', col: '#E7A6FF', stun: 40 })) { o.meduse = 40; sfx('sonar', .5) } }
      else { G.banane = { x: o.x, t: 0 }; if (blesse(o, 6, { chute: true, haut: 9, mot: 'GLISSADE !', col: '#FFE14D' })) { sfx('boing', 1); sfx('pouet', .6); if (!f.cpu && !f.distant) trophee('banane', f) } } break;
    case 'orage': G.eclair = { x: o.x, t: 0, cible: o, par: f }; sfx('vent', .5); break;
    default: donneBoost(f, c.k, B.t); if (c.k === 'geant') { trophee('geant', f); sfx('boum', .6) } if (c.k === 'turbo') sfx('vent', .6); if (c.k === 'piment') sfx('vapeur', .7); if (c.k === 'bouclier') sfx('garde', .8)
  }
}
function majCaisses() {
  // minuterie : la première caisse après 8 à 12 s de combat, puis une toutes les 14 à 20 s
  if (G.prochaineCaisse == null) G.prochaineCaisse = 480 + Math.random() * 240;
  if (!G.caisse && --G.prochaineCaisse <= 0) { nouvelleCaisse(); G.prochaineCaisse = 840 + Math.random() * 360 }
  const c = G.caisse; if (!c) return;
  c.t++;
  if (c.mer) { const sol = FLOOR - 90; if (c.y < sol) c.y = Math.min(sol, c.y + 6 + Math.sin(c.t * .1) * 2); else c.pose = true }
  else if (!c.pose) { c.vy += 1.1; c.y += c.vy; if (c.y >= FLOOR) { c.y = FLOOR; if (c.vy > 8) { c.vy *= -.35; sfx('sol', .5); addFx({ k: 'poussiere', x: c.x, y: FLOOR }) } else { c.vy = 0; c.pose = true } } }
  if (c.t > c.life) { G.caisse = null; addFx({ k: 'mot', x: c.x, y: FLOOR - 260, mot: 'TROP TARD !', col: '#C8D6F0' }); return }
  if (c.y < FLOOR - 420) return;
  for (const f of G.f) { if (f.state === 'ko' || f.cache) continue;
    const hb = f.state === 'atk' ? hitBox(f) : null, touche = Math.abs(f.x - c.x) < f.d.push[1] + 70 && f.h < 260;
    if (touche || (hb && hb[0] < c.x + 80 && hb[1] > c.x - 80 && hb[3] > c.y - 160)) { prendCaisse(f); return } }
}
function majBoosts() {
  for (const f of G.f) { const b = f.boost; if (!b) continue; b.t--;
    if (b.k === 'piment' && G.frame % 6 === 0) addFx({ k: 'etincelles', x: f.x + (Math.random() - .5) * 200 * f.d.K / .44, y: FLOOR - f.h - 200 - Math.random() * 300 * f.d.K / .44 });
    if (b.k === 'turbo' && G.frame % 5 === 0 && Math.abs(f.vx) > 2) addFx({ k: 'poussiere', x: f.x - Math.sign(f.vx) * 120, y: FLOOR });
    if (b.t <= 0) { finBoost(f); addFx({ k: 'mot', x: f.x, y: FLOOR - 620 * f.d.K / .44, mot: 'FINI !', col: '#C8D6F0' }) } }
  if (G.banane) { G.banane.t++; if (G.banane.t > 70) G.banane = null }
  const e = G.eclair; if (e) { e.t++; if (e.cible && e.t < 30) e.x += (e.cible.x - e.x) * .12;
    if (e.t === 30) { const d = e.cible; sfx('boum', 1); sfx('vapeur', .6); G.flashEcran = 8; if (Math.abs(d.x - e.x) < 180 && blesse(d, 10, { mot: 'ZAP !', col: '#FFF36B', stun: 34 })) d.grille = 40 }
    if (e.t > 48) G.eclair = null }
}
// ---------------------------------------------------------------------
//  Pièges d'arène (annoncés : on peut les éviter)
// ---------------------------------------------------------------------
const PIEGES = {
  jungle: { k: 'chute', obj: 'coco', mot: 'NOIX DE COCO !', dmg: 8 },
  foret: { k: 'chute', obj: 'pomme', mot: 'POMME DE PIN !', dmg: 7 },
  volcan: { k: 'chute', obj: 'lave', mot: 'PIERRE DE LAVE !', dmg: 9 },
  nuit: { k: 'chute', obj: 'fruit', mot: 'UN FRUIT TOMBE !', dmg: 6 },
  colisee: { k: 'chute', obj: 'coussin', mot: 'LE PUBLIC LANCE UN COUSSIN !', dmg: 0 },
  savane: { k: 'vent', mot: 'TOURBILLON DE POUSSIÈRE !', col: '#E8C27A' },
  desert: { k: 'vent', mot: 'TEMPÊTE DE SABLE !', col: '#E9C98B' },
  plage: { k: 'vent', mot: 'LA VAGUE !', col: '#BFE9FF', vague: true },
  ocean: { k: 'vent', mot: 'COURANT MARIN !', col: '#BFE9FF', mer: true },
  banquise: { k: 'trou', obj: 'phoque', mot: 'COUCOU !', dmg: 5 },
  riviere: { k: 'trou', obj: 'poisson', mot: 'UN POISSON SAUTE !', dmg: 4 },
  recif: { k: 'trou', obj: 'bulles', mot: 'BLOUB ! BULLES GÉANTES !', dmg: 5 },
  abysses: { k: 'trou', obj: 'chaud', mot: 'EAU BOUILLANTE !', dmg: 7 },
  aquarium: { k: 'repas', mot: 'L’HEURE DU REPAS !' },
  epave: { k: 'repas', obj: 'tresor', mot: 'UNE PIÈCE D’OR !' }, // le premier qui l'attrape remplit sa jauge SUPER
  lune: { k: 'chute', obj: 'meteorite', mot: 'MÉTÉORITE !', dmg: 7 },
  prehisto: { k: 'chute', obj: 'oeuf', mot: 'UN ŒUF TOMBE DU NID !', dmg: 5 },
};
function nouveauPiege() {
  const P = PIEGES[G.arene]; if (!P) return;
  const cible = G.f[Math.random() < .5 ? 0 : 1], x = Math.max(STAGE_L + 160, Math.min(STAGE_R - 160, cible.x + (Math.random() - .5) * 240));
  G.piege = { P, k: P.k, x, t: 0, dir: Math.random() < .5 ? -1 : 1, fait: false };
  if (P.k === 'vent' || P.k === 'repas') addFx({ k: 'mot', x: 960, y: FLOOR - 820, mot: 'ATTENTION : ' + P.mot, col: P.col || JA });
  else sfx(P.k === 'trou' ? 'bulle' : 'sifflet', .45);
}
function majPieges() {
  if (!PIEGES[G.arene]) return;
  if (G.prochainPiege == null) G.prochainPiege = 720 + Math.random() * 300;
  if (!G.piege && --G.prochainPiege <= 0) { nouveauPiege(); G.prochainPiege = 1000 + Math.random() * 450 }
  const p = G.piege; if (!p) return; p.t++;
  const P = p.P;
  if (p.k === 'chute') { // une ombre grandit (70 images), puis l'objet tombe
    if (p.t === 70) { p.fait = true; sfx(P.obj === 'coussin' ? 'pouet' : 'chute', .9); addFx({ k: 'poussiere', x: p.x, y: FLOOR });
      for (const f of G.f) if (Math.abs(f.x - p.x) < 150 + f.d.push[1] * .4 && f.h < 300) {
        if (P.dmg) { if (blesse(f, P.dmg, { mot: P.mot, stun: 30, dir: Math.sign(f.x - p.x) || 1, vx: 5 })) { sfx('boing', 1); f.bosse = 60; piegeTouche(f) } }
        else { addFx({ k: 'mot', x: f.x, y: FLOOR - 640 * f.d.K / .44, mot: 'POUF ! UN COUSSIN !', col: '#FF7AB6' }); f.vx = (Math.sign(f.x - p.x) || 1) * 8; sfx('foule', .6); piegeTouche(f) } } }
    if (p.t > 130) G.piege = null;
  } else if (p.k === 'vent') { // 60 images d'annonce, puis 100 images de poussée
    if (p.t === 60) sfx('ventlong', .7);
    if (p.t > 60 && p.t < 160) for (const f of G.f) { if (f.state === 'ko' || f.cache) continue; const k = f.blocking ? .35 : 1; f.x = Math.max(STAGE_L, Math.min(STAGE_R, f.x + p.dir * 3.2 * k)) }
    if (p.t > 180) G.piege = null;
  } else if (p.k === 'trou') { // le sol bouillonne (70 images), puis ça jaillit
    if (p.t === 70) { p.fait = true; sfx(P.obj === 'phoque' ? 'morse' : P.obj === 'poisson' ? 'flac' : 'plouf', .9);
      for (const f of G.f) if (Math.abs(f.x - p.x) < 170 && f.h < 200) { if (blesse(f, P.dmg, { chute: true, haut: 17, mot: P.mot, dir: Math.sign(f.x - p.x) || 1, vx: 3 })) piegeTouche(f) } }
    if (p.t > 140) G.piege = null;
  } else if (p.k === 'repas') { // un poisson tombe du haut du bassin : le premier qui le touche reprend des forces
    if (p.t === 50) { p.poisson = { x: p.x, y: FLOOR - 1150 }; sfx('plouf', .6) }
    const q = p.poisson; if (q) { if (q.y < FLOOR - 100) q.y += 7; for (const f of G.f) if (!p.fait && Math.abs(f.x - q.x) < f.d.push[1] + 80 && f.state !== 'ko') { p.fait = true;
      if (P.obj === 'tresor') { jauge(f, 35); addFx({ k: 'mot', x: f.x, y: FLOOR - 650 * f.d.K / .44, mot: 'TRÉSOR ! +SUPER', col: '#FFD23F' }); sfx('badge', .8) }
      else { f.hp = Math.min(f.d.hp, f.hp + 10); addFx({ k: 'mot', x: f.x, y: FLOOR - 650 * f.d.K / .44, mot: 'MIAM ! +10', col: '#7BD35A' }); sfx('slurp', .8) } p.poisson = null; p.t = 400 } }
    if (p.t > 420) G.piege = null;
  }
}
function piegeTouche(f) { const o = G.f.find(g => g !== f); if (o && !o.cpu && !o.distant) trophee('piege', o) }
function majSurprises() {
  if (!surprisesOn() || !G.f.length) { if (G.phase !== 'fight') { G.caisse = null; G.piege = null } return }
  majCaisses(); majBoosts(); majPieges();
}
function razSurprises() { G.caisse = null; G.piege = null; G.eclair = null; G.banane = null; G.bonusAff = null; G.flashEcran = 0; G.prochaineCaisse = null; G.prochainPiege = null; for (const f of G.f) { f.boost = null; f.d = CHARS[f.kind] || f.d } }
// ---------------------------------------------------------------------
//  Dessin
// ---------------------------------------------------------------------
function dessineCaisse(c, x, y, t, mer) {
  if (mer) { // une grosse bulle avec un point d'interrogation
    const r = 74 + Math.sin(t * .15) * 4; c.save(); c.globalAlpha = .9;
    const g = c.createRadialGradient(x - 24, y - r - 24, 8, x, y - r, r); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.5, 'rgba(160,225,255,.45)'); g.addColorStop(1, 'rgba(80,170,255,.7)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y - r, r, 0, TAU); c.fill(); c.lineWidth = 6; c.strokeStyle = '#FFFFFF'; c.stroke(); c.restore();
    txt(c, '?', x, y - r + 30, 92, JA, { out: 12 }); return }
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * .2) * .03);
  c.fillStyle = '#C8843C'; c.strokeStyle = '#5A3312'; c.lineWidth = 8; rr(c, -85, -170, 170, 170, 14); c.fill(); c.stroke();
  c.strokeStyle = '#7A4A1C'; c.lineWidth = 7; c.beginPath(); c.moveTo(-85, -85); c.lineTo(85, -85); c.moveTo(-70, -160); c.lineTo(70, -10); c.stroke();
  c.fillStyle = '#FFD23F'; c.strokeStyle = '#5A3312'; c.lineWidth = 6; c.beginPath(); c.arc(0, -85, 48, 0, TAU); c.fill(); c.stroke();
  c.restore(); txt(c, '?', x, y - 55, 84, '#E63B2E', { out: 10 });
}
function dessineObjet(c, obj, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 6; c.strokeStyle = NV;
  if (obj === 'coco') { c.fillStyle = '#7A4A22'; c.beginPath(); c.arc(0, 0, 58, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#3A220E'; for (const [a, b] of [[-16, -18], [14, -20], [0, 4]]) { c.beginPath(); c.arc(a, b, 8, 0, TAU); c.fill() } }
  else if (obj === 'pomme') { c.fillStyle = '#8A5A2B'; c.beginPath(); c.ellipse(0, 0, 40, 62, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#4B2E12'; c.lineWidth = 4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-36, i * 22); c.lineTo(0, i * 22 + 14); c.lineTo(36, i * 22); c.stroke() } }
  else if (obj === 'lave') { c.fillStyle = '#3B3432'; c.beginPath(); c.moveTo(-60, 10); c.lineTo(-30, -50); c.lineTo(30, -56); c.lineTo(62, 0); c.lineTo(30, 48); c.lineTo(-40, 44); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#FF7A1A'; c.beginPath(); c.arc(-8, -6, 18, 0, TAU); c.arc(22, 18, 10, 0, TAU); c.fill() }
  else if (obj === 'fruit') { c.fillStyle = '#F2A33A'; c.beginPath(); c.ellipse(0, 0, 44, 56, .4, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#5DAA3A'; c.beginPath(); c.ellipse(18, -52, 22, 10, -.5, 0, TAU); c.fill(); c.stroke() }
  else if (obj === 'meteorite') { c.fillStyle = '#6B625C'; c.beginPath(); c.moveTo(-58, 6); c.lineTo(-34, -48); c.lineTo(24, -58); c.lineTo(60, -8); c.lineTo(36, 46); c.lineTo(-30, 50); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#FFB347'; for (const [a, b, r] of [[-14, -10, 12], [20, 16, 8], [8, -30, 6]]) { c.beginPath(); c.arc(a, b, r, 0, TAU); c.fill() } }
  else if (obj === 'oeuf') { c.fillStyle = '#F4EBD2'; c.beginPath(); c.ellipse(0, 0, 44, 60, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#B98A55'; for (const [a, b, r] of [[-14, -20, 9], [16, -4, 7], [-6, 22, 8], [18, 28, 5]]) { c.beginPath(); c.arc(a, b, r, 0, TAU); c.fill() } }
  else if (obj === 'piece') { c.fillStyle = '#FFD23F'; c.beginPath(); c.arc(0, 0, 46, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#C8920F'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 32, 0, TAU); c.stroke(); c.fillStyle = '#FFF4B8'; c.beginPath(); c.ellipse(-14, -16, 10, 6, -.6, 0, TAU); c.fill() }
  else if (obj === 'coussin') { c.fillStyle = '#E8466B'; rr(c, -62, -46, 124, 92, 30); c.fill(); c.stroke(); c.fillStyle = '#FFD23F'; for (const [a, b] of [[-62, -46], [62, -46], [-62, 46], [62, 46]]) { c.beginPath(); c.arc(a, b, 12, 0, TAU); c.fill(); c.stroke() } }
  c.restore();
}
function dessinePhoque(c, x, y, u) { c.save(); c.translate(x, y - u * 220); c.lineWidth = 7; c.strokeStyle = NV; c.fillStyle = '#9AA6B2';
  c.beginPath(); c.ellipse(0, 40, 80, 110, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-26, -10, 16, 0, TAU); c.arc(26, -10, 16, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = NV; c.beginPath(); c.arc(-24, -8, 7, 0, TAU); c.arc(28, -8, 7, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, 22, 16, 11, 0, 0, TAU); c.fill();
  c.lineWidth = 3; for (const s of [-1, 1]) for (const k of [-8, 4]) { c.beginPath(); c.moveTo(s * 20, 28 + k / 2); c.lineTo(s * 70, 20 + k); c.stroke() } c.restore() }
function dessineSurprises(c) { // (sur le décor, derrière les animaux)
  if (!G.f.length) return;
  const cc = G.caisse; if (cc) { const blink = cc.life - cc.t < 120 && Math.floor(cc.t / 6) % 2; if (!blink) { if (cc.pose) { c.save(); c.globalAlpha = .35 + .2 * Math.sin(cc.t * .2); c.fillStyle = JA; c.beginPath(); c.ellipse(cc.x, FLOOR + 4, 130, 26, 0, 0, TAU); c.fill(); c.restore() } dessineCaisse(c, cc.x, cc.y, cc.t, cc.mer) } }
  const p = G.piege; if (p) { const P = p.P;
    if (p.k === 'chute' && p.t < 70) { const u = p.t / 70; c.save(); c.globalAlpha = .25 + .45 * u; c.fillStyle = '#1B0E05'; c.beginPath(); c.ellipse(p.x, FLOOR + 6, 60 + 110 * u, 14 + 20 * u, 0, 0, TAU); c.fill(); c.restore() }
    if (p.k === 'trou' && p.t < 70) { c.save(); for (let i = 0; i < 6; i++) { const a = (p.t * 7 + i * 60) % 360 * Math.PI / 180; c.fillStyle = P.obj === 'chaud' ? 'rgba(255,170,90,.8)' : P.obj === 'phoque' ? '#5E7C95' : 'rgba(200,240,255,.85)'; c.beginPath(); c.arc(p.x + Math.cos(a) * 80, FLOOR - 6 + Math.sin(a) * 10, 12 + (i % 3) * 5, 0, TAU); c.fill() } c.fillStyle = P.obj === 'phoque' ? '#2B4458' : 'rgba(20,40,60,.5)'; c.beginPath(); c.ellipse(p.x, FLOOR + 4, 110, 22, 0, 0, TAU); c.fill(); c.restore() }
  }
}
// monde → écran (le zoom de la caméra peut couper le haut du décor)
function versEcran(c, x, y) { const m = c.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f] }
function dessineSurprisesDevant(c) { // (devant les animaux)
  if (!G.f.length) return; const t = G.time;
  const p = G.piege; if (p) { const P = p.P;
    if ((p.k === 'chute' || p.k === 'trou') && p.t < 70 && Math.floor(p.t / 8) % 2) { const [sx, sy] = versEcran(c, p.x, FLOOR - 330); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); txt(c, '!', sx, Math.max(230, sy), 110, '#FF5A3C', { out: 14 }); c.restore() }
    if (p.k === 'chute') { if (p.t >= 58 && p.t < 70) { const u = (p.t - 58) / 12; dessineObjet(c, P.obj, p.x, FLOOR - 1100 + u * 1040, 1.2) } else if (p.t >= 70) { const u = (p.t - 70) / 60; c.save(); c.globalAlpha = 1 - u; dessineObjet(c, P.obj, p.x + p.dir * u * 260, FLOOR - 60 - Math.sin(u * Math.PI) * 180, 1.2); c.restore() } }
    if (p.k === 'vent' && p.t > 50 && p.t < 170) { c.save(); c.globalAlpha = Math.min(1, (p.t - 50) / 15, (170 - p.t) / 15) * .85; c.lineCap = 'round';
      for (let i = 0; i < 9; i++) { const y = FLOOR - 60 - i * 95, x0 = ((p.t * 26 * p.dir + i * 210) % 2400 + 2400) % 2400 - 240; for (const [col, lw] of [['rgba(40,25,10,.45)', 16], ['#FFFBEF', 8]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo(x0 + p.dir * 90, y - 30, x0 + p.dir * 200, y); c.stroke() } }
      c.fillStyle = P.col || '#E8C27A'; for (let i = 0; i < 26; i++) { const x = ((p.t * 30 * p.dir + i * 97) % 2100 + 2100) % 2100 - 90, y = FLOOR - 30 - ((i * 53) % 700); c.beginPath(); c.arc(x, y, 7 + i % 4 * 3, 0, TAU); c.fill() }
      if (P.vague) { c.globalAlpha = .5; c.fillStyle = '#BFE9FF'; c.beginPath(); c.moveTo(0, FLOOR); for (let x = 0; x <= 1920; x += 40) c.lineTo(x, FLOOR - 70 - Math.sin(x * .01 + p.t * .3) * 30); c.lineTo(1920, FLOOR + 80); c.lineTo(0, FLOOR + 80); c.fill() } c.restore() }
    if (p.k === 'trou' && p.t >= 70 && p.t < 140) { const u = Math.min(1, (p.t - 70) / 12), v = p.t > 110 ? (140 - p.t) / 30 : 1;
      c.save(); c.globalAlpha = v;
      if (P.obj === 'phoque') dessinePhoque(c, p.x, FLOOR, u);
      else if (P.obj === 'poisson') poisson(c, p.x, FLOOR - 120 - Math.sin(Math.min(1, (p.t - 70) / 50) * Math.PI) * 420, -1.2 + (p.t - 70) * .06, 1.6);
      else { for (let i = 0; i < 16; i++) { const k = ((p.t - 70) * 9 + i * 37) % 420; c.fillStyle = P.obj === 'chaud' ? 'rgba(255,190,120,.75)' : 'rgba(220,245,255,.85)'; c.beginPath(); c.arc(p.x + Math.sin(i * 2.3 + p.t * .2) * 60, FLOOR - k * u, 10 + (i % 4) * 7, 0, TAU); c.fill() } }
      c.restore() }
    if (p.k === 'repas' && p.poisson) { if (P.obj === 'tresor') dessineObjet(c, 'piece', p.poisson.x, p.poisson.y, 1); else poisson(c, p.poisson.x, p.poisson.y, Math.sin(t * 8) * .3, 1.4) }
  }
  if (G.banane) { const u = G.banane.t / 70; c.save(); c.globalAlpha = 1 - u; c.translate(G.banane.x, FLOOR - 40 - Math.sin(u * Math.PI) * 300); c.rotate(u * 12); c.font = '110px sans-serif'; c.textAlign = 'center'; c.fillText('🍌', 0, 0); c.restore() }
  const e = G.eclair; if (e) { const [sx] = versEcran(c, e.x, 0), [, sy] = versEcran(c, e.x, FLOOR - 120); c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#4A5068'; c.strokeStyle = NV; c.lineWidth = 6; for (const [dx, dy, r] of [[-70, 0, 60], [0, -26, 78], [80, 0, 60]]) { c.beginPath(); c.arc(sx + dx, 210 + dy, r, 0, TAU); c.fill() }
    if (e.t >= 30 && e.t < 40) { c.strokeStyle = '#FFF36B'; c.lineWidth = 20; c.shadowColor = '#FFF'; c.shadowBlur = 30; c.beginPath(); let x = sx, y = 250; c.moveTo(x, y); while (y < sy) { y = Math.min(sy, y + 90); x += (Math.random() - .5) * 110; c.lineTo(x, y) } c.stroke() }
    c.restore() }
  for (const f of G.f) { const b = f.boost; if (!b || f.cache) continue; const R = 380 * f.d.K / .44, y = FLOOR - f.h - 260 * f.d.K / .44, fin = b.t < 90 && Math.floor(b.t / 6) % 2; if (fin) continue;
    if (b.k === 'bouclier') { c.save(); c.globalAlpha = .28 + .1 * Math.sin(t * 8); c.strokeStyle = '#9FD8FF'; c.lineWidth = 16; c.beginPath(); c.arc(f.x, y, R, 0, TAU); c.stroke(); c.globalAlpha *= .5; c.fillStyle = '#CFEFFF'; c.fill(); c.restore() }
    if (b.k === 'piment') { c.save(); c.globalAlpha = .3 + .1 * Math.sin(t * 20); const g = c.createRadialGradient(f.x, y, 10, f.x, y, R); g.addColorStop(0, 'rgba(255,90,40,.7)'); g.addColorStop(1, 'rgba(255,90,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(f.x, y, R, 0, TAU); c.fill(); c.restore() }
    const [ix, iy] = versEcran(c, f.x, FLOOR - f.h - 640 * f.d.K / .44); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = '60px sans-serif'; c.textAlign = 'center'; c.fillText(BONUS[b.k].ico, ix, Math.max(215, iy) - 8 * Math.sin(t * 5)); c.restore() }
  // bandeau du bonus qui vient d'être pris
  const a = G.bonusAff; if (a) { const u = (t - a.t0) / 2.2; if (u > 1) G.bonusAff = null; else { const k = Math.min(1, u * 6), s = 1 + .25 * Math.sin(Math.min(1, u * 4) * Math.PI);
    const [sx] = versEcran(c, a.x, 0), x = Math.max(430, Math.min(W - 430, sx));
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(1, (1 - u) * 4); c.translate(x, 330 - 30 * k); c.scale(s, s); c.font = '120px sans-serif'; c.textAlign = 'center'; c.fillText(a.ico, 0, 0); c.restore();
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(1, (1 - u) * 4); txt(c, a.nom, x, 420 - 30 * k, 62, a.col, { out: 14 }); c.restore() } }
  if (G.flashEcran > 0) { G.flashEcran--; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,255,230,${G.flashEcran / 14})`; c.fillRect(0, 0, W, H); c.restore() }
}
// ---------------------------------------------------------------------
//  TROPHÉES (les anciens badges + beaucoup de nouveaux, rangés par famille ; certains sont secrets)
//  [id, nom, comment l'obtenir, famille, indice si secret]
// ---------------------------------------------------------------------
const FAMILLES = [['combat', '🥊 COMBAT'], ['animaux', '🐾 ANIMAUX ET ARÈNES'], ['livre', '📖 LE LIVRE'], ['amis', '🤝 DÉFIS ET COPAINS'], ['surprises', '🎁 SURPRISES'], ['secrets', '🔒 TROPHÉES SECRETS']];
const FAMILLE_DE = { premiere: 'combat', combo: 'combat', mur: 'combat', super: 'combat', parfait: 'combat', costaud: 'combat', champion: 'combat', explo: 'animaux', secret: 'livre', lecteur: 'livre', livre: 'livre', duo: 'amis', cartes: 'livre', toutes: 'livre' };
const NOUVEAUX_TROPHEES = [
  ['v10', 'DIX VICTOIRES', 'Gagne 10 combats contre l’ordi.', 'combat'],
  ['v50', 'CINQUANTE VICTOIRES', 'Gagne 50 combats contre l’ordi.', 'combat'],
  ['v100', 'CENT VICTOIRES !', 'Gagne 100 combats contre l’ordi.', 'combat'],
  ['serie3', 'EN FEU !', 'Gagne 3 combats d’affilée contre l’ordi.', 'combat'],
  ['serie10', 'INARRÊTABLE', 'Gagne 10 combats d’affilée contre l’ordi.', 'combat'],
  ['eclair', 'PLUS RAPIDE QUE L’ÉCLAIR', 'Gagne un combat en moins de 40 secondes.', 'combat'],
  ['fil', 'SUR LE FIL', 'Gagne une manche avec presque plus de vie.', 'combat'],
  ['retour', 'LE GRAND RETOUR', 'Perds la 1re manche… puis gagne le combat.', 'combat'],
  ['voltige', 'ROI DE LA VOLTIGE', 'Réussis 10 projections (tout près, → B).', 'combat'],
  ['antiair', 'PAS DANS LES AIRS !', 'Touche 5 fois un adversaire en plein saut.', 'combat'],
  ['etourdi', 'TOUT ÉTOURDI', 'Fais voir des étoiles à ton adversaire.', 'combat'],
  ['finsuper', 'FINAL EN BEAUTÉ', 'Gagne une manche avec ton SUPER.', 'combat'],
  ['pieds', 'LES PIEDS SUR TERRE', 'Gagne un combat sans jamais sauter.', 'combat'],
  ['speciaux', 'CENT COUPS SPÉCIAUX', 'Touche 100 fois avec tes coups spéciaux (★).', 'combat'],
  ['zoo', 'GARDIEN DU ZOO', 'Gagne avec 10 animaux différents.', 'animaux'],
  ['famille', 'LA GRANDE FAMILLE', 'Gagne avec 20 animaux différents.', 'animaux'],
  ['mer1', 'PREMIÈRE PLONGÉE', 'Gagne un combat dans la MER.', 'animaux'],
  ['roimer', 'ROI DES OCÉANS', 'Gagne avec tous les animaux de la MER.', 'animaux'],
  ['roiterre', 'ROI DE LA TERRE', 'Gagne avec tous les animaux de la TERRE.', 'animaux'],
  ['arenes8', 'GLOBE-TROTTEUR', 'Gagne dans 8 arènes différentes.', 'animaux'],
  ['arenes', 'LE TOUR DU MONDE', 'Gagne dans toutes les arènes.', 'animaux'],
  ['etoiles30', 'PLUIE D’ÉTOILES', 'Gagne 30 étoiles en tout.', 'animaux'],
  ['petit', 'PETIT MAIS COSTAUD', 'Gagne avec un petit animal contre un géant.', 'animaux'],
  ['miroir', 'MIROIR, MIROIR', 'Gagne contre le même animal que le tien.', 'animaux'],
  ['trex', 'LE LÉGENDAIRE', 'Débloque le T. rex.', 'animaux'],
  ['megalo', 'LE MONSTRE DES PROFONDEURS', 'Débloque le mégalodon.', 'animaux'],
  ['pari1', 'BON PARI', 'Trouve la vraie réponse d’un Duel du livre.', 'livre'],
  ['pari5', 'PLUS MALIN QUE GIGI', 'Trouve la vraie réponse de 5 Duels du livre.', 'livre'],
  ['duels', 'TOUS LES DUELS', 'Joue tous les Duels du livre.', 'livre'],
  ['boss', 'CHASSEUR DE BOSS', 'Gagne les 3 Duels de boss du livre.', 'livre'],
  ['cartes50', 'CINQUANTE CARTES', 'Gagne 50 cartes « Le savais-tu ? ».', 'livre'],
  ['jour', 'DÉFI DU JOUR', 'Réussis un défi du jour.', 'amis'],
  ['jour5', 'FIDÈLE AU POSTE', 'Réussis 5 défis du jour.', 'amis'],
  ['defi', 'DÉFI RELEVÉ', 'Fais mieux qu’un copain dans un défi.', 'amis'],
  ['enligne', 'EN LIGNE !', 'Joue un combat en ligne avec un ami.', 'amis'],
  ['caisse1', 'SURPRISE !', 'Attrape ta première caisse surprise.', 'surprises'],
  ['caisse25', 'CHASSEUR DE SURPRISES', 'Attrape 25 caisses surprises.', 'surprises'],
  ['banane', 'GLISSADE !', 'Fais glisser ton adversaire sur une peau de banane.', 'surprises'],
  ['geant', 'GÉANT !', 'Deviens géant grâce à une caisse surprise.', 'surprises'],
  ['piment', 'ÇA ARRACHE !', 'Gagne une manche avec le piment.', 'surprises'],
  ['piege', 'PAS DE CHANCE !', 'Ton adversaire se fait avoir par un piège de l’arène.', 'surprises'],
  ['pelote', 'PELOTE D’ÉPINGLES', 'Plante 10 piquants en un seul combat.', 'secrets', 'Un animal très piquant…'],
  ['pschiit', 'NEZ BOUCHÉ', 'Enfume ton adversaire 3 fois en un combat.', 'secrets', 'Ça sent très mauvais…'],
  ['boing', 'BOING !', 'Fonce… dans le mur.', 'secrets', 'Il fonce sans réfléchir…'],
  ['air', 'DE L’AIR !', 'Remonte respirer 3 fois en un combat.', 'secrets', 'Une géante noire et blanche…'],
  ['rire', 'FOU RIRE', 'Vide la jauge SUPER de ton adversaire en riant.', 'secrets', 'Hi hi hi…'],
  ['radar', 'JE T’AI SENTI !', 'Contre une attaque avec le radar.', 'secrets', 'Un museau qui sent tout…'],
  ['encre', 'PLEIN D’ENCRE', 'Touche ton adversaire avec un nuage d’encre.', 'secrets', 'Huit bras…'],
  ['coincee', 'ÉPÉE COINCÉE', 'Fonce dans le mur avec une épée sur le nez.', 'secrets', 'Un grand nez pointu…'],
  ['nul', 'MATCH NUL', 'Termine un combat sans gagnant.', 'secrets', 'Ni gagnant, ni perdant…'],
  ['temps', 'TIC-TAC', 'Gagne une manche au temps.', 'secrets', 'Regarde bien le chrono…'],
  ['gigi', 'COMME GIGI…', 'Fais le même pari que Gigi dans un Duel du livre.', 'secrets', 'Écoute Gigi…'],
];
for (const t of NOUVEAUX_TROPHEES) { if (!BADGES.find(b => b[0] === t[0])) BADGES.push([t[0], t[1], t[2]]); FAMILLE_DE[t[0]] = t[3] }
const INDICE = Object.fromEntries(NOUVEAUX_TROPHEES.filter(t => t[4]).map(t => [t[0], t[4]]));
// récompenses : tous les 10 trophées, une surprise se débloque
const RECOMPENSES = [
  [10, 'dore', '✨ TENUES DORÉES', 'Ton animal peut briller en or (bouton ✨ sur l’écran de choix).'],
  [15, 'epave', '⚓ ARÈNE SECRÈTE DE LA MER : L’ÉPAVE AU TRÉSOR', 'Un vieux bateau coulé… et une pièce d’or à attraper !'],
  [20, 'lune', '🌙 ARÈNE SECRÈTE : LA LUNE', 'On y saute très haut !'],
  [30, 'arcenciel', '🌈 TENUES ARC-EN-CIEL', 'Ton animal change de couleur en combattant.'],
  [40, 'prehisto', '🦕 ARÈNE SECRÈTE : L’ÎLE PRÉHISTORIQUE', 'Là où vivaient les géants d’autrefois.'],
];
const nbTrophees = () => Object.keys(SAVE.badges).filter(id => BADGES.find(b => b[0] === id)).length;
function recompense(k) { const r = RECOMPENSES.find(x => x[1] === k); return !!r && nbTrophees() >= r[0] } // (fonction : visible par game.js via window.recompense)
const aCompter = f => f && !f.cpu && !f.distant && !G.god && !G.tuto;
// un trophée gagné en plein combat : un bandeau descend en haut de l'écran
function trophee(id, f) {
  if (f !== true && !aCompter(f)) return; if (SAVE.badges[id] || !BADGES.find(b => b[0] === id)) return;
  const avant = nbTrophees(); SAVE.badges[id] = Date.now(); sauve(); (G.nvTroph = G.nvTroph || []).push(id);
  const r = RECOMPENSES.find(x => avant < x[0] && nbTrophees() >= x[0]);
  bandeau('🏆 TROPHÉE : ' + BADGES.find(b => b[0] === id)[1]); if (r) setTimeout(() => bandeau('🎁 ' + r[2] + ' !', true), 2600);
}
const BANDEAUX = [];
function bandeau(t, gros) {
  let e = document.getElementById('bandeau-troph');
  if (!e) { e = document.createElement('div'); e.id = 'bandeau-troph'; document.body.appendChild(e) }
  BANDEAUX.push([t, gros]); if (BANDEAUX.length === 1) suivant();
  function suivant() { const [tx, g] = BANDEAUX[0]; e.textContent = tx; e.className = g ? 'gros' : ''; void e.offsetWidth; e.classList.add('vu'); sfx('badge', .9);
    setTimeout(() => { e.classList.remove('vu'); setTimeout(() => { BANDEAUX.shift(); if (BANDEAUX.length) suivant() }, 420) }, 2300) }
}
// statistiques du combat en cours (remises à zéro au début du match)
function statCombat(f, k, n = 1) { if (!aCompter(f)) return; f.st[k] = (f.st[k] || 0) + n;
  if (k === 'piquants' && f.st.piquants >= 10) trophee('pelote', f);
  if (k === 'pschiit' && f.st.pschiit >= 3) trophee('pschiit', f);
  if (k === 'air' && f.st.air >= 3) trophee('air', f);
  if (k === 'proj') { SAVE.compte = SAVE.compte || {}; SAVE.compte.proj = (SAVE.compte.proj || 0) + n; if (SAVE.compte.proj >= 10) trophee('voltige', f) }
  if (k === 'aa') { SAVE.compte = SAVE.compte || {}; SAVE.compte.aa = (SAVE.compte.aa || 0) + n; if (SAVE.compte.aa >= 5) trophee('antiair', f) }
  if (k === 'spe') { SAVE.compte = SAVE.compte || {}; SAVE.compte.spe = (SAVE.compte.spe || 0) + n; if (SAVE.compte.spe >= 100) trophee('speciaux', f) }
}
// fin d'une manche : quelques trophées se jouent là
function tropheesManche(v, l) {
  if (!v || !aCompter(v)) return;
  if (v.hp / v.d.hp < .1) trophee('fil', v);
  if (G.timeUp) trophee('temps', v);
  if (v.boost && v.boost.k === 'piment') trophee('piment', v);
  if (v.dernierSuper) trophee('finsuper', v);
}
// fin du combat
function tropheesFin(v, l, n, nv) {
  const aj = id => { if (!SAVE.badges[id] && BADGES.find(b => b[0] === id)) { SAVE.badges[id] = Date.now(); nv.push(id) } };
  for (const id of G.nvTroph || []) if (!nv.includes(id)) nv.push(id); G.nvTroph = [];
  if (G.god || G.tuto) return;
  const humainGagne = v && !v.cpu && !v.distant, contreOrdi = G.mode === 1 && !NET.on;
  if (!v) aj('nul');
  if (NET.on) aj('enligne');
  SAVE.compte = SAVE.compte || {};
  if (contreOrdi) { if (humainGagne) { SAVE.compte.vict = (SAVE.compte.vict || 0) + 1; SAVE.compte.serie = (SAVE.compte.serie || 0) + 1 } else SAVE.compte.serie = 0;
    const c = SAVE.compte; if (c.vict >= 10) aj('v10'); if (c.vict >= 50) aj('v50'); if (c.vict >= 100) aj('v100'); if (c.serie >= 3) aj('serie3'); if (c.serie >= 10) aj('serie10') }
  if (humainGagne) {
    if ((G.chrono || 0) < 40 * 60) aj('eclair');
    if (v.perdu1) aj('retour');
    if (!v.st.sauts) aj('pieds');
    if (l && l.kind === v.kind) aj('miroir');
    if (l && CHARS[v.kind].K <= .36 && CHARS[l.kind].K >= .45) aj('petit');
    if (estMer()) aj('mer1');
    SAVE.arenesGagnees = SAVE.arenesGagnees || {}; SAVE.arenesGagnees[G.arene] = 1;
    const na = Object.keys(SAVE.arenesGagnees).length; if (na >= 8) aj('arenes8'); if (ARENES.every(a => SAVE.arenesGagnees[a.k] || a.secret)) aj('arenes');
  }
  const g = SAVE.gagneAvec || {}, ng = Object.keys(g).length; if (ng >= 10) aj('zoo'); if (ng >= 20) aj('famille');
  const terre = ORDRE.filter(k => mondeDe(k) === 'terre' && k !== MONDES.terre.legende), mer = ORDRE.filter(k => mondeDe(k) === 'mer' && k !== MONDES.mer.legende);
  if (terre.every(k => g[k])) aj('roiterre'); if (mer.length && mer.every(k => g[k])) aj('roimer');
  if (Object.values(SAVE.etoiles).reduce((s, x) => s + x, 0) >= 30) aj('etoiles30');
  if (SAVE.debloques.includes('trex')) aj('trex'); if (SAVE.debloques.includes('megalo')) aj('megalo');
  if (nbCartes() >= 50) aj('cartes50');
  sauve();
}
// salle des trophées : par famille, avec le compteur et les récompenses (les secrets restent cachés, avec un indice)
function htmlTrophees() {
  const n = nbTrophees(), tot = BADGES.length;
  const prochaine = RECOMPENSES.find(r => n < r[0]);
  let h = `<div class="troph-tete"><b>🏆 ${n} / ${tot} TROPHÉES</b>${prochaine ? `<small>Encore ${prochaine[0] - n} trophée${prochaine[0] - n > 1 ? 's' : ''} pour débloquer : ${prochaine[2]}</small>` : '<small>Tu as débloqué toutes les récompenses. Champion !</small>'}</div>`;
  h += `<div class="troph-recomp">${RECOMPENSES.map(([s, k, nom, txt]) => `<div class="${n >= s ? 'ok' : ''}"><b>${n >= s ? nom : '🔒 ' + s + ' TROPHÉES'}</b><small>${n >= s ? txt : '???'}</small></div>`).join('')}</div>`;
  for (const [fam, titre] of FAMILLES) {
    const l = BADGES.filter(b => (FAMILLE_DE[b[0]] || 'combat') === fam); if (!l.length) continue;
    const eu = l.filter(b => SAVE.badges[b[0]]).length;
    h += `<h3 class="troph-fam">${titre} <small>${eu} / ${l.length}</small></h3><div class="troph-grille">` + l.map(([id, nom, txt]) => { const ok = SAVE.badges[id], sec = fam === 'secrets' && !ok;
      return `<div class="badge${ok ? ' ok' : ''}${sec ? ' secret' : ''}"><i>${ok ? '🏆' : sec ? '❓' : '★'}</i><b>${sec ? '???' : nom}</b><small>${sec ? 'Indice : ' + (INDICE[id] || '…') : txt}</small></div>` }).join('') + '</div>';
  }
  return h;
}
// réglage (espace parents) + pages de test : pas de surprises, pour que les mesures restent comparables
(function () {
  if (/test\.html$/.test(location.pathname)) G.sansSurprise = true;
  const b = document.getElementById('opt-surprises'); if (!b) return;
  const maj = () => { const on = (SAVE.opt || {}).surprises !== false; b.textContent = on ? 'OUI ✔' : 'NON'; b.setAttribute('aria-pressed', on) };
  b.onclick = () => { SAVE.opt = SAVE.opt || {}; SAVE.opt.surprises = SAVE.opt.surprises === false; sauve(); sfx('clic'); maj() }; maj();
})();
// ---------------------------------------------------------------------
//  Tenues (récompenses de trophées) : dorée, arc-en-ciel — pour ses propres animaux
// ---------------------------------------------------------------------
const TENUES = [['', '🎨 NORMAL'], ['dore', '✨ DORÉ'], ['arcenciel', '🌈 ARC-EN-CIEL']];
function majTenueBtn() { const b = document.getElementById('tenue-btn'); if (!b) return;
  const dispo = TENUES.filter(t => !t[0] || recompense(t[0])); b.hidden = dispo.length < 2;
  if (SAVE.tenue && !recompense(SAVE.tenue)) SAVE.tenue = ''; b.textContent = (TENUES.find(t => t[0] === (SAVE.tenue || '')) || TENUES[0])[1] }
function teinteTenue(f) {
  if (f.cpu || f.distant) return null; const t = SAVE.tenue; if (!t || !recompense(t)) return null;
  if (t === 'dore') return [1.32, 1.02, .36, .52 + .06 * Math.sin(G.time * 4)];
  const h = (G.time * .3 + f.side * .5) % 1, k = i => { const x = (h * 6 + i) % 6; return Math.max(0, Math.min(1, Math.abs(x - 3) - 1)) };
  return [k(0) * 1.3 + .1, k(4) * 1.3 + .1, k(2) * 1.3 + .1, .42];
}
(function () {
  const b = document.getElementById('tenue-btn'); if (b) b.onclick = () => { const dispo = TENUES.filter(t => !t[0] || recompense(t[0])), i = dispo.findIndex(t => t[0] === (SAVE.tenue || ''));
    SAVE.tenue = dispo[(i + 1) % dispo.length][0]; sauve(); sfx('clic'); majTenueBtn() };
  const cc = window.construitCartes; if (cc) window.construitCartes = construitCartes = function () { const r = cc.apply(this, arguments); majTenueBtn(); return r };
})();
