const CACHE_NAME = 'aurea-v1';
const BASE = '/aurea/';
const PRECACHE_ASSETS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}aurea-icon.svg`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first : always try fresh, fall back to cache when offline
async function networkFirst(request) {
  const cached = await caches.match(request);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const url = new URL(request.url);
      if (url.origin === self.location.origin && !url.pathname.startsWith(`${BASE}api/`)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(networkFirst(event.request));
});
