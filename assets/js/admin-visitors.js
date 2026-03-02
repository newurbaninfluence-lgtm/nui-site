// =============================================
// admin-visitors.js — Identified Visitor Tracking
// RB2B integration — shows anonymous visitors
// who have been identified on the NUI website
// =============================================

function loadAdminVisitorsPanel() {
    var panel = document.getElementById('adminVisitorsPanel');
    if (!panel) return;
    panel.innerHTML = buildVisitorsPanelHTML();
    loadVisitorsFromSupabase();
}

function buildVisitorsPanelHTML() {
    return '<div style="padding:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
            '<div>' +
                '<h2 style="margin:0;font-size:22px;font-weight:700;color:#fff;">🔍 Identified Visitors</h2>' +
                '<p style="margin:4px 0 0;color:#888;font-size:13px;">Anonymous website visitors identified by RB2B — reach out before they forget you</p>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<select id="visitorStatusFilter" onchange="loadVisitorsFromSupabase()" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:8px 12px;border-radius:8px;font-size:13px;">' +
                    '<option value="all">All Visitors</option>' +
                    '<option value="new">🟢 New</option>' +
                    '<option value="contacted">📧 Contacted</option>' +
                    '<option value="qualified">⭐ Qualified</option>' +
                    '<option value="converted">✅ Converted</option>' +
                    '<option value="dismissed">❌ Dismissed</option>' +
                '</select>' +
                '<button onclick="exportVisitorsCSV()" style="background:#333;color:#fff;border:1px solid #444;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">Export CSV</button>' +
            '</div>' +
        '</div>' +

        // Stats row
        '<div id="visitorStatsRow" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">' +
            '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px;text-align:center;">' +
                '<div style="font-size:28px;font-weight:700;color:#3b82f6;" id="statTotalVisitors">—</div>' +
                '<div style="font-size:12px;color:#888;margin-top:4px;">Total Identified</div>' +
            '</div>' +
            '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px;text-align:center;">' +
                '<div style="font-size:28px;font-weight:700;color:#10b981;" id="statNewVisitors">—</div>' +
                '<div style="font-size:12px;color:#888;margin-top:4px;">New This Week</div>' +
            '</div>' +
            '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px;text-align:center;">' +
                '<div style="font-size:28px;font-weight:700;color:#f59e0b;" id="statRepeatVisitors">—</div>' +
                '<div style="font-size:12px;color:#888;margin-top:4px;">Repeat Visitors</div>' +
            '</div>' +
            '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px;text-align:center;">' +
                '<div style="font-size:28px;font-weight:700;color:#e63946;" id="statHotLeads">—</div>' +
                '<div style="font-size:12px;color:#888;margin-top:4px;">Hot Leads</div>' +
            '</div>' +
        '</div>' +

        // Visitors table
        '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;overflow:hidden;">' +
            '<table style="width:100%;border-collapse:collapse;" id="visitorsTable">' +
                '<thead><tr style="background:#111;border-bottom:1px solid #333;">' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">VISITOR</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">COMPANY</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">PAGE VIEWED</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">VISITS</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">LAST SEEN</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">STATUS</th>' +
                    '<th style="text-align:left;padding:12px 16px;color:#888;font-size:11px;font-weight:600;">ACTIONS</th>' +
                '</tr></thead>' +
                '<tbody id="visitorsTableBody"><tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Loading visitors...</td></tr></tbody>' +
            '</table>' +
        '</div>' +
    '</div>';
}

// ---- LOAD FROM SUPABASE ----
async function loadVisitorsFromSupabase() {
    if (typeof db === 'undefined' || !db) { console.warn('Supabase client (db) not ready'); return; }
    var filter = document.getElementById('visitorStatusFilter');
    var status = filter ? filter.value : 'all';

    try {
        var query = db.from('identified_visitors').select('*').order('seen_at', { ascending: false }).limit(100);
        if (status !== 'all') query = query.eq('status', status);
        // LinkedIn-only filter
        query = query.not('linkedin_url', 'is', null).neq('linkedin_url', '');
        var { data, error } = await query;
        if (error) throw error;

        window._identifiedVisitors = data || [];
        renderVisitorsTable(data || []);
        updateVisitorStats(data || []);
    } catch (err) {
        console.error('Error loading visitors:', err);
        document.getElementById('visitorsTableBody').innerHTML =
            '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ef4444;">Error loading visitors. Check Supabase table.</td></tr>';
    }
}

function updateVisitorStats(visitors) {
    var total = visitors.length;
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    var newThisWeek = visitors.filter(v => new Date(v.created_at) > weekAgo).length;
    var repeats = visitors.filter(v => (v.visit_count || 1) > 1).length;
    var hot = visitors.filter(v => (v.tags || '').toLowerCase().includes('hot')).length;

    var el = document.getElementById('statTotalVisitors'); if (el) el.textContent = total;
    el = document.getElementById('statNewVisitors'); if (el) el.textContent = newThisWeek;
    el = document.getElementById('statRepeatVisitors'); if (el) el.textContent = repeats;
    el = document.getElementById('statHotLeads'); if (el) el.textContent = hot;
}

function renderVisitorsTable(visitors) {
    var tbody = document.getElementById('visitorsTableBody');
    if (!tbody) return;

    if (!visitors.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">' +
            '<div style="font-size:40px;margin-bottom:12px;">🔍</div>' +
            '<div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:6px;">No identified visitors yet</div>' +
            '<div style="font-size:13px;color:#888;">Once RB2B is connected, visitors will appear here automatically</div>' +
        '</td></tr>';
        return;
    }

    tbody.innerHTML = visitors.map(function(v) {
        var name = [(v.first_name || ''), (v.last_name || '')].join(' ').trim() || 'Unknown';
        var initials = (v.first_name || '?')[0] + (v.last_name || '?')[0];
        var page = v.captured_url || v.last_captured_url || '—';
        // Clean the URL for display
        try { page = new URL(page).pathname || page; } catch(e) {}
        if (page.length > 35) page = page.substring(0, 35) + '…';

        var lastSeen = v.last_seen_at || v.seen_at;
        var timeAgo = lastSeen ? getTimeAgo(new Date(lastSeen)) : '—';

        var statusBadge = getVisitorStatusBadge(v.status || 'new');
        var visitBadge = (v.visit_count || 1) > 1
            ? '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">' + (v.visit_count || 1) + 'x</span>'
            : '<span style="color:#666;font-size:12px;">1</span>';

        return '<tr style="border-bottom:1px solid #222;cursor:pointer;" onclick="showVisitorDetail(\'' + v.id + '\')" onmouseover="this.style.background=\'#111\'" onmouseout="this.style.background=\'transparent\'">' +
            '<td style="padding:12px 16px;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:36px;height:36px;border-radius:50%;background:#e63946;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;">' + initials.toUpperCase() + '</div>' +
                    '<div>' +
                        '<div style="font-size:13px;font-weight:600;color:#fff;">' + name + '</div>' +
                        '<div style="font-size:11px;color:#888;">' + (v.title || '').substring(0, 40) + '</div>' +
                    '</div>' +
                '</div>' +
            '</td>' +
            '<td style="padding:12px 16px;font-size:13px;color:#ccc;">' + (v.company_name || '—') + '</td>' +
            '<td style="padding:12px 16px;font-size:12px;color:#888;font-family:monospace;">' + page + '</td>' +
            '<td style="padding:12px 16px;text-align:center;">' + visitBadge + '</td>' +
            '<td style="padding:12px 16px;font-size:12px;color:#888;">' + timeAgo + '</td>' +
            '<td style="padding:12px 16px;">' + statusBadge + '</td>' +
            '<td style="padding:12px 16px;">' +
                '<div style="display:flex;gap:6px;">' +
                    (v.linkedin_url ? '<a href="' + v.linkedin_url + '" target="_blank" onclick="event.stopPropagation()" style="background:#0a66c2;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:600;">LinkedIn</a>' : '') +
                    (v.business_email ? '<a href="mailto:' + v.business_email + '" onclick="event.stopPropagation()" style="background:#333;color:#fff;border:1px solid #444;padding:5px 10px;border-radius:6px;font-size:11px;text-decoration:none;">Email</a>' : '') +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function getVisitorStatusBadge(status) {
    var colors = {
        'new': { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '🟢 New' },
        'contacted': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: '📧 Contacted' },
        'qualified': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⭐ Qualified' },
        'converted': { bg: 'rgba(16,185,129,0.25)', color: '#10b981', label: '✅ Converted' },
        'dismissed': { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: '❌ Dismissed' }
    };
    var s = colors[status] || colors['new'];
    return '<span style="background:' + s.bg + ';color:' + s.color + ';padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap;">' + s.label + '</span>';
}

function getTimeAgo(date) {
    var now = new Date();
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString();
}

// ---- VISITOR DETAIL MODAL ----
function showVisitorDetail(id) {
    var v = (window._identifiedVisitors || []).find(function(x) { return x.id === id; });
    if (!v) return;

    var name = [(v.first_name || ''), (v.last_name || '')].join(' ').trim() || 'Unknown';
    var initials = (v.first_name || '?')[0] + (v.last_name || '?')[0];

    var modal = document.createElement('div');
    modal.id = 'visitorDetailModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    modal.innerHTML = '<div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;width:560px;max-height:85vh;overflow-y:auto;padding:28px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;">' +
            '<div style="display:flex;align-items:center;gap:14px;">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:#e63946;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;">' + initials.toUpperCase() + '</div>' +
                '<div>' +
                    '<h3 style="margin:0;font-size:20px;color:#fff;font-weight:700;">' + name + '</h3>' +
                    '<p style="margin:2px 0 0;font-size:13px;color:#888;">' + (v.title || 'No title') + '</p>' +
                '</div>' +
            '</div>' +
            '<button onclick="this.closest(\'#visitorDetailModal\').remove()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;">✕</button>' +
        '</div>' +

        // Info grid
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">' +
            buildInfoRow('Company', v.company_name) +
            buildInfoRow('Industry', v.industry) +
            buildInfoRow('Email', v.business_email, true) +
            buildInfoRow('Website', v.website, true) +
            buildInfoRow('Location', [v.city, v.state].filter(Boolean).join(', ')) +
            buildInfoRow('Employees', v.employee_count) +
            buildInfoRow('Revenue', v.estimated_revenue) +
            buildInfoRow('Visits', (v.visit_count || 1) + ' total') +
        '</div>' +

        // Page viewed
        '<div style="background:#111;border:1px solid #333;border-radius:10px;padding:14px;margin-bottom:16px;">' +
            '<div style="font-size:11px;color:#888;margin-bottom:6px;">PAGE VIEWED</div>' +
            '<div style="font-size:13px;color:#fff;word-break:break-all;">' + (v.captured_url || v.last_captured_url || '—') + '</div>' +
            (v.referrer || v.last_referrer ? '<div style="font-size:11px;color:#666;margin-top:6px;">Referred from: ' + (v.referrer || v.last_referrer) + '</div>' : '') +
        '</div>' +

        // LinkedIn
        (v.linkedin_url ? '<a href="' + v.linkedin_url + '" target="_blank" style="display:block;background:#0a66c2;color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:12px;">View LinkedIn Profile →</a>' : '') +

        // Tags
        (v.tags ? '<div style="margin-bottom:16px;"><span style="font-size:11px;color:#888;">Tags: </span>' + v.tags.split(',').map(function(t) { return '<span style="background:rgba(230,57,70,0.15);color:#e63946;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;margin-right:4px;">' + t.trim() + '</span>'; }).join('') + '</div>' : '') +

        // Status controls
        '<div style="border-top:1px solid #333;padding-top:16px;display:flex;gap:8px;flex-wrap:wrap;">' +
            '<span style="font-size:12px;color:#888;line-height:32px;margin-right:4px;">Set status:</span>' +
            buildStatusBtn(id, 'new', '🟢 New') +
            buildStatusBtn(id, 'contacted', '📧 Contacted') +
            buildStatusBtn(id, 'qualified', '⭐ Qualified') +
            buildStatusBtn(id, 'converted', '✅ Converted') +
            buildStatusBtn(id, 'dismissed', '❌ Dismiss') +
        '</div>' +

        // Add to contacts
        '<div style="border-top:1px solid #333;margin-top:16px;padding-top:16px;">' +
            '<button onclick="convertVisitorToLead(\'' + id + '\')" style="width:100%;background:#e63946;color:#fff;border:none;padding:12px;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;">Add to Contacts / Create Lead →</button>' +
        '</div>' +
    '</div>';

    document.body.appendChild(modal);
}

function buildInfoRow(label, value, isLink) {
    if (!value) return '<div style="background:#111;border-radius:8px;padding:10px 12px;"><div style="font-size:10px;color:#666;margin-bottom:2px;">' + label + '</div><div style="font-size:13px;color:#444;">—</div></div>';
    var display = isLink && value.includes('@') ? '<a href="mailto:' + value + '" style="color:#3b82f6;text-decoration:none;font-size:13px;">' + value + '</a>' :
                  isLink && value.includes('http') ? '<a href="' + value + '" target="_blank" style="color:#3b82f6;text-decoration:none;font-size:13px;">' + value + '</a>' :
                  '<div style="font-size:13px;color:#fff;">' + value + '</div>';
    return '<div style="background:#111;border-radius:8px;padding:10px 12px;"><div style="font-size:10px;color:#666;margin-bottom:2px;">' + label + '</div>' + display + '</div>';
}

function buildStatusBtn(id, status, label) {
    return '<button onclick="event.stopPropagation();updateVisitorStatus(\'' + id + '\',\'' + status + '\')" style="background:#222;border:1px solid #444;color:#ccc;padding:6px 14px;border-radius:8px;font-size:12px;cursor:pointer;">' + label + '</button>';
}

async function updateVisitorStatus(id, status) {
    if (typeof db === 'undefined' || !db) return;
    try {
        await db.from('identified_visitors').update({ status: status, updated_at: new Date().toISOString() }).eq('id', id);
        var modal = document.getElementById('visitorDetailModal');
        if (modal) modal.remove();
        loadVisitorsFromSupabase();
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

async function convertVisitorToLead(id) {
    var v = (window._identifiedVisitors || []).find(function(x) { return x.id === id; });
    if (!v) return;
    var name = [(v.first_name || ''), (v.last_name || '')].join(' ').trim();

    try {
        // Add to contacts table
        if (typeof db !== 'undefined' && db) {
            await db.from('contacts').insert({
                name: name,
                email: v.business_email || '',
                phone: '',
                company: v.company_name || '',
                source: 'RB2B - Website Visitor',
                notes: 'Auto-identified visitor. Title: ' + (v.title || 'N/A') + '. Industry: ' + (v.industry || 'N/A') + '. LinkedIn: ' + (v.linkedin_url || 'N/A') + '. Page viewed: ' + (v.captured_url || v.last_captured_url || 'N/A'),
                status: 'lead',
                created_at: new Date().toISOString()
            });
            // Update visitor status
            await db.from('identified_visitors').update({ status: 'qualified', updated_at: new Date().toISOString() }).eq('id', id);
        }
        alert('✅ ' + name + ' added to Contacts as a new lead!');
        var modal = document.getElementById('visitorDetailModal');
        if (modal) modal.remove();
        loadVisitorsFromSupabase();
    } catch (err) {
        console.error('Error converting visitor:', err);
        alert('Error: ' + err.message);
    }
}

// ---- EXPORT CSV ----
function exportVisitorsCSV() {
    var visitors = window._identifiedVisitors || [];
    if (!visitors.length) return alert('No visitors to export');
    var headers = ['First Name','Last Name','Email','Company','Title','Industry','LinkedIn','Page Viewed','Visits','Last Seen','Status'];
    var rows = visitors.map(function(v) {
        return [v.first_name, v.last_name, v.business_email, v.company_name, v.title, v.industry, v.linkedin_url, v.captured_url || v.last_captured_url, v.visit_count, v.last_seen_at || v.seen_at, v.status].map(function(val) {
            return '"' + (val || '').toString().replace(/"/g, '""') + '"';
        }).join(',');
    });
    var csv = headers.join(',') + '\n' + rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nui-identified-visitors-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
}

console.log('✅ admin-visitors.js loaded');
