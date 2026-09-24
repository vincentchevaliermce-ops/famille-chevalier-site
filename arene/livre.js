// =====================================================================
//  DUELS DU LIVRE — comme dans « C'est qui le plus fort ? » :
//  1. tu paries (contre Gigi), 2. tu te bats avec ton champion, 3. tu découvres la vraie réponse.
//  Textes repris MOT POUR MOT du livre imprimé (TEXTE_IMPRIME_V16, 24/09) : page du duel (p) et page de la réponse (pv).
//  Contrôle : python3 verif/sync_livre.py TEXTE_IMPRIME_V16_74P.md
// =====================================================================
const DUELS = [
  { n: 3, lieu: 'AFRIQUE CONTRE ASIE', q: 'LION OU TIGRE ?', a: 'lion', b: 'tigre', noms: ['LION', 'TIGRE DU BENGALE'], arene: 'colisee', p: 9, pv: 10,
    intro: 'La crinière contre les rayures. Dans la nature, ils ne se croisent plus. Mais face à face… un contre un, qui gagne ?',
    fiches: [['environ 190 kg', 'des crocs de 7 cm', 'il étouffe sa proie', 'sa crinière lui donne chaud'], ['environ 220 kg', 'des griffes de 10 cm', 'il attaque par surprise', 'il évite les bagarres']],
    gigi: { pari: 'lion', dit: 'Le lion.', pourquoi: 'C’est le roi, c’est écrit partout !', apres: '« Le roi », c’était écrit partout. Sauf ici !' },
    rep: { g: 'tigre', titre: 'L’AVIS DES EXPERTS', cri: 'LE TIGRE !', punch: 'Tout seul, le roi perd sa couronne !', tampon: 'bleu', label: 'JAMAIS VU DANS LA NATURE',
      film: 'Le tigre pèse environ 30 kg de plus que le lion. Selon un expert, le tigre va droit à la gorge. Le lion, lui, cogne et joue avec l’adversaire. Mais attention… Un lion vient rarement seul : à deux ou trois, les lions battraient le tigre.' } },
  { n: 5, lieu: 'RIVIÈRE', q: 'HIPPOPOTAME OU CROCODILE DU NIL ?', a: 'hippo', b: 'croco', noms: ['HIPPOPOTAME', 'CROCODILE DU NIL'], arene: 'riviere', p: 13, pv: 14,
    intro: 'Même rivière, même boue, même mauvais caractère. L’hippo broute l’herbe. Le croco est un tueur à la mâchoire d’acier. Alors, qui commande dans l’eau ?',
    fiches: [['jusqu’à 3 200 kg', 'des crocs géants', 'il charge gueule ouverte', 'sa peau craque au soleil'], ['jusqu’à 750 kg', 'une morsure qui serre fort', 'il attaque caché sous l’eau', 'un élastique lui ferme la gueule']],
    gigi: { pari: 'hippo', dit: 'L’hippo.', pourquoi: 'Plus grande bouche = plus fort. Logique.', apres: 'Logique de Gigi : 1. Reste du monde : 0.' },
    rep: { g: 'hippo', titre: 'LA VRAIE RÉPONSE', cri: 'L’HIPPOPOTAME !', punch: 'Trois tonnes de mauvaise humeur.', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Un crocodile s’approche d’un bébé hippopotame. Aussitôt, tout le troupeau se serre autour du petit. Pour s’échapper, le crocodile grimpe… sur le dos des hippopotames ! Mordu plusieurs fois, il disparaît sous l’eau.' } },
  { n: 6, lieu: 'GRAND NORD', q: 'OURS POLAIRE OU GRIZZLY ?', a: 'ours', b: 'grizzly', noms: ['OURS POLAIRE', 'GRIZZLY'], arene: 'banquise', p: 15, pv: 16,
    intro: 'Sur une plage d’Alaska, des restes de baleine : un festin. Des ours polaires énormes sont déjà à table. Arrive un grizzly, un ours brun, tout seul. Qui mange ?',
    fiches: [['de 350 à 545 kg', 'des griffes en crochet', 'un coup de patte de géant', 'il a vite trop chaud en courant'], ['environ 180 kg', 'des griffes de 6 cm', 'il attrape les saumons au vol', 'deux à trois fois plus léger']],
    gigi: { pari: 'ours', dit: 'L’ours polaire.', pourquoi: 'Il est assorti à la neige : trop la classe.', apres: 'La classe ne suffit pas ? Personne ne m’avait prévenu.' },
    rep: { g: 'grizzly', titre: 'LA VRAIE RÉPONSE', cri: 'LE GRIZZLY !', punch: 'Le plus petit fait la loi !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Une quinzaine d’ours polaires se régalent sur la plage. Un grizzly arrive, tranquille. À côté d’eux, il a l’air bien plus petit. Ce jour-là, sans même grogner, il fait filer tous les ours polaires, sauf un !' } },
  { n: 8, lieu: 'SAVANE', q: 'LION OU RATEL ?', a: 'lion', b: 'ratel', noms: ['LION', 'RATEL'], arene: 'desert', p: 19, pv: 20,
    intro: 'Sur Internet, des vidéos montrent le ratel, une sorte de blaireau d’Afrique, tenir tête à des lions. 13 kilos de rage contre 190 ! Des chercheurs sont allés vérifier. Alors, qui gagne ?',
    fiches: [['environ 190 kg', 'des crocs de 7 cm', 'il plaque sa proie au sol', 'il chasse mal en plein jour'], ['jusqu’à 13 kg', 'de longues griffes', 'la bombe puante', 'surpris, il fonce sans réfléchir']],
    gigi: { pari: 'ratel', dit: 'Le ratel !', pourquoi: 'J’ai vu la vidéo : il est INVINCIBLE.', apres: 'Internet m’a menti. Je suis très déçu.' },
    rep: { g: 'lion', titre: 'LA VRAIE RÉPONSE', cri: 'LE LION !', punch: 'Courageux, oui. Invincible, non.', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Dans le désert du Kalahari, des lions et des léopards ont tué des ratels, adultes comme petits. Son vrai talent ? Il ne gagne pas : il dégoûte. Il mord, il pue… et parfois, le fauve laisse tomber !' } },
  { n: 10, boss: 1, lieu: 'ÎLE DE KOMODO', q: 'DRAGON DE KOMODO OU BUFFLE ?', a: 'komodo', b: 'buffle', noms: ['DRAGON DE KOMODO', 'BUFFLE D’EAU'], arene: 'jungle', p: 23, pv: 24,
    intro: 'Voici le plus gros lézard du monde : trois mètres de long. Il attaque un buffle sept fois plus lourd que lui. Qui gagne, ce jour-là ?',
    fiches: [['environ 80 kg', '60 dents coupantes', 'une morsure à venin', 'il entend très mal'], ['jusqu’à 550 kg', 'de grandes cornes', 'il charge tête baissée', 'ses blessures guérissent mal']],
    gigi: { pari: 'komodo', dit: 'Le dragon.', pourquoi: 'C’est un DRAGON. Je rappelle.', apres: 'Un DRAGON battu par une vache. Je ne crois plus aux dragons.' },
    rep: { g: 'buffle', titre: 'LA VRAIE RÉPONSE', cri: 'LE BUFFLE !', punch: 'Mordu, mais pas vaincu !', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Le dragon mord une patte du buffle et tire de toutes ses forces. Le buffle se secoue, se dégage et repart. C’est ce qui arrive le plus souvent !' } },
  { n: 13, lieu: 'BANQUISE', q: 'OURS POLAIRE OU MORSE ?', a: 'ours', b: 'morse', noms: ['OURS POLAIRE', 'MORSE'], arene: 'banquise', p: 31, pv: 32,
    intro: 'Le roi de la banquise sent un phoque à plus d’un kilomètre, même caché sous la neige. Aujourd’hui, il a trouvé mieux : une plage couverte de morses. Les gros mâles dépassent une tonne. Qui gagne ?',
    fiches: [['jusqu’à 545 kg', 'des griffes en crochet', 'il fait paniquer le troupeau', 'l’été, sans banquise, il a faim'], ['jusqu’à 1 500 kg', 'des défenses de 90 cm', 'il frappe avec ses défenses', 'affolé, le troupeau écrase ses petits']],
    gigi: { pari: 'ours', dit: 'L’ours.', pourquoi: 'Le morse, c’est un canapé à moustaches.', apres: 'Un canapé d’une tonne et demie, avec des épées.' },
    rep: { g: 'morse', titre: 'LA VRAIE RÉPONSE', cri: 'LE MORSE !', punch: 'Pas touche au troupeau !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'L’ours fonce sur le troupeau de morses pour lui faire peur. Les adultes font face, défenses en avant. L’ours freine. 23 sur 25 attaques d’ours contre des morses ont raté.' } },
  { n: 18, lieu: 'SAVANE', q: 'HYÈNE OU LION ?', a: 'hyene', b: 'lion', noms: ['HYÈNE TACHETÉE', 'LION'], arene: 'savane', p: 41, pv: 42,
    intro: 'Ce soir, une hyène et un lion mâle veulent la même carcasse. Qui vole le repas de l’autre ?',
    fiches: [['environ 60 kg', 'des mâchoires casse-os', 'elle fatigue ses proies', 'son vacarme attire les voleurs'], ['environ 190 kg', 'des crocs de 7 cm', 'un coup de patte mortel', 'un cœur tout petit pour sa taille']],
    gigi: { pari: 'lion', dit: 'Le lion.', pourquoi: 'La hyène rigole, mais elle va moins rigoler.', apres: 'J’AVAIS BON ! Pourquoi tu as l’air surpris ?' },
    rep: { g: 'lion', titre: 'LA VRAIE RÉPONSE', cri: 'LE LION !', punch: 'Rira bien qui rira le dernier.', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Une hyène seule n’a aucune chance : un coup de patte peut la tuer. Nombreuses, elles volent le repas des lionnes. Mais avec un lion mâle, c’est perdu d’avance.' } },
  { n: 24, lieu: 'FORÊT RUSSE', q: 'OURSE BRUNE OU TIGRE DE SIBÉRIE ?', a: 'grizzly', b: 'tigre', noms: ['OURSE BRUNE', 'TIGRE DE SIBÉRIE'], arene: 'banquise', p: 55, pv: 56,
    intro: 'Dans les forêts glacées de Russie, un tigre de 206 kg croise une grande ourse brune, presque aussi lourde que lui. Qui mange l’autre ?',
    fiches: [['presque 200 kg', 'des griffes de 6 cm', 'un coup de patte énorme', 'un peu plus légère que lui'], ['Dima : 206 kg', 'des griffes de 10 cm', 'il mord la nuque', 'un gros ours lui vole ses proies']],
    gigi: { pari: 'tigre', dit: 'Pile, le tigre.', pourquoi: 'Face, l’ourse… Pile !', apres: 'Ma pièce ne se trompe jamais. Je la garde.' },
    rep: { g: 'tigre', titre: 'CE QUE DISENT LES INDICES', cri: 'LE TIGRE !', punch: 'Un bond, une morsure : l’ourse n’a rien vu venir.', tampon: 'bleu', label: 'D’APRÈS LES INDICES',
      film: 'Des chercheurs suivent Dima, un tigre de 206 kg, grâce à son collier GPS. Ils trouvent les restes d’une grande ourse. Les traces le disent : Dima a bondi du haut d’une petite pente.' } },
  { n: 30, boss: 3, lieu: 'FINALE', q: 'TIGRE OU GORILLE ?', a: 'tigre', b: 'gorille', noms: ['TIGRE DE SIBÉRIE', 'GORILLE'], arene: 'colisee', p: 67, pv: 68,
    intro: 'Ce duel de rêve n’a jamais eu lieu : le tigre vit en Asie, le gorille en Afrique. On a enquêté, round par round. Qui gagnerait ?',
    fiches: [['environ 175 kg', 'les plus longs crocs des félins', 'la morsure à la gorge', 'à la chasse, il rate 9 fois sur 10'], ['environ 160 kg', 'de longues canines', 'il charge en hurlant', 'il ne chasse jamais']],
    gigi: { pari: 'gorille', dit: 'Le gorille !', pourquoi: 'Tu as vu ses bras ?', apres: '2 rounds à 1 ?! L’arbitre était un tigre, c’est sûr !' },
    rep: { g: 'tigre', titre: 'NOTRE VERDICT', cri: 'LE TIGRE !', punch: 'Crocs 2, biceps 1… et ça se discute !', tampon: 'violet', label: 'DUEL IMAGINÉ',
      film: 'Round 1, la surprise : tigre. Round 2, la charge : gorille. Round 3, le chasseur : tigre. Le tigre tue pour vivre. Le gorille, lui, gagne ses disputes en faisant peur.' } },
];
const LIVRE_TOTAL = 30; // duels dans le livre
SAVE.livre = SAVE.livre || {};
const pret = k => !!CHARS[k] && ORDRE.includes(k);
const duelPret = D => pret(D.a) && pret(D.b);
const fait = D => !!SAVE.livre[D.n];
// un duel s'ouvre quand le précédent (disponible) est fait ; la finale attend tous les autres
function duelOuvert(D) {
  if (G.god) return duelPret(D);
  if (!duelPret(D)) return false;
  const dispo = DUELS.filter(duelPret);
  if (D.n === 30) return dispo.filter(x => x.n !== 30).every(fait);
  const i = dispo.indexOf(D); return i <= 0 || fait(dispo[i - 1]) || fait(D);
}
function scoreLivre() {
  let toi = 0, gigi = 0, etoiles = 0;
  for (const D of DUELS) { const r = SAVE.livre[D.n]; if (!r) continue; if (r.bon) { toi++; if (D.boss) etoiles++ } if (D.gigi.pari === D.rep.g) gigi++ }
  return { toi, gigi, etoiles };
}
const nomDuel = (D, k) => D.noms[k === D.a ? 0 : 1];
// --- écran 1 : la liste des duels
function ouvreLivre() {
  sonInit(); G.phase = 'menu'; G.livre = null; show('livre');
  const s = scoreLivre(), box = $('duels-liste'); box.innerHTML = '';
  $('livre-score').innerHTML = `<span>TOI <b>${s.toi}</b></span><img src="gigi/duel_03_recto.svg" alt=""><span>GIGI <b>${s.gigi}</b></span>` + (s.etoiles ? `<span class="boss-et">${'★'.repeat(s.etoiles)}</span>` : '');
  for (const D of DUELS) {
    const b = document.createElement('button'); b.type = 'button'; const ok = duelOuvert(D), r = SAVE.livre[D.n];
    b.className = 'duel' + (D.boss ? ' boss' : '') + (ok ? '' : ' ferme') + (r ? ' fait' : '') + (!duelPret(D) ? ' bientot' : '');
    const tete = k => pret(k) ? `<img src="${k}_tete.webp" alt="">` : '<i>?</i>';
    b.innerHTML = `<span class="num R">${String(D.n).padStart(2, '0')}</span><span class="tetes">${tete(D.a)}<em class="R">VS</em>${tete(D.b)}</span>` +
      `<span class="q R">${D.q.replace(' ?', '')}</span>` +
      `<span class="etat${r && !r.bon ? ' rate' : ''}">${!duelPret(D) ? 'BIENTÔT' : !ok ? (D.n === 30 ? '🔒 APRÈS LES AUTRES' : '🔒') : r ? (r.bon ? '✔ BON PARI' : '✘ RATÉ') + (r.etoiles ? ' · ' + '★'.repeat(r.etoiles) : '') : D.boss ? 'DUEL DE BOSS !' : 'À TOI DE PARIER !'}</span>`;
    b.onclick = () => { if (!ok) { sfx('erreur'); if (!duelPret(D)) montreMsg('livre-msg', 'Cet animal arrive bientôt dans l’arène !'); else montreMsg('livre-msg', D.n === 30 ? 'La grande finale ? Interdit d’y aller avant d’avoir fait les autres !' : 'Fais d’abord le duel d’avant !'); return } sfx('valide'); ouvrePari(D) };
    box.appendChild(b);
  }
  const reste = LIVRE_TOTAL - DUELS.length;
  $('livre-msg').textContent = `Dans le livre, il y a ${LIVRE_TOTAL} duels. Les ${reste} autres t’attendent entre ses pages !`;
}
function montreMsg(id, t) { const e = $(id); e.textContent = t; e.classList.remove('secoue'); void e.offsetWidth; e.classList.add('secoue') }
// --- écran 2 : le pari (comme la page de gauche du livre)
function ouvrePari(D, rejoue) {
  G.phase = 'menu'; show('pari'); G.livre = { D, rejoue: !!rejoue || fait(D), pari: null, choixCombat: false };
  $('pari-num').textContent = `DUEL ${String(D.n).padStart(2, '0')} / ${LIVRE_TOTAL} · ${D.lieu}` + (D.boss ? ` · DUEL DE BOSS ${D.boss} / 3` : '');
  $('pari-q').textContent = D.q;
  $('pari-gigi-img').src = `gigi/duel_${String(D.n).padStart(2, '0')}_recto.svg`;
  $('pari-gigi-dit').textContent = D.gigi.dit; $('pari-gigi-pourquoi').textContent = D.gigi.pourquoi;
  $('pari-intro').textContent = D.intro;
  for (const [i, k] of [[0, D.a], [1, D.b]]) {
    const f = D.fiches[i], el = $(i ? 'pari-b' : 'pari-a');
    el.className = 'fiche ' + k;
    el.innerHTML = `<span class="img"><img src="${k}_corps.webp" alt=""></span><b class="R">${D.noms[i]}</b>` +
      `<span class="l"><i>⚖</i>${f[0]}</span><span class="l"><i>⚔</i>${f[1]}</span><span class="l"><i>★</i>${f[2]}</span><span class="l"><i>⚠</i>${f[3]}</span>`;
    el.onclick = () => choisitPari(k);
  }
  $('pari-nul').hidden = !D.boss; $('pari-nul').onclick = () => choisitPari('nul');
  const r = SAVE.livre[D.n];
  $('pari-titre').textContent = rejoue || r ? `TON PARI ÉTAIT : ${r ? (r.pari === 'nul' ? 'MATCH NUL' : nomDuel(D, r.pari)) : '?'} · AVEC QUI TU TE BATS ?` : D.boss ? 'TON PARI DE BOSS : QUI GAGNE ? (OU MATCH NUL)' : 'TON PARI : QUI GAGNE ?';
  if (r) { $('pari-nul').hidden = true; G.livre.choixCombat = true }
}
function choisitPari(k) {
  const L = G.livre, D = L.D; sonInit();
  if (!L.choixCombat) {
    L.pari = k; sfx('valide');
    if (k === 'nul') { L.choixCombat = true; $('pari-nul').hidden = true; $('pari-titre').textContent = 'MATCH NUL ! ET TOI, AVEC QUI TU TE BATS ?'; return }
    lanceDuelLivre(k); return
  }
  if (k === 'nul') return;
  sfx('valide'); lanceDuelLivre(k);
}
function lanceDuelLivre(k) {
  const L = G.livre, D = L.D, adv = k === D.a ? D.b : D.a;
  L.moi = k; G.mode = 1; G.tournoi = null; G.pick = [k, adv]; G.arene = D.arene; G.areneHasard = false;
  L.noms = [nomDuel(D, k), nomDuel(D, adv)];
  sfx(k, .8); vs();
}
// --- écran 3 : la vraie réponse (comme la page de droite du livre)
function verdictLivre(v, etoilesCombat, nv) {
  const L = G.livre, D = L.D, R = D.rep, deja = SAVE.livre[D.n];
  const gagneArene = v && !v.cpu;
  // le pari ne compte qu'une fois (le premier), comme dans le livre
  let r = deja;
  if (!deja) { r = SAVE.livre[D.n] = { pari: L.pari, bon: L.pari === R.g, etoiles: gagneArene ? etoilesCombat : 0, date: Date.now() } }
  else if (gagneArene) r.etoiles = Math.max(r.etoiles || 0, etoilesCombat);
  sauve();
  G.phase = 'menu'; show('verdict');
  const moi = nomDuel(D, L.moi);
  $('v-arene').innerHTML = gagneArene ? `DANS L’ARÈNE, ${ton(moi)} A GAGNÉ ! <span class="et">${'★'.repeat(etoilesCombat)}</span>` : `DANS L’ARÈNE, ${ton(moi)} A PERDU…`;
  $('v-question').textContent = 'ET DANS LA VRAIE VIE ?';
  const carte = $('v-carte'); carte.classList.remove('tamponne'); carte.hidden = true;
  $('v-tampon').className = 'tampon ' + R.tampon; $('v-tampon').textContent = R.label;
  $('v-titre').textContent = R.titre; $('v-cri').textContent = R.cri; $('v-punch').textContent = R.punch; $('v-film').textContent = R.film;
  $('v-img').src = R.g + '_fin.webp';
  const pariTxt = r.pari === 'nul' ? 'MATCH NUL' : nomDuel(D, r.pari);
  $('v-toi').innerHTML = deja && L.rejoue ? `Ton pari (déjà compté) : <b>${pariTxt}</b> ${r.bon ? '✔' : '✘'}` : r.bon ? `Ton pari : <b>${pariTxt}</b> ✔ BON PARI ! +1 point${D.boss ? ' + 1 étoile de boss ★' : ''}` : `Ton pari : <b>${pariTxt}</b> ✘ raté… Ce n’est pas grave : dans la nature, le plus fort ne gagne pas à tous les coups !`;
  $('v-gigi-img').src = `gigi/duel_${String(D.n).padStart(2, '0')}_verso.svg`;
  $('v-gigi').innerHTML = `<b>GIGI</b> avait parié : ${D.gigi.dit} ${D.gigi.pari === R.g ? '✔' : '✘'}<br><i>${D.gigi.apres}</i>`;
  const s = scoreLivre(); $('v-score').innerHTML = `TOI <b>${s.toi}</b> · GIGI <b>${s.gigi}</b>`;
  $('v-page').textContent = `La suite de l’enquête est à la page ${D.pv} du livre !`;
  $('v-badges').innerHTML = (nv || []).map(id => `<span>NOUVEAU BADGE : ${BADGES.find(x => x[0] === id)[1]}</span>`).join('') + (G.finExtra || '');
  // bouton suivant : prochain duel ouvert, sinon la liste
  const suivant = DUELS.find(x => !fait(x) && duelOuvert(x));
  $('v-suite').textContent = suivant ? 'DUEL SUIVANT ▶' : 'MES DUELS ▶';
  $('v-suite').onclick = () => { sfx('valide'); suivant ? ouvrePari(suivant) : ouvreLivre() };
  $('v-rejouer').onclick = () => { sfx('clic'); ouvrePari(D, true) };
  // suspense : « ET DANS LA VRAIE VIE ? »… roulement… tampon !
  $('v-reste').hidden = true; sfx('tam', .6);
  let k = 0; const roule = setInterval(() => { if (G.screen !== 'verdict') { clearInterval(roule); return } sfx('tam', .4 + .05 * k); if (++k >= 6) clearInterval(roule) }, 180);
  setTimeout(() => { if (G.screen !== 'verdict') return; carte.hidden = false; void carte.offsetWidth; carte.classList.add('tamponne'); sfx('boum', .9); sfx(R.g, .9); acclameMenu() }, 1250);
  setTimeout(() => { if (G.screen !== 'verdict') return; $('v-reste').hidden = false; sfx(r.bon ? 'victoire' : 'defaite', .8); if (D.n === 30 && !deja) finaleFaite() }, 2100);
}
function acclameMenu() { sfx('foule', .5) }
// la grande finale jouée : le code secret du GOD MODE est révélé (voir bonus.js)
function finaleFaite() { if (window.revelerCodeGod) revelerCodeGod() }
