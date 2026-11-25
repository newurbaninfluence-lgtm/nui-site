// admin-login.js — NUI back office sign-in.
// 4-digit PIN, checked on the server by /admin-pin (NUI only — does not use the
// shared Supabase sign-in that tenant apps like MAD use). A correct PIN returns the
// back-office key every admin function already expects (X-Admin-Token), and this
// device stays signed in. The old 64-character access code is kept as a backup.

(function () {
  'use strict';

  const PIN_ENDPOINT = '/.netlify/functions/admin-pin';
  const VERIFY_ENDPOINT = '/.netlify/functions/admin-verify';
  const STYLE_ID = 'nui-admin-login-style';
  const PIN_LENGTH = 4;
  const STAY_SIGNED_IN_DAYS = 30;

  // The dashboard behind this gate (portal.js) opens for a saved master-admin
  // session, so a correct PIN saves one and the dashboard never asks again.
  function rememberDashboardSession() {
    try {
      localStorage.setItem('nui_admin_session', JSON.stringify({
        isMasterAdmin: true,
        email: 'newurbaninfluence@gmail.com',
        name: 'Faren Young',
        expires: Date.now() + STAY_SIGNED_IN_DAYS * 24 * 60 * 60 * 1000
      }));
    } catch (e) { /* storage blocked — dashboard will ask, PIN still works */ }
  }
  function forgetDashboardSession() {
    try { localStorage.removeItem('nui_admin_session'); } catch (e) {}
  }

  function openBackOffice() {
    setTimeout(() => {
      try { history.replaceState(null, '', window.location.pathname); } catch (_) {}
      window.location.reload();
    }, 450);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      #nuiAdminLoginOverlay {
        position: fixed; inset: 0; z-index: 99999;
        background: radial-gradient(ellipse at top, #1a0a0a, #000);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        animation: nuiFadeIn 0.25s ease-out; overflow-y: auto; padding: 16px 0;
      }
      @keyframes nuiFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes nuiSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes nuiShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
      .nui-login-card {
        background: #0a0a0a; border: 1px solid rgba(255,255,255,0.10); border-radius: 18px;
        padding: 40px 36px 28px; max-width: 420px; width: calc(100% - 32px); box-sizing: border-box;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(220,38,38,0.08);
        animation: nuiSlideUp 0.35s ease-out;
      }
      .nui-login-card.shake { animation: nuiShake 0.4s ease-in-out; }
      .nui-login-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
      .nui-login-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #dc2626; box-shadow: 0 0 12px rgba(220,38,38,0.6); }
      .nui-login-brand-text { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #e5e5e5; font-weight: 700; }
      .nui-login-title { font-size: 28px; font-weight: 800; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.5px; }
      .nui-login-subtitle { font-size: 15px; color: #d4d4d4; margin: 0 0 26px 0; line-height: 1.5; }
      .nui-login-label { font-size: 13px; font-weight: 600; color: #f5f5f5; display: block; margin: 0 0 8px; }
      .nui-login-field { margin-bottom: 16px; }
      .nui-login-input {
        width: 100%; box-sizing: border-box; padding: 14px 16px; font-size: 16px;
        background: #141414; border: 1px solid rgba(255,255,255,0.22); border-radius: 10px; color: #fff;
        font-family: inherit; outline: none; transition: border-color 0.15s;
      }
      .nui-login-input.mono { font-family: ui-monospace, 'SF Mono', Monaco, monospace; letter-spacing: 0.5px; }
      .nui-login-input::placeholder { color: #9a9a9a; }
      .nui-login-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.2); }
      .nui-login-input.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
      .nui-login-msg { font-size: 14px; color: #d4d4d4; min-height: 20px; margin-top: 2px; line-height: 1.4; }
      .nui-login-msg.error { color: #f87171; }
      .nui-login-msg.success { color: #34d399; }
      .nui-login-submit {
        width: 100%; margin-top: 14px; padding: 15px 20px; min-height: 48px;
        background: #dc2626; color: #fff; border: none; border-radius: 10px;
        font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
        transition: background 0.15s, transform 0.05s;
      }
      .nui-login-submit:hover:not(:disabled) { background: #b91c1c; }
      .nui-login-submit:active:not(:disabled) { transform: scale(0.98); }
      .nui-login-submit:disabled { background: #2a2a2a; color: #a3a3a3; cursor: not-allowed; }
      .nui-login-link {
        background: none; border: none; padding: 10px 0; min-height: 44px; cursor: pointer;
        font: inherit; font-size: 14px; color: #f5f5f5; text-decoration: underline; text-underline-offset: 3px;
      }
      .nui-login-link:hover { color: #f87171; }
      .nui-login-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
      .nui-login-footer {
        margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);
        display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
      }
      .nui-login-footer a { color: #f5f5f5; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; min-height: 44px; }
      .nui-login-footer a:hover { color: #f87171; }
      .nui-login-spinner {
        display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25);
        border-top-color: #fff; border-radius: 50%; animation: nuiSpin 0.6s linear infinite;
        margin-right: 8px; vertical-align: middle;
      }
      @keyframes nuiSpin { to { transform: rotate(360deg); } }
      .nui-pin-input {
        width: 100%; box-sizing: border-box; padding: 16px; font-size: 32px; text-align: center;
        letter-spacing: 18px; text-indent: 18px; font-family: ui-monospace, 'SF Mono', Monaco, monospace;
        background: #141414; border: 1px solid rgba(255,255,255,0.22); border-radius: 12px; color: #fff; outline: none;
      }
      .nui-pin-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.2); }
      .nui-pin-input.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
      .nui-hidden { display: none !important; }
    `;
    document.head.appendChild(s);
  }

  function render() {
    injectStyles();
    const existing = document.getElementById('nuiAdminLoginOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'nuiAdminLoginOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'nuiLoginTitle');
    overlay.innerHTML = `
      <main class="nui-login-card" id="nuiLoginCard">
        <div class="nui-login-brand"><div class="nui-login-brand-dot" aria-hidden="true"></div><div class="nui-login-brand-text">NUI Back Office</div></div>

        <!-- PIN -->
        <form id="nuiPinForm" novalidate>
          <h1 class="nui-login-title" id="nuiLoginTitle">Enter your PIN</h1>
          <p class="nui-login-subtitle">4 digits. You’ll stay signed in on this device.</p>
          <div class="nui-login-field">
            <label class="nui-login-label" for="nuiPin">PIN</label>
            <input id="nuiPin" class="nui-pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="${PIN_LENGTH}" autocomplete="off" aria-describedby="nuiPinMsg" />
          </div>
          <div id="nuiPinMsg" class="nui-login-msg" role="status" aria-live="polite"></div>
          <button type="submit" id="nuiPinSubmit" class="nui-login-submit">Unlock</button>
          <div class="nui-login-row">
            <button type="button" class="nui-login-link" id="nuiUseCode">Use access code instead</button>
          </div>
        </form>

        <!-- Backup: access code -->
        <form id="nuiCodeForm" class="nui-hidden" novalidate>
          <h1 class="nui-login-title">Access code</h1>
          <p class="nui-login-subtitle">Backup way in. Paste the 64-character admin code.</p>
          <div class="nui-login-field">
            <label class="nui-login-label" for="nuiLoginToken">Access code</label>
            <input id="nuiLoginToken" class="nui-login-input mono" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" />
          </div>
          <div id="nuiCodeMsg" class="nui-login-msg" role="status" aria-live="polite"></div>
          <button type="submit" id="nuiCodeSubmit" class="nui-login-submit">Unlock</button>
          <button type="button" class="nui-login-link" id="nuiBackToPin">Back to PIN</button>
        </form>

        <div class="nui-login-footer"><span style="font-size:13px;color:#d4d4d4">Secure sign in</span><a href="/">Back to site</a></div>
      </main>
    `;
    document.body.appendChild(overlay);

    const $ = (id) => document.getElementById(id);
    const card = $('nuiLoginCard');
    const forms = { pin: $('nuiPinForm'), code: $('nuiCodeForm') };
    function showForm(name) {
      Object.keys(forms).forEach(k => forms[k].classList.toggle('nui-hidden', k !== name));
      const first = forms[name].querySelector('input');
      if (first) setTimeout(() => first.focus(), 50);
    }
    function msg(el, text, kind) {
      el.textContent = text || '';
      el.classList.remove('error', 'success');
      if (kind) el.classList.add(kind);
    }
    function shake() { card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 400); }
    function busy(btn, on, label) {
      btn.disabled = on;
      btn.innerHTML = on ? '<span class="nui-login-spinner"></span>' + label : label;
    }

    // ── PIN ──
    const pinInput = $('nuiPin');
    let sending = false;
    pinInput.addEventListener('input', () => {
      pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
      pinInput.classList.remove('error');
      if (pinInput.value.length === PIN_LENGTH) forms.pin.requestSubmit ? forms.pin.requestSubmit() : forms.pin.dispatchEvent(new Event('submit', { cancelable: true }));
    });
    forms.pin.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      const pin = pinInput.value;
      const m = $('nuiPinMsg'), btn = $('nuiPinSubmit');
      if (pin.length !== PIN_LENGTH) { pinInput.classList.add('error'); msg(m, 'Enter all 4 digits.', 'error'); shake(); return; }
      sending = true; busy(btn, true, 'Checking...'); msg(m, '');
      let data = {}, status = 0;
      try {
        const r = await fetch(PIN_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', pin }) });
        status = r.status; data = await r.json().catch(() => ({}));
      } catch (err) { data = { reason: 'network' }; }
      sending = false;

      if (data.ok && data.token) {
        window.NuiAdminAuth.setToken(data.token);
        rememberDashboardSession();
        btn.innerHTML = 'Unlocked'; msg(m, 'Unlocked. Opening your back office...', 'success');
        openBackOffice();
        return;
      }
      busy(btn, false, 'Unlock');
      pinInput.value = ''; pinInput.classList.add('error'); pinInput.focus();
      if (data.reason === 'wrong_pin') {
        msg(m, 'Wrong PIN.' + (data.triesLeft > 0 ? ' ' + data.triesLeft + (data.triesLeft === 1 ? ' try' : ' tries') + ' left before a short lock.' : ''), 'error');
      } else if (data.reason === 'locked') {
        msg(m, 'Too many wrong tries. Try again in ' + (data.minutes || 15) + ' minutes, or use the access code.', 'error');
      } else if (data.reason === 'network') {
        msg(m, 'Can’t reach the server. Check your internet and try again.', 'error');
      } else {
        msg(m, 'PIN sign-in isn’t working right now (' + (data.reason || status) + '). Use the access code instead.', 'error');
      }
      shake();
    });

    // ── Backup: access code ──
    $('nuiUseCode').addEventListener('click', () => showForm('code'));
    $('nuiBackToPin').addEventListener('click', () => showForm('pin'));
    forms.code.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = $('nuiLoginToken').value.trim();
      const m = $('nuiCodeMsg'), btn = $('nuiCodeSubmit');
      if (!token) { msg(m, 'Paste the access code first.', 'error'); return; }
      busy(btn, true, 'Checking...');
      try {
        const r = await fetch(VERIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await r.json();
        if (data.valid) {
          window.NuiAdminAuth.setToken(token);
          rememberDashboardSession();
          btn.innerHTML = 'Unlocked'; msg(m, 'Opening your back office...', 'success');
          openBackOffice();
          return;
        }
        msg(m, data.reason === 'wrong_length' ? 'That code is the wrong length. It should be 64 characters.' : 'That code doesn’t match. Double-check it.', 'error');
      } catch (err) { msg(m, 'Can’t reach the server. Check your internet and try again.', 'error'); }
      busy(btn, false, 'Unlock'); shake();
    });

    showForm('pin');
  }

  // ═══════════════════════════════════════════════════════════════
  // Public API
  // ═══════════════════════════════════════════════════════════════
  window.NuiAdminLogin = {
    show() {
      if (!document.getElementById('nuiAdminLoginOverlay')) render();
    },
    async requireAuth() {
      if (window.NuiAdminAuth && window.NuiAdminAuth.isAuthenticated()) {
        // Signed in on this device: keep the dashboard session fresh, then double-check the key.
        rememberDashboardSession();
        const token = window.NuiAdminAuth.getToken();
        try {
          const r = await fetch(VERIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
          const data = await r.json();
          if (data.valid) return true;
          window.NuiAdminAuth.clear();
          forgetDashboardSession();
        } catch (e) {
          return true; // network blip — normal 401 handling catches real problems
        }
      }
      render();
      return false;
    }
  };

  if (window.NuiAdminAuth) {
    window.NuiAdminAuth.promptIfNeeded = () => { window.NuiAdminLogin.show(); return false; };
  }

  // Any admin endpoint says 401 → clear the key and show the PIN screen.
  const _origFetch = window.fetch;
  window.fetch = async function (url, options) {
    const res = await _origFetch.call(this, url, options);
    if (typeof url === 'string' && url.includes('/.netlify/functions/') && !url.includes('admin-pin') && res.status === 401) {
      try {
        const txt = await res.clone().text();
        if (txt.includes('Unauthorized') || txt.includes('Missing authentication') || txt.includes('Invalid token')) {
          if (window.NuiAdminAuth) window.NuiAdminAuth.clear();
          forgetDashboardSession();
          if (!document.getElementById('nuiAdminLoginOverlay')) window.NuiAdminLogin.show();
        }
      } catch (e) { /* ignore */ }
    }
    return res;
  };
})();
