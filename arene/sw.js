// =====================================================================
//  L'ARÈNE DES DUELS — jouer SANS INTERNET (service worker)
//  • le code du jeu (index.html + scripts) : gardé pour chaque version publiée ;
//  • les images, squelettes et sons : gardés dès qu'ils ont servi une fois (ou tous d'un coup :
//    bouton « 📥 JOUER SANS INTERNET » de l'espace parents) ;
//  • à chaque nouvelle version, seuls les fichiers qui ont changé sont oubliés (liste hors-ligne.json).
//  Fichier fabriqué par deploy.sh à partir de jeu/sw_modele.js : ne pas modifier sw.js à la main.
// =====================================================================
const VERSION = '1790338723';
const CODE = 'arene-code-' + VERSION, MEDIA = 'arene-media', LISTE = 'hors-ligne.json';
const A_GARDER = ["./", "index.html", "manifest.webmanifest", "hors-ligne.json?v=1790338723", "skin.js?v=1790338723", "anim.js?v=1790338723", "game.js?v=1790338723", "net.js?v=1790338723", "livre.js?v=1790338723", "bonus.js?v=1790338723", "surprises.js?v=1790338723"]; // le minimum pour ouvrir le jeu hors connexion
const ICI = new URL('./', self.location).pathname; // « /arene/ »

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CODE).then(c => c.addAll(A_GARDER.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // on oublie les anciennes versions du code…
    for (const k of await caches.keys()) if (k.startsWith('arene-code-') && k !== CODE) await caches.delete(k);
    // …et, parmi les images et les sons gardés, seulement ceux qui ont changé depuis
    try {
      const c = await caches.open(CODE), m = await caches.open(MEDIA);
      const r = await c.match(LISTE + '?v=' + VERSION); const nv = r ? await r.json() : null;
      const av = await m.match('__liste_precedente__'); const ancien = av ? await av.json() : null;
      if (nv && ancien) { const h = {}; for (const [p, , x] of ancien.fichiers) h[p] = x; for (const [p, , x] of nv.fichiers) if (h[p] && h[p] !== x) await m.delete(new URL(p, self.location).href, { ignoreSearch: true }) }
      if (nv) await m.put('__liste_precedente__', new Response(JSON.stringify(nv), { headers: { 'Content-Type': 'application/json' } }));
    } catch (err) { }
    await self.clients.claim();
  })());
});

// une partie d'un fichier son (la musique est lue « en continu » : le navigateur la demande par morceaux)
async function morceau(req, rep) {
  const plage = req.headers.get('range'); if (!plage) return rep;
  const b = await rep.arrayBuffer(), m = /bytes=(\d*)-(\d*)/.exec(plage) || [];
  let a = m[1] === '' || m[1] === undefined ? 0 : +m[1], z = m[2] ? Math.min(+m[2], b.byteLength - 1) : b.byteLength - 1;
  if (m[1] === '' && m[2]) { a = Math.max(0, b.byteLength - +m[2]); z = b.byteLength - 1 } // « bytes=-500 » : la fin du fichier
  return new Response(b.slice(a, z + 1), { status: 206, statusText: 'Partial Content', headers: { 'Content-Type': rep.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${a}-${z}/${b.byteLength}`, 'Content-Length': String(z - a + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url); if (u.origin !== self.location.origin || !u.pathname.startsWith(ICI)) return;
  const page = req.mode === 'navigate' || u.pathname === ICI || u.pathname.endsWith('/index.html');
  if (page) { // la page : d'abord internet (pour avoir la dernière version), sinon celle gardée
    e.respondWith((async () => {
      try {
        const rep = await Promise.race([fetch(req), new Promise((_, j) => setTimeout(() => j(new Error('lent')), 6000))]);
        if (rep.ok) { const c = await caches.open(CODE); c.put(ICI, rep.clone()).catch(() => { }) }
        return rep;
      } catch (err) {
        const c = await caches.open(CODE);
        return (await c.match(ICI)) || (await c.match(ICI + 'index.html')) || (await caches.match(req, { ignoreSearch: true })) || new Response('<meta charset="utf-8"><body style="font-family:sans-serif;background:#0B1B4A;color:#fff;text-align:center;padding:40px"><h2>Pas d’internet…</h2><p>Ouvre le jeu une première fois avec internet (wifi) : ensuite, il marchera même sans connexion.</p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }
  const code = /\.(js|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/' + LISTE);
  e.respondWith((async () => {
    const plage = req.headers.get('range');
    const gardee = code ? await caches.match(req) : await caches.match(req, { ignoreSearch: true });
    if (gardee) return plage ? morceau(req, gardee) : gardee;
    if (plage) return fetch(req); // un morceau de musique pas encore gardé : directement depuis internet
    const rep = await fetch(req);
    if (rep.ok && rep.status === 200 && rep.type === 'basic') { const c = await caches.open(code ? CODE : MEDIA); c.put(req, rep.clone()).catch(() => { }) }
    return rep;
  })());
});

// l'espace parents demande la version (pour savoir si tout est prêt)
self.addEventListener('message', e => { if (e.data === 'version' && e.source) e.source.postMessage({ version: VERSION }) });
