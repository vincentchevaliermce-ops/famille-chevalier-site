#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bascule le site de l'adresse GitHub Pages vers le domaine editions-chevalier.fr.

  python3 outils/bascule-domaine.py --essai    # montre ce qui serait changé
  python3 outils/bascule-domaine.py            # applique

À lancer SEULEMENT une fois que le DNS du domaine pointe vers GitHub Pages,
sinon les adresses canoniques désignent un domaine qui ne répond pas encore.

Ce que fait le script :
  1. remplace l'ancienne adresse par la nouvelle dans tout le site (186 endroits)
  2. remplace les chemins absolus /famille-chevalier-site/ par / (le site n'est
     plus dans un sous-dossier)
  3. met à jour manifest.json (start_url, scope)
  4. écrit le fichier CNAME que GitHub Pages attend

Après le script : régénérer le dossier de presse et re-marquer les PDF offerts
(les deux contiennent l'adresse du site) :
  python3 outils/build-dossier-presse.py
  python3 outils/filigrane-livres.py
"""
import os, sys, json

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAINE = 'editions-chevalier.fr'
ANCIEN = 'vincentchevaliermce-ops.github.io/famille-chevalier-site'
ESSAI = '--essai' in sys.argv

REMPLACEMENTS = [
    ('https://' + ANCIEN, 'https://' + DOMAINE),
    ('http://' + ANCIEN, 'https://' + DOMAINE),
    (ANCIEN, DOMAINE),                       # mentions en texte simple
    ('/famille-chevalier-site/', '/'),       # chemins absolus
]
EXTENSIONS = ('.html', '.xml', '.json', '.txt', '.py', '.css', '.webmanifest')
IGNORER = {'.git', 'livres', 'images', 'presse', 'ressources', '__pycache__'}


def fichiers():
    for base, dossiers, noms in os.walk(RACINE):
        dossiers[:] = [d for d in dossiers if d not in IGNORER and not d.startswith('_')]
        for n in noms:
            if n.endswith(EXTENSIONS) and n != os.path.basename(__file__):
                yield os.path.join(base, n)


def main():
    total = touches = 0
    for chemin in sorted(fichiers()):
        s = open(chemin, encoding='utf-8').read()
        o = s
        n = 0
        for avant, apres in REMPLACEMENTS:
            n += s.count(avant)
            s = s.replace(avant, apres)
        if s != o:
            touches += 1
            total += n
            rel = os.path.relpath(chemin, RACINE)
            print('  %-52s %3d remplacement(s)' % (rel, n))
            if not ESSAI:
                open(chemin, 'w', encoding='utf-8').write(s)

    # manifest : le site est désormais à la racine du domaine
    mpath = os.path.join(RACINE, 'manifest.json')
    if os.path.exists(mpath):
        m = json.load(open(mpath, encoding='utf-8'))
        m['start_url'], m['scope'] = '/', '/'
        if not ESSAI:
            open(mpath, 'w', encoding='utf-8').write(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
        print('  manifest.json : start_url et scope à la racine')

    # CNAME : ce fichier dit à GitHub Pages quel domaine servir
    cpath = os.path.join(RACINE, 'CNAME')
    if not ESSAI:
        open(cpath, 'w', encoding='utf-8').write(DOMAINE + '\n')
    print('  CNAME : %s' % DOMAINE)

    print('\n%s — %d fichier(s), %d remplacement(s)' % (
        'ESSAI, rien écrit' if ESSAI else 'Appliqué', touches, total))
    if not ESSAI:
        print('Pensez ensuite à : build-dossier-presse.py, puis filigrane-livres.py')


if __name__ == '__main__':
    main()
