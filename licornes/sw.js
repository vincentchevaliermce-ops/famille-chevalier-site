/* 100% Licornes : fonctionnement hors ligne.
   La page, les icônes et les petits dessins sont gardés à l'installation.
   Les dessins et les voix de chaque film sont gardés au premier passage, puis servis même sans Internet.
   Nouvelle version = nouveau nom de cache : l'ancien est effacé proprement. */
const VER='v25-moteur-doux';
const CORE='core-'+VER, RUN='films-'+VER;
const CORE_FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png','tpl/bebe_lines.png','tpl/bebe_labels.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>c.addAll(CORE_FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const keep=[CORE,RUN],names=await caches.keys();
  // les dessins et voix déjà gardés passent dans le nouveau cache (pas besoin de tout retélécharger)
  const nrun=await caches.open(RUN);
  for(const n of names){if(keep.includes(n))continue;if(n.startsWith('films-')){try{const old=await caches.open(n);for(const req of await old.keys()){if(/\/tpl\//.test(req.url)){const r=await old.match(req);if(r)await nrun.put(req,r);}}}catch(err){}}await caches.delete(n);}
  await self.clients.claim();})());});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  // polices Google : d'abord le cache, sinon Internet
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){e.respondWith(caches.open(RUN).then(async c=>{const m=await c.match(req);if(m)return m;try{const r=await fetch(req);if(r.ok||r.type==='opaque')c.put(req,r.clone());return r;}catch(err){return m||Response.error();}}));return;}
  if(url.origin!==location.origin)return;
  // seulement les fichiers de l'appli : la page bonus (formulaire e-mail) et tout autre dossier passent sans cache
  const base=new URL('./',self.registration.scope).pathname,rel=url.pathname.startsWith(base)?url.pathname.slice(base.length):null;
  if(rel===null||!/^(|index\.html|manifest\.webmanifest|sw\.js|icons\/.+|tpl\/.+|voice\/.+)$/.test(rel))return;
  // la page : Internet d'abord (pour les mises à jour), le cache si pas de réseau
  if(req.mode==='navigate'||/\/(index\.html)?$/.test(url.pathname)){e.respondWith((async()=>{try{const r=await fetch(req);if(r.ok){const c=await caches.open(CORE);c.put('index.html',r.clone());}return r;}catch(err){return (await caches.match('index.html'))||(await caches.match('./'))||Response.error();}})());return;}
  // dessins, voix, icônes : le cache d'abord, sinon Internet (et on garde la copie)
  e.respondWith((async()=>{const m=await caches.match(req,{ignoreSearch:true});if(m)return m;try{const r=await fetch(req);if(r.ok&&/\/(tpl|voice|icons)\/|manifest/.test(url.pathname)){const c=await caches.open(RUN);c.put(req,r.clone());}return r;}catch(err){return Response.error();}})());});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
