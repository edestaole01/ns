// Service Worker Simples e Confiável
importScripts('version.js');

const CACHE_NAME = `inspecao-riscos-v${APP_VERSION}`;

const ESSENTIAL_FILES = [
  '/ns/',
  '/ns/index.html',
  '/ns/app.js',
  '/ns/manifest.json',
  '/ns/version.js'
];

// INSTALAÇÃO
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando versão', APP_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache aberto');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('✅ Arquivos essenciais cacheados');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erro na instalação:', error);
      })
  );
});

// ATIVAÇÃO
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('🗑️ Limpando cache antigo:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// FETCH - ESTRATÉGIA SIMPLES E CONFIÁVEL
self.addEventListener('fetch', (event) => {
  // CRÍTICO: Sempre retornar uma Promise válida
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Se tem cache, usar
        if (cachedResponse) {
          console.log('📦 Cache:', event.request.url);
          return cachedResponse;
        }
        
        // Se não tem cache, buscar da rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Se a resposta for válida, cachear
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.log('⚠️ Offline:', event.request.url);
            
            // Se for navegação e está offline, tentar retornar index.html do cache
            if (event.request.mode === 'navigate') {
              return caches.match('/ns/index.html')
                .then((response) => {
                  // CRÍTICO: Se não encontrar, retornar Response válida
                  return response || new Response(
                    '<h1>Offline</h1><p>Você está offline e esta página não está no cache.</p>',
                    { 
                      status: 503,
                      statusText: 'Service Unavailable',
                      headers: new Headers({ 'Content-Type': 'text/html' })
                    }
                  );
                });
            }
            
            // Para outros recursos, retornar erro 503
            return new Response(
              'Offline',
              { 
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
              }
            );
          });
      })
  );
});

console.log('✅ Service Worker carregado! Versão:', APP_VERSION);