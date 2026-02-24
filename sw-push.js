// sw-push.js — Service Worker for Web Push Notifications
// Handles push events and notification clicks
// Works on: Android Chrome, Desktop Chrome/Firefox/Edge, iPhone Safari (iOS 16.4+)

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'New update from New Urban Influence',
        icon: '/apple-touch-icon.png',
        badge: '/favicon.ico',
        image: data.image || null,
        tag: data.tag || 'nui-notification',
        data: {
            url: data.url || 'https://newurbaninfluence.com',
            interest: data.interest || 'general'
        },
        actions: data.actions || [
            { action: 'open', title: 'Check it out' },
            { action: 'dismiss', title: 'Later' }
        ],
        vibrate: [100, 50, 100],
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || 'New Urban Influence',
            options
        )
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const url = event.notification.data.url || 'https://newurbaninfluence.com';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Focus existing tab if open
            for (const client of clientList) {
                if (client.url.includes('newurbaninfluence.com') && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // Open new tab
            return clients.openWindow(url);
        })
    );
});
