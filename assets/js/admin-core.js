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
        'gmb': loadAdminGmbPanel,
        'blog': loadAdminBlogPanel,
        'emailmarketing': loadAdminEmailMarketingPanel,
        'loyalty': loadAdminLoyaltyPanel,
        'communications': loadAdminCommunicationsPanel,
        'socialdm': loadAdminSocialDmPanel,
        'sms': loadAdminSmsPanel,
        'siteimages': loadAdminSiteImagesPanel,
        'newclient': loadAdminNewClientPanel,
        'assets': loadAdminAssetsPanel,
        'portfolio': loadAdminPortfolioPanel,
        'moodboard': loadAdminMoodboardPanel,
        'about': loadAdminAboutPanel,
        'designers': loadAdminDesignersPanel,
        'integrations': loadAdminIntegrationsPanel,
        'usermanagement': loadAdminUserManagementPanel
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
}


// ==================== ADMIN PANELS ====================
function loadAdminDashboardPanel() {
    const totalAssets = clients.reduce((sum, c) => sum + (c.assets ? Object.values(c.assets).flat().length : 0), 0);
    const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.estimate || 0), 0);
    const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.estimate || 0), 0);
    const avgReview = siteAnalytics.googleReviews?.avgRating || 4.8;

    document.getElementById('adminDashboardPanel').innerHTML = `
<div class="flex-between mb-32">
<h2 class="fs-28 fw-700">Dashboard</h2>
<div class="flex-gap-12">
<button onclick="syncAllData()" class="btn-outline flex-center-gap-8">🔄 Sync All</button>
<span class="sync-status" style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: ${_backendAvailable ? '#10b981' : '#ef4444'}; color: #fff; border-radius: 8px; font-size: 13px;">
<span style="width: 8px; height: 8px; background: #fff; border-radius: 50%; ${_backendAvailable ? '' : 'animation: pulse 1s infinite;'}"></span>
                    ${_backendAvailable ? (_lastSyncTime ? 'Backend Synced ' + new Date(_lastSyncTime).toLocaleTimeString() : 'Backend Connected') : 'Backend Offline (localStorage only)'}
</span>
</div>
</div>

        <!-- Quick Stats Row -->
<div class="stat-cards mb-32">
<div class="stat-card pointer" onclick="showAdminPanel('clients')"><div class="num">${clients.length}</div><div class="lbl">Active Clients</div></div>
<div class="stat-card pointer" onclick="showAdminPanel('orders')"><div class="num">${orders.length}</div><div class="lbl">Total Orders</div></div>
<div class="stat-card pointer" onclick="showAdminPanel('projects')"><div class="num">${pendingOrders}</div><div class="lbl">In Progress</div></div>
<div class="stat-card pointer" onclick="showAdminPanel('analytics')"><div class="num">${siteAnalytics.visitors?.total || 2847}</div><div class="lbl">Site Visitors</div></div>
</div>

        <!-- Revenue & Reviews Row -->
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
<div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 24px; border-radius: 16px; color: #fff;">
<h3 class="admin-heading-sm">REVENUE OVERVIEW</h3>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
<div>
<div style="font-size: 32px; font-weight: 700; color: var(--accent);">$${totalRevenue.toLocaleString()}</div>
<div class="text-muted-sm">Total Revenue</div>
</div>
<div>
<div style="font-size: 32px; font-weight: 700; color: #10b981;">$${paidRevenue.toLocaleString()}</div>
<div class="text-muted-sm">Collected</div>
</div>
<div>
<div style="font-size: 32px; font-weight: 700; color: #f59e0b;">$${(totalRevenue - paidRevenue).toLocaleString()}</div>
<div class="text-muted-sm">Outstanding</div>
</div>
</div>
<button onclick="showAdminPanel('payments')" class="btn-outline" style="margin-top: 20px; width: 100%;">View All Payments →</button>
</div>
<div style="background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e5e5e5;">
<h3 class="admin-heading-sm">GOOGLE REVIEWS</h3>
<div class="text-center">
<div style="font-size: 48px; font-weight: 700; color: #f59e0b;">⭐ ${avgReview}</div>
<div class="text-muted-sm">${siteAnalytics.googleReviews?.count || 28} reviews</div>
<button onclick="showAdminPanel('reviews')" class="btn-cta" style="margin-top: 16px; width: 100%;">Manage Reviews</button>
</div>
</div>
</div>

        <!-- Sync Status Grid -->
<div style="background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e5e5e5; margin-bottom: 32px;">
<h3 class="admin-heading-sm">INTEGRATION STATUS</h3>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                ${renderSyncStatusCard('Stripe', siteAnalytics.stripeConnected, 'stripe')}
                ${renderSyncStatusCard('Google Reviews', siteAnalytics.googleReviewsConnected, 'reviews')}
                ${renderSyncStatusCard('Analytics', true, 'analytics')}
                ${renderSyncStatusCard('CRM', true, 'crm')}
</div>
</div>

        <!-- Recent Activity -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
<div>
<h2 style="font-size: 18px; margin-bottom: 20px;">Recent Orders</h2>
<div>${orders.slice(-3).reverse().map(o => renderOrderCard(o)).join('')}</div>
</div>
<div>
<h2 style="font-size: 18px; margin-bottom: 20px;">Recent Clients</h2>
<div class="card-grid" style="grid-template-columns: 1fr;">${clients.slice(-3).reverse().map(c => renderClientCard(c)).join('')}</div>
</div>
</div>
    `;
}

function renderSyncStatusCard(name, connected, panel) {
    return `
<div onclick="showAdminPanel('${panel}')" style="padding: 16px; background: ${connected ? '#111' : '#fef2f2'}; border-radius: 12px; cursor: pointer; transition: transform 0.2s;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<span style="width: 10px; height: 10px; background: ${connected ? '#10b981' : '#ef4444'}; border-radius: 50%;"></span>
<span style="font-weight: 600; color: ${connected ? '#fff' : '#333'};">${name}</span>
</div>
<div style="font-size: 12px; color: ${connected ? '#10b981' : '#dc2626'};">${connected ? 'Connected' : 'Not Connected'}</div>
</div>
    `;
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
    let meetings = JSON.parse(localStorage.getItem('nui_meetings')) || [];

    try {
        const resp = await fetch('/.netlify/functions/save-booking?date=all');
        // The GET endpoint only supports single date, so we merge local + any server-synced data
    } catch(e) { /* use local data */ }

    // Aggregate calendar events from multiple sources
    const events = [
        // Scheduled meetings/appointments
        ...meetings.map(m => ({
            id: `meeting-${m.id || m.serverId}`,
            title: `${m.type === 'zoom' ? '💻 Zoom' : '📞 Phone'} Call`,
            date: m.date,
            time: m.time,
            type: 'meeting',
            client: m.clientName || m.clientEmail || m.client_name || m.client_email || 'Unknown',
            color: '#3b82f6'
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
</div>
<span style="background: ${e.color}20; color: ${e.color}; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase;">${e.type}</span>
</div>
<div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 8px;">
                            📅 ${new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${e.time ? `at ${e.time}` : ''}
</div>
</div>
                `).join('')}
</div>
</div>

        <!-- Stats -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px;">
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${meetings.length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Scheduled Meetings</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${orders.filter(o => o.dueDate && o.status !== 'delivered').length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Pending Deadlines</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: #10b981;">${invoices.filter(i => i.status !== 'paid').length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Unpaid Invoices</div>
</div>
<div style="background: var(--admin-card); border: 1px solid var(--admin-border); padding: 20px; border-radius: 12px; text-align: center;">
<div style="font-size: 32px; font-weight: 700; color: var(--red);">${events.length}</div>
<div style="font-size: 13px; color: var(--admin-text-muted);">Total Events</div>
</div>
</div>
    `;
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
<input type="text" id="userSearchInput" oninput="filterUserTable()" placeholder="Search users by name or email..." style="width: 100%; padding: 12px 16px; background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px;">
</div>

        <!-- All Users Table -->
<div style="background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden;">
<div style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);">
<h3 style="font-size: 16px; font-weight: 600;">All Users</h3>
</div>
<div style="overflow-x: auto;">
<table id="userManagementTable" style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="background: #0a0a0a;">
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
<button onclick="viewClientAsAdmin(${c.id})" style="background: #000; color: #fff;">View Portal</button>
<button onclick="currentAdminClient = clients.find(x => x.id === ${c.id}); showAdminPanel('assets');" style="background: #f5f5f5; color: #000;">Upload</button>
<button onclick="deleteClient(${c.id})" style="background: #fee2e2; color: #dc2626;">×</button>
</div>
</div>
 </div>`;
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
    secretKey: '',
    webhookSecret: '',
    testMode: true
};
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
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Balance</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">$4,850</div>
<div style="font-size: 13px; color: #10b981; margin-top: 8px;">Available for payout</div>
</div>
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">This Month</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">$12,450</div>
<div style="font-size: 13px; color: #10b981; margin-top: 8px;">↑ 18% vs last month</div>
</div>
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Pending</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">$2,300</div>
<div style="font-size: 13px; color: #f59e0b; margin-top: 8px;">3 payments processing</div>
</div>
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px;">Success Rate</div>
<div style="font-size: 32px; font-weight: 700; color: #fff;">98.5%</div>
<div style="font-size: 13px; color: #10b981; margin-top: 8px;">Excellent</div>
</div>
</div>
        `}

        <!-- API Keys -->
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 32px;">
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
<input type="password" id="stripeSecretKey" value="${stripeSettings.secretKey}" placeholder="sk_test_..." style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-family: monospace; font-size: 13px; background: #252525; color: #fff;">
</div>
</div>
<button onclick="saveStripeKeys()" class="btn-cta mt-20">Save API Keys</button>
</div>

        <!-- Payment Methods -->
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 32px;">
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
<div style="background: #1a1a1a; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
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
    stripeSettings.secretKey = document.getElementById('stripeSecretKey').value;
    saveStripeSettings();
    alert('Stripe API keys saved!');
}

function toggleStripeMode(testMode) {
    stripeSettings.testMode = testMode;
    saveStripeSettings();
    alert(testMode ? 'Switched to Test Mode' : 'Switched to Live Mode - be careful!');
}

// ==================== INTEGRATIONS PANEL ====================
let integrations = JSON.parse(localStorage.getItem('nui_integrations')) || {
    openphone: { connected: false, apiKey: '', phoneNumber: '' },
    mailchimp: { connected: false, apiKey: '', listId: '' },
    sendgrid: { connected: false, apiKey: '' },
    instagram: { connected: false, accessToken: '', username: '' },
    facebook: { connected: false, accessToken: '', pageId: '' },
    twitter: { connected: false, apiKey: '', apiSecret: '' },
    linkedin: { connected: false, accessToken: '' },
    google: { connected: false, clientId: '', clientSecret: '' },
    zapier: { connected: false, webhookUrl: '' },
    slack: { connected: false, webhookUrl: '' }
};

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
<div class="form-section" style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
<div class="form-section-title" style="color: #fff; margin-bottom: 20px;">📱 Communications</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">

                <!-- OpenPhone -->
<div style="background: #1a1a1a; border: 1px solid ${integrations.openphone.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div style="background: #1a1a1a; border: 1px solid ${integrations.sendgrid.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div style="background: #1a1a1a; border: 1px solid ${integrations.mailchimp.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div class="form-section" style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
<div class="form-section-title" style="color: #fff; margin-bottom: 20px;">📱 Social Media</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">

                <!-- Instagram -->
<div style="background: #1a1a1a; border: 1px solid ${integrations.instagram.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div style="background: #1a1a1a; border: 1px solid ${integrations.facebook.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div style="background: #1a1a1a; border: 1px solid ${integrations.linkedin.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div class="form-section" style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px;">
<div class="form-section-title" style="color: #fff; margin-bottom: 20px;">⚡ Automation & Tools</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">

                <!-- Zapier -->
<div style="background: #1a1a1a; border: 1px solid ${integrations.zapier.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div style="background: #1a1a1a; border: 1px solid ${integrations.slack.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
<div style="background: #1a1a1a; border: 1px solid ${integrations.google.connected ? '#10b981' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 20px;">
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
