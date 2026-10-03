const CACHE = 'astro-atlas-v076';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './CHANGELOG.md'];
// Gökyüzüm için Aladin Lite kitaplığı da önbelleğe alınır; gökyüzü karoları (HiPS) alınmaz,
// yoksa önbellek sınırsız büyür.
const EXTRA = url => url.startsWith('https://cdn.jsdelivr.net/npm/aladin-lite@');

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  const sameOrigin = url.startsWith(self.location.origin);
  if (!sameOrigin && !EXTRA(url)) return; // dış istekler (HiPS, API'ler) doğrudan ağa
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(cache => cache.put(e.request, clone)).catch(() => {}); }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || (sameOrigin ? caches.match('./') : Response.error())))
  );
});
