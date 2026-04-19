const CACHE = 'astro-atlas-v068';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

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
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
