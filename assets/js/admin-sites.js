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
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">BILLING</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:12px;font-weight:600;">ACTIONS</th>' +
                '</tr></thead>' +
                '<tbody id="sitesTableBody"><tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Loading...</td></tr></tbody>' +
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
    if (_clientSites.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">No sites yet.</td></tr>'; return; }
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
        // ── Phase 1B billing cell ──
        // Not linked → one-time "Checkout Link" action (only while
        // stripe_subscription_id is empty). Linked → billing status + sub ID +
        // Stripe management link. Only the checkout.session.completed webhook
        // ever stores IDs / flips billing_status — generating a link changes nothing.
        var billingCell;
        if (site.stripe_subscription_id) {
            var bcMap = { active: '#10b981', overdue: '#f59e0b', unbilled: '#888' };
            var bcolor = bcMap[site.billing_status] || '#888';
            var graceInfo = site.billing_status === 'overdue' && site.grace_until ?
                '<div style="font-size:10px;color:#f59e0b;margin-top:2px;">grace until ' + new Date(site.grace_until).toLocaleDateString() + '</div>' : '';
            billingCell =
                '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:' + bcolor + '20;color:' + bcolor + ';text-transform:uppercase;">' + escHtml(site.billing_status || 'unbilled') + '</span>' +
                '<div style="font-size:10px;color:#666;font-family:monospace;margin-top:3px;" title="' + escHtml(site.stripe_subscription_id) + '">' + escHtml(String(site.stripe_subscription_id).slice(0, 14)) + '…</div>' +
                '<a href="https://dashboard.stripe.com/subscriptions/' + encodeURIComponent(site.stripe_subscription_id) + '" target="_blank" style="font-size:10px;color:#a855f7;text-decoration:none;">Manage in Stripe ↗</a>' +
                graceInfo;
        } else {
            billingCell =
                '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:#88888820;color:#888;text-transform:uppercase;">' + escHtml(site.billing_status || 'unbilled') + '</span><br>' +
                '<button id="checkoutBtn_' + escHtml(String(site.id)) + '" onclick="sendHostingCheckout(\'' + site.id + '\')" style="background:#1a1033;border:1px solid #a855f7;color:#a855f7;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;margin-top:4px;">💳 Checkout Link</button>';
        }
        // Due-date line: red when past due, amber within 7 days, grey otherwise.
        if (site.next_due_date) {
            // Compare calendar days in local time (not timestamps) so "today" reads as today.
            var due = new Date(String(site.next_due_date).slice(0, 10) + 'T00:00:00');
            var _today = new Date(); _today.setHours(0, 0, 0, 0);
            var days = Math.round((due - _today) / 86400000);
            var dCol = days < 0 ? '#ef4444' : (days <= 7 ? '#f59e0b' : '#888');
            var dTxt = days < 0 ? ('past due ' + Math.abs(days) + 'd') : (days === 0 ? 'due today' : 'due in ' + days + 'd');
            billingCell += '<div style="font-size:10px;color:' + dCol + ';margin-top:4px;">📅 ' + due.toLocaleDateString() + ' · ' + dTxt + '</div>';
        } else {
            billingCell += '<div style="font-size:10px;color:#555;margin-top:4px;">no due date</div>';
        }
        // Live-link cell: the domain is the ground truth of WHICH deployment this
        // row controls — always visible, always clickable.
        var liveLink = site.domain ?
            '<a href="https://' + escHtml(site.domain) + '" target="_blank" rel="noopener" style="font-size:11px;color:#3b82f6;text-decoration:none;display:inline-block;margin-top:3px;">' + escHtml(site.domain) + ' ↗</a>' :
            '<div style="font-size:10px;color:#ef4444;margin-top:3px;">⚠ no domain set</div>';
        return '<tr style="border-bottom:1px solid #222;">' +
            '<td style="padding:12px 16px;color:#fff;font-size:13px;">' + escHtml(site.client_name || '—') + '</td>' +
            '<td style="padding:12px 16px;"><div style="color:#fff;font-size:13px;font-weight:600;">' + escHtml(site.site_name || '—') + '</div>' + liveLink + '</td>' +
            '<td style="padding:12px 16px;color:#888;font-size:12px;font-family:monospace;">' + escHtml(site.site_id || '—') + '</td>' +
            '<td style="padding:12px 16px;color:#10b981;font-size:13px;font-weight:600;">$' + (parseFloat(site.monthly_fee) || 0) + '</td>' +
            '<td style="padding:12px 16px;"><span style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;background:' + color + '20;color:' + color + ';text-transform:uppercase;">' + (site.status || 'active') + '</span>' + suspInfo + '</td>' +
            '<td style="padding:12px 16px;">' + billingCell + '</td>' +
            '<td style="padding:12px 16px;white-space:nowrap;">' +
                '<button onclick="editSite(\'' + site.id + '\')" style="background:#333;border:1px solid #555;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;margin-right:4px;">Edit</button>' +
                '<button onclick="showSiteCredentials(\'' + site.id + '\')" title="Admin login for this site" style="background:#1a2033;border:1px solid #3b82f6;color:#3b82f6;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:11px;margin-right:4px;">🔑 Login</button>' +
                suspendBtn + '</td></tr>';
    }).join('');
}

// ---- PHASE 1B: SEND HOSTING CHECKOUT LINK ----
// Generates a Stripe Checkout link priced SERVER-SIDE from client_sites.monthly_fee.
// Does NOT mark the site linked/active/paid — only the webhook does that.
async function sendHostingCheckout(siteId) {
    var site = _clientSites.find(function(s) { return String(s.id) === String(siteId); });
    if (!site) { alert('Site not found. Refresh the panel.'); return; }
    if (site.stripe_subscription_id) { alert('This site is already linked to subscription ' + site.stripe_subscription_id); return; }
    if (!(parseFloat(site.monthly_fee) > 0)) { alert('Set a monthly fee on this site first (Edit → $/Month).'); return; }
    var trialInput = prompt('Free trial days before the first charge (0 = charge immediately, max 90):', '0');
    if (trialInput === null) return; // admin cancelled
    var trialDays = Math.min(90, Math.max(0, parseInt(trialInput, 10) || 0));
    var btn = document.getElementById('checkoutBtn_' + siteId);
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    try {
        var resp = await fetch('/.netlify/functions/create-subscription', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_checkout: true, site_id: String(siteId), trial_days: trialDays })
        });
        var data = await resp.json();
        if (!resp.ok || !data.url) throw new Error(data.error || 'Checkout link generation failed');
        showCheckoutLinkModal(site, data.url, data.amount, data.trial_days);
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💳 Checkout Link'; }
    }
}

function _siteClientContact(site) {
    // Resolve the client's email/phone from the global clients array (best effort).
    var c = (typeof clients !== 'undefined' && clients.length) ?
        clients.find(function(x) { return String(x.id) === String(site.client_id); }) : null;
    return { email: c && c.email ? c.email : '', phone: c && c.phone ? c.phone : '', name: (c && c.name) || site.client_name || '' };
}

function showCheckoutLinkModal(site, url, amount, trialDays) {
    var ex = document.getElementById('checkoutLinkModal'); if (ex) ex.remove();
    var contact = _siteClientContact(site);
    var fee = amount || parseFloat(site.monthly_fee) || 0;
    var trialNote = trialDays > 0 ? ' after a ' + trialDays + '-day free trial' : '';
    var modal = document.createElement('div'); modal.id = 'checkoutLinkModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML =
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:32px;width:560px;max-width:92vw;">' +
        '<h3 style="margin:0 0 6px;color:#fff;font-size:18px;">💳 Hosting Checkout — ' + escHtml(site.site_name || '') + '</h3>' +
        '<p style="margin:0 0 16px;color:#888;font-size:13px;">$' + fee + '/mo' + trialNote + ' · One-time link (expires in 24h). The site links itself automatically when the client completes checkout — nothing is marked paid until then.</p>' +
        '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
            '<input id="checkoutLinkInput" readonly value="' + escHtml(url) + '" style="flex:1;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#a855f7;font-size:12px;font-family:monospace;" onclick="this.select()">' +
            '<button onclick="copyCheckoutLink()" style="background:#333;border:1px solid #555;color:#fff;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">Copy</button>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
            (contact.email ?
                '<button onclick="emailCheckoutLink(\'' + escHtml(String(site.id)) + '\')" style="background:#0d2033;border:1px solid #3b82f6;color:#3b82f6;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">📧 Email ' + escHtml(contact.email) + '</button>' :
                '<span style="color:#666;font-size:11px;align-self:center;">No client email on file</span>') +
            (contact.phone ?
                '<button onclick="smsCheckoutLink(\'' + escHtml(String(site.id)) + '\')" style="background:#0d3320;border:1px solid #10b981;color:#10b981;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">💬 SMS ' + escHtml(contact.phone) + '</button>' : '') +
            '<button onclick="document.getElementById(\'checkoutLinkModal\').remove()" style="background:#333;border:1px solid #555;color:#fff;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:12px;">Close</button>' +
        '</div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    window._checkoutLinkCache = { siteId: String(site.id), url: url, fee: fee, trialDays: trialDays || 0 };
}

function copyCheckoutLink() {
    var input = document.getElementById('checkoutLinkInput');
    if (!input) return;
    input.select();
    var done = function() { if (typeof showNotification === 'function') showNotification('Checkout link copied', 'success'); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(input.value).then(done); }
    else { document.execCommand('copy'); done(); }
}

async function emailCheckoutLink(siteId) {
    var cache = window._checkoutLinkCache || {};
    var site = _clientSites.find(function(s) { return String(s.id) === String(siteId); });
    if (!site || cache.siteId !== String(siteId) || !cache.url) { alert('Regenerate the link first.'); return; }
    var contact = _siteClientContact(site);
    if (!contact.email) { alert('No client email on file.'); return; }
    try {
        var resp = await fetch('/.netlify/functions/send-email', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: contact.email,
                subject: 'Set up automatic payments for ' + (site.site_name || 'your website'),
                html: '<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">' +
                    '<h2 style="color:#10b981;">Website Hosting &amp; Maintenance</h2>' +
                    '<p style="color:#ccc;line-height:1.7;">Hi ' + escHtml(contact.name || 'there') + ', you can now pay your website hosting &amp; maintenance for <strong>' + escHtml(site.site_name || '') + '</strong> automatically — <strong>$' + cache.fee + '/month</strong>' + (cache.trialDays > 0 ? ' after a <strong>' + cache.trialDays + '-day free trial</strong>' : '') + ', cancel anytime.</p>' +
                    '<div style="text-align:center;margin:24px 0;"><a href="' + escHtml(cache.url) + '" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Set Up Auto-Pay →</a></div>' +
                    '<p style="color:#666;font-size:13px;">Questions? Call (248) 487-8747.</p>' +
                    '<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;color:#555;font-size:12px;">New Urban Influence • Detroit, MI</div></div>',
                contactId: null
            })
        });
        if (!resp.ok) { var d = await resp.json().catch(function() { return {}; }); throw new Error(d.error || 'Send failed'); }
        if (typeof showNotification === 'function') showNotification('Checkout link emailed to ' + contact.email, 'success');
    } catch (err) { alert('Email error: ' + err.message); }
}

async function smsCheckoutLink(siteId) {
    var cache = window._checkoutLinkCache || {};
    var site = _clientSites.find(function(s) { return String(s.id) === String(siteId); });
    if (!site || cache.siteId !== String(siteId) || !cache.url) { alert('Regenerate the link first.'); return; }
    var contact = _siteClientContact(site);
    if (!contact.phone) { alert('No client phone on file.'); return; }
    try {
        var resp = await fetch('/.netlify/functions/send-sms', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: contact.phone,
                message: 'NUI: Set up auto-pay for ' + (site.site_name || 'your website') + ' hosting ($' + cache.fee + '/mo' + (cache.trialDays > 0 ? ', first ' + cache.trialDays + ' days free' : '') + '): ' + cache.url
            })
        });
        if (!resp.ok) { var d = await resp.json().catch(function() { return {}; }); throw new Error(d.error || 'Send failed'); }
        if (typeof showNotification === 'function') showNotification('Checkout link texted to ' + contact.phone, 'success');
    } catch (err) { alert('SMS error: ' + err.message); }
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
            '<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end;">' +
                '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Next Payment Due</label><input id="siteDueDate" type="date" value="' + escHtml(site && site.next_due_date ? String(site.next_due_date).slice(0,10) : '') + '" style="' + IS + '"></div>' +
                '<button type="button" onclick="bumpDueDate(1)" style="background:#333;border:1px solid #555;color:#fff;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:12px;white-space:nowrap;">+1 Month</button>' +
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
// Advance the due-date field by N months (from today if empty) — quick monthly roll-forward.
function bumpDueDate(months) {
    var el = document.getElementById('siteDueDate'); if (!el) return;
    var d = el.value ? new Date(el.value + 'T12:00:00') : new Date();
    d.setMonth(d.getMonth() + (months || 1));
    el.value = d.toISOString().slice(0, 10);
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
        next_due_date: (document.getElementById('siteDueDate')?.value || '') || null,
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
// ---- SITE ADMIN-LOGIN CREDENTIALS (stored in the RLS-locked site_credentials table) ----
async function showSiteCredentials(siteId) {
    var site = _clientSites.find(function(s) { return String(s.id) === String(siteId); });
    if (!site) { alert('Site not found. Refresh the panel.'); return; }
    var cred = { login_url: '', username: '', password: '', notes: '' };
    try {
        if (typeof supabaseClient !== 'undefined') {
            var res = await supabaseClient.from('site_credentials').select('*').eq('site_id', siteId);
            if (!res.error && res.data && res.data[0]) cred = res.data[0];
        }
    } catch (e) { console.warn('cred load:', e.message); }
    renderCredModal(site, cred);
}

function renderCredModal(site, cred) {
    var ex = document.getElementById('siteCredModal'); if (ex) ex.remove();
    var IS = 'width:100%;padding:10px;background:#111;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;';
    var modal = document.createElement('div'); modal.id = 'siteCredModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML =
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:32px;width:480px;max-width:92vw;">' +
        '<h3 style="margin:0 0 4px;color:#fff;font-size:18px;">🔑 Admin Login — ' + escHtml(site.site_name || '') + '</h3>' +
        '<p style="margin:0 0 20px;color:#888;font-size:12px;">Private. Stored in the locked credentials table — never exposed publicly.</p>' +
        '<div style="display:grid;gap:14px;">' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Login URL</label><input id="credUrl" value="' + escHtml(cred.login_url || (site.domain ? 'https://' + site.domain + '/admin' : '')) + '" style="' + IS + '"></div>' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Username / Email</label><input id="credUser" value="' + escHtml(cred.username || '') + '" style="' + IS + '"></div>' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Password</label>' +
                '<div style="display:flex;gap:8px;"><input id="credPass" type="password" value="' + escHtml(cred.password || '') + '" style="' + IS + '">' +
                '<button onclick="var p=document.getElementById(\'credPass\');p.type=p.type===\'password\'?\'text\':\'password\';" style="background:#333;border:1px solid #555;color:#fff;padding:0 14px;border-radius:8px;cursor:pointer;font-size:12px;">👁</button>' +
                '<button onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById(\'credPass\').value);if(typeof showNotification===\'function\')showNotification(\'Password copied\',\'success\');" style="background:#333;border:1px solid #555;color:#fff;padding:0 14px;border-radius:8px;cursor:pointer;font-size:12px;">Copy</button></div></div>' +
            '<div><label style="color:#888;font-size:12px;display:block;margin-bottom:4px;">Notes</label><textarea id="credNotes" rows="2" style="' + IS + 'resize:vertical;">' + escHtml(cred.notes || '') + '</textarea></div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-top:20px;justify-content:space-between;align-items:center;">' +
            (site.domain ? '<a href="https://' + escHtml(site.domain) + '" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px;">Open site ↗</a>' : '<span></span>') +
            '<div style="display:flex;gap:12px;">' +
            '<button onclick="document.getElementById(\'siteCredModal\').remove()" style="background:#333;border:1px solid #555;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;">Cancel</button>' +
            '<button onclick="saveSiteCredentials(\'' + site.id + '\')" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">Save</button>' +
            '</div></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

async function saveSiteCredentials(siteId) {
    var payload = {
        site_id: siteId,
        login_url: (document.getElementById('credUrl')?.value || '').trim(),
        username: (document.getElementById('credUser')?.value || '').trim(),
        password: document.getElementById('credPass')?.value || '',
        notes: (document.getElementById('credNotes')?.value || '').trim(),
        updated_at: new Date().toISOString()
    };
    try {
        if (typeof supabaseClient !== 'undefined') {
            // Upsert on the unique site_id
            var res = await supabaseClient.from('site_credentials').upsert(payload, { onConflict: 'site_id' });
            if (res.error) throw res.error;
        }
        if (typeof showNotification === 'function') showNotification('Login saved for ' + siteId, 'success');
        var m = document.getElementById('siteCredModal'); if (m) m.remove();
    } catch (err) { alert('Error saving login: ' + err.message); }
}

if (typeof escHtml === 'undefined') { window.escHtml = function(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }; }
console.log('✅ admin-sites.js v2 loaded — suspend/reactivate ready');
