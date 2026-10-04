#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Contrôle des livres offerts : chaque page publiée doit être identique à l'original
(hors bande du pied de page) et porter la mention « Exemplaire offert ».

  python3 outils/verifier-pdf-offerts.py             # fichiers du dépôt (livres/)
  python3 outils/verifier-pdf-offerts.py --en-ligne  # + compare au site en ligne (octet par octet)

À lancer après toute modification d'un PDF offert. Code retour 1 si un livre est KO.
Nécessite PyMuPDF (import fitz). Écrit le 04/10/2026 après l'incident des pages blanches
(100 Pourquoi, 100 Pourquoi des Dinosaures, Incroyapédia, Léo : en ligne du 15/09 au 04/10).
"""
import hashlib, os, sys, urllib.request
import fitz

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(RACINE, 'livres')
ORIG = os.path.join(PUB, '_originaux')
SITE = 'https://editions-chevalier.fr/livres/'
MENTION = 'Exemplaire offert'


def gris(page, dpi=20):
    pix = page.get_pixmap(dpi=dpi, colorspace=fitz.csGRAY)
    return pix.width, pix.height, pix.samples


def comparer(nom):
    """Liste des problèmes du PDF publié par rapport à son original (vide = OK)."""
    a, b = fitz.open(os.path.join(ORIG, nom)), fitz.open(os.path.join(PUB, nom))
    if a.page_count != b.page_count:
        return ['%d pages au lieu de %d' % (b.page_count, a.page_count)]
    abimees, sans_mention = [], []
    for i in range(a.page_count):
        wa, ha, da = gris(a[i])
        wb, hb, db = gris(b[i])
        corps = wa * int(ha * 0.94)          # on ignore la bande du pied de page
        if (wa, ha) != (wb, hb) or sum(abs(x - y) for x, y in zip(da[:corps], db[:corps])) / corps > 1.0:
            abimees.append(i + 1)
        if MENTION not in b[i].get_text():
            sans_mention.append(i + 1)
    pb = []
    if abimees:
        pb.append('%d page(s) différente(s) de l\'original : %s' % (len(abimees), abimees[:10]))
    if sans_mention:
        pb.append('%d page(s) sans mention : %s' % (len(sans_mention), sans_mention[:10]))
    return pb


def empreinte(donnees):
    return hashlib.sha256(donnees).hexdigest()


def en_ligne(nom):
    """Le fichier servi par le site est-il exactement celui du dépôt ?"""
    url = SITE + nom + '?controle=' + str(os.getpid())   # contourne le cache
    with urllib.request.urlopen(url, timeout=60) as r:
        servi = r.read()
    with open(os.path.join(PUB, nom), 'rb') as f:
        local = f.read()
    return [] if empreinte(servi) == empreinte(local) else ['en ligne ≠ dépôt (%d octets servis, %d en local)' % (len(servi), len(local))]


if __name__ == '__main__':
    verifier_site = '--en-ligne' in sys.argv
    noms = sorted(f for f in os.listdir(PUB) if f.endswith('.pdf'))
    ko = 0
    for nom in noms:
        if not os.path.isfile(os.path.join(ORIG, nom)):
            print('??  %-50s pas d\'original dans livres/_originaux' % nom[:50])
            ko += 1
            continue
        pb = comparer(nom)
        if verifier_site:
            pb += en_ligne(nom)
        print('%s  %-50s %s' % ('OK' if not pb else 'KO', nom[:50], ' ; '.join(pb) or fitz.open(os.path.join(PUB, nom)).page_count.__str__() + ' pages conformes'))
        ko += bool(pb)
    print('\n%d livre(s) contrôlé(s), %d KO%s' % (len(noms), ko, ' (site en ligne compris)' if verifier_site else ''))
    sys.exit(1 if ko else 0)
