const CACHE_NAME = 'scas-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/scas_pwa_icon.png',
  '/offline',
];

// 1. Install Event - Cache initial UI shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin or non-GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with the latest version from network
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If network fails (Offline), return cached response or offline page
          return cachedResponse || caches.match('/offline');
        });

        // Return cached version immediately if it exists, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
