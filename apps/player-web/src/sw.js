const CACHE = 'adegatv-v1';
const ASSETS = ['/', '/pair', '/player', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === 'image' || request.destination === 'video') {
    e.respondWith(networkFirst(request));
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    const cache = await caches.open(CACHE);
    cache.put(request, res.clone());
    return res;
  } catch {
    return caches.match(request);
  }
}
