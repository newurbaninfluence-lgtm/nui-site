// NUI Service Worker — CLEANUP MODE
// This version clears all old caches and stops intercepting requests.
// Once Safari/mobile downloads this, the stale cached pages are gone forever.

self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(names.map(function(name) {
                console.log('[SW] Deleting cache:', name);
                return caches.delete(name);
            }));
        }).then(function() {
            return self.clients.claim();
        }).then(function() {
            return self.clients.matchAll();
        }).then(function(clients) {
            // Tell all open tabs to reload so they get fresh content
            clients.forEach(function(client) {
                client.postMessage({ type: 'NUI_SW_CLEARED' });
            });
        })
    );
});

// NO fetch handler — all requests go directly to the network.
// This ensures Safari/mobile always gets fresh content from the server.
