// Nombre del caché
const CACHE_NAME = "salexpmc v2"
// Archivos obligatorios para trabajar offline
const APP_SHELL = [
  // ELIMINAR "./"
  "./index.html",
  "./manifest.json",

  // CSS
  "./assets/css/tailwind.min.css",

  // JS internos
  "./assets/js/chart.min.js",
  "./assets/js/lucide.min.js",
  // Asegúrate de añadir aquí ./app.js si tienes un archivo de lógica separado

  // Íconos (rutas confirmadas)
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

// ... (El resto del código del Service Worker permanece igual)
