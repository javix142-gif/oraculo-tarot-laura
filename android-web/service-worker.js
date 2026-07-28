const CACHE_NAME = 'oraculo-tarot-laura-v2';
const CORE_PATHS = [
  "./",
  "./index.html",
  "./styles.css",
  "./js/app.js",
  "./js/tarot-data.js",
  "./js/tarot-engine.js",
  "./js/storage.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/cards/card-back.svg",
  "./assets/cards/00-el-loco.svg",
  "./assets/cards/01-el-mago.svg",
  "./assets/cards/02-la-sacerdotisa.svg",
  "./assets/cards/03-la-emperatriz.svg",
  "./assets/cards/04-el-emperador.svg",
  "./assets/cards/05-el-hierofante.svg",
  "./assets/cards/06-los-enamorados.svg",
  "./assets/cards/07-el-carro.svg",
  "./assets/cards/08-la-fuerza.svg",
  "./assets/cards/09-el-ermitano.svg",
  "./assets/cards/10-la-rueda-de-la-fortuna.svg",
  "./assets/cards/11-la-justicia.svg",
  "./assets/cards/12-el-colgado.svg",
  "./assets/cards/13-la-muerte.svg",
  "./assets/cards/14-la-templanza.svg",
  "./assets/cards/15-el-diablo.svg",
  "./assets/cards/16-la-torre.svg",
  "./assets/cards/17-la-estrella.svg",
  "./assets/cards/18-la-luna.svg",
  "./assets/cards/19-el-sol.svg",
  "./assets/cards/20-el-juicio.svg",
  "./assets/cards/21-el-mundo.svg"
];

const scopedUrl = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_PATHS.map(scopedUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(scopedUrl('./index.html'))) || caches.match(scopedUrl('./offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
