const CACHE = 'mirecetario-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  'https://cdn.tailwindcss.com'
];
function isPlanningOrRecipesJson(url) {
  try {
    var u = new URL(url);
    return u.pathname.endsWith('planning.json') || u.pathname.endsWith('recipes.json');
  } catch (e) { return false; }
}
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
  var url = e.request.url;
  if (isPlanningOrRecipesJson(url)) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (r) { return r || new Response('Offline', { status: 503 }); });
      })
    );
    return;
  }
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
