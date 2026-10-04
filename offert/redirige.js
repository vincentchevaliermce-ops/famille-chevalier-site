/* Pages /offert/ et /offert/<code>/ : QR codes et adresses courtes imprimés dans les livres (04/10/2026).
   assets/u.js, chargé juste avant ce fichier, compte la vue (page /offert/<code>/, provenance directe
   pour un QR code ou une adresse tapée) ; puis le lecteur arrive sur le formulaire du livre offert de
   l'accueil. src=livre-<code> suit la demande jusqu'à la notification envoyée à Vincent.
   Liste des codes : offert/codes.json. */
(function () {
    var m = window.location.pathname.match(/^\/offert\/([a-z0-9]+)\/?$/);
    var dest = '/?src=' + (m ? 'livre-' + m[1] : 'livre') + '#offert';
    var lien = document.getElementById('suite');
    if (lien) lien.setAttribute('href', dest);
    window.setTimeout(function () { window.location.replace(dest); }, 150);
})();
