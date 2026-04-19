// ═══════════════════════════════════════════════════════════════
// NUI Admin Auth — Client-side token management
// Sends X-Admin-Token header with all admin API calls
// ═══════════════════════════════════════════════════════════════

const NuiAdminAuth = {
  _token: null,

  // Set token after admin login
  setToken(token) {
    this._token = token;
    try { localStorage.setItem('nui_admin_token', token); } catch(e) {}
  },

  getToken() {
    if (this._token) return this._token;
    try { this._token = localStorage.getItem('nui_admin_token'); } catch(e) {}
    return this._token;
  },

  clear() {
    this._token = null;
    try { localStorage.removeItem('nui_admin_token'); } catch(e) {}
  },

  // Prompt for token if not set
  promptIfNeeded() {
    if (this.getToken()) return true;
    const token = prompt('🔒 Enter admin access token:');
    if (token && token.trim()) {
      this.setToken(token.trim());
      return true;
    }
    return false;
  },

  // Authenticated fetch wrapper for admin endpoints
  async adminFetch(url, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Add token if available (soft rollout: works without token too)
    if (token) {
      headers['X-Admin-Token'] = token;
    }

    const response = await fetch(url, { ...options, headers });

    // If 401/403, clear token — admin-login.js will intercept and re-show the login screen
    if (response.status === 401 || response.status === 403) {
      this.clear();
      if (window.NuiAdminLogin && typeof window.NuiAdminLogin.show === 'function') {
        window.NuiAdminLogin.show();
      }
      return response;
    }

    return response;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

window.NuiAdminAuth = NuiAdminAuth;

// ═══════════════════════════════════════════════════════════════
// AUTO-INTERCEPTOR: Patches global fetch to add admin token
// to ALL requests to /.netlify/functions/ endpoints
// This means existing admin code doesn't need to be modified
// ═══════════════════════════════════════════════════════════════
(function() {
  const _originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Only intercept calls to our Netlify functions
    if (typeof url === 'string' && url.includes('/.netlify/functions/')) {
      const token = NuiAdminAuth.getToken();
      if (token) {
        options = options || {};
        options.headers = options.headers || {};
        // Don't overwrite if already set
        if (!options.headers['X-Admin-Token'] && !options.headers['x-admin-token']) {
          options.headers['X-Admin-Token'] = token;
        }
      }
    }
    return _originalFetch.call(this, url, options);
  };
})();
