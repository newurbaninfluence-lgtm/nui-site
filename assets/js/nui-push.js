// nui-push.js — Web Push Notification subscription manager
// Prompts visitors to opt-in for push notifications on mobile + desktop
// Stores subscriptions in Supabase for targeted campaigns by interest

(function() {
    'use strict';

    // ── Config ───────────────────────────────────────────────────
    const VAPID_PUBLIC_KEY = 'BHX1swSI56wudpcQ9npOWXg1bf7LMQnoF_L1YbQhouv4gNOQ0aEki7mcu0f7mc0R-nRKBP5Kz1yhxQzoya_bH8s';
    const SUBSCRIBE_ENDPOINT = '/.netlify/functions/push-subscribe';
    const PROMPT_DELAY = 20000; // Earliest time the opt-in can show
    const PROMPT_COOKIE = 'nui_push_prompted';

    // ── Remove the VAPID skip check since key is now configured ─
    // ── Check support ────────────────────────────────────────────
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }

    // ── Don't re-prompt if already asked ─────────────────────────
    if (document.cookie.includes(PROMPT_COOKIE)) return;

    // ── Register service worker ──────────────────────────────────
    navigator.serviceWorker.register('/sw-push.js').then(function(reg) {
        reg.pushManager.getSubscription().then(function(sub) {
            if (sub) return;
            // Only ask after real interest: 20s on the page AND scrolled past half of it.
            // Never on the back office.
            if (location.pathname.indexOf('/app') === 0) return;
            var waited = false, shown = false;
            function tryShow() {
                if (shown || !waited) return;
                var scrolled = (window.scrollY + window.innerHeight) / Math.max(1, document.body.scrollHeight);
                if (scrolled < 0.5) return;
                shown = true; window.removeEventListener('scroll', tryShow);
                showPushPrompt(reg);
            }
            setTimeout(function() { waited = true; tryShow(); }, PROMPT_DELAY);
            window.addEventListener('scroll', tryShow, { passive: true });
        });
    });

    // ── Premium Push Opt-in Prompt ───────────────────────────────
    function showPushPrompt(registration) {
        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes nuiPushSlideUp {
                from { transform: translateY(120px); opacity: 0; }
                to   { transform: translateY(0);     opacity: 1; }
            }
            @keyframes nuiPushFadeOut {
                from { transform: translateY(0);     opacity: 1; }
                to   { transform: translateY(120px); opacity: 0; }
            }
            #nui-push-wrap {
                position: fixed;
                bottom: 20px;
                left: 20px; /* chat bubble lives bottom-right */
                z-index: 999999;
                width: calc(100% - 40px);
                max-width: 340px;
                animation: nuiPushSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
            }
            #nui-push-card {
                background: #0a0a0a;
                border: 1px solid rgba(220,38,38,0.25);
                border-radius: 18px;
                padding: 24px;
                box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
                font-family: 'Inter', 'Inter', sans-serif;
                position: relative;
                overflow: hidden;
            }
            #nui-push-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 2px;
                background: linear-gradient(90deg, #dc2626, #ff6b6b, #dc2626);
                background-size: 200% 100%;
                animation: shimmer 2s linear infinite;
            }
            @keyframes shimmer {
                from { background-position: 200% 0; }
                to   { background-position: -200% 0; }
            }
            #nui-push-close {
                position: absolute;
                top: 14px; right: 16px;
                background: rgba(255,255,255,0.06);
                border: none;
                color: rgba(255,255,255,0.4);
                width: 28px; height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            #nui-push-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
            #nui-push-icon {
                width: 48px; height: 48px;
                background: linear-gradient(150deg,#ff3b3b,#b3000c);
                border: 0;
                border-radius: 14px;
                display: flex; align-items: center; justify-content: center;
                font-size: 22px;
                margin-bottom: 14px;
            }
            #nui-push-title {
                font-size: 16px;
                font-weight: 800;
                color: #fff;
                letter-spacing: -0.3px;
                margin-bottom: 6px;
            }
            #nui-push-sub {
                font-size: 12.5px;
                color: rgba(255,255,255,0.82);
                line-height: 1.5;
                margin-bottom: 20px;
            }
            #nui-push-sub span { color: rgba(255,255,255,0.7); }
            #nui-push-perks {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .nui-push-perk {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.07);
                border-radius: 20px;
                padding: 5px 12px;
                font-size: 11px;
                color: rgba(255,255,255,0.5);
                letter-spacing: 0.2px;
            }
            #nui-push-btn {
                width: 100%;
                background: #dc2626;
                color: #fff;
                border: none;
                padding: 14px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 700;
                font-family: inherit;
                cursor: pointer;
                letter-spacing: 0.3px;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            #nui-push-btn:hover { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(220,38,38,0.35); }
            #nui-push-btn:active { transform: translateY(0); }
            #nui-push-note {
                text-align: center;
                font-size: 12px;
                color: rgba(255,255,255,0.82);
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);

        // Build the prompt
        const wrap = document.createElement('div');
        wrap.id = 'nui-push-wrap';
        wrap.innerHTML = `
            <div id="nui-push-card">
                <button id="nui-push-close" aria-label="Close">✕</button>
                <div id="nui-push-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
                <div id="nui-push-title">Get tips &amp; offers first</div>
                <div id="nui-push-sub">Occasional alerts with offers and business tips. No spam, turn off anytime.</div>
                <button id="nui-push-btn">Yes, keep me in the loop</button>
                <div id="nui-push-note">Your info is never shared. One tap to unsubscribe.</div>
            </div>
        `;
        document.body.appendChild(wrap);

        // Close
        document.getElementById('nui-push-close').addEventListener('click', function() {
            dismissPrompt(wrap);
        });

        // Subscribe
        document.getElementById('nui-push-btn').addEventListener('click', function() {
            const btn = document.getElementById('nui-push-btn');
            btn.textContent = 'Connecting...';
            btn.disabled = true;
            wrap.remove();
            subscribeToPush(registration);
        });
    }

    function dismissPrompt(wrap) {
        wrap.style.animation = 'nuiPushFadeOut 0.35s ease forwards';
        setTimeout(function() { wrap.remove(); }, 350);
        document.cookie = PROMPT_COOKIE + '=1;max-age=' + (30 * 86400) + ';path=/';
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
