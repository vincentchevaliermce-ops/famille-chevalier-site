#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Appose une mention discrète en pied de page sur les PDF offerts du site,
et renseigne leurs métadonnées (titre, auteurs, éditeur).

  python3 outils/filigrane-livres.py            # tous les livres
  python3 outils/filigrane-livres.py 0 4        # les 4 premiers (par lots)
  python3 outils/filigrane-livres.py Rose-la-petite-licorne.pdf   # un ou plusieurs livres nommés

Les originaux sont conservés dans livres/_originaux/ (ignoré par git) :
le script lit toujours l'original, jamais un fichier déjà marqué, donc on peut
le relancer sans empiler les mentions.

Contrôle intégré (04/10/2026) : chaque page marquée doit garder tout le contenu de
l'original, plus la mention. Sinon le PDF publié n'est pas remplacé et le script s'arrête.
"""
import io, os, re, sys, html, shutil, json, hashlib
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RACINE, 'livres')
ORIG = os.path.join(RACINE, 'livres', '_originaux')   # hors dépôt (voir .gitignore)
SITE = 'editions-chevalier.fr'
AUTEURS = 'Michèle et Vincent Chevalier'
MENTION = 'Exemplaire offert par Famille Chevalier — merci de ne pas le revendre ni le rediffuser'
MENTION1 = 'Tous nos livres : %s' % SITE


def titres():
    """nom de fichier PDF -> titre affiché, d'après l'accueil (table DIRECT_PDF + libellés du menu)."""
    s = open(os.path.join(RACINE, 'index.html'), encoding='utf-8').read()
    libelle = {html.unescape(v): html.unescape(t).strip()
               for v, t in re.findall(r'<option value="([^"]+)"[^>]*>([^<]+)</option>', s)}
    out = {}
    for cle, chemin in re.findall(r'"([^"]+)":\s*"livres/([^"]+\.pdf)"', s):
        cle = html.unescape(cle)
        titre = libelle.get(cle, cle)
        out[chemin] = re.sub(r'\s*\([^)]*\)$', '', titre)   # « … (BD, dès 8 ans) » -> « … »
    return out


def calque(largeur, hauteur, premiere):
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(largeur, hauteur))
    c.setFillGray(0.45)
    c.setFont('Helvetica', 5.5)
    c.drawCentredString(largeur / 2, 13, MENTION)
    if premiere:
        c.setFont('Helvetica-Oblique', 5.5)
        c.drawCentredString(largeur / 2, 5.5, MENTION1)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


TRACE = (b'Do', b'Tj', b'TJ', b"'", b'"', b'INLINE IMAGE', b'sh')


def compte(page):
    """(opérations, tracés) du contenu d'une page : images, textes et dégradés dessinés."""
    contenu = page.get_contents()
    if contenu is None:
        return 0, 0
    ops = contenu.operations
    return len(ops), sum(1 for _, op in ops if op in TRACE)


def traiter(nom, titre):
    src = os.path.join(ORIG, nom)
    # Prevent a later watermark run from restoring the superseded Gaspard editions.
    manifest_path = os.path.join(RACINE, 'outils', 'gaspard-editions.json')
    if os.path.isfile(manifest_path):
        with open(manifest_path, encoding='utf-8') as manifest_file:
            edition = json.load(manifest_file).get(nom)
        if edition:
            with open(src, 'rb') as source_file:
                actual_sha = hashlib.sha256(source_file.read()).hexdigest()
            if actual_sha != edition['source_web_sha256']:
                print('  ! %s : source obsolete ; conserver le PDF publie (%s).' % (nom, edition['version']))
                return os.path.getsize(os.path.join(DEST, nom))
    reader = PdfReader(src)
    writer = PdfWriter()
    temoin = [compte(p) for p in PdfReader(src).pages]   # référence lue à part, jamais modifiée
    attendu = []
    for i, page in enumerate(reader.pages):
        # Copie privée du contenu de chaque page. Les PDF fabriqués avec PyMuPDF font partager
        # un même flux de contenu à plusieurs pages ; merge_page le vidait alors pour toutes ces
        # pages sauf la première (pages blanches en ligne du 15/09 au 04/10/2026 : 100 Pourquoi,
        # 100 Pourquoi des Dinosaures, Incroyapédia, Léo et la loi de Murphy).
        contenu = page.get_contents()
        if contenu is not None:
            page[NameObject('/Contents')] = contenu
        boite = page.mediabox
        tampon = calque(float(boite.width), float(boite.height), i == 0)
        mention = compte(tampon)
        page.merge_page(tampon)
        writer.add_page(page)
        attendu.append((temoin[i][0] + mention[0], temoin[i][1] + mention[1]))
    writer.add_metadata({'/Title': titre, '/Author': AUTEURS,
                         '/Subject': 'Exemplaire offert — Famille Chevalier',
                         '/Keywords': 'livre jeunesse, Famille Chevalier, exemplaire offert',
                         '/Creator': 'Famille Chevalier', '/Producer': SITE})
    dst = os.path.join(DEST, nom)
    tmp = dst + '.tmp'
    with open(tmp, 'wb') as f:
        writer.write(f)
    # Contrôle avant publication : chaque page garde tout son contenu, plus la mention.
    sortie = PdfReader(tmp).pages
    erreur = None
    if len(sortie) != len(attendu):
        erreur = '%d pages au lieu de %d' % (len(sortie), len(attendu))
    else:
        for i, (page, mini) in enumerate(zip(sortie, attendu)):
            obtenu = compte(page)
            if obtenu[0] < mini[0] or obtenu[1] < mini[1]:
                erreur = 'page %d incomplète (%s au lieu de %s au moins)' % (i + 1, obtenu, mini)
                break
    if erreur:
        os.remove(tmp)
        raise SystemExit('ARRÊT %s : %s. PDF publié laissé tel quel.' % (nom, erreur))
    os.replace(tmp, dst)
    return os.path.getsize(dst)


if __name__ == '__main__':
    table = titres()
    if not os.path.isdir(ORIG):
        os.makedirs(ORIG)
        for f in sorted(os.listdir(DEST)):
            if f.endswith('.pdf'):
                shutil.copy2(os.path.join(DEST, f), os.path.join(ORIG, f))
        print('originaux sauvegardés dans %s' % ORIG)
    fichiers = sorted(f for f in os.listdir(ORIG) if f.endswith('.pdf'))
    noms = [a for a in sys.argv[1:] if a.endswith('.pdf')]
    if noms:
        absents = [n for n in noms if n not in fichiers]
        if absents:
            raise SystemExit('introuvables dans %s : %s' % (ORIG, ', '.join(absents)))
        selection = noms
    else:
        debut = int(sys.argv[1]) if len(sys.argv) > 1 else 0
        fin = int(sys.argv[2]) if len(sys.argv) > 2 else len(fichiers)
        selection = fichiers[debut:fin]
    for nom in selection:
        titre = table.get(nom)
        if not titre:
            print('  ! titre introuvable pour %s — ignoré' % nom)
            continue
        taille = traiter(nom, titre)
        print('  %-52s %5.1f Mo  %s' % (nom, taille / 1024 / 1024, titre))
