// يجلب أحدث نسخة عند وجود الإنترنت (تحقق سريع بلا تنزيل إن لم تتغير)، ويعمل من النسخة المحفوظة بلا إنترنت
const C = 'nafs-ar9-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(C).then(async c => {
    const net = fetch(req.url, {cache: 'no-cache'}).then(r => { if (r && r.ok) c.put(key, r.clone()); return r; });
    e.waitUntil(net.catch(() => null));
    try { const r = await Promise.race([net, new Promise(res => setTimeout(res, 5000, null))]); if (r && r.ok) return r; } catch (_) {}
    const hit = await c.match(key, {ignoreSearch: true});
    if (hit) return hit;
    try { return await net; } catch (_) { return (await c.match('./index.html')) || Response.error(); }
  }));
});
