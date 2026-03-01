// ═══════════════════════════════════════════════════════════════
// NUI Admin Auth — Client-side token management
// Sends X-Admin-Token header with all admin API calls
// ═══════════════════════════════════════════════════════════════

const NuiAdminAuth = {
  _token: null,

  // Set token after admin login
  setToken(token) {
    this._token = token;
    try { sessionStorage.setItem('nui_admin_token', token); } catch(e) {}
  },

  getToken() {
    if (this._token) return this._token;
    try { this._token = sessionStorage.getItem('nui_admin_token'); } catch(e) {}
    return this._token;
  },

  clear() {
    this._token = null;
    try { sessionStorage.removeItem('nui_admin_token'); } catch(e) {}
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

    // If 401/403, clear token and prompt re-auth
    if (response.status === 401 || response.status === 403) {
      this.clear();
      alert('🔒 Authentication required. Please refresh and enter your admin token.');
      return response;
    }

    return response;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

window.NuiAdminAuth = NuiAdminAuth;
