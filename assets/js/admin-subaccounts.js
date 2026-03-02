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

async function saveSubAccount() {
    var name = (document.getElementById('subacct-name')||{}).value || '';
    if (!name.trim()) { alert('Agency name is required'); return; }

    var features = NUI_FEATURES.map(function(f){return f.key;}).filter(function(k){
        var cb = document.getElementById('feat-' + k);
        return cb && cb.checked;
    });

    var plan = (document.getElementById('subacct-plan')||{}).value || 'starter';
    var rateVal = (document.getElementById('subacct-rate')||{}).value;

    var payload = {
        agency_name:  name.trim(),
        domain:       (document.getElementById('subacct-domain')||{}).value || '',
        owner_name:   (document.getElementById('subacct-owner')||{}).value || '',
        owner_email:  (document.getElementById('subacct-email')||{}).value || '',
        owner_phone:  (document.getElementById('subacct-phone')||{}).value || '',
        brand_color:  (document.getElementById('subacct-color')||{}).value || '#dc2626',
        plan:         plan,
        monthly_rate: rateVal ? parseInt(rateVal) : ((NUI_PLANS[plan]||{}).price || 0),
        features:     features,
        notes:        (document.getElementById('subacct-notes')||{}).value || '',
        status:       'active',
        updated_at:   new Date().toISOString(),
    };

    try {
        if (typeof db !== 'undefined' && db) {
            if (_editingAccount) {
                var res = await db.from('agency_subaccounts').update(payload).eq('id', _editingAccount.id);
                if (res.error) throw res.error;
                _subAccounts = _subAccounts.map(function(a){ return a.id==_editingAccount.id ? Object.assign({},a,payload) : a; });
            } else {
                payload.created_at = new Date().toISOString();
                var res2 = await db.from('agency_subaccounts').insert(payload).select().single();
                if (res2.error) throw res2.error;
                _subAccounts.unshift(res2.data);
            }
        } else {
            if (_editingAccount) {
                _subAccounts = _subAccounts.map(function(a){ return a.id==_editingAccount.id ? Object.assign({},a,payload) : a; });
            } else {
                payload.id = Date.now(); payload.created_at = new Date().toISOString();
                _subAccounts.unshift(payload);
            }
        }
        localStorage.setItem('nui_subaccounts', JSON.stringify(_subAccounts));
        closeSubAccountModal();
        renderSubAccountsGrid();
        updateSubAcctStats();
        if (typeof showNotification === 'function') showNotification(_editingAccount ? 'Account updated' : 'Sub-account created!', 'success');
    } catch(err) { console.error(err); alert('Error saving: ' + err.message); }
}

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
