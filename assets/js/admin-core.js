// ==================== ADMIN CORE ====================
// Panel router, Dashboard, Calendar, Sidebar, User Mgmt, Render Helpers, Stripe, Integrations

// ZONE 6: Breadcrumb navigation system
// Injects dynamic breadcrumb bar below admin header as user navigates panels
var _nuiBreadcrumbMap = {
    'moodboard': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Projects', action: "showAdminPanel('projects')" },
        { label: 'Moodboards', action: '' }
    ],
    'brandguide': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Projects', action: "showAdminPanel('projects')" },
        { label: 'Brand Guides', action: '' }
    ],
    'proofs': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Projects', action: "showAdminPanel('projects')" },
        { label: 'Proofs & Deliverables', action: '' }
    ],
    'delivery': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Projects', action: "showAdminPanel('projects')" },
        { label: 'Delivery', action: '' }
    ],
    'orders': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Orders', action: '' }
    ],
    'neworder': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Orders', action: "showAdminPanel('orders')" },
        { label: 'New Order', action: '' }
    ],
    'invoices': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Payments', action: "showAdminPanel('payments')" },
        { label: 'Invoices', action: '' }
    ],
    'clients': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Clients', action: '' }
    ],
    'newclient': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Clients', action: "showAdminPanel('clients')" },
        { label: 'New Client', action: '' }
    ],
    'migrateclient': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Clients', action: "showAdminPanel('clients')" },
        { label: 'Migrate Existing Client', action: '' }
    ],
    'contacthub': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Contact Hub', action: '' }
    ],
    'rankintel': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'SEO', action: "showAdminPanel('seo')" },
        { label: 'Rank Intel', action: '' }
    ],
    'retargeting': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'Retargeting', action: '' }
    ],
    'gmb': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'SEO', action: "showAdminPanel('seo')" },
        { label: 'Google Business', action: '' }
    ],
    'citations': [
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: 'SEO', action: "showAdminPanel('seo')" },
        { label: 'Citations', action: '' }
    ]
};

function injectBreadcrumb(crumbs) {
    var bar = document.getElementById('nuiBreadcrumb');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'nuiBreadcrumb';
        bar.style.cssText = 'padding:8px 24px;background:rgba(0,0,0,0.3);font-size:13px;color:#888;border-bottom:1px solid rgba(255,255,255,0.05);';
        var adminHeader = document.querySelector('.admin-header') || document.querySelector('#adminView > div:first-child');
        if (adminHeader && adminHeader.parentElement) {
            adminHeader.parentElement.insertBefore(bar, adminHeader.nextSibling);
        }
    }
    bar.innerHTML = crumbs.map(function(c, i) {
        if (i === crumbs.length - 1) {
            return '<span style="color:#fff;">' + c.label + '</span>';
        }
        return '<a href="#" onclick="' + c.action + '; return false;" style="color:#888;text-decoration:none;">' + c.label + '</a>';
    }).join(' <span style="color:#555;margin:0 8px;">›</span> ');
}

function showAdminPanel(panel) {
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-panel="${panel}"]`);
    if (activeLink) activeLink.classList.add('active');
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const panelEl = document.getElementById('admin' + panel.charAt(0).toUpperCase() + panel.slice(1) + 'Panel');
    if (panelEl) panelEl.classList.add('active');

    // Load panel content
    // Check white-label module access
    if (typeof _panelToModule !== 'undefined' && typeof isModuleEnabled === 'function') {
        const modKey = _panelToModule[panel];
        if (modKey && !isModuleEnabled(modKey)) {
            console.log(`Module "${modKey}" is disabled for this instance`);
            showAdminPanel('dashboard');
            return;
        }
    }
    // Check role-based access
    if (!canAccessPanel(panel)) {
        alert('You do not have permission to access this panel.');
        return;
    }

    const panelLoaders = {
        'dashboard': loadAdminDashboardPanel,
        'calendar': loadAdminCalendarPanel,
        'analytics': loadAdminAnalyticsPanel,
        'reviews': loadAdminReviewsPanel,
        'crm': loadAdminCrmPanel,
        'clients': loadAdminClientsPanel,
        'orders': loadAdminOrdersPanel,
        'neworder': loadAdminNewOrderPanel,
        'leads': loadAdminLeadsPanel,
        'contacthub': loadAdminContactHubPanel,
        'submissions': loadAdminSubmissionsPanel,
        'projects': loadAdminProjectsPanel,
        'proofs': loadAdminProofsPanel,
        'brandguide': loadAdminBrandGuidePanel,
        'delivery': loadAdminDeliveryPanel,
        'payments': loadAdminPaymentsPanel,
        'invoices': loadAdminInvoicesPanel,
        'payouts': loadAdminPayoutsPanel,
        'stripe': loadAdminStripePanel,
        'seo': loadAdminSeoPanel,
        'rankintel': loadAdminRankIntelPanel,
        'gmb': loadAdminGmbPanel,
        'blog': loadAdminBlogPanel,
        'emailmarketing': loadAdminEmailMarketingPanel,
        'socialplanner': loadAdminSocialPlannerPanel,
        'push': loadAdminPushPanel,
        'retargeting': loadAdminRetargetingPanel,
        'loyalty': loadAdminLoyaltyPanel,
        'communications': loadAdminCommunicationsPanel,
        'socialdm': loadAdminSocialDmPanel,
        'sms': loadAdminSmsPanel,
        'siteimages': loadAdminSiteImagesPanel,
        'newclient': loadAdminNewClientPanel,
        'migrateclient': loadAdminMigrateClientPanel,
        'assets': loadAdminAssetsPanel,
        'portfolio': loadAdminPortfolioPanel,
        'moodboard': loadAdminMoodboardPanel,
        'about': loadAdminAboutPanel,
        'designers': loadAdminDesignersPanel,
        'integrations': loadAdminIntegrationsPanel,
        'usermanagement': loadAdminUserManagementPanel,
        'monty': loadAdminMontyPanel,
        'sites': loadAdminSitesPanel,
        'subaccounts': loadAdminSubAccountsPanel,
        'visitors': loadAdminVisitorsPanel,
        'citations': loadAdminCitationsPanel,
        'agents': loadAdminAgentsPanel,
        'blogger': loadAdminAgentsPanel
    };
    if (panelLoaders[panel]) panelLoaders[panel]();

    // ZONE 6: Inject breadcrumbs after panel loads
    if (_nuiBreadcrumbMap[panel]) {
        injectBreadcrumb(_nuiBreadcrumbMap[panel]);
    } else if (panel !== 'dashboard') {
        injectBreadcrumb([
            { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
            { label: panel.charAt(0).toUpperCase() + panel.slice(1), action: '' }
        ]);
    } else {
        // Dashboard — remove breadcrumb bar
        var bcBar = document.getElementById('nuiBreadcrumb');
        if (bcBar) bcBar.innerHTML = '';
    }

    // Init mobile nav on first panel load
    if (typeof initAdminMobileNav === 'function') initAdminMobileNav();
}


// ==================== MOBILE NAV ====================
function initAdminMobileNav() {
    var btn = document.getElementById('adminMobileToggle');
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';

    var overlay = document.getElementById('adminSidebarOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'admin-sidebar-overlay';
        overlay.id = 'adminSidebarOverlay';
        document.body.appendChild(overlay);
    }

    var sidebar = document.getElementById('adminSidebar');

    function openNav() {
        if (sidebar) sidebar.classList.add('open');
        overlay.classList.add('open');
        btn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeNav() {
        if (sidebar) sidebar.classList.remove('open');
        overlay.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', function() {
        btn.classList.contains('open') ? closeNav() : openNav();
    });
    overlay.addEventListener('click', closeNav);

    document.addEventListener('click', function(e) {
        var link = e.target.closest('.admin-nav-link');
        if (link && window.innerWidth <= 768) closeNav();
    });
}

// ==================== ADMIN PANELS ====================
function loadAdminDashboardPanel() {
    // Safety: ensure globals are always arrays before use
    if (!Array.isArray(window.clients)) window.clients = JSON.parse(localStorage.getItem('nui_clients') || '[]');
    if (!Array.isArray(window.orders)) window.orders = JSON.parse(localStorage.getItem('nui_orders') || '[]');
    if (!Array.isArray(window.invoices)) window.invoices = JSON.parse(localStorage.getItem('nui_invoices') || '[]');

    const totalAssets = clients.reduce((sum, c) => sum + (c.assets ? Object.values(c.assets).flat().length : 0), 0);
    const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.estimate || 0), 0);
    const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.estimate || 0), 0);
    const avgReview = siteAnalytics.googleReviews?.avgRating || 4.8;
    const reviewCount = siteAnalytics.googleReviews?.count || 47;
    const outstandingRev = totalRevenue - paidRevenue;

    // Recent activity feed
    const recentActivity = [
        ...orders.slice(-5).reverse().map(o => ({
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
            text: o.projectName,
            sub: clients.find(c => c.id === o.clientId)?.name || 'Client',
            badge: o.status.replace('_',' '),
            badgeColor: o.status === 'delivered' ? '#10b981' : o.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
            time: o.createdAt ? timeAgo(o.createdAt) : ''
        })),
        ...clients.slice(-3).reverse().map(c => ({
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            text: c.name,
            sub: c.industry || 'New client',
            badge: 'client',
            badgeColor: '#8b5cf6',
            time: c.createdAt ? timeAgo(c.createdAt) : ''
        }))
    ].slice(0, 6);

    function timeAgo(d) {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        return Math.floor(hrs / 24) + 'd ago';
    }

    document.getElementById('adminDashboardPanel').innerHTML = `
<!-- Dashboard Banner -->
<div style="position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 28px; height: 160px;">
    <!-- Red/black gradient background -->
    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #0a0a0a 0%, #1a0508 30%, #2a0a0e 50%, #1a0508 70%, #0a0a0a 100%);">
        <!-- Red mesh orbs -->
        <div style="position: absolute; top: -40px; right: -20px; width: 280px; height: 280px; background: radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%); filter: blur(40px);"></div>
        <div style="position: absolute; bottom: -60px; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(180,20,20,0.12) 0%, transparent 70%); filter: blur(50px);"></div>
        <div style="position: absolute; top: 20px; left: 45%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,50,50,0.1) 0%, transparent 70%); filter: blur(35px);"></div>
        <!-- Noise texture -->
        <div style="position: absolute; inset: 0; opacity: 0.4; background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E'); background-size: 200px;"></div>
        <!-- Grid lines -->
        <div style="position: absolute; inset: 0; opacity: 0.03; background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>
    <!-- Banner content -->
    <div style="position: relative; z-index: 1; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 32px;">
        <div>
            <h2 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0; letter-spacing: -0.5px;">Welcome back, ${currentUser?.name?.split(' ')[0] || 'Admin'}</h2>
            <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 4px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
            <button onclick="syncAllData()" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; backdrop-filter: blur(10px);" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                Sync
            </button>
            <div style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: ${_backendAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; border: 1px solid ${_backendAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border-radius: 8px; backdrop-filter: blur(10px);">
                <span style="width: 6px; height: 6px; background: ${_backendAvailable ? '#10b981' : '#ef4444'}; border-radius: 50%;"></span>
                <span style="font-size: 12px; color: ${_backendAvailable ? '#10b981' : '#ef4444'}; font-weight: 500;">${_backendAvailable ? 'Synced' : 'Offline'}</span>
            </div>
        </div>
    </div>
</div>

<!-- Bento Grid -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: auto; gap: 16px;">

    <!-- Stat: Clients -->
    <div onclick="showAdminPanel('clients')" class="dash-card" style="cursor: pointer;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(139,92,246,0.12); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -1px;">${clients.length}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 500; margin-top: 2px;">Active Clients</div>
    </div>

    <!-- Stat: Orders -->
    <div onclick="showAdminPanel('orders')" class="dash-card-red" style="cursor: pointer;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(59,130,246,0.12); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -1px;">${orders.length}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 500; margin-top: 2px;">Total Orders</div>
    </div>

    <!-- Stat: In Progress -->
    <div onclick="showAdminPanel('projects')" class="dash-card" style="cursor: pointer;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245,158,11,0.12); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span style="padding: 4px 10px; background: rgba(245,158,11,0.12); border-radius: 20px; font-size: 11px; color: #f59e0b; font-weight: 600;">${pendingOrders > 0 ? pendingOrders + ' active' : 'None'}</span>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -1px;">${pendingOrders}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 500; margin-top: 2px;">In Progress</div>
    </div>

    <!-- Stat: Site Visitors -->
    <div onclick="showAdminPanel('analytics')" class="dash-card-red" style="cursor: pointer;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16,185,129,0.12); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -1px;">${(siteAnalytics.visitors?.total || 2847).toLocaleString()}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 500; margin-top: 2px;">Site Visitors</div>
    </div>

    <!-- Revenue Card (spans 2 cols) -->
    <div class="dash-card" style="grid-column: span 2;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,68,68,0.1); display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px;">Revenue</span>
            </div>
            <button onclick="showAdminPanel('payments')" style="padding: 6px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer;">View All</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 500; margin-bottom: 6px;">Total</div>
                <div style="font-size: 24px; font-weight: 700; color: #fff;">$${totalRevenue.toLocaleString()}</div>
            </div>
            <div style="background: rgba(16,185,129,0.06); border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; color: rgba(16,185,129,0.6); font-weight: 500; margin-bottom: 6px;">Collected</div>
                <div style="font-size: 24px; font-weight: 700; color: #10b981;">$${paidRevenue.toLocaleString()}</div>
            </div>
            <div style="background: rgba(245,158,11,0.06); border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; color: rgba(245,158,11,0.6); font-weight: 500; margin-bottom: 6px;">Outstanding</div>
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">$${outstandingRev.toLocaleString()}</div>
            </div>
        </div>
        ${totalRevenue > 0 ? `<div style="margin-top: 16px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ${Math.round(paidRevenue/totalRevenue*100)}%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 4px;"></div></div><div style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 6px;">${Math.round(paidRevenue/totalRevenue*100)}% collected</div>` : ''}
    </div>

    <!-- Reviews Card -->
    <div class="dash-card-red" onclick="showAdminPanel('reviews')" style="cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(245,158,11,0.1); display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px;">Reviews</span>
        </div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-size: 36px; font-weight: 800; color: #f59e0b;">${avgReview}</span>
            <div style="display: flex; gap: 2px;">${'★'.repeat(Math.floor(avgReview)).split('').map(() => '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}</div>
        </div>
        <div style="color: rgba(255,255,255,0.35); font-size: 12px; margin-top: 4px;">${reviewCount} Google reviews</div>
    </div>

    <!-- Quick Actions Card -->
    <div class="dash-card">
        <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Quick Actions</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button onclick="showAdminPanel('orders')" class="dash-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Order
            </button>
            <button onclick="showAdminPanel('clients')" class="dash-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Add Client
            </button>
            <button onclick="showAdminPanel('invoicing')" class="dash-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Send Invoice
            </button>
        </div>
    </div>

    <!-- Activity Feed (spans 2 cols) -->
    <div class="dash-card-red" style="grid-column: span 2;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px;">Recent Activity</span>
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0;">
            ${recentActivity.length === 0 ? '<div style="color: rgba(255,255,255,0.25); font-size: 13px; padding: 20px 0; text-align: center;">No recent activity</div>' :
            recentActivity.map((a, i) => `
                <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0; ${i < recentActivity.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.04);' : ''}">
                    <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); flex-shrink: 0;">${a.icon}</div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.text}</div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.3);">${a.sub}</div>
                    </div>
                    <span style="padding: 3px 10px; background: ${a.badgeColor}18; border-radius: 20px; font-size: 10px; color: ${a.badgeColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;">${a.badge}</span>
                    <span style="font-size: 11px; color: rgba(255,255,255,0.2); flex-shrink: 0;">${a.time}</span>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Calendar Widget (spans 2 cols) -->
    <div class="dash-card" style="grid-column: span 2;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px;">Calendar</span>
            </div>
            <button onclick="showAdminPanel('calendar')" style="padding: 6px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer;">Full View</button>
        </div>
        ${renderDashCalendar()}
    </div>

    <!-- Integrations (spans 2 cols) -->
    <div class="dash-card-red" style="grid-column: span 2;">
        <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Integrations</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${renderDashIntegration('Stripe', siteAnalytics.stripeConnected, '#635bff', 'stripe')}
            ${renderDashIntegration('Google', siteAnalytics.googleReviewsConnected, '#4285f4', 'reviews')}
            ${renderDashIntegration('Analytics', true, '#10b981', 'analytics')}
            ${renderDashIntegration('CRM', true, '#8b5cf6', 'crm')}
        </div>
    </div>

</div>
    `;
}

function renderDashCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Gather events for this month
    const meetings = Array.isArray(JSON.parse(localStorage.getItem('nui_meetings') || '[]'))
        ? JSON.parse(localStorage.getItem('nui_meetings') || '[]') : [];
    const _orders = Array.isArray(window.orders) ? window.orders : JSON.parse(localStorage.getItem('nui_orders') || '[]');
    const eventDays = new Set();
    const deadlineDays = new Set();

    meetings.forEach(m => {
        const d = new Date(m.date);
        if (d.getMonth() === month && d.getFullYear() === year) eventDays.add(d.getDate());
    });
    _orders.filter(o => o.dueDate).forEach(o => {
        const d = new Date(o.dueDate);
        if (d.getMonth() === month && d.getFullYear() === year) deadlineDays.add(d.getDate());
    });

    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let cells = '';

    // Day headers
    dayNames.forEach(d => {
        cells += `<div style="font-size: 10px; color: rgba(255,255,255,0.25); text-align: center; padding: 4px 0; font-weight: 600;">${d}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        cells += '<div></div>';
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today;
        const hasEvent = eventDays.has(d);
        const hasDeadline = deadlineDays.has(d);
        const dotColor = hasDeadline ? '#f59e0b' : hasEvent ? '#3b82f6' : '';

        cells += `<div style="text-align: center; padding: 6px 0; position: relative; cursor: ${hasEvent || hasDeadline ? 'pointer' : 'default'};" ${hasEvent || hasDeadline ? 'onclick="showAdminPanel(\'calendar\')"' : ''}>
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; font-size: 12px; font-weight: ${isToday ? '700' : '400'}; color: ${isToday ? '#fff' : 'rgba(255,255,255,0.5)'}; background: ${isToday ? '#dc2626' : 'transparent'};">${d}</span>
            ${dotColor ? `<div style="position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: ${dotColor};"></div>` : ''}
        </div>`;
    }

    // Upcoming events list
    const upcoming = [
        ...meetings.filter(m => new Date(m.date) >= new Date(year, month, today)).slice(0, 3).map(m => ({
            date: new Date(m.date),
            label: (m.type === 'zoom' ? 'Zoom' : 'Phone') + ' — ' + (m.clientName || m.client_name || 'Client') + (m.service ? ' · ' + m.service : ''),
            color: '#3b82f6'
        })),
        ..._orders.filter(o => o.dueDate && new Date(o.dueDate) >= new Date(year, month, today)).slice(0, 3).map(o => ({
            date: new Date(o.dueDate),
            label: o.projectName + ' due',
            color: '#f59e0b'
        }))
    ].sort((a, b) => a.date - b.date).slice(0, 4);

    return `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 14px; font-weight: 600; color: #fff;">${monthName}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
            ${cells}
        </div>
        ${upcoming.length > 0 ? `
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Upcoming</div>
            ${upcoming.map(e => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: ${e.color}; flex-shrink: 0;"></span>
                    <span style="font-size: 12px; color: rgba(255,255,255,0.6); flex: 1;">${e.label}</span>
                    <span style="font-size: 11px; color: rgba(255,255,255,0.25);">${e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            `).join('')}
        </div>` : ''}
    `;
}

function renderDashIntegration(name, connected, color, panel) {
    return `<div onclick="showAdminPanel('${panel}')" style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.1)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${connected ? '#10b981' : '#ef4444'};"></span>
        <span style="font-size: 13px; font-weight: 500; color: #fff;">${name}</span>
        <span style="margin-left: auto; font-size: 10px; color: ${connected ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'};">${connected ? 'On' : 'Off'}</span>
    </div>`;
}

// Site Analytics Data
let siteAnalytics = JSON.parse(localStorage.getItem('nui_analytics')) || {
    visitors: { total: 2847, today: 156, week: 892 },
    pageViews: { total: 12453, today: 543, week: 3241 },
    topPages: [
        { page: 'Home', views: 4521, bounce: 32 },
        { page: 'Services', views: 2891, bounce: 41 },
        { page: 'Portfolio', views: 2143, bounce: 28 },
        { page: 'Blog', views: 1654, bounce: 35 },
        { page: 'Contact', views: 1244, bounce: 52 }
    ],
    trafficSources: [
        { source: 'Organic Search', percent: 45, color: '#ff0000' },
        { source: 'Direct', percent: 28, color: '#ff6b6b' },
        { source: 'Social', percent: 18, color: '#ff9999' },
        { source: 'Referral', percent: 9, color: '#ffcccc' }
    ],
    googleReviews: { avgRating: 4.8, count: 47 },
    stripeConnected: false,
    googleReviewsConnected: false
};
// Sync stripeConnected status from actual Stripe settings on load
(function() {
    try {
        var ss = JSON.parse(localStorage.getItem('nui_stripe'));
        if (ss && ss.connected) { siteAnalytics.stripeConnected = true; }
    } catch(e) {}
})();
function saveAnalytics() { localStorage.setItem('nui_analytics', JSON.stringify(siteAnalytics)); }

async function syncAllData() {
    const btn = event?.target || document.querySelector('[onclick="syncAllData()"]');
    if (btn) { btn.innerHTML = '🔄 Syncing...'; btn.disabled = true; }

    try {
        const count = await forceFullSync();

        // Also pull latest from backend to merge
        await hydrateFromBackend();

        if (btn) {
            btn.innerHTML = '✅ Synced to Backend!';
            setTimeout(() => { btn.innerHTML = '🔄 Sync All'; btn.disabled = false; }, 3000);
        }
    } catch (err) {
        console.error('Full sync failed:', err);
        if (btn) {
            btn.innerHTML = '❌ Sync Failed';
            setTimeout(() => { btn.innerHTML = '🔄 Sync All'; btn.disabled = false; }, 3000);
        }
    }
}

// ==================== CALENDAR PANEL ====================
async function loadAdminCalendarPanel() {
    // Try to fetch meetings from Supabase first, fall back to localStorage
    let meetings = JSON.parse(localStorage.getItem('nui_meetings') || '[]');
    if (!Array.isArray(meetings)) meetings = [];

    try {
        const resp = await fetch('/.netlify/functions/save-booking?date=all');
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data.meetings)) {
                meetings = data.meetings;
                localStorage.setItem('nui_meetings', JSON.stringify(meetings));
            }
        }
    } catch(e) { /* use local data */ }

    // Auto-sync Calendly bookings to leads
    syncMeetingsToLeads();

    // Aggregate calendar events from multiple sources
    const orders = window.adminOrders || JSON.parse(localStorage.getItem('nui_orders') || '[]');
    const invoices = window.adminInvoices || JSON.parse(localStorage.getItem('nui_invoices') || '[]');
    const clients = window.adminClients || JSON.parse(localStorage.getItem('nui_clients') || '[]');

    const events = [
        // Scheduled meetings/appointments
        ...meetings.map(m => ({
            id: `meeting-${m.id || m.serverId}`,
            meetingId: m.id || m.serverId,
            title: `${m.type === 'zoom' ? '💻 Zoom' : '📞 Phone'} Call`,
            date: m.date,
            time: m.time,
            type: 'meeting',
            client: m.clientName || m.clientEmail || m.client_name || m.client_email || 'Unknown',
            phone: m.clientPhone || m.client_phone || '',
            email: m.clientEmail || m.client_email || '',
            service: m.service || 'Not specified',
            source: m.source || 'manual',
            outcome: m.outcome || null,
            status: m.status || 'scheduled',
            color: m.outcome === 'completed' ? '#10b981' : m.outcome === 'missed' ? '#ef4444' : m.outcome === 'rebook' ? '#f59e0b' : '#3b82f6'
        })),
        // Project deadlines from orders
        ...orders.filter(o => o.dueDate).map(o => ({
            id: `order-${o.id}`,
            title: `${o.projectName} Due`,
            date: o.dueDate.split('T')[0],
            time: '5:00 PM',
            type: 'deadline',
            client: clients.find(c => c.id === o.clientId)?.name || 'Unknown',
            color: '#f59e0b',
            status: o.status
        })),
        // Invoice due dates
        ...invoices.filter(i => i.dueDate && i.status !== 'paid').map(i => ({
            id: `invoice-${i.id}`,
            title: `Invoice #${i.id || i.invoiceNumber} Due`,
            date: i.dueDate.split('T')[0],
            time: '11:59 PM',
            type: 'invoice',
            client: clients.find(c => c.id === i.clientId)?.name || 'Unknown',
            color: '#10b981',
            amount: i.total
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate calendar for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let calendarGrid = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    calendarGrid += dayNames.map(d => `<div style="text-align: center; font-weight: 600; color: var(--admin-text-muted); padding: 12px; font-size: 12px;">${d}</div>`).join('');

    // Empty cells for padding
    for (let i = 0; i < startPadding; i++) {
        calendarGrid += '<div></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = day === today.getDate();

        calendarGrid += `
<div style="min-height: 80px; padding: 8px; background: ${isToday ? 'rgba(255,0,0,0.1)' : 'var(--admin-card)'}; border: 1px solid ${isToday ? 'var(--red)' : 'var(--admin-border)'}; border-radius: 8px;">
<div style="font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? 'var(--red)' : 'var(--admin-text)'}; margin-bottom: 4px;">${day}</div>
                ${dayEvents.slice(0, 3).map(e => `
<div style="font-size: 10px; padding: 2px 4px; background: ${e.color}20; color: ${e.color}; border-radius: 3px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${e.title} - ${e.client}">
                        ${e.title}
</div>
                `).join('')}
                ${dayEvents.length > 3 ? `<div style="font-size: 9px; color: var(--admin-text-muted);">+${dayEvents.length - 3} more</div>` : ''}
</div>
        `;
    }

    // Upcoming events list
    const upcomingEvents = events.filter(e => new Date(e.date) >= today).slice(0, 10);

    document.getElementById('adminCalendarPanel').innerHTML = `
<div class="flex-between mb-32">
<h2 style="font-size: 28px; font-weight: 700; color: var(--admin-text);">📅 Calendar</h2>
<div class="flex-gap-12">
<button onclick="openMeetingModal()" class="btn-admin primary">+ Schedule Meeting</button>
</div>
</div>

<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <!-- Calendar Grid -->
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 16px; padding: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<h2 style="font-size: 20px; font-weight: 600; color: var(--admin-text);">${monthNames[currentMonth]} ${currentYear}</h2>
<div class="flex-gap-8">
<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--admin-text-muted);">
<span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%;"></span> Meetings
</div>
<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--admin-text-muted);">
<span style="width: 10px; height: 10px; background: #f59e0b; border-radius: 50%;"></span> Deadlines
</div>
<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--admin-text-muted);">
<span style="width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></span> Invoices
</div>
</div>
</div>
<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
                    ${calendarGrid}
</div>
</div>

            <!-- Upcoming Events Sidebar -->
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 16px; padding: 24px;">
<h3 style="font-size: 16px; font-weight: 600; color: var(--admin-text); margin-bottom: 20px;">📌 Upcoming Events</h3>
                ${upcomingEvents.length === 0 ? `
<div style="text-align: center; padding: 40px 20px; color: var(--admin-text-muted);">
<div style="font-size: 48px; margin-bottom: 12px;">📭</div>
<p>No upcoming events</p>
</div>
                ` : upcomingEvents.map(e => `
<div style="background: var(--admin-bg); border: 1px solid var(--admin-border); padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid ${e.color};">
<div style="display: flex; justify-content: space-between; align-items: start;">
<div>
<div style="font-weight: 600; color: var(--admin-text); margin-bottom: 4px;">${e.title}</div>
<div class="admin-text-muted-xs">${e.client}</div>
${e.service && e.type === 'meeting' ? `<div style="margin-top: 4px; font-size: 11px; padding: 2px 8px; background: rgba(220,38,38,0.15); color: #f87171; border-radius: 4px; display: inline-block;">🎯 ${e.service}</div>` : ''}
${e.source && e.type === 'meeting' ? `<span style="margin-left: 4px; font-size: 10px; padding: 2px 6px; background: ${e.source === 'calendly' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)'}; color: ${e.source === 'calendly' ? '#60a5fa' : 'var(--admin-text-muted)'}; border-radius: 4px;">${e.source === 'calendly' ? '📅 Calendly' : '✏️ Manual'}</span>` : ''}
</div>
<span style="background: ${e.color}20; color: ${e.color}; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase;">${e.outcome ? e.outcome : e.type}</span>
</div>
<div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 8px;">
                            📅 ${new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${e.time ? `at ${e.time}` : ''}
</div>
${e.type === 'meeting' && (e.phone || e.email) ? `<div style="font-size: 11px; color: var(--admin-text-muted); margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--admin-border);">
${e.phone ? `📞 <a href="tel:${e.phone}" style="color: #60a5fa; text-decoration: none;">${e.phone}</a>` : ''}
${e.phone && e.email ? ' · ' : ''}
${e.email ? `✉️ <a href="mailto:${e.email}" style="color: #60a5fa; text-decoration: none;">${e.email}</a>` : ''}
</div>` : ''}
${e.type === 'meeting' && e.meetingId ? `<div style="display: flex; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--admin-border);">
<button onclick="setMeetingOutcome('${e.meetingId}', 'completed')" style="flex: 1; padding: 6px; font-size: 11px; border: 1px solid ${e.outcome === 'completed' ? '#10b981' : 'var(--admin-border)'}; background: ${e.outcome === 'completed' ? 'rgba(16,185,129,0.2)' : 'transparent'}; color: ${e.outcome === 'completed' ? '#10b981' : 'var(--admin-text-muted)'}; border-radius: 6px; cursor: pointer;">✅ Good</button>
<button onclick="setMeetingOutcome('${e.meetingId}', 'missed')" style="flex: 1; padding: 6px; font-size: 11px; border: 1px solid ${e.outcome === 'missed' ? '#ef4444' : 'var(--admin-border)'}; background: ${e.outcome === 'missed' ? 'rgba(239,68,68,0.2)' : 'transparent'}; color: ${e.outcome === 'missed' ? '#ef4444' : 'var(--admin-text-muted)'}; border-radius: 6px; cursor: pointer;">❌ Missed</button>
<button onclick="setMeetingOutcome('${e.meetingId}', 'rebook')" style="flex: 1; padding: 6px; font-size: 11px; border: 1px solid ${e.outcome === 'rebook' ? '#f59e0b' : 'var(--admin-border)'}; background: ${e.outcome === 'rebook' ? 'rgba(245,158,11,0.2)' : 'transparent'}; color: ${e.outcome === 'rebook' ? '#f59e0b' : 'var(--admin-text-muted)'}; border-radius: 6px; cursor: pointer;">🔄 Rebook</button>
</div>` : ''}
</div>
                `).join('')}
</div>
</div>

        <!-- Stats -->
<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 24px;">
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${meetings.filter(m => !m.outcome).length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Scheduled</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #10b981;">${meetings.filter(m => m.outcome === 'completed').length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Completed</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #ef4444;">${meetings.filter(m => m.outcome === 'missed').length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Missed</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${meetings.filter(m => m.outcome === 'rebook').length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Rebook</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: var(--red);">${events.length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Total Events</div>
</div>
</div>
    `;
}

// --- Set meeting outcome (completed/missed/rebook) ---
async function setMeetingOutcome(meetingId, outcome) {
    try {
        const resp = await fetch('/.netlify/functions/save-booking', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: meetingId, outcome: outcome })
        });
        const data = await resp.json();
        if (data.success) {
            // Update local meetings array
            const m = meetings.find(m => (m.id || m.serverId) == meetingId);
            if (m) m.outcome = outcome;
            localStorage.setItem('nui_meetings', JSON.stringify(meetings));

            // Update lead status based on outcome
            syncMeetingOutcomeToLead(meetingId, outcome);

            // Reload calendar
            loadAdminCalendarPanel();
        } else {
            alert('Failed to update meeting: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('setMeetingOutcome error:', err);
        alert('Error updating meeting outcome');
    }
}

// --- Sync Calendly meetings to leads ---
function syncMeetingsToLeads() {
    if (typeof meetings === 'undefined') return;
    const calendlyMeetings = meetings.filter(m => m.source === 'calendly');
    let added = 0;

    calendlyMeetings.forEach(m => {
        const email = m.clientEmail || m.client_email || '';
        if (!email) return;

        // Check if lead already exists
        const exists = leads.find(l => l.email === email);
        if (!exists) {
            leads.push({
                id: Date.now() + Math.random(),
                name: m.clientName || m.client_name || 'Unknown',
                email: email,
                phone: m.clientPhone || m.client_phone || '',
                business: '',
                service: m.service || '',
                budget: '',
                message: 'Auto-created from Calendly booking',
                status: 'new',
                source: 'calendly',
                meetingId: m.id || m.serverId,
                createdAt: m.created_at || new Date().toISOString()
            });
            added++;
        }
    });

    if (added > 0) {
        saveLeads();
        console.log(`Synced ${added} Calendly bookings to leads`);
    }
}

// --- Update lead when meeting outcome changes ---
function syncMeetingOutcomeToLead(meetingId, outcome) {
    // Find the meeting
    const meeting = meetings.find(m => (m.id || m.serverId) == meetingId);
    if (!meeting) return;

    const email = meeting.clientEmail || meeting.client_email || '';
    if (!email) return;

    // Find or create the lead
    let lead = leads.find(l => l.email === email);
    if (!lead) {
        lead = {
            id: Date.now() + Math.random(),
            name: meeting.clientName || meeting.client_name || 'Unknown',
            email: email,
            phone: meeting.clientPhone || meeting.client_phone || '',
            business: '',
            service: meeting.service || '',
            budget: '',
            message: '',
            status: 'new',
            source: meeting.source || 'manual',
            meetingId: meetingId,
            createdAt: new Date().toISOString()
        };
        leads.push(lead);
    }

    // Update lead status based on meeting outcome
    if (outcome === 'completed') {
        lead.status = 'qualified';
        lead.lastOutcome = 'completed';
    } else if (outcome === 'missed') {
        lead.status = 'contacted';
        lead.lastOutcome = 'missed';
    } else if (outcome === 'rebook') {
        lead.status = 'contacted';
        lead.lastOutcome = 'rebook';
    }

    lead.lastMeetingDate = meeting.date;
    lead.lastMeetingOutcome = outcome;
    saveLeads();
}


// ==================== RENDER ADMIN SIDEBAR (Role-Based) ====================
function renderAdminSidebar() {
    const userType = currentUser?.type || 'client';
    const userName = currentUser?.name || currentUser?.email || 'User';

    // Update header info
    const headerTitle = document.getElementById('adminHeaderTitle');
    const headerInfo = document.getElementById('adminUserInfo');
    if (headerTitle) {
        headerTitle.textContent = userType === 'admin' ? 'Admin Dashboard' :
                                  userType === 'manager' ? 'Manager Dashboard' :
                                  userType === 'designer' ? 'Designer Portal' : 'Dashboard';
    }
    if (headerInfo) {
        headerInfo.textContent = `${userName} (${userType.charAt(0).toUpperCase() + userType.slice(1)})`;
    }

    // Update theme button text
    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (themeBtn) {
        themeBtn.innerHTML = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }

    // Update header logo from CMS
    const headerLogo = document.getElementById('adminHeaderLogo');
    if (headerLogo && siteImages.headerLogo?.url) {
        headerLogo.src = siteImages.headerLogo.url;
    }

    // For now, keep the static sidebar - role filtering is handled by canAccessPanel()
    // A more complete implementation would dynamically rebuild the sidebar HTML
    console.log(`Sidebar rendered for ${userType}: ${userName}`);

    // ── WHITE-LABEL: Apply agency config to nav + branding ──
    if (typeof filterAdminNav === 'function') filterAdminNav();
    if (typeof updateAdminBranding === 'function') updateAdminBranding();
}

// ==================== USER MANAGEMENT PANEL ====================
function loadAdminUserManagementPanel() {
    const adminAccounts = JSON.parse(localStorage.getItem('nui_admin_accounts')) || [];
    const allManagers = JSON.parse(localStorage.getItem('nui_managers')) || [];

    // Build user tables for each type
    const clientRows = clients.map(c => `
<tr>
<td class="admin-list-item">${c.name || 'N/A'}</td>
<td class="admin-list-item">${c.email || 'N/A'}</td>
<td class="admin-list-item">Client</td>
<td class="admin-list-item">
<span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; background: ${c.blocked ? '#ff000020' : '#00ff0020'}; color: ${c.blocked ? '#ff4444' : '#44ff44'};">${c.blocked ? 'Blocked' : 'Active'}</span>
</td>
<td class="admin-list-item">
<button onclick="resetUserPassword('client', '${c.id}')" style="padding: 6px 12px; background: #333; border: 1px solid #555; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 4px;">Reset PW</button>
<button onclick="toggleBlockUser('client', '${c.id}')" style="padding: 6px 12px; background: ${c.blocked ? '#00440040' : '#44000040'}; border: 1px solid ${c.blocked ? '#00ff00' : '#ff0000'}; color: ${c.blocked ? '#44ff44' : '#ff4444'}; border-radius: 6px; cursor: pointer; font-size: 12px;">${c.blocked ? 'Unblock' : 'Block'}</button>
</td>
</tr>
    `).join('');

    const designerRows = designers.map(d => `
<tr>
<td class="admin-list-item">${d.name || 'N/A'}</td>
<td class="admin-list-item">${d.email || 'N/A'}</td>
<td class="admin-list-item">Designer</td>
<td class="admin-list-item">
<span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; background: ${d.blocked ? '#ff000020' : '#00ff0020'}; color: ${d.blocked ? '#ff4444' : '#44ff44'};">${d.blocked ? 'Blocked' : 'Active'}</span>
</td>
<td class="admin-list-item">
<button onclick="resetUserPassword('designer', '${d.id}')" style="padding: 6px 12px; background: #333; border: 1px solid #555; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 4px;">Reset PW</button>
<button onclick="toggleBlockUser('designer', '${d.id}')" style="padding: 6px 12px; background: ${d.blocked ? '#00440040' : '#44000040'}; border: 1px solid ${d.blocked ? '#00ff00' : '#ff0000'}; color: ${d.blocked ? '#44ff44' : '#ff4444'}; border-radius: 6px; cursor: pointer; font-size: 12px;">${d.blocked ? 'Unblock' : 'Block'}</button>
</td>
</tr>
    `).join('');

    const managerRows = allManagers.map(m => `
<tr>
<td class="admin-list-item">${m.name || 'N/A'}</td>
<td class="admin-list-item">${m.email || 'N/A'}</td>
<td class="admin-list-item">Manager</td>
<td class="admin-list-item">
<span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; background: ${m.blocked ? '#ff000020' : '#00ff0020'}; color: ${m.blocked ? '#ff4444' : '#44ff44'};">${m.blocked ? 'Blocked' : 'Active'}</span>
</td>
<td class="admin-list-item">
<button onclick="resetUserPassword('manager', '${m.id}')" style="padding: 6px 12px; background: #333; border: 1px solid #555; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 4px;">Reset PW</button>
<button onclick="toggleBlockUser('manager', '${m.id}')" style="padding: 6px 12px; background: ${m.blocked ? '#00440040' : '#44000040'}; border: 1px solid ${m.blocked ? '#00ff00' : '#ff0000'}; color: ${m.blocked ? '#44ff44' : '#ff4444'}; border-radius: 6px; cursor: pointer; font-size: 12px;">${m.blocked ? 'Unblock' : 'Block'}</button>
</td>
</tr>
    `).join('');

    const adminRows = adminAccounts.map(a => `
<tr>
<td class="admin-list-item">${a.name || 'N/A'}</td>
<td class="admin-list-item">${a.email || 'N/A'}</td>
<td class="admin-list-item">Admin</td>
<td class="admin-list-item">
<span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; background: ${a.blocked ? '#ff000020' : '#00ff0020'}; color: ${a.blocked ? '#ff4444' : '#44ff44'};">${a.blocked ? 'Blocked' : 'Active'}</span>
</td>
<td class="admin-list-item">
<button onclick="resetUserPassword('admin', '${a.id}')" style="padding: 6px 12px; background: #333; border: 1px solid #555; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 4px;">Reset PW</button>
<button onclick="toggleBlockUser('admin', '${a.id}')" style="padding: 6px 12px; background: ${a.blocked ? '#00440040' : '#44000040'}; border: 1px solid ${a.blocked ? '#00ff00' : '#ff0000'}; color: ${a.blocked ? '#44ff44' : '#ff4444'}; border-radius: 6px; cursor: pointer; font-size: 12px;">${a.blocked ? 'Unblock' : 'Block'}</button>
</td>
</tr>
    `).join('');

    document.getElementById('adminUsermanagementPanel').innerHTML = `
<div class="flex-between mb-32">
<h2 class="fs-28 fw-700">🔐 User Management</h2>
<div class="flex-gap-12">
<button onclick="showAddAdminModal()" style="padding: 10px 20px; background: linear-gradient(135deg, #ff0000, #cc0000); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">+ Add Admin User</button>
</div>
</div>

        <!-- Master Admin Info -->
<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #ff000040; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
<span class="fs-24">👑</span>
<h3 style="font-size: 18px; font-weight: 700; color: #ff4444;">Master Admin Account</h3>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
<div>
<div class="text-muted fs-12 mb-4">Email</div>
<div style="font-size: 14px; color: #fff;">newurbaninfluence@gmail.com</div>
</div>
<div>
<div class="text-muted fs-12 mb-4">Status</div>
<div style="font-size: 14px; color: #44ff44;">Always Active (Cannot be blocked)</div>
</div>
</div>
<div class="mt-16">
<button onclick="showChangeMasterPasswordModal()" style="padding: 8px 16px; background: #333; border: 1px solid #ff0000; color: #ff4444; border-radius: 8px; cursor: pointer; font-size: 13px;">Change Master Password</button>
</div>
</div>

        <!-- Stats Row -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #ff4444;">${clients.length}</div>
<div class="text-muted-sm">Clients</div>
</div>
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #4488ff;">${designers.length}</div>
<div class="text-muted-sm">Designers</div>
</div>
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #44ff44;">${allManagers.length}</div>
<div class="text-muted-sm">Managers</div>
</div>
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #ffaa44;">${adminAccounts.length}</div>
<div class="text-muted-sm">Admin Accounts</div>
</div>
</div>

        <!-- User Search -->
<div class="mb-24">
<input type="text" id="userSearchInput" oninput="filterUserTable()" placeholder="Search users by name or email..." style="width: 100%; padding: 12px 16px; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px;">
</div>

        <!-- All Users Table -->
<div style="background: #1c1c1c; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden;">
<div style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);">
<h3 style="font-size: 16px; font-weight: 600;">All Users</h3>
</div>
<div style="overflow-x: auto;">
<table id="userManagementTable" style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="background: #202020;">
<th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid rgba(255,255,255,0.06);">Name</th>
<th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid rgba(255,255,255,0.06);">Email</th>
<th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid rgba(255,255,255,0.06);">Role</th>
<th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid rgba(255,255,255,0.06);">Status</th>
<th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid rgba(255,255,255,0.06);">Actions</th>
</tr>
</thead>
<tbody>
                        ${adminRows}
                        ${managerRows}
                        ${designerRows}
                        ${clientRows}
</tbody>
</table>
</div>
</div>
    `;
}

// User Management Helper Functions
function resetUserPassword(userType, userId) {
    const newPw = prompt('Enter new password for this user:');
    if (!newPw || newPw.trim().length < 4) { alert('Password must be at least 4 characters.'); return; }

    if (userType === 'client') {
        const idx = clients.findIndex(c => c.id == userId);
        if (idx !== -1) { clients[idx].password = newPw.trim(); saveClients(); }
    } else if (userType === 'designer') {
        const idx = designers.findIndex(d => d.id == userId);
        if (idx !== -1) { designers[idx].password = newPw.trim(); saveDesigners(); }
    } else if (userType === 'manager') {
        const mgrs = JSON.parse(localStorage.getItem('nui_managers')) || [];
        const idx = mgrs.findIndex(m => m.id == userId);
        if (idx !== -1) { mgrs[idx].password = newPw.trim(); localStorage.setItem('nui_managers', JSON.stringify(mgrs)); }
    } else if (userType === 'admin') {
        const admins = JSON.parse(localStorage.getItem('nui_admin_accounts')) || [];
        const idx = admins.findIndex(a => a.id == userId);
        if (idx !== -1) { admins[idx].password = newPw.trim(); localStorage.setItem('nui_admin_accounts', JSON.stringify(admins)); }
    }
    alert('Password updated successfully!');
    loadAdminUserManagementPanel();
}

function toggleBlockUser(userType, userId) {
    if (userType === 'client') {
        const idx = clients.findIndex(c => c.id == userId);
        if (idx !== -1) { clients[idx].blocked = !clients[idx].blocked; saveClients(); }
    } else if (userType === 'designer') {
        const idx = designers.findIndex(d => d.id == userId);
        if (idx !== -1) { designers[idx].blocked = !designers[idx].blocked; saveDesigners(); }
    } else if (userType === 'manager') {
        const mgrs = JSON.parse(localStorage.getItem('nui_managers')) || [];
        const idx = mgrs.findIndex(m => m.id == userId);
        if (idx !== -1) { mgrs[idx].blocked = !mgrs[idx].blocked; localStorage.setItem('nui_managers', JSON.stringify(mgrs)); }
    } else if (userType === 'admin') {
        const admins = JSON.parse(localStorage.getItem('nui_admin_accounts')) || [];
        const idx = admins.findIndex(a => a.id == userId);
        if (idx !== -1) { admins[idx].blocked = !admins[idx].blocked; localStorage.setItem('nui_admin_accounts', JSON.stringify(admins)); }
    }
    loadAdminUserManagementPanel();
}

function showAddAdminModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addAdminModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
<div class="modal" style="max-width: 500px;">
<div class="modal-header">
<h3 class="modal-title">Add Admin Account</h3>
<button class="modal-close" onclick="document.getElementById('addAdminModal').remove()">×</button>
</div>
<div class="modal-body p-24">
<div class="form-group mb-16">
<label class="form-label">Full Name</label>
<input type="text" id="newAdminName" class="form-input" placeholder="Full Name" required>
</div>
<div class="form-group mb-16">
<label class="form-label">Email</label>
<input type="email" id="newAdminEmail" class="form-input" placeholder="email@example.com" required>
</div>
<div class="form-group mb-16">
<label class="form-label">Password</label>
<input type="text" id="newAdminPassword" class="form-input" placeholder="Set a password" required>
</div>
</div>
<div class="modal-footer">
<button onclick="document.getElementById('addAdminModal').remove()" class="btn-outline">Cancel</button>
<button onclick="saveNewAdminAccount()" class="btn-cta">Create Admin Account</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveNewAdminAccount() {
    const name = document.getElementById('newAdminName').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim().toLowerCase();
    const password = document.getElementById('newAdminPassword').value;
    if (!name || !email || !password) { alert('All fields are required.'); return; }
    if (password.length < 4) { alert('Password must be at least 4 characters.'); return; }
    if (email === 'newurbaninfluence@gmail.com') { alert('Cannot create account with master admin email.'); return; }

    const admins = JSON.parse(localStorage.getItem('nui_admin_accounts')) || [];
    if (admins.find(a => a.email === email)) { alert('An admin with this email already exists.'); return; }

    admins.push({ id: Date.now(), name, email, password, blocked: false, createdAt: new Date().toISOString() });
    localStorage.setItem('nui_admin_accounts', JSON.stringify(admins));
    document.getElementById('addAdminModal').remove();
    alert('Admin account created successfully!');
    loadAdminUserManagementPanel();
}

function showChangeMasterPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'changeMasterPwModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
<div class="modal" style="max-width: 450px;">
<div class="modal-header">
<h3 class="modal-title">Change Master Password</h3>
<button class="modal-close" onclick="document.getElementById('changeMasterPwModal').remove()">×</button>
</div>
<div class="modal-body p-24">
<div class="form-group mb-16">
<label class="form-label">Current Password</label>
<input type="password" id="currentMasterPw" class="form-input" placeholder="Enter current password">
</div>
<div class="form-group mb-16">
<label class="form-label">New Password</label>
<input type="password" id="newMasterPw" class="form-input" placeholder="Enter new password">
</div>
<div class="form-group mb-16">
<label class="form-label">Confirm New Password</label>
<input type="password" id="confirmMasterPw" class="form-input" placeholder="Confirm new password">
</div>
</div>
<div class="modal-footer">
<button onclick="document.getElementById('changeMasterPwModal').remove()" class="btn-outline">Cancel</button>
<button onclick="updateMasterPassword()" class="btn-cta">Update Password</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function updateMasterPassword() {
    const currentPw = document.getElementById('currentMasterPw').value;
    const newPw = document.getElementById('newMasterPw').value;
    const confirmPw = document.getElementById('confirmMasterPw').value;

    const storedMasterPw = localStorage.getItem('nui_master_admin_pw') || 'newurban';
    if (currentPw !== storedMasterPw) { alert('Current password is incorrect.'); return; }
    if (newPw.length < 4) { alert('New password must be at least 4 characters.'); return; }
    if (newPw !== confirmPw) { alert('New passwords do not match.'); return; }

    localStorage.setItem('nui_master_admin_pw', newPw);
    document.getElementById('changeMasterPwModal').remove();
    alert('Master password updated successfully!');
}

function filterUserTable() {
    const query = (document.getElementById('userSearchInput')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#userManagementTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}


// ==================== RENDER HELPERS ====================
function renderClientCard(c) {
    const headerColor = (c.colors && c.colors[0]) ? c.colors[0] : '#e11d48';
    const clientName = c.name || c.email || 'Unnamed';
    return `<div class="client-card">
<div class="client-card-header" style="background: ${headerColor};">${clientName.charAt(0).toUpperCase()}</div>
<div class="client-card-body">
<div class="client-card-name">${clientName}</div>
<div class="client-card-meta">${c.industry || 'No industry'} • ${c.servicePackageName || ''} ${c.assets ? Object.values(c.assets).flat().length : 0} assets</div>
<div class="client-card-btns">
<button onclick="openEditClientModal(${c.id})" style="background: #3b82f6; color: #fff;">✏️ Edit</button>
<button onclick="quickOrder(${c.id})" style="background: #e11d48; color: #fff;">⚡ Order</button>
<button onclick="viewClientAsAdmin(${c.id})" style="background: #000; color: #fff;">View Portal</button>
<button onclick="currentAdminClient = clients.find(x => x.id === ${c.id}); showAdminPanel('assets');" style="background: #f5f5f5; color: #000;">Upload</button>
<button onclick="deleteClient(${c.id})" style="background: #fee2e2; color: #dc2626;">×</button>
</div>
</div>
 </div>`;
}

// ==================== EDIT CLIENT MODAL ====================
function openEditClientModal(clientId) {
    const c = clients.find(x => x.id === clientId);
    if (!c) { alert('Client not found'); return; }
    let existing = document.getElementById('editClientModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'editClientModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `<div style="background:#1a1a1a;border-radius:12px;padding:28px;width:90%;max-width:520px;max-height:85vh;overflow-y:auto;color:#fff;">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
<h3 style="margin:0;font-size:18px;">✏️ Edit Client</h3>
<button onclick="closeEditClientModal()" style="background:none;border:none;color:#888;font-size:22px;cursor:pointer;">&times;</button>
</div>
<input type="hidden" id="editClientId" value="${c.id}">
<div style="display:grid;gap:12px;">
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Name</label><input id="editClientName" value="${(c.name||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Email</label><input id="editClientEmail" value="${(c.email||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Phone</label><input id="editClientPhone" value="${(c.phone||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Industry</label><input id="editClientIndustry" value="${(c.industry||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
</div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Website</label><input id="editClientWebsite" value="${(c.website||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Address</label><input id="editClientAddress" value="${(c.address||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Contact Person</label><input id="editClientContact" value="${(c.contact||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Social</label><input id="editClientSocial" value="${(c.social||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;box-sizing:border-box;"></div>
<div><label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">Notes</label><textarea id="editClientNotes" rows="3" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:14px;resize:vertical;box-sizing:border-box;">${(c.notes||'').replace(/</g,'&lt;')}</textarea></div>
</div>
<div style="display:flex;gap:10px;margin-top:20px;">
<button onclick="saveClientChanges()" style="flex:1;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">💾 Save Changes</button>
<button onclick="closeEditClientModal()" style="flex:1;padding:12px;background:#333;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Cancel</button>
</div>
</div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeEditClientModal(); });
}

function closeEditClientModal() {
    const m = document.getElementById('editClientModal');
    if (m) m.remove();
}

async function saveClientChanges() {
    const id = parseInt(document.getElementById('editClientId').value);
    const c = clients.find(x => x.id === id);
    if (!c) { alert('Client not found'); return; }
    c.name = document.getElementById('editClientName').value.trim();
    c.email = document.getElementById('editClientEmail').value.trim();
    c.phone = document.getElementById('editClientPhone').value.trim();
    c.industry = document.getElementById('editClientIndustry').value.trim();
    c.website = document.getElementById('editClientWebsite').value.trim();
    c.address = document.getElementById('editClientAddress').value.trim();
    c.contact = document.getElementById('editClientContact').value.trim();
    c.social = document.getElementById('editClientSocial').value.trim();
    c.notes = document.getElementById('editClientNotes').value.trim();
    saveClients();
    // Sync to Supabase
    try {
        const SB_URL = window.SUPABASE_URL || '';
        const SB_KEY = window.SUPABASE_ANON_KEY || '';
        if (SB_URL && SB_KEY && SB_URL !== 'YOUR_SUPABASE_URL') {
            await fetch(`${SB_URL}/rest/v1/clients?id=eq.${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ name: c.name, email: c.email, phone: c.phone, industry: c.industry, website: c.website, address: c.address, contact: c.contact, social: c.social, notes: c.notes })
            });
        }
    } catch(err) { console.warn('Supabase sync failed:', err); }
    closeEditClientModal();
    if (typeof showAdminPanel === 'function') showAdminPanel('clients');
}

function renderOrderCard(o, showActions = false) {
    const client = clients.find(c => c.id === o.clientId);
    const progress = o.status === 'delivered' ? 100 : o.status === 'in_progress' ? 60 : 20;
    const daysLeft = Math.ceil((new Date(o.dueDate) - new Date()) / (1000*60*60*24));
    return `<div class="order-card">
<div class="order-header">
<div><div class="order-title">${o.projectName}</div><div class="order-client">${client ? client.name : 'Unknown'}</div></div>
<span class="order-status ${o.status}">${o.status.replace('_', ' ')}</span>
</div>
<div class="order-details">
<div class="order-detail"><div class="val">$${(o.estimate || 0).toLocaleString()}</div><div class="lbl">Estimate</div></div>
<div class="order-detail"><div class="val">${o.turnaround}</div><div class="lbl">Turnaround</div></div>
<div class="order-detail"><div class="val">${new Date(o.dueDate).toLocaleDateString()}</div><div class="lbl">Due Date</div></div>
<div class="order-detail"><div class="val" style="color: ${daysLeft < 0 ? 'var(--red)' : daysLeft < 3 ? 'var(--yellow)' : 'var(--green)'}">${daysLeft < 0 ? 'Overdue' : daysLeft + ' days'}</div><div class="lbl">Remaining</div></div>
</div>
<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%; background: ${o.status === 'delivered' ? 'var(--green)' : o.status === 'in_progress' ? 'var(--blue)' : 'var(--yellow)'}"></div></div>
        ${showActions ? `<div style="display: flex; gap: 8px; margin-top: 16px;">
<button onclick="showInvoice(${o.id})" class="btn-cta btn-sm">View Invoice</button>
<button onclick="updateOrderStatus(${o.id})" style="padding: 10px 16px; background: #f5f5f5; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Update Status</button>
            ${o.status !== 'delivered' ? `<button onclick="markDelivered(${o.id})" style="padding: 10px 16px; background: var(--green); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Mark Delivered</button>` : ''}
</div>` : ''}
 </div>`;
}


// ==================== STRIPE INTEGRATION PANEL ====================
let stripeSettings = JSON.parse(localStorage.getItem('nui_stripe')) || {
    connected: false,
    accountId: '',
    publishableKey: '',
    testMode: true
};

// SECURITY: Purge any secret keys that were previously stored in browser
if (stripeSettings.secretKey || stripeSettings.webhookSecret) {
    delete stripeSettings.secretKey;
    delete stripeSettings.webhookSecret;
    localStorage.setItem('nui_stripe', JSON.stringify(stripeSettings));
    console.log('🔒 Purged secret keys from browser storage');
}
function saveStripeSettings() {
    localStorage.setItem('nui_stripe', JSON.stringify(stripeSettings));
    // Also sync to Supabase so settings persist across browsers/sessions
    if (typeof _pushToBackend === 'function') {
        _pushToBackend('stripe_settings', stripeSettings).catch(function(e) { console.warn('Stripe settings sync error:', e.message); });
    }
}

function loadAdminStripePanel() {
    const recentTransactions = [
        { id: 'pi_abc123', amount: 1500, status: 'succeeded', customer: 'Marcus Johnson', date: '2025-01-28' },
        { id: 'pi_def456', amount: 2500, status: 'succeeded', customer: 'Sarah Williams', date: '2025-01-25' },
        { id: 'pi_ghi789', amount: 800, status: 'pending', customer: 'David Chen', date: '2025-01-24' }
    ];

    document.getElementById('adminStripePanel').innerHTML = `
<div class="flex-between mb-32">
<h2 class="fs-28 fw-700">💎 Stripe Integration</h2>
<span style="padding: 8px 16px; background: ${stripeSettings.connected ? '#d1fae5' : '#fee2e2'}; color: ${stripeSettings.connected ? '#059669' : '#dc2626'}; border-radius: 8px; font-size: 14px;">
                ${stripeSettings.connected ? '✓ Connected' : '✗ Not Connected'}
</span>
</div>

        ${!stripeSettings.connected ? `
        <!-- Connect Stripe -->
<div style="background: linear-gradient(135deg, #635bff 0%, #4f46e5 100%); padding: 48px; border-radius: 20px; color: #fff; text-align: center; margin-bottom: 32px;">
<div style="font-size: 64px; margin-bottom: 16px;">💳</div>
<h2 style="font-size: 28px; font-weight: 700; margin-bottom: 12px;">Connect Your Stripe Account</h2>
<p style="font-size: 16px; opacity: 0.9; margin-bottom: 24px;">Accept payments, send invoices, and manage payouts with Stripe.</p>
<button onclick="connectStripe()" style="padding: 16px 48px; background: #fff; color: #635bff; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer;">Connect with Stripe →</button>
</div>
        ` : `
        <!-- Stripe Dashboard -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Balance</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">$4,850</div>
<div style="font-size: 13px; color: #10b981; margin-top: 8px;">Available for payout</div>
</div>
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">This Month</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">$12,450</div>
<div style="font-size: 13px; color: #10b981; margin-top: 8px;">↑ 18% vs last month</div>
</div>
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Pending</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">$2,300</div>
<div style="font-size: 13px; color: #f59e0b; margin-top: 8px;">3 payments processing</div>
</div>
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Success Rate</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">98.5%</div>
<div style="font-size: 13px; color: #10b981; margin-top: 8px;">Excellent</div>
</div>
</div>
        `}

        <!-- API Keys -->
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 32px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<h3 style="font-size: 16px; font-weight: 600; color: #fff;">🔑 API Configuration</h3>
<label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #fff;">
<input type="checkbox" ${stripeSettings.testMode ? 'checked' : ''} onchange="toggleStripeMode(this.checked)">
<span class="fs-14">Test Mode</span>
</label>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
<div>
<label style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 8px;">Publishable Key</label>
<input type="text" id="stripePublishableKey" value="${stripeSettings.publishableKey}" placeholder="pk_test_..." style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-family: monospace; font-size: 13px; background: #252525; color: #fff;">
</div>
<div>
<label style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 8px;">Secret Key</label>
<div style="padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: #1a1a1a; color: #666; font-size: 13px;">
🔒 Managed via Netlify Dashboard (never stored in browser)
</div>
</div>
</div>
<button onclick="saveStripeKeys()" class="btn-cta mt-20">Save API Keys</button>
</div>

        <!-- Payment Methods -->
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 32px;">
<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #fff;">💳 Accepted Payment Methods</h3>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
<div style="padding: 20px; background: #252525; border-radius: 12px; text-align: center; border: 2px solid #10b981;">
<div class="fs-32 mb-8">💳</div>
<div class="text-bold-white">Credit Cards</div>
<div style="font-size: 12px; color: #10b981; margin-top: 4px;">Active</div>
</div>
<div style="padding: 20px; background: #252525; border-radius: 12px; text-align: center; border: 2px solid #10b981;">
<div class="fs-32 mb-8">🏦</div>
<div class="text-bold-white">ACH Bank</div>
<div style="font-size: 12px; color: #10b981; margin-top: 4px;">Active</div>
</div>
<div style="padding: 20px; background: #252525; border-radius: 12px; text-align: center; border: 2px solid rgba(255,255,255,0.2);">
<div class="fs-32 mb-8">🍎</div>
<div class="text-bold-white">Apple Pay</div>
<div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px;">Configure</div>
</div>
<div style="padding: 20px; background: #252525; border-radius: 12px; text-align: center; border: 2px solid rgba(255,255,255,0.2);">
<div class="fs-32 mb-8">🔗</div>
<div class="text-bold-white">Link</div>
<div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px;">Configure</div>
</div>
</div>
</div>

        <!-- Recent Transactions -->
<div style="background: #242424; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<h3 style="font-size: 16px; font-weight: 600; color: #fff;">📋 Recent Transactions</h3>
<a href="https://dashboard.stripe.com" target="_blank" class="btn-outline" style="color: #fff; border-color: rgba(255,255,255,0.3);">Open Stripe Dashboard →</a>
</div>
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
<th style="text-align: left; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Transaction ID</th>
<th style="text-align: left; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Customer</th>
<th style="text-align: right; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Amount</th>
<th style="text-align: center; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Status</th>
<th style="text-align: right; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.6);">Date</th>
</tr>
</thead>
<tbody>
                    ${recentTransactions.map(t => `
<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
<td style="padding: 16px 0; font-family: monospace; font-size: 13px; color: #fff;">${t.id}</td>
<td style="padding: 16px 0; color: #fff;">${t.customer}</td>
<td style="text-align: right; padding: 16px 0; font-weight: 600; color: #fff;">$${t.amount.toLocaleString()}</td>
<td style="text-align: center; padding: 16px 0;">
<span style="padding: 4px 12px; background: ${t.status === 'succeeded' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; color: ${t.status === 'succeeded' ? '#10b981' : '#f59e0b'}; border-radius: 12px; font-size: 12px;">${t.status}</span>
</td>
<td style="text-align: right; padding: 16px 0; color: rgba(255,255,255,0.5);">${t.date}</td>
</tr>
                    `).join('')}
</tbody>
</table>
</div>
    `;
}

function connectStripe() {
    // Simulate Stripe Connect OAuth flow
    if (confirm('This will redirect you to Stripe to connect your account. Continue?')) {
        stripeSettings.connected = true;
        stripeSettings.accountId = 'acct_' + Math.random().toString(36).substr(2, 16);
        siteAnalytics.stripeConnected = true;
        saveStripeSettings();
        saveAnalytics();
        loadAdminStripePanel();
        alert('Stripe account connected successfully!');
    }
}

function saveStripeKeys() {
    stripeSettings.publishableKey = document.getElementById('stripePublishableKey').value;
    // Secret key is NEVER stored in browser — managed via Netlify env vars only
    saveStripeSettings();
    alert('Stripe publishable key saved!');
}

function toggleStripeMode(testMode) {
    stripeSettings.testMode = testMode;
    saveStripeSettings();
    alert(testMode ? 'Switched to Test Mode' : 'Switched to Live Mode - be careful!');
}

// ==================== INTEGRATIONS PANEL ====================
let integrations = JSON.parse(localStorage.getItem('nui_integrations')) || {
    openphone: { connected: false },
    mailchimp: { connected: false },
    sendgrid: { connected: false },
    instagram: { connected: false, username: '' },
    facebook: { connected: false, pageId: '' },
    twitter: { connected: false },
    linkedin: { connected: false },
    google: { connected: false },
    zapier: { connected: false },
    slack: { connected: false }
};

// SECURITY: Purge any API keys/secrets/tokens that were previously stored in browser
(function purgeIntegrationSecrets() {
    const sensitiveFields = ['apiKey', 'apiSecret', 'accessToken', 'clientSecret', 'webhookUrl'];
    let purged = false;
    for (const [platform, config] of Object.entries(integrations)) {
        if (typeof config === 'object') {
            for (const field of sensitiveFields) {
                if (config[field]) { delete config[field]; purged = true; }
            }
        }
    }
    if (purged) {
        localStorage.setItem('nui_integrations', JSON.stringify(integrations));
        console.log('🔒 Purged API keys/tokens from integrations storage');
    }
})();

function saveIntegrations() {
    localStorage.setItem('nui_integrations', JSON.stringify(integrations));
}

function loadAdminIntegrationsPanel() {
    document.getElementById('adminIntegrationsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">🔗 Integrations Hub</h2>
<p class="panel-subtitle">Connect your favorite tools and services to automate workflows</p>
</div>

        <!-- Integration Stats -->
<div class="stat-cards mb-32">
<div class="stat-card" style="background: #fff;"><div class="num" style="color: #000;">${Object.values(integrations).filter(i => i.connected).length}</div><div class="lbl" style="color: #333;">Connected</div></div>
<div class="stat-card" style="background: #fff;"><div class="num" style="color: #000;">${Object.keys(integrations).length}</div><div class="lbl" style="color: #333;">Available</div></div>
<div class="stat-card" style="background: #fff; border-color: #10b981;"><div class="num" style="color: #10b981;">Active</div><div class="lbl" style="color: #333;">API Status</div></div>
</div>

        <!-- Communications Integrations -->
<div class="form-section" style="background: #1c1c1c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
<div class="form-section-title" style="color: #fff; margin-bottom: 20px;">📱 Communications</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">

                <!-- OpenPhone -->
<div style="background: #242424; border: 1px solid ${integrations.openphone.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📞</div>
<div>
<div class="text-bold-white">OpenPhone</div>
<div class="text-dim fs-12">SMS & Voice Calls</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.openphone.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.openphone.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.openphone.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<div class="form-group">
<label class="form-label text-dim-70">API Key</label>
<input type="password" id="openphoneApiKey" value="${integrations.openphone.apiKey}" placeholder="Enter OpenPhone API Key" style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<div class="form-group">
<label class="form-label text-dim-70">Phone Number</label>
<input type="text" id="openphoneNumber" value="${integrations.openphone.phoneNumber}" placeholder="+1 (555) 123-4567" style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<button onclick="toggleOpenPhoneIntegration()" style="width: 100%; padding: 12px; background: ${integrations.openphone.connected ? '#dc2626' : '#7c3aed'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.openphone.connected ? 'Disconnect' : 'Connect OpenPhone'}</button>
</div>

                <!-- SendGrid -->
<div style="background: #242424; border: 1px solid ${integrations.sendgrid.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">✉️</div>
<div>
<div class="text-bold-white">SendGrid</div>
<div class="text-dim fs-12">Email Delivery</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.sendgrid.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.sendgrid.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.sendgrid.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<div class="form-group">
<label class="form-label text-dim-70">API Key</label>
<input type="password" id="sendgridApiKey" value="${integrations.sendgrid.apiKey}" placeholder="SG.xxxxxx..." style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<button onclick="connectSendGrid()" style="width: 100%; padding: 12px; background: ${integrations.sendgrid.connected ? '#dc2626' : '#3b82f6'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.sendgrid.connected ? 'Disconnect' : 'Connect SendGrid'}</button>
</div>

                <!-- Mailchimp -->
<div style="background: #242424; border: 1px solid ${integrations.mailchimp.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ffe01b, #f59e0b); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🐵</div>
<div>
<div class="text-bold-white">Mailchimp</div>
<div class="text-dim fs-12">Email Marketing</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.mailchimp.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.mailchimp.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.mailchimp.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<div class="form-group">
<label class="form-label text-dim-70">API Key</label>
<input type="password" id="mailchimpApiKey" value="${integrations.mailchimp.apiKey}" placeholder="Enter Mailchimp API Key" style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<button onclick="connectMailchimp()" style="width: 100%; padding: 12px; background: ${integrations.mailchimp.connected ? '#dc2626' : '#f59e0b'}; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.mailchimp.connected ? 'Disconnect' : 'Connect Mailchimp'}</button>
</div>
</div>
</div>

        <!-- Social Media Integrations -->
<div class="form-section" style="background: #1c1c1c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
<div class="form-section-title" style="color: #fff; margin-bottom: 20px;">📱 Social Media</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">

                <!-- Instagram -->
<div style="background: #242424; border: 1px solid ${integrations.instagram.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📸</div>
<div>
<div class="text-bold-white">Instagram</div>
<div class="text-dim fs-12">DMs & Posts</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.instagram.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.instagram.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.instagram.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<div class="form-group">
<label class="form-label text-dim-70">Username</label>
<input type="text" id="instagramUsername" value="${integrations.instagram.username}" placeholder="@yourusername" style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<button onclick="connectInstagram()" style="width: 100%; padding: 12px; background: ${integrations.instagram.connected ? '#dc2626' : 'linear-gradient(135deg, #833ab4, #fd1d1d)'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.instagram.connected ? 'Disconnect' : 'Connect Instagram'}</button>
</div>

                <!-- Facebook -->
<div style="background: #242424; border: 1px solid ${integrations.facebook.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: #1877f2; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📘</div>
<div>
<div class="text-bold-white">Facebook</div>
<div class="text-dim fs-12">Messenger & Pages</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.facebook.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.facebook.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.facebook.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<button onclick="connectFacebook()" style="width: 100%; padding: 12px; background: ${integrations.facebook.connected ? '#dc2626' : '#1877f2'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.facebook.connected ? 'Disconnect' : 'Connect Facebook'}</button>
</div>

                <!-- LinkedIn -->
<div style="background: #242424; border: 1px solid ${integrations.linkedin.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: #0077b5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">💼</div>
<div>
<div class="text-bold-white">LinkedIn</div>
<div class="text-dim fs-12">Professional Network</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.linkedin.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.linkedin.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.linkedin.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<button onclick="connectLinkedIn()" style="width: 100%; padding: 12px; background: ${integrations.linkedin.connected ? '#dc2626' : '#0077b5'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.linkedin.connected ? 'Disconnect' : 'Connect LinkedIn'}</button>
</div>
</div>
</div>

        <!-- Automation Integrations -->
<div class="form-section" style="background: #1c1c1c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px;">
<div class="form-section-title" style="color: #fff; margin-bottom: 20px;">⚡ Automation & Tools</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">

                <!-- Zapier -->
<div style="background: #242424; border: 1px solid ${integrations.zapier.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: #ff4a00; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">⚡</div>
<div>
<div class="text-bold-white">Zapier</div>
<div class="text-dim fs-12">Workflow Automation</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.zapier.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.zapier.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.zapier.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<div class="form-group">
<label class="form-label text-dim-70">Webhook URL</label>
<input type="text" id="zapierWebhook" value="${integrations.zapier.webhookUrl}" placeholder="https://hooks.zapier.com/..." style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<button onclick="connectZapier()" style="width: 100%; padding: 12px; background: ${integrations.zapier.connected ? '#dc2626' : '#ff4a00'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.zapier.connected ? 'Disconnect' : 'Connect Zapier'}</button>
</div>

                <!-- Slack -->
<div style="background: #242424; border: 1px solid ${integrations.slack.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: #4a154b; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">💬</div>
<div>
<div class="text-bold-white">Slack</div>
<div class="text-dim fs-12">Team Notifications</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.slack.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.slack.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.slack.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<div class="form-group">
<label class="form-label text-dim-70">Webhook URL</label>
<input type="text" id="slackWebhook" value="${integrations.slack.webhookUrl}" placeholder="https://hooks.slack.com/..." style="width: 100%; padding: 10px; background: #252525; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff;">
</div>
<button onclick="connectSlack()" style="width: 100%; padding: 12px; background: ${integrations.slack.connected ? '#dc2626' : '#4a154b'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.slack.connected ? 'Disconnect' : 'Connect Slack'}</button>
</div>

                <!-- Google -->
<div style="background: #242424; border: 1px solid ${integrations.google.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
<div class="admin-row-between">
<div class="flex-center-gap-12">
<div style="width: 48px; height: 48px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔵</div>
<div>
<div class="text-bold-white">Google</div>
<div class="text-dim fs-12">Calendar & Drive</div>
</div>
</div>
<span style="padding: 4px 12px; background: ${integrations.google.connected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${integrations.google.connected ? '#10b981' : 'rgba(255,255,255,0.5)'}; border-radius: 100px; font-size: 12px;">${integrations.google.connected ? 'Connected' : 'Not Connected'}</span>
</div>
<button onclick="connectGoogle()" style="width: 100%; padding: 12px; background: ${integrations.google.connected ? '#dc2626' : '#4285f4'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">${integrations.google.connected ? 'Disconnect' : 'Connect Google'}</button>
</div>
</div>
</div>
    `;
}

// Integration Connection Functions (consolidated)
function toggleOpenPhoneIntegration() {
    const apiKey = document.getElementById('openphoneApiKey')?.value;
    const phoneNumber = document.getElementById('openphoneNumber')?.value;
    if (integrations.openphone.connected) {
        integrations.openphone = { connected: false, apiKey: '', phoneNumber: '' };
        // Also disconnect from SMS system
        smsSystem.openPhone = { connected: false, apiKey: '', phoneNumber: '', userId: '' };
        saveSms();
    } else {
        if (!apiKey) { alert('Please enter your OpenPhone API key'); return; }
        integrations.openphone = { connected: true, apiKey, phoneNumber };
        // Also update SMS system
        smsSystem.openPhone = { connected: true, apiKey, phoneNumber, userId: 'user_' + Date.now() };
        saveSms();
    }
    saveIntegrations();
    loadAdminIntegrationsPanel();
    alert(integrations.openphone.connected ? 'OpenPhone connected! SMS & calls will sync automatically.' : 'OpenPhone disconnected.');
}

function connectSendGrid() {
    const apiKey = document.getElementById('sendgridApiKey').value;
    if (integrations.sendgrid.connected) {
        integrations.sendgrid = { connected: false, apiKey: '' };
    } else {
        if (!apiKey) { alert('Please enter your SendGrid API key'); return; }
        integrations.sendgrid = { connected: true, apiKey };
    }
    saveIntegrations();
    loadAdminIntegrationsPanel();
    alert(integrations.sendgrid.connected ? 'SendGrid connected! Emails will be sent via SendGrid.' : 'SendGrid disconnected.');
}

function connectMailchimp() {
    const apiKey = document.getElementById('mailchimpApiKey').value;
    if (integrations.mailchimp.connected) {
        integrations.mailchimp = { connected: false, apiKey: '', listId: '' };
    } else {
        if (!apiKey) { alert('Please enter your Mailchimp API key'); return; }
        integrations.mailchimp = { connected: true, apiKey, listId: '' };
    }
    saveIntegrations();
    loadAdminIntegrationsPanel();
    alert(integrations.mailchimp.connected ? 'Mailchimp connected! Subscribers will sync automatically.' : 'Mailchimp disconnected.');
}

function connectInstagram() {
    const username = document.getElementById('instagramUsername')?.value || '';
    if (integrations.instagram.connected) {
        integrations.instagram = { connected: false, accessToken: '', username: '' };
    } else {
        // Simulate OAuth flow
        integrations.instagram = { connected: true, accessToken: 'ig_demo_token', username };
    }
    saveIntegrations();
    loadAdminIntegrationsPanel();
    alert(integrations.instagram.connected ? 'Instagram connected! DMs will appear in your inbox.' : 'Instagram disconnected.');
}

function connectFacebook() {
    if (integrations.facebook.connected) {
        integrations.facebook = { connected: false, accessToken: '', pageId: '' };
        saveIntegrations();
        loadAdminIntegrationsPanel();
        alert('Facebook disconnected.');
    } else {
        // Real Facebook OAuth - requires Facebook App ID in env.js
        const fbAppId = window.FACEBOOK_APP_ID || '';
        if (!fbAppId) {
            alert('⚠️ Facebook App ID not configured.\n\nTo connect Facebook:\n1. Create an app at developers.facebook.com\n2. Add your App ID to env.js\n3. Configure OAuth redirect URL');
            return;
        }
        const redirectUri = encodeURIComponent(window.location.origin + '/.netlify/functions/oauth-callback?platform=facebook');
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_messaging&response_type=code`;
        window.open(authUrl, 'Facebook Login', 'width=600,height=700');
    }
}

function connectLinkedIn() {
    if (integrations.linkedin.connected) {
        integrations.linkedin = { connected: false, accessToken: '' };
        saveIntegrations();
        loadAdminIntegrationsPanel();
        alert('LinkedIn disconnected.');
    } else {
        const liClientId = window.LINKEDIN_CLIENT_ID || '';
        if (!liClientId) {
            alert('⚠️ LinkedIn Client ID not configured.\n\nTo connect LinkedIn:\n1. Create an app at linkedin.com/developers\n2. Add your Client ID to env.js');
            return;
        }
        const redirectUri = encodeURIComponent(window.location.origin + '/.netlify/functions/oauth-callback?platform=linkedin');
        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${liClientId}&redirect_uri=${redirectUri}&scope=r_liteprofile%20w_member_social&response_type=code`;
        window.open(authUrl, 'LinkedIn Login', 'width=600,height=700');
    }
}

function connectZapier() {
    const webhookUrl = document.getElementById('zapierWebhook')?.value;
    if (integrations.zapier.connected) {
        integrations.zapier = { connected: false, webhookUrl: '' };
    } else {
        if (!webhookUrl) { alert('Please enter your Zapier webhook URL'); return; }
        integrations.zapier = { connected: true, webhookUrl };
    }
    saveIntegrations();
    loadAdminIntegrationsPanel();
    alert(integrations.zapier.connected ? 'Zapier connected! Triggers will be sent automatically.' : 'Zapier disconnected.');
}

function connectSlack() {
    const webhookUrl = document.getElementById('slackWebhook')?.value;
    if (integrations.slack.connected) {
        integrations.slack = { connected: false, webhookUrl: '' };
    } else {
        if (!webhookUrl) { alert('Please enter your Slack webhook URL'); return; }
        integrations.slack = { connected: true, webhookUrl };
    }
    saveIntegrations();
    loadAdminIntegrationsPanel();
    alert(integrations.slack.connected ? 'Slack connected! Notifications will be sent to your channel.' : 'Slack disconnected.');
}

function connectGoogle() {
    if (integrations.google.connected) {
        integrations.google = { connected: false, clientId: '', clientSecret: '' };
        saveIntegrations();
        loadAdminIntegrationsPanel();
        alert('Google disconnected.');
    } else {
        alert('⚠️ Google OAuth requires setup.\n\nTo connect Google:\n1. Create a project at console.cloud.google.com\n2. Enable Calendar & Drive APIs\n3. Create OAuth credentials\n4. Add Client ID to env.js');
    }
}

// ==================== DESIGNER DASHBOARD ====================
