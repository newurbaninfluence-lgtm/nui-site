// ═══════════════════════════════════════════════════════════════
// NUI Admin Auth — Client-side token management
// Sends X-Admin-Token header with all admin API calls
// ═══════════════════════════════════════════════════════════════

const NuiAdminAuth = {
  _token: null,

  // Set token after admin login
  setToken(token) {
    this._token = token;
    // Store in sessionStorage (cleared when tab closes, NOT localStorage)
    try { sessionStorage.setItem('nui_admin_token', token); } catch(e) {}
  },

  // Get token
  getToken() {
    if (this._token) return this._token;
    try { this._token = sessionStorage.getItem('nui_admin_token'); } catch(e) {}
    return this._token;
  },

  // Clear token on logout
  clear() {
    this._token = null;
    try { sessionStorage.removeItem('nui_admin_token'); } catch(e) {}
  },

  // Authenticated fetch wrapper for admin endpoints
  async adminFetch(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated. Please enter admin token.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
      ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });

    // If 401/403, clear token and prompt re-auth
    if (response.status === 401 || response.status === 403) {
      this.clear();
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Authentication failed. Please re-enter admin token.');
    }

    return response;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
};

// Make globally available
window.NuiAdminAuth = NuiAdminAuth;
