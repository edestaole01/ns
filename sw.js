// Importa a versão do aplicativo
importScripts('version.js');

// Usa a versão do APP_VERSION para o cache
const CACHE_NAME = `inspecao-riscos-cache-v${APP_VERSION}`;

// Lista de arquivos essenciais para a aplicação funcionar offline
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'app.js',
  'risks-data.js',
  'version.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// Evento 'install': é disparado quando o Service Worker é instalado
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Instalando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto. Adicionando arquivos essenciais.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch': é disparado para cada requisição que a página faz
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Evento 'activate': limpa caches antigos para evitar conflitos
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Ativando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});