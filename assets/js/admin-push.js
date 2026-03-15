// ==================== PUSH NOTIFICATIONS ADMIN PANEL ====================
// Subscribers list, platform breakdown, interest filters, send campaign

async function loadAdminPushPanel() {
    const panel = document.getElementById('adminPushPanel');
    if (!panel) return;
    panel.innerHTML = `<div style="padding:60px;text-align:center;color:rgba(255,255,255,0.4);font-size:14px;">🔔 Loading push notification data...</div>`;

    // Fetch from Supabase via service key (anon key blocked by RLS)
    let subs = [], campaigns = [];
    try {
        const KEY = window.SUPABASE_URL && window.SUPABASE_ANON_KEY ? window.SUPABASE_ANON_KEY : null;
        const BASE = window.SUPABASE_URL ? window.SUPABASE_URL + '/rest/v1' : null;

        if (KEY && BASE) {
            // Use service role key stored in window if available, else fall back to anon
            const authKey = window._nuiServiceKey || KEY;
            const h = { 'apikey': authKey, 'Authorization': `Bearer ${authKey}` };

            const [sResp, cResp] = await Promise.all([
                fetch(`${BASE}/push_subscriptions?select=id,platform,interests,active,created_at&order=created_at.desc`, { headers: h }),
                fetch(`${BASE}/push_campaigns?select=*&order=sent_at.desc&limit=20`, { headers: h })
            ]);
            if (sResp.ok) { const d = await sResp.json(); if (Array.isArray(d)) subs = d; }
            if (cResp.ok) { const d = await cResp.json(); if (Array.isArray(d)) campaigns = d; }
        }
    } catch(e) { console.warn('Push data fetch failed:', e.message); }

    const total = subs.length;
    const active = subs.filter(s => s.active !== false).length;
    const byPlatform = {};
    subs.forEach(s => {
        const p = s.platform || 'unknown';
        byPlatform[p] = (byPlatform[p] || 0) + 1;
    });
    const byInterest = {};
    subs.forEach(s => {
        (s.interests || []).forEach(i => { byInterest[i] = (byInterest[i] || 0) + 1; });
    });

    panel.innerHTML = `
<div class="flex-between mb-32">
    <h2 class="fs-28 fw-700">🔔 Push Notifications</h2>
    <button onclick="_pushOpenSendModal()" class="btn-cta">+ Send Campaign</button>
</div>

<!-- Stat Cards -->
<div class="stat-cards" style="grid-template-columns:repeat(4,1fr);margin-bottom:32px;">
    <div class="stat-card" style="border-color:#3b82f6;">
        <div class="num" style="color:#3b82f6;">${total}</div>
        <div class="lbl">Total Subscribers</div>
    </div>
    <div class="stat-card" style="border-color:#10b981;">
        <div class="num" style="color:#10b981;">${active}</div>
        <div class="lbl">Active</div>
    </div>
    <div class="stat-card" style="border-color:#f59e0b;">
        <div class="num" style="color:#f59e0b;">${total - active}</div>
        <div class="lbl">Inactive</div>
    </div>
    <div class="stat-card" style="border-color:#8b5cf6;">
        <div class="num" style="color:#8b5cf6;">${campaigns.length}</div>
        <div class="lbl">Campaigns Sent</div>
    </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
    <!-- Platform Breakdown -->
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:24px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--admin-text);margin-bottom:20px;">📱 By Platform</h3>
        ${Object.keys(byPlatform).length === 0 ? '<p style="color:var(--admin-text-muted);font-size:13px;">No subscribers yet</p>' :
        Object.entries(byPlatform).sort((a,b) => b[1]-a[1]).map(([p, n]) => {
            const pct = total > 0 ? Math.round(n/total*100) : 0;
            const colors = { ios:'#3b82f6', android:'#10b981', mac:'#8b5cf6', windows:'#f59e0b', other:'#888' };
            const col = colors[p] || '#888';
            return `<div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                    <span style="color:var(--admin-text);text-transform:capitalize;">${p}</span>
                    <span style="color:${col};font-weight:600;">${n} (${pct}%)</span>
                </div>
                <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${col};border-radius:4px;transition:width 0.5s;"></div>
                </div>
            </div>`;
        }).join('')}
    </div>

    <!-- Interest Tags -->
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:24px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--admin-text);margin-bottom:20px;">🎯 By Interest</h3>
        ${Object.keys(byInterest).length === 0 ?
            '<p style="color:var(--admin-text-muted);font-size:13px;">No interest data yet — interests are captured from the page hash when subscribers opt in.</p>' :
        Object.entries(byInterest).sort((a,b) => b[1]-a[1]).map(([i, n]) => `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.2);border-radius:20px;margin:4px;font-size:12px;color:#f87171;">
                ${i} <span style="background:rgba(220,38,38,0.2);padding:1px 6px;border-radius:10px;font-weight:700;">${n}</span>
            </div>
        `).join('')}
    </div>
</div>

<!-- Subscribers Table -->
<div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:24px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--admin-text);">Subscribers (${total})</h3>
        <button onclick="_pushExportCSV()" style="padding:8px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);border-radius:8px;cursor:pointer;font-size:12px;">Export CSV</button>
    </div>
    ${total === 0 ?
        `<div style="text-align:center;padding:40px;color:var(--admin-text-muted);">
            <div style="font-size:48px;margin-bottom:12px;">🔔</div>
            <p style="margin-bottom:8px;">No subscribers yet</p>
            <p style="font-size:12px;">The opt-in prompt shows to site visitors after 15 seconds. Once someone opts in, they appear here.</p>
        </div>` :
        `<div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="border-bottom:1px solid var(--admin-border);">
                <th style="text-align:left;padding:10px 12px;color:var(--admin-text-muted);font-weight:500;">Platform</th>
                <th style="text-align:left;padding:10px 12px;color:var(--admin-text-muted);font-weight:500;">Interests</th>
                <th style="text-align:left;padding:10px 12px;color:var(--admin-text-muted);font-weight:500;">Status</th>
                <th style="text-align:left;padding:10px 12px;color:var(--admin-text-muted);font-weight:500;">Subscribed</th>
                <th style="text-align:left;padding:10px 12px;color:var(--admin-text-muted);font-weight:500;"></th>
            </tr></thead>
            <tbody>
            ${subs.map(s => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                    <td style="padding:12px;color:var(--admin-text);text-transform:capitalize;">${s.platform || 'unknown'}</td>
                    <td style="padding:12px;">${(s.interests||[]).length > 0 ? s.interests.map(i=>`<span style="font-size:10px;padding:2px 8px;background:rgba(220,38,38,0.12);color:#f87171;border-radius:10px;margin-right:4px;">${i}</span>`).join('') : '<span style="color:rgba(255,255,255,0.25);font-size:12px;">none</span>'}</td>
                    <td style="padding:12px;"><span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;background:${s.active!==false?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)'};color:${s.active!==false?'#10b981':'#ef4444'};">${s.active!==false?'Active':'Inactive'}</span></td>
                    <td style="padding:12px;color:var(--admin-text-muted);">${s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                    <td style="padding:12px;"><button onclick="_pushRemoveSub('${s.id}')" style="padding:4px 10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:6px;cursor:pointer;font-size:11px;">Remove</button></td>
                </tr>
            `).join('')}
            </tbody>
        </table></div>`}
</div>

<!-- Campaign History -->
<div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:24px;">
    <h3 style="font-size:15px;font-weight:700;color:var(--admin-text);margin-bottom:20px;">📋 Campaign History</h3>
    ${campaigns.length === 0 ?
        `<div style="text-align:center;padding:40px;color:var(--admin-text-muted);">
            <p>No campaigns sent yet.</p>
            <button onclick="_pushOpenSendModal()" class="btn-cta" style="margin-top:16px;">Send Your First Campaign</button>
        </div>` :
        campaigns.map(c => `
            <div style="border:1px solid var(--admin-border);border-radius:12px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div>
                        <div style="font-weight:600;color:var(--admin-text);margin-bottom:4px;">${c.title}</div>
                        <div style="color:var(--admin-text-muted);font-size:13px;">${c.body||''}</div>
                        ${c.url ? `<div style="font-size:11px;color:#60a5fa;margin-top:4px;">${c.url}</div>` : ''}
                    </div>
                    <div style="text-align:right;flex-shrink:0;margin-left:16px;">
                        <div style="font-size:11px;color:var(--admin-text-muted);">${c.sent_at ? new Date(c.sent_at).toLocaleDateString() : ''}</div>
                        <div style="font-size:20px;font-weight:700;color:#10b981;margin-top:4px;">${c.sent_count||0}</div>
                        <div style="font-size:10px;color:var(--admin-text-muted);">sent</div>
                    </div>
                </div>
                <div style="display:flex;gap:16px;margin-top:12px;padding-top:12px;border-top:1px solid var(--admin-border);">
                    <span style="font-size:12px;color:var(--admin-text-muted);">Target: ${c.interest_filter||'All'} · Platform: ${c.platform_filter||'all'} · Failed: ${c.failed_count||0}</span>
                </div>
            </div>
        `).join('')}
</div>

<!-- Send Campaign Modal -->
<div id="pushSendModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;max-width:520px;width:90%;">
        <h3 style="font-size:20px;font-weight:700;margin-bottom:20px;">🔔 Send Push Notification</h3>
        <div style="margin-bottom:16px;">
            <label style="display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:6px;">Title *</label>
            <input id="pushTitle" type="text" placeholder="New Brand Tips Just Dropped 🔥" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:16px;">
            <label style="display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:6px;">Message *</label>
            <textarea id="pushBody" placeholder="Check out our latest branding tips for Detroit businesses..." style="width:100%;min-height:80px;padding:12px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
        </div>
        <div style="margin-bottom:16px;">
            <label style="display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:6px;">Link URL (optional)</label>
            <input id="pushUrl" type="url" placeholder="https://newurbaninfluence.com" style="width:100%;padding:12px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
            <div>
                <label style="display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:6px;">Filter by Interest</label>
                <select id="pushInterest" style="width:100%;padding:10px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-size:13px;">
                    <option value="">All Subscribers</option>
                    ${Object.keys(byInterest).map(i => `<option value="${i}">${i} (${byInterest[i]})</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:6px;">Filter by Platform</label>
                <select id="pushPlatform" style="width:100%;padding:10px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-size:13px;">
                    <option value="all">All Platforms</option>
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                    <option value="mac">Mac</option>
                    <option value="windows">Windows</option>
                </select>
            </div>
        </div>
        <div style="display:flex;gap:12px;">
            <button onclick="document.getElementById('pushSendModal').style.display='none'" style="flex:1;padding:14px;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:8px;cursor:pointer;font-weight:600;">Cancel</button>
            <button onclick="_pushSendCampaign()" style="flex:2;padding:14px;background:#dc2626;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:700;">🚀 Send Now</button>
        </div>
    </div>
</div>
    `;

    // Store subs in window for export
    window._pushSubs = subs;
}

function _pushOpenSendModal() {
    document.getElementById('pushSendModal').style.display = 'flex';
}

async function _pushSendCampaign() {
    const title = document.getElementById('pushTitle')?.value?.trim();
    const body = document.getElementById('pushBody')?.value?.trim();
    const url = document.getElementById('pushUrl')?.value?.trim();
    const interest = document.getElementById('pushInterest')?.value;
    const platform = document.getElementById('pushPlatform')?.value;

    if (!title || !body) { alert('Title and message are required.'); return; }

    const btn = document.querySelector('#pushSendModal button:last-child');
    if (btn) { btn.textContent = '⏳ Sending...'; btn.disabled = true; }

    try {
        const resp = await fetch('/.netlify/functions/push-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body, url: url || null, interest_filter: interest || null, platform_filter: platform || 'all' })
        });
        const data = await resp.json();
        document.getElementById('pushSendModal').style.display = 'none';
        if (data.success) {
            alert(`✅ Campaign sent to ${data.sent || 0} subscribers!`);
        } else {
            alert('Send failed: ' + (data.error || 'Unknown error'));
        }
        loadAdminPushPanel();
    } catch(e) {
        alert('Error: ' + e.message);
        if (btn) { btn.textContent = '🚀 Send Now'; btn.disabled = false; }
    }
}

async function _pushRemoveSub(id) {
    if (!confirm('Remove this subscriber?')) return;
    try {
        const KEY = window.SUPABASE_ANON_KEY;
        const BASE = window.SUPABASE_URL + '/rest/v1';
        await fetch(`${BASE}/push_subscriptions?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        loadAdminPushPanel();
    } catch(e) { alert('Error removing subscriber: ' + e.message); }
}

function _pushExportCSV() {
    const subs = window._pushSubs || [];
    if (!subs.length) { alert('No subscribers to export.'); return; }
    const rows = [['Platform','Interests','Status','Subscribed']];
    subs.forEach(s => rows.push([
        s.platform || 'unknown',
        (s.interests || []).join('; '),
        s.active !== false ? 'Active' : 'Inactive',
        s.created_at ? new Date(s.created_at).toLocaleDateString() : ''
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'push-subscribers.csv';
    a.click();
}
