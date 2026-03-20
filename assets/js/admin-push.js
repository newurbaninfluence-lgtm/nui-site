// ==================== PUSH NOTIFICATIONS ADMIN PANEL ====================
// Campaign library + subscriber stats + send modal

// ── Campaign Library ──────────────────────────────────────────────────────────
const PUSH_CAMPAIGNS = [
  // ── LEAD GENERATION ──────────────────────────────────────────────────────
  {
    category: 'Lead Generation',
    color: '#dc2626',
    campaigns: [
      {
        id: 'free_strategy_call',
        name: '📅 Free Strategy Call',
        title: "Your brand deserves better 🔥",
        body: "Book a FREE 15-min strategy call with NUI. We'll map out exactly what your business needs to stand out.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 'lead-gen'
      },
      {
        id: 'limited_spots',
        name: '⚡ Limited Spots This Month',
        title: "Only 3 project spots left this month",
        body: "We keep our client list tight so every brand gets our full attention. Secure yours before we close.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 'urgency'
      },
      {
        id: 'pricing_visitor',
        name: '💰 Pricing Page Follow-Up',
        title: "Saw you checking our pricing 👀",
        body: "Questions? We have payment plans starting at $375/mo. Let's talk about what fits your budget.",
        url: 'https://newurbaninfluence.com/book',
        interest: 'pricing',
        tag: 'pricing-followup'
      },
      {
        id: 'portfolio_visitor',
        name: '🎨 Portfolio Visitor Follow-Up',
        title: "Like what you saw?",
        body: "Your brand could be next. NUI builds identities that make you the most credible option in the room.",
        url: 'https://newurbaninfluence.com/book',
        interest: 'portfolio',
        tag: 'portfolio-followup'
      }
    ]
  },
  // ── BRAND SERVICES ────────────────────────────────────────────────────────
  {
    category: 'Brand Services',
    color: '#8b5cf6',
    campaigns: [
      {
        id: 'brand_kit_promo',
        name: '🎨 Brand Kit Push',
        title: "No logo? No problem. We got you. 💪",
        body: "NUI Brand Kit — Logo, colors, fonts, social templates, brand guide. Everything you need. $1,500.",
        url: 'https://newurbaninfluence.com/#services',
        interest: 'branding',
        tag: 'brand-kit'
      },
      {
        id: 'rebrand_push',
        name: '🔄 Rebrand Offer',
        title: "Is your brand holding you back?",
        body: "Outdated logo. Inconsistent colors. No brand guide. We fix all of it — starting at $1,500.",
        url: 'https://newurbaninfluence.com/book',
        interest: 'branding',
        tag: 'rebrand'
      },
      {
        id: 'website_push',
        name: '🌐 Website Services',
        title: "Your website should be working 24/7",
        body: "Business sites from $3,500. Custom, fast, SEO-ready. We build it. You close deals.",
        url: 'https://newurbaninfluence.com/#services',
        interest: 'website',
        tag: 'website'
      }
    ]
  },
  // ── MARKETING TECH ────────────────────────────────────────────────────────
  {
    category: 'Marketing Tech',
    color: '#10b981',
    campaigns: [
      {
        id: 'visitor_id_push',
        name: '👁️ Silent Visitor ID',
        title: "Who's visiting your website right now?",
        body: "NUI's Visitor ID reveals names, emails & companies of anonymous visitors. Stop letting leads disappear.",
        url: 'https://newurbaninfluence.com/#services',
        interest: 'ai_systems',
        tag: 'visitor-id'
      },
      {
        id: 'sms_automation',
        name: '💬 SMS Automation',
        title: "98% open rate. No spam filter. Just results.",
        body: "NUI SMS automation keeps leads warm automatically. 2-way texting, drip sequences, booking reminders.",
        url: 'https://newurbaninfluence.com/#services',
        interest: 'ai_systems',
        tag: 'sms-auto'
      },
      {
        id: 'brand_ready_bundle',
        name: '📦 Brand Ready Bundle',
        title: "Full digital stack for $497/mo",
        body: "Visitor ID + Email Automation + CRM — everything a growing business needs to capture and close leads.",
        url: 'https://newurbaninfluence.com/#services',
        interest: null,
        tag: 'bundle'
      },
      {
        id: 'geo_fencing',
        name: '📍 Geo-Fencing Push',
        title: "Steal customers from your competitors 😈",
        body: "We fence their location. Your ads follow their customers for 30 days. Ask about Geo-Fencing.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 'geo'
      }
    ]
  },
  // ── RE-ENGAGEMENT ─────────────────────────────────────────────────────────
  {
    category: 'Re-Engagement',
    color: '#f59e0b',
    campaigns: [
      {
        id: 'been_a_while',
        name: '👋 Been a While Check-In',
        title: "Still thinking about it?",
        body: "No pressure — just wanted to check in. We're still here when you're ready to level up your brand.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 're-engage'
      },
      {
        id: 'new_work_drop',
        name: '🆕 New Work Drop',
        title: "Fresh work just dropped 🔥",
        body: "Check out our latest client projects. Real Detroit businesses. Real results.",
        url: 'https://newurbaninfluence.com/#portfolio',
        interest: null,
        tag: 'new-work'
      },
      {
        id: 'magazine_feature',
        name: '📰 Magazine Feature Alert',
        title: "New feature just published",
        body: "NUI Magazine just dropped a new Detroit business feature. See who made it in.",
        url: 'https://newurbaninfluence.com/magazine',
        interest: null,
        tag: 'magazine'
      }
    ]
  },
  // ── SEASONAL / EVENTS ─────────────────────────────────────────────────────
  {
    category: 'Seasonal',
    color: '#3b82f6',
    campaigns: [
      {
        id: 'new_year_brand',
        name: '🎊 New Year Brand Push',
        title: "New year. New brand. Let's build it.",
        body: "Stop carrying that outdated brand into another year. January slots are filling fast.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 'seasonal-new-year'
      },
      {
        id: 'black_friday',
        name: '🛒 Black Friday / Holiday',
        title: "Holiday brand deal — limited time 🎁",
        body: "Lock in your 2025 brand project now before prices go up. Strategy call is free.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 'seasonal-holiday'
      },
      {
        id: 'summer_push',
        name: '☀️ Summer Business Push',
        title: "Summer = busy season. Are you ready?",
        body: "Don't get caught scrambling when traffic spikes. Get your brand and site locked in now.",
        url: 'https://newurbaninfluence.com/book',
        interest: null,
        tag: 'seasonal-summer'
      },
      {
        id: 'built_heavy_podcast',
        name: '🎙️ Built Heavy Podcast',
        title: "New episode just dropped 🎙️",
        body: "Built Heavy with Faren Young — stories of businesses built under pressure. Listen now.",
        url: 'https://newurbaninfluence.com/magazine',
        interest: null,
        tag: 'podcast'
      }
    ]
  },
  // ── SOCIAL PROOF ──────────────────────────────────────────────────────────
  {
    category: 'Social Proof',
    color: '#ec4899',
    campaigns: [
      {
        id: 'client_win',
        name: '🏆 Client Win',
        title: "Another brand launched 🚀",
        body: "We just delivered a full brand identity for a Detroit business. See the work — could be next.",
        url: 'https://newurbaninfluence.com/#portfolio',
        interest: null,
        tag: 'social-proof'
      },
      {
        id: 'testimonial_push',
        name: '⭐ Testimonial Drop',
        title: "\"Best investment we've made\" ⭐⭐⭐⭐⭐",
        body: "Real words from a real Detroit client. See what NUI has done for local businesses like yours.",
        url: 'https://newurbaninfluence.com/#portfolio',
        interest: null,
        tag: 'testimonial'
      }
    ]
  }
];

// ── Admin Panel Loader ────────────────────────────────────────────────────────
async function loadAdminPushPanel() {
    const panel = document.getElementById('adminPushPanel');
    if (!panel) return;
    panel.innerHTML = `<div style="padding:60px;text-align:center;color:rgba(255,255,255,0.4);font-size:14px;">🔔 Loading push data...</div>`;

    let subs = [], campaigns = [];
    try {
        const authKey = window._nuiServiceKey || window.SUPABASE_ANON_KEY;
        const BASE = window.SUPABASE_URL ? window.SUPABASE_URL + '/rest/v1' : null;
        if (authKey && BASE) {
            const h = { 'apikey': authKey, 'Authorization': `Bearer ${authKey}` };
            const [sR, cR] = await Promise.all([
                fetch(`${BASE}/push_subscriptions?select=id,platform,interests,active,created_at&order=created_at.desc`, { headers: h }),
                fetch(`${BASE}/push_campaigns?select=*&order=sent_at.desc&limit=30`, { headers: h })
            ]);
            if (sR.ok) { const d = await sR.json(); if (Array.isArray(d)) subs = d; }
            if (cR.ok) { const d = await cR.json(); if (Array.isArray(d)) campaigns = d; }
        }
    } catch(e) { console.warn('Push fetch failed:', e.message); }

    const total  = subs.length;
    const active = subs.filter(s => s.active !== false).length;
    const byPlatform = {}, byInterest = {};
    subs.forEach(s => {
        const p = s.platform || 'unknown';
        byPlatform[p] = (byPlatform[p] || 0) + 1;
        (s.interests || []).forEach(i => { byInterest[i] = (byInterest[i] || 0) + 1; });
    });

    panel.innerHTML = `
<div class="flex-between mb-32">
    <div>
        <h2 class="fs-28 fw-700">🔔 Push Notifications</h2>
        <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:4px;">Send campaigns directly to subscribers' phones and desktops</p>
    </div>
    <button onclick="_pushOpenSendModal()" class="btn-cta">+ Send Campaign</button>
</div>

<!-- Stats -->
<div class="stat-cards" style="grid-template-columns:repeat(4,1fr);margin-bottom:32px;">
    <div class="stat-card" style="border-color:#3b82f6;"><div class="num" style="color:#3b82f6;">${total}</div><div class="lbl">Total Subscribers</div></div>
    <div class="stat-card" style="border-color:#10b981;"><div class="num" style="color:#10b981;">${active}</div><div class="lbl">Active</div></div>
    <div class="stat-card" style="border-color:#dc2626;"><div class="num" style="color:#dc2626;">${campaigns.length}</div><div class="lbl">Campaigns Sent</div></div>
    <div class="stat-card" style="border-color:#8b5cf6;"><div class="num" style="color:#8b5cf6;">${campaigns.reduce((s,c)=>s+(c.sent_count||0),0)}</div><div class="lbl">Total Delivered</div></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
    <!-- Platform Breakdown -->
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:24px;">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">📱 Subscribers by Platform</h3>
        ${Object.keys(byPlatform).length === 0
            ? '<p style="color:rgba(255,255,255,0.3);font-size:13px;">No subscribers yet — share your site to start building</p>'
            : Object.entries(byPlatform).sort((a,b)=>b[1]-a[1]).map(([p,n]) => {
                const pct = total > 0 ? Math.round(n/total*100) : 0;
                const col = {ios:'#3b82f6',android:'#10b981',mac:'#8b5cf6',windows:'#f59e0b'}[p]||'#888';
                return `<div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                        <span style="text-transform:capitalize;">${p}</span>
                        <span style="color:${col};font-weight:700;">${n} (${pct}%)</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:4px;">
                        <div style="width:${pct}%;background:${col};height:4px;border-radius:4px;"></div>
                    </div>
                </div>`;
            }).join('')}
    </div>
    <!-- Interest Tags -->
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:24px;">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">🎯 Interest Tags</h3>
        ${Object.keys(byInterest).length === 0
            ? '<p style="color:rgba(255,255,255,0.3);font-size:13px;">No interest data yet</p>'
            : `<div style="display:flex;flex-wrap:wrap;gap:8px;">${Object.entries(byInterest).sort((a,b)=>b[1]-a[1]).map(([tag,n]) =>
                `<span style="padding:5px 12px;background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);border-radius:100px;font-size:12px;font-weight:600;">
                    ${tag} <span style="color:#dc2626;">(${n})</span>
                </span>`).join('')}</div>`}
    </div>
</div>

<!-- Campaign Library -->
<div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:28px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="font-size:16px;font-weight:700;">📋 Campaign Library</h3>
        <span style="font-size:12px;color:rgba(255,255,255,0.4);">Pre-built campaigns ready to send</span>
    </div>
    ${PUSH_CAMPAIGNS.map(cat => `
    <div style="margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <span style="width:10px;height:10px;background:${cat.color};border-radius:50%;display:inline-block;"></span>
            <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${cat.color};">${cat.category}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
            ${cat.campaigns.map(c => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;cursor:pointer;transition:all 0.15s;"
                onmouseover="this.style.borderColor='${cat.color}50';this.style.background='rgba(255,255,255,0.05)'"
                onmouseout="this.style.borderColor='rgba(255,255,255,0.08)';this.style.background='rgba(255,255,255,0.03)'"
                onclick="_pushOpenSendModal('${c.id}')">
                <div style="font-size:13px;font-weight:700;margin-bottom:6px;">${c.name}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;font-style:italic;">"${c.title}"</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.35);">${c.body.slice(0,65)}...</div>
                ${c.interest ? `<span style="display:inline-block;margin-top:6px;padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:4px;font-size:10px;color:rgba(255,255,255,0.4);">🎯 ${c.interest} only</span>` : ''}
            </div>`).join('')}
        </div>
    </div>`).join('')}
</div>

<!-- Campaign History -->
<div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:16px;padding:28px;">
    <h3 style="font-size:16px;font-weight:700;margin-bottom:20px;">📊 Campaign History</h3>
    ${campaigns.length === 0
        ? '<p style="color:rgba(255,255,255,0.3);font-size:13px;text-align:center;padding:30px 0;">No campaigns sent yet. Send your first one above ↑</p>'
        : `<table style="width:100%;border-collapse:collapse;">
            <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="text-align:left;padding:10px 12px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Title</th>
                <th style="text-align:left;padding:10px 12px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Sent</th>
                <th style="text-align:center;padding:10px 12px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Delivered</th>
                <th style="text-align:center;padding:10px 12px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Failed</th>
                <th style="text-align:center;padding:10px 12px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Target</th>
            </tr></thead>
            <tbody>${campaigns.map(c => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:12px;font-size:13px;font-weight:600;">${c.title || '—'}</td>
                <td style="padding:12px;font-size:12px;color:rgba(255,255,255,0.4);">${c.sent_at ? new Date(c.sent_at).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                <td style="padding:12px;text-align:center;font-size:13px;color:#10b981;font-weight:700;">${c.sent_count || 0}</td>
                <td style="padding:12px;text-align:center;font-size:13px;color:${c.failed_count > 0 ? '#ef4444' : 'rgba(255,255,255,0.3)'};">${c.failed_count || 0}</td>
                <td style="padding:12px;text-align:center;font-size:11px;color:rgba(255,255,255,0.4);">${c.interest_filter || c.platform_filter || 'All'}</td>
            </tr>`).join('')}
            </tbody></table>`}
</div>`;
}

// ── Send Campaign Modal ───────────────────────────────────────────────────────
function _pushOpenSendModal(campaignId) {
    // Find the campaign if an ID was passed
    let preset = null;
    if (campaignId) {
        for (const cat of PUSH_CAMPAIGNS) {
            const found = cat.campaigns.find(c => c.id === campaignId);
            if (found) { preset = found; break; }
        }
    }

    // Build template options grouped by category
    const templateOptions = PUSH_CAMPAIGNS.map(cat =>
        `<optgroup label="${cat.category}">${cat.campaigns.map(c =>
            `<option value="${c.id}" ${preset && preset.id === c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('')}</optgroup>`
    ).join('');

    const modal = document.createElement('div');
    modal.id = 'pushSendModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
    modal.innerHTML = `
<div style="background:#141414;border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:32px;width:560px;max-width:100%;max-height:90vh;overflow-y:auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h3 style="font-size:20px;font-weight:800;">🔔 Send Push Campaign</h3>
        <button onclick="document.getElementById('pushSendModal').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:24px;cursor:pointer;line-height:1;">✕</button>
    </div>

    <!-- Load Template -->
    <div style="margin-bottom:20px;padding:16px;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.2);border-radius:10px;">
        <label style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px;">⚡ Load Pre-Built Campaign</label>
        <select id="pushTemplateSelect" onchange="_pushLoadTemplate(this.value)" style="width:100%;padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;font-family:inherit;">
            <option value="">— Select a template —</option>
            ${templateOptions}
        </select>
    </div>

    <!-- Title -->
    <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Notification Title *</label>
        <input id="pushTitle" type="text" maxlength="65" placeholder="Your brand deserves better 🔥"
            style="width:100%;padding:12px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;font-family:inherit;outline:none;"
            value="${preset ? preset.title : ''}" oninput="_pushUpdatePreview()">
        <div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;" id="pushTitleCount">0/65</div>
    </div>

    <!-- Body -->
    <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Message Body *</label>
        <textarea id="pushBody" maxlength="120" rows="3" placeholder="Your message here..."
            style="width:100%;padding:12px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;font-family:inherit;resize:none;outline:none;" oninput="_pushUpdatePreview()">${preset ? preset.body : ''}</textarea>
        <div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;" id="pushBodyCount">0/120</div>
    </div>

    <!-- URL -->
    <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Tap Destination URL</label>
        <select id="pushUrlSelect" onchange="_pushUpdateUrlFromSelect(this.value)" style="width:100%;padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;font-family:inherit;margin-bottom:8px;">
            <option value="https://newurbaninfluence.com/book">📅 Book a Strategy Call</option>
            <option value="https://newurbaninfluence.com/#services">🛠️ Services Page</option>
            <option value="https://newurbaninfluence.com/#portfolio">🎨 Portfolio</option>
            <option value="https://newurbaninfluence.com/magazine">📰 NUI Magazine</option>
            <option value="https://newurbaninfluence.com">🏠 Homepage</option>
            <option value="custom">✏️ Custom URL...</option>
        </select>
        <input id="pushUrl" type="url" placeholder="https://newurbaninfluence.com/book"
            style="width:100%;padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;font-family:inherit;outline:none;"
            value="${preset ? preset.url : 'https://newurbaninfluence.com/book'}">
    </div>

    <!-- Targeting -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div>
            <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Platform</label>
            <select id="pushPlatform" style="width:100%;padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;font-family:inherit;">
                <option value="all">📱 All Platforms</option>
                <option value="ios">🍎 iOS Only</option>
                <option value="android">🤖 Android Only</option>
                <option value="mac">💻 Mac Only</option>
                <option value="windows">🖥️ Windows Only</option>
            </select>
        </div>
        <div>
            <label style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Interest Filter</label>
            <select id="pushInterest" style="width:100%;padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;font-family:inherit;">
                <option value="">🎯 All Subscribers</option>
                <option value="branding" ${preset && preset.interest === 'branding' ? 'selected' : ''}>Branding Interest</option>
                <option value="website" ${preset && preset.interest === 'website' ? 'selected' : ''}>Website Interest</option>
                <option value="pricing" ${preset && preset.interest === 'pricing' ? 'selected' : ''}>Viewed Pricing</option>
                <option value="portfolio" ${preset && preset.interest === 'portfolio' ? 'selected' : ''}>Viewed Portfolio</option>
                <option value="ai_systems" ${preset && preset.interest === 'ai_systems' ? 'selected' : ''}>AI Systems Interest</option>
                <option value="hot_lead">🔥 Hot Leads Only</option>
            </select>
        </div>
    </div>

    <!-- Live Preview -->
    <div style="margin-bottom:20px;padding:16px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">📲 Live Preview</div>
        <div style="background:#1c1c1c;border-radius:10px;padding:14px;display:flex;gap:12px;align-items:flex-start;">
            <img src="/icons/icon-72.png" onerror="this.style.display='none'" style="width:40px;height:40px;border-radius:8px;flex-shrink:0;">
            <div>
                <div id="previewTitle" style="font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;">Your notification title</div>
                <div id="previewBody" style="font-size:12px;color:rgba(255,255,255,0.55);line-height:1.4;">Your notification body text</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;">newurbaninfluence.com · Now</div>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:10px;">
        <button onclick="document.getElementById('pushSendModal').remove()" style="flex:1;padding:13px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>
        <button id="pushSendBtn" onclick="_pushSendNow()" style="flex:2;padding:13px;background:#dc2626;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">🔔 Send Now</button>
    </div>
</div>`;

    document.body.appendChild(modal);
    _pushUpdatePreview();

    // Set URL select to match preset
    if (preset && preset.url) {
        const sel = document.getElementById('pushUrlSelect');
        const opt = Array.from(sel.options).find(o => o.value === preset.url);
        if (opt) sel.value = preset.url;
        else { sel.value = 'custom'; }
    }
}

function _pushUpdateUrlFromSelect(val) {
    if (val !== 'custom') document.getElementById('pushUrl').value = val;
}

function _pushLoadTemplate(id) {
    if (!id) return;
    let preset = null;
    for (const cat of PUSH_CAMPAIGNS) {
        const found = cat.campaigns.find(c => c.id === id);
        if (found) { preset = found; break; }
    }
    if (!preset) return;
    document.getElementById('pushTitle').value = preset.title;
    document.getElementById('pushBody').value = preset.body;
    document.getElementById('pushUrl').value = preset.url;
    if (preset.interest) document.getElementById('pushInterest').value = preset.interest;
    const sel = document.getElementById('pushUrlSelect');
    const opt = Array.from(sel.options).find(o => o.value === preset.url);
    sel.value = opt ? preset.url : 'custom';
    _pushUpdatePreview();
}

function _pushUpdatePreview() {
    const t = document.getElementById('pushTitle');
    const b = document.getElementById('pushBody');
    const tc = document.getElementById('pushTitleCount');
    const bc = document.getElementById('pushBodyCount');
    if (t && tc) { tc.textContent = `${t.value.length}/65`; tc.style.color = t.value.length > 55 ? '#f59e0b' : 'rgba(255,255,255,0.25)'; }
    if (b && bc) { bc.textContent = `${b.value.length}/120`; bc.style.color = b.value.length > 100 ? '#f59e0b' : 'rgba(255,255,255,0.25)'; }
    const pt = document.getElementById('previewTitle');
    const pb = document.getElementById('previewBody');
    if (pt) pt.textContent = t?.value || 'Your notification title';
    if (pb) pb.textContent = b?.value || 'Your notification body text';
}

async function _pushSendNow() {
    const title    = document.getElementById('pushTitle')?.value?.trim();
    const body     = document.getElementById('pushBody')?.value?.trim();
    const url      = document.getElementById('pushUrl')?.value?.trim() || 'https://newurbaninfluence.com';
    const platform = document.getElementById('pushPlatform')?.value || 'all';
    const interest = document.getElementById('pushInterest')?.value || null;

    if (!title) { alert('Title is required'); return; }
    if (!body)  { alert('Message body is required'); return; }

    const btn = document.getElementById('pushSendBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Sending...';

    try {
        const res = await fetch('/.netlify/functions/push-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body, url, platform, interest: interest || undefined, tag: 'nui-campaign' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Send failed');

        document.getElementById('pushSendModal').remove();
        alert(`✅ Campaign sent!\n\n📤 Delivered: ${data.sent}\n❌ Failed: ${data.failed}\n📋 Total subscribers: ${data.total}`);
        loadAdminPushPanel();
    } catch (err) {
        btn.disabled = false;
        btn.textContent = '🔔 Send Now';
        alert('❌ Failed: ' + err.message);
    }
}
