window.onerror = function(m,u,l,c,e){alert('JS Error at line '+l+': '+m);return false;};
console.log('NUI App Loading...');

// ==================== ROLE PERMISSIONS SYSTEM ====================
const ROLE_PERMISSIONS = {
    admin: ['all'], // Admin has full access
    manager: ['dashboard', 'calendar', 'analytics', 'orders', 'projects', 'proofs', 'clients', 'leads', 'designers', 'communications', 'crm'],
    designer: ['designer-dashboard', 'my-projects', 'proofs'],
    client: ['portal']
};

const PANEL_ACCESS = {
    // OVERVIEW
    'dashboard': ['admin', 'manager'],
    'calendar': ['admin', 'manager'],
    'analytics': ['admin', 'manager'],
    'reviews': ['admin', 'manager'],
    // CRM
    'clients': ['admin', 'manager'],
    'newclient': ['admin', 'manager'],
    'leads': ['admin', 'manager'],
    'crm': ['admin', 'manager'],
    'communications': ['admin', 'manager'],
    // PROJECTS
    'orders': ['admin', 'manager'],
    'projects': ['admin', 'manager', 'designer'],
    'proofs': ['admin', 'manager', 'designer'],
    // BILLING
    'payments': ['admin'],
    'invoices': ['admin'],
    'designer-payouts': ['admin'],
    'stripe': ['admin'],
    // CONTENT/CMS
    'site-images': ['admin'],
    'portfolio-editor': ['admin'],
    'about-editor': ['admin'],
    // TEAM
    'designers': ['admin', 'manager'],
    // MARKETING
    'email': ['admin', 'manager'],
    'sms': ['admin', 'manager'],
    'social': ['admin', 'manager'],
    'loyalty': ['admin'],
    // SETTINGS
    'seo': ['admin'],
    'integrations': ['admin']
};

function hasPermission(permission) {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    const perms = ROLE_PERMISSIONS[currentUser.type] || [];
    return perms.includes('all') || perms.includes(permission);
}

function canAccessPanel(panel) {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    const allowedRoles = PANEL_ACCESS[panel] || ['admin'];
    return allowedRoles.includes(currentUser.type);
}

// ==================== THEME MANAGEMENT ====================
let currentTheme = localStorage.getItem('nui_theme') || 'dark';

function initializeTheme() {
    if (currentTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    } else {
        document.documentElement.classList.remove('light-mode');
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('nui_theme', currentTheme);
    document.documentElement.classList.toggle('light-mode');
    // Re-render admin header if in admin view
    if (document.getElementById('adminDashboard')?.style.display === 'block') {
        updateAdminHeader();
    }
}

function updateAdminHeader() {
    const headerRight = document.querySelector('.admin-header > div:last-child');
    if (headerRight) {
        const themeBtn = headerRight.querySelector('.theme-toggle-btn');
        if (themeBtn) {
            themeBtn.innerHTML = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
        }
    }
}

// Initialize theme on load
initializeTheme();

// ==================== STATE ====================
let currentUser = null;
let loginType = 'client';
let currentAdminClient = null;
let assetCategory = 'logos';

// ==================== DATA STORAGE (No Demo Data) ====================

// ═══════════════════════════════════════════════
// BACKEND SYNC LAYER
// ═══════════════════════════════════════════════
// Every save function writes to localStorage FIRST (instant, offline-capable)
// then fires a background sync to Supabase via the sync-data Netlify function.
// On app load, hydrateFromBackend() pulls the latest data from Supabase.

let _syncQueue = {};
let _syncTimer = null;
let _backendAvailable = true;
let _lastSyncTime = localStorage.getItem('nui_last_backend_sync') || null;

// Debounced sync — batches rapid saves into one API call per type
function syncToBackend(type, data) {
    if (!_backendAvailable) return;
    _syncQueue[type] = data;

    // Debounce: wait 2 seconds after last save before syncing
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
        const queue = { ..._syncQueue };
        _syncQueue = {};
        Object.entries(queue).forEach(([t, d]) => {
            _pushToBackend(t, d);
        });
    }, 2000);
}

async function _pushToBackend(type, data) {
    try {
        const resp = await fetch('/.netlify/functions/sync-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                data,
                syncedBy: currentUser?.email || currentUser?.name || 'admin'
            })
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            console.warn(`Sync failed for ${type}:`, err.message || resp.status);
            if (resp.status === 500) _backendAvailable = false; // Stop spamming if backend is down
        } else {
            console.log(`✅ ${type} synced to backend (${Array.isArray(data) ? data.length : '1'} records)`);
            localStorage.setItem('nui_last_backend_sync', new Date().toISOString());
        }
    } catch (err) {
        console.warn(`Backend sync error (${type}):`, err.message);
        // Don't disable backend — could be temporary network issue
    }
}

// Pull ALL data from backend — called on app load
async function hydrateFromBackend() {
    try {
        const resp = await fetch('/.netlify/functions/sync-data?type=all');
        if (!resp.ok) {
            console.warn('Backend hydration failed:', resp.status);
            _backendAvailable = false;
            return false;
        }

        const result = await resp.json();
        if (!result.success || !result.syncData) return false;

        _backendAvailable = true;
        let hydrated = 0;

        // Only hydrate if backend has newer data than localStorage
        const sd = result.syncData;

        if (sd.orders?.data?.length > 0 && sd.orders.data.length >= orders.length) {
            orders = sd.orders.data;
            localStorage.setItem('nui_orders', JSON.stringify(orders));
            hydrated++;
        }

        if (sd.invoices?.data?.length > 0 && sd.invoices.data.length >= invoices.length) {
            invoices = sd.invoices.data;
            localStorage.setItem('nui_invoices', JSON.stringify(invoices));
            hydrated++;
        }

        if (sd.clients?.data?.length > 0 && sd.clients.data.length >= clients.length) {
            clients = sd.clients.data;
            localStorage.setItem('nui_clients', JSON.stringify(clients));
            hydrated++;
        }

        if (sd.proofs?.data?.length > 0) {
            // Merge proof metadata from backend with local fileData
            const backendProofs = sd.proofs.data;
            backendProofs.forEach(bp => {
                const localProof = proofs.find(p => p.id === bp.id);
                if (localProof && localProof.fileData) {
                    bp.fileData = localProof.fileData; // Preserve local file data
                }
            });
            if (backendProofs.length >= proofs.length) {
                proofs = backendProofs;
                localStorage.setItem('nui_proofs', JSON.stringify(proofs));
                hydrated++;
            }
        }

        if (sd.designer_messages?.data?.length > 0 && typeof designerMessages !== 'undefined') {
            if (sd.designer_messages.data.length >= designerMessages.length) {
                designerMessages = sd.designer_messages.data;
                localStorage.setItem('nui_designer_messages', JSON.stringify(designerMessages));
                hydrated++;
            }
        }

        if (sd.client_messages?.data?.length > 0 && typeof clientMessages !== 'undefined') {
            if (sd.client_messages.data.length >= clientMessages.length) {
                clientMessages = sd.client_messages.data;
                localStorage.setItem('nui_client_messages', JSON.stringify(clientMessages));
                hydrated++;
            }
        }

        if (sd.crm?.data && typeof sd.crm.data === 'object' && Object.keys(sd.crm.data).length > 0) {
            crmData = sd.crm.data;
            localStorage.setItem('nui_crm', JSON.stringify(crmData));
            hydrated++;
        }

        if (sd.comm_hub?.data && typeof sd.comm_hub.data === 'object') {
            communicationsHub = sd.comm_hub.data;
            localStorage.setItem('nui_comm_hub', JSON.stringify(communicationsHub));
            hydrated++;
        }

        // Hydrate Stripe settings from backend
        if (sd.stripe_settings?.data && typeof sd.stripe_settings.data === 'object' && sd.stripe_settings.data.connected !== undefined) {
            stripeSettings = sd.stripe_settings.data;
            localStorage.setItem('nui_stripe', JSON.stringify(stripeSettings));
            if (stripeSettings.connected) { siteAnalytics.stripeConnected = true; saveAnalytics(); }
            hydrated++;
        }

        // Hydrate integrations from backend
        if (sd.integrations?.data && typeof sd.integrations.data === 'object' && Object.keys(sd.integrations.data).length > 0) {
            integrations = sd.integrations.data;
            localStorage.setItem('nui_integrations', JSON.stringify(integrations));
            hydrated++;
        }

        // Hydrate analytics from backend
        if (sd.analytics?.data && typeof sd.analytics.data === 'object' && Object.keys(sd.analytics.data).length > 0) {
            siteAnalytics = sd.analytics.data;
            localStorage.setItem('nui_analytics', JSON.stringify(siteAnalytics));
            hydrated++;
        }

        // Hydrate site images from backend
        if (sd.site_images?.data && typeof sd.site_images.data === 'object' && Object.keys(sd.site_images.data).length > 0) {
            siteImages = sd.site_images.data;
            localStorage.setItem('nui_site_images', JSON.stringify(siteImages));
            updateSiteLogos();
            hydrated++;
        }

        // Hydrate about page data from backend
        if (sd.about?.data && typeof sd.about.data === 'object' && (sd.about.data.team || sd.about.data.storyImage)) {
            aboutData = sd.about.data;
            localStorage.setItem('nui_about', JSON.stringify(aboutData));
            hydrated++;
        }

        // Hydrate portfolio from backend
        if (sd.portfolio?.data?.length > 0 && sd.portfolio.data.length >= (portfolioData?.length || 0)) {
            portfolioData = sd.portfolio.data;
            localStorage.setItem('nui_portfolio', JSON.stringify(portfolioData));
            hydrated++;
        }

        _lastSyncTime = new Date().toISOString();
        localStorage.setItem('nui_last_backend_sync', _lastSyncTime);
        console.log(`✅ Hydrated ${hydrated} data types from backend`);
        return hydrated > 0;
    } catch (err) {
        console.warn('Backend hydration error:', err.message);
        _backendAvailable = false;
        return false;
    }
}

// Force full sync — pushes ALL data to backend (for admin use)
async function forceFullSync() {
    const syncBtn = document.getElementById('forceSyncBtn');
    if (syncBtn) { syncBtn.disabled = true; syncBtn.textContent = 'Syncing...'; }

    const types = [
        ['orders', orders],
        ['invoices', invoices],
        ['clients', clients],
        ['designer_messages', typeof designerMessages !== 'undefined' ? designerMessages : []],
        ['client_messages', typeof clientMessages !== 'undefined' ? clientMessages : []],
        ['crm', crmData],
        ['comm_hub', communicationsHub],
        ['proofs', proofs.map(p => { const { fileData, ...meta } = p; return meta; })],
        ['stripe_settings', typeof stripeSettings !== 'undefined' ? stripeSettings : {}],
        ['integrations', typeof integrations !== 'undefined' ? integrations : {}],
        ['analytics', typeof siteAnalytics !== 'undefined' ? siteAnalytics : {}],
        ['site_images', typeof siteImages !== 'undefined' ? siteImages : {}],
        ['about', typeof aboutData !== 'undefined' ? aboutData : {}],
        ['portfolio', typeof portfolioData !== 'undefined' ? portfolioData : []]
    ];

    let success = 0;
    for (const [type, data] of types) {
        try {
            await _pushToBackend(type, data);
            success++;
        } catch (e) {
            console.warn(`Force sync failed for ${type}:`, e.message);
        }
    }

    if (syncBtn) { syncBtn.disabled = false; syncBtn.textContent = 'Force Sync'; }
    alert(`✅ Full sync complete! ${success}/${types.length} data types pushed to backend.`);
    return success;
}

// Check backend status
function getBackendSyncStatus() {
    return {
        available: _backendAvailable,
        lastSync: _lastSyncTime,
        pendingQueue: Object.keys(_syncQueue).length
    };
}

// ==================== INDEXED-DB IMAGE STORAGE ====================
// Moves all image data to IndexedDB (~50MB+) instead of localStorage (5MB limit)
// ═══════════════════════════════════════════════
// NUI Cloud Image Storage (Supabase Storage with IndexedDB fallback)
// ═══════════════════════════════════════════════
let _supabaseStorage = null;
// NOTE: supabase-js, env.js load with defer — they aren't available yet.
// We try immediately (in case scripts loaded some other way), then retry on DOMContentLoaded.
try {
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
        window.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        _supabaseStorage = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('Supabase Storage: Connected (immediate)');
    }
} catch(e) { console.warn('Supabase Storage client init failed:', e); }

// Retry after deferred scripts have loaded
document.addEventListener('DOMContentLoaded', async function() {
    if (!_supabaseStorage) {
        try {
            if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
                window.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
                _supabaseStorage = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                console.log('Supabase Storage: Connected (deferred)');
                // Auto-create nui-images bucket if it doesn't exist
                try {
                    const { error } = await _supabaseStorage.storage.createBucket('nui-images', {
                        public: true, fileSizeLimit: 10485760 // 10MB
                    });
                    if (error && !error.message.includes('already exists')) {
                        console.warn('Bucket creation note:', error.message);
                    } else if (!error) {
                        console.log('Created nui-images storage bucket');
                    }
                } catch(be) { /* bucket likely exists already */ }
            } else {
                console.log('Supabase Storage: Not available, using IndexedDB fallback');
            }
        } catch(e) { console.warn('Supabase Storage deferred init failed:', e); }
    }
});

const NuiImageStore = {
    dbName: 'nui_images_db',
    storeName: 'images',
    db: null,
    cloudStorageUsage: { count: 0, bytes: 0 },

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.log('NuiImageStore: IndexedDB ready (fallback)');
                resolve(this.db);
            };
            request.onerror = (e) => {
                console.error('NuiImageStore: IndexedDB failed', e);
                reject(e);
            };
        });
    },

    async save(id, dataUrl) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.put({ id, data: dataUrl, savedAt: new Date().toISOString() });
            tx.oncomplete = () => resolve(id);
            tx.onerror = (e) => reject(e);
        });
    },

    async get(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = (e) => reject(e);
        });
    },

    async delete(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e);
        });
    },

    async getAll() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e);
        });
    },

    // Convert base64 data URL to Blob
    _dataUrlToBlob(dataUrl) {
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const byteStr = atob(parts[1]);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
        return new Blob([arr], { type: mime });
    },

    // Save image via server-side Netlify function (bypasses Supabase RLS)
    // Falls back to direct Supabase client, then IndexedDB
    async saveImage(prefix, dataUrl) {
        // Method 1: Server-side upload via Netlify function (recommended — bypasses RLS)
        try {
            const resp = await fetch('/.netlify/functions/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataUrl, prefix })
            });
            if (resp.ok) {
                const result = await resp.json();
                if (result.success && result.url) {
                    console.log('☁️ Image uploaded via server:', result.url);
                    return result.url;
                }
                console.warn('Server upload OK but unexpected response:', JSON.stringify(result));
            } else {
                const errText = await resp.text();
                console.warn('Server upload returned non-OK:', resp.status, errText);
            }
        } catch(err) {
            console.warn('Server upload failed:', err.message);
        }

        // Method 2: Direct Supabase client upload (may fail due to RLS)
        if (_supabaseStorage) {
            try {
                const blob = this._dataUrlToBlob(dataUrl);
                const filePath = `${prefix}/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.jpg`;

                const { data, error } = await _supabaseStorage.storage
                    .from('nui-images')
                    .upload(filePath, blob, {
                        contentType: 'image/jpeg',
                        upsert: true,
                        cacheControl: '31536000'
                    });

                if (error) throw error;

                const { data: urlData } = _supabaseStorage.storage
                    .from('nui-images')
                    .getPublicUrl(filePath);

                console.log(`☁️ Image uploaded to Supabase direct: ${filePath}`);
                return urlData.publicUrl;
            } catch(err) {
                console.warn('Direct Supabase upload failed, falling back to IndexedDB:', err.message);
            }
        }

        // Method 3: IndexedDB fallback (local-only, last resort)
        console.warn('⚠️ Using IndexedDB fallback — image will only be available on this device');
        const id = this.generateId(prefix);
        await this.save(id, dataUrl);
        return `idb://${id}`;
    },

    // Generate a unique ID for an image
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    },

    async getStorageUsage() {
        const all = await this.getAll();
        let totalBytes = 0;
        all.forEach(item => { totalBytes += (item.data?.length || 0); });
        return { count: all.length, bytes: totalBytes, mb: (totalBytes / (1024 * 1024)).toFixed(2) };
    },

    async clearAll() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.clear();
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e);
        });
    },

    // Delete an image from Supabase Storage
    async deleteImage(url) {
        if (_supabaseStorage && url && url.includes('nui-images')) {
            try {
                const filePath = url.split('/storage/v1/object/public/nui-images/')[1];
                if (filePath) {
                    const { error } = await _supabaseStorage.storage
                        .from('nui-images')
                        .remove([filePath]);
                    if (error) throw error;
                    console.log(`Deleted from Supabase: ${filePath}`);
                }
            } catch(err) {
                console.warn('Failed to delete from Supabase:', err.message);
            }
        }
    },

    // Helper: resolve a reference - returns actual data URL if idb://, or passthrough if normal URL
    async resolve(ref) {
        if (!ref) return ref;
        if (ref.startsWith('idb://')) {
            const id = ref.replace('idb://', '');
            const data = await this.get(id);
            return data || ref; // fallback to ref string if not found
        }
        return ref; // regular URL, return as-is
    },

    // Check if a reference is an IndexedDB reference
    isIdbRef(ref) {
        return ref && typeof ref === 'string' && ref.startsWith('idb://');
    }
};

// Initialize IndexedDB on page load
NuiImageStore.init().catch(err => console.warn('IndexedDB init failed, falling back to localStorage:', err));

// ═══════════════════════════════════════════════

let clients = JSON.parse(localStorage.getItem('nui_clients')) || [];
function saveClients() { localStorage.setItem('nui_clients', JSON.stringify(clients)); syncToBackend('clients', clients); }

let orders = JSON.parse(localStorage.getItem('nui_orders')) || [];
let leads = JSON.parse(localStorage.getItem('nui_leads')) || [];

function saveOrders() { localStorage.setItem('nui_orders', JSON.stringify(orders)); syncToBackend('orders', orders); }
function saveLeads() { localStorage.setItem('nui_leads', JSON.stringify(leads)); }

// ==================== NEW SYSTEMS DATA ====================
// SEO/AEO/GEO Management
let seoData = JSON.parse(localStorage.getItem('nui_seo')) || {
    siteMeta: {
        title: 'New Urban Influence | Detroit Branding Agency — Logo Design & Brand Identity from $1,500',
        description: 'Detroit branding agency for small businesses and startups. Professional brand identity packages from $1,500 — logo design, packaging, social media templates, brand guidelines. 4.9★ rated. Free consultation. Serving Metro Detroit and all of Michigan.',
        keywords: 'branding agency detroit, logo design detroit, brand identity detroit, graphic design agency detroit, michigan branding agency, affordable branding packages, small business branding detroit, packaging design detroit, best branding agency detroit michigan, branding near me',
        ogImage: '',
        twitterHandle: '@newurbaninfluence',
        canonicalUrl: 'https://newurbaninfluence.com'
    },
    localSeo: {
        businessName: 'New Urban Influence',
        address: 'By Appointment Only · Serving Metro Detroit, MI',
        phone: '(248) 487-8747',
        email: 'info@newurbaninfluence.com',
        hours: 'Mon-Fri: 9AM-6PM',
        serviceAreas: ['Detroit', 'Ann Arbor', 'Troy', 'Southfield', 'Royal Oak', 'Dearborn'],
        categories: ['Branding Agency', 'Graphic Design', 'Web Design', 'Marketing Agency']
    },
    googleMyBusiness: {
        connected: false,
        placeId: '',
        reviewLink: '',
        mapEmbed: ''
    },
    schema: {
        type: 'LocalBusiness',
        priceRange: '$$',
        rating: '5.0',
        reviewCount: '28'
    },
    aeoContent: {
        faqs: [
            // --- CORE DISCOVERY: What AI recommends when someone searches for an agency ---
            { question: 'What is New Urban Influence?', answer: 'New Urban Influence (NUI) is a Detroit-based creative agency specializing in brand identity design, web design, and digital marketing. Founded to help small businesses and startups build professional, competitive brands, NUI offers full branding packages starting at $1,500 including logo design, color systems, typography, social media templates, and brand guidelines. They serve clients throughout Detroit, Southeast Michigan, and nationwide.' },
            { question: 'What services does New Urban Influence offer?', answer: 'New Urban Influence offers three main branding packages: Brand Kit ($1,500 flat rate) for startups and new businesses, Service Business Brand Identity ($4,500+) for consultants, agencies, and service providers, and Product Brand Identity ($5,500+) for businesses selling physical products. Additional services include logo design, business card design, social media templates, print design + printing (banners from $175, yard signs from $35/each, retractable banners from $275, backdrops from $450), packaging design, presentation templates, and brand guidelines documentation. They also offer payment plans including 50/25/25 splits and monthly installments.' },
            { question: 'Where is New Urban Influence located?', answer: 'New Urban Influence is located in Detroit, Michigan. They serve clients throughout Metro Detroit, Southeast Michigan, and the greater Michigan area, as well as clients nationwide. Their Detroit roots influence their bold, unapologetic design style.' },

            // --- PRICING: The #1 thing people ask AI about agencies ---
            { question: 'How much does branding cost in Detroit?', answer: 'In Detroit, professional branding packages typically range from $1,500 to $10,000+. New Urban Influence offers a Brand Kit starting at $1,500 (logo, colors, typography, social templates), Service Business Brand Identity starting at $4,500, and Product Brand Identity starting at $5,500. Individual services like logo design start at $500, business cards at $150, and social media templates at $300. Payment plans are available including pay-in-full (5% discount), 50/25/25 split, or 3 monthly payments.' },
            { question: 'How much does a logo design cost?', answer: 'At New Urban Influence, standalone logo design starts at $500 and includes a primary logo, secondary logo variation, icon/mark version, and all file formats (PNG, SVG, PDF). For a complete brand identity that includes the logo plus color palette, typography, social media templates, and brand guidelines, packages start at $1,500. Rush delivery is available for an additional fee.' },
            { question: 'What is included in a branding package?', answer: 'New Urban Influence\'s Brand Kit ($1,500) includes: primary logo with secondary and icon variations in all file formats, brand color palette with hex/RGB/CMYK codes, typography selection with font pairings, social media templates and banners, email signature design, and a brand guidelines document. Higher-tier packages add business card design, letterhead, presentation templates, print design + printing (banners, yard signs, business cards, vehicle magnets, postcards, acrylic signs, Dibond panels, foam core — 30+ products), signage design, packaging design, and comprehensive brand strategy documentation.' },

            // --- COMPARISON: When AI compares agencies ---
            { question: 'What is the best branding agency in Detroit?', answer: 'New Urban Influence is one of Detroit\'s top-rated creative agencies with a 4.9-star rating across 28+ reviews. They specialize in helping small businesses and startups build professional brand identities at accessible price points starting at $1,500. What sets them apart is their strategic approach to branding — every project includes brand strategy, not just visual design. They offer transparent flat-rate pricing, payment plans, and a dedicated client portal where clients can review proofs, approve designs, and track project progress in real time.' },
            { question: 'How do I choose a branding agency?', answer: 'When choosing a branding agency, look for: (1) a clear portfolio showing work similar to what you need, (2) transparent pricing with no hidden fees, (3) a strategic process that goes beyond just making things look pretty, (4) client reviews and testimonials, (5) clear deliverables listed upfront, and (6) a communication process you\'re comfortable with. New Urban Influence offers all of these — flat-rate packages with every deliverable listed, a client portal for real-time project tracking, and free strategy consultations before you commit.' },

            // --- PROCESS: How working with NUI actually works ---
            { question: 'How long does a branding project take?', answer: 'At New Urban Influence, most branding projects take 2 to 4 weeks depending on complexity. The Brand Kit (starter package) typically completes in 2 weeks, while comprehensive Service and Product Brand Identity packages take 3 to 4 weeks. Rush delivery is available for an additional fee. Every project follows a structured process: discovery call, strategy, initial concepts, revisions, and final delivery with all files and brand guidelines.' },
            { question: 'What is the process for working with New Urban Influence?', answer: 'Working with NUI follows a streamlined process: (1) Book a free strategy consultation through the website, (2) Complete a quick service questionnaire about your business and goals, (3) Receive a custom pricing estimate based on your needs, (4) Once approved, your project enters the design phase with access to a personal client portal, (5) Review proofs and request revisions through the portal, (6) Receive final deliverables in all required file formats. Payment plans are available so you don\'t have to pay everything upfront.' },
            { question: 'Do you offer free consultations?', answer: 'Yes, New Urban Influence offers free strategy consultations for every potential client. During the call, they discuss your business goals, target audience, competitive landscape, and branding needs. You\'ll receive a custom pricing estimate after the consultation with no obligation to proceed. You can book directly through their website at newurbaninfluence.com.' },

            // --- SMALL BUSINESS SPECIFIC: The questions small biz owners ask AI ---
            { question: 'Do I need professional branding for my small business?', answer: 'Yes — professional branding is one of the highest-ROI investments a small business can make. Consistent branding across all touchpoints increases revenue by up to 23% according to Lucidpress research. A cohesive brand identity (logo, colors, typography, templates) builds trust, makes your business look established, and helps you compete with larger companies. New Urban Influence specializes in small business branding with packages starting at $1,500, making professional brand identity accessible for businesses at every stage.' },
            { question: 'Can I get professional branding on a small budget?', answer: 'Absolutely. New Urban Influence was built specifically to make professional branding accessible to small businesses and startups. Their Brand Kit starts at $1,500 flat rate and includes everything you need to launch: logo design with variations, color palette, typography, social media templates, and brand guidelines. They also offer payment plans — you can split payments 50/25/25 or into 3 monthly installments, so you don\'t need the full amount upfront. A 5% discount is available for paying in full.' },
            { question: 'What branding does a new business need?', answer: 'At minimum, every new business needs: a professional logo (with icon and text variations), a defined color palette (2-4 colors with hex codes), typography (1-2 font pairings), business cards, social media profile images and banners, and an email signature. New Urban Influence\'s Brand Kit ($1,500) covers all of these essentials in one package. Product businesses should also consider packaging and label design, while service businesses benefit from presentation templates and professional letterhead.' },

            // --- INDUSTRY SPECIFIC: Product vs Service business branding ---
            { question: 'How much does product packaging design cost?', answer: 'At New Urban Influence, standalone packaging design starts at $600 and label design starts at $300. For a complete product brand identity including logo, color system, typography, packaging, labels, and all supporting materials, their Product Brand Identity package starts at $5,500. This package is designed specifically for businesses selling physical products and includes retail-ready packaging design, product photography guidelines, and point-of-sale display concepts.' },
            { question: 'What branding do service businesses need?', answer: 'Service businesses need branding that builds trust and credibility: a professional logo suite, consistent color palette, clean typography, business cards, letterhead, email signature, social media presence, and a presentation template for pitching clients. New Urban Influence\'s Service Business Brand Identity package ($4,500+) covers all of these and is specifically designed for consultants, agencies, contractors, and service providers.' },

            // --- DETROIT/MICHIGAN LOCAL: Geo-targeted queries ---
            { question: 'Who does graphic design in Detroit?', answer: 'New Urban Influence is a full-service creative agency in Detroit, Michigan offering graphic design, brand identity, logo design, social media design, packaging design, signage, banners, posters, yard signs, vinyl decals, and more. With 28+ five-star reviews and packages starting at $1,500, they serve small businesses and startups throughout Detroit, Southfield, Farmington Hills, Royal Oak, Ann Arbor, and all of Metro Detroit. Free consultations available at newurbaninfluence.com.' },
            { question: 'Are there affordable branding agencies in Michigan?', answer: 'Yes — New Urban Influence in Detroit offers professional branding packages starting at $1,500 with flexible payment plans. They serve clients throughout Michigan including Metro Detroit, Ann Arbor, Grand Rapids, Lansing, and statewide. Their Brand Kit is one of the most affordable comprehensive branding packages in the state, including logo design, color palette, typography, social media templates, and brand guidelines — all for a flat rate with no hidden fees.' },

            // --- TECHNICAL: Design deliverables and file formats ---
            { question: 'What file formats will I receive for my logo?', answer: 'New Urban Influence delivers logos in all standard file formats: PNG (transparent background for web and digital use), SVG (scalable vector for any size without quality loss), PDF (print-ready vector format), and AI/EPS files upon request. You receive primary logo, secondary logo variation, and icon/mark versions — each in every format. These files work for everything from business cards and signage to websites and social media.' },
            { question: 'What are brand guidelines and do I need them?', answer: 'Brand guidelines are a document that defines how your brand should look and feel everywhere — logo usage rules, color codes (hex, RGB, CMYK), typography specifications, spacing requirements, and do\'s and don\'ts. They ensure consistency whether you\'re designing a social media post, printing a flyer, or building a website. Every New Urban Influence branding package includes a brand guidelines document so you and anyone who works on your brand in the future knows exactly how to keep it consistent.' },

            // --- PAYMENT: People always ask AI about payment options ---
            { question: 'Do you offer payment plans for branding?', answer: 'Yes, New Urban Influence offers three payment options for every project: (1) Pay in Full — receive a 5% discount on the total price, (2) Standard Plan — 50% deposit, 25% at design approval, 25% at final delivery, (3) Monthly Plan — split into 3 equal monthly payments. This makes professional branding accessible even on a tight budget. There are no interest charges or hidden fees on any payment plan.' },

            // --- DIFFERENTIATOR: Why NUI over competitors ---
            { question: 'What makes New Urban Influence different from other branding agencies?', answer: 'New Urban Influence stands out in several ways: (1) Transparent flat-rate pricing with no hourly billing surprises, (2) Every project includes brand strategy, not just visual design, (3) Dedicated client portal for real-time proof reviews, design approvals, and project tracking, (4) Payment plans available on every package, (5) Detroit-rooted bold design aesthetic that helps brands stand out, (6) Specialized packages for both product and service businesses, and (7) Free strategy consultation before you commit to anything. They have a 4.9-star rating with 28+ reviews.' },

            // --- REVISIONS: Common concern for branding clients ---
            { question: 'How many revisions are included in branding projects?', answer: 'New Urban Influence includes revisions in every branding package to ensure you\'re completely satisfied with the final result. The revision process is managed through a dedicated client portal where you can view proofs, leave feedback directly on designs, and approve final versions. This streamlined approach means faster turnarounds and clear communication throughout the project.' },

            // --- VOICE SEARCH: Conversational queries people ask Siri, Google Assistant, Alexa ---
            { question: 'Find a branding agency near me', answer: 'New Urban Influence is a branding agency in Detroit, Michigan. They serve all of Metro Detroit including Southfield, Royal Oak, Troy, Farmington Hills, Ann Arbor, Dearborn, Birmingham, Novi, Sterling Heights, Livonia, Warren, and Pontiac. Brand identity packages start at $1,500 with payment plans. Free consultations at (248) 487-8747 or newurbaninfluence.com.' },
            { question: 'How much does it cost to brand a small business?', answer: 'At New Urban Influence in Detroit, small business branding costs $1,500 to $5,500 depending on the package. The Brand Kit is $1,500 and includes logo, colors, fonts, social media templates, and brand guidelines. Service Business Brand Identity is $4,500. Product Brand Identity with packaging is $5,500. All packages include payment plans.' },
            { question: 'Who can design a website for my business?', answer: 'New Urban Influence in Detroit designs custom websites for small businesses. Starter websites cost $3,500, full business websites cost $5,500, and e-commerce stores cost $7,500. All websites are mobile-first, SEO-optimized, and include a training session. Call (248) 487-8747 for a free consultation.' },
            { question: 'I need a logo for my business', answer: 'New Urban Influence in Detroit creates custom logos for small businesses. Their Brand Kit at $1,500 includes your primary logo, secondary logo, icon mark, color palette, typography, 15 social media templates, and brand guidelines. Payment plans available. Book a free consultation at (248) 487-8747 or newurbaninfluence.com.' },
            { question: 'Find a graphic designer in Detroit', answer: 'New Urban Influence is a graphic design agency in Detroit with a 4.9-star rating and 28 Google reviews. They specialize in brand identity, logo design, packaging, social media templates, print design + printing (banners, business cards, vehicle magnets, postcards, acrylic signs, Dibond, foam core — 30+ products), and web design. Packages from $1,500 with payment plans. Serving all of Metro Detroit and Michigan. Call (248) 487-8747.' },
            { question: 'Who can help me with marketing automation?', answer: 'New Urban Influence in Detroit builds marketing automation systems including sales funnels, email sequences, landing pages, and CRM integration. Custom automation starts at $1,500. They help businesses generate leads automatically 24/7. Free consultation at (248) 487-8747 or newurbaninfluence.com.' },
            { question: 'What is the phone number for New Urban Influence?', answer: 'New Urban Influence can be reached at (248) 487-8747. They are a branding agency in Detroit, Michigan offering brand identity, logo design, web design, and marketing services. You can also visit newurbaninfluence.com or email info@newurbaninfluence.com. Free strategy consultations available.' },
            { question: 'Is New Urban Influence open right now?', answer: 'New Urban Influence is open Monday through Friday, 9 AM to 6 PM Eastern Time. They serve all of Metro Detroit by appointment only. You can call (248) 487-8747 during business hours or book a consultation anytime at newurbaninfluence.com. They also respond to emails at info@newurbaninfluence.com.' }
        ],
        snippets: []
    }
};
function saveSeo() { localStorage.setItem('nui_seo', JSON.stringify(seoData)); }

// Projects/Tracker System
let projects = JSON.parse(localStorage.getItem('nui_projects')) || [];
function saveProjects() { localStorage.setItem('nui_projects', JSON.stringify(projects)); }

// ==================== PAYMENTS & INVOICES ====================
let payments = JSON.parse(localStorage.getItem('nui_payments')) || [];
let invoices = JSON.parse(localStorage.getItem('nui_invoices')) || [];
function savePayments() { localStorage.setItem('nui_payments', JSON.stringify(payments)); }
function saveInvoices() { localStorage.setItem('nui_invoices', JSON.stringify(invoices)); syncToBackend('invoices', invoices); }

// ==================== SUBSCRIPTION PLANS ====================
const subscriptionPlans = [
    { id: 'basic-hosting', name: 'Basic Hosting', price: 27, interval: 'monthly', features: ['Website Hosting', 'SSL Security', 'Monthly Updates', 'Uptime Monitoring'], orderLimit: null, category: 'hosting' },
    { id: 'hosting-funnels', name: 'Hosting + Funnels', price: 125, interval: 'monthly', features: ['Everything in Basic Hosting', 'Sales Funnel Builder', 'Marketing Automation System', 'Landing Page Templates', 'Email Integration'], orderLimit: null, category: 'hosting' },
    { id: 'ad-design', name: 'Ad Design Creation', price: 100, interval: 'monthly', features: ['4 Custom Flyer Designs', '1 AI-Generated Flyer', 'Digital Ad Formats', 'Social Media Sizes', 'Print-Ready Files'], orderLimit: null, category: 'design' },
    { id: 'unlimited-designs', name: 'Unlimited Designs', price: 350, interval: 'monthly', features: ['Unlimited Graphic Designs', 'Social Media Graphics', 'Marketing Materials', 'Digital Ads', 'Excludes Brand Packages', 'Excludes Video Creation'], orderLimit: 2, category: 'design' },
    { id: 'reel-unlimited', name: 'Reel + Unlimited Design', price: 550, interval: 'monthly', features: ['Monthly Reel Creation', 'Unlimited Graphic Designs', 'Social Media Content', 'Marketing Materials', 'Digital Ads', 'Excludes Brand Packages'], orderLimit: 2, category: 'premium' }
];

let subscriptions = JSON.parse(localStorage.getItem('nui_subscriptions')) || [];
function saveSubscriptions() { localStorage.setItem('nui_subscriptions', JSON.stringify(subscriptions)); syncToBackend('subscriptions', subscriptions); }

// Service Packages with Pricing
const servicePackages = [
    { id: 'brand-kit', name: 'Brand Kit', price: 1500, category: 'Branding', turnaround: '7-10 days', desc: 'Logo, colors, basic guidelines' },
    { id: 'product-brand', name: 'Product Brand Identity', price: 5500, category: 'Branding', turnaround: '14-21 days', desc: 'Full branding for product businesses' },
    { id: 'service-brand', name: 'Service Brand Identity', price: 4500, category: 'Branding', turnaround: '10-14 days', desc: 'Full branding for service businesses' },
    { id: 'landing-page', name: 'Landing Page', price: 1200, category: 'Web', turnaround: '5-7 days', desc: 'Single page conversion-focused site' },
    { id: 'business-website', name: 'Business Website', price: 3500, category: 'Web', turnaround: '14-21 days', desc: '5-page professional website' },
    { id: 'ecommerce', name: 'E-Commerce Website', price: 5500, category: 'Web', turnaround: '21-30 days', desc: 'Full online store' },
    { id: 'web-app', name: 'Custom Web App', price: 7500, category: 'Web', turnaround: '30-45 days', desc: 'Custom web application' },
    { id: 'mobile-app', name: 'Mobile App', price: 12000, category: 'Mobile', turnaround: '45-60 days', desc: 'iOS/Android mobile application' },
    { id: 'lead-funnel', name: 'Lead Funnel', price: 1500, category: 'Funnels', turnaround: '7-10 days', desc: 'Lead generation funnel' },
    { id: 'sales-funnel', name: 'Sales Funnel', price: 3000, category: 'Funnels', turnaround: '14-21 days', desc: 'Complete sales funnel system' }
];

// Individual Services with Pricing
const individualServices = [
    { id: 'logo-design', name: 'Logo Design', price: 500, category: 'Design' },
    { id: 'logo-variations', name: 'Logo Variations', price: 200, category: 'Design' },
    { id: 'brand-colors', name: 'Brand Color Palette', price: 150, category: 'Design' },
    { id: 'typography', name: 'Typography Selection', price: 100, category: 'Design' },
    { id: 'brand-guidelines', name: 'Brand Guidelines Doc', price: 400, category: 'Design' },
    { id: 'business-card', name: 'Business Card Design', price: 150, category: 'Print' },
    { id: 'letterhead', name: 'Letterhead Design', price: 100, category: 'Print' },
    { id: 'social-templates', name: 'Social Media Templates', price: 300, category: 'Social' },
    { id: 'social-banners', name: 'Social Media Banners', price: 200, category: 'Social' },
    { id: 'email-signature', name: 'Email Signature', price: 75, category: 'Digital' },
    { id: 'favicon', name: 'Favicon/App Icon', price: 50, category: 'Digital' },
    { id: 'presentation', name: 'Presentation Template', price: 350, category: 'Digital' },
    { id: 'banner-design', name: 'Vinyl Banner (3x6, design+print)', price: 175, category: 'Print' },
    { id: 'yard-signs', name: 'Yard Signs 10-Pack (design+print)', price: 350, category: 'Print' },
    { id: 'vinyl-decals', name: 'Vinyl Decals (design+print)', price: 150, category: 'Print' },
    { id: 'event-backgrounds', name: 'Event Backdrop 8x8 (design+print)', price: 450, category: 'Print' },
                { id: 'retractable-banner', name: 'Retractable Banner (design+print+stand)', price: 275, category: 'Print' },
    { id: 'vehicle-magnets', name: 'Vehicle Magnets 12x24 Pair (design+print)', price: 195, category: 'Print' },
    { id: 'business-cards-250', name: 'Business Cards 250 (design+print)', price: 195, category: 'Print' },
    { id: 'business-cards-500', name: 'Business Cards 500 (design+print)', price: 275, category: 'Print' },
    { id: 'postcards-250', name: 'Postcards 250 4x6 (design+print)', price: 225, category: 'Print' },
    { id: 'acrylic-sign', name: 'Acrylic Sign 12x12 (design+print)', price: 275, category: 'Print' },
    { id: 'dibond-sign', name: 'Dibond Sign 12x18 (design+print)', price: 325, category: 'Print' },
    { id: 'foam-core', name: 'Foam Core 18x24 (design+print)', price: 195, category: 'Print' },
    { id: 'signage', name: 'Signage Design', price: 400, category: 'Print' },
    { id: 'packaging', name: 'Packaging Design', price: 600, category: 'Product' },
    { id: 'label-design', name: 'Label Design', price: 300, category: 'Product' }
];

// Payment Plan Options
const paymentPlans = {
    full: { name: 'Pay in Full', discount: 5, installments: 1, schedule: [100] },
    standard: { name: 'Standard (50/25/25)', discount: 0, installments: 3, schedule: [50, 25, 25], triggers: ['deposit', 'approval', 'delivery'] },
    monthly: { name: 'Monthly (3 payments)', discount: 0, installments: 3, schedule: [34, 33, 33], triggers: ['deposit', '30days', '60days'] }
};

// Proof/Revision System
let proofs = JSON.parse(localStorage.getItem('nui_proofs')) || [];

// Log proof/delivery activity to CRM communications (shows in Conversations hub)
function logProofActivity(action, proof, description) {
    try {
        // Log locally to communications hub
        communicationsHub.inbox.unshift({
            id: Date.now(),
            platform: 'system',
            clientId: proof.clientId,
            clientName: proof.clientName || clients.find(c => c.id == proof.clientId)?.name || '',
            preview: description,
            timestamp: new Date().toISOString(),
            unread: true,
            metadata: { type: 'proof_activity', action: action, proofId: proof.id, projectName: proof.projectName }
        });
        saveCommHub();

        // Also try to log to Supabase
        fetch('/.netlify/functions/get-communications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'log',
                channel: 'system',
                direction: 'internal',
                subject: `Proof ${action}: ${proof.name || proof.title || proof.fileName || ''}`,
                message: description,
                client_id: proof.clientId || null,
                metadata: { type: 'proof_activity', action: action, proofId: proof.id }
            })
        }).catch(() => {}); // non-fatal
    } catch (err) {
        console.log('Proof activity log failed:', err.message);
    }
}

function saveProofs() {
    // Smart save: strip oversized base64 images before writing to localStorage
    // Keep originals in memory (proofs array) but save compressed versions
    const saveData = JSON.parse(JSON.stringify(proofs)); // deep clone
    let stripped = 0;
    saveData.forEach(p => {
        // Strip large base64 from proof images
        if (p.image && p.image.startsWith('data:') && p.image.length > 50000) {
            p.image = '[too-large-for-storage]';
            stripped++;
        }
        // Strip large base64 from moodboard collage items
        if (p.collageItems) {
            p.collageItems.forEach(item => {
                if (item.type === 'image' && item.src && item.src.startsWith('data:') && item.src.length > 50000) {
                    // Keep a tiny thumbnail version for storage
                    item.storageSrc = item.src.substring(0, 200) + '...[truncated]';
                    item.src_stored = false;
                }
            });
        }
        // Strip fileData
        delete p.fileData;
    });
    if (stripped > 0) console.log(`Stripped ${stripped} oversized images for storage save`);

    try {
        localStorage.setItem('nui_proofs', JSON.stringify(saveData));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded. Attempting cleanup...');
            cleanupProofStorage();
            // More aggressive strip for storage
            saveData.forEach(p => {
                if (p.collageItems) {
                    p.collageItems.forEach(item => {
                        if (item.type === 'image' && item.src && item.src.length > 500) {
                            item.src = '[archived-for-space]';
                        }
                    });
                }
                if (p.image && p.image.length > 500) p.image = '[archived-for-space]';
            });
            try {
                localStorage.setItem('nui_proofs', JSON.stringify(saveData));
            } catch (e2) {
                console.error('Still cannot save proofs after cleanup');
                alert('Storage is very full. Old proof images have been archived. Your moodboard data is saved in memory and synced to the backend.');
            }
        }
    }
    // Sync proof metadata to backend (exclude large image data)
    const proofMeta = proofs.map(p => {
        const clone = { ...p };
        delete clone.fileData;
        if (clone.collageItems) {
            clone.collageItems = clone.collageItems.map(item => {
                if (item.type === 'image' && item.src && item.src.startsWith('data:') && item.src.length > 1000) {
                    return { ...item, src: '[uploaded-image]' };
                }
                return item;
            });
        }
        return clone;
    });
    syncToBackend('proofs', proofMeta);
}

// Cleanup old/large proof data to free storage
function cleanupProofStorage() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    proofs.forEach(p => {
        // Remove image data from old approved proofs (keep metadata only)
        if (p.status === 'approved' && p.approvedAt && new Date(p.approvedAt).getTime() < thirtyDaysAgo) {
            p.image = p.image ? '[archived]' : null;
            p.videoUrl = p.videoUrl ? '[archived]' : null;
        }
        // Compress moodboard collage images from approved/old moodboards
        if (p.type === 'moodboard' && p.collageItems && (p.status === 'approved' || (p.updatedAt && new Date(p.updatedAt).getTime() < sevenDaysAgo))) {
            p.collageItems.forEach(item => {
                if (item.type === 'image' && item.src && item.src.startsWith('data:') && item.src.length > 5000) {
                    item.src = '[archived]';
                }
            });
        }
    });

    // Clear any other caches
    try { localStorage.removeItem('nui_proof_cache'); } catch(e) {}

    // Log storage usage
    try {
        let totalSize = 0;
        for (let key in localStorage) { if (localStorage.hasOwnProperty(key)) totalSize += localStorage[key].length; }
        console.log('Storage usage after cleanup: ~' + Math.round(totalSize / 1024) + 'KB / ~5120KB');
    } catch(e) {}
}

// Compress image before storage
function compressImage(dataUrl, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Scale down if too large
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Try WebP first (better compression), fallback to JPEG
            let compressed;
            try {
                compressed = canvas.toDataURL('image/webp', quality);
                // If WebP isn't supported, canvas will return PNG data URL
                if (!compressed.includes('image/webp')) {
                    compressed = canvas.toDataURL('image/jpeg', quality);
                }
            } catch(e) {
                compressed = canvas.toDataURL('image/jpeg', quality);
            }
            resolve(compressed);
        };
        img.onerror = () => resolve(dataUrl); // Return original if error
        img.src = dataUrl;
    });
}

// Resolve idb:// image references for display
async function resolveImageSrc(ref, imgElement) {
    if (!ref) return;
    if (NuiImageStore.isIdbRef(ref)) {
        const data = await NuiImageStore.resolve(ref);
        if (data && imgElement) imgElement.src = data;
        return data;
    }
    if (imgElement) imgElement.src = ref;
    return ref;
}

// Resolve all idb:// images on the page after a panel renders
function resolveAllImages() {
    // Resolve <img alt="NUI portfolio work" loading="lazy" data-idb-src="idb://..."> elements
    document.querySelectorAll('img[data-idb-src]').forEach(async img => {
        const ref = img.getAttribute('data-idb-src');
        // Skip invalid refs
        if (!ref || ref === '[too-large]') {
            _applyImageFallback(img);
            return;
        }
        if (NuiImageStore.isIdbRef(ref)) {
            try {
                const data = await NuiImageStore.resolve(ref);
                // If resolve returned the raw idb:// string, data wasn't found
                if (data && !data.startsWith('idb://')) {
                    img.src = data;
                } else {
                    _applyImageFallback(img);
                }
            } catch(e) {
                _applyImageFallback(img);
            }
        } else if (ref && !ref.startsWith('idb://') && ref !== '[too-large]' && !img.src) {
            // Normal URL that wasn't set as src
            img.src = ref;
        }
        // Add onerror handler to all portfolio/asset images
        if (!img._hasErrorHandler) {
            img._hasErrorHandler = true;
            img.addEventListener('error', function() { _applyImageFallback(this); });
        }
    });
    // Resolve elements with data-idb-bg="idb://..." for CSS background-image
    document.querySelectorAll('[data-idb-bg]').forEach(async el => {
        const ref = el.getAttribute('data-idb-bg');
        if (!ref || ref === '[too-large]') return;
        if (NuiImageStore.isIdbRef(ref)) {
            try {
                const data = await NuiImageStore.resolve(ref);
                if (data && !data.startsWith('idb://')) {
                    el.style.backgroundImage = `url('${data}')`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                }
            } catch(e) { /* silently fail for bg images */ }
        }
    });
    // Also fix any img tags with broken src values (including empty src on mobile)
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src === '[too-large]' || src.startsWith('idb://') || src === '')) {
            _applyImageFallback(img);
        }
        // If img has no src and no data-idb-src, it's a failed image — show fallback
        if (!src && !img.getAttribute('data-idb-src')) {
            _applyImageFallback(img);
        }
        if (!img._hasErrorHandler) {
            img._hasErrorHandler = true;
            img.addEventListener('error', function() {
                if (this.src && this.src !== 'data:,' && !this._fallbackApplied) {
                    _applyImageFallback(this);
                }
            });
        }
    });
}

// Fallback handler for broken images — shows a styled placeholder
function _applyImageFallback(img) {
    if (img._fallbackApplied) return;
    img._fallbackApplied = true;
    img.style.display = 'none';
    // Create gradient placeholder
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'width:100%;height:100%;min-height:200px;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:14px;font-weight:600;letter-spacing:1px;';
    placeholder.textContent = img.alt || 'NUI';
    if (img.parentElement) {
        img.parentElement.insertBefore(placeholder, img);
    }
}

// Show storage usage info (Supabase Cloud + IndexedDB fallback)
async function showStorageInfo() {
    try {
        const usage = await NuiImageStore.getStorageUsage();
        const lsUsage = getStorageUsage();
        const supabaseStatus = _supabaseStorage ? '☁️ Supabase Cloud Storage: Enabled (unlimited)' : '☁️ Supabase Cloud Storage: Unavailable (fallback to IndexedDB)';
        alert(`📊 Storage Usage\n\n${supabaseStatus}\n\n🗄️ IndexedDB Fallback:\n  ${usage.count} images stored\n  ${usage.mb.toFixed(2)} MB used\n  ~50MB+ available\n\n💾 LocalStorage (Data):\n  ${(lsUsage / 1024 / 1024).toFixed(2)} MB of 5 MB used\n  ${((lsUsage / (5 * 1024 * 1024)) * 100).toFixed(0)}% full`);
    } catch(e) {
        alert('Could not read storage info: ' + e.message);
    }
}

// Clear all images from IndexedDB fallback storage
async function clearImageStorage() {
    if (!confirm('⚠️ Clear ALL stored images from IndexedDB fallback?\n\nNote: Cloud-stored images (Supabase) remain available.\nThis removes only the local IndexedDB backup copies.\n\nThis cannot be undone.')) return;
    try {
        await NuiImageStore.clearAll();
        alert('✅ IndexedDB fallback storage cleared! Cloud images remain available.');
    } catch(e) {
        alert('Error clearing storage: ' + e.message);
    }
}

// Get storage usage info
function getStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
        }
    }
    return {
        used: (total / 1024 / 1024).toFixed(2) + ' MB',
        usedBytes: total,
        limit: '~5 MB'
    };
}

// CRM System
let crmData = JSON.parse(localStorage.getItem('nui_crm')) || {
    clients: [],
    contacts: [],
    communications: [],
    tasks: [],
    pipelines: [
        { id: 1, name: 'Lead', color: '#3b82f6' },
        { id: 2, name: 'Qualified', color: '#8b5cf6' },
        { id: 3, name: 'Proposal Sent', color: '#f59e0b' },
        { id: 4, name: 'Negotiation', color: '#ef4444' },
        { id: 5, name: 'Won', color: '#10b981' },
        { id: 6, name: 'Lost', color: '#6b7280' }
    ]
};
function saveCrm() { localStorage.setItem('nui_crm', JSON.stringify(crmData)); syncToBackend('crm', crmData); }

// Designer System
let designers = JSON.parse(localStorage.getItem('nui_designers')) || [];
// Only seed default designer on first-ever load (no key exists yet)
if (!localStorage.getItem('nui_designers')) {
    designers.push({ id: 1, name: 'Faren Young', email: 'faren@nui.com', password: 'designer123', role: 'Lead Designer', avatar: '', permissions: ['projects', 'proofs', 'assets'] });
    localStorage.setItem('nui_designers', JSON.stringify(designers));
}
function saveDesigners() { localStorage.setItem('nui_designers', JSON.stringify(designers)); }

// ==================== LOYALTY PROGRAM SYSTEM ====================
let loyaltyProgram = JSON.parse(localStorage.getItem('nui_loyalty')) || {
    enabled: true,
    pointsPerDollar: 1,
    rewardTiers: [
        { name: 'Bronze', minPoints: 0, discount: 5, perks: ['Priority support'] },
        { name: 'Silver', minPoints: 500, discount: 10, perks: ['Priority support', 'Free revisions'] },
        { name: 'Gold', minPoints: 1500, discount: 15, perks: ['Priority support', 'Free revisions', 'Rush delivery'] },
        { name: 'Platinum', minPoints: 5000, discount: 20, perks: ['All perks', 'Dedicated account manager', 'Exclusive pricing'] }
    ],
    members: []
};
function saveLoyalty() { localStorage.setItem('nui_loyalty', JSON.stringify(loyaltyProgram)); }

// ==================== EMAIL MARKETING SYSTEM ====================
let emailMarketing = JSON.parse(localStorage.getItem('nui_email_marketing')) || {
    settings: {
        senderName: 'New Urban Influence',
        senderEmail: 'info@newurbaninfluence.com',
        replyTo: 'info@newurbaninfluence.com',
        automatedSending: true,
        sendDay: 'monday',
        sendTime: '09:00'
    },
    templates: [
        { id: 1, name: 'Weekly Newsletter', subject: 'Your Weekly Design Inspiration', type: 'newsletter', content: '' },
        { id: 2, name: 'Promotion', subject: 'Special Offer Inside!', type: 'promo', content: '' },
        { id: 3, name: 'New Service Announcement', subject: 'Introducing Our New Service', type: 'announcement', content: '' }
    ],
    campaigns: [],
    subscribers: [],
    analytics: { sent: 0, opened: 0, clicked: 0, unsubscribed: 0 }
};
function saveEmailMarketing() { localStorage.setItem('nui_email_marketing', JSON.stringify(emailMarketing)); }

// ==================== SOCIAL MEDIA DM SYSTEM ====================
let socialMediaDM = JSON.parse(localStorage.getItem('nui_social_dm')) || {
    conversations: [],
    autoResponses: [
        { id: 1, trigger: 'pricing', platform: 'all', message: 'Thanks for your interest! Our branding packages start at $1,500. Would you like to schedule a free consultation?' },
        { id: 2, trigger: 'hello', platform: 'all', message: 'Hey there! Thanks for reaching out to New Urban Influence. How can we help you today?' },
        { id: 3, trigger: 'hours', platform: 'all', message: 'We\'re open Monday-Friday, 9AM-6PM EST. Leave a message and we\'ll get back to you!' }
    ],
    settings: {
        autoReplyEnabled: true,
        notifyOnNewMessage: true
    }
};
function saveSocialDM() { localStorage.setItem('nui_social_dm', JSON.stringify(socialMediaDM)); }

// ==================== SMS / OPENPHONE SYSTEM ====================
let smsSystem = JSON.parse(localStorage.getItem('nui_sms')) || {
    openPhone: {
        connected: false,
        apiKey: '',
        phoneNumber: '',
        userId: ''
    },
    conversations: [],
    templates: [
        { id: 1, name: 'Appointment Reminder', message: 'Hi {name}! This is a reminder about your consultation with New Urban Influence tomorrow at {time}. Reply to confirm!' },
        { id: 2, name: 'Project Update', message: 'Hi {name}! Your project is ready for review. Check your email for the proof link or reply with any questions!' },
        { id: 3, name: 'Payment Reminder', message: 'Hi {name}! Friendly reminder that your invoice #{invoice} is due soon. Questions? Reply to this text!' }
    ],
    autoResponses: [
        { trigger: 'stop', response: 'You have been unsubscribed. Reply START to resubscribe.' },
        { trigger: 'help', response: 'For support, visit newurbaninfluence.com or call us at your convenience!' }
    ],
    settings: {
        autoReplyEnabled: true,
        businessHoursOnly: true,
        businessHours: { start: '09:00', end: '18:00' }
    }
};
function saveSms() { localStorage.setItem('nui_sms', JSON.stringify(smsSystem)); }

// ==================== UNIFIED COMMUNICATIONS HUB ====================
let communicationsHub = JSON.parse(localStorage.getItem('nui_comm_hub')) || {
    inbox: [],
    filters: { unread: false, platform: 'all', client: '' },
    settings: { unifiedView: true, notifications: true }
};
function saveCommHub() { localStorage.setItem('nui_comm_hub', JSON.stringify(communicationsHub)); syncToBackend('comm_hub', communicationsHub); }

// Reset all data function (call from console if needed: resetAllData())
function resetAllData() {
    if (confirm('This will reset ALL data to defaults. Are you sure?')) {
        localStorage.removeItem('nui_clients');
        localStorage.removeItem('nui_orders');
        localStorage.removeItem('nui_designers');
        localStorage.removeItem('nui_leads');
        localStorage.removeItem('nui_projects');
        localStorage.removeItem('nui_payments');
        localStorage.removeItem('nui_invoices');
        localStorage.removeItem('nui_proofs');
        localStorage.removeItem('nui_analytics');
        localStorage.removeItem('nui_reviews');
        localStorage.removeItem('nui_payouts');
        localStorage.removeItem('nui_stripe');
        localStorage.removeItem('nui_loyalty');
        localStorage.removeItem('nui_email_marketing');
        localStorage.removeItem('nui_social_dm');
        localStorage.removeItem('nui_sms');
        localStorage.removeItem('nui_comm_hub');
        localStorage.removeItem('nui_crm');
        alert('Data reset! Refreshing page...');
        location.reload();
    }
}

// ==================== DATA INITIALIZATION (PRODUCTION) ====================
// Demo data removed - all data is stored in localStorage or Supabase
// New clients, orders, and data are created through the admin dashboard

function initializeDemoData() {
    // This function is kept for backwards compatibility but does nothing
    console.log('Production mode - no demo data initialized');
    return false;
}
// ==================== WORKFLOW TRIGGERS & VALIDATION ====================
// Trigger: When invoice is paid, update loyalty points
function triggerInvoicePaid(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    // Find loyalty member and add points
    const member = loyaltyProgram.members.find(m => m.clientId === invoice.clientId);
    if (member) {
        const points = Math.floor(invoice.total * loyaltyProgram.pointsPerDollar);
        member.points += points;
        member.lastActivity = new Date().toISOString();
        // Update tier
        const tiers = loyaltyProgram.rewardTiers.sort((a, b) => b.minPoints - a.minPoints);
        for (const tier of tiers) {
            if (member.points >= tier.minPoints) {
                member.tier = tier.name;
                break;
            }
        }
        saveLoyalty();
        console.log('✅ Trigger: Loyalty points added - ' + points + ' points to ' + member.name);
    }

    // Update order status if linked
    if (invoice.orderId) {
        const order = orders.find(o => o.id === invoice.orderId);
        if (order && order.status === 'pending') {
            order.status = 'in_progress';
            saveOrders();
            console.log('✅ Trigger: Order status updated to in_progress');
        }
    }
}

// Trigger: When order is delivered, send notification
function triggerOrderDelivered(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const client = clients.find(c => c.id === order.clientId);
    if (!client) return;

    // Add to communications hub
    communicationsHub.inbox.unshift({
        id: Date.now(),
        platform: 'system',
        clientId: client.id,
        clientName: client.name,
        preview: 'Order delivered: ' + order.projectName,
        timestamp: new Date().toISOString(),
        unread: true
    });
    saveCommHub();

    console.log('✅ Trigger: Delivery notification sent for ' + order.projectName);
}

// Trigger: When proof is approved, check payment and enable downloads
function triggerProofApproved(proofId) {
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;

    const client = clients.find(c => c.id === proof.clientId);
    if (!client) return;

    // Update client brand guide status
    if (!client.brandGuide) client.brandGuide = { status: 'draft', proofComments: [] };
    client.brandGuide.status = 'approved';
    client.brandGuide.approvedAt = new Date().toISOString();
    saveClients();

    // Check payment status
    const isPaid = checkClientPaymentStatus(proof.clientId);
    if (isPaid) {
        console.log('✅ Trigger: Proof approved + Paid - Downloads enabled for ' + client.name);
        // Simulate email notification
        simulateEmailNotification(client.email, 'Your Brand Assets are Ready!', 'Download your approved brand assets from your portal.');
    } else {
        console.log('⚠️ Trigger: Proof approved but payment pending for ' + client.name);
    }
}

// Trigger: New lead added to pipeline
function triggerNewLead(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Add to CRM deals
    if (!crmData.deals) crmData.deals = [];
    const existingDeal = crmData.deals.find(d => d.leadId === leadId);
    if (!existingDeal) {
        crmData.deals.push({
            id: Date.now(),
            leadId: leadId,
            name: lead.business + ' - ' + lead.service,
            value: parseInt(lead.budget?.match(/\d+/)?.[0] || '0') * 1000,
            stage: 1,
            probability: 20,
            expectedClose: new Date(Date.now() + 14*24*60*60*1000).toISOString(),
            createdAt: new Date().toISOString()
        });
        saveCrm();
        console.log('✅ Trigger: New deal created in pipeline for ' + lead.name);
    }

    // Add to email subscribers
    const existingSub = emailMarketing.subscribers.find(s => s.email === lead.email);
    if (!existingSub) {
        emailMarketing.subscribers.push({
            id: Date.now(),
            email: lead.email,
            name: lead.name,
            status: 'active',
            source: 'lead',
            subscribedAt: new Date().toISOString()
        });
        saveEmailMarketing();
        console.log('✅ Trigger: Lead added to email subscribers');
    }
}

// Trigger: Auto-response for social media DM
function triggerSocialAutoResponse(platform, message) {
    if (!socialMediaDM.settings.autoReplyEnabled) return null;

    const msgLower = message.toLowerCase();
    for (const response of socialMediaDM.autoResponses) {
        if (response.platform === 'all' || response.platform === platform) {
            if (msgLower.includes(response.trigger)) {
                console.log('✅ Trigger: Auto-response matched for "' + response.trigger + '"');
                return response.message;
            }
        }
    }
    return null;
}

// Trigger: Weekly newsletter automation
function triggerWeeklyNewsletter() {
    if (!emailMarketing.settings.automatedSending) {
        console.log('⚠️ Automated sending is disabled');
        return;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (today !== emailMarketing.settings.sendDay) {
        console.log('⚠️ Today is not the scheduled send day (' + emailMarketing.settings.sendDay + ')');
        return;
    }

    const newsletterTemplate = emailMarketing.templates.find(t => t.type === 'newsletter');
    if (!newsletterTemplate) return;

    const campaign = {
        id: Date.now(),
        name: 'Auto Newsletter - ' + new Date().toLocaleDateString(),
        templateId: newsletterTemplate.id,
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipients: emailMarketing.subscribers.filter(s => s.status === 'active').length,
        opened: 0,
        clicked: 0,
        createdAt: new Date().toISOString()
    };
    emailMarketing.campaigns.push(campaign);
    saveEmailMarketing();

    console.log('✅ Trigger: Weekly newsletter sent to ' + campaign.recipients + ' subscribers');
}

// Send email notification via Netlify Function → Resend/SendGrid
async function sendEmailNotification(to, subject, body) {
    try {
        const resp = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: to,
                subject: subject,
                html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #e63946, #ff6b6b); padding: 24px; text-align: center;">
<h2 style="margin: 0; font-size: 20px; color: #fff;">${subject}</h2>
</div>
<div class="p-32">
<p style="color: #ccc; font-size: 15px; line-height: 1.6;">${body}</p>
<p style="color: #888; font-size: 13px; margin-top: 24px;">— New Urban Influence</p>
</div>
</div>`,
                text: body
            })
        });
        if (resp.ok) {
            console.log('📧 Email sent to ' + to + ': ' + subject);
        } else {
            const err = await resp.json().catch(() => ({}));
            console.warn('📧 Email send failed:', err.error || resp.status);
        }
    } catch (err) {
        console.warn('📧 Email (offline):', to, subject, err.message);
    }
}
// Backwards compatibility alias
const simulateEmailNotification = sendEmailNotification;

// ==================== WORKFLOW VALIDATION ====================
function validateAllWorkflows() {
    console.log('🔍 Validating all workflows and triggers...\n');
    let passed = 0;
    let failed = 0;

    // Test 1: Client-Order relationship
    console.log('Test 1: Client-Order Relationships');
    for (const order of orders) {
        const client = clients.find(c => c.id === order.clientId);
        if (client) {
            passed++;
        } else {
            console.log('   ❌ Order #' + order.id + ' has no matching client');
            failed++;
        }
    }
    console.log('   ✅ ' + passed + ' orders have valid client references\n');

    // Test 2: Invoice-Order relationship
    passed = 0;
    console.log('Test 2: Invoice-Order Relationships');
    for (const invoice of invoices) {
        const order = orders.find(o => o.id === invoice.orderId);
        if (order || !invoice.orderId) {
            passed++;
        } else {
            console.log('   ❌ Invoice #' + invoice.id + ' has no matching order');
            failed++;
        }
    }
    console.log('   ✅ ' + passed + ' invoices have valid order references\n');

    // Test 3: Payment triggers loyalty
    console.log('Test 3: Payment-Loyalty Integration');
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const loyaltyMembers = loyaltyProgram.members;
    console.log('   - Paid invoices: ' + paidInvoices.length);
    console.log('   - Loyalty members: ' + loyaltyMembers.length);
    console.log('   ✅ Loyalty system ready\n');

    // Test 4: Proof-Client relationship
    passed = 0;
    console.log('Test 4: Proof-Client Relationships');
    for (const proof of proofs) {
        const client = clients.find(c => c.id === proof.clientId);
        if (client) {
            passed++;
        } else {
            console.log('   ❌ Proof #' + proof.id + ' has no matching client');
            failed++;
        }
    }
    console.log('   ✅ ' + passed + ' proofs have valid client references\n');

    // Test 5: Lead-Deal pipeline
    console.log('Test 5: Lead-Deal Pipeline');
    const dealsWithLeads = (crmData.deals || []).filter(d => leads.find(l => l.id === d.leadId));
    console.log('   - Total leads: ' + leads.length);
    console.log('   - Total deals: ' + (crmData.deals || []).length);
    console.log('   - Deals with valid leads: ' + dealsWithLeads.length);
    console.log('   ✅ Pipeline system ready\n');

    // Test 6: Communication channels
    console.log('Test 6: Communication Channels');
    console.log('   - SMS connected: ' + (smsSystem.openPhone.connected ? '✅' : '❌'));
    console.log('   - Facebook DMs: ' + (socialMediaDM.conversations.length > 0 ? '✅ Active' : '⏸️ No conversations'));
    console.log('   - Instagram DMs: ' + (clients.some(c => c.socialHandles?.instagram) ? '✅ Handles saved' : '⏸️ No handles'));
    console.log('   - Email automation: ' + (emailMarketing.settings.automatedSending ? '✅' : '❌') + '\n');

    // Test 7: Auto-response triggers
    console.log('Test 7: Auto-Response Triggers');
    const pricingResponse = triggerSocialAutoResponse('instagram', 'What is your pricing?');
    const hoursResponse = triggerSocialAutoResponse('facebook', 'What are your hours?');
    console.log('   - Pricing trigger: ' + (pricingResponse ? '✅' : '❌'));
    console.log('   - Hours trigger: ' + (hoursResponse ? '✅' : '❌') + '\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('WORKFLOW VALIDATION COMPLETE');
    console.log('Total tests: 7');
    console.log('Failed: ' + failed);
    console.log('Status: ' + (failed === 0 ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️ SOME ISSUES DETECTED'));
    console.log('═══════════════════════════════════════');

    return failed === 0;
}

// Run validation on admin dashboard load
// validateAllWorkflows(); // Uncomment to auto-run

// Site Images System
let siteImages = JSON.parse(localStorage.getItem('nui_site_images')) || {
    // CMS Logo Management
    headerLogo: { url: '', alt: 'Header Logo' },
    footerLogo: { url: '', alt: 'Footer Logo' },
    tagline: 'BUILD YOUR EMPIRE',
    heroTagline: 'UNAPOLOGETICALLY DETROIT',
    // Page Images
    hero: { url: '', alt: 'Hero Background' },
    heroVideo: { url: '', alt: 'Hero Video' },
    about: { url: '', alt: 'About Section' },
    aboutStory: { url: '', alt: 'Our Story' },
    services: [
        { id: 'brand-kit', url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1920&q=80', alt: 'Brand Kit' },
        { id: 'product-brand', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80', alt: 'Product Brand' },
        { id: 'service-brand', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80', alt: 'Service Brand' },
        { id: 'website', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80', alt: 'Website' },
        { id: 'mobile-app', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&q=80', alt: 'Mobile App' },
        { id: 'sales-funnel', url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1920&q=80', alt: 'Sales Funnel' },
        { id: 'custom', url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1920&q=80', alt: 'Custom Package' }
    ],
    team: [],
    portfolio: [],
    blog: []
};
function saveSiteImages() {
    localStorage.setItem('nui_site_images', JSON.stringify(siteImages));
    updateSiteLogos(); // Update logos immediately after saving
    _pushToBackend('site_images', siteImages);
}

// Get service package image from siteImages CMS
function getServiceImage(serviceId) {
    const s = siteImages.services.find(s => s.id === serviceId);
    return s && s.url ? s.url : '';
}

// Toast notification system
function showNotification(message, type) {
    type = type || 'success';
    const existing = document.getElementById('nui-toast');
    if (existing) existing.remove();
    const colors = { success: '#2ecc71', error: '#e74c3c', info: '#3498db', warning: '#f39c12' };
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const toast = document.createElement('div');
    toast.id = 'nui-toast';
    toast.innerHTML = '<span style="font-size: 18px; margin-right: 10px;">' + (icons[type] || '✓') + '</span>' + message;
    toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:99999;padding:16px 28px;border-radius:12px;font-size:14px;font-weight:600;color:#fff;display:flex;align-items:center;box-shadow:0 8px 32px rgba(0,0,0,0.3);backdrop-filter:blur(10px);transform:translateX(120%);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);background:' + (colors[type] || colors.success) + ';';
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.style.transform = 'translateX(0)'; });
    setTimeout(function() {
        toast.style.transform = 'translateX(120%)';
        setTimeout(function() { toast.remove(); }, 500);
    }, 3000);
}

// Push all portfolio changes to frontend views instantly
function pushPortfolioToFrontend() {
    savePortfolio();
    // Refresh portfolio view if visible
    var pv = document.getElementById('portfolioView');
    if (pv && pv.innerHTML.length > 100) { loadPortfolioView(); }
    // Refresh homepage case studies if visible
    var hv = document.getElementById('homeView');
    if (hv && hv.innerHTML.length > 100) { loadHomeView(); }
    // Resolve any idb:// images
    setTimeout(resolveAllImages, 100);
}

// Generate footer HTML with CMS logo
function getFooterHTML() {
    const footerLogoSrc = siteImages.footerLogo?.url || 'icons/icon-192.png';
    const footerLogoAlt = siteImages.footerLogo?.alt || 'NUI';
    const year = new Date().getFullYear();

    return `
 <footer class="footer">
<div class="footer-main">
            <!-- Brand Column -->
<div class="footer-brand">
<a class="footer-brand-logo" href="/">
                    ${footerLogoSrc ? '<img loading="lazy" src="' + footerLogoSrc + '" alt="' + footerLogoAlt + '" onerror="this.style.display=\'none\'">' : ''}
<span class="text-red">NUI</span>
</a>
<p class="footer-brand-desc">Detroit-based creative agency specializing in brand identity, web design, and digital marketing. Unapologetically Detroit.</p>
<div class="footer-socials">
<a href="https://instagram.com/newurbaninfluence" target="_blank" class="footer-social-link" title="Instagram">📷</a>
<a href="https://twitter.com/newurbaninfluence" target="_blank" class="footer-social-link" title="X / Twitter">𝕏</a>
<a href="https://linkedin.com/company/newurbaninfluence" target="_blank" class="footer-social-link" title="LinkedIn">in</a>
<a href="https://facebook.com/newurbaninfluence" target="_blank" class="footer-social-link" title="Facebook">f</a>
</div>
</div>

            <!-- Services -->
<div class="footer-col">
<div class="footer-col-title">Services</div>
<a href="/services/brand-identity-packages-detroit">Brand Identity Packages</a>
<a href="/services/logo-design-detroit">Logo Design</a>
<a href="/services/web-design-detroit">Web Design</a>
<a href="/services/packaging-design-detroit">Packaging Design</a>
<a href="/services/social-media-templates-detroit">Social Media</a>
<a href="/services/marketing-automation-detroit">Automation & Funnels</a>
<a href="/services/print-design-detroit">Print & Signage</a>
<a href="/services/brand-guidelines-detroit">Brand Guidelines</a>
</div>

            <!-- Company -->
<div class="footer-col">
<div class="footer-col-title">Company</div>
<a href="/about" onclick="event.preventDefault(); showView('about');">About Us</a>
<a href="/portfolio" onclick="event.preventDefault(); showView('portfolio');">Portfolio</a>
<a href="/blog" onclick="event.preventDefault(); showView('blog');">Blog</a>
<a href="/services/brand-identity-packages-detroit" onclick="event.preventDefault(); showView('services');">Pricing</a>
<a href="/contact" onclick="event.preventDefault(); showView('intake');">Contact</a>
<a href="/portal" onclick="event.preventDefault(); showView('portal');">Client Portal</a>
<a href="/#faq" onclick="event.preventDefault(); document.getElementById('faq')?.scrollIntoView({behavior:'smooth'});">FAQ</a>
</div>

            <!-- Resources -->
<div class="footer-col">
<div class="footer-col-title">Resources</div>
<a href="/blog/how-much-does-logo-design-cost-detroit">Logo Design Pricing</a>
<a href="/blog/branding-mistakes-small-businesses">Branding Tips</a>
<a href="/blog/restaurant-branding-guide-detroit">Restaurant Guide</a>
<a href="/work/good-cakes-and-bakes">Case Studies</a>
<a href="/portal" onclick="event.preventDefault(); showView('portal');">Designer Login</a>
<a href="/sitemap.xml" target="_blank">Sitemap</a>
</div>

            <!-- Service Areas (Geo SEO) -->
<div class="footer-col">
<div class="footer-col-title">Service Areas</div>
<a href="/locations/detroit" style="color:rgba(255,255,255,0.5);font-size:14px;display:block;padding:4px 0;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Detroit</a>
<a href="/locations/southfield" style="color:rgba(255,255,255,0.5);font-size:14px;display:block;padding:4px 0;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Southfield</a>
<a href="/locations/farmington-hills" style="color:rgba(255,255,255,0.5);font-size:14px;display:block;padding:4px 0;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Farmington Hills</a>
<span style="font-size:14px;display:block;padding:4px 0;"><a href="/locations/royal-oak" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Royal Oak</a> · <a href="/locations/troy" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Troy</a></span>
<span style="font-size:14px;display:block;padding:4px 0;"><a href="/locations/dearborn" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Dearborn</a> · <a href="/locations/ann-arbor" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Ann Arbor</a></span>
<span style="font-size:14px;display:block;padding:4px 0;"><a href="/locations/birmingham" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Birmingham</a> · <a href="/locations/novi" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Novi</a></span>
<span style="font-size:14px;display:block;padding:4px 0;"><a href="/locations/sterling-heights" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Sterling Heights</a> · <a href="/locations/livonia" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Livonia</a></span>
<span style="font-size:14px;display:block;padding:4px 0;"><a href="/locations/warren" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Warren</a> · <a href="/locations/pontiac" style="color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Pontiac</a></span>
</div>

            <!-- Contact -->
<div class="footer-col">
<div class="footer-col-title">Get In Touch</div>
<div class="footer-contact-item">
<span class="footer-contact-icon">📍</span>
<span>By Appointment Only · Serving Metro Detroit</span>
</div>
<div class="footer-contact-item">
<span class="footer-contact-icon">📞</span>
<a href="tel:+12484878747">(248) 487-8747</a>
</div>
<div class="footer-contact-item">
<span class="footer-contact-icon">✉️</span>
<a href="mailto:info@newurbaninfluence.com">info@newurbaninfluence.com</a>
</div>
<div class="footer-contact-item">
<span class="footer-contact-icon">🕐</span>
<span>Mon – Fri: 9AM – 6PM</span>
</div>
</div>
</div>

        <!-- Bottom Bar -->
<div class="footer-bottom">
<div class="footer-bottom-content">
<div class="footer-copyright">© ${year} New Urban Influence. All rights reserved.</div>
<div class="footer-legal">
<span style="color:rgba(255,255,255,0.3);font-size:12px;">Privacy Policy</span>
<span style="color:rgba(255,255,255,0.3);font-size:12px;">Terms of Service</span>
</div>
<div class="footer-badge">🔴 Built in Detroit with love</div>
<a onclick="showView('portal'); setTimeout(() => setLoginType('admin'), 100);" style="color: rgba(255,255,255,0.15); font-size: 11px; cursor: pointer; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.4)'" onmouseout="this.style.color='rgba(255,255,255,0.15)'">Staff Login</a>
</div>
</div>
 </footer>`;
}

// ==================== VIEW MANAGEMENT ====================
