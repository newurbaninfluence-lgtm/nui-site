// nui-push.js — Web Push Notification subscription manager
// Prompts visitors to opt-in for push notifications on mobile + desktop
// Stores subscriptions in Supabase for targeted campaigns by interest

(function() {
    'use strict';

    // ── Config ───────────────────────────────────────────────────
    const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Generate at: web-push-codelab.glitch.me
    const SUBSCRIBE_ENDPOINT = '/.netlify/functions/push-subscribe';
    const PROMPT_DELAY = 15000; // Show opt-in after 15 seconds
    const PROMPT_COOKIE = 'nui_push_prompted';

    // ── Skip if VAPID key not configured yet ─────────────────────
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes('YOUR_')) {
        console.log('Push notifications: VAPID key not configured, skipping');
        return;
    }

    // ── Check support ────────────────────────────────────────────
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
    }

    // ── Don't re-prompt if already asked ─────────────────────────
    if (document.cookie.includes(PROMPT_COOKIE)) return;

    // ── Register service worker ──────────────────────────────────
    navigator.serviceWorker.register('/sw-push.js').then(function(reg) {
        console.log('Push SW registered');

        // Check if already subscribed
        reg.pushManager.getSubscription().then(function(sub) {
            if (sub) {
                console.log('Already subscribed to push');
                return;
            }

            // Show custom prompt after delay
            setTimeout(function() {
                showPushPrompt(reg);
            }, PROMPT_DELAY);
        });
    });

    // ── Custom Push Opt-in Banner ────────────────────────────────
    function showPushPrompt(registration) {
        const banner = document.createElement('div');
        banner.id = 'nui-push-banner';
        banner.innerHTML = `
            <div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
                background:#111;color:#fff;padding:16px 24px;border-radius:12px;
                box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:99999;
                display:flex;align-items:center;gap:16px;max-width:420px;width:90%;
                font-family:'Montserrat',sans-serif;font-size:14px;
                animation:slideUp 0.4s ease-out;">
                <div style="flex:1;">
                    <strong style="color:#dc2626;">🔔 Stay in the loop</strong><br>
                    <span style="font-size:12px;color:#aaa;">Get exclusive branding tips & offers — no spam, ever.</span>
                </div>
                <button id="nui-push-yes" style="background:#dc2626;color:#fff;border:none;
                    padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:700;
                    font-size:13px;white-space:nowrap;">Allow</button>
                <button id="nui-push-no" style="background:transparent;color:#666;border:none;
                    padding:8px;cursor:pointer;font-size:18px;">✕</button>
            </div>
        `;

        // Animation
        const style = document.createElement('style');
        style.textContent = '@keyframes slideUp{from{transform:translateX(-50%) translateY(100px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}';
        document.head.appendChild(style);
        document.body.appendChild(banner);

        // "Allow" button
        document.getElementById('nui-push-yes').addEventListener('click', function() {
            banner.remove();
            subscribeToPush(registration);
        });

        // "X" close button
        document.getElementById('nui-push-no').addEventListener('click', function() {
            banner.remove();
            // Don't ask again for 30 days
            document.cookie = PROMPT_COOKIE + '=1;max-age=' + (30 * 86400) + ';path=/';
        });
    }

    // ── Subscribe to Push Notifications ──────────────────────────
    function subscribeToPush(registration) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        }).then(function(subscription) {
            console.log('Push subscription:', subscription);

            // Collect current interests from session
            const interests = [];
            const hash = (location.hash || '').replace('#', '');
            if (hash) interests.push(hash);

            // Send subscription to our backend
            fetch(SUBSCRIBE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    interests: interests,
                    user_agent: navigator.userAgent,
                    platform: getPlatform()
                })
            }).then(function() {
                console.log('✅ Push subscription saved');
                document.cookie = PROMPT_COOKIE + '=subscribed;max-age=' + (365 * 86400) + ';path=/';
            });
        }).catch(function(err) {
            console.warn('Push subscription failed:', err);
            document.cookie = PROMPT_COOKIE + '=denied;max-age=' + (7 * 86400) + ';path=/';
        });
    }

    // ── Helpers ───────────────────────────────────────────────────
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function getPlatform() {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
        if (/Android/.test(ua)) return 'android';
        if (/Mac/.test(ua)) return 'mac';
        if (/Windows/.test(ua)) return 'windows';
        return 'other';
    }
})();
