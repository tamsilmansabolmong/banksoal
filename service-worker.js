const CACHE_NAME = 'bank-soal-v7';
const APP_SHELL = [
    './index.html',
    './app.html',
    './privacy-policy.html',
    './app.js',
    './styles.css',
    './google-config.js',
    './auth-service.js',
    './google-sync.js',
    './exam-document.js',
    './pdf-export.js',
    './word-export.js',
    './manifest.json',
    './pwa-icon.svg',
    './logo-bank-soal.png',
    './logo-kemenag.png'
];
const CDN_HOSTS = new Set([
    'cdn.tailwindcss.com',
    'unpkg.com',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
]);

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if (event.request.method !== 'GET' || requestUrl.hostname === 'accounts.google.com') return;

    if (requestUrl.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
                if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                return response;
            }).catch(() => event.request.mode === 'navigate'
                ? caches.match('./index.html')
                : Promise.reject(new Error(`Aset offline tidak tersedia: ${event.request.url}`))))
        );
        return;
    }

    if (CDN_HOSTS.has(requestUrl.hostname)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                const network = fetch(event.request).then((response) => {
                    if (response.ok || response.type === 'opaque') {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                    }
                    return response;
                });
                return cached || network;
            })
        );
    }
});
