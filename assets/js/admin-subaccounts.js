// ═══════════════════════════════════════════════════════════════
// admin-subaccounts.js — Agency Sub-Account Management
// NUI Master Admin controls all sub-accounts from here
// ═══════════════════════════════════════════════════════════════

const NUI_FEATURES = [
    { key: 'dashboard',      label: 'Dashboard',           icon: '📊', group: 'Core' },
    { key: 'clients',        label: 'Clients CRM',         icon: '👥', group: 'Core' },
    { key: 'projects',       label: 'Projects',            icon: '📁', group: 'Core' },
    { key: 'orders',         label: 'Orders',              icon: '📦', group: 'Core' },
    { key: 'invoicing',      label: 'Invoicing',           icon: '💳', group: 'Core' },
    { key: 'calendar',       label: 'Calendar',            icon: '📅', group: 'Core' },
    { key: 'designer',       label: 'Brand Designer',      icon: '🎨', group: 'Creative' },
    { key: 'moodboard',      label: 'Moodboard Editor',    icon: '🖼️', group: 'Creative' },
    { key: 'print',          label: 'Print Store',         icon: '🖨️', group: 'Creative' },
    { key: 'crm',            label: 'Contact Hub',         icon: '📬', group: 'Marketing' },
    { key: 'sms',            label: 'SMS Campaigns',       icon: '💬', group: 'Marketing' },
    { key: 'emailmarketing', label: 'Email Marketing',     icon: '📧', group: 'Marketing' },
    { key: 'push',           label: 'Push Notifications',  icon: '🔔', group: 'Marketing' },
    { key: 'retargeting',    label: 'Retargeting',         icon: '🎯', group: 'Marketing' },
    { key: 'visitors',       label: 'Visitor ID (RB2B)',   icon: '🔍', group: 'Marketing' },
    { key: 'seo',            label: 'SEO Tools',           icon: '🔎', group: 'Growth' },
    { key: 'rankintel',      label: 'Rank Intel',          icon: '📈', group: 'Growth' },
    { key: 'citations',      label: 'Citations',           icon: '📍', group: 'Growth' },
    { key: 'geofencing',     label: 'Geo-Fencing',         icon: '🗺️', group: 'Growth' },
    { key: 'aiphone',        label: 'AI Phone Assistant',  icon: '🤖', group: 'AI' },
    { key: 'analytics',      label: 'Analytics',           icon: '📉', group: 'Reporting' },
    { key: 'integrations',   label: 'Integrations',        icon: '🔗', group: 'Settings' },
    { key: 'sites',          label: 'Client Sites',        icon: '🌐', group: 'Settings' },
    { key: 'settings',       label: 'Settings',            icon: '⚙️', group: 'Settings' },
];

const NUI_PLANS = {
    starter:      { label: 'Starter',      price: 97,  color: '#6b7280', features: ['dashboard','clients','projects','orders','invoicing','calendar','crm','emailmarketing'] },
    growth:       { label: 'Growth',       price: 197, color: '#3b82f6', features: ['dashboard','clients','projects','orders','invoicing','calendar','crm','emailmarketing','sms','push','seo','analytics'] },
    professional: { label: 'Professional', price: 397, color: '#8b5cf6', features: ['dashboard','clients','projects','orders','invoicing','calendar','designer','moodboard','crm','sms','emailmarketing','push','retargeting','visitors','seo','rankintel','citations','analytics','integrations','settings'] },
    agency:       { label: 'Agency',       price: 697, color: '#f59e0b', features: 'all' },
    custom:       { label: 'Custom',       price: 0,   color: '#dc2626', features: [] },
};

var _subAccounts = [];
var _editingAccount = null;

function loadAdminSubAccountsPanel() {
    var panel = document.getElementById('adminSubaccountsPanel');
    if (!panel) return;
    panel.innerHTML = buildSubAccountsPanelHTML();
    loadSubAccountsFromSupabase();
}

function buildSubAccountsPanelHTML() {
    return '<div style="padding:24px 28px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">' +
            '<div>' +
                '<h2 style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Agency Sub-Accounts</h2>' +
                '<p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:13px;">White-label NUI system for other agencies. You control every feature.</p>' +
            '</div>' +
            '<button onclick="openSubAccountModal()" style="background:#dc2626;color:#fff;border:none;padding:11px 22px;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;">+ New Sub-Account</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">' +
            buildSubAcctStat('Total Accounts','—','#3b82f6','substat-total') +
            buildSubAcctStat('Active','—','#10b981','substat-active') +
            buildSubAcctStat('Monthly Revenue','—','#f59e0b','substat-revenue') +
            buildSubAcctStat('Suspended','—','#ef4444','substat-suspended') +
        '</div>' +
        '<div id="subaccounts-list"><div style="text-align:center;padding:60px;color:rgba(255,255,255,0.3);">Loading accounts...</div></div>' +
        '</div>' +
        '<div id="subacct-modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;overflow-y:auto;padding:40px 20px;">' +
            '<div id="subacct-modal" style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;"></div>' +
        '</div>';
}

function buildSubAcctStat(label, val, color, id) {
    return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;">' +
        '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + label + '</div>' +
        '<div style="font-size:28px;font-weight:800;color:' + color + ';" id="' + id + '">' + val + '</div>' +
    '</div>';
}

async function loadSubAccountsFromSupabase() {
    try {
        if (typeof db !== 'undefined' && db) {
            var res = await db.from('agency_subaccounts').select('*').order('created_at', { ascending: false });
            if (!res.error && res.data) {
                _subAccounts = res.data;
                localStorage.setItem('nui_subaccounts', JSON.stringify(res.data));
                renderSubAccountsGrid();
                updateSubAcctStats();
                return;
            }
        }
    } catch(e) { console.warn('Supabase subaccounts:', e); }
    _subAccounts = JSON.parse(localStorage.getItem('nui_subaccounts') || '[]');
    renderSubAccountsGrid();
    updateSubAcctStats();
}

function renderSubAccountsGrid() {
    var el = document.getElementById('subaccounts-list');
    if (!el) return;
    if (_subAccounts.length === 0) {
        el.innerHTML = '<div style="text-align:center;padding:80px 40px;border:1px dashed rgba(255,255,255,0.08);border-radius:16px;">' +
            '<div style="font-size:48px;margin-bottom:16px;">🏢</div>' +
            '<div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;">No sub-accounts yet</div>' +
            '<div style="color:rgba(255,255,255,0.35);font-size:13px;margin-bottom:24px;">Create your first agency sub-account to white-label the NUI system</div>' +
            '<button onclick="openSubAccountModal()" style="background:#dc2626;color:#fff;border:none;padding:12px 28px;border-radius:10px;cursor:pointer;font-weight:700;font-size:14px;">+ Create First Account</button>' +
        '</div>';
        return;
    }
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;">' +
        _subAccounts.map(function(a) { return buildAccountCard(a); }).join('') +
    '</div>';
}

function buildAccountCard(acct) {
    var plan = NUI_PLANS[acct.plan] || NUI_PLANS.starter;
    var statusColor = acct.status === 'active' ? '#10b981' : '#ef4444';
    var features = acct.features || [];
    var enabledCount = Array.isArray(features) ? features.length : 0;
    var previewFeatures = NUI_FEATURES.filter(function(f){ return Array.isArray(features) && features.includes(f.key); }).slice(0,6);

    return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">' +
        '<div style="padding:20px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:flex-start;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="width:36px;height:36px;border-radius:10px;background:' + plan.color + '18;display:flex;align-items:center;justify-content:center;font-size:16px;">🏢</div>' +
                '<div>' +
                    '<div style="font-size:15px;font-weight:700;color:#fff;">' + acct.agency_name + '</div>' +
                    '<div style="font-size:11px;color:rgba(255,255,255,0.35);">' + (acct.domain || 'No domain') + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
                '<span style="padding:3px 10px;background:' + statusColor + '18;color:' + statusColor + ';border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;">' + (acct.status||'active') + '</span>' +
                '<span style="padding:3px 10px;background:' + plan.color + '18;color:' + plan.color + ';border-radius:20px;font-size:10px;font-weight:700;">' + plan.label + '</span>' +
            '</div>' +
        '</div>' +
        '<div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">' +
            '<div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + enabledCount + ' of ' + NUI_FEATURES.length + ' features enabled</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                previewFeatures.map(function(f){ return '<span style="padding:3px 9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;font-size:10px;color:rgba(255,255,255,0.5);">' + f.icon + ' ' + f.label + '</span>'; }).join('') +
                (enabledCount > 6 ? '<span style="padding:3px 9px;background:rgba(255,255,255,0.03);border-radius:20px;font-size:10px;color:rgba(255,255,255,0.3);">+' + (enabledCount-6) + ' more</span>' : '') +
            '</div>' +
        '</div>' +
        '<div style="padding:12px 20px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:8;">' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:.5px;text-transform:uppercase;flex-shrink:0;">Portal URL</span>' +
            '<code id="portalurl-' + acct.id + '" style="flex:1;font-size:11px;color:#6ee7b7;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:6px;padding:5px 10px;margin:0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">newurbaninfluence.com/portal/?agency=' + (acct.portal_slug||acct.id) + '</code>' +
            '<button onclick="copyPortalLink(\'' + (acct.portal_slug||acct.id) + '\')" style="flex-shrink:0;padding:5px 10px;background:rgba(16,185,129,0.08);color:#6ee7b7;border:1px solid rgba(16,185,129,0.2);border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">📋 Copy</button>' +
        '</div>' +
        '<div style="padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">' +
            '<div>' +
                '<div style="font-size:18px;font-weight:800;color:#fff;">$' + (acct.monthly_rate || plan.price).toLocaleString() + '<span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.3)">/mo</span></div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.3);">' + (acct.owner_email||'No email') + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
                '<button onclick="toggleSubAccountStatus(\'' + acct.id + '\')" style="padding:7px 14px;background:' + (acct.status==='active'?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.1)') + ';color:' + (acct.status==='active'?'#ef4444':'#10b981') + ';border:1px solid ' + (acct.status==='active'?'rgba(239,68,68,0.2)':'rgba(16,185,129,0.2)') + ';border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">' +
                    (acct.status==='active'?'⏸ Suspend':'▶ Activate') +
                '</button>' +
                '<button onclick="openSubAccountModal(\'' + acct.id + '\')" style="padding:7px 14px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">✏️ Manage</button>' +
                '<button onclick="openWhiteLabelSettings(\'' + acct.id + '\')" style="padding:7px 14px;background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.25);border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;" title="White Label Settings">🎨 Brand</button>' +
                '<button onclick="enterPortalAsAdmin(\'' + acct.id + '\')" style="padding:7px 14px;background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.25);border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;" title="Enter their portal as admin — no login required">🚀 Enter Portal</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function updateSubAcctStats() {
    var active = _subAccounts.filter(function(a){ return a.status==='active'; });
    var revenue = active.reduce(function(sum,a){ return sum + (a.monthly_rate || (NUI_PLANS[a.plan]||{}).price || 0); }, 0);
    var s1=document.getElementById('substat-total'); if(s1) s1.textContent=_subAccounts.length;
    var s2=document.getElementById('substat-active'); if(s2) s2.textContent=active.length;
    var s3=document.getElementById('substat-revenue'); if(s3) s3.textContent='$'+revenue.toLocaleString();
    var s4=document.getElementById('substat-suspended'); if(s4) s4.textContent=_subAccounts.filter(function(a){return a.status==='suspended';}).length;
}

function openSubAccountModal(accountId) {
    _editingAccount = accountId ? (_subAccounts.find(function(a){return a.id==accountId;})||null) : null;
    var modal = document.getElementById('subacct-modal');
    var overlay = document.getElementById('subacct-modal-overlay');
    if (!modal || !overlay) return;

    var acct = _editingAccount || { agency_name:'', domain:'', owner_name:'', owner_email:'', owner_phone:'', plan:'starter', status:'active', monthly_rate:'', features:[].concat(NUI_PLANS.starter.features), brand_color:'#dc2626', notes:'' };
    var groups = [];
    NUI_FEATURES.forEach(function(f){ if(groups.indexOf(f.group)===-1) groups.push(f.group); });

    var featureHTML = groups.map(function(group){
        var items = NUI_FEATURES.filter(function(f){return f.group===group;});
        return '<div style="margin-bottom:20px;">' +
            '<div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.05);">' + group + '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">' +
            items.map(function(f){
                var checked = Array.isArray(acct.features) && acct.features.includes(f.key);
                return '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;cursor:pointer;">' +
                    '<input type="checkbox" id="feat-' + f.key + '" value="' + f.key + '" ' + (checked?'checked':'') + ' style="width:16px;height:16px;accent-color:#dc2626;cursor:pointer;">' +
                    '<span style="font-size:13px;">' + f.icon + '</span>' +
                    '<span style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);">' + f.label + '</span>' +
                '</label>';
            }).join('') +
            '</div></div>';
    }).join('');

    modal.innerHTML = 
        '<div style="padding:28px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">' +
            '<div><div style="font-size:18px;font-weight:800;color:#fff;">' + (_editingAccount ? 'Manage: '+acct.agency_name : 'New Sub-Account') + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:3px;">Set features, plan, and access controls</div></div>' +
            '<button onclick="closeSubAccountModal()" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;">✕</button>' +
        '</div>' +
        '<div style="padding:28px;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">' +
                mi('Agency Name','subacct-name',acct.agency_name,'e.g. Detroit Creative Co.') +
                mi('Domain','subacct-domain',acct.domain,'e.g. detroitcreative.com') +
                mi('Owner Name','subacct-owner',acct.owner_name,'Full name') +
                mi('Owner Email','subacct-email',acct.owner_email,'email@agency.com') +
                mi('Owner Phone','subacct-phone',acct.owner_phone,'(313) 000-0000') +
                mi('Brand Color','subacct-color',acct.brand_color||'#dc2626','','color') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">' +
                '<div><div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Portal Theme</div>' +
                '<select id="subacct-theme" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;">' +
                '<option value="dark" ' + ((acct.brand_theme||'dark')==='dark'?'selected':'') + '>⬛ Dark (Black Background)</option>' +
                '<option value="light" ' + (acct.brand_theme==='light'?'selected':'') + '>⬜ Light (White Background)</option>' +
                '</select></div>' +
                '<div><div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Plan</div>' +
                '<select id="subacct-plan" onchange="onPlanChange(this.value)" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;">' +
                Object.entries(NUI_PLANS).map(function(e){ return '<option value="'+e[0]+'" '+(acct.plan===e[0]?'selected':'')+'>'+e[1].label+' — $'+e[1].price+'/mo</option>'; }).join('') +
                '</select></div>' +
                mi('Monthly Rate (override)','subacct-rate',acct.monthly_rate||'','Leave blank for plan default','number') +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
                '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;">Feature Access</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button onclick="toggleAllFeatures(true)" style="padding:5px 12px;background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2);border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">Enable All</button>' +
                    '<button onclick="toggleAllFeatures(false)" style="padding:5px 12px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">Disable All</button>' +
                '</div>' +
            '</div>' +
            featureHTML +
            '<div style="margin-top:20px;"><div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Notes</div>' +
            '<textarea id="subacct-notes" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px 14px;border-radius:10px;font-size:13px;font-family:inherit;resize:vertical;min-height:70px;box-sizing:border-box;">' + (acct.notes||'') + '</textarea></div>' +
        '</div>' +
        '<div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">' +
            '<div>' + (_editingAccount ? '<button onclick="deleteSubAccount(\''+acct.id+'\')" style="padding:10px 18px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">🗑 Delete</button>' : '') + '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<button onclick="closeSubAccountModal()" style="padding:10px 22px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Cancel</button>' +
                '<button onclick="saveSubAccount()" style="padding:10px 28px;background:#dc2626;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;">' + (_editingAccount?'💾 Save Changes':'🚀 Create Account') + '</button>' +
                (_editingAccount ? '<button onclick="closeSubAccountModal();openWhiteLabelSettings(\'' + acct.id + '\')" style="padding:10px 18px;background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.25);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;margin-left:6px;">🎨 White Label</button>' : '') +
            '</div>' +
        '</div>';

    overlay.style.display = 'block';
}

function mi(label, id, value, placeholder, type) {
    type = type || 'text';
    return '<div><div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">' + label + '</div>' +
        '<input type="' + type + '" id="' + id + '" value="' + (value||'') + '" placeholder="' + (placeholder||'') + '" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;font-family:inherit;box-sizing:border-box;' + (type==='color'?'height:44px;padding:4px 8px;cursor:pointer;':'') + '"></div>';
}

function closeSubAccountModal() {
    var o = document.getElementById('subacct-modal-overlay');
    if (o) o.style.display = 'none';
    _editingAccount = null;
}

function onPlanChange(planKey) {
    var plan = NUI_PLANS[planKey];
    if (!plan) return;
    var features = plan.features === 'all' ? NUI_FEATURES.map(function(f){return f.key;}) : plan.features;
    NUI_FEATURES.forEach(function(f){
        var cb = document.getElementById('feat-' + f.key);
        if (cb) cb.checked = features.indexOf(f.key) > -1;
    });
}

function toggleAllFeatures(enable) {
    NUI_FEATURES.forEach(function(f){
        var cb = document.getElementById('feat-' + f.key);
        if (cb) cb.checked = enable;
    });
}

// ── HELPERS ──────────────────────────────────────────────────
function _genSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'');
}
function _genPassword() {
    var chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    var p = '';
    for (var i=0;i<10;i++) p += chars[Math.floor(Math.random()*chars.length)];
    return p;
}

async function saveSubAccount() {
    var name = (document.getElementById('subacct-name')||{}).value || '';
    if (!name.trim()) { alert('Agency name is required'); return; }

    var features = NUI_FEATURES.map(function(f){return f.key;}).filter(function(k){
        var cb = document.getElementById('feat-' + k);
        return cb && cb.checked;
    });

    var plan     = (document.getElementById('subacct-plan')||{}).value || 'starter';
    var rateVal  = (document.getElementById('subacct-rate')||{}).value;
    var isNew    = !_editingAccount;

    var slug     = isNew ? _genSlug(name.trim()) : (_editingAccount.portal_slug || _genSlug(name.trim()));
    var tempPass = isNew ? _genPassword() : (_editingAccount.login_password || _genPassword());

    var payload = {
        agency_name:          name.trim(),
        domain:               (document.getElementById('subacct-domain')||{}).value || '',
        owner_name:           (document.getElementById('subacct-owner')||{}).value || '',
        owner_email:          (document.getElementById('subacct-email')||{}).value || '',
        owner_phone:          (document.getElementById('subacct-phone')||{}).value || '',
        brand_color:          (document.getElementById('subacct-color')||{}).value || '#dc2626',
        brand_theme:          (document.getElementById('subacct-theme')||{}).value || 'dark',
        plan:                 plan,
        monthly_rate:         rateVal ? parseInt(rateVal) : ((NUI_PLANS[plan]||{}).price || 0),
        features:             features,
        notes:                (document.getElementById('subacct-notes')||{}).value || '',
        status:               'active',
        portal_slug:          slug,
        login_password:       tempPass,
        setup_complete:       false,
        updated_at:           new Date().toISOString(),
    };

    var savedRecord = null;
    try {
        if (typeof db !== 'undefined' && db) {
            if (_editingAccount) {
                var res = await db.from('agency_subaccounts').update(payload).eq('id', _editingAccount.id).select().single();
                if (res.error) throw res.error;
                savedRecord = res.data;
                _subAccounts = _subAccounts.map(function(a){ return a.id==_editingAccount.id ? savedRecord : a; });
            } else {
                payload.created_at = new Date().toISOString();
                var res2 = await db.from('agency_subaccounts').insert(payload).select().single();
                if (res2.error) throw res2.error;
                savedRecord = res2.data;
                _subAccounts.unshift(savedRecord);
            }
        } else {
            payload.id = Date.now(); payload.created_at = new Date().toISOString();
            savedRecord = payload;
            if (_editingAccount) {
                _subAccounts = _subAccounts.map(function(a){ return a.id==_editingAccount.id ? savedRecord : a; });
            } else {
                _subAccounts.unshift(savedRecord);
            }
        }

        localStorage.setItem('nui_subaccounts', JSON.stringify(_subAccounts));
        closeSubAccountModal();
        renderSubAccountsGrid();
        updateSubAcctStats();

        if (isNew && savedRecord) {
            _showInviteModal(savedRecord);
        } else {
            if (typeof showNotification === 'function') showNotification('Account updated', 'success');
        }
    } catch(err) { console.error(err); alert('Error saving: ' + err.message); }
}

// ── INVITE MODAL ─────────────────────────────────────────────
function _showInviteModal(acct) {
    var portalUrl = 'https://newurbaninfluence.com/portal/?agency=' + acct.portal_slug;
    var email     = acct.owner_email || '';
    var name      = acct.owner_name  || acct.agency_name;
    var pass      = acct.login_password;
    var brand     = acct.brand_color  || '#dc2626';

    var emailBody = 'Hi ' + name + ',\n\nYour agency portal is ready!\n\n' +
        'LOGIN DETAILS:\n' +
        'Portal URL: ' + portalUrl + '\n' +
        'Email: ' + email + '\n' +
        'Temp Password: ' + pass + '\n\n' +
        'On first login, a setup wizard will walk you through connecting your tools (Stripe, OpenPhone, email, etc.). It takes about 3 minutes.\n\n' +
        'After setup, your full dashboard goes live with all the features on your plan.\n\n' +
        '— New Urban Influence';

    var mailtoLink = 'mailto:' + email +
        '?subject=' + encodeURIComponent('Your Agency Portal is Ready — ' + acct.agency_name) +
        '&body=' + encodeURIComponent(emailBody);

    var overlay = document.createElement('div');
    overlay.id = 'invite-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Montserrat,sans-serif;';
    overlay.innerHTML =
        '<div style="width:100%;max-width:560px;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">' +
            '<div style="background:' + brand + '18;border-bottom:1px solid ' + brand + '33;padding:22px 28px;display:flex;align-items:center;gap:14px;">' +
                '<div style="font-size:28px;">🚀</div>' +
                '<div>' +
                    '<div style="font-family:Syne,sans-serif;font-size:18px;font-weight:800;color:#fff;">Portal Created!</div>' +
                    '<div style="font-size:12px;color:rgba(255,255,255,0.4);">' + acct.agency_name + ' · ' + (acct.plan||'starter') + ' plan · ' + acct.monthly_rate + '/mo</div>' +
                '</div>' +
            '</div>' +
            '<div style="padding:24px 28px;">' +
                // Portal URL row
                '<div style="margin-bottom:16px;">' +
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🔗 Client Portal URL</div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<div style="flex:1;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:11px 14px;font-size:12px;color:' + brand + ';font-family:monospace;word-break:break-all;">' + portalUrl + '</div>' +
                        '<button id="copy-url-btn" onclick="window._nui_copy(\'' + portalUrl + '\',\'copy-url-btn\')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:9px;cursor:pointer;font-size:11px;white-space:nowrap;font-family:inherit;">📋 Copy</button>' +
                    '</div>' +
                '</div>' +
                // Credentials row
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
                    '<div>' +
                        '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📧 Login Email</div>' +
                        '<div style="display:flex;gap:6px;">' +
                            '<div style="flex:1;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:10px 13px;font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (email||'—') + '</div>' +
                            '<button id="copy-em-btn" onclick="window._nui_copy(\'' + email + '\',\'copy-em-btn\')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:10px 12px;border-radius:9px;cursor:pointer;font-size:11px;font-family:inherit;">📋</button>' +
                        '</div>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🔑 Temp Password</div>' +
                        '<div style="display:flex;gap:6px;">' +
                            '<div style="flex:1;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:10px 13px;font-size:13px;font-family:monospace;color:#10b981;font-weight:700;letter-spacing:2px;">' + pass + '</div>' +
                            '<button id="copy-pw-btn" onclick="window._nui_copy(\'' + pass + '\',\'copy-pw-btn\')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:10px 12px;border-radius:9px;cursor:pointer;font-size:11px;font-family:inherit;">📋</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                // What happens next
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:11px;padding:14px 16px;margin-bottom:20px;">' +
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">What Happens When They Log In</div>' +
                    '<div style="font-size:12px;color:rgba(255,255,255,0.5);display:flex;gap:8px;margin-bottom:6px;"><span>1️⃣</span><span>They go to the URL and enter their email + temp password</span></div>' +
                    '<div style="font-size:12px;color:rgba(255,255,255,0.5);display:flex;gap:8px;margin-bottom:6px;"><span>2️⃣</span><span>Setup wizard asks for their API keys: Stripe, OpenPhone, SendGrid, etc.</span></div>' +
                    '<div style="font-size:12px;color:rgba(255,255,255,0.5);display:flex;gap:8px;"><span>3️⃣</span><span>Full dashboard unlocks — only panels on their plan are active</span></div>' +
                '</div>' +
                // Actions
                '<div style="display:flex;gap:10px;">' +
                    '<button onclick="document.getElementById(\'invite-overlay\').remove()" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.55);padding:12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;">Close</button>' +
                    '<button id="send-invite-btn" onclick="window._sendInviteEmail(' + JSON.stringify(acct).replace(/'/g,"&#39;") + ')" style="flex:2;background:' + brand + ';color:#fff;border:none;padding:12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;">📧 Send Invite Email</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);
}

window._nui_copy = function(text, btnId) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            var btn = document.getElementById(btnId);
            if (!btn) return;
            var orig = btn.textContent;
            btn.textContent = '✓';
            btn.style.color = '#10b981';
            setTimeout(function(){ btn.textContent=orig; btn.style.color=''; }, 2000);
        });
    }
};

async function toggleSubAccountStatus(id) {
    var acct = _subAccounts.find(function(a){return a.id==id;});
    if (!acct) return;
    var newStatus = acct.status === 'active' ? 'suspended' : 'active';
    try {
        if (typeof db !== 'undefined' && db) {
            await db.from('agency_subaccounts').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
        }
        acct.status = newStatus;
        localStorage.setItem('nui_subaccounts', JSON.stringify(_subAccounts));
        renderSubAccountsGrid();
        updateSubAcctStats();
        if (typeof showNotification === 'function') showNotification('Account ' + newStatus, newStatus==='active'?'success':'info');
    } catch(err) { alert('Error: ' + err.message); }
}

async function deleteSubAccount(id) {
    if (!confirm('Delete this sub-account? This cannot be undone.')) return;
    try {
        if (typeof db !== 'undefined' && db) {
            await db.from('agency_subaccounts').delete().eq('id', id);
        }
        _subAccounts = _subAccounts.filter(function(a){return a.id!=id;});
        localStorage.setItem('nui_subaccounts', JSON.stringify(_subAccounts));
        closeSubAccountModal();
        renderSubAccountsGrid();
        updateSubAcctStats();
        if (typeof showNotification === 'function') showNotification('Account deleted', 'info');
    } catch(err) { alert('Error: ' + err.message); }
}


// ══════════════════════════════════════════════════════════════════
// WHITE LABEL SETTINGS PANEL
// Opens from the "⚙️ Manage" button on each account card
// Lets Faren set the agency's sender identity, email sig, logo, etc.
// ══════════════════════════════════════════════════════════════════

function openWhiteLabelSettings(accountId) {
    var acct = _subAccounts.find(function(a){ return a.id == accountId; });
    if (!acct) return;

    var overlay = document.createElement('div');
    overlay.id = 'wl-settings-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;overflow-y:auto;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;font-family:Montserrat,sans-serif;';

    var brand = acct.brand_color || '#dc2626';

    function field(label, id, val, placeholder, type, hint) {
        return '<div style="margin-bottom:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">' +
                '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.8px;">' + label + '</div>' +
                (hint ? '<div style="font-size:10px;color:rgba(255,255,255,0.2);">' + hint + '</div>' : '') +
            '</div>' +
            '<input id="wl-' + id + '" type="' + (type||'text') + '" value="' + (val||'').replace(/"/g,'&quot;') + '" placeholder="' + placeholder + '" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);color:#fff;padding:10px 13px;border-radius:9px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">' +
        '</div>';
    }

    overlay.innerHTML =
        '<div style="width:100%;max-width:680px;">' +
            '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">' +

                // Header
                '<div style="background:' + brand + '18;border-bottom:1px solid ' + brand + '33;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;">' +
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                        '<div style="font-size:24px;">🎨</div>' +
                        '<div>' +
                            '<div style="font-family:Syne,sans-serif;font-size:17px;font-weight:800;color:#fff;">White Label Settings</div>' +
                            '<div style="font-size:12px;color:rgba(255,255,255,0.35);">' + acct.agency_name + ' — Sender Identity & Branding</div>' +
                        '</div>' +
                    '</div>' +
                    '<button onclick="document.getElementById(\'wl-settings-overlay\').remove()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">×</button>' +
                '</div>' +

                '<div style="padding:28px;">' +

                    // Section: Sender Identity
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">📧 Email Sender Identity</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">' +
                        field('Founder / Owner Name', 'founder_name', acct.founder_name||acct.owner_name, 'Marcus Johnson', 'text', 'Appears in email signature') +
                        field('Title', 'founder_title', acct.founder_title, 'Founder & Creative Director', 'text', 'Under name in signature') +
                    '</div>' +
                    field('From Email (SMTP user)', 'company_email', acct.company_email||acct.owner_email, 'hello@youragency.com', 'email', 'Must match SMTP credentials below') +

                    // Section: Agency Info
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">🏢 Agency Info</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">' +
                        field('City', 'company_city', acct.company_city, 'Detroit, Michigan', 'text', 'Appears in email footer') +
                        field('Phone', 'company_phone', acct.company_phone, '(313) 555-0100', 'text', 'In email footer & SMS') +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">' +
                        field('Website', 'company_website', acct.company_website||acct.domain, 'youragency.com', 'text', 'No https:// needed') +
                        field('Tagline', 'company_tagline', acct.company_tagline, 'Your brand slogan here', 'text', 'Under logo in footer') +
                    '</div>' +
                    field('Logo URL', 'logo_url', acct.logo_url, 'https://youragency.com/logo.png', 'url', 'Full URL to logo image (PNG/SVG)') +
                    field('Print Store URL', 'print_store_url', acct.print_store_url, 'https://youragency.com/print', 'url', 'Override print store link in drip emails') +

                    // Section: SMTP Credentials
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">📨 SMTP (Email Sending)</div>' +
                    '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:rgba(255,255,255,0.35);">Leave blank to use NUI\'s Hostinger email account. Fill these in to send emails as their own domain.</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">' +
                        field('SMTP User / Email', 'smtp_user', acct.smtp_user, 'hello@youragency.com', 'email', '') +
                        field('SMTP Password', 'smtp_pass', acct.smtp_pass, '••••••••••', 'password', 'Hostinger / Gmail app password') +
                    '</div>' +

                    // Section: SMS / OpenPhone
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">📱 OpenPhone (SMS)</div>' +
                    '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:rgba(255,255,255,0.35);">Leave blank to use NUI\'s OpenPhone. Their own keys let SMS go out from their number.</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">' +
                        field('OpenPhone API Key', 'openphone_key', acct.openphone_key, 'op_api_xxxxx', 'text', 'openphone.com → Settings → API') +
                        field('OpenPhone Phone Number ID', 'openphone_number', acct.openphone_number, 'PN...', 'text', 'Phone Number ID (not the actual number)') +
                    '</div>' +

                    // Preview
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">👁 Email Signature Preview</div>' +
                    '<div id="wl-sig-preview" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 18px;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.8;">' +
                        '<div>Talk soon,</div>' +
                        '<div style="font-weight:700;color:#fff;">' + (acct.founder_name||acct.owner_name||'Founder Name') + '</div>' +
                        '<div style="color:rgba(255,255,255,0.4);">' + (acct.founder_title||'Founder') + ', ' + acct.agency_name + '</div>' +
                        '<div style="color:rgba(255,255,255,0.3);font-size:12px;">' + (acct.company_phone||'Phone') + '</div>' +
                    '</div>' +

                    // Actions
                    '<div style="display:flex;gap:10px;margin-top:24px;">' +
                        '<button onclick="document.getElementById(\'wl-settings-overlay\').remove()" style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);padding:12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;">Cancel</button>' +
                        '<button onclick="saveWhiteLabelSettings(' + accountId + ')" style="flex:3;background:' + brand + ';color:#fff;border:none;padding:12px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;">💾 Save White Label Settings</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    // Live preview update
    ['wl-founder_name','wl-founder_title','wl-company_phone'].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', function() {
            var prev = document.getElementById('wl-sig-preview');
            if (!prev) return;
            prev.innerHTML =
                '<div>Talk soon,</div>' +
                '<div style="font-weight:700;color:#fff;">' + (document.getElementById('wl-founder_name').value||'Founder Name') + '</div>' +
                '<div style="color:rgba(255,255,255,0.4);">' + (document.getElementById('wl-founder_title').value||'Founder') + ', ' + acct.agency_name + '</div>' +
                '<div style="color:rgba(255,255,255,0.3);font-size:12px;">' + (document.getElementById('wl-company_phone').value||'Phone') + '</div>';
        });
    });
}

async function saveWhiteLabelSettings(accountId) {
    var fields = ['founder_name','founder_title','company_email','company_city','company_phone',
                  'company_website','company_tagline','logo_url','print_store_url',
                  'smtp_user','smtp_pass','openphone_key','openphone_number'];

    var payload = { updated_at: new Date().toISOString() };
    fields.forEach(function(f) {
        var el = document.getElementById('wl-' + f);
        if (el) payload[f] = el.value.trim();
    });

    try {
        if (typeof db !== 'undefined' && db) {
            var res = await db.from('agency_subaccounts').update(payload).eq('id', accountId);
            if (res.error) throw res.error;
        }
        // Update local cache
        var idx = _subAccounts.findIndex(function(a){return a.id==accountId;});
        if (idx > -1) _subAccounts[idx] = Object.assign({}, _subAccounts[idx], payload);
        localStorage.setItem('nui_subaccounts', JSON.stringify(_subAccounts));

        document.getElementById('wl-settings-overlay').remove();
        if (typeof showNotification === 'function') showNotification('✅ White label settings saved!', 'success');
    } catch(err) {
        alert('Save failed: ' + err.message);
    }
}

// ── SEND INVITE EMAIL via Netlify Function ────────────────────
window._sendInviteEmail = async function(acct) {
    var btn = document.getElementById('send-invite-btn');
    if (btn) { btn.textContent = '⏳ Sending...'; btn.disabled = true; }

    var portalUrl = 'https://newurbaninfluence.com/portal/?agency=' + acct.portal_slug;
    var name      = acct.owner_name || acct.agency_name;
    var brand     = acct.brand_color || '#dc2626';

    var htmlBody = '<div style="font-family:Montserrat,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0f;color:#fff;border-radius:16px;overflow:hidden;">' +
        '<div style="background:' + brand + ';padding:32px 36px;">' +
            '<div style="font-family:Syne,sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:4px;">' + acct.agency_name + '</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.7);">Your agency portal is ready to launch 🚀</div>' +
        '</div>' +
        '<div style="padding:36px;">' +
            '<p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.8);margin:0 0 28px;">Hi ' + name + ', your white-label portal is live. Here are your login details:</p>' +
            '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;margin-bottom:28px;">' +
                '<div style="margin-bottom:14px;">' +
                    '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🔗 Portal URL</div>' +
                    '<a href="' + portalUrl + '" style="color:' + brand + ';font-size:13px;font-family:monospace;">' + portalUrl + '</a>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
                    '<div><div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📧 Email</div>' +
                    '<div style="font-size:13px;color:#fff;">' + (acct.owner_email||'—') + '</div></div>' +
                    '<div><div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🔑 Temp Password</div>' +
                    '<div style="font-size:15px;font-family:monospace;font-weight:700;color:#10b981;letter-spacing:2px;">' + acct.login_password + '</div></div>' +
                '</div>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.03);border-left:3px solid ' + brand + ';padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:28px;">' +
                '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px;">On first login:</div>' +
                '<div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.8;">1️⃣ Visit your portal URL<br>2️⃣ Enter email + temp password<br>3️⃣ Connect your tools in the setup wizard (~3 min)<br>4️⃣ Full dashboard unlocks</div>' +
            '</div>' +
            '<div style="text-align:center;margin-bottom:28px;">' +
                '<a href="' + portalUrl + '" style="display:inline-block;background:' + brand + ';color:#fff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;">Open My Portal →</a>' +
            '</div>' +
            '<p style="font-size:12px;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.07);padding-top:20px;margin:0;">Powered by <strong style="color:rgba(255,255,255,0.5);">New Urban Influence</strong></p>' +
        '</div>' +
    '</div>';

    try {
        var resp = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to:      acct.owner_email,
                subject: '🚀 Your Agency Portal is Ready — ' + acct.agency_name,
                html:    htmlBody,
                text:    'Hi ' + name + ',\n\nPortal: ' + portalUrl + '\nEmail: ' + (acct.owner_email||'') + '\nPassword: ' + acct.login_password + '\n\n— New Urban Influence'
            })
        });
        var data = await resp.json();
        if (resp.ok) {
            if (btn) { btn.textContent = '✅ Invite Sent!'; btn.style.background = '#10b981'; }
            setTimeout(function(){ var o=document.getElementById('invite-overlay'); if(o) o.remove(); }, 2000);
        } else {
            throw new Error(data.error || 'Send failed (' + resp.status + ')');
        }
    } catch(err) {
        if (btn) { btn.textContent = '📧 Send Invite Email'; btn.disabled = false; }
        var fallback = 'mailto:' + (acct.owner_email||'') +
            '?subject=' + encodeURIComponent('Your Agency Portal is Ready — ' + acct.agency_name) +
            '&body=' + encodeURIComponent('Hi ' + name + ',\n\nPortal: ' + portalUrl + '\nEmail: ' + (acct.owner_email||'') + '\nPassword: ' + acct.login_password + '\n\n— New Urban Influence');
        if (confirm('Email send failed: ' + err.message + '\n\nOpen your email client instead?')) {
            window.open(fallback, '_blank');
        }
    }
};

// ── PORTAL LINK COPY ─────────────────────────────────────────
function copyPortalLink(slug) {
    var url = 'https://newurbaninfluence.com/portal/?agency=' + slug;
    navigator.clipboard.writeText(url).then(function() {
        // Flash the code element green
        var el = document.querySelector('[id^="portalurl-"]');
        if (el) { el.style.color = '#fff'; setTimeout(function(){ el.style.color = '#6ee7b7'; }, 1200); }
        // Quick toast
        var t = document.createElement('div');
        t.textContent = '✅ Portal link copied!';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:700;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.3)';
        document.body.appendChild(t);
        setTimeout(function(){ t.remove(); }, 2000);
    }).catch(function() {
        prompt('Copy this portal link:', url);
    });
}

// ── ONE-CLICK PORTAL IMPERSONATION ───────────────────────────
// One-click portal access — no login required.
// Both /app/ and /portal/ are same origin (newurbaninfluence.com)
// so localStorage is SHARED. Write session HERE first, then open tab.
// Portal reads localStorage on DOMContentLoaded and skips login.
function enterPortalAsAdmin(accountId) {
    var acct = _subAccounts.find(function(a){ return a.id === accountId; });
    if (!acct) return;
    var slug = acct.portal_slug || acct.id;

    // Build session — must include BOTH 'data' and 'agency' fields
    // agency-tenant.js checks for sess.data to validate session
    var session = {
        slug:              slug,
        role:              'admin',
        email:             acct.owner_email || 'admin@' + slug + '.com',
        data:              acct,   // ← required by agency-tenant session check
        agency:            acct,   // ← kept for compatibility
        loginAt:           Date.now(),
        impersonatedByNUI: true
    };

    // Step 1: Write to THIS tab's localStorage (same origin = instantly visible to portal tab)
    localStorage.setItem('nui_agency_session', JSON.stringify(session));

    // Step 2: Now open the portal — it reads localStorage on first load, finds session, skips login
    window.open('https://newurbaninfluence.com/portal/?agency=' + slug, '_blank');
}
