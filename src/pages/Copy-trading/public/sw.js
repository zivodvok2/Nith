const CACHE_NAME = 'copy-trading-v1';
const urlsToCache = [
    '/copy-trading/',
    '/copy-trading/index.html',
    '/copy-trading/manifest.json',
    '/copy-trading/icons/icon-192x192.png',
    '/copy-trading/icons/icon-512x512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});
