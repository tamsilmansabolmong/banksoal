const CACHE_NAME = 'bank-soal-v2';
const APP_SHELL = [
    './',
    './bank_generator_soal_madrasah_sekolah.html',
    './app.js',
    './styles.css',
    './google-config.js',
    './google-sync.js',
    './exam-document.js',
    './pdf-export.js',
    './word-export.js',
    './manifest.json',
    './pwa-icon.svg'
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
            }).catch(() => caches.match('./bank_generator_soal_madrasah_sekolah.html')))
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
