// sw.js - VERSÃO CORRIGIDA E MAIS ROBUSTA

importScripts('version.js');

const CACHE_NAME = `inspecao-riscos-cache-v${APP_VERSION}`;

// Arquivos essenciais que DEVEM estar no cache para o app funcionar
const ESSENTIALS_TO_CACHE = [
  '/',
  'index.html',
  'app.js',
  'risks-data.js',
  'exames-data.js',
  'sugestoes-data.js',
  'version.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css', // Adicionar dependências externas
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// Evento de instalação: focado apenas nos arquivos essenciais
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto. Adicionando arquivos essenciais.');
        // O `addAll` falha se um único arquivo não for encontrado.
        // Vamos usar `add` individualmente para depurar melhor.
        return Promise.all(
            ESSENTIALS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`[SW] Falha ao cachear ${url}`, err)))
        );
      })
      .then(() => {
        // Força a ativação do novo service worker assim que ele terminar a instalação
        return self.skipWaiting();
      })
  );
});

// Evento de ativação: limpa caches antigos e assume controle
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
      ).then(() => {
        // Assume o controle de todas as abas abertas imediatamente
        return self.clients.claim();
      });
    })
  );
});

// Evento de fetch: estratégia Network First para arquivos principais, Cache First para outros
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Estratégia Network First para HTML e JS principais para garantir atualizações
  if (url.origin === location.origin && (event.request.mode === 'navigate' || url.pathname.endsWith('.js'))) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Se bem-sucedido, atualiza o cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => {
          // Se a rede falhar, tenta pegar do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estratégia Cache First para todos os outros recursos (CSS, fontes, imagens)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        });
      })
  );
});