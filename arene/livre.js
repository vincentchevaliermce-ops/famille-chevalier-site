// =====================================================================
//  LES DUELS DU LIVRE « C'est qui le plus fort ? » (tome 1 : 30 duels, 3 manches de 10, boss aux duels 10, 20, 30).
//  (26/09, M8 : architecture « hyper simple » voulue par Vincent) — plus d'aventure à suivre dans l'ordre :
//  • à 1 JOUEUR, quand tu choisis une paire du livre (lion contre tigre…), tu paries d'abord « DANS LA VRAIE VIE, QUI GAGNE ? »,
//    tu te bats, puis tu découvres la VRAIE RÉPONSE et tu réponds à UNE question : l'animal battu rejoint ton équipe ;
//  • la liste des 30 duels (MES ANIMAUX → 📖 DUELS) : un duel se joue dès que tu as l'un de ses deux animaux (et que son monde est ouvert) ;
//  • les 3 LÉGENDES se réveillent quand leur monde est complet (voir PROGRESSION dans game.js).
//  Un nouveau tome = de nouvelles lignes dans DUELS (numéros 31, 32…), SOMMAIRE et QUESTIONS, même moule.
//  Textes repris MOT POUR MOT du livre imprimé (TEXTE_IMPRIME_V19, 25/09) : page du duel (p) et page de la réponse (pv).
//  Contrôle : python3 verif/sync_livre.py TEXTE_IMPRIME_V19_74P.md
// =====================================================================
const DUELS = [
  { n: 1, lieu: 'JAPON', q: 'FRELON GÉANT OU ABEILLES JAPONAISES ?', a: 'frelon', b: 'abeille', noms: ['FRELON GÉANT', 'ABEILLES JAPONAISES'], arene: 'ruche', p: 5, pv: 6,
    intro: 'Un frelon géant entre dans une ruche. Il est seul. Les abeilles sont des centaines, mais minuscules. Qui s’en sort ?',
    fiches: [['près de 4 cm', 'un dard de 6 mm', 'il coupe la tête des abeilles', 'il supporte mal la chaleur'], ['environ 1 cm', 'un petit dard', 'elles foncent toutes ensemble', 'un corps fragile']],
    gigi: { pari: 'abeille', dit: 'Les abeilles.', pourquoi: 'Je parie toujours sur les plus nombreux.', apres: 'J’AVAIS BON ! Premier point pour Gigi. Trop facile !' },
    rep: { g: 'abeille', titre: 'LA VRAIE RÉPONSE', cri: 'LES ABEILLES !', punch: 'Le frelon est cuit !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Sans piquer, plus de 500 abeilles enferment le frelon dans une boule vivante. Là-dedans, toutes les abeilles grelottent en même temps. La boule chauffe comme un four ! Une demi-heure plus tard, le frelon ne bouge plus.' } },
  { n: 2, lieu: 'OCÉAN', q: 'ORQUE OU GRAND REQUIN BLANC ?', a: 'orque', b: 'requin', noms: ['ORQUE', 'GRAND REQUIN BLANC'], arene: 'ocean', force: { orque: 1.1 }, p: 7, pv: 8,
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
  { n: 4, lieu: 'SAVANE DE NUIT', q: 'LÉOPARD OU PORC-ÉPIC ?', a: 'leopard', b: 'porcepic', noms: ['LÉOPARD', 'PORC-ÉPIC'], arene: 'nuit', force: { leopard: 1.076 }, p: 11, pv: 12,
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
  { n: 6, lieu: 'GRAND NORD', q: 'OURS POLAIRE OU GRIZZLY ?', a: 'ours', b: 'grizzly', noms: ['OURS POLAIRE', 'GRIZZLY'], arene: 'plage', force: { ours: 1.118 }, p: 15, pv: 16,
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
  { n: 8, lieu: 'SAVANE', q: 'LION OU RATEL ?', a: 'lion', b: 'ratel', noms: ['LION', 'RATEL'], arene: 'desert', force: { lion: 1.03 }, p: 19, pv: 20,
    intro: 'Sur Internet, des vidéos montrent le ratel, une sorte de blaireau d’Afrique, tenir tête à des lions. 13 kilos de rage contre 190 ! Des chercheurs sont allés vérifier. Alors, qui gagne ?',
    fiches: [['environ 190 kg', 'des crocs de 7 cm', 'il plaque sa proie au sol', 'il chasse mal en plein jour'], ['jusqu’à 13 kg', 'de longues griffes', 'la bombe puante', 'surpris, il fonce sans réfléchir']],
    gigi: { pari: 'ratel', dit: 'Le ratel !', pourquoi: 'J’ai vu la vidéo : il est INVINCIBLE.', apres: 'Internet m’a menti. Je suis très déçu.' },
    rep: { g: 'lion', titre: 'LA VRAIE RÉPONSE', cri: 'LE LION !', punch: 'Courageux… mais pas fou !', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Dans le désert du Kalahari, des lions et des léopards ont déjà tué des ratels. Son vrai talent ? Il ne gagne pas : il dégoûte. Il mord, il pue… et parfois, le fauve renonce !' } },
  { n: 9, lieu: 'AQUARIUM', q: 'PIEUVRE GÉANTE OU REQUIN ?', a: 'pieuvre', b: 'aiguillat', noms: ['PIEUVRE GÉANTE', 'REQUIN AIGUILLAT'], arene: 'aquarium', force: { aiguillat: 1.15 }, p: 21, pv: 22,
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
  { n: 12, lieu: 'DÉSERT', q: 'MYGALE OU GUÊPE GÉANTE ?', a: 'mygale', b: 'guepe', noms: ['MYGALE', 'GUÊPE GÉANTE'], arene: 'sable', p: 29, pv: 30,
    intro: 'Une mygale du désert, poilue, grande comme ta main. Face à elle se dresse une guêpe géante aux ailes orange, longue comme ton petit doigt. Elles se tournent autour. Qui va attraper l’autre ?',
    fiches: [['12 cm avec les pattes', 'des crochets à venin', 'elle jette ses poils piquants', 'elle voit très mal'], ['jusqu’à 5 cm', 'un dard de 7 mm', 'elle pique et paralyse', 'elle doit piquer entre les pattes']],
    gigi: { pari: 'guepe', dit: 'La guêpe.', pourquoi: 'Elle vole. Je parie toujours sur ceux qui volent.', apres: 'J’AVAIS BON ! Ceux qui volent gagnent toujours. Enfin, souvent.' },
    rep: { g: 'guepe', titre: 'LA VRAIE RÉPONSE', cri: 'LA GUÊPE !', punch: 'La chasseuse de monstres.', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'La guêpe cherche l’ouverture… puis glisse son dard sous la mygale et pique. La mygale ne peut plus bouger. La guêpe la traîne jusqu’à un terrier. La guêpe pond un œuf sur la mygale, puis rebouche le terrier. Le bébé guêpe mangera la mygale, paralysée mais vivante.' } },
  { n: 13, lieu: 'BANQUISE', q: 'OURS POLAIRE OU MORSE ?', a: 'ours', b: 'morse', noms: ['OURS POLAIRE', 'MORSE'], arene: 'banquise', p: 31, pv: 32,
    intro: 'L’ours polaire sent un phoque à plus d’un kilomètre, même sous la neige. Aujourd’hui, il a trouvé mieux : une plage couverte de morses. Qui gagne ?',
    fiches: [['jusqu’à 545 kg', 'des griffes en crochet', 'il fait paniquer le troupeau', 'l’été, sans banquise, il a faim'], ['jusqu’à 1 500 kg', 'des défenses de 90 cm', 'il frappe avec ses défenses', 'affolé, le troupeau écrase ses petits']],
    gigi: { pari: 'ours', dit: 'L’ours.', pourquoi: 'Le morse, c’est un canapé à moustaches.', apres: 'Un canapé d’une tonne et demie, avec des épées.' },
    rep: { g: 'morse', titre: 'LA VRAIE RÉPONSE', cri: 'LE MORSE !', punch: 'Pas touche au troupeau !', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'L’ours fonce sur le troupeau de morses pour lui faire peur. Les adultes font face, défenses en avant. L’ours freine. 23 sur 25 attaques d’ours contre des morses ont raté.' } },
  { n: 14, lieu: 'INDE', q: 'MANGOUSTE OU COBRA ?', a: 'mangouste', b: 'cobra', noms: ['MANGOUSTE', 'COBRA'], arene: 'inde', force: { mangouste: 1.237 }, p: 33, pv: 34,
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
  { n: 19, lieu: 'FORÊT DU NORD', q: 'OURS NOIR OU GLOUTON ?', a: 'oursnoir', b: 'glouton', noms: ['OURS NOIR', 'GLOUTON'], arene: 'nord', force: { oursnoir: 1.076 }, p: 43, pv: 44,
    intro: 'Forêt du Grand Nord. Un ours noir a trouvé un repas caché sous la neige ! Arrive un glouton, gros comme un chien, neuf fois plus léger. Il ne s’en va pas. Qui garde le repas ?',
    fiches: [['jusqu’à 270 kg', 'des griffes courbes', 'il charge pour faire peur', 'plus gourmand que bagarreur'], ['jusqu’à 30 kg', 'une dent pour la viande gelée', 'il gronde et fonce', 'des pattes courtes']],
    gigi: { pari: 'glouton', dit: 'Le glouton.', pourquoi: 'Rien que le nom, il me plaît.', apres: 'Glouton un jour, glouton toujours. Comme moi.' },
    rep: { g: 'glouton', titre: 'CE QUE DISENT LES TÉMOINS', cri: 'LE GLOUTON !', punch: 'Qui gronde le plus fort mange en premier.', tampon: 'bleu', label: 'RACONTÉ PAR DES TÉMOINS',
      film: 'Souvent, le glouton fait fuir de leur repas des animaux bien plus gros que lui. Ours noirs, pumas… et des loups lui ont cédé la place ! Il ne recule pas. L’ours pourrait gagner… mais se faire mordre pour un repas ? Il préfère aller manger ailleurs.' } },
  { n: 20, boss: 2, lieu: 'FLORIDE', q: 'PYTHON OU ALLIGATOR ?', a: 'python', b: 'alligator', noms: ['PYTHON BIRMAN', 'ALLIGATOR'], arene: 'floride', force: { alligator: 1.05 }, p: 45, pv: 46,
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
  { n: 23, lieu: 'FORÊT D’ASIE', q: 'COBRA ROYAL OU PYTHON ?', a: 'cobra', b: 'python', noms: ['COBRA ROYAL', 'PYTHON RÉTICULÉ'], arene: 'asie', force: { cobra: 1.162 }, p: 53, pv: 54,
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
  { n: 25, lieu: 'GROTTE', q: 'SCOLOPENDRE GÉANTE OU CHAUVE-SOURIS ?', a: 'scolopendre', b: 'chauvesouris', noms: ['SCOLOPENDRE GÉANTE', 'CHAUVE-SOURIS'], arene: 'grotte', force: { scolopendre: 1.142 }, p: 57, pv: 58,
    intro: 'Une grotte du Venezuela. Au plafond, 50 000 chauves-souris. Sur la roche, une scolopendre géante, un mille-pattes venimeux long comme ta règle. L’une vole, l’autre rampe. Qui attrape l’autre ?',
    fiches: [['jusqu’à 30 cm', 'un venin qui paralyse', 'elle chasse la tête en bas', 'elle se dessèche vite'], ['corps de moins de 10 cm', 'de petites dents pointues', 'elle chasse au sonar', 'des ailes en peau très fine']],
    gigi: { pari: 'scolopendre', dit: 'La scolopendre.', pourquoi: 'Plus tu as de pattes, plus tu es fort.', apres: 'Logique de Gigi : 2. Reste du monde : 0.' },
    rep: { g: 'scolopendre', titre: 'LA VRAIE RÉPONSE', cri: 'LA SCOLOPENDRE !', punch: 'Le cauchemar a 42 pattes.', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'La scolopendre s’accroche par l’arrière et laisse pendre son corps dans le vide. Une chauve-souris passe. Les pattes avant se referment, les crochets à venin mordent. Des chercheurs l’ont vue manger des chauves-souris plus lourdes qu’elle !' } },
  { n: 26, lieu: 'AUSTRALIE', q: 'REQUIN-BOULEDOGUE OU CROCODILE MARIN ?', a: 'bouledogue', b: 'croco', noms: ['REQUIN-BOULEDOGUE', 'CROCODILE MARIN'], arene: 'estuaire', p: 59, pv: 60,
    intro: 'Nord de l’Australie. Dans la même rivière boueuse nagent Brutus, un crocodile géant, et un jeune requin-bouledogue bagarreur. Tu te baignes ? Non : tu paries. Qui croque l’autre ?',
    fiches: [['ce jeune : 1,50 m', 'une morsure record pour sa taille', 'il cogne, puis il mord', 'une peau sans armure'], ['Brutus : 5,50 m', 'une armure de plaques d’os', 'il bondit de l’eau', 'il lui manque une patte']],
    gigi: { pari: 'croco', dit: 'Le croco.', pourquoi: 'Il a plus de dents. J’ai compté.', apres: 'Il lui manque des dents ? J’ai bon quand même. Ça compte !' },
    rep: { g: 'croco', titre: 'LA VRAIE RÉPONSE', cri: 'LE CROCODILE !', punch: 'Même sur trois pattes, papi croque encore.', tampon: 'vert', label: 'FILMÉ OU PHOTOGRAPHIÉ',
      film: '2014. Une famille en bateau aperçoit Brutus. Sa patte avant ? Arrachée par un requin… ou par un autre croco. Et il a perdu des dents ! Dans sa gueule, en travers : un requin-bouledogue. La revanche ?' } },
  { n: 27, lieu: 'OCÉAN', q: 'BALEINE BLEUE OU ORQUES ?', a: 'baleine', b: 'orque', noms: ['BALEINE BLEUE', 'BANDE D’ORQUES'], arene: 'ocean', force: { orque: 1.28 }, p: 61, pv: 62,
    intro: 'Le plus gros animal de la planète : sa langue pèse autant qu’un éléphant. Près de l’Australie, une bande d’orques l’encercle. La baleine plonge. Qui va gagner ?',
    fiches: [['jusqu’à 150 tonnes', 'un corps de 30 m', 'elle file à 32 km/h', 'pas une seule dent'], ['jusqu’à 10 tonnes chacune', 'des dents de 8 cm', 'l’attaque en bande', 'quinze fois plus légères']],
    gigi: { pari: 'orque', dit: 'Les orques.', pourquoi: 'Je parie toujours sur les plus nombreux.', apres: 'J’AVAIS BON ! Les plus nombreux gagnent. Retiens bien ça.' },
    rep: { g: 'orque', titre: 'LA VRAIE RÉPONSE', cri: 'LES ORQUES !', punch: 'Géante, oui. Invincible, non !', tampon: 'vert', label: 'VU DANS LA NATURE',
      film: 'Australie, 2019 : des chercheurs voient une douzaine d’orques foncer sur une baleine bleue adulte. D’autres arrivent, et encore d’autres. Ce sont les femelles qui mènent l’attaque.' } },
  { n: 28, lieu: 'JARDIN', q: 'MANTE RELIGIEUSE OU COLIBRI ?', a: 'mante', b: 'colibri', noms: ['MANTE RELIGIEUSE', 'COLIBRI'], arene: 'jardin', force: { mante: 1.085 }, p: 63, pv: 64,
    intro: 'Le colibri, oiseau minuscule, bat des ailes 53 fois par seconde. Il fonce vers une mangeoire d’eau sucrée. Une mante religieuse guette tout près. Un insecte contre un oiseau : qui attrape l’autre ?',
    fiches: [['jusqu’à 7 g', 'des pattes-pièges à piquants', 'elle frappe en un éclair', 'souvent mangée par les oiseaux'], ['environ 3 g', 'un bec en aiguille', 'il vole même en arrière', 'il doit boire sans arrêt']],
    gigi: { pari: 'colibri', dit: 'Le colibri.', pourquoi: 'Ceux qui volent gagnent toujours !', apres: '« Ceux qui volent gagnent toujours » ? Je retire tout.' },
    rep: { g: 'mante', titre: 'LA VRAIE RÉPONSE', cri: 'LA MANTE !', punch: 'La brindille avait faim.', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'La mante se poste près de la mangeoire et ne bouge plus. On dirait une brindille verte. Un colibri s’approche. Aussitôt, les pattes-pièges se referment. Plus lourde que lui, la mante ne le lâche plus !' } },
  { n: 29, lieu: 'AUSTRALIE', q: 'JEUNE SERPENT BRUN OU VEUVE NOIRE ?', a: 'serpentbrun', b: 'veuve', noms: ['JEUNE SERPENT BRUN', 'VEUVE NOIRE'], arene: 'tronc', p: 65, pv: 66,
    intro: 'Une veuve noire à dos rouge guette sous un vieux tronc. Un bébé serpent brun se glisse par là. Qui mangera l’autre ?',
    fiches: [['environ 27 cm', 'des crochets à venin', 'il fouille chaque cachette', 'tout jeune, il débute'], ['1 cm', 'un venin très puissant', 'elle ficelle sa proie', 'on l’écrase d’un doigt']],
    gigi: { pari: 'serpentbrun', dit: 'Le serpent.', pourquoi: 'L’araignée fait UN centimètre, allô !', apres: 'UN centimètre ?! Allô… Je raccroche.' },
    rep: { g: 'veuve', titre: 'LA VRAIE RÉPONSE', cri: 'LA VEUVE NOIRE !', punch: 'Elle l’a pris dans ses filets.', tampon: 'vert', label: 'COMPTÉ PAR DES CHERCHEURS',
      film: 'Le serpent touche un fil gluant. Il se débat… et s’emmêle encore plus. L’araignée descend, l’entoure de soie et mord. Son venin paralyse le serpent.' } }, // (sans « … du sol » : c'est un mot « livre en main » de la veuve noire)
  { n: 30, boss: 3, lieu: 'FINALE', q: 'TIGRE OU GORILLE ?', a: 'tigre', b: 'gorille', noms: ['TIGRE DE SIBÉRIE', 'GORILLE'], arene: 'colisee', p: 67, pv: 68,
    intro: 'Ce duel de rêve n’a jamais eu lieu : le tigre vit en Asie, le gorille en Afrique. On a enquêté, round par round. Qui gagnerait ?',
    fiches: [['environ 175 kg', 'les plus longs crocs des félins', 'la morsure à la gorge', 'à la chasse, il rate 9 fois sur 10'], ['environ 160 kg', 'de longues canines', 'il charge en hurlant', 'il ne chasse jamais']],
    gigi: { pari: 'gorille', dit: 'Le gorille !', pourquoi: 'Tu as vu ses bras ?', apres: '2 rounds à 1 ?! L’arbitre était un tigre, c’est sûr !' },
    rep: { g: 'tigre', titre: 'NOTRE VERDICT', cri: 'LE TIGRE !', punch: 'Crocs 2, biceps 1 !', tampon: 'violet', label: 'DUEL IMAGINÉ',
      film: 'Round 1, l’embuscade : tigre. Round 2, la charge : gorille. Round 3, le chasseur : tigre. Le tigre tue pour vivre. Le gorille, lui, gagne ses disputes en faisant peur.' } },
];
const LIVRE_TOTAL = DUELS.length; // duels du livre (tome 1 : 30 ; un tome 2 ajoute ses duels à DUELS : 31, 32…)
// le nom court de chaque duel, MOT POUR MOT comme dans le sommaire du livre (page 4) : écrit sur sa carte
const SOMMAIRE = ['Frelon / Abeilles', 'Orque / Requin', 'Lion / Tigre', 'Léopard / Porc-épic', 'Hippo / Crocodile', 'Ours polaire / Grizzly', 'Jaguar / Anaconda', 'Lion / Ratel', 'Pieuvre / Requin', 'Dragon / Buffle',
  'Puma / Loup', 'Mygale / Guêpe', 'Ours polaire / Morse', 'Mangouste / Cobra', 'Jaguar / Caïman', 'Guépard / Autruche', 'Espadon / Requin', 'Hyène / Lion', 'Ours noir / Glouton', 'Python / Alligator',
  'Crabe / Crevette', 'Girafe / Lionnes', 'Cobra / Python', 'Ourse / Tigre', 'Scolopendre / Chauve-souris', 'Requin / Crocodile', 'Baleine / Orques', 'Mante / Colibri', 'Serpent / Veuve noire', 'Tigre / Gorille'];
// la question de chaque duel (2A) : sa réponse se lit dans la VRAIE RÉPONSE que l'enfant vient de lire (page verso du livre) ;
// les deux autres n'y sont pas et ont la même forme. Contrôle : verif/sync_livre.py (section 1).
const QUESTIONS = {
  1: ['Comment les abeilles battent-elles le frelon ?', ['elles l’enferment dans une boule qui chauffe', 'elles le piquent toutes en même temps', 'elles le chassent loin de la ruche']],
  2: ['Quel morceau du requin l’orque préfère-t-elle ?', ['le foie', 'le cœur', 'le cerveau']],
  3: ['Combien le tigre pèse-t-il de plus que le lion ?', ['environ 30 kg', 'environ 5 kg', 'environ 300 kg']],
  4: ['Comment le porc-épic se défend-il contre le léopard ?', ['il recule à toute vitesse', 'il saute très haut', 'il se cache sous l’eau']],
  5: ['Où grimpe le crocodile pour s’échapper ?', ['sur le dos des hippopotames', 'sur un tronc d’arbre', 'sur un gros rocher']],
  6: ['Le grizzly fait filer tous les ours polaires… sauf combien ?', ['sauf un', 'sauf dix', 'sauf cinq']],
  7: ['Où le serpent mord-il le jaguar ?', ['au museau', 'au ventre', 'au cou']],
  8: ['Quel est le vrai talent du ratel ?', ['il dégoûte', 'il court très vite', 'il grimpe aux arbres']],
  9: ['Qui faisait disparaître les requins de l’aquarium ?', ['la pieuvre', 'la murène', 'la tortue']],
  10: ['Que fait le buffle quand le dragon lui mord la patte ?', ['il se secoue et repart', 'il tombe et ne bouge plus', 'il s’enfuit dans la jungle']],
  11: ['Où la louve tuée par le puma était-elle cachée ?', ['sous la neige', 'sous un rocher', 'sous des feuilles']],
  12: ['Où la guêpe traîne-t-elle la mygale ?', ['jusqu’à un terrier', 'jusqu’à une fleur', 'jusqu’à un arbre']],
  13: ['Sur 25 attaques d’ours contre des morses, combien ont raté ?', ['23', '5', '15']],
  14: ['Quand la mangouste mord-elle enfin le cobra ?', ['quand il fatigue', 'quand il dort', 'quand il mange']],
  15: ['Qui a filmé l’attaque du jaguar ?', ['un touriste', 'un chercheur', 'un pêcheur']],
  16: ['Combien pèse l’autruche, par rapport au guépard ?', ['deux fois plus que lui', 'deux fois moins que lui', 'autant que lui']],
  17: ['Qu’ont trouvé les scientifiques dans la tête des requins bleus ?', ['des bouts d’épée d’espadon', 'des dents de crocodile', 'des arêtes de poisson']],
  18: ['À qui les hyènes, quand elles sont nombreuses, volent-elles le repas ?', ['aux lionnes', 'aux vautours', 'aux éléphants']],
  19: ['Plutôt que de se faire mordre, que préfère faire l’ours noir ?', ['aller manger ailleurs', 'aller dormir dans sa grotte', 'aller chercher ses amis']],
  20: ['Qu’y avait-il dans le ventre du python ?', ['un alligator', 'un cerf', 'un poisson']],
  21: ['À quelle vitesse partent les massues de la crevette-mante ?', ['80 km/h', '8 km/h', '800 km/h']],
  22: ['Pendant combien de temps les lionnes reviennent-elles à la charge ?', ['5 heures', '5 secondes', '5 jours']],
  23: ['Au bout de combien de temps le cobra royal se dégage-t-il ?', ['après 20 minutes', 'après 5 secondes', 'après 3 jours']],
  24: ['Comment les chercheurs suivent-ils le tigre Dima ?', ['grâce à son collier radio', 'grâce à ses empreintes', 'grâce à un drone']],
  25: ['Comment la scolopendre attend-elle les chauves-souris ?', ['elle laisse pendre son corps dans le vide', 'elle se cache sous une pierre', 'elle creuse un trou dans le sable']],
  26: ['Qu’est-ce que Brutus tient dans sa gueule ?', ['un requin-bouledogue', 'une tortue', 'un gros poisson']],
  27: ['Chez les orques, qui mène l’attaque ?', ['les femelles', 'les bébés', 'les vieux mâles']],
  28: ['À quoi ressemble la mante qui attend près de la mangeoire ?', ['à une brindille verte', 'à une fleur rose', 'à une feuille morte']],
  29: ['Que fait le venin de la veuve noire au serpent ?', ['il le paralyse', 'il l’endort', 'il le rend aveugle']],
  30: ['Comment le gorille gagne-t-il ses disputes ?', ['en faisant peur', 'en mordant très fort', 'en courant très vite']],
};
const LEGENDES_LIVRE = [{ k: 'trex', m: 'terre', arene: 'prehisto' }, { k: 'meganeura', m: 'betes', arene: 'jardin' }, { k: 'megalo', m: 'mer', arene: 'abysses' }]; // (M8) chacune se réveille quand son monde est complet
SAVE.livre = SAVE.livre || {};
const pret = k => !!CHARS[k] && ORDRE.includes(k);
const duelPret = D => pret(D.a) && pret(D.b);
const fait = D => !!SAVE.livre[D.n]; // le pari est compté (une seule fois, comme dans le livre)
const fini = D => { const r = SAVE.livre[D.n]; return !!r && r.ok !== false }; // duel GAGNÉ : combat gagné + question réussie (les duels joués avant le 25/09 comptent)
const estLeg = k => LEGENDES_LIVRE.some(x => x.k === k);
// (M8) ce qu'un duel du livre fait gagner : ses animaux qu'on n'a pas encore (d'habitude : l'adversaire qu'on vient de battre)
const gainsDuel = D => [...new Set([D.a, D.b])].filter(k => pret(k) && !estLeg(k) && !SAVE.debloques.includes(k));
// (M8) la paire du livre entre deux animaux, dans un sens ou dans l'autre (écran « CONTRE QUI ? » : ruban 📖 et pari)
function duelEntre(a, b) { return DUELS.find(D => duelPret(D) && ((D.a === a && D.b === b) || (D.a === b && D.b === a))) || null }
// d'où vient un animal (collection) : les 4 de départ, un duel du livre, le livre (champions), les légendes
function sourceDe(k) {
  if (DE_BASE.includes(k)) return { t: 'base' };
  if (champion(k)) return { t: 'livre', D: DUELS.find(x => x.a === k || x.b === k) };
  if (estLeg(k)) return { t: 'legende' };
  const D = DUELS.find(x => x.a === k || x.b === k); return D ? { t: 'duel', D } : { t: '?' };
}
// (M8) un duel se joue quand ses mondes sont ouverts et qu'on a déjà l'un de ses deux animaux : on se bat avec lui
function duelOuvert(D) {
  if (!duelPret(D)) return false; if (G.god || fait(D)) return true;
  return [D.a, D.b].every(k => mondeOuvert(mondeDe(k))) && [D.a, D.b].some(k => SAVE.debloques.includes(k));
}
const mondeFermeDuel = D => [D.a, D.b].map(mondeDe).find(m => !mondeOuvert(m)) || null;
const combattants = D => { const l = [...new Set([D.a, D.b])].filter(debloque); return l.length ? l : [D.a, D.b] }; // on se bat avec un animal à soi (anciennes sauvegardes : n'importe lequel)
function scoreLivre() {
  let toi = 0, gigi = 0, etoiles = 0;
  for (const D of DUELS) { const r = SAVE.livre[D.n]; if (!r) continue; if (r.bon) { toi++; if (D.boss) etoiles++ } if (D.gigi.pari === D.rep.g) gigi++ }
  return { toi, gigi, etoiles };
}
const nomDuel = (D, k) => D.noms[k === D.a ? 0 : 1];
// --- écran 1 : la liste des duels, en 3 MANCHES comme dans le livre (10 duels par onglet : tout tient sur l'écran d'un téléphone)
const manche = D => Math.ceil(D.n / 10);
const prochainDuel = () => DUELS.find(x => !fini(x) && duelOuvert(x));
const legendesPretes = () => LEGENDES_LIVRE.filter(x => pret(x.k) && !SAVE.debloques.includes(x.k) && legendePrete(x.m));
const n2 = n => String(n).padStart(2, '0');
let mancheLivre = 0; // l'onglet affiché
function ouvreLivre() {
  const dePari = G.screen === 'pari' && G.livre && G.livre.D; // retour d'un pari : on revient sur sa manche
  sonInit(); G.phase = 'menu'; G.livre = null; G.quest = null; finEpreuve(); show('livre');
  const s = scoreLivre(), suivant = prochainDuel(), legAttend = legendesPretes().length > 0;
  $('livre-score').innerHTML = `<span>TOI <b>${s.toi}</b></span><img src="gigi/duel_03_recto.svg" alt=""><span>GIGI <b>${s.gigi}</b></span>` + (s.etoiles ? `<span class="boss-et">${'★'.repeat(s.etoiles)}</span>` : '');
  $('livre-msg').textContent = '';
  heroLivre(suivant, legAttend);
  ongletLivre(dePari ? manche(dePari) : mancheLivre || (suivant ? manche(suivant) : legAttend ? 4 : 1));
}
// (25/09, M5) la grande carte orange : le prochain duel à jouer, en un geste
function heroLivre(suivant, legAttend) {
  const h = $('livre-hero'); if (!h) return;
  if (suivant) {
    const [na, nb] = (SOMMAIRE[suivant.n - 1] || suivant.noms.join(' / ')).split(' / '), r = SAVE.livre[suivant.n];
    const etat = r && !fini(suivant) ? (r.combat ? '❓ LA QUESTION !' : '⚔️ À GAGNER !') : suivant.boss ? '💥 BOSS !' : '';
    h.className = 'livre-hero' + (suivant.boss ? ' boss' : ''); h.hidden = false;
    h.innerHTML = `<span class="lh-go R">▶ JOUER<small>DUEL ${n2(suivant.n)}</small></span><span class="lh-corps"><span class="lh-tetes"><img src="${suivant.a}_tete.webp" alt=""><em>VS</em><img src="${suivant.b}_tete.webp" alt=""></span>` +
      `<span class="lh-txt"><small>📖 page ${suivant.p}</small><b class="R">${na.toUpperCase()} OU ${nb.toUpperCase()} ?</b>${etat ? `<i>${etat}</i>` : ''}</span></span>`;
    h.onclick = () => { sfx('valide'); if (r && !fini(suivant) && r.combat) ouvreQuestion(suivant); else ouvrePari(suivant) };
  } else if (legAttend) {
    const L = legendesPretes(), M = MONDES[L[0].m];
    h.className = 'livre-hero leg'; h.hidden = false;
    h.innerHTML = `<span class="lh-go R">★<small>LÉGENDE</small></span><span class="lh-corps"><span class="lh-tetes">${L.slice(0, 2).map(x => `<img src="${x.k}_tete.webp" alt="">`).join('<em>·</em>')}</span><span class="lh-txt"><small>${M.ico} ${M.nom} : tous gagnés !</small><b class="R">UNE LÉGENDE SE RÉVEILLE !</b><i>★ VIENS L’AFFRONTER</i></span></span>`;
    h.onclick = () => { sfx('valide'); lanceLegende(L[0]) };
  } else h.hidden = true;
}
function ongletLivre(m) {
  mancheLivre = m; const suivant = prochainDuel(), ong = $('livre-onglets');
  ong.innerHTML = [...new Set(DUELS.map(manche))].map(k => { // (M8) une manche = 10 duels (tome 2 : manches 4, 5, 6…)
    const L = DUELS.filter(D => manche(D) === k), f = L.filter(fini).length;
    return `<button class="btn R" type="button" data-manche="${k}" aria-pressed="${k === m}">MANCHE ${k}${f === L.length ? '<small>✔</small>' : ''}</button>`;
  }).join('') + `<button class="btn R leg" type="button" data-manche="4" aria-pressed="${m === 4}">★ LÉGENDES${LEGENDES_LIVRE.every(x => SAVE.debloques.includes(x.k)) ? '<small>✔</small>' : ''}</button>`;
  ong.querySelectorAll('button').forEach(b => b.onclick = () => { const k = +b.dataset.manche; if (k !== mancheLivre) { sfx('clic'); ongletLivre(k) } });
  const box = $('duels-liste'); box.innerHTML = ''; box.classList.toggle('legendes', m === 4);
  if (m === 4) { carteslegendes(box); return }
  for (const D of DUELS.filter(D => manche(D) === m)) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.n = D.n; const ok = duelOuvert(D), r = SAVE.livre[D.n], gagne = fini(D), enCours = !!r && !gagne, mf = !ok && duelPret(D) ? mondeFermeDuel(D) : null;
    b.className = 'duel' + (D.boss ? ' boss' : '') + (ok ? '' : ' ferme') + (gagne ? ' joue' : '') + (enCours ? ' encours' : '') + (!duelPret(D) ? ' bientot' : '') + (D === suivant ? ' suivant' : '');
    const tete = k => pret(k) ? `<img src="${k}_tete.webp" alt="">` : '<i>?</i>';
    const [na, nb] = (SOMMAIRE[D.n - 1] || D.noms.join(' / ')).split(' / ');
    const etat = !duelPret(D) ? 'BIENTÔT' : !ok ? (mf ? '🔒 ' + MONDES[mf].nom : '🔒 À GAGNER') : gagne ? '✔ GAGNÉ' : enCours ? (r.combat ? '❓ LA QUESTION !' : '⚔️ À GAGNER !') : D.boss ? 'DUEL DE BOSS !' : 'À TOI DE PARIER !';
    const ic = !duelPret(D) ? '…' : !ok ? '🔒' : gagne ? '✔' : enCours ? (r.combat ? '❓' : '⚔️') : '▶';
    const ets = gagne ? `<span class="ets">${etoiles3(Math.min(3, (r && r.etoiles) || 0))}</span>` : ''; // (26/09) ★★☆ sous le duel gagné
    b.title = `Duel ${n2(D.n)} : ${na} ou ${nb} ? — ${etat}`;
    b.innerHTML = `<span class="md"><span class="num R">${n2(D.n)}</span>${D.boss ? '<span class="boss-tag R">BOSS</span>' : ''}${tete(D.a)}${tete(D.b)}${gagne ? ets : `<span class="ic">${ic}</span>`}</span>` +
      `<span class="q R"><span><b>${na}</b>&nbsp;<i>/</i> <b>${nb}</b></span></span><span class="etat">${etat}</span>`;
    b.onclick = () => {
      if (!ok) { // (M8) fermé : son monde n'est pas ouvert, ou on n'a encore aucun de ses deux animaux → la fiche de l'un d'eux (« ⚔️ L'AFFRONTER »)
        if (!duelPret(D)) { sfx('erreur'); montreMsg('livre-msg', 'Cet animal arrive bientôt dans l’arène !'); return }
        if (mf) { const P = PROGRESSION.find(p => p.m === mf), M = MONDES[mf]; sfx('erreur'); montreMsg('livre-msg', `🔒 ${M.ico} ${M.nom} s’ouvre quand tu as ${P.ouvre.n} animaux ${deMonde(P.ouvre.m)} : tu en as ${nbGagnes(P.ouvre.m)} !`); return }
        ouvreInfoAnimal([D.a, D.b].find(k => !SAVE.debloques.includes(k))); return
      }
      sfx('valide'); if (enCours && r.combat) ouvreQuestion(D); else ouvrePari(D);
    };
    box.appendChild(b);
  }
}
// ★ LÉGENDES : les 3 géants hors du livre ; chacun se réveille quand tous les animaux de son monde sont gagnés
function carteslegendes(box) {
  for (const L of LEGENDES_LIVRE) {
    const k = L.k, d = CHARS[k]; if (!d) continue; const M = MONDES[L.m], a = SAVE.debloques.includes(k), pr = legendePrete(L.m), nb = nbGagnes(L.m), tot = animauxDe(L.m).length, b = document.createElement('button'); b.type = 'button'; b.dataset.leg = k;
    b.className = 'duel legende-carte' + (a || pr ? '' : ' ferme') + (a ? ' joue' : '') + (pr && !a ? ' suivant' : '');
    b.innerHTML = `<span class="md"><span class="num R">${M.ico} ${M.nom}</span><img src="${k}_tete.webp" alt=""><span class="ic">${a ? '✔' : pr ? '★' : '🔒'}</span></span><span class="q R"><span><b>${d.nom}</b></span></span>` +
      `<span class="etat">${a ? '✔ À TOI' : pr ? (d.fem ? '★ RÉVEILLE-LA !' : '★ RÉVEILLE-LE !') : !mondeOuvert(L.m) ? '🔒 ' + M.nom : `🔒 ${nb} / ${tot}`}</span>`;
    b.onclick = () => {
      if (a) { sfx('valide'); G.livre = null; G.mode = 1; G.phase = 'menu'; selStage = 0; show('choix'); vaVers(k); construitCartes(); choisir(k); return }
      if (!pr) { sfx('erreur'); montreMsg('livre-msg', `${d.art} dort encore… Gagne tous les animaux ${deMonde(L.m)} : tu en as ${nb} sur ${tot} !`); return }
      sfx('valide'); lanceLegende(L);
    };
    box.appendChild(b);
  }
}
function lanceLegende(L) { selStage = 0; G.pick = [null, null]; G.tournoi = null; G.livre = null; if (window.lanceEpreuve) lanceEpreuve(L.k) } // (on choisit son animal du même monde, puis l'arène ; l'ordi est COSTAUD : nivAuto)
function montreMsg(id, t) { const e = $(id); e.textContent = t; e.classList.remove('secoue'); void e.offsetWidth; e.classList.add('secoue') }
// --- écran 2 : le pari (comme la page de gauche du livre)
function ouvrePari(D, rejoue) {
  G.phase = 'menu'; show('pari'); $('pari').classList.remove('libre'); G.livre = { D, rejoue: !!rejoue || fait(D), pari: null, choixCombat: false };
  $('pari-num').textContent = `DUEL ${String(D.n).padStart(2, '0')} / ${LIVRE_TOTAL}` + (D.boss ? ' · BOSS !' : '');
  { const [na, nb] = (SOMMAIRE[D.n - 1] || D.noms.join(' / ')).split(' / '); $('pari-q').textContent = `${na} OU ${nb} ?`.toUpperCase() } // (25/09 : les noms courts du sommaire, lisibles sur iPhone)
  $('pari-gigi-img').src = `gigi/duel_${String(D.n).padStart(2, '0')}_recto.svg`;
  $('pari-gigi-dit').textContent = D.gigi.dit; $('pari-gigi-pourquoi').textContent = D.gigi.pourquoi; $('pari-gigi-dit').closest('.pari-gigi').hidden = false;
  $('pari-intro').textContent = D.intro;
  for (const [i, k] of [[0, D.a], [1, D.b]]) {
    const f = D.fiches[i], el = $(i ? 'pari-b' : 'pari-a');
    el.className = 'fiche ' + k;
    el.innerHTML = `<span class="img"><img src="${k}_corps.webp" alt=""></span><b class="R">${D.noms[i]}</b>` +
      `<span class="l"><i>⚖</i>${f[0]}</span><span class="l"><i>⚔</i>${f[1]}</span><span class="l"><i>★</i>${f[2]}</span><span class="l"><i>⚠</i>${f[3]}</span>` +
      `<span class="fiche-go">${rejoue || SAVE.livre[D.n] ? 'JE ME BATS ▶' : 'JE PARIE ▶'}</span>`;
    el.onclick = () => choisitPari(k);
  }
  $('pari-nul').hidden = !D.boss; $('pari-nul').onclick = () => choisitPari('nul');
  const r = SAVE.livre[D.n];
  $('pari-titre').textContent = rejoue || r ? `TON PARI : ${r ? (r.pari === 'nul' ? 'MATCH NUL' : nomDuel(D, r.pari)) : '?'}` : 'QUI GAGNE ?';
  if (r) { $('pari-nul').hidden = true; G.livre.choixCombat = true; $('pari-gigi-dit').closest('.pari-gigi').hidden = true; montreCombattants(D) } // (rejouer : on choisit juste avec qui se battre)
  // (M7) pendant que l'enfant lit et parie, les deux animaux et l'arène se chargent : sur un téléphone, le combat part tout de suite
  setTimeout(() => { try { chargeAnimal(D.a).catch(() => { }); chargeAnimal(D.b).catch(() => { }); chargeArene(D.arene).catch(() => { }) } catch (e) { } }, 250);
}
// (M8) « se battre avec » : seulement un animal qu'on a (l'autre fiche dit « 🔒 À GAGNER »)
function montreCombattants(D) {
  const l = combattants(D);
  for (const [i, k] of [[0, D.a], [1, D.b]]) { const el = $(i ? 'pari-b' : 'pari-a'), g = el.querySelector('.fiche-go'); el.classList.toggle('inactif', !l.includes(k)); if (g) g.textContent = l.includes(k) ? 'JE ME BATS ▶' : '🔒 À GAGNER' }
}
// (M8) 1 JOUEUR, une paire du livre choisie sur l'écran « CONTRE QUI ? » : « DANS LA VRAIE VIE, QUI GAGNE ? », puis le combat avec son animal
function pariPuisCombat() {
  const L = G.livre, pick = G.pick.slice(), arene = G.arene, hasard = G.areneHasard;
  ouvrePari(L.D); Object.assign(G.livre, { libre: true, moi: L.moi, noms: L.noms, pick, arene, hasard, choixCombat: false });
  $('pari').classList.add('libre'); $('pari-q').textContent = 'DANS LA VRAIE VIE, QUI GAGNE ?';
  $('pari-titre').textContent = L.D.boss ? '📖 DUEL DE BOSS DU LIVRE !' : '📖 UN DUEL DU LIVRE !';
}
function choisitPari(k) {
  const L = G.livre, D = L.D; sonInit();
  if (L.libre) { if (L.pari) return; L.pari = k; sfx('valide'); G.pick = L.pick.slice(); G.arene = L.arene; G.areneHasard = !!L.hasard; sfx(L.moi, .8); vs(); return } // (le combat choisi avant le pari)
  if (!L.choixCombat) {
    L.pari = k; sfx('valide'); const l = combattants(D);
    if (k !== 'nul' && l.includes(k)) { lanceDuelLivre(k); return } // on a parié sur un animal à soi : on se bat avec lui
    if (l.length === 1) { lanceDuelLivre(l[0]); return } // sinon, avec celui qu'on a
    L.choixCombat = true; $('pari-nul').hidden = true; $('pari-titre').textContent = `TON PARI : ${k === 'nul' ? 'MATCH NUL' : nomDuel(D, k)}`; $('pari-gigi-dit').closest('.pari-gigi').hidden = true; montreCombattants(D); return
  }
  if (k === 'nul' || !combattants(D).includes(k)) { sfx('erreur'); return }
  sfx('valide'); lanceDuelLivre(k);
}
// (M6, 25/09) l'ancienne pente de difficulté de l'aventure (0 → 2), gardée pour les outils de mesure ; depuis M8, c'est nivAuto (game.js)
const nivDuel = D => Math.min(2, Math.round((2 * (D.n - 1) / 29 + (D.boss ? .12 : 0)) * 100) / 100);
function lanceDuelLivre(k) {
  const L = G.livre, D = L.D, adv = k === D.a ? D.b : D.a;
  finEpreuve(); G.defi = null; G.jour = null;
  L.moi = k; G.mode = 1; G.tournoi = null; G.pick = [k, adv]; G.arene = D.arene; G.areneHasard = false; G.niv = Math.min(2, manche(D) - 1);
  L.noms = [nomDuel(D, k), nomDuel(D, adv)];
  sfx(k, .8); vs();
}
// REVANCHE : le même combat (même animal, même adversaire)
function revancheLivre() { const L = G.livre; if (!L) return; L.rejoue = true; if (L.libre) { G.pick = L.pick.slice(); G.arene = L.arene; vs() } else lanceDuelLivre(L.moi) }
// --- écran 3 : la vraie réponse (comme la page de droite du livre)
// (26/09) ★★☆ : les étoiles gagnées ET celles qui manquent (elles donnent envie de rejouer)
const etoiles3 = n => `<span class="et3">${'<em class="e1">★</em>'.repeat(n)}${'<em class="e0">★</em>'.repeat(3 - n)}</span>`; // (em : ni i ni b, déjà stylés dans les médaillons)
const etoilesLivre = () => DUELS.reduce((t, x) => t + ((SAVE.livre[x.n] || {}).etoiles || 0), 0);
function verdictLivre(v, etoilesCombat, nv) {
  const L = G.livre, D = L.D, R = D.rep, deja = SAVE.livre[D.n], libre = !!L.libre;
  const gagneArene = v && !v.cpu;
  // le pari ne compte qu'une fois (le premier), comme dans le livre
  let r = deja; const avant = deja ? deja.etoiles || 0 : 0;
  if (!deja) { r = SAVE.livre[D.n] = { pari: L.pari, bon: L.pari === R.g, etoiles: gagneArene ? etoilesCombat : 0, date: Date.now(), ok: false } }
  if (gagneArene) r.combat = 1; // 2A : combat gagné… il reste la question
  // (26/09) ★ le meilleur score d'étoiles est gardé à chaque victoire
  if (gagneArene) r.etoiles = Math.max(r.etoiles || 0, etoilesCombat);
  const record = gagneArene && !!deja && r.etoiles > avant && avant > 0, totEt = etoilesLivre();
  if (window.trophee) { // trophées du livre
    if (!deja) { if (r.bon) { trophee('pari1', true); if (Object.values(SAVE.livre).filter(x => x.bon).length >= 5) trophee('pari5', true) } if (L.pari === D.gigi.pari) trophee('gigi', true) }
    if (DUELS.every(x => SAVE.livre[x.n])) trophee('duels', true);
    if (gagneArene && D.boss) { SAVE.bossGagnes = SAVE.bossGagnes || {}; SAVE.bossGagnes[D.n] = 1; if ([10, 20, 30].every(n => SAVE.bossGagnes[n])) trophee('boss', true) }
    if (totEt >= 30) trophee('etoiles30', true); if (totEt >= 3 * DUELS.length) trophee('etoiles90', true) }
  sauve();
  G.phase = 'menu'; show('verdict');
  const moi = nomDuel(D, L.moi);
  $('v-arene').innerHTML = gagneArene ? `${record ? 'NOUVEAU RECORD !' : ton(moi) + ' A GAGNÉ !'} ${etoiles3(etoilesCombat)}` : `${ton(moi)} A PERDU…`;
  $('v-question').hidden = false; $('v-suite1').hidden = true; $('verdict').classList.add('temps1');
  $('v-question').textContent = 'ET DANS LA VRAIE VIE ?';
  const carte = $('v-carte'); carte.classList.remove('tamponne'); carte.hidden = true;
  $('v-tampon').className = 'tampon ' + R.tampon; $('v-tampon').textContent = R.label;
  $('v-titre').textContent = R.titre; $('v-cri').textContent = R.cri; $('v-punch').textContent = R.punch; $('v-film').textContent = R.film;
  $('v-img').src = R.img || R.g + '_fin.webp'; // (duel 20 : match nul → une image avec les deux animaux)
  const pariTxt = r.pari === 'nul' ? 'MATCH NUL' : nomDuel(D, r.pari);
  // (26/09) « TON PARI : LION ✘ » sur une seule ligne (avant : 3 lignes, et le bouton du bas sortait de l'écran de l'iPhone)
  const ligne = `<span class="vp-l">TON PARI : <b>${pariTxt}</b> ${r.bon ? '✔' : '✘'}</span>`;
  $('v-toi').innerHTML = deja && L.rejoue ? `${ligne}<small>(déjà compté)</small>` : r.bon ? `${ligne}<small>BON PARI ! +1 POINT${D.boss ? ' + 1 ÉTOILE DE BOSS ★' : ''}</small>` : `${ligne}<small>Raté… Dans la nature, le plus fort ne gagne pas à tous les coups !</small>`;
  $('v-gigi-img').src = `gigi/duel_${String(D.n).padStart(2, '0')}_verso.svg`;
  $('v-gigi').innerHTML = `<b>GIGI : ${D.gigi.dit} ${D.gigi.pari === R.g ? '✔' : '✘'}</b><i>${D.gigi.apres}</i>`;
  const s = scoreLivre(); $('v-score').innerHTML = `TOI <b>${s.toi}</b> · GIGI <b>${s.gigi}</b>`;
  $('v-page').textContent = `📖 La suite : page ${D.pv} du livre`;
  $('v-badges').innerHTML = (nv || []).map(id => `<span>NOUVEAU TROPHÉE : ${BADGES.find(x => x[0] === id)[1]}</span>`).join('') + (G.finExtra || '') +
    (gagneArene && r.etoiles < 3 && !(nv && nv.length) && !G.finExtra ? `<span class="et-astuce">Pour ${etoiles3(3)} : aucune manche perdue, et une sans être touché !</span>` : ''); // (26/09) une raison de rejouer
  // la suite : combat gagné → LA QUESTION ; combat perdu → REVANCHE ; duel déjà gagné → DUEL SUIVANT (liste) ou CONTINUER (combat libre)
  const suivant = prochainDuel(), gagne = fini(D), noms = gainsDuel(D).map(k => CHARS[k].art);
  $('v-rejouer').hidden = !gagne || libre;
  if (gagne) { if (libre) { $('v-suite').textContent = 'CONTINUER ▶'; $('v-suite').onclick = () => { sfx('valide'); autreCombat() } }
    else { $('v-suite').textContent = suivant ? 'DUEL SUIVANT ▶' : 'MES DUELS ▶'; $('v-suite').onclick = () => { sfx('valide'); suivant ? ouvrePari(suivant) : ouvreLivre() } } }
  else if (gagneArene) { $('v-suite').textContent = '❓ LA QUESTION ▶'; $('v-suite').onclick = () => { sfx('valide'); ouvreQuestion(D) } }
  else { $('v-suite').textContent = '⚔️ REVANCHE ▶'; $('v-suite').onclick = () => { sfx('valide'); revancheLivre() };
    $('v-badges').innerHTML += `<span class="defi-res">⚔️ Gagne le combat${noms.length ? ' pour gagner ' + noms.join(' et ') : ''} !</span>` }
  $('v-rejouer').onclick = () => { sfx('clic'); ouvrePari(D, true) };
  // suspense : « ET DANS LA VRAIE VIE ? »… roulement… tampon !
  $('v-reste').hidden = true; sfx('tam', .6);
  let k = 0; const roule = setInterval(() => { if (G.screen !== 'verdict') { clearInterval(roule); return } sfx('tam', .4 + .05 * k); if (++k >= 6) clearInterval(roule) }, 180);
  setTimeout(() => { if (G.screen !== 'verdict') return; carte.hidden = false; void carte.offsetWidth; carte.classList.add('tamponne'); sfx('boum', .9); sfx(R.g, .9); acclameMenu() }, 1250);
  // 2e temps (25/09) : on a lu la vraie réponse → SUITE ▶ → ton pari, Gigi, le score et la suite (un seul écran lisible à la fois)
  setTimeout(() => { if (G.screen !== 'verdict') return; const b = $('v-suite1'); b.hidden = false;
    b.onclick = () => { sfx('valide'); b.hidden = true; carte.hidden = true; $('v-question').hidden = true; $('v-reste').hidden = false; $('verdict').classList.remove('temps1'); sfx(r.bon ? 'victoire' : 'defaite', .8); if (D.n === 30 && !deja) finaleFaite() } }, 2000);
}
// --- écran 4 : LA QUESTION (2A) — une seule, sur la vraie réponse qu'on vient de lire. Raté ? On relit, on réessaie.
function ouvreQuestion(D, relis) {
  const z = QUESTIONS[D.n]; if (!z) { duelGagne(D); return }
  sonInit(); G.phase = 'menu'; show('quiz'); const qz = $('quiz'); qz.classList.remove('defi', 'or', 'gagne', 'relis'); qz.classList.add('q-duel'); G.quest = { D, bloque: false }; G.retourQuiz = G.livre && G.livre.libre && G.livre.D === D ? 'libre' : 'livre';
  $('quiz-titre').textContent = `❓ LA QUESTION`;
  $('quiz-intro').innerHTML = fin(relis ? 'Réessaie !' : gainsDuel(D).length ? 'Réponds juste : ' + (gainsDuel(D).length > 1 ? 'ils sont à toi !' : `${CHARS[gainsDuel(D)[0]].fem ? 'elle est' : 'il est'} à toi !`) : 'Réponds juste : le duel est gagné !');
  $('quiz-img').style.backgroundImage = `url(${D.rep.g === 'nul' ? D.a : D.rep.g}_corps.webp)`; $('quiz-img').classList.remove('ombre');
  $('quiz-pas').innerHTML = ''; $('quiz-q').textContent = fin(z[0]); $('quiz-msg').textContent = ''; $('quiz-suite').hidden = true;
  const box = $('quiz-rep'); box.innerHTML = '';
  for (const rep of melange(z[1])) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = fin(rep); b.onclick = () => repondQuestion(b, rep === z[1][0]); box.appendChild(b) }
}
function repondQuestion(b, juste) {
  const Qd = G.quest; if (!Qd || Qd.bloque || !Qd.D) return; Qd.bloque = true; const D = Qd.D;
  document.querySelectorAll('#quiz-rep .btn').forEach(x => { x.disabled = true });
  if (juste) { b.classList.add('bon'); sfx('valide'); $('quiz-msg').textContent = hasard(['BRAVO !', 'EXACT !', 'TOUT JUSTE !']); setTimeout(() => { if (G.screen === 'quiz' && G.quest && G.quest.D === D) duelGagne(D) }, 900); return }
  b.classList.add('faux'); sfx('erreur'); $('quiz').classList.add('relis');
  $('quiz-msg').innerHTML = `Pas tout à fait… Relis bien : <span class="carte-rappel">${esc(fin(D.rep.film))}</span>`;
  const s = $('quiz-suite'); s.hidden = false; s.textContent = 'RÉESSAYER ▶'; s.onclick = () => { sfx('clic'); ouvreQuestion(D, true) };
}
// --- écran 5 : DUEL GAGNÉ ! l'animal battu rejoint l'équipe (M8 : les champions du livre aussi) ; un monde peut s'ouvrir
function duelGagne(D) {
  const libre = !!(G.livre && G.livre.libre && G.livre.D === D), moi = G.livre && G.livre.moi;
  const r = SAVE.livre[D.n] || (SAVE.livre[D.n] = { pari: null, bon: false, etoiles: 0, date: Date.now() }); r.ok = true; r.combat = 1;
  const nv = [], nouveaux = gainsDuel(D);
  for (const k of nouveaux) { SAVE.debloques.push(k); SAVE.quiz[k] = Date.now() }
  if (nouveaux.length) badge('secret', nv);
  if (DUELS.filter(duelPret).every(fini)) badge('lecteur', nv);
  const mondes = window.ouvreMondes ? ouvreMondes(true) : []; // (M8) 10 animaux de la TERRE → LA MER s'ouvre… (puis l'écran « NOUVEAU MONDE ! »)
  sauve(); finEpreuve(); G.quest = { D, fini: true }; G.retourQuiz = libre ? 'libre' : 'livre'; $('quiz').classList.add('gagne');
  const suivant = prochainDuel();
  $('quiz-titre').textContent = libre ? '🎉 DUEL DU LIVRE GAGNÉ !' : `🎉 DUEL ${n2(D.n)} GAGNÉ !`; $('quiz').classList.remove('relis');
  $('quiz-intro').innerHTML = fin(nouveaux.length ? `${nouveaux.length > 1 ? 'Ils sont' : (CHARS[nouveaux[0]].fem ? 'Elle est' : 'Il est')} à toi !` : 'Bravo !');
  $('quiz-pas').innerHTML = '';
  const deja = [...new Set([D.a, D.b])].filter(k => pret(k) && !nouveaux.includes(k));
  $('quiz-q').innerHTML = `<span class="gains">${nouveaux.map(k => `<span class="gain${champion(k) ? ' or' : ''}"><img src="${k}_tete.webp" alt=""><b>${CHARS[k].nom}</b><small>NOUVEAU !</small></span>`).join('')}${deja.map(k => `<span class="gain deja"><img src="${k}_tete.webp" alt=""><b>${CHARS[k].nom}</b><small>✔ DÉJÀ À TOI</small></span>`).join('')}</span>`;
  $('quiz-rep').innerHTML = '';
  const ob = window.objectif && nouveaux.length ? phraseObjectif(objectif(mondeDe(nouveaux[0]))) : '';
  $('quiz-msg').innerHTML = (mondes.length ? '<span class="quete">🔓 UN NOUVEAU MONDE S’OUVRE…</span>' : ob ? `<span class="quete obj-gain">${ob}</span>` : '') +
    (nv.length ? `<span>NOUVEAU TROPHÉE : ${nv.map(id => BADGES.find(x => x[0] === id)[1]).join(' · ')}</span>` : '') + (window.codeAOffrir ? nouveaux.map(codeAOffrir).join('') : '');
  sfx('badge'); setTimeout(() => sfx('super'), 350); nouveaux.forEach((k, i) => setTimeout(() => sfx(k, 1), 800 + i * 700));
  const s = $('quiz-suite'); s.hidden = false;
  if (mondes.length) { s.textContent = '🎉 DÉCOUVRIR ▶'; s.onclick = () => { sfx('valide'); G.quest = null; G.livre = null; G.retourQuiz = null; feteMondes(mondes) } }
  else if (libre) { const k = nouveaux.find(x => x !== moi) || nouveaux[0];
    if (k) { s.textContent = `JOUER AVEC ${CHARS[k].fem ? 'ELLE' : 'LUI'} ▶`; s.onclick = () => { sfx('valide'); G.quest = null; G.livre = null; G.retourQuiz = null; G.mode = 1; G.phase = 'menu'; selStage = 0; show('choix'); vaVers(k); construitCartes(); choisir(k) } }
    else { s.textContent = 'CONTINUER ▶'; s.onclick = () => { sfx('valide'); G.quest = null; G.retourQuiz = null; autreCombat() } } }
  else if (suivant) { s.textContent = `DUEL ${n2(suivant.n)} ▶`; s.onclick = () => { sfx('valide'); G.quest = null; ouvrePari(suivant) } }
  else { s.textContent = 'MES DUELS ▶'; s.onclick = () => { sfx('valide'); ouvreLivre() } }
}
// --- l'accueil (M8) : la tuile MES ANIMAUX montre les derniers animaux gagnés et le compte
function majAccueil() {
  const tous = ORDRE.filter(pret), a = tous.filter(k => SAVE.debloques.includes(k)), t = $('t-tetes'), n = $('t-nb'), o = $('obj-accueil');
  if (n) n.textContent = `${a.length} / ${tous.length}`;
  if (o && window.objectif) { const h = htmlObjectif(objectif(G.monde) || objectif()); o.innerHTML = h; o.hidden = !h } // (le monde où l'on joue) // (M8) le prochain objectif
  if (t) t.innerHTML = a.slice(-3).map(k => `<img src="${k}_tete.webp" alt="">`).join('');
}
function acclameMenu() { sfx('foule', .5) }
// la grande finale jouée : le code secret du GOD MODE est révélé (voir bonus.js)
function finaleFaite() { if (window.revelerCodeGod) revelerCodeGod() }
// (26/09) un duel gagné vaut au moins ★ : avant le correctif des étoiles, un duel perdu puis gagné restait à 0 étoile
try { let m = 0; for (const D of DUELS) { const r = SAVE.livre[D.n]; if (r && fini(D) && !(r.etoiles >= 1)) { r.etoiles = 1; m++ } } if (m) sauve() } catch (e) { }
// (M8) les mondes : un ancien joueur qui a déjà 10 animaux de la TERRE trouve LA MER ouverte (avec l'orque et le requin), etc.
try { ouvreMondes() } catch (e) { }
