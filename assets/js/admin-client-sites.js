// =============================================
// admin-client-sites.js — Client Site Management v20260325v1
// Suspend/reactivate client sites, payment tracking
// Standard for ALL NUI-built websites
// =============================================

var _csSites = [];

function loadClientSitesPanel() {
    var panel = document.getElementById('adminSitesPanel') || document.querySelector('.admin-panel.active');
    if (!panel) return;
    panel.innerHTML = buildCSPanelHTML();
    fetchCSSites();
}

function buildCSPanelHTML() {
    return '<div style="padding:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">' +
            '<div><h2 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Client Sites</h2>' +
            '<p style="margin:4px 0 0;color:#888;font-size:13px;">Manage, suspend &amp; reactivate hosted websites</p></div>' +
            '<button onclick="showCSSiteModal()" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">+ Add Site</button>' +
        '</div>' +
        '<div id="csStatsRow" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;"></div>' +
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;overflow-x:auto;">' +
            '<table style="width:100%;border-collapse:collapse;min-width:800px;">' +
                '<thead><tr style="background:#111;border-bottom:1px solid #333;">' +
                    csThCell('SITE') + csThCell('CLIENT') + csThCell('DOMAIN') + csThCell('$/MO') + csThCell('PAYMENT') + csThCell('STATUS') + csThCell('ACTIONS') +
                '</tr></thead>' +
                '<tbody id="csTableBody"><tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Loading...</td></tr></tbody>' +
            '</table></div></div>';
}

function csThCell(t) { return '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">' + t + '</th>'; }

function csStatCard(label, val, color) {
    return '<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px;">' +
        '<div style="color:#888;font-size:11px;font-weight:600;margin-bottom:6px;">' + label + '</div>' +
        '<div style="color:' + color + ';font-size:24px;font-weight:700;">' + val + '</div></div>';
}

async function fetchCSSites() {
    try {
        var res = await supabaseClient.from('client_sites').select('*').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        _csSites = res.data || [];
        renderCSStats();
        renderCSTable();
    } catch (err) {
        console.error('Client sites error:', err.message);
        var el = document.getElementById('csTableBody');
        if (el) el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ef4444;">Error loading sites</td></tr>';
    }
}

function renderCSStats() {
    var el = document.getElementById('csStatsRow');
    if (!el) return;
    var active = _csSites.filter(function(s) { return s.status === 'active'; }).length;
    var suspended = _csSites.filter(function(s) { return s.status === 'suspended'; }).length;
    var revenue = _csSites.reduce(function(sum, s) { return sum + (s.status === 'active' ? (parseFloat(s.monthly_rate || s.monthly_fee) || 0) : 0); }, 0);
    var overdue = _csSites.filter(function(s) { return s.next_payment_due && new Date(s.next_payment_due) < new Date(); }).length;
    el.innerHTML = csStatCard('Total', _csSites.length, '#3b82f6') + csStatCard('Active', active, '#10b981') +
        csStatCard('Suspended', suspended, '#ef4444') + csStatCard('Revenue/mo', '$' + revenue.toLocaleString(), '#f59e0b') +
        csStatCard('Overdue', overdue, overdue > 0 ? '#ef4444' : '#888');
}

function renderCSTable() {
    var tbody = document.getElementById('csTableBody');
    if (!tbody) return;
    if (!_csSites.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">No client sites yet</td></tr>'; return; }
    var sColors = { active: '#10b981', suspended: '#ef4444', maintenance: '#f59e0b' };
    tbody.innerHTML = _csSites.map(function(s) {
        var sc = sColors[s.status] || '#888';
        var rate = parseFloat(s.monthly_rate || s.monthly_fee) || 0;
        var pd = s.next_payment_due ? new Date(s.next_payment_due) : null;
        var od = pd && pd < new Date();
        var payLabel = pd ? (od ? '<span style="color:#ef4444;font-weight:600;">OVERDUE ' + pd.toLocaleDateString() + '</span>' : pd.toLocaleDateString()) : '—';
        var sid = csEsc(s.site_id || '');
        var isSusp = s.status === 'suspended';
        var toggleBtn = isSusp
            ? '<button onclick="csReactivate(\'' + sid + '\')" style="background:#10b98120;color:#10b981;border:1px solid #10b98140;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">Reactivate</button>'
            : '<button onclick="csShowSuspend(\'' + sid + '\',\'' + csEsc(s.site_name || '') + '\')" style="background:#ef444420;color:#ef4444;border:1px solid #ef444440;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">Suspend</button>';
        return '<tr style="border-bottom:1px solid #222;">' +
            '<td style="padding:12px 16px;"><div style="font-weight:600;color:#fff;font-size:13px;">' + csEsc(s.site_name || sid) + '</div><div style="color:#555;font-size:11px;font-family:monospace;">' + sid + '</div></td>' +
            '<td style="padding:12px 16px;color:#ccc;font-size:13px;">' + csEsc(s.client_name || '—') + '</td>' +
            '<td style="padding:12px 16px;"><a href="https://' + csEsc(s.domain || '') + '" target="_blank" style="color:#3b82f6;font-size:13px;">' + csEsc(s.domain || '—') + '</a></td>' +
            '<td style="padding:12px 16px;color:#fff;font-size:13px;font-weight:600;">$' + rate + '</td>' +
            '<td style="padding:12px 16px;font-size:12px;">' + payLabel + '</td>' +
            '<td style="padding:12px 16px;"><span style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;background:' + sc + '20;color:' + sc + ';">' + (s.status || 'active') + '</span></td>' +
            '<td style="padding:12px 16px;"><div style="display:flex;gap:6px;flex-wrap:wrap;">' + toggleBtn +
                '<button onclick="showCSSiteModal(\'' + sid + '\')" style="background:#3b82f620;color:#3b82f6;border:1px solid #3b82f640;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">Edit</button>' +
            '</div></td></tr>';
    }).join('');
}

// ---- SUSPEND MODAL ----
function csShowSuspend(siteId, siteName) {
    var m = document.createElement('div'); m.id = 'csSuspendModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);';
    m.innerHTML = '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:32px;max-width:440px;width:90%;">' +
        '<h3 style="color:#ef4444;font-size:18px;margin:0 0 8px;">⚠️ Suspend Site</h3>' +
        '<p style="color:#888;font-size:13px;margin:0 0 20px;">This will immediately shut down <strong style="color:#fff;">' + siteName + '</strong>. Visitors will see a suspension notice with the NUI backlink.</p>' +
        '<label style="color:#999;font-size:12px;font-weight:600;display:block;margin-bottom:6px;">REASON (shown to visitors)</label>' +
        '<textarea id="csSuspReason" rows="3" style="width:100%;background:#111;border:1px solid #444;border-radius:8px;padding:12px;color:#fff;font-size:14px;resize:vertical;box-sizing:border-box;" placeholder="Payment overdue — contact New Urban Influence to restore service."></textarea>' +
        '<div style="display:flex;gap:10px;margin-top:20px;">' +
            '<button id="csSuspBtn" onclick="csConfirmSuspend(\'' + siteId + '\')" style="flex:1;background:#ef4444;color:#fff;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">Suspend Now</button>' +
            '<button onclick="document.getElementById(\'csSuspendModal\').remove()" style="flex:1;background:#333;color:#fff;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:600;">Cancel</button>' +
        '</div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function(e) { if (e.target === m) m.remove(); });
}

async function csConfirmSuspend(siteId) {
    var reason = (document.getElementById('csSuspReason').value || '').trim() || 'This site has been temporarily suspended.';
    try {
        var res = await supabaseClient.from('client_sites').update({ status: 'suspended', suspended_reason: reason, suspended_at: new Date().toISOString() }).eq('site_id', siteId);
        if (res.error) throw res.error;
        if (typeof showNotification === 'function') showNotification('Site suspended: ' + siteId, 'warning');
        var modal = document.getElementById('csSuspendModal'); if (modal) modal.remove();
        fetchCSSites();
    } catch (err) { alert('Error: ' + err.message); }
}

async function csReactivate(siteId) {
    if (!confirm('Reactivate this site? It will go live immediately.')) return;
    try {
        var res = await supabaseClient.from('client_sites').update({ status: 'active', suspended_reason: null, suspended_at: null }).eq('site_id', siteId);
        if (res.error) throw res.error;
        if (typeof showNotification === 'function') showNotification('Site reactivated: ' + siteId, 'success');
        fetchCSSites();
    } catch (err) { alert('Error: ' + err.message); }
}

// ---- ADD / EDIT SITE MODAL ----
function showCSSiteModal(editId) {
    var site = editId ? _csSites.find(function(s) { return s.site_id === editId; }) : null;
    var m = document.createElement('div'); m.id = 'csEditModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);';
    var inp = 'width:100%;background:#111;border:1px solid #444;border-radius:8px;padding:10px 14px;color:#fff;font-size:14px;box-sizing:border-box;';
    var lbl = 'color:#999;font-size:11px;font-weight:600;display:block;margin:14px 0 4px;';
    m.innerHTML = '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:32px;max-width:500px;width:90%;max-height:85vh;overflow-y:auto;">' +
        '<h3 style="color:#fff;font-size:18px;margin:0 0 20px;">' + (site ? 'Edit Site' : 'Add New Client Site') + '</h3>' +
        '<label style="' + lbl + '">SITE ID <span style="color:#555;">(unique key — lowercase, no spaces)</span></label>' +
        '<input id="cseSiteId" style="' + inp + (site ? 'opacity:0.5;' : '') + '" placeholder="penmindstate" value="' + csEsc(site ? site.site_id : '') + '"' + (site ? ' readonly' : '') + '>' +
        '<label style="' + lbl + '">SITE NAME</label><input id="cseSiteName" style="' + inp + '" placeholder="Pen MindState Network" value="' + csEsc(site ? site.site_name : '') + '">' +
        '<label style="' + lbl + '">CLIENT NAME</label><input id="cseClientName" style="' + inp + '" placeholder="Damian Meadows" value="' + csEsc(site ? site.client_name : '') + '">' +
        '<label style="' + lbl + '">DOMAIN</label><input id="cseDomain" style="' + inp + '" placeholder="penmindstate.com" value="' + csEsc(site ? site.domain : '') + '">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div><label style="' + lbl + '">MONTHLY RATE ($)</label><input id="cseRate" type="number" style="' + inp + '" value="' + (site ? (site.monthly_rate || site.monthly_fee || 200) : 200) + '"></div>' +
            '<div><label style="' + lbl + '">NEXT PAYMENT DUE</label><input id="csePayDue" type="date" style="' + inp + '" value="' + (site ? (site.next_payment_due || '') : '') + '"></div>' +
        '</div>' +
        '<label style="' + lbl + '">GITHUB REPO</label><input id="cseRepo" style="' + inp + '" placeholder="newurbaninfluence-lgtm/pen-mindstate-site" value="' + csEsc(site ? site.github_repo : '') + '">' +
        '<div style="display:flex;gap:10px;margin-top:24px;">' +
            '<button onclick="csSaveSite(\'' + (editId || '') + '\')" style="flex:1;background:#e63946;color:#fff;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">Save</button>' +
            '<button onclick="document.getElementById(\'csEditModal\').remove()" style="flex:1;background:#333;color:#fff;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:600;">Cancel</button>' +
        '</div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function(e) { if (e.target === m) m.remove(); });
}

async function csSaveSite(editId) {
    var data = {
        site_id: (document.getElementById('cseSiteId').value || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        site_name: (document.getElementById('cseSiteName').value || '').trim(),
        client_name: (document.getElementById('cseClientName').value || '').trim(),
        domain: (document.getElementById('cseDomain').value || '').trim().replace(/^https?:\/\//, ''),
        monthly_rate: parseFloat(document.getElementById('cseRate').value) || 0,
        next_payment_due: document.getElementById('csePayDue').value || null,
        github_repo: (document.getElementById('cseRepo').value || '').trim()
    };
    if (!data.site_id || !data.site_name) { alert('Site ID and Name are required.'); return; }
    try {
        var res;
        if (editId) { res = await supabaseClient.from('client_sites').update(data).eq('site_id', editId); }
        else { data.status = 'active'; res = await supabaseClient.from('client_sites').insert(data); }
        if (res.error) throw res.error;
        if (typeof showNotification === 'function') showNotification('Site saved: ' + data.site_name, 'success');
        document.getElementById('csEditModal').remove();
        fetchCSSites();
    } catch (err) { alert('Error: ' + err.message); }
}

function csEsc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
console.log('✅ admin-client-sites.js v20260325v1 loaded');
