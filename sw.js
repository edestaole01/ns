// Service Worker para funcionamento OFFLINE - VERSÃO CORRIGIDA
const CACHE_NAME = 'inspecao-riscos-v2';
const MODEL_CACHE = 'vosk-model-cache-v1';

// Arquivos ESSENCIAIS (apenas os que existem com certeza)
const ESSENTIAL_FILES = [
  '/ns/',
  '/ns/index.html',
  '/ns/app.js',
  '/ns/manifest.json'
];

// Arquivos OPCIONAIS (não travam se não existirem)
const OPTIONAL_FILES = [
  '/ns/icon-192.png',
  '/ns/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://unpkg.com/vosk-browser@0.0.8/dist/vosk.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Service Worker: Cacheando arquivos essenciais');
        
        // Cachear arquivos essenciais (pode falhar se não existirem)
        try {
          await cache.addAll(ESSENTIAL_FILES);
          console.log('✅ Arquivos essenciais cacheados');
        } catch (err) {
          console.warn('⚠️ Alguns arquivos essenciais não foram encontrados:', err);
        }
        
        // Tentar cachear arquivos opcionais (não trava se falhar)
        for (const url of OPTIONAL_FILES) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log('✅ Cacheado:', url);
            }
          } catch (err) {
            console.log('⏭️ Ignorado (não existe):', url);
          }
        }
        
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
  
  // Cache especial para modelo Vosk (nunca expira)
  if (url.hostname === 'alphacephei.com' || url.pathname.includes('vosk-model')) {
    event.respondWith(
      caches.open(MODEL_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log('Service Worker: Modelo Vosk do cache');
            return response;
          }
          
          console.log('Service Worker: Baixando modelo Vosk...');
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
              console.log('Service Worker: Modelo Vosk salvo no cache');
            }
            return response;
          }).catch(err => {
            console.error('Service Worker: Erro ao baixar modelo:', err);
            throw err;
          });
        });
      })
    );
    return;
  }
  
  // Estratégia: Network First, fallback para Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se online, atualizar cache
        if (response && response.status === 200) {
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
          
          // Se não tem no cache e é uma página HTML, retornar index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/ns/index.html');
          }
          
          // Se for um ícone que não existe, retornar uma resposta vazia
          if (event.request.url.includes('icon-')) {
            console.log('Service Worker: Ícone não encontrado, ignorando');
            return new Response('', { status: 404 });
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