// admin-login.js — NUI back office login.
// Email + password (Supabase Auth). Stays signed in on this device.
// After sign-in, /admin-session checks the person is an admin and returns the
// back-office key that every admin function already expects (X-Admin-Token).
// The old access-code box is still available behind a small link, as a backup.

(function () {
  'use strict';

  const SESSION_ENDPOINT = '/.netlify/functions/admin-session';
  const VERIFY_ENDPOINT = '/.netlify/functions/admin-verify';
  const STYLE_ID = 'nui-admin-login-style';
  // Same storage key as the portal's client (supabase-client.js), so ONE sign-in
  // is seen by both this gate and the portal dashboard behind it.
  const AUTH_STORAGE_KEY = 'nui-auth-token';

  // ── Supabase client: reuse the portal's client when it's ready ──
  let _sb = null;
  function sb() {
    if (_sb) return _sb;
    try { if (typeof db !== 'undefined' && db && db.auth) { _sb = db; return _sb; } } catch (e) { /* not loaded yet */ }
    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return null;
    _sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: { storageKey: AUTH_STORAGE_KEY, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return _sb;
  }

  // After signing in, reload once so the dashboard behind this screen picks up the sign-in.
  function openBackOffice(overlay) {
    setTimeout(() => {
      try { history.replaceState(null, '', window.location.pathname); } catch (_) {}
      window.location.reload();
    }, 450);
  }

  // Trade a signed-in session for the back-office key. Returns {ok, reason}.
  async function exchange(session) {
    if (!session || !session.access_token) return { ok: false, reason: 'no_session' };
    try {
      const r = await fetch(SESSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.ok && data.token) {
        window.NuiAdminAuth.setToken(data.token);
        return { ok: true, email: data.email };
      }
      return { ok: false, reason: data.reason || 'denied' };
    } catch (e) {
      return { ok: false, reason: 'network' };
    }
  }

  // Signed in already on this device? Unlock quietly, no screen.
  async function silentUnlock() {
    const client = sb();
    if (!client) return false;
    try {
      const { data } = await client.auth.getSession();
      if (!data || !data.session) return false;
      const res = await exchange(data.session);
      return res.ok;
    } catch (e) { return false; }
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
      .nui-hidden { display: none !important; }
    `;
    document.head.appendChild(s);
  }

  const REASONS = {
    not_admin: 'This account isn’t set up as an admin. Ask Faren to add it.',
    bad_session: 'Your sign-in expired. Please sign in again.',
    not_configured: 'The back office login isn’t switched on yet on the server.',
    lookup_failed: 'Couldn’t check admin access right now. Try again in a minute.',
    network: 'Can’t reach the server. Check your internet and try again.'
  };

  function close(overlay) {
    overlay.style.transition = 'opacity 0.25s';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 250);
  }

  // mode: 'signin' | 'reset' (set a new password after the email link)
  function render(mode) {
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

        <!-- Sign in -->
        <form id="nuiSignInForm" novalidate>
          <h1 class="nui-login-title" id="nuiLoginTitle">Sign in</h1>
          <p class="nui-login-subtitle">Use your New Urban Influence email and password. You’ll stay signed in on this device.</p>
          <div class="nui-login-field">
            <label class="nui-login-label" for="nuiLoginEmail">Email</label>
            <input id="nuiLoginEmail" class="nui-login-input" type="email" autocomplete="username" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="you@email.com" required />
          </div>
          <div class="nui-login-field">
            <label class="nui-login-label" for="nuiLoginPassword">Password</label>
            <input id="nuiLoginPassword" class="nui-login-input" type="password" autocomplete="current-password" placeholder="Your password" required />
          </div>
          <div id="nuiLoginMsg" class="nui-login-msg" role="status" aria-live="polite"></div>
          <button type="submit" id="nuiLoginSubmit" class="nui-login-submit">Sign in</button>
          <div class="nui-login-row">
            <button type="button" class="nui-login-link" id="nuiForgot">Forgot password?</button>
            <button type="button" class="nui-login-link" id="nuiUseCode">Use access code instead</button>
          </div>
        </form>

        <!-- Set new password (after reset email) -->
        <form id="nuiResetForm" class="nui-hidden" novalidate>
          <h1 class="nui-login-title">Set a new password</h1>
          <p class="nui-login-subtitle">Pick a password you’ll remember. At least 8 characters.</p>
          <div class="nui-login-field">
            <label class="nui-login-label" for="nuiNewPassword">New password</label>
            <input id="nuiNewPassword" class="nui-login-input" type="password" autocomplete="new-password" minlength="8" required />
          </div>
          <div id="nuiResetMsg" class="nui-login-msg" role="status" aria-live="polite"></div>
          <button type="submit" id="nuiResetSubmit" class="nui-login-submit">Save password and sign in</button>
        </form>

        <!-- Backup: old access code -->
        <form id="nuiCodeForm" class="nui-hidden" novalidate>
          <h1 class="nui-login-title">Access code</h1>
          <p class="nui-login-subtitle">Backup way in. Paste the 64-character admin code.</p>
          <div class="nui-login-field">
            <label class="nui-login-label" for="nuiLoginToken">Access code</label>
            <input id="nuiLoginToken" class="nui-login-input mono" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" />
          </div>
          <div id="nuiCodeMsg" class="nui-login-msg" role="status" aria-live="polite"></div>
          <button type="submit" id="nuiCodeSubmit" class="nui-login-submit">Unlock</button>
          <button type="button" class="nui-login-link" id="nuiBackToEmail">Back to email sign in</button>
        </form>

        <div class="nui-login-footer"><span style="font-size:13px;color:#d4d4d4">Secure sign in</span><a href="/">Back to site</a></div>
      </main>
    `;
    document.body.appendChild(overlay);

    const $ = (id) => document.getElementById(id);
    const card = $('nuiLoginCard');
    const forms = { signin: $('nuiSignInForm'), reset: $('nuiResetForm'), code: $('nuiCodeForm') };
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

    // ── Sign in with email + password ──
    forms.signin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('nuiLoginEmail').value.trim();
      const password = $('nuiLoginPassword').value;
      const m = $('nuiLoginMsg'), btn = $('nuiLoginSubmit');
      $('nuiLoginEmail').classList.toggle('error', !email);
      $('nuiLoginPassword').classList.toggle('error', !password);
      if (!email || !password) { msg(m, 'Enter your email and password.', 'error'); shake(); return; }
      const client = sb();
      if (!client) { msg(m, 'Login is still loading. Wait a second and try again.', 'error'); return; }

      busy(btn, true, 'Signing in...'); msg(m, '');
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        busy(btn, false, 'Sign in');
        $('nuiLoginPassword').classList.add('error');
        msg(m, 'That email and password don’t match. Try again, or tap “Forgot password?”', 'error');
        shake(); return;
      }
      const res = await exchange(data.session);
      if (!res.ok) {
        busy(btn, false, 'Sign in');
        if (res.reason === 'not_admin') { try { await client.auth.signOut(); } catch (_) {} }
        msg(m, REASONS[res.reason] || 'Couldn’t open the back office. Try again.', 'error');
        shake(); return;
      }
      btn.innerHTML = 'Signed in'; msg(m, 'Signed in. Opening your back office...', 'success');
      openBackOffice(overlay);
    });

    // ── Forgot password: send reset email ──
    $('nuiForgot').addEventListener('click', async () => {
      const email = $('nuiLoginEmail').value.trim();
      const m = $('nuiLoginMsg');
      if (!email) { $('nuiLoginEmail').classList.add('error'); msg(m, 'Type your email above first, then tap “Forgot password?” again.', 'error'); $('nuiLoginEmail').focus(); return; }
      const client = sb();
      if (!client) { msg(m, 'Login is still loading. Try again in a second.', 'error'); return; }
      msg(m, 'Sending reset email...');
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/app/' });
      if (error) { msg(m, 'Couldn’t send the email: ' + error.message, 'error'); return; }
      msg(m, 'Check your email for a link to set a new password.', 'success');
    });

    // ── Set new password (arrived from reset email) ──
    forms.reset.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = $('nuiNewPassword').value;
      const m = $('nuiResetMsg'), btn = $('nuiResetSubmit');
      if (!pw || pw.length < 8) { $('nuiNewPassword').classList.add('error'); msg(m, 'Use at least 8 characters.', 'error'); shake(); return; }
      const client = sb();
      busy(btn, true, 'Saving...');
      const { error } = await client.auth.updateUser({ password: pw });
      if (error) { busy(btn, false, 'Save password and sign in'); msg(m, 'Couldn’t save it: ' + error.message, 'error'); shake(); return; }
      const { data } = await client.auth.getSession();
      const res = await exchange(data && data.session);
      if (!res.ok) { busy(btn, false, 'Save password and sign in'); msg(m, 'Password saved. ' + (REASONS[res.reason] || 'Now sign in.'), 'error'); return; }
      btn.innerHTML = 'Saved'; msg(m, 'Password saved. Opening your back office...', 'success');
      try { history.replaceState(null, '', window.location.pathname); } catch (_) {}
      openBackOffice(overlay);
    });

    // ── Backup: access code ──
    $('nuiUseCode').addEventListener('click', () => showForm('code'));
    $('nuiBackToEmail').addEventListener('click', () => showForm('signin'));
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
          btn.innerHTML = 'Unlocked'; msg(m, 'Opening your back office...', 'success');
          setTimeout(() => close(overlay), 450);
          return;
        }
        msg(m, data.reason === 'wrong_length' ? 'That code is the wrong length. It should be 64 characters.' : 'That code doesn’t match. Double-check it.', 'error');
      } catch (err) { msg(m, REASONS.network, 'error'); }
      busy(btn, false, 'Unlock'); shake();
    });

    showForm(mode === 'reset' ? 'reset' : 'signin');
  }

  // Came back from the "reset password" email → show the new-password form.
  function watchRecovery() {
    const client = sb();
    if (!client) return;
    client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') render('reset');
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Public API
  // ═══════════════════════════════════════════════════════════════
  let _unlocking = null;
  window.NuiAdminLogin = {
    show() {
      // Try a quiet unlock first (already signed in on this device), then the screen.
      if (_unlocking) return;
      _unlocking = silentUnlock().then(ok => { _unlocking = null; if (!ok) render('signin'); });
    },
    async requireAuth() {
      watchRecovery();
      if (/type=recovery/.test(window.location.hash)) { render('reset'); return false; }

      if (window.NuiAdminAuth && window.NuiAdminAuth.isAuthenticated()) {
        const token = window.NuiAdminAuth.getToken();
        try {
          const r = await fetch(VERIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
          const data = await r.json();
          if (data.valid) return true;
          window.NuiAdminAuth.clear();
        } catch (e) {
          return true; // network blip — let normal 401 handling catch real problems
        }
      }
      if (await silentUnlock()) return true;
      render('signin');
      return false;
    }
  };

  if (window.NuiAdminAuth) {
    window.NuiAdminAuth.promptIfNeeded = () => { window.NuiAdminLogin.show(); return false; };
  }

  // Any admin endpoint says 401 → clear the key, try a quiet re-unlock, else show sign-in.
  const _origFetch = window.fetch;
  window.fetch = async function (url, options) {
    const res = await _origFetch.call(this, url, options);
    if (typeof url === 'string' && url.includes('/.netlify/functions/') && !url.includes('admin-session') && res.status === 401) {
      try {
        const txt = await res.clone().text();
        if (txt.includes('Unauthorized') || txt.includes('Missing authentication') || txt.includes('Invalid token')) {
          if (window.NuiAdminAuth) window.NuiAdminAuth.clear();
          if (!document.getElementById('nuiAdminLoginOverlay')) window.NuiAdminLogin.show();
        }
      } catch (e) { /* ignore */ }
    }
    return res;
  };
})();
