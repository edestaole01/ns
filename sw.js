// Service Worker v3.0 - VERSAO CORRIGIDA SEM ERROS
const APP_VERSION = '3.0.0';
const CACHE_NAME = 'inspecao-riscos-v3-0-0';

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

self.addEventListener('install', function(event) {
  console.log('Instalando Service Worker v' + APP_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ESSENTIAL_FILES).catch(function(err) {
          console.warn('Erro ao cachear essenciais:', err);
        });
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Ativando Service Worker v' + APP_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cache) {
            if (cache !== CACHE_NAME) {
              console.log('Removendo cache antigo:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') {
    return;
  }
  
  var isEssential = ESSENTIAL_FILES.indexOf(url.pathname) !== -1;
  var isOptional = OPTIONAL_FILES.some(function(file) {
    return event.request.url.indexOf(file) !== -1;
  });
  
  if (isEssential || isOptional) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then(function(response) {
              if (response && response.status === 200) {
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
        .catch(function() {
          if (event.request.mode === 'navigate') {
            return caches.match('/ns/index.html');
          }
          return new Response('Offline', { status: 503 });
        })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

console.log('Service Worker v' + APP_VERSION + ' carregado com sucesso');