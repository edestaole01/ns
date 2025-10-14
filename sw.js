// --- START OF FILE sw.js ---

// Service Worker para funcionamento OFFLINE - VERSÃO OTIMIZADA
importScripts('version.js'); // Importa a versão do app

const CACHE_NAME = `inspecao-riscos-${APP_VERSION}`;
const MODEL_CACHE = 'vosk-model-cache-v1';

// Arquivos ESSENCIAIS (bloqueiam a instalação se falharem)
const ESSENTIAL_FILES = [
  '/ns/',
  '/ns/index.html',
  '/ns/app.js',
  '/ns/manifest.json',
  '/ns/version.js' // Adicionado o arquivo de versão
];

// Arquivos OPCIONAIS (não travam a instalação se falharem)
const OPTIONAL_FILES = [
  '/ns/icon-192.png',
  '/ns/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Service Worker: Cacheando arquivos essenciais');
        await cache.addAll(ESSENTIAL_FILES).catch(err => {
            console.warn('⚠️  Alguns arquivos essenciais não foram encontrados:', err);
        });
        console.log('✅ Arquivos essenciais processados');

        // Cachear arquivos opcionais em paralelo para maior velocidade
        console.log('Service Worker: Cacheando arquivos opcionais...');
        const optionalPromises = OPTIONAL_FILES.map(url => 
            fetch(url, { mode: 'no-cors' }) // Use no-cors para CDNs de fontes/ícones
                .then(response => {
                    if (response.status === 0 || response.ok) { // Status 0 para respostas 'opaque' (no-cors)
                        return cache.put(url, response).then(() => ({ url, status: 'success' }));
                    }
                    return { url, status: 'failed', reason: `Status ${response.status}` };
                })
                .catch(err => ({ url, status: 'failed', reason: err.message }))
        );

        const results = await Promise.all(optionalPromises);
        results.forEach(result => {
            if (result.status === 'success') {
                console.log(`✅ Cacheado: ${result.url}`);
            } else {
                console.log(`❗️ Ignorado (${result.reason}): ${result.url}`);
            }
        });
        
        console.log('Service Worker: Cache inicial concluído');
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== MODEL_CACHE) {
            console.log('Service Worker: Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache especial para modelo Vosk (Cache First)
  if (url.hostname === 'alphacephei.com' || url.pathname.includes('vosk-model')) {
    event.respondWith(
      caches.open(MODEL_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          console.log('Service Worker: Modelo Vosk do cache');
          return cachedResponse;
        }
        
        console.log('Service Worker: Baixando modelo Vosk...');
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.ok) {
          await cache.put(event.request, networkResponse.clone());
          console.log('Service Worker: Modelo Vosk salvo no cache');
        }
        return networkResponse;
      })
    );
    return;
  }
  
  // Estratégia: Stale-While-Revalidate para assets (CSS, JS, Fontes)
  if (['style', 'script', 'font', 'image'].includes(event.request.destination)) {
      event.respondWith(
          caches.open(CACHE_NAME).then(cache => {
              return cache.match(event.request).then(cachedResponse => {
                  const fetchPromise = fetch(event.request).then(networkResponse => {
                      if (networkResponse.ok) {
                          cache.put(event.request, networkResponse.clone());
                      }
                      return networkResponse;
                  });
                  // Retorna o cache imediatamente, se existir, enquanto busca atualização em segundo plano
                  return cachedResponse || fetchPromise;
              });
          })
      );
      return;
  }

  // Estratégia: Network First para navegação (HTML)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se online, atualizar cache
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se offline, usar cache
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('Service Worker: Servindo do cache (offline):', event.request.url);
            return response;
          }
          
          // Fallback para o index.html em caso de falha de navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/ns/index.html');
          }
        });
      })
  );
});

// Mensagem de status
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker carregado com sucesso! ✅');
// --- END OF FILE sw.js ---