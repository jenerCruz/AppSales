const CACHE_NAME = "salexpmc-cache-v4"; 

// App shell REAL (sin ./)
const APP_SHELL = [
  "/",                // raíz
  "/index.html",
  "/manifest.json",

  // JS principal
  "/app.js",

  // CSS
  "/assets/css/tailwind.min.css",

  // JS internos
  "/assets/js/chart.min.js",
  "/assets/js/lucide.min.js",

  // Íconos
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

// Instalación del Service Worker
self.addEventListener("install", event => {
  console.log("[SW] Instalando service worker y haciendo precache...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    }).catch(err => {
      console.error("[SW] Error al precachear:", err);
    })
  );

  self.skipWaiting();
});

// Activación
self.addEventListener("activate", event => {
  console.log("[SW] Activando service worker...");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Cache antigua eliminada:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});