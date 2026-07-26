// =============================================
// admin-data-health.js — Account Linkage Check
// Finds records that aren't tied to a client account, duplicate client records,
// and clients with no CRM contact — then lets you repair them in place.
// Read-only by default; every repair asks first and shows exactly what moves.
// =============================================

var _dhReport = null;

async function loadDataHealthPanel() {
    var panel = document.getElementById('adminDataHealthPanel') || document.querySelector('.admin-panel.active');
    if (!panel) return;
    panel.innerHTML = '<div class="admin-panel-content" style="padding:24px;">' +
        '<div style="margin-bottom:24px;"><h2 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Account Linkage Check</h2>' +
        '<p style="margin:4px 0 0;color:#888;font-size:13px;">Everything a client owns should sit under one client ID. This finds what doesn\'t.</p></div>' +
        '<div id="dhBody" style="color:#666;">Scanning…</div></div>';
    await runDataHealthScan();
}

function _dhArr(name) { try { return (typeof window[name] !== 'undefined' && Array.isArray(window[name])) ? window[name] : []; } catch (e) { return []; } }
function _dhEmail(v) { return String(v || '').trim().toLowerCase(); }
function _dhSame(a, b) { return String(a === undefined || a === null ? '' : a) === String(b === undefined || b === null ? '' : b); }

async function runDataHealthScan() {
    var body = document.getElementById('dhBody');
    var cl = _dhArr('clients');
    var od = _dhArr('orders'), iv = _dhArr('invoices'), pm = _dhArr('payments'), pj = _dhArr('projects'), pf = _dhArr('proofs');

    // ── Sites + CRM contacts come from the database ──
    var sites = [], crmEmails = new Set();
    try {
        if (typeof supabaseClient !== 'undefined') {
            var sr = await supabaseClient.from('client_sites').select('id,site_id,site_name,client_id,client_name,contact_email');
            if (!sr.error) sites = sr.data || [];
            var cr = await supabaseClient.from('crm_contacts').select('email').limit(5000);
            if (!cr.error) (cr.data || []).forEach(function(c) { if (c.email) crmEmails.add(_dhEmail(c.email)); });
        }
    } catch (e) { console.warn('data-health db read:', e.message); }

    var idSet = new Set(cl.map(function(c) { return String(c.id); }));

    // ── 1. Duplicate client records (same email) ──
    var byEmail = {};
    cl.forEach(function(c) {
        var e = _dhEmail(c.email); if (!e) return;
        (byEmail[e] = byEmail[e] || []).push(c);
    });
    var dupes = Object.keys(byEmail).filter(function(e) { return byEmail[e].length > 1; })
        .map(function(e) { return { email: e, records: byEmail[e] }; });

    // ── 2. Orphaned records (clientId points at no client) ──
    function orphans(arr, label) {
        return arr.filter(function(r) {
            var cid = r.clientId !== undefined ? r.clientId : r.client_id;
            return cid === undefined || cid === null || cid === '' || !idSet.has(String(cid));
        }).map(function(r) {
            return { type: label, id: r.id, cid: (r.clientId !== undefined ? r.clientId : r.client_id),
                     label: r.projectName || r.description || r.packageName || r.clientName || ('#' + r.id),
                     amount: r.total || r.amount || r.estimate || 0 };
        });
    }
    var orphaned = [].concat(
        orphans(od, 'Order'), orphans(iv, 'Invoice'), orphans(pm, 'Payment'),
        orphans(pj, 'Project'), orphans(pf, 'Proof')
    );

    // ── 3. Clients missing an email (can never be linked to CRM or reminders) ──
    var noEmail = cl.filter(function(c) { return !_dhEmail(c.email); });

    // ── 4. Clients with no matching CRM contact ──
    var noCrm = crmEmails.size ? cl.filter(function(c) {
        var e = _dhEmail(c.email); return e && !crmEmails.has(e);
    }) : [];

    // ── 5. Sites not tied to a client account ──
    var unlinkedSites = sites.filter(function(s) { return !s.client_id || !idSet.has(String(s.client_id)); });

    _dhReport = { dupes: dupes, orphaned: orphaned, noEmail: noEmail, noCrm: noCrm, unlinkedSites: unlinkedSites,
                  totals: { clients: cl.length, orders: od.length, invoices: iv.length, payments: pm.length, sites: sites.length } };

    var issues = dupes.length + orphaned.length + noEmail.length + unlinkedSites.length;
    var clientOpts = '<option value="">— pick a client —</option>' + cl.slice().sort(function(a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''));
    }).map(function(c) {
        return '<option value="' + escHtml(String(c.id)) + '">' + escHtml(c.name || c.email || ('#' + c.id)) + '</option>';
    }).join('');

    function card(title, count, color, inner) {
        return '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;margin-bottom:16px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:' + (count ? '14px' : '0') + ';">' +
            '<h3 style="margin:0;font-size:15px;font-weight:600;color:#fff;">' + title + '</h3>' +
            '<span style="padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;background:' + color + '20;color:' + color + ';">' + count + '</span></div>' +
            (count ? inner : '') + '</div>';
    }

    body.innerHTML =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:24px;">' +
            ['clients', 'orders', 'invoices', 'payments', 'sites'].map(function(k) {
                return '<div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;">' +
                    '<div style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">' + k + '</div>' +
                    '<div style="color:#fff;font-size:22px;font-weight:700;margin-top:4px;">' + _dhReport.totals[k] + '</div></div>';
            }).join('') +
        '</div>' +
        (issues === 0
            ? '<div style="background:#0d3320;border:1px solid #10b981;border-radius:12px;padding:24px;color:#10b981;font-weight:600;">✅ Everything is linked. No duplicates, no orphaned records, every site tied to a client.</div>'
            : '<div style="background:#3a2a10;border:1px solid #f59e0b;border-radius:12px;padding:16px 20px;margin-bottom:20px;color:#f59e0b;font-size:14px;">⚠ ' + issues + ' linkage issue' + (issues > 1 ? 's' : '') + ' found. Each one below can be repaired here.</div>') +

        // Duplicates
        card('Duplicate client records (same email)', dupes.length, '#ef4444',
            dupes.map(function(d) {
                return '<div style="border-top:1px solid #222;padding:12px 0;">' +
                    '<div style="color:#fff;font-size:13px;font-weight:600;">' + escHtml(d.email) + '</div>' +
                    '<div style="color:#888;font-size:12px;margin-top:4px;">' + d.records.map(function(r) {
                        return 'ID ' + escHtml(String(r.id)) + ' (' + escHtml(r.name || 'no name') + ')';
                    }).join(' · ') + '</div>' +
                    '<div style="color:#666;font-size:11px;margin-top:6px;">Records may be split across these IDs. Merge in the Clients panel, keeping the ID with the most history.</div>' +
                '</div>';
            }).join('')) +

        // Orphans
        card('Records not tied to any client', orphaned.length, '#ef4444',
            '<div style="max-height:340px;overflow-y:auto;">' + orphaned.map(function(o, i) {
                return '<div style="border-top:1px solid #222;padding:10px 0;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">' +
                    '<div style="min-width:200px;"><span style="color:#a855f7;font-size:11px;font-weight:700;text-transform:uppercase;">' + o.type + '</span> ' +
                    '<span style="color:#fff;font-size:13px;">' + escHtml(String(o.label)) + '</span>' +
                    (o.amount ? '<span style="color:#10b981;font-size:12px;margin-left:8px;">$' + o.amount + '</span>' : '') +
                    '<div style="color:#666;font-size:11px;">clientId: ' + escHtml(String(o.cid === undefined || o.cid === null || o.cid === '' ? '(none)' : o.cid)) + '</div></div>' +
                    '<div style="display:flex;gap:8px;align-items:center;">' +
                    '<select id="dhFix_' + i + '" style="padding:7px;background:#111;border:1px solid #333;border-radius:6px;color:#fff;font-size:12px;">' + clientOpts + '</select>' +
                    '<button onclick="dhReassign(' + i + ')" style="background:#1a2033;border:1px solid #3b82f6;color:#3b82f6;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Link</button>' +
                    '</div></div>';
            }).join('') + '</div>') +

        // Unlinked sites
        card('Sites with no client account', unlinkedSites.length, '#f59e0b',
            unlinkedSites.map(function(s) {
                return '<div style="border-top:1px solid #222;padding:10px 0;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">' +
                    '<div><span style="color:#fff;font-size:13px;">' + escHtml(s.site_name || s.site_id || '') + '</span>' +
                    '<div style="color:#666;font-size:11px;">' + escHtml(s.client_name || 'no client name') + '</div></div>' +
                    '<button onclick="showAdminPanel(\'sites\')" style="background:#333;border:1px solid #555;color:#fff;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:12px;">Fix in Sites →</button>' +
                '</div>';
            }).join('')) +

        // Missing email
        card('Clients with no email address', noEmail.length, '#f59e0b',
            noEmail.map(function(c) {
                return '<div style="border-top:1px solid #222;padding:10px 0;color:#ccc;font-size:13px;">' +
                    escHtml(c.name || ('Client #' + c.id)) + '<span style="color:#666;font-size:11px;"> — can\'t receive reminders or be matched to CRM</span></div>';
            }).join('')) +

        // No CRM contact
        card('Clients with no CRM contact record', noCrm.length, '#888',
            '<div style="color:#888;font-size:12px;margin-bottom:10px;">Their texts and emails won\'t thread to their account until a CRM contact exists with the same email.</div>' +
            noCrm.slice(0, 40).map(function(c) {
                return '<div style="border-top:1px solid #222;padding:8px 0;color:#ccc;font-size:13px;">' +
                    escHtml(c.name || '') + ' <span style="color:#666;">' + escHtml(c.email || '') + '</span></div>';
            }).join('') + (noCrm.length > 40 ? '<div style="color:#666;font-size:11px;padding-top:8px;">+ ' + (noCrm.length - 40) + ' more</div>' : '')) +

        '<button onclick="runDataHealthScan()" style="background:#e63946;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;margin-top:8px;">Re-scan</button>';
}

// Reassign one orphaned record to a client. Shows exactly what will change first.
function dhReassign(idx) {
    if (!_dhReport) return;
    var o = _dhReport.orphaned[idx];
    var sel = document.getElementById('dhFix_' + idx);
    var newId = sel ? sel.value : '';
    if (!o || !newId) { alert('Pick a client first.'); return; }
    var client = _dhArr('clients').find(function(c) { return String(c.id) === String(newId); });
    if (!client) { alert('Client not found — re-scan and try again.'); return; }

    if (!confirm('Move this ' + o.type.toLowerCase() + ' to ' + (client.name || client.email) + '?\n\n' +
                 o.type + ': ' + o.label + '\nFrom clientId: ' + (o.cid || '(none)') + '\nTo clientId: ' + client.id +
                 '\n\nIt will appear in their portal and under their account everywhere.')) return;

    var map = { Order: 'orders', Invoice: 'invoices', Payment: 'payments', Project: 'projects', Proof: 'proofs' };
    var arrName = map[o.type];
    var arr = _dhArr(arrName);
    var rec = arr.find(function(r) { return String(r.id) === String(o.id); });
    if (!rec) { alert('Record not found — re-scan and try again.'); return; }

    rec.clientId = client.id;
    if ('client_id' in rec) rec.client_id = client.id;
    if ('clientName' in rec || client.name) rec.clientName = client.name;

    var savers = { orders: 'saveOrders', invoices: 'saveInvoices', payments: 'savePayments', projects: 'saveProjects', proofs: 'saveProofs' };
    var fn = savers[arrName];
    if (typeof window[fn] === 'function') window[fn]();
    else { try { localStorage.setItem('nui_' + arrName, JSON.stringify(arr)); } catch (e) {} }

    if (typeof showNotification === 'function') showNotification(o.type + ' linked to ' + (client.name || client.email), 'success');
    runDataHealthScan();
}

if (typeof escHtml === 'undefined') { window.escHtml = function(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }; }
console.log('✅ admin-data-health.js loaded — account linkage check ready');
