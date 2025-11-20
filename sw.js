const CACHE_NAME = "salexpmc-cache-v4"; // ¡VERSIÓN ACTUALIZADA!

// Archivos obligatorios para trabajar offline
// He añadido el archivo app.js, que es esencial para la lógica de tu app.
const APP_SHELL = [
  // ELIMINADO "./" para evitar conflictos
  "./index.html",
  "./manifest.json",
  
  // JS de lógica principal
  "./app.js", // ASUMIMOS que tu app (1).js se llama app.js en producción
  // Si tu archivo principal se llama app(1).js, debes cambiarlo aquí.

  // CSS
  "./assets/css/tailwind.min.css",

  // JS internos
  "./assets/js/chart.min.js",
  "./assets/js/lucide.min.js",

  // Íconos (rutas verificadas en el manifest)
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

// Instalación del Service Worker
self.addEventListener("install", event => {
  console.log("[SW] Instalando service worker y haciendo precache...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Intenta precachear TODOS los archivos
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

// Activación
self.addEventListener("activate", event => {
  console.log("[SW] Activando service worker...");

  // Limpiar caches viejos
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Cache antiguo eliminado:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch → Estrategia: Cache first, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Guardar en cache dinámicamente solo si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Opcional: puedes devolver el index.html en caso de fallo de red
          return caches.match("./index.html");
        });
    })
  );
});
