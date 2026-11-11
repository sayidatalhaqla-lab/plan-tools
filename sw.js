// offline cache for the app shell + pdf.js (cached the first time a PDF is opened online)
const CACHE='ptk-v4';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  if(CDN.test(req.url)){          // pdf.js: cache first, fill on first use
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res})));return}
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){      // the page: network first (gets updates), cache when offline
    e.respondWith(fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res})));
});
