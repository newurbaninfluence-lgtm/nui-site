// NUI Service Worker — Cache Cleanup + Push Notifications
// v20260321

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
            clients.forEach(function(client) {
                client.postMessage({ type: 'NUI_SW_CLEARED' });
            });
        })
    );
});

// NO fetch handler — all requests go directly to network for fresh content.

// ── Push Notification Handler ─────────────────────────────────────────────────
self.addEventListener('push', function(event) {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch(e) {
        data = { title: 'New Urban Influence', body: event.data ? event.data.text() : 'You have a new message.' };
    }

    const title   = data.title || 'New Urban Influence';
    const options = {
        body:    data.body  || 'Check out what\'s new at NUI.',
        icon:    data.icon  || '/icons/icon-192.png?v=20260418',
        badge:   data.badge || '/icons/icon-72.png?v=20260418',
        image:   data.image || null,
        tag:     data.tag   || 'nui-notification',
        data:    { url: data.url || 'https://newurbaninfluence.com' },
        actions: data.actions || [
            { action: 'view',    title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    // Remove null image to avoid display issues
    if (!options.image) delete options.image;

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ── Notification Click Handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : 'https://newurbaninfluence.com';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // If a window is already open on the target URL, focus it
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
