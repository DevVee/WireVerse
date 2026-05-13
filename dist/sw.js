const VERSION = 'wv2-v8';
const STATIC = [
  './',
  './index.html',
  './manifest.json',
  './Mascot.png',
  './TextLogo.png',
  './src/styles/main.css',
  './src/main.js',
  './src/core/Game.js',
  './src/systems/Database.js',
  './src/systems/SoundManager.js',
  './src/systems/MascotGuide.js',
  './src/ui/UIManager.js',
  './src/ui/MainMenu.js',
  './src/ui/StagesHub.js',
  './src/ui/ExploreScreen.js',
  './src/scenes/ExploreScene.js',
  './src/scenes/OutletScenario.js',
  './src/scenes/SwitchScenario.js',
  './learn-outlet.html',
  './stages.html',
  './switch_installation.html',
  './ways.html',
];

const FONT_CACHE = 'wv2-fonts-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(STATIC.filter(u => {
        // Skip files that might not exist — ignore failures gracefully
        return true;
      })))
      .catch(() => {}) // don't fail install if some assets are missing
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== VERSION && k !== FONT_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Google Fonts — cache-first with long TTL
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONT_CACHE).then(c =>
        c.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(resp => {
            if (resp && resp.status === 200) c.put(e.request, resp.clone());
            return resp;
          }).catch(() => cached || new Response('', { status: 503 }));
        })
      )
    );
    return;
  }

  // Everything else — network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(VERSION).then(c => c.put(e.request, clone));
        return resp;
      })
      .catch(() =>
        caches.match(e.request).then(cached =>
          cached || (e.request.mode === 'navigate'
            ? caches.match('./index.html')
            : new Response('', { status: 503 }))
        )
      )
  );
});
