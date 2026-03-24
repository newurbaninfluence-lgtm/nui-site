// =============================================
// admin-sites.js v2 — Client Website Management
// Suspend/Reactivate with one click
// =============================================
var _clientSites = [];

function loadAdminSitesPanel() {
    var panel = document.getElementById('adminSitesPanel') || document.querySelector('.admin-panel.active');
    if (!panel) return;
    panel.innerHTML = buildSitesPanelHTML();
    loadSitesFromSupabase();
}

function buildSitesPanelHTML() {
    return '<div class="admin-panel-content" style="padding:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">' +
            '<div><h2 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Client Sites</h2>' +
            '<p style="margin:4px 0 0;color:#888;font-size:13px;">Suspend instantly if payment is overdue</p></div>' +
            '<button onclick="showAddSiteModal()" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">+ Add Site</button>' +
        '</div>' +
        '<div id="sitesStatsRow" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:24px;">' +
            buildStatCard('Total Sites', '—', '#3b82f6') +
            buildStatCard('Active', '—', '#10b981') +
            buildStatCard('Monthly Revenue', '—', '#f59e0b') +
            buildStatCard('Suspended', '—', '#ef4444') +
        '</div>' +
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;overflow:hidden;">' +
            '<table style="width:100%;border-collapse:collapse;">' +
                '<thead><tr style="background:#111;border-bottom:1px solid #333;">' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">CLIENT</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">SITE</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">SITE ID</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">$/MO</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">STATUS</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">ACTIONS</th>' +
                '</tr></thead>' +
                '<tbody id="sitesTableBody"><tr><td colspan="6" style="text-align:center;padding:40px;color:#666;">Loading...</td></tr></tbody>' +
            '</table></div></div>';
}
function buildStatCard(l, v, c) {
    return '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;">' +
        '<div style="color:#888;font-size:12px;font-weight:600;margin-bottom:8px;">' + l + '</div>' +
        '<div style="color:' + c + ';font-size:28px;font-weight:700;" id="stat_' + l.replace(/\s/g,'') + '">' + v + '</div></div>';
}

async function loadSitesFromSupabase() {
    try {
        if (typeof supabaseClient === 'undefined') { renderSitesFromLocal(); return; }
        var res = await supabaseClient.from('client_sites').select('*').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        _clientSites = res.data || [];
        localStorage.setItem('nui_client_sites', JSON.stringify(_clientSites));
        renderSitesTable();
    } catch (err) { console.log('Sites: fallback local:', err.message); renderSitesFromLocal(); }
}
function renderSitesFromLocal() { _clientSites = JSON.parse(localStorage.getItem('nui_client_sites') || '[]'); renderSitesTable(); }

function renderSitesTable() {
    var tbody = document.getElementById('sitesTableBody');
    if (!tbody) return;
    var active = _clientSites.filter(function(s) { return s.status === 'active'; });
    var suspended = _clientSites.filter(function(s) { return s.status === 'suspended'; });
    var revenue = active.reduce(function(sum, s) { return sum + (parseFloat(s.monthly_fee) || 0); }, 0);
    var el = function(id) { return document.getElementById(id); };
    if (el('stat_TotalSites')) el('stat_TotalSites').textContent = _clientSites.length;
    if (el('stat_Active')) el('stat_Active').textContent = active.length;
    if (el('stat_MonthlyRevenue')) el('stat_MonthlyRevenue').textContent = '$' + revenue.toLocaleString();
    if (el('stat_Suspended')) el('stat_Suspended').textContent = suspended.length;
    if (_clientSites.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#666;">No sites yet.</td></tr>'; return; }
    tbody.innerHTML = _clientSites.map(function(site) {
        var sc = { active:'#10b981', suspended:'#ef4444', building:'#3b82f6', paused:'#f59e0b', overdue:'#f59e0b', maintenance:'#a855f7' };
        var color = sc[site.status] || '#888';
        var isActive = site.status === 'active';
        var isSuspended = site.status === 'suspended';
        var suspendBtn = isActive ?
            '<button onclick="promptSuspendSite(\'' + site.id + '\',\'' + escHtml(site.site_name || '') + '\')" style="background:#3a1515;border:1px solid #ef4444;color:#ef4444;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">⛔ Suspend</button>' :
            (isSuspended ?
                '<button onclick="reactivateSite(\'' + site.id + '\')" style="background:#0d3320;border:1px solid #10b981;color:#10b981;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">✅ Reactivate</button>' : '');
        var suspInfo = isSuspended && site.suspended_reason ?
            '<div style="font-size:10px;color:#ef4444;margin-top:3px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escHtml(site.suspended_reason) + '">⚠ ' + escHtml(site.suspended_reason) + '</div>' : '';
        return '<tr style="border-bottom:1px solid #222;">' +
            '<td style="padding:12px 16px;color:#fff;font-size:13px;">' + escHtml(site.client_name || '—') + '</td>' +
            '<td style="padding:12px 16px;color:#fff;font-size:13px;font-weight:600;">' + escHtml(site.site_name || '—') + '</td>' +
            '<td style="padding:12px 16px;color:#888;font-size:12px;font-family:monospace;">' + escHtml(site.site_id || '—') + '</td>' +
            '<td style="padding:12px 16px;color:#10b981;font-size:13px;font-weight:600;">$' + (parseFloat(site.monthly_fee) || 0) + '</td>' +
            '<td style="padding:12px 16px;"><span style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;background:' + color + '20;color:' + color + ';text-transform:uppercase;">' + (site.status || 'active') + '</span>' + suspInfo + '</td>' +
            '<td style="padding:12px 16px;white-space:nowrap;">' +
                '<button onclick="editSite(\'' + site.id + '\')" style="background:#333;border:1px solid #555;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;margin-right:4px;">Edit</button>' +
                suspendBtn + '</td></tr>';
    }).join('');
}

// ---- SUSPEND / REACTIVATE ----
function promptSuspendSite(siteId, siteName) {
    var reason = prompt('Suspend "' + siteName + '"?\n\nEnter reason (shown to visitors):', 'Payment overdue — contact New Urban Influence to restore service.');
    if (reason === null) return;
    if (!reason.trim()) reason = 'This site has been temporarily taken offline.';
    suspendSite(siteId, reason.trim());
}
async function suspendSite(siteId, reason) {
    try {
        if (typeof supabaseClient !== 'undefined') {
            var res = await supabaseClient.from('client_sites').update({ status: 'suspended', suspended_reason: reason, suspended_at: new Date().toISOString() }).eq('id', siteId);
            if (res.error) throw res.error;
        }
        if (typeof showNotification === 'function') showNotification('Site suspended — visitors see shutdown page', 'warning');
        loadSitesFromSupabase();
    } catch (err) { alert('Error suspending: ' + err.message); }
}
async function reactivateSite(siteId) {
    if (!confirm('Reactivate this site? It will go live immediately.')) return;
    try {
        if (typeof supabaseClient !== 'undefined') {
            var res = await supabaseClient.from('client_sites').update({ status: 'active', suspended_reason: null, suspended_at: null }).eq('id', siteId);
            if (res.error) throw res.error;
        }
        if (typeof showNotification === 'function') showNotification('Site reactivated — now live!', 'success');
        loadSitesFromSupabase();
    } catch (err) { alert('Error reactivating: ' + err.message); }
}

// ---- ADD / EDIT MODAL ----
function showAddSiteModal(editId) {
    var site = editId ? _clientSites.find(function(s) { return s.id === editId; }) : null;
    var ex = document.getElementById('addSiteModal'); if (ex) ex.remove();
    var co = '<option value="">Select client...</option>';
    if (typeof clients !== 'undefined' && clients.length) {
        clients.forEach(function(c) { var sel = site && site.client_id == c.id ? ' selected' : '';
            co += '<option value="' + c.id + '" data-name="' + escHtml(c.name || '') + '"' + sel + '>' + escHtml(c.name || c.email) + '</option>'; });
    }
    var so = ['active','building','paused','suspended','maintenance'].map(function(s) {
        return '<option value="' + s + '"' + (site && site.status === s ? ' selected' : (!site && s === 'active' ? ' selected' : '')) + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
    }).join('');
    var IS = 'width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;';
    var modal = document.createElement('div'); modal.id = 'addSiteModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML =
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:32px;width:520px;max-width:90vw;max-height:85vh;overflow-y:auto;">' +
        '<h3 style="margin:0 0 20px;color:#fff;font-size:18px;">' + (site ? 'Edit Site' : 'Add Client Site') + '</h3>' +
        '<div style="display:grid;gap:14px;">' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Client</label><select id="siteClientId" style="' + IS + '" onchange="autoFillClientName()">' + co + '</select></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Site Name</label><input id="siteName" value="' + escHtml(site ? site.site_name : '') + '" placeholder="Pen MindState" style="' + IS + '"></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Site ID</label><input id="siteIdField" value="' + escHtml(site ? site.site_id : '') + '" placeholder="penmindstate" style="' + IS + 'font-family:monospace;"></div>' +
            '</div>' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Domain</label><input id="siteDomain" value="' + escHtml(site ? site.domain : '') + '" placeholder="penmindstate.com" style="' + IS + '"></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">GitHub Repo</label><input id="siteRepo" value="' + escHtml(site ? site.github_repo : '') + '" placeholder="pen-mindstate-site" style="' + IS + '"></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Netlify Site ID</label><input id="siteNetlifyId" value="' + escHtml(site ? site.netlify_site_id : '') + '" style="' + IS + '"></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Plan</label><select id="sitePlan" style="' + IS + '"><option value="basic"' + (site && site.plan === 'basic' ? ' selected' : '') + '>Basic</option><option value="standard"' + (site && site.plan === 'standard' ? ' selected' : '') + '>Standard</option><option value="premium"' + (site && site.plan === 'premium' ? ' selected' : '') + '>Premium</option><option value="custom"' + (site && site.plan === 'custom' ? ' selected' : '') + '>Custom</option></select></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">$/Month</label><input id="siteFee" type="number" value="' + (site ? site.monthly_fee || 0 : 0) + '" style="' + IS + '"></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Status</label><select id="siteStatus" style="' + IS + '">' + so + '</select></div>' +
            '</div>' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Notes</label><textarea id="siteNotes" rows="2" style="' + IS + 'resize:vertical;">' + escHtml(site ? site.notes || '' : '') + '</textarea></div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-top:20px;justify-content:flex-end;">' +
            '<button onclick="document.getElementById(\'addSiteModal\').remove()" style="background:#333;border:1px solid #555;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;">Cancel</button>' +
            '<button onclick="saveSite(\'' + (editId || '') + '\')" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">' + (site ? 'Update' : 'Add Site') + '</button>' +
        '</div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}
function autoFillClientName() { var s = document.getElementById('siteClientId'); if (!s) return; var o = s.options[s.selectedIndex]; if (o && o.dataset.name) { var n = document.getElementById('siteName'); if (n && !n.value) n.value = o.dataset.name + ' Website'; } }
function editSite(id) { showAddSiteModal(id); }
function viewSiteLive(d) { if (d) window.open('https://' + d, '_blank'); }

// ---- SAVE SITE ----
async function saveSite(editId) {
    var cs = document.getElementById('siteClientId');
    var cid = cs ? cs.value : '';
    var cn = cs ? (cs.options[cs.selectedIndex]?.dataset?.name || '') : '';
    var sd = {
        client_id: cid, client_name: cn || (document.getElementById('siteName')?.value || '').trim(),
        site_name: (document.getElementById('siteName')?.value || '').trim(),
        site_id: (document.getElementById('siteIdField')?.value || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        domain: (document.getElementById('siteDomain')?.value || '').trim().replace(/^https?:\/\//, ''),
        github_repo: (document.getElementById('siteRepo')?.value || '').trim(),
        netlify_site_id: (document.getElementById('siteNetlifyId')?.value || '').trim(),
        plan: document.getElementById('sitePlan')?.value || 'basic',
        monthly_fee: parseFloat(document.getElementById('siteFee')?.value) || 0,
        status: document.getElementById('siteStatus')?.value || 'active',
        notes: (document.getElementById('siteNotes')?.value || '').trim()
    };
    if (!sd.site_name) { alert('Site name is required.'); return; }
    if (!sd.site_id) { alert('Site ID is required (used for status checks).'); return; }
    try {
        if (typeof supabaseClient !== 'undefined') {
            var res = editId ? await supabaseClient.from('client_sites').update(sd).eq('id', editId) : await supabaseClient.from('client_sites').insert(sd);
            if (res.error) throw res.error;
        } else {
            if (editId) { var idx = _clientSites.findIndex(function(s) { return s.id === editId; }); if (idx >= 0) Object.assign(_clientSites[idx], sd); }
            else { sd.id = 'local_' + Date.now(); sd.created_at = new Date().toISOString(); _clientSites.push(sd); }
            localStorage.setItem('nui_client_sites', JSON.stringify(_clientSites));
        }
        if (typeof showNotification === 'function') showNotification('Site ' + (editId ? 'updated' : 'added') + ': ' + sd.site_name, 'success');
        var m = document.getElementById('addSiteModal'); if (m) m.remove();
        loadSitesFromSupabase();
    } catch (err) { alert('Error saving: ' + err.message); }
}
if (typeof escHtml === 'undefined') { window.escHtml = function(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }; }
console.log('✅ admin-sites.js v2 loaded — suspend/reactivate ready');
