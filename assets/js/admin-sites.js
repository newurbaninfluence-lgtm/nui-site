// =============================================
// admin-sites.js — Client Website Management
// New file — does NOT modify any existing code
// Manages hosted client websites (Netlify + GitHub)
// =============================================

// ---- PANEL LOADER ----
function loadAdminSitesPanel() {
    var panel = document.getElementById('adminSitesPanel') ||
                document.querySelector('.admin-panel.active');
    if (!panel) return;

    panel.innerHTML = buildSitesPanelHTML();
    loadSitesFromSupabase();
}

// ---- PANEL HTML ----
function buildSitesPanelHTML() {
    return '<div class="admin-panel-content" style="padding:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
            '<div>' +
                '<h2 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Client Sites</h2>' +
                '<p style="margin:4px 0 0;color:#888;font-size:13px;">Manage hosted websites, plans & deployments</p>' +
            '</div>' +
            '<button onclick="showAddSiteModal()" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">+ Add Site</button>' +
        '</div>' +

        // Stats row
        '<div id="sitesStatsRow" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">' +
            buildStatCard('Total Sites', '—', '#3b82f6') +
            buildStatCard('Active', '—', '#10b981') +
            buildStatCard('Monthly Revenue', '—', '#f59e0b') +
            buildStatCard('Needs Attention', '—', '#ef4444') +
        '</div>' +

        // Sites table
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;overflow:hidden;">' +
            '<table style="width:100%;border-collapse:collapse;">' +
                '<thead><tr style="background:#111;border-bottom:1px solid #333;">' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">CLIENT</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">SITE</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">DOMAIN</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">PLAN</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">$/MO</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">STATUS</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">ACTIONS</th>' +
                '</tr></thead>' +
                '<tbody id="sitesTableBody"><tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Loading sites...</td></tr></tbody>' +
            '</table>' +
        '</div>' +
    '</div>';
}

function buildStatCard(label, value, color) {
    return '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;">' +
        '<div style="color:#888;font-size:12px;font-weight:600;margin-bottom:8px;">' + label + '</div>' +
        '<div style="color:' + color + ';font-size:28px;font-weight:700;" id="stat_' + label.replace(/\s/g,'') + '">' + value + '</div>' +
    '</div>';
}

// ---- SUPABASE INTEGRATION ----
var _clientSites = [];

async function loadSitesFromSupabase() {
    try {
        if (typeof supabaseClient === 'undefined') {
            renderSitesFromLocal();
            return;
        }
        var res = await supabaseClient.from('client_sites').select('*').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        _clientSites = res.data || [];
        localStorage.setItem('nui_client_sites', JSON.stringify(_clientSites));
        renderSitesTable();
    } catch (err) {
        console.log('Sites: Supabase fetch failed, using local:', err.message);
        renderSitesFromLocal();
    }
}

function renderSitesFromLocal() {
    _clientSites = JSON.parse(localStorage.getItem('nui_client_sites') || '[]');
    renderSitesTable();
}

function renderSitesTable() {
    var tbody = document.getElementById('sitesTableBody');
    if (!tbody) return;

    // Update stats
    var active = _clientSites.filter(function(s) { return s.status === 'active'; });
    var revenue = active.reduce(function(sum, s) { return sum + (parseFloat(s.monthly_fee) || 0); }, 0);
    var needsAttn = _clientSites.filter(function(s) { return s.status === 'paused' || s.status === 'overdue'; });

    var statTotal = document.getElementById('stat_TotalSites');
    var statActive = document.getElementById('stat_Active');
    var statRev = document.getElementById('stat_MonthlyRevenue');
    var statAttn = document.getElementById('stat_NeedsAttention');
    if (statTotal) statTotal.textContent = _clientSites.length;
    if (statActive) statActive.textContent = active.length;
    if (statRev) statRev.textContent = '$' + revenue.toLocaleString();
    if (statAttn) statAttn.textContent = needsAttn.length;

    if (_clientSites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">No client sites yet. Click "+ Add Site" to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = _clientSites.map(function(site) {
        var statusColors = { active: '#10b981', paused: '#f59e0b', overdue: '#ef4444', building: '#3b82f6' };
        var sColor = statusColors[site.status] || '#888';
        return '<tr style="border-bottom:1px solid #222;">' +
            '<td style="padding:12px 16px;color:#fff;font-size:13px;">' + escHtml(site.client_name || '—') + '</td>' +
            '<td style="padding:12px 16px;color:#fff;font-size:13px;font-weight:600;">' + escHtml(site.site_name || '—') + '</td>' +
            '<td style="padding:12px 16px;"><a href="https://' + escHtml(site.domain || '') + '" target="_blank" style="color:#3b82f6;text-decoration:none;font-size:13px;">' + escHtml(site.domain || 'No domain') + '</a></td>' +
            '<td style="padding:12px 16px;color:#ccc;font-size:13px;text-transform:capitalize;">' + escHtml(site.plan || 'basic') + '</td>' +
            '<td style="padding:12px 16px;color:#10b981;font-size:13px;font-weight:600;">$' + (parseFloat(site.monthly_fee) || 0) + '</td>' +
            '<td style="padding:12px 16px;"><span style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;background:' + sColor + '20;color:' + sColor + ';">' + (site.status || 'active') + '</span></td>' +
            '<td style="padding:12px 16px;">' +
                '<button onclick="editSite(\'' + site.id + '\')" style="background:#333;border:1px solid #555;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;margin-right:4px;">Edit</button>' +
                '<button onclick="viewSiteLive(\'' + escHtml(site.domain || '') + '\')" style="background:#1a3a2a;border:1px solid #10b981;color:#10b981;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;">View Live</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

// ---- ADD / EDIT SITE MODAL ----
function showAddSiteModal(editId) {
    var site = editId ? _clientSites.find(function(s) { return s.id === editId; }) : null;
    var existing = document.getElementById('addSiteModal');
    if (existing) existing.remove();

    // Build client dropdown from existing clients
    var clientOpts = '<option value="">Select client...</option>';
    if (typeof clients !== 'undefined' && clients.length) {
        clients.forEach(function(c) {
            var sel = site && site.client_id == c.id ? ' selected' : '';
            clientOpts += '<option value="' + c.id + '" data-name="' + escHtml(c.name || '') + '"' + sel + '>' + escHtml(c.name || c.email) + '</option>';
        });
    }

    var modal = document.createElement('div');
    modal.id = 'addSiteModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML =
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:32px;width:500px;max-width:90vw;max-height:85vh;overflow-y:auto;">' +
            '<h3 style="margin:0 0 20px;color:#fff;font-size:18px;">' + (site ? 'Edit Site' : 'Add Client Site') + '</h3>' +
            '<div style="display:grid;gap:14px;">' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Client</label>' +
                    '<select id="siteClientId" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;" onchange="autoFillClientName()">' + clientOpts + '</select></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Site Name</label>' +
                    '<input id="siteName" value="' + escHtml(site ? site.site_name : '') + '" placeholder="Sarah\'s Bakery Website" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Domain</label>' +
                    '<input id="siteDomain" value="' + escHtml(site ? site.domain : '') + '" placeholder="sarahsbakery.com" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">GitHub Repo</label>' +
                    '<input id="siteRepo" value="' + escHtml(site ? site.github_repo : '') + '" placeholder="nui-client-sarahsbakery" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Netlify Site ID</label>' +
                    '<input id="siteNetlifyId" value="' + escHtml(site ? site.netlify_site_id : '') + '" placeholder="abc123-def456" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                    '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Plan</label>' +
                        '<select id="sitePlan" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;">' +
                            '<option value="basic"' + (site && site.plan === 'basic' ? ' selected' : '') + '>Basic ($49/mo)</option>' +
                            '<option value="standard"' + (site && site.plan === 'standard' ? ' selected' : '') + '>Standard ($99/mo)</option>' +
                            '<option value="premium"' + (site && site.plan === 'premium' ? ' selected' : '') + '>Premium ($199/mo)</option>' +
                            '<option value="custom"' + (site && site.plan === 'custom' ? ' selected' : '') + '>Custom</option>' +
                        '</select></div>' +
                    '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Monthly Fee ($)</label>' +
                        '<input id="siteFee" type="number" value="' + (site ? site.monthly_fee || 49 : 49) + '" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '</div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Status</label>' +
                    '<select id="siteStatus" style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;">' +
                        '<option value="building"' + (site && site.status === 'building' ? ' selected' : '') + '>Building</option>' +
                        '<option value="active"' + (!site || site.status === 'active' ? ' selected' : '') + '>Active</option>' +
                        '<option value="paused"' + (site && site.status === 'paused' ? ' selected' : '') + '>Paused</option>' +
                        '<option value="overdue"' + (site && site.status === 'overdue' ? ' selected' : '') + '>Overdue</option>' +
                    '</select></div>' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Notes</label>' +
                    '<textarea id="siteNotes" rows="3" placeholder="Migration notes, tech stack, etc." style="width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;resize:vertical;box-sizing:border-box;">' + escHtml(site ? site.notes || '' : '') + '</textarea></div>' +
            '</div>' +
            '<div style="display:flex;gap:12px;margin-top:20px;justify-content:flex-end;">' +
                '<button onclick="document.getElementById(\'addSiteModal\').remove()" style="background:#333;border:1px solid #555;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;">Cancel</button>' +
                '<button onclick="saveSite(\'' + (editId || '') + '\')" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">' + (site ? 'Update' : 'Add Site') + '</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

function autoFillClientName() {
    var sel = document.getElementById('siteClientId');
    if (!sel) return;
    var opt = sel.options[sel.selectedIndex];
    if (opt && opt.dataset.name) {
        var nameField = document.getElementById('siteName');
        if (nameField && !nameField.value) nameField.value = opt.dataset.name + ' Website';
    }
}

function editSite(id) { showAddSiteModal(id); }
function viewSiteLive(domain) { if (domain) window.open('https://' + domain, '_blank'); }

// ---- SAVE SITE ----
async function saveSite(editId) {
    var clientSelect = document.getElementById('siteClientId');
    var clientId = clientSelect ? clientSelect.value : '';
    var clientName = clientSelect ? (clientSelect.options[clientSelect.selectedIndex]?.dataset?.name || '') : '';

    var siteData = {
        client_id: clientId,
        client_name: clientName,
        site_name: (document.getElementById('siteName')?.value || '').trim(),
        domain: (document.getElementById('siteDomain')?.value || '').trim().replace(/^https?:\/\//, ''),
        github_repo: (document.getElementById('siteRepo')?.value || '').trim(),
        netlify_site_id: (document.getElementById('siteNetlifyId')?.value || '').trim(),
        plan: document.getElementById('sitePlan')?.value || 'basic',
        monthly_fee: parseFloat(document.getElementById('siteFee')?.value) || 49,
        status: document.getElementById('siteStatus')?.value || 'active',
        notes: (document.getElementById('siteNotes')?.value || '').trim()
    };

    if (!siteData.site_name) { alert('Site name is required.'); return; }
    if (!siteData.client_id) { alert('Please select a client.'); return; }

    try {
        if (typeof supabaseClient !== 'undefined') {
            if (editId) {
                var res = await supabaseClient.from('client_sites').update(siteData).eq('id', editId);
                if (res.error) throw res.error;
            } else {
                var res = await supabaseClient.from('client_sites').insert(siteData);
                if (res.error) throw res.error;
            }
        } else {
            // Fallback: localStorage
            if (editId) {
                var idx = _clientSites.findIndex(function(s) { return s.id === editId; });
                if (idx >= 0) Object.assign(_clientSites[idx], siteData);
            } else {
                siteData.id = 'local_' + Date.now();
                siteData.created_at = new Date().toISOString();
                _clientSites.push(siteData);
            }
            localStorage.setItem('nui_client_sites', JSON.stringify(_clientSites));
        }

        if (typeof showNotification === 'function') {
            showNotification('Site ' + (editId ? 'updated' : 'added') + ': ' + siteData.site_name, 'success');
        }
        var modal = document.getElementById('addSiteModal');
        if (modal) modal.remove();
        loadSitesFromSupabase();
    } catch (err) {
        alert('Error saving site: ' + err.message);
    }
}

// ---- UTILITY ----
// escHtml is defined in core.js — safe to call from here
if (typeof escHtml === 'undefined') {
    window.escHtml = function(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
}

console.log('✅ admin-sites.js loaded');
