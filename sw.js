// Importa a biblioteca Workbox do CDN do Google
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Define uma estratégia de cache: "Stale While Revalidate"
// Isso significa que o app tentará buscar a versão mais nova da rede,
// mas se estiver offline, usará a versão do cache imediatamente.
// É ótimo para arquivos que podem mudar, como o ns.html.
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'pages-cache',
  })
);

// Define uma estratégia para arquivos estáticos (CSS, JS, Ícones)
// "Cache First": Uma vez salvo no cache, sempre será pego de lá,
// o que é mais rápido.
workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // No máximo 60 arquivos
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache válido por 30 dias
      }),
    ],
  })
);