// Importa a biblioteca Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Cache para páginas HTML
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document',
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'pages-cache' })
);

// Cache para assets (CSS, JS, Ícones)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
  new workbox.strategies.CacheFirst({ cacheName: 'assets-cache' })
);

// ***** NOVO E IMPORTANTE: Cache para o modelo de voz *****
// Usamos CacheFirst porque o modelo não muda.
workbox.routing.registerRoute(
  ({url}) => url.pathname.includes('/model/'), // Captura qualquer arquivo dentro da pasta /model/
  new workbox.strategies.CacheFirst({
    cacheName: 'vosk-model-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses: [0, 200]}),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60, // Cache válido por 1 ano
      }),
    ],
  })
);