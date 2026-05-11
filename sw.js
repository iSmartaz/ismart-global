const CACHE_NAME = 'ismart-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/orders.html',
  '/telefonlar.html',
  '/aksesuarlar.html',
  '/temir.html',
  '/frontend/css/styles.css',
  '/frontend/js/script.js',
  '/frontend/js/admin.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});