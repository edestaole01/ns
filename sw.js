// --- START OF FILE sw.js (VERSÃO MAIS AGRESSIVA) ---

importScripts('version.js');

const CACHE_NAME = `inspecao-riscos-cache-v${APP_VERSION}`;
const ESSENTIALS_TO_CACHE = [
  '/', 'index.html', 'app.js', 'risks-data.js', 'exames-data.js',
  'sugestoes-data.js', 'version.js', 'manifest.json', 'icon-192.png', 'icon-512.png',
];

// Instala o SW e força a ativação
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ESSENTIALS_TO_CACHE))
      .then(() => self.skipWaiting()) // ★ Força o novo SW a se tornar ativo imediatamente
  );
});

// Limpa caches antigos e assume o controle
self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // ★ Assume o controle de todas as abas abertas
  );
});

// Listener de mensagem para o app.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});