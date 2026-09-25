// =====================================================================
//   L'ARÈNE DES DUELS — jeu de combat : Tigre contre Gorille
// =====================================================================
const W = 1920, H = 1080, FLOOR = 950, STAGE_L = 170, STAGE_R = 1750;
const NV = '#0B2A5B', OR = '#FF5A1F', BL = '#1160D8', JA = '#FFC629', PA = '#FFF8EC', CY = '#12A4C4', VI = '#4a3296';
const $ = id => document.getElementById(id);
const bgC = $('bg'), glC = $('gl'), fxC = $('fx');
const bg = bgC.getContext('2d'), fx = fxC.getContext('2d');

// ---------------------------------------------------------------------
//  Données des combattants (boîtes en px image, x vers l'adversaire, y vers le haut négatif, 0 = sol)
// ---------------------------------------------------------------------
const CHARS = {
  // Chaque animal a sa façon de jouer (archétype), 3 coups spéciaux (★, → ★, ↓ ★), un SUPER, une balayette (↓ B) et une projection (tout près, → B).
  // ia = [distance min, max, poids] : où l'ordi aime utiliser le coup. aie = ce que l'animal crie quand il prend un gros coup.
  // --- TIGRE : le chasseur rapide (bonds, ruées, griffes vers le ciel)
  tigre: {
    nom: 'TIGRE', art: 'LE TIGRE', force: 1.096, col: OR, clair: '#FF8A4C', fond: '#FF8A4C', K: .44, hp: 102, walk: 7.2, back: 5.2, dash: 17, jumpV: 25, jumpX: 8.5, grav: 1.15, etour: 44,
    aie: ['MIAOU ?!', 'AÏE AÏE !', 'MES RAYURES !'], ia: { saut: 1.2, spe: 1.1 },
    hurt: { stand: [-300, 720, -800, 0], crouch: [-300, 740, -440, 0], air: [-300, 700, -700, 0] },
    push: [160, 290], // largeur arrière, avant (monde)
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [640, 980, -720, -360], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'VLAN !', 'SCRITCH !', 'GRIFFOUILLE !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [560, 960, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['SCRITCH !', 'PAF !', 'CHATOUILLE !'], son: 'l' },
      H: { st: 11, act: 5, rec: 17, dmg: 12, hs: 20, bs: 15, kb: 13, box: [560, 1020, -640, -20], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['BAM !', 'CRAC !', 'SPLAF !'], son: 'h' },
      cH: { st: 7, act: 4, rec: 20, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [540, 1010, -200, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !', 'OUPS, PAR TERRE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [300, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H', 'S'], mots: ['CROC !', 'GRRR !', 'MIAM !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !', 'CATAPULTÉ !'], son: 'h' },
      S: { st: 11, act: 99, rec: 18, dmg: 12, hs: 0, bs: 16, kb: 16, kd: true, box: [420, 980, -620, 0], lvl: 'mid', land: true, mots: ['ATTAQUE SURPRISE !', 'BOND DE 10 MÈTRES !', 'COUCOU !'], son: 's', nom: 'Attaque surprise', ia: [450, 1000, 1.2] },
      SF: { st: 8, act: 14, rec: 22, dmg: 10, hs: 20, bs: 14, kb: 12, kd: true, box: [300, 900, -560, 0], rush: 21, stopHit: true, lvl: 'mid', mots: ['RUÉE !', 'FIOUUU !', 'TROP RAPIDE !'], son: 's', nom: 'La ruée du chasseur', ia: [300, 820, 1] },
      SD: { st: 3, act: 99, rec: 26, dmg: 11, hs: 0, bs: 16, kb: 6, kd: true, lance: 20, aa: true, inv: 9, saute: [3, 21], land: true, box: [150, 700, -900, -200], lvl: 'mid', mots: ['GRIFFES AU CIEL !', 'SCRAAATCH !'], son: 's', nom: 'Griffes vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 44, rec: 20, dmg: 5, hits: 6, hs: 22, bs: 8, kb: 3, kd: true, box: [300, 1040, -700, 0], lvl: 'mid', mots: ['GRRR !', 'SCRITCH !', 'VLAN !', 'RAYÉ JUSQU’À LA PEAU !'], son: 'h', nom: 'Rugissement du roi' },
    },
  },
  // --- GORILLE : le colosse (coups blindés, prise du dos argenté, onde de choc)
  gorille: {
    nom: 'GORILLE', art: 'LE GORILLE', force: 1.052, spr: true, gardeBas: 'accroupi', col: BL, clair: '#4F8FF5', fond: '#3B86F0', K: .42, hp: 108, walk: 5.4, back: 4.2, dash: 14, jumpV: 22.5, jumpX: 7, grav: 1.2, etour: 52,
    aie: ['OUGH !', 'OUH OUH !', 'MÊME PAS MAL… AÏE !'], ia: { chope: 2 },
    hurt: { stand: [-560, 600, -960, 0], crouch: [-560, 620, -820, 0], air: [-400, 500, -900, 0], up: [-330, 400, -1080, 0] },
    push: [200, 280],
    moves: {
      L: { st: 5, act: 4, rec: 11, dmg: 6, hs: 15, bs: 11, kb: 6, box: [560, 1000, -730, -470], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['POK !', 'PAF !', 'BONK !'], son: 'l' },
      cL: { st: 6, act: 5, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [520, 980, -230, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['BLAM !', 'TOC !'], son: 'l' },
      H: { st: 17, act: 5, rec: 22, dmg: 13, hs: 21, bs: 16, kb: 12, box: [380, 900, -560, 0], lvl: 'mid', armor: true, quake: true, chain: ['S', 'SUPER'], mots: ['BOUM !', 'BADABOUM !', 'ÉCRABOUILLÉ !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 24, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [480, 1000, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 7, act: 99, rec: 10, dmg: 9, hs: 20, bs: 12, kb: 9, box: [60, 660, -420, 240], lvl: 'high', air: true, land: true, dive: 9, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['ÉCRABOUILLÉ !', 'BOUM !', 'PLAF !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 18, act: 26, rec: 20, dmg: 14, hs: 0, bs: 16, kb: 17, kd: true, box: [300, 800, -760, 0], lvl: 'mid', mots: ['CHARGE !', 'VLAM !', 'POUSSE-TOI !'], son: 's', nom: 'La charge en hurlant', ia: [380, 1000, 1] },
      SF: { st: 6, act: 5, rec: 30, dmg: 18, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 150, t: 30, degage: false, mot: 'LA PRISE DU DOS ARGENTÉ !', haut: 19, loin: 7, rec: 6 }, mots: ['BADABOUM !', 'TAMBOUR !'], son: 'h', nom: 'La prise du dos argenté', ia: [0, 520, 1.4] },
      SD: { st: 14, act: 12, rec: 22, dmg: 10, hs: 22, bs: 14, kb: 10, kd: true, lvl: 'low', quake: true, proj: { x0: 480, spd: 15, w: 150, h: [-240, 0], life: 76, sol: true }, mots: ['LA TERRE TREMBLE !', 'BOUM !'], son: 's', nom: 'Le coup de poing au sol', ia: [520, 1500, .9] },
      SUPER: { st: 16, act: 36, rec: 22, dmg: 7, hits: 4, hs: 22, bs: 8, kb: 6, kd: true, box: [300, 1100, -600, 0], lvl: 'low', quake: true, mots: ['BOUM !', 'BADABOUM !', 'TAM TAM !'], son: 'h', nom: 'Tambour de la jungle' },
    },
  },
  // --- GRIZZLY : le pêcheur (la patte à saumons envoie en l'air… et un saumon s'envole, charge, grognement qui fait fuir)
  grizzly: {
    nom: 'GRIZZLY', art: 'LE GRIZZLY', force: 1.165, spr: true, col: '#8B5A2B', clair: '#D9A36A', fond: '#A8703E', K: .42, hp: 110, walk: 5.9, back: 4.4, dash: 14, jumpV: 22, jumpX: 7, grav: 1.2, etour: 50,
    aie: ['GROAR ?!', 'MON SAUMON !', 'OUILLE LA TRUFFE !'], ia: {},
    hurt: { stand: [-640, 755, -880, 0], crouch: [-640, 760, -600, 0], air: [-500, 700, -760, 0] },
    push: [215, 280], reach: 690, speMin: 300, speMax: 1000,
    moves: {
      L: { st: 4, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 6, box: [600, 980, -780, -380], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'BAFFE !', 'GRIFFE !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [560, 950, -240, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['SCRITCH !', 'TOC !'], son: 'l' },
      H: { st: 13, act: 5, rec: 20, dmg: 13, hs: 21, bs: 16, kb: 12, box: [480, 1010, -700, -20], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['BAM !', 'GROSSE PATTE !', 'PATAPAF !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 23, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [520, 1010, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [300, 900, -400, 180], lvl: 'high', air: true, land: true, dive: 6, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['PLAF !', 'SPLOUTCH !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['VOLTIGE !', 'CÂLIN D’OURS !'], son: 'h' },
      S: { st: 6, act: 8, rec: 24, dmg: 13, hs: 0, bs: 16, kb: 6, kd: true, lance: 23, aa: true, inv: 6, box: [350, 950, -1000, -100], lvl: 'mid', saumon: true, mots: ['PATTE À SAUMONS !', 'HOP, AU VOL !'], son: 's', nom: 'La patte à saumons', ia: [0, 560, 1.1] },
      SF: { st: 10, act: 16, rec: 24, dmg: 12, hs: 0, bs: 16, kb: 16, kd: true, box: [300, 900, -600, 0], rush: 18, stopHit: true, lvl: 'mid', mots: ['CHARGE !', 'POUSSEZ-VOUS !'], son: 's', nom: 'La charge du grizzly', ia: [350, 950, 1] },
      SD: { st: 14, act: 18, rec: 22, dmg: 4, hs: 30, bs: 20, kb: 14, peur: true, lvl: 'mid', proj: { x0: 560, spd: 16, w: 150, h: [-700, -40], life: 58, peur: true }, mots: ['GROAAAR !', 'TOUT LE MONDE DEHORS !'], son: 's', nom: 'L’invité surprise', ia: [300, 1100, .9] },
      SUPER: { st: 14, act: 42, rec: 22, dmg: 5, hits: 7, hs: 20, bs: 8, kb: 3, kd: true, box: [300, 1050, -900, 0], lvl: 'mid', saumon: true, mots: ['PÊCHE MIRACULEUSE !', 'SAUMON !', 'SPLAF !'], son: 'h', nom: 'La pêche miraculeuse' },
    },
  },
  // --- HYÈNE : la harceleuse increvable (son rire vide la jauge SUPER, elle ne lâche jamais, croque-os, et… le clan !)
  hyene: {
    nom: 'HYÈNE', art: 'LA HYÈNE', fem: true, force: 1.0, spr: true, poseLance: 'coup', col: '#A87B3C', clair: '#F2D49B', fond: '#C9974E', K: .39, hp: 110, walk: 7.2, back: 5.6, dash: 18, jumpV: 24, jumpX: 8.6, grav: 1.15, etour: 44,
    aie: ['HI… HI… AÏE !', 'C’EST NERVEUX !', 'OUILLE LE MUSEAU !'], ia: {},
    hurt: { stand: [-560, 730, -800, 0], crouch: [-560, 740, -540, 0], air: [-480, 700, -700, 0] },
    push: [190, 240], reach: 760, speMin: 300, speMax: 1500,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 7, hs: 14, bs: 10, kb: 5, box: [540, 1060, -720, -340], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'GNAP !', 'CROQUÉ !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 11, dmg: 5, hs: 14, bs: 10, kb: 4, box: [520, 1040, -260, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['MORDILLE !', 'LES CHEVILLES !'], son: 'l' },
      H: { st: 12, act: 5, rec: 19, dmg: 13, hs: 20, bs: 15, kb: 11, box: [500, 1120, -740, -200], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['CRAC !', 'CRONCH !', 'MÂCHOIRE D’ACIER !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 9, hs: 17, bs: 12, kb: 9, kd: true, box: [520, 1100, -220, 0], lvl: 'low', chain: ['S'], mots: ['CROCHE-PATTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 9, hs: 17, bs: 12, kb: 8, box: [300, 980, -420, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H'], mots: ['GNAC !', 'PLONGEON !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['SECOUE-SECOUE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 12, act: 10, rec: 22, dmg: 7, hs: 20, bs: 10, kb: 8, vide: 28, lvl: 'mid', proj: { x0: 540, spd: 19, w: 150, h: [-760, -300], life: 60, rire: true }, mots: ['HI HI HI !', 'HA HA HA !', 'ÇA ÉNERVE, HEIN ?'], son: 's', nom: 'Le rire qui énerve', ia: [450, 1500, 1] },
      SF: { st: 8, act: 28, rec: 22, dmg: 6, hits: 4, hs: 12, bs: 8, kb: 3, vide: 6, box: [300, 1000, -640, -80], rush: 17, lvl: 'mid', mots: ['ENCORE !', 'TOUJOURS LÀ !', 'COUCOU !'], son: 's', nom: 'Elle ne lâche jamais', ia: [300, 1000, 1] },
      SD: { st: 6, act: 4, rec: 26, dmg: 13, hs: 0, bs: 0, kb: 10, kd: true, lvl: 'mid', os: true, prise: { portee: 110, t: 36, degage: false, mot: 'CROQUE-OS !', haut: 12, loin: 9, rec: 6 }, mots: ['CRONCH !', 'CRAC CRAC !'], son: 'h', nom: 'Croque-os', ia: [0, 420, 1.2] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -700, 0], lvl: 'mid', clan: true, vide: 8, mots: ['LE CLAN !', 'HI HI HI !', 'À L’ATTAQUE !'], son: 'h', nom: 'Le clan arrive !' },
    },
  },
  // --- BUFFLE D'EAU : le tank qui charge (recule pour armer sa charge, lance aux cornes, se secoue quand on le mord)
  buffle: {
    nom: 'BUFFLE', art: 'LE BUFFLE', force: 0.924, spr: true, col: '#56707E', clair: '#D5E3EA', fond: '#7C94A2', K: .46, hp: 110, walk: 5, back: 3.8, dash: 13, jumpV: 20, jumpX: 6.5, grav: 1.28, etour: 58,
    aie: ['MEUH ?!', 'MA CORNE !', 'MÊME PAS MAL… UN PEU.'], ia: {},
    hurt: { stand: [-560, 700, -800, 0], crouch: [-560, 720, -560, 0], air: [-500, 680, -700, 0] },
    push: [230, 290], reach: 740, speMin: 350, speMax: 1300,
    moves: {
      L: { st: 5, act: 4, rec: 11, dmg: 7, hs: 15, bs: 11, kb: 6, box: [560, 1060, -720, -300], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['TOC !', 'COUP DE CORNE !', 'PIC !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [500, 1000, -260, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['CLOP !', 'COUP DE SABOT !'], son: 'l' },
      H: { st: 15, act: 6, rec: 22, dmg: 14, hs: 21, bs: 16, kb: 13, box: [480, 1120, -760, -120], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['BOUM !', 'COUP DE BOULE !', 'BADABOUM !'], son: 'h' },
      cH: { st: 10, act: 6, rec: 24, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [500, 1100, -260, 0], lvl: 'low', chain: ['S'], mots: ['BALAYAGE !', 'PATATRAS !'], son: 'h' },
      A: { st: 6, act: 99, rec: 9, dmg: 10, hs: 18, bs: 12, kb: 9, box: [250, 1000, -450, 150], lvl: 'high', air: true, land: true, dive: 7, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['BADABOUM !', 'ATTERRISSAGE !'], son: 'h' },
      T: { st: 5, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['PAR-DESSUS LES CORNES !', 'HOP !'], son: 'h' },
      S: { st: 12, act: 22, rec: 28, dmg: 11, hs: 0, bs: 16, kb: 18, kd: true, box: [300, 1050, -700, 0], rush: 17, charge: true, armor: true, stopHit: true, lvl: 'mid', mots: ['TÊTE BAISSÉE !', 'CHARGE !', 'MEUUUH !'], son: 's', nom: 'La charge tête baissée', ia: [400, 1400, 1.3] },
      SF: { st: 5, act: 8, rec: 24, dmg: 12, hs: 0, bs: 16, kb: 6, kd: true, lance: 22, aa: true, inv: 7, box: [300, 950, -1000, -150], lvl: 'mid', mots: ['EN L’AIR !', 'COUP DE CORNES !'], son: 's', nom: 'Le lancer de cornes', ia: [0, 520, 1] },
      SD: { st: 6, act: 14, rec: 22, dmg: 9, hs: 18, bs: 14, kb: 16, kd: true, box: [-420, 900, -760, 0], armor: true, secoue: true, lvl: 'mid', mots: ['SECOUE-TOUT !', 'DÉGAGE !', 'MORDU, MAIS PAS VAINCU !'], son: 's', nom: 'Mordu, mais pas vaincu !', ia: [0, 450, 1] },
      SUPER: { st: 14, act: 40, rec: 24, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [200, 1150, -760, 0], rush: 19, armor: true, lvl: 'mid', mots: ['MEUUUH !', '550 KILOS !', 'LA CHARGE !'], son: 'h', nom: 'La charge de 550 kg' },
    },
  },
  // --- MORSE : la forteresse moustachue (le mur de défenses renvoie les coups, il se hisse sur ses dents, l'aspirateur à moustaches, le canapé)
  morse: {
    nom: 'MORSE', art: 'LE MORSE', force: 0.665, spr: true, col: '#B97A63', clair: '#FFE3D3', fond: '#C98E74', K: .46, hp: 130, peau: .8, walk: 4.6, back: 3.4, dash: 10, jumpV: 18, jumpX: 6, grav: 1.35, etour: 62,
    aie: ['MA MOUSTACHE !', 'OUILLE LES DÉFENSES !', 'PFFFF !'], ia: {},
    hurt: { stand: [-650, 520, -800, 0], crouch: [-650, 540, -520, 0], air: [-560, 500, -700, 0] },
    push: [300, 215], reach: 560, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 4, act: 4, rec: 12, dmg: 7, hs: 15, bs: 11, kb: 6, box: [250, 840, -520, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['TOC-TOC !', 'PIC !', 'DÉFENSE !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [200, 780, -240, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['FLIP-FLAP !', 'NAGEOIRE !'], son: 'l' },
      H: { st: 15, act: 6, rec: 23, dmg: 14, hs: 22, bs: 16, kb: 12, box: [250, 900, -700, -40], lvl: 'mid', armor: true, chain: ['S', 'SUPER'], mots: ['PLANTÉ !', 'BOUM LES DÉFENSES !', 'CRAC !'], son: 'h' },
      cH: { st: 10, act: 12, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [200, 820, -300, 0], lunge: 10, lvl: 'low', chain: ['S'], mots: ['GLISSADE !', 'SUR LE VENTRE !'], son: 'h' },
      A: { st: 6, act: 99, rec: 10, dmg: 11, hs: 18, bs: 12, kb: 9, box: [-200, 720, -400, 150], lvl: 'high', air: true, land: true, dive: 8, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['PLOF !', 'BADABOUM !'], son: 'h' },
      T: { st: 5, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['CÂLIN DE 1 500 KG !', 'APLATI !'], son: 'h' },
      S: { st: 4, act: 24, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', mur: true, contre: { dmg: 14, hs: 24, bs: 0, kb: 16, kd: true, lvl: 'mid', mots: ['PAS TOUCHE AU TROUPEAU !', 'LE MUR !'], son: 'h' }, mots: ['LE MUR !'], son: 's', nom: 'Le mur de défenses', ia: [0, 750, .8] },
      SF: { st: 10, act: 99, rec: 20, dmg: 11, hs: 20, bs: 14, kb: 10, kd: true, box: [150, 820, -520, 60], saute: [15, 13], land: true, lvl: 'mid', mots: ['IL MARCHE AVEC SES DENTS !', 'HISSE !', 'CROCHET !'], son: 's', nom: 'Il marche avec ses dents', ia: [450, 1050, 1] },
      SD: { st: 12, act: 30, rec: 22, dmg: 9, hs: 20, bs: 12, kb: 4, box: [230, 720, -520, 0], tire: { portee: 1300, v: 9 }, aspire: true, lvl: 'mid', mots: ['SLUUURP !', 'ASPIRÉ !', 'GLOUPS !'], son: 's', nom: 'L’aspirateur à moustaches', ia: [500, 1300, 1] },
      SUPER: { st: 16, act: 99, rec: 26, dmg: 24, hs: 0, bs: 16, kb: 14, kd: true, box: [-300, 820, -520, 160], saute: [13, 25], land: true, quakeLand: true, lvl: 'mid', mots: ['UN CANAPÉ DE 1 500 KG !', 'BADABOUM !', 'SPLATCH !'], son: 'h', nom: 'Le canapé d’une tonne et demie' },
    },
  },
  // --- T. REX (légendaire : il se gagne en GOD MODE en battant tous les animaux) : le pas qui fait trembler, la morsure géante, le coup de queue, le rugissement du roi
  trex: {
    nom: 'T. REX', art: 'LE T. REX', force: 1.35, spr: true, col: '#5E7A2E', clair: '#E3E89A', fond: '#8C9A3E', K: .5, hp: 174, walk: 5.4, back: 4, dash: 14, jumpV: 21, jumpX: 7, grav: 1.25, etour: 60,
    aie: ['ROAR ?!', 'MES PETITS BRAS !', 'OUILLE, MA QUEUE !'], ia: {},
    hurt: { stand: [-560, 660, -720, 0], crouch: [-560, 680, -480, 0], air: [-500, 640, -640, 0] },
    push: [260, 300], reach: 760, speMin: 300, speMax: 1500,
    moves: {
      L: { st: 7, act: 4, rec: 11, dmg: 7, hs: 15, bs: 11, kb: 6, box: [400, 860, -720, -330], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'GNAP !'], son: 'l' },
      cL: { st: 7, act: 4, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [300, 760, -250, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['PATTE !', 'SCRATCH !'], son: 'l' },
      H: { st: 17, act: 6, rec: 22, dmg: 14, hs: 21, bs: 16, kb: 13, box: [380, 940, -760, -250], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['CHOMP !', 'GLOUPS !', 'MÂCHOIRE GÉANTE !'], son: 'h' },
      cH: { st: 12, act: 6, rec: 23, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [350, 900, -400, 0], lvl: 'low', chain: ['S'], mots: ['CROC-EN-JAMBE !', 'PATATRAS !'], son: 'h' },
      A: { st: 8, act: 99, rec: 9, dmg: 11, hs: 18, bs: 12, kb: 9, box: [0, 750, -400, 150], lvl: 'high', air: true, land: true, dive: 7, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['BOUM !', 'ATTERRISSAGE PRÉHISTORIQUE !'], son: 'h' },
      T: { st: 7, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['HOP, DANS LA GUEULE !', 'VOLTIGE !'], son: 'h' },
      S: { st: 16, act: 6, rec: 22, dmg: 10, hs: 20, bs: 12, kb: 8, box: [150, 800, -250, 0], seisme: 700, lvl: 'low', mots: ['BOUM !', 'ÇA TREMBLE !'], son: 's', nom: 'Le pas qui fait trembler', ia: [0, 700, 1] },
      SF: { st: 8, act: 4, rec: 26, dmg: 17, hs: 0, bs: 0, kb: 10, kd: true, lvl: 'mid', os: true, prise: { portee: 130, t: 36, degage: false, mot: 'CHOMP CHOMP !', haut: 14, loin: 10, rec: 6 }, mots: ['CROUNCH !', 'MIAM !'], son: 'h', nom: 'La morsure géante', ia: [0, 420, 1.2] },
      SD: { st: 12, act: 8, rec: 24, dmg: 12, hs: 20, bs: 14, kb: 14, kd: true, box: [100, 1050, -520, 0], lvl: 'mid', mots: ['COUP DE QUEUE !', 'FOUETTÉ !', 'VLAN !'], son: 's', nom: 'Le coup de queue', ia: [250, 800, 1] },
      SUPER: { st: 20, act: 12, rec: 26, dmg: 26, hs: 0, bs: 16, kb: 22, kd: true, souffle: true, lvl: 'mid', proj: { x0: 650, spd: 21, w: 260, h: [-900, 0], life: 80 }, mots: ['ROAAAAAR !', 'LE ROI DES DINOS !'], son: 's', nom: 'Le rugissement du roi' },
    },
  },
  // --- animaux « 100 % illustrations » (boîtes en px de l'image de base, sol = centre de gravité)
  // --- LION : le roi polyvalent (rugissement à distance, plaquage, coup de patte vers le ciel)
  lion: {
    nom: 'LION', art: 'LE LION', force: 0.751, spr: true, col: '#D9901A', clair: '#FFC24D', fond: '#F0A830', K: .44, hp: 114, walk: 6.8, back: 5, dash: 16, jumpV: 24.5, jumpX: 8.2, grav: 1.15, etour: 48,
    aie: ['OUILLE !', 'MA CRINIÈRE !', 'PAS LA COIFFURE !'], ia: { loin: 780, spe: 1.2 },
    hurt: { stand: [-520, 540, -880, 0], crouch: [-520, 560, -520, 0], air: [-480, 540, -700, 0] },
    push: [200, 235], reach: 640, speMin: 480, speMax: 1450,
    moves: {
      L: { st: 4, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 6, box: [500, 910, -700, -300], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRATCH !', 'PATOUNE !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [430, 800, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['SCRITCH !', 'TIC !'], son: 'l' },
      H: { st: 12, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 13, box: [460, 990, -640, -20], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['BAM !', 'CRAC !', 'ROYAL !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [430, 880, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [250, 820, -400, 160], lvl: 'high', air: true, land: true, dive: 3, chain: ['L', 'cL', 'H', 'S'], mots: ['GRIFF !', 'PLAF !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 15, act: 16, rec: 31, dmg: 10, hs: 24, bs: 17, kb: 24, souffle: true, lvl: 'mid', proj: { x0: 620, spd: 20, w: 170, h: [-700, -40], life: 70 }, mots: ['ROAAAR !', 'SOUFFLÉ !', 'ON M’ENTEND À 8 KM !'], son: 's', nom: 'Rugissement qui souffle', ia: [480, 1700, 1.4] },
      SF: { st: 9, act: 14, rec: 26, dmg: 16, hs: 0, bs: 0, kb: 8, kd: true, rush: 12, lvl: 'mid', prise: { portee: 95, t: 26, degage: false, mot: 'PLAQUÉ AU SOL !', haut: 7, loin: 5, rec: 6, plaque: true }, mots: ['PLAQUÉ !', 'PATAPOUF !'], son: 'h', nom: 'Il plaque sa proie au sol', ia: [250, 600, 1] },
      SD: { st: 4, act: 99, rec: 24, dmg: 12, hs: 0, bs: 16, kb: 6, kd: true, lance: 19, aa: true, inv: 8, saute: [2, 20], land: true, box: [200, 820, -900, -250], lvl: 'mid', mots: ['PAF DANS LES AIRS !', 'COUP DE PATTE ROYAL !'], son: 's', nom: 'Un coup de patte mortel', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 40, rec: 20, dmg: 5, hits: 6, hs: 22, bs: 8, kb: 3, kd: true, box: [260, 900, -700, 0], rush: 13, lvl: 'mid', mots: ['GRRR !', 'VLAN !', 'ROAR !', 'VIVE LE ROI !'], son: 'h', nom: 'La charge du roi' },
    },
  },
  // --- OURS POLAIRE : le géant solide (glissade, saut qui brise la glace, baffe vers le ciel)
  ours: {
    nom: 'OURS POLAIRE', art: 'L’OURS POLAIRE', force: 1.28, spr: true, col: '#2E8FC7', clair: '#9ADCFF', fond: '#5BB8E8', K: .45, hp: 112, walk: 5.3, back: 4, dash: 13, jumpV: 21.5, jumpX: 6.6, grav: 1.22, etour: 54,
    aie: ['BRRR !', 'OUILLE LA TRUFFE !', 'J’AI CHAUD !'], ia: {},
    hurt: { stand: [-640, 755, -880, 0], crouch: [-640, 760, -640, 0], air: [-500, 700, -760, 0] },
    push: [220, 285], reach: 700, speMin: 480, speMax: 1000,
    moves: {
      L: { st: 5, act: 4, rec: 11, dmg: 6, hs: 15, bs: 11, kb: 6, box: [620, 960, -800, -420], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['POK !', 'PAF !', 'BAFFE !'], son: 'l' },
      cL: { st: 6, act: 5, rec: 13, dmg: 6, hs: 15, bs: 11, kb: 5, box: [560, 950, -240, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['BLAM !', 'PLOC !'], son: 'l' },
      H: { st: 17, act: 5, rec: 23, dmg: 12, hs: 21, bs: 16, kb: 12, box: [480, 1000, -640, 0], lvl: 'mid', armor: true, quake: true, chain: ['S', 'SUPER'], mots: ['BOUM !', 'PATATRAS !', 'GROSSE PATTE !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 24, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [520, 1010, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'SUR LA GLACE !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [300, 900, -400, 180], lvl: 'high', air: true, land: true, dive: 6, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['PLAF !', 'SPLOUTCH !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['VOLTIGE !', 'CÂLIN D’OURS !'], son: 'h' },
      S: { st: 16, act: 24, rec: 22, dmg: 12, hs: 0, bs: 16, kb: 16, kd: true, box: [300, 880, -300, 0], rush: 17, lvl: 'low', mots: ['GLISSADE !', 'SPLATCH !', 'TOBOGGAN !'], son: 's', nom: 'Glissade sur le ventre', ia: [350, 1000, 1] },
      SF: { st: 6, act: 99, rec: 20, dmg: 13, hs: 22, bs: 16, kb: 10, kd: true, saute: [11, 19], land: true, dive: 4, quakeLand: true, box: [100, 760, -500, 150], lvl: 'high', mots: ['CRAC LA GLACE !', 'PLOUF !'], son: 's', nom: 'Le saut qui brise la glace', ia: [380, 820, 1] },
      SD: { st: 4, act: 99, rec: 26, dmg: 12, hs: 0, bs: 16, kb: 6, kd: true, lance: 18, aa: true, inv: 8, saute: [1, 18], land: true, box: [150, 800, -950, -250], lvl: 'mid', mots: ['BAFFE POLAIRE !', 'DEBOUT !'], son: 's', nom: 'Debout, patte levée !', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 36, rec: 22, dmg: 7, hits: 4, hs: 22, bs: 8, kb: 6, kd: true, box: [300, 1100, -600, 0], lvl: 'low', onde: true, mots: ['BOUM !', 'CRAC !', 'ÇA GLISSE !'], son: 'h', nom: 'Le coup de patte de géant' },
    },
  },
  // --- CROCODILE : l'embuscade (il plonge, il attrape et tourne, coup de queue)
  croco: {
    nom: 'CROCODILE', art: 'LE CROCODILE', amphibie: true, forceMer: .85, force: 0.987, spr: true, col: '#4E8A2E', clair: '#A8DC6E', fond: '#6DB33F', K: .46, hp: 110, walk: 5.6, back: 4.2, dash: 16, jumpV: 20, jumpX: 7, grav: 1.25, etour: 50,
    aie: ['CLAC ?!', 'AÏE LES ÉCAILLES !', 'GLOUPS !'], ia: { saut: .6 },
    hurt: { stand: [-560, 700, -800, 0], crouch: [-560, 700, -420, 0], air: [-500, 650, -600, 0] },
    push: [230, 300], reach: 690, speMin: 330, speMax: 780,
    moves: {
      L: { st: 5, act: 4, rec: 11, dmg: 7, hs: 15, bs: 11, kb: 6, box: [560, 1020, -380, -40], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'CROC !', 'CLAC-CLAC !'], son: 'l' },
      cL: { st: 6, act: 4, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [520, 980, -220, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'SCRONCH !'], son: 'l' },
      H: { st: 12, act: 5, rec: 20, dmg: 13, hs: 20, bs: 15, kb: 12, box: [520, 1100, -420, 0], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['CROC !', 'CRAC !', 'MÂCHOIRE D’ACIER !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [480, 1080, -200, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [200, 900, -400, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H'], mots: ['CLAC !', 'PLOUF !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP DANS L’EAU !'], son: 'h' },
      S: { st: 14, act: 30, rec: 22, dmg: 4, hits: 4, hs: 22, bs: 14, kb: 3, kd: true, box: [380, 980, -420, 0], rush: 9, agrippe: true, lvl: 'mid', mots: ['ROULADE !', 'TOURNE !', 'ÇA TOURNE !'], son: 's', nom: 'La roulade de la mort', ia: [300, 720, 1] },
      SF: { st: 34, act: 99, rec: 18, land: true, dmg: 12, hs: 22, bs: 14, kb: 8, kd: true, box: [-300, 800, -900, 0], plonge: true, lvl: 'mid', mots: ['SURPRISE !', 'SPLASH !', 'COUCOU C’EST MOI !'], son: 'h', nom: 'Il attaque caché sous l’eau', ia: [520, 1400, .9] },
      SD: { st: 5, act: 8, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 10, kd: true, lance: 16, aa: true, inv: 6, box: [-300, 760, -820, 0], lvl: 'mid', mots: ['COUP DE QUEUE !', 'FLAC !'], son: 's', nom: 'Le coup de queue', ia: [0, 0, 0] },
      SUPER: { st: 40, act: 99, rec: 18, land: true, dmg: 20, hs: 24, bs: 16, kb: 10, kd: true, box: [-320, 820, -1000, 0], plonge: true, lvl: 'mid', mots: ['SPLASH !', 'CROC !', 'SURPRIIISE !'], son: 'h', nom: 'Il bondit de l’eau' },
    },
  },
  // --- HIPPOPOTAME : le tank blindé. ★ il se retourne et sa queue-hélice mitraille des crottes !
  hippo: {
    nom: 'HIPPOPOTAME', art: 'L’HIPPOPOTAME', force: 1.35, spr: true, col: '#8E6FA8', clair: '#DCC2F2', fond: '#B48CD6', K: .5, hp: 127, walk: 4.4, back: 3.6, dash: 12, jumpV: 18.5, jumpX: 6, grav: 1.3, etour: 58,
    aie: ['OUMPF !', 'GROMPF !', 'MES DENTS !', 'AÏE MON NEZ !'], ia: { saut: .5 },
    hurt: { stand: [-620, 780, -760, 0], crouch: [-620, 780, -600, 0], air: [-560, 720, -700, 0] },
    push: [260, 300], reach: 700, speMin: 480, speMax: 1100,
    moves: {
      L: { st: 6, act: 4, rec: 12, dmg: 7, hs: 15, bs: 11, kb: 7, box: [600, 1000, -640, -200], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['BONK !', 'PAF !', 'BOUDIN !'], son: 'l' },
      cL: { st: 7, act: 5, rec: 13, dmg: 6, hs: 15, bs: 11, kb: 5, box: [560, 980, -260, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['BLAM !', 'POUF !'], son: 'l' },
      H: { st: 18, act: 6, rec: 23, dmg: 13, hs: 21, bs: 16, kb: 13, box: [560, 1120, -780, -60], lvl: 'mid', armor: true, chain: ['S', 'SUPER'], mots: ['CHOMP !', 'CRAC !', 'GLOUPS !'], son: 'h' },
      cH: { st: 10, act: 5, rec: 25, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [520, 1060, -240, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'SPLOTCH !'], son: 'h' },
      A: { st: 7, act: 99, rec: 10, dmg: 10, hs: 20, bs: 12, kb: 9, box: [100, 800, -420, 220], lvl: 'high', air: true, land: true, dive: 9, quakeLand: true, chain: ['L', 'cL', 'H'], mots: ['PLOUF !', 'BOUM !', 'BOMBE !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      // ★ le ventilateur à crottes : dos à l'adversaire, la queue tourne comme une hélice et tire en rafale (la mitraillette)
      S: { st: 14, act: 32, rec: 24, dmg: 2, hs: 9, bs: 6, kb: 2.5, dos: true, jet: { every: 4, spd: [20, 26], vy: [-7, -2], grav: .34, r: 24, dmg: 1.6, rafale: true }, lvl: 'mid', mots: ['RATATATATA !', 'PROUT PROUT !'], son: 'h', nom: 'Le ventilateur à crottes', ia: [220, 980, 1.3] },
      SF: { st: 18, act: 20, rec: 24, dmg: 11, hs: 0, bs: 16, kb: 17, kd: true, box: [300, 1000, -560, 0], rush: 19, armor: true, lvl: 'mid', mots: ['CHARGE !', 'BADABOUM !', 'POUSSEZ-VOUS !'], son: 's', nom: 'La charge gueule ouverte', ia: [350, 1000, 1] },
      SD: { st: 6, act: 10, rec: 26, dmg: 13, hs: 0, bs: 16, kb: 8, kd: true, lance: 17, aa: true, inv: 7, box: [300, 1050, -1050, -280], lvl: 'mid', mots: ['OUAAAH !', 'GRAND BÂILLEMENT !'], son: 's', nom: 'Le grand bâillement', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 46, rec: 24, dmg: 3, hs: 10, bs: 8, kb: 3, dos: true, jet: { every: 3, spd: [12, 27], vy: [-22, -4], grav: .5, r: 36, dmg: 2.4 }, lvl: 'mid', mots: ['SPLOTCH !', 'BEURK !', 'PROUUUT !'], son: 'h', nom: 'Le déluge de crottes' },
    },
  },
  // --- RATEL : le teigneux minuscule (nuage puant, il fonce, il mord et ne lâche pas)
  ratel: {
    nom: 'RATEL', art: 'LE RATEL', force: 0.731, spr: true, col: '#3A3A48', clair: '#E3E3EE', fond: '#6B6B80', K: .38, hp: 108, walk: 7.8, peau: .85, back: 6, dash: 19, jumpV: 25, jumpX: 9, grav: 1.15, etour: 46,
    aie: ['MÊME PAS MAL !', 'MÊME PAS PEUR !', 'GRRR !'], ia: { saut: 1.1 },
    hurt: { stand: [-560, 660, -780, 0], crouch: [-560, 660, -520, 0], air: [-500, 600, -680, 0] },
    push: [170, 210], reach: 580, speMin: 300, speMax: 560,
    moves: {
      L: { st: 3, act: 3, rec: 7, dmg: 7, hs: 14, bs: 10, kb: 5, box: [560, 1080, -560, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['SCRITCH !', 'GRRR !', 'TCHAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 9, dmg: 4, hs: 13, bs: 10, kb: 4, box: [520, 900, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['SCRITCH !', 'MORDILLE !'], son: 'l' },
      H: { st: 8, act: 5, rec: 15, dmg: 12, hs: 18, bs: 14, kb: 11, box: [520, 1160, -640, 0], lvl: 'mid', lunge: 7, chain: ['S', 'SUPER'], mots: ['CROC !', 'GRRR !', 'TEIGNE !'], son: 'h' },
      cH: { st: 6, act: 4, rec: 18, dmg: 8, hs: 18, bs: 12, kb: 8, kd: true, box: [480, 1000, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'CROCHE-PATTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [300, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['SCRITCH !', 'KAMIKAZE !'], son: 'l' },
      T: { st: 4, act: 3, rec: 20, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'CROCHE !'], son: 'h' },
      S: { st: 14, act: 10, rec: 22, dmg: 1, nuage: { x0: 560, r: 230, life: 170, tick: 25, stun: 42 }, lvl: 'mid', mots: ['PSCHIIT !', 'PFIOU, ÇA PUE !', 'PROUT !'], son: 's', nom: 'La bombe puante', ia: [250, 720, 1] },
      SF: { st: 5, act: 16, rec: 24, dmg: 9, hs: 20, bs: 14, kb: 10, kd: true, box: [200, 900, -380, 0], rush: 24, stopHit: true, bas: true, bonk: true, lvl: 'mid', mots: ['FONCE !', 'TÊTE BAISSÉE !', 'SANS RÉFLÉCHIR !'], son: 's', nom: 'Il fonce sans réfléchir', ia: [300, 900, 1.2] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, inv: 8, saute: [4, 20], land: true, box: [150, 800, -800, -150], lvl: 'mid', mots: ['CROC !', 'JE LÂCHE PAS !'], son: 's', nom: 'La morsure qui ne lâche pas', ia: [0, 0, 0] },
      SUPER: { st: 12, act: 48, rec: 22, dmg: 4, hits: 8, hs: 16, bs: 8, kb: 3, kd: true, box: [200, 1100, -640, 0], rush: 15, armor: true, lvl: 'mid', mots: ['GRRR !', 'SCRITCH !', 'FURIE !', '13 KILOS DE RAGE !'], son: 'l', nom: 'La furie du ratel' },
    },
  },
  // --- DRAGON DE KOMODO : le venimeux (morsure à venin, coup de queue, morsure en l'air)
  komodo: {
    nom: 'KOMODO', art: 'LE DRAGON DE KOMODO', force: 0.962, spr: true, col: '#8A7A45', clair: '#E2D49A', fond: '#B09C5A', K: .44, hp: 116, walk: 6, back: 4.4, dash: 15, jumpV: 21, jumpX: 7.5, grav: 1.2, etour: 52,
    aie: ['SSSS !', 'SSSS… AÏE !', 'HEIN ? J’ENTENDS RIEN !'], ia: {},
    hurt: { stand: [-560, 680, -700, 0], crouch: [-560, 680, -440, 0], air: [-500, 620, -620, 0] },
    push: [220, 280], reach: 680, speMin: 380, speMax: 640,
    moves: {
      L: { st: 5, act: 4, rec: 11, dmg: 7, hs: 15, bs: 11, kb: 6, box: [560, 1000, -560, -100], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'SSSS !', 'SLURP !'], son: 'l' },
      cL: { st: 6, act: 4, rec: 12, dmg: 5, hs: 15, bs: 11, kb: 5, box: [520, 980, -240, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['CLAC !'], son: 'l' },
      H: { st: 12, act: 5, rec: 19, dmg: 13, hs: 20, bs: 15, kb: 12, box: [540, 1100, -660, 0], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['CRAC !', 'VLAN !', 'DRAGON !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [480, 1060, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FOUETTÉ !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [300, 900, -400, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H'], mots: ['CLAC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 12, act: 12, rec: 20, dmg: 8, hs: 18, bs: 14, kb: 8, box: [500, 1060, -580, 0], rush: 12, venin: { t: 300, tick: 20, dmg: 1 }, lvl: 'mid', mots: ['VENIN !', 'SSSS !', 'TU VAS VOIR !'], son: 's', nom: 'La morsure à venin', ia: [380, 760, 1] },
      SF: { st: 10, act: 6, rec: 24, dmg: 11, hs: 20, bs: 16, kb: 14, kd: true, box: [300, 1300, -400, 0], lvl: 'low', mots: ['FOUETTÉ !', 'FLAC !', 'QUEUE DE DRAGON !'], son: 'h', nom: 'Le coup de queue', ia: [420, 900, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 7, saute: [3, 19], land: true, box: [150, 820, -800, -150], lvl: 'mid', mots: ['CLAC EN L’AIR !', 'SSSS !'], son: 's', nom: 'La morsure en l’air', ia: [0, 0, 0] },
      SUPER: { st: 22, act: 16, rec: 24, dmg: 14, hs: 24, bs: 16, kb: 10, kd: true, box: [480, 1150, -660, 0], rush: 19, venin: { t: 420, tick: 18, dmg: 1, lent: .6 }, lvl: 'mid', mots: ['MORSURE ROYALE !', 'VENIN XXL !'], son: 'h', nom: 'La morsure royale' },
    },
  },
  // --- LÉOPARD : le chasseur de la nuit (bond de 6 m, il emporte sa proie dans son arbre, il tombe du ciel, l'ombre de la nuit)
  leopard: {
    nom: 'LÉOPARD', art: 'LE LÉOPARD', force: 0.73, spr: true, poseLance: 'grimpe', hPose: ['garde', 'fort'], col: '#A8651F', clair: '#F7C77B', fond: '#C27F36', K: .42, hp: 104, walk: 7, back: 5.3, dash: 18, jumpV: 26, jumpX: 9, grav: 1.12, etour: 46,
    aie: ['MIAOU ?!', 'MES TACHES !', 'OUILLE LE MUSEAU !'], ia: { saut: 1.2 },
    hurt: { stand: [-470, 600, -760, 0], crouch: [-470, 620, -480, 0], air: [-420, 580, -640, 0] },
    push: [190, 230], reach: 700, speMin: 300, speMax: 1100,
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [520, 1000, -720, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRITCH !', 'GRIFFOUILLE !'], son: 'l' }, // 24/09 (enfant) : plus bas
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [500, 960, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'SCRITCH !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 12, box: [480, 1060, -680, -40], lvl: 'mid', lunge: 5, armor: true, chain: ['S', 'SUPER'], mots: ['CRAC !', 'CROC !', 'TACHETÉ !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [480, 1020, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [250, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'GRIFF !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 9, act: 99, rec: 18, dmg: 12, hs: 0, bs: 16, kb: 15, kd: true, box: [250, 900, -600, 0], saute: [18, 16], land: true, lvl: 'mid', mots: ['BOND DE 6 M !', 'HOP !', 'SURPRISE !'], son: 's', nom: 'Le bond de 6 m', ia: [500, 1150, 1.2] },
      SF: { st: 7, act: 12, rec: 24, dmg: 15, hs: 0, bs: 0, kb: 8, kd: true, rush: 13, lvl: 'mid', prise: { portee: 110, t: 34, degage: false, mot: 'LE REPAS DANS L’ARBRE !', haut: 26, loin: 3, rec: 6 }, mots: ['MIAM !', 'HOP, DANS L’ARBRE !'], son: 'h', nom: 'Le repas dans l’arbre', ia: [150, 600, 1.1] },
      SD: { st: 46, act: 99, rec: 28, dmg: 12, hs: 22, bs: 16, kb: 10, kd: true, box: [-260, 480, -520, 120], ciel: true, land: true, lvl: 'high', mots: ['TOMBÉ DU CIEL !', 'COUCOU D’EN HAUT !'], son: 's', nom: 'Tombé du ciel', ia: [400, 1500, .5] },
      SUPER: { st: 16, act: 50, rec: 22, dmg: 5, hits: 6, hs: 20, bs: 8, kb: 3, kd: true, box: [200, 1000, -700, 0], rush: 10, ombre: true, lvl: 'mid', mots: ['CHUT…', 'SCRITCH !', 'DANS LE NOIR !'], son: 'h', nom: 'L’ombre de la nuit' },
    },
  },
  // --- PORC-ÉPIC : la pelote d'épingles (qui le touche se pique ! charge en marche arrière, le hochet qui contre, la boule piquante)
  porcepic: {
    nom: 'PORC-ÉPIC', art: 'LE PORC-ÉPIC', force: 0.543, spr: true, piquants: 1, speAff: 'SF', hPose: ['accroupi', 'fort'], col: '#6B4A33', clair: '#FFF5E0', fond: '#9C7B5B', K: .34, hp: 104, walk: 6.2, back: 4.8, dash: 15, jumpV: 22, jumpX: 7.5, grav: 1.2, etour: 50,
    aie: ['PIC ?!', 'MES PIQUANTS !', 'OUILLE LE NEZ !'], ia: {},
    hurt: { stand: [-560, 560, -640, 0], crouch: [-560, 580, -460, 0], air: [-520, 540, -560, 0] },
    push: [160, 170], reach: 560, speMin: 250, speMax: 900,
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 5, box: [420, 880, -420, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'GNAC !', 'MORDU !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 4, box: [400, 860, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['MORDILLE !', 'GNAC !'], son: 'l' },
      H: { st: 10, act: 6, rec: 19, dmg: 11, hs: 20, bs: 15, kb: 12, box: [200, 960, -700, 0], pique: 1, armor: true, lvl: 'mid', chain: ['S', 'SUPER'], mots: ['PIQUE !', 'HÉRISSÉ !', 'AÏE AÏE AÏE !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [300, 880, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 4, act: 99, rec: 7, dmg: 8, hs: 18, bs: 12, kb: 8, box: [-100, 700, -500, 150], pique: 1, lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H'], mots: ['BOULE PIQUANTE !', 'PIQUE !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['ROULÉ-BOULÉ !', 'HOP LÀ !'], son: 'h' },
      // 24/09 (enfant) : un enfant appuie sur ★ en avançant → la charge (qui encaisse) est sur → ★ ; ★ sur place = tchik-tchik (il s'arrête et fait son bruit de hochet)
      S: { st: 4, act: 26, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', hochet: true, contre: { dmg: 9, hs: 24, bs: 0, kb: 16, kd: true, lvl: 'mid', pique: 3, mots: ['QUI S’Y FROTTE…', '…S’Y PIQUE !'], son: 'h' }, mots: ['TCHIK-TCHIK !'], son: 's', nom: 'Tchik-tchik !', ia: [0, 700, .8] },
      SF: { st: 10, act: 20, rec: 22, dmg: 11, hs: 0, bs: 16, kb: 16, kd: true, box: [-300, 700, -620, 0], rush: 17, stopHit: true, pique: 2, armor: true, lvl: 'mid', mots: ['MARCHE ARRIÈRE !', 'PIQUE !', 'BIP BIP, JE RECULE !'], son: 's', nom: 'La charge en marche arrière', ia: [300, 1000, 1.2] },
      SD: { st: 4, act: 99, rec: 24, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 16, aa: true, inv: 8, saute: [-2, 19], land: true, box: [-350, 550, -800, 0], pique: 1, lvl: 'mid', mots: ['BOULE PIQUANTE !', 'HÉRISSÉ !'], son: 's', nom: 'La boule piquante', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 24, dmg: 5, hits: 5, hs: 18, bs: 8, kb: 3, kd: true, box: [-300, 760, -640, 0], rush: 14, pique: 1, armor: true, lvl: 'mid', mots: ['PIQUE !', 'PIQUE-PIQUE !', 'QUI S’Y FROTTE S’Y PIQUE !'], son: 'h', nom: 'Qui s’y frotte s’y pique !' },
    },
  },
  // --- GUÉPARD : la tornade tachetée (le plus rapide et le plus fragile : croche-patte, démarrage turbo, saut de l'éclair)
  guepard: {
    nom: 'GUÉPARD', art: 'LE GUÉPARD', force: 0.887, spr: true, hPose: ['garde', 'fort'], col: '#B8961E', clair: '#FFF3B0', fond: '#D8BA4E', K: .38, hp: 96, walk: 8.4, back: 6.4, dash: 22, jumpV: 25, jumpX: 10, grav: 1.15, etour: 42,
    aie: ['CUI-CUI ?!', 'AÏE AÏE !', 'MES TACHES !'], ia: { saut: 1 },
    hurt: { stand: [-470, 600, -900, 0], crouch: [-470, 620, -560, 0], air: [-420, 580, -760, 0] },
    push: [175, 215], reach: 720, speMin: 300, speMax: 1300,
    moves: {
      L: { st: 3, act: 3, rec: 8, dmg: 5, hs: 14, bs: 10, kb: 5, box: [460, 980, -780, -80], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRITCH !', 'TROP VITE !'], son: 'l' }, // 24/09 (enfant) : plus bas, il touche aussi les petits
      cL: { st: 3, act: 3, rec: 9, dmg: 4, hs: 13, bs: 10, kb: 4, box: [440, 940, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'TAC !'], son: 'l' },
      H: { st: 9, act: 5, rec: 16, dmg: 11, hs: 19, bs: 14, kb: 11, box: [420, 1060, -600, -80], lvl: 'mid', lunge: 8, inv: 6, chain: ['S', 'SUPER'], mots: ['FIOU !', 'CRAC !', 'ZOU !'], son: 'h' },
      cH: { st: 6, act: 4, rec: 20, dmg: 8, hs: 17, bs: 12, kb: 8, kd: true, box: [420, 1000, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [250, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['ZOU !', 'GRIFF !'], son: 'l' },
      T: { st: 3, act: 3, rec: 20, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 7, act: 12, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 10, kd: true, box: [300, 950, -260, 0], rush: 24, stopHit: true, vitesse: true, inv: 12, lvl: 'low', mots: ['CROCHE-PATTE !', 'BADABOUM !', 'TRÉBUCHÉ !'], son: 's', nom: 'Le croche-patte', ia: [300, 950, 1.2] },
      SF: { st: 5, act: 10, rec: 26, dmg: 11, hs: 20, bs: 14, kb: 12, kd: true, box: [250, 950, -700, 0], rush: 34, stopHit: true, vitesse: true, inv: 16, lvl: 'mid', mots: ['FIOUUU !', 'ZOOOM !', 'TU M’AS VU ? NON !'], son: 's', nom: 'Le démarrage turbo', ia: [400, 1500, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, inv: 8, saute: [4, 22], land: true, box: [150, 800, -900, -200], lvl: 'mid', mots: ['L’ÉCLAIR !', 'HOP, EN L’AIR !'], son: 's', nom: 'Le saut de l’éclair', ia: [0, 0, 0] },
      SUPER: { st: 12, act: 48, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1000, -700, 0], rush: 22, vitesse: true, lvl: 'mid', mots: ['FIOUUU !', 'ZOOM !', 'TORNADE !'], son: 'h', nom: 'La tornade tachetée' },
    },
  },
  // --- AUTRUCHE : la karatéka géante (très longues pattes, pas de géant, couchée comme un tas de terre, karaté-poule !)
  autruche: {
    nom: 'AUTRUCHE', art: 'L’AUTRUCHE', fem: true, force: 0.775, spr: true, hPose: ['garde', 'fort'], col: '#3B3B46', clair: '#FFC6D5', fond: '#E48CA8', K: .45, hp: 104, walk: 7.4, back: 5.6, dash: 20, jumpV: 23, jumpX: 8.4, grav: 1.2, etour: 50,
    aie: ['COT COT ?!', 'MES PLUMES !', 'AÏE, MON ŒIL !'], ia: {},
    hurt: { stand: [-470, 540, -960, 0], crouch: [-470, 560, -540, 0], air: [-440, 520, -860, 0], aplat: [-480, 560, -200, 0] },
    push: [175, 185], reach: 780, speMin: 300, speMax: 1300,
    moves: {
      L: { st: 3, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [250, 800, -760, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PIC !', 'TOC !', 'COUP DE BEC !'], son: 'l' }, // 24/09 soir : plus rapide et plus bas (il touchait mal les petits)
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [300, 760, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['PIC-PIC !', 'TOC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 14, box: [200, 820, -620, -160], lvl: 'mid', armor: true, chain: ['S', 'SUPER'], mots: ['HI-YAAA !', 'VLAN !', 'KARATÉ !'], son: 'h' }, // karaté : elle encaisse pendant qu'elle arme son coup
      cH: { st: 8, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [200, 800, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 4, act: 99, rec: 7, dmg: 9, hs: 18, bs: 12, kb: 8, box: [100, 800, -500, 100], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H'], mots: ['KARATÉ VOLANT !', 'HI-YA !'], son: 'h' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 14, act: 5, rec: 24, dmg: 16, hs: 24, bs: 18, kb: 22, kd: true, casse: true, box: [150, 900, -640, -120], lvl: 'mid', mots: ['HI-YAAA !', 'CEINTURE NOIRE !', 'KARATÉ !'], son: 's', nom: 'Le grand coup de patte', ia: [0, 700, 1.2] },
      SF: { st: 8, act: 12, rec: 24, dmg: 12, hs: 20, bs: 14, kb: 14, kd: true, box: [200, 950, -620, -100], rush: 26, stopHit: true, armor: true, lvl: 'mid', mots: ['PAS DE GÉANT !', 'ZOU !', '5 MÈTRES D’UN COUP !'], son: 's', nom: 'Le pas de géant', ia: [450, 1300, 1] },
      SD: { st: 30, act: 8, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, aplat: true, box: [100, 800, -1000, -150], lvl: 'mid', mots: ['SURPRISE !', 'COUCOU !'], son: 's', nom: 'Le tas de terre', ia: [0, 500, .8] },
      SUPER: { st: 14, act: 48, rec: 24, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 950, -700, -80], rush: 8, lvl: 'mid', mots: ['HI !', 'YA !', 'HI-YAAA !', 'KARATÉ-POULE !'], son: 'h', nom: 'Karaté-poule !' },
    },
  },
  // ===================== MONDE MER (on se bat sous l'eau : sauts lents, bulles ; un animal marin n'affronte que la mer) =====================
  // --- ORQUE (« livre en main », duel 2) : la géante noire et blanche. Coup de queue qui assomme (livre), sonar, plongeon de 10 tonnes, la bande d'orques.
  //     Point faible (livre) : « elle doit remonter respirer » → toutes les 20 s : « DE L'AIR ! » ; si elle saute, « PFFOUH ! » et sa jauge SUPER grimpe.
  orque: {
    nom: 'ORQUE', art: 'L’ORQUE', fem: true, monde: 'mer', nage: true, respire: true, force: 1.357, spr: true, hPose: ['garde', 'coup'], poseLance: 'coup', col: '#1B2433', clair: '#F4F7FB', fond: '#2E6FB5', K: .46, hp: 112, walk: 5.6, back: 4.4, dash: 15, jumpV: 17, jumpX: 7, grav: .6, etour: 60,
    aie: ['IIIH ?!', 'MA NAGEOIRE !', 'OUILLE, MON AILERON !'], ia: { saut: .5 },
    hurt: { stand: [-680, 640, -760, -140], crouch: [-700, 660, -300, 0], air: [-620, 600, -700, -100] },
    push: [260, 300], reach: 700, speMin: 330, speMax: 1300,
    moves: {
      L: { st: 5, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 6, box: [460, 900, -620, -240], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'MIAM !'], son: 'l' },
      cL: { st: 6, act: 4, rec: 12, dmg: 6, hs: 15, bs: 11, kb: 5, box: [460, 880, -300, 0], lvl: 'low', chain: ['cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'PAR EN BAS !'], son: 'l' },
      H: { st: 12, act: 5, rec: 19, dmg: 13, hs: 20, bs: 15, kb: 12, box: [440, 1000, -660, -200], lvl: 'mid', lunge: 7, chain: ['S', 'SUPER'], mots: ['CROC !', 'CRAC !', 'DENTS DE 8 CM !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [400, 960, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [150, 860, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['SPLASH !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 5, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['VOLTIGE !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 13, act: 6, rec: 24, dmg: 13, hs: 26, bs: 16, kb: 12, assomme: 60, box: [150, 900, -700, -60], lvl: 'mid', mots: ['BAM, LA QUEUE !', 'SPLAF !', 'ASSOMMÉ !'], son: 's', nom: 'Le coup de queue qui assomme', ia: [0, 760, 1.2] },
      SF: { st: 14, act: 4, rec: 22, dmg: 7, hs: 22, bs: 12, kb: 7, lvl: 'mid', proj: { x0: 460, spd: 13, w: 110, h: [-560, -140], life: 95, sonar: true }, mots: ['CLIC CLIC !', 'SONAR !', 'BIIIP !'], son: 's', nom: 'Le sonar', ia: [600, 1600, 1] },
      SD: { st: 46, act: 99, rec: 26, dmg: 15, hs: 22, bs: 16, kb: 10, kd: true, box: [-360, 440, -520, 160], ciel: true, plongeon: true, land: true, lvl: 'high', motsMonte: ['À LA SURFACE !', 'JE VAIS RESPIRER…', 'À TOUT DE SUITE !'], motsTombe: ['PLONGEON DE 10 TONNES !', 'ATTENTION EN DESSOUS !'], mots: ['SPLAAASH !', 'PLOUF GÉANT !', '10 TONNES !'], son: 'h', nom: 'Le plongeon de 10 tonnes', ia: [300, 1500, .5] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -700, 0], lvl: 'mid', clan: 'orque', mots: ['LA BANDE !', 'TOUTE LA FAMILLE !', 'À L’ATTAQUE !'], son: 'h', nom: 'La bande d’orques' },
    },
  },
  // --- GRAND REQUIN BLANC (« livre en main », duel 2) : 300 dents, il attaque par en dessous (livre), la torpille (→★), il sent ses proies (radar, ↓★ : il contre).
  //     Point faible (livre) : « sur le dos, il ne bouge plus » → quand il tombe, il reste figé un moment de plus.
  requin: {
    nom: 'REQUIN BLANC', art: 'LE GRAND REQUIN BLANC', monde: 'mer', nage: true, dosFige: 32, force: 0.854, spr: true, hPose: ['garde', 'coup'], col: '#4B5A68', clair: '#E9EEF2', fond: '#3F7FB8', K: .42, hp: 104, walk: 7, back: 5.2, dash: 19, jumpV: 18, jumpX: 8, grav: .62, etour: 50,
    aie: ['GLOUPS ?!', 'MES DENTS !', 'AÏE, MON AILERON !'], ia: {},
    hurt: { stand: [-650, 640, -720, -170], crouch: [-680, 660, -300, 0], air: [-600, 600, -680, -120] },
    push: [240, 280], reach: 720, speMin: 320, speMax: 1400,
    moves: {
      L: { st: 3, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [460, 900, -620, -240], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'CHOMP !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [460, 880, -300, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'CROC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 11, box: [440, 1020, -680, -200], lvl: 'mid', lunge: 8, chain: ['S', 'SUPER'], mots: ['CHOMP !', 'GROSSE MORSURE !', 'CRAC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [420, 980, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [150, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['CROC !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 75, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 38, act: 99, rec: 28, land: true, dmg: 13, hs: 22, bs: 15, kb: 8, kd: true, lance: 20, box: [-260, 520, -760, 60], plonge: true, surgit: 21, lvl: 'mid', mots: ['PAR EN DESSOUS !', 'SURPRISE D’EN BAS !', 'CHOMP !'], son: 's', nom: 'L’attaque par en dessous', ia: [500, 1400, .25] }, // l'ordi s'en sert peu : sinon il ne fait que ça
      SD: { st: 4, act: 26, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', radar: true, contre: { dmg: 13, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['JE T’AI SENTI !', 'RADAR !'], son: 'h' }, motsContre: ['ZZZT… JE T’AI SENTI !', 'RADAR : TROUVÉ !', 'PAS DE CACHETTE !'], mots: ['RADAR !'], son: 's', nom: 'Le radar', ia: [0, 700, .8] },
      SF: { st: 6, act: 14, rec: 24, dmg: 12, hs: 20, bs: 14, kb: 13, kd: true, box: [250, 960, -620, -200], rush: 30, stopHit: true, vitesse: true, armor: true, lvl: 'mid', mots: ['LA TORPILLE !', 'FIOUUU !', 'ZOOM !'], son: 's', nom: 'La torpille', ia: [450, 1500, 1] },
      SUPER: { st: 12, act: 48, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1000, -600, 0], rush: 12, dents: true, lvl: 'mid', mots: ['CROC !', 'CHOMP !', 'CRAC !', '300 DENTS !'], son: 'h', nom: 'Les 300 dents' },
    },
  },
  // --- PIEUVRE GÉANTE (« livre en main », duel 9) : huit bras à ventouses, le bec caché (livre), le nuage d'encre, le camouflage, la danse des 8 bras.
  //     Point faible (livre) : « vite fatiguée en nageant » → trois sauts ou élans rapprochés : « PFF… FATIGUÉE ! » (plus lente un moment).
  pieuvre: {
    nom: 'PIEUVRE', art: 'LA PIEUVRE GÉANTE', fem: true, monde: 'mer', nage: true, fatigue: true, force: 0.868, spr: true, hPose: ['garde', 'fort'], poseLance: 'special', col: '#C4412B', clair: '#FFD9CC', fond: '#E0674E', K: .42, hp: 110, walk: 5.2, back: 4.4, dash: 15, jumpV: 17, jumpX: 7, grav: .6, etour: 50,
    aie: ['GLOUPS ?!', 'MES BRAS !', 'AÏE, MES VENTOUSES !'], ia: { saut: .4 },
    hurt: { stand: [-520, 520, -760, 0], crouch: [-600, 580, -520, 0], air: [-560, 400, -760, 0] }, // (le manteau et le haut des bras : les bouts de bras ne comptent pas)
    push: [220, 250], reach: 880, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 4, act: 4, rec: 10, dmg: 6, hs: 15, bs: 11, kb: 6, box: [400, 880, -540, -260], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['FLIP !', 'FLAP !', 'SLAP !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [400, 800, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['FLIC !', 'FLOC !'], son: 'l' },
      H: { st: 11, act: 6, rec: 19, dmg: 12, hs: 20, bs: 15, kb: 11, box: [380, 920, -660, -200], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['SCHLOUP !', 'VENTOUSES !', 'COLLÉ !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [380, 820, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'SPLOTCH !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [100, 850, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['SPLASH !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 120, t: 22 }, mots: ['ENROULÉ !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 8, act: 12, rec: 24, dmg: 15, hs: 0, bs: 0, kb: 8, kd: true, rush: 11, lvl: 'mid', prise: { portee: 150, t: 36, degage: false, mot: 'SURPRISE : UN BEC !', haut: 12, loin: 6, rec: 6 }, mots: ['CLAC, LE BEC !', 'CROC !', 'UN BEC CACHÉ !'], son: 'h', nom: 'Le bec caché', ia: [150, 700, 1.1] },
      SF: { st: 12, act: 8, rec: 22, dmg: 1, nuage: { x0: 430, r: 250, life: 190, tick: 30, stun: 44, genre: 'encre' }, lvl: 'mid', mots: ['PSCHHH !', 'L’ENCRE !', 'OÙ SUIS-JE ?'], son: 's', nom: 'Le nuage d’encre', ia: [200, 850, 1] },
      SD: { st: 4, act: 28, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', camoufle: true, contre: { dmg: 12, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['SURPRISE !', 'TU NE M’AVAIS PAS VUE !'], son: 'h' }, motsContre: ['CAMOUFLÉE !', 'COUCOU, C’EST MOI !', 'TU NE M’AVAIS PAS VUE ?'], mots: ['CAMOUFLAGE !'], son: 's', nom: 'Le camouflage', ia: [0, 700, .8] },
      SUPER: { st: 14, act: 48, rec: 22, dmg: 4, hits: 8, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 920, -720, 0], rush: 8, compte: true, lvl: 'mid', mots: ['HUIT BRAS !'], son: 'h', nom: 'La danse des 8 bras' },
    },
  },
  // --- AIGUILLAT (« livre en main », duel 9) : le petit requin à épines. Il se plie et pique (livre, venin), la flèche grise, l'épine du dos, la bande (il chasse par milliers).
  //     Point faible (livre) : « petit, pour un requin » → il vole plus loin quand il est touché (léger).
  aiguillat: {
    nom: 'AIGUILLAT', art: 'L’AIGUILLAT', monde: 'mer', nage: true, leger: 1.15, force: 0.717, spr: true, hPose: ['garde', 'coup'], col: '#5B6776', clair: '#EEF2F6', fond: '#6F8FB0', K: .36, hp: 104, walk: 7.6, back: 5.8, dash: 21, jumpV: 19, jumpX: 9, grav: .62, etour: 44,
    aie: ['AÏE ?!', 'MES ÉPINES !', 'OUILLE, MON AILERON !'], ia: { saut: .6 },
    hurt: { stand: [-680, 600, -560, -120], crouch: [-700, 620, -330, 0], air: [-640, 560, -560, -100] },
    push: [190, 215], reach: 640, speMin: 280, speMax: 1300,
    moves: {
      L: { st: 3, act: 3, rec: 8, dmg: 5, hs: 14, bs: 10, kb: 5, box: [450, 920, -500, -140], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'CHOMP !'], son: 'l' },
      cL: { st: 3, act: 3, rec: 9, dmg: 4, hs: 13, bs: 10, kb: 4, box: [450, 900, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'TIC !'], son: 'l' },
      H: { st: 9, act: 5, rec: 17, dmg: 11, hs: 19, bs: 14, kb: 11, box: [420, 980, -540, -120], lvl: 'mid', lunge: 10, armor: true, chain: ['S', 'SUPER'], mots: ['CHOMP !', 'GROS CROC !', 'CRAC !'], son: 'h' },
      cH: { st: 7, act: 4, rec: 20, dmg: 8, hs: 17, bs: 12, kb: 8, kd: true, box: [420, 920, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [150, 820, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['CROC !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 3, act: 3, rec: 20, dmg: 10, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 9, act: 6, rec: 22, dmg: 9, hs: 22, bs: 15, kb: 9, box: [100, 880, -760, -40], lvl: 'mid', venin: { t: 360, tick: 30, dmg: 1, lent: .75 }, mots: ['PIQUÉ !', 'ÉPINE À VENIN !', 'ÇA PIQUE !'], son: 's', nom: 'Il se plie et pique', ia: [0, 650, 1.2] },
      SF: { st: 5, act: 12, rec: 24, dmg: 10, hs: 20, bs: 14, kb: 12, kd: true, box: [250, 800, -520, -120], rush: 30, stopHit: true, vitesse: true, armor: true, inv: 8, lvl: 'mid', mots: ['ZOUM !', 'LA FLÈCHE GRISE !', 'FIOUUU !'], son: 's', nom: 'La flèche grise', ia: [400, 1400, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 19], land: true, box: [120, 760, -820, -150], venin: { t: 240, tick: 30, dmg: 1 }, lvl: 'mid', mots: ['L’ÉPINE DU DOS !', 'PIC !'], son: 's', nom: 'L’épine du dos', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -700, 0], lvl: 'mid', clan: 'aiguillat', mots: ['EN BANDE !', 'PAR MILLIERS !', 'TOUS ENSEMBLE !'], son: 'h', nom: 'La bande des mille' },
    },
  },
  // --- ESPADON (« livre en main », duel 17) : l'épée ! La plus longue portée de la mer. Il tranche d'un coup de tête (livre), la charge (épée coincée dans le mur !), l'épée vers le ciel, la tempête d'épée.
  //     Point faible (livre) : « ni dents ni écailles » → il prend un peu plus cher (peau 1.1).
  espadon: {
    nom: 'ESPADON', art: 'L’ESPADON', monde: 'mer', nage: true, peau: 1.15, force: 0.743, spr: true, hPose: ['garde', 'coup'], col: '#4B3A5E', clair: '#F2E6C9', fond: '#7A5FA0', K: .42, hp: 100, walk: 6.6, back: 5, dash: 20, jumpV: 18, jumpX: 8.5, grav: .62, etour: 48,
    aie: ['OUILLE ?!', 'MON ÉPÉE !', 'AÏE, MON NEZ !'], ia: { saut: .5 },
    hurt: { stand: [-560, 500, -620, -140], crouch: [-600, 500, -300, 0], air: [-520, 480, -600, -120] }, // (le corps et le début de l'épée)
    push: [220, 250], reach: 950, speMin: 350, speMax: 1400,
    moves: {
      L: { st: 4, act: 3, rec: 10, dmg: 6, hs: 15, bs: 11, kb: 6, box: [450, 880, -450, -280], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['TCHAC !', 'EN GARDE !', 'TOUCHÉ !'], son: 'l' },
      cL: { st: 5, act: 3, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [440, 920, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'PIC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 19, dmg: 12, hs: 20, bs: 15, kb: 11, box: [380, 880, -620, -80], lvl: 'mid', armor: true, chain: ['S', 'SUPER'], mots: ['SCHLING !', 'ZING !', 'TCHAC !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [400, 920, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'ZING !'], son: 'h' },
      A: { st: 4, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [150, 950, -500, 100], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['PIC !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 13, act: 6, rec: 24, dmg: 15, hs: 24, bs: 17, kb: 16, kd: true, casse: true, box: [200, 920, -900, -100], lvl: 'mid', mots: ['SCHLAAAK !', 'TRANCHÉ !', 'COUP DE TÊTE !'], son: 's', nom: 'Le coup de tête qui tranche', ia: [0, 1050, 1.2] },
      SF: { st: 8, act: 16, rec: 26, dmg: 13, hs: 20, bs: 14, kb: 14, kd: true, box: [350, 960, -470, -250], rush: 26, stopHit: true, vitesse: true, armor: true, bonk: 'epee', lvl: 'mid', mots: ['LA CHARGE !', 'EN AVANT !', 'FIOUUU !'], son: 's', nom: 'La charge de l’épée', ia: [500, 1500, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, inv: 8, saute: [4, 20], land: true, box: [-150, 320, -1500, -400], lvl: 'mid', mots: ['L’ÉPÉE VERS LE CIEL !', 'ZING !'], son: 's', nom: 'L’épée vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 12, act: 48, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 950, -700, 0], rush: 12, vitesse: true, lvl: 'mid', mots: ['ZING !', 'ZANG !', 'ZOUNG !', 'TOUCHÉ !'], son: 'h', nom: 'La tempête d’épée' },
    },
  },
  // --- REQUIN BLEU (« livre en main », duel 17) : il tourne autour de sa proie (livre : il passe derrière et mord), les dents en scie, le museau en l'air, la tornade bleue.
  //     Point faible (livre) : « il se balade à 1 km/h » → la marche la plus lente de la mer (mais ses élans sont rapides).
  requinbleu: {
    nom: 'REQUIN BLEU', art: 'LE REQUIN BLEU', monde: 'mer', nage: true, force: 0.809, spr: true, hPose: ['garde', 'coup'], col: '#1F4FA8', clair: '#EAF3FF', fond: '#2D73D6', K: .42, hp: 108, walk: 4.4, back: 3.8, dash: 22, jumpV: 18, jumpX: 8, grav: .62, etour: 50,
    aie: ['GLOUPS ?!', 'MES NAGEOIRES !', 'AÏE, MON MUSEAU !'], ia: {},
    hurt: { stand: [-700, 640, -540, -130], crouch: [-720, 660, -300, 0], air: [-660, 600, -540, -110] },
    push: [230, 260], reach: 720, speMin: 320, speMax: 1300,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [460, 900, -500, -170], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'CHOMP !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [460, 900, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'CROC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 11, box: [440, 1000, -520, -150], lvl: 'mid', lunge: 8, armor: true, chain: ['S', 'SUPER'], mots: ['SCRITCH !', 'CHOMP !', 'DENTS EN SCIE !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [420, 980, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [150, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['CROC !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 75, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 30, act: 6, rec: 22, dmg: 12, hs: 22, bs: 15, kb: 12, kd: true, contourne: true, box: [100, 940, -560, -120], lvl: 'mid', mots: ['COUCOU, DERRIÈRE !', 'JE TOURNE… CHOMP !', 'PAR-DERRIÈRE !'], son: 's', nom: 'Il tourne autour', ia: [200, 1200, 1] },
      SF: { st: 6, act: 20, rec: 24, dmg: 5, hits: 3, hs: 18, bs: 12, kb: 5, kd: true, box: [250, 940, -520, -150], rush: 22, stopHit: false, vitesse: true, lvl: 'mid', mots: ['SCRITCH !', 'SCRITCH-SCRATCH !', 'EN SCIE !'], son: 's', nom: 'Les dents en scie', ia: [400, 1300, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, inv: 8, saute: [3, 20], land: true, box: [100, 700, -1100, -150], lvl: 'mid', mots: ['LE MUSEAU EN L’AIR !', 'CHOMP !'], son: 's', nom: 'Le museau en l’air', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 48, rec: 22, dmg: 4, hits: 8, hs: 16, bs: 8, kb: 3, kd: true, box: [-700, 1000, -650, 0], tornade: true, lvl: 'mid', mots: ['JE TOURNE !', 'TOURNE ENCORE !', 'LA TORNADE BLEUE !'], son: 'h', nom: 'La tornade bleue' },
    },
  },
  // --- MÉGALODON (légendaire de la MER, hors livre : NHM, Smithsonian, Florida Museum) : le plus gros requin de tous les temps. La mâchoire géante, la vague géante,
  //     surgi des profondeurs, les dents de 18 cm. Il se gagne en battant tous les animaux de la mer en GOD MODE.
  megalo: {
    nom: 'MÉGALODON', art: 'LE MÉGALODON', monde: 'mer', nage: true, force: 1.12, spr: true, hPose: ['garde', 'coup'], col: '#3A4A5C', clair: '#F2F5F8', fond: '#1F3F66', K: .54, hp: 115, walk: 5.6, back: 4.6, dash: 18, jumpV: 16, jumpX: 7, grav: .6, etour: 70,
    aie: ['GRRR ?!', 'MES DENTS !', 'AÏE, MA MÂCHOIRE !'], ia: {},
    hurt: { stand: [-700, 680, -760, -140], crouch: [-720, 700, -330, 0], air: [-660, 640, -720, -110] },
    push: [270, 310], reach: 800, speMin: 330, speMax: 1400,
    moves: {
      L: { st: 5, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 7, box: [420, 850, -640, -220], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CHOMP !', 'CLAC !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 6, hs: 15, bs: 11, kb: 6, box: [420, 830, -300, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'CROC !'], son: 'l' },
      H: { st: 12, act: 5, rec: 20, dmg: 13, hs: 22, bs: 16, kb: 13, box: [400, 950, -700, -160], lvl: 'mid', lunge: 7, chain: ['S', 'SUPER'], mots: ['MÉGA-CHOMP !', 'CRAC !', 'CROC GÉANT !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 10, kd: true, box: [380, 900, -240, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 5, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [150, 900, -440, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['SPLASH !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 5, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 13, kd: true, lvl: 'mid', prise: { portee: 90, t: 22 }, mots: ['ATTRAPÉ !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 12, act: 6, rec: 26, dmg: 16, hs: 26, bs: 18, kb: 16, kd: true, casse: true, box: [200, 1000, -760, -40], lvl: 'mid', mots: ['MÂCHOIRE GÉANTE !', 'MÉGA-CROC !', 'CRAAAC !'], son: 's', nom: 'La mâchoire géante', ia: [0, 800, 1.2] },
      SF: { st: 16, act: 4, rec: 24, dmg: 9, hs: 22, bs: 12, kb: 12, kd: true, lvl: 'mid', proj: { x0: 460, spd: 11, w: 170, h: [-420, 0], life: 110, vague: true }, mots: ['LA VAGUE GÉANTE !', 'SPLAAASH !'], son: 's', nom: 'La vague géante', ia: [500, 1600, 1] },
      SD: { st: 38, act: 99, rec: 28, land: true, dmg: 13, hs: 22, bs: 15, kb: 8, kd: true, lance: 21, box: [-280, 560, -820, 60], plonge: true, surgit: 22, lvl: 'mid', mots: ['SURGI DES PROFONDEURS !', 'SURPRISE GÉANTE !', 'CHOMP !'], son: 's', nom: 'Surgi des profondeurs', ia: [500, 1400, .3] },
      SUPER: { st: 12, act: 48, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1100, -700, 0], rush: 12, dents: true, lvl: 'mid', mots: ['CROC !', 'CHOMP !', 'DES DENTS DE 18 CM !'], son: 'h', nom: 'Les dents de 18 cm' },
    },
  },
  // --- JAGUAR (« livre en main », duels 7 et 15, p. 17 et 35) : la morsure perce-crâne, l'attaque par-derrière, la griffe vers le ciel, le jaguar tout noir.
  //     Points faibles (livre) : « des pattes courtes pour un félin » (il saute moins haut que les autres chats) ; « repéré, il rate son coup » (l'attaque par-derrière rate si l'autre se protège).
  jaguar: {
    nom: 'JAGUAR', art: 'LE JAGUAR', force: 0.767, spr: true, hPose: ['garde', 'fort'], col: '#9A6A1C', clair: '#F5CD7A', fond: '#B98A2E', K: .46, hp: 108, walk: 6.6, back: 5, dash: 17, jumpV: 21, jumpX: 8, grav: 1.12, etour: 50,
    aie: ['MIAOU ?!', 'MON MUSEAU !', 'OUILLE, MES PATTES !'], ia: { saut: .7 },
    hurt: { stand: [-480, 600, -640, 0], crouch: [-480, 620, -420, 0], air: [-440, 580, -560, 0] },
    push: [200, 240], reach: 700, speMin: 300, speMax: 1100,
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [520, 980, -660, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRITCH !', 'GRIFF !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [500, 960, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'SCRITCH !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 12, box: [480, 1040, -640, -40], lvl: 'mid', lunge: 5, chain: ['S', 'SUPER'], mots: ['CRAC !', 'CROC !', 'CROC DE FER !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [480, 1000, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [250, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'GRIFF !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 10, act: 5, rec: 24, dmg: 15, hs: 24, bs: 18, kb: 14, kd: true, casse: true, lunge: 7, box: [440, 1000, -700, -120], lvl: 'mid', mots: ['PERCE-CRÂNE !', 'CRAC !', 'MORSURE DE FER !'], son: 's', nom: 'La morsure perce-crâne', ia: [0, 900, 1.2] },
      SF: { st: 30, act: 6, rec: 22, dmg: 13, hs: 22, bs: 15, kb: 12, kd: true, contourne: 'herbe', repere: true, box: [100, 940, -600, -40], lvl: 'mid', mots: ['COUCOU, DERRIÈRE !', 'PAR-DERRIÈRE !', 'SURPRISE !'], son: 's', nom: 'L’attaque par-derrière', ia: [200, 1200, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 19, aa: true, inv: 8, saute: [3, 19], land: true, box: [150, 800, -900, -200], lvl: 'mid', mots: ['LA PATTE EN L’AIR !', 'GRIFF !'], son: 's', nom: 'La griffe vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 50, rec: 22, dmg: 5, hits: 6, hs: 20, bs: 8, kb: 3, kd: true, box: [200, 1000, -700, 0], rush: 11, noir: true, lvl: 'mid', mots: ['TOUT NOIR !', 'DANS L’OMBRE…', 'CROC !'], son: 'h', nom: 'Le jaguar tout noir' }, // (livre p. 35 : un jaguar au pelage tout noir ; le mot du titre de cet encart est une réponse du léopard : jamais affiché)
    },
  },

  // --- ANACONDA (« livre en main », duel 7, p. 17) : un corps de près de 4 m, il serre à bloquer le sang, caché dans l'herbe, sous l'eau, les bébés anacondas.
  //     Point faible (livre) : « lent et maladroit sur terre » → la marche la plus lente (plus vif dans la rivière, le marais et le Pantanal).
  anaconda: {
    nom: 'ANACONDA', art: 'L’ANACONDA', serpent: true, expose: true, maladroit: true, force: 0.854, spr: true, poseLance: 'serre', hPose: ['garde', 'fort'], col: '#8A8A2A', clair: '#F2EDA0', fond: '#A6A23A', K: .44, hp: 104, walk: 4, back: 3.6, dash: 18, jumpV: 18, jumpX: 8, grav: 1.1, etour: 50,
    aie: ['SSS ?!', 'MA QUEUE !', 'AÏE, MES ÉCAILLES !'], ia: {},
    hurt: { stand: [-480, 580, -660, 0], crouch: [-500, 700, -260, 0], air: [-440, 560, -600, 0] },
    push: [200, 240], reach: 700, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 6, act: 4, rec: 10, dmg: 6, hs: 15, bs: 11, kb: 6, box: [520, 1000, -560, -200], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['SSSCLAC !', 'CROC !', 'TCHAC !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [520, 900, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['FLIC !', 'FOUETTÉ !'], son: 'l' },
      H: { st: 11, act: 6, rec: 19, dmg: 12, hs: 20, bs: 15, kb: 11, box: [600, 1150, -560, -160], lvl: 'mid', lunge: 4, chain: ['S', 'SUPER'], mots: ['SSSCHLAC !', 'GROSSE MORSURE !', 'CROC !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [500, 900, -240, 0], lvl: 'low', chain: ['S'], mots: ['PAR EN BAS !', 'SSSCLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [150, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'SSSCLAC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 110, t: 22 }, mots: ['ENROULÉ !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 8, act: 12, rec: 24, dmg: 13, hs: 0, bs: 0, kb: 8, kd: true, rush: 10, lvl: 'mid', serre: true, prise: { portee: 150, t: 46, degage: false, mot: 'IL SERRE !', haut: 10, loin: 6, rec: 6 }, mots: ['JE SERRE !', 'SERRÉ !', 'PLUS UN GESTE !'], son: 'h', nom: 'Il serre à bloquer le sang', ia: [150, 700, 1.1] },
      SF: { land: true, st: 36, act: 99, rec: 26, dmg: 12, hs: 22, bs: 15, kb: 8, kd: true, lance: 19, box: [-260, 560, -760, 60], plonge: true, surgit: 20, lvl: 'mid', mots: ['SURPRISE DE L’EAU !', 'SPLASH !', 'SSSCLAC !'], son: 's', nom: 'Sous l’eau', ia: [500, 1400, .4] },
      SD: { st: 4, act: 28, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', camoufle: 'herbe', contre: { dmg: 12, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['CACHÉ DANS L’HERBE !', 'SURPRISE !'], son: 'h' }, motsContre: ['TU NE M’AVAIS PAS VU !', 'CACHÉ DANS L’HERBE !', 'SSSURPRISE !'], mots: ['CHUT… DANS L’HERBE'], son: 's', nom: 'Caché dans l’herbe', ia: [0, 700, .8] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -500, 0], lvl: 'mid', clan: 'anaconda', mots: ['LES BÉBÉS !', '40 BÉBÉS D’UN COUP !', 'SSSSS !'], son: 'h', nom: 'Les bébés anacondas' },
    },
  },

  // --- CAÏMAN (« livre en main », duel 15, p. 35) : une peau à plaques d'os (armure), il plonge pour se cacher, la sieste au soleil, 10 millions de caïmans.
  //     Point faible (livre) : « lent quand il est à terre » → marche lente (sauf dans l'eau).
  caiman: {
    nom: 'CAÏMAN', art: 'LE CAÏMAN', maladroit: true, peau: .92, force: 0.92, spr: true, hPose: ['garde', 'coup'], col: '#5E6B3A', clair: '#E3E0B0', fond: '#70803E', K: .42, hp: 104, walk: 4.6, back: 4, dash: 16, jumpV: 18, jumpX: 8, grav: 1.1, etour: 52,
    aie: ['GRRR ?!', 'MA QUEUE !', 'AÏE, MES ÉCAILLES !'], ia: {},
    hurt: { stand: [-560, 640, -700, 0], crouch: [-580, 660, -420, 0], air: [-500, 600, -600, 0] },
    push: [220, 260], reach: 720, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 4, act: 4, rec: 10, dmg: 6, hs: 15, bs: 11, kb: 6, box: [480, 960, -420, 0], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'CROC !', 'CHOMP !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [480, 960, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'TIC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 19, dmg: 12, hs: 20, bs: 15, kb: 11, box: [460, 1040, -460, 0], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['CHOMP !', 'CLAC-CLAC !', 'CROC !'], son: 'h' },
      cH: { st: 8, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [-500, 1000, -200, 0], lvl: 'low', chain: ['S'], mots: ['COUP DE QUEUE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [150, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'CLAC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { land: true, st: 34, act: 99, rec: 26, dmg: 13, hs: 22, bs: 15, kb: 8, kd: true, lance: 19, box: [-300, 760, -760, 0], plonge: true, lvl: 'mid', mots: ['SURPRISE !', 'PLOUF… CHOMP !', 'CACHÉ !'], son: 'h', nom: 'Il plonge pour se cacher', ia: [500, 1400, .5] },
      SF: { st: 4, act: 40, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', sieste: true, contre: { dmg: 14, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['JE NE DORMAIS PAS !', 'CLAC !'], son: 'h' }, motsContre: ['JE NE DORMAIS PAS !', 'TU CROYAIS QUE JE DORMAIS ?', 'RÉVEILLÉ !'], mots: ['ZZZ…'], son: 's', nom: 'La sieste au soleil', ia: [0, 700, .8] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 7, saute: [2, 18], land: true, box: [100, 760, -860, -150], lvl: 'mid', mots: ['LA MÂCHOIRE EN L’AIR !', 'CLAC !'], son: 's', nom: 'La mâchoire vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -420, 0], lvl: 'mid', clan: 'caiman', mots: ['10 MILLIONS DE CAÏMANS !', 'TOUT LE PANTANAL !', 'CLAC-CLAC-CLAC !'], son: 'h', nom: 'Les 10 millions du Pantanal' },
    },
  },

  // --- PUMA (« livre en main », duel 11, p. 27) : de grosses pattes griffues, il saute sur le dos et mord, le saut de 5,50 m, 2 400 km à pied.
  //     Point faible (livre) : « il fuit devant une meute » → les attaques en bande (meute, clan, troupe) lui font plus mal, et il panique.
  puma: {
    nom: 'PUMA', art: 'LE PUMA', meute: 1.35, force: 0.75, spr: true, hPose: ['garde', 'fort'], col: '#A0703A', clair: '#F3D9A8', fond: '#B98A55', K: .43, hp: 100, walk: 7, back: 5.3, dash: 18, jumpV: 29, jumpX: 9, grav: 1.15, etour: 46,
    aie: ['MIAOU ?!', 'MES PATTES !', 'OUILLE, MA QUEUE !'], ia: { saut: 1.2 },
    hurt: { stand: [-470, 600, -700, 0], crouch: [-470, 620, -440, 0], air: [-420, 580, -600, 0] },
    push: [190, 230], reach: 700, speMin: 300, speMax: 1100,
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [520, 1000, -680, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRITCH !', 'GRIFF !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [500, 960, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'SCRITCH !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 12, box: [480, 1060, -680, -40], lvl: 'mid', lunge: 5, chain: ['S', 'SUPER'], mots: ['GROSSE PATTE !', 'CRAC !', 'PAF !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [480, 1020, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [250, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'GRIFF !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 7, act: 12, rec: 24, dmg: 15, hs: 0, bs: 0, kb: 8, kd: true, rush: 13, lvl: 'mid', prise: { portee: 120, t: 32, degage: false, mot: 'SUR LE DOS !', haut: 16, loin: 7, rec: 6 }, mots: ['SUR TON DOS !', 'CROC !'], son: 'h', nom: 'Il saute sur le dos et mord', ia: [150, 650, 1.1] },
      SF: { st: 9, act: 99, rec: 20, dmg: 13, hs: 0, bs: 16, kb: 14, kd: true, box: [150, 900, -520, 160], saute: [11, 34], dive: 7, land: true, quakeLand: true, lvl: 'high', mots: ['5,50 M !', 'TOUT LÀ-HAUT !', 'ATTERRISSAGE !'], son: 's', nom: 'Le saut de 5,50 m', ia: [450, 1100, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 19, aa: true, inv: 8, saute: [3, 21], land: true, box: [150, 820, -950, -200], lvl: 'mid', mots: ['GROSSES PATTES !', 'GRIFF !'], son: 's', nom: 'Les grosses pattes griffues', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 50, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1000, -700, 0], rush: 20, vitesse: true, lvl: 'mid', mots: ['2 400 KM À PIED !', 'ENCORE UN PEU !', 'JE TRAVERSE TOUT !'], son: 'h', nom: '2 400 km à pied' },
    },
  },

  // --- LOUP (« livre en main », duel 11, p. 27) : des crocs qui percent le cuir, il blesse, puis il attend, le hurlement, la meute (37 loups !). (livre en main : « allô » et « faux », jamais affichés)
  //     Point faible (livre) : « il ne grimpe pas aux arbres » → le plus petit saut des animaux de la terre.
  loup: {
    nom: 'LOUP', art: 'LE LOUP', force: 0.767, spr: true, hPose: ['garde', 'coup'], col: '#6B6F78', clair: '#E8E6DF', fond: '#7C8494', K: .4, hp: 102, walk: 6.8, back: 5.6, dash: 18, jumpV: 17, jumpX: 8, grav: 1.15, etour: 48,
    aie: ['OUAF ?!', 'MA QUEUE !', 'AÏE, MES OREILLES !'], ia: { saut: .5 },
    hurt: { stand: [-480, 580, -640, 0], crouch: [-480, 600, -420, 0], air: [-440, 560, -560, 0] },
    push: [190, 225], reach: 680, speMin: 300, speMax: 1100,
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [500, 960, -600, -100], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'OUAF !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [480, 940, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'TIC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 12, box: [480, 1020, -620, -60], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['CROC !', 'PERCE-CUIR !', 'GRRR !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [480, 1000, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [250, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CROC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 11, act: 5, rec: 14, dmg: 8, hs: 20, bs: 14, kb: 10, box: [460, 1000, -600, -60], lunge: 8, recule: 8, lvl: 'mid', venin: { t: 200, tick: 25, dmg: 1, genre: 'blesse' }, mots: ['CROC… ET J’ATTENDS !', 'BLESSÉ !', 'PATIENCE…'], son: 's', nom: 'Il blesse, puis il attend', ia: [300, 850, .8] }, // (réglé : l'ordi en abusait)
      SF: { st: 18, act: 20, rec: 20, dmg: 3, hs: 0, bs: 0, kb: 16, lvl: 'mid', peur: true, box: [300, 900, -700, 0], hurle: true, mots: ['AOUUUH !', 'AOUUUUUH !', 'OUH-OUH !'], son: 's', nom: 'Le hurlement', ia: [300, 850, .5] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 16, aa: true, inv: 8, saute: [3, 17], land: true, box: [150, 800, -820, -150], lvl: 'mid', mots: ['CROC EN L’AIR !', 'CLAC !'], son: 's', nom: 'Le croc en l’air', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -700, 0], lvl: 'mid', clan: 'loup', mots: ['LA MEUTE !', '37 LOUPS !', 'AOUUUH !'], son: 'h', nom: 'La meute' },
    },
  },

  // --- MANGOUSTE (« livre en main », duel 14, p. 33) : 40 dents pointues, elle esquive, puis mord la tête, la danse, elle croque le dard.
  //     Point faible (livre) : « trop de venin peut la tuer » → le venin lui fait deux fois plus mal. Toute petite : elle vole plus loin (légère).
  mangouste: {
    nom: 'MANGOUSTE', art: 'LA MANGOUSTE', fem: true, sensVenin: 2, leger: 1.2, force: 0.925, spr: true, hPose: ['garde', 'coup'], col: '#8C7A5C', clair: '#EEE3CC', fond: '#A08E6E', K: .35, hp: 100, walk: 8, back: 6.2, dash: 22, jumpV: 24, jumpX: 10, grav: 1.2, etour: 40,
    aie: ['IIIK ?!', 'MA QUEUE !', 'AÏE, MON NEZ !'], ia: { saut: .9 },
    hurt: { stand: [-460, 560, -620, 0], crouch: [-460, 580, -380, 0], air: [-420, 540, -560, 0] },
    push: [150, 180], reach: 600, speMin: 260, speMax: 1000,
    moves: {
      L: { st: 3, act: 3, rec: 8, dmg: 5, hs: 14, bs: 10, kb: 5, box: [450, 900, -560, -80], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'TIC !', '40 DENTS !'], son: 'l' },
      cL: { st: 3, act: 3, rec: 9, dmg: 4, hs: 13, bs: 10, kb: 4, box: [450, 880, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CLAC !'], son: 'l' },
      H: { st: 9, act: 5, rec: 17, dmg: 11, hs: 19, bs: 14, kb: 11, box: [420, 980, -600, -60], lvl: 'mid', lunge: 9, chain: ['S', 'SUPER'], mots: ['CROC !', 'CRAC !', 'CROUNCH !'], son: 'h' },
      cH: { st: 7, act: 4, rec: 20, dmg: 8, hs: 17, bs: 12, kb: 8, kd: true, box: [420, 940, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'HOP !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [200, 820, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CROC !'], son: 'l' },
      T: { st: 3, act: 3, rec: 20, dmg: 10, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'HOP !'], son: 'h' },
      S: { st: 3, act: 30, rec: 18, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', esquive: true, contre: { dmg: 14, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['ESQUIVE… ET CROC !', 'PAS LÀ !'], son: 'h' }, motsContre: ['ESQUIVE… CROC, LA TÊTE !', 'RATÉ ! À MOI !', 'TROP LENT !'], mots: ['JE DANSE…'], son: 's', nom: 'Elle esquive, puis mord la tête', ia: [0, 700, 1] },
      SF: { st: 5, act: 12, rec: 22, dmg: 10, hs: 20, bs: 14, kb: 12, kd: true, box: [250, 820, -520, -60], rush: 30, stopHit: true, vitesse: true, inv: 10, lvl: 'mid', mots: ['ZIOUM !', 'TROP RAPIDE !', 'HOP !'], son: 's', nom: 'Sa vraie arme : la vitesse', ia: [400, 1400, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 9, saute: [3, 22], land: true, box: [120, 760, -860, -150], lvl: 'mid', mots: ['LE SAUT SUR LA TÊTE !', 'CROC !'], son: 's', nom: 'Le saut sur la tête', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 50, rec: 22, dmg: 4, hits: 8, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 950, -650, 0], rush: 9, inv: 50, danse: true, lvl: 'mid', mots: ['LA DANSE !', 'ESQUIVE !', 'CROC !', 'ET HOP !'], son: 'h', nom: 'La danse de la mangouste' },
    },
  },

  // --- COBRA (« livre en main », duels 14 et 23, p. 33 et 53 ; le cobra royal du duel 23 est joué par le même animal) :
  //     un venin mortel, il ouvre son capuchon (l'autre prend peur), dressé, il poursuit l'ennemi, le roi des serpents.
  //     Points faibles (livre) : « il frappe trop lentement » (morsures lentes à partir) ; « serré, il est en danger » (les prises lui font plus mal).
  cobra: {
    nom: 'COBRA', art: 'LE COBRA', serpent: true, expose: true, fragilePrise: 1.35, force: 1.06, spr: true, hPose: ['garde', 'coup'], col: '#6E5A2E', clair: '#EDE0B6', fond: '#8A7440', K: .4, hp: 102, walk: 5.2, back: 4.4, dash: 17, jumpV: 19, jumpX: 8, grav: 1.1, etour: 46,
    aie: ['SSS ?!', 'MON CAPUCHON !', 'AÏE, MA QUEUE !'], ia: {},
    hurt: { stand: [-420, 460, -820, 0], crouch: [-460, 500, -360, 0], air: [-400, 440, -700, 0] },
    push: [180, 215], reach: 760, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 6, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 6, box: [380, 900, -760, -300], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['SSSCLAC !', 'TCHAC !', 'CROC !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [380, 920, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['FLIC !', 'SSS !'], son: 'l' },
      H: { st: 13, act: 5, rec: 19, dmg: 13, hs: 20, bs: 15, kb: 11, box: [360, 1040, -780, -200], lvl: 'mid', lunge: 7, chain: ['S', 'SUPER'], mots: ['SSSCHLAC !', 'MORSURE !', 'TCHAC !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [300, 1000, -200, 0], lvl: 'low', chain: ['S'], mots: ['COUP DE QUEUE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [150, 860, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'SSS !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 90, t: 20 }, mots: ['ENROULÉ !', 'HOP !'], son: 'h' },
      S: { st: 12, act: 30, rec: 20, dmg: 2, hs: 0, bs: 0, kb: 16, peur: true, box: [250, 900, -800, 0], capuchon: true, lvl: 'mid', mots: ['LE CAPUCHON !', 'SSSSSS !', 'PEUR ?'], son: 's', nom: 'Il ouvre son capuchon', ia: [200, 900, .9] },
      SF: { st: 8, act: 16, rec: 24, dmg: 10, hs: 20, bs: 14, kb: 10, box: [300, 900, -800, -200], rush: 16, stopHit: true, venin: { t: 360, tick: 24, dmg: 1, lent: .7 }, lvl: 'mid', mots: ['DRESSÉ… JE TE SUIS !', 'SSSCLAC !', 'VENIN !'], son: 's', nom: 'Dressé, il poursuit l’ennemi', ia: [350, 1200, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [2, 19], land: true, box: [100, 720, -1000, -200], venin: { t: 240, tick: 30, dmg: 1 }, lvl: 'mid', mots: ['MORSURE EN L’AIR !', 'SSS !'], son: 's', nom: 'La morsure vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 44, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1000, -800, 0], rush: 10, venin: { t: 420, tick: 20, dmg: 1, lent: .6 }, lvl: 'mid', mots: ['LE ROI DES SERPENTS !', 'SSSSSS !', 'VENIN ROYAL !'], son: 'h', nom: 'Le venin royal' },
    },
  },
  // --- OURS NOIR (« livre en main », duel 19, p. 43) : des griffes courbes, il charge pour faire peur, la pause goûter, l'ours esprit (tout blanc).
  //     Point faible (livre) : « plus gourmand que bagarreur » → il frappe moins fort qu'un grizzly, et la caisse « MIAM » le soigne deux fois plus.
  oursnoir: {
    nom: 'OURS NOIR', art: 'L’OURS NOIR', gourmand: true, force: 0.889, spr: true, hPose: ['garde', 'fort'], col: '#2B2A2E', clair: '#D9C9A8', fond: '#4A4650', K: .44, hp: 114, walk: 5.8, back: 4.4, dash: 15, jumpV: 19, jumpX: 7, grav: 1.2, etour: 56,
    aie: ['GROAR ?!', 'MON MUSEAU !', 'AÏE, MES GRIFFES !'], ia: {},
    hurt: { stand: [-520, 600, -700, 0], crouch: [-520, 620, -440, 0], air: [-480, 560, -620, 0] },
    push: [220, 260], reach: 700, speMin: 300, speMax: 1100,
    moves: {
      L: { st: 5, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 7, box: [480, 960, -660, -100], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRITCH !', 'BAM !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 6, hs: 15, bs: 11, kb: 6, box: [460, 940, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'SCRITCH !'], son: 'l' },
      H: { st: 12, act: 5, rec: 20, dmg: 14, hs: 21, bs: 16, kb: 13, box: [460, 1040, -720, -40], lvl: 'mid', lunge: 5, armor: true, chain: ['S', 'SUPER'], mots: ['GRIFFES COURBES !', 'BAM !', 'CRAC !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [460, 1000, -240, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [200, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'BAM !'], son: 'l' },
      T: { st: 5, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 13, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['CÂLIN D’OURS !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 8, act: 14, rec: 18, dmg: 3, hs: 0, bs: 0, kb: 18, peur: true, box: [300, 900, -720, 0], rush: 17, stopHit: true, faux: 12, lvl: 'mid', mots: ['BOUH !', 'FAUSSE CHARGE !', 'HA HA, PEUR ?'], son: 's', nom: 'Il charge pour faire peur', ia: [300, 1000, 1] },
      SF: { st: 6, act: 90, rec: 16, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', gouter: 10, mots: ['MIAM, DES BAIES !'], son: 's', nom: 'La pause goûter', ia: [900, 1900, .5] },
      SD: { st: 3, act: 99, rec: 22, dmg: 12, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, inv: 7, saute: [1, 18], land: true, box: [150, 800, -950, -250], lvl: 'mid', mots: ['GRIFFES EN L’AIR !', 'BAM !'], son: 's', nom: 'Les griffes courbes', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 46, rec: 22, dmg: 5, hits: 6, hs: 20, bs: 8, kb: 3, kd: true, box: [250, 1050, -760, 0], rush: 12, esprit: true, lvl: 'mid', mots: ['L’OURS ESPRIT !', 'TOUT BLANC !', 'BOUH !'], son: 'h', nom: 'L’ours esprit' },
    },
  },
  // --- GLOUTON (« livre en main », duel 19, p. 43) : une dent pour la viande gelée, il gronde et fonce, des raquettes aux pattes, il ne recule jamais.
  //     Point faible (livre) : « des pattes courtes » → petite portée et petits sauts.
  glouton: {
    nom: 'GLOUTON', art: 'LE GLOUTON', force: 0.762, spr: true, hPose: ['garde', 'coup'], col: '#4A3526', clair: '#E3C89A', fond: '#6B4E36', K: .38, hp: 110, walk: 7, back: 5.4, dash: 19, jumpV: 18, jumpX: 8, grav: 1.2, etour: 44,
    aie: ['GRRR ?!', 'MA DENT !', 'AÏE, MES PATTES !'], ia: { saut: .5 },
    hurt: { stand: [-460, 560, -560, 0], crouch: [-460, 580, -360, 0], air: [-420, 540, -500, 0] },
    push: [170, 205], reach: 620, speMin: 280, speMax: 1000,
    moves: {
      L: { st: 3, act: 3, rec: 8, dmg: 6, hs: 14, bs: 10, kb: 5, box: [440, 860, -520, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'GRRR !', 'CLAC !'], son: 'l' },
      cL: { st: 3, act: 3, rec: 9, dmg: 5, hs: 13, bs: 10, kb: 4, box: [440, 840, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CLAC !'], son: 'l' },
      H: { st: 9, act: 5, rec: 17, dmg: 12, hs: 19, bs: 14, kb: 11, box: [420, 940, -560, -40], lvl: 'mid', lunge: 8, chain: ['S', 'SUPER'], mots: ['CROC !', 'CRAC !', 'GRRRAOU !'], son: 'h' },
      cH: { st: 7, act: 4, rec: 20, dmg: 8, hs: 17, bs: 12, kb: 8, kd: true, box: [420, 900, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [200, 800, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CROC !'], son: 'l' },
      T: { st: 3, act: 3, rec: 20, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'HOP !'], son: 'h' },
      S: { st: 10, act: 16, rec: 22, dmg: 12, hs: 22, bs: 15, kb: 14, kd: true, box: [250, 880, -560, 0], rush: 22, stopHit: true, armor: true, gronde: true, lvl: 'mid', mots: ['GRRR… ET JE FONCE !', 'GRRRAOU !', 'POUSSE-TOI !'], son: 's', nom: 'Il gronde et fonce', ia: [350, 1100, 1.2] },
      SF: { st: 9, act: 5, rec: 22, dmg: 14, hs: 24, bs: 18, kb: 12, kd: true, casse: true, lunge: 8, box: [400, 920, -560, -60], lvl: 'mid', mots: ['LA DENT QUI COUPE TOUT !', 'CRAC !', 'MÊME GELÉ !'], son: 's', nom: 'La dent pour la viande gelée', ia: [0, 800, 1.1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 19], land: true, box: [120, 760, -820, -150], lvl: 'mid', mots: ['LE GRIMPEUR !', 'CROC !'], son: 's', nom: 'Le grimpeur', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 50, rec: 22, dmg: 4, hits: 8, hs: 16, bs: 8, kb: 3, kd: true, box: [200, 1000, -600, 0], rush: 14, armor: true, lvl: 'mid', mots: ['JE NE RECULE JAMAIS !', 'GRRR !', 'C’EST À MOI !'], son: 'h', nom: 'Il ne recule jamais' },
    },
  },



  // --- PYTHON (« livre en main », duels 20 et 23, p. 45 et 53 ; python birman au duel 20, python réticulé au duel 23) :
  //     un corps qui serre, l'attaque surprise, il mord puis il s'enroule, il « voit » la chaleur, il avale tout rond.
  //     Points faibles (livre) : « il ne supporte pas le froid » (plus lent sur la neige et la glace) ; « aucun venin ».
  python: {
    nom: 'PYTHON', art: 'LE PYTHON', serpent: true, expose: true, froid: true, force: 0.966, spr: true, poseLance: 'serre', hPose: ['garde', 'fort'], col: '#6A5536', clair: '#E8D9B4', fond: '#85704A', K: .38, hp: 112, walk: 4.6, back: 4, dash: 17, jumpV: 17, jumpX: 8, grav: 1.1, etour: 52,
    aie: ['SSS ?!', 'MA QUEUE !', 'AÏE, MES ANNEAUX !'], ia: {},
    hurt: { stand: [-560, 560, -600, 0], crouch: [-600, 600, -300, 0], air: [-520, 520, -540, 0] },
    push: [210, 250], reach: 760, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 5, act: 4, rec: 10, dmg: 6, hs: 15, bs: 11, kb: 6, box: [440, 960, -560, -160], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['SSSCLAC !', 'CROC !', 'TCHAC !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 5, box: [440, 980, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['FLIC !', 'FOUETTÉ !'], son: 'l' },
      H: { st: 12, act: 6, rec: 19, dmg: 13, hs: 20, bs: 15, kb: 11, box: [420, 1060, -620, -120], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['SSSCHLAC !', 'GROSSE MORSURE !', 'CROC !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 9, kd: true, box: [300, 1080, -200, 0], lvl: 'low', chain: ['S'], mots: ['COUP DE QUEUE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 8, hs: 18, bs: 12, kb: 8, box: [150, 880, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'SSSCLAC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 110, t: 22 }, mots: ['ENROULÉ !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 22, act: 6, rec: 24, dmg: 14, hs: 24, bs: 16, kb: 12, kd: true, aplat: 'branche', box: [200, 1000, -600, 0], lunge: 12, lvl: 'mid', mots: ['L’ATTAQUE SURPRISE !', 'SSSURPRISE !', 'CROC !'], son: 's', nom: 'L’attaque surprise', ia: [200, 900, 1] },
      SF: { st: 8, act: 12, rec: 24, dmg: 15, hs: 0, bs: 0, kb: 8, kd: true, rush: 10, lvl: 'mid', serre: true, prise: { portee: 150, t: 44, degage: false, mot: 'IL MORD… ET S’ENROULE !', haut: 10, loin: 6, rec: 6 }, mots: ['CROC… ET JE SERRE !', 'ENROULÉ !'], son: 'h', nom: 'Il mord, puis il s’enroule', ia: [150, 700, 1.1] },
      SD: { st: 4, act: 26, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', radar: 'chaleur', contre: { dmg: 13, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['JE VOIS TA CHALEUR !', 'TROUVÉ !'], son: 'h' }, motsContre: ['JE VOIS TA CHALEUR !', 'MÊME DANS LE NOIR !', 'TROUVÉ !'], mots: ['JE SENS LA CHALEUR…'], son: 's', nom: 'Il « voit » la chaleur', ia: [0, 700, .8] },
      SUPER: { st: 12, act: 16, rec: 24, dmg: 26, hs: 0, bs: 0, kb: 8, kd: true, rush: 16, lvl: 'mid', avale: true, prise: { portee: 200, t: 60, degage: false, mot: 'GLOUPS : AVALÉ TOUT ROND !', haut: 18, loin: 9, rec: 8 }, mots: ['JE T’AVALE !', 'GLOUPS !'], son: 'h', nom: 'Il avale tout rond' },
    },
  },

  // --- ALLIGATOR (« livre en main », duel 20, p. 45) : jusqu'à 80 dents, il mord, puis il roule, le grondement qui fait danser l'eau, le chef des marais.
  //     Point faible (livre) : « jeune, il se fait avaler » → quand il est rétréci (caisse « TOUT PETIT »), les prises lui font deux fois plus mal.
  alligator: {
    nom: 'ALLIGATOR', art: 'L’ALLIGATOR', petitFragile: 2, force: 1.063, spr: true, hPose: ['garde', 'coup'], col: '#3E4A30', clair: '#DCD8B0', fond: '#556345', K: .46, hp: 114, walk: 5.2, back: 4.4, dash: 16, jumpV: 18, jumpX: 8, grav: 1.1, etour: 56,
    aie: ['GRRR ?!', 'MA QUEUE !', 'AÏE, MES DENTS !'], ia: {},
    hurt: { stand: [-600, 660, -720, 0], crouch: [-620, 680, -440, 0], air: [-560, 620, -620, 0] }, // (la boîte est plus haute que le corps, comme le crocodile : sinon on le rate trop)
    push: [230, 270], reach: 740, speMin: 300, speMax: 1200,
    moves: {
      L: { st: 5, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 6, box: [480, 980, -420, 0], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'CROC !', 'CHOMP !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 6, hs: 15, bs: 11, kb: 5, box: [480, 980, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'TIC !'], son: 'l' },
      H: { st: 12, act: 5, rec: 20, dmg: 14, hs: 21, bs: 16, kb: 12, box: [460, 1060, -480, 0], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['CHOMP !', '80 DENTS !', 'CRAC !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [-520, 1000, -200, 0], lvl: 'low', chain: ['S'], mots: ['COUP DE QUEUE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [150, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'CLAC !'], son: 'l' },
      T: { st: 5, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 13, kd: true, lvl: 'mid', prise: { portee: 80, t: 22 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 9, act: 36, rec: 24, dmg: 4, hits: 4, hs: 18, bs: 8, kb: 3, kd: true, box: [380, 1000, -440, 0], rush: 9, agrippe: true, lvl: 'mid', mots: ['JE MORDS…', 'ET JE ROULE !', 'LA ROULADE !'], son: 's', nom: 'Il mord, puis il roule', ia: [300, 720, 1] },
      SF: { st: 16, act: 8, rec: 24, dmg: 8, hs: 20, bs: 12, kb: 8, box: [150, 800, -300, 0], seisme: 780, motSeisme: 'L’EAU DANSE !', gronde: true, lvl: 'low', mots: ['GRRROOOON…', 'TON SOL VIBRE !', 'L’EAU DANSE !'], son: 's', nom: 'Le grondement qui fait danser l’eau', ia: [0, 750, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 12, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 7, saute: [2, 18], land: true, box: [100, 800, -880, -150], lvl: 'mid', mots: ['80 DENTS EN L’AIR !', 'CLAC !'], son: 's', nom: 'La mâchoire aux 80 dents', ia: [0, 0, 0] },
      SUPER: { st: 12, act: 48, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1050, -520, 0], rush: 12, dents: true, lvl: 'mid', mots: ['LE CHEF DES MARAIS !', 'CHOMP !', '80 DENTS !'], son: 'h', nom: 'Le chef des marais' },
    },
  },

  // --- LIONNE (« livre en main », duel 22, p. 51 : les lionnes) : des griffes pour s'accrocher, elles sautent sur le dos, l'embuscade, l'équipe de foot.
  //     Point faible (livre) : « 7 fois plus légères qu'elle » → elle vole plus loin quand on la frappe (légère).
  lionne: {
    nom: 'LIONNE', art: 'LA LIONNE', fem: true, leger: 1.15, force: 0.765, spr: true, hPose: ['garde', 'fort'], col: '#B98A4A', clair: '#F6DDB0', fond: '#C9A060', K: .43, hp: 97, walk: 7, back: 5.3, dash: 18, jumpV: 25, jumpX: 9, grav: 1.12, etour: 46,
    aie: ['GRAOU ?!', 'MA QUEUE !', 'AÏE, MON MUSEAU !'], ia: { saut: 1 },
    hurt: { stand: [-470, 600, -680, 0], crouch: [-470, 620, -440, 0], air: [-420, 580, -600, 0] },
    push: [190, 230], reach: 700, speMin: 300, speMax: 1100,
    moves: {
      L: { st: 4, act: 4, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [520, 1000, -660, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'SCRITCH !', 'GRIFF !'], son: 'l' },
      cL: { st: 4, act: 4, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [500, 960, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'SCRITCH !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 12, hs: 20, bs: 15, kb: 12, box: [480, 1060, -660, -40], lvl: 'mid', lunge: 5, chain: ['S', 'SUPER'], mots: ['CRAC !', 'CROC !', 'GRAOU !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 22, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [480, 1020, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [250, 900, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'GRIFF !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP LÀ !'], son: 'h' },
      S: { st: 7, act: 12, rec: 24, dmg: 15, hs: 0, bs: 0, kb: 8, kd: true, rush: 14, lvl: 'mid', prise: { portee: 120, t: 34, degage: false, mot: 'ACCROCHÉE AU DOS !', haut: 14, loin: 7, rec: 6 }, mots: ['SUR LE DOS !', 'JE M’ACCROCHE !'], son: 'h', nom: 'Elles sautent sur le dos', ia: [150, 650, .7] },
      SF: { st: 12, act: 14, rec: 24, dmg: 11, hs: 22, bs: 15, kb: 12, kd: true, box: [250, 950, -400, 0], rush: 23, stopHit: true, rampe: true, lvl: 'low', mots: ['L’EMBUSCADE !', 'DANS L’HERBE…', 'SURPRISE !'], son: 's', nom: 'L’embuscade dans l’herbe', ia: [400, 1300, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 19, aa: true, inv: 8, saute: [3, 20], land: true, box: [150, 800, -900, -200], lvl: 'mid', mots: ['GRIFFES EN L’AIR !', 'GRIFF !'], son: 's', nom: 'Les griffes pour s’accrocher', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -700, 0], lvl: 'mid', clan: 'lionne', mots: ['L’ÉQUIPE DE FOOT !', 'PASSE… ET BUT !', 'TOUTE LA TROUPE !'], son: 'h', nom: 'L’équipe de foot' },
    },
  },

  // --- GIRAFE (« livre en main », duel 22, p. 51) : un sabot large de 30 cm, le coup de pied qui assomme, le rodéo (elle se secoue), le coup de cou.
  //     Point faible (livre) : « si elle tombe, c'est fini » → par terre, elle met plus longtemps à se relever et prend plus cher.
  girafe: {
    nom: 'GIRAFE', art: 'LA GIRAFE', fem: true, chute: 1.3, rodeo: true, force: 0.924, spr: true, hPose: ['garde', 'coup'], col: '#C98A2E', clair: '#FBE6B5', fond: '#D9A04A', K: .58, hp: 104, walk: 5.2, back: 4.4, dash: 14, jumpV: 17, jumpX: 7, grav: 1.2, etour: 56,
    aie: ['MÔÔH ?!', 'MON COU !', 'AÏE, MES SABOTS !'], ia: { saut: .3 },
    hurt: { stand: [-300, 420, -860, 0], crouch: [-340, 400, -450, 0], air: [-420, 420, -520, 0] }, // (mesuré sur les images : un grand « lampadaire »)
    push: [160, 200], reach: 700, speMin: 320, speMax: 1200,
    moves: {
      L: { st: 5, act: 4, rec: 10, dmg: 7, hs: 15, bs: 11, kb: 7, box: [300, 700, -520, -120], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['TAC !', 'CLOC !', 'SABOT !'], son: 'l' },
      cL: { st: 5, act: 4, rec: 11, dmg: 6, hs: 15, bs: 11, kb: 6, box: [300, 680, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CLOC !'], son: 'l' },
      H: { st: 12, act: 5, rec: 20, dmg: 14, hs: 21, bs: 16, kb: 13, box: [280, 780, -700, -100], lvl: 'mid', chain: ['S', 'SUPER'], mots: ['GRAND COUP DE PIED !', 'BAM !', 'SABOT DE 30 CM !'], son: 'h' },
      cH: { st: 9, act: 5, rec: 22, dmg: 10, hs: 18, bs: 12, kb: 9, kd: true, box: [280, 760, -240, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PATATRAS !'], son: 'h' },
      A: { st: 4, act: 99, rec: 8, dmg: 9, hs: 18, bs: 12, kb: 8, box: [150, 820, -420, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['D’EN HAUT !', 'CLOC !'], son: 'l' },
      T: { st: 5, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 13, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'HOP, PAR-DESSUS !'], son: 'h' },
      S: { st: 13, act: 6, rec: 24, dmg: 13, hs: 26, bs: 16, kb: 12, assomme: 40, box: [250, 800, -640, -60], lvl: 'mid', mots: ['BAM, ASSOMMÉ !', 'SABOT DE 30 CM !', 'CLOC… DODO !'], son: 's', nom: 'Le coup de pied qui assomme', ia: [0, 800, 1.2] },
      SF: { st: 4, act: 20, rec: 20, dmg: 9, hs: 20, bs: 14, kb: 16, kd: true, box: [-420, 700, -1100, 0], armor: true, secoue: true, lvl: 'mid', mots: ['LE RODÉO !', 'JE ME SECOUE !', 'DESCENDS DE LÀ !'], son: 's', nom: 'Le rodéo', ia: [0, 450, 1] },
      SD: { st: 10, act: 6, rec: 24, dmg: 12, hs: 22, bs: 14, kb: 12, kd: true, box: [250, 820, -420, 0], lvl: 'low', mots: ['LE COUP DE COU !', 'VLAN !', 'BONG !'], son: 's', nom: 'Le coup de cou', ia: [300, 1000, 1] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 800, -800, 0], rush: 8, lvl: 'mid', mots: ['DES PATTES DE 1,80 M !', 'CLOC !', 'BAM !', 'TAC !'], son: 'h', nom: 'Les pattes de 1,80 m' },
    },
  },




  // ===================== MER =====================
  // --- REQUIN-BOULEDOGUE (« livre en main », duel 26, p. 59) : une morsure record pour sa taille, il cogne, puis il mord, le requin de rivière.
  //     Point faible (livre) : « une peau sans armure » → il prend plus cher (peau 1.25).
  bouledogue: {
    nom: 'REQUIN-BOULEDOGUE', art: 'LE REQUIN-BOULEDOGUE', monde: 'mer', nage: true, peau: 1.25, force: 0.812, spr: true, hPose: ['garde', 'coup'], col: '#6B7480', clair: '#EEF1F4', fond: '#7D93A8', K: .46, hp: 104, walk: 6.6, back: 5, dash: 19, jumpV: 18, jumpX: 8, grav: .62, etour: 46,
    aie: ['GLOUPS ?!', 'MON MUSEAU !', 'AÏE, MON AILERON !'], ia: {},
    hurt: { stand: [-520, 460, -600, -130], crouch: [-540, 480, -300, 0], air: [-500, 440, -560, -110] }, // (mesuré sur l'image : un requin trapu)
    push: [220, 255], reach: 700, speMin: 300, speMax: 1300,
    moves: {
      L: { st: 3, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [460, 820, -560, -200], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'CLAC !', 'CHOMP !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [460, 800, -280, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLAC !', 'CROC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [440, 880, -600, -160], lvl: 'mid', lunge: 8, chain: ['S', 'SUPER'], mots: ['CHOMP !', 'MORSURE RECORD !', 'CRAC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [420, 960, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'FLAC !'], son: 'h' },
      A: { st: 4, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [150, 860, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['CROC !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 75, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 6, act: 18, rec: 22, dmg: 7, hits: 2, hs: 20, bs: 12, kb: 7, kd: true, box: [300, 940, -600, -150], rush: 20, cogne: true, lvl: 'mid', mots: ['BONK… ET CHOMP !', 'JE COGNE !', 'ET JE MORDS !'], son: 's', nom: 'Il cogne, puis il mord', ia: [350, 1100, 1.2] },
      SF: { st: 6, act: 16, rec: 24, dmg: 12, hs: 20, bs: 14, kb: 13, kd: true, box: [250, 960, -600, -180], rush: 32, stopHit: true, vitesse: true, armor: true, lvl: 'mid', mots: ['JE REMONTE LE FLEUVE !', 'FIOUUU !', '4 000 KM !'], son: 's', nom: 'Le requin de rivière', ia: [450, 1500, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 18, aa: true, inv: 8, saute: [3, 20], land: true, box: [100, 700, -1000, -150], lvl: 'mid', mots: ['MORSURE RECORD !', 'CHOMP !'], son: 's', nom: 'La morsure record', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 48, rec: 22, dmg: 4, hits: 8, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 980, -620, 0], rush: 14, bonk: true, lvl: 'mid', mots: ['BAGARREUR !', 'BONK !', 'CHOMP !', 'ENCORE !'], son: 'h', nom: 'Le bagarreur' },
    },
  },


  // --- BALEINE BLEUE (« livre en main », duel 27, p. 61) : un corps de 30 m, elle file à 32 km/h, le souffle de 9 m, le chant, la grande gorgée.
  //     Point faible (livre) : « pas une seule dent » → ses coups poussent fort mais font peu de dégâts.
  baleine: {
    nom: 'BALEINE BLEUE', art: 'LA BALEINE BLEUE', fem: true, monde: 'mer', nage: true, force: 0.68, spr: true, hPose: ['garde', 'coup'], col: '#3E6A96', clair: '#E3EEF7', fond: '#4F86BF', K: .68, hp: 184, walk: 4.6, back: 3.8, dash: 14, jumpV: 15, jumpX: 6, grav: .58, etour: 80,
    aie: ['OUUUH ?!', 'MES FANONS !', 'AÏE, MA QUEUE !'], ia: { spe: 1.3 },
    hurt: { stand: [-600, 600, -430, -110], crouch: [-620, 620, -270, 0], air: [-560, 580, -410, -100] }, // (mesuré sur l'image : longue et plate, la queue ne compte pas)
    push: [300, 340], reach: 840, speMin: 360, speMax: 1400,
    moves: {
      L: { st: 6, act: 4, rec: 11, dmg: 5, hs: 15, bs: 11, kb: 10, box: [440, 860, -520, -160], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['BONG !', 'POUF !', 'BLOP !'], son: 'l' },
      cL: { st: 6, act: 4, rec: 12, dmg: 5, hs: 15, bs: 11, kb: 9, box: [440, 860, -280, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['POUF !', 'FLAC !'], son: 'l' },
      H: { st: 13, act: 6, rec: 21, dmg: 11, hs: 21, bs: 16, kb: 18, box: [400, 960, -600, -120], lvl: 'mid', lunge: 5, chain: ['S', 'SUPER'], mots: ['BOING !', '150 TONNES !', 'BOUM !'], son: 'h' },
      cH: { st: 10, act: 5, rec: 23, dmg: 9, hs: 18, bs: 12, kb: 14, kd: true, box: [-800, 900, -240, 0], lvl: 'low', chain: ['S'], mots: ['COUP DE QUEUE !', 'SPLAF !'], son: 'h' },
      A: { st: 5, act: 99, rec: 9, dmg: 9, hs: 18, bs: 12, kb: 10, box: [100, 860, -440, 160], lvl: 'high', air: true, land: true, dive: 4, chain: ['L', 'cL', 'H'], mots: ['SPLASH !', 'D’EN HAUT !'], son: 'l' },
      T: { st: 5, act: 3, rec: 22, dmg: 11, hs: 0, bs: 0, kb: 14, kd: true, lvl: 'mid', prise: { portee: 90, t: 22 }, mots: ['HOP, PAR-DESSUS !', 'VOLTIGE !'], son: 'h' },
      S: { st: 14, act: 4, rec: 22, dmg: 6, hs: 22, bs: 12, kb: 22, lvl: 'mid', souffle: true, proj: { x0: 520, spd: 12, w: 180, h: [-560, -60], life: 100, chant: true }, mots: ['OUUUUUH !', 'LE CHANT !', 'ENTENDU À 1 600 KM !'], son: 's', nom: 'Le chant de la baleine', ia: [500, 1600, 1] },
      SF: { st: 10, act: 18, rec: 26, dmg: 11, hs: 20, bs: 14, kb: 20, kd: true, box: [250, 1000, -600, -120], rush: 22, stopHit: true, armor: true, lvl: 'mid', mots: ['32 KM/H !', 'PLACE, J’ARRIVE !', 'FIOUUU !'], son: 's', nom: 'Elle file à 32 km/h', ia: [450, 1500, 1] },
      SD: { st: 6, act: 10, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 12, kd: true, aa: true, inv: 6, box: [100, 700, -1700, -500], geyser: true, lvl: 'high', mots: ['PFFFOUH !', 'LE SOUFFLE DE 9 M !', 'QUEL JET !'], son: 's', nom: 'Le souffle de 9 m', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 40, rec: 24, dmg: 5, hits: 5, hs: 16, bs: 8, kb: 3, kd: true, box: [200, 1100, -700, 0], tire: { portee: 1400, v: 10 }, aspire: true, gorgee: true, lvl: 'mid', mots: ['LA GRANDE GORGÉE !', 'TOUT AVALÉ !', 'GLOUB !'], son: 'h', nom: 'La grande gorgée' },
    },
  },


  // --- CRABE (« livre en main », duel 21, p. 49) : deux pinces solides, il pince et ne lâche plus, une armure de chevalier.
  //     Point faible (livre) : « sa carapace peut casser » → les coups qui cassent la garde lui font beaucoup plus mal (CRAC !).
  //     Il ne nage pas : il marche au fond (comme le crocodile sous la mer).
  crabe: {
    nom: 'CRABE', art: 'LE CRABE', monde: 'mer', carapace: 1.5, force: 0.975, spr: true, hPose: ['garde', 'coup'], col: '#B3452A', clair: '#FFD9C2', fond: '#D0603E', K: .36, hp: 104, walk: 6.2, back: 6.2, dash: 20, jumpV: 20, jumpX: 8, grav: 1.1, etour: 48,
    aie: ['CLIC ?!', 'MA PINCE !', 'AÏE, MA CARAPACE !'], ia: {},
    hurt: { stand: [-480, 520, -500, 0], crouch: [-500, 540, -330, 0], air: [-460, 500, -480, 0] }, // (mesuré sur l'image, sans le bout des pattes)
    push: [200, 240], reach: 700, speMin: 280, speMax: 1100,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [440, 900, -520, -120], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLIC !', 'CLAC !', 'PINCE !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [440, 880, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['CLIC !', 'TIC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [420, 980, -560, -80], lvl: 'mid', lunge: 5, chain: ['S', 'SUPER'], mots: ['GROSSE PINCE !', 'CLAC !', 'CRAC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [420, 940, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'CLIC-CLAC !'], son: 'h' },
      A: { st: 3, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 840, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'PINCE !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 6, act: 12, rec: 24, dmg: 12, hs: 0, bs: 0, kb: 8, kd: true, rush: 12, lvl: 'mid', pince: true, prise: { portee: 110, t: 40, degage: false, mot: 'PINCÉ !', haut: 6, loin: 6, rec: 6 }, mots: ['JE PINCE !', 'ET JE NE LÂCHE PLUS !', 'CLIC-CLIC-CLIC !'], son: 'h', nom: 'Il pince et ne lâche plus', ia: [150, 650, 1] },
      SF: { st: 4, act: 14, rec: 20, dmg: 10, hs: 20, bs: 14, kb: 12, kd: true, box: [250, 860, -520, -60], rush: 26, stopHit: true, vitesse: true, inv: 8, lvl: 'mid', mots: ['EN CRABE !', 'DE CÔTÉ !', 'ZIOUM !'], son: 's', nom: 'La marche de côté', ia: [400, 1300, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 19], land: true, box: [120, 760, -860, -150], lvl: 'mid', mots: ['PINCES EN L’AIR !', 'CLAC !'], son: 's', nom: 'Les pinces vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 46, rec: 22, dmg: 4, hits: 5, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 960, -600, 0], rush: 12, armor: true, lvl: 'mid', mots: ['L’ARMURE DE CHEVALIER !', 'CLIC-CLAC !', 'EN GARDE !'], son: 'h', nom: 'L’armure de chevalier' },
    },
  },

  // --- CREVETTE-MANTE (« livre en main », duel 21, p. 49-50) : deux massues à ressort, elle casse les coquilles, la frappe plus rapide qu'un clin d'œil.
  //     Point faible (livre) : « molle quand elle mue » → une peau fragile (elle prend plus cher).
  crevette: {
    nom: 'CREVETTE-MANTE', art: 'LA CREVETTE-MANTE', fem: true, monde: 'mer', peau: 1.05, force: 0.895, spr: true, hPose: ['garde', 'coup'], col: '#2E8F5E', clair: '#FFE08A', fond: '#3DAE74', K: .38, hp: 102, walk: 7, back: 5.6, dash: 20, jumpV: 20, jumpX: 8.5, grav: 1.1, etour: 44,
    aie: ['AÏE ?!', 'MES MASSUES !', 'OUILLE, MES YEUX !'], ia: {},
    hurt: { stand: [-560, 520, -480, 0], crouch: [-580, 540, -320, 0], air: [-520, 500, -460, 0] }, // (mesuré sur l'image, sans les antennes)
    push: [180, 220], reach: 660, speMin: 260, speMax: 1100,
    moves: {
      L: { st: 2, act: 3, rec: 8, dmg: 6, hs: 14, bs: 10, kb: 6, box: [420, 860, -560, -120], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PAF !', 'TAC !', 'CLIN D’ŒIL !'], son: 'l' },
      cL: { st: 3, act: 3, rec: 9, dmg: 5, hs: 13, bs: 10, kb: 5, box: [420, 840, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'PAF !'], son: 'l' },
      H: { st: 7, act: 4, rec: 17, dmg: 13, hs: 20, bs: 15, kb: 12, box: [400, 940, -600, -100], lvl: 'mid', lunge: 5, chain: ['S', 'SUPER'], mots: ['LA MASSUE !', 'BOUM !', 'CRAC !'], son: 'h' },
      cH: { st: 7, act: 4, rec: 20, dmg: 9, hs: 17, bs: 12, kb: 8, kd: true, box: [400, 900, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'PAF !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 17, bs: 11, kb: 7, box: [200, 800, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'PAF !'], son: 'l' },
      T: { st: 3, act: 3, rec: 20, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'HOP !'], son: 'h' },
      S: { st: 8, act: 5, rec: 22, dmg: 8, hits: 2, hs: 22, bs: 16, kb: 12, kd: true, casse: true, lunge: 6, box: [380, 920, -600, -80], lvl: 'mid', mots: ['CRAC ! LA COQUILLE !', 'ÇA CASSE !', 'DEUX COUPS POUR LE PRIX D’UN !'], son: 's', nom: 'Elle casse les coquilles', ia: [0, 850, 1.1] },
      SF: { st: 10, act: 4, rec: 22, dmg: 7, hs: 18, bs: 12, kb: 10, lvl: 'mid', proj: { x0: 480, spd: 15, w: 130, h: [-520, -120], life: 70, bulle: true }, mots: ['LA BULLE !', 'BLOUP… PAF !', 'ELLE ÉCLATE !'], son: 's', nom: 'La bulle qui éclate', ia: [550, 1500, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 20], land: true, box: [120, 760, -860, -150], lvl: 'mid', mots: ['MASSUE EN L’AIR !', 'PAF !'], son: 's', nom: 'La massue vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 44, rec: 22, dmg: 4, hits: 9, hs: 14, bs: 8, kb: 3, kd: true, box: [150, 900, -620, 0], rush: 10, vitesse: true, lvl: 'mid', mots: ['PLUS RAPIDE QU’UN CLIN D’ŒIL !', 'PAF-PAF-PAF !', '80 KM/H !'], son: 'h', nom: 'Plus rapide qu’un clin d’œil' },
    },
  },

  // ===================== PETITES BÊTES =====================
  // --- FRELON GÉANT (« livre en main », duel 1, p. 5) : un dard de 6 mm, il coupe la tête des abeilles (mandibules-ciseaux), la bande à frelons.
  //     Point faible (livre) : « il supporte mal la chaleur » → les coups « chaleur » (abeilles) et les arènes chaudes lui font plus mal.
  frelon: {
    nom: 'FRELON GÉANT', art: 'LE FRELON GÉANT', monde: 'betes', vole: true, chaud: 1.6, force: 0.946, spr: true, hPose: ['garde', 'coup'], col: '#E0782A', clair: '#FFE2A8', fond: '#E8963A', K: .4, hp: 102, walk: 6.8, back: 5.4, dash: 19, jumpV: 20, jumpX: 8.5, grav: .7, etour: 46,
    aie: ['BZZ ?!', 'MES AILES !', 'AÏE, MON DARD !'], ia: { saut: .9 },
    hurt: { stand: [-380, 560, -600, -120], crouch: [-400, 560, -330, 0], air: [-380, 540, -560, -100] }, // (mesuré sur l'image : le corps, pas le bout des ailes)
    push: [190, 230], reach: 700, speMin: 280, speMax: 1200,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [420, 860, -520, -160], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'BZZ !', 'CROC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [420, 840, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CLAC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [400, 920, -560, -140], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['LE DARD !', 'PIQUÉ !', 'AÏE !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [400, 880, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'BZZ !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 820, -420, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H', 'S'], mots: ['EN PIQUÉ !', 'BZZ !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 9, act: 4, rec: 22, dmg: 15, hs: 24, bs: 16, kb: 12, kd: true, box: [380, 900, -600, -120], lunge: 8, lvl: 'mid', mots: ['CLAC, LES CISEAUX !', 'CLIC-CLAC !', 'COUPÉ !'], son: 's', nom: 'Les mandibules-ciseaux', ia: [0, 820, 1.2] },
      SF: { st: 8, act: 14, rec: 22, dmg: 9, hs: 20, bs: 14, kb: 10, box: [250, 900, -560, -120], rush: 24, stopHit: true, venin: { t: 150, tick: 30, dmg: 1 }, lvl: 'mid', mots: ['LE DARD DE 6 MM !', 'PIQÛRE !', 'BZZZIING !'], son: 's', nom: 'Le dard de 6 mm', ia: [400, 1300, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 21], land: true, box: [120, 760, -900, -150], lvl: 'mid', mots: ['DÉCOLLAGE !', 'BZZ, EN L’AIR !'], son: 's', nom: 'Le décollage', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 1300, -700, 0], lvl: 'mid', clan: 'frelon', mots: ['LA BANDE À FRELONS !', 'ZZZZZ !', 'TOUS SUR TOI !'], son: 'h', nom: 'La bande à frelons' },
    },
  },


  // --- ABEILLES JAPONAISES (« livre en main », duel 1, p. 5) : un petit dard, elles foncent toutes ensemble, ça vibre et ça chauffe, la boule de chaleur.
  //     Point faible (livre) : « un corps fragile » → peau fragile, un peu moins de vie.
  abeille: {
    nom: 'ABEILLES', art: 'LES ABEILLES', fem: true, monde: 'betes', vole: true, peau: 1.05, force: 0.986, spr: true, hPose: ['garde', 'coup'], col: '#D8A21E', clair: '#FFF1B8', fond: '#E9B93A', K: .34, hp: 108, walk: 7.4, back: 5.8, dash: 20, jumpV: 20, jumpX: 9, grav: .7, etour: 44,
    aie: ['BZZ ?!', 'OUILLE, MON DARD !', 'AÏE !'], ia: { saut: 1 },
    hurt: { stand: [-400, 560, -700, -120], crouch: [-420, 560, -400, 0], air: [-400, 540, -660, -100] }, // (mesuré sur l'image : le corps, pas le haut des ailes)
    push: [170, 210], reach: 660, speMin: 260, speMax: 1100,
    moves: {
      L: { st: 3, act: 3, rec: 8, dmg: 5, hs: 14, bs: 10, kb: 5, box: [400, 820, -500, -160], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PIC !', 'BZZ !', 'PIQUÉ !'], son: 'l' },
      cL: { st: 3, act: 3, rec: 9, dmg: 5, hs: 14, bs: 10, kb: 5, box: [400, 800, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'PIC !'], son: 'l' },
      H: { st: 9, act: 4, rec: 17, dmg: 12, hs: 20, bs: 15, kb: 11, box: [380, 880, -540, -140], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['LE PETIT DARD !', 'BZZ-PIC !', 'AÏE !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 20, dmg: 9, hs: 17, bs: 12, kb: 8, kd: true, box: [380, 860, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'BZZ !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 7, hs: 17, bs: 11, kb: 7, box: [200, 800, -420, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H', 'S'], mots: ['EN PIQUÉ !', 'BZZ !'], son: 'l' },
      T: { st: 3, act: 3, rec: 20, dmg: 11, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 18 }, mots: ['VOLTIGE !', 'HOP !'], son: 'h' },
      S: { st: 7, act: 16, rec: 22, dmg: 5, hits: 3, hs: 18, bs: 12, kb: 6, kd: true, box: [250, 880, -560, -100], rush: 22, lvl: 'mid', essaim: true, mots: ['TOUTES ENSEMBLE !', 'BZZZZZ !', 'À L’ATTAQUE !'], son: 's', nom: 'Elles foncent toutes ensemble', ia: [350, 1200, 1.2] },
      SF: { st: 6, act: 30, rec: 20, dmg: 4, hits: 4, hs: 12, bs: 8, kb: 4, box: [-600, 950, -760, 0], chaleur: true, vibre: true, lvl: 'mid', mots: ['ÇA CHAUFFE !', 'BZZZ… CHAUD !', 'TOUT VIBRE !'], son: 's', nom: 'Ça vibre, ça chauffe', ia: [0, 500, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 9, hs: 0, bs: 14, kb: 6, kd: true, lance: 16, aa: true, inv: 8, saute: [3, 20], land: true, box: [120, 740, -880, -150], lvl: 'mid', mots: ['DARD EN L’AIR !', 'PIC !'], son: 's', nom: 'Le dard vers le ciel', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 50, rec: 22, dmg: 4, hits: 7, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 1000, -700, 0], rush: 10, chaleur: true, boule: true, lvl: 'mid', mots: ['LA BOULE DE CHALEUR !', '46 °C !', 'TROP CHAUD !'], son: 'h', nom: 'La boule de chaleur' },
    },
  },


  // --- MYGALE (« livre en main », duel 12, p. 29) : des crochets à venin, elle jette ses poils piquants, la soupe de proie (p. 30).
  //     Point faible (livre) : « elle voit très mal » → elle met du temps à se retourner quand on passe derrière elle.
  mygale: {
    nom: 'MYGALE', art: 'LA MYGALE', fem: true, monde: 'betes', myope: 22, force: 0.955, spr: true, hPose: ['garde', 'coup'], col: '#6B4A2E', clair: '#E8D8B8', fond: '#8A6A48', K: .38, hp: 102, walk: 6.2, back: 5, dash: 17, jumpV: 21, jumpX: 8, grav: 1.1, etour: 50,
    aie: ['SSS ?!', 'MES PATTES !', 'AÏE, MES POILS !'], ia: {},
    hurt: { stand: [-560, 600, -560, 0], crouch: [-580, 620, -330, 0], air: [-540, 580, -520, 0] }, // (mesuré sur l'image, sans le bout des pattes)
    push: [200, 240], reach: 700, speMin: 280, speMax: 1200,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [440, 880, -420, -60], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'TCHAC !', 'CLAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [440, 860, -220, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CROC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [400, 940, -560, -60], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['LES CROCHETS !', 'CRAC !', 'CROC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [400, 900, -200, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'HUIT PATTES !'], son: 'h' },
      A: { st: 3, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 840, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CROC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 10, act: 4, rec: 22, dmg: 5, hs: 16, bs: 10, kb: 6, lvl: 'mid', proj: { x0: 420, spd: 11, w: 170, h: [-440, -40], life: 70, poils: true }, venin: { t: 150, tick: 30, dmg: 1, genre: 'gratte' }, mots: ['LES POILS PIQUANTS !', 'FFFT !', 'ÇA GRATTE !'], son: 's', nom: 'Elle jette ses poils piquants', ia: [450, 1300, 1] },
      SF: { st: 8, act: 5, rec: 22, dmg: 11, hs: 20, bs: 14, kb: 10, box: [380, 920, -460, -40], lunge: 10, venin: { t: 180, tick: 30, dmg: 1 }, lvl: 'mid', mots: ['LES CROCHETS À VENIN !', 'CROC !', 'EMPOISONNÉ !'], son: 's', nom: 'Les crochets à venin', ia: [0, 850, 1.1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 20], land: true, box: [120, 760, -860, -150], lvl: 'mid', mots: ['LE BOND DE LA MYGALE !', 'HOP, CROC !'], son: 's', nom: 'Le bond de la mygale', ia: [0, 0, 0] },
      SUPER: { st: 12, act: 16, rec: 24, dmg: 24, hs: 0, bs: 0, kb: 8, kd: true, rush: 14, lvl: 'mid', slurp: true, prise: { portee: 180, t: 56, degage: false, mot: 'LA SOUPE DE PROIE !', haut: 12, loin: 8, rec: 8 }, mots: ['LA SOUPE DE PROIE !', 'SLUUURP !'], son: 'h', nom: 'La soupe de proie' },
    },
  },

  // --- GUÊPE GÉANTE (« livre en main », duel 12, p. 29) : un dard de 7 mm, elle pique et paralyse, la note de douleur 4 sur 4 (p. 30).
  //     Point faible (livre) : « elle doit piquer entre les pattes » → sa piqûre qui paralyse ne touche qu'en bas, et de tout près.
  guepe: {
    nom: 'GUÊPE GÉANTE', art: 'LA GUÊPE GÉANTE', fem: true, monde: 'betes', vole: true, force: 1.067, spr: true, hPose: ['garde', 'coup'], col: '#1E2A44', clair: '#FFB347', fond: '#E8783A', K: .38, hp: 104, walk: 7, back: 5.6, dash: 19, jumpV: 20, jumpX: 8.5, grav: .7, etour: 46,
    aie: ['BZZ ?!', 'MES AILES !', 'AÏE, MON DARD !'], ia: { saut: .9 },
    hurt: { stand: [-420, 560, -660, -120], crouch: [-440, 560, -380, 0], air: [-400, 540, -620, -100] }, // (mesuré sur l'image : le corps, pas le haut des ailes)
    push: [190, 230], reach: 700, speMin: 280, speMax: 1200,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [420, 860, -520, -160], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PIC !', 'BZZ !', 'CLAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [420, 840, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'PIC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [400, 920, -560, -140], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['LE DARD !', 'PIQUÉ !', 'AÏE !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [400, 880, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'BZZ !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 820, -420, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H', 'S'], mots: ['EN PIQUÉ !', 'BZZ !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉE !'], son: 'h' },
      S: { st: 9, act: 4, rec: 24, dmg: 10, hs: 24, bs: 16, kb: 6, assomme: 70, box: [300, 720, -260, 0], lunge: 10, lvl: 'low', paralyse: true, mots: ['PIQUÉ… PARALYSÉ !', 'PLUS UN GESTE !', 'ZZZIP !'], son: 's', nom: 'Elle pique et paralyse', ia: [0, 650, 1.2] },
      SF: { st: 8, act: 14, rec: 22, dmg: 10, hs: 20, bs: 14, kb: 10, box: [250, 900, -560, -120], rush: 24, stopHit: true, lvl: 'mid', mots: ['LE DARD DE 7 MM !', 'PIQÛRE !', 'BZZZIING !'], son: 's', nom: 'Le dard de 7 mm', ia: [400, 1300, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 21], land: true, box: [120, 760, -900, -150], lvl: 'mid', mots: ['DÉCOLLAGE !', 'BZZ, EN L’AIR !'], son: 's', nom: 'Le décollage', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 950, -700, 0], rush: 10, lvl: 'mid', mots: ['DOULEUR : 4 SUR 4 !', 'AÏE-AÏE-AÏE !', 'PIC-PIC-PIC !'], son: 'h', nom: 'Douleur : 4 sur 4' },
    },
  },



  // --- SCOLOPENDRE GÉANTE (« livre en main », duel 25, p. 57) : un venin qui paralyse ; elle chasse la tête en bas (elle monte au plafond et se laisse pendre) ;
  //     point faible (livre) : « elle se dessèche vite » → dans le désert (arène « sable »), elle perd un peu de vie. Mots interdits : crapauds, transformées.
  scolopendre: {
    nom: 'SCOLOPENDRE GÉANTE', art: 'LA SCOLOPENDRE', fem: true, monde: 'betes', soif: { mots: ['JE ME DESSÈCHE !', 'TROP SEC, ICI !', 'DE L’EAU !'], seul: ['sable'], pose: 'seche' }, force: 0.89, spr: true, hPose: ['garde', 'coup'], col: '#7A2E12', clair: '#F2C04A', fond: '#6B3A22', K: .4, hp: 108, walk: 6.4, back: 5, dash: 17, jumpV: 20, jumpX: 8, grav: 1.1, etour: 50,
    aie: ['KSSS ?!', 'MES PATTES !', 'AÏE, MES ANTENNES !'], ia: {},
    hurt: { stand: [-620, 600, -400, 0], crouch: [-640, 620, -250, 0], air: [-580, 560, -400, 0] }, // (mesuré sur l'image, sans le bout des pattes)
    push: [210, 250], reach: 720, speMin: 280, speMax: 1200,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [400, 820, -360, -40], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'TCHAC !', 'CLAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [400, 800, -200, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CROC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [360, 860, -600, -60], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['D’EN HAUT !', 'CRAC !', 'TCHAC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [380, 900, -200, 0], lvl: 'low', chain: ['S'], mots: ['LE FOUET DE PATTES !', 'BALAYETTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 860, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CROC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 9, act: 4, rec: 23, dmg: 9, hs: 22, bs: 15, kb: 6, assomme: 45, box: [400, 860, -400, -20], lunge: 9, venin: { t: 120, tick: 30, dmg: 1 }, lvl: 'mid', paralyse: true, mots: ['LES PATTES-CROCHETS !', 'CROC… PARALYSÉ !', 'VENIN !'], son: 's', nom: 'Un venin qui paralyse', ia: [0, 800, 1.1] },
      SF: { st: 8, act: 16, rec: 22, dmg: 4, hits: 3, hs: 16, bs: 10, kb: 4, box: [250, 860, -300, 0], rush: 21, stopHit: true, lvl: 'low', mots: ['LA RUÉE DES 42 PATTES !', 'TRRRRRR !', 'TOUTES LES PATTES !'], son: 's', nom: 'La ruée des 42 pattes', ia: [380, 1300, 1] },
      SD: { st: 46, act: 99, rec: 26, dmg: 13, hs: 22, bs: 16, kb: 10, kd: true, box: [-280, 500, -560, 120], ciel: true, plafond: true, land: true, lvl: 'high', venin: { t: 90, tick: 30, dmg: 1 }, motsMonte: ['AU PLAFOND !', 'JE M’ACCROCHE…', 'TÊTE EN BAS…'], motsTombe: ['LA CUEILLETTE !', 'SURPRISE D’EN HAUT !', 'ATTRAPÉ !'], mots: ['LA CUEILLETTE !'], son: 's', nom: 'Elle chasse la tête en bas', ia: [300, 1400, .8] },
      SUPER: { st: 12, act: 16, rec: 24, dmg: 24, hs: 0, bs: 0, kb: 8, kd: true, rush: 14, lvl: 'mid', festin: true, prise: { portee: 180, t: 56, degage: false, mot: 'LE FESTIN !', haut: 12, loin: 8, rec: 8 }, venin: { t: 150, tick: 30, dmg: 1 }, mots: ['LE FESTIN !', 'CROC-CROC-CROC !'], son: 'h', nom: 'Le festin' },
    },
  },



  // --- CHAUVE-SOURIS (« livre en main », duel 25, p. 57) : de petites dents pointues ; elle chasse au sonar (l'onde repère l'adversaire : les coups suivants font plus mal) ;
  //     point faible (livre) : « des ailes en peau très fine » → touchée en l'air, elle a plus mal. Mots interdits : effort, poids.
  chauvesouris: {
    nom: 'CHAUVE-SOURIS', art: 'LA CHAUVE-SOURIS', fem: true, monde: 'betes', vole: true, ailesFines: 1.25, force: 1.239, spr: true, hPose: ['garde', 'coup'], col: '#5A3A2A', clair: '#E8C8A8', fond: '#3E2A4A', K: .36, hp: 104, walk: 7, back: 6.2, dash: 19, jumpV: 21, jumpX: 9, grav: .7, etour: 46,
    aie: ['IIIK ?!', 'MES AILES !', 'AÏE, MES OREILLES !'], ia: { saut: .9 },
    hurt: { stand: [-350, 390, -610, -130], crouch: [-360, 380, -380, 0], air: [-330, 370, -570, -110] }, // (mesuré sur l'image : le corps, pas le bout des ailes)
    push: [130, 150], reach: 700, speMin: 300, speMax: 1300, // (petit corps : on peut l'approcher de près)
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [240, 700, -520, -200], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'IIIK !', 'CLAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [240, 680, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CROC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [220, 760, -560, -160], lvl: 'mid', lunge: 7, chain: ['S', 'SUPER'], mots: ['LE PIQUÉ !', 'CROC !', 'VRAOUM !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [220, 720, -220, 0], lvl: 'low', chain: ['S'], mots: ['RASE-MOTTES !', 'BALAYETTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [150, 700, -420, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H', 'S'], mots: ['EN PIQUÉ !', 'IIIK !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 10, act: 4, rec: 20, dmg: 4, hs: 14, bs: 9, kb: 4, lvl: 'mid', proj: { x0: 300, spd: 13, w: 170, h: [-600, -140], life: 64, sonar: true, col: '#9B6BD8', bruit: 'BIP !' }, repere: 300, mots: ['LE SONAR !', 'BIP… BIP… REPÉRÉ !', 'ÉCHO !'], son: 's', nom: 'Elle chasse au sonar', ia: [450, 1400, 1.2] },
      SF: { st: 7, act: 12, rec: 22, dmg: 5, hits: 2, hs: 18, bs: 12, kb: 8, box: [200, 760, -560, -100], rush: 23, stopHit: true, lvl: 'mid', mots: ['PETITES DENTS POINTUES !', 'CROC-CROC !', 'IIIK !'], son: 's', nom: 'De petites dents pointues', ia: [380, 1300, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 21], land: true, box: [120, 760, -900, -150], lvl: 'mid', mots: ['ENVOL !', 'IIIK, EN L’AIR !'], son: 's', nom: 'L’envol', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 5, hits: 6, hs: 18, bs: 8, kb: 3, kd: true, box: [150, 950, -700, 0], rush: 10, nuee: true, lvl: 'mid', mots: ['TOUTE LA GROTTE S’ENVOLE !', 'IIIIK-IIIIK !', 'LA NUÉE !'], son: 'h', nom: 'Toute la grotte s’envole' },
    },
  },


  // --- MANTE RELIGIEUSE (« livre en main », duel 28, p. 63) : des pattes-pièges à piquants ; elle frappe en un éclair ; la brindille verte qui attend (p. 64) ;
  //     point faible (livre) : « souvent mangée par les oiseaux » → les attaques qui tombent du ciel lui font plus mal. Mots interdits : lunettes, relief.
  mante: {
    nom: 'MANTE RELIGIEUSE', art: 'LA MANTE', fem: true, monde: 'betes', proieDuCiel: 1.12, force: 0.98, spr: true, hPose: ['garde', 'coup'], col: '#5E9E2E', clair: '#D8F0A0', fond: '#7DB84A', K: .4, hp: 94, walk: 5.8, back: 5, dash: 16, jumpV: 21, jumpX: 8.5, grav: 1, etour: 48,
    aie: ['CRIC ?!', 'MES PATTES !', 'AÏE, MES ANTENNES !'], ia: {},
    hurt: { stand: [-560, 460, -800, 0], crouch: [-600, 480, -420, 0], air: [-540, 440, -760, 0] }, // (mesuré sur l'image : le corps, sans le bout des pattes)
    push: [170, 190], reach: 760, speMin: 280, speMax: 1200,
    moves: {
      L: { st: 3, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [300, 750, -620, -300], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'TAC !', 'PIC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [320, 780, -260, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CLAC !'], son: 'l' },
      H: { st: 9, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [300, 850, -680, -240], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['DOUBLE CLAC !', 'LES PIQUANTS !', 'CRAC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [320, 860, -220, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'CRIC-CRAC !'], son: 'h' },
      A: { st: 3, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 820, -520, 100], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CLAC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 90, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 3, act: 4, rec: 24, dmg: 14, hs: 0, bs: 0, kb: 8, kd: true, lvl: 'mid', prise: { portee: 150, t: 40, degage: false, mot: 'LES PATTES-PIÈGES !', haut: 6, loin: 5, rec: 6, air: true }, mots: ['CLAC ! ATTRAPÉ !', 'LES PATTES-PIÈGES !'], son: 's', nom: 'Les pattes-pièges', ia: [0, 520, 1.1] },
      SF: { st: 2, act: 4, rec: 20, dmg: 12, hs: 22, bs: 15, kb: 10, box: [260, 940, -640, -200], lunge: 16, eclair: true, lvl: 'mid', mots: ['EN UN ÉCLAIR !', 'CLAC !', 'TROP RAPIDE !'], son: 's', nom: 'Elle frappe en un éclair', ia: [0, 1000, 1.2] },
      SD: { st: 4, act: 30, rec: 20, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', camoufle: true, brindille: true, contre: { dmg: 13, hs: 24, bs: 0, kb: 14, kd: true, lvl: 'mid', mots: ['CLAC ! TROP TARD !', 'UNE BRINDILLE ? NON : MOI !'], son: 'h' }, motsContre: ['CLAC ! TROP TARD !', 'UNE BRINDILLE ? NON : MOI !', 'TU NE M’AVAIS PAS VUE !'], mots: ['LA BRINDILLE VERTE…'], son: 's', nom: 'La brindille verte', ia: [0, 700, .8] },
      SUPER: { st: 10, act: 16, rec: 24, dmg: 26, hs: 0, bs: 0, kb: 8, kd: true, rush: 14, lvl: 'mid', prise: { portee: 190, t: 60, degage: false, mot: 'ELLE NE LE LÂCHE PLUS !', haut: 10, loin: 8, rec: 8, air: true }, clac: true, mots: ['ELLE NE LÂCHE PLUS !', 'CLAC-CLAC-CLAC !'], son: 'h', nom: 'Elle ne lâche plus' },
    },
  },



  // --- COLIBRI (« livre en main », duel 28, p. 63) : un bec en aiguille ; il vole même en arrière ; il bat des ailes 53 fois par seconde (p. 63) ;
  //     point faible (livre) : « il doit boire sans arrêt » → il perd un peu de vie avec le temps (sauf au JARDIN, où il y a la mangeoire). Mots interdits : nectar, 1200.
  colibri: {
    nom: 'COLIBRI', art: 'LE COLIBRI', monde: 'betes', vole: true, soif: { mots: ['J’AI SOIF !', 'VITE, À BOIRE !', 'DE L’EAU SUCRÉE, VITE !'], sauf: ['jardin'], t: 240 }, force: 1.007, spr: true, hPose: ['garde', 'coup'], col: '#2E8B57', clair: '#D8F5E0', fond: '#3FA36B', K: .34, hp: 96, walk: 8, back: 9, dash: 22, jumpV: 21, jumpX: 9.5, grav: .6, etour: 44,
    aie: ['PIOU ?!', 'MES PLUMES !', 'AÏE, MON BEC !'], ia: { saut: 1 },
    hurt: { stand: [-300, 360, -800, -180], crouch: [-300, 360, -520, 0], air: [-280, 340, -760, -160] }, // (mesuré sur l'image : le corps, sans le bout des ailes ni le bec)
    push: [110, 130], reach: 760, // (tout petit : on peut l'approcher de près) speMin: 300, speMax: 1300,
    moves: {
      L: { st: 3, act: 3, rec: 8, dmg: 5, hs: 15, bs: 11, kb: 6, box: [300, 780, -760, -380], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['PIC !', 'TAC !', 'PIOU !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 9, dmg: 5, hs: 15, bs: 11, kb: 5, box: [300, 740, -300, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'PIC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 17, dmg: 12, hs: 20, bs: 15, kb: 11, box: [300, 880, -760, -300], lvl: 'mid', lunge: 8, chain: ['S', 'SUPER'], mots: ['COUP DE BEC !', 'PIC !', 'ZIOU !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 20, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [300, 800, -260, 0], lvl: 'low', chain: ['S'], mots: ['RASE-MOTTES !', 'BALAYETTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 860, -420, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H', 'S'], mots: ['EN PIQUÉ !', 'PIOU !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 70, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 7, act: 4, rec: 20, dmg: 12, hs: 24, bs: 16, kb: 9, box: [300, 1000, -760, -340], lunge: 12, lvl: 'mid', aiguille: true, mots: ['LE BEC EN AIGUILLE !', 'PIQUÉ !', 'EN PLEIN DANS LE MILLE !'], son: 's', nom: 'Le bec en aiguille', ia: [300, 1100, 1.2] },
      SF: { st: 2, act: 14, rec: 12, dmg: 0, hs: 0, bs: 0, kb: 0, lvl: 'mid', marcheArriere: 30, inv: 14, mots: ['MARCHE ARRIÈRE !', 'MÊME PAS TOUCHÉ !', 'VROUM, EN ARRIÈRE !'], son: 's', nom: 'Il vole même en arrière', ia: [0, 600, .9] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 22], land: true, box: [120, 760, -900, -150], lvl: 'mid', mots: ['EN L’AIR !', 'PIOU, DÉCOLLAGE !'], son: 's', nom: 'L’envol', ia: [0, 0, 0] },
      SUPER: { st: 14, act: 44, rec: 22, dmg: 4, hits: 6, hs: 16, bs: 8, kb: 3, kd: true, box: [150, 900, -800, -120], rush: 11, tourbillon: true, lvl: 'mid', mots: ['LE TOURBILLON D’AILES !', 'TAC-TAC-TAC-TAC !', 'ZZZIOUUU !'], son: 'h', nom: 'Le tourbillon d’ailes' },
    },
  },


  // --- JEUNE SERPENT BRUN (« livre en main », duel 29, p. 65) : des crochets à venin ; il fouille chaque cachette ;
  //     point faible (livre) : « tout jeune, il débute » → il commence petit… et GRANDIT à chaque coup qu'il donne (SUPER : il devient grand d'un coup). Mots interdits : cinq, 5, terrestres.
  serpentbrun: {
    nom: 'JEUNE SERPENT BRUN', art: 'LE JEUNE SERPENT BRUN', monde: 'betes', grandit: { pas: .04, max: 1.3 }, force: 0.859, spr: true, hPose: ['garde', 'coup'], col: '#8A6A44', clair: '#EBD8B0', fond: '#A07A4E', K: .34, hp: 104, walk: 6.4, back: 5.2, dash: 18, jumpV: 20, jumpX: 8.5, grav: 1.1, etour: 48,
    aie: ['SSS ?!', 'MA QUEUE !', 'AÏE, MES ÉCAILLES !'], ia: {},
    hurt: { stand: [-700, 560, -460, 0], crouch: [-720, 580, -260, 0], air: [-660, 520, -420, 0] }, // (mesuré sur l'image, sans le bout de la queue)
    push: [170, 190], reach: 740, speMin: 280, speMax: 1200,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [380, 780, -460, -120], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['SSS !', 'CROC !', 'TCHAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [380, 760, -200, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'SSS !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [360, 840, -480, -60], lvl: 'mid', lunge: 8, chain: ['S', 'SUPER'], mots: ['DÉTENTE !', 'CROC !', 'SSSCLAC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [360, 820, -200, 0], lvl: 'low', chain: ['S'], mots: ['COUP DE QUEUE !', 'BALAYETTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 860, -420, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'SSS !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 8, act: 4, rec: 22, dmg: 10, hs: 20, bs: 14, kb: 8, box: [380, 840, -440, -40], lunge: 12, venin: { t: 180, tick: 30, dmg: 1 }, lvl: 'mid', mots: ['LES CROCHETS À VENIN !', 'CROC !', 'EMPOISONNÉ !'], son: 's', nom: 'Des crochets à venin', ia: [0, 900, 1.1] },
      SF: { st: 9, act: 6, rec: 22, dmg: 11, hs: 22, bs: 15, kb: 9, box: [340, 880, -300, 0], lunge: 14, fouille: 1.5, lvl: 'low', mots: ['JE FOUILLE PARTOUT !', 'TROUVÉ !', 'PAS DE CACHETTE !'], son: 's', nom: 'Il fouille chaque cachette', ia: [300, 1000, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 20], land: true, box: [120, 760, -860, -150], lvl: 'mid', mots: ['DÉTENTE !', 'SSS, EN L’AIR !'], son: 's', nom: 'La détente', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 30, rec: 22, dmg: 6, hits: 4, hs: 18, bs: 8, kb: 4, kd: true, box: [200, 1050, -560, 0], rush: 12, grandir: true, lvl: 'mid', mots: ['QUAND JE SERAI GRAND… C’EST MAINTENANT !', 'IL A GRANDI !', 'SSSSUPER !'], son: 'h', nom: 'Quand je serai grand…' },
    },
  },
  // --- VEUVE NOIRE À DOS ROUGE (à gagner au DÉFI depuis le 25/09, duel 29, p. 65) : un venin très puissant ; elle ficelle sa proie ; le fil gluant, l'ascenseur (p. 66) ;
  //     point faible (livre) : « on l'écrase d'un doigt » → les attaques qui tombent d'en haut lui font très mal (pose « écrasée »).
  veuve: {
    nom: 'VEUVE NOIRE', art: 'LA VEUVE NOIRE', fem: true, monde: 'betes', ecrase: 1.35, force: 1.053, spr: true, hPose: ['garde', 'coup'], col: '#1A1A22', clair: '#FF4A3A', fond: '#3A1A22', K: .32, hp: 96, walk: 6, back: 5, dash: 17, jumpV: 21, jumpX: 8, grav: 1.1, etour: 46,
    aie: ['SSS ?!', 'MES PATTES !', 'AÏE, MON DOS ROUGE !'], ia: {},
    hurt: { stand: [-440, 420, -520, 0], crouch: [-460, 440, -300, 0], air: [-420, 400, -500, 0] }, // (mesuré sur l'image : l'abdomen et la tête, pas le bout des pattes)
    push: [120, 140], reach: 640, speMin: 280, speMax: 1300,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 6, hs: 15, bs: 11, kb: 6, box: [280, 720, -360, -40], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CROC !', 'TIC !', 'CLAC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 5, hs: 15, bs: 11, kb: 5, box: [280, 700, -200, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CROC !'], son: 'l' },
      H: { st: 11, act: 5, rec: 18, dmg: 13, hs: 20, bs: 15, kb: 11, box: [260, 800, -440, -40], lvl: 'mid', lunge: 6, chain: ['S', 'SUPER'], mots: ['HUIT PATTES !', 'CRAC !', 'CROC !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 9, hs: 18, bs: 12, kb: 8, kd: true, box: [260, 760, -200, 0], lvl: 'low', chain: ['S'], mots: ['BALAYETTE !', 'CROCHE-PATTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 7, dmg: 8, hs: 18, bs: 11, kb: 7, box: [200, 700, -400, 160], lvl: 'high', air: true, land: true, dive: 5, chain: ['L', 'cL', 'H', 'S'], mots: ['D’EN HAUT !', 'CROC !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 12, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 80, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 10, act: 4, rec: 22, dmg: 4, hs: 14, bs: 9, kb: 3, lvl: 'mid', proj: { x0: 360, spd: 14, w: 150, h: [-460, -60], life: 70, fil: true }, venin: { t: 150, tick: 999, dmg: 0, genre: 'fil', lent: .45 }, mots: ['LE FIL GLUANT !', 'PFIOU !', 'EMMÊLÉ !'], son: 's', nom: 'Le fil gluant', ia: [400, 1300, 1.2] },
      SF: { st: 8, act: 5, rec: 22, dmg: 14, hs: 0, bs: 0, kb: 8, kd: true, lvl: 'mid', prise: { portee: 150, t: 44, degage: false, mot: 'EMBALLÉ !', haut: 6, loin: 6, rec: 6 }, cocon: true, venin: { t: 180, tick: 30, dmg: 1 }, mots: ['ELLE FICELLE SA PROIE !', 'EMBALLÉ !', 'ET UN TOUR DE FIL !'], son: 's', nom: 'Elle ficelle sa proie', ia: [0, 560, 1.1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 10, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 24], land: true, ballon: true, box: [120, 760, -900, -150], lvl: 'mid', mots: ['DÉCOLLAGE SANS AILES !', 'HOP, SUR MON FIL !'], son: 's', nom: 'Le décollage sans ailes', ia: [0, 0, 0] },
      SUPER: { st: 12, act: 16, rec: 24, dmg: 28, hs: 0, bs: 0, kb: 8, kd: true, rush: 14, lvl: 'mid', cocon: true, ascenseur: true, prise: { portee: 200, t: 64, degage: false, mot: 'L’ASCENSEUR !', haut: 30, loin: 4, rec: 8 }, venin: { t: 180, tick: 30, dmg: 1 }, mots: ['L’ASCENSEUR !', 'EMBALLÉ, MONTÉ !'], son: 'h', nom: 'L’ascenseur' },
    },
  },
  // --- MÉGANEURA (LÉGENDAIRE des PETITES BÊTES, hors livre) : la libellule géante de la préhistoire (environ 70 cm d'ailes, il y a environ 300 millions d'années).
  //     Elle se réveille quand on a battu toutes les PETITES BÊTES en GOD MODE (bonus.js : ceremonieLegendaire). Sources : Wikipédia « Meganeura », The Conversation (25/09/2026).
  meganeura: {
    nom: 'MÉGANEURA', art: 'LA MÉGANEURA', fem: true, monde: 'betes', vole: true, force: 0.987, spr: true, hPose: ['garde', 'coup'], col: '#1E7A7A', clair: '#BFF5E8', fond: '#2A6A7A', K: .46, hp: 96, walk: 7, back: 6.2, dash: 20, jumpV: 21, jumpX: 9.5, grav: .6, etour: 60,
    aie: ['BZZOUM ?!', 'MES AILES !', 'AÏE, MES GRANDS YEUX !'], ia: { saut: .9 },
    hurt: { stand: [-560, 520, -660, -160], crouch: [-560, 540, -420, -100], air: [-540, 500, -640, -150] }, // (mesuré : le corps et le bas des ailes ; sprite flottant, +120)
    push: [210, 250], reach: 780, speMin: 300, speMax: 1300,
    moves: {
      L: { st: 4, act: 3, rec: 9, dmg: 7, hs: 15, bs: 11, kb: 6, box: [420, 880, -520, -180], lvl: 'mid', chain: ['L', 'H', 'S'], mots: ['CLAC !', 'BZZOUM !', 'CROC !'], son: 'l' },
      cL: { st: 4, act: 3, rec: 10, dmg: 6, hs: 15, bs: 11, kb: 5, box: [420, 860, -240, 0], lvl: 'low', chain: ['L', 'cL', 'H', 'cH', 'S'], mots: ['TIC !', 'CLAC !'], son: 'l' },
      H: { st: 10, act: 5, rec: 18, dmg: 14, hs: 20, bs: 15, kb: 11, box: [380, 960, -560, -140], lvl: 'mid', lunge: 8, chain: ['S', 'SUPER'], mots: ['LES MÂCHOIRES !', 'CRAC !', 'BZZOUM !'], son: 'h' },
      cH: { st: 8, act: 4, rec: 21, dmg: 10, hs: 18, bs: 12, kb: 8, kd: true, box: [380, 900, -220, 0], lvl: 'low', chain: ['S'], mots: ['RASE-MOTTES !', 'BALAYETTE !'], son: 'h' },
      A: { st: 3, act: 99, rec: 6, dmg: 9, hs: 18, bs: 11, kb: 7, box: [200, 880, -440, 160], lvl: 'high', air: true, land: true, dive: 6, chain: ['L', 'cL', 'H', 'S'], mots: ['EN PIQUÉ !', 'BZZOUM !'], son: 'l' },
      T: { st: 4, act: 3, rec: 22, dmg: 13, hs: 0, bs: 0, kb: 12, kd: true, lvl: 'mid', prise: { portee: 90, t: 20 }, mots: ['VOLTIGE !', 'ATTRAPÉ !'], son: 'h' },
      S: { st: 8, act: 5, rec: 22, dmg: 16, hs: 0, bs: 0, kb: 8, kd: true, lvl: 'mid', prise: { portee: 170, t: 44, degage: false, mot: 'LE PANIER DE PATTES !', haut: 16, loin: 8, rec: 6 }, mots: ['LE PANIER DE PATTES !', 'ATTRAPÉ EN PLEIN VOL !'], son: 's', nom: 'Le panier de pattes à piquants', ia: [0, 600, 1.1] },
      SF: { st: 8, act: 14, rec: 22, dmg: 12, hs: 20, bs: 14, kb: 10, box: [250, 940, -600, -120], rush: 25, stopHit: true, lvl: 'mid', mots: ['LE PIQUÉ DE LA PRÉHISTOIRE !', 'VRAOUM !', 'BZZOUM !'], son: 's', nom: 'Le piqué de la préhistoire', ia: [400, 1400, 1] },
      SD: { st: 3, act: 99, rec: 22, dmg: 11, hs: 0, bs: 14, kb: 6, kd: true, lance: 17, aa: true, inv: 8, saute: [3, 22], land: true, box: [120, 780, -920, -150], lvl: 'mid', mots: ['ENVOL GÉANT !', 'BZZOUM, EN L’AIR !'], son: 's', nom: 'L’envol géant', ia: [0, 0, 0] },
      SUPER: { st: 16, act: 44, rec: 22, dmg: 6, hits: 6, hs: 18, bs: 8, kb: 5, kd: true, box: [150, 1050, -760, 0], rush: 10, lvl: 'mid', mots: ['LA TEMPÊTE DE LA PRÉHISTOIRE !', 'VRRRAOUM !', '70 CM D’AILES !'], son: 'h', nom: 'La tempête de la préhistoire' },
    },
  },
};
// phrases de victoire (drôles, tirées du livre) : le gagnant parle sur l'écran de fin
const PHRASES = {
  tigre: ['Rayé jusqu’à la peau… et champion !', 'Un bond de 10 mètres, et hop !', 'Miaou. Enfin… ROAAAR !'],
  gorille: ['Mains en coupe, s’il vous plaît !', 'Tam-tam ! Et maintenant, je chante en mangeant.', 'On m’entend taper à 1 km !'],
  lion: ['20 heures de sieste par jour… et je t’ai quand même battu !', 'On m’entend rugir à 8 km !', 'Le roi, c’est moi. Enfin… aujourd’hui.'],
  ours: ['Mes poils sont des pailles : je flotte et je gagne !', 'Blanc ? Non : transparent. Et champion !', '687 km à la nage : ça muscle !'],
  croco: ['Clac-clac ! Une mâchoire d’acier !', 'Tu m’as vu venir ? Non ? Normal.', 'Une flaque, et hop : surprise !'],
  hippo: ['Trois tonnes de mauvaise humeur !', 'Le ventilateur à crottes, ça ne rate jamais !', 'Plus grande bouche = plus fort. Logique !'],
  ratel: ['Je ne gagne pas : je dégoûte !', '13 kilos de rage !', 'Pschiit ! Ça pue, hein ?'],
  komodo: ['Sssss… Même pas mal !', 'Hein ? Tu as dit quoi ? J’entends très mal…', 'Un DRAGON. Je rappelle.'],
  grizzly: ['Attrapé au vol, comme un saumon !', '40 000 papillons au dîner. Croustillant !', 'Grrr… Tout le monde dehors !'],
  hyene: ['Hi hi hi… c’est nerveux !', 'Chez les hyènes, ce sont les filles qui commandent !', 'Rira bien qui rira le dernier !'],
  buffle: ['Meuh ? Non : BUFFLE !', 'Mordu, mais pas vaincu !', 'Tête baissée, et ça fonce !'],
  morse: ['Un canapé à moustaches, hein ?', 'Un canapé, oui. Mais avec des épées !', '700 moustaches, zéro défaite !'],
  trex: ['Préhistorique, mais toujours en forme !', 'Petits bras, GRANDES dents !', 'C’est qui le plus fort ? MOI !'],
  leopard: ['Je t’ai vu venir… d’en haut !', 'Chut… je chasse la nuit.', 'Qui veut monter dans mon arbre ?'],
  porcepic: ['Qui s’y frotte s’y pique !', 'Pique, pique, hourra !', 'Tu voulais un câlin ?'],
  guepard: ['Trop rapide pour toi !', 'Cui-cui ! Oui, c’est moi. Et alors ?', 'Même pas essoufflé… enfin, un peu.'],
  autruche: ['Poule de karaté : ceinture noire !', 'Ma tête dans le sable ? Jamais de la vie !', 'Un pas de géant pour une autruche !'],
  orque: ['Tu aimes mon chapeau ? C’est un saumon.', 'Je ne suis pas un poisson : je respire de l’air !', 'Dix tonnes de câlins… et de coups de queue !'],
  pieuvre: ['Trois cœurs, et tous veulent gagner !', 'Pas d’os ? Pas de problème !', 'Huit bras pour applaudir. Bravo, moi !'],
  aiguillat: ['Petit, mais piquant !', 'On est mille, et on arrive !', 'Deux épines, zéro chance pour toi !'],
  espadon: ['En garde ! Touché !', 'Pas de dents ? Pas besoin !', 'Une épée sur le nez : pratique !'],
  requinbleu: ['Je tourne, je tourne… et je gagne !', 'À 1 km/h, mais j’arrive toujours !', 'Des dents en scie : scritch, scritch !'],
  megalo: ['Le plus gros requin de tous les temps !', 'Des dents de 18 cm : souris !', 'Revenu des profondeurs… pour gagner !'],
  requin: ['Tu as vu mon sourire ? 300 dents, toutes brossées !', 'Je t’ai senti arriver de loin.', 'Mes dents repoussent toute ma vie : pratique !'],
  jaguar: ['Un coup de dents, et crac !', 'Même dans l’eau, je nage mieux que toi !', 'Petites pattes, grandes dents !'],
  anaconda: ['Je t’ai serré fort, hein ?', 'Lent sur terre, mais champion quand même !', 'Sssuper victoire !'],
  caiman: ['Tu croyais que je dormais ?', 'Mon armure d’os : zéro bobo !', 'Une sieste, un coup de mâchoire… une victoire !'],
  puma: ['Je saute plus haut que tout le monde !', '2 400 km à pied, et même pas fatigué !', 'Miaou… enfin, grrr !'],
  loup: ['AOUUUH ! C’est ma victoire !', 'Tout seul… mais champion !', 'Je blesse, j’attends… et je gagne !'],
  mangouste: ['Trop rapide pour toi !', 'Je danse… et je gagne !', 'Petite, mais 40 dents !'],
  cobra: ['Sssssuper !', 'Mon capuchon t’a fait peur, avoue !', 'Le roi des serpents, c’est moi !'],
  oursnoir: ['Bon, et maintenant, le goûter !', 'Plus gourmand que bagarreur… mais champion !', 'Des baies pour fêter ça !'],
  glouton: ['Je ne recule jamais !', 'Gros comme un chien, fort comme un ours !', 'Ce repas est à moi !'],
  python: ['Je t’ai vu, même dans le noir !', 'Un câlin de python, ça serre !', 'Brrr… vivement la chaleur !'],
  alligator: ['Grrroooon… champion !', '80 dents pour sourire !', 'Le chef des marais, c’est moi !'],
  lionne: ['L’équipe a gagné !', 'Légère, mais redoutable !', 'On chasse ensemble, on gagne ensemble !'],
  girafe: ['Vu d’en haut, c’est encore plus beau !', 'Un coup de sabot, et au dodo !', 'Mes pattes sont plus grandes que toi !'],
  bouledogue: ['Je cogne, puis je mords !', 'Petit, mais bagarreur !', 'De la rivière à la mer, je gagne partout !'],
  baleine: ['Pas une dent… et pourtant, gagné !', 'Ouuuuh ! Tu m’as entendue ?', '150 tonnes de bonheur !'],
  crabe: ['Pincé ! Et je ne lâche jamais !', 'Mon armure de chevalier a tenu !', 'Clic-clac, victoire !'],
  crevette: ['Tu n’as rien vu ? Normal : trop rapide !', 'Petite crevette, gros marteau !', 'Deux coups pour le prix d’un !'],
  frelon: ['Clic-clac, mes ciseaux ne ratent jamais !', 'Petit, moi ? Je suis un géant !', 'Bzzz… Je suis le roi du ciel !'],
  abeille: ['Toutes ensemble, on est les plus fortes !', 'Petite, mais jamais seule !', 'Bzzz… Et maintenant, du miel !'],
  mygale: ['Huit pattes, huit fois plus forte !', 'Je ne te voyais pas… mais je t’ai eu !', 'À table : soupe de champion !'],
  guepe: ['Pic ! Et plus un geste !', 'Mes ailes orange sont les plus belles !', 'Bzzz… Je vise juste, entre les pattes !'],
  scolopendre: ['Quarante-deux pattes pour gagner !', 'Tête en bas, je t’ai eu !', 'Au menu : tout ce qui passe !'],
  chauvesouris: ['Bip… bip… Je t’ai trouvé !', 'Dans le noir, c’est moi la reine !', 'Et maintenant, dodo… la tête en bas !'],
  mante: ['Une brindille ? Non : une championne !', 'Clac ! Trop tard !', 'Je ne bouge pas… et je gagne !'],
  colibri: ['Trop rapide, même en marche arrière !', 'Petit comme un bonbon, fort comme un champion !', 'Victoire ! Vite, à boire !'],
  serpentbrun: ['Je débute… mais je gagne déjà !', 'Aucune cachette ne m’échappe !', 'Quand je serai grand… attention !'],
  veuve: ['Emballé, c’est pesé !', 'Un centimètre de pure victoire !', 'Mon fil ne lâche jamais !'],
  meganeura: ['Trois cents millions d’années, et toujours en forme !', 'Soixante-dix centimètres d’ailes : place !', 'La reine du ciel de la préhistoire, c’est moi !'],
};
const JET = { dmg: 3, hs: 10, bs: 8, kb: 3, lvl: 'mid', mots: ['SPLOTCH !', 'BEURK !'], son: 'splotch', sale: true, super: true }; // une « crotte » du ventilateur de l'hippo

const ARENES = [
  { k: 'savane', nom: 'SAVANE', img: 'arene.webp' }, { k: 'jungle', nom: 'JUNGLE', img: 'arene_jungle.webp' },
  { k: 'banquise', nom: 'BANQUISE', img: 'arene_banquise.webp' }, { k: 'desert', nom: 'DÉSERT', img: 'arene_desert.webp' },
  { k: 'colisee', nom: 'COLISÉE', img: 'arene_colisee.webp' }, { k: 'riviere', nom: 'RIVIÈRE', img: 'arene_riviere.webp' },
  { k: 'nuit', nom: 'SAVANE DE NUIT', img: 'arene_nuit.webp' }, { k: 'plage', nom: 'PLAGE D’ALASKA', img: 'arene_plage.webp' },
  { k: 'foret', nom: 'FORÊT RUSSE', img: 'arene_foret.webp' }, { k: 'volcan', nom: 'VOLCAN', img: 'arene_volcan.webp' },
  // les lieux des derniers duels du livre
  { k: 'pantanal', nom: 'PANTANAL', img: 'arene_pantanal.webp' },
  { k: 'marais', nom: 'MARAIS', img: 'arene_marais.webp' },
  { k: 'montagnes', nom: 'MONTAGNES', img: 'arene_montagnes.webp' },
  { k: 'inde', nom: 'INDE', img: 'arene_inde.webp' },
  { k: 'nord', nom: 'FORÊT DU NORD', img: 'arene_nord.webp' },
  { k: 'floride', nom: 'FLORIDE', img: 'arene_floride.webp' },
  { k: 'asie', nom: 'FORÊT D’ASIE', img: 'arene_asie.webp' },
  // MER : on se bat sous l'eau, au-dessus du sable
  { k: 'ocean', nom: 'OCÉAN', img: 'arene_ocean.webp', monde: 'mer' }, { k: 'recif', nom: 'RÉCIF DE CORAIL', img: 'arene_recif.webp', monde: 'mer' },
  { k: 'aquarium', nom: 'AQUARIUM', img: 'arene_aquarium.webp', monde: 'mer' }, { k: 'abysses', nom: 'ABYSSES', img: 'arene_abysses.webp', monde: 'mer' }, { k: 'estuaire', nom: 'ESTUAIRE D’AUSTRALIE', img: 'arene_estuaire.webp', monde: 'mer' },
  { k: 'ruche', nom: 'LA RUCHE', img: 'arene_ruche.webp', monde: 'betes' },
  { k: 'sable', nom: 'LE DÉSERT À LA LOUPE', img: 'arene_sable.webp', monde: 'betes' },
  { k: 'grotte', nom: 'LA GROTTE', img: 'arene_grotte.webp', monde: 'betes' },
  { k: 'jardin', nom: 'LE JARDIN', img: 'arene_jardin.webp', monde: 'betes' },
  { k: 'tronc', nom: 'LE VIEUX TRONC', img: 'arene_tronc.webp', monde: 'betes' }, // (duel 29 : sous un vieux tronc, en Australie)
  // arènes secrètes : récompenses de la salle des trophées (surprises.js, RECOMPENSES)
  { k: 'epave', nom: 'L’ÉPAVE AU TRÉSOR', img: 'arene_epave.webp', monde: 'mer', secret: 'epave' },
  { k: 'lune', nom: 'LA LUNE', img: 'arene_lune.webp', secret: 'lune' }, { k: 'prehisto', nom: 'L’ÎLE PRÉHISTORIQUE', img: 'arene_prehisto.webp', secret: 'prehisto' },
];
const estMer = () => (ARENES.find(a => a.k === G.arene) || {}).monde === 'mer';
// ---- 2D (25/09, demande de Vincent : « les duels avec les animaux qui volent et qui nagent doivent pouvoir se faire en 2D ») ----
// Les animaux qui VOLENT (vole) et ceux qui NAGENT (nage, dans une arène de mer) ont une altitude de croisière f.alt :
// ↑ monte, ↓ descend (en bas tout en bas : ↓ = la garde, comme au sol). C'est leur « sol » : un saut, un coup, une chute les y ramènent,
// sauf un coup qui fait tomber (f.knock) : là, on tombe jusqu'au vrai sol. Au sol restent : crabe, crevette, mygale, scolopendre, mante, veuve, serpent brun.
const vol2d = f => !!f && !!f.d && !G.sans2D && !!(f.d.vole || (f.d.nage && estMer())); // (G.sans2D : pour les tests, comparer avec l'ancien jeu)
const solDe = f => vol2d(f) && !f.knock ? (f.alt || 0) : 0;
const ALT_HUD = 200; // le haut de l'écran (les jauges) : on n'y monte pas
const ALT_VS_SOL = 300; // contre un animal qui marche, pas plus haut : il peut encore sauter et taper (pas de cachette imprenable)
function altMax(f) { if (f._altMax != null) return f._altMax; const hb = f.d.hurt, haut = -Math.min(hb.stand[2], (hb.air || hb.stand)[2]) * f.d.K, o = G.f.find(x => x !== f), cap = o && !vol2d(o) ? ALT_VS_SOL : 420; return (f._altMax = Math.round(Math.max(90, Math.min(cap, FLOOR - ALT_HUD - haut)))) }
const vitV = f => Math.max(4.5, f.d.walk * .95); // vitesse pour monter / descendre
const duCiel = a => a.h > 30 && (!vol2d(a) || a.h - solDe(a) > 30 || (a.vz || 0) < -2); // une attaque « d'en haut » : en plein saut, ou en piqué (2D)
const ailesTouchees = (d, m) => d.h - solDe(d) > 30 || (vol2d(d) && d.h > 30 && !!m.aa); // chauve-souris : touchée en plein saut, ou en vol par un coup anti-aérien
const procheV = (f, o) => (!vol2d(f) && !vol2d(o)) || Math.abs(o.h - f.h) < 160; // une prise : à peu près à la même hauteur
// couleur de la poussière soulevée, selon le sol de l'arène
const POUSSIERE = { banquise: '#EEF7FF', foret: '#F7FBFF', plage: '#D8D0BF', volcan: '#77706B', nuit: '#A7AFCB', riviere: '#CFE6EE', ocean: '#E6DDBF', recif: '#F1E6C8', aquarium: '#EFE7CF', abysses: '#4A5A70', epave: '#E6DDBF', pantanal: '#E8C98B', marais: '#E3CF8E', montagnes: '#D8D2C8', inde: '#E2B878', nord: '#F2F7FF', floride: '#B89A78', asie: '#C9A26E', estuaire: '#9C8A5A', ruche: '#F2C45A', lune: '#C9CCD6', prehisto: '#9C8A6A' , sable: '#F2D39A' , grotte: '#8A8FA0' , jardin: '#B08A5A', tronc: '#C27A4E' };
const ORDRE = ['tigre', 'gorille', 'lion', 'ours', 'croco', 'hippo', 'ratel', 'komodo', 'grizzly', 'hyene', 'buffle', 'morse', 'leopard', 'porcepic', 'guepard', 'autruche', 'jaguar', 'anaconda', 'caiman', 'puma', 'loup', 'mangouste', 'cobra', 'oursnoir', 'glouton', 'python', 'alligator', 'lionne', 'girafe', 'frelon', 'abeille', 'mygale', 'guepe', 'scolopendre', 'chauvesouris', 'mante', 'colibri', 'serpentbrun', 'veuve', 'meganeura', 'orque', 'requin', 'pieuvre', 'aiguillat', 'espadon', 'requinbleu', 'bouledogue', 'baleine', 'crabe', 'crevette', 'megalo', 'trex']; // le T. rex (légendaire) reste le dernier // les autres animaux du livre arrivent au fur et à mesure
// MONDES (décision de Vincent, 24/09) : un animal n'affronte que les animaux de son monde (TERRE, MER ; PETITES BÊTES plus tard)
const MONDES = { terre: { nom: 'TERRE', ico: '🌍', places: 16, legende: 'trex', titre: 'CHOISIS TON ANIMAL' }, mer: { nom: 'MER', ico: '🌊', places: 8, legende: 'megalo', titre: 'CHOISIS TON ANIMAL DE LA MER' }, betes: { nom: 'PETITES BÊTES', ico: '🐞', places: 10, legende: 'meganeura', titre: 'CHOISIS TA PETITE BÊTE' } };
const mondeDe = k => (CHARS[k] && CHARS[k].monde) || 'terre';
// ÉCRAN DE CHOIX (25/09, ergonomie demandée par Vincent : « avec 60 animaux ça va vite devenir confus ») : la TERRE est rangée en 3 régions
// (noms de lieux du livre), chaque onglet tient sur un seul écran (12 cartes au plus). Les animaux de la TERRE se battent toujours entre eux.
const REGIONS = {
  savane: ['lion', 'croco', 'hippo', 'ratel', 'hyene', 'porcepic', 'autruche', 'lionne', 'girafe', 'guepard', 'leopard'],
  jungle: ['gorille', 'komodo', 'buffle', 'caiman', 'python', 'alligator', 'cobra', 'mangouste', 'jaguar', 'anaconda'],
  nord: ['tigre', 'ours', 'grizzly', 'puma', 'oursnoir', 'morse', 'loup', 'glouton', 'trex'], // (le tigre de Sibérie, duel 24 ; le T. rex vivait en Amérique du Nord)
};
const regionDe = k => mondeDe(k) !== 'terre' ? mondeDe(k) : Object.keys(REGIONS).find(r => REGIONS[r].includes(k)) || 'nord';
const ONGLETS = [ // k : onglet · m : monde des combats
  { k: 'fav', ico: '⭐', nom: 'PRÉFÉRÉS', titre: 'TES PRÉFÉRÉS' },
  { k: 'savane', m: 'terre', ico: '🦁', nom: 'SAVANE', titre: 'LA SAVANE' },
  { k: 'jungle', m: 'terre', ico: '🐊', nom: 'JUNGLES', titre: 'JUNGLES ET MARAIS' },
  { k: 'nord', m: 'terre', ico: '🌲', nom: 'GRAND NORD', titre: 'FORÊTS ET GRAND NORD' },
  { k: 'mer', m: 'mer', ico: '🌊', nom: 'MER', titre: 'LA MER' },
  { k: 'betes', m: 'betes', ico: '🐞', nom: 'PETITES BÊTES', titre: 'LES PETITES BÊTES' },
];
const ongletDe = k => ONGLETS.find(o => o.k === k) || ONGLETS[1];
const arenesDe = m => ARENES.filter(a => (a.monde || 'terre') === m && (!a.secret || (window.recompense && recompense(a.secret)))); // arènes secrètes : récompenses de trophées (surprises.js)
// cartes de l'écran de choix : les animaux du monde affiché (le légendaire seulement une fois gagné)
const amphibie = (k, m) => m === 'mer' && CHARS[k] && CHARS[k].amphibie; // le crocodile marin nage aussi en mer (livre, duel 26)
const memeMonde = (a, b) => mondeDe(a) === mondeDe(b) || amphibie(a, mondeDe(b)) || amphibie(b, mondeDe(a));
const mondeDuel = (a, b) => mondeDe(a) === 'mer' || mondeDe(b) === 'mer' ? 'mer' : mondeDe(a) === 'betes' || mondeDe(b) === 'betes' ? 'betes' : 'terre';
const mondeOuvert = m => !!MONDES[m] && ARENES.some(a => (a.monde || 'terre') === m); // 25/09 : les 3 mondes sont visibles tout de suite (les animaux à gagner y sont, avec leur duel de l'aventure)
const LISTE = (m = G.monde) => { const l = ORDRE.filter(k => (mondeDe(k) === m || amphibie(k, m)) && (k !== MONDES[m].legende || debloque(k))), leg = MONDES[m].legende; // (les amphibies juste avant le légendaire)
  return l.filter(k => !amphibie(k, m) && k !== leg).concat(l.filter(k => amphibie(k, m)), l.filter(k => k === leg)) };
const FAITS = { // cartes « LE SAVAIS-TU ? » : phrases du livre imprimé V19, mot pour mot (// p. N) ou à peine adaptées (// ≈ p. N : sujet ajouté).
  // Aucune carte ne donne le résultat d'un duel. Une carte ne se gagne que contre un animal déjà débloqué (sinon elle donnerait les réponses du quiz).
  tigre: [
    'Si on rasait un tigre, il resterait rayé : ses rayures sont aussi dessinées sur sa peau !', // p. 9
    'La nuit, le tigre voit six fois mieux que toi. Et il traverse à la nage des rivières larges de 8 km !', // p. 67
    'Le tigre approche sans un bruit, puis il bondit : jusqu’à 10 mètres d’un coup ! Plus que deux voitures garées l’une derrière l’autre.', // p. 55
    '1 tonne : le poids des plus gros gaurs, des bœufs sauvages. Un tigre peut en tuer un !', // p. 10
    'Dans les années 1940, il ne restait qu’une quarantaine de tigres de Sibérie. Protégés, ils sont aujourd’hui environ 750 en Russie !', // p. 70
  ],
  gorille: [
    'Le gorille se frappe la poitrine les mains en coupe, pas avec les poings. Au cinéma, on se trompe souvent !', // ≈ p. 68
    '2,40 m d’une main à l’autre : les bras écartés d’un gorille mâle. Écarte les tiens !', // p. 68
    'Devant ses plantes préférées, le gorille chantonne ! Sans doute une façon de dire : « Je mange, ne me dérange pas. »', // p. 67
    'Un dos argenté (un grand mâle gorille) ne recule pas.', // p. 68
    'Gare à la charge du gorille ! Il est bien plus fort qu’un humain. De combien ? Personne n’a pu le mesurer !', // p. 68
  ],
  lion: [
    'La nuit, le rugissement du lion s’entend jusqu’à 8 km : de l’autre bout de la ville ! Il veut dire : « Ici, c’est chez moi. »', // p. 9
    'Le lion se repose environ 20 heures par jour. Flemmard ? Non : il garde ses forces pour chasser !', // p. 19
    'À la naissance, le lionceau est couvert de petites taches ! Elles pâlissent en grandissant.', // p. 10
    'Certains lions cachent une petite pointe dure dans le pompon de leur queue. À quoi sert-elle ? Personne ne le sait !', // p. 41
  ],
  ours: [
    'Les grands poils de l’ours polaire sont creux, comme des pailles, et pleins d’air : ils gardent bien la chaleur !', // p. 15
    'L’ours polaire a des poils blancs ? Faux ! Ses poils sont transparents et sa peau est noire. Il paraît blanc… comme la neige, faite de glace transparente !', // ≈ p. 32
    '687 km nagés par une ourse polaire, 9 jours sans s’arrêter. Autant que de Paris à Marseille… à la nage !', // p. 16
    'Sous ses pattes, l’ours polaire porte de minuscules bosses. Elles accrochent la glace et l’aident à ne pas glisser.', // p. 26
    'Pour les scientifiques, l’ours polaire est un mammifère marin, comme le phoque et la baleine ! Il vit surtout sur la glace de mer.', // p. 31
  ],
  croco: [
    'Brutus, le vieux crocodile, a perdu une patte avant : arrachée par un requin… ou par un autre croco. Et il a perdu des dents !', // ≈ p. 60
    'La morsure du crocodile marin est la plus forte jamais mesurée. Un croco de 6 m mordrait presque comme un T. rex !', // p. 59
    '590 km parcourus en 25 jours par un crocodile marin qui « surfe » sur les courants de la mer !', // p. 60
    'Crocodile : fille ou garçon ? C’est la température du nid qui décide ! Vers 31,6 °C : des mâles. Plus chaud ou plus froid : des femelles.', // p. 60
    'Des crocos font un demi-cercle dans la rivière : un filet vivant ! Au menu : poissons, zèbres… et jeunes hippos !', // p. 13
  ],
  hippo: [
    '50 cm : la longueur des plus grandes dents d’hippo. Plus que ton avant-bras !', // p. 14
    'L’hippo ne nage pas : il marche au fond de l’eau. Il y dort même, et remonte respirer sans se réveiller !', // p. 13
    'Un hippopotame peut peser jusqu’à 3 200 kg.', // ≈ p. 13
    'L’hippopotame mâle agite sa queue pour éparpiller ses crottes et marquer son territoire. Mieux vaut ne pas être derrière !', // p. 14
    'L’hippopotame ? Un gros pépère tout gentil. Faux ! Il renverse même des bateaux ! C’est l’un des animaux les plus dangereux d’Afrique.', // p. 14
  ],
  ratel: [
    'Sur Internet, des vidéos montrent le ratel, une sorte de blaireau d’Afrique, tenir tête à des lions. 13 kilos de rage contre 190 !', // p. 19
    'La peau du ratel, épaisse et trop grande pour lui, résiste aux morsures de chien. Si on l’attrape, il se retourne dans sa peau… et mord !', // p. 19
    '5 heures après une morsure de vipère au visage, un ratel chassait de nouveau des serpents !', // p. 20
    'Dans une ruche, le ratel mange le miel… et les larves, les bébés des abeilles ! Les piqûres ? Il s’en moque !', // p. 20
    'Le coup spécial du ratel : la bombe puante !', // ≈ p. 19
  ],
  grizzly: [
    'Le grizzly, un ours brun d’Amérique, peut avaler 40 000 papillons de nuit en un jour. Croustillant !', // p. 56
    'L’ours brun peut passer l’hiver sans manger, sans boire, sans pipi ni caca. Plusieurs mois !', // p. 16
    'Le coup spécial du grizzly : il attrape les saumons au vol !', // ≈ p. 15
    'Grizzly + ours polaire = « pizzly » ! On en a trouvé 8 dans la nature : une seule ourse polaire était leur maman… ou leur mamie !', // p. 15
    'Les oursons naissent dans la tanière, pendant que leur mère hiberne. Ils pèsent moins qu’une brique de lait !', // p. 55
  ],
  hyene: [
    'La hyène, une mangeuse de restes ? Non : elle chasse elle-même la plupart de ses repas. Des gnous, des zèbres… parfois trois fois plus lourds qu’elle !', // p. 41
    '7 cm : l’épaisseur des os de girafe qu’une hyène peut casser avec ses dents. Plus épais que ton poignet !', // p. 42
    'Chez les hyènes, les femelles commandent ! Et leur « rire » ? Pas une blague : du stress.', // p. 42
    '« La hyène est un chien sauvage. » Faux : c’est une cousine des chats ! Elle a sa propre famille : les hyènes.', // p. 42
    'Le coup spécial de la hyène : elle fatigue ses proies.', // ≈ p. 41
    'Le point faible de la hyène : son vacarme attire les voleurs.', // ≈ p. 41
  ],
  buffle: [
    'Le buffle d’eau peut peser jusqu’à 550 kg : sept fois plus lourd qu’un dragon de Komodo !', // ≈ p. 23
    'Tu as déjà mangé de la mozzarella de bufflonne ? Elle est faite avec le lait de la femelle du buffle d’eau !', // p. 23
    'Le coup spécial du buffle : il charge tête baissée !', // ≈ p. 23
    'Le point faible du buffle : ses blessures guérissent mal.', // ≈ p. 23
  ],
  morse: [
    'Un morse peut peser jusqu’à 1 500 kg, avec des défenses de 90 cm !', // ≈ p. 31
    'Le nom savant du morse veut dire « celui qui marche avec les dents » : ses défenses l’aident à monter sur la glace !', // p. 31
    'Jusqu’à 700 moustaches fouillent la boue. Puis sa langue aspire la chair hors du coquillage !', // p. 32
    'Le coup spécial du morse : il frappe avec ses défenses !', // ≈ p. 31
    'Sous sa gorge, le morse a une poche qu’il gonfle d’air, comme une bouée. Il peut dormir debout… dans l’eau !', // p. 48
  ],
  trex: [ // le légendaire n'est pas un duel du livre : infos du Natural History Museum de Londres (nhm.ac.uk, fiche Tyrannosaurus), sauf la dernière (p. 59)
    'Le T. rex vivait il y a 68 à 66 millions d’années, en Amérique du Nord.', // NHM
    'Il mesurait environ 12 mètres de long : la longueur d’un autobus !', // NHM
    'Sa morsure était 3 à 5 fois plus puissante que celle d’un lion : la plus forte de tous les animaux terrestres connus !', // NHM
    'Il avait une soixantaine de dents en dents de scie, longues jusqu’à 20 cm !', // NHM
    'La morsure du crocodile marin est la plus forte jamais mesurée. Un croco de 6 m mordrait presque comme un T. rex !', // p. 59
  ],
  komodo: [
    'Voici le plus gros lézard du monde : trois mètres de long.', // p. 23
    'Le dragon « goûte » l’air avec sa langue fourchue : il repère un animal mort jusqu’à 4 km !', // p. 23
    '24 kg de pâtes en un repas : ce que tu avalerais si tu mangeais comme un dragon de Komodo !', // p. 24
    'Les jeunes dragons de Komodo vivent perchés dans les arbres. Pourquoi ? Les dragons adultes mangent les petits !', // ≈ p. 24
    '« Le dragon tue avec les microbes de sa bouche. » Pas vraiment : son venin… et la mare sale !', // p. 24
  ],
  leopard: [
    'Le léopard grimpe à 15 m dans un arbre avec, dans la gueule, une proie plus lourde que lui.', // p. 11
    'En Inde, des léopards vivent dans un parc au milieu de Mumbai, l’une des villes les plus peuplées du monde !', // p. 26
    'Les taches du jaguar sont des anneaux noirs, souvent avec un point au milieu. Celles du léopard sont vides. Pratique pour ne pas les confondre !', // p. 26
    'La panthère noire n’existe pas ! C’est un jaguar, ou un léopard, au pelage tout noir ! Et sous le soleil, on voit encore ses taches.', // p. 35
    'Le coup spécial du léopard : un bond de 6 m !', // ≈ p. 11
  ],
  porcepic: [
    'Le porc-épic lance ses piquants ? C’est faux ! Pour prévenir, il les dresse et secoue sa queue, qui fait un bruit de hochet.', // p. 11
    'Les piquants du porc-épic sont des poils géants, faits comme tes cheveux. Un piquant perdu ? Un nouveau repousse.', // ≈ p. 12
    '40 lions blessés par des porcs-épics, et 10 tués, en 360 ans de récits et de vidéos. Même le roi !', // p. 12
    'Le porc-épic : jusqu’à 30 kg, et des piquants de 30 cm !', // ≈ p. 11
    'Le coup spécial du porc-épic : la charge en marche arrière !', // ≈ p. 11
  ],
  guepard: [
    'En moins de trois secondes, le guépard passe de l’arrêt à 70 km/h. Il démarre plus vite que la voiture de tes parents !', // p. 37
    'Le guépard ne sait pas rugir. À la place, il ronronne, il miaule… et il pousse de petits cris aigus, comme un oiseau !', // p. 47
    'Le guépard est le champion du sprint !', // ≈ p. 37
    'Le coup spécial du guépard : il fait trébucher sa proie.', // ≈ p. 37
    'Le point faible du guépard : de toutes petites dents.', // ≈ p. 37
  ],
  autruche: [
    'L’autruche est le seul oiseau à deux doigts par pied. Et elle court à 50 km/h pendant très longtemps !', // p. 37
    '5 mètres en un seul pas d’autruche, en pleine course ! Et toi, combien de pas ?', // p. 38
    'Autruche : un œil de 5 cm. Son œil est plus gros qu’une balle de ping-pong ! C’est le plus gros œil de tous les animaux de la terre ferme.', // p. 38
    'L’autruche cache sa tête dans le sable ? Faux ! Pour se cacher, elle se couche, le cou à plat sur le sol. De loin, on dirait un tas de terre !', // ≈ p. 38
    'Le coup spécial de l’autruche : un coup de pied à tuer un lion !', // ≈ p. 37
  ],
  orque: [
    'L’orque : jusqu’à 10 tonnes, et des dents de 8 cm !', // ≈ p. 7
    'Le coup spécial de l’orque : un coup de queue qui assomme !', // ≈ p. 7
    'Le point faible de l’orque : elle doit remonter respirer.', // ≈ p. 7
    'On a vu des orques nager avec un saumon mort posé sur la tête… comme un chapeau !', // p. 8
    'L’attaque en bande : c’est le coup spécial des orques !', // ≈ p. 61
  ],
  requin: [
    'Le grand requin blanc : jusqu’à 2 tonnes, et 300 dents sur 7 rangées !', // ≈ p. 7
    'Le coup spécial du grand requin blanc : il attaque par en dessous !', // ≈ p. 7
    'Le point faible du grand requin blanc : sur le dos, il ne bouge plus !', // ≈ p. 7
    '« Le grand requin blanc est le roi des mers. » Vrai ou faux ? Réponses : duel 2 !', // ≈ p. 71
  ],
  pieuvre: [
    'Pas d’os, trois cœurs, du sang bleu…', // p. 21
    'La pieuvre géante : 1 600 ventouses ! Une fois collée, la proie ne peut plus s’échapper !', // ≈ p. 22
    'Une maman pieuvre garde ses œufs pendant six mois… sans jamais manger !', // ≈ p. 22
    'Dans la mer, les jeunes pieuvres finissent souvent dans l’estomac d’un phoque… ou d’un plus gros requin.', // p. 22
    'La pieuvre géante : souvent plus de 20 kg, et des bras à ventouses !', // ≈ p. 21
    'Le coup spécial de la pieuvre géante : elle mord avec un bec caché !', // ≈ p. 21
    'Le point faible de la pieuvre géante : vite fatiguée en nageant !', // ≈ p. 21
  ],
  aiguillat: [
    'Un aiguillat peut vivre presque 70 ans !', // p. 21
    'L’aiguillat chasse en bande, parfois par milliers… et adore les pieuvres.', // ≈ p. 21
    'La femelle aiguillat porte ses petits pendant près de deux ans. À peu près autant qu’une maman éléphant !', // p. 25
    'L’aiguillat : un requin d’un mètre, moins de 10 kg, avec deux épines à venin !', // ≈ p. 21
    'Le coup spécial de l’aiguillat : il se plie et pique !', // ≈ p. 21
    'Le point faible de l’aiguillat : petit, pour un requin !', // ≈ p. 21
  ],
  espadon: [
    'L’espadon : jusqu’à 650 kg, avec une épée sur le nez !', // ≈ p. 39
    'Le coup spécial de l’espadon : il tranche d’un coup de tête !', // ≈ p. 39
    'Le point faible de l’espadon : ni dents ni écailles !', // ≈ p. 39
    'Un organe spécial chauffe les yeux et le cerveau de l’espadon jusqu’à 15 °C au-dessus de l’eau. Il voit mieux ses proies rapides !', // ≈ p. 40
    'Certains requins, comme le mako, mangent vraiment de l’espadon.', // p. 40
  ],
  requinbleu: [
    'Le requin bleu : jusqu’à 240 kg, avec des dents en scie !', // ≈ p. 39
    'Le coup spécial du requin bleu : il tourne autour de sa proie !', // ≈ p. 39
    'Le point faible du requin bleu : il se balade à 1 km/h !', // ≈ p. 39
    'Plus de 100 bébés requins bleus peuvent naître en même temps. De quoi remplir quatre classes d’école !', // p. 40
  ],
  megalo: [ // hors livre : Natural History Museum (Londres) et Smithsonian Ocean, vérifiés le 24/09/2026
    'Le mégalodon mesurait au moins 15 mètres de long : bien plus du double d’un grand requin blanc !', // NHM
    'Les dents du mégalodon pouvaient mesurer 18 cm : plus longues que ta main !', // NHM
    'La morsure du mégalodon était 6 à 10 fois plus forte que celle du grand requin blanc !', // NHM
    'Le mégalodon mangeait des baleines, des phoques et des tortues de mer.', // NHM · Smithsonian
    'Les bébés mégalodons grandissaient à l’abri, dans des baies peu profondes.', // NHM · Smithsonian
    'Le mégalodon a disparu il y a des millions d’années : on ne trouve ses dents que dans de très vieilles roches.', // NHM
  ],
  jaguar: [
    'Le jaguar : environ 100 kg, et une morsure perce-carapace !', // ≈ p. 17
    'Le coup spécial du jaguar : il mord l’arrière du crâne !', // ≈ p. 17
    'Le point faible du jaguar : des pattes courtes pour un félin !', // ≈ p. 17
    'Le jaguar : le 3e plus grand félin du monde !', // ≈ p. 36
  ],
  anaconda: [
    'L’anaconda jaune : environ 30 kg, et un corps de près de 4 m !', // ≈ p. 17
    'Le coup spécial de l’anaconda : il serre à bloquer le sang !', // ≈ p. 17
    'Le point faible de l’anaconda : lent et maladroit sur terre !', // ≈ p. 17
    'Une femelle anaconda a eu des bébés… sans aucun papa !', // p. 18
    'D’habitude, une maman anaconda en a 20 à 40 d’un coup.', // p. 18
    'L’anaconda peut rester environ 10 minutes sous l’eau sans respirer. Toi ? Sûrement moins d’une minute !', // ≈ p. 18
  ],
  caiman: [
    'Le caïman : près de 60 kg, et une peau à plaques d’os !', // ≈ p. 35
    'Le coup spécial du caïman : il plonge pour se cacher !', // ≈ p. 35
    'Le point faible du caïman : lent quand il est à terre !', // ≈ p. 35
    'Encore dans l’œuf, les bébés caïmans appellent leur mère en couinant. Elle ouvre le nid et les aide à sortir.', // p. 36
    '10 millions de caïmans vivent dans le Pantanal, au Brésil.', // ≈ p. 36
    'Le caïman noir vit en Amazonie et dépasse parfois 5 m !', // ≈ p. 36
  ],
  puma: [
    'Le puma : jusqu’à 100 kg, et de grosses pattes griffues !', // ≈ p. 27
    'Le coup spécial du puma : il saute sur le dos et mord !', // ≈ p. 27
    'Le point faible du puma : il fuit devant une meute !', // ≈ p. 27
    '2 400 km à pied ! Un jeune puma a traversé la moitié des États-Unis, du Dakota du Sud jusqu’à la côte Est.', // p. 28
  ],
  loup: [
    'Le loup : jusqu’à 80 kg, et des crocs qui percent le cuir !', // ≈ p. 27
    'Le coup spécial du loup : il blesse, puis il attend !', // ≈ p. 27
    'Le point faible du loup : il ne grimpe pas aux arbres !', // ≈ p. 27
    'Vers 2 semaines, les louveteaux ouvrent des yeux tout bleus ! Entre 2 et 4 mois, leurs yeux deviennent jaune doré.', // p. 28
    '37 loups : le record de Yellowstone !', // ≈ p. 28
  ],
  mangouste: [
    'La mangouste : environ 40 cm sans la queue, et 40 dents pointues !', // ≈ p. 33
    'Le coup spécial de la mangouste : elle esquive, puis mord la tête !', // ≈ p. 33
    'Le point faible de la mangouste : trop de venin peut la tuer !', // ≈ p. 33
    'Le venin est une clé. Mais les serrures de ses muscles ont une autre forme : la clé rentre mal !', // p. 34
    'Au menu de la mangouste : souris, lézards, scarabées, grenouilles, crabes, œufs.', // ≈ p. 34
  ],
  cobra: [
    'Le cobra : jusqu’à 220 cm, et un venin mortel !', // ≈ p. 33
    'Le coup spécial du cobra : il ouvre son capuchon !', // ≈ p. 33
    'Le point faible du cobra : il frappe trop lentement !', // ≈ p. 33
    'Le cobra royal mange presque uniquement… d’autres serpents ! C’est ce que veut dire son nom savant.', // p. 53
    'Le cobra royal : le seul serpent qui construit un nid !', // ≈ p. 54
  ],
  oursnoir: [
    'L’ours noir : jusqu’à 270 kg, et des griffes courbes !', // ≈ p. 43
    'Le coup spécial de l’ours noir : il charge pour faire peur !', // ≈ p. 43
    'Le point faible de l’ours noir : plus gourmand que bagarreur !', // ≈ p. 43
    'Les ours esprits : de rares ours noirs au pelage blanc !', // ≈ p. 43
  ],
  glouton: [
    'Le glouton : jusqu’à 30 kg, et une dent pour la viande gelée !', // ≈ p. 43
    'Le coup spécial du glouton : il gronde et fonce !', // ≈ p. 43
    'Le point faible du glouton : des pattes courtes !', // ≈ p. 43
    '1 500 m grimpés en 90 minutes par un glouton, en pleine montagne : plus haut que quatre tours Eiffel empilées !', // p. 44
    'Grâce à ses larges pattes, le glouton court sur la neige sans s’enfoncer. Il peut ainsi attraper un caribou !', // ≈ p. 44
  ],
  python: [
    'Le python birman : jusqu’à 98 kg, et un corps qui serre !', // ≈ p. 45
    'Le coup spécial du python birman : l’attaque surprise !', // ≈ p. 45
    'Le point faible du python birman : il ne supporte pas le froid !', // ≈ p. 45
    'Le python le plus lourd jamais capturé en Floride était une femelle pleine de 122 œufs : un record !', // p. 46
    'Le python réticulé nage si bien qu’on en a vu en pleine mer !', // p. 53
    'Des creux sur ses lèvres captent la chaleur des animaux. Dans le noir, il sait où tu es… enfin, où est la souris.', // p. 54
  ],
  alligator: [
    'L’alligator : jusqu’à 450 kg, et jusqu’à 80 dents !', // ≈ p. 45
    'Le coup spécial de l’alligator : il mord, puis il roule !', // ≈ p. 45
    'Le point faible de l’alligator : jeune, il se fait avaler !', // ≈ p. 45
  ],
  lionne: [
    'Les lionnes : jusqu’à 180 kg chacune, et des griffes pour s’accrocher !', // ≈ p. 51
    'Le coup spécial des lionnes : elles sautent sur le dos !', // ≈ p. 51
    'Le point faible des lionnes : 7 fois plus légères qu’une girafe !', // ≈ p. 51
    'Comme une équipe de foot : chaque lionne a son poste ! Les plus légères poussent la proie vers les plus lourdes, cachées au centre !', // p. 51
  ],
  girafe: [
    'La girafe : jusqu’à 1 360 kg, et un sabot large de 30 cm !', // ≈ p. 51
    'Le coup spécial de la girafe : le coup de pied qui assomme !', // ≈ p. 51
    'Le point faible de la girafe : si elle tombe, c’est fini !', // ≈ p. 51
    'La langue de la girafe mesure 46 cm et elle est presque noire. Sans doute pour ne pas attraper de coup de soleil !', // ≈ p. 52
  ],
  bouledogue: [
    'Ce jeune requin-bouledogue : 1,50 m, et une morsure record pour sa taille !', // ≈ p. 59
    'Le coup spécial du requin-bouledogue : il cogne, puis il mord !', // ≈ p. 59
    'Le point faible du requin-bouledogue : une peau sans armure !', // ≈ p. 59
    'Le requin-bouledogue remonte les fleuves !', // p. 59
  ],
  baleine: [
    'La baleine bleue : jusqu’à 150 tonnes, et un corps de 30 m !', // ≈ p. 61
    'Le coup spécial de la baleine bleue : elle file à 32 km/h !', // ≈ p. 61
    'Le point faible de la baleine bleue : pas une seule dent !', // ≈ p. 61
    'Le chant de la baleine bleue s’entend plus loin que de Paris à Madrid !', // p. 62
    'Le souffle de la baleine bleue peut monter à 9 m !', // ≈ p. 62
  ],
  crabe: [
    'Le crabe : environ 10 cm, et deux pinces solides !', // ≈ p. 49
    'Le coup spécial du crabe : il pince et ne lâche plus !', // ≈ p. 49
    'Le point faible du crabe : sa carapace peut casser !', // ≈ p. 49
    'Le crabe n’a pas de dents dans la bouche… mais il en a dans l’estomac !', // p. 50
  ],
  crevette: [
    'La crevette-mante : environ 10 cm, et deux massues à ressort !', // ≈ p. 49
    'Le coup spécial de la crevette-mante : elle casse les coquilles !', // ≈ p. 49
    'Le point faible de la crevette-mante : molle quand elle mue !', // ≈ p. 49
    'Ses massues se déplient comme un ressort : elles partent à 80 km/h !', // p. 50
    'Elle a 12 sortes de détecteurs de couleurs, toi 3. Pourtant, tu vois mieux les couleurs qu’elle !', // p. 50
  ],
  frelon: [
    'Le frelon géant : près de 4 cm, et un dard de 6 mm !', // ≈ p. 5
    'Le coup spécial du frelon géant : il coupe la tête des abeilles !', // ≈ p. 5
    'Le point faible du frelon géant : il supporte mal la chaleur !', // ≈ p. 5
  ],
  abeille: [
    'Les abeilles japonaises : environ 1 cm, et un petit dard !', // ≈ p. 5
    'Le coup spécial des abeilles : elles foncent toutes ensemble !', // ≈ p. 5
    'Le point faible des abeilles : un corps fragile !', // ≈ p. 5
    'Toute leur vie, 12 abeilles font 1 petite cuillère de miel !', // p. 6
  ],
  mygale: [
    'La mygale : 12 cm avec les pattes, et des crochets à venin !', // ≈ p. 29
    'Le coup spécial de la mygale : elle jette ses poils piquants !', // ≈ p. 29
    'Le point faible de la mygale : elle voit très mal !', // ≈ p. 29
    'La mygale ne mâche pas : elle fait fondre sa proie avec un liquide, puis l’aspire comme avec une paille.', // p. 30
  ],
  guepe: [
    'La guêpe géante : jusqu’à 5 cm, et un dard de 7 mm !', // ≈ p. 29
    'Le coup spécial de la guêpe géante : elle pique et paralyse !', // ≈ p. 29
    'Le point faible de la guêpe géante : elle doit piquer entre les pattes !', // ≈ p. 29
  ],
  scolopendre: [
    'La scolopendre géante : jusqu’à 30 cm, et un venin qui paralyse !', // ≈ p. 57
    'Le coup spécial de la scolopendre : elle chasse la tête en bas !', // ≈ p. 57
    'Le point faible de la scolopendre : elle se dessèche vite !', // ≈ p. 57
    'Des chercheurs l’ont vue manger des chauves-souris plus lourdes qu’elle !', // p. 58
  ],
  chauvesouris: [
    'La chauve-souris : un corps de moins de 10 cm, et de petites dents pointues !', // ≈ p. 57
    'Le coup spécial de la chauve-souris : elle chasse au sonar !', // ≈ p. 57
    'Le point faible de la chauve-souris : des ailes en peau très fine !', // ≈ p. 57
    'La plus petite chauve-souris du monde pèse 2 g ! La plus grande mesure 1,70 m d’une aile à l’autre.', // p. 58
  ],
  mante: [
    'La mante religieuse : jusqu’à 7 g, et des pattes-pièges à piquants !', // ≈ p. 63
    'Le coup spécial de la mante : elle frappe en un éclair !', // ≈ p. 63
    'Le point faible de la mante : souvent mangée par les oiseaux !', // ≈ p. 63
    'On croit que la mante dévore toujours son mari. FAUX ! Le plus souvent, il repart vivant !', // ≈ p. 64
  ],
  colibri: [
    'Le colibri : environ 3 g, et un bec en aiguille !', // ≈ p. 63
    'Le coup spécial du colibri : il vole même en arrière !', // ≈ p. 63
    'Le point faible du colibri : il doit boire sans arrêt !', // ≈ p. 63
    'Son nid tient dans le creux de ta main… et il est cousu avec des fils d’araignée !', // p. 64
  ],
  serpentbrun: [
    'Le jeune serpent brun : environ 27 cm, et des crochets à venin !', // ≈ p. 65
    'Le coup spécial du serpent brun : il fouille chaque cachette !', // ≈ p. 65
    'Le point faible du jeune serpent brun : tout jeune, il débute !', // ≈ p. 65
  ],
  veuve: [
    'La veuve noire : 1 cm, et un venin très puissant !', // ≈ p. 65
    'Le coup spécial de la veuve noire : elle ficelle sa proie !', // ≈ p. 65
    'Le point faible de la veuve noire : on l’écrase d’un doigt !', // ≈ p. 65
    'Les jeunes veuves noires partent sur de longs fils de soie emportés par l’air. Huit pattes, aucune aile !', // ≈ p. 66
  ],
  meganeura: [ // (légendaire, hors livre : Wikipédia « Meganeura » et The Conversation, vérifié le 25/09/2026)
    'La méganeura vivait il y a environ 300 millions d’années : bien avant les dinosaures !', // HORS LIVRE
    'Ses ailes mesuraient environ 70 cm d’un bout à l’autre : l’un des plus grands insectes de tous les temps !', // HORS LIVRE
    'Ses fossiles ont été découverts en France, à Commentry, dans l’Allier, en 1880 !', // HORS LIVRE
    'Elle chassait d’autres insectes en plein vol, avec des pattes couvertes de piquants.', // HORS LIVRE
  ],
};

// ---------------------------------------------------------------------
//  QUIZ DE L'ARÈNE (25/09, demande de Vincent : « 42 qu'on peut débloquer si on répond aux questions correctement,
//  et 10 qu'on ne peut débloquer qu'avec le livre en main »).
//  Ces animaux se gagnent SANS le livre : « LE PUMA TE DÉFIE ! » → l'enfant le bat → il gagne 3 de ses cartes
//  « Le savais-tu ? » (des phrases du livre) → 3 questions dont la réponse est DANS ces cartes → l'animal est à lui.
//  Format : [question, [bonne réponse, faux, faux], numéro de la carte FAITS qui contient la réponse]
//  Règles : la bonne réponse se lit dans la carte, les deux autres non ; pas de piège ; jamais un passage « livre en main ».
//  Vérification automatique : python3 verif/sync_livre.py TEXTE_IMPRIME_V19_74P.md (section 2).
// ---------------------------------------------------------------------
const QUIZ = {
  // 🦁 SAVANE
  croco: [
    ['Qu’est-ce qui a arraché une patte avant de Brutus, le vieux crocodile ?', ['un requin ou un autre croco', 'un hippopotame en colère', 'un piège de pêcheur'], 0],
    ['Un crocodile marin de 6 m mordrait presque aussi fort que… ?', ['un T. rex', 'un lion', 'un gorille'], 1],
    ['Comment le crocodile marin fait-il de très longs voyages en mer ?', ['il surfe sur les courants', 'il s’accroche aux baleines', 'il marche au fond de l’eau'], 2],
    ['Chez le crocodile, qu’est-ce qui décide si le bébé sera une fille ou un garçon ?', ['la température du nid', 'la maman', 'la couleur de l’œuf'], 3],
    ['Des crocos font un demi-cercle dans la rivière. Ça fait… ?', ['un filet vivant', 'une échelle', 'un barrage'], 4],
  ],
  hippo: [
    ['Quelle longueur peuvent avoir les plus grandes dents d’hippo ?', ['50 cm', '5 cm', '2 m'], 0],
    ['L’hippopotame sait-il nager ?', ['non : il marche au fond de l’eau', 'non : il flotte comme un bouchon', 'oui : aussi vite qu’un dauphin'], 1],
    ['Combien peut peser un hippopotame ?', ['jusqu’à 3 200 kg', 'jusqu’à 320 kg', 'jusqu’à 32 000 kg'], 2],
    ['Pourquoi l’hippopotame mâle agite-t-il sa queue ?', ['pour éparpiller ses crottes', 'pour chasser les mouches', 'pour dire bonjour'], 3],
    ['L’hippopotame est-il un gros animal tout gentil ?', ['non : il renverse même des bateaux', 'oui : il ne se fâche jamais', 'non : il est juste timide'], 4],
  ],
  ratel: [
    ['Combien pèse le ratel, face à des lions de 190 kilos ?', ['13 kilos', '130 kilos', '1 kilo'], 0],
    ['Si on attrape le ratel, que fait-il ?', ['il se retourne dans sa peau… et mord', 'il gonfle sa peau… comme un ballon', 'il laisse sa peau… et s’enfuit'], 1],
    ['Mordu au visage par un serpent, quand le ratel chassait-il de nouveau ?', ['5 heures après', '5 semaines après', '5 ans après'], 2],
    ['Dans une ruche, que mange le ratel ?', ['le miel et les larves', 'la cire et les fleurs', 'rien : il a peur des piqûres'], 3],
    ['Quel est le coup spécial du ratel ?', ['la bombe puante', 'la roulade géante', 'le coup de queue'], 4],
  ],
  hyene: [
    ['La hyène mange-t-elle seulement les restes des autres ?', ['non : elle chasse la plupart de ses repas', 'oui : elle ne chasse jamais', 'non : elle mange surtout des fruits'], 0],
    ['Quelle épaisseur d’os de girafe une hyène peut-elle casser avec ses dents ?', ['7 cm', '7 mm', '70 cm'], 1],
    ['Chez les hyènes, qui commande ?', ['les femelles', 'les mâles', 'les bébés'], 2],
    ['La hyène est une cousine… ?', ['des chats', 'des chiens', 'des ours'], 3],
    ['Quel est le coup spécial de la hyène ?', ['elle fatigue ses proies', 'elle crache du venin', 'elle plaque sa proie au sol'], 4],
    ['Quel est le point faible de la hyène ?', ['son vacarme attire les voleurs', 'sa queue la gêne pour courir', 'elle a peur de l’eau'], 5],
  ],
  porcepic: [
    ['Le porc-épic lance-t-il ses piquants ?', ['non : il les dresse et secoue sa queue', 'oui : comme des flèches', 'non : il les cache sous son ventre'], 0],
    ['Les piquants du porc-épic sont faits comme… ?', ['tes cheveux', 'tes ongles', 'tes dents'], 1],
    ['Quel animal, « le roi », s’est déjà fait piquer par des porcs-épics ?', ['le lion', 'l’éléphant', 'le crocodile'], 2],
    ['Quelle longueur font les piquants du porc-épic ?', ['30 cm', '3 cm', '2 m'], 3],
    ['Quel est le coup spécial du porc-épic ?', ['la charge en marche arrière', 'la roulade en boule', 'le saut piquant'], 4],
  ],
  autruche: [
    ['Combien de doigts l’autruche a-t-elle à chaque pied ?', ['deux', 'trois', 'cinq'], 0],
    ['Quelle longueur fait un seul pas d’autruche, en pleine course ?', ['5 mètres', '50 centimètres', '20 mètres'], 1],
    ['L’œil de l’autruche est plus gros… ?', ['qu’une balle de ping-pong', 'qu’un ballon de foot', 'qu’une pastèque'], 2],
    ['Pour se cacher, que fait l’autruche ?', ['elle se couche le cou à plat', 'elle met la tête dans le sable', 'elle grimpe dans un arbre'], 3],
    ['Quel est le coup spécial de l’autruche ?', ['un coup de pied à tuer un lion', 'un coup de bec en piqué', 'un battement d’ailes géant'], 4],
  ],
  lionne: [
    ['À quoi servent les griffes des lionnes ?', ['à s’accrocher', 'à creuser', 'à nager'], 0],
    ['Quel est le coup spécial des lionnes ?', ['elles sautent sur le dos', 'elles creusent un piège', 'elles grimpent aux arbres'], 1],
    ['Le point faible des lionnes : elles sont 7 fois plus légères que… ?', ['la girafe', 'le lion', 'la hyène'], 2],
    ['Chez les lionnes, qui pousse la proie vers les plus lourdes ?', ['les plus légères', 'les plus vieilles', 'les lionceaux'], 3],
  ],
  girafe: [
    ['Quelle largeur fait le sabot d’une girafe ?', ['30 cm', '3 cm', '1 m'], 0],
    ['Quel est le coup spécial de la girafe ?', ['le coup de pied qui assomme', 'le coup de langue', 'le cri qui fait peur'], 1],
    ['Quel est le point faible de la girafe ?', ['si elle tombe, c’est fini', 'si elle court, elle s’essouffle', 'elle ne voit pas loin'], 2],
    ['De quelle couleur est la langue de la girafe ?', ['presque noire', 'rose bonbon', 'vert pomme'], 3],
  ],
  // 🐊 JUNGLES & MARAIS
  komodo: [
    ['Combien mesure le dragon de Komodo, le plus gros lézard du monde ?', ['trois mètres de long', 'trente centimètres', '30 mètres de long'], 0],
    ['Avec quoi le dragon de Komodo « goûte »-t-il l’air ?', ['sa langue fourchue', 'sa queue', 'ses griffes'], 1],
    ['Si tu mangeais comme un dragon de Komodo, tu avalerais en un repas… ?', ['24 kg de pâtes', '24 grammes de pâtes', '24 tonnes de pâtes'], 2],
    ['Où vivent les jeunes dragons de Komodo ?', ['perchés dans les arbres', 'dans des terriers', 'au fond de l’eau'], 3],
    ['Qu’est-ce qui tue les proies du dragon de Komodo ?', ['son venin… et la mare sale', 'sa queue… et ses griffes', 'il les écrase'], 4],
  ],
  buffle: [
    ['Combien de fois le buffle d’eau est-il plus lourd qu’un dragon de Komodo ?', ['sept fois', 'deux fois', 'trois fois'], 0],
    ['Quel fromage est fait avec le lait de la bufflonne ?', ['la mozzarella', 'la raclette', 'le camembert'], 1],
    ['Quel est le coup spécial du buffle ?', ['il charge tête baissée', 'il se roule dans la boue', 'il donne des coups de queue'], 2],
    ['Quel est le point faible du buffle ?', ['ses blessures guérissent mal', 'ses cornes sont fragiles', 'il a peur de l’eau'], 3],
  ],
  caiman: [
    ['Comment est la peau du caïman ?', ['à plaques d’os', 'toute douce', 'couverte de plumes'], 0],
    ['Quel est le coup spécial du caïman ?', ['il plonge pour se cacher', 'il saute dans les arbres', 'il crache de l’eau'], 1],
    ['Quel est le point faible du caïman ?', ['lent quand il est à terre', 'lent quand il nage', 'il n’a pas de dents'], 2],
    ['Encore dans l’œuf, comment les bébés caïmans appellent-ils leur mère ?', ['en couinant', 'en tapant du pied', 'en chantant'], 3],
    ['Combien de caïmans vivent dans le Pantanal, au Brésil ?', ['10 millions', '10 000', '100'], 4],
    ['Le caïman noir vit en Amazonie. Il dépasse parfois… ?', ['5 m', '50 cm', '20 m'], 5],
  ],
  python: [
    ['Quel est le coup spécial du python birman ?', ['l’attaque surprise', 'la morsure glacée', 'le coup de queue'], 1],
    ['Quel est le point faible du python birman ?', ['il ne supporte pas le froid', 'il a peur des souris', 'il ne sait pas nager'], 2],
    ['Le python le plus lourd capturé en Floride portait combien d’œufs ?', ['122', '12', '1 200'], 3],
    ['Où a-t-on déjà vu des pythons réticulés ?', ['en pleine mer', 'sur la banquise', 'en haut des nuages'], 4],
    ['Grâce aux creux de ses lèvres, que capte le python ?', ['la chaleur des animaux', 'le bruit des pas', 'l’odeur des fleurs'], 5],
  ],
  alligator: [
    ['Combien de dents peut avoir l’alligator ?', ['jusqu’à 80', 'jusqu’à 8', 'jusqu’à 800'], 0],
    ['Combien peut peser l’alligator ?', ['jusqu’à 450 kg', 'jusqu’à 45 kg', 'jusqu’à 4 500 kg'], 0],
    ['Quel est le coup spécial de l’alligator ?', ['il mord, puis il roule', 'il saute, puis il plonge', 'il grimpe aux arbres'], 1],
    ['Quel est le point faible de l’alligator ?', ['jeune, il se fait avaler', 'jeune, il ne sait pas nager', 'il a peur du noir'], 2],
  ],
  cobra: [
    ['Quelle longueur peut atteindre le cobra ?', ['220 cm', '22 cm', '5 m'], 0],
    ['Quel est le coup spécial du cobra ?', ['il ouvre son capuchon', 'il se roule en boule', 'il saute très haut'], 1],
    ['Quel est le point faible du cobra ?', ['il frappe trop lentement', 'il n’a pas de venin', 'il a peur des souris'], 2],
    ['Que mange presque uniquement le cobra royal ?', ['d’autres serpents', 'des fruits', 'du poisson'], 3],
    ['Le cobra royal est le seul serpent qui… ?', ['construit un nid', 'vit sur la banquise', 'a des plumes'], 4],
  ],
  mangouste: [
    ['Combien de dents pointues a la mangouste ?', ['40', '4', '400'], 0],
    ['Quel est le coup spécial de la mangouste ?', ['elle esquive, puis mord la tête', 'elle saute, puis griffe la queue', 'elle creuse un piège'], 1],
    ['Quel est le point faible de la mangouste ?', ['trop de venin peut la tuer', 'trop de soleil la fatigue', 'elle a peur de l’eau'], 2],
    ['Le venin est une clé. Pourquoi rentre-t-il mal chez la mangouste ?', ['ses « serrures » ont une autre forme', 'ses « clés » sont trop petites', 'elle a une peau en fer'], 3],
    ['Qu’y a-t-il au menu de la mangouste ?', ['souris, lézards, scarabées…', 'herbe, feuilles, fleurs…', 'algues, glace, cailloux…'], 4],
  ],
  // 🌲 FORÊTS & GRAND NORD
  grizzly: [
    ['Combien de papillons de nuit un grizzly peut-il avaler en une seule journée ?', ['40 000', '400', '4'], 0],
    ['Pendant l’hiver, l’ours brun peut passer plusieurs mois… ?', ['sans manger, sans boire, sans pipi ni caca', 'sans dormir, à chercher du miel', 'à nager dans la mer'], 1],
    ['Quel est le coup spécial du grizzly ?', ['il attrape les saumons au vol', 'il creuse un terrier géant', 'il se roule dans la neige'], 2],
    ['Grizzly + ours polaire = … ?', ['« pizzly »', '« grizzlaire »', '« polarzly »'], 3],
    ['Les oursons qui viennent de naître pèsent moins… ?', ['qu’une brique de lait', 'qu’un vélo', 'qu’un enfant'], 4],
  ],
  puma: [
    ['Combien peut peser le puma ?', ['jusqu’à 100 kg', 'jusqu’à 10 kg', 'jusqu’à 1 000 kg'], 0],
    ['Quel est le coup spécial du puma ?', ['il saute sur le dos et mord', 'il nage sous l’eau', 'il se roule dans la neige'], 1],
    ['Quel est le point faible du puma ?', ['il fuit devant une meute', 'il ne sait pas sauter', 'il a peur des oiseaux'], 2],
    ['Quelle distance un jeune puma a-t-il parcourue à pied ?', ['2 400 km', '24 km', '240 000 km'], 3],
  ],
  oursnoir: [
    ['Combien peut peser l’ours noir ?', ['jusqu’à 270 kg', 'jusqu’à 27 kg', 'jusqu’à 2 700 kg'], 0],
    ['Quel est le coup spécial de l’ours noir ?', ['il charge pour faire peur', 'il fait le mort', 'il se cache dans l’eau'], 1],
    ['Quel est le point faible de l’ours noir ?', ['plus gourmand que bagarreur', 'plus lent qu’un escargot', 'il a peur de la neige'], 2],
    ['Comment s’appellent les rares ours noirs au pelage blanc ?', ['les ours esprits', 'les ours fantômes', 'les ours neige'], 3],
  ],
  morse: [
    ['Quelle longueur peuvent atteindre les défenses du morse ?', ['90 cm', '9 cm', '3 m'], 0],
    ['Les défenses du morse l’aident à… ?', ['monter sur la glace', 'casser la coque des bateaux', 'creuser un terrier'], 1],
    ['Combien de moustaches le morse a-t-il pour fouiller la boue ?', ['jusqu’à 700', 'jusqu’à 7', 'jusqu’à 70 000'], 2],
    ['Quel est le coup spécial du morse ?', ['il frappe avec ses défenses', 'il crache de l’eau', 'il mord la queue'], 3],
    ['Pour dormir debout dans l’eau, que gonfle le morse ?', ['une poche d’air sous sa gorge', 'ses joues, comme un ballon', 'sa queue, comme une bouée'], 4],
  ],
  // 🌊 MER
  requinbleu: [
    ['Comment sont les dents du requin bleu ?', ['en scie', 'toutes rondes', 'il n’en a pas'], 0],
    ['Quel est le coup spécial du requin bleu ?', ['il tourne autour de sa proie', 'il crache de l’encre', 'il se cache dans le sable'], 1],
    ['Quel est le point faible du requin bleu ?', ['il se balade à 1 km/h', 'il a peur des poissons', 'il ne voit que la nuit'], 2],
    ['Combien de bébés requins bleus peuvent naître en même temps ?', ['plus de 100', '2', '10'], 3],
  ],
  aiguillat: [
    ['Combien d’années un aiguillat peut-il vivre ?', ['presque 70 ans', '7 ans', '700 ans'], 0],
    ['Qu’adore manger l’aiguillat ?', ['les pieuvres', 'les algues', 'les baleines'], 1],
    ['Combien de temps la femelle aiguillat porte-t-elle ses petits ?', ['près de deux ans', 'près de deux jours', 'deux semaines'], 2],
    ['Quelle arme a l’aiguillat ?', ['deux épines à venin', 'une corne sur la tête', 'des pinces'], 3],
    ['Quel est le coup spécial de l’aiguillat ?', ['il se plie et pique', 'il tourne en rond', 'il fait des bulles'], 4],
  ],
  espadon: [
    ['Qu’a l’espadon sur le nez ?', ['une épée', 'une corne', 'une ventouse'], 0],
    ['Quel est le coup spécial de l’espadon ?', ['il tranche d’un coup de tête', 'il se cache dans le sable', 'il crache de l’encre'], 1],
    ['Quel est le point faible de l’espadon ?', ['ni dents ni écailles', 'ni yeux ni oreilles', 'il nage très lentement'], 2],
    ['Chez l’espadon, qu’est-ce qu’un organe spécial réchauffe ?', ['ses yeux et son cerveau', 'sa queue et ses nageoires', 'son ventre'], 3],
    ['Quel requin mange vraiment de l’espadon ?', ['le mako', 'le requin-baleine', 'l’aiguillat'], 4],
  ],
  bouledogue: [
    ['Comment est la morsure du jeune requin-bouledogue ?', ['record pour sa taille', 'toute petite', 'sans dents'], 0],
    ['Quel est le coup spécial du requin-bouledogue ?', ['il cogne, puis il mord', 'il tourne, puis il fuit', 'il se cache dans le sable'], 1],
    ['Quel est le point faible du requin-bouledogue ?', ['une peau sans armure', 'une queue trop courte', 'il a peur du noir'], 2],
    ['Où peut aller le requin-bouledogue ?', ['il remonte les fleuves', 'il grimpe sur la plage', 'il nage sous la banquise'], 3],
  ],
  crabe: [
    ['Combien mesure le crabe ?', ['environ 10 cm', 'environ 1 m', 'environ 1 mm'], 0],
    ['Quel est le coup spécial du crabe ?', ['il pince et ne lâche plus', 'il crache de l’encre', 'il saute très haut'], 1],
    ['Quel est le point faible du crabe ?', ['sa carapace peut casser', 'sa carapace est trop lourde', 'il marche trop vite'], 2],
    ['Où le crabe a-t-il des dents ?', ['dans l’estomac', 'dans les pattes', 'sur le dos'], 3],
  ],
  crevette: [
    ['Quelles armes a la crevette-mante ?', ['deux massues à ressort', 'deux épées', 'huit bras à ventouses'], 0],
    ['Quel est le coup spécial de la crevette-mante ?', ['elle casse les coquilles', 'elle crache du venin', 'elle se cache dans le sable'], 1],
    ['Quel est le point faible de la crevette-mante ?', ['molle quand elle mue', 'molle quand elle dort', 'elle a peur des crabes'], 2],
    ['À quelle vitesse partent ses massues ?', ['80 km/h', '8 km/h', '800 km/h'], 3],
    ['Elle a 12 sortes de détecteurs de couleurs, toi 3. Qui voit le mieux les couleurs ?', ['toi', 'la crevette-mante', 'aucun des deux'], 4],
  ],
  // 🐞 PETITES BÊTES
  mygale: [
    ['Combien mesure la mygale, avec les pattes ?', ['12 cm', '12 mm', '1,20 m'], 0],
    ['Quel est le coup spécial de la mygale ?', ['elle jette ses poils piquants', 'elle tisse une toile géante', 'elle saute très haut'], 1],
    ['Quel est le point faible de la mygale ?', ['elle voit très mal', 'elle a peur du noir', 'elle ne sait pas marcher'], 2],
    ['Comment la mygale mange-t-elle sa proie ?', ['elle la fait fondre et l’aspire', 'elle la mâche longtemps', 'elle l’avale tout rond'], 3],
  ],
  guepe: [
    ['Combien mesure la guêpe géante ?', ['jusqu’à 5 cm', 'jusqu’à 50 cm', 'jusqu’à 1 m'], 0],
    ['Quelle longueur fait son dard ?', ['7 mm', '70 cm', '7 m'], 0],
    ['Quel est le coup spécial de la guêpe géante ?', ['elle pique et paralyse', 'elle crache du miel', 'elle se roule en boule'], 1],
    ['Son point faible : où doit-elle piquer ?', ['entre les pattes', 'sur le dos', 'dans les yeux'], 2],
  ],
  chauvesouris: [
    ['Comment sont les dents de la chauve-souris ?', ['petites et pointues', 'grandes et plates', 'elle n’en a pas'], 0],
    ['Comment la chauve-souris chasse-t-elle ?', ['au sonar', 'à l’odeur', 'au toucher'], 1],
    ['Quel est le point faible de la chauve-souris ?', ['des ailes en peau très fine', 'des oreilles trop petites', 'elle a peur du noir'], 2],
    ['Combien pèse la plus petite chauve-souris du monde ?', ['2 g', '2 kg', '200 g'], 3],
  ],
  colibri: [
    ['Combien pèse le colibri ?', ['environ 3 g', 'environ 3 kg', 'environ 300 g'], 0],
    ['Quel est le coup spécial du colibri ?', ['il vole même en arrière', 'il pique comme une guêpe', 'il chante très fort'], 1],
    ['Quel est le point faible du colibri ?', ['il doit boire sans arrêt', 'il vole trop lentement', 'il a peur des fleurs'], 2],
    ['Avec quoi le nid du colibri est-il cousu ?', ['des fils d’araignée', 'des poils de chat', 'des brins de laine'], 3],
  ],
  serpentbrun: [
    ['Combien mesure le jeune serpent brun ?', ['environ 27 cm', 'environ 27 m', 'environ 2 mm'], 0],
    ['Avec quoi le jeune serpent brun mord-il ?', ['des crochets à venin', 'des dents plates', 'un bec'], 0],
    ['Quel est le coup spécial du serpent brun ?', ['il fouille chaque cachette', 'il crache du venin', 'il fait le mort'], 1],
    ['Quel est le point faible du jeune serpent brun ?', ['tout jeune, il débute', 'tout petit, il a froid', 'il est trop lent'], 2],
  ],
  veuve: [
    ['Combien mesure la veuve noire ?', ['1 cm', '10 cm', '1 m'], 0],
    ['Comment est le venin de la veuve noire ?', ['très puissant', 'tout doux', 'sans danger'], 0],
    ['Quel est le coup spécial de la veuve noire ?', ['elle ficelle sa proie', 'elle saute très loin', 'elle crache du venin'], 1],
    ['Quel est le point faible de la veuve noire ?', ['on l’écrase d’un doigt', 'on la noie d’une goutte', 'elle a peur du noir'], 2],
    ['Comment les jeunes veuves noires voyagent-elles ?', ['sur de longs fils de soie', 'sur le dos de leur maman', 'sur les ailes des oiseaux'], 3],
  ],
};
// ---------------------------------------------------------------------
//  LIVRE EN MAIN (24/09, idée de Vincent) : ces animaux se débloquent SEULEMENT avec le livre sous les yeux.
//  Depuis le 25/09 : ce sont les 10 « CHAMPIONS DU LIVRE » (2 par onglet, les plus spectaculaires ; cartes dorées).
//  Les questions qu'un enfant trouve sans le livre (« le mâle ou la… », « vrai ou faux », culture générale) sont retirées.
//  Les anciennes questions des 26 autres animaux : nouveaux/lem_archive_25-09.js (ces animaux se gagnent au défi + quiz).
//  Pas de choix multiple : un mot à écrire, trouvé à un endroit précis du livre (page + encart). Impossible à deviner.
//  Règles : pages de fiches (recto) ou pages bonus, jamais une page de réponse ; jamais un mot que le jeu affiche ailleurs ;
//  majuscules, accents et une petite faute acceptés ; en cas d'erreur, on ne montre jamais la réponse.
//  Pas de code à offrir pour ces animaux, et le GOD MODE ne les ouvre pas : c'est le livre qui les débloque.
//  Vérification automatique : python3 verif/sync_livre.py TEXTE_IMPRIME_V19_74P.md
// ---------------------------------------------------------------------
const LIVRE_EN_MAIN = { // p : page · ou : où chercher · q : la question · r : le mot à écrire · x : le passage du livre qui le contient (le jeu ne doit jamais l'afficher)
  guepard: [
    { p: 37, ou: 'l’encart « CHIFFRE WAOUH »', q: 'Quel est le 2ᵉ mot du titre, écrit en gros ?', r: 'fusée', x: 'UNE FUSÉE À POILS' },
    { p: 37, ou: 'l’encart « CHIFFRE WAOUH »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'poils', x: 'UNE FUSÉE À POILS' },
    { p: 47, ou: 'le guépard, dans « À RACONTER À LA RÉCRÉ »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'gazouille', x: 'UN FÉLIN QUI GAZOUILLE' },
  ],
  leopard: [
    { p: 26, ou: 'le léopard, dans « À RACONTER À LA RÉCRÉ »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'ville', x: 'UN LÉOPARD EN VILLE' },
    { p: 26, ou: 'le léopard, dans « À RACONTER À LA RÉCRÉ »', q: 'Ces léopards vivent dans un parc, au milieu de… ?', r: 'Mumbai', x: 'au milieu de Mumbai' }, // (24/09 soir) l'ancien repère « UN LÉOPARD EN VILLE » donnait la réponse de la question d'avant
    { p: 35, ou: 'l’encart « LE TRUC FOU »', q: 'Quel est le 2ᵉ mot du titre, écrit en gros ?', r: 'panthère', x: 'LA PANTHÈRE NOIRE N’EXISTE PAS' },
  ],
  jaguar: [
    { p: 17, ou: 'le jaguar, dans « À RACONTER À LA RÉCRÉ »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'bond', x: 'IL TUE D’UN SEUL BOND' },
    { p: 17, ou: 'le jaguar, dans « À RACONTER À LA RÉCRÉ »', q: 'Quel animal de 34 kg un jaguar a-t-il traîné sur 90 m ?', r: 'tortue', x: 'traîner une tortue de mer de 34 kg sur 90 m' },
  ],
  anaconda: [
    { p: 17, ou: 'l’encart « CHIFFRE WAOUH »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'géante', x: 'MADAME EST UNE GÉANTE' },
    { p: 17, ou: 'l’encart « CHIFFRE WAOUH »', q: 'Quel est le premier mot du titre, écrit en gros ?', r: 'madame', x: 'MADAME EST UNE GÉANTE' }, // (25/09 : 2e question impossible à deviner)
  ],
  loup: [
    { p: 27, ou: 'l’encart « LE TRUC FOU »', q: 'Quel est le premier mot du titre, écrit en gros ?', r: 'allô', x: 'ALLÔ, LA MEUTE ?' },
  ],
  glouton: [
    { p: 43, ou: 'l’encart « BEURK ! »', q: 'Le glouton a un surnom en Amérique : l’ours-… ?', r: 'putois', x: 'L’OURS-PUTOIS' },
    { p: 43, ou: 'l’encart « BEURK ! »', q: 'Il arrose ses… d’un liquide qui pue. (un seul mot)', r: 'réserves', x: 'Il arrose ses réserves' },
  ],
  baleine: [
    { p: 61, ou: 'l’encart « CHIFFRE WAOUH »', q: 'Son cœur pèse combien de kilos ? (écris le nombre)', r: '180', x: 'Son cœur pèse 180 kg' },
    { p: 61, ou: 'l’encart « CHIFFRE WAOUH »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'jour', x: '16 TONNES PAR JOUR' },
  ],
  pieuvre: [
    { p: 21, ou: 'la pieuvre, dans l’encart « LE TRUC FOU »', q: 'Quel est le dernier mot du titre, écrit en gros ?', r: 'partout', x: 'ELLE PASSE PARTOUT !' },
    { p: 21, ou: 'la pieuvre, dans l’encart « LE TRUC FOU »', q: 'Elle peut se faufiler par un trou de la taille d’un… ?', r: 'citron', x: 'un trou de la taille d’un citron' },
  ],
  scolopendre: [
    { p: 57, ou: 'l’encart « CORPS DE CHAMPION »', q: 'Ses « crocs » sont en fait deux pattes… ?', r: 'transformées', x: 'sont deux pattes transformées' },
  ],
  mante: [
    { p: 63, ou: 'l’encart « LE TRUC FOU »', q: 'Qu’ont collé des chercheurs sur des mantes ? De toutes petites… ?', r: 'lunettes', x: 'de toutes petites lunettes 3D sur des mantes' },
    { p: 70, ou: 'la mante, dans « UNE SEULE OREILLE »', q: 'Où est cachée son oreille ? Au milieu de sa… ?', r: 'poitrine', x: 'cachée au milieu de sa poitrine' }, // (page bonus, 25/09)
  ],
};

const pageLivre = k => LIVRE_EN_MAIN[k] ? Math.min(...LIVRE_EN_MAIN[k].map(x => x.p)) : 0;


// ---------------------------------------------------------------------
//  Progrès (sur cet appareil) : animaux débloqués, étoiles, badges, cartes
// ---------------------------------------------------------------------
const CODES = { CRINIERE: 'lion', BANQUISE: 'ours' }; // codes à imprimer dans le livre
const BADGES = [
  ['premiere', 'PREMIÈRE VICTOIRE', 'Gagne ton premier combat contre l’ordi.'],
  ['combo', 'COMBO FINAL', 'Tapote A trois fois de suite sur l’adversaire.'],
  ['mur', 'MUR DE FER', 'Pare 10 coups dans un même combat.'],
  ['super', 'SUPER STAR', 'Touche ton adversaire avec ton SUPER.'],
  ['parfait', 'PARFAIT !', 'Gagne une manche sans perdre un seul point de vie.'],
  ['costaud', 'GROS COSTAUD', 'Gagne au niveau COSTAUD.'],
  ['champion', 'CHAMPION DE L’ARÈNE', 'Bats tous les animaux à la suite.'],
  ['explo', 'EXPLORATEUR', 'Gagne avec 4 animaux différents.'],
  ['secret', 'AVENTURIER', 'Gagne un animal dans L’AVENTURE : combat gagné, question réussie.'],
  ['lecteur', 'LECTEUR EXPERT', 'Gagne les 30 duels de L’AVENTURE.'],
  ['livre', 'LIVRE EN MAIN', 'Débloque un champion du livre avec le livre sous les yeux.'],
  ['duo', 'À DEUX, C’EST MIEUX', 'Termine un combat à 2 joueurs.'],
  ['cartes', 'COLLECTIONNEUR', 'Gagne 10 cartes « Le savais-tu ? ».'],
  ['toutes', 'GRAND SAVANT', 'Gagne toutes les cartes « Le savais-tu ? ».'],
];
// DÉBLOCAGE (25/09, demandé par Vincent) : 8 animaux tout de suite (les duels 1, 2, 3 et 30 du livre, au moins un par onglet),
// 31 à gagner au DÉFI (on bat l'animal, on gagne 3 cartes, on réussit 3 questions : QUIZ), 10 CHAMPIONS DU LIVRE (LIVRE_EN_MAIN),
// et les 3 légendaires (quête du GOD MODE, bonus.js).
const DE_BASE = ['lion', 'tigre', 'gorille', 'ours']; // 25/09 : 4 animaux au départ, les autres se gagnent dans L'AVENTURE (les anciens joueurs gardent tout)
const champion = k => !!LIVRE_EN_MAIN[k]; // carte dorée, vitrine, entrée et aura dorées
let SAVE = { debloques: DE_BASE.slice(), etoiles: {}, badges: {}, cartes: {}, gagneAvec: {}, quiz: {}, joue: {}, defis: {} };
try { const s = JSON.parse(localStorage.getItem('arene-duels') || 'null'); if (s && s.debloques) SAVE = Object.assign(SAVE, s) } catch (e) { }
for (const k of DE_BASE) if (!SAVE.debloques.includes(k)) SAVE.debloques.push(k);
SAVE.joue = SAVE.joue || {}; SAVE.defis = SAVE.defis || {}; // (anciennes sauvegardes)
SAVE.quiz = SAVE.quiz || {};
function sauve() { try { localStorage.setItem('arene-duels', JSON.stringify(SAVE)) } catch (e) { } }
// demande au navigateur de ne pas effacer la sauvegarde (Android / ordinateur) ; sur iPhone, l'ajout à l'écran d'accueil la protège
try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => { }) } catch (e) { }
if (matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone) addEventListener('DOMContentLoaded', () => { const e = $('garde-trophees'); if (e) e.hidden = true });
const debloque = k => SAVE.debloques.includes(k) || (k !== 'trex' && k !== 'megalo' && k !== 'meganeura' && !LIVRE_EN_MAIN[k] && G.god && G.mode === 1 && !(window.NET && NET.on)); // GOD MODE : tous les animaux (sans les garder), sauf le légendaire : il se gagne
function badge(id, liste) { if (!SAVE.badges[id]) { SAVE.badges[id] = Date.now(); liste.push(id) } }
const nbCartes = () => Object.values(SAVE.cartes).reduce((n, a) => n + a.length, 0), totalCartes = () => Object.values(FAITS).reduce((n, a) => n + a.length, 0);

// ---------------------------------------------------------------------
//  Sons (synthétisés)
// ---------------------------------------------------------------------
const SON = { ctx: null, on: true, master: null, noise: null, mus: null, next: 0, step: 0 };
// iPhone : le son Web Audio est coupé par le bouton « silencieux » et doit être débloqué par un vrai geste (toucher relâché, clic).
// On passe la session audio en mode « lecture » et on joue en boucle un son muet dans une balise audio (astuce connue),
// ce qui laisse passer la musique et les bruitages ; le bouton SON du jeu permet toujours de couper.
const SILENCE = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
function debloqueSon() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback' } catch (e) { }
  try { if (!SON.tag) { SON.tag = new Audio(SILENCE); SON.tag.loop = true; SON.tag.setAttribute('playsinline', ''); } if (SON.tag.paused) SON.tag.play().catch(() => { }) } catch (e) { }
  sonInit();
}
for (const ev of ['touchend', 'click', 'keydown']) addEventListener(ev, debloqueSon, { passive: true });
function sonInit() {
  if (SON.ctx) { if (SON.ctx.state !== 'running') SON.ctx.resume().catch?.(() => { }); chargeSons(); return }
  try {
    const A = new (window.AudioContext || window.webkitAudioContext)(); SON.ctx = A;
    SON.master = A.createGain(); SON.master.gain.value = SON.on ? .8 : 0; SON.master.connect(A.destination);
    const n = A.createBuffer(1, A.sampleRate * 1.5, A.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; SON.noise = n;
    chargeSons(); musInit();
  } catch (e) { SON.ctx = null }
}
function env(g, t, a, p, d) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d) }
function bruit(t, dur, type, f0, f1, p, q = 1, dest) { const A = SON.ctx, s = A.createBufferSource(); s.buffer = SON.noise; const f = A.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); const g = A.createGain(); env(g, t, .005, p, dur); s.connect(f).connect(g).connect(dest || SON.master); s.start(t); s.stop(t + dur + .05) }
function ton(t, type, f0, f1, dur, p, dest) { const A = SON.ctx, o = A.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = A.createGain(); env(g, t, .004, p, dur); o.connect(g).connect(dest || SON.master); o.start(t); o.stop(t + dur + .05) }
function rugit(t, base, dur, p) { const A = SON.ctx, o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * 1.45, t + dur * .35); o.frequency.linearRampToValueAtTime(base * .8, t + dur);
  const lf = A.createOscillator(); lf.frequency.value = 27; const lg = A.createGain(); lg.gain.value = .35; const g = A.createGain(); g.gain.value = .0001; const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
  lf.connect(lg).connect(g.gain); o.connect(f).connect(g).connect(SON.master); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(p, t + .06); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.start(t); lf.start(t); o.stop(t + dur + .05); lf.stop(t + dur + .05); bruit(t, dur * .8, 'lowpass', 1400, 300, p * .6) }
// sons de secours, fabriqués par le code (tant que les vrais sons ne sont pas chargés)
function sfxSynth(k, v = 1) {
  const t = SON.ctx.currentTime;
  switch (k) {
    case 'l': ton(t, 'sine', 190, 60, .12, .9 * v); bruit(t, .09, 'bandpass', 2600, 900, .7 * v, 1.2); break;
    case 'h': ton(t, 'sine', 150, 38, .32, 1.1 * v); bruit(t, .24, 'lowpass', 3200, 250, .9 * v); break;
    case 's': ton(t, 'sine', 120, 32, .5, 1.2 * v); bruit(t, .4, 'lowpass', 4200, 180, 1 * v); break;
    case 'garde': ton(t, 'square', 980, 700, .08, .22); bruit(t, .06, 'highpass', 4200, 4200, .45); break;
    case 'vent': bruit(t, .22, 'bandpass', 500, 3200, .35 * v, 2); break;
    case 'saut': ton(t, 'triangle', 280, 560, .12, .2); break;
    case 'sol': ton(t, 'sine', 90, 38, .2, .55 * v); bruit(t, .14, 'lowpass', 900, 180, .35 * v); break;
    case 'tigre': rugit(t, 88, .9, .5 * v); break;
    case 'gorille': ton(t, 'sine', 240, 420, .6, .4 * v); ton(t, 'sine', 480, 840, .6, .1 * v); rugit(t, 70, .6, .25 * v); break;
    case 'lion': rugit(t, 64, 1.1, .6 * v); rugit(t + .05, 96, .8, .25 * v); break;
    case 'ours': rugit(t, 52, .8, .5 * v); bruit(t, .5, 'lowpass', 600, 120, .4 * v); break;
    case 'tam': ton(t, 'sine', 125, 72, .14, .85 * v); bruit(t, .05, 'lowpass', 700, 300, .3 * v); break;
    case 'gong': ton(t, 'triangle', 660, 660, 1.3, .35); ton(t, 'sine', 990, 990, 1.1, .2); ton(t, 'sine', 330, 330, 1.5, .25); break;
    case 'ko': ton(t, 'sine', 170, 28, 1.2, 1.3); bruit(t, .9, 'lowpass', 2600, 90, 1.1); break;
    case 'super': ton(t, 'sawtooth', 220, 880, .5, .18); ton(t, 'square', 440, 1760, .5, .08); bruit(t, .6, 'bandpass', 800, 5000, .3, 3); break;
    case 'foule': bruit(t, 1.6, 'bandpass', 900, 1300, .35 * v, .6); bruit(t + .1, 1.4, 'bandpass', 1500, 2000, .2 * v, .8); break;
    case 'clic': ton(t, 'square', 880, 880, .05, .12); break;
    case 'valide': ton(t, 'square', 660, 660, .06, .12); ton(t + .07, 'square', 990, 990, .09, .12); break;
  }
}
// ---------------------------------------------------------------------
//  Vrais bruitages enregistrés (licences CC0 ou domaine public : voir sons/CREDITS.txt)
// ---------------------------------------------------------------------
// f : fichiers (une variante au hasard), v : volume, j : variation de hauteur (± j), r : hauteur fixe
const BANQUE = {
  l: { f: ['coup_l1', 'coup_l2', 'coup_l3', 'coup_l4', 'coup_l5'], v: .85, j: .07 },
  h: { f: ['coup_h1', 'coup_h2', 'coup_h3', 'coup_h4', 'coup_h5'], v: 1, j: .05 },
  s: { f: ['coup_s1', 'coup_s2', 'coup_s3', 'coup_s4'], v: 1, j: .04 },
  garde: { f: ['garde1', 'garde2', 'garde3'], v: .75, j: .08 },
  vent: { f: ['vent1', 'vent2', 'vent3', 'vent4'], v: .42, j: .1 },
  ventlong: { f: ['vent_long'], v: .5, j: .05 },
  saut: { f: ['vent2', 'vent4'], v: .28, r: 1.3 },
  sol: { f: ['sol1', 'sol2', 'sol3'], v: .9, j: .08 },
  pas: { f: ['pas1', 'pas2', 'pas3', 'pas4'], v: .45, j: .1 },
  chute: { f: ['chute1', 'chute2', 'chute3'], v: .95 },
  ko: { f: ['ko'], v: 1 },
  boum: { f: ['boum1', 'boum2'], v: .7, j: .06 },
  super: { f: ['aspire'], v: .75 },
  cloche: { f: ['cloche'], v: .55 },
  foule: { f: ['foule1', 'foule2'], v: .5 },
  boing: { f: ['boing'], v: .5 }, splotch: { f: ['splotch1', 'splotch2'], v: .8, j: .08 },
  clic: { f: ['clic'], v: .6 }, valide: { f: ['valide'], v: .55 }, retour: { f: ['retour'], v: .5 }, erreur: { f: ['erreur'], v: .55 },
  // bruitages de dessin animé (CC0 / domaine public, voir sons/CREDITS.txt)
  sifflet: { f: ['sifflet'], v: .55 }, sifflet_haut: { f: ['sifflet_haut'], v: .55 }, oiseaux: { f: ['oiseaux'], v: .65 },
  pop: { f: ['pop'], v: .5, j: .18 }, prout: { f: ['prout'], v: .7, j: .1 }, pouet: { f: ['pouet'], v: .55, j: .06 },
  meuh: { f: ['meuh'], v: .8 }, rire: { f: ['rire_hyene'], v: .7, j: .06 }, slurp: { f: ['slurp'], v: .8 },
  plouf: { f: ['plouf'], v: .7, j: .05 }, eclaboussure: { f: ['eclaboussure'], v: .45, j: .14 }, glace: { f: ['glace'], v: .8, j: .06 },
  ronfle: { f: ['ronfle'], v: .6 }, crac_os: { f: ['crac_os'], v: .9 }, fouet: { f: ['fouet'], v: .8, j: .05 }, gloups: { f: ['gloups'], v: .8 },
  flac: { f: ['flac'], v: .85, j: .06 }, dino: { f: ['dino'], v: 1 }, buffle: { f: ['buffle'], v: .9 }, buffle_grr: { f: ['meuh', 'buffle'], v: .7, j: .06 }, morse: { f: ['vapeur', 'ronfle'], v: .85, r: .8 }, morse_grr: { f: ['vapeur'], v: .75, r: .75, j: .06 }, trex: { f: ['dino'], v: 1 }, trex_grr: { f: ['dino'], v: .75, r: 1.2, j: .06 }, vapeur: { f: ['vapeur'], v: .7, j: .08 },
  victoire: { f: ['victoire'], v: .6 }, defaite: { f: ['defaite'], v: .5 }, badge: { f: ['badge'], v: .5 }, pret: { f: ['pret'], v: .45 },
  // annonceur
  voix_round_1: { f: ['voix_round_1'], v: .95 }, voix_round_2: { f: ['voix_round_2'], v: .95 }, voix_round_3: { f: ['voix_round_3'], v: .95 },
  voix_final_round: { f: ['voix_final_round'], v: .95 }, voix_fight: { f: ['voix_fight'], v: 1.05 }, voix_you_win: { f: ['voix_you_win'], v: .95 },
  voix_you_lose: { f: ['voix_you_lose'], v: .9 }, voix_winner: { f: ['voix_winner'], v: .95 }, voix_flawless_victory: { f: ['voix_flawless_victory'], v: .95 },
  voix_time: { f: ['voix_time'], v: .95 }, voix_tie: { f: ['voix_tie'], v: .95 }, voix_ready: { f: ['voix_ready'], v: .9 },
  // voix des animaux : cri de combat (nom de l'animal) et grognement (_grr)
  tigre: { f: ['tigre_roar'], v: .9 }, tigre_grr: { f: ['tigre_grr', 'tigre_grr2'], v: .8, j: .05 },
  lion: { f: ['lion_roar'], v: .95 }, lion_grr: { f: ['lion_grr'], v: .8, j: .05 },
  ours: { f: ['ours_roar'], v: .95 }, ours_grr: { f: ['ours_grr', 'ours_huff'], v: .85, j: .05 },
  gorille: { f: ['gorille_grr'], v: .8 }, gorille_grr: { f: ['gorille_grr'], v: .75, j: .06 },
  croco: { f: ['croco_roar'], v: .95 }, croco_grr: { f: ['croco_hiss'], v: .8, j: .05 },
  komodo: { f: ['komodo_hiss'], v: .9, r: .9 }, komodo_grr: { f: ['komodo_hiss'], v: .8, j: .06 },
  ratel: { f: ['ratel_grr'], v: .9, r: .9 }, ratel_grr: { f: ['ratel_grr'], v: .8, j: .08 },
  grizzly: { f: ['ours_huff'], v: 1, r: .95 }, grizzly_grr: { f: ['ours_grr', 'ours_huff'], v: .85, j: .06 },
  hyene: { f: ['rire_hyene'], v: .85, j: .05 }, hyene_grr: { f: ['ratel_grr', 'chat_hiss'], v: .7, r: 1.15, j: .06 },
  leopard: { f: ['leopard'], v: .95 }, leopard_grr: { f: ['leopard_grr'], v: .8, j: .05 },
  porcepic: { f: ['porcepic'], v: .8, j: .07 }, porcepic_grr: { f: ['porcepic_grr'], v: .75, j: .06 },
  guepard: { f: ['guepard'], v: .85, j: .08 }, guepard_grr: { f: ['guepard_grr', 'guepard_ronron'], v: .8, j: .05 },
  autruche: { f: ['autruche'], v: 1 }, autruche_grr: { f: ['autruche_grr'], v: .8, j: .05 }, ailes: { f: ['ailes'], v: .6, j: .08 },
  // MER : orque (vrais cris d'orques, NPS), sonar (clics + « ping »), bulles ; le requin n'a pas de voix : claquement de mâchoire
  orque: { f: ['orque'], v: .9 }, orque_grr: { f: ['orque_grr'], v: .75, j: .05 }, sonar: { f: ['sonar'], v: .7 }, bulle: { f: ['bulle'], v: .55, j: .1 },
  requin: { f: ['requin'], v: .95, j: .05 }, requin_grr: { f: ['requin', 'bulle'], v: .7, j: .08 },
  megalo: { f: ['requin', 'dino'], v: 1, r: .7, j: .04 }, megalo_grr: { f: ['requin', 'bulle'], v: .85, r: .65, j: .06 },
  // animaux du livre ajoutés le 25/09 : de vrais cris quand il en existe en domaine public (loups de Yellowstone), sinon des sons du jeu, transposés
  jaguar: { f: ['leopard'], v: .95, r: .85 }, jaguar_grr: { f: ['leopard_grr', 'tigre_grr2'], v: .8, r: .9, j: .05 },
  anaconda: { f: ['komodo_hiss'], v: .85, r: .9 }, anaconda_grr: { f: ['komodo_hiss', 'chat_hiss'], v: .7, r: .85, j: .06 },
  caiman: { f: ['croco_roar'], v: .9, r: 1.25 }, caiman_grr: { f: ['croco_hiss'], v: .75, r: 1.2, j: .06 },
  puma: { f: ['leopard'], v: .9, r: 1.1 }, puma_grr: { f: ['chat_hiss', 'leopard_grr'], v: .8, r: 1.05, j: .05 },
  loup: { f: ['loup'], v: .9 }, loup_grr: { f: ['tigre_grr2'], v: .7, r: 1.4, j: .06 }, loup_meute: { f: ['loup_meute'], v: .9 },
  mangouste: { f: ['chat_hiss'], v: .7, r: 1.5 }, mangouste_grr: { f: ['chat_hiss'], v: .6, r: 1.6, j: .08 },
  cobra: { f: ['chat_hiss', 'croco_hiss'], v: .8, r: 1.05 }, cobra_grr: { f: ['chat_hiss'], v: .8, r: .9, j: .05 },
  oursnoir: { f: ['ours_roar'], v: .9, r: 1.1 }, oursnoir_grr: { f: ['ours_grr', 'ours_huff'], v: .8, r: 1.1, j: .05 },
  glouton: { f: ['ratel_grr'], v: .9, r: .85 }, glouton_grr: { f: ['ratel_grr'], v: .8, r: .8, j: .06 },
  girafe: { f: ['vapeur'], v: .8, r: .9 }, girafe_grr: { f: ['vapeur'], v: .7, r: .8, j: .06 },
  // (M6, 25/09) ils étaient muets (ni cri au choix, ni grognement, ni cri de la vraie réponse) : sons CC0 déjà présents, transposés
  hippo: { f: ['buffle', 'ours_huff'], v: .95, r: .72 }, hippo_grr: { f: ['ours_huff'], v: .85, r: .66, j: .05 },
  crabe: { f: ['clic', 'crac_os'], v: .8, r: 1.25, j: .08 }, crabe_grr: { f: ['crac_os'], v: .7, r: 1.4, j: .08 },
  crevette: { f: ['pop'], v: .9, r: 1.1 }, crevette_grr: { f: ['pop', 'clic'], v: .75, r: 1.35, j: .08 },
  lionne: { f: ['lion_roar'], v: .85, r: 1.2 }, lionne_grr: { f: ['lion_grr'], v: .8, r: 1.2, j: .05 },
  python: { f: ['komodo_hiss'], v: .85, r: .8 }, python_grr: { f: ['komodo_hiss', 'chat_hiss'], v: .7, r: .75, j: .06 },
  alligator: { f: ['croco_roar'], v: 1, r: .9 }, alligator_grr: { f: ['croco_roar', 'croco_hiss'], v: .85, r: .85, j: .05 },
  bouledogue: { f: ['requin'], v: .9, r: .95, j: .05 }, bouledogue_grr: { f: ['requin', 'bulle'], v: .7, r: .95, j: .08 },
  frelon: { f: ['ailes'], v: 1, r: .7 }, frelon_grr: { f: ['ailes'], v: .8, r: .6, j: .08 }, meganeura: { f: ['ailes'], v: 1, r: .45 }, meganeura_grr: { f: ['ailes'], v: .9, r: .4, j: .08 }, abeille: { f: ['ailes'], v: .9, r: 1.3 }, abeille_grr: { f: ['ailes'], v: .7, r: 1.4, j: .08 },
  mygale: { f: ['chat_hiss'], v: .8, r: 1.2 }, mygale_grr: { f: ['chat_hiss'], v: .6, r: 1.3, j: .06 }, guepe: { f: ['ailes'], v: 1, r: .9 }, guepe_grr: { f: ['ailes'], v: .8, r: 1, j: .08 },
  scolopendre: { f: ['chat_hiss'], v: .8, r: 1.5 }, scolopendre_grr: { f: ['croco_hiss'], v: .6, r: 1.7, j: .06 }, chauvesouris: { f: ['sifflet_haut'], v: .5, r: 1.6 }, chauvesouris_grr: { f: ['sifflet_haut'], v: .45, r: 1.9, j: .08 },
  mante: { f: ['chat_hiss'], v: .6, r: 1.9 }, mante_grr: { f: ['chat_hiss'], v: .5, r: 2.1, j: .06 }, colibri: { f: ['sifflet_haut'], v: .5, r: 2.2 }, colibri_grr: { f: ['oiseaux'], v: .5, r: 1.5, j: .08 }, serpentbrun: { f: ['croco_hiss'], v: .7, r: 1.5 }, serpentbrun_grr: { f: ['chat_hiss'], v: .6, r: 1.3, j: .06 }, veuve: { f: ['chat_hiss'], v: .6, r: 1.7 }, veuve_grr: { f: ['chat_hiss'], v: .5, r: 1.9, j: .06 },
  baleine: { f: ['orque'], v: 1, r: .55 }, baleine_grr: { f: ['orque_grr'], v: .8, r: .5, j: .05 },
  pieuvre: { f: ['slurp', 'splotch1'], v: .8, j: .08 }, pieuvre_grr: { f: ['gloups', 'bulle'], v: .7, j: .08 },
  aiguillat: { f: ['requin'], v: .7, r: 1.35, j: .06 }, aiguillat_grr: { f: ['requin', 'bulle'], v: .6, r: 1.3, j: .08 },
  espadon: { f: ['fouet'], v: .8, j: .06 }, espadon_grr: { f: ['vent1', 'bulle'], v: .6, j: .08 },
  requinbleu: { f: ['requin'], v: .85, r: 1.1, j: .06 }, requinbleu_grr: { f: ['requin', 'bulle'], v: .7, r: 1.1, j: .08 },
};
const SONS = { buf: {}, pret: false, dernier: {} };
function chargeSons() {
  if (SONS.charge || !SON.ctx) return; SONS.charge = true;
  const A = SON.ctx, dec = ab => new Promise((r, j) => { const p = A.decodeAudioData(ab, r, j); if (p && p.then) p.then(r, j) });
  fetch('sons/manifest.json').then(r => r.json()).then(man => Promise.all(Object.entries(man).map(([k, [f]]) =>
    fetch('sons/' + f).then(r => r.arrayBuffer()).then(dec).then(b => { SONS.buf[k] = b }).catch(() => { }))))
    .then(() => { SONS.pret = true }).catch(() => { });
}
function bus() {
  if (SON.bus) return SON.bus; const A = SON.ctx;
  const c = A.createDynamicsCompressor(); c.threshold.value = -12; c.knee.value = 8; c.ratio.value = 4; c.attack.value = .002; c.release.value = .18;
  const g = A.createGain(); g.gain.value = 1; g.connect(c).connect(SON.master); SON.bus = g; return g;
}
// joue un vrai son ; renvoie false s'il n'est pas (encore) chargé
function joue(k, v = 1, o = {}) {
  const e = BANQUE[k]; if (!e) return false;
  const dispo = e.f.filter(n => SONS.buf[n]); if (!dispo.length) return false;
  let n = dispo[Math.floor(Math.random() * dispo.length)];
  if (dispo.length > 1 && n === SONS.dernier[k]) n = dispo[(dispo.indexOf(n) + 1) % dispo.length]; SONS.dernier[k] = n;
  const A = SON.ctx, s = A.createBufferSource(); s.buffer = SONS.buf[n];
  s.playbackRate.value = (o.r || e.r || 1) * (1 + (Math.random() * 2 - 1) * (e.j || 0));
  const g = A.createGain(); g.gain.value = Math.min(1.6, e.v * v); s.connect(g).connect(bus());
  s.start(A.currentTime + (o.delai || 0)); return true;
}
function sfx(k, v = 1, distant) {
  if (window.NET && NET.on && NET.role === 'hote' && !distant && k !== 'pret' && ['fight', 'intro', 'ko'].includes(G.phase)) NET.sons.push([k, v]); // (« SUPER prêt » : seulement pour soi)
  if (!SON.ctx || !SON.on) return;
  const t = SON.ctx.currentTime, reel = SONS.pret || Object.keys(SONS.buf).length > 20;
  if (!reel) { sfxSynth(k.replace('_grr', ''), v); return }
  switch (k) {
    case 'h': joue('h', v); ton(t, 'sine', 110, 42, .22, .5 * v); break;                       // coup fort : poing + « poids »
    case 's': joue('s', v); joue('h', .7 * v); ton(t, 'sine', 95, 34, .35, .6 * v); break;       // coup spécial : double impact
    case 'sol': joue('sol', v); if (v >= .9) joue('boum', .45 * v); break;
    case 'tam': joue('sol', .55 * v, { r: 1.55 }); ton(t, 'sine', 130, 80, .12, .45 * v); break;  // le gorille se tape la poitrine
    case 'gong': joue('cloche', v); joue('cloche', .8 * v, { delai: .32 }); break;             // « ding-ding » comme sur un ring
    case 'ko': joue('ko', v); joue('boum', .6); ton(t, 'sine', 150, 30, .9, .7); break;
    case 'super': joue('super', v); ton(t, 'sawtooth', 220, 880, .5, .05); break;
    case 'gorille': for (let i = 0; i < 4; i++) { joue('sol', .5 * v, { r: 1.55, delai: i * .11 }) } joue('gorille', v, { delai: .45 }); break;
    default: if (!joue(k, v)) sfxSynth(k.replace('_grr', ''), v);
  }
}
// ---------------------------------------------------------------------
//  Musique : vrais morceaux (Alexander Ehlers, licence CC0), lus en continu (jamais décodés en mémoire)
//  menus → « Warped » ; combats → « Twists » ou « Great mission » (un match sur deux)
// ---------------------------------------------------------------------
const MUS = { el: null, g: null, piste: null, sortie: false };
const PISTES = { menu: 'sons/mus_menu.mp3', combat1: 'sons/mus_combat1.mp3', combat2: 'sons/mus_combat2.mp3' };
const VOL_MUS = { menu: .30, combat1: .24, combat2: .24 };
function musInit() {
  if (MUS.el || !SON.ctx) return;
  const el = new Audio(); el.loop = true; el.preload = 'auto'; el.setAttribute('playsinline', ''); MUS.el = el;
  try { const src = SON.ctx.createMediaElementSource(el); MUS.g = SON.ctx.createGain(); MUS.g.gain.value = 0; src.connect(MUS.g).connect(SON.master) } catch (e) { MUS.g = null; el.volume = 0 }
}
function musVoulue() {
  if (!SON.on || SON.musOff || !SON.ctx) return null;
  const ph = G.phase;
  if (ph === 'fight' || ph === 'intro' || ph === 'ko' || ph === 'pause') return G.pisteCombat || 'combat1';
  if (ph === 'vs' || ph === 'loading') return null;
  return 'menu';
}
function musRampe(v, d) {
  if (MUS.g) { const t = SON.ctx.currentTime; MUS.g.gain.cancelScheduledValues(t); MUS.g.gain.setTargetAtTime(v, t, d / 3) }
  else if (MUS.el) MUS.el.volume = Math.max(0, Math.min(1, v * 2));
}
function musTick() {
  if (!MUS.el || MUS.sortie) return;
  const voulue = musVoulue();
  if (voulue !== MUS.piste) {
    if (MUS.piste) { MUS.sortie = true; musRampe(0, .4); setTimeout(() => { MUS.sortie = false; MUS.piste = null; try { MUS.el.pause() } catch (e) { } }, 450); return }
    if (voulue) { MUS.piste = voulue; MUS.el.src = PISTES[voulue]; try { MUS.el.currentTime = 0 } catch (e) { } MUS.el.play().catch(() => { MUS.piste = null }); musRampe(VOL_MUS[voulue], 1) }
    return;
  }
  if (voulue) musRampe(VOL_MUS[voulue] * (G.phase === 'pause' ? .4 : G.phase === 'ko' ? .55 : 1), .4);
}
setInterval(musTick, 150);
// annonceur (voix de Kenney, CC0) : « Round 1 », « Fight! », « You win! »…
function annonceur(k, v = 1) { sfx('voix_' + k, v) } // passe par sfx : l'autre téléphone l'entend aussi en mode 2 TÉLÉPHONES
function vibre(ms) { try { navigator.vibrate && navigator.vibrate(ms) } catch (e) { } }


// ---------------------------------------------------------------------
//  Pas de zoom involontaire (iPhone / iPad) : ni pincement, ni double-tap, ni loupe
// ---------------------------------------------------------------------
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', e => { if (e.touches.length > 1 || e.scale && e.scale !== 1) e.preventDefault() }, { passive: false });
let dernierTap = 0;
document.addEventListener('touchend', e => {
  const t = Date.now(), vite = t - dernierTap < 400; dernierTap = t;
  // en combat, deux appuis rapprochés ne doivent jamais zoomer (les boutons du jeu utilisent les « pointer events »)
  if (vite && (document.body.classList.contains('en-combat') || !e.target.closest('button, input'))) e.preventDefault();
}, { passive: false });
// ---------------------------------------------------------------------
//  Entrées : clavier, tactile (joystick + boutons), historique pour les coups spéciaux
// ---------------------------------------------------------------------
const KEYS = new Set(), TOUCH = { x: 0, y: 0, L: false, H: false, S: false, G: false }, TOUCH2 = { x: 0, y: 0, L: false, H: false, S: false, G: false };
const MAP = [
  { left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'], L: ['KeyF', 'KeyJ'], H: ['KeyG', 'KeyK'], S: ['KeyH', 'KeyL'], G: ['KeyV'] },
  { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'], L: ['Numpad1', 'Comma', 'KeyM'], H: ['Numpad2', 'Period', 'Semicolon'], S: ['Numpad3', 'Slash', 'Quote'], G: ['Numpad0', 'ShiftRight'] },
];
const SOLO_EXTRA = { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp', 'Space'], down: ['ArrowDown'], L: ['KeyJ'], H: ['KeyK'], S: ['KeyL'], G: ['ShiftLeft', 'ShiftRight'] };
function lire(n) {
  const m = MAP[n], r = {};
  for (const k in m) r[k] = m[k].some(c => KEYS.has(c)) || (G.mode === 1 && n === 0 && SOLO_EXTRA[k].some(c => KEYS.has(c)));
  const T = n === 0 ? TOUCH : TOUCH2;
  if (n === 0 || G.mode === 2) { const j = joyDir(T); for (const k of ['left', 'right', 'up', 'down']) r[k] = r[k] || j[k]; for (const k of ['L', 'H', 'S', 'G']) r[k] = r[k] || T[k]; }
  // (25/09, « mode simple ») : garder A ou B appuyé enchaîne les coups tout seul (un nouvel appui toutes les 12 images)
  // + dès que l'animal est de nouveau prêt (fin du coup, fin d'un « aïe ») : on ne reste jamais planté en tenant A (hors ligne : G.f[n] est bien le sien)
  const M = lire.maintien || (lire.maintien = [{}, {}]), f = !(typeof NET !== 'undefined' && NET.on) && G.f && G.f[n];
  for (const k of ['L', 'H']) { const s = M[n]; if (r[k]) { if (s[k] == null) s[k] = G.frame; const d = G.frame - s[k];
    if (d > 14 && d % 12 === 0) r[k] = false; else if (d > 6 && f && f.prev && f.prev[k] && G.phase === 'fight' && neutral(f) && !f.buf) r[k] = false } else s[k] = null }
  return r;
}
// joystick tactile : grandes zones gauche/droite, haut/bas seulement si on pousse franchement (évite sauts et accroupis involontaires),
// et hystérésis (une direction reste active tant qu'on ne revient pas nettement vers le centre)
function joyDir(T) {
  const x = T.x, y = T.y, p = T.st || (T.st = {}), ax = Math.abs(x), ay = Math.abs(y);
  p.right = x > (p.right ? .22 : .38); p.left = x < -(p.left ? .22 : .38);
  p.up = y < -(p.up ? .45 : .6) && ay > ax * .8;
  p.down = y > (p.down ? .38 : .52) && ay > ax * .6;
  return p;
}
addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code) && G.phase !== 'menu') e.preventDefault();
  if ((e.code === 'Escape' || e.code === 'KeyP') && ['fight', 'intro', 'pause'].includes(G.phase)) { pause(); return }
  if (!KEYS.has(e.code)) menuKey(e.code);
  KEYS.add(e.code);
});
addEventListener('keyup', e => KEYS.delete(e.code));
addEventListener('blur', () => { KEYS.clear(); for (const T of [TOUCH, TOUCH2]) { T.x = T.y = 0; T.L = T.H = T.S = T.G = false } });

// ---------------------------------------------------------------------
//  Combattant
// ---------------------------------------------------------------------
function Fighter(kind, side, cpu) {
  const d = CHARS[kind];
  return { kind, d, side, cpu, R: G.rigs[kind], x: side ? 1330 : 590, h: 0, vx: 0, vy: 0, face: side ? -1 : 1, hp: d.hp, shown: d.hp, trail: d.hp, meter: 0,
    state: 'intro', t: 0, u: 0, ph: '', mk: null, move: null, hit: 0, hitT: 0, stun: 0, hurtK: 0, combo: 0, dist: 0, wins: 0, flash: 0, blocking: false,
    st: {}, hist: [], prev: {}, lastTap: { d: 0, t: -99 }, landed: false, landT: 0, knock: false, inv: 0, tint: null, pose: null, M: null, roar: false, ai: { t: 0, hold: {}, react: 0 }, pp: null };
}
const setS = (f, s) => { f.state = s; f.t = 0; f.u = 0 };
const neutral = f => ['idle', 'walk', 'walkB', 'crouch', 'block', 'cblock'].includes(f.state);
function phaseOf(f) {
  const m = f.move, k = f.t;
  if (k < m.st) return ['st', k / m.st];
  if (m.land && !f.landed) return ['act', 0];
  const a = m.land ? f.landT : m.st + m.act;
  if (!m.land && k < a) return ['act', (k - m.st) / m.act];
  return ['rec', Math.min(1, (k - a) / m.rec)];
}
const SPECIALES = ['S', 'SF', 'SD', 'SUPER'];
// terrain (livre) : le python « ne supporte pas le froid » ; l'anaconda et le caïman, lents et maladroits sur terre, sont plus vifs dans l'eau
const ARENES_FROIDES = ['banquise', 'foret', 'nord', 'montagnes', 'plage', 'lune'], ARENES_EAU = ['riviere', 'marais', 'pantanal', 'floride', 'estuaire'];
function terrain(f) { let k = 1; if (f.d.froid && ARENES_FROIDES.includes(G.arene)) k *= .7; if (f.d.maladroit && (ARENES_EAU.includes(G.arene) || estMer())) k *= 1.3; return k }
function startMove(f, k, fort) {
  const m = f.d.moves[k]; if (!m) return false;
  f.state = 'atk'; f.t = 0; f.mk = k; f.move = m; f.mvN = (f.mvN || 0) + 1; f.hit = 0; f.hitT = 0; f.grabD = 0; f.landed = false; f.ph = 'st'; f.u = 0; f.cn = 0; f.fin = false; f.fort = !!fort; f.contre = false;
  if (m.inv) f.inv = Math.max(f.inv, m.inv); // anti-aérien : invincible au démarrage
  // buffle : la charge est plus forte si on a reculé avant (on « arme » la charge)
  f.arme = m.charge ? Math.min(1, (f.recule || 0) / 45) : 0; f.recule = 0;
  if (f.arme > .5) { addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: hasard(['CHARGE ARMÉE !', 'PLEINE PUISSANCE !']), col: JA }); sfx('buffle', .9) }
  if (k === 'SUPER') { f.meter = 0; G.freeze = 34; G.superBy = f; G.superT = 0; sfx('super'); sfx(f.kind, 1.2); vibre(60); }
  else if (k === 'S' || k === 'SF' || k === 'SD') { if (f.kind === 'gorille' && k === 'S') sfx('tam', .8); else if (!m.proj) sfx(f.kind + '_grr', .9); if (f.fort) addFx({ k: 'mot', x: f.x, y: FLOOR - 640 * f.d.K / .44, mot: 'SUPER FORT !', col: JA }) }
  else sfx('vent', k === 'H' || k === 'cH' || k === 'T' ? .9 : .6);
  return true;
}
// manipulations d'expert (dans les 16 dernières images, directions vues du combattant) :
// ↓ ↘ → (quart de cercle avant) = ★ · → ↓ ↘ = ↓★ (anti-aérien) · ↓ ↙ ← (quart de cercle arrière) = →★
function suite(f, seq) { const h = f.hist.slice(-16); let s = 0; for (const d of h) { if (d === seq[s]) { s++; if (s === seq.length) return true } } return false }
function motion236(f) { return suite(f, [2, 3, 6]) }
function manip(f) { if (suite(f, [6, 2, 3])) return 'SD'; if (suite(f, [2, 3, 6])) return 'S'; if (suite(f, [2, 1, 4])) return 'SF'; return null }
// projection : il faut être tout près, l'adversaire au sol et « attrapable »
const PAS_ATTRAPABLE = ['hurt', 'bstun', 'down', 'getup', 'ko', 'tenu', 'lance'];
function portee(f, o, plus) { return Math.abs(o.x - f.x) <= f.d.push[1] + o.d.push[1] + plus }
function attrapable(o) { return o.h <= solDe(o) + 1 && !o.cache && !PAS_ATTRAPABLE.includes(o.state) && !(o.pasPrise > 0) && o.inv <= 0 }
function numpad(inp, face) { const fx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), x = fx * face, y = inp.up ? 1 : inp.down ? -1 : 0; return 5 + x + y * 3 }

// orque : « elle doit remonter respirer » (livre, p. 7). Toutes les 20 s, elle a besoin d'air : si elle saute (ou plonge depuis la surface), « PFFOUH ! » et +30 de jauge
const AIR_T = 1200;
function respire(f, force) {
  if (!force && (f.air || 0) < AIR_T) return; f.air = 0; jauge(f, 30); sfx('vapeur', 1); if (window.statCombat) statCombat(f, 'air');
  const K = f.d.K / .44; addFx({ k: 'mot', x: f.x, y: FLOOR - f.h - 620 * K, mot: 'PFFOUH !', col: '#E8F7FF' }); addFx({ k: 'bulles', x: f.x + f.face * 60 * K, y: FLOOR - f.h - 420 * K, n: 14, w: 90 });
}
// pieuvre (livre : « vite fatiguée en nageant ») : trois efforts (sauts, élans) en moins de 3 s → fatiguée 2 s
function effort(f) { if (!f.d.fatigue || !G.f.length) return; f.efforts = (f.efforts || []).filter(t => G.frame - t < 180); f.efforts.push(G.frame);
  if (f.efforts.length >= 3) { f.efforts = []; f.fatiguee = 130; sfx('vapeur', .7); addFx({ k: 'mot', x: f.x, y: FLOOR - 620 * f.d.K / .44, mot: hasard(['PFF… FATIGUÉE !', 'OUF, UNE PAUSE !', 'TROP NAGÉ…']), col: '#FFD9CC' }) } }
function update(f, o, inp) {
  f.t++; if (f.inv > 0) f.inv--; if (f.pasPrise > 0) f.pasPrise--; if (f.fatiguee > 0) { f.fatiguee--; if (f.fatiguee % 24 === 0) addFx({ k: 'bulle', x: f.x + f.face * 120, y: FLOOR - 420 * f.d.K / .44 }) }
  if (G.phase === 'fight' && !f.terrainDit && G.pt > 30) { f.terrainDit = true; const k = terrain(f); if (k < 1) addFx({ k: 'mot', x: f.x, y: FLOOR - 640 * f.d.K / .44, mot: hasard(['BRRR… TROP FROID !', 'JE GÈLE…', 'IL FAIT FROID ICI !']), col: '#BFE9FF' }); else if (k > 1) addFx({ k: 'mot', x: f.x, y: FLOOR - 620 * f.d.K / .44, mot: hasard(['DANS L’EAU, JE SUIS CHEZ MOI !', 'VIVE L’EAU !']), col: '#7FD0F5' }) }
  if (f.d.soif && G.phase === 'fight' && f.hp > 1 && (!f.d.soif.seul || f.d.soif.seul.includes(G.arene)) && !(f.d.soif.sauf && f.d.soif.sauf.includes(G.arene)) && G.frame % (f.d.soif.t || 180) === 0) { f.hp -= 1; if (G.frame - (f.soifT || -9999) > 540) { f.soifT = G.frame; addFx({ k: 'mot', x: f.x, y: FLOOR - f.h - 640 * f.d.K / .44, mot: hasard(f.d.soif.mots), col: '#9FD8FF' }) } } // livre : « elle se dessèche vite » (scolopendre) · « il doit boire sans arrêt » (colibri)
  if (f.d.respire && G.phase === 'fight') { f.air = (f.air || 0) + 1; if (f.air === AIR_T) { sfx('bulle', .8); addFx({ k: 'mot', x: f.x, y: FLOOR - 640 * f.d.K / .44, mot: vol2d(f) ? 'DE L’AIR ! REMONTE !' : 'DE L’AIR ! SAUTE !', col: '#BFE9FF' }) } if (f.air >= AIR_T && (vol2d(f) ? f.h > altMax(f) - 50 : f.h > 150 && f.vy < 0)) respire(f) }
  if (f.roule && !(o.state === 'atk' && o.move && o.move.agrippe && o.hit)) f.roule = 0;
  const v2 = vol2d(f), onG = f.h <= solDe(f) + .5, press = k => inp[k] && !f.prev[k];
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), fwd = dir * f.face;
  const np = numpad(inp, f.face); f.hist.push(np); if (f.hist.length > 30) f.hist.shift();
  // étourdissement : la jauge redescend quand on ne prend plus de coups
  if (f.etourdi > 0 && G.frame - (f.dernierCoup || 0) > 70) f.etourdi = Math.max(0, f.etourdi - .3);
  // reculer « arme » la charge du buffle (souvenir gardé 12 images après avoir lâché)
  if (fwd < 0 && onG) { f.recule = Math.min(90, (f.recule || 0) + 1); f.reculeT = 12 } else if (f.reculeT > 0) f.reculeT--; else f.recule = 0;
  // tape deux fois devant = élan
  if (fwd !== 0 && !(f.prev.right || f.prev.left)) { if (f.lastTap.d === fwd && G.frame - f.lastTap.t < 12 && neutral(f) && onG && !(f.fatiguee > 0)) { effort(f); setS(f, 'dash'); sfx('pas', .9); sfx('vent', .35); f.vx = fwd * f.face * f.d.dash * terrain(f) * (fwd > 0 ? 1 : .8); f.dashDir = fwd; } f.lastTap = { d: fwd, t: G.frame } }
  if (onG && (neutral(f) || f.state === 'land') && Math.abs(o.x - f.x) > 6) { const vise = o.x > f.x ? 1 : -1; // la mygale « voit très mal » (livre) : elle met du temps à se retourner
    if (f.d.myope && vise !== f.face) { f.retourne = (f.retourne || 0) + 1; if (f.retourne === 1 && Math.random() < .5) addFx({ k: 'mot', x: f.x, y: FLOOR - 560 * f.d.K / .44, mot: hasard(['OÙ ES-TU ?', 'JE NE VOIS RIEN !', 'HEIN ?']), col: '#E8D8B8' }); if (f.retourne >= f.d.myope) { f.face = vise; f.retourne = 0 } }
    else { f.face = vise; f.retourne = 0 } }
  const fight = G.phase === 'fight';
  const enHaut = v2 && (f.alt || 0) > 0; // en vol / à la nage, au-dessus du fond : ↓ fait descendre (ce n'est plus la garde)
  f.blocking = false; f.guardBtn = !!(inp.G || (inp.down && !enHaut));
  // annulation d'un coup en combo (sur touche)
  let wantAtk = press('S') ? 'S' : press('H') ? 'H' : press('L') ? 'L' : null;
  // tampon : un appui fait un peu trop tôt (pendant la fin d'un coup) est gardé 9 images (avec la direction tenue)
  if (wantAtk) f.buf = { k: wantAtk, t: G.frame, down: !!inp.down, fwd: fwd > 0 };
  const libre = neutral(f) || f.state === 'dash' || (f.state === 'atk' && f.hit);
  let avant = fwd > 0;
  if (!wantAtk && libre && f.buf && G.frame - f.buf.t <= 9) { wantAtk = f.buf.k; if (f.buf.down) inp.down = true; if (f.buf.fwd) avant = true }
  if (wantAtk && libre) f.buf = null;
  const bufS = wantAtk === 'S' && !press('S');
  // ★ seul = coup spécial · → ★ = spécial vers l'avant · ↓ ★ = spécial anti-aérien · jauge pleine = SUPER
  // manipulations d'expert + A ou B = version « SUPER FORT » du coup spécial
  const special = () => {
    if (press('S') || bufS) {
      if (f.meter >= 100 && f.d.moves.SUPER) return { k: 'SUPER' };
      let k = inp.down ? 'SD' : avant ? 'SF' : 'S'; if (!f.d.moves[k]) k = 'S'; return { k };
    }
    if (press('L') || press('H')) { const k = manip(f); if (k && f.d.moves[k]) return { k, fort: true } }
    return null;
  };
  switch (f.state) {
    case 'intro': case 'win': case 'lose': f.vx *= .8; break;
    case 'idle': case 'walk': case 'walkB': case 'crouch': case 'block': case 'cblock': {
      if (!fight) { f.vx = 0; if (f.state !== 'idle') setS(f, 'idle'); break }
      // 2D : ↑ monte, ↓ descend (on garde la main sur les coups)
      if (v2) { const vz = inp.up ? 1 : inp.down && enHaut ? -1 : 0; if (vz) f.alt = cl((f.alt || 0) + vz * vitV(f), 0, altMax(f)) }
      const sp = special(); if (sp) { startMove(f, sp.k, sp.fort); break }
      if (wantAtk) {
        // projection : tout près, en poussant vers l'adversaire + B (elle passe la garde)
        if (wantAtk === 'H' && avant && !inp.down && onG && f.d.moves.T && portee(f, o, 70) && attrapable(o) && procheV(f, o)) { startMove(f, 'T'); break }
        let k = wantAtk; if (inp.down && !enHaut) k = k === 'L' ? 'cL' : k === 'H' && f.d.moves.cH ? 'cH' : k;
        startMove(f, k); break
      }
      // se protéger : vers le BAS = garde accroupie qui pare tout (idée de Vincent : pas besoin de bouton).
      // Reculer protège aussi (comme dans les jeux de combat classiques). Touche V au clavier : garde debout.
      if ((inp.down && !enHaut) || inp.G) { f.vx = 0; const s = inp.down ? 'cblock' : 'block'; if (f.state !== s) setS(f, s); f.blocking = true; f.guardBtn = true; break }
      if (inp.up && !v2 && !(f.fatiguee > 0)) { setS(f, 'prejump'); f.jdir = dir; break }
      const backH = fwd < 0;
      // reculer face à une attaque qui arrive = se mettre en garde (on le voit à l'écran)
      const menace = o.state === 'atk' && o.ph !== 'rec' && Math.abs(o.x - f.x) < 900;
      if (inp.down) { f.vx = 0; const s = backH ? 'cblock' : 'crouch'; if (f.state !== s) setS(f, s); f.blocking = backH; }
      else if (backH && menace) { f.vx = 0; if (f.state !== 'block') setS(f, 'block'); f.blocking = true; }
      else if (backH) { f.vx = dir * f.d.back * terrain(f) * (f.poison && f.poison.lent || 1); if (f.state !== 'walkB') setS(f, 'walkB'); f.blocking = true; }
      else if (dir) { f.vx = dir * f.d.walk * terrain(f) * (f.poison && f.poison.lent || 1) * (f.fatiguee > 0 ? .5 : 1); if (f.state !== 'walk') setS(f, 'walk'); }
      else { f.vx = 0; if (f.state !== 'idle') setS(f, 'idle'); }
      f.dist += Math.abs(f.vx) * (f.state === 'walkB' ? -1 : 1);
      break;
    }
    case 'dash': f.dist += Math.abs(f.vx); f.vx *= .9; if (f.t > 16) setS(f, 'idle'); { const sp = special(); if (sp) startMove(f, sp.k, sp.fort); else if (wantAtk) startMove(f, wantAtk === 'H' && inp.down && f.d.moves.cH ? 'cH' : wantAtk); } break;
    case 'prejump': if (f.t >= 3) { f.vy = -f.d.jumpV; f.h = .1; f.battu = false; f.vx = f.jdir * f.d.jumpX; setS(f, 'air'); f.airAtk = false; f.sautN = (f.sautN || 0) + 1; sfx('saut'); effort(f) } break;
    case 'air': if (wantAtk && !f.airAtk && wantAtk !== 'S') { f.airAtk = true; startMove(f, 'A'); }
      // les petites bêtes qui volent (frelon, abeilles, guêpe, chauve-souris, colibri, méganeura) : un 2e battement d'ailes en plein saut
      else if (f.d.vole && inp.up && !f.prev.up && !f.battu && f.vy > -f.d.jumpV * .5) { f.battu = true; f.vy = -f.d.jumpV * .8; f.vx = (inp.right ? 1 : inp.left ? -1 : f.vx > 0 ? .5 : f.vx < 0 ? -.5 : 0) * f.d.jumpX; sfx('ailes', .7); addFx({ k: 'poussiere', x: f.x, y: FLOOR - f.h + 40 }) }
      break;
    case 'land': if (f.t >= 5) setS(f, 'idle'); break;
    // projection : celui qui attrape (« lance ») et celui qui est attrapé (« tenu »)
    case 'lance': {
      const d = f.cible, m = f.prise; f.vx = 0;
      if (!d || d.state !== 'tenu') { setS(f, 'idle'); break }
      d.x = f.x + f.face * (f.d.push[1] + d.d.push[1] - 40); d.h = (v2 ? f.h : 0) + Math.min(m.ascenseur ? 380 : 60, f.t * 6); // (veuve noire : l'ascenseur monte la proie dans la toile)
      if (m.serre && f.t === 1 && window.statCombat) statCombat(f, 'serre'); // trophée « GROS CÂLIN » : 3 fois dans un combat
      if (m.serre && f.t % 10 === 5) { sfx('vent', .5); G.shake = Math.max(G.shake, 4); addFx({ k: 'mot', x: d.x + (Math.random() - .5) * 140, y: FLOOR - 460 + (Math.random() - .5) * 80, mot: hasard(['SERRE !', 'CRRR…', 'ENCORE UN TOUR !']), col: '#F2EDA0' }) }
      if (m.avale) { d.cache = f.t > 10 && f.t < m.prise.t - 4; if (f.t === 10) { if (window.trophee) trophee('avale', f); sfx('gloups', 1); addFx({ k: 'mot', x: f.x, y: FLOOR - 620, mot: 'GLOUPS !', col: JA }) } if (f.t % 12 === 6 && f.t > 10) addFx({ k: 'mot', x: f.x + (Math.random() - .5) * 200, y: FLOOR - 380, mot: hasard(['MIAM…', 'GLOUB…', 'BLOUP…']), col: '#F2EDA0' }); if (f.t === m.prise.t - 4) { sfx('prout', .7); addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: 'PTOU ! TROP GROS !', col: '#FF7AB6' }) } }
      if (m.ascenseur && f.t === 12 && window.trophee) trophee('ascenseur', f);
      if (m.clac && f.t % 12 === 6) { sfx('l', .6); addFx({ k: 'mot', x: d.x + (Math.random() - .5) * 160, y: FLOOR - 460 + (Math.random() - .5) * 80, mot: hasard(['CLAC !', 'ELLE NE LÂCHE PLUS !', 'CLAC-CLAC !']), col: '#D8F0A0' }) } // mante : elle ne lâche plus
      if (m.festin && f.t % 12 === 6) { sfx('l', .6); addFx({ k: 'mot', x: d.x + (Math.random() - .5) * 160, y: FLOOR - 420 + (Math.random() - .5) * 80, mot: hasard(['CROC !', 'CROC-CROC !', 'MIAM, UN FESTIN !']), col: '#F2C04A' }) } // scolopendre : le festin
      if (m.slurp && f.t % 12 === 6) { sfx('slurp', .8); addFx({ k: 'mot', x: d.x + (Math.random() - .5) * 160, y: FLOOR - 420 + (Math.random() - .5) * 80, mot: hasard(['SLUUURP !', 'SLURP !', 'COMME AVEC UNE PAILLE !']), col: '#E8D8B8' }) } // mygale : la soupe de proie (livre p. 30)
      if (m.os && f.t % 9 === 4) { sfx('crac_os', .9); G.shake = Math.max(G.shake, 5); addFx({ k: 'mot', x: d.x + (Math.random() - .5) * 160, y: FLOOR - 470 + (Math.random() - .5) * 80, mot: hasard(['CRAC !', 'CRONCH !', 'CROC !']), col: '#FFF1C9' }) } // croque-os : ça croque !
      if (f.t >= (m.prise.t || 22)) { lache(f, d, m); }
      break;
    }
    case 'tenu': {
      f.vx = 0; const a = f.tenuPar;
      if (!a || a.state !== 'lance') { setS(f, 'idle'); if (!vol2d(f)) f.h = 0; f.cache = false; break }
      // se dégager d'une projection normale : appuyer sur A ou B tout de suite
      if (f.t <= 8 && a.prise.prise.degage !== false && (press('L') || press('H'))) degage(a, f);
      // girafe : « le rodéo » (livre p. 52 : elle se secoue et se débarrasse des lionnes) — même accrochée sur le dos, ★ (30 de jauge) la libère
      else if (f.d.rodeo && f.t >= 4 && f.meter >= 30 && !f.cache && a.mkPrise !== 'SUPER' && press('S')) { f.meter -= 30; f.h = 0; setS(a, 'hurt'); a.prise = null; a.cible = null; startMove(f, 'SF'); f.hit = 1; f.hitT = f.t; const hb = hurtBox(a); touche(f, a, f.d.moves.SF, hb, hb, { dir: f.face, prise: true, last: true, spe: true }); G.shake = Math.max(G.shake, 14); if (window.trophee) trophee('rodeo', f) }
      break;
    }
    case 'fuite': f.vx = -f.face * 9.5; f.dist -= 9.5; if (f.t % 10 === 0) addFx({ k: 'poussiere', x: f.x, y: FLOOR }); if (--f.stun <= 0) setS(f, 'idle'); break;
    case 'dizzy': f.vx *= .8; if (press('L') || press('H') || press('S') || (dir && !(f.prev.left || f.prev.right))) f.stun -= 6; if (--f.stun <= 0) { setS(f, 'idle'); f.etourdi = 0 } break;
    case 'atk': {
      const m = f.move, [ph, u] = phaseOf(f); f.ph = ph; f.u = u;
      if (v2 && (ph === 'st' || ph === 'act') && !f.cache && !f.ciel && !m.saute && !m.ciel && !m.plonge && !m.contourne && !m.prise && o.h <= altMax(f) + 60) f.alt = cl((f.alt || 0) + cl(o.h - (f.alt || 0), -9, 9), 0, altMax(f)); // 2D : on vise sa hauteur
      // combos : annule la récupération d'un coup qui a touché (les coups spéciaux s'enchaînent là où ★ est permis)
      if (f.hit && m.chain && (ph === 'rec' || ph === 'act') && f.t - f.hitT < 16) {
        let nk = null, fortNk = false; const sp = special();
        if (sp && (m.chain.includes(sp.k) || (sp.k !== 'SUPER' && m.chain.includes('S')))) { nk = sp.k; fortNk = sp.fort }
        else if (wantAtk) { const c = inp.down && wantAtk === 'L' ? 'cL' : inp.down && wantAtk === 'H' && m.chain.includes('cH') ? 'cH' : wantAtk; if (m.chain.includes(c)) nk = c; }
        // combo automatique : 3e appui sur A dans un enchaînement = coup final (coup fort qui fait tomber)
        let fin = false; if (nk === 'L' && f.mk === 'L' && f.cn >= 1 && m.chain.includes('H')) { nk = 'H'; fin = true }
        if (nk) { const cn = (f.cn || 0) + 1; startMove(f, nk, fortNk); f.cn = cn; f.fin = fin; if (fin) f.move = Object.assign({}, f.move, { st: Math.min(f.move.st, 8), armor: false }); break }
      }
      // projections et prises : on attrape si l'adversaire est à portée pendant le coup
      if (m.prise && ph === 'act' && !f.hit) {
        if (portee(f, o, m.prise.portee || 70) && ((attrapable(o) && procheV(f, o)) || (m.prise.air && o.h > 0 && o.h < 320 && attrapable(Object.assign({}, o, { h: 0, knock: true }))))) { // (mante : « les pattes-pièges se referment » : elle attrape aussi en plein vol)
          if (o.state === 'atk' && o.mk === 'T' && o.ph !== 'rec' && f.mk === 'T') { degage(f, o); break } // deux projections en même temps
          attrape(f, o, m); break
        }
      }
      // morse : les défenses tirent l'adversaire vers lui
      if (m.tire && ph === 'act' && o.h <= 60 && !['down', 'getup', 'ko', 'tenu'].includes(o.state) && Math.abs(o.x - f.x) < m.tire.portee) { o.x -= Math.sign(o.x - f.x) * m.tire.v; if (f.t % 6 === 0) addFx({ k: 'vague', x: o.x, y: FLOOR }) }
      if (f.mk === 'S' && f.kind === 'tigre' && ph === 'st') f.vx = -f.face * 3.4 * (1 - f.t / m.st); // il recule, ramassé, comme un chat
      if (f.mk === 'S' && f.kind === 'tigre' && f.t === m.st) { f.vx = f.face * 22.5; f.vy = -13; f.h = .1; sfx('vent'); }
      if (f.mk === 'S' && f.kind === 'gorille') { if (ph === 'st') { f.vx = 0; if (f.t % 5 === 0) sfx('tam', .7) } else if (ph === 'act') { f.vx = f.face * 15.5; f.dist += 15.5; if (f.t % 9 === 0) { sfx('sol', .5); G.shake = Math.max(G.shake, 5) } } else f.vx *= .8; }
      if (f.mk === 'SUPER' && f.kind === 'gorille' && ph === 'st' && f.t % 5 === 0) sfx('tam', .9);
      if (f.mk === 'SUPER' && ph === 'act') { f.vx = f.kind === 'tigre' ? f.face * 7 : 0; if (f.kind === 'gorille' && f.t % 12 === 6) { sfx('sol', 1); G.shake = 14; addFx({ k: 'onde', x: f.x + f.face * 150, y: FLOOR, dir: f.face }) } }
      if (f.mk === 'H' && f.kind === 'tigre') f.vx = ph === 'act' ? f.face * 5 : f.vx * .7;
      { // mécaniques des coups spéciaux (tous les animaux)
        if (m.rush) { if (ph === 'act') {
            if (m.agrippe && f.hit && f.grabD) { f.vx = 0; o.x = f.x + f.face * f.grabD; o.vx = 0; o.roule = (o.roule || 0) + .34; if (f.t % 7 === 0) { sfx('vent', .5); sfx('plouf', .25); G.shake = Math.max(G.shake, 6); addFx({ k: 'eclabousse', x: o.x, y: FLOOR }) } } // la roulade de la mort : il tient et l'autre tourne
            else if (m.stopHit && f.hit) f.vx *= .7; // s'arrête sur l'adversaire
            else { const v = m.rush * (1 + .45 * (f.arme || 0)); f.vx = f.face * v; f.dist += v; if (f.t % 9 === 0) { sfx(m.hits > 4 ? 'pas' : 'sol', .45); G.shake = Math.max(G.shake, 4) } if ((m.hits > 4 || f.arme > .5) && f.t % 6 === 0) addFx({ k: 'poussiere', x: f.x, y: FLOOR }) } }
          else if (ph === 'st') f.vx = 0; else f.vx *= .8; }
        // crocodile : il plonge sous le sol et ressort sous l'adversaire
        if (m.plonge) {
          const mer = estMer();
          if (ph === 'st') { f.cache = true; f.inv = 3; if (f.t === 1) { sfx('plouf', .8); if (mer) { addFx({ k: 'bulles', x: f.x, y: FLOOR - 160, n: 12, w: 300 }); addFx({ k: 'mot', x: f.x, y: FLOOR - 420, mot: hasard(['DANS LES PROFONDEURS…', 'IL DISPARAÎT…', 'OÙ EST-IL ?']), col: '#BFE9FF' }) } else { addFx({ k: 'eclabousse', x: f.x, y: FLOOR }); if (G.arene !== 'riviere') addFx({ k: 'mot', x: f.x, y: FLOOR - 300, mot: hasard(['PLOUF !', 'FLAQUE PORTABLE !']), col: '#7FD0F5' }) } }
            const trk = m.surgit ? 5 : 14, vmax = m.surgit ? 32 : 17; f.vx = f.t < m.st - trk ? Math.sign(o.x - f.x) * Math.min(vmax, Math.abs(o.x - f.x) * (m.surgit ? .3 : .2)) : 0; /* le requin file sous l'adversaire */ if (f.t % 5 === 0) addFx(mer ? { k: 'bulles', x: f.x, y: FLOOR - 20, n: 2, w: 80 } : { k: 'vague', x: f.x, y: FLOOR }) }
          if (f.t === m.st) { f.cache = false; f.face = o.x >= f.x ? 1 : -1; f.vy = -(m.surgit || 27); f.h = .1; f.vx = 0; sfx(f.kind === 'croco' ? 'croco' : f.kind, 1.1); sfx('plouf', 1); G.shake = 14; if (mer) { addFx({ k: 'bulles', x: f.x, y: FLOOR - 40, n: 16, w: 320 }); addFx({ k: 'poussiere', x: f.x, y: FLOOR, sansBulles: true }) } else { addFx({ k: 'eclabousse', x: f.x, y: FLOOR }); addFx({ k: 'eclabousse', x: f.x + 60, y: FLOOR }) } }
        }
        // requin bleu (livre : « il tourne autour de sa proie ») : il s'éloigne en tournant (on ne voit que son aileron), puis surgit DERRIÈRE l'adversaire
        if (m.contourne) {
          const herbe = m.contourne === 'herbe';
          if (ph === 'st') { f.cache = true; f.inv = 3; f.vx = 0; if (f.t === 1) { if (herbe) { sfx('vent', .5); addFx({ k: 'poussiere', x: f.x, y: FLOOR }); addFx({ k: 'mot', x: f.x, y: FLOOR - 480, mot: hasard(['IL RAMPE DANS L’HERBE…', 'CHUT…', 'OÙ EST-IL PASSÉ ?']), col: '#E8D5AE' }) } else { sfx('plouf', .6); addFx({ k: 'bulles', x: f.x, y: FLOOR - 200, n: 12, w: 260 }); addFx({ k: 'mot', x: f.x, y: FLOOR - 480, mot: hasard(['JE TOURNE…', 'JE TOURNE, JE TOURNE…', 'OÙ SUIS-JE ?']), col: '#BFE9FF' }) } } if (herbe && f.t % 6 === 0) addFx({ k: 'poussiere', x: o.x + Math.cos(f.t * .2) * 330, y: FLOOR }) }
          if (f.t === m.st) { f.cache = false; const cote = -(o.face || 1), dx = o.d.push[1] + f.d.push[1] + 30; f.x = Math.max(STAGE_L, Math.min(STAGE_R, o.x + cote * dx)); if (Math.abs(f.x - o.x) < dx * .6) f.x = Math.max(STAGE_L, Math.min(STAGE_R, o.x - cote * dx)); f.face = o.x >= f.x ? 1 : -1; f.h = vol2d(f) ? (f.alt = cl(o.h, 0, altMax(f))) : 0; f.vy = 0; sfx(f.kind, 1); G.shake = 8; if (herbe) addFx({ k: 'poussiere', x: f.x, y: FLOOR }); else { sfx('plouf', .8); addFx({ k: 'bulles', x: f.x, y: FLOOR - 200, n: 14, w: 260 }) }
            // jaguar (livre) : « repéré, il rate son coup » — si l'autre se protège ou attaque déjà, l'attaque par-derrière rate
            if (m.repere && (o.blocking || o.guardBtn || (o.state === 'atk' && o.ph !== 'rec'))) { f.hit = 99; f.t = m.st + m.act; f.move = Object.assign({}, m, { rec: m.rec + 16 }); sfx('pouet', .7); addFx({ k: 'mot', x: f.x, y: FLOOR - 600, mot: hasard(['REPÉRÉ ! RATÉ…', 'OUPS, REPÉRÉ !', 'IL M’A VU !']), col: CY }) } }
        }
        // léopard : il bondit hors de l'écran (dans « son arbre »), suit l'adversaire, puis lui tombe dessus (son ombre le trahit)
        if (m.ciel) {
          if (f.t === 1) { f.vy = -38; f.h = Math.max(f.h, .1); f.vx = 0; sfx('vent', 1); if (m.plongeon) { sfx('plouf', .5); addFx({ k: 'bulles', x: f.x, y: FLOOR - 200, n: 14, w: 260 }) } addFx({ k: 'mot', x: f.x, y: FLOOR - 640, mot: hasard(m.motsMonte || ['HOP, DANS L’ARBRE !', 'À TOUT DE SUITE…', 'JE REVIENS !']), col: m.plongeon ? '#BFE9FF' : JA }) }
          if (ph === 'st' && f.t > 10) { f.cache = true; f.ciel = true; f.inv = 3; f.h = m.plafond ? f.h + (440 - f.h) * .25 : 1500; f.vy = 0; f.vx = Math.sign(o.x - f.x) * Math.min(19, Math.abs(o.x - f.x) * .2); if (m.plafond && f.t % 16 === 0) sfx('vent', .25) } // scolopendre (livre) : « elle chasse la tête en bas » : pendue au plafond
          if (f.t === m.st) { f.cache = false; f.ciel = false; f.face = o.x >= f.x ? 1 : -1; f.h = m.plafond ? f.h : 1050; f.vy = m.plafond ? 18 : 12; f.vx = 0; if (vol2d(f)) f.alt = cl(o.h, 0, altMax(f)); /* 2D : il retombe sur l'adversaire, à sa hauteur */ sfx(f.kind, 1); addFx({ k: 'mot', x: f.x, y: FLOOR - 760, mot: hasard(m.motsTombe || ['TOMBÉ DU CIEL !', 'SURPRISE D’EN HAUT !']), col: JA }); if (f.d.respire) respire(f, true) }
        }
        // autruche : couchée, le cou à plat sur le sol… « un tas de terre ! », puis elle surgit
        if (m.aplat && f.t === 2) { addFx({ k: 'mot', x: f.x, y: FLOOR - 380, mot: hasard(m.aplat === 'branche' ? ['UNE BRANCHE ?', 'CHUT…', 'IMMOBILE…'] : ['UN TAS DE TERRE ?', 'CACHÉE !', 'CHUT…']), col: '#E8D5AE' }); addFx({ k: 'poussiere', x: f.x, y: FLOOR }) }
        if (m.aplat && f.t === m.st) { sfx('ailes', .9); addFx({ k: 'poussiere', x: f.x + f.face * 120, y: FLOOR }) }
        // porc-épic : le hochet (sa queue fait « tchik-tchik »)
        if (m.hochet && ph === 'act' && !f.contre && f.t % 8 === 0) { sfx('porcepic', .45); if (f.t % 16 === 0) addFx({ k: 'mot', x: f.x - f.face * 140, y: FLOOR - 330, mot: 'TCHIK-TCHIK !', col: '#FFF5E0' }) }
        // guépard : la traînée de vitesse
        if (m.vitesse) { f.trace = f.trace || []; if (ph === 'act' && !f.hit) { f.trace.unshift([f.x, f.h]); if (f.trace.length > 10) f.trace.length = 10; if (f.t % 4 === 0) addFx({ k: 'poussiere', x: f.x - f.face * 160, y: FLOOR }) } else f.trace.length = 0 }
        // léopard : l'ombre de la nuit (la nuit tombe sur l'arène)
        if (m.ombre && f.t === 1) { sfx('vent', .8); addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: 'LA NUIT TOMBE…', col: '#B9C4FF' }) }
        // hippopotame : le ventilateur à crottes
        // ★ : dos tourné, la queue-hélice mitraille (les crottes partent de la queue) · SUPER : le déluge
        if (m.jet && ph === 'act' && f.t % m.jet.every === 0) { const j = m.jet, K = f.d.K, rd = (a, b) => a + Math.random() * (b - a);
          const jm = m.jetM || (m.jetM = Object.assign({}, JET, { dmg: j.dmg || JET.dmg, super: m === f.d.moves.SUPER, mots: j.rafale ? ['PLOC !', 'SPLOTCH !', 'PROUT !', 'RATATATA !'] : JET.mots }));
          const x0 = m.dos ? 650 : 330, y0 = m.dos ? 540 + rd(-25, 25) : 320;
          G.proj.push({ a: f, m: jm, blob: true, x: f.x + f.face * x0 * K, yy: FLOOR - y0 * K, vx: f.face * rd(...j.spd), vy: rd(...j.vy), grav: j.grav, w: j.r, t: 0, life: 120, dir: f.face });
          if (j.rafale) { sfx('pop', .55); if (f.t % 12 === 0) sfx('prout', .7) } else if (f.t % 10 === 0) sfx('vent', .4) }
        if (m.dos && ph === 'act' && f.t % 8 === 0) addFx({ k: 'helice', x: f.x + f.face * 670 * f.d.K, y: FLOOR - 540 * f.d.K, dir: f.face }); // la queue qui tourne
        // ratel : la bombe puante (un nuage qui reste)
        if (m.nuage && f.t === m.st) { const n = m.nuage; G.zones.push({ a: f, x: f.x + f.face * n.x0 * f.d.K, r: n.r, t: 0, life: n.life, tick: n.tick, stun: n.stun, fait: false, genre: n.genre }); if (n.genre === 'encre') { sfx('plouf', .8); sfx('vent', .5); addFx({ k: 'bulles', x: f.x + f.face * 200, y: FLOOR - 260, n: 14, w: 240 }); addFx({ k: 'mot', x: f.x + f.face * 300, y: FLOOR - 460, mot: 'PSCHHH ! L’ENCRE !', col: '#C9B8FF' }) } else { sfx('chat_hiss', 1); sfx('vent', .6); addFx({ k: 'mot', x: f.x + f.face * 300, y: FLOOR - 420, mot: 'PSCHIIT !', col: '#9BE15D' }) } }
        if (m.secoue && ph === 'act' && f.t % 3 === 0) { addFx({ k: 'eclabousse', x: f.x + (Math.random() - .5) * 200, y: FLOOR - 260, s: .55, boue: G.arene !== 'riviere' && G.arene !== 'banquise' }); if (f.t % 9 === 0) sfx('eclaboussure', .4) }
        if (m.aspire && f.t === m.st) { sfx('slurp', 1); sfx('super', .5) }
        if (m.aspire && ph === 'act' && f.t % 4 === 0) addFx({ k: 'aspire', x: o.x, y: FLOOR - 320, x2: f.x + f.face * 300 * f.d.K / .46, y2: FLOOR - 330 })
        if (m.mur && ph === 'act' && f.t % 10 === 0 && !f.contre) addFx({ k: 'mot', x: f.x + f.face * 180, y: FLOOR - 470, mot: 'LE MUR !', col: '#FFE3D3' })
        if (m.tornade && ph === 'act') { if (f.t % 6 === 0) f.face = -f.face; if (f.t % 4 === 0) addFx({ k: 'bulles', x: f.x + (Math.random() - .5) * 400, y: FLOOR - 100 - Math.random() * 400, n: 3, w: 90 }); f.vx = Math.sign(o.x - f.x) * Math.min(6, Math.abs(o.x - f.x) * .05) }
        if (m.clan && f.t === m.st) { const qui = m.clan === true ? 'hyene' : m.clan; chargeClan(qui); if (window.trophee) trophee('clan', f); addFx({ k: 'clan', x: f.x, dir: f.face, qui }); if (qui === 'aiguillat') { sfx('plouf', .8); sfx('vent', .6); addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: 'PAR MILLIERS !', col: '#EEF2F6' }) } const CT = CLAN_TXT[qui]; if (qui === 'orque') { sfx('orque', 1); sfx('plouf', .6); addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: 'TOUTE LA BANDE ARRIVE !', col: '#BFE9FF' }) } else if (CT) { sfx(CT[2] || qui, 1); sfx('foule', .4); addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: CT[0], col: CT[1] }) } else if (qui !== 'aiguillat') { sfx('rire', 1); sfx('foule', .5); addFx({ k: 'mot', x: f.x, y: FLOOR - 520, mot: 'LE CLAN ARRIVE !', col: '#F2D49B' }) } }
        if (m.clan && ph === 'act' && f.t % 11 === 0) { if (CLAN_TXT[m.clan]) { sfx(f.t % 22 ? 'pas' : m.clan, .45); G.shake = Math.max(G.shake, 5) } else if (m.clan === 'orque' || m.clan === 'aiguillat') { sfx(f.t % 22 ? 'bulle' : m.clan === 'orque' ? 'orque' : 'plouf', .4); G.shake = Math.max(G.shake, 4) } else { sfx('rire', .45); sfx('pas', .5) } G.shake = Math.max(G.shake, 5) }
        if (m.lunge && ph === 'act' && !(m.recule && f.hit)) f.vx = f.face * m.lunge;
        if (m.marcheArriere && f.t === m.st + 1 && o.state === 'atk' && o.ph !== 'rec' && Math.abs(o.x - f.x) < 800 && window.trophee) trophee('marchearriere', f);
        if (m.marcheArriere && ph === 'act') { f.vx = -f.face * m.marcheArriere * (1 - .5 * (f.t - m.st) / m.act); f.inv = Math.max(f.inv, 2); if (f.t % 3 === 0) addFx({ k: 'poussiere', x: f.x + f.face * 80, y: FLOOR - f.h, sansBulles: true }) } // colibri (livre) : « il vole même en arrière »
        if (m.grandir && f.t === 1 && f.d.grandit) grandit(f, 1);
        // ours noir : la fausse charge s'arrête net (« BOUH ! ») · la pause goûter (il reprend des forces, si on le laisse manger)
        if (m.faux && ph === 'act' && f.t === m.st + m.faux) { f.vx = 0; f.t = m.st + m.act; addFx({ k: 'mot', x: f.x + f.face * 200, y: FLOOR - 620, mot: hasard(['BOUH !', 'HA HA, FAUSSE CHARGE !']), col: JA }); sfx('ours_huff', .8) }
        if (m.gouter && ph === 'act') { if (f.t === m.st + 1) { f.gouter = 0; addFx({ k: 'mot', x: f.x, y: FLOOR - 620 * f.d.K / .44, mot: hasard(['MIAM, DES BAIES !', 'UNE PETITE PAUSE…', 'D’ABORD LE GOÛTER !']), col: '#FF7AB6' }) } f.vx = 0;
          if (f.t % 9 === 0 && f.gouter < m.gouter) { f.gouter++; if (f.gouter === m.gouter && window.statCombat) statCombat(f, 'gouter'); f.hp = Math.min(f.d.hp, f.hp + 1); sfx('slurp', .35); if (f.t % 27 === 0) addFx({ k: 'mot', x: f.x + (Math.random() - .5) * 200, y: FLOOR - 520 * f.d.K / .44, mot: hasard(['MIAM !', 'CROUNCH !', '+1']), col: '#7BD35A' }) } }
        // glouton, alligator : il gronde d'abord · loup : le hurlement
        if (m.gronde && f.t === 2) { sfx(f.kind + '_grr', 1); addFx({ k: 'mot', x: f.x, y: FLOOR - 600 * f.d.K / .44, mot: f.kind === 'alligator' ? 'GRRROOOON…' : 'GRRRRR !', col: '#FFB38A' }) }
        if (m.hurle && f.t === 2) { sfx(f.kind, 1.1); addFx({ k: 'mot', x: f.x, y: FLOOR - 700 * f.d.K / .44, mot: 'AOUUUUH !', col: '#E8E6DF' }) }
        if (m.capuchon && f.t === 2) { sfx(f.kind + '_grr', 1); addFx({ k: 'mot', x: f.x, y: FLOOR - 820 * f.d.K / .44, mot: 'SSSSSS !', col: '#EDE0B6' }) }
        if (m.sieste && ph === 'act' && !f.contre && f.t % 24 === 0) { addFx({ k: 'mot', x: f.x + f.face * 120, y: FLOOR - 360, mot: 'ZZZ…', col: '#E3E0B0' }); if (f.t % 48 === 0) sfx('ronfle', .35) }
        if (m.esquive && ph === 'act' && !f.contre && f.t % 16 === 0) addFx({ k: 'mot', x: f.x, y: FLOOR - 520 * f.d.K / .44, mot: hasard(['JE DANSE…', 'VAS-Y, ESSAIE !', 'HOP, HOP !']), col: '#EEE3CC' })
        if (m.gorgee && f.t === m.st) { sfx('gloups', 1); addFx({ k: 'mot', x: f.x + f.face * 300, y: FLOOR - 560, mot: 'GLOUB… GLOUB…', col: '#BFE9FF' }) }
        if (m.geyser && f.t === m.st) { sfx('vapeur', 1); sfx('plouf', .8); for (let i = 0; i < 3; i++) addFx({ k: 'bulles', x: f.x + f.face * 120, y: FLOOR - 400 - i * 300, n: 16, w: 160 }); addFx({ k: 'geyser', x: f.x + f.face * 150 * f.d.K / .44, y: FLOOR - 420 * f.d.K / .44 }) }
        if (m.onde && ph === 'act' && f.t % 12 === 6) { sfx('sol', 1); G.shake = 14; addFx({ k: 'onde', x: f.x + f.face * 150, y: FLOOR, dir: f.face }) }
        if (m.proj && f.t === m.st) { lanceProj(f, m); sfx(f.kind, 1.2); G.shake = Math.max(G.shake, m.souffle ? 16 : 8); if (m.souffle) { addFx({ k: 'onde', x: f.x + f.face * 200, y: FLOOR, dir: f.face }); addFx({ k: 'poussiere', x: f.x + f.face * 260, y: FLOOR }); vibre(50) } }
        if (m.saute && f.t === m.st) { f.vx = f.face * m.saute[0]; f.vy = -m.saute[1]; f.h = Math.max(f.h, .1); sfx('vent') } // (2D : on bondit d'où on est, pas du fond)
        else if (f.d.spr && ['L', 'cL', 'H', 'cH'].includes(f.mk)) f.vx *= .6;
        // T. rex : le pas qui fait trembler (tout le monde au sol près de lui est secoué)
        if (m.seisme && f.t === m.st) { sfx('sol', 1); sfx('boum', .8); G.shake = 20; addFx({ k: 'onde', x: f.x, y: FLOOR, dir: f.face }); vibre(60); if (o.h <= 0 && !['down', 'getup', 'ko'].includes(o.state) && Math.abs(o.x - f.x) < m.seisme && !o.blocking) { setS(o, 'hurt'); o.stun = 38; o.hurtK = 1; o.vx = 0; addFx({ k: 'mot', x: o.x, y: FLOOR - 520, mot: m.motSeisme || 'ÇA TREMBLE !', col: JA }) } if (m.motSeisme) for (let i = 0; i < 6; i++) addFx({ k: 'eclabousse', x: f.x + (i - 2.5) * 140, y: FLOOR, s: .6 }) }
      }
      if (['L', 'cL'].includes(f.mk) || (f.mk === 'H' && f.kind === 'gorille')) f.vx *= .6;
      if (m.quake && f.mk === 'H' && ph === 'act' && f.t === m.st) { sfx('sol', 1); G.shake = Math.max(G.shake, 9); addFx({ k: 'poussiere', x: f.x + f.face * 330, y: FLOOR }) }
      if (m.dive && f.t === m.st && f.h > 0) { f.vy = Math.max(f.vy, 0) + m.dive; sfx('vent', .8) }
      if (m.land && !f.landed && f.t > m.st + 1 && f.h <= solDe(f) + .5) { f.landed = true; f.landT = f.t; f.vx *= .25; sfx('sol', .6); addFx({ k: 'poussiere', x: f.x, y: FLOOR });
        if (m.plongeon) { sfx('plouf', 1); G.shake = Math.max(G.shake, 18); vibre(50); addFx({ k: 'onde', x: f.x, y: FLOOR, dir: f.face }); for (const dx of [-220, 0, 220]) addFx({ k: 'bulles', x: f.x + dx, y: FLOOR - 120, n: 10, w: 200 }) }
        if (m.quakeLand) { sfx('sol', 1); G.shake = Math.max(G.shake, 13); addFx({ k: 'onde', x: f.x + f.face * 120, y: FLOOR, dir: f.face }); vibre(40); if (f.kind === 'ours') { addFx({ k: 'glace', x: f.x + f.face * 150, y: FLOOR }); sfx('glace', 1); addFx({ k: 'mot', x: f.x, y: FLOOR - 420, mot: 'CRAC LA GLACE !', col: '#9ADCFF' }) } } }
      if (m.bonk && ph === 'act' && !f.hit && (f.x <= STAGE_L + 2 || f.x >= STAGE_R - 2)) { // il fonce sans réfléchir… dans le mur
        const epee = m.bonk === 'epee'; setS(f, 'hurt'); f.stun = epee ? 58 : 44; f.hurtK = 1; f.vx = epee ? 0 : -f.face * 9; if (epee) f.coincee = 58; G.shake = 12; sfx(epee ? 'crac_os' : 'boing', 1); sfx('pouet', .7); if (window.trophee) trophee(epee ? 'coincee' : 'boing', f);
        addFx({ k: 'mot', x: f.x, y: FLOOR - 520, mot: epee ? hasard(['ÉPÉE COINCÉE !', 'COINCÉ !', 'AU SECOURS, MON ÉPÉE !']) : hasard(['BOING !', 'AÏE, LE MUR !', 'SANS RÉFLÉCHIR…']), col: JA }); addFx({ k: 'impact', x: f.x + f.face * 120, y: FLOOR - 200, size: .7, col: PA }); break }
      const fini = (!m.land && f.t >= m.st + m.act + m.rec) || (m.land && f.landed && f.t >= f.landT + m.rec);
      if (fini) { if (!f.hit && SPECIALES.includes(f.mk) && !m.proj && !m.nuage && !m.jet && !m.contre && Math.random() < .3) { addFx({ k: 'mot', x: f.x, y: FLOOR - 640 * f.d.K / .44, mot: hasard(['LOUPÉ !', 'RATÉ !', 'OUPS…']), col: '#C8D6F0' }); sfx('pouet', .5) } setS(f, 'idle') }
      break;
    }
    case 'hurt': f.hurtK = Math.max(0, f.stun / 14); if (--f.stun <= 0 && onG) { f.pasPrise = 4; if (f.dizzyPending && f.hp > 0 && G.phase === 'fight') etourdit(f); else setS(f, 'idle') } break;
    case 'bstun': f.blocking = true; if (--f.stun <= 0) { f.pasPrise = 4; setS(f, f.crouchB ? 'crouch' : 'idle') } break;
    case 'down': if (f.d.dosFige && f.t === 12 && G.phase === 'fight' && !f.figeDit) { f.figeDit = true; addFx({ k: 'mot', x: f.x, y: FLOOR - 460, mot: hasard(['SUR LE DOS… IL SE FIGE !', 'FIGÉ !', 'IL NE BOUGE PLUS !']), col: '#BFE9FF' }) }
      if (f.t > 50 + (f.d.dosFige || 0) + (f.d.chute ? 24 : 0) && onG && G.phase === 'fight') { setS(f, 'getup'); f.inv = 30 } break;
    case 'getup': f.u = Math.min(1, f.t / 24); if (f.t >= 24) { f.pasPrise = 12; if (f.dizzyPending && G.phase === 'fight') etourdit(f); else setS(f, 'idle') } break;
    case 'ko': break;
  }
  // physique
  const sol = solDe(f);
  if (v2 && !f.knock && f.vy >= 0 && f.h - sol < 40 && !f.cache && !f.ciel && !['down', 'getup', 'ko', 'tenu', 'lance'].includes(f.state)) {
    f.h += (sol - f.h) * .3; if (Math.abs(sol - f.h) < .5) f.h = sol; if (f.h < 0) f.h = 0; f.vy = 0; // 2D : on glisse vers son altitude (pas de chute)
    if (f.state === 'air') setS(f, 'idle');
    if (!['walk', 'walkB', 'dash', 'atk'].includes(f.state)) f.vx *= f.glisse > 0 ? .93 : .78;
  } else if (f.h > sol || f.vy < 0) {
    f.h -= f.vy; f.vy += f.d.grav * (G.arene === 'lune' ? .55 : 1) * (!f.d.nage && estMer() ? .55 : 1); // sur la Lune, on saute très haut ; sous l'eau, le crocodile aussi flotte un peu
    if (f.h <= sol) {
      f.h = sol; f.vy = 0;
      if (f.state === 'air') { setS(f, 'land'); sfx('sol', .35); plouf(f, 1) }
      else if (f.state === 'hurt' && f.knock) { setS(f, f.hp <= 0 ? 'ko' : 'down'); f.knock = false; f.alt = 0; addFx({ k: 'poussiere', x: f.x, y: FLOOR }); sfx('chute', .9); G.shake = Math.max(G.shake, 8); plouf(f, 1.5); if (G.arene === 'riviere' && Math.random() < .4) addFx({ k: 'mot', x: f.x, y: FLOOR - 380, mot: hasard(['SPLASH !', 'PLOUF !', 'TOUT MOUILLÉ !']), col: '#7FD0F5' }) }
    }
  } else if (!['walk', 'walkB', 'dash', 'atk'].includes(f.state)) f.vx *= f.glisse > 0 ? .93 : .78;
  if (f.glisse > 0) { f.glisse--; if (f.glisse % 4 === 0 && Math.abs(f.vx) > 4) addFx({ k: 'poussiere', x: f.x - Math.sign(f.vx) * 60, y: FLOOR }) }
  if (G.arene === 'riviere' && f.h <= 0 && Math.abs(f.vx) > 3 && ['walk', 'walkB', 'dash', 'atk', 'fuite'].includes(f.state) && G.frame % (f.state === 'walk' || f.state === 'walkB' ? 16 : 7) === f.side * 3) plouf(f, f.state === 'walk' || f.state === 'walkB' ? .4 : .7);
  if (f.d.nage && G.phase !== 'menu') { const bouge = Math.abs(f.vx) > 3; if (G.frame % (bouge ? 11 : 70) === f.side * 5) addFx({ k: 'bulles', x: f.x + f.face * (bouge ? -260 : 280) * f.d.K / .44, y: FLOOR - f.h - 260 * f.d.K / .44, n: bouge ? 4 : 3, w: 60 }) }
  f.x += f.vx;
  f.x = Math.max(STAGE_L, Math.min(STAGE_R, f.x));
  f.vz = f.h - (f.hAvant ?? f.h); f.hAvant = f.h;
  f.prev = { ...inp };
}

// ---------- boîtes ----------
function box(f, b) { const K = f.d.K, y0 = FLOOR - f.h; const x0 = f.x + f.face * b[0] * K, x1 = f.x + f.face * b[1] * K; return [Math.min(x0, x1), Math.max(x0, x1), y0 + b[2] * K, y0 + b[3] * K] }
function hurtBox(f) {
  const hb = f.d.hurt;
  if (f.h > solDe(f) + 1) return box(f, hb.air);
  if (hb.aplat && f.state === 'atk' && f.move && f.move.aplat && f.ph === 'st') return box(f, hb.aplat); // autruche couchée, le cou à plat : les coups passent au-dessus
  // serpents (et long cou) : quand la tête part en avant, elle peut être touchée
  if (f.d.expose && f.state === 'atk' && f.move && f.move.box && f.ph !== 'st' && !f.move.air) { const b = f.move.box, h0 = f.mk === 'cL' || f.mk === 'cH' ? hb.crouch : hb.stand; return box(f, [h0[0], Math.max(h0[1], b[1] - 60), Math.min(h0[2], b[2] - 40), h0[3]]) }
  if (['crouch', 'cblock'].includes(f.state) || (f.state === 'atk' && f.mk === 'cL') || (f.state === 'bstun' && f.crouchB)) return box(f, hb.crouch);
  if (f.kind === 'gorille' && (f.state === 'block' || f.state === 'win' || (f.state === 'atk' && (f.mk === 'S' || f.mk === 'SUPER' || f.mk === 'H') && f.ph === 'st'))) return box(f, hb.up);
  return box(f, hb.stand);
}
function hitBox(f) {
  if (f.state !== 'atk' || f.ph !== 'act') return null;
  const m = f.move;
  if (m.hits) { if (f.hit >= m.hits || f.t - f.hitT < 7 && f.hit) return null; }
  else if (f.hit) return null;
  if (f.mk === 'S' && f.kind === 'gorille' && f.t >= m.st + m.act) return null;
  if (!m.box || (m.rush && f.t >= m.st + m.act)) return null;
  return box(f, m.box);
}
const over = (a, b) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];

function strike(a, d) {
  const hb = hitBox(a); if (!hb || d.cache) return;
  if (['down', 'getup', 'ko', 'tenu'].includes(d.state) || d.inv > 0) return;
  const hu = hurtBox(d); if (!over(hb, hu)) return;
  const m = a.move; a.hit++; a.hitT = a.t; if (window.__stat) window.__stat.push(a.kind + a.mk);
  touche(a, d, m, hb, hu, { dir: a.face, fin: a.fin, last: !m.hits || a.hit >= m.hits });
}
// un coup (ou un projectile) arrive sur le défenseur : parade, armure, dégâts, chute
function jauge(f, n) { const avant = f.meter; f.meter = Math.min(100, f.meter + n); if (avant < 100 && f.meter >= 100 && !f.cpu && !f.distant) sfx('pret') }
const hasard = l => l[Math.floor(Math.random() * l.length)];
const GRIFFUS = ['tigre', 'lion', 'ours', 'ratel', 'grizzly', 'leopard', 'guepard']; // ils laissent des marques de griffes
const invincible = f => (G.god && G.mode === 1 && !f.cpu && !NET.on) || !!(f.boost && f.boost.k === 'etoile'); // GOD MODE, ou l'étoile des caisses surprises : on ne perd pas de vie
function touche(a, d, m, hb, hu, o) {
  const face = o.dir;
  const cx = (Math.max(hb[0], hu[0]) + Math.min(hb[1], hu[1])) / 2, cy = (Math.max(hb[2], hu[2]) + Math.min(hb[3], hu[3])) / 2;
  const spe = o.spe || SPECIALES.includes(a.mk) || !!o.proj;
  // morse : le mur de défenses renvoie le coup (pas les projectiles ni les prises)
  if (!o.proj && !o.prise && !m.fouille && d.state === 'atk' && d.move && d.move.contre && d.ph === 'act' && !d.contre) { // (le serpent brun fouille : il trouve celui qui se cache avant qu'il ne contre)
    d.contre = true; d.hit = 1; d.hitT = d.t; G.stop = 12; G.shake = 14; sfx('garde'); sfx('boing', .8);
    addFx({ k: 'mot', x: d.x, y: FLOOR - 600, mot: hasard(d.move.motsContre || ['CONTRE !', 'PAS TOUCHE !', 'RETOUR À L’ENVOYEUR !']), col: JA }); if (d.move.sieste && window.trophee) trophee('sieste', d); if (d.move.brindille && window.trophee) trophee('brindille', d); if (d.move.esquive && window.statCombat) statCombat(d, 'esquive'); if (d.move.radar) { if (window.trophee) trophee('radar', d); sfx('sonar', .6); addFx({ k: 'etincelles', x: d.x + d.face * 330 * d.d.K / .44, y: FLOOR - 300 * d.d.K / .44 }) }
    touche(d, a, d.move.contre, hu, hb, { dir: d.face, last: true, spe: true }); return;
  }
  const crouchB = d.state === 'cblock' || (d.state === 'bstun' && d.crouchB), standB = d.state === 'walkB' || d.state === 'block' || (d.state === 'bstun' && !d.crouchB);
  const canBlock = !o.prise && d.blocking && d.h <= solDe(d) + 1 && (d.guardBtn || m.lvl === 'mid' || (m.lvl === 'low' && crouchB) || (m.lvl === 'high' && standB));
  if (canBlock) {
    d.crouchB = crouchB; setS(d, 'bstun'); d.stun = m.bs; d.vx = face * m.kb * (m.souffle ? .75 : .8); if (m.souffle) { d.glisse = 22; addFx({ k: 'mot', x: d.x, y: FLOOR - 520, mot: 'SOUFFLÉ !', col: JA }); addFx({ k: 'poussiere', x: d.x, y: FLOOR }) } if (!o.proj) a.vx = -face * 3;
    // les coups spéciaux abîment un peu la garde (jamais jusqu'au K.-O.)
    const chip = m.chip != null ? m.chip : spe ? .2 : 0;
    if (chip && !invincible(d)) { d.chipAcc = (d.chipAcc || 0) + m.dmg * chip; const c = Math.floor(d.chipAcc); if (c >= 1) { d.chipAcc -= c; d.hp = Math.max(1, d.hp - c) } }
    if (m.casse) { d.stun = m.bs + 14; addFx({ k: 'mot', x: d.x, y: FLOOR - 560, mot: 'GARDE CASSÉE !', col: '#FF6B4A' }) }
    G.stop = 5; addFx({ k: 'garde', x: cx, y: cy }); sfx('garde'); jauge(a, 3); jauge(d, 2);
    if (!d.cpu) { d.st.parades = (d.st.parades || 0) + 1; } return;
  }
  const armor = !o.prise && ((d.state === 'atk' && d.move.armor && (d.ph === 'st' || (d.move.rush && d.ph === 'act'))) || (d.boost && d.boost.k === 'bouclier' && d.h <= solDe(d) + 1));
  const scale = o.prise ? 1 : Math.max(.45, 1 - d.combo * .1);
  const aideK = a.cpu && G.mode === 1 ? 1 - .12 * G.aide : 1;
  // dos tourné (hippo qui mitraille, ratel qui pschitte…) : les fesses à l'air prennent plus cher
  const fesses = d.state === 'atk' && d.move && d.move.dos && d.ph === 'act';
  const bonus = (o.fin ? 1.15 : 1) * (a.fort && spe ? 1.2 : 1) * (m.aa && d.h > (vol2d(a) ? a.h + 40 : 0) ? 1.25 : 1) * (a.arme && m.charge ? 1 + .35 * a.arme : 1) * (fesses ? 1.3 : 1) * (a.d.force || 1) * (a.d.forceMer && estMer() ? a.d.forceMer : 1) * forceDuel(a); // forceMer : le crocodile, invité de la MER, y tape moins fort
  if (fesses && Math.random() < .5) addFx({ k: 'mot', x: d.x, y: FLOOR - 560, mot: hasard(['FESSES À L’AIR !', 'PAF, LES FESSES !']), col: '#FF7AB6' });
  // points faibles du livre : le puma fuit devant une meute (attaques en bande) · le cobra, « serré, il est en danger » · l'alligator « jeune, il se fait avaler » (rétréci) · la girafe : « si elle tombe, c'est fini »
  const faible = (m.clan && d.d.meute ? d.d.meute : 1) * (o.prise ? (d.d.fragilePrise || 1) * (d.d.petitFragile && d.boost && d.boost.k === 'mini' ? d.d.petitFragile : 1) : 1) * (d.d.chute && m.kd && o.last ? d.d.chute : 1) * (d.d.carapace && m.casse && !o.proj ? d.d.carapace : 1) * (d.d.chaud && m.chaleur ? d.d.chaud : 1) * (d.d.ailesFines && ailesTouchees(d, m) ? d.d.ailesFines : 1) * (d.repereT > G.frame && d.repereBy === a && !m.repere ? 1.25 : 1) * (d.d.proieDuCiel && (duCiel(a) || m.air) ? d.d.proieDuCiel : 1) * (d.d.ecrase && (m.air || (duCiel(a) && m.kd)) ? d.d.ecrase : 1) * (m.fouille && (d.state === 'crouch' || (d.state === 'atk' && d.move && (d.move.camoufle || d.move.aplat))) ? m.fouille : 1);
  if (m.clan && d.d.meute && !d.meuteDit) { d.meuteDit = true; addFx({ k: 'mot', x: d.x, y: FLOOR - 700 * d.d.K / .44, mot: hasard(['UNE MEUTE ?! AU SECOURS !', 'TROP NOMBREUX !', 'JE FILE !']), col: CY }) }
  if (d.d.proieDuCiel && (duCiel(a) || m.air) && d.hp > 0 && G.frame - (d.cielT || -999) > 90 && (d.cielT = G.frame)) addFx({ k: 'mot', x: d.x, y: FLOOR - 700 * d.d.K / .44, mot: hasard(['ATTAQUE DU CIEL !', 'AU SECOURS, ÇA VIENT D’EN HAUT !', 'UN OISEAU ?!']), col: '#D8F0A0' }); // mante (livre) : « souvent mangée par les oiseaux »
  if (d.d.ecrase && (m.air || (duCiel(a) && m.kd)) && d.hp > 0 && G.frame - (d.ecraseT || -999) > 90 && (d.ecraseT = G.frame)) { addFx({ k: 'mot', x: d.x, y: FLOOR - 520 * d.d.K / .44, mot: hasard(['ÉCRASÉE !', 'AÏE, UN DOIGT GÉANT ?!', 'TOUTE PLATE !']), col: '#FF8A7A' }); sfx('splotch', .7) } // veuve noire (livre) : « on l'écrase d'un doigt »
  if (m.fouille && (d.state === 'crouch' || (d.state === 'atk' && d.move && (d.move.camoufle || d.move.aplat))) && d.hp > 0) addFx({ k: 'mot', x: d.x, y: FLOOR - 560 * d.d.K / .44, mot: hasard(['TROUVÉ !', 'PAS DE CACHETTE !', 'JE T’AI DÉNICHÉ !']), col: '#EBD8B0' }); // serpent brun (livre) : « il fouille chaque cachette »
  if (d.d.ailesFines && ailesTouchees(d, m) && d.hp > 0 && G.frame - (d.ailesT || -999) > 90 && (d.ailesT = G.frame)) addFx({ k: 'mot', x: d.x, y: FLOOR - d.h - 520 * d.d.K / .44, mot: hasard(['MES AILES !', 'AÏE, MES AILES FINES !', 'OUILLE, LA PEAU DE MES AILES !']), col: '#E8C8A8' }); // chauve-souris (livre) : « des ailes en peau très fine »
  if (d.d.chaud && m.chaleur && d.hp > 0 && G.frame - (d.chaudT || -999) > 50 && (d.chaudT = G.frame)) addFx({ k: 'mot', x: d.x, y: FLOOR - 620 * d.d.K / .44, mot: hasard(['TROP CHAUD !', 'JE CUIS !', 'AU SECOURS, ÇA CHAUFFE !']), col: '#FF9A3C' });
  if (d.d.carapace && m.casse && !o.proj && d.hp > 0) { addFx({ k: 'mot', x: d.x, y: FLOOR - 560 * d.d.K / .44, mot: hasard(['CRAC ! MA CARAPACE !', 'LA CARAPACE CRAQUE !', 'OUILLE, MON ARMURE !']), col: '#FFD9C2' }); sfx('crac_os', .8) }
  if (d.d.chute && m.kd && o.last && d.hp > 0) addFx({ k: 'mot', x: d.x, y: FLOOR - 820 * d.d.K / .44, mot: hasard(['NE TOMBE PAS !', 'DUR DE SE RELEVER !', 'OUILLE, LES GRANDES PATTES !']), col: '#FBE6B5' });
  let dmg = Math.max(1, Math.round(m.dmg * scale * aideK * bonus * (d.d.peau || 1) * faible));
  if (invincible(d)) dmg = 0;
  if (!a.cpu) { if (m.contourne === 'herbe' && dmg > 0 && window.trophee) trophee('derriere', a); if (o.fin) a.st.final = true; if (m === a.d.moves.SUPER || m.super) a.st.super = true; a.st.coups = (a.st.coups || 0) + 1; if (window.statCombat && dmg > 0) { if (spe && m !== a.d.moves.SUPER) statCombat(a, 'spe'); if (d.h > 40 && !o.prise) statCombat(a, 'aa') } }
  d.hp = Math.max(0, d.hp - dmg); d.flash = 4;
  if (d.state === 'hurt' || d.state === 'bstun' && false) d.combo++; else d.combo = 1;
  if (d.combo > 1) { FX = FX.filter(e => e.k !== 'combo'); addFx({ k: 'combo', n: d.combo, side: d.side ? 0 : 1 }); }
  const rage = f => f.hp / f.d.hp < .3 ? 1.6 : 1;
  jauge(a, 7 * rage(a)); jauge(d, 5 * rage(d));
  // porc-épic : qui s'y frotte s'y pique ! Un coup au corps à corps plante un piquant dans l'attaquant (les piquants ne sont jamais lancés : ils restent plantés)
  if (d.d.piquants && !o.proj && !o.prise && !m.blob && dmg > 0 && a.hp > 1) pique(a, d.d.piquants, d);
  if (m.pique && dmg > 0 && d.hp > 0) pique(d, m.pique, a);
  if (a.d.grandit && dmg > 0 && !o.proj) grandit(a, a.d.grandit.pas);
  if (window.trophee && dmg > 0) { if (m.plafond) trophee('cueillette', a); if (d.repereT > G.frame && d.repereBy === a && !m.repere) trophee('repere', a) }
  if (m.repere && dmg > 0 && d.hp > 0) { d.repereT = G.frame + m.repere; d.repereBy = a; addFx({ k: 'mot', x: d.x, y: FLOOR - d.h - 700 * d.d.K / .44, mot: hasard(['REPÉRÉ !', 'BIP… TROUVÉ !', 'CIBLE REPÉRÉE !']), col: '#D9B3FF' }) } // chauve-souris : le sonar repère (ses coups suivants font plus mal)
  // hyène : elle fatigue ses proies (la jauge SUPER de l'adversaire se vide)
  if (m.vide) { const avant = d.meter; d.meter = Math.max(0, d.meter - m.vide); jauge(a, m.vide * .4); if (avant > 0 && d.meter <= 0 && window.trophee) trophee('rire', a) }
  // étourdissement : trop de coups en peu de temps → il voit des étoiles (une fois par manche)
  if (dmg > 0 && !o.prise) { d.etourdi = (d.etourdi || 0) + dmg * (m.kd ? 1.3 : 1); d.dernierCoup = G.frame; if (d.etourdi >= (d.d.etour || 46) && !d.dizzyFait && d.hp > 0) d.dizzyPending = true }
  if (m.assomme && dmg > 0 && d.hp > 0 && !d.dizzyFait && !(d.state === 'atk' && d.move && d.move.armor)) { d.dizzyPending = true; d.stunDuree = m.assomme; d.paraPending = !!m.paralyse } // orque : le coup de queue qui assomme
  const lastHit = o.last;
  if (estMer()) addFx({ k: 'bulles', x: cx, y: cy + 60, n: m.dmg >= 10 ? 12 : 7, w: 220 });
  addFx({ k: 'impact', x: cx, y: cy, size: m.kd && lastHit ? 1.15 : m.dmg >= 10 ? .95 : .7, mot: G.prout ? hasard(['PROUT !', 'PFFRT !', 'POUÊÊT !']) : m.compte && !o.proj ? (a.hit >= (m.hits || 1) ? a.hit + ' BRAS !' : a.hit + ' !') : m.cogne && !o.proj ? (a.hit <= 1 ? 'BONK !' : 'CHOMP !') : m.mots[Math.floor(Math.random() * m.mots.length)], col: a.d.col });
  if (!o.proj && !o.prise && GRIFFUS.includes(a.kind) && ['L', 'H', 'cL', 'SUPER', 'SD', 'A'].includes(a.mk)) addFx({ k: 'griffes', x: cx, y: cy, dir: face, n: a.mk === 'H' || a.mk === 'SUPER' ? 4 : 3 });
  if (m.saumon && !o.proj) { addFx({ k: 'saumon', x: cx, y: cy - 60, vx: face * (3 + Math.random() * 4), vy: -(13 + Math.random() * 6), dir: face }); sfx('flac', .8); if (Math.random() < .4) addFx({ k: 'mot', x: cx, y: cy - 330, mot: hasard(['UN SAUMON ?!', 'POISSON VOLANT !', 'MIAM, UN SAUMON !']), col: '#FF8A7A' }) }
  if (a.kind === 'ours' && (a.mk === 'SF' || a.mk === 'S')) { addFx({ k: 'glace', x: cx, y: FLOOR }); sfx('glace', .8) }
  // l'animal touché réagit (en vrai et en rigolant)
  if ((m.dmg >= 10 || m.kd) && lastHit && d.hp > 0 && d.d.aie && Math.random() < .35) addFx({ k: 'mot', x: d.x - face * 60, y: FLOOR - 700 * d.d.K / .44, mot: hasard(d.d.aie), col: d.d.clair });
  if (G.prout) { sfx('prout', .8); sfx('pop', .5) } else sfx(m.son); vibre(m.dmg >= 10 ? 40 : 18);
  if ((m.dmg >= 10 || m.kd) && lastHit && d.hp > 0 && Math.random() < .55) sfx(d.kind + '_grr', .5); // l'animal touché grogne
  if (m === a.d.moves.SUPER && lastHit) sfx('boum', 1);
  G.shake = Math.max(G.shake, m.kd ? 16 : m.dmg >= 10 ? 11 : 5); G.stop = a.mk === 'SUPER' ? (lastHit ? 24 : 6) : m.kd && lastHit ? 12 : ['H', 'cH'].includes(a.mk) || m.dmg >= 10 ? 10 : spe ? 8 : 6; // (25/09) arrêt sur image gradué : c'est ce qui fait « sentir » le coup
  if (a.kind === 'tigre' && a.mk === 'S' && !o.proj) a.vx = -face * 4;
  if (m.agrippe && a.hit === 1) a.grabD = Math.max(260, Math.abs(d.x - a.x));
  if (m.sale) { d.sale = 150; if (Math.random() < .5) addFx({ k: 'mot', x: d.x, y: FLOOR - 520, mot: hasard(['BEURK !', 'POUAH !', 'ÇA COLLE !']), col: '#B07A3E' }) }
  if (m.venin && d.hp > 0 && !invincible(d)) { const bl = m.venin.genre === 'blesse'; d.poison = Object.assign({ n: 0 }, m.venin, { dmg: m.venin.dmg * (bl ? 1 : d.d.sensVenin || 1) }); const gr = m.venin.genre === 'gratte'; addFx({ k: 'mot', x: d.x, y: FLOOR - 560, mot: m.venin.genre === 'fil' ? hasard(['EMMÊLÉ !', 'PRIS DANS LE FIL !', 'TOUT COLLÉ !']) : bl ? 'BLESSÉ !' : gr ? hasard(['ÇA GRATTE !', 'ÇA PIQUE !', 'ATCHOUM !']) : d.d.sensVenin ? 'TROP DE VENIN !' : 'EMPOISONNÉ !', col: m.venin.genre === 'fil' ? '#F4F4F4' : bl ? '#FFB38A' : gr ? '#F2D27A' : '#7BD35A' }) }
  if (m.recule && !o.proj) a.vx = -face * m.recule;
  if (m.souffle) { d.glisse = 26; addFx({ k: 'poussiere', x: d.x, y: FLOOR }); G.shake = Math.max(G.shake, 18) }
  if (d.hp <= 0) { a.dernierSuper = m === a.d.moves.SUPER || !!m.super; ko(a, d); return }
  // grizzly : « Un grizzly arrive… et la plage se vide ! » (l'autre part en courant)
  if (m.peur && !armor && d.h <= solDe(d) + 1) { if (window.statCombat) statCombat(a, 'peur'); setS(d, 'fuite'); d.stun = 46; d.vx = face * 10; addFx({ k: 'mot', x: d.x, y: FLOOR - 620, mot: hasard(['AU SECOURS !', 'SAUVE QUI PEUT !', 'MAMAN !']), col: PA }); sfx('pouet', .5); return }
  if (armor) { addFx({ k: 'mot', x: d.x, y: FLOOR - 460, mot: hasard(['TIENT BON !', 'MÊME PAS MAL !', 'BLINDÉ !']), col: CY }); return }
  setS(d, 'hurt'); d.stun = m.hs || 18; d.hurtK = 1; d.vx = face * m.kb * (d.d.leger || 1);
  if (o.fin) { addFx({ k: 'mot', x: (a.x + d.x) / 2, y: FLOOR - 560, mot: 'COMBO FINAL !', col: JA }); G.stop = 12; G.shake = Math.max(G.shake, 16); vibre(50); acclame(.6) }
  if (m === a.d.moves.SUPER && lastHit) acclame(.8); else if (d.combo === 4) acclame(.5);
  if ((m.kd && lastHit) || d.h > solDe(d) + 1 || o.fin) { d.vy = -12; d.h = Math.max(d.h, .1); d.knock = true; d.stun = 99; d.vx = face * Math.max(6, m.kb * .7) }
  // coup qui envoie en l'air (anti-aérien, « patte à saumons »…) : il vole haut, avec un sifflet de chute
  if (m.lance && lastHit) { d.vy = -m.lance; d.h = Math.max(d.h, .1); d.knock = true; d.stun = 99; d.vx = face * 3.5; sfx('sifflet_haut', .8); if (Math.random() < .5) addFx({ k: 'mot', x: d.x, y: FLOOR - 820, mot: hasard(['DÉCOLLAGE !', 'EN L’AIR !', 'ENVOLÉ !']), col: JA }) }
  if (!o.proj && !o.prise && (d.x <= STAGE_L + 2 || d.x >= STAGE_R - 2)) a.vx = -face * m.kb * .6; // coin : l'attaquant recule
}
// --- projections : attraper, se dégager, lancer
function attrape(a, d, m) {
  if (window.statCombat && m === a.d.moves.T) statCombat(a, 'proj');
  a.hit = 1; a.hitT = a.t; setS(a, 'lance'); a.vx = 0; a.prise = m; a.cible = d; a.mkPrise = a.mk;
  setS(d, 'tenu'); d.vx = 0; d.vy = 0; d.tenuPar = a; d.combo = 0; d.poison = d.poison;
  G.stop = 5; sfx('vent', .8); sfx(a.kind + '_grr', .7);
  addFx({ k: 'mot', x: (a.x + d.x) / 2, y: FLOOR - 600, mot: m.prise.mot || hasard(['ATTRAPÉ !', 'VIENS PAR LÀ !', 'HOP !']), col: JA });
}
function degage(a, d) {
  for (const [f, s] of [[a, -1], [d, 1]]) { setS(f, 'bstun'); f.stun = 12; f.crouchB = false; if (!vol2d(f)) f.h = 0; f.vx = a.face * s * 10; f.pasPrise = 20 }
  sfx('garde'); sfx('boing', .6); G.stop = 6;
  addFx({ k: 'mot', x: (a.x + d.x) / 2, y: FLOOR - 600, mot: hasard(['ÉCHAPPÉ !', 'RATÉ, GLISSANT !', 'NI VU NI CONNU !']), col: CY });
}
function lache(a, d, m) {
  d.h = Math.max(d.h, .1); setS(d, 'hurt');
  const hb = hurtBox(d);
  touche(a, d, m, hb, hb, { dir: a.face, prise: true, last: true, spe: m !== a.d.moves.T });
  if (d.state === 'hurt') { d.knock = true; d.vy = -(m.prise.haut || 15); d.vx = a.face * (m.prise.loin || 11); d.stun = 99 }
  setS(a, 'land'); a.t = -(m.prise.rec || 8); a.prise = null; a.cible = null;
  G.shake = Math.max(G.shake, 16); sfx('chute', .8);
}
// --- étourdissement : étoiles, oiseaux qui gazouillent, et « IL VOIT DES ÉTOILES ! »
function etourdit(f) {
  if (window.trophee) trophee('etourdi', G.f.find(g => g !== f));
  f.dizzyPending = false; f.dizzyFait = true; setS(f, 'dizzy'); f.stun = f.stunDuree || 110; f.stunDuree = 0; f.vx = 0;
  f.paralyse = !!f.paraPending; f.paraPending = false;
  if (f.paralyse) { if (window.trophee) trophee('paralyse', G.f.find(g => g !== f)); sfx('boing', .8); addFx({ k: 'mot', x: f.x, y: FLOOR - 760 * f.d.K / .44, mot: hasard(['PARALYSÉ !', 'PLUS UN GESTE !', 'FIGÉ PAR LE VENIN !']), col: '#D9B3FF' }); return } // guêpe, scolopendre : le venin qui paralyse
  sfx('oiseaux', 1); sfx('boing', .6);
  addFx({ k: 'mot', x: f.x, y: FLOOR - 760 * f.d.K / .44, mot: hasard(['IL VOIT DES ÉTOILES !', 'TOUT TOURNE !', 'CUI-CUI !']), col: JA });
}
// piquants plantés (porc-épic) : chaque piquant fait un peu mal, puis tombe
function pique(f, n, par) {
  const p = f.piques || (f.piques = { n: 0, t: 0 }); const avant = p.n; p.n = Math.min(8, p.n + n); p.t = 300; if (!p.pos) p.pos = [];
  while (p.pos.length < p.n) p.pos.push([.2 + Math.random() * .75, .25 + Math.random() * .55, -.6 + Math.random() * 1.2]);
  f.hp = Math.max(1, f.hp - n); if (par) { jauge(par, 3 * n); if (window.statCombat) statCombat(par, 'piquants', n) }
  if (avant === 0 || Math.random() < .5) addFx({ k: 'mot', x: f.x, y: FLOOR - 560, mot: hasard(['AÏE, ÇA PIQUE !', 'OUILLE, LES PIQUANTS !', 'QUI S’Y FROTTE S’Y PIQUE !']), col: '#F5F0E6' });
  sfx('porcepic', .45);
}
// venin (dragon de Komodo) et nuage puant (ratel) : des effets qui durent
function majEffets() {
  for (const f of G.f) {
    if (f.sale > 0) f.sale--;
    const q = f.piques; if (q && q.n > 0) { q.t--; if (q.t % 60 === 0 && f.hp > 1 && f.state !== 'ko') f.hp = Math.max(1, f.hp - 1); if (q.t <= 0) { q.n--; q.pos.pop(); q.t = q.n ? 90 : 0 } }
    const p = f.poison; if (!p) continue;
    p.t--; p.n++;
    if (p.n % p.tick === 0 && f.hp > 1 && !['ko'].includes(f.state)) { f.hp = Math.max(1, f.hp - p.dmg); if (p.genre !== 'blesse' && p.genre !== 'gratte' && p.genre !== 'fil') addFx({ k: 'bulle', x: f.x + (Math.random() - .5) * 160, y: FLOOR - 200 - Math.random() * 120 }) } // blessé : pas de bulles vertes de poison
    if (p.t <= 0) f.poison = null;
  }
  for (const z of G.zones) {
    z.t++; const d = G.f.find(g => g !== z.a); if (!d) continue;
    const dans = Math.abs(d.x - z.x) < z.r + 70 && d.h < 320 && !['down', 'getup', 'ko'].includes(d.state) && d.inv <= 0 && z.t < z.life - 20;
    if (!dans) continue;
    if (!z.fait) { z.fait = true; const encre = z.genre === 'encre'; if (window.statCombat && !encre) statCombat(z.a, 'pschiit'); if (encre && window.trophee) trophee('encre', z.a); addFx({ k: 'mot', x: d.x, y: FLOOR - 520, mot: encre ? hasard(['PLEIN D’ENCRE !', 'JE NE VOIS RIEN !', 'TOUT NOIR !']) : 'BEURK !', col: encre ? '#C9B8FF' : '#9BE15D' }); sfx(encre ? 'gloups' : 'ratel_grr', .5);
      if (!d.blocking) { setS(d, 'hurt'); d.stun = z.stun; d.hurtK = 1; d.vx = 0; d.puant = z.stun } jauge(z.a, 8) }
    if (z.t % z.tick === 0 && d.hp > 1) { d.hp = Math.max(1, d.hp - 1); jauge(z.a, 2) }
  }
  G.zones = G.zones.filter(z => z.t < z.life);
}
// nuage d'encre de la pieuvre : de grosses volutes violet-noir qui s'étalent puis se dissipent
function dessineEncre(c, z) { const k = z.t / z.life, a = Math.min(1, z.t / 8) * (1 - Math.max(0, k - .75) * 4), r = rng(Math.floor(z.x) + 7), g = Math.min(1, z.t / 14);
  c.save(); for (let i = 0; i < 16; i++) { const ang = r() * TAU, dist = r() * z.r * g, px = z.x + Math.cos(ang) * dist + Math.sin(G.time * 1.5 + i) * 10, py = FLOOR - 120 - r() * 300 * g, rad = (60 + r() * 80) * (.6 + .4 * g);
    c.globalAlpha = a * (.55 + .25 * (i % 3) / 2); c.fillStyle = i % 3 === 0 ? '#2A1F3D' : i % 3 === 1 ? '#3D2C57' : '#171021'; c.beginPath(); c.arc(px, py, rad, 0, TAU); c.fill() } c.restore() }
function dessineZones(c) {
  for (const z of G.zones) {
    if (z.genre === 'encre') { dessineEncre(c, z); continue }
    const k = z.t / z.life, a = Math.min(1, z.t / 10) * (1 - Math.max(0, k - .8) * 5), r = rng(Math.floor(z.x));
    c.save(); c.globalAlpha = a * .55;
    for (let i = 0; i < 14; i++) { const ang = r() * TAU, dist = r() * z.r, px = z.x + Math.cos(ang) * dist, py = FLOOR - 90 - r() * 240 + Math.sin(G.time * 3 + i) * 12, rad = 60 + r() * 70;
      c.fillStyle = i % 3 ? '#8FD14F' : '#C9E86B'; c.beginPath(); c.arc(px + Math.sin(G.time * 2 + i) * 14, py, rad, 0, TAU); c.fill() }
    c.globalAlpha = a; c.strokeStyle = '#4E7A1E'; c.lineWidth = 7; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const x0 = z.x - z.r * .7 + i * z.r * .35, y0 = FLOOR - 260 - ((G.time * 60 + i * 30) % 90); c.beginPath();
      for (let s = 0; s <= 6; s++) c.lineTo(x0 + Math.sin(s * 1.2 + G.time * 4 + i) * 16, y0 - s * 16); c.stroke() }
    c.fillStyle = NV; for (let i = 0; i < 3; i++) { const ang = G.time * (4 + i) + i * 2; c.beginPath(); c.arc(z.x + Math.cos(ang) * (80 + i * 40), FLOOR - 300 + Math.sin(ang * 1.3) * 50, 6, 0, TAU); c.fill() }
    c.restore();
  }
}
// projectiles (le rugissement du lion…) : une onde qui avance et touche une seule fois
function lanceProj(f, m) {
  const p = m.proj, dh = vol2d(f) ? f.h : 0; G.proj.push({ a: f, m, x: f.x + f.face * p.x0 * f.d.K, vx: f.face * p.spd, w: p.w * f.d.K, y0: p.h[0] * f.d.K - dh, y1: p.h[1] * f.d.K - dh, t: 0, life: p.life, dir: f.face });
}
function majProj() {
  for (const p of G.proj) {
    p.t++; p.x += p.vx;
    if (p.blob) { p.yy += p.vy; p.vy += p.grav;
      if (p.yy >= FLOOR - 10) { p.done = true; addFx({ k: 'tache', x: p.x, y: FLOOR, r: p.w }); continue }
      const d = G.f.find(g => g !== p.a); if (!d || G.phase !== 'fight' || ['down', 'getup', 'ko', 'tenu'].includes(d.state) || d.inv > 0 || d.cache) continue;
      const hb = [p.x - p.w, p.x + p.w, p.yy - p.w, p.yy + p.w], hu = hurtBox(d);
      if (over(hb, hu)) { p.done = true; touche(p.a, d, p.m, hb, hu, { dir: p.dir, proj: true, last: false }) } continue }
    const d = G.f.find(g => g !== p.a); if (!d || p.done || G.phase !== 'fight') continue;
    if (['down', 'getup', 'ko', 'tenu'].includes(d.state) || d.inv > 0) continue;
    const hb = [p.x - p.w, p.x + p.w, FLOOR + p.y0, FLOOR + p.y1], hu = hurtBox(d);
    if (over(hb, hu)) { p.done = true; if (window.__stat) window.__stat.push(p.a.kind + 'P'); touche(p.a, d, p.m, hb, hu, { dir: p.dir, proj: true, last: true }); }
  }
  G.proj = G.proj.filter(p => !p.done && p.t < p.life && p.x > STAGE_L - 400 && p.x < STAGE_R + 400);
}
function dessineProj(c) {
  for (const p of G.proj) {
    if (p.blob) { c.save(); c.translate(p.x, p.yy); c.rotate(p.t * .3);
      c.fillStyle = '#6B4423'; c.strokeStyle = '#3A220F'; c.lineWidth = 6; c.beginPath();
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, rr = p.w * (.8 + .25 * Math.sin(i * 2.3)); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) } c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#A0703F'; c.beginPath(); c.arc(-p.w * .3, -p.w * .3, p.w * .25, 0, TAU); c.fill(); c.restore(); continue }
    const k = p.t / p.life, a = Math.min(1, p.t / 4) * (1 - Math.max(0, k - .75) * 4);
    if (p.m && p.m.proj && p.m.proj.sol) { const r = rng(Math.floor(p.x)); c.save(); c.globalAlpha = a;
      for (let i = 0; i < 7; i++) { const dx = -p.dir * i * 34, h = (70 + 50 * Math.sin(p.t * .6 + i)) * (1 - i / 8); c.fillStyle = i % 2 ? '#C9A66B' : '#8B6B3E'; c.strokeStyle = NV; c.lineWidth = 5;
        c.beginPath(); c.moveTo(p.x + dx - 30, FLOOR); c.lineTo(p.x + dx - 8, FLOOR - h); c.lineTo(p.x + dx + 14, FLOOR - h * .6); c.lineTo(p.x + dx + 30, FLOOR); c.closePath(); c.fill(); c.stroke() }
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(242,215,168,.8)'; c.beginPath(); c.arc(p.x - p.dir * (40 + r() * 160), FLOOR - 20 - r() * 70, 18 + r() * 22, 0, TAU); c.fill() }
      c.restore(); if (p.t < 26) comic(c, 'BROUM !', p.x, FLOOR - 230, p.t / 60, .5, a, '#C9A66B'); continue }
    if (p.m && p.m.proj && p.m.proj.vague) { c.save(); c.globalAlpha = a; const H = -p.y0, x = p.x, d = p.dir;
      const g = c.createLinearGradient(0, FLOOR - H, 0, FLOOR); g.addColorStop(0, 'rgba(230,248,255,.95)'); g.addColorStop(.35, 'rgba(90,190,240,.8)'); g.addColorStop(1, 'rgba(20,90,160,.55)');
      c.fillStyle = g; c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.beginPath(); c.moveTo(x - d * 260, FLOOR); c.quadraticCurveTo(x - d * 200, FLOOR - H * .9, x + d * 20, FLOOR - H);
      c.quadraticCurveTo(x + d * 150, FLOOR - H * 1.02, x + d * 120, FLOOR - H * .72); c.quadraticCurveTo(x + d * 60, FLOOR - H * .8, x + d * 90, FLOOR - H * .45); c.quadraticCurveTo(x + d * 130, FLOOR - H * .2, x + d * 110, FLOOR); c.closePath(); c.fill(); c.stroke();
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x + d * (40 + Math.sin(p.t * .4 + i) * 60), FLOOR - H * (.8 + .15 * Math.sin(i * 2 + p.t * .3)), 12 + i % 3 * 6, 0, TAU); c.fill() }
      c.restore(); if (p.t < 26) comic(c, 'SPLAAASH !', p.x, FLOOR - H - 60, p.t / 60, .5, a, '#BFE9FF'); continue }
    if (p.m && p.m.proj && p.m.proj.sonar) { c.save(); c.globalAlpha = a; c.translate(p.x, FLOOR + (p.y0 + p.y1) / 2); c.scale(p.dir, 1); c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const r = 50 + i * 48 + (p.t * 4) % 48; c.lineWidth = 16 - i * 3; c.strokeStyle = i % 2 ? 'rgba(232,247,255,.95)' : (p.m.proj.col || '#12A4C4'); c.beginPath(); c.arc(-r * .7, 0, r, -.9, .9); c.stroke() }
      c.restore(); if (p.t % 18 < 9) comic(c, p.m.proj.bruit || 'CLIC !', p.x - p.dir * 30, FLOOR + p.y0 - 40, .2, .45, a, '#BFE9FF'); continue }
    if (p.m && p.m.proj && p.m.proj.chant) { c.save(); c.globalAlpha = a; const yc = FLOOR + (p.y0 + p.y1) / 2; c.translate(p.x, yc); c.scale(p.dir, 1); c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const r = 60 + i * 60 + (p.t * 5) % 60; c.lineWidth = 18 - i * 3; c.strokeStyle = i % 2 ? 'rgba(232,247,255,.95)' : '#4F86BF'; c.beginPath(); c.arc(-r * .6, 0, r, -.85, .85); c.stroke() }
      c.scale(p.dir, 1); c.font = '900 88px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.strokeStyle = NV; c.lineWidth = 8; ['♪', '♫'].forEach((n, i) => { const x = (i ? -90 : 40) * p.dir, y = -120 + Math.sin(p.t * .3 + i * 2) * 40; c.strokeText(n, x, y); c.fillText(n, x, y) });
      c.restore(); if (p.t < 30) comic(c, 'OUUUUH !', p.x - p.dir * 40, FLOOR + p.y0 - 40, p.t / 60, .5, a, '#BFE9FF'); continue }
    if (p.m && p.m.proj && p.m.proj.fil) { c.save(); c.globalAlpha = a; const yc = FLOOR + (p.y0 + p.y1) / 2, f0 = p.a, x0 = f0 ? f0.x + f0.face * 200 * f0.d.K / .44 : p.x - p.dir * 400; c.lineCap = 'round'; // veuve noire : le fil gluant
      c.strokeStyle = NV; c.lineWidth = 9; c.beginPath(); c.moveTo(x0, yc + 20); c.quadraticCurveTo((x0 + p.x) / 2, yc - 40 + 20 * Math.sin(p.t * .3), p.x, yc); c.stroke(); c.strokeStyle = '#F6F6F6'; c.lineWidth = 4; c.stroke();
      c.fillStyle = 'rgba(250,250,250,.9)'; c.strokeStyle = NV; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(p.x + p.dir * i * 16, yc + (i - 1) * 18, 14 - i * 3, 0, TAU); c.fill(); c.stroke() }
      c.restore(); if (p.t < 18) comic(c, 'PFIOU !', p.x, yc - 100, p.t / 36, .45, a, '#F4F4F4'); continue }
    if (p.m && p.m.proj && p.m.proj.poils) { c.save(); c.globalAlpha = a; const yc = FLOOR + (p.y0 + p.y1) / 2; c.lineCap = 'round'; // mygale : le nuage de poils piquants
      for (let i = 0; i < 26; i++) { const ang = i * 2.39 + p.t * .08, r = 20 + (i * 37 % 110), x = p.x + Math.cos(ang) * r * 1.3, y = yc + Math.sin(ang) * r * .8, d = .6 + (i % 5) * .3;
        c.strokeStyle = NV; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(d) * 26, y + Math.sin(d) * 26); c.stroke(); c.strokeStyle = '#B98A55'; c.lineWidth = 3.5; c.stroke() }
      c.restore(); if (p.t < 20) comic(c, 'FFFT !', p.x, yc - 110, p.t / 40, .45, a, '#F2D27A'); continue }
    if (p.m && p.m.proj && p.m.proj.bulle) { c.save(); c.globalAlpha = a; const yc = FLOOR + (p.y0 + p.y1) / 2, r = 50 + 8 * Math.sin(p.t * .5); // crevette-mante : la bulle qui éclate (livre p. 50)
      const g = c.createRadialGradient(p.x - r * .3, yc - r * .3, r * .1, p.x, yc, r); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.5, 'rgba(190,235,255,.45)'); g.addColorStop(1, 'rgba(120,200,255,.3)');
      c.fillStyle = g; c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.beginPath(); c.arc(p.x, yc, r, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(p.x - r * .35, yc - r * .35, r * .18, 0, TAU); c.fill();
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(p.x - p.dir * (r + 20 + i * 26), yc + Math.sin(p.t * .6 + i) * 14, 9 - i * 2, 0, TAU); c.stroke() }
      c.restore(); if (p.t < 20) comic(c, 'BLOUP !', p.x, yc - 100, p.t / 40, .45, a, '#BFE9FF'); continue }
    if (p.m && p.m.proj && p.m.proj.rire) { c.save(); c.globalAlpha = a; const yc = FLOOR + (p.y0 + p.y1) / 2;
      ['HI', 'HA', 'HI'].forEach((s, i) => { const x = p.x - p.dir * i * 95, y = yc - 60 + i * 55 + Math.sin(p.t * .5 + i * 2) * 34, sz = 86 - i * 12;
        c.save(); c.translate(x, y); c.rotate(Math.sin(p.t * .3 + i) * .25); c.font = `900 ${sz}px Rubik, "Arial Black", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
        c.lineWidth = 16; c.strokeStyle = NV; c.strokeText(s, 0, 0); c.fillStyle = i % 2 ? '#F2D49B' : JA; c.fillText(s, 0, 0); c.restore() });
      c.restore(); continue }
    c.save(); c.globalAlpha = a; c.translate(p.x, FLOOR + (p.y0 + p.y1) / 2); c.scale(p.dir, 1);
    const gros = p.m && p.m.souffle ? 1.6 : 1;
    for (let i = 0; i < 4; i++) { const r = (70 + i * 55 + (p.t * 5) % 55) * gros; c.lineWidth = (22 - i * 4) * gros; c.strokeStyle = i % 2 ? PA : JA; c.beginPath(); c.arc(-r * .6, 0, r, -.8, .8); c.stroke() }
    c.restore(); if (p.t < 30) comic(c, 'ROAAAR !', p.x - p.dir * 40, FLOOR + p.y0 - 30, p.t / 60, .5, a, JA);
  }
}
// la foule de la savane : confettis de feuilles et clameur sur les grands moments
const FOULE = { bits: [] };
function acclame(force) {
  sfx('foule', force); const cols = [JA, OR, CY, PA, '#7BD35A', '#FF7AB6']; if (FOULE.bits.length > 400) FOULE.bits.splice(0, FOULE.bits.length - 400);
  const mer = estMer(); // sous la mer, pas de confettis : une gerbe de bulles qui monte
  for (let i = 0; i < 40 * force; i++) FOULE.bits.push(mer ? { bulle: true, x: Math.random() * W, y: H + 20 + Math.random() * 260, vx: (Math.random() - .5) * 2, vy: -(3 + Math.random() * 4), r: 0, vr: 0, s: 6 + Math.random() * 14 }
    : { x: Math.random() * W, y: -40 - Math.random() * 300, vx: (Math.random() - .5) * 4, vy: 3 + Math.random() * 5, r: Math.random() * TAU, vr: (Math.random() - .5) * .3, c: cols[i % cols.length], s: 10 + Math.random() * 14 });
}
function dessineFoule(c) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  for (const b of FOULE.bits) { b.x += b.vx + Math.sin(b.y * .02) * 1.2; b.y += b.vy; b.r += b.vr;
    if (b.bulle) { c.lineWidth = 3; c.strokeStyle = 'rgba(235,250,255,.9)'; c.fillStyle = 'rgba(210,240,255,.22)'; c.beginPath(); c.arc(b.x, b.y, b.s, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(b.x - b.s * .35, b.y - b.s * .35, b.s * .28, 0, TAU); c.fill(); continue }
    c.save(); c.translate(b.x, b.y); c.rotate(b.r); c.fillStyle = b.c; c.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); c.restore() }
  FOULE.bits = FOULE.bits.filter(b => b.bulle ? b.y > -40 : b.y < H + 40);
}
function ko(a, d) {
  setS(d, 'hurt'); d.vy = -15; d.h = Math.max(d.h, .1); d.knock = true; d.vx = a.face * 11; d.stun = 999;
  for (const e of FX) e.mot = null; FX = FX.filter(e => e.k !== 'mot' && e.k !== 'combo');
  G.phase = 'ko'; G.pt = 0; G.slow = 80; acclame(1); G.roundWinner = a; sfx('ko'); sfx('foule'); G.shake = 22; G.stop = 14; vibre([80, 40, 120]);
  G.perfect = a.hp >= a.d.hp; if (G.perfect) a.parfait = true;
}

// ---------------------------------------------------------------------
//  Ordinateur
// ---------------------------------------------------------------------
// Niveaux de l'ordi. aa : anti-aérien contre les sauts · chope : projection (surtout contre la garde)
// tech : se dégager d'une projection · punir : frapper un coup raté
const NIV = [
  { react: 22, garde: .28, agress: .5, spe: .008, saut: .005, combo: .3, aa: .12, chope: .012, tech: .06, punir: .15 },
  { react: 13, garde: .55, agress: .72, spe: .016, saut: .007, combo: .65, aa: .4, chope: .03, tech: .25, punir: .45 },
  { react: 6, garde: .86, agress: .9, spe: .026, saut: .009, combo: 1, aa: .75, chope: .06, tech: .5, punir: .8 }];
// (M6, 25/09) dans l'aventure, la difficulté monte en pente douce d'un duel à l'autre (G.nivDuel, livre.js : 0 → 2) au lieu de 3 marches :
// un niveau « à virgule » mélange les réglages des deux niveaux voisins. Ailleurs : FACILE, NORMAL ou COSTAUD, comme avant.
function nivIA() { const x = G.livre && G.nivDuel != null ? G.nivDuel : G.niv; const i = Math.floor(x), t = x - i; if (!t) return NIV[x];
  const a = NIV[i], b = NIV[Math.min(2, i + 1)], o = {}; for (const k in a) o[k] = a[k] + (b[k] - a[k]) * t; return o }
// coup spécial adapté à la distance (chaque coup dit où il sert : ia = [distance min, max, poids])
function choixSpe(f, dist) {
  let tot = 0; const c = [];
  for (const k of ['S', 'SF', 'SD']) { const m = f.d.moves[k]; if (!m) continue; const z = m.ia || (k === 'S' ? [f.d.speMin || 640, f.d.speMax || 900, 1] : null); if (z && dist >= z[0] && dist <= z[1] && z[2] > 0) { c.push([k, z[2]]); tot += z[2] } }
  if (!c.length) return null; let x = Math.random() * tot; for (const [k, w] of c) { x -= w; if (x <= 0) return k } return c[0][0];
}
// portée de l'ordi (25/09) : jusqu'où ses coups A et B touchent VRAIMENT cet adversaire (boîtes des coups, élan, devant de l'adversaire).
// Avant, la « reach » réglée à la main était trop grande pour 28 animaux : leur ordi tapait dans le vide (pieuvre contre pieuvre : jamais un coup).
// (M6, 25/09) « que tous les duels soient égaux » : dans un Duel du livre, un petit coup de pouce (D.force, livre.js) équilibre la paire
// là où les deux animaux, bien réglés contre tous les autres, ne font pas jeu égal entre eux (mesuré : outils/duel_force.py). Ailleurs : 1.
function forceDuel(f) { const L = G.livre, D = L && L.D; return D && D.force && G.mode === 1 && G.pick.includes(D.a) && G.pick.includes(D.b) ? D.force[f.kind] || 1 : 1 }
function porteeIA(f, o) {
  // (M6, 25/09) la TERRE aussi : l'ordi attaque à la vraie portée de ses coups (avant : autruche, cobra, python, guépard, hyène, T. rex… tapaient dans le vide) — forces refaites (regle2.py)
  const tape = k => { const m = f.d.moves[k]; return m && m.box ? m.box[1] * f.d.K + (m.lunge ? m.lunge * m.act * .6 : 0) : 0 };
  const l = tape('L'), h = tape('H'), coup = l && h ? Math.min(l, h) : Math.max(l, h);
  // (M6) plus de plafond « reach » réglé à la main : contre un grand animal (baleine, hippo, T. rex…), on peut taper de plus loin (orque contre baleine : 0 victoire sur 20 → 5)
  return Math.round(Math.max(f.d.push[1] + o.d.push[1] + 40, coup + o.d.hurt.stand[1] * o.d.K - 20));
}
function brain(f, o) {
  const n0 = nivIA(), ai = f.ai, ag = G.mode === 1 ? G.aide : 0;
  const n = ag ? Object.assign({}, n0, { react: n0.react + 5 * ag, garde: n0.garde * (1 - .3 * ag), agress: n0.agress * (1 - .15 * ag), spe: n0.spe * (1 - .25 * ag), combo: n0.combo * (1 - .3 * ag), aa: n0.aa * (1 - .35 * ag), chope: n0.chope * (1 - .4 * ag), punir: n0.punir * (1 - .35 * ag) }) : n0;
  const r = { left: false, right: false, up: false, down: false, L: false, H: false, S: false };
  if (G.phase !== 'fight') return r;
  const toward = o.x > f.x ? 'right' : 'left', away = toward === 'right' ? 'left' : 'right', dist = Math.abs(o.x - f.x);
  const ia = f.d.ia || {}, mv = f.d.moves, appuie = k => { r[k] = !f.prev[k] };
  const tenirSpe = k => { ai.hold.S = true; if (k === 'SF') ai.hold[toward] = true; if (k === 'SD') ai.hold.down = true };
  // attrapé : il essaie de se dégager (décidé une fois)
  if (f.state === 'tenu') { if (f.t === 2) ai.techGo = Math.random() < n.tech; if (f.t === 4 && ai.techGo) appuie('L'); if (f.d.rodeo && f.t === 7 && f.meter >= 30 && Math.random() < .55) appuie('S'); return r }
  // les bêtes qui volent : un 2e battement d'ailes de temps en temps (en redescendant)
  if (f.state === 'air' && f.d.vole && !f.battu && f.vy > 0 && Math.random() < .07) appuie('up');
  // étourdi : il tapote partout pour se réveiller
  if (f.state === 'dizzy') { if (Math.random() < .22) appuie(Math.random() < .5 ? 'L' : 'H'); return r }
  // 2D : en plein saut contre un animal qui vole, il frappe dès qu'il est à portée (sinon, sauter ne servait à rien)
  if (f.state === 'air' && !f.airAtk && vol2d(o) && mv.A && Math.abs(o.x - f.x) < porteeIA(f, o) + 60 && o.h - f.h < 280 && o.h - f.h > -140 && Math.random() < .35) { appuie(Math.random() < .5 ? 'L' : 'H'); return r }
  // combo : si le coup a touché, on enchaîne
  if (f.state === 'atk' && f.hit && Math.random() < n.combo * .25) { const m = f.move; const nx = m.chain && m.chain[Math.floor(Math.random() * m.chain.length)]; if (nx === 'SUPER' && f.meter < 100) return r;
    if (nx) { const b = nx === 'cL' ? 'L' : nx === 'cH' ? 'H' : nx === 'SUPER' ? 'S' : nx; appuie(b); if (nx === 'cL' || nx === 'cH') r.down = true; if (nx === 'S' && Math.random() < .4) { const k = choixSpe(f, dist); if (k === 'SF') r[toward] = true; else if (k === 'SD') r.down = true } } return r }
  // anti-aérien : décidé une fois par saut, déclenché quand l'autre redescend à portée
  const v2 = vol2d(f), dz = o.h - f.h;
  const enLair = o.h - (v2 ? f.h : 0) > 40 && (o.state === 'air' || (o.state === 'atk' && o.h > 40));
  if (enLair && ai.aaFor !== o.sautN) { ai.aaFor = o.sautN; ai.aaGo = Math.random() < n.aa }
  if (enLair && ai.aaGo && neutral(f) && dist < (ia.aaDist || 600) && o.vy > -9) {
    ai.aaGo = false; ai.hold = {}; ai.t = 0;
    if (mv.SD && mv.SD.aa && f.meter < 100) { r.down = true; appuie('S') } else appuie('H');
    return r;
  }
  const danger = (o.state === 'atk' && o.ph !== 'rec' && !o.move.prise && dist < (SPECIALES.includes(o.mk) ? 1000 : 720)) || G.proj.some(p => p.a === o && Math.abs(p.x - f.x) < 700);
  // se protéger, comme l'enfant : vers le bas pare tout (parfois en reculant). Décidé une fois par menace, puis tenu tant qu'elle dure
  if (danger && ai.react <= 0 && !ai.def) { ai.def = true; ai.hold = {}; ai.t = 0; ai.react = n.react * .6;
    ai.garde = Math.random() < n.garde ? (v2 && (f.alt || 0) > 0 ? away : Math.random() < .7 || (o.move && o.move.lvl === 'low') ? 'down' : away) : null }
  if (!danger) { ai.def = false; ai.garde = null }
  if (ai.def && ai.garde) { r[ai.garde] = true; return r }
  if (f.d.respire && (f.air || 0) >= AIR_T && neutral(f) && (v2 ? f.h < altMax(f) - 40 : f.h <= 0 && Math.random() < .04)) { r.up = true; return r } // l'orque remonte respirer (en 2D : jusqu'à la surface) — après la garde : menacée, elle se protège d'abord
  if (ai.react > 0) ai.react--;
  // punir un coup raté (décidé une fois par coup de l'adversaire)
  if (o.state === 'atk' && o.ph === 'rec' && !o.hit && ai.punFor !== o.mvN) { ai.punFor = o.mvN; ai.punGo = Math.random() < n.punir }
  if (ai.punGo && o.state === 'atk' && o.ph === 'rec' && neutral(f)) {
    const reach = porteeIA(f, o);
    if (dist < reach + 40) { ai.punGo = false; ai.hold = {}; ai.t = 0; if (f.meter >= 100) appuie('S'); else appuie('H'); return r }
    if (mv.SF && mv.SF.rush && dist < reach + 420) { ai.punGo = false; ai.hold = {}; ai.t = 0; r[toward] = true; appuie('S'); return r }
  }
  // projection : surtout contre quelqu'un qui reste en garde
  if (neutral(f) && mv.T && portee(f, o, 55) && attrapable(o)) {
    const garde = ['block', 'cblock', 'crouch'].includes(o.state);
    if (Math.random() < n.chope * (garde ? 5 : 1) * (ia.chope || 1)) { ai.hold = {}; ai.t = 0; r[toward] = true; appuie('H'); return r }
  }
  // 2D : un animal au sol contre un animal qui vole au-dessus de lui → saut ou anti-aérien ; tout là-haut, il l'attend (il ne tape pas dans le vide)
  const reach = porteeIA(f, o);
  if (!v2 && vol2d(o) && neutral(f) && o.h > 140 && dist < reach + 160) {
    if (Math.random() < n.aa * .06) { ai.hold = {}; ai.t = 0; if (mv.SD && mv.SD.aa && f.meter < 100 && Math.random() < .6) { r.down = true; appuie('S') } else { r.up = true; if (dist > reach * .5) r[toward] = true } return r }
    if (o.h > 230 && dist < reach && ai.t <= 0) { ai.hold = Math.random() < .3 ? { [away]: true } : {}; ai.t = 6 + Math.round(Math.random() * 8) }
  }
  const pasDeVise = () => r.L || r.H || r.S; // (2D : on ne monte ni ne descend en appuyant sur un coup : ↓ ★ serait pris pour l'anti-aérien)
  if (ai.t > 0) { ai.t--; Object.assign(r, ai.hold); if (v2 && ai.vise && neutral(f) && !pasDeVise()) { r.up = ai.vise > 0; r.down = ai.vise < 0 } for (const k of ['L', 'H', 'S']) if (r[k] && f.prev[k]) r[k] = false; return r }
  ai.hold = {};
  if (!neutral(f)) { ai.t = 2; return r }
  // 2D : l'ordi se place à la hauteur de l'adversaire. De loin, contre un animal qui marche, il survole (plus haut), puis il pique pour attaquer ;
  // de près, il vise un peu au hasard, et parfois reste au-dessus pour plonger.
  if (v2) { const loin = dist > reach + 160;
    if (!ai.cibleT || G.frame > ai.cibleT || ai.loin !== loin) { ai.loin = loin; ai.cibleT = G.frame + 40 + Math.random() * 50;
      ai.decal = loin ? (vol2d(o) ? (Math.random() - .5) * 260 : 110 + Math.random() * 150) : (Math.random() - .5) * 100 + (Math.random() < .2 ? 90 : 0) }
    const but = cl(o.h + ai.decal, 0, altMax(f)), e = but - (f.alt || 0); ai.vise = Math.abs(e) > 35 ? Math.sign(e) : 0 } else ai.vise = 0
  const rnd = Math.random();
  if (f.meter >= 100 && dist < 700 && Math.random() < .35) { ai.hold.S = true; ai.t = 2; }
  else if (v2 && dist < reach + 60 && Math.abs(dz) >= 150) { ai.t = 4; if (dist < reach * .6) ai.hold[away] = true } // 2D : trop haut ou trop bas : il se met d'abord à sa hauteur
  else if (dist < reach && (!v2 || Math.abs(dz) < 150)) {
    if (rnd < n.agress) { const p = Math.random();
      if (p < .34) ai.hold.L = true; else if (p < .48) { ai.hold.L = true; ai.hold.down = true }
      else if (p < .58 && mv.cH) { ai.hold.H = true; ai.hold.down = true } else if (p < .82) ai.hold.H = true;
      else { const k = choixSpe(f, dist); if (k) tenirSpe(k); else ai.hold.H = true }
      ai.t = 2; ai.react = n.react }
    else if (rnd < n.agress + .15) { ai.hold[away] = true; ai.t = n.react }
    else ai.t = Math.round(n.react * .5);
  } else {
    const k = choixSpe(f, dist);
    if (k && Math.random() < n.spe * 6 * (ia.spe || 1)) { tenirSpe(k); ai.t = 2 }
    else if (Math.random() < n.saut * 4 * (ia.saut || 1)) { ai.hold.up = true; ai.hold[toward] = true; ai.t = 5 }
    else if (ia.loin && dist < ia.loin && Math.random() < .45) { ai.hold[away] = true; ai.t = n.react } // les animaux « à distance » gardent leurs distances
    else { ai.hold[toward] = true; ai.t = Math.round(n.react * .8 + Math.random() * 10) }
  }
  Object.assign(r, ai.hold); if (v2 && ai.vise && neutral(f) && !pasDeVise()) { r.up = ai.vise > 0; r.down = ai.vise < 0 }
  // l'IA relâche les boutons pour qu'un nouvel appui soit détecté
  for (const k of ['L', 'H', 'S']) if (r[k] && f.prev[k]) r[k] = false;
  return r;
}

// ---------------------------------------------------------------------
//  Effets (canvas 2D, repère monde)
// ---------------------------------------------------------------------
let FX = [];
function addFx(e) { if (e.k === 'poussiere' && estMer() && !e.sansBulles) addFx({ k: 'bulles', x: e.x, y: e.y - 40, n: 6 }); e.t0 = G.time; FX.push(e); if (FX.length > 300) FX.splice(0, FX.length - 300); if (window.NET && NET.on && NET.role === 'hote') { const c = Object.assign({}, e); delete c.t0; NET.fx.push(c) } }
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
function star(c, x, y, R, r, n, col, stroke = NV, lw = 8) { c.beginPath(); for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r : R * (.85 + ((i * 7) % 5) * .06), a = i / (n * 2) * TAU; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) } c.closePath(); c.fillStyle = col; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.stroke() } }
function txt(c, s, x, y, size, fill, o = {}) {
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.sc != null) c.scale(o.sc, o.sc);
  c.font = `${o.w || 900} ${size}px ${o.f || 'Rubik, "Arial Black", sans-serif'}`; c.textAlign = o.al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (o.out) { c.lineWidth = o.out; c.strokeStyle = o.oc || NV; if (o.sh) c.strokeText(s, o.sh, o.sh); c.strokeText(s, 0, 0) }
  c.fillStyle = fill; c.fillText(s, 0, 0); c.restore();
}
function drawFx(c) {
  const t = G.time; FX = FX.filter(e => t - e.t0 < 1.4);
  for (const e of FX) {
    const u = (t - e.t0);
    if (e.k === 'impact') {
      const k = P(u, 0, .45); if (k >= 1) continue; const s = back(P(u, 0, .12)) * e.size, a = 1 - P(u, .28, .45);
      c.save(); c.globalAlpha = a; c.translate(e.x, e.y); c.rotate(e.t0 * 7); c.scale(s, s);
      star(c, 0, 0, 150, 60, 12, JA); star(c, 0, 0, 90, 40, 9, e.col || OR, NV, 0);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 32, 0, TAU); c.fill(); c.restore();
      // éclats
      const r = rng(Math.floor(e.t0 * 1000)); c.save(); c.globalAlpha = a; c.strokeStyle = PA; c.lineCap = 'round';
      for (let i = 0; i < 9; i++) { const ang = r() * TAU, d0 = 60 + 260 * eo(k), l = 40 + r() * 60; c.lineWidth = 8 * (1 - k) + 2; c.beginPath(); c.moveTo(e.x + Math.cos(ang) * d0, e.y + Math.sin(ang) * d0); c.lineTo(e.x + Math.cos(ang) * (d0 + l), e.y + Math.sin(ang) * (d0 + l)); c.stroke() }
      c.restore();
      if (e.mot) comic(c, e.mot, e.x, e.y - 150 * e.size, u, e.size * .75, a);
    } else if (e.k === 'garde') {
      const k = P(u, 0, .3); if (k >= 1) continue; c.save(); c.globalAlpha = 1 - k; c.translate(e.x, e.y);
      c.strokeStyle = CY; c.lineWidth = 22; c.beginPath(); c.arc(0, 0, 70 + 70 * eo(k), -1.25, 1.25); c.stroke(); c.strokeStyle = PA; c.lineWidth = 6; c.stroke(); c.restore();
      comic(c, 'GARDE !', e.x, e.y - 130, u, .55, 1 - k, CY);
    } else if (e.k === 'etincelles') { const k = P(u, 0, .5); if (k >= 1) continue; const r = rng(Math.floor(e.t0 * 1000) + 3); c.save(); c.globalAlpha = 1 - k; c.strokeStyle = '#FFF27A'; c.lineCap = 'round'; c.lineJoin = 'round';
      for (let i = 0; i < 7; i++) { const a0 = r() * TAU, d0 = 30 + 140 * eo(k); let x = e.x + Math.cos(a0) * d0, y = e.y + Math.sin(a0) * d0; c.lineWidth = 7 * (1 - k) + 2; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 3; j++) { x += Math.cos(a0) * 26 + (r() - .5) * 30; y += Math.sin(a0) * 26 + (r() - .5) * 30; c.lineTo(x, y) } c.stroke() } c.restore();
    } else if (e.k === 'bulles') { // des bulles qui montent en zigzag
      const k = P(u, 0, 1.3); if (k >= 1) continue; const r = rng(Math.floor(e.t0 * 1000) + 7); c.save(); c.lineWidth = 3;
      for (let i = 0; i < (e.n || 8); i++) { const d = r(), px = e.x + (r() - .5) * (e.w || 140) + Math.sin(u * 7 + i) * 12, py = e.y - (180 + d * 260) * k - r() * 30, rad = 4 + r() * 10;
        c.globalAlpha = (1 - k) * .9; c.strokeStyle = 'rgba(235,250,255,.95)'; c.fillStyle = 'rgba(210,240,255,.25)'; c.beginPath(); c.arc(px, py, rad, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(px - rad * .35, py - rad * .35, rad * .3, 0, TAU); c.fill() } c.restore();
    } else if (e.k === 'poussiere') {
      const k = P(u, 0, .8); if (k >= 1) continue; const r = rng(Math.floor(e.t0 * 1000));
      for (let i = 0; i < 9; i++) { const dir = (r() - .5) * 2, sp = 60 + r() * 170, px = e.x + dir * sp * eo(k), py = e.y - 10 - r() * 60 * eo(k), rad = (20 + r() * 30) * (.5 + k);
        c.globalAlpha = (1 - k) * .85; c.fillStyle = POUSSIERE[G.arene] || '#F2D7A8'; c.beginPath(); c.arc(px, py, rad, 0, TAU); c.fill() } c.globalAlpha = 1;
    } else if (e.k === 'onde') {
      const k = P(u, 0, .7); if (k >= 1) continue; c.save(); c.globalAlpha = 1 - k; c.strokeStyle = JA; c.lineWidth = 16 * (1 - k) + 3;
      for (const s of [-1, 1]) { c.beginPath(); c.ellipse(e.x, e.y, 60 + 900 * eo(k), 30 + 60 * eo(k), 0, s < 0 ? Math.PI : 0, s < 0 ? TAU : Math.PI, false); c.stroke() } c.restore();
    } else if (e.k === 'mot') { const k = P(u, 0, .9); if (k < 1) comic(c, e.mot, e.x, e.y, u, .55, 1 - P(k, .6, 1), e.col || PA) }
    else if (e.k === 'vague') { const k = P(u, 0, .6); if (k >= 1) continue; c.save(); c.globalAlpha = (1 - k) * .9; c.strokeStyle = '#BFE9FF'; c.lineWidth = 10;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(e.x, e.y - 6); c.quadraticCurveTo(e.x + s * 60 * (1 + k), e.y - 30, e.x + s * 140 * (1 + k), e.y - 8); c.stroke() }
      c.fillStyle = '#E8F7FF'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(e.x + (i - 1.5) * 40, e.y - 20 - k * 60 - i * 8, 10 - i, 0, TAU); c.fill() } c.restore() }
    else if (e.k === 'eclabousse') { const s = e.s || 1, k = P(u, 0, .9 * Math.sqrt(s)); if (k >= 1) continue; const r = rng(Math.floor(e.t0 * 997)); c.save(); c.globalAlpha = 1 - k;
      for (let i = 0, n = Math.round(16 * Math.min(1.4, s)); i < n; i++) { const ang = -Math.PI * (.1 + .8 * r()), sp = (200 + r() * 420) * s, px = e.x + Math.cos(ang) * sp * eo(k), py = e.y + Math.sin(ang) * sp * eo(k) + 600 * k * k;
        c.fillStyle = e.boue ? (i % 2 ? '#8A6A43' : '#B89468') : i % 2 ? '#7FD0F5' : '#E8F7FF'; c.beginPath(); c.arc(px, py, (14 + r() * 20) * (.55 + .45 * Math.min(1.4, s)), 0, TAU); c.fill() } c.restore() }
    else if (e.k === 'tache') { const k = P(u, 0, 1.3); if (k >= 1) continue; c.save(); c.globalAlpha = (1 - P(k, .6, 1)) * .9; c.fillStyle = '#5A3A1C';
      c.beginPath(); c.ellipse(e.x, e.y, e.r * 1.6, e.r * .35, 0, 0, TAU); c.fill(); c.restore() }
    else if (e.k === 'griffes') { // marques de griffes
      const k = P(u, 0, .35); if (k >= 1) continue; c.save(); c.translate(e.x, e.y); c.scale(e.dir || 1, 1); c.rotate(-.5); c.lineCap = 'round';
      for (let i = 0; i < (e.n || 3); i++) { const d = (i - 1) * 34, l = 170 * eo(Math.min(1, k * 2.2)); c.globalAlpha = 1 - P(k, .5, 1);
        c.strokeStyle = NV; c.lineWidth = 16; c.beginPath(); c.moveTo(-l / 2, d); c.quadraticCurveTo(0, d - 26, l / 2, d); c.stroke();
        c.strokeStyle = i % 2 ? '#FFF1B8' : '#fff'; c.lineWidth = 8; c.stroke() } c.restore() }
    else if (e.k === 'clan') { if (u >= 1.3) continue; clan(c, e, u) }
    else if (e.k === 'chaleur') { const k = P(u, 0, .6); if (k >= 1) continue; c.save(); c.globalAlpha = (1 - k) * .8; c.lineCap = 'round'; // ondes de chaleur (rouge → jaune)
      for (let i = 0; i < 3; i++) { const r = 40 + 190 * k + i * 36; c.lineWidth = 10 - i * 2; c.strokeStyle = ['#FF4A2E', '#FF9A2E', '#FFE14A'][i]; c.beginPath(); c.arc(e.x, e.y, r, e.dir > 0 ? -.7 : Math.PI - .7, e.dir > 0 ? .7 : Math.PI + .7); c.stroke() } c.restore() }
    else if (e.k === 'geyser') { const k = P(u, 0, 1.1); if (k >= 1) continue; c.save(); c.globalAlpha = 1 - P(k, .6, 1); const hh = 1100 * eo(Math.min(1, k * 2.4)), w = 70 + 40 * Math.sin(u * 30); // baleine : le souffle de 9 m
      const g = c.createLinearGradient(0, e.y - hh, 0, e.y); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(.3, 'rgba(235,248,255,.9)'); g.addColorStop(1, 'rgba(190,233,255,.85)');
      c.fillStyle = g; c.beginPath(); c.moveTo(e.x - w * .4, e.y); c.quadraticCurveTo(e.x - w, e.y - hh * .6, e.x - w * 1.8, e.y - hh); c.lineTo(e.x + w * 1.8, e.y - hh); c.quadraticCurveTo(e.x + w, e.y - hh * .6, e.x + w * .4, e.y); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(e.x + Math.sin(i * 2.1 + u * 9) * w * 1.6, e.y - hh + Math.cos(i * 1.7) * 60, 16 + i % 3 * 8, 0, TAU); c.fill() } c.restore() }
    else if (e.k === 'aspire') { const k = P(u, 0, .5); if (k >= 1) continue; c.save(); c.globalAlpha = .75 * (1 - k); c.strokeStyle = '#E8F7FF'; c.lineWidth = 7; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const s = (k + i * .25) % 1, x = e.x + (e.x2 - e.x) * s, y = e.y + (i - 1.5) * 50 * (1 - s) + (e.y2 - e.y) * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (e.x2 - e.x) * .12, y + (e.y2 - e.y) * .12); c.stroke() } c.restore() }
    else if (e.k === 'saumon') { // le saumon qui vole (grizzly : la patte à saumons)
      const k = P(u, 0, 1.35); if (k >= 1) continue; const tt = u * 60;
      poisson(c, e.x + e.vx * tt, e.y + e.vy * tt + .5 * 1.1 * tt * tt, u * 14 * (e.dir || 1), 1.3) }
    else if (e.k === 'glace') { // éclats de glace
      const k = P(u, 0, .8); if (k >= 1) continue; const r = rng(Math.floor(e.t0 * 991)); c.save(); c.globalAlpha = 1 - k;
      for (let i = 0; i < 12; i++) { const a = -Math.PI * (.05 + .9 * r()), sp = 180 + r() * 380, px = e.x + Math.cos(a) * sp * eo(k), py = e.y + Math.sin(a) * sp * eo(k) + 420 * k * k, s2 = 12 + r() * 18;
        c.save(); c.translate(px, py); c.rotate(k * 8 + i); c.fillStyle = i % 3 ? '#DFF6FF' : '#9ADCFF'; c.strokeStyle = '#2E8FC7'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -s2); c.lineTo(s2 * .7, 0); c.lineTo(0, s2); c.lineTo(-s2 * .6, 0); c.closePath(); c.fill(); c.stroke(); c.restore() } c.restore() }
    else if (e.k === 'bulle') { const k = P(u, 0, 1); if (k >= 1) continue; c.save(); c.globalAlpha = 1 - k; c.strokeStyle = '#4E9A2E'; c.fillStyle = 'rgba(123,211,90,.55)'; c.lineWidth = 5;
      c.beginPath(); c.arc(e.x, e.y - 120 * k, 16 + 10 * k, 0, TAU); c.fill(); c.stroke(); c.restore() }
  }
}
function comic(c, word, x, y, u, size = 1, alpha = 1, col = PA) {
  const s = back(P(u, 0, .16)) * size; if (s <= 0) return;
  c.save(); c.globalAlpha = Math.max(0, alpha); c.translate(x, y); c.rotate(-.1); c.scale(s, s);
  c.font = '900 92px Rubik, "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = 22; c.strokeStyle = NV; c.strokeText(word, 6, 8); c.strokeText(word, 0, 0); c.fillStyle = col; c.fillText(word, 0, 0); c.restore();
}

// ---------------------------------------------------------------------
//  Caméra
// ---------------------------------------------------------------------
const cam = { z: 1, cx: 960, cy: 540, ox: 0, oy: 0 };
function updateCam() {
  const [a, b] = G.f; let mid = (a.x + b.x) / 2, d = Math.abs(a.x - b.x);
  let z = cl(1900 / (d + 1050), 1, 1.16); if (G.f.some(f => f.h > 90 && !f.cache && !f.ciel)) z = 1; // 2D : en vol, on voit tout le ciel
  if (G.freeze > 0 && G.superBy) { z = 1.3; mid = G.superBy.x + G.superBy.face * 120 }
  cam.z += (z - cam.z) * .12;
  const half = 960 / cam.z; let cx = cl(mid, half, W - half);
  cam.cx += (cx - cam.cx) * .15; cam.cy = FLOOR - 410 / cam.z - (G.freeze > 0 ? 80 : 0) / cam.z;
  const s = G.shake; cam.ox = (Math.random() - .5) * s * 1.4; cam.oy = (Math.random() - .5) * s;
}
function worldT(c) { c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2 + cam.ox, H / 2 + cam.oy); c.scale(cam.z, cam.z); c.translate(-cam.cx, -cam.cy) }

// ---------------------------------------------------------------------
//  Interface de combat
// ---------------------------------------------------------------------
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r) }
// (M7, 25/09) lisible sur téléphone : le canevas fait 1 920 px de large, le cadre ~576 px sur un iPhone (× 0,3) → les petits textes du haut
// (nom, TOI / ORDI, SUPER, MANCHE) ne descendent plus sous 12 à 14 px réels ; sur tablette et ordinateur, rien ne change.
const hudPx = (px, mini) => Math.max(px, mini * W / Math.max(300, fxC.clientWidth || W));
function hud(c) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  for (const f of G.f) {
    const s = f.side, x0 = s ? 1080 : 140, w = 700, y = 52, h = 44;
    f.shown += (f.hp - f.shown) * .35; if (f.trail > f.shown) f.trail -= Math.max(.2, (f.trail - f.shown) * .035); else f.trail = f.shown;
    rr(c, x0 - 8, y - 8, w + 16, h + 16, 16); c.fillStyle = NV; c.fill();
    c.save(); rr(c, x0, y, w, h, 10); c.clip(); c.fillStyle = '#2A1636'; c.fillRect(x0, y, w, h);
    const tw = w * f.trail / f.d.hp, sw = w * f.shown / f.d.hp;
    c.fillStyle = '#FFF1B8'; s ? c.fillRect(x0, y, tw, h) : c.fillRect(x0 + w - tw, y, tw, h);
    const g = c.createLinearGradient(0, y, 0, y + h); const low = f.hp / f.d.hp < .25 && Math.sin(G.time * 12) > 0;
    g.addColorStop(0, low ? '#FF6B5A' : f.d.clair); g.addColorStop(1, low ? '#C6281A' : f.d.col);
    c.fillStyle = g; s ? c.fillRect(x0, y, sw, h) : c.fillRect(x0 + w - sw, y, sw, h);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x0, y + 5, w, 8); c.restore();
    c.lineWidth = 5; c.strokeStyle = PA; rr(c, x0, y, w, h, 10); c.stroke();
    // portrait
    const px = s ? x0 + w + 70 : x0 - 70, py = y + 24;
    c.save(); c.beginPath(); c.arc(px, py, 62, 0, TAU); c.fillStyle = f.d.fond; c.fill(); c.clip();
    const img = G.heads[f.kind]; c.translate(px, py); c.scale(s ? -1 : 1, 1); c.drawImage(img, -70, -70, 140, 140); c.restore();
    c.lineWidth = 7; c.strokeStyle = champion(f.kind) ? '#FFC629' : PA; c.beginPath(); c.arc(px, py, 62, 0, TAU); c.stroke(); if (champion(f.kind)) { c.lineWidth = 3; c.strokeStyle = '#7A3E00'; c.beginPath(); c.arc(px, py, 67, 0, TAU); c.stroke() }
    // nom + étiquette + manches
    txt(c, f.nomAff || f.d.nom, s ? x0 + w - 4 : x0 + 4, y + h + 36, (f.nomAff || f.d.nom).length > 13 ? hudPx(32, 12) : hudPx(40, 14), PA, { al: s ? 'right' : 'left', out: 10 });
    // TOI / ORDI : sous le portrait (au-dessus de la barre, il n'y avait la place que pour 7 px sur iPhone)
    const qui = NET.on ? (s === NET.moi ? 'TOI' : 'AMI') : G.mode === 1 ? (f.cpu ? 'ORDI' : G.god ? '⚡ GOD' : 'TOI') : (s ? 'J2' : 'J1');
    const tq = hudPx(24, 12); c.font = `900 ${tq}px Rubik, "Arial Black", sans-serif`; const lw = c.measureText(qui).width + 26, lh = tq + 10, lx = Math.max(4, Math.min(W - 4 - lw, px - lw / 2)), ly = py + 66;
    rr(c, lx, ly, lw, lh, 10); c.fillStyle = f.cpu ? VI : (s ? BL : OR); c.fill(); c.lineWidth = 3; c.strokeStyle = PA; c.stroke(); txt(c, qui, lx + lw / 2, ly + lh / 2 + 1, tq, PA);
    for (let i = 0; i < 2; i++) { const sx = s ? x0 + 30 + i * 46 : x0 + w - 30 - i * 46; star(c, sx, y + h + 32, 18, 8, 5, i < f.wins ? JA : 'rgba(255,255,255,.2)', NV, 4) }
    // jauge de SUPER (sous le nom)
    const mw = 330, mx = s ? x0 + w - mw : x0, my = y + h + 70, full = f.meter >= 100;
    rr(c, mx - 5, my - 5, mw + 10, 28, 10); c.fillStyle = NV; c.fill();
    if (f.meter > 0) { rr(c, mx, my, Math.max(16, mw * f.meter / 100), 18, 7); c.fillStyle = full ? (Math.sin(G.time * 14) > 0 ? JA : '#FFE8A0') : CY; c.fill(); }
    c.lineWidth = 3; c.strokeStyle = PA; rr(c, mx, my, mw, 18, 7); c.stroke();
    txt(c, full ? '★ SUPER !' : 'SUPER', s ? mx - 14 : mx + mw + 14, my + 9, full ? hudPx(30, 14) : hudPx(22, 12), full ? JA : PA, { al: s ? 'right' : 'left', out: 8 });
  }
  // chrono
  c.beginPath(); c.arc(960, 80, 66, 0, TAU); c.fillStyle = NV; c.fill(); c.lineWidth = 7; c.strokeStyle = PA; c.stroke();
  const sec = Math.max(0, Math.ceil(G.timer / 60)); txt(c, String(sec), 960, 84, 66, sec <= 10 && G.phase === 'fight' && Math.sin(G.time * 10) > 0 ? '#FF6B4A' : JA);
  txt(c, 'MANCHE ' + G.round, 960, 174, hudPx(26, 12), PA, { out: 8 });
  // combos
  for (const e of FX) if (e.k === 'combo') { const u = G.time - e.t0; if (u < 1) txt(c, e.n + ' COUPS !', e.side ? 1620 : 300, 250, 60, JA, { out: 14, sc: back(P(u, 0, .15)), rot: e.side ? .05 : -.05 }) }
}
function annonce(c) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  const ph = G.phase, k = G.pt;
  const big = (s, col, t0, size = 200, y = 470) => { const u = back(P(k, t0, t0 + 12)); if (u > 0) txt(c, s, 960, y, size, col, { out: 32, sh: 16, sc: u, rot: -.03 }) };
  if (ph === 'intro') {
    // 📖 un champion du livre entre dans l'arène (1re manche)
    if (G.round === 1 && k < 70) { const ch = G.f.filter(f => champion(f.kind)); if (ch.length) { const a = Math.min(1, P(k, 2, 12), 1 - P(k, 58, 68)); c.globalAlpha = a; c.fillStyle = 'rgba(58,30,0,.6)'; c.fillRect(0, 262, W, 136); txt(c, ch.length === 2 ? '★ DEUX CHAMPIONS DU LIVRE ★' : `★ ${ch[0].d.art} : CHAMPION DU LIVRE ★`, 960, 332, ch.length === 2 || ch[0].d.art.length > 12 ? 56 : 66, '#FFD84A', { out: 14, sc: back(P(k, 2, 14)) }); c.globalAlpha = 1 } }
    if (k > 70 && k < 150) { c.fillStyle = 'rgba(11,42,91,.55)'; c.fillRect(0, 370, W, 200 * eo(P(k, 70, 80))); big(G.round === 3 ? 'MANCHE DÉCISIVE' : 'MANCHE ' + G.round, PA, 72, G.round === 3 ? 150 : 190) }
    if (k >= 150) big('BAGARRE !', JA, 150, 230);
    // une astuce différente à chaque manche : se protéger, le SUPER, le combo final
    if (G.round <= 3 && k > 20 && k < 175 && !G.f[0].cpu) { const a = Math.min(1, P(k, 20, 32), 1 - P(k, 165, 175)); c.globalAlpha = a;
      const tact = document.body.classList.contains('tactile');
      const astuce = G.round === 1 ? (tact ? 'ASTUCE : tire le joystick VERS LE BAS pour te protéger !' : 'ASTUCE : BAS (S ou flèche) pour te protéger !')
        : G.round === 2 ? (tact ? 'ASTUCE : jauge SUPER pleine ? Appuie sur ★ SUPER !' : 'ASTUCE : jauge SUPER pleine ? Appuie sur H pour le SUPER !')
        : (tact ? 'ASTUCE : tape 3 fois A de suite pour un COMBO FINAL !' : 'ASTUCE : tape 3 fois F de suite pour un COMBO FINAL !');
      txt(c, astuce, 960, 700, 44, PA, { out: 12 }); c.globalAlpha = 1 }
  }
  if (ph === 'ko') {
    if (k < 120) big(G.timeUp ? 'TEMPS !' : 'K.O. !', G.timeUp ? JA : '#FF6B4A', 0, G.timeUp ? 200 : 280);
    else { const v = G.roundWinner; big(v ? v.d.art + ' GAGNE LA MANCHE' : 'ÉGALITÉ !', v ? v.d.clair : PA, 120, v ? (v.d.art.length > 10 ? 76 : 88) : 170); if (G.perfect && v) big('PARFAIT !', JA, 140, 110, 600) }
  }
  if (G.freeze > 0 && G.superBy) {
    const f = G.superBy, u = P(34 - G.freeze, 0, 8);
    txt(c, f.move.nom.toUpperCase().replace(/\s*!?\s*$/, '') + ' !', 960, 900, 86, JA, { out: 20, sh: 10, sc: back(u) }); // un seul « ! », même si le nom en a déjà un
  }
}

// ---------------------------------------------------------------------
//  Rendu
// ---------------------------------------------------------------------
// ambiance animée des nouvelles arènes : étoiles et lucioles (savane de nuit), mouettes (plage d'Alaska), neige (forêt russe), braises et lave (volcan)
const AMB = {};
const hasardN = (n, f) => Array.from({ length: n }, f);
function ambianceFond(c, t) {
  if (estMer()) ambianceMerFond(c, t);
  if (G.arene === 'nuit') { const E = AMB.etoiles || (AMB.etoiles = hasardN(48, () => [Math.random() * W, Math.random() * H * .36, 1.2 + Math.random() * 2.4, Math.random() * TAU]));
    c.fillStyle = '#FFF7D6'; for (const [x, y, r, p] of E) { c.globalAlpha = .3 + .7 * Math.abs(Math.sin(t * 1.3 + p)); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill() } c.globalAlpha = 1 }
  if (G.arene === 'volcan') { const g = c.createLinearGradient(0, H * .6, 0, H + 20); g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, `rgba(255,110,30,${.18 + .1 * Math.sin(t * 2.2)})`); c.fillStyle = g; c.fillRect(-60, H * .6, W + 120, H * .42) }
}
function ambianceMerFond(c, t) { // rayons de soleil qui ondulent depuis la surface, et un banc de poissons au loin
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const x = (i + .5) * W / 6 + Math.sin(t * .35 + i * 1.7) * 90, w = 80 + 40 * Math.sin(t * .5 + i), a = .045 + .03 * Math.sin(t * .8 + i * 2.1);
    const g = c.createLinearGradient(0, 0, 0, H * .95); g.addColorStop(0, `rgba(210,245,255,${a * 1.8})`); g.addColorStop(1, 'rgba(210,245,255,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - w * .4, -30); c.lineTo(x + w * .4, -30); c.lineTo(x + w * 1.3 + 160, H * .95); c.lineTo(x - w * .3 + 160, H * .95); c.closePath(); c.fill() }
  c.restore();
  const B = AMB.banc || (AMB.banc = hasardN(9, (_, i) => [i * 38 + Math.random() * 30, (Math.random() - .5) * 60, .8 + Math.random() * .4])), cyc = 38, u = (t % cyc) / cyc, x0 = -300 + u * (W + 900), y0 = H * .3 + Math.sin(t * .4) * 40;
  c.save(); c.globalAlpha = .35; for (const [dx, dy, s] of B) poisson(c, x0 - dx * 2, y0 + dy + Math.sin(t * 3 + dx) * 6, 0, .28 * s); c.restore();
}
function ambianceMer(c, t) { // bulles qui montent et petites particules qui flottent
  const B = AMB.bulles || (AMB.bulles = hasardN(24, () => [Math.random() * W, Math.random() * H, 3 + Math.random() * 7, .5 + Math.random() * 1.3, Math.random() * TAU]));
  c.save(); c.lineWidth = 2.5;
  for (const b of B) { b[1] -= b[3]; b[0] += Math.sin(t * 2 + b[4]) * .6; if (b[1] < -20) { b[1] = H + 20; b[0] = Math.random() * W }
    c.strokeStyle = 'rgba(235,250,255,.7)'; c.fillStyle = 'rgba(220,245,255,.16)'; c.beginPath(); c.arc(b[0], b[1], b[2], 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(b[0] - b[2] * .35, b[1] - b[2] * .35, b[2] * .28, 0, TAU); c.fill() }
  const Q = AMB.plancton || (AMB.plancton = hasardN(40, () => [Math.random() * W, Math.random() * H, 1 + Math.random() * 2.2, Math.random() * TAU]));
  c.fillStyle = 'rgba(240,250,230,.5)'; for (const q of Q) { const x = (q[0] + t * 9) % W, y = q[1] + Math.sin(t * .8 + q[3]) * 14; c.beginPath(); c.arc(x, y, q[2], 0, TAU); c.fill() }
  c.restore();
}
function ambiance(c, t) {
  if (estMer()) ambianceMer(c, t);
  if (G.arene === 'abysses') { const P = AMB.lumieres || (AMB.lumieres = hasardN(46, () => [Math.random() * W, Math.random() * H, 1.5 + Math.random() * 3.5, Math.random() * TAU, Math.random() < .3]));
    for (const q of P) { q[1] -= .25; q[0] += Math.sin(t * .6 + q[3]) * .4; if (q[1] < -10) { q[1] = H + 10; q[0] = Math.random() * W } const a = .35 + .65 * Math.abs(Math.sin(t * 1.3 + q[3]));
      c.fillStyle = q[4] ? `rgba(120,255,230,${a * .25})` : `rgba(140,190,255,${a * .22})`; c.beginPath(); c.arc(q[0], q[1], q[2] * 4, 0, TAU); c.fill(); c.fillStyle = q[4] ? `rgba(160,255,235,${a})` : `rgba(190,215,255,${a})`; c.beginPath(); c.arc(q[0], q[1], q[2], 0, TAU); c.fill() } }
  if (G.arene === 'lune') { const E = AMB.etoiles || (AMB.etoiles = hasardN(60, () => [Math.random() * W, Math.random() * H * .45, 1 + Math.random() * 2.2, Math.random() * TAU]));
    for (const e of E) { const a = .3 + .7 * Math.abs(Math.sin(t * 1.7 + e[3])); c.fillStyle = `rgba(255,255,240,${a})`; c.beginPath(); c.arc(e[0], e[1], e[2], 0, TAU); c.fill() } }
  if (G.arene === 'prehisto') for (let i = 0; i < 2; i++) { // des reptiles volants passent au loin
    const s = .9 - i * .25, x = W + 300 - ((t * (60 + i * 25) + i * 900) % (W + 700)), y = H * (.12 + .08 * i) + Math.sin(t * 1.2 + i) * 18, ail = Math.sin(t * 4 + i * 2) * 26 * s;
    c.fillStyle = 'rgba(60,40,50,.75)'; c.beginPath(); c.moveTo(x - 70 * s, y - ail); c.lineTo(x - 10 * s, y - 6 * s); c.lineTo(x + 34 * s, y - 14 * s); c.lineTo(x + 10 * s, y + 4 * s); c.lineTo(x + 70 * s, y - ail); c.lineTo(x, y + 10 * s); c.closePath(); c.fill() }
  if (G.arene === 'foret') { const F = AMB.flocons || (AMB.flocons = hasardN(70, () => [Math.random() * W, Math.random() * H, 2 + Math.random() * 4, .6 + Math.random() * 1.5, Math.random() * TAU]));
    c.fillStyle = 'rgba(255,255,255,.85)'; for (const f of F) { f[1] += f[3]; f[0] += Math.sin(t * 1.5 + f[4]) * .6; if (f[1] > H + 10) { f[1] = -10; f[0] = Math.random() * W } c.beginPath(); c.arc(f[0], f[1], f[2], 0, TAU); c.fill() } }
  if (G.arene === 'volcan') { const B = AMB.braises || (AMB.braises = hasardN(38, () => [Math.random() * W, H * (.45 + Math.random() * .55), 2 + Math.random() * 3.5, .8 + Math.random() * 1.8, Math.random() * TAU]));
    for (const b of B) { b[1] -= b[3]; b[0] += Math.sin(t * 2 + b[4]) * .8; if (b[1] < H * .08) { b[1] = H * (.85 + Math.random() * .2); b[0] = Math.random() * W }
      c.fillStyle = `rgba(255,${140 + (Math.sin(t * 9 + b[4]) * 60 | 0)},40,${.55 + .4 * Math.sin(t * 7 + b[4])})`; c.beginPath(); c.arc(b[0], b[1], b[2], 0, TAU); c.fill() } }
  if (G.arene === 'nuit') { const L = AMB.lucioles || (AMB.lucioles = hasardN(16, () => [Math.random() * W, H * (.42 + Math.random() * .4), Math.random() * TAU]));
    for (const l of L) { const x = l[0] + Math.sin(t * .7 + l[2]) * 70, y = l[1] + Math.cos(t * .9 + l[2]) * 34, a = .25 + .75 * Math.abs(Math.sin(t * 2.4 + l[2]));
      c.fillStyle = `rgba(226,255,120,${a * .22})`; c.beginPath(); c.arc(x, y, 13, 0, TAU); c.fill(); c.fillStyle = `rgba(236,255,150,${a})`; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill() } }
  if (G.arene === 'plage') for (let i = 0; i < 3; i++) { // des mouettes passent dans le ciel
    const s = 1 - i * .18, x = ((t * (70 - i * 12) + i * 760) % (W + 700)) - 350, y = H * (.1 + .07 * i) + Math.sin(t * 1.8 + i) * 14, ail = Math.sin(t * 7 + i * 2) * 12 * s;
    c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = 5 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 30 * s, y - ail); c.quadraticCurveTo(x - 13 * s, y - 12 * s, x, y); c.quadraticCurveTo(x + 13 * s, y - 12 * s, x + 30 * s, y - ail); c.stroke() }
}
function render() {
  const t = G.time;
  // décor
  bg.setTransform(1, 0, 0, 1, 0, 0); bg.fillStyle = '#1a1030'; bg.fillRect(0, 0, W, H);
  worldT(bg); if (G.bgImg) bg.drawImage(G.bgImg, -40, -20, W + 80, H + 40);
  ambianceFond(bg, t);
  if (G.phase === 'menu' || !G.f.length) { Skin.clear(); fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, W, H); return }
  // flaque « portable » du crocodile (hors de la rivière) et ronds dans l'eau
  dessineFlaques(bg);
  if (window.dessineSurprises) dessineSurprises(bg);
  // GOD MODE : aura dorée
  for (const f of G.f) if (!f.cache && (f.kind === 'trex' || f.kind === 'megalo' || f.kind === 'meganeura' || (G.god && G.mode === 1 && !NET.on && !f.cpu))) { const R = 420 * f.d.K / .44, y = FLOOR - f.h - 260 * f.d.K / .44, g = bg.createRadialGradient(f.x, y, 20, f.x, y, R);
    g.addColorStop(0, `rgba(255,214,90,${.55 + .15 * Math.sin(t * 6)})`); g.addColorStop(1, 'rgba(255,214,90,0)'); bg.fillStyle = g; bg.beginPath(); bg.arc(f.x, y, R, 0, TAU); bg.fill() }
  // CHAMPIONS DU LIVRE : un anneau doré au sol, qui respire
  for (const f of G.f) if (!f.cache && champion(f.kind)) { const R0 = 330 * f.d.K / .44, yc = FLOOR - f.h - 230 * f.d.K / .44, gr = bg.createRadialGradient(f.x, yc, 10, f.x, yc, R0); gr.addColorStop(0, `rgba(255,214,90,${.26 + .08 * Math.sin(t * 3 + f.side)})`); gr.addColorStop(1, 'rgba(255,214,90,0)'); bg.fillStyle = gr; bg.beginPath(); bg.arc(f.x, yc, R0, 0, TAU); bg.fill() }
  for (const f of G.f) if (!f.cache && champion(f.kind)) { const R = 205 * f.d.K / .44, k = cl(1 - f.h / 700, .3, 1); const al = (.5 + .2 * Math.sin(t * 4 + f.side * 2)) * k; bg.save(); bg.beginPath(); bg.ellipse(f.x, FLOOR + 4, R, 30, 0, 0, TAU); bg.globalAlpha = al * .35; bg.strokeStyle = '#FFB200'; bg.lineWidth = 26; bg.stroke(); bg.globalAlpha = al; bg.strokeStyle = '#FFE680'; bg.lineWidth = 8; bg.stroke(); bg.restore() } // (sans flou : plus léger pour les téléphones)
  // ombres
  for (const f of G.f) { if (f.cache) continue; const k = cl(1 - f.h / 600, .35, 1); bg.fillStyle = 'rgba(40,15,5,.35)'; bg.beginPath(); bg.ellipse(f.x, FLOOR + 6, 220 * f.d.K / .44 * k, 26 * k, 0, 0, TAU); bg.fill() }
  if (G.freeze > 0 && G.superBy) {
    const f = G.superBy, u = P(34 - G.freeze, 0, 8);
    bg.setTransform(1, 0, 0, 1, 0, 0); bg.fillStyle = `rgba(4,10,30,${.62 * u})`; bg.fillRect(0, 0, W, H);
    worldT(bg); bg.save(); bg.globalAlpha = .45 * u; bg.translate(f.x, FLOOR - 220); bg.rotate(t * 2);
    for (let i = 0; i < 16; i++) { bg.rotate(TAU / 16); bg.fillStyle = i % 2 ? JA : f.d.col; bg.beginPath(); bg.moveTo(0, 0); bg.lineTo(1400, -60); bg.lineTo(1400, 60); bg.closePath(); bg.fill() } bg.restore();
  }
  // léopard : l'ombre de la nuit (le décor s'assombrit pendant son SUPER)
  const ombre = G.f.find(f => f.state === 'atk' && f.move && f.move.ombre && f.ph !== 'rec');
  if (ombre) { const k = ombre.ph === 'st' ? P(ombre.t, 0, ombre.move.st) : 1; bg.setTransform(1, 0, 0, 1, 0, 0); bg.fillStyle = `rgba(3,6,28,${.72 * k})`; bg.fillRect(0, 0, W, H); worldT(bg) }
  // personnages : celui qui attaque passe devant
  Skin.clear();
  const [a, b] = G.f, order = (b.state === 'atk' && a.state !== 'atk') ? [a, b] : [b, a];
  for (const f of order) {
    if (f.cache && !(f.ciel && f.state === 'atk' && f.move && f.move.plafond)) continue; // la scolopendre pendue au plafond reste visible
    if (!f.pose) poseOf(f);
    const view = Skin.viewMatrix(f.R, f.x, FLOOR - f.h, f.d.K, f.flipV ? -f.face : f.face, cam, W, H);
    if (f.ghost && f.ghost.k > 0) Skin.draw(f.R, f.ghost.M, view, { only: f.ghost.only || undefined, show: { roar: f.ghost.roar }, alpha: .45 * f.ghost.k / 4, tint: f.tint || [0, 0, 0, 0] });
    if (f.trace && f.trace.length && f.state === 'atk') for (let i = f.trace.length - 1; i >= 2; i -= 3) { const [x, h] = f.trace[i]; Skin.draw(f.R, f.M, Skin.viewMatrix(f.R, x, FLOOR - h, f.d.K, f.face, cam, W, H), { only: f.spr || undefined, alpha: .42 - i * .035, tint: f.tint || [0, 0, 0, 0] }) }
    const teinte = f.poison ? (f.poison.genre === 'blesse' ? [1, .45, .4, .22 + .12 * Math.sin(G.time * 8)] : f.poison.genre === 'gratte' ? [1, .85, .45, .22 + .12 * Math.sin(G.time * 10)] : f.poison.genre === 'fil' ? [1, 1, 1, .3 + .1 * Math.sin(G.time * 6)] : [.45, 1, .35, .28 + .14 * Math.sin(G.time * 8)]) : f.sale > 0 ? [.8, .52, .25, .42 * Math.min(1, f.sale / 40)] : (window.teinteTenue && teinteTenue(f)) || f.tint || [0, 0, 0, 0];
    const camo = f.state === 'atk' && f.move && f.move.camoufle && f.ph !== 'rec' && !f.contre, herbe = camo && f.move.camoufle === 'herbe';
    const noir = f.state === 'atk' && f.move && f.move.noir && f.ph !== 'rec', esprit = f.state === 'atk' && f.move && f.move.esprit && f.ph !== 'rec';
    Skin.draw(f.R, f.M, view, { only: f.spr || undefined, show: { roar: f.roar }, flash: esprit ? .42 + .06 * Math.sin(t * 9) : f.flash > 0 ? .12 * f.flash / 4 : 0, tint: herbe ? [.55, .9, .35, .8] : camo ? [.93, .82, .6, .85] : noir ? [.16, .14, .2, .9] : esprit ? [1.1, 1.1, 1.15, .75] : teinte, alpha: camo ? .3 + .08 * Math.sin(t * 6) : f === ombre && ombre.ph === 'act' ? .5 + .15 * Math.sin(t * 25) : 1 });
  }
  // effets et interface
  fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, W, H);
  worldT(fx);
  for (const f of G.f) if (f.state === 'ko' || (f.state === 'down' && f.t < 50)) dizzy(fx, f, t);
  dessineDetails(fx, t);
  if (G.arene === 'riviere') eau(fx, t);
  ambiance(fx, t);
  dessineZones(fx); drawFx(fx); dessineProj(fx);
  if (window.dessineSurprisesDevant) dessineSurprisesDevant(fx);
  if (G.debug) for (const f of G.f) { fx.strokeStyle = '#0f0'; fx.lineWidth = 3; const h = hurtBox(f); fx.strokeRect(h[0], h[2], h[1] - h[0], h[3] - h[2]); const x = hitBox(f); if (x) { fx.strokeStyle = '#f00'; fx.strokeRect(x[0], x[2], x[1] - x[0], x[3] - x[2]) } }
  // (paillettes dorées qui montent autour des champions du livre)
  for (const f of G.f) if (!f.cache && champion(f.kind)) { const K = f.d.K / .44; for (let i = 0; i < 7; i++) { const ph = (t * .42 + i / 7 + f.side * .1) % 1, x = f.x + Math.sin(i * 2.4 + t * 1.7) * 210 * K, y = FLOOR - f.h - 30 - ph * 600 * K; fx.save(); fx.globalAlpha = .9 * Math.sin(Math.PI * ph); star(fx, x, y, 17 + 7 * (i % 2), 6, 4, i % 2 ? '#FFF3B0' : '#FFC629', 'rgba(122,62,0,.7)', 2.5); fx.restore() } }
  dessineFoule(fx); hud(fx); annonce(fx);
}
// position de la tête (px image depuis le point au sol, pose de base)
const TETE = { meganeura: [370, -320], veuve: [125, -300], serpentbrun: [520, -520], colibri: [280, -770], mante: [264, -765], chauvesouris: [220, -383], scolopendre: [540, -180], guepe: [400, -680], mygale: [380, -520], abeille: [470, -640], frelon: [470, -560], crevette: [420, -540], crabe: [100, -520], baleine: [540, -330], bouledogue: [420, -480], girafe: [380, -840], lionne: [480, -680], alligator: [470, -330], python: [410, -670], glouton: [470, -410], oursnoir: [500, -560], cobra: [360, -790], mangouste: [420, -370], loup: [430, -600], puma: [490, -520], caiman: [450, -360], anaconda: [400, -620], jaguar: [495, -500], megalo: [470, -570], pieuvre: [-60, -720], aiguillat: [600, -380], espadon: [300, -400], requinbleu: [600, -400], orque: [570, -460], requin: [580, -470], leopard: [515, -640], guepard: [440, -680], autruche: [280, -760], porcepic: [444, -260], trex: [520, -560], morse: [380, -700], buffle: [560, -560], hyene: [520, -600], grizzly: [594, -606], tigre: [561, -558], gorille: [404, -681], lion: [413, -618], ours: [594, -606], croco: [565, -285], hippo: [631, -606], ratel: [519, -445], komodo: [520, -456] };
function tete(f) { const p = f.d.tete || TETE[f.kind] || [450, -550], K = f.d.K; return [f.x + f.face * p[0] * K, FLOOR - f.h + p[1] * K] }
function oiseau(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7FD0F5'; c.strokeStyle = NV; c.lineWidth = 3;
  c.beginPath(); c.ellipse(0, 0, 16, 11, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(12, -8, 8, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = JA; c.beginPath(); c.moveTo(19, -8); c.lineTo(28, -5); c.lineTo(19, -3); c.fill();
  const a = Math.sin(t * 30) * .8; c.fillStyle = '#BFE9FF'; c.beginPath(); c.moveTo(-4, -2); c.lineTo(-18, -18 * Math.cos(a) - 4); c.lineTo(4, -4); c.fill(); c.stroke(); c.restore() }
const CLAN = {};
// les bandes (SUPER) : l'annonce et sa couleur
const CLAN_TXT = { frelon: ['LA BANDE À FRELONS ARRIVE ! ZZZZ !', '#FFE2A8'], loup: ['LA MEUTE ARRIVE ! AOUUUH !', '#E8E6DF', 'loup_meute'], lionne: ['TOUTE LA TROUPE ARRIVE !', '#F6DDB0'], caiman: ['10 MILLIONS DE CAÏMANS !', '#E3E0B0'], anaconda: ['LES BÉBÉS ANACONDAS !', '#F2EDA0'] };
function chargeClan(qui = 'hyene') { const C = CLAN[qui] || (CLAN[qui] = {}); if (C.m) return; for (const [k, n] of [['m', 'marche'], ['s', qui === 'hyene' ? 'saut' : 'special'], ['c', 'coup']]) { C[k] = new Image(); C[k].src = qui + '_' + n + '.webp' } }
// le clan de la hyène : 5 copines qui traversent l'écran au galop
function clan(c, e, u) {
  const C = CLAN[e.qui || 'hyene'] || {}, im = [C.m, C.s, C.c].filter(i => i && i.complete && i.naturalWidth); if (!im.length) return;
  if (e.qui === 'aiguillat') { // « il chasse en bande, parfois par milliers » : un banc de 14 aiguillats traverse l'arène
    for (let i = 0; i < 14; i++) { const d = u * 1700 - (i % 7) * 120, x = e.x - e.dir * (760 + (i % 7) * 90) + e.dir * d * 1.3; if (d < 0) continue;
      const img = im[(Math.floor(u * 8) + i) % im.length], s = .14 + (i % 3) * .03, w = img.naturalWidth * s, h = img.naturalHeight * s, y = FLOOR - 60 - h - [30, 420, 180, 560, 300, 90, 480][i % 7] - Math.floor(i / 7) * 120 + Math.sin(u * 10 + i * 1.7) * 24;
      c.save(); c.globalAlpha = Math.min(1, 3 * (1.3 - u)); c.translate(x, 0); c.scale(e.dir, 1); c.drawImage(img, -w / 2, y, w, h); c.restore() }
    return }
  if (e.qui === 'orque') { // la bande d'orques : 4 orques traversent l'arène à la nage, à des hauteurs différentes
    for (let i = 0; i < 4; i++) { const d = u * 1600 - i * 190, x = e.x - e.dir * (820 + i * 120) + e.dir * d * 1.3; if (d < 0) continue;
      const img = im[(Math.floor(u * 6) + i) % im.length], s = .27 + (i % 2) * .05, w = img.naturalWidth * s, h = img.naturalHeight * s, y = FLOOR - 70 - h - [40, 250, 120, 330][i] + Math.sin(u * 9 + i * 2) * 22;
      c.save(); c.globalAlpha = Math.min(1, 3 * (1.3 - u)); c.translate(x, 0); c.scale(e.dir, 1); c.drawImage(img, -w / 2, y, w, h); c.restore(); if (i % 2 === 0 && Math.floor(u * 60) % 7 === 0) addFx({ k: 'bulles', x: x - e.dir * w * .45, y: y + h * .5, n: 2, w: 40 }) }
    return }
  const [nb, s0, pas] = { anaconda: [10, .12, 85], caiman: [8, .2, 120], lionne: [3, .33, 190] }[e.qui] || [5, .3, 110]; // les bébés anacondas sont tout petits ; la troupe : deux lionnes de plus
  for (let i = 0; i < nb; i++) {
    const d = u * 1500 - i * 150 * pas / 110, x = e.x - e.dir * (700 + i * pas) + e.dir * d * 1.35; if (d < 0) continue;
    const img = im[(Math.floor(u * 14) + i) % im.length], s = s0 + (i % 2) * s0 / 6, w = img.naturalWidth * s, h = img.naturalHeight * s, y = FLOOR + 6 - h - Math.abs(Math.sin(u * 22 + i)) * 26 * s0 / .3;
    c.save(); c.globalAlpha = Math.min(1, 3 * (1.3 - u)); c.translate(x, 0); c.scale(e.dir, 1); c.drawImage(img, -w / 2, y, w, h); c.restore();
  }
}
function poisson(c, x, y, r, s) { const sauteur = G.arene === 'estuaire'; // estuaire : un poisson-sauteur (brun tacheté, les gros yeux sur le dessus de la tête)
  c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); c.lineWidth = 5; c.strokeStyle = NV;
  c.fillStyle = sauteur ? '#8C7A48' : '#FF8A7A'; c.beginPath(); c.ellipse(0, 0, 62, 24, 0, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-55, 0); c.lineTo(-92, -24); c.lineTo(-84, 0); c.lineTo(-92, 24); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = sauteur ? '#CDBE8E' : '#FFD1C8'; c.beginPath(); c.ellipse(8, 8, 40, 9, 0, 0, TAU); c.fill();
  if (sauteur) { c.fillStyle = '#4A3F24'; for (const [a, b] of [[-26, -8], [-6, -13], [14, -9], [-40, 4], [-14, 2]]) { c.beginPath(); c.arc(a, b, 4.5, 0, TAU); c.fill() }
    c.fillStyle = '#8C7A48'; c.beginPath(); c.ellipse(4, 12, 14, 8, .6, 0, TAU); c.fill(); c.stroke(); // la nageoire-patte
    for (const ex of [30, 44]) { c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, -24, 10, 0, TAU); c.fill(); c.stroke(); c.fillStyle = NV; c.beginPath(); c.arc(ex + 2, -25, 4, 0, TAU); c.fill() } }
  else { c.fillStyle = '#fff'; c.beginPath(); c.arc(38, -6, 8, 0, TAU); c.fill(); c.stroke(); c.fillStyle = NV; c.beginPath(); c.arc(40, -6, 3.5, 0, TAU); c.fill() }
  c.restore() }
// une toute petite abeille (essaim, boule de chaleur)
// jeune serpent brun (livre : « tout jeune, il débute ») : il grandit un peu à chaque coup donné (plus grand, plus fort), jusqu'à sa taille maximale
function grandit(f, pas) { const g0 = f.grand || 1, M = f.d.grandit.max; f.grand = Math.min(M, g0 + pas); if (f.grand === g0) return; if (window.appliqueBoost) appliqueBoost(f); sfx('pop', .5);
  if (f.grand >= M && window.trophee) trophee('grandi', f);
  if (f.grand >= M) addFx({ k: 'mot', x: f.x, y: FLOOR - 720 * f.d.K / .44, mot: hasard(['IL A GRANDI !', 'TOUT GRAND, MAINTENANT !', 'ADULTE !']), col: '#EBD8B0' }); else if (Math.random() < .4) addFx({ k: 'mot', x: f.x, y: FLOOR - 640 * f.d.K / .44, mot: hasard(['IL GRANDIT !', 'ENCORE UN PEU PLUS GRAND !', 'ÇA POUSSE !']), col: '#EBD8B0' }) }
function chauveMini(c, x, y, dir, ph) { c.save(); c.translate(x, y); c.scale(dir, 1); c.lineWidth = 3; c.strokeStyle = NV; c.lineJoin = 'round'; // la nuée de la grotte (chauve-souris)
  const b = 10 * Math.sin(ph); c.fillStyle = '#5A3A2A';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(s * 14, -14 - b, s * 30, -6 - b); c.lineTo(s * 24, 0); c.lineTo(s * 18, -2); c.lineTo(s * 12, 4); c.closePath(); c.fill(); c.stroke() }
  c.fillStyle = '#7A4E38'; c.beginPath(); c.ellipse(0, 0, 9, 7, 0, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(3, -5); c.lineTo(6, -12); c.lineTo(8, -4); c.fill(); c.stroke(); c.fillStyle = '#FFE14D'; c.fillRect(4, -2, 3, 2); c.restore() }
function abeilleMini(c, x, y, dir, ph) { c.save(); c.translate(x, y); c.scale(dir, 1); c.lineWidth = 3; c.strokeStyle = NV;
  c.fillStyle = 'rgba(235,245,255,.8)'; const w = 8 + 5 * Math.abs(Math.sin(ph)); c.beginPath(); c.ellipse(-2, -12, 7, w, -.4, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#F2B01E'; c.beginPath(); c.ellipse(0, 0, 16, 10, 0, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = NV; c.fillRect(-7, -9, 4, 18); c.fillRect(1, -9, 4, 18); c.beginPath(); c.arc(13, -2, 4, 0, TAU); c.fill(); c.restore() }
// détails dessinés en direct autour des animaux (état par état)
function dessineDetails(c, t) {
  for (const f of G.f) if (f.state === 'atk' && f.move && f.move.ombre && f.ph !== 'rec' && !f.cache) { const [hx, hy] = tete(f), k = f.ph === 'st' ? P(f.t, 0, f.move.st) : 1; c.save(); c.globalAlpha = k; c.fillStyle = '#FFE14D'; c.shadowColor = '#FFE14D'; c.shadowBlur = 24; for (const dx of [-16, 16]) { c.beginPath(); c.ellipse(hx + dx, hy - 12, 12, 6 + 2 * Math.sin(t * 9), 0, 0, TAU); c.fill() } c.restore() }
  for (const f of G.f) {
    const K = f.d.K, [hx, hy] = tete(f), m = f.state === 'atk' ? f.move : null;
    // abeilles : l'essaim qui fonce, les muscles qui vibrent (ça chauffe), la boule de chaleur autour de l'adversaire
    if (m && m.eclair && f.ph === 'act' && !f.cache) { const y = FLOOR - f.h - 440 * K / .44, x0 = f.x + f.face * 200 * K / .44, L = 800 * K / .44; c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); for (let i = 1; i <= 6; i++) c.lineTo(x0 + f.face * L * i / 6, y + (i % 2 ? -30 : 30) * (1 - i / 7)); c.strokeStyle = NV; c.lineWidth = 16; c.stroke(); c.strokeStyle = '#FFF36B'; c.lineWidth = 8; c.stroke(); c.restore() } // mante : elle frappe en un éclair
    const mc = f.state === 'lance' ? f.prise : null; if (mc && mc.cocon && !f.cache) { const o = f.cible, m = mc; if (o && o.state === 'tenu') { const R = 200 * o.d.K / .44, cy = FLOOR - o.h - 260 * o.d.K / .44; c.save(); c.strokeStyle = 'rgba(250,250,250,.85)'; c.lineWidth = 5; for (let i = 0; i < Math.min(9, 1 + f.t / 6); i++) { c.beginPath(); c.ellipse(o.x, cy + (i - 4) * 34 * o.d.K / .44, R * (1 - Math.abs(i - 4) * .12), 26, (i % 3 - 1) * .25, 0, TAU); c.stroke() } if (m.ascenseur) { c.lineWidth = 4; c.beginPath(); c.moveTo(o.x, cy - 160 * o.d.K / .44); c.lineTo(o.x + 20 * Math.sin(t * 2), cy - 1400); c.stroke() } c.restore() } } // veuve noire : elle ficelle sa proie (cocon de soie)
    if (m && m.ballon && f.h > 20 && !f.cache) { const [hx2, hy2] = tete(f); c.save(); c.strokeStyle = 'rgba(250,250,250,.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx2 - f.face * 60, hy2); c.quadraticCurveTo(hx2 + 60 * Math.sin(t * 2), hy2 - 500, hx2 - f.face * 40, hy2 - 1100); c.stroke(); c.restore() } // veuve noire : le décollage sans ailes (sur un fil de soie)
    if (f.poison && f.poison.genre === 'fil' && !f.cache) { c.save(); c.strokeStyle = 'rgba(250,250,250,.8)'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { const x = f.x + (i - 2) * 70 * K / .44; c.beginPath(); c.moveTo(x, FLOOR - f.h); c.quadraticCurveTo(x + 40 * Math.sin(t * 3 + i), FLOOR - f.h - 150 * K / .44, x - 20, FLOOR - f.h - 300 * K / .44); c.stroke() } c.restore() } // pris dans le fil gluant
    if (m && m.nuee && f.ph !== 'rec' && !f.cache) for (let i = 0; i < 14; i++) { const a = t * 6 + i * 1.7, av = ((t * 1.3 + i * .137) % 1); chauveMini(c, f.x + f.face * (-300 + 1300 * av) * K / .44, FLOOR - f.h - (200 + 260 * ((i * 37) % 10) / 10 + 40 * Math.sin(a)) * K / .44, f.face, t * 30 + i) }
    if (f.repereT > G.frame && G.phase === 'fight' && !f.cache) { const [cx, cy] = tete(f), r = 70 + 8 * Math.sin(t * 8); c.save(); c.globalAlpha = .75; c.strokeStyle = '#C79BFF'; c.lineWidth = 7; c.beginPath(); c.arc(cx, cy - 20, r, 0, TAU); c.stroke(); for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + t; c.beginPath(); c.moveTo(cx + Math.cos(a) * (r - 22), cy - 20 + Math.sin(a) * (r - 22)); c.lineTo(cx + Math.cos(a) * (r + 22), cy - 20 + Math.sin(a) * (r + 22)); c.stroke() } c.restore() } // la cible du sonar
    if (m && m.essaim && f.ph !== 'rec' && !f.cache) for (let i = 0; i < 9; i++) { const a = t * 7 + i * 2.1, rr = 60 + (i % 3) * 50; abeilleMini(c, f.x + f.face * (120 + 90 * Math.sin(a * .7) + i * 22) * K / .44, FLOOR - f.h - (260 + Math.sin(a) * rr) * K / .44, f.face, t * 40 + i) }
    if (m && m.vibre && f.ph === 'act' && !f.cache) { c.save(); c.globalAlpha = .55; c.strokeStyle = '#FF9A3C'; c.lineWidth = 6; c.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const x0 = f.x + (i - 2) * 90 * K / .44, y0 = FLOOR - f.h - 120 * K / .44; c.beginPath(); for (let k = 0; k <= 8; k++) { const y = y0 - k * 34, x = x0 + Math.sin(t * 14 + k * .9 + i) * 12; k ? c.lineTo(x, y) : c.moveTo(x, y) } c.stroke() } c.restore() }
    if (m && m.boule && f.ph === 'act' && f.hit) { const o = G.f.find(g => g !== f); if (o) { const ox = o.x, oy = FLOOR - o.h - 260 * o.d.K / .44;
      c.save(); c.globalAlpha = .35; c.fillStyle = '#FF7A1A'; c.beginPath(); c.arc(ox, oy, 250 * o.d.K / .44, 0, TAU); c.fill(); c.restore();
      for (let i = 0; i < 26; i++) { const a = i * 2.4 + t * (i % 2 ? 3 : -3), r = (150 + (i % 4) * 30) * o.d.K / .44; abeilleMini(c, ox + Math.cos(a) * r, oy + Math.sin(a) * r * .85, Math.cos(a) > 0 ? -1 : 1, t * 40 + i) }
      if (G.frame % 20 < 12) comic(c, '46 °C !', ox, oy - 300 * o.d.K / .44, .3, .5, 1, '#FF9A3C') } }
    // étourdi : étoiles et oiseaux qui tournent autour de la tête
    if (f.state === 'dizzy' && f.paralyse) { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; for (let i = 0; i < 5; i++) { const a = i * 1.26 + Math.floor(t * 12) * .7, R = 150 + 60 * Math.sin(i * 3 + t * 5), x = f.x + Math.cos(a) * R * K / .44, y = FLOOR - f.h - 300 * K / .44 + Math.sin(a) * R * .6 * K / .44; // paralysé : de petits éclairs violets
        c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x + 12, y - 6); c.lineTo(x - 8, y + 2); c.lineTo(x + 6, y + 30); c.strokeStyle = NV; c.lineWidth = 11; c.stroke(); c.strokeStyle = '#C79BFF'; c.lineWidth = 5; c.stroke() } c.restore() }
    else if (f.state === 'dizzy') { for (let i = 0; i < 3; i++) { const a = t * 4 + i * TAU / 3; star(c, hx + Math.cos(a) * 110, hy - 90 + Math.sin(a) * 26, 24, 10, 5, JA, NV, 4) }
      for (let i = 0; i < 2; i++) { const a = -t * 3 + i * Math.PI; oiseau(c, hx + Math.cos(a) * 140, hy - 120 + Math.sin(a) * 30, .9, t + i) } }
    // piquants du porc-épic plantés dans le pelage (noir et blanc)
    if (f.piques && f.piques.n > 0 && !f.cache) { c.save(); c.lineCap = 'round';
      for (const [u, v, r] of f.piques.pos) { const px = f.x + f.face * (u - .35) * 620 * K / .44, py = FLOOR - f.h - v * 520 * K / .44, a = -Math.PI / 2 + r * .9 - f.face * .5, L = 70;
        const ex = px + Math.cos(a) * L, ey = py + Math.sin(a) * L; c.strokeStyle = NV; c.lineWidth = 9; c.beginPath(); c.moveTo(px, py); c.lineTo(ex, ey); c.stroke();
        c.strokeStyle = '#F5F0E6'; c.lineWidth = 5; c.beginPath(); c.moveTo(px, py); c.lineTo((px + ex) / 2, (py + ey) / 2); c.stroke();
        c.strokeStyle = '#222'; c.beginPath(); c.moveTo((px + ex) / 2, (py + ey) / 2); c.lineTo(ex, ey); c.stroke() } c.restore() }
    // requin : dans les profondeurs, on ne voit que son aileron qui glisse sur le sable… puis il surgit par en dessous
    if (f.cache && !f.ciel && f.state === 'atk' && f.move && f.move.contourne === 'herbe') { const o = G.f.find(g => g !== f), u = f.t / f.move.st, ang = u * TAU * 1.25 + (f.face > 0 ? Math.PI : 0), x = o.x + Math.cos(ang) * 330; // jaguar : l'herbe bouge là où il rampe
      c.save(); c.lineCap = 'round'; for (let i = -5; i <= 5; i++) { c.strokeStyle = i % 2 ? '#4E7A2A' : '#7BAA3A'; c.lineWidth = 13; const bx = x + i * 30, hh = 150 + 50 * Math.sin(t * 14 + i), pen = Math.sin(t * 16 + i) * 30; c.beginPath(); c.moveTo(bx, FLOOR + 6); c.quadraticCurveTo(bx + pen * .5, FLOOR - hh * .5, bx + pen, FLOOR - hh); c.stroke() } c.restore(); continue }
    if (f.cache && !f.ciel && f.state === 'atk' && f.move && f.move.contourne) { const o = G.f.find(g => g !== f), u = f.t / f.move.st, ang = u * TAU * 1.25 + (f.face > 0 ? Math.PI : 0), x = o.x + Math.cos(ang) * 330, y = FLOOR + 14 + Math.sin(ang) * 26, dir = -Math.sin(ang) >= 0 ? 1 : -1;
      c.save(); c.globalAlpha = .3; c.fillStyle = '#0B2A5B'; c.beginPath(); c.ellipse(o.x, FLOOR + 10, 360, 34, 0, 0, TAU); c.fill(); c.globalAlpha = 1; c.fillStyle = f.d.col; c.strokeStyle = NV; c.lineWidth = 6;
      c.beginPath(); c.moveTo(x - dir * 70, y); c.quadraticCurveTo(x - dir * 40, y - 90, x + dir * 30, y - 150); c.quadraticCurveTo(x + dir * 26, y - 70, x + dir * 64, y); c.closePath(); c.fill(); c.stroke(); c.restore(); continue }
    if (f.cache && !f.ciel && (f.kind === 'requin' || f.kind === 'megalo')) { const x = f.x, y = FLOOR + 14, w = Math.sin(t * 10) * 3; c.save(); c.globalAlpha = .35; c.fillStyle = '#0B2A5B'; c.beginPath(); c.ellipse(x, FLOOR + 6, 230 * K / .44, 22, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
      c.fillStyle = f.d.col; c.strokeStyle = NV; c.lineWidth = 6; c.beginPath(); c.moveTo(x - f.face * 70, y); c.quadraticCurveTo(x - f.face * 40 + w, y - 90, x + f.face * 30 + w, y - 150); c.quadraticCurveTo(x + f.face * 26, y - 70, x + f.face * 64, y); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = JA; c.strokeStyle = NV; c.lineWidth = 5; c.font = '900 90px Rubik, sans-serif'; c.textAlign = 'center'; c.globalAlpha = cl(.4 + .6 * Math.sin(t * 9) ** 2, 0, 1); c.strokeText('!', x, FLOOR - 200); c.fillText('!', x, FLOOR - 200); c.restore(); continue }
    if (f.kind === 'requin' && m && m.radar && f.ph !== 'rec' && G.frame % 5 === 0) addFx({ k: 'etincelles', x: hx + f.face * 40, y: hy + 30 });
    if (m && m.camoufle === 'herbe' && f.state === 'atk' && f.ph !== 'rec' && !f.contre) { c.save(); c.lineCap = 'round'; for (let i = -6; i <= 6; i++) { c.strokeStyle = i % 2 ? '#4E7A2A' : '#7BAA3A'; c.lineWidth = 12; const bx = f.x + i * 34, hh = 160 + 40 * Math.sin(i * 1.7) + 10 * Math.sin(t * 3 + i), pen = Math.sin(t * 2 + i) * 14; c.beginPath(); c.moveTo(bx, FLOOR + 6); c.quadraticCurveTo(bx + pen * .5, FLOOR - hh * .5, bx + pen, FLOOR - hh); c.stroke() } c.restore() } // l'anaconda caché dans l'herbe
    if (m && m.radar === 'chaleur' && f.state === 'atk' && f.ph !== 'rec' && !f.contre && G.frame % 7 === 0) addFx({ k: 'chaleur', x: hx + f.face * 60, y: hy + 20, dir: f.face }); // python : il « voit » la chaleur
    if (m && m.dents && f.ph === 'act' && f.hit) { const o = G.f.find(g => g !== f), ox = o.x, oy = FLOOR - o.h - 260 * o.d.K / .44, ouv = Math.abs(Math.sin(t * 16)) * 120 + 30;
      c.save(); c.fillStyle = '#FFFFFF'; c.strokeStyle = NV; c.lineWidth = 6;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(ox - 300, oy + s * (ouv + 70)); c.quadraticCurveTo(ox, oy + s * (ouv + 130), ox + 300, oy + s * (ouv + 70)); c.lineTo(ox + 300, oy + s * ouv);
        for (let i = 9; i >= 0; i--) { const x = ox - 300 + i * 60; c.lineTo(x + 30, oy + s * (ouv - 70)); c.lineTo(x, oy + s * ouv) } c.closePath(); c.fill(); c.stroke() } c.restore() }
    if (f.d.respire && (f.air || 0) >= AIR_T && G.phase === 'fight' && !f.cache) { const x = hx, y = hy - 170 + 10 * Math.sin(t * 5), a = .6 + .4 * Math.sin(t * 8);
      c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(232,247,255,.9)'; c.strokeStyle = NV; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 58, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.arc(x - 38, y + 58, 12, 0, TAU); c.fill(); c.stroke(); c.fillStyle = NV; c.font = '900 34px Rubik, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('AIR ?', x, y + 2); c.restore() }
    // crocodile sous l'eau : on ne voit que ses yeux et ses narines qui glissent
    if (f.cache && f.ciel) { const k = cl(.4 + .6 * Math.sin(t * 9) ** 2, 0, 1); c.save(); c.globalAlpha = .55; c.fillStyle = '#1A0E05'; c.beginPath(); c.ellipse(f.x, FLOOR + 4, 170 * K / .44, 26, 0, 0, TAU); c.fill(); c.globalAlpha = k; c.fillStyle = JA; c.strokeStyle = NV; c.lineWidth = 5; c.font = '900 90px Rubik, sans-serif'; c.textAlign = 'center'; c.strokeText('!', f.x, FLOOR - 40); c.fillText('!', f.x, FLOOR - 40); c.restore() }
    else if (f.cache) { const x = f.x + f.face * 200 * K, y = FLOOR - 6;
      c.save(); c.globalAlpha = .9; c.strokeStyle = '#E8F7FF'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - f.face * 40, y); c.lineTo(x - f.face * 200, y - 16); c.moveTo(x - f.face * 40, y); c.lineTo(x - f.face * 200, y + 12); c.stroke(); c.restore();
      c.fillStyle = '#4E8A2E'; c.strokeStyle = NV; c.lineWidth = 4;
      for (const dx of [-26, 26]) { c.beginPath(); c.ellipse(x + dx, y - 16, 22, 17, 0, Math.PI, TAU); c.fill(); c.stroke(); c.fillStyle = '#FFE36B'; c.beginPath(); c.ellipse(x + dx, y - 22, 10, 9, 0, 0, TAU); c.fill(); c.fillStyle = NV; c.beginPath(); c.ellipse(x + dx + f.face * 2, y - 22, 3, 8, 0, 0, TAU); c.fill(); c.fillStyle = '#4E8A2E' }
      c.beginPath(); c.ellipse(x + f.face * 90, y - 8, 16, 9, 0, Math.PI, TAU); c.fill(); c.stroke() }
    // hippo : la queue-hélice
    if (m && m.dos && f.ph !== 'rec') { const x = f.x + f.face * 675 * K, y = FLOOR - f.h - 548 * K, a = t * 38;
      c.save(); c.translate(x, y); c.globalAlpha = f.ph === 'act' ? .85 : .4; c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 52, 0, TAU); c.stroke();
      c.fillStyle = '#6E5A7E'; for (let i = 0; i < 3; i++) { c.save(); c.rotate(a + i * TAU / 3); c.beginPath(); c.ellipse(26, 0, 30, 9, 0, 0, TAU); c.fill(); c.restore() } c.restore() }
    // lion : une couronne pendant la charge du roi
    if (m && f.kind === 'lion' && f.mk === 'SUPER') { c.save(); c.translate(hx - f.face * 20, hy - 150 + 8 * Math.sin(t * 12)); c.rotate(-.1 * f.face);
      c.fillStyle = JA; c.strokeStyle = NV; c.lineWidth = 6; c.beginPath(); c.moveTo(-70, 30); c.lineTo(-80, -30); c.lineTo(-40, 0); c.lineTo(0, -45); c.lineTo(40, 0); c.lineTo(80, -30); c.lineTo(70, 30); c.closePath(); c.fill(); c.stroke();
      for (const [x, col] of [[-45, '#FF5A6E'], [0, '#12A4C4'], [45, '#7BD35A']]) { c.fillStyle = col; c.beginPath(); c.arc(x, 14, 10, 0, TAU); c.fill(); c.stroke() } c.restore() }
    // ruées : traits de vitesse derrière l'animal
    if (m && m.rush && f.ph === 'act' && !f.cache) { c.save(); c.strokeStyle = 'rgba(255,248,236,.7)'; c.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const y = FLOOR - f.h - 80 - i * 90 * K / .44, l = 160 + 90 * Math.sin(t * 20 + i * 2), x = f.x - f.face * (240 + (i % 2) * 60) * K / .44; c.lineWidth = 9 - i; c.beginPath(); c.moveTo(x, y); c.lineTo(x - f.face * l, y); c.stroke() } c.restore() }
    // victoires qui font rire : le gorille fredonne, le lion fait la sieste, le crocodile pleure s'il perd
    if (f.state === 'win' && f.t > 40) {
      if (f.kind === 'gorille') for (let i = 0; i < 3; i++) { const k = ((t * .7 + i / 3) % 1); c.globalAlpha = 1 - k; txt(c, i % 2 ? '♪' : '♫', hx + f.face * (40 + 60 * k) + 30 * Math.sin(k * 9 + i), hy - 80 - 220 * k, 70, JA, { out: 8 }); c.globalAlpha = 1 }
      if (f.kind === 'lion' && f.t > 120) for (let i = 0; i < 3; i++) { const k = ((t * .5 + i / 3) % 1); c.globalAlpha = 1 - k; txt(c, 'Z', hx + f.face * (30 + 90 * k), hy - 60 - 200 * k, 50 + 40 * k, PA, { out: 8 }); c.globalAlpha = 1 }
    }
    if ((f.state === 'lose' || f.state === 'ko') && f.kind === 'croco' && G.phase === 'ko') { for (let i = 0; i < 3; i++) { const k = ((t * 1.3 + i / 3) % 1); c.fillStyle = '#7FD0F5'; c.strokeStyle = NV; c.lineWidth = 3; c.beginPath(); c.ellipse(hx - f.face * 60, hy + 10 + 150 * k, 9, 13, 0, 0, TAU); c.fill(); c.stroke() } }
  }
  // ratel : SUPER « la furie » = nuage de bagarre de dessin animé
  for (const f of G.f) if (f.kind === 'ratel' && f.state === 'atk' && f.mk === 'SUPER' && f.ph === 'act' && f.hit) {
    const o = G.f.find(g => g !== f), x = (f.x + o.x) / 2, y = FLOOR - 300, r = rng(Math.floor(t * 12));
    c.save(); c.fillStyle = '#F4E2C0'; c.strokeStyle = NV; c.lineWidth = 7;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, R = 230 + 30 * Math.sin(t * 20 + i); c.beginPath(); c.arc(x + Math.cos(a) * R * .8, y + Math.sin(a) * R * .45, 110 + 20 * r(), 0, TAU); c.fill(); c.stroke() }
    c.beginPath(); c.ellipse(x, y, 260, 170, 0, 0, TAU); c.fill();
    for (let i = 0; i < 5; i++) txt(c, ['★', '@', '#', '!', '%', 'POW'][Math.floor(r() * 6)], x + (r() - .5) * 360, y + (r() - .5) * 200, 50 + r() * 30, [JA, OR, NV, '#FF5A6E'][i % 4], { out: 6 });
    for (let i = 0; i < 3; i++) { const a = r() * TAU; c.lineWidth = 16; c.strokeStyle = i % 2 ? '#3A3A48' : o.d.col; c.beginPath(); c.moveTo(x + Math.cos(a) * 180, y + Math.sin(a) * 110); c.lineTo(x + Math.cos(a) * 300, y + Math.sin(a) * 180); c.stroke() }
    c.restore();
  }
}
function dessineFlaques(c) {
  if (!G.f.length) return;
  for (const f of G.f) {
    const dansEau = (f.cache && !f.ciel) || (f.state === 'atk' && f.move && f.move.plonge && (f.ph === 'st' || f.t < f.move.st + 8));
    if (!dansEau || estMer() || (f.move && f.move.contourne === 'herbe' && f.state === 'atk')) continue; // sous la mer, pas de flaque ; le jaguar rampe dans l'herbe (pas d'eau)
    const w = G.arene === 'riviere' ? 180 : 260;
    c.save(); c.fillStyle = G.arene === 'riviere' ? 'rgba(210,240,255,.35)' : '#3FA9E0'; c.strokeStyle = G.arene === 'riviere' ? 'rgba(255,255,255,.6)' : NV; c.lineWidth = 6;
    c.beginPath(); c.ellipse(f.x, FLOOR + 4, w, 38, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(f.x - 60, FLOOR - 6, 70, 9, 0, 0, TAU); c.fill(); c.restore();
  }
}
// rivière : l'eau passe devant les pattes (tout le monde a pied), reflets qui ondulent, ronds autour des pattes
function eau(c, t) {
  const y0 = FLOOR - 34, gr = c.createLinearGradient(0, y0, 0, H + 60);
  gr.addColorStop(0, 'rgba(140,205,225,0)'); gr.addColorStop(.1, 'rgba(140,205,225,.5)'); gr.addColorStop(1, 'rgba(70,140,170,.62)');
  c.fillStyle = gr; c.fillRect(-300, y0, W + 600, H - y0 + 120);
  c.save(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 16; i++) { const x = ((i * 167 + t * 38 * (1 + i % 3 * .3)) % (W + 400)) - 200, y = y0 + 16 + (i % 4) * 24 + Math.sin(t * 2 + i) * 4, l = 40 + (i % 3) * 32;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 7, x + l, y); c.stroke() }
  for (const f of G.f) { if (f.h > 40 || f.cache) continue; const w = 220 * f.d.K / .44 * (1 + .07 * Math.sin(t * 5 + f.side * 2)); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 5; c.beginPath(); c.ellipse(f.x, FLOOR - 6, w, 17, 0, 0, TAU); c.stroke() }
  c.restore();
}
function plouf(f, s) { if (G.arene !== 'riviere') return; addFx({ k: 'eclabousse', x: f.x + (Math.random() - .5) * 80, y: FLOOR - 10, s }); if (s >= 1) sfx('eclaboussure', Math.min(1, .35 + .35 * s)); else if (Math.random() < .5) sfx('plouf', .12) }
function dizzy(c, f, t) { const x = f.x + f.face * (f.d.spr ? 560 * f.d.K : 250 * f.d.K / .44), y = f.d.spr ? FLOOR - 170 : FLOOR - 210; for (let i = 0; i < 3; i++) { const a = t * 5 + i * TAU / 3; star(c, x + Math.cos(a) * 70, y + Math.sin(a) * 22, 22, 9, 5, JA, NV, 4) } }
function poseOf(f) {
  const st0 = f.state; if (st0 === 'bstun') f.state = f.crouchB ? 'cblock' : 'block';
  const h0 = f.h, sol0 = solDe(f); f.h = Math.max(0, f.h - sol0); // (2D : pour les poses, son altitude est son sol)
  let res = (f.d.spr ? spritePose : f.kind === 'tigre' ? tigerPose : gorillaPose)(f.R, f, G.time); f.state = st0; f.h = h0; f.flipV = !!res.flip;
  if (f.poison && f.poison.genre === 'fil' && ['idle', 'walk', 'walkB'].includes(f.state) && f.R && f.R.layers && (f.aEmmele ?? (f.aEmmele = f.R.layers.some(l => l.n === 'emmele')))) res = SP('emmele', { x: 4 * Math.sin(G.time * 14) }); // le serpent brun emmêlé dans le fil de la veuve noire
  if (f.d.soif && f.soifT && G.frame - f.soifT < 50 && ['idle', 'walk', 'walkB'].includes(f.state) && f.R && f.R.layers && f.R.layers.some(l => l.n === (f.d.soif.pose || 'soif'))) res = SP(f.d.soif.pose || 'soif', { y: 3 * Math.sin(G.time * 12) }); // colibri « J'AI SOIF ! », scolopendre « JE ME DESSÈCHE ! »
  if (f.d.ecrase && f.ecraseT && G.frame - f.ecraseT < 40 && ['hurt', 'down'].includes(f.state) && f.R && f.R.layers && (f.aEcrasee ?? (f.aEcrasee = f.R.layers.some(l => l.n === 'ecrasee')))) res = SP('ecrasee', { x: 3 * Math.sin(G.time * 22) }); // la veuve noire « ÉCRASÉE ! » (livre : on l'écrase d'un doigt)
  if (f.d.myope && f.retourne > 0 && ['idle', 'walk', 'walkB'].includes(f.state) && f.R && f.R.layers && (f.aMyope ?? (f.aMyope = f.R.layers.some(l => l.n === 'myope')))) res = SP('myope', { x: 3 * Math.sin(G.time * 20) }); // la mygale cherche : « OÙ ES-TU ? »
  if (f.ghost && f.ghost.k > 0) f.ghost.k--;
  // pose dessinée (illustration entière) : fondu-traîne avec l'image précédente
  const sp = res.spr || null;
  if (sp !== (f.spr || null)) { if (f.M) f.ghost = { M: f.M, only: f.spr || null, roar: f.roar, k: 4 }; f.spr = sp; f.pp = null; f.blendT = 0; f.lastState = f.state; }
  // animaux marins : ils flottent (petit mouvement de vague), sauf posés sur le sable ou tenus
  if (sp && (f.d.nage || f.d.vole) && !['ko', 'down', 'getup', 'tenu', 'lance', 'crouch', 'cblock'].includes(f.state) && f.h <= sol0 + 1) { const w = G.time * 2.1 + f.side * 1.3, o = res.pose.spr; o.y = (o.y || 0) - 10 * Math.sin(w); o.r = (o.r || 0) + .018 * Math.cos(w)
    if (vol2d(f) && ['idle', 'walk', 'walkB', 'block', 'dash'].includes(f.state)) { const vz = cl((f.vz || 0) * .035, -.26, .26); o.r = (o.r || 0) - vz } } // 2D : il penche vers où il monte ou descend
  if (sp) { f.pose = res.pose; f.roar = res.roar; f.M = Skin.matrices(f.R, f.pose); return; }
  // fondu entre deux poses (évite les sauts)
  if (f.pp && f.blendT > 0) {
    const k = f.blendT / 5;
    for (const bn in f.pp) { const a = f.pp[bn], b = res.pose[bn] || (res.pose[bn] = {}); for (const q of ['r', 'x', 'y']) { const av = a[q] || 0, bv = b[q] || 0; b[q] = bv + (av - bv) * k } }
    f.blendT--;
  }
  if (f.lastState !== f.state) { f.pp = JSON.parse(JSON.stringify(f.pose || res.pose)); f.blendT = ['hurt', 'bstun', 'atk'].includes(f.state) ? 2 : 5; f.lastState = f.state }
  f.pose = res.pose; f.roar = res.roar; f.M = Skin.matrices(f.R, f.pose);
}

// ---------------------------------------------------------------------
//  Boucle de jeu
// ---------------------------------------------------------------------
const G = { proj: [], zones: [], phase: 'loading', monde: 'terre', mode: 1, niv: 0, aide: 0, pick: ['tigre', 'gorille'], f: [], round: 1, timer: 99 * 60, time: 0, frame: 0, pt: 0, stop: 0, shake: 0, slow: 0, freeze: 0, debug: false };
function step() {
  if (NET.on && NET.role === 'invite') return netPasInvite();
  G.time += 1 / 60; G.frame++;
  if (!['fight', 'intro', 'ko'].includes(G.phase)) return;
  G.pt++;
  if (G.shake > 0) G.shake *= .86;
  const [a, b] = G.f; for (const f of G.f) if (f.flash > 0) f.flash--;
  if (G.freeze > 0) { G.freeze--; for (const f of G.f) poseOf(f); updateCam(); return }
  if (G.stop > 0) { G.stop--; updateCam(); return }
  if (G.phase === 'ko' && G.slow > 0) { G.slow--; if (G.slow % 3) { updateCam(); return } }
  if (G.phase === 'intro' && G.pt >= 180) { G.phase = 'fight'; G.pt = 0; for (const f of G.f) setS(f, 'idle') }
  if (G.phase === 'fight') G.chrono = (G.chrono || 0) + 1;
  if (G.god && G.mode === 1 && !NET.on) for (const f of G.f) if (!f.cpu) f.meter = 100; // GOD MODE : SUPER illimité
  if (G.tuto) tutoPas(); else if (G.astuce && window.astucePas) astucePas();
  const ia = a.cpu ? brain(a, b) : lire(0), ib = b.tuto ? tutoBrain(b, a) : b.cpu ? brain(b, a) : NET.on ? netEntreeDistante() : lire(1);
  update(a, b, ia); update(b, a, ib);
  // ils ne se traversent pas au sol
  const tombe = f => f.state === 'atk' && f.move && ((f.move.ciel && f.h > 150) || (f.move.surgit && f.ph === 'act' && f.h > 0 && !f.hit)); // le léopard qui tombe du ciel, le requin qui surgit par en dessous : pas repoussés
  if (((a.h <= 0 && b.h <= 0 || Math.min(a.h, b.h) < 60) || ((vol2d(a) || vol2d(b)) && Math.abs(a.h - b.h) < 150)) && !a.cache && !b.cache && !tombe(a) && !tombe(b)) {
    const L = a.x < b.x ? a : b, Rr = L === a ? b : a, min = L.d.push[1] + Rr.d.push[1], dx = Rr.x - L.x;
    if (dx < min) { const p = Math.min(36, (min - dx) / 2); L.x -= p; Rr.x += p; /* en douceur : pas de téléportation après un plongeon ou une chute du ciel */ if (L.x < STAGE_L) { Rr.x += STAGE_L - L.x; L.x = STAGE_L } if (Rr.x > STAGE_R) { L.x -= Rr.x - STAGE_R; Rr.x = STAGE_R } }
  }
  for (const f of G.f) poseOf(f);
  if (G.phase === 'fight') majEffets();
  if (window.majSurprises) majSurprises(); // caisses surprises, pièges d'arène (surprises.js)
  if (G.phase === 'fight') {
    strike(a, b); if (G.phase === 'fight') strike(b, a); if (G.phase === 'fight') majProj();
    if (G.phase === 'fight' && --G.timer <= 0) { G.timeUp = true; const ka = a.hp / a.d.hp, kb = b.hp / b.d.hp; G.roundWinner = Math.abs(ka - kb) < .001 ? null : ka > kb ? a : b; G.phase = 'ko'; G.pt = 0; sfx('gong') }
  }
  if (G.phase === 'intro' && G.pt === 20) { sfx(a.kind, .6) } if (G.phase === 'intro' && G.pt === 45) { sfx(b.kind, .6) }
  if (G.phase === 'intro' && G.pt === 74) annonceur(G.round >= 3 || (G.f[0].wins === 1 && G.f[1].wins === 1) ? 'final_round' : 'round_' + G.round);
  if (G.phase === 'intro' && G.pt === 142) sfx('gong');
  if (G.phase === 'intro' && G.pt === 156) annonceur('fight');
  if (G.phase === 'ko') {
    const v = G.roundWinner, l = v ? (v === a ? b : a) : null;
    if (G.pt === 100) { if (v) { setS(v, 'win'); v.vx = 0; sfx(v.kind) } if (l && !['hurt', 'down', 'ko'].includes(l.state)) setS(l, 'lose'); if (!v) { setS(a, 'lose'); setS(b, 'lose') } }
    if (v && v.state === 'win' && v.kind === 'gorille' && G.pt % 6 === 0 && G.pt < 190) sfx('tam', .6);
    if (G.pt === 8 && G.timeUp) annonceur('time');
    if (G.pt === 136 && G.perfect && v) annonceur('flawless_victory');
    if (G.pt >= 250) endRound();
  }
  updateCam();
  if (NET.on && NET.role === 'hote' && G.f.length) envoie(capture());
}
function newRound() {
  const [a, b] = G.f;
  for (const [f, x, face] of [[a, 590, 1], [b, 1330, -1]]) Object.assign(f, { grand: 1, repereT: 0, paralyse: false, paraPending: false, poison: null, piques: null, sale: 0, cache: false, ciel: false, glisse: 0, x, face, h: 0, vx: 0, vy: 0, hp: f.d.hp, shown: f.d.hp, trail: f.d.hp, state: 'intro', t: 0, combo: 0, knock: false, stun: 0, inv: 0, hist: [], prev: {}, pose: null, pp: null, ai: { t: 0, hold: {}, react: 0 } });
  for (const f of [a, b]) { f._altMax = null; f.alt = f.h = f.hAvant = vol2d(f) ? Math.min(f.d.vole ? 150 : 110, altMax(f)) : 0 } // 2D : en l'air ou entre deux eaux dès le début
  G.timer = 99 * 60; G.phase = 'intro'; G.pt = 0; G.timeUp = false; G.roundWinner = null; G.perfect = false; FX = []; G.proj = []; G.zones = [];
  if (window.razSurprises) razSurprises();
  cam.z = 1; cam.cx = 960;
}
function endRound() {
  const [a, b] = G.f, v = G.roundWinner; if (v) v.wins++;
  if (window.tropheesManche) tropheesManche(v, v ? (v === a ? b : a) : null); if (G.round === 1 && v) (v === a ? b : a).perdu1 = true;
  // l'ordinateur se calme quand l'enfant perd une manche (jusqu'à 2 crans), et se réveille quand il gagne un match
  if (G.mode === 1 && v && v.cpu) G.aide = Math.min(2, G.aide + 1);
  if (a.wins >= 2 || b.wins >= 2 || G.round >= 5) return endMatch();
  G.round++; newRound();
}
// « TON TIGRE », « TA HYÈNE » (h aspiré), « TON OURSE BRUNE » (voyelle)
const FEMININ = /^(HYÈNE|OURSE|LIONNE|TIGRESSE|AUTRUCHE|ORQUE|GIRAFE|MANTE|ABEILLE|GUÊPE|PANTHÈRE|VIPÈRE|MOUFFETTE|MÈRE|BUFFLONNE|PIEUVRE|MANGOUSTE|BALEINE|MYGALE|VEUVE|CREVETTE|CHAUVE|SCOLOPENDRE)/;
function ton(nom) { return (FEMININ.test(nom) && !/^[AEIOUYÉÈÊÂÎÔ]/.test(nom) ? 'TA ' : 'TON ') + nom }
// « le GORILLE », « la HYÈNE », « l’OURS POLAIRE » (dans une phrase)
function leNom(k, gras) { const a = CHARS[k] ? CHARS[k].art : k, m = a.match(/^(LE |LA |L’)(.*)$/), art = m ? m[1].toLowerCase() : '', n = m ? m[2] : a; return art + (gras ? '<b>' + n + '</b>' : n) }
function endMatch() {
  if (NET.on && NET.role === 'hote') envoie({ t: 'fin', s: capture(), st: G.f.map(f => f.st), pf: G.f.map(f => !!f.parfait) });
  if (NET.on) G.f.forEach((f, i) => f.distant = i !== NET.moi);
  G.phase = 'fin'; const [a, b] = G.f, v = a.wins > b.wins ? a : b.wins > a.wins ? b : null, l = v ? (v === a ? b : a) : null;
  if (G.mode === 1 && v && !v.cpu) G.aide = Math.max(0, G.aide - 1);
  const humain = v && !v.cpu, nv = [];
  let t = !v ? 'MATCH NUL !' : NET.on ? (v.distant ? 'TON AMI GAGNE !' : 'TU GAGNES !') : G.mode === 1 ? (v.cpu ? `${v.d.art} DE L’ORDI GAGNE !` : `${ton(v.d.nom)} GAGNE !`) : (v === a ? 'JOUEUR 1' : 'JOUEUR 2') + ' GAGNE !';
  // étoiles (contre l'ordi) : 1 = gagné, 2 = sans perdre de manche, 3 = en plus une manche parfaite
  let n = 0;
  if (G.mode === 1 && humain && !G.god) { n = 1 + (l.wins === 0 ? 1 : 0) + (v.parfait ? 1 : 0); SAVE.etoiles[v.kind] = Math.max(SAVE.etoiles[v.kind] || 0, n);
    SAVE.gagneAvec[v.kind] = 1; badge('premiere', nv); if (G.niv === 2) badge('costaud', nv); if (Object.keys(SAVE.gagneAvec).length >= 4) badge('explo', nv) }
  if (!G.god) for (const f of G.f) if (!f.cpu && !f.distant) { if (f.st.final) badge('combo', nv); if ((f.st.parades || 0) >= 10) badge('mur', nv); if (f.st.super) badge('super', nv); if (f.parfait) badge('parfait', nv) }
  if (G.mode === 2) badge('duo', nv);
  // carte « Le savais-tu ? » : on découvre l'animal qu'on vient de battre
  let fait = null, neuf = false;
  const connu = k => SAVE.debloques.includes(k); // débloqué pour de vrai (le GOD MODE ou le défi du jour ne comptent pas)
  if (v && !v.cpu && !v.distant && connu(l.kind)) { const k = l.kind, vu = SAVE.cartes[k] || (SAVE.cartes[k] = []), reste = FAITS[k].map((_, i) => i).filter(i => !vu.includes(i));
    if (reste.length) { const i = reste[Math.floor(Math.random() * reste.length)]; vu.push(i); fait = FAITS[k][i]; neuf = true } }
  if (!fait) { const k = [l && l.kind, v && v.kind, a.kind, b.kind].find(x => x && connu(x)); if (k) fait = FAITS[k][Math.floor(Math.random() * FAITS[k].length)] }
  if (nbCartes() >= 10) badge('cartes', nv); if (nbCartes() >= totalCartes()) badge('toutes', nv);
  // tournoi
  let suite = false;
  if (G.mode === 1 && G.tournoi) { if (humain) { G.tournoi.i++; if (G.tournoi.i >= G.tournoi.liste.length) { if (G.tournoi.liste.length >= 2 || ORDRE.filter(debloque).length <= 2) { badge('champion', nv); t = 'CHAMPION DE L’ARÈNE !' } G.tournoi.i = 0 } else suite = true } }
  // le DÉFI d'un animal secret : gagné → ses 3 cartes et son quiz ; perdu → revanche
  const ep = G.epreuve && G.mode === 1 && !NET.on && !G.livre && G.f[1] && G.f[1].kind === G.epreuve.k ? G.epreuve.k : null;
  const legEp = ep && typeof estLegendaire === 'function' && estLegendaire(ep);
  if (ep && humain && legEp) { if (!SAVE.debloques.includes(ep)) SAVE.debloques.push(ep); G.apresEpreuve = null; t = `TU AS RÉVEILLÉ ${CHARS[ep].art} !`; setTimeout(() => { if (G.screen === 'fin' && window.ceremonieLegendaire) ceremonieLegendaire(ep) }, 2400) }
  else if (ep && humain) { SAVE.defis[ep] = 1; G.apresEpreuve = ep; t = `TU AS BATTU ${CHARS[ep].art} !` }
  sauve();
  { const gagne = v && (NET.on ? !v.distant : G.mode === 2 ? true : !v.cpu); if (!G.livre) setTimeout(() => sfx(gagne ? 'victoire' : 'defaite'), 250); setTimeout(() => annonceur(!v ? 'tie' : G.mode === 2 && !NET.on ? 'winner' : gagne ? 'you_win' : 'you_lose'), 1100); if (nv.length) setTimeout(() => sfx('badge'), 1500) }
  if (window.tropheesFin) tropheesFin(v, l, n, nv); // trophées (surprises.js)
  if (window.apresMatch) apresMatch(v, n, nv); // bonus : God Mode, quête du légendaire, défis
  if (G.livre && !NET.on && G.mode === 1) { verdictLivre(v, n, nv); return }
  $('gagnant').textContent = t;
  { const ph = v && PHRASES[v.kind]; $('fin-phrase').hidden = !ph; if (ph) $('fin-phrase').textContent = '« ' + hasard(ph) + ' »' }
  $('fin-etoiles').innerHTML = G.mode === 1 && humain && !G.god ? etoiles(n) : '';
  $('fin-badges').innerHTML = (nv.length ? `<span>🏆 ${nv.length > 1 ? nv.length + ' NOUVEAUX TROPHÉES !' : 'NOUVEAU TROPHÉE : ' + BADGES.find(x => x[0] === nv[0])[1]}</span>` : '') + (G.finExtra || ''); // (25/09, iPhone : une seule ligne)
  $('fait-titre').textContent = neuf ? `NOUVELLE CARTE ! ${nbCartes()}/${totalCartes()} · LE SAVAIS-TU ?` : fait ? 'LE SAVAIS-TU ?' : '🗺️ L’AVENTURE';
  $('fait-txt').textContent = fait || fin('Gagne les duels du livre dans ▶ L’AVENTURE : leurs animaux rejoignent ton équipe… avec leurs cartes « Le savais-tu ? » !');
  $('fin-img').src = (v || a).kind + '_fin.webp';
  const orFin = !!(v && champion(v.kind) && (NET.on ? !v.distant : !v.cpu)); $('fin').classList.toggle('or', orFin); if (orFin) $('fin-badges').innerHTML = '<span class="champ-or">📖 CHAMPION DU LIVRE !</span>' + $('fin-badges').innerHTML;
  $('revanche').textContent = suite ? 'ADVERSAIRE SUIVANT ▶' : G.mode === 1 && G.tournoi && humain ? 'NOUVEAU TOURNOI' : NET.on ? 'REJOUER' : 'REVANCHE !';
  if (ep && legEp) { $('fait-titre').textContent = humain ? '★ LÉGENDE RÉVEILLÉE !' : 'PRESQUE !'; $('fait-txt').textContent = fin(humain ? `${CHARS[ep].art} rejoint tes animaux, pour toujours !` : `${CHARS[ep].art} est costaud… Retente ta chance !`); $('revanche').textContent = humain ? '★ LA CÉRÉMONIE ▶' : '⚔️ REVANCHE !' }
  else if (ep) { const d = CHARS[ep];
    $('fait-titre').textContent = humain ? '🃏 3 CARTES GAGNÉES !' : 'PRESQUE !';
    $('fait-txt').textContent = fin(humain ? `Découvre 3 secrets ${du(ep).toLowerCase()} et réponds à son quiz : ${d.fem ? 'elle' : 'il'} sera à toi !` : `Retente ta chance contre ${leNom(ep)} ! Astuce : en FACILE, c’est plus simple.`);
    $('revanche').textContent = humain ? '🃏 SES CARTES ▶' : '⚔️ REVANCHE !' }
  show('fin');
}
function startMatch() {
  const [p1, p2] = G.pick;
  G.pisteCombat = (G.nbMatchs = (G.nbMatchs || 0) + 1) % 2 ? 'combat1' : 'combat2'; // une musique de combat sur deux
  G.chrono = 0;
  G.f = [Fighter(p1, 0, false), Fighter(p2, 1, G.mode === 1)];
  if (p1 === p2) G.f[1].tint = { tigre: [1.05, 1.02, 1.1, .82], gorille: [.75, .8, 1.15, .45], lion: [1.1, .95, .75, .5], ours: [.8, .95, 1.2, .35], croco: [.7, .9, 1.2, .45], hippo: [1.1, .8, .8, .4], ratel: [.9, .8, .6, .45], komodo: [.8, 1, .8, .4], grizzly: [1.1, .85, .65, .45], hyene: [1.12, .88, .7, .45], buffle: [.85, .9, 1.15, .4], morse: [1.1, .85, .8, .4], trex: [.8, 1.05, .8, .45], leopard: [.9, .85, 1.15, .45], porcepic: [1.15, .95, .8, .4], guepard: [.85, 1, 1.15, .45], autruche: [1.1, .9, 1.1, .4], orque: [.75, .85, 1.25, .45], requin: [.8, 1, 1.2, .4], pieuvre: [.8, .6, 1.2, .45], aiguillat: [.9, .8, .6, .45], espadon: [.7, .9, 1.2, .45], requinbleu: [.8, 1.1, .8, .45], megalo: [.85, .8, 1.2, .45] , jaguar: [.75, .75, .9, .5] , anaconda: [.8, 1, .6, .45] , caiman: [1.1, .95, .7, .45] , puma: [.85, .9, 1.2, .45] , loup: [1.15, .95, .75, .45] , mangouste: [1.12, .95, .78, .45] , cobra: [.7, .72, .95, .5] , oursnoir: [1.35, 1, .7, .55] , glouton: [1.2, 1.05, .8, .45] , python: [.8, .95, .7, .45] , alligator: [.85, 1.05, .8, .45] , lionne: [1.05, .9, 1.15, .45] , girafe: [1.15, .82, .62, .45] , bouledogue: [.85, .95, 1.15, .45] , baleine: [1.1, .95, .8, .45] , crabe: [.8, .9, 1.25, .45] , crevette: [1.2, .8, .9, .45] , frelon: [.8, .85, 1.2, .45] , abeille: [.85, .85, 1.15, .45] , mygale: [1.2, .9, .7, .45] , guepe: [1.15, .8, 1.2, .45] , scolopendre: [1.1, .95, .7, .45] , chauvesouris: [.9, .8, 1.2, .45] , mante: [1.1, .9, 1.2, .45] , colibri: [.85, 1.15, .95, .45] , serpentbrun: [1.1, 1, .8, .45] , veuve: [1.2, .9, .5, .45] , meganeura: [.8, 1.1, .9, .45] }[p2]; // variante de couleur
  if (G.livre && G.livre.noms) G.f.forEach((f, i) => f.nomAff = G.livre.noms[i]);
  if (NET.on) G.f.forEach((f, i) => f.distant = i !== NET.moi); // en ligne : l'animal de l'ami (ses trophées, ses sons « SUPER prêt ») n'est pas le nôtre
  G.nvTroph = [];
  for (const f of G.f) if (!f.cpu && !f.distant && !G.tuto) SAVE.joue[f.kind] = (SAVE.joue[f.kind] || 0) + 1; // ⭐ TES PRÉFÉRÉS
  if (G.f.some(f => champion(f.kind))) setTimeout(() => sfx('super', .5), 200); // 📖 l'entrée d'un champion du livre
  G.round = 1; newRound(); show(null);
  G.astuce = null; if (!G.tuto && window.astuceDebut) astuceDebut(); // (25/09) un coup avancé à essayer, pendant les premiers combats
  { const moi = G.f[NET.on ? NET.moi : 0], lui = G.f[NET.on ? 1 - NET.moi : 1]; if (moi && !moi.cpu && !G.tuto && !G.astuce && (vol2d(moi) || vol2d(lui))) { SAVE.vuVol = SAVE.vuVol || {}; const k = vol2d(moi) ? (moi.d.vole ? 'air' : 'eau') : lui.d.vole ? 'contreAir' : 'contreEau'; if ((SAVE.vuVol[k] || 0) < 2) { SAVE.vuVol[k] = (SAVE.vuVol[k] || 0) + 1; sauve(); astuceVol(k) } } } // 2D : l'astuce, les 2 premières fois (on vole / on nage, ou l'autre vole / nage)
  document.body.classList.toggle('deux', G.mode === 2 && !NET.on);
  for (const T of [TOUCH, TOUCH2]) { T.x = T.y = 0; T.L = T.H = T.S = T.G = false }
}
// 2D : « TU VOLES ! / TU NAGES ! ▲ monte, ▼ descends » (6 s, dans la bulle du tutoriel) — (M7) textes courts : la bulle ne cache plus le combat
function astuceVol(k) {
  const e = $('tuto-bulle'); if (!e) return; const tact = document.body.classList.contains('tactile');
  const contre = k === 'contreAir' || k === 'contreEau';
  e.innerHTML = contre ? `<small>ATTENTION !</small><b class="R">${k === 'contreAir' ? 'IL VOLE !' : 'IL NAGE AU-DESSUS !'}</b><span>${tact ? 'Saute (▲) et tape PENDANT le saut !' : 'Saute (↑) et tape (J ou K) PENDANT le saut !'}</span>`
    : `<small>NOUVEAU !</small><b class="R">${k === 'air' ? 'TU VOLES !' : 'TU NAGES !'}</b><span>${tact ? '▲ monte · ▼ descends' : '↑ monte · ↓ descends'} : tape à sa hauteur !</span>`; e.hidden = false;
  clearTimeout(astuceVol.t); astuceVol.t = setTimeout(() => { if (!G.tuto) e.hidden = true }, 6500);
}
function pause() { if (NET.on) return; if (G.phase === 'pause') { G.phase = G.before; show(null) } else { G.before = G.phase; G.phase = 'pause'; KEYS.clear(); show('pause') } }

let acc = 0, last = performance.now();
function loop(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { step(); acc -= 1000 / 60 }
  render(); requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------
//  Écrans (menu, choix, VS, fin) et commandes tactiles
// ---------------------------------------------------------------------
const ECRANS = ['titre', 'choix', 'arenes', 'vs', 'pause', 'fin', 'code', 'trophees', 'enligne', 'appli', 'quiz', 'epreuve', 'adeux', 'livre', 'pari', 'verdict', 'invite', 'parents', 'defi', 'legende', 'tuto', 'nom'];
function show(id) {
  for (const e of ECRANS) { const el = $(e); if (el) el.hidden = e !== id }
  document.body.classList.toggle('en-combat', !id || id === 'pause'); document.body.classList.toggle('en-pause', id === 'pause'); document.body.classList.toggle('en-menu-titre', id === 'titre'); document.body.classList.toggle('en-menu', !!id && id !== 'pause' && id !== 'titre');
  if (id) G.screen = id;
  document.body.dataset.ecran = id || 'combat';
  if (id === 'titre') { const j = $('livre-titre'); if (j) j.classList.toggle('nouveau-defis', !SAVE.vuAventure && Object.keys(SAVE.livre || {}).length > 0); if (window.majAccueil) majAccueil() } // autocollant « NOUVEAU » (anciens joueurs) jusqu'à la 1re visite de l'aventure
  if (id === 'livre' && !SAVE.vuAventure) { SAVE.vuAventure = 1; sauve() }
  if (id === 'choix' && !SAVE.vuDefis) { SAVE.vuDefis = 1; sauve() } // (l'autocollant « ⚔️ NOUVEAU : LES DÉFIS ! » disparaît après la première visite) // la mer est nouvelle : un autocollant sur JOUER jusqu'à la première visite
}
let selCursor = 0, selStage = 0;
G.onglet = 'fav';
// cartes de l'onglet affiché : les jouables d'abord, puis les animaux à gagner dans l'aventure, puis les champions du livre (cartes dorées)
function favoris() { // les 4 animaux les plus joués (complétés par ceux de base pour un nouveau joueur)
  const l = Object.keys(SAVE.joue || {}).filter(k => CHARS[k] && debloque(k)).sort((a, b) => SAVE.joue[b] - SAVE.joue[a]).slice(0, 4);
  for (const k of DE_BASE) if (l.length < 4 && !l.includes(k) && CHARS[k]) l.push(k);
  return l;
}
const ongletVisible = o => o.k === 'fav' ? !NET.on && !G.epreuve && !(selStage === 1 && !NET.on) : mondeOuvert(o.m);
const ongletPermis = o => { if (G.epreuve && !G.pick[1]) return o.m === mondeDe(G.epreuve.k); if (selStage === 1 && !NET.on) return o.m === G.monde; return true };
function synchroOnglet() { // l'onglet affiché doit correspondre au monde des combats (changé à distance en ligne, ou par vaVers)
  const o = ongletDe(G.onglet);
  if (!ONGLETS.some(x => x.k === G.onglet) || !ongletVisible(o) || !ongletPermis(o) || (o.m && o.m !== G.monde)) {
    const r = G.monde === 'terre' ? (G.pick[0] && selStage === 1 && mondeDe(G.pick[0]) === 'terre' ? regionDe(G.pick[0]) : G.epreuve ? regionDe(G.epreuve.k) : ONGLETS.find(x => x.m === 'terre' && x.k === SAVE.region) ? SAVE.region : 'savane') : G.monde;
    G.onglet = r;
  }
}
function CARTES() {
  if (G.onglet === 'fav') return favoris(); // (le 🎲 AU HASARD est dans la barre du bas)
  const o = ongletDe(G.onglet), L = LISTE(o.m).filter(k => o.m !== 'terre' || regionDe(k) === o.k);
  const ok = L.filter(debloque), non = L.filter(k => !debloque(k));
  return ok.concat(non.filter(k => !champion(k)), non.filter(champion));
}
const nbCartesChoix = () => CARTES().length;
// aller à la carte d'un animal (on passe dans son onglet)
function vaVers(k) { G.monde = mondeDe(k); G.onglet = regionDe(k); selCursor = Math.max(0, CARTES().indexOf(k)) }
function menuKey(code) {
  if (G.phase === 'menu' && G.screen === 'titre' && ['Enter', 'Space', 'KeyF', 'KeyJ'].includes(code)) { $('livre-titre').click(); return } // Entrée : ▶ L'AVENTURE
  if (G.phase === 'menu' && G.screen === 'choix') {
    const n = nbCartesChoix(), col = n <= 4 ? n : 4;
    if (['KeyA', 'ArrowLeft'].includes(code)) { selCursor = (selCursor + n - 1) % n; majChoix(); sfx('clic') }
    if (['KeyD', 'ArrowRight'].includes(code)) { selCursor = (selCursor + 1) % n; majChoix(); sfx('clic') }
    if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown'].includes(code)) { selCursor = (selCursor + col) % Math.max(col, n); if (selCursor >= n) selCursor = n - 1; majChoix(); sfx('clic') }
    if (['KeyE', 'PageDown', 'KeyQ', 'PageUp'].includes(code)) { const L = ONGLETS.filter(o => ongletVisible(o) && ongletPermis(o)), i = L.findIndex(o => o.k === G.onglet), s = ['KeyQ', 'PageUp'].includes(code) ? -1 : 1; if (L.length > 1) changeOnglet(L[(i + s + L.length) % L.length].k) }
    if (['Enter', 'Space', 'KeyF', 'KeyJ', 'Numpad1', 'Comma'].includes(code)) clicCarte(CARTES()[selCursor]);
  }
  if (G.phase === 'menu' && G.screen === 'arenes') {
    const n = (G.arenesListe || ARENES).length + 1;
    if (['KeyA', 'ArrowLeft'].includes(code)) { selArene = (selArene + n - 1) % n; majArenes(); sfx('clic') }
    if (['KeyD', 'ArrowRight'].includes(code)) { selArene = (selArene + 1) % n; majArenes(); sfx('clic') }
    if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown'].includes(code)) { selArene = (selArene + 4) % n; majArenes(); sfx('clic') }
    if (['Enter', 'Space', 'KeyF', 'KeyJ', 'Numpad1', 'Comma'].includes(code)) prendArene(selArene);
    if (code === 'Escape' || code === 'Backspace') $('arenes-retour').click();
  }
  if (G.phase === 'menu' && G.screen === 'choix' && (code === 'Escape' || code === 'Backspace') && (selStage === 1 || G.epreuve)) $('retour-choix').click();
  if (G.phase === 'menu' && G.screen === 'code' && code === 'Enter') $('code-ok').click();
  if (G.phase === 'menu' && G.screen === 'enligne' && (code === 'Enter' || code === 'NumpadEnter') && !$('net-invite').hidden) $('net-ok').click();
}
function etoiles(n, max = 3) { let s = ''; for (let i = 0; i < max; i++) s += i < n ? '<b>★</b>' : '★'; return s }
function construitCartes() {
  setTimeout(() => { if (window.hlMarqueCartes) hlMarqueCartes() }, 0); // sans internet : les animaux pas encore sur l'appareil sont grisés (☁️)
  synchroOnglet(); majOnglets();
  const box = $('cartes'); box.innerHTML = ''; const L = CARTES(); if (selCursor >= L.length) selCursor = 0;
  const page = Math.floor(selCursor / PAGE_CARTES), debut = page * PAGE_CARTES; box.dataset.page = page; // (25/09, iPhone : 8 grandes cartes par page)
  box.dataset.monde = G.onglet === 'fav' ? 'fav' : ongletDe(G.onglet).m; box.dataset.onglet = G.onglet; box.classList.toggle('peu', L.length <= 5);
  box.classList.remove('treize', 'trois', 'defile', 'quatre'); box.style.gridTemplateColumns = '';
  L.slice(debut, debut + PAGE_CARTES).forEach((k, j) => {
    const i = debut + j, b = document.createElement('button'); b.type = 'button'; b.dataset.i = i;
    if (k === 'hasard') { b.className = 'carte hasard'; b.innerHTML = '<span class="img"><b>🎲</b></span><span class="nom">AU HASARD</span><span class="ets">&nbsp;</span>'; b.onclick = () => { selCursor = i; majChoix(); clicCarte('hasard') }; b.onmouseenter = () => { selCursor = i; majChoix() }; box.appendChild(b); return }
    const d = CHARS[k], ok = debloque(k), leg = k === 'trex' || k === 'megalo' || k === 'meganeura', ch = champion(k), bloque = !ok && ((selStage === 1 && !NET.on && G.mode === 2) || NET.on || (G.epreuve && !G.pick[1]));
    b.className = 'carte ' + k + (ok ? '' : ' verrou') + (leg ? ' legende' : '') + (ch ? ' champion' : '') + (bloque ? ' inactif' : '') + (d.nom.length > 12 ? ' long' : '') + (selStage === 1 && G.pick[0] === k && !NET.on ? ' pris1' : ''); b.id = 'c-' + k;
    if (selStage === 1 && G.pick[0] === k && !NET.on) b.dataset.tag = G.mode === 2 ? 'J1' : 'TOI';
    const src = !ok && window.sourceDe ? sourceDe(k) : null, ets = ok ? etoiles(SAVE.etoiles[k] || 0) : ch ? '📖 LIVRE' : src && src.t === 'duel' ? `🗺️ DUEL ${String(src.D.n).padStart(2, '0')}` : src && src.t === 'legende' ? '★ LÉGENDE' : '🔒';
    b.innerHTML = `<span class="img"><img src="${k}_corps.webp" alt=""></span><span class="nom">${d.nom}</span><span class="ets${ok ? '' : ' quiz'}">${ets}</span>`;
    b.onclick = () => { selCursor = i; majChoix(); clicCarte(k) };
    b.onmouseenter = () => { selCursor = i; majChoix() };
    box.appendChild(b);
  });
  majChoix(); majFleches();
}
// flèches ◀ ▶ : les pages de 8 cartes (25/09, iPhone)
const PAGE_CARTES = 8;
function majFleches() { const g = $('cartes-g'), d = $('cartes-d'), n = Math.ceil(nbCartesChoix() / PAGE_CARTES); if (g) g.hidden = n < 2; if (d) d.hidden = n < 2 }
function pageCartes(s) { const n = nbCartesChoix(), pages = Math.ceil(n / PAGE_CARTES); if (pages < 2) return; const p = (Math.floor(selCursor / PAGE_CARTES) + s + pages) % pages; selCursor = p * PAGE_CARTES; sfx('clic'); construitCartes() }
// onglets ⭐ PRÉFÉRÉS · 🦁 SAVANE · 🐊 JUNGLES · 🌲 GRAND NORD · 🌊 MER · 🐞 BÊTES
function majOnglets() {
  const box = $('mondes'); if (!box) return;
  if (!box.dataset.fait) { box.dataset.fait = 1; box.innerHTML = ONGLETS.map(o => `<button class="btn monde" data-onglet="${o.k}" type="button" aria-pressed="false"><i>${o.ico}</i><em>${o.nom}</em></button>`).join(''); box.querySelectorAll('.monde').forEach(b => b.onclick = () => changeOnglet(b.dataset.onglet)) }
  box.querySelectorAll('.monde').forEach(b => { const o = ongletDe(b.dataset.onglet), on = o.k === G.onglet; b.hidden = !ongletVisible(o); b.setAttribute('aria-pressed', on); b.disabled = !on && !ongletPermis(o); b.classList.toggle('nouveau', ((o.k === 'mer' && !SAVE.vuMer) || (o.k === 'betes' && !SAVE.vuBetes)) && !on) });
}
// changer d'onglet : dans la TERRE, on passe d'une région à l'autre ; un autre monde change aussi le monde des combats
function changeOnglet(k) {
  const o = ongletDe(k); if (k === G.onglet || !ongletVisible(o) || !ongletPermis(o)) return;
  if (o.m && o.m !== G.monde) { changeMonde(o.m, false, k); return }
  G.onglet = k; SAVE.onglet = k; if (o.m === 'terre') SAVE.region = k; sauve(); selCursor = 0; sfx('clic'); construitCartes();
}
function changeMonde(m, distant, onglet) {
  if (!MONDES[m] || !mondeOuvert(m) || (m === G.monde && !onglet) || (selStage === 1 && !NET.on)) return;
  G.monde = m; SAVE.monde = m; if (m === 'mer') SAVE.vuMer = 1; if (m === 'betes') SAVE.vuBetes = 1;
  G.onglet = onglet || (m === 'terre' ? SAVE.region || 'savane' : m); SAVE.onglet = G.onglet; sauve();
  selCursor = 0; sfx('clic'); if (m === 'mer') sfx('plouf', .5); if (m === 'betes') sfx('ailes', .7);
  if (NET.on) { NET.pret = {}; selStage = 0; if (!distant) envoie({ t: 'monde', m }); $('choix-titre').textContent = distant ? `TON AMI A CHOISI : ${MONDES[m].ico} ${MONDES[m].nom}` : NET.role === 'hote' ? 'CHOISIS TON ANIMAL (tu es J1, à gauche)' : 'CHOISIS TON ANIMAL (tu es J2, à droite)' }
  construitCartes();
}
function majChoix() {
  if (+($('cartes').dataset.page || 0) !== Math.floor(selCursor / PAGE_CARTES)) { construitCartes(); return } // (le curseur a changé de page)
  document.querySelectorAll('#cartes .carte').forEach(c => c.classList.toggle('curseur', +c.dataset.i === selCursor));
  const o = ongletDe(G.onglet), lieu = G.onglet === 'fav' ? '⭐ TES PRÉFÉRÉS' : `${o.ico} ${o.titre}`;
  if (!NET.on) $('choix-titre').textContent = G.epreuve && !G.pick[1] ? `QUI VA AFFRONTER ${CHARS[G.epreuve.k].art} ?` : selStage === 0 ? (G.mode === 2 ? 'JOUEUR 1 : TON ANIMAL' : 'CHOISIS TON ANIMAL') : G.mode === 2 ? 'JOUEUR 2 : À TOI !' : 'CHOISIS TON ADVERSAIRE'; // (25/09, M5 : le lieu se lit sur l'onglet allumé)
  const k = CARTES()[selCursor], d = k && CHARS[k], s1 = selStage === 1 && !NET.on;
  $('retour-choix').hidden = !!NET.on; $('hasard-btn').hidden = !!NET.on || !!G.epreuve; $('tournoi-btn').hidden = !(s1 && G.mode === 1 && !G.epreuve); $('trophees-btn').hidden = s1;
  const src = d && !debloque(k) && window.sourceDe ? sourceDe(k) : null, la = d && d.fem ? 'la' : 'le';
  $('detail').innerHTML = ''; if (G.detailComplet) $('detail').innerHTML = k === 'hasard' ? '🎲 Un animal au hasard, parmi ceux que tu as !' : !d ? '' : !debloque(k) ? (s1 && G.mode === 1 ? `Tu peux ${d.fem ? 'l’affronter' : 'l’affronter'} ! Pour ${la} jouer, ${src && src.t === 'duel' ? `gagne le <b>duel ${src.D.n}</b> de l’aventure.` : champion(k) ? `trouve-${la} dans le livre (page ${pageLivre(k)}).` : 'finis l’aventure.'}`
    : champion(k) ? `📖 <b>CHAMPION DU LIVRE</b> : ${d.fem ? 'elle' : 'il'} t’attend <b>page ${pageLivre(k)}</b> du livre.`
    : src && src.t === 'duel' ? `🗺️ Gagne le <b>duel ${src.D.n}</b> de l’aventure (${esc(src.D.q.toLowerCase())}) : ${d.fem ? 'elle' : 'il'} rejoint tes animaux !` : src && src.t === 'legende' ? '★ <b>LÉGENDE</b> : elle se réveille après la finale de l’aventure !' : 'Bientôt dans l’arène !')
    : `<b>${d.nom}</b> · ★ Spécial : <b>${d.moves[d.speAff || 'S'].nom}</b> · Super : <b>${d.moves.SUPER.nom}</b>`;
}
function clicCarte(k) {
  if (k === 'hasard') { animalAuHasard(); return }
  if (!debloque(k)) {
    if (NET.on) return;
    if (G.epreuve && !G.pick[1]) { sfx('erreur'); $('detail').innerHTML = `Pour affronter ${leNom(G.epreuve.k, true)}, choisis un animal que tu as déjà !`; return }
    if (G.mode === 2) { sfx('erreur'); $('detail').innerHTML = 'Les animaux à gagner se gagnent dans <b>L’AVENTURE</b>.'; return }
    if (selStage === 1 && G.mode === 1) { choisir(k); return } // 25/09 : on peut AFFRONTER tous les animaux (on ne joue que ceux qu'on a gagnés)
    if (champion(k)) ouvreVitrine(k); else ouvreInfoAnimal(k); return
  }
  choisir(k);
}
function choisir(k) {
  sonInit(); sfx('valide'); sfx(k, .6);
  if (NET.on) { netChoisit(k); return }
  if (G.epreuve && !G.pick[1]) { G.monde = mondeDe(G.epreuve.k); G.pick = [k, G.epreuve.k]; G.tournoi = null; ouvreArenes(); return } // le défi : son animal contre l'animal secret
  if (selStage === 0) { G.pick[0] = k; G.monde = memeMonde(k, G.monde) && ONGLETS.find(o => o.k === G.onglet && o.m) ? G.monde : mondeDe(k); selStage = 1; G.tournoi = null; construitCartes(); return }
  // 1 joueur : on choisit son adversaire (Vincent) ; 2 joueurs : le joueur 2 choisit son animal
  G.pick[1] = k; G.tournoi = null; ouvreArenes();
}
// 1 joueur : le tournoi enchaîne tous les autres animaux, dans le désordre
function lanceTournoi() {
  const k = G.pick[0], autres = LISTE().filter(x => x !== k && debloque(x)).sort(() => Math.random() - .5);
  G.tournoi = { liste: autres.length ? autres : [k], i: 0 }; G.pick[1] = G.tournoi.liste[0]; sfx('valide'); ouvreArenes();
}
function adversaireAuHasard() { const l = LISTE().filter(debloque); choisir(l[Math.floor(Math.random() * l.length)]) }
// 🎲 AU HASARD : l'adversaire (2ᵉ étape), ou son propre animal parmi ceux de l'onglet (tous les mondes dans ⭐)
function animalAuHasard() {
  if (selStage === 1 && !NET.on) { adversaireAuHasard(); return }
  const l = (G.onglet === 'fav' ? ORDRE.filter(k => debloque(k) && mondeOuvert(mondeDe(k))) : CARTES().filter(k => k !== 'hasard' && debloque(k)));
  if (!l.length) return; const k = l[Math.floor(Math.random() * l.length)]; if (G.onglet === 'fav') G.monde = mondeDe(k); choisir(k);
}
// --- chargement d'un animal (images + squelette), une seule fois
const CHARGE = {};
function chargeAnimal(k) {
  if (!CHARGE[k]) CHARGE[k] = Promise.all([Skin.load(k, ''), new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = k + '_tete.webp' })])
    .then(([rig, tete]) => { G.rigs[k] = rig; G.heads[k] = tete; return rig })
    .catch(e => { delete CHARGE[k]; throw e }); // réseau capricieux : on pourra réessayer
  return CHARGE[k];
}
// --- choix de l'arène
let selArene = 0; G.arene = 'savane'; G.bgs = {};
function chargeArene(k) {
  const a = ARENES.find(x => x.k === k) || ARENES[0];
  if (!G.bgs[a.k]) G.bgs[a.k] = new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = a.img }).catch(e => { delete G.bgs[a.k]; throw e });
  return G.bgs[a.k];
}
function ouvreArenes() {
  G.phase = 'menu'; show('arenes');
  const box = $('arenes-liste'); box.innerHTML = '';
  $('arenes-titre').textContent = NET.on ? 'TU CHOISIS L’ARÈNE' : 'CHOISIS L’ARÈNE';
  const L = G.arenesListe = arenesDe(mondeDuel(G.pick[0], G.pick[1] || G.pick[0])); box.classList.toggle('peu', L.length <= 2); box.classList.toggle('beaucoup', L.length >= 12 && L.length <= 14); box.classList.toggle('tres', L.length > 14); // les arènes du monde des deux animaux (plus il y en a, plus les vignettes sont petites)
  L.forEach((a, i) => { // (25/09, iPhone : 8 grandes vignettes par page ; « AU HASARD » est le gros bouton du bas)
    const b = document.createElement('button'); b.type = 'button'; b.className = 'arene'; b.dataset.i = i;
    b.style.backgroundImage = `url(mini_${a.k}.webp)`; b.innerHTML = `<span>${a.nom}</span>`;
    b.onclick = () => { selArene = i; majArenes(); prendArene(i) }; b.onmouseenter = () => { selArene = i; majArenes() };
    box.appendChild(b);
  });
  $('arene-hasard').onclick = () => { selArene = L.length; prendArene(L.length) };
  $('arenes-g').onclick = () => pageArenes(-1); $('arenes-d').onclick = () => pageArenes(1);
  const i = L.findIndex(x => x.k === G.arene); selArene = i < 0 ? 0 : i; G.pageArene = Math.floor(selArene / PAGE_ARENES); majArenes();
  for (const a of L) chargeArene(a.k).catch(() => { });
}
const PAGE_ARENES = 8;
function majArenes() {
  const L = G.arenesListe || ARENES, pages = Math.ceil(L.length / PAGE_ARENES); if (selArene < L.length) G.pageArene = Math.floor(selArene / PAGE_ARENES);
  document.querySelectorAll('#arenes-liste .arene').forEach(c => { const i = +c.dataset.i; c.hidden = Math.floor(i / PAGE_ARENES) !== (G.pageArene || 0); c.classList.toggle('curseur', i === selArene) });
  $('arene-hasard').classList.toggle('curseur', selArene === L.length); $('arenes-g').hidden = $('arenes-d').hidden = pages < 2;
}
function pageArenes(s) { const L = G.arenesListe || ARENES, pages = Math.ceil(L.length / PAGE_ARENES); if (pages < 2) return; G.pageArene = ((G.pageArene || 0) + s + pages) % pages; selArene = G.pageArene * PAGE_ARENES; sfx('clic'); majArenes() }
function prendArene(i) {
  const L = G.arenesListe || ARENES, a = L[i]; G.arene = a ? a.k : L[Math.floor(Math.random() * L.length)].k; G.areneHasard = !a;
  sfx('valide');
  if (NET.on) { envoie({ t: 'go', pick: G.pick, arene: G.arene }); }
  vs();
}
function vs() {
  G.phase = 'vs'; show('vs');
  chargeArene(G.arene).then(i => { G.bgImg = i }).catch(() => { });
  $('vs-g').src = G.pick[0] + '_vs.webp'; $('vs-d').src = G.pick[1] + '_vs.webp';
  $('vs-nom-g').textContent = G.livre && G.livre.noms ? G.livre.noms[0] : CHARS[G.pick[0]].nom; $('vs-nom-d').textContent = G.livre && G.livre.noms ? G.livre.noms[1] : CHARS[G.pick[1]].nom;
  $('vs').classList.remove('anim'); void $('vs').offsetWidth; $('vs').classList.add('anim');
  $('vs').classList.toggle('or-g', champion(G.pick[0])); $('vs').classList.toggle('or-d', champion(G.pick[1])); // 📖 CHAMPION DU LIVRE
  sfx('boum', .8); sfx('foule', .45);
  const pret = Promise.all([chargeAnimal(G.pick[0]), chargeAnimal(G.pick[1]), chargeArene(G.arene).then(i => { G.bgImg = i }).catch(() => { })]);
  const attente = new Promise(r => setTimeout(r, 2600));
  Promise.all([pret, attente]).then(() => { if (G.phase === 'vs') { startMatch(); if (NET.on && NET.role === 'invite') { G.phase = 'intro' } } })
    .catch(() => { if (G.phase !== 'vs') return; const hors = !navigator.onLine; $('charge').hidden = false; $('charge').textContent = hors ? 'Pas d’internet : cet animal n’est pas encore sur cet appareil. Choisis-en un autre !' : 'Oups, une image n’a pas pu se charger. Vérifie la connexion…';
      setTimeout(() => { $('charge').hidden = true; if (G.phase === 'vs') { G.phase = 'menu'; show('choix'); selStage = 0; construitCartes() } }, 3800) }); // (sans internet : retour au choix, jamais bloqué)
}
function toMenu() { if (NET.on) netFerme(); finEpreuve(); const livre = G.livre; G.livre = null; G.phase = 'menu'; G.f = []; selStage = 0; selCursor = 0; if (livre && window.ouvreLivre) ouvreLivre(); else show('titre') }
// --- code secret
function ouvreCode() { G.phase = 'menu'; show('code'); $('code-msg').textContent = ''; $('code-in').value = ''; setTimeout(() => $('code-in').focus(), 50) }
function valideCode() {
  const v = $('code-in').value.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const k = CODES[v];
  if (!k) { $('code-msg').textContent = 'Ce n’est pas le bon code… Cherche bien dans le livre !'; sfx('erreur'); return }
  if (debloque(k)) { $('code-msg').textContent = `Tu as déjà débloqué ${CHARS[k].art} !`; return }
  SAVE.debloques.push(k); const nv = []; badge('secret', nv); sauve();
  $('code-msg').textContent = `BRAVO ! ${CHARS[k].art} rejoint l’arène !`; sonInit(); sfx('super'); sfx(k, 1);
  setTimeout(() => { show('choix'); vaVers(k); construitCartes() }, 1400);
}
// typographie française : espace fine insécable avant ? ! : ; » et après « (pas de « ? » tout seul en début de ligne)
function fin(t) { return String(t).replace(/ ([?!:;»])/g, '\u202F$1').replace(/« /g, '«\u202F') }
function melange(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
// ---------------------------------------------------------------------
//  LE DÉFI (25/09) : les animaux à gagner SANS le livre. « LE PUMA TE DÉFIE ! » → on le bat → ses 3 cartes « Le savais-tu ? »
//  → 3 questions sur ces cartes (QUIZ) → il rejoint l'arène. Une erreur ? La carte réapparaît, la question revient plus tard.
// ---------------------------------------------------------------------
const Q = {};
const du = k => { const a = CHARS[k].art; return a.startsWith('LE ') ? 'DU ' + a.slice(3) : 'DE ' + a }; // « DU PUMA », « DE LA HYÈNE », « DE L’OURS »
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function finEpreuve() { G.epreuve = null; G.apresEpreuve = null }
function ouvreEpreuve(k) {
  if (!QUIZ[k]) return;
  sonInit(); sfx('clic'); setTimeout(() => sfx(k, .8), 250); G.phase = 'menu'; show('epreuve');
  const d = CHARS[k], battu = !!SAVE.defis[k], la = d.fem ? 'la' : 'le';
  $('epreuve').classList.remove('or'); $('epreuve').classList.toggle('battu', battu);
  $('ep-img').src = k + '_vs.webp'; $('ep-sur').textContent = battu ? `TU ${d.fem ? 'L’AS BATTUE' : 'L’AS BATTU'} !` : 'UN ANIMAL SECRET…';
  $('ep-titre').textContent = battu ? `${d.art} T’ATTEND AU QUIZ !` : `${d.art} TE DÉFIE !`;
  $('ep-etapes').innerHTML = [['⚔️', `Bats-${la} en duel`], ['🃏', 'Gagne 3 de ses cartes « Le savais-tu ? »'], ['❓', 'Réponds à 3 questions sur ces cartes']]
    .map(([i, t], n) => `<li class="${n === 0 && battu ? 'ok' : ''}"><i>${n === 0 && battu ? '✔' : i}</i>${fin(t)}</li>`).join('');
  $('ep-txt').innerHTML = fin(`Et ${d.fem ? 'elle' : 'il'} rejoint ton équipe !`);
  const go = $('ep-go'), qz = $('ep-quiz');
  go.textContent = battu ? '❓ LE QUIZ !' : '⚔️ RELEVER LE DÉFI !'; go.onclick = () => battu ? (sfx('valide'), ouvreSecrets(k)) : lanceEpreuve(k);
  qz.hidden = !battu; qz.textContent = '⚔️ LE REBATTRE'; qz.onclick = () => lanceEpreuve(k);
}
function lanceEpreuve(k) {
  sonInit(); sfx('valide'); G.epreuve = { k }; G.apresEpreuve = null; G.livre = null; G.defi = null; G.jour = null; G.tournoi = null;
  if (G.mode !== 1) { G.mode = 1; $('m1').setAttribute('aria-pressed', true); $('m2').setAttribute('aria-pressed', false); $('niveaux').hidden = false }
  G.phase = 'menu';
  if (selStage === 1 && G.pick[0] && CHARS[G.pick[0]] && memeMonde(G.pick[0], k)) { G.pick[1] = k; ouvreArenes(); return } // il avait déjà choisi son animal
  selStage = 0; G.pick = [null, null]; G.monde = mondeDe(k); G.onglet = regionDe(k); selCursor = 0; show('choix'); construitCartes();
}
// 🃏 les 3 cartes gagnées (ce sont elles qui contiennent les réponses du quiz)
function ouvreSecrets(k) {
  const z = QUIZ[k]; if (!z) return;
  sonInit(); G.phase = 'menu'; show('quiz'); $('quiz').classList.add('defi'); $('quiz').classList.remove('or', 'q-duel', 'gagne');
  const qs = melange(z).slice(0, 3), cartes = [...new Set(qs.map(q => q[2]))];
  const vu = SAVE.cartes[k] || (SAVE.cartes[k] = []); for (const c of cartes) if (!vu.includes(c)) vu.push(c); sauve();
  Object.assign(Q, { k, lem: null, qs, cartes, i: 0, file: qs.slice(), reussi: [], bloque: false });
  $('quiz-img').style.backgroundImage = `url(${k}_corps.webp)`; $('quiz-img').classList.remove('ombre');
  sfx('badge'); montreCarte();
}
function montreCarte() {
  const k = Q.k, n = Q.cartes.length, dernier = Q.i >= n - 1;
  $('quiz-titre').textContent = `🃏 LES SECRETS ${du(k)}`;
  $('quiz-intro').innerHTML = fin(`Carte ${Q.i + 1} sur ${n} : lis bien, le quiz arrive !`);
  $('quiz-pas').innerHTML = Q.cartes.map((_, i) => `<i class="${i < Q.i ? 'ok' : i === Q.i ? 'en' : ''}"></i>`).join('');
  $('quiz-q').innerHTML = `<span class="carte-secret"><b>LE SAVAIS-TU ?</b>${esc(fin(FAITS[k][Q.cartes[Q.i]]))}</span>`;
  $('quiz-rep').innerHTML = ''; $('quiz-msg').textContent = '';
  const s = $('quiz-suite'); s.hidden = false; s.textContent = dernier ? '❓ AU QUIZ !' : 'CARTE SUIVANTE ▶';
  s.onclick = () => { sfx('clic'); if (dernier) poseQuestionDefi(); else { Q.i++; montreCarte() } };
}
function poseQuestionDefi() {
  const [txt, reps] = Q.file[0];
  $('quiz-titre').textContent = `❓ LE QUIZ ${du(Q.k)}`;
  $('quiz-intro').innerHTML = fin('Réponds juste aux <b>3 questions</b> : les réponses sont dans ses cartes !');
  $('quiz-pas').innerHTML = Q.qs.map(q => `<i class="${Q.reussi.includes(q) ? 'ok' : q === Q.file[0] ? 'en' : ''}"></i>`).join('');
  $('quiz-q').textContent = fin(txt); $('quiz-msg').textContent = ''; Q.bloque = false; $('quiz-suite').hidden = true;
  const box = $('quiz-rep'); box.innerHTML = '';
  for (const r of melange(reps)) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = fin(r); b.onclick = () => repondDefi(b, r === reps[0]); box.appendChild(b) }
}
function repondDefi(b, juste) {
  if (Q.bloque) return; Q.bloque = true;
  document.querySelectorAll('#quiz-rep .btn').forEach(x => { x.disabled = true });
  const q = Q.file.shift();
  if (juste) {
    b.classList.add('bon'); sfx('valide'); Q.reussi.push(q); $('quiz-msg').textContent = ['BRAVO !', 'EXACT !', 'TOUT JUSTE !'][Q.reussi.length - 1] || 'BRAVO !';
    setTimeout(() => { if (G.screen !== 'quiz') return; if (!Q.file.length) quizGagne(); else poseQuestionDefi() }, 950);
  } else {
    b.classList.add('faux'); sfx('erreur'); Q.file.push(q); // la question reviendra à la fin
    $('quiz-msg').innerHTML = `Raté ! Relis sa carte : <span class="carte-rappel">${esc(fin(FAITS[Q.k][q[2]]))}</span>`;
    const s = $('quiz-suite'); s.hidden = false; s.textContent = 'CONTINUER ▶'; s.onclick = () => { sfx('clic'); poseQuestionDefi() };
  }
}
// 📖 CHAMPIONS DU LIVRE : la vitrine dorée (on voit l'animal, ses coups… et la page du livre où il attend)
function ouvreVitrine(k) {
  G.retourQuiz = null; sonInit(); sfx('clic'); setTimeout(() => sfx(k, .9), 250); G.phase = 'menu'; show('epreuve');
  const d = CHARS[k], m = d.moves;
  $('epreuve').classList.add('or'); $('epreuve').classList.remove('battu');
  $('ep-img').src = k + '_vs.webp'; $('ep-sur').textContent = '📖 CHAMPION DU LIVRE';
  $('ep-titre').textContent = d.art;
  $('ep-etapes').innerHTML = ['S', 'SF', 'SD'].filter(x => m[x] && m[x].nom).map(x => `<li><i>★</i>${esc(m[x].nom)}</li>`).join('') + `<li class="super"><i>⚡</i>SUPER : ${esc(m.SUPER.nom)}</li>`;
  $('ep-txt').innerHTML = fin(`${d.fem ? 'Elle' : 'Il'} t’attend <b>page ${pageLivre(k)}</b> du livre « C’est qui le plus fort ? ». Pour ${d.fem ? 'la' : 'le'} débloquer, trouve un mot dans le livre !`);
  const go = $('ep-go'); go.textContent = '📖 J’AI LE LIVRE !'; go.onclick = () => { sfx('valide'); ouvreLivreEnMain(k) };
  $('ep-quiz').hidden = true;
}
// 🗺️ un animal à gagner (25/09) : sa fiche (ses coups spéciaux, son SUPER) et son duel de l'aventure (« ▶ Y ALLER »)
function ouvreInfoAnimal(k) {
  const d = CHARS[k], m = d.moves, src = window.sourceDe ? sourceDe(k) : { t: '?' }; sonInit(); sfx('clic'); setTimeout(() => sfx(k, .9), 250); G.phase = 'menu'; show('epreuve');
  $('epreuve').classList.remove('or', 'battu'); $('ep-img').src = k + '_vs.webp';
  $('ep-sur').textContent = src.t === 'legende' ? '★ LÉGENDE' : '🗺️ À GAGNER DANS L’AVENTURE'; $('ep-titre').textContent = d.art;
  $('ep-etapes').innerHTML = ['S', 'SF', 'SD'].filter(x => m[x] && m[x].nom).map(x => `<li><i>★</i>${esc(m[x].nom)}</li>`).join('') + `<li class="super"><i>⚡</i>SUPER : ${esc(m.SUPER.nom)}</li>`;
  const go = $('ep-go'), qz = $('ep-quiz'); qz.hidden = true;
  if (src.t === 'duel') { const D = src.D, ouvert = duelOuvert(D);
    $('ep-txt').innerHTML = fin(`Gagne le <b>duel ${D.n}</b> de l’aventure (${esc(D.q.toLowerCase())}) : ${d.fem ? 'elle' : 'il'} rejoint tes animaux !`);
    go.hidden = false; go.textContent = ouvert ? `▶ LE DUEL ${D.n}` : '▶ L’AVENTURE'; go.onclick = () => { sfx('valide'); if (ouvert) { G.livre = null; ouvrePari(D) } else { mancheLivre = manche(D); ouvreLivre() } } }
  else { $('ep-txt').innerHTML = fin(src.t === 'legende' ? 'Elle se réveille après la finale de l’aventure : gagne les 30 duels du livre !' : 'Bientôt dans l’arène !'); go.hidden = src.t !== 'legende'; go.textContent = '▶ L’AVENTURE'; go.onclick = () => { sfx('valide'); ouvreLivre() } }
}
// --- LIVRE EN MAIN : un mot à écrire, trouvé dans le livre
const normMot = v => String(v).toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
function presque(a, b) { // le bon mot, au pluriel près ou à une petite faute près (mots de 5 lettres et plus)
  if (a === b || a.replace(/[sx]$/, '') === b.replace(/[sx]$/, '')) return true;
  if (b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, d = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue } if (++d > 1) return false; if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++ } }
  return d + (a.length - i) + (b.length - j) <= 1;
}
function ouvreLivreEnMain(k, suivante) {
  const L = LIVRE_EN_MAIN[k]; if (!L) return;
  sonInit(); sfx('clic'); G.phase = 'menu'; show('quiz'); $('quiz').classList.remove('defi', 'q-duel', 'gagne'); $('quiz').classList.add('or');
  if (!suivante || Q.k !== k || !Q.lem) Object.assign(Q, { k, lem: melange(L), i: 0 }); Q.essais = 0; Q.bloque = false;
  const z = Q.lem[Q.i % Q.lem.length];
  $('quiz-titre').textContent = '📖 CHAMPION DU LIVRE !';
  $('quiz-intro').innerHTML = fin(`${CHARS[k].art} se débloque <b>seulement avec le livre</b> « C’est qui le plus fort ? ». Ouvre-le et trouve le mot !`);
  $('quiz-img').style.backgroundImage = `url(${k}_corps.webp)`; $('quiz-img').classList.remove('ombre'); // (un champion du livre se montre en couleur : c'est lui qui donne envie)
  $('quiz-pas').innerHTML = '';
  $('quiz-q').innerHTML = `<span class="lem-ou"><b>📖 PAGE ${z.p}</b> · ${fin(z.ou)}</span>${fin(z.q)}`;
  $('quiz-msg').textContent = '';
  $('quiz-rep').innerHTML = '<form id="lem-f" class="lem" autocomplete="off"><input id="lem-in" type="text" maxlength="24" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="ÉCRIS LE MOT ICI" aria-label="Le mot du livre"><button class="btn go" type="submit">VALIDER</button></form>';
  $('lem-f').onsubmit = e => { e.preventDefault(); verifieMot() };
  const tactile = matchMedia('(pointer: coarse)').matches, inp = $('lem-in'); // sur téléphone, le clavier ne doit pas cacher la question
  if (tactile) { inp.onfocus = () => document.body.classList.add('clavier'); inp.onblur = () => setTimeout(() => document.body.classList.remove('clavier'), 60) }
  const s = $('quiz-suite'); s.hidden = true; s.textContent = 'UNE AUTRE QUESTION'; s.onclick = () => { sfx('clic'); Q.i++; ouvreLivreEnMain(k, true) };
  if (!tactile) setTimeout(() => { const e = $('lem-in'); if (e && G.screen === 'quiz') e.focus() }, 120); // au clavier d'ordinateur, on peut taper tout de suite ; sur téléphone, l'enfant lit d'abord
}
function verifieMot() {
  if (Q.bloque) return; const z = Q.lem[Q.i % Q.lem.length], e = $('lem-in'), v = normMot(e.value); if (!v) return;
  if (String(z.r).split('|').some(r => presque(v, normMot(r)))) { Q.bloque = true; e.blur(); sfx('valide'); $('quiz-msg').textContent = 'BRAVO, TU AS LE LIVRE !'; setTimeout(quizGagne, 900); return } // « cinq|5 » : plusieurs formes acceptées
  Q.essais++; sfx('erreur'); e.select();
  $('quiz-msg').textContent = fin(Q.essais === 1 ? `Pas tout à fait… Vérifie bien, page ${z.p} du livre !` : `Toujours pas… Regarde bien l’endroit indiqué, page ${z.p}. Tu peux aussi changer de question.`);
  if (Q.essais >= 2 && Q.lem.length > 1) $('quiz-suite').hidden = false;
}
function quizGagne() {
  const k = Q.k, nv = [], ch = champion(k), d = CHARS[k];
  if (!SAVE.debloques.includes(k)) SAVE.debloques.push(k); SAVE.quiz[k] = Date.now(); finEpreuve();
  badge(ch ? 'livre' : 'secret', nv); if (Object.keys(QUIZ).every(x => SAVE.debloques.includes(x))) badge('lecteur', nv); sauve();
  $('quiz-pas').innerHTML = '<i class="ok"></i><i class="ok"></i><i class="ok"></i>';
  $('quiz-img').classList.remove('ombre'); $('quiz-titre').textContent = ch ? '📖 CHAMPION DU LIVRE DÉBLOQUÉ !' : '🎉 GAGNÉ !';
  $('quiz-intro').innerHTML = fin(ch ? 'Bravo, lecteur ! Ta carte est dorée pour toujours.' : `Tu ${d.fem ? 'l’as battue' : 'l’as battu'}, tu connais ses secrets : ${d.fem ? 'elle est' : 'il est'} à toi !`);
  $('quiz-q').textContent = `${d.art} REJOINT L’ARÈNE !`;
  $('quiz-rep').innerHTML = ''; $('quiz-msg').innerHTML = (nv.length ? 'NOUVEAU TROPHÉE : ' + nv.map(id => BADGES.find(x => x[0] === id)[1]).join(' · ') : '') + (window.codeAOffrir ? codeAOffrir(k) : '');
  sfx('badge'); setTimeout(() => sfx('super'), 350); setTimeout(() => sfx(k, 1), 900);
  const s = $('quiz-suite'); s.hidden = false; s.textContent = `JOUER AVEC ${d.fem ? 'ELLE' : 'LUI'} ▶`;
  s.onclick = () => { sfx('valide'); G.phase = 'menu'; selStage = 0; G.livre = null; show('choix'); vaVers(k); construitCartes(); choisir(k) };
}
// --- trophées
function ouvreTrophees(retour) {
  G.phase = 'menu'; G.retourTroph = retour; show('trophees');
  $('troph-badges').innerHTML = window.htmlTrophees ? htmlTrophees() : BADGES.map(([id, nom, txt]) => `<div class="badge${SAVE.badges[id] ? ' ok' : ''}"><i>★</i><b>${nom}</b><small>${txt}</small></div>`).join('');
  { const ks = ORDRE.filter(k => CHARS[k] && FAITS[k]), vus = ks.filter(k => (SAVE.cartes[k] || []).length), tot = ks.reduce((n, k) => n + FAITS[k].length, 0), eu = ks.reduce((n, k) => n + (SAVE.cartes[k] || []).length, 0);
    $('troph-cartes').innerHTML = `<p class="cartes-info">🃏 <b>${eu} / ${tot}</b> cartes. Chaque combat gagné t’en donne une sur ton adversaire !</p>` +
      vus.map(k => { const vu = SAVE.cartes[k]; return `<div class="anim"><h3><img src="${k}_tete.webp" alt="">${CHARS[k].nom}<small>${vu.length} / ${FAITS[k].length}</small></h3>${vu.map(i => `<p>${FAITS[k][i]}</p>`).join('')}</div>` }).join('') }
  // 🐾 MES ANIMAUX : par monde ; un animal à gagner dit où le trouver (duel de l'aventure, livre, légende) ; on touche un animal gagné pour jouer avec lui
  const n2x = n => String(n).padStart(2, '0'), tous = ORDRE.filter(k => CHARS[k]), a = tous.filter(k => SAVE.debloques.includes(k));
  $('tab-animaux').textContent = `🐾 ANIMAUX ${a.length}/${tous.length}`;
  $('troph-animaux').innerHTML = Object.keys(MONDES).map(m => { const L = tous.filter(k => mondeDe(k) === m); if (!L.length) return '';
    return `<div class="col-monde"><h3>${MONDES[m].ico} ${MONDES[m].nom}<small>${L.filter(k => SAVE.debloques.includes(k)).length} / ${L.length}</small></h3><div class="col-grille">` + L.map(k => { const ok = SAVE.debloques.includes(k), src = window.sourceDe ? sourceDe(k) : { t: '?' };
      const t = ok ? (etoiles(SAVE.etoiles[k] || 0) || '✔') : src.t === 'duel' ? `🗺️ DUEL ${n2x(src.D.n)}` : src.t === 'livre' ? '📖 LIVRE' : src.t === 'legende' ? '★ LÉGENDE' : '🔒';
      return `<button class="col-a${ok ? '' : ' non'}${champion(k) ? ' or' : ''}" type="button" data-k="${k}"><img src="${k}_tete.webp" alt=""><span class="col-t"><b>${CHARS[k].nom}</b><small>${t}</small></span></button>` }).join('') + '</div></div>' }).join('');
  $('troph-animaux').querySelectorAll('.col-a').forEach(b => b.onclick = () => { const k = b.dataset.k; sfx('clic');
    if (SAVE.debloques.includes(k)) { G.livre = null; G.mode = 1; G.phase = 'menu'; selStage = 0; show('choix'); vaVers(k); construitCartes(); choisir(k) }
    else if (champion(k)) ouvreVitrine(k); else ouvreInfoAnimal(k) });
  ongletTroph('animaux');
}
function ongletTroph(t) { for (const x of ['animaux', 'badges', 'cartes']) { $('troph-' + x).hidden = t !== x; $('tab-' + x).setAttribute('aria-pressed', t === x) } }
function initUI() {
  $('jouer').onclick = () => { sonInit(); sfx('valide'); G.livre = null; G.defi = null; G.jour = null; finEpreuve(); G.onglet = 'fav'; $('m1').onclick(); const choix = () => { G.phase = 'menu'; selStage = 0; show('choix'); construitCartes() };
    // 1re fois : le tutoriel complet ; ceux qui avaient fait l'ancien (sans saut ni coups en bas) : seulement le NOUVEAU (4 étapes)
    if (tutoAFaire()) { chargeAnimal('tigre').then(() => chargeAnimal('gorille')).then(() => { show(null); lanceTuto(choix, 'complet') }) } else choix() };
  $('livre-titre').onclick = () => { sonInit(); sfx('valide'); // ▶ JOUER = L'AVENTURE (1re fois : le tutoriel d'abord)
    if (tutoAFaire()) { chargeAnimal('tigre').then(() => chargeAnimal('gorille')).then(() => { show(null); lanceTuto(() => ouvreLivre(), 'complet') }) } else ouvreLivre() };
  $('livre-retour').onclick = () => { sfx('retour'); G.livre = null; show('titre') };
  $('pari-retour').onclick = () => { sfx('retour'); ouvreLivre() };
  $('v-menu').onclick = () => { sfx('clic'); ouvreLivre() };
  // À DEUX : sur le même écran, ou chacun son téléphone
  $('adeux-titre').onclick = () => { sonInit(); sfx('clic'); G.phase = 'menu'; show('adeux') };
  $('adeux-retour').onclick = () => { sfx('retour'); show('titre') };
  $('deux-ecran').onclick = () => { sonInit(); sfx('valide'); finEpreuve(); G.onglet = 'fav'; $('m2').onclick(); G.phase = 'menu'; selStage = 0; show('choix'); construitCartes() };
  $('deux-tel').onclick = () => { sonInit(); $('m3').onclick() };
  for (const [id, m] of [['m1', 1], ['m2', 2]]) $(id).onclick = () => { G.mode = m; G.tournoi = null; $('m1').setAttribute('aria-pressed', m === 1); $('m2').setAttribute('aria-pressed', m === 2); $('niveaux').hidden = m === 2; selStage = 0; construitCartes(); sfx('clic') };
  document.querySelectorAll('#niveaux .btn').forEach(b => b.onclick = () => { G.niv = +b.dataset.niv; document.querySelectorAll('#niveaux .btn').forEach(x => x.setAttribute('aria-pressed', x === b)); sfx('clic') });
  $('code-ok').onclick = valideCode; $('code-retour').onclick = () => { show('choix'); construitCartes() };
  $('trophees-btn').onclick = () => { sfx('clic'); ouvreTrophees('choix') };
  $('quiz-retour').onclick = () => { sfx('retour'); if (G.retourQuiz === 'livre') { G.retourQuiz = null; G.quest = null; ouvreLivre(); return } const k = Q.k; finEpreuve(); G.phase = 'menu'; show('choix'); if (k && CHARS[k] && selStage === 0) vaVers(k); construitCartes() };
  $('ep-retour').onclick = () => { sfx('retour'); G.phase = 'menu'; show('choix'); construitCartes() };
  $('retour-choix').onclick = () => { sfx('clic'); if (G.epreuve && !G.pick[1]) { const k = G.epreuve.k; finEpreuve(); vaVers(k); construitCartes(); return } if (selStage === 0) { G.phase = 'menu'; show(G.mode === 2 ? 'adeux' : 'titre'); return } selStage = 0; G.tournoi = null; const p0 = G.pick[0]; if (p0 && CHARS[p0]) { G.onglet = regionDe(p0); selCursor = Math.max(0, CARTES().indexOf(p0)) } construitCartes() };
  $('hasard-btn').onclick = () => { sfx('clic'); animalAuHasard() };
  $('cartes-g').onclick = () => pageCartes(-1); $('cartes-d').onclick = () => pageCartes(1); // (25/09 : pages de 8 cartes)
  { let x0 = null, glisse = 0; const z = $('cartes-zone'); z.addEventListener('pointerdown', e => { x0 = e.clientX }); z.addEventListener('pointerup', e => { if (x0 != null && Math.abs(e.clientX - x0) > 60) { glisse = performance.now(); pageCartes(e.clientX < x0 ? 1 : -1) } x0 = null });
    z.addEventListener('click', e => { if (performance.now() - glisse < 350) { e.stopPropagation(); e.preventDefault() } }, true) } // glisser le doigt = page suivante (sans choisir la carte sous le doigt)
  $('tournoi-btn').onclick = () => lanceTournoi();
  $('arenes-retour').onclick = () => { sfx('clic'); if (NET.on) { G.phase = 'menu'; show('choix'); $('choix-titre').textContent = 'EN ATTENTE…'; return } G.phase = 'menu'; show('choix'); if (G.epreuve) { finEpreuve(); G.pick[1] = null } selStage = G.pick[0] && CHARS[G.pick[0]] ? 1 : 0; construitCartes() }; $('trophees-titre').onclick = () => { sonInit(); sfx('clic'); ouvreTrophees('titre') };
  $('troph-retour').onclick = () => { if (G.retourTroph === 'choix') { show('choix'); construitCartes() } else show('titre') };
  $('m3').onclick = () => { sonInit(); sfx('clic'); G.phase = 'menu'; show('enligne'); netEcran('accueil'); netStatut('') };
  $('net-cree').onclick = () => { sfx('clic'); netCree() }; $('net-rejoint').onclick = () => { sfx('clic'); netEcran('invite'); netStatut(''); setTimeout(() => $('net-in').focus(), 50) };
  $('net-ok').onclick = () => { sfx('clic'); netRejoint() }; $('net-retour').onclick = () => { netFerme(); sfx('retour'); show('adeux') }; for (const id of ['net-retour2', 'net-retour3']) $(id).onclick = () => { netFerme(); sfx('retour'); netEcran('accueil'); netStatut('') };
  $('tab-animaux').onclick = () => ongletTroph('animaux'); $('tab-badges').onclick = () => ongletTroph('badges'); $('tab-cartes').onclick = () => ongletTroph('cartes');
  $('revanche').onclick = () => { sonInit(); if (G.epreuve && typeof estLegendaire === 'function' && estLegendaire(G.epreuve.k) && SAVE.debloques.includes(G.epreuve.k)) { const k = G.epreuve.k; finEpreuve(); ceremonieLegendaire(k); return } if (G.apresEpreuve) { const k = G.apresEpreuve; G.apresEpreuve = null; ouvreSecrets(k); return } G.livre = null; if (NET.on) { envoie({ t: 'rejoue' }); recoit({ t: 'rejoue' }); return } G.f.forEach(f => f.wins = 0); if (G.mode === 1 && G.tournoi) { G.pick[1] = G.tournoi.liste[G.tournoi.i]; const L = arenesDe(mondeDuel(G.pick[0], G.pick[1])), j = L.findIndex(x => x.k === G.arene); G.arene = L[(j + 1) % L.length].k } vs() };
  $('menu-btn').onclick = toMenu; $('quitter').onclick = toMenu; $('reprendre').onclick = pause; $('pause-btn').onclick = () => { if (['fight', 'intro'].includes(G.phase)) pause() };
  // bouton SON : musique + bruitages → bruitages seuls → muet (choix gardé sur l'appareil)
  const majSon = () => { const m = SAVE.son || 0; SON.on = m < 2; SON.musOff = m === 1; $('son-btn').textContent = ['♪ SON', '♪ SANS MUSIQUE', '♪ MUET'][m]; if (SON.master) SON.master.gain.value = SON.on ? .8 : 0 };
  $('son-btn').onclick = () => { SAVE.son = ((SAVE.son || 0) + 1) % 3; sauve(); majSon(); sonInit() }; majSon();
  // plein écran : possible sur Android, iPad et ordinateur ; sur iPhone, seul le mode « appli » (écran d'accueil) enlève la barre d'adresse
  const APPLI = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
  const PEUT_PLEIN = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (APPLI) $('plein').hidden = true;
  else if (!PEUT_PLEIN && /iPhone|iPod|iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 0) $('appli-titre').hidden = false;
  const ouvreAppli = () => { sfx('clic'); G.retourAppli = G.screen; G.avantAppli = G.phase; if (['fight', 'intro'].includes(G.phase)) { G.before = G.phase; G.phase = 'pause' } show('appli') };
  $('appli-titre').onclick = ouvreAppli;
  $('appli-ok').onclick = () => { sfx('clic'); if (G.phase === 'pause' && G.avantAppli !== 'pause') { G.phase = G.before; show(null) } else show(G.retourAppli || 'titre') };
  $('plein').onclick = () => {
    if (!PEUT_PLEIN) { ouvreAppli(); return }
    const el = document.documentElement; try { (document.fullscreenElement || document.webkitFullscreenElement ? (document.exitFullscreen || document.webkitExitFullscreen).call(document) : (el.requestFullscreen || el.webkitRequestFullscreen).call(el))?.catch?.(() => { }) } catch (e) { } try { screen.orientation.lock('landscape').catch(() => { }) } catch (e) { } };
  // commandes tactiles (joueur 1, et joueur 2 en mode 2 joueurs sur la même tablette)
  // (25/09, bonnes pratiques des jeux de combat sur téléphone) :
  // - joystick FLOTTANT (1 joueur) : il se pose sous le pouce, n'importe où dans le bas de la moitié gauche de l'écran ; petite zone morte au centre ;
  // - A, B, ★ : un appui dans le coin droit (même à côté d'un bouton) va au bouton le plus proche ; le bouton s'allume sous le doigt.
  for (const [pad, T, n] of [[$('pad'), TOUCH, 0], [$('pad2'), TOUCH2, 1]]) {
    const joy = pad.querySelector('.joy'), knob = pad.querySelector('.knob'), zj = pad.querySelector('.zone-joy'), zb = pad.querySelector('.zone-btn');
    let jid = null, jc = [0, 0], pose = false;
    const jmove = e => { const rad = joy.offsetWidth / 2 || 50; let dx = (e.clientX - jc[0]) / rad, dy = (e.clientY - jc[1]) / rad; const m = Math.hypot(dx, dy); if (m < .12) dx = dy = 0; else if (m > 1) { dx /= m; dy /= m } T.x = dx; T.y = dy; knob.style.transform = `translate(${dx * rad * .55}px,${dy * rad * .55}px)` };
    const jstart = (e, el, flotte) => { e.preventDefault(); sonInit(); jid = e.pointerId; pose = flotte;
      if (flotte) { const rad = joy.offsetWidth / 2 || 50; joy.style.left = (e.clientX - rad) + 'px'; joy.style.top = (e.clientY - rad) + 'px'; joy.classList.add('pose'); jc = [e.clientX, e.clientY] }
      else { const r = joy.getBoundingClientRect(); jc = [r.left + r.width / 2, r.top + r.height / 2] }
      try { el.setPointerCapture(jid) } catch (_) { } jmove(e) };
    const jend = e => { if (e.pointerId !== jid) return; jid = null; T.x = T.y = 0; knob.style.transform = ''; if (pose) { joy.classList.remove('pose'); joy.style.left = joy.style.top = '' } pose = false };
    joy.addEventListener('pointerdown', e => jstart(e, joy, false));
    if (zj) zj.addEventListener('pointerdown', e => jstart(e, zj, true));
    for (const el of [joy, zj]) if (el) { el.addEventListener('pointermove', e => { if (e.pointerId === jid) jmove(e) }); el.addEventListener('pointerup', jend); el.addEventListener('pointercancel', jend) }
    const appuie = (k, el) => { T[k] = true; el.classList.add('on') }, lache = (k, el) => { T[k] = false; el.classList.remove('on') };
    pad.querySelectorAll('.tb').forEach(el => { const k = el.dataset.k;
      el.addEventListener('pointerdown', e => { e.preventDefault(); sonInit(); appuie(k, el); try { el.setPointerCapture(e.pointerId) } catch (_) { } });
      const off = () => lache(k, el); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off) });
    if (zb) { const doigts = new Map();
      zb.addEventListener('pointerdown', e => { e.preventDefault(); sonInit(); let best = null, bd = 1e9;
        for (const el of pad.querySelectorAll('.tb')) { const r = el.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); if (d < bd) { bd = d; best = el } }
        if (!best || bd > best.offsetWidth * 1.9) return; doigts.set(e.pointerId, best); appuie(best.dataset.k, best); try { zb.setPointerCapture(e.pointerId) } catch (_) { } });
      const fin = e => { const el = doigts.get(e.pointerId); if (el) { doigts.delete(e.pointerId); if (![...doigts.values()].includes(el)) lache(el.dataset.k, el) } };
      zb.addEventListener('pointerup', fin); zb.addEventListener('pointercancel', fin) }
  }
  // Safari (iPhone) : un geste parti du bord de l'écran fait revenir à la page précédente → bloqué pendant le jeu
  document.addEventListener('touchstart', e => { const t = e.touches[0]; if (t && (t.clientX < 22 || t.clientX > innerWidth - 22)) e.preventDefault() }, { passive: false });
  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) document.body.classList.add('tactile');
}
// boutons tactiles qui s'adaptent (25/09) : A, B et ★ disent ce qu'ils vont faire TOUT DE SUITE
// (en l'air, en bas, tout près, jauge pleine) ; les repères du joystick (▲ SAUTE / ▼ GARDE) s'allument quand la direction est prise.
function etiquettes(f, o, i) {
  const e = { L: 'RAPIDE', H: 'FORT', S: 'SPÉCIAL', cL: 0, cH: 0 }, fwd = ((i.right ? 1 : 0) - (i.left ? 1 : 0)) * f.face;
  if (f.state === 'air' && !f.airAtk) { e.L = e.H = 'EN L’AIR !'; e.cL = e.cH = 1 }
  else if (i.down && f.h <= 0) { e.L = 'EN BAS'; e.cL = 1; if (f.d.moves.cH) { e.H = 'BALAYETTE'; e.cH = 1 } } // (2D : en vol, ↓ fait descendre ; tout en bas, c'est le coup en bas)
  else if (fwd > 0 && !i.down && f.h <= solDe(f) + .5 && o && f.d.moves.T && portee(f, o, 70) && attrapable(o) && procheV(f, o)) { e.H = 'PROJETTE'; e.cH = 1 }
  e.S = f.meter >= 100 && f.d.moves.SUPER ? 'SUPER !' : i.down ? '↓ SPÉCIAL' : fwd > 0 ? '→ SPÉCIAL' : 'SPÉCIAL';
  return e;
}
const ETQ = new Map();
function majBoutons() {
  if (typeof NET === 'undefined') return; // (net.js pas encore chargé : réseau lent)
  for (const [n, id] of [[0, 'pad'], [1, 'pad2']]) {
    const pad = $(id); if (!pad) continue;
    const k = n === 0 ? (NET.on ? NET.moi : 0) : 1, f = G.f[k], o = G.f[1 - k];
    const actif = !!f && !f.cpu && ['fight', 'intro'].includes(G.phase) && (n === 0 || G.mode === 2);
    const inp = actif ? lire(n) : {}, e = actif ? etiquettes(f, o, inp) : { L: 'RAPIDE', H: 'FORT', S: 'SPÉCIAL' };
    for (const b of pad.querySelectorAll('.tb')) { const t = b.dataset.k, s = b.querySelector('small'), v = e[t];
      if (s && ETQ.get(b) !== v) { ETQ.set(b, v); s.textContent = v }
      b.classList.toggle('ctx', !!(actif && e['c' + t])); if (t === 'S') b.classList.toggle('super', !!(actif && f.meter >= 100)) }
    pad.classList.toggle('vol', actif && vol2d(f));
    { const s = pad.querySelector('.tb[data-k="S"]'); if (s) s.style.setProperty('--jauge', actif ? Math.min(1, f.meter / 100).toFixed(2) : 0) } // l'anneau de la jauge SUPER
    for (const [cl, d] of [['haut', 'up'], ['bas', 'down']]) { const g = pad.querySelector('.jg.' + cl); if (g) g.classList.toggle('on', !!inp[d]) }
  }
}
setInterval(majBoutons, 90);

// ---------------------------------------------------------------------
//  Démarrage
// ---------------------------------------------------------------------
function majU() { const c = $('cadre'); if (c) document.documentElement.style.setProperty('--u', (c.getBoundingClientRect().width / 100).toFixed(2) + 'px') }
addEventListener('resize', majU); addEventListener('orientationchange', () => setTimeout(majU, 350)); try { new ResizeObserver(majU).observe($('cadre')) } catch (e) { } majU();
(async () => {
  initUI();
  const ok = Skin.init(glC);
  if (!ok) { $('charge').textContent = 'Ton appareil ne peut pas afficher ce jeu (WebGL indisponible).'; return }
  const load = src => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = src });
  G.rigs = {}; G.heads = {}; if (MONDES[SAVE.monde] && mondeOuvert(SAVE.monde)) G.monde = SAVE.monde; G.onglet = 'fav'; // on revient dans le dernier monde choisi ; l'écran de choix s'ouvre sur ⭐ TES PRÉFÉRÉS
  // on attend que tous les scripts (réseau, livre, bonus) soient chargés avant de lancer la boucle
  if (document.readyState === 'loading') await new Promise(r => addEventListener('DOMContentLoaded', r, { once: true }));
  // l'accueil s'affiche tout de suite ; le tigre, le gorille et la savane arrivent en tâche de fond (le combat les attend)
  G.bgs.savane = load('arene.webp').then(i => { if (!G.bgImg) G.bgImg = i; return i });
  const base = Promise.all([chargeAnimal('tigre'), chargeAnimal('gorille'), G.bgs.savane]);
  // puis les animaux déjà débloqués (les autres se chargent quand on les choisit : moins de données sur un téléphone)
  (async () => { try { await base } catch (e) { } for (const k of ORDRE) { if (!debloque(k)) continue; try { await chargeAnimal(k) } catch (e) { } } })();
  try { await Promise.race([document.fonts.load('900 40px Rubik'), new Promise(r => setTimeout(r, 1500))]) } catch (e) { }
  $('charge').hidden = true; G.phase = 'menu'; show('titre');
  if (window.initBonus) { initBonus(); if (window.lienRecu) lienRecu() }
  requestAnimationFrame(loop);
  window.__stat = null; window.__jeu = { G, step, render, KEYS, TOUCH, TOUCH2, lire, joyDir, startMatch, show, vs, chargeAnimal, CHARS };
})().catch(e => { $('charge').textContent = 'Erreur de chargement : ' + e.message });
