#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Appose une mention discrète en pied de page sur les PDF offerts du site,
et renseigne leurs métadonnées (titre, auteurs, éditeur).

  python3 outils/filigrane-livres.py            # tous les livres
  python3 outils/filigrane-livres.py 0 4        # les 4 premiers (par lots)

Les originaux sont conservés dans livres/_originaux/ (ignoré par git) :
le script lit toujours l'original, jamais un fichier déjà marqué, donc on peut
le relancer sans empiler les mentions.
"""
import io, os, re, sys, html, shutil
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RACINE, 'livres')
ORIG = os.path.join(RACINE, 'livres', '_originaux')   # hors dépôt (voir .gitignore)
SITE = 'vincentchevaliermce-ops.github.io/famille-chevalier-site'
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


def traiter(nom, titre):
    src = os.path.join(ORIG, nom)
    reader = PdfReader(src)
    writer = PdfWriter()
    for i, page in enumerate(reader.pages):
        boite = page.mediabox
        page.merge_page(calque(float(boite.width), float(boite.height), i == 0))
        writer.add_page(page)
    writer.add_metadata({'/Title': titre, '/Author': AUTEURS,
                         '/Subject': 'Exemplaire offert — Famille Chevalier',
                         '/Keywords': 'livre jeunesse, Famille Chevalier, exemplaire offert',
                         '/Creator': 'Famille Chevalier', '/Producer': SITE})
    dst = os.path.join(DEST, nom)
    with open(dst, 'wb') as f:
        writer.write(f)
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
    debut = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    fin = int(sys.argv[2]) if len(sys.argv) > 2 else len(fichiers)
    for nom in fichiers[debut:fin]:
        titre = table.get(nom)
        if not titre:
            print('  ! titre introuvable pour %s — ignoré' % nom)
            continue
        taille = traiter(nom, titre)
        print('  %-52s %5.1f Mo  %s' % (nom, taille / 1024 / 1024, titre))
