// ========================================================================
// push-opt-in.js  -  Web push opt-in banner + subscription flow
// ========================================================================
// Shows a bottom banner after 20s of engagement, asks for push permission,
// subscribes via the browser pushManager, POSTs subscription to Supabase.
// Dismissals remembered for 30 days via localStorage.
//
// Safe to load on ALL public pages. Does nothing if:
//   - Browser doesn't support push (older Safari, etc.)
//   - User already granted or denied permission
//   - User dismissed the banner in the last 30 days
//   - Page is served over HTTP (push requires HTTPS)
// ========================================================================

(function() {
  'use strict';

  const CONFIG = {
    SHOW_AFTER_MS: 20000,              // wait 20s of engagement before showing
    DISMISS_COOLDOWN_DAYS: 30,         // don't re-show for 30 days after dismiss
    SUBSCRIBE_ENDPOINT: '/.netlify/functions/push-subscribe',
    CONFIG_ENDPOINT: '/.netlify/functions/push-config',
    SW_URL: '/sw-push.js',
    STORAGE_KEY: 'nui_push_state'      // { dismissed_at, subscribed }
  };

  // ---- Capability checks ----
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return;
  }
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    return;
  }
  if (Notification.permission === 'denied') {
    return;
  }

  // ---- State ----
  function getState() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
    } catch { return {}; }
  }
  function setState(patch) {
    try {
      const next = Object.assign({}, getState(), patch);
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  const state = getState();

  // Already subscribed? skip banner
  if (state.subscribed) return;

  // Recently dismissed? skip banner
  if (state.dismissed_at) {
    const age = Date.now() - state.dismissed_at;
    if (age < CONFIG.DISMISS_COOLDOWN_DAYS * 86400000) return;
  }

  // ---- Helpers ----
  function urlBase64ToUint8Array(base64) {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/mac/.test(ua)) return 'mac';
    if (/win/.test(ua)) return 'windows';
    return 'other';
  }

  // Infer interest tag from the current page path
  function detectInterest() {
    const p = location.pathname.toLowerCase();
    if (/brand|logo|identity/.test(p)) return 'branding';
    if (/web|site|digital-hq/.test(p)) return 'web';
    if (/sms|text|monty/.test(p)) return 'sms';
    if (/push|marketing|promotion/.test(p)) return 'marketing';
    if (/print|flyer|packaging/.test(p)) return 'print';
    if (/blog|magazine/.test(p)) return 'content';
    return 'general';
  }

  // ---- Banner UI ----
  function buildBanner() {
    const wrap = document.createElement('div');
    wrap.id = 'nui-push-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Enable notifications');
    wrap.innerHTML =
      '<style>' +
      '#nui-push-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:440px;' +
      'margin:0 auto;background:#0a0a0a;color:#fff;border:1px solid rgba(201,162,39,0.4);' +
      'border-radius:14px;padding:18px 20px;font-family:Inter,-apple-system,sans-serif;' +
      'box-shadow:0 20px 50px rgba(0,0,0,0.5);z-index:99998;' +
      'transform:translateY(120%);transition:transform .45s cubic-bezier(.22,1,.36,1);}' +
      '#nui-push-banner.show{transform:translateY(0);}' +
      '#nui-push-banner .np-row{display:flex;align-items:flex-start;gap:14px;}' +
      '#nui-push-banner .np-icon{flex:0 0 38px;width:38px;height:38px;border-radius:10px;' +
      'background:linear-gradient(135deg,#D90429,#C9A227);display:flex;align-items:center;' +
      'justify-content:center;font-size:20px;}' +
      '#nui-push-banner .np-body{flex:1;min-width:0;}' +
      '#nui-push-banner h3{margin:0 0 4px;font-size:15px;font-weight:800;letter-spacing:-.2px;}' +
      '#nui-push-banner p{margin:0;font-size:13px;line-height:1.45;color:#bbb;}' +
      '#nui-push-banner .np-actions{display:flex;gap:8px;margin-top:12px;}' +
      '#nui-push-banner button{flex:1;padding:10px 14px;border:none;border-radius:8px;' +
      'font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;}' +
      '#nui-push-banner .np-yes{background:#D90429;color:#fff;}' +
      '#nui-push-banner .np-yes:hover{background:#b8021f;}' +
      '#nui-push-banner .np-no{background:transparent;color:#888;border:1px solid #333;}' +
      '#nui-push-banner .np-no:hover{color:#fff;border-color:#555;}' +
      '#nui-push-banner .np-close{position:absolute;top:8px;right:10px;background:transparent;' +
      'border:none;color:#666;font-size:18px;cursor:pointer;padding:4px 8px;}' +
      '#nui-push-banner .np-close:hover{color:#fff;}' +
      '</style>' +
      '<button class="np-close" aria-label="Close">×</button>' +
      '<div class="np-row">' +
      '  <div class="np-icon">🔔</div>' +
      '  <div class="np-body">' +
      '    <h3>Stay connected with NUI</h3>' +
      '    <p>Get notified about new Detroit branding work, drops, and insider plays.</p>' +
      '    <div class="np-actions">' +
      '      <button class="np-yes">Turn On Updates</button>' +
      '      <button class="np-no">Not Now</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    return wrap;
  }

  function dismiss(banner) {
    setState({ dismissed_at: Date.now() });
    banner.classList.remove('show');
    setTimeout(function() { banner.remove(); }, 500);
  }

  // ---- Opt-in flow ----
  async function doSubscribe(banner) {
    try {
      // 1. Get VAPID public key from our Netlify function
      const cfgRes = await fetch(CONFIG.CONFIG_ENDPOINT);
      if (!cfgRes.ok) throw new Error('push-config unavailable');
      const { vapid_public_key } = await cfgRes.json();
      if (!vapid_public_key) throw new Error('VAPID public key missing');

      // 2. Request browser permission (triggers native prompt)
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        dismiss(banner);
        return;
      }

      // 3. Register service worker
      const reg = await navigator.serviceWorker.register(CONFIG.SW_URL);
      await navigator.serviceWorker.ready;

      // 4. Subscribe via pushManager
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid_public_key)
        });
      }

      // 5. Send subscription to our backend
      const payload = {
        subscription: sub.toJSON(),
        interests: [detectInterest()],
        user_agent: navigator.userAgent,
        platform: detectPlatform()
      };
      const res = await fetch(CONFIG.SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('push-subscribe failed: ' + res.status);

      // 6. Success — remember and fade banner with confirmation
      setState({ subscribed: true });
      const body = banner.querySelector('.np-body');
      if (body) {
        body.innerHTML = '<h3>You\u2019re in ✅</h3><p>You\u2019ll hear from us when it matters.</p>';
      }
      setTimeout(function() {
        banner.classList.remove('show');
        setTimeout(function() { banner.remove(); }, 500);
      }, 2200);
    } catch (err) {
      console.error('[push-opt-in]', err);
      dismiss(banner);
    }
  }

  // ---- Mount ----
  function mount() {
    const banner = buildBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(function() { banner.classList.add('show'); });

    banner.querySelector('.np-yes').addEventListener('click', function() { doSubscribe(banner); });
    banner.querySelector('.np-no').addEventListener('click', function() { dismiss(banner); });
    banner.querySelector('.np-close').addEventListener('click', function() { dismiss(banner); });
  }

  // Wait until page has been engaged with for SHOW_AFTER_MS,
  // unless ?push=1 or ?push_optin=1 is in the URL (re-invite link) —
  // in that case, fire the banner instantly.
  function schedule() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', schedule);
      return;
    }
    var params = new URLSearchParams(location.search);
    var reinvite = params.get('push') === '1' || params.get('push_optin') === '1';
    if (reinvite) {
      // Clear the dismiss cooldown on re-invite so the banner shows
      setState({ dismissed_at: 0 });
      setTimeout(mount, 300);
    } else {
      setTimeout(mount, CONFIG.SHOW_AFTER_MS);
    }
  }
  schedule();
})();
