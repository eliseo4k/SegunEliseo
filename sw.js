const CACHE_NAME = 'segun-eliseo-v2.1';
const assetsToCache = [
  'index.html',
  'sobre-nosotros.html',
  'contacto.html',
  'admin.html',
  'styles.css',
  'app.js',
  'admin.js',
  'img/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});