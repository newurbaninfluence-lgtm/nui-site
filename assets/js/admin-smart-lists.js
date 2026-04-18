// admin-smart-lists.js — Auto-grouped Smart Lists + Drip Campaign controls
// Buckets contacts by business_category. Each bucket has Start Drip / Pause / Preview buttons.

(function () {
  'use strict';

  const CATEGORY_META = {
    authors:       { label: 'Authors',             emoji: '📚', color: '#8b5cf6' },
    photography:   { label: 'Photographers',       emoji: '📸', color: '#7c3aed' },
    product:       { label: 'Product Businesses',  emoji: '📦', color: '#0369a1' },
    clothing:      { label: 'Clothing Brands',     emoji: '👗', color: '#e11d48' },
    events:        { label: 'Event Shows',         emoji: '🎉', color: '#ea580c' },
    restaurants:   { label: 'Restaurants',         emoji: '🍽️', color: '#dc2626' },
    bars_nightlife:{ label: 'Bars / Nightlife',    emoji: '🍸', color: '#7c2d12' },
    salon:         { label: 'Salons',              emoji: '💇', color: '#c026d3' },
    barbershop:    { label: 'Barbershops',         emoji: '💈', color: '#1e40af' },
    retail:        { label: 'Retail',              emoji: '🛍️', color: '#0891b2' },
    ecommerce:     { label: 'E-commerce',          emoji: '🛒', color: '#0284c7' },
    law:           { label: 'Law Firms',           emoji: '⚖️', color: '#1e293b' },
    real_estate:   { label: 'Real Estate',         emoji: '🏠', color: '#059669' },
    healthcare:    { label: 'Healthcare',          emoji: '🏥', color: '#0284c7' },
    dental:        { label: 'Dental',              emoji: '🦷', color: '#0ea5e9' },
    fitness:       { label: 'Fitness',             emoji: '💪', color: '#ea580c' },
    hvac:          { label: 'HVAC',                emoji: '🔥', color: '#dc2626' },
    roofing:       { label: 'Roofing',             emoji: '🏗️', color: '#a16207' },
    flooring:      { label: 'Flooring',            emoji: '🪵', color: '#78350f' },
    lawn_care:     { label: 'Lawn Care',           emoji: '🌱', color: '#15803d' },
    nonprofit:     { label: 'Nonprofits',          emoji: '❤️', color: '#be123c' },
    tech:          { label: 'Tech',                emoji: '💻', color: '#4338ca' }
  };

  const CATEGORIES_WITH_DRIPS = new Set([
    'authors','photography','product','clothing','events',
    'restaurants','bars_nightlife','hvac','roofing','flooring','lawn_care','general'
  ]);

  const state = { stats: null, classifyRunning: false, classifyStats: null };

  function getAllContacts() {
    return (window.contactHubData && contactHubData.contacts) || [];
  }

  async function fetchStats() {
    try {
      const r = await fetch('/.netlify/functions/drip-enroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' })
      });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  window.startDripRamp = async function () {
    if (!confirm('Start the domain warmup ramp?\n\n• Week 1-2: 10 emails/day\n• Week 3-4: 18 emails/day\n• Week 5-8: 25 emails/day\n• Week 9+: 30 emails/day\n\nOnce started, this timestamp anchors your send schedule.')) return;
    try {
      const r = await fetch('/.netlify/functions/drip-enroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_ramp' })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      alert('✅ Ramp started. Sending begins at 10/day for 2 weeks, then scales.');
      state.stats = await fetchStats();
      window.renderSmartListsTab();
    } catch (e) { alert('Failed: ' + e.message); }
  };

  function computeBuckets() {
    const all = getAllContacts();
    const buckets = {};
    let classified = 0, unclassified = 0, withCompany = 0;

    all.forEach(c => {
      if (c.company) withCompany++;
      if (c.business_category) {
        classified++;
        if (!buckets[c.business_category]) buckets[c.business_category] = { contacts: [], type_counts: {} };
        buckets[c.business_category].contacts.push(c);
        const t = c.business_type || 'unknown';
        buckets[c.business_category].type_counts[t] = (buckets[c.business_category].type_counts[t] || 0) + 1;
      } else {
        unclassified++;
      }
    });

    return { buckets, total: all.length, classified, unclassified, withCompany };
  }

  window.renderSmartListsTab = async function () {
    const container = document.getElementById('smartListsTabContent');
    if (!container) return;

    if (!state.stats) state.stats = await fetchStats();
    const summary = computeBuckets();
    const pct = summary.withCompany > 0 ? Math.round(summary.classified / summary.withCompany * 100) : 0;
    const dripStats = state.stats || {};

    const sortedBuckets = Object.entries(summary.buckets)
      .sort((a, b) => b[1].contacts.length - a[1].contacts.length);

    const rampStarted = dripStats.config && dripStats.config.ramp_started_at;
    const weekNum = rampStarted
      ? Math.max(1, Math.floor((Date.now() - new Date(rampStarted).getTime()) / (7*24*3600*1000)) + 1)
      : null;
    const currentCap = weekNum ? (function(){
      const ramp = (dripStats.config?.ramp_schedule) || [];
      let t = { email: 10, sms: 5 };
      for (const x of ramp) if (weekNum >= x.week) t = x;
      return t;
    })() : null;

    container.innerHTML = `
      <div style="padding:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 style="margin:0 0 4px 0;font-size:22px;color:#fff;font-weight:700;">🎯 Smart Lists + Drips</h2>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);">Auto-grouped by category. Click Start Drip to queue 5-email sequence (spaced with daily caps).</div>
          </div>
          <div style="display:flex;gap:8px;">
            ${!rampStarted ? `<button onclick="startDripRamp()" style="padding:10px 18px;background:#f59e0b;border:none;border-radius:8px;color:#000;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;">⚡ Start Ramp</button>` : ''}
            <button onclick="openAiClassifier()" style="padding:10px 18px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;font-size:13px;">🤖 AI Classify</button>
            <button onclick="renderSmartListsTab()" style="padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;">🔄 Refresh</button>
          </div>
        </div>

        ${rampStarted ? `
          <div style="background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);border-radius:10px;padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;gap:12px;">
            <div style="font-size:20px;">⚡</div>
            <div style="flex:1;font-size:13px;color:#fff;">
              <strong>Ramp active — Week ${weekNum}</strong> · Sending up to ${currentCap.email} emails + ${currentCap.sms} SMS/day
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">Started ${new Date(rampStarted).toLocaleDateString()}</div>
          </div>
        ` : `
          <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;gap:12px;">
            <div style="font-size:20px;">⚠️</div>
            <div style="flex:1;font-size:13px;color:#fff;">
              <strong>Ramp not started.</strong> Nothing sends until you click <strong>Start Ramp</strong>. Good time to enroll contacts and preview sequences first.
            </div>
          </div>
        `}

        <!-- Drip health banner -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:20px;">
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;">
            <div style="font-size:22px;font-weight:800;color:#fff;">${summary.classified.toLocaleString()}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Classified</div>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;">
            <div style="font-size:22px;font-weight:800;color:#3b82f6;">${(dripStats.queued||0).toLocaleString()}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Queued</div>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;">
            <div style="font-size:22px;font-weight:800;color:#10b981;">${(dripStats.sent||0).toLocaleString()}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Sent</div>
          </div>
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;">
            <div style="font-size:22px;font-weight:800;color:#f59e0b;">${(dripStats.paused||0).toLocaleString()}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Paused</div>
          </div>
        </div>

        <!-- Classification progress -->
        <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;gap:12px;">
          <div style="font-size:13px;color:#fff;flex:1;">
            <strong>${summary.classified.toLocaleString()}</strong> of ${summary.withCompany.toLocaleString()} contacts with company names are tagged
            <span style="color:rgba(255,255,255,0.4);font-weight:400;"> (${pct}%)</span>
          </div>
          <div style="flex:1;max-width:300px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#dc2626,#ea580c);"></div>
          </div>
        </div>

        ${sortedBuckets.length === 0 ? `
          <div style="text-align:center;padding:60px 20px;border:1px dashed rgba(255,255,255,0.12);border-radius:12px;">
            <div style="font-size:44px;margin-bottom:10px;">🤖</div>
            <div style="font-size:16px;color:#fff;margin-bottom:6px;font-weight:600;">No categories yet</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;">Run AI Classifier or tag contacts manually via the drawer.</div>
            <button onclick="openAiClassifier()" style="padding:12px 24px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;">▶ Start AI Classifier</button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px;">
            ${sortedBuckets.map(([cat, data]) => renderBucket(cat, data, dripStats)).join('')}
          </div>
        `}
      </div>
    `;
  };

  function renderBucket(category, data, dripStats) {
    const meta = CATEGORY_META[category] || { label: category, emoji: '📌', color: '#525252' };
    const hasDrip = CATEGORIES_WITH_DRIPS.has(category);
    const queuedCount = (dripStats.by_category_queued || {})[category] || 0;
    const total = data.contacts.length;
    const emailable = data.contacts.filter(c => c.email && !c.email_unsubscribed && !c.email_bounced).length;
    const enrolled = data.contacts.filter(c => c.drip_status && c.drip_status !== 'not_enrolled').length;
    const notEnrolled = total - enrolled;

    return `
      <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
        <div style="display:flex;align-items:start;gap:12px;margin-bottom:12px;">
          <div style="width:44px;height:44px;background:${meta.color};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${meta.emoji}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;color:#fff;font-weight:700;">${meta.label}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">${total} contacts · ${emailable} emailable</div>
          </div>
          ${queuedCount > 0 ? `<div style="padding:3px 8px;background:rgba(59,130,246,0.2);color:#93c5fd;border-radius:10px;font-size:10px;font-weight:700;">${queuedCount} queued</div>` : ''}
        </div>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
          ${Object.entries(data.type_counts || {}).map(([t, n]) =>
            `<span style="padding:2px 8px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border-radius:8px;font-size:10px;text-transform:uppercase;font-weight:600;">${t}: ${n}</span>`
          ).join('')}
        </div>

        ${hasDrip ? `
          <div style="display:flex;gap:6px;">
            <button onclick="startDripForCategory('${category}')" ${notEnrolled === 0 ? 'disabled' : ''} style="flex:1;padding:9px;background:${notEnrolled > 0 ? meta.color : '#1c1c1c'};border:none;border-radius:6px;color:#fff;font-weight:600;cursor:${notEnrolled > 0 ? 'pointer' : 'not-allowed'};font-family:inherit;font-size:12px;opacity:${notEnrolled > 0 ? 1 : 0.4};">▶ Start Drip (${notEnrolled})</button>
            <button onclick="previewDripForCategory('${category}')" style="padding:9px 12px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;cursor:pointer;font-family:inherit;font-size:12px;">👁</button>
            ${queuedCount > 0 ? `<button onclick="pauseDripCampaign('${category}')" style="padding:9px 12px;background:#1c1c1c;border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#ef4444;cursor:pointer;font-family:inherit;font-size:12px;">⏸</button>` : ''}
          </div>
        ` : `
          <div style="padding:8px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:6px;font-size:11px;color:#fbbf24;">
            ⚠️ No drip template for this category yet
          </div>
        `}
      </div>
    `;
  }

  window.previewDripForCategory = async function (category) {
    try {
      const r = await fetch(`${window.SUPABASE_URL}/rest/v1/drip_emails?industry=eq.${category}&active=eq.true&order=position`, {
        headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}` }
      });
      const emails = await r.json();
      const meta = CATEGORY_META[category] || { label: category, emoji: '📌' };

      let modal = document.getElementById('dripPreviewModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dripPreviewModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:780px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;font-family:inherit;">
          <div style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:17px;font-weight:700;color:#fff;">${meta.emoji} ${meta.label} — Drip Sequence Preview</div>
            <button onclick="document.getElementById('dripPreviewModal').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:22px;cursor:pointer;">×</button>
          </div>
          <div style="padding:20px 24px;overflow-y:auto;">
            ${emails.map((e, i) => `
              <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Email #${e.position} · Day ${e.delay_days}</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.4);">to {{first_name}}</div>
                </div>
                <div style="font-size:14px;color:#fff;font-weight:700;margin-bottom:10px;">${(e.subject || '').replace(/</g,'&lt;')}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.7);white-space:pre-wrap;line-height:1.6;font-family:inherit;">${(e.body_text || '').replace(/</g,'&lt;')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      alert('Preview failed: ' + e.message);
    }
  };

  window.startDripForCategory = async function (category) {
    const all = getAllContacts();
    const eligible = all.filter(c =>
      c.business_category === category &&
      c.email && !c.email_unsubscribed && !c.email_bounced &&
      (!c.drip_status || c.drip_status === 'not_enrolled')
    );

    if (eligible.length === 0) {
      alert('No eligible contacts (need email, not unsubscribed/bounced, not already in a drip).');
      return;
    }

    const meta = CATEGORY_META[category] || { label: category };
    const confirmMsg = `Enroll ${eligible.length} contacts from "${meta.label}" into the drip sequence?\n\n• 5 emails, spaced 3-18 days apart\n• Sent at max ${state.stats?.config?.daily_caps?.email || 10}/day during ramp\n• Only during recipient's local business hours\n• They'll get one email every several days\n\nOK to start?`;
    if (!confirm(confirmMsg)) return;

    try {
      const r = await fetch('/.netlify/functions/drip-enroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enroll',
          contacts: eligible.map(c => c.id),
          category,
          source_campaign: category
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Enroll failed');

      alert(`✅ Enrolled ${data.enrolled} contacts.\nSkipped ${data.skipped || 0} (already in queue).\n\nFirst emails will start sending in the next 15-min cron window, within the recipient's business hours.`);
      state.stats = await fetchStats();
      if (window.fetchContactHubData) await fetchContactHubData();
      window.renderSmartListsTab();
    } catch (e) {
      alert('Start failed: ' + e.message);
    }
  };

  window.pauseDripCampaign = async function (category) {
    if (!confirm(`Pause all queued sends for "${category}"?\n\nThis cancels pending emails. Contacts already sent stay sent.`)) return;
    try {
      const r = await fetch('/.netlify/functions/drip-enroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause_campaign', source_campaign: category })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      alert(`⏸ Cancelled ${data.cancelled} queued sends.`);
      state.stats = await fetchStats();
      window.renderSmartListsTab();
    } catch (e) { alert('Pause failed: ' + e.message); }
  };

  // ══════════════════════════════════════════════════════════════════
  // AI CLASSIFIER (unchanged from before)
  // ══════════════════════════════════════════════════════════════════
  window.openAiClassifier = async function () {
    const all = getAllContacts();
    const unclass = all.filter(c => c.company && !c.business_type).length;
    let modal = document.getElementById('aiClassifyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aiClassifyModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:520px;width:100%;font-family:inherit;">
        <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;">
          <div style="font-size:17px;font-weight:700;color:#fff;">🤖 AI Classify Contacts</div>
          <button onclick="document.getElementById('aiClassifyModal').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:22px;cursor:pointer;">×</button>
        </div>
        <div style="padding:24px;">
          <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:20px;">
            Claude reads each company name and tags the business type (service/product/both) + category.
          </div>
          <div style="background:#111;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#fff;">${unclass.toLocaleString()}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">to classify</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px;">~$${(unclass * 0.0008).toFixed(2)} · ~${Math.ceil(unclass/20/4)} min</div>
          </div>
          <div id="aiClassifyProgress" style="display:none;margin-bottom:16px;">
            <div id="aiClassifyStatus" style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px;">Starting…</div>
            <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
              <div id="aiClassifyBar" style="width:0%;height:100%;background:linear-gradient(90deg,#dc2626,#ea580c);transition:width 0.3s;"></div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="aiClassifyCancel" onclick="stopAiClassifier()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;display:none;">Stop</button>
            <button id="aiClassifyClose" onclick="document.getElementById('aiClassifyModal').remove()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;">Close</button>
            <button id="aiClassifyStart" onclick="startAiClassifier()" ${unclass === 0 ? 'disabled' : ''} style="padding:10px 22px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;">▶ Start</button>
          </div>
        </div>
      </div>
    `;
  };

  let classifyRunning = false;
  window.startAiClassifier = async function () {
    classifyRunning = true;
    document.getElementById('aiClassifyStart').style.display = 'none';
    document.getElementById('aiClassifyClose').style.display = 'none';
    document.getElementById('aiClassifyCancel').style.display = 'inline-block';
    document.getElementById('aiClassifyProgress').style.display = 'block';
    const statusEl = document.getElementById('aiClassifyStatus');
    const bar = document.getElementById('aiClassifyBar');
    let total = 0, start = null;

    while (classifyRunning) {
      try {
        const r = await fetch('/.netlify/functions/classify-contacts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch_size: 20 })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed');

        if (d.remaining === 0 && d.classified === 0) { statusEl.textContent = '✅ Done!'; bar.style.width = '100%'; break; }
        total += d.classified || 0;
        if (start === null) start = (d.remaining || 0) + (d.classified || 0);
        const done = start - (d.remaining || 0);
        const pct = start > 0 ? Math.round(done / start * 100) : 0;
        bar.style.width = pct + '%';
        statusEl.textContent = `${done.toLocaleString()} of ${start.toLocaleString()} · ${d.remaining.toLocaleString()} left`;
        if (d.remaining === 0) { bar.style.width = '100%'; statusEl.textContent = `✅ Done! ${total.toLocaleString()} classified.`; break; }
      } catch (e) { statusEl.textContent = '❌ ' + e.message; break; }
    }
    classifyRunning = false;
    document.getElementById('aiClassifyCancel').style.display = 'none';
    document.getElementById('aiClassifyClose').style.display = 'inline-block';
    if (window.fetchContactHubData) await fetchContactHubData();
    setTimeout(() => window.renderSmartListsTab(), 500);
  };

  window.stopAiClassifier = function () {
    classifyRunning = false;
    const el = document.getElementById('aiClassifyStatus');
    if (el) el.textContent = '⏸ Stopped';
  };

  console.log('✅ admin-smart-lists.js v2 loaded');
})();
