// --- START OF FILE sw.js (VERSÃO FINAL COM CACHE-FIRST) ---

importScripts('version.js');

const CACHE_NAME = `inspecao-riscos-cache-v${APP_VERSION}`;

// ★ NOVO: Lista de arquivos inclui dependências externas para garantir o funcionamento offline
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
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// Instala o SW: cacheia os arquivos essenciais e se prepara para ativar.
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando versão ${APP_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto. Adicionando arquivos essenciais.');
        // O addAll falha se um único arquivo não for encontrado.
        // Vamos usar add individualmente com catch para mais robustez.
        return Promise.all(
            ESSENTIALS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`[SW] Falha ao cachear ${url}`, err)))
        );
      })
      .then(() => self.skipWaiting())
      .catch(error => console.error('[SW] Falha na instalação:', error))
  );
});

// Ativação: Limpa caches antigos e assume o controle.
self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando versão ${APP_VERSION}...`);
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
    }).then(() => {
      console.log('[SW] Assumindo controle dos clientes.');
      return self.clients.claim();
    })
  );
});

// Fetch: Estratégia "Cache, falling back to Network" (Cache First).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Se encontrou no cache, retorna imediatamente.
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Se não encontrou, busca na rede.
        return fetch(event.request).then((networkResponse) => {
          // Clona a resposta, pois ela só pode ser consumida uma vez.
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            // Salva a resposta da rede no cache para a próxima vez.
            cache.put(event.request, responseToCache);
          });

          // Retorna a resposta original da rede.
          return networkResponse;
        });
      })
      .catch(error => {
        console.error('[SW] Erro no fetch:', error);
        // Opcional: Retornar uma página de fallback offline aqui se desejar.
      })
  );
});