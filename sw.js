const CACHE_NAME = "dropnote-v1.1-core";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  // CSS
  "./css/base.css",
  "./css/variables.css",
  "./css/layout.css",
  "./css/themes/dark.css",
  "./css/components/drawer.css",
  "./css/components/card.css",
  "./css/components/button.css",
  "./css/components/toast.css",

  // JS core
  "./js/app.js",
  "./js/core/store.js",
  "./js/core/utils.js",
  "./js/core/time.js",
  "./js/core/theme.js",
  "./js/core/toast.js"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH (network-first, fallback cache)
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // hanya handle request dalam scope app
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});