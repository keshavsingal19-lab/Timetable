const CACHE_NAME = 'srcc-pwa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Stale-While-Revalidate Strategy targeting specific assets safely
self.addEventListener('fetch', (event) => {
  // Never cache API logic or external requests unassociated with static rendering
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If valid response, silently update the background cache
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        
        // Serve instant cached file first (if available), then quietly resolve background fetch 
        return cachedResponse || fetchPromise;
      });
    })
  );
});