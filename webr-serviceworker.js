// Fișier ServiceWorker gol pentru a preveni eroarea 404
// WebR încearcă să încarce acest fișier automat

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
});

console.log('✅ ServiceWorker WebR încărcat');
