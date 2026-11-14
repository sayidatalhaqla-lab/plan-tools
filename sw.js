// offline cache: the app keeps working on the phone even after the website is taken down
const CACHE='ptk-v9';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
const PDFJS=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{await c.addAll(CORE);await Promise.allSettled(PDFJS.map(u=>c.add(u)))}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const keep=(req,res)=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  if(CDN.test(req.url)){e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>keep(req,res))));return}
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){   // the page: newest version when the site is up, the saved copy when offline OR when the site is gone (404)
    e.respondWith(fetch(req).then(res=>{if(res&&res.ok){keep('./index.html',res.clone());return res}return caches.match('./index.html').then(h=>h||res)}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>keep(req,res))));
});
