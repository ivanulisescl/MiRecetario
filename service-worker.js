const CACHE = 'mirecetario-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './planning.json',
  'https://cdn.tailwindcss.com'
];
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
  );
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k !== CACHE ? caches.delete(k) : null;
      }));
    })
  );
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      if (r) return r;
      return fetch(e.request).then(function (res) {
        var clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        return res;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
