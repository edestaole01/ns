// Service Worker Otimizado - Versão Corrigida
const CACHE_NAME = 'inspecao-riscos-v2-mobile';

const ESSENTIAL_FILES = [
  '/ns/',
  '/ns/index.html',
  '/ns/app.js',
  '/ns/manifest.json'
];

const OPTIONAL_FILES = [
  '/ns/icon-192.png',
  '/ns/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// INSTALAÇÃO
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        // Cachear essenciais
        try {
          await cache.addAll(ESSENTIAL_FILES);
          console.log('✅ Arquivos essenciais cacheados');
        } catch (err) {
          console.warn('⚠️ Erro ao cachear essenciais:', err);
        }
        
        // Cachear opcionais
        for (const url of OPTIONAL_FILES) {
          try {
            const response = await fetch(url, { mode: 'no-cors' });
            await cache.put(url, response);
          } catch (err) {
            console.log('⏭️ Ignorado:', url);
          }
        }
      })
      .then(() => self.skipWaiting())
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
      .then(() => self.clients.claim())
  );
});

// FETCH - ESTRATÉGIA: Cache First para arquivos locais, Network Only para dados
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Se for IndexedDB ou dados locais, não interceptar
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') {
    return;
  }
  
  // Verificar se é arquivo essencial ou opcional
  const isEssential = ESSENTIAL_FILES.includes(url.pathname);
  const isOptional = OPTIONAL_FILES.some(file => event.request.url.includes(file));
  
  // Para arquivos estáticos: Cache First
  if (isEssential || isOptional) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('📦 Servindo do cache:', event.request.url);
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/ns/index.html');
          }
          return new Response('Offline', { status: 503 });
        })
    );
  } else {
    // Para outros recursos: Network Only (não interferir)
    event.respondWith(fetch(event.request));
  }
});

console.log('✅ Service Worker carregado!');