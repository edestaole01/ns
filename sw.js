// Define um nome e versão para o cache
const CACHE_NAME = 'inspecao-riscos-cache-v1.1'; // Mudei a versão para garantir que o navegador atualize

// Lista de arquivos essenciais para a aplicação funcionar offline
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'app.js', // Agora ele vai salvar o seu app.js de 1800 linhas
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
];

// Evento 'install': é disparado quando o Service Worker é instalado
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto. Adicionando arquivos essenciais para modo offline.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch': é disparado para cada requisição que a página faz
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Tenta encontrar a requisição no cache primeiro
    caches.match(event.request)
      .then((response) => {
        // Se a resposta for encontrada no cache, retorna ela.
        // Se não, busca na rede.
        return response || fetch(event.request);
      })
  );
});

// Evento 'activate': limpa caches antigos para evitar conflitos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});