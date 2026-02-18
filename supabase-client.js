// NUI App - Supabase Client Integration
// This replaces localStorage with Supabase for production

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return window.SUPABASE_URL &&
         window.SUPABASE_ANON_KEY &&
         window.SUPABASE_ANON_KEY !== 'PASTE_YOUR_ANON_KEY_HERE' &&
         !window.SUPABASE_ANON_KEY.includes('PASTE');
};

// Initialize Supabase client only if configured
let db = null;

// Safari-safe storage wrapper (Safari private browsing throws on localStorage.setItem)
const _safeStorage = {
  _fallback: {},
  getItem: function(key) {
    try { return localStorage.getItem(key); }
    catch(e) { return this._fallback[key] || null; }
  },
  setItem: function(key, value) {
    try { localStorage.setItem(key, value); }
    catch(e) { this._fallback[key] = value; }
  },
  removeItem: function(key) {
    try { localStorage.removeItem(key); }
    catch(e) { delete this._fallback[key]; }
  }
};

// Initialize Supabase with explicit auth config for Safari compatibility
function _initSupabase() {
  if (db) return true;
  if (typeof supabase !== 'undefined' && isSupabaseConfigured()) {
    try {
      const { createClient } = supabase;
      db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: _safeStorage, // Safari-safe: handles private browsing + ITP
          storageKey: 'nui-auth-token',
          flowType: 'pkce'  // Safari-compatible auth flow
        }
      });
      console.log('✅ Supabase connected');
      return true;
    } catch(e) {
      console.warn('Supabase init error:', e.message);
      return false;
    }
  }
  return false;
}

// Try immediate init
if (!_initSupabase()) {
  console.warn('⚠️ Supabase not available yet - will retry on DOMContentLoaded');
}

// Retry on DOMContentLoaded (Safari: defer CDN scripts may load late)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (!db) {
      if (_initSupabase()) {
        console.log('✅ Supabase connected (deferred retry)');
        // Re-export after late init
        window.supabaseClient = db;
      } else {
        console.warn('⚠️ Supabase not configured - using demo mode with localStorage');
      }
    }
  });
} else if (!db) {
  console.warn('⚠️ Supabase not configured - using demo mode with localStorage');
}

// ========================================
// LOCALSTORAGE FALLBACK HELPERS
// ========================================
const LocalFallback = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(`nui_${key}`) || '[]');
    } catch { return []; }
  },
  set(key, data) {
    localStorage.setItem(`nui_${key}`, JSON.stringify(data));
  },
  generateId() {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};

// ========================================
// DATABASE OPERATIONS - With localStorage fallback
// ========================================

const NuiDB = {
  // ----------------------
  // CLIENTS
  // ----------------------
  clients: {
    async getAll() {
      if (!db) {
        return LocalFallback.get('clients');
      }
      const { data, error } = await db
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async getById(id) {
      if (!db) {
        const clients = LocalFallback.get('clients');
        return clients.find(c => c.id === id);
      }
      const { data, error } = await db
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async create(client) {
      if (!db) {
        const clients = LocalFallback.get('clients');
        const newClient = { ...client, id: LocalFallback.generateId(), created_at: new Date().toISOString() };
        clients.unshift(newClient);
        LocalFallback.set('clients', clients);
        return newClient;
      }
      const { data, error } = await db
        .from('clients')
        .insert(client)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      if (!db) {
        const clients = LocalFallback.get('clients');
        const idx = clients.findIndex(c => c.id === id);
        if (idx !== -1) {
          clients[idx] = { ...clients[idx], ...updates, updated_at: new Date().toISOString() };
          LocalFallback.set('clients', clients);
          return clients[idx];
        }
        return null;
      }
      const { data, error } = await db
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      if (!db) {
        const clients = LocalFallback.get('clients').filter(c => c.id !== id);
        LocalFallback.set('clients', clients);
        return;
      }
      const { error } = await db
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // ----------------------
  // PROJECTS
  // ----------------------
  projects: {
    async getAll() {
      if (!db) return LocalFallback.get('projects');
      const { data, error } = await db
        .from('projects')
        .select('*, clients(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async getByClient(clientId) {
      if (!db) return LocalFallback.get('projects').filter(p => p.client_id === clientId);
      const { data, error } = await db
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(project) {
      if (!db) {
        const projects = LocalFallback.get('projects');
        const newProject = { ...project, id: LocalFallback.generateId(), created_at: new Date().toISOString() };
        projects.unshift(newProject);
        LocalFallback.set('projects', projects);
        return newProject;
      }
      const { data, error } = await db
        .from('projects')
        .insert(project)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      if (!db) {
        const projects = LocalFallback.get('projects');
        const idx = projects.findIndex(p => p.id === id);
        if (idx !== -1) {
          projects[idx] = { ...projects[idx], ...updates, updated_at: new Date().toISOString() };
          LocalFallback.set('projects', projects);
          return projects[idx];
        }
        return null;
      }
      const { data, error } = await db
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      if (!db) {
        LocalFallback.set('projects', LocalFallback.get('projects').filter(p => p.id !== id));
        return;
      }
      const { error } = await db
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // ----------------------
  // ORDERS
  // ----------------------
  orders: {
    async getAll() {
      if (!db) return LocalFallback.get('orders');
      const { data, error } = await db
        .from('orders')
        .select('*, clients(name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(order) {
      const { data, error } = await db
        .from('orders')
        .insert(order)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await db
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // INVOICES
  // ----------------------
  invoices: {
    async getAll() {
      if (!db) return LocalFallback.get('invoices');
      const { data, error } = await db
        .from('invoices')
        .select('*, clients(name, email), projects(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(invoice) {
      const { data, error } = await db
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await db
        .from('invoices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // PAYMENTS
  // ----------------------
  payments: {
    async getAll() {
      if (!db) return LocalFallback.get('payments');
      const { data, error } = await db
        .from('payments')
        .select('*, clients(name), invoices(invoice_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(payment) {
      const { data, error } = await db
        .from('payments')
        .insert(payment)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // SERVICES
  // ----------------------
  services: {
    async getAll() {
      if (!db) return LocalFallback.get('services');
      const { data, error } = await db
        .from('services')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async create(service) {
      const { data, error } = await db
        .from('services')
        .insert(service)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await db
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // PROOFS
  // ----------------------
  proofs: {
    async getByProject(projectId) {
      if (!db) return LocalFallback.get('proofs').filter(p => p.project_id === projectId);
      const { data, error } = await db
        .from('proofs')
        .select('*')
        .eq('project_id', projectId)
        .order('version', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(proof) {
      const { data, error } = await db
        .from('proofs')
        .insert(proof)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async approve(id, feedback) {
      const { data, error } = await db
        .from('proofs')
        .update({
          status: 'approved',
          client_feedback: feedback,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // COMMUNICATIONS (CRM)
  // ----------------------
  communications: {
    async getAll() {
      if (!db) return LocalFallback.get('communications');
      const { data, error } = await db
        .from('communications')
        .select('*, clients(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },

    async getByClient(clientId) {
      const { data, error } = await db
        .from('communications')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async getUnread() {
      if (!db) return LocalFallback.get('communications').filter(c => !c.read && c.direction === 'inbound');
      const { data, error } = await db
        .from('communications')
        .select('*, clients(name)')
        .eq('read', false)
        .eq('direction', 'inbound')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async markAsRead(id) {
      if (!db) return;
      const { error } = await db
        .from('communications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    }
  },

  // ----------------------
  // CRM CONTACTS
  // ----------------------
  contacts: {
    async getAll() {
      if (!db) return LocalFallback.get('crm_contacts');
      const { data, error } = await db
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(contact) {
      const { data, error } = await db
        .from('crm_contacts')
        .insert(contact)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await db
        .from('crm_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // SMART GROUPS
  // ----------------------
  smartGroups: {
    async getAll() {
      if (!db) return LocalFallback.get('smart_groups');
      const { data, error } = await db
        .from('smart_groups')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async create(group) {
      const { data, error } = await db
        .from('smart_groups')
        .insert(group)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getMembers(groupId) {
      const { data: group } = await db
        .from('smart_groups')
        .select('filters')
        .eq('id', groupId)
        .single();

      if (!group) return [];

      // Apply filters to get matching contacts
      let query = db.from('crm_contacts').select('*');

      const filters = group.filters;
      if (filters.tags?.length) {
        query = query.contains('tags', filters.tags);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  },

  // ----------------------
  // EMAIL CAMPAIGNS
  // ----------------------
  campaigns: {
    async getAll() {
      if (!db) return LocalFallback.get('email_campaigns');
      const { data, error } = await db
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(campaign) {
      const { data, error } = await db
        .from('email_campaigns')
        .insert(campaign)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await db
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ----------------------
  // INTEGRATIONS STATUS
  // ----------------------
  integrations: {
    async getAll() {
      if (!db) return LocalFallback.get('integrations');
      const { data, error } = await db
        .from('integrations')
        .select('*');
      if (error) throw error;
      return data || [];
    },

    async getByPlatform(platform) {
      const { data, error } = await db
        .from('integrations')
        .select('*')
        .eq('platform', platform)
        .single();
      return data; // May be null if not connected
    },

    async disconnect(platform) {
      const { error } = await db
        .from('integrations')
        .update({
          connected: false,
          access_token: null,
          refresh_token: null
        })
        .eq('platform', platform);
      if (error) throw error;
    }
  }
};

// ========================================
// FILE STORAGE
// ========================================

const NuiStorage = {
  async uploadProof(file, projectId) {
    if (!db) {
      console.warn('Storage not available - Supabase not configured');
      return URL.createObjectURL(file); // Return local blob URL for demo
    }
    const fileName = `${projectId}/${Date.now()}-${file.name}`;
    const { data, error } = await db.storage
      .from('proofs')
      .upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = db.storage
      .from('proofs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async uploadAsset(file, clientId, type) {
    if (!db) {
      console.warn('Storage not available - Supabase not configured');
      return URL.createObjectURL(file);
    }
    const fileName = `${clientId}/${type}/${Date.now()}-${file.name}`;
    const { data, error } = await db.storage
      .from('assets')
      .upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = db.storage
      .from('assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async uploadInvoice(file, invoiceId) {
    if (!db) {
      console.warn('Storage not available - Supabase not configured');
      return URL.createObjectURL(file);
    }
    const fileName = `${invoiceId}/${file.name}`;
    const { data, error } = await db.storage
      .from('invoices')
      .upload(fileName, file);
    if (error) throw error;

    // Private bucket - get signed URL
    const { data: urlData } = await db.storage
      .from('invoices')
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    return urlData.signedUrl;
  },

  async deleteFile(bucket, path) {
    if (!db) {
      console.warn('Storage not available - Supabase not configured');
      return;
    }
    const { error } = await db.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  }
};

// ========================================
// API CALLS - Netlify Functions
// ========================================

const NuiAPI = {
  // Send SMS via OpenPhone
  async sendSMS(to, message, clientId = null) {
    const response = await fetch('/.netlify/functions/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message, clientId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Send Email via SendGrid
  async sendEmail(to, subject, html, text = '', clientId = null, templateId = null, dynamicData = null) {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text, clientId, templateId, dynamicData })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Create Stripe Payment
  async createPayment(invoiceId, amount, clientId, clientEmail, description) {
    const response = await fetch('/.netlify/functions/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, amount, clientId, clientEmail, description })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Start Social Media OAuth
  startOAuth(platform) {
    let authUrl;
    const redirectUri = encodeURIComponent(`${window.location.origin}/.netlify/functions/oauth-callback?platform=${platform}`);

    switch (platform) {
      case 'instagram':
        authUrl = `https://api.instagram.com/oauth/authorize?client_id=${window.INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
        break;
      case 'facebook':
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${window.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement&response_type=code`;
        break;
      case 'linkedin':
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${window.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20w_member_social&response_type=code`;
        break;
      default:
        throw new Error('Unknown platform');
    }

    window.location.href = authUrl;
  }
};

// ========================================
// REAL-TIME SUBSCRIPTIONS
// ========================================

const NuiRealtime = {
  subscriptions: [],

  // Subscribe to new messages
  onNewMessage(callback) {
    if (!db) {
      console.warn('Realtime not available - Supabase not configured');
      return null;
    }
    const subscription = db
      .channel('communications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'communications',
        filter: 'direction=eq.inbound'
      }, payload => {
        callback(payload.new);
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  },

  // Subscribe to payment updates
  onPaymentUpdate(callback) {
    if (!db) {
      console.warn('Realtime not available - Supabase not configured');
      return null;
    }
    const subscription = db
      .channel('payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments'
      }, payload => {
        callback(payload);
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  },

  // Subscribe to project updates
  onProjectUpdate(callback) {
    if (!db) {
      console.warn('Realtime not available - Supabase not configured');
      return null;
    }
    const subscription = db
      .channel('projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, payload => {
        callback(payload);
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  },

  // Unsubscribe all
  unsubscribeAll() {
    this.subscriptions.forEach(sub => {
      if (sub) sub.unsubscribe();
    });
    this.subscriptions = [];
  }
};

// ========================================
// DASHBOARD STATS
// ========================================

const NuiStats = {
  async getDashboardStats() {
    const [clients, projects, invoices, payments, communications] = await Promise.all([
      NuiDB.clients.getAll(),
      NuiDB.projects.getAll(),
      NuiDB.invoices.getAll(),
      NuiDB.payments.getAll(),
      NuiDB.communications.getUnread()
    ]);

    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent');
    const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const monthlyRevenue = payments
      .filter(p => {
        const paymentDate = new Date(p.created_at);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() &&
               paymentDate.getFullYear() === now.getFullYear() &&
               p.status === 'completed';
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalClients: clients.length,
      activeProjects,
      pendingInvoices: pendingInvoices.length,
      totalPendingAmount,
      monthlyRevenue,
      unreadMessages: communications.length,
      recentClients: clients.slice(0, 5),
      recentProjects: projects.slice(0, 5)
    };
  }
};

// ========================================
// AUTHENTICATION - Supabase Auth
// ========================================

const NuiAuth = {
  // Sign in with email/password
  async signIn(email, password) {
    if (!db) {
      console.warn('Supabase not configured - using local fallback auth');
      return { user: null, session: null, fallback: true };
    }
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.log('✅ Supabase Auth: Sign in successful for', email);
    return data;
  },

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    if (!db) throw new Error('Supabase not configured');
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    console.log('✅ Supabase Auth: Sign up successful for', email);
    return data;
  },

  // Sign out
  async signOut() {
    if (!db) {
      console.warn('Supabase not configured - clearing local session');
      localStorage.removeItem('nui_session');
      return;
    }
    const { error } = await db.auth.signOut();
    if (error) throw error;
    console.log('✅ Supabase Auth: Signed out');
  },

  // Get current session
  async getSession() {
    if (!db) return null;
    const { data: { session }, error } = await db.auth.getSession();
    if (error) {
      console.warn('Session check error:', error.message);
      return null;
    }
    return session;
  },

  // Get current user
  async getUser() {
    if (!db) return null;
    const { data: { user }, error } = await db.auth.getUser();
    if (error) return null;
    return user;
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    if (!db) return { data: { subscription: { unsubscribe: () => {} } } };
    return db.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      callback(event, session);
    });
  },

  // Reset password
  async resetPassword(email) {
    if (!db) throw new Error('Supabase not configured');
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    console.log('✅ Password reset email sent to', email);
  },

  // Google OAuth sign-in via Supabase
  async signInWithGoogle() {
    if (!db) throw new Error('Supabase not configured');
    const { data, error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  // Determine user role after authentication
  // Checks user_metadata first, then looks up in tables
  async getUserRole(authUser) {
    if (!authUser) return null;
    const email = authUser.email.toLowerCase();

    // 1. Check user_metadata for role
    const metaRole = authUser.user_metadata?.role;
    if (metaRole) {
      return { role: metaRole, data: authUser.user_metadata };
    }

    // 2. Check clients table
    if (db) {
      try {
        const { data: client } = await db
          .from('clients')
          .select('*')
          .ilike('email', email)
          .maybeSingle();
        if (client) return { role: 'client', data: client };
      } catch (e) {
        console.warn('Client lookup error:', e.message);
      }
    }

    // 3. Default to client role
    return { role: 'client', data: { email, name: authUser.user_metadata?.name || email.split('@')[0] } };
  },

  // Check if Supabase Auth is available (retries init for Safari late-loading)
  isAvailable() {
    if (!db && typeof _initSupabase === 'function') _initSupabase();
    return !!db;
  }
};

// ========================================
// PORTFOLIO CLOUD SYNC
// Syncs portfolio data + images to Supabase Storage
// so changes on desktop appear on all devices
// ========================================

const NuiPortfolioSync = {
  BUCKET: 'assets',
  DATA_PATH: 'portfolio/data.json',
  IMG_PREFIX: 'portfolio/images/',
  _syncing: false,

  // Upload portfolio image to Supabase Storage, return public URL
  async uploadImage(file, itemId, slot) {
    if (!db) return null;
    try {
      const ext = file.name ? file.name.split('.').pop() : 'png';
      const fileName = `${this.IMG_PREFIX}${itemId}/${slot}-${Date.now()}.${ext}`;
      const { error } = await db.storage.from(this.BUCKET).upload(fileName, file, { upsert: true });
      if (error) { console.warn('Portfolio image upload error:', error.message); return null; }
      const { data: urlData } = db.storage.from(this.BUCKET).getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch(e) { console.warn('Portfolio image upload failed:', e); return null; }
  },

  // Upload a base64 or blob image string to storage
  async uploadBase64(dataUrl, itemId, slot) {
    if (!db || !dataUrl) return null;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const ext = blob.type.split('/')[1] || 'png';
      const fileName = `${this.IMG_PREFIX}${itemId}/${slot}-${Date.now()}.${ext}`;
      const { error } = await db.storage.from(this.BUCKET).upload(fileName, blob, { upsert: true, contentType: blob.type });
      if (error) { console.warn('Portfolio base64 upload error:', error.message); return null; }
      const { data: urlData } = db.storage.from(this.BUCKET).getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch(e) { console.warn('Portfolio base64 upload failed:', e); return null; }
  },

  // Save portfolio data JSON to Supabase Storage
  async save(portfolioArray) {
    if (!db || this._syncing) return;
    this._syncing = true;
    try {
      // Process images: convert idb:// and data: refs to public URLs
      const cleanData = JSON.parse(JSON.stringify(portfolioArray));
      for (const item of cleanData) {
        // Main hero image
        item.img = await this._resolveImageUrl(item.img, item.id, 'hero');
        // Asset images
        if (item.assets) {
          item.assets.primaryLogo = await this._resolveImageUrl(item.assets.primaryLogo, item.id, 'primary');
          item.assets.secondaryLogo = await this._resolveImageUrl(item.assets.secondaryLogo, item.id, 'secondary');
          item.assets.iconMark = await this._resolveImageUrl(item.assets.iconMark, item.id, 'icon');
          if (item.assets.mockups && item.assets.mockups.length) {
            for (let i = 0; i < item.assets.mockups.length; i++) {
              item.assets.mockups[i] = await this._resolveImageUrl(item.assets.mockups[i], item.id, 'mockup-' + i);
            }
          }
        }
      }
      // Upload JSON
      const blob = new Blob([JSON.stringify(cleanData)], { type: 'application/json' });
      const { error } = await db.storage.from(this.BUCKET).upload(this.DATA_PATH, blob, { upsert: true, contentType: 'application/json' });
      if (error) console.warn('Portfolio sync save error:', error.message);
      else console.log('✅ Portfolio synced to cloud');
    } catch(e) { console.warn('Portfolio sync failed:', e); }
    this._syncing = false;
  },

  // Load portfolio data from Supabase Storage
  async load() {
    if (!db) return null;
    try {
      const { data: urlData } = db.storage.from(this.BUCKET).getPublicUrl(this.DATA_PATH);
      const resp = await fetch(urlData.publicUrl + '?t=' + Date.now()); // Cache bust
      if (!resp.ok) return null;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Portfolio loaded from cloud (' + data.length + ' items)');
        return data;
      }
      return null;
    } catch(e) { return null; }
  },

  // Helper: resolve an image reference to a public URL
  async _resolveImageUrl(ref, itemId, slot) {
    if (!ref) return ref;
    // Already a public URL — keep it
    if (ref.startsWith('http://') || ref.startsWith('https://')) return ref;
    // base64 data URL — upload to storage
    if (ref.startsWith('data:')) {
      const url = await this.uploadBase64(ref, itemId, slot);
      return url || ref;
    }
    // idb:// reference — resolve from IndexedDB then upload
    if (ref.startsWith('idb://') && typeof NuiImageStore !== 'undefined') {
      try {
        const data = await NuiImageStore.resolve(ref);
        if (data && !data.startsWith('idb://')) {
          const url = await this.uploadBase64(data, itemId, slot);
          return url || '';  // If upload fails, return empty — don't keep broken idb:// ref in cloud
        }
      } catch(e) {}
      // idb:// could not be resolved — strip it so cloud data stays clean
      return '';
    }
    // Unknown ref format — strip it
    if (ref === '[too-large]') return '';
    return ref;
  }
};

// Export for use in main app
window.NuiDB = NuiDB;
window.NuiStorage = NuiStorage;
window.NuiAPI = NuiAPI;
window.NuiRealtime = NuiRealtime;
window.NuiStats = NuiStats;
window.NuiAuth = NuiAuth;
window.NuiPortfolioSync = NuiPortfolioSync;
window.supabaseClient = db;

console.log('NUI Supabase Client loaded successfully');
console.log('Supabase Auth available:', NuiAuth.isAvailable());
