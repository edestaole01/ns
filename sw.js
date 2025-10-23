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
];

// Evento de instalação: focado apenas nos arquivos essenciais
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Instalando versão ${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto. Adicionando arquivos essenciais.');
        return cache.addAll(ESSENTIALS_TO_CACHE);
      })
      .catch(error => {
        console.error('[Service Worker] Falha ao adicionar arquivos essenciais ao cache:', error);
      })
  );
});

// Evento de ativação: limpa caches antigos
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

// Evento de fetch: busca no cache primeiro, depois na rede
// Se buscar na rede, tenta salvar uma cópia no cache para uso futuro
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Se encontrou no cache, retorna
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se não, busca na rede
        return fetch(event.request).then((networkResponse) => {
          // Clona a resposta, pois ela só pode ser consumida uma vez
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            // Salva a resposta da rede no cache para a próxima vez
            cache.put(event.request, responseToCache);
          });

          // Retorna a resposta original da rede
          return networkResponse;
        });
      }).catch(error => {
        console.error('[Service Worker] Erro no fetch:', error);
        // Pode retornar uma página de fallback offline aqui se desejar
      })
  );
});