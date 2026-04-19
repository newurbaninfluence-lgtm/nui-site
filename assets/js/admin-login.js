// admin-login.js — Proper NUI-branded admin login gate
// Replaces the crappy browser prompt() with a real modal that validates on submit.
// Renders an overlay if no valid token in localStorage, blocks the entire admin UI.

(function () {
  'use strict';

  const VERIFY_ENDPOINT = '/.netlify/functions/admin-verify';
  const STYLE_ID = 'nui-admin-login-style';

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
        animation: nuiFadeIn 0.25s ease-out;
      }
      @keyframes nuiFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes nuiSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes nuiShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
      .nui-login-card {
        background: #0a0a0a;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 40px 36px 32px;
        max-width: 420px;
        width: calc(100% - 32px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(220,38,38,0.08);
        animation: nuiSlideUp 0.35s ease-out;
      }
      .nui-login-card.shake { animation: nuiShake 0.4s ease-in-out; }
      .nui-login-brand {
        display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
      }
      .nui-login-brand-dot {
        width: 8px; height: 8px; border-radius: 50%; background: #dc2626;
        box-shadow: 0 0 12px rgba(220,38,38,0.6);
        animation: nuiPulse 2s ease-in-out infinite;
      }
      @keyframes nuiPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      .nui-login-brand-text {
        font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
        color: rgba(255,255,255,0.5); font-weight: 700;
      }
      .nui-login-title {
        font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 6px 0;
        letter-spacing: -0.5px;
      }
      .nui-login-subtitle {
        font-size: 14px; color: rgba(255,255,255,0.55); margin: 0 0 28px 0;
        line-height: 1.5;
      }
      .nui-login-label {
        font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5);
        text-transform: uppercase; letter-spacing: 1px;
        display: block; margin-bottom: 8px;
      }
      .nui-login-input {
        width: 100%; box-sizing: border-box;
        padding: 14px 16px; font-size: 14px;
        background: #111; border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px; color: #fff;
        font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Mono', monospace;
        letter-spacing: 0.5px;
        outline: none; transition: border-color 0.15s;
      }
      .nui-login-input:focus {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
      }
      .nui-login-input.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
      }
      .nui-login-hint {
        font-size: 11px; color: rgba(255,255,255,0.35);
        margin-top: 6px; min-height: 16px;
      }
      .nui-login-hint.error { color: #ef4444; }
      .nui-login-hint.success { color: #10b981; }
      .nui-login-submit {
        width: 100%; margin-top: 20px; padding: 14px 20px;
        background: #dc2626; color: #fff; border: none;
        border-radius: 10px; font-size: 14px; font-weight: 700;
        cursor: pointer; font-family: inherit;
        transition: background 0.15s, transform 0.05s;
      }
      .nui-login-submit:hover:not(:disabled) { background: #b91c1c; }
      .nui-login-submit:active:not(:disabled) { transform: scale(0.98); }
      .nui-login-submit:disabled {
        background: #1c1c1c; color: rgba(255,255,255,0.3); cursor: not-allowed;
      }
      .nui-login-footer {
        margin-top: 24px; padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.06);
        display: flex; justify-content: space-between; align-items: center;
        font-size: 11px; color: rgba(255,255,255,0.35);
      }
      .nui-login-footer a {
        color: rgba(255,255,255,0.5); text-decoration: none;
      }
      .nui-login-footer a:hover { color: #dc2626; }
      .nui-login-spinner {
        display: inline-block; width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
        border-radius: 50%; animation: nuiSpin 0.6s linear infinite;
        margin-right: 8px; vertical-align: middle;
      }
      @keyframes nuiSpin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(s);
  }

  function render() {
    injectStyles();

    // Avoid double-mount
    if (document.getElementById('nuiAdminLoginOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'nuiAdminLoginOverlay';
    overlay.innerHTML = `
      <div class="nui-login-card" id="nuiLoginCard">
        <div class="nui-login-brand">
          <div class="nui-login-brand-dot"></div>
          <div class="nui-login-brand-text">NUI Admin</div>
        </div>
        <h1 class="nui-login-title">Secure Access</h1>
        <p class="nui-login-subtitle">Enter your admin access token to continue. Token is verified against the server before it's saved.</p>

        <label class="nui-login-label" for="nuiLoginToken">Access Token</label>
        <input
          id="nuiLoginToken"
          class="nui-login-input"
          type="password"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          placeholder="Paste your 64-character token"
        />
        <div id="nuiLoginHint" class="nui-login-hint">Contact the owner if you don't have one.</div>

        <button id="nuiLoginSubmit" class="nui-login-submit" disabled>Verify &amp; Sign In</button>

        <div class="nui-login-footer">
          <span>🔒 Encrypted · Client-verified</span>
          <a href="/" tabindex="-1">← Back to site</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('nuiLoginToken');
    const submit = document.getElementById('nuiLoginSubmit');
    const hint = document.getElementById('nuiLoginHint');
    const card = document.getElementById('nuiLoginCard');

    // Disable submit until input has content
    input.addEventListener('input', () => {
      input.classList.remove('error');
      hint.classList.remove('error');
      hint.textContent = "Contact the owner if you don't have one.";
      submit.disabled = input.value.trim().length === 0;
    });

    // Focus input
    setTimeout(() => input.focus(), 100);

    async function attemptLogin() {
      const token = input.value.trim();
      if (!token) return;

      submit.disabled = true;
      submit.innerHTML = '<span class="nui-login-spinner"></span>Verifying...';
      hint.classList.remove('error');
      hint.classList.add('');
      hint.textContent = 'Checking token...';

      try {
        const r = await fetch(VERIFY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await r.json();

        if (data.valid) {
          // Save + unmount
          window.NuiAdminAuth.setToken(token);
          hint.classList.add('success');
          hint.textContent = '✓ Access granted';
          submit.innerHTML = '✓ Signed in';
          setTimeout(() => {
            overlay.style.transition = 'opacity 0.25s';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 250);
          }, 400);
        } else {
          // Invalid — shake + error
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 400);
          input.classList.add('error');
          hint.classList.add('error');
          hint.textContent = data.reason === 'wrong_length'
            ? `Wrong length — token must be 64 characters.`
            : `Invalid token. Double-check and try again.`;
          submit.innerHTML = 'Verify & Sign In';
          submit.disabled = false;
          input.select();
        }
      } catch (err) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
        hint.classList.add('error');
        hint.textContent = 'Network error: ' + err.message;
        submit.innerHTML = 'Verify & Sign In';
        submit.disabled = false;
      }
    }

    submit.addEventListener('click', attemptLogin);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !submit.disabled) attemptLogin();
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Public API — replaces NuiAdminAuth.promptIfNeeded()
  // ═══════════════════════════════════════════════════════════════
  window.NuiAdminLogin = {
    show: render,
    async requireAuth() {
      if (window.NuiAdminAuth && window.NuiAdminAuth.isAuthenticated()) {
        // Quick silent re-verify in case localStorage was tampered with or server key rotated
        const token = window.NuiAdminAuth.getToken();
        try {
          const r = await fetch(VERIFY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const data = await r.json();
          if (data.valid) return true;
          // Token invalid — clear + show login
          window.NuiAdminAuth.clear();
          render();
          return false;
        } catch (e) {
          // Network error during silent check — assume OK and let normal flow catch 401s
          return true;
        }
      }
      render();
      return false;
    }
  };

  // Override the old prompt-based flow
  if (window.NuiAdminAuth) {
    window.NuiAdminAuth.promptIfNeeded = () => {
      render();
      return false;
    };
  }

  // Hook into 401 responses — if any admin endpoint returns 401, clear token + re-show login
  const _origFetch = window.fetch;
  window.fetch = async function (url, options) {
    const res = await _origFetch.call(this, url, options);
    if (typeof url === 'string' && url.includes('/.netlify/functions/') && res.status === 401) {
      try {
        const clone = res.clone();
        const txt = await clone.text();
        // Only trigger on admin-gated endpoints (not public ones)
        if (txt.includes('Unauthorized') || txt.includes('Missing authentication') || txt.includes('Invalid token')) {
          if (window.NuiAdminAuth) window.NuiAdminAuth.clear();
          if (!document.getElementById('nuiAdminLoginOverlay')) render();
        }
      } catch (e) { /* ignore */ }
    }
    return res;
  };

  console.log('✅ NUI Admin Login screen ready');
})();
