#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère le dossier de presse PDF de Famille Chevalier.

  python3 outils/build-dossier-presse.py            # HTML + PDF (Chrome headless)
  python3 outils/build-dossier-presse.py --html     # HTML seulement

Les chiffres (pages, prix, note, avis, ISBN, date) sont lus dans les pages
/livre/*.html : ils restent donc toujours d'accord avec le site. Les libellés
éditoriaux (catégorie, tome, ordre) sont dans la table LIVRES ci-dessous.
Sortie : presse/dossier-de-presse-famille-chevalier.pdf
"""
import glob, html, json, os, re, subprocess, sys, datetime

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_HTML = os.path.join(RACINE, 'outils', 'dossier-presse.html')
OUT_PDF = os.path.join(RACINE, 'presse', 'dossier-de-presse-famille-chevalier.pdf')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SITE = 'https://editions-chevalier.fr/'
CONTACT = 'contact@editions-chevalier.fr'
MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

# slug -> (catégorie affichée, groupe d'âge, ordre)
LIVRES = [
    ('rose-la-petite-licorne',                  'Album illustré',            '3'),
    ('100-pourquoi-des-dinosaures',             'Encyclopédie · Tome 2',     '3'),
    ('100-pourquoi',                            'Encyclopédie · Tome 1',     '3'),
    ('pour-toujours-dans-mon-coeur-petite-girafe','Album illustré',          '3'),
    ('une-histoire-et-au-lit',                  'Histoires du soir',         '3'),
    ('frisson-le-petit-manchot',                'Album illustré',            '3'),
    ('mon-livre-anime-des-animaux-rigolos',     'Livre animé',               '3'),
    ('metiers-secrets-petites-betes',           'Documentaire',              '7'),
    ('gaspard-voyageur-du-temps',               'Gaspard, 10 ans · Tome 1',  '7'),
    ('gaspard-la-legende-du-bison-blanc',       'Gaspard, 10 ans · Tome 2',  '7'),
    ('gaspard-au-dela-de-l-ocean',              'Gaspard, 10 ans · Tome 3',  '7'),
    ('gaspard-les-graines-de-la-liberte',       'Gaspard, 10 ans · Tome 4',  '7'),
    ('gaspard-le-secret-de-la-montre-magique',  'Gaspard, 10 ans · Tome 5',  '7'),
    ('guide-de-survie-des-enfants-debrouillards','Documentaire',             '7'),
    ('50-erreurs-geniales',                     'Documentaire',              '7'),
    ('incroyapedia',                            'Encyclopédie',              '7'),
    ('leo-et-la-loi-de-murphy',                 'BD humour',                 '7'),
]

# Titres courts pour les grilles (le titre complet reste dans le JSON-LD)
COURT = {
    'metiers-secrets-petites-betes': 'Les métiers secrets des petites bêtes du jardin',
    'gaspard-voyageur-du-temps': 'Voyageur du temps',
    'gaspard-la-legende-du-bison-blanc': 'La Légende du Bison Blanc',
    'gaspard-au-dela-de-l-ocean': "Au-delà de l'océan",
    'gaspard-les-graines-de-la-liberte': 'Les Graines de la Liberté',
    'gaspard-le-secret-de-la-montre-magique': 'Le Secret de la Montre Magique',
}

# Pitches de la page « Parutions 2026 »
PITCHES_2026 = {
 'metiers-secrets-petites-betes': "La taupe conduit le métro, le lombric est ingénieur agronome, la coccinelle commande la brigade anti-pucerons et le hérisson fait sa ronde de nuit. Trente petites bêtes du jardin présentées par leur métier, du sol au potager, de la mare au compost, avec cherche-et-trouve, quiz et bons gestes pour le jardin.",
 '100-pourquoi-des-dinosaures': "Cent vraies questions d'enfant sur les dinosaures — leurs plumes, leurs œufs, leurs dents, leur disparition — et pour chacune une réponse en deux ou trois phrases, juste et à leur portée. Chaque page se termine par un « truc waouh » à raconter à la maison.",
 '100-pourquoi': "Pourquoi mes doigts se plissent-ils dans le bain ? Pourquoi le chat ronronne ? Pourquoi le ciel devient orange le soir ? Huit parties — mon corps, les animaux, le ciel et la météo, l'espace et la nuit, la maison, la table, le jardin, les grandes questions — et cent réponses simples, drôles et vraies.",
 'guide-de-survie-des-enfants-debrouillards': "Filtrer de l'eau, monter un mur anti-vent, reconnaître un courant qui tire, soigner une ampoule, retenir les numéros d'urgence : soixante fiches illustrées, une astuce par page, chacune avec un « que faire ? » en trois étapes et une erreur à éviter.",
 'incroyapedia': "Le scorpion qui brille sous les ultraviolets, le poulpe qui imite quinze espèces, la méduse qui rajeunit, le dragon de Komodo, le guépard qui passe de 0 à 100 km/h en trois secondes. Soixante animaux présentés comme des super-héros — avec leur super-pouvoir, comment ça marche, et des « infos waouh » exactes.",
 'leo-et-la-loi-de-murphy': "La tartine de Léo tombe toujours du côté de la confiture. Le bus part quand il arrive, la connexion coupe en pleine partie, le contrôle tombe le jour où il a oublié de réviser. Soixante « lois » de Murphy, une planche de BD chacune, avec Léo, son chat et ses amis Bilal et Lila.",
}

AVIS = [
 ("Mes petits loulous l'ont dévoré. Les images sont sublimes, ils ont adoré la découverte de la vie des Sioux.", "Marie C. · La Légende du Bison Blanc · achat vérifié, Amazon.fr"),
 ("J'ai pris ce livre pour mon fils de 8 ans qui aime les histoires d'aventure et il l'a vraiment apprécié.", "Lulu · Voyageur du temps · achat vérifié, Amazon.fr"),
]


def lire_livres():
    data = {}
    for p in glob.glob(os.path.join(RACINE, 'livre', '*.html')):
        s = open(p, encoding='utf-8').read()
        livre = None
        for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
            d = json.loads(b)
            for it in (d if isinstance(d, list) else [d]):
                if isinstance(it, dict) and it.get('@type') == 'Book':
                    livre = it
                    break
            if livre:
                break
        if not livre:
            continue
        slug = os.path.basename(p)[:-5]
        r = livre.get('aggregateRating', {}) or {}
        o = livre.get('offers', {}) or {}
        img = re.search(r'<img src="\.\./(images/[^"]+\.jpg)"', s)
        age = re.search(r'(\d+-\d+ ans)', s)
        data[slug] = dict(
            slug=slug, nom=livre['name'], pages=int(livre['numberOfPages']),
            isbn=livre.get('isbn', ''), date=livre.get('datePublished', ''),
            prix=float(o.get('price', 0)), note=float(r.get('ratingValue', 0)),
            avis=int(r.get('ratingCount') or r.get('reviewCount') or 0),
            age=age.group(1) if age else '', cover=img.group(1) if img else '')
    return data


def euro(v):
    if not v:
        return 'prix à venir'
    return ('%.2f' % v).replace('.', ',') + ' €'


def note_fr(v):
    return ('%.1f' % v).replace('.', ',')


def milliers(n):
    return format(n, ',').replace(',', ' ').replace(' ', ' ')


def etoiles(note):
    pleines = int(round(note))
    return '<span class="stars">' + '★' * pleines + '<span class="star-off">' + '☆' * (5 - pleines) + '</span></span>'


def date_fr(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return '%d %s %d' % (d, MOIS[m - 1], y)


def specs(l, cat):
    return ' · '.join([cat, l['age'], '%d p.' % l['pages'], euro(l['prix'])])


def build_html():
    D = lire_livres()
    manquants = [s for s, _, _ in LIVRES if s not in D]
    if manquants:
        sys.exit('Pages livre introuvables : %s' % ', '.join(manquants))
    ordre = [(D[s], cat, grp) for s, cat, grp in LIVRES]
    tous = [l for l, _, _ in ordre]
    total_avis = sum(l['avis'] for l in tous)
    note_moy = sum(l['note'] * l['avis'] for l in tous) / total_avis
    pmin, pmax = min(l['pages'] for l in tous), max(l['pages'] for l in tous)
    avec_prix = [l['prix'] for l in tous if l['prix']]
    prix_min, prix_max = min(avec_prix), max(avec_prix)
    aujourdhui = datetime.date.today()
    mois_an = '%s %d' % (MOIS[aujourdhui.month - 1].capitalize(), aujourdhui.year)
    nouveautes = sorted([l for l in tous if l['date'].startswith('2026')], key=lambda l: l['date'], reverse=True)
    gaspard = [(D[s], cat) for s, cat, _ in LIVRES if s.startswith('gaspard')]
    avis_gaspard = sum(l['avis'] for l, _ in gaspard)
    premiere = min(tous, key=lambda l: l['date'])
    cat_de = {s: cat for s, cat, _ in LIVRES}

    def carte(l, cat, cols):
        titre = COURT.get(l['slug'], l['nom'])
        return ('<figure class="bk"><img src="../%s" alt=""><figcaption>'
                '<b>%s</b><span>%s</span></figcaption></figure>') % (
            l['cover'], html.escape(titre), html.escape(specs(l, cat)))

    def pied(n):
        return ('<div class="foot"><span>Famille Chevalier · Dossier de presse · %s</span>'
                '<span>%s</span><span class="pg">%d</span></div>') % (mois_an, CONTACT, n)

    d3 = [(l, c) for l, c, g in ordre if g == '3']
    d7 = [(l, c) for l, c, g in ordre if g == '7']
    bandeau = ''.join('<img src="../%s" alt="">' % l['cover'] for l in
                      [D['rose-la-petite-licorne'], D['gaspard-voyageur-du-temps'], D['100-pourquoi'],
                       D['guide-de-survie-des-enfants-debrouillards'], D['mon-livre-anime-des-animaux-rigolos'],
                       D['leo-et-la-loi-de-murphy'], D['incroyapedia'], D['frisson-le-petit-manchot']])

    P = []
    # ---------- 1. couverture ----------
    P.append("""
<section class="page cover">
  <div class="brand"><b>Famille Chevalier</b><small>Maison d’édition jeunesse</small></div>
  <p class="kicker">Dossier de presse · %s</p>
  <h1>Des livres que les enfants <em>finissent.</em></h1>
  <p class="lead">Dix-sept livres illustrés pour les 3-12 ans, écrits en famille depuis 2023 : romans d’aventure
  historiques, encyclopédies qui répondent aux vrais «&nbsp;pourquoi&nbsp;», albums tendres, documentaires et bande dessinée.</p>
  <div class="stats">
    <div><b>%d</b><span>titres publiés</span></div>
    <div><b>%s/5</b><span>note moyenne Amazon.fr</span></div>
    <div><b>%s</b><span>avis de lecteurs</span></div>
    <div><b>3-12</b><span>ans</span></div>
  </div>
  <p class="contact">Contact presse et professionnels&nbsp;: <b>%s</b><br><span class="url">%s</span></p>
  <div class="strip">%s</div>
  %s
</section>""" % (mois_an, len(tous), note_fr(note_moy), milliers(total_avis), CONTACT, SITE, bandeau, pied(1)))

    # ---------- 2. la maison ----------
    P.append("""
<section class="page">
  <p class="eyebrow">La maison</p>
  <h2>Une mère, un fils, et des enfants qui redemandent la suite</h2>
  <div class="two">
    <div>
      <p class="first">Tout a commencé un dimanche d’hiver. Vincent racontait à ses neveux une histoire inventée
      à la volée — un garçon de dix ans propulsé au temps des dinosaures. Michèle, sa mère, l’écoutait&nbsp;:
      «&nbsp;Cette histoire, il faudrait l’écrire.&nbsp;» Ce soir-là, la famille Chevalier commençait sa première
      aventure éditoriale.</p>
      <p><b>Vincent Chevalier</b> écrit. Ses voyages — Polynésie, Brésil, Japon — sont devenus les décors de la
      série <i>Gaspard, 10 ans</i>, avant les albums tendres, les encyclopédies <i>100 Pourquoi</i> et les livres
      pour apprendre en riant.</p>
      <p><b>Michèle Chevalier</b> est coautrice, directrice éditoriale et première lectrice, attentive à chaque mot
      et à chaque image. C’est elle qui dit «&nbsp;cette fin est trop triste&nbsp;» ou «&nbsp;là, c’est parfait,
      on n’y touche plus&nbsp;».</p>
      <p>Deux plumes, deux générations, une seule ambition&nbsp;: que l’enfant demande la suite.</p>
    </div>
    <figure class="portrait">
      <img src="../images/image-17.jpg" alt="Michèle et Vincent Chevalier">
      <figcaption>Michèle et Vincent Chevalier</figcaption>
    </figure>
  </div>
  <h3 class="rule">Ce qui nous guide</h3>
  <div class="grid4">
    <div><b>Le plaisir d’abord.</b> Chapitres courts, une illustration presque à chaque page, des héros qui doutent
    et se trompent. L’apprentissage vient avec le plaisir, jamais à sa place.</div>
    <div><b>Des faits exacts.</b> Nos encyclopédies et documentaires répondent à de vraies questions d’enfants avec
    des réponses vérifiées, formulées pour leur âge.</div>
    <div><b>Des livres accessibles.</b> Impression à la demande, couleurs, format broché, de %s à %s. Plusieurs
    titres existent en anglais, espagnol, italien et allemand.</div>
    <div class="note"><b>Nos illustrations sont créées avec l’aide de l’intelligence artificielle</b>, puis dirigées,
    retouchées et validées page par page par nos soins. Nous préférons le dire clairement.</div>
  </div>
  %s
</section>""" % (euro(prix_min), euro(prix_max), pied(2)))

    # ---------- 3. catalogue 3 ans ----------
    P.append("""
<section class="page">
  <p class="eyebrow">Catalogue</p>
  <h2>Dix-sept livres, classés par âge</h2>
  <h3 class="sub">Dès 3 ans — albums et premières encyclopédies</h3>
  <div class="grid-bk c4">%s</div>
  %s
</section>""" % (''.join(carte(l, c, 4) for l, c in d3), pied(3)))

    # ---------- 4. catalogue 7 ans ----------
    P.append("""
<section class="page">
  <p class="eyebrow">Catalogue (suite)</p>
  <h2>Dès 6 ans — romans, documentaires et BD</h2>
  <div class="grid-bk c5">%s</div>
  <p class="encart">Tous les titres sont imprimés à la demande en couleurs, au format broché, et disponibles sur
  Amazon.fr. Un PDF complet de chaque livre peut être fourni aux enseignants, bibliothécaires et journalistes sur
  simple demande.</p>
  %s
</section>""" % (''.join(carte(l, c, 5) for l, c in d7), pied(4)))

    # ---------- 5. parutions 2026 ----------
    lignes = []
    for l in nouveautes:
        lignes.append("""
  <article class="nouv">
    <img src="../%s" alt="">
    <div>
      <p class="tag">%s · %s · parution %s</p>
      <h3>%s</h3>
      <p>%s</p>
      <p class="specs">%s · %s · %d p. · ISBN %s</p>
    </div>
  </article>""" % (l['cover'], html.escape(cat_de[l['slug']].upper()), l['age'].upper(),
                   date_fr(l['date']).upper(), html.escape(l['nom']),
                   html.escape(PITCHES_2026.get(l['slug'], '')),
                   ('%s %s · %s avis' % (etoiles(l['note']), note_fr(l['note']), l['avis'])) if l['avis'] else 'nouveauté, en librairie en ligne',
                   euro(l['prix']), l['pages'], l['isbn']))
    P.append("""
<section class="page">
  <p class="eyebrow">Parutions 2026</p>
  <h2>%s nouveautés cette année</h2>
  %s
  %s
</section>""" % ({4: 'Quatre', 5: 'Cinq', 6: 'Six', 7: 'Sept', 8: 'Huit'}.get(len(nouveautes), str(len(nouveautes))), ''.join(lignes), pied(5)))

    # ---------- 6. série phare ----------
    tomes = ''.join(
        '<figure class="bk"><img src="../%s" alt=""><figcaption><b>%s</b><span>%s · %s</span>'
        '<span class="rate">%s %s · %d avis</span></figcaption></figure>' % (
            l['cover'], html.escape(COURT.get(l['slug'], l['nom'])), cat.split('· ')[-1], l['age'],
            etoiles(l['note']), note_fr(l['note']), l['avis'])
        for l, cat in gaspard)
    citations = ''.join('<blockquote>«&nbsp;%s&nbsp;»<cite>%s</cite></blockquote>' % (html.escape(t), html.escape(q))
                        for t, q in AVIS)
    P.append("""
<section class="page">
  <p class="eyebrow">Série phare</p>
  <h2>Gaspard, 10 ans — cinq tomes, %d avis</h2>
  <p class="lead">Gaspard a dix ans et une montre qui n’indique pas l’heure&nbsp;: elle indique l’époque. Chaque tome
  l’emmène dans une civilisation réelle — la préhistoire et l’Égypte, les Sioux des Grandes Plaines, les îles
  Marquises, le Brésil colonial, la Rome antique — avec un danger, une amitié, et une vraie découverte sur la façon
  dont les gens vivaient.</p>
  <p>La série est conçue pour des lecteurs de 6 à 11 ans, y compris ceux qui «&nbsp;n’aiment pas trop lire&nbsp;»&nbsp;:
  chapitres courts, illustration presque à chaque page, un héros qui se trompe. Chaque tome se lit indépendamment&nbsp;;
  le premier reste la meilleure entrée.</p>
  <div class="grid-bk c5 tomes">%s</div>
  <h3 class="rule">Ce qu’en disent les parents</h3>
  <div class="quotes">%s</div>
  <p class="encart">Le premier tome existe aussi en anglais (<i>Jasper, 10 years old, time traveler</i>), en espagnol
  et en italien.</p>
  %s
</section>""" % (avis_gaspard, tomes, citations, pied(6)))

    # ---------- 7. pro ----------
    P.append("""
<section class="page">
  <p class="eyebrow">Écoles, bibliothèques, presse</p>
  <h2>Travaillons ensemble</h2>
  <div class="two pro">
    <div>
      <h3 class="sub">Écoles et bibliothèques</h3>
      <ul>
        <li><b>Exemplaire d’évaluation&nbsp;:</b> nous envoyons le PDF complet de tout titre du catalogue aux
        enseignants et bibliothécaires qui le demandent.</li>
        <li><b>Commandes groupées&nbsp;:</b> tarif à discuter selon les quantités, livraison par Amazon.fr.</li>
        <li><b>Rencontres avec les auteurs&nbsp;:</b> en visioconférence, à organiser avec la classe.</li>
        <li><b>Fiches pédagogiques gratuites</b> pour <i>Gaspard, 10 ans</i> (CE2-CM2) et <i>100 Pourquoi</i>
        (GS-CE1), téléchargeables sur le site, rubrique Presse &amp; écoles.</li>
      </ul>
      <h3 class="sub">Presse et blogs</h3>
      <ul>
        <li><b>Exemplaires de presse</b> (PDF immédiat, papier sur demande).</li>
        <li><b>Visuels haute définition</b> des couvertures et photo des auteurs&nbsp;: kit téléchargeable sur le
        site, rubrique Presse.</li>
        <li><b>Interviews et articles&nbsp;:</b> Michèle et Vincent répondent sous 48 heures.</li>
      </ul>
    </div>
    <div>
      <div class="card">
        <h3>Contact</h3>
        <p>Famille Chevalier<br>Michèle et Vincent Chevalier<br><b>%s</b></p>
        <h3>Site et catalogue</h3>
        <p class="url">%s</p>
        <h3>Boutique Amazon</h3>
        <p class="url">amazon.fr/stores/author/B0CJ6VJG76</p>
        <h3>Réseaux</h3>
        <p>Instagram @vincent___chevalier · TikTok @vinchevalier · Facebook micheleetvincent</p>
      </div>
      <div class="card reperes">
        <h3>Repères</h3>
        <ul>
          <li>Première parution&nbsp;: %s (<i>%s</i>)</li>
          <li>%d titres en français au %s, %d parutions en 2026</li>
          <li>%s avis publiés sur Amazon.fr, note moyenne %s/5</li>
          <li>Impression à la demande en couleurs, brochés de %d à %d pages</li>
          <li>Prix de %s à %s</li>
        </ul>
      </div>
    </div>
  </div>
  %s
</section>""" % (CONTACT, SITE, date_fr(premiere['date']).replace('2 mai', 'mai').replace('1 ', ''), html.escape(premiere['nom']),
                 len(tous), date_fr(aujourdhui.isoformat()), len(nouveautes), milliers(total_avis),
                 note_fr(note_moy), pmin, pmax, euro(prix_min), euro(prix_max), pied(7)))

    doc = DOC % {'pages': ''.join(P), 'mois': mois_an}
    open(SRC_HTML, 'w', encoding='utf-8').write(doc)
    print('HTML : %s (%.0f Ko)' % (SRC_HTML, os.path.getsize(SRC_HTML) / 1024))
    print('  %d livres · %s avis · note %s · %d-%d p. · %s-%s' % (
        len(tous), milliers(total_avis), note_fr(note_moy), pmin, pmax, euro(prix_min), euro(prix_max)))
    return SRC_HTML


DOC = """<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<title>Dossier de presse — Famille Chevalier</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--ink:#1C1F2A;--ink-2:#4A4F5E;--ink-3:#5F6472;--cream:#F7F3EC;--cream-2:#EFE9DF;--line:#E4DFD6;--accent:#B8452E;--accent-ink:#8F3623;
--serif:'Fraunces',Georgia,serif;--sans:'Inter',Helvetica,Arial,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:var(--sans);color:var(--ink);font-size:9.6pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
img{display:block;max-width:100%%}
.page{position:relative;width:210mm;height:297mm;padding:17mm 16mm 15mm;overflow:hidden;background:#fff;page-break-after:always}
.page:last-child{page-break-after:auto}
h1,h2,h3{font-family:var(--serif);font-weight:500;line-height:1.2;text-wrap:balance}
h2{font-size:21pt;margin-bottom:5mm}
h3{font-size:11.5pt}
em{font-style:italic;color:var(--accent-ink)}
.eyebrow{font-size:7.2pt;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:3mm}
.lead{font-size:11pt;color:var(--ink-2);margin-bottom:3.5mm}
p{margin-bottom:2.6mm}
.foot{position:absolute;left:16mm;right:16mm;bottom:9mm;display:flex;justify-content:space-between;gap:6mm;
font-size:6.9pt;color:var(--ink-3);border-top:1px solid var(--line);padding-top:2.4mm}
.foot .pg{font-variant-numeric:tabular-nums}
/* couverture */
.cover{background:var(--cream);display:flex;flex-direction:column}
.brand b{display:block;font-family:var(--serif);font-size:15pt;font-weight:600}
.brand small{display:block;font-size:7pt;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3);margin-top:1mm}
.cover .kicker{font-size:7.6pt;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:600;margin:26mm 0 6mm}
.cover h1{font-size:40pt;line-height:1.08;max-width:15ch;margin-bottom:7mm}
.cover .lead{max-width:62ch;font-size:11.4pt}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:5mm;margin:12mm 0 0;border-top:1px solid var(--line);padding-top:6mm}
.stats b{display:block;font-family:var(--serif);font-size:21pt;font-weight:500}
.stats span{font-size:8pt;color:var(--ink-3)}
.strip{display:grid;grid-template-columns:repeat(8,1fr);gap:3.5mm;margin-top:auto;margin-bottom:2mm}
.strip img{width:100%%;aspect-ratio:2/3;object-fit:cover;border-radius:1mm;box-shadow:0 2mm 5mm rgba(28,31,42,.16)}
.contact{margin-top:10mm;font-size:8.6pt;color:var(--ink-2)}
.contact .url{color:var(--ink-3);font-size:8pt}
/* maison */
.two{display:grid;grid-template-columns:1.5fr 1fr;gap:9mm;align-items:start}
.first::first-letter{font-family:var(--serif);font-size:20pt;line-height:1;float:left;padding:1mm 2mm 0 0;color:var(--accent-ink)}
.portrait img{border-radius:1.5mm}
.portrait figcaption{font-size:7.6pt;color:var(--ink-3);margin-top:2mm;text-align:center}
.rule{margin:9mm 0 4mm;padding-top:4mm;border-top:1px solid var(--line)}
.grid4{display:grid;grid-template-columns:1fr 1fr;gap:5mm 8mm;font-size:9.3pt;color:var(--ink-2)}
.grid4 b{color:var(--ink)}
.grid4 .note{background:var(--cream);border-left:2px solid var(--accent);padding:4mm;font-size:8.8pt}
/* grilles de livres */
.grid-bk{display:grid;gap:7mm 5mm;margin-top:4mm}
.grid-bk.c4{grid-template-columns:repeat(4,1fr)}
.grid-bk.c5{grid-template-columns:repeat(5,1fr)}
.bk img{width:100%%;aspect-ratio:2/3;object-fit:cover;border-radius:1mm;box-shadow:0 1.5mm 4mm rgba(28,31,42,.14)}
.bk figcaption{margin-top:2.5mm}
.bk b{display:block;font-family:var(--serif);font-size:9.6pt;font-weight:500;line-height:1.25;margin-bottom:1mm}
.bk span{display:block;font-size:7.4pt;color:var(--ink-3);line-height:1.35}
.bk .rate{margin-top:.8mm;color:var(--ink-2);white-space:nowrap}
.bk .stars,.bk .star-off,.nouv .stars,.nouv .star-off{display:inline}
.sub{font-size:10.5pt;color:var(--ink-2);margin:5mm 0 1mm;font-family:var(--sans);font-weight:600}
.encart{margin-top:6mm;background:var(--cream);border-radius:1.5mm;padding:4mm 5mm;font-size:8.6pt;color:var(--ink-2)}
.stars{color:#C08A2B;letter-spacing:.5pt;white-space:nowrap}
.star-off{color:#D9D3C8}
/* nouveautés */
.nouv{display:grid;grid-template-columns:22mm 1fr;gap:5mm;align-items:start;margin-bottom:4.2mm}
.nouv img{border-radius:1mm;box-shadow:0 1.5mm 4mm rgba(28,31,42,.14)}
.nouv .tag{font-size:6.8pt;letter-spacing:.12em;color:var(--accent);font-weight:600;margin-bottom:1.5mm}
.nouv h3{margin-bottom:1.2mm;font-size:12pt}
.nouv p{font-size:8.7pt;color:var(--ink-2);margin-bottom:1.4mm}
.nouv .specs{font-size:7.8pt;color:var(--ink-3)}
/* série */
.tomes{margin-bottom:2mm}
.quotes{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
blockquote{background:var(--cream);border-radius:1.5mm;padding:4.5mm 5mm;font-size:9.2pt;color:var(--ink-2);font-style:italic}
cite{display:block;margin-top:2.5mm;font-style:normal;font-size:7.4pt;color:var(--ink-3)}
/* pro */
.pro ul{list-style:none;margin-bottom:4mm}
.pro li{position:relative;padding-left:4mm;margin-bottom:2.2mm;font-size:9.2pt;color:var(--ink-2)}
.pro li::before{content:"";position:absolute;left:0;top:1.9mm;width:1.6mm;height:1.6mm;background:var(--accent);border-radius:50%%}
.card{background:var(--cream);border-radius:2mm;padding:6mm;margin-bottom:5mm}
.card h3{font-size:9.6pt;margin-bottom:1.5mm}
.card h3+p{margin-bottom:4mm;font-size:9pt;color:var(--ink-2)}
.card .url{word-break:break-all;font-size:8.2pt;color:var(--ink-3)}
.reperes li{font-size:8.8pt}
</style></head><body>%(pages)s</body></html>
"""


def build_pdf(src):
    if not os.path.exists(CHROME):
        sys.exit('Google Chrome introuvable — génération PDF impossible (%s)' % CHROME)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                    '--virtual-time-budget=20000', '--print-to-pdf=' + OUT_PDF, 'file://' + src],
                   check=True, capture_output=True)
    print('PDF  : %s (%.1f Mo)' % (OUT_PDF, os.path.getsize(OUT_PDF) / 1024 / 1024))


if __name__ == '__main__':
    src = build_html()
    if '--html' not in sys.argv:
        build_pdf(src)
