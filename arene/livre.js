// =====================================================================
//  DUELS DU LIVRE — comme dans « C'est qui le plus fort ? » :
//  1. tu paries (contre Gigi), 2. tu te bats avec ton champion, 3. tu découvres la vraie réponse.
//  Textes repris MOT POUR MOT du livre imprimé (TEXTE_IMPRIME_V19, 25/09) : page du duel (p) et page de la réponse (pv).
//  Contrôle : python3 verif/sync_livre.py TEXTE_IMPRIME_V19_74P.md
// =====================================================================
const DUELS = [
  { n: 2, lieu: 'OCÉAN', q: 'ORQUE OU GRAND REQUIN BLANC ?', a: 'orque', b: 'requin', noms: ['ORQUE', 'GRAND REQUIN BLANC'], arene: 'ocean', p: 7, pv: 8,
    intro: 'Deux tueurs des mers. Aucun ennemi connu… sauf peut-être l’autre. Près de l’Afrique du Sud, ils se croisent pour de vrai. Qui fait fuir l’autre ?',
    fiches: [['jusqu’à 10 tonnes', 'des dents de 8 cm', 'un coup de queue qui assomme', 'elle doit remonter respirer'], ['jusqu’à 2 tonnes', '300 dents sur 7 rangées', 'il attaque par en dessous', 'sur le dos, il ne bouge plus']],
    gigi: { pari: 'orque', dit: 'L’orque.', pourquoi: 'Un dauphin géant ! J’adore les dauphins.', apres: 'J’AVAIS BON ! Je suis un génie.' },
    rep: { g: 'orque', titre: 'LA VRAIE RÉPONSE', cri: 'L’ORQUE !', punch: 'Le grand méchant requin ? Un poisson rouge !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Toute seule, une orque attrape un jeune requin blanc par la nageoire. En deux minutes, c’est fini. Elle repart avec son morceau préféré : le foie, une bombe d’énergie ! En Californie, il suffit que des orques passent : tous les requins blancs filent, parfois pour un an entier !' } },
  { n: 3, lieu: 'AFRIQUE CONTRE ASIE', q: 'LION OU TIGRE ?', a: 'lion', b: 'tigre', noms: ['LION', 'TIGRE DU BENGALE'], arene: 'colisee', p: 9, pv: 10,
    intro: 'La crinière contre les rayures. Dans la nature, ils ne se croisent plus. Mais face à face… un contre un, qui gagne ?',
    fiches: [['environ 190 kg', 'des crocs de 7 cm', 'il étouffe sa proie', 'sa crinière lui donne chaud'], ['environ 220 kg', 'des griffes de 10 cm', 'il attaque par surprise', 'il évite les bagarres']],
    gigi: { pari: 'lion', dit: 'Le lion.', pourquoi: 'C’est le roi, c’est écrit partout !', apres: '« Le roi », c’était écrit partout. Sauf ici !' },
    rep: { g: 'tigre', titre: 'L’AVIS DES EXPERTS', cri: 'LE TIGRE !', punch: 'Un contre un, les rayures gagnent !', tampon: 'bleu', label: 'JAMAIS VU DANS LA NATURE',
      film: 'Le tigre pèse environ 30 kg de plus que le lion. Selon un expert, le tigre va droit à la gorge. Le lion, lui, cogne et joue avec l’adversaire. Mais attention… Un lion vient rarement seul : à deux ou trois, les lions battraient le tigre.' } },
  { n: 4, lieu: 'SAVANE DE NUIT', q: 'LÉOPARD OU PORC-ÉPIC ?', a: 'leopard', b: 'porcepic', noms: ['LÉOPARD', 'PORC-ÉPIC'], arene: 'nuit', p: 11, pv: 12,
    intro: 'La nuit, en Afrique. Un léopard affamé trouve un porc-épic : trente kilos de viande… sous des milliers de piquants. Qui fait reculer l’autre ?',
    fiches: [['jusqu’à 75 kg', 'des griffes pour grimper', 'un bond de 6 m', 'il attaque la gueule en avant'], ['jusqu’à 30 kg', 'des piquants de 30 cm', 'la charge en marche arrière', 'une très mauvaise vue']],
    gigi: { pari: 'leopard', dit: 'Le léopard.', pourquoi: 'L’autre, c’est une brosse à cheveux.', apres: 'Une brosse à cheveux DE COMBAT. D’accord.' },
    rep: { g: 'porcepic', titre: 'LA VRAIE RÉPONSE', cri: 'LE PORC-ÉPIC !', punch: 'Qui s’y frotte s’y pique !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Sûr de son coup, un léopard poursuit un porc-épic. Le porc-épic recule à toute vitesse : ses piquants restent plantés dans le léopard ! Le léopard tourne, hésite… et laisse tomber. Le porc-épic rentre dans son trou.' } },
  { n: 5, lieu: 'RIVIÈRE', q: 'HIPPOPOTAME OU CROCODILE DU NIL ?', a: 'hippo', b: 'croco', noms: ['HIPPOPOTAME', 'CROCODILE DU NIL'], arene: 'riviere', p: 13, pv: 14,
    intro: 'Même rivière, même boue. L’hippo broute l’herbe. Le croco est un tueur à la mâchoire d’acier. Alors, qui commande dans l’eau ?',
    fiches: [['jusqu’à 3 200 kg', 'des crocs géants', 'il charge gueule ouverte', 'sa peau craque au soleil'], ['jusqu’à 750 kg', 'une morsure qui serre fort', 'il attaque caché sous l’eau', 'un élastique lui ferme la gueule']],
    gigi: { pari: 'hippo', dit: 'L’hippo.', pourquoi: 'Plus grande bouche = plus fort. Logique.', apres: 'Logique de Gigi : 1. Reste du monde : 0.' },
    rep: { g: 'hippo', titre: 'LA VRAIE RÉPONSE', cri: 'L’HIPPOPOTAME !', punch: 'Trois tonnes de mauvaise humeur.', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Un crocodile s’approche d’un bébé hippopotame. Aussitôt, tout le troupeau se serre autour du petit. Pour s’échapper, le crocodile grimpe… sur le dos des hippopotames ! Mordu plusieurs fois, il disparaît sous l’eau.' } },
  { n: 6, lieu: 'GRAND NORD', q: 'OURS POLAIRE OU GRIZZLY ?', a: 'ours', b: 'grizzly', noms: ['OURS POLAIRE', 'GRIZZLY'], arene: 'plage', p: 15, pv: 16,
    intro: 'Sur une plage d’Alaska, des restes de baleine : un festin. Des ours polaires énormes sont déjà à table. Arrive un grizzly, un ours brun, tout seul. Qui mange ?',
    fiches: [['de 350 à 545 kg', 'des griffes en crochet', 'un coup de patte de géant', 'il a vite trop chaud en courant'], ['environ 180 kg', 'des griffes de 6 cm', 'il attrape les saumons au vol', 'deux à trois fois plus léger']],
    gigi: { pari: 'ours', dit: 'L’ours polaire.', pourquoi: 'Il est assorti à la neige : trop la classe.', apres: 'La classe ne suffit pas ? On aurait pu me prévenir !' },
    rep: { g: 'grizzly', titre: 'LA VRAIE RÉPONSE', cri: 'LE GRIZZLY !', punch: 'Le plus petit fait la loi !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Une quinzaine d’ours polaires se régalent sur la plage. Un grizzly arrive, tranquille. Ce jour-là, sans même grogner, il fait filer tous les ours polaires, sauf un !' } },
  { n: 7, lieu: 'PANTANAL', q: 'JAGUAR OU ANACONDA ?', a: 'jaguar', b: 'anaconda', noms: ['JAGUAR', 'ANACONDA JAUNE'], arene: 'pantanal', p: 17, pv: 18,
    intro: 'Brésil, au bord d’une rivière. Un jaguar, bon nageur, sent un anaconda caché dans l’herbe : un anaconda jaune, plus petit que son cousin vert. Qui va manger l’autre ?',
    fiches: [['environ 100 kg', 'une morsure perce-carapace', 'il mord l’arrière du crâne', 'des pattes courtes pour un félin'], ['environ 30 kg', 'un corps de près de 4 m', 'il serre à bloquer le sang', 'lent et maladroit sur terre']],
    gigi: { pari: 'jaguar', dit: 'Le jaguar.', pourquoi: 'Un chat contre une ficelle : facile.', apres: 'Le chat a eu la ficelle. Comme prévu !' },
    rep: { g: 'jaguar', titre: 'LA VRAIE RÉPONSE', cri: 'LE JAGUAR !', punch: 'Plouf ! Et c’est gagné !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Brésil, 2017. Un jaguar repère un anaconda et le poursuit jusque dans l’eau. Le serpent mord le jaguar au museau, plusieurs fois. Le félin ne lâche pas. Sous les yeux d’un photographe, le jaguar prend le dessus. Quelques morsures, et le serpent ne bouge plus.' } },
  { n: 8, lieu: 'SAVANE', q: 'LION OU RATEL ?', a: 'lion', b: 'ratel', noms: ['LION', 'RATEL'], arene: 'desert', p: 19, pv: 20,
    intro: 'Sur Internet, des vidéos montrent le ratel, une sorte de blaireau d’Afrique, tenir tête à des lions. 13 kilos de rage contre 190 ! Des chercheurs sont allés vérifier. Alors, qui gagne ?',
    fiches: [['environ 190 kg', 'des crocs de 7 cm', 'il plaque sa proie au sol', 'il chasse mal en plein jour'], ['jusqu’à 13 kg', 'de longues griffes', 'la bombe puante', 'surpris, il fonce sans réfléchir']],
    gigi: { pari: 'ratel', dit: 'Le ratel !', pourquoi: 'J’ai vu la vidéo : il est INVINCIBLE.', apres: 'Internet m’a menti. Je suis très déçu.' },
    rep: { g: 'lion', titre: 'LA VRAIE RÉPONSE', cri: 'LE LION !', punch: 'Courageux… mais pas fou !', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Dans le désert du Kalahari, des lions et des léopards ont déjà tué des ratels. Son vrai talent ? Il ne gagne pas : il dégoûte. Il mord, il pue… et parfois, le fauve renonce !' } },
  { n: 9, lieu: 'AQUARIUM', q: 'PIEUVRE GÉANTE OU REQUIN ?', a: 'pieuvre', b: 'aiguillat', noms: ['PIEUVRE GÉANTE', 'REQUIN AIGUILLAT'], arene: 'aquarium', p: 21, pv: 22,
    intro: 'D’un côté, un aiguillat : un requin d’un mètre. De l’autre, un gros sac mou à huit bras. Ils partagent le même bassin. Qui mange l’autre ?',
    fiches: [['souvent plus de 20 kg', 'des bras à ventouses', 'elle mord avec un bec caché', 'vite fatiguée en nageant'], ['moins de 10 kg', 'deux épines à venin', 'il se plie et pique', 'petit, pour un requin']],
    gigi: { pari: 'aiguillat', dit: 'Le requin.', pourquoi: 'Il a des dents, lui !', apres: 'Il avait des dents, lui ! Elle, un bec caché. Tricheuse !' },
    rep: { g: 'pieuvre', titre: 'LA VRAIE RÉPONSE', cri: 'LA PIEUVRE !', punch: 'Huit bras, zéro pitié.', tampon: 'vert', label: 'OBSERVÉ EN AQUARIUM',
      film: 'Aquarium de Seattle. On installe une pieuvre géante chez les requins. Les soigneurs ont peur… pour elle. Les jours passent. Un requin a disparu. Puis un autre. Puis encore un. C’est elle ! La pieuvre attrapait les requins un par un.' } },
  { n: 10, boss: 1, lieu: 'ÎLE DE KOMODO', q: 'DRAGON DE KOMODO OU BUFFLE ?', a: 'komodo', b: 'buffle', noms: ['DRAGON DE KOMODO', 'BUFFLE D’EAU'], arene: 'jungle', p: 23, pv: 24,
    intro: 'Voici le plus gros lézard du monde : trois mètres de long. Il attaque un buffle sept fois plus lourd que lui. Qui gagne, ce jour-là ?',
    fiches: [['environ 80 kg', '60 dents coupantes', 'une morsure à venin', 'il entend très mal'], ['jusqu’à 550 kg', 'de grandes cornes', 'il charge tête baissée', 'ses blessures guérissent mal']],
    gigi: { pari: 'komodo', dit: 'Le dragon.', pourquoi: 'C’est un DRAGON. Je rappelle.', apres: 'Un DRAGON battu par une vache. Je ne crois plus aux dragons.' },
    rep: { g: 'buffle', titre: 'LA VRAIE RÉPONSE', cri: 'LE BUFFLE !', punch: 'Même pas peur du dragon !', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Le dragon mord une patte du buffle et tire de toutes ses forces. Le buffle se secoue, se dégage et repart. C’est ce qui arrive le plus souvent !' } },
  { n: 11, lieu: 'MONTAGNES', q: 'PUMA OU LOUP ?', a: 'puma', b: 'loup', noms: ['PUMA', 'LOUP'], arene: 'montagnes', p: 27, pv: 28,
    intro: 'Montagnes Rocheuses, en Amérique. Un loup solitaire et un puma suivent la même piste de cerf. D’habitude, ils s’évitent. Pas aujourd’hui : qui gagne ?',
    fiches: [['jusqu’à 100 kg', 'de grosses pattes griffues', 'il saute sur le dos et mord', 'il fuit devant une meute'], ['jusqu’à 80 kg', 'des crocs qui percent le cuir', 'il blesse, puis il attend', 'il ne grimpe pas aux arbres']],
    gigi: { pari: 'puma', dit: 'Le puma.', pourquoi: 'Un loup tout seul, c’est juste un gros chien.', apres: 'Gros chat : 1. Gros chien : 0.' },
    rep: { g: 'puma', titre: 'CE QU’ONT VU LES CHERCHEURS', cri: 'LE PUMA !', punch: 'Loup seul, loup perdu.', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Une louve voyage seule. On la retrouve tuée par un puma, cachée sous la neige. Dans les Rocheuses, des chercheurs ont retrouvé deux autres loups tués par des pumas. Au parc de Yellowstone, en huit ans, des meutes ont tué deux pumas. Là-bas, jamais l’inverse !' } },
  { n: 13, lieu: 'BANQUISE', q: 'OURS POLAIRE OU MORSE ?', a: 'ours', b: 'morse', noms: ['OURS POLAIRE', 'MORSE'], arene: 'banquise', p: 31, pv: 32,
    intro: 'L’ours polaire sent un phoque à plus d’un kilomètre, même sous la neige. Aujourd’hui, il a trouvé mieux : une plage couverte de morses. Qui gagne ?',
    fiches: [['jusqu’à 545 kg', 'des griffes en crochet', 'il fait paniquer le troupeau', 'l’été, sans banquise, il a faim'], ['jusqu’à 1 500 kg', 'des défenses de 90 cm', 'il frappe avec ses défenses', 'affolé, le troupeau écrase ses petits']],
    gigi: { pari: 'ours', dit: 'L’ours.', pourquoi: 'Le morse, c’est un canapé à moustaches.', apres: 'Un canapé d’une tonne et demie, avec des épées.' },
    rep: { g: 'morse', titre: 'LA VRAIE RÉPONSE', cri: 'LE MORSE !', punch: 'Pas touche au troupeau !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'L’ours fonce sur le troupeau de morses pour lui faire peur. Les adultes font face, défenses en avant. L’ours freine. 23 sur 25 attaques d’ours contre des morses ont raté.' } },
  { n: 14, lieu: 'INDE', q: 'MANGOUSTE OU COBRA ?', a: 'mangouste', b: 'cobra', noms: ['MANGOUSTE', 'COBRA'], arene: 'inde', p: 33, pv: 34,
    intro: 'Un cobra se dresse, capuchon ouvert. Son venin peut tuer un humain. En face, une mangouste : moins de 2 kilos de poils qui sautillent. Une seule morsure, et tout est fini. Mais la morsure de qui ?',
    fiches: [['environ 40 cm sans la queue', '40 dents pointues', 'elle esquive, puis mord la tête', 'trop de venin peut la tuer'], ['jusqu’à 220 cm', 'un venin mortel', 'il ouvre son capuchon', 'il frappe trop lentement']],
    gigi: { pari: 'cobra', dit: 'Le cobra.', pourquoi: 'Je ne parie jamais contre un truc qui siffle.', apres: 'Elle danse, il tombe. Je veux la même prof de sport.' },
    rep: { g: 'mangouste', titre: 'L’AVIS DES EXPERTS', cri: 'LA MANGOUSTE !', punch: 'Esquive, esquive… et croque !', tampon: 'bleu', label: 'L’AVIS DES EXPERTS',
      film: 'La mangouste danse. Le cobra frappe : elle n’est déjà plus là. Le cobra frappe encore et encore dans le vide. Il fatigue. Alors seulement, elle saute et mord la tête.' } },
  { n: 15, lieu: 'MARAIS', q: 'JAGUAR OU CAÏMAN ?', a: 'jaguar', b: 'caiman', noms: ['JAGUAR', 'CAÏMAN'], arene: 'marais', p: 35, pv: 36,
    intro: 'Un caïman, cousin du crocodile, fait la sieste sur le sable. Son dos est une armure d’os. Un jaguar approche en silence. Les crocs contre l’armure : qui gagne ?',
    fiches: [['environ 100 kg', 'une morsure perce-crâne', 'l’attaque par-derrière', 'repéré, il rate son coup'], ['près de 60 kg', 'une peau à plaques d’os', 'il plonge pour se cacher', 'lent quand il est à terre']],
    gigi: { pari: 'jaguar', dit: 'Le jaguar.', pourquoi: 'Il a déjà mangé un anaconda !', apres: 'Un chat qui mange du croco. Le mien boude ses croquettes.' },
    rep: { g: 'jaguar', titre: 'LA VRAIE RÉPONSE', cri: 'LE JAGUAR !', punch: 'Il a trouvé la faille !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Le caïman se chauffe au soleil. Derrière lui, le jaguar rampe sur le sable. Il bondit et plante ses crocs dans le crâne ! Le caïman n’a même pas eu le temps de plonger. Un touriste a tout filmé.' } },
  { n: 16, lieu: 'SAVANE', q: 'GUÉPARD OU AUTRUCHE ?', a: 'guepard', b: 'autruche', noms: ['GUÉPARD', 'AUTRUCHE'], arene: 'savane', p: 37, pv: 38,
    intro: 'Un guépard affamé guette une autruche. Lui, c’est le champion du sprint. Elle cache une arme au bout de ses longues pattes… Le guépard est seul. Qui l’emportera ?',
    fiches: [['jusqu’à 65 kg', 'une griffe-crochet au poignet', 'il fait trébucher sa proie', 'de toutes petites dents'], ['jusqu’à 130 kg', 'une griffe au bout du pied', 'un coup de pied à tuer un lion', 'elle ne peut pas s’envoler']],
    gigi: { pari: 'guepard', dit: 'Le guépard.', pourquoi: 'Il aura gagné avant la fin de ma phr… Trop tard.', apres: 'Une poule de 130 kg qui fait du karaté. OK.' },
    rep: { g: 'autruche', titre: 'CE QUE DISENT LES INDICES', cri: 'L’AUTRUCHE !', punch: 'Le guépard a préféré garder ses pattes.', tampon: 'bleu', label: 'D’APRÈS LES INDICES',
      film: 'Au Kalahari, des chercheurs ont noté ce que mangent les guépards. De l’autruche ? Presque jamais ! Elle pèse deux fois plus que lui, et gare à son coup de pied ! Alors, seul, il passe son chemin.' } },
  { n: 17, lieu: 'OCÉAN', q: 'ESPADON OU REQUIN BLEU ?', a: 'espadon', b: 'requinbleu', noms: ['ESPADON', 'REQUIN BLEU'], arene: 'ocean', p: 39, pv: 40,
    intro: 'L’espadon ferait un bon repas pour le requin bleu. Seulement voilà : ce poisson-là porte une épée. Le requin s’approche quand même. Qui gagne ?',
    fiches: [['jusqu’à 650 kg', 'une épée sur le nez', 'il tranche d’un coup de tête', 'ni dents ni écailles'], ['jusqu’à 240 kg', 'des dents en scie', 'il tourne autour de sa proie', 'il se balade à 1 km/h']],
    gigi: { pari: 'requinbleu', dit: 'Le requin.', pourquoi: 'Un grand nez, ça ne fait pas peur.', apres: 'Un grand nez POINTU. Je n’avais pas vu le pointu.' },
    rep: { g: 'espadon', titre: 'CE QUE DISENT LES INDICES', cri: 'L’ESPADON !', punch: 'En garde, requin !', tampon: 'bleu', label: 'D’APRÈS LES INDICES',
      film: 'En Espagne, des scientifiques examinent des requins bleus morts, rejetés par la mer. Dans plusieurs têtes, ils trouvent… des bouts d’épée d’espadon ! En Libye aussi : là-bas, la mer rejette un requin-renard mort, de 4,50 m. Près des branchies : une pointe d’épée !' } },
  { n: 18, lieu: 'SAVANE', q: 'HYÈNE OU LION ?', a: 'hyene', b: 'lion', noms: ['HYÈNE TACHETÉE', 'LION'], arene: 'savane', p: 41, pv: 42,
    intro: 'Ce soir, une hyène et un lion mâle veulent la même carcasse. Qui vole le repas de l’autre ?',
    fiches: [['environ 60 kg', 'des mâchoires casse-os', 'elle fatigue ses proies', 'son vacarme attire les voleurs'], ['environ 190 kg', 'des crocs de 7 cm', 'un coup de patte mortel', 'un cœur tout petit pour sa taille']],
    gigi: { pari: 'lion', dit: 'Le lion.', pourquoi: 'La hyène rigole, mais elle va moins rigoler.', apres: 'J’AVAIS BON ! Pourquoi tu as l’air surpris ?' },
    rep: { g: 'lion', titre: 'LA VRAIE RÉPONSE', cri: 'LE LION !', punch: 'Table réservée au patron !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Une hyène seule n’a aucune chance face à lui. Nombreuses, elles volent le repas des lionnes. Mais avec un lion mâle, c’est perdu d’avance.' } },
  { n: 19, lieu: 'FORÊT DU NORD', q: 'OURS NOIR OU GLOUTON ?', a: 'oursnoir', b: 'glouton', noms: ['OURS NOIR', 'GLOUTON'], arene: 'nord', p: 43, pv: 44,
    intro: 'Forêt du Grand Nord. Un ours noir a trouvé un repas caché sous la neige ! Arrive un glouton, gros comme un chien, neuf fois plus léger. Il ne s’en va pas. Qui garde le repas ?',
    fiches: [['jusqu’à 270 kg', 'des griffes courbes', 'il charge pour faire peur', 'plus gourmand que bagarreur'], ['jusqu’à 30 kg', 'une dent pour la viande gelée', 'il gronde et fonce', 'des pattes courtes']],
    gigi: { pari: 'glouton', dit: 'Le glouton.', pourquoi: 'Rien que le nom, il me plaît.', apres: 'Glouton un jour, glouton toujours. Comme moi.' },
    rep: { g: 'glouton', titre: 'CE QUE DISENT LES TÉMOINS', cri: 'LE GLOUTON !', punch: 'Qui gronde le plus fort mange en premier.', tampon: 'bleu', label: 'RACONTÉ PAR DES TÉMOINS',
      film: 'Souvent, le glouton fait fuir de leur repas des animaux bien plus gros que lui. Ours noirs, pumas… et des loups lui ont cédé la place ! Il ne recule pas. L’ours pourrait gagner… mais se faire mordre pour un repas ? Il préfère aller manger ailleurs.' } },
  { n: 20, boss: 2, lieu: 'FLORIDE', q: 'PYTHON OU ALLIGATOR ?', a: 'python', b: 'alligator', noms: ['PYTHON BIRMAN', 'ALLIGATOR'], arene: 'floride', p: 45, pv: 46,
    intro: 'Des pythons birmans, lâchés par leurs maîtres, ont envahi les marais de Floride. Problème : le chef, là-bas, c’est l’alligator ! Qui gagne ?',
    fiches: [['jusqu’à 98 kg', 'un corps qui serre', 'l’attaque surprise', 'il ne supporte pas le froid'], ['jusqu’à 450 kg', 'jusqu’à 80 dents', 'il mord, puis il roule', 'jeune, il se fait avaler']],
    gigi: { pari: 'alligator', dit: 'L’alligator.', pourquoi: 'Non, le python. Non… l’alligator.', apres: 'Match nul ?! On a le droit ? Et moi, zéro point ? Je proteste.' },
    rep: { g: 'nul', img: 'duel20_nul.webp', titre: 'LA VRAIE RÉPONSE', cri: 'MATCH NUL !', punch: 'Les yeux plus gros que le ventre !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Everglades, 2005. Un python géant a dû serrer un alligator comme ça… Des chercheurs trouvent le python mort : ventre éclaté, alligator dedans ! Aucun gagnant : les deux sont morts. Et la tête du python a disparu… Mystère !' } },
  { n: 21, lieu: 'RÉCIF', q: 'CRABE OU CREVETTE-MANTE ?', a: 'crabe', b: 'crevette', noms: ['CRABE', 'CREVETTE-MANTE'], arene: 'recif', p: 49, pv: 50,
    intro: 'La crevette-mante tient dans ta main et ressemble à un jouet. Le crabe, même taille, a une armure de chevalier. Sur le récif, qui va manger l’autre ?',
    fiches: [['environ 10 cm', 'deux pinces solides', 'il pince et ne lâche plus', 'sa carapace peut casser'], ['environ 10 cm', 'deux massues à ressort', 'elle casse les coquilles', 'molle quand elle mue']],
    gigi: { pari: 'crevette', dit: 'La crevette.', pourquoi: 'Elle a des gants de boxe !', apres: 'Je n’ai rien vu. Trop rapide. Mais j’avais bon !' },
    rep: { g: 'crevette', titre: 'LA VRAIE RÉPONSE', cri: 'LA CREVETTE-MANTE !', punch: 'Petite crevette, gros marteau.', tampon: 'vert', label: 'MESURÉ EN LABORATOIRE',
      film: 'Ses massues se déplient comme un ressort : elles partent à 80 km/h ! Ça va si vite qu’une bulle naît… et éclate. Deux coups pour le prix d’un ! À force, la carapace craque. À table !' } },
  { n: 22, lieu: 'SAVANE', q: 'GIRAFE OU LIONNES ?', a: 'girafe', b: 'lionne', noms: ['GIRAFE', 'LIONNES'], arene: 'savane', p: 51, pv: 52,
    intro: 'Une girafe se penche pour brouter, tranquille. Tout près, trois lionnes affamées rampent dans l’herbe. Une tonne de viande : de quoi nourrir la troupe pendant des jours. Qui gagne ?',
    fiches: [['jusqu’à 1 360 kg', 'un sabot large de 30 cm', 'le coup de pied qui assomme', 'si elle tombe, c’est fini'], ['jusqu’à 180 kg chacune', 'des griffes pour s’accrocher', 'elles sautent sur le dos', '7 fois plus légères qu’elle']],
    gigi: { pari: 'lionne', dit: 'Les lionnes.', pourquoi: 'Elles sont trois. Et la girafe, c’est un lampadaire.', apres: 'Un lampadaire qui cogne ! Trois contre une… et elles perdent ?' },
    rep: { g: 'girafe', titre: 'LA VRAIE RÉPONSE', cri: 'LA GIRAFE !', punch: 'Trois lionnes au tapis !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Une lionne saute sur le dos d’une girafe. Deux autres s’accrochent à ses pattes. La girafe se secoue : en 5 minutes, elle s’en débarrasse. Pendant 5 heures, elles reviennent à la charge. La girafe tient bon… et repart.' } },
  { n: 23, lieu: 'FORÊT D’ASIE', q: 'COBRA ROYAL OU PYTHON ?', a: 'cobra', b: 'python', noms: ['COBRA ROYAL', 'PYTHON RÉTICULÉ'], arene: 'asie', p: 53, pv: 54,
    intro: 'Un cobra royal, le plus long serpent venimeux du monde, croise un python réticulé, le plus long serpent tout court ! Mordre ou serrer : qui gagne ?',
    fiches: [['celui-ci : 3,60 m', 'un venin qui coupe le souffle', 'dressé, il poursuit l’ennemi', 'serré, il est en danger'], ['celui-ci : environ 1,80 m', 'des anneaux qui serrent', 'il mord, puis il s’enroule', 'aucun venin']],
    gigi: { pari: 'cobra', dit: 'Le cobra royal.', pourquoi: 'Il y a « royal » dans son nom.', apres: 'Roi des serpents, roi des pronostics : c’est moi.' },
    rep: { g: 'cobra', titre: 'LA VRAIE RÉPONSE', cri: 'LE COBRA ROYAL !', punch: 'Mordre bat serrer !', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: 'Au bord d’une route de Singapour, un cobra royal mord un python. Le python lui serre la tête ! Après 20 minutes, le cobra se dégage et s’éloigne.' } },
  { n: 24, lieu: 'FORÊT RUSSE', q: 'OURSE BRUNE OU TIGRE DE SIBÉRIE ?', a: 'grizzly', b: 'tigre', noms: ['OURSE BRUNE', 'TIGRE DE SIBÉRIE'], arene: 'foret', p: 55, pv: 56,
    intro: 'En Russie, des ours tuent parfois des tigres ! Dans la forêt glacée, un tigre croise une ourse brune. Qui mange l’autre ?',
    fiches: [['presque 200 kg', 'des griffes de 6 cm', 'elle frappe de la patte', 'un peu plus légère que lui'], ['celui-ci : 206 kg', 'des griffes de 10 cm', 'il mord la nuque', 'un gros ours lui vole ses proies']],
    gigi: { pari: 'tigre', dit: 'Pile, le tigre.', pourquoi: 'Face, l’ourse… Pile !', apres: 'Ma pièce ne se trompe jamais. Je la garde.' },
    rep: { g: 'tigre', titre: 'CE QUE DISENT LES INDICES', cri: 'LE TIGRE !', punch: 'Une morsure, et l’ourse n’a rien vu venir.', tampon: 'bleu', label: 'D’APRÈS LES INDICES',
      film: 'Des chercheurs suivent Dima, un tigre, grâce à son collier radio. Ils trouvent les restes d’une grande ourse. Les traces le disent : Dima a bondi du haut d’un talus raide.' } },
  { n: 26, lieu: 'AUSTRALIE', q: 'REQUIN-BOULEDOGUE OU CROCODILE MARIN ?', a: 'bouledogue', b: 'croco', noms: ['REQUIN-BOULEDOGUE', 'CROCODILE MARIN'], arene: 'estuaire', p: 59, pv: 60,
    intro: 'Nord de l’Australie. Dans la même rivière boueuse nagent Brutus, un crocodile géant, et un jeune requin-bouledogue bagarreur. Tu te baignes ? Non : tu paries. Qui croque l’autre ?',
    fiches: [['ce jeune : 1,50 m', 'une morsure record pour sa taille', 'il cogne, puis il mord', 'une peau sans armure'], ['Brutus : 5,50 m', 'une armure de plaques d’os', 'il bondit de l’eau', 'il lui manque une patte']],
    gigi: { pari: 'croco', dit: 'Le croco.', pourquoi: 'Il a plus de dents. J’ai compté.', apres: 'Il lui manque des dents ? J’ai bon quand même. Ça compte !' },
    rep: { g: 'croco', titre: 'LA VRAIE RÉPONSE', cri: 'LE CROCODILE !', punch: 'Même sur trois pattes, papi croque encore.', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: '2014. Une famille en bateau aperçoit Brutus. Sa patte avant ? Arrachée par un requin… ou par un autre croco. Et il a perdu des dents ! Dans sa gueule, en travers : un requin-bouledogue. La revanche ?' } },
  { n: 27, lieu: 'OCÉAN', q: 'BALEINE BLEUE OU ORQUES ?', a: 'baleine', b: 'orque', noms: ['BALEINE BLEUE', 'BANDE D’ORQUES'], arene: 'ocean', p: 61, pv: 62,
    intro: 'Le plus gros animal de la planète : sa langue pèse autant qu’un éléphant. Près de l’Australie, une bande d’orques l’encercle. La baleine plonge. Qui va gagner ?',
    fiches: [['jusqu’à 150 tonnes', 'un corps de 30 m', 'elle file à 32 km/h', 'pas une seule dent'], ['jusqu’à 10 tonnes chacune', 'des dents de 8 cm', 'l’attaque en bande', 'quinze fois plus légères']],
    gigi: { pari: 'orque', dit: 'Les orques.', pourquoi: 'Je parie toujours sur les plus nombreux.', apres: 'J’AVAIS BON ! Les plus nombreux gagnent. Retiens bien ça.' },
    rep: { g: 'orque', titre: 'LA VRAIE RÉPONSE', cri: 'LES ORQUES !', punch: 'Géante, oui. Invincible, non !', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Australie, 2019 : des chercheurs voient une douzaine d’orques foncer sur une baleine bleue adulte. D’autres arrivent, et encore d’autres. Ce sont les femelles qui mènent l’attaque.' } },
  { n: 30, boss: 3, lieu: 'FINALE', q: 'TIGRE OU GORILLE ?', a: 'tigre', b: 'gorille', noms: ['TIGRE DE SIBÉRIE', 'GORILLE'], arene: 'colisee', p: 67, pv: 68,
    intro: 'Ce duel de rêve n’a jamais eu lieu : le tigre vit en Asie, le gorille en Afrique. On a enquêté, round par round. Qui gagnerait ?',
    fiches: [['environ 175 kg', 'les plus longs crocs des félins', 'la morsure à la gorge', 'à la chasse, il rate 9 fois sur 10'], ['environ 160 kg', 'de longues canines', 'il charge en hurlant', 'il ne chasse jamais']],
    gigi: { pari: 'gorille', dit: 'Le gorille !', pourquoi: 'Tu as vu ses bras ?', apres: '2 rounds à 1 ?! L’arbitre était un tigre, c’est sûr !' },
    rep: { g: 'tigre', titre: 'NOTRE VERDICT', cri: 'LE TIGRE !', punch: 'Crocs 2, biceps 1 !', tampon: 'violet', label: 'DUEL IMAGINÉ',
      film: 'Round 1, l’embuscade : tigre. Round 2, la charge : gorille. Round 3, le chasseur : tigre. Le tigre tue pour vivre. Le gorille, lui, gagne ses disputes en faisant peur.' } },
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
  const s = scoreLivre(), box = $('duels-liste'); box.innerHTML = ''; box.classList.toggle('quatre', DUELS.length > 9); // plus de 9 duels : 4 colonnes, pour que tout tienne sur l'écran
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
  if (window.trophee) { // trophées du livre
    if (!deja) { if (r.bon) { trophee('pari1', true); if (Object.values(SAVE.livre).filter(x => x.bon).length >= 5) trophee('pari5', true) } if (L.pari === D.gigi.pari) trophee('gigi', true) }
    if (DUELS.every(x => SAVE.livre[x.n])) trophee('duels', true);
    if (gagneArene && D.boss) { SAVE.bossGagnes = SAVE.bossGagnes || {}; SAVE.bossGagnes[D.n] = 1; if ([10, 20, 30].every(n => SAVE.bossGagnes[n])) trophee('boss', true) } }
  else if (gagneArene) r.etoiles = Math.max(r.etoiles || 0, etoilesCombat);
  sauve();
  G.phase = 'menu'; show('verdict');
  const moi = nomDuel(D, L.moi);
  $('v-arene').innerHTML = gagneArene ? `DANS L’ARÈNE, ${ton(moi)} A GAGNÉ ! <span class="et">${'★'.repeat(etoilesCombat)}</span>` : `DANS L’ARÈNE, ${ton(moi)} A PERDU…`;
  $('v-question').textContent = 'ET DANS LA VRAIE VIE ?';
  const carte = $('v-carte'); carte.classList.remove('tamponne'); carte.hidden = true;
  $('v-tampon').className = 'tampon ' + R.tampon; $('v-tampon').textContent = R.label;
  $('v-titre').textContent = R.titre; $('v-cri').textContent = R.cri; $('v-punch').textContent = R.punch; $('v-film').textContent = R.film;
  $('v-img').src = R.img || R.g + '_fin.webp'; // (duel 20 : match nul → une image avec les deux animaux)
  const pariTxt = r.pari === 'nul' ? 'MATCH NUL' : nomDuel(D, r.pari);
  $('v-toi').innerHTML = deja && L.rejoue ? `Ton pari (déjà compté) : <b>${pariTxt}</b> ${r.bon ? '✔' : '✘'}` : r.bon ? `Ton pari : <b>${pariTxt}</b> ✔ BON PARI ! +1 point${D.boss ? ' + 1 étoile de boss ★' : ''}` : `Ton pari : <b>${pariTxt}</b> ✘ raté… Ce n’est pas grave : dans la nature, le plus fort ne gagne pas à tous les coups !`;
  $('v-gigi-img').src = `gigi/duel_${String(D.n).padStart(2, '0')}_verso.svg`;
  $('v-gigi').innerHTML = `<b>GIGI</b> avait parié : ${D.gigi.dit} ${D.gigi.pari === R.g ? '✔' : '✘'}<br><i>${D.gigi.apres}</i>`;
  const s = scoreLivre(); $('v-score').innerHTML = `TOI <b>${s.toi}</b> · GIGI <b>${s.gigi}</b>`;
  $('v-page').textContent = `La suite de l’enquête est à la page ${D.pv} du livre !`;
  $('v-badges').innerHTML = (nv || []).map(id => `<span>NOUVEAU TROPHÉE : ${BADGES.find(x => x[0] === id)[1]}</span>`).join('') + (G.finExtra || '');
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
