// Service Worker para funcionamento OFFLINE - VERSÃO CORRIGIDA
const CACHE_NAME = 'inspecao-riscos-v3';

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
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// ==========================================
// INSTALAR SERVICE WORKER
// ==========================================
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('📂 Service Worker: Cacheando arquivos essenciais');
        
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
            console.log('⭕ Ignorado (não existe):', url);
          }
        }
        
        console.log('✅ Service Worker: Cache inicial concluído');
      })
      .then(() => self.skipWaiting())
  );
});

// ==========================================
// ATIVAR SERVICE WORKER
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Limpar caches antigos (exceto o atual)
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Ativado com sucesso!');
      return self.clients.claim();
    })
  );
});

// ==========================================
// INTERCEPTAR REQUISIÇÕES
// ==========================================
self.addEventListener('fetch', (event) => {
  // Estratégia: Network First, fallback para Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se online, atualizar cache com a resposta
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se offline, buscar no cache
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('📦 Service Worker: Servindo do cache (offline):', event.request.url);
            return response;
          }
          
          // Se não tem no cache e é uma página HTML, retornar index.html
          if (event.request.mode === 'navigate') {
            console.log('🏠 Service Worker: Retornando index.html (offline)');
            return caches.match('/ns/index.html');
          }
          
          // Se for um ícone que não existe, retornar resposta vazia (sem erro)
          if (event.request.url.includes('icon-')) {
            console.log('⭕ Service Worker: Ícone não encontrado, ignorando');
            return new Response('', { status: 404, statusText: 'Icon not found' });
          }
          
          // Para outros recursos, retornar erro 404
          console.warn('❌ Service Worker: Recurso não encontrado:', event.request.url);
          return new Response('Not found', { status: 404 });
        });
      })
  );
});

// ==========================================
// MENSAGENS DO CLIENTE
// ==========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Service Worker: Pulando espera (force update)');
    self.skipWaiting();
  }
});

// ==========================================
// LOG FINAL
// ==========================================
console.log('✅ Service Worker carregado com sucesso!');
console.log('📌 Cache Name:', CACHE_NAME);
console.log('📂 Arquivos essenciais:', ESSENTIAL_FILES.length);
console.log('📂 Arquivos opcionais:', OPTIONAL_FILES.length);