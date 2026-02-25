// ============================================================
// RETARGETING — Meta Pixel & Google Ads Management Panel
// New Urban Influence Admin
//
// Track pixel installations, audiences, and campaign
// performance across all clients from one dashboard.
// ============================================================

function loadAdminRetargetingPanel() {
    const panel = document.getElementById('adminRetargetingPanel');
    if (!panel) return;

    panel.innerHTML = `
    <div style="padding: 32px; max-width: 1200px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
            <div>
                <h2 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                    <span style="color: var(--red);">Retargeting</span> — Pixel & Ads Manager
                </h2>
                <p style="color: rgba(255,255,255,0.5); margin: 6px 0 0; font-size: 14px;">
                    Manage Meta Pixel, Google Ads, audiences, and campaigns for all clients.
                </p>
            </div>
            <button onclick="_rtNewSetup()" class="btn-admin primary" style="padding: 10px 20px; font-weight: 700;">
                + New Client Setup
            </button>
        </div>

        <!-- Tab Bar -->
        <div style="display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0;">
            <button onclick="_rtSwitchTab('overview')" class="rt-tab active" data-tab="overview" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid var(--red); color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit;">Overview</button>
            <button onclick="_rtSwitchTab('meta')" class="rt-tab" data-tab="meta" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit;">Meta Pixel</button>
            <button onclick="_rtSwitchTab('google')" class="rt-tab" data-tab="google" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit;">Google Ads</button>
            <button onclick="_rtSwitchTab('audiences')" class="rt-tab" data-tab="audiences" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit;">Audiences</button>
            <button onclick="_rtSwitchTab('campaigns')" class="rt-tab" data-tab="campaigns" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit;">Campaigns</button>
        </div>

        <!-- Tab Content -->
        <div id="rtTabContent"></div>

        <!-- Setup Form (hidden) -->
        <div id="rtSetupForm" style="display: none;"></div>
    </div>`;

    _rtLoadData();
}


// ============================================================
// STATE & DATA
// ============================================================

var _rtData = { setups: [], audiences: [], campaigns: [] };
var _rtCurrentTab = 'overview';

async function _rtLoadData() {
    if (typeof supabaseClient !== 'undefined') {
        try {
            const [setupRes, audRes, campRes] = await Promise.all([
                supabaseClient.from('retargeting_setups').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('retargeting_audiences').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('retargeting_campaigns').select('*').order('created_at', { ascending: false })
            ]);
            _rtData.setups = setupRes.data || [];
            _rtData.audiences = audRes.data || [];
            _rtData.campaigns = campRes.data || [];
        } catch (e) { console.error('Retargeting load error:', e); }
    }
    _rtRenderTab(_rtCurrentTab);
}

function _rtSwitchTab(tab) {
    _rtCurrentTab = tab;
    document.querySelectorAll('.rt-tab').forEach(t => {
        t.style.borderBottomColor = t.dataset.tab === tab ? 'var(--red)' : 'transparent';
        t.style.color = t.dataset.tab === tab ? '#fff' : 'rgba(255,255,255,0.4)';
    });
    document.getElementById('rtSetupForm').style.display = 'none';
    _rtRenderTab(tab);
}

function _rtRenderTab(tab) {
    const el = document.getElementById('rtTabContent');
    if (!el) return;
    const renderers = {
        overview: _rtRenderOverview,
        meta: _rtRenderMeta,
        google: _rtRenderGoogle,
        audiences: _rtRenderAudiences,
        campaigns: _rtRenderCampaigns
    };
    if (renderers[tab]) renderers[tab](el);
}


// ============================================================
// OVERVIEW TAB
// ============================================================

function _rtRenderOverview(el) {
    const s = _rtData.setups;
    const metaActive = s.filter(x => x.platform === 'meta' && x.status === 'active').length;
    const googleActive = s.filter(x => x.platform === 'google' && x.status === 'active').length;
    const pending = s.filter(x => x.status === 'pending' || x.status === 'in_progress').length;
    const totalAudiences = _rtData.audiences.length;
    const activeCampaigns = _rtData.campaigns.filter(c => c.status === 'active').length;

    el.innerHTML = `
    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px;">
        <div class="glass-panel" style="padding: 18px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; color: #4ade80;">${metaActive}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Meta Pixels Live</div>
        </div>
        <div class="glass-panel" style="padding: 18px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; color: #4ade80;">${googleActive}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Google Ads Live</div>
        </div>
        <div class="glass-panel" style="padding: 18px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; color: #facc15;">${pending}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Pending Setup</div>
        </div>
        <div class="glass-panel" style="padding: 18px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; color: #818cf8;">${totalAudiences}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Audiences</div>
        </div>
        <div class="glass-panel" style="padding: 18px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; color: var(--red);">${activeCampaigns}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Active Campaigns</div>
        </div>
    </div>

    <!-- Client Setup Table -->
    <div class="glass-panel" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; font-weight: 700;">All Client Setups</span>
            <span style="font-size: 12px; color: rgba(255,255,255,0.3);">${s.length} total</span>
        </div>
        ${s.length === 0 ? `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">🎯</div>
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No Setups Yet</div>
            <div style="font-size: 13px; color: rgba(255,255,255,0.4);">Click "+ New Client Setup" to get started.</div>
        </div>` : `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Client</th>
                        <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Platform</th>
                        <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Pixel / Tag ID</th>
                        <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Status</th>
                        <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Setup %</th>
                        <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.map(setup => {
                        const statusColors = { active: '#4ade80', in_progress: '#facc15', pending: '#fb923c', paused: '#94a3b8' };
                        const stColor = statusColors[setup.status] || '#94a3b8';
                        const checklist = setup.checklist || {};
                        const totalSteps = Object.keys(checklist).length || 1;
                        const doneSteps = Object.values(checklist).filter(Boolean).length;
                        const pct = Math.round((doneSteps / totalSteps) * 100);
                        const platformIcon = setup.platform === 'meta' ? '📘' : '🔴';
                        const platformLabel = setup.platform === 'meta' ? 'Meta Pixel' : 'Google Ads';
                        return `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='none'">
                            <td style="padding: 12px 16px; font-weight: 600;">${setup.client_name || 'Unknown'}</td>
                            <td style="padding: 12px 16px;">${platformIcon} ${platformLabel}</td>
                            <td style="padding: 12px 16px; font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.5);">${setup.pixel_id || setup.gtm_id || '—'}</td>
                            <td style="padding: 12px 16px; text-align: center;">
                                <span style="padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${stColor}20; color: ${stColor}; text-transform: uppercase;">${setup.status}</span>
                            </td>
                            <td style="padding: 12px 16px; text-align: center;">
                                <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                                    <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;">
                                        <div style="width: ${pct}%; height: 100%; background: ${pct === 100 ? '#4ade80' : 'var(--red)'}; border-radius: 2px;"></div>
                                    </div>
                                    <span style="font-size: 11px; color: rgba(255,255,255,0.4);">${pct}%</span>
                                </div>
                            </td>
                            <td style="padding: 12px 16px; text-align: center;">
                                <button onclick="_rtEditSetup(${setup.id})" style="padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 12px; cursor: pointer;">Manage</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`}
    </div>`;
}


// ============================================================
// NEW CLIENT SETUP FORM
// ============================================================

function _rtNewSetup() {
    const form = document.getElementById('rtSetupForm');
    document.getElementById('rtTabContent').style.display = 'none';
    form.style.display = 'block';

    form.innerHTML = `
    <div class="glass-panel" style="padding: 28px;">
        <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 20px;">New Retargeting Setup</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Client</label>
                <select id="rtClient" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="">Select client...</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Platform</label>
                <select id="rtPlatform" onchange="_rtTogglePlatformFields()" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="meta">📘 Meta Pixel & Ads</option>
                    <option value="google">🔴 Google Ads Pixel</option>
                </select>
            </div>
        </div>

        <!-- Meta Fields -->
        <div id="rtMetaFields">
            <div style="font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">📘 META PIXEL DETAILS</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Meta Pixel ID</label>
                    <input type="text" id="rtMetaPixelId" placeholder="e.g. 123456789012345" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Ad Account ID</label>
                    <input type="text" id="rtMetaAdAccount" placeholder="e.g. act_123456789" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; box-sizing: border-box;">
                </div>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Setup Checklist</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;" id="rtMetaChecklist">
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="pixel_installed"> Meta Pixel Installed
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="domain_verified"> Domain Verified
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="events_configured"> Events Configured
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="custom_audiences"> Custom Audiences Created
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="lookalike_audiences"> Lookalike Audiences
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="retargeting_campaign"> Retargeting Campaign Live
                </label>
            </div>
        </div>

        <!-- Google Fields -->
        <div id="rtGoogleFields" style="display: none;">
            <div style="font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">🔴 GOOGLE ADS DETAILS</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">GTM Container ID</label>
                    <input type="text" id="rtGtmId" placeholder="e.g. GTM-XXXXXXX" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Google Ads Customer ID</label>
                    <input type="text" id="rtGoogleAdsId" placeholder="e.g. 123-456-7890" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Conversion ID</label>
                    <input type="text" id="rtConversionId" placeholder="e.g. AW-XXXXXXXXXX" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">GA4 Measurement ID</label>
                    <input type="text" id="rtGa4Id" placeholder="e.g. G-XXXXXXXXXX" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace; box-sizing: border-box;">
                </div>
            </div>
            <div style="font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Setup Checklist</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;" id="rtGoogleChecklist">
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="gtm_installed"> GTM Container Installed
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="conversion_tracking"> Conversion Tracking Live
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="remarketing_tag"> Remarketing Tag Firing
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="remarketing_audiences"> Remarketing Audiences Built
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="display_retargeting"> Display Network Campaign
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; font-size: 13px;">
                    <input type="checkbox" data-step="youtube_retargeting"> YouTube Retargeting
                </label>
            </div>
        </div>

        <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</label>
            <textarea id="rtNotes" rows="3" placeholder="Client site URL, login info location, special instructions..." style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; resize: vertical; box-sizing: border-box;"></textarea>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="_rtSaveSetup()" class="btn-admin primary" style="padding: 12px 28px; font-weight: 700;">Save Setup</button>
            <button onclick="_rtCancelSetup()" class="btn-admin" style="padding: 12px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
        </div>
    </div>`;

    // Populate clients
    const sel = document.getElementById('rtClient');
    if (typeof clients !== 'undefined') {
        clients.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name || c.businessName || 'Client #' + c.id;
            sel.appendChild(opt);
        });
    }
}

function _rtTogglePlatformFields() {
    const p = document.getElementById('rtPlatform').value;
    document.getElementById('rtMetaFields').style.display = p === 'meta' ? 'block' : 'none';
    document.getElementById('rtGoogleFields').style.display = p === 'google' ? 'block' : 'none';
}

function _rtCancelSetup() {
    document.getElementById('rtSetupForm').style.display = 'none';
    document.getElementById('rtTabContent').style.display = 'block';
}


// ============================================================
// SAVE SETUP
// ============================================================

async function _rtSaveSetup(existingId) {
    const platform = document.getElementById('rtPlatform').value;
    const clientId = document.getElementById('rtClient').value;
    const clientSel = document.getElementById('rtClient');
    const clientName = clientSel.options[clientSel.selectedIndex]?.textContent || '';
    const notes = document.getElementById('rtNotes').value.trim();

    if (!clientId) { alert('Please select a client.'); return; }

    // Build checklist from checkboxes
    const checklistEl = platform === 'meta' ? 'rtMetaChecklist' : 'rtGoogleChecklist';
    const checklist = {};
    document.querySelectorAll('#' + checklistEl + ' input[type=checkbox]').forEach(cb => {
        checklist[cb.dataset.step] = cb.checked;
    });

    const doneSteps = Object.values(checklist).filter(Boolean).length;
    const totalSteps = Object.keys(checklist).length;
    const allDone = doneSteps === totalSteps;

    const row = {
        client_id: clientId,
        client_name: clientName,
        platform: platform,
        pixel_id: platform === 'meta' ? (document.getElementById('rtMetaPixelId')?.value.trim() || null) : null,
        ad_account_id: platform === 'meta' ? (document.getElementById('rtMetaAdAccount')?.value.trim() || null) : null,
        gtm_id: platform === 'google' ? (document.getElementById('rtGtmId')?.value.trim() || null) : null,
        google_ads_id: platform === 'google' ? (document.getElementById('rtGoogleAdsId')?.value.trim() || null) : null,
        conversion_id: platform === 'google' ? (document.getElementById('rtConversionId')?.value.trim() || null) : null,
        ga4_id: platform === 'google' ? (document.getElementById('rtGa4Id')?.value.trim() || null) : null,
        checklist: checklist,
        status: allDone ? 'active' : (doneSteps > 0 ? 'in_progress' : 'pending'),
        notes: notes || null
    };

    if (typeof supabaseClient === 'undefined') {
        alert('Supabase not connected. Cannot save.');
        return;
    }

    try {
        let res;
        if (existingId) {
            res = await supabaseClient.from('retargeting_setups').update(row).eq('id', existingId).select();
        } else {
            res = await supabaseClient.from('retargeting_setups').insert(row).select();
        }
        if (res.error) throw res.error;
        alert('✅ Setup saved!');
        _rtCancelSetup();
        _rtLoadData();
    } catch (e) {
        console.error('Save retargeting setup:', e);
        alert('Failed to save: ' + e.message);
    }
}


// ============================================================
// EDIT EXISTING SETUP
// ============================================================

async function _rtEditSetup(setupId) {
    const setup = _rtData.setups.find(s => s.id === setupId);
    if (!setup) return;

    _rtNewSetup();

    // Pre-fill
    setTimeout(() => {
        document.getElementById('rtClient').value = setup.client_id || '';
        document.getElementById('rtPlatform').value = setup.platform;
        _rtTogglePlatformFields();
        document.getElementById('rtNotes').value = setup.notes || '';

        if (setup.platform === 'meta') {
            document.getElementById('rtMetaPixelId').value = setup.pixel_id || '';
            document.getElementById('rtMetaAdAccount').value = setup.ad_account_id || '';
            if (setup.checklist) {
                document.querySelectorAll('#rtMetaChecklist input[type=checkbox]').forEach(cb => {
                    cb.checked = !!setup.checklist[cb.dataset.step];
                });
            }
        } else {
            document.getElementById('rtGtmId').value = setup.gtm_id || '';
            document.getElementById('rtGoogleAdsId').value = setup.google_ads_id || '';
            document.getElementById('rtConversionId').value = setup.conversion_id || '';
            document.getElementById('rtGa4Id').value = setup.ga4_id || '';
            if (setup.checklist) {
                document.querySelectorAll('#rtGoogleChecklist input[type=checkbox]').forEach(cb => {
                    cb.checked = !!setup.checklist[cb.dataset.step];
                });
            }
        }

        // Replace save button to pass ID
        const saveBtn = document.querySelector('#rtSetupForm .btn-admin.primary');
        if (saveBtn) {
            saveBtn.onclick = () => _rtSaveSetup(setupId);
            saveBtn.textContent = 'Update Setup';
        }
    }, 50);
}

// ============================================================
// META PIXEL TAB
// ============================================================

function _rtRenderMeta(el) {
    const metaSetups = _rtData.setups.filter(s => s.platform === 'meta');
    if (metaSetups.length === 0) {
        el.innerHTML = `<div class="glass-panel" style="padding: 40px; text-align: center;"><div style="font-size: 40px; margin-bottom: 12px;">📘</div><div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No Meta Pixel Setups</div><div style="font-size: 13px; color: rgba(255,255,255,0.4);">Add a Meta Pixel setup to track here.</div></div>`;
        return;
    }
    el.innerHTML = metaSetups.map(s => _rtSetupCard(s)).join('');
}

function _rtRenderGoogle(el) {
    const googleSetups = _rtData.setups.filter(s => s.platform === 'google');
    if (googleSetups.length === 0) {
        el.innerHTML = `<div class="glass-panel" style="padding: 40px; text-align: center;"><div style="font-size: 40px; margin-bottom: 12px;">🔴</div><div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No Google Ads Setups</div><div style="font-size: 13px; color: rgba(255,255,255,0.4);">Add a Google Ads setup to track here.</div></div>`;
        return;
    }
    el.innerHTML = googleSetups.map(s => _rtSetupCard(s)).join('');
}


// ============================================================
// SETUP CARD (used by Meta + Google tabs)
// ============================================================

function _rtSetupCard(s) {
    const checklist = s.checklist || {};
    const steps = Object.entries(checklist);
    const platformIcon = s.platform === 'meta' ? '📘' : '🔴';

    return `
    <div class="glass-panel" style="padding: 24px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
                <div style="font-size: 16px; font-weight: 700;">${platformIcon} ${s.client_name}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; font-family: monospace;">
                    ${s.platform === 'meta' ? ('Pixel: ' + (s.pixel_id || '—') + ' • Ad Acct: ' + (s.ad_account_id || '—')) : ('GTM: ' + (s.gtm_id || '—') + ' • Ads ID: ' + (s.google_ads_id || '—'))}
                </div>
            </div>
            <button onclick="_rtEditSetup(${s.id})" style="padding: 6px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 12px; cursor: pointer;">Edit</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            ${steps.map(([step, done]) => `
                <div style="display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: ${done ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)'}; border-radius: 6px; font-size: 12px;">
                    <span style="color: ${done ? '#4ade80' : 'rgba(255,255,255,0.2)'};">${done ? '✓' : '○'}</span>
                    <span style="color: ${done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'};">${step.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                </div>
            `).join('')}
        </div>
        ${s.notes ? `<div style="margin-top: 12px; padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 6px; font-size: 12px; color: rgba(255,255,255,0.4);">📝 ${s.notes}</div>` : ''}
    </div>`;
}

// ============================================================
// AUDIENCES TAB
// ============================================================

function _rtRenderAudiences(el) {
    const auds = _rtData.audiences;
    el.innerHTML = `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
        <button onclick="_rtNewAudience()" class="btn-admin primary" style="padding: 8px 16px; font-size: 13px;">+ New Audience</button>
    </div>
    ${auds.length === 0 ? `
    <div class="glass-panel" style="padding: 40px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">👥</div>
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No Audiences</div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.4);">Create custom or lookalike audiences to track.</div>
    </div>` : `
    <div class="glass-panel" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Client</th>
                    <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Platform</th>
                    <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Audience Name</th>
                    <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Type</th>
                    <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Size</th>
                    <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${auds.map(a => {
                    const typeColors = { custom: '#818cf8', lookalike: '#f472b6', remarketing: '#fb923c', interest: '#34d399' };
                    return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='none'">
                        <td style="padding: 12px 16px; font-weight: 600;">${a.client_name || '—'}</td>
                        <td style="padding: 12px 16px;">${a.platform === 'meta' ? '📘 Meta' : '🔴 Google'}</td>
                        <td style="padding: 12px 16px;">${a.name}</td>
                        <td style="padding: 12px 16px;"><span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; background: ${(typeColors[a.type] || '#94a3b8')}20; color: ${typeColors[a.type] || '#94a3b8'};">${a.type}</span></td>
                        <td style="padding: 12px 16px; text-align: center; color: rgba(255,255,255,0.5);">${a.size ? a.size.toLocaleString() : '—'}</td>
                        <td style="padding: 12px 16px; text-align: center;"><span style="padding: 2px 8px; border-radius: 10px; font-size: 11px; background: ${a.status === 'active' ? '#4ade8020' : '#facc1520'}; color: ${a.status === 'active' ? '#4ade80' : '#facc15'};">${a.status || 'building'}</span></td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`}`;
}


// ============================================================
// CAMPAIGNS TAB
// ============================================================

function _rtRenderCampaigns(el) {
    const camps = _rtData.campaigns;
    el.innerHTML = `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
        <button onclick="_rtNewCampaign()" class="btn-admin primary" style="padding: 8px 16px; font-size: 13px;">+ Log Campaign</button>
    </div>
    ${camps.length === 0 ? `
    <div class="glass-panel" style="padding: 40px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">📢</div>
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No Campaigns</div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.4);">Log retargeting campaigns to track performance.</div>
    </div>` : `
    <div style="display: grid; gap: 16px;">
        ${camps.map(c => {
            const stColors = { active: '#4ade80', paused: '#facc15', completed: '#94a3b8', draft: '#818cf8' };
            const stColor = stColors[c.status] || '#94a3b8';
            return `
            <div class="glass-panel" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                    <div>
                        <div style="font-size: 15px; font-weight: 700;">${c.name}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">${c.client_name || '—'} • ${c.platform === 'meta' ? '📘 Meta' : '🔴 Google'} • ${c.campaign_type || 'retargeting'}</div>
                    </div>
                    <span style="padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${stColor}20; color: ${stColor}; text-transform: uppercase;">${c.status}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: 800;">${c.impressions ? (c.impressions / 1000).toFixed(1) + 'k' : '—'}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Impressions</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: 800;">${c.clicks || '—'}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Clicks</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: 800;">${c.ctr ? c.ctr + '%' : '—'}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">CTR</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: 800;">${c.conversions || '—'}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Conversions</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: 800;">${c.spend ? '$' + c.spend.toLocaleString() : '—'}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Spend</div>
                    </div>
                </div>
                ${c.notes ? `<div style="margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.35);">📝 ${c.notes}</div>` : ''}
            </div>`;
        }).join('')}
    </div>`}`;
}

// ============================================================
// NEW AUDIENCE FORM
// ============================================================

function _rtNewAudience() {
    const el = document.getElementById('rtTabContent');
    el.innerHTML = `
    <div class="glass-panel" style="padding: 28px;">
        <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 20px;">Log New Audience</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Client</label>
                <select id="rtAudClient" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;"><option value="">Select...</option></select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Platform</label>
                <select id="rtAudPlatform" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="meta">📘 Meta</option><option value="google">🔴 Google</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Audience Name</label>
                <input id="rtAudName" placeholder="e.g. Website Visitors 30d" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Type</label>
                <select id="rtAudType" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="custom">Custom Audience</option><option value="lookalike">Lookalike</option><option value="remarketing">Remarketing</option><option value="interest">Interest-Based</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Estimated Size</label>
                <input id="rtAudSize" type="number" placeholder="e.g. 5000" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Status</label>
                <select id="rtAudStatus" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="building">Building</option><option value="active">Active</option><option value="too_small">Too Small</option>
                </select>
            </div>
        </div>
        <div style="display: flex; gap: 12px;">
            <button onclick="_rtSaveAudience()" class="btn-admin primary" style="padding: 12px 28px; font-weight: 700;">Save Audience</button>
            <button onclick="_rtSwitchTab('audiences')" class="btn-admin" style="padding: 12px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
        </div>
    </div>`;
    const sel = document.getElementById('rtAudClient');
    if (typeof clients !== 'undefined') clients.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name || c.businessName || 'Client #' + c.id; sel.appendChild(o); });
}


async function _rtSaveAudience() {
    const name = document.getElementById('rtAudName').value.trim();
    if (!name) { alert('Audience name required.'); return; }
    const sel = document.getElementById('rtAudClient');
    const row = {
        client_id: sel.value || null,
        client_name: sel.options[sel.selectedIndex]?.textContent || '',
        platform: document.getElementById('rtAudPlatform').value,
        name: name,
        type: document.getElementById('rtAudType').value,
        size: parseInt(document.getElementById('rtAudSize').value) || null,
        status: document.getElementById('rtAudStatus').value
    };
    try {
        const { error } = await supabaseClient.from('retargeting_audiences').insert(row);
        if (error) throw error;
        alert('✅ Audience saved!');
        _rtLoadData();
        _rtCurrentTab = 'audiences';
    } catch (e) { alert('Save failed: ' + e.message); }
}

// ============================================================
// NEW CAMPAIGN FORM
// ============================================================

function _rtNewCampaign() {
    const el = document.getElementById('rtTabContent');
    el.innerHTML = `
    <div class="glass-panel" style="padding: 28px;">
        <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 20px;">Log Campaign</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Client</label>
                <select id="rtCampClient" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;"><option value="">Select...</option></select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Campaign Name</label>
                <input id="rtCampName" placeholder="e.g. Good Cakes - Website Retargeting" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Platform</label>
                <select id="rtCampPlatform" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="meta">📘 Meta</option><option value="google">🔴 Google</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Campaign Type</label>
                <select id="rtCampType" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="retargeting">Retargeting</option><option value="display">Display Network</option><option value="youtube">YouTube</option><option value="lookalike">Lookalike Prospecting</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Status</label>
                <select id="rtCampStatus" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                    <option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase;">Monthly Budget</label>
                <input id="rtCampBudget" type="number" placeholder="e.g. 500" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; box-sizing: border-box;">
            </div>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 12px;">Performance Metrics (update as data comes in)</div>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
            <div><label style="display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">Impressions</label><input id="rtCampImpressions" type="number" placeholder="0" style="width: 100%; padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box;"></div>
            <div><label style="display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">Clicks</label><input id="rtCampClicks" type="number" placeholder="0" style="width: 100%; padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box;"></div>
            <div><label style="display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">CTR %</label><input id="rtCampCtr" type="number" step="0.01" placeholder="0.00" style="width: 100%; padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box;"></div>
            <div><label style="display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">Conversions</label><input id="rtCampConversions" type="number" placeholder="0" style="width: 100%; padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box;"></div>
            <div><label style="display: block; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">Spend $</label><input id="rtCampSpend" type="number" placeholder="0" style="width: 100%; padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box;"></div>
        </div>
        <div style="display: flex; gap: 12px;">
            <button onclick="_rtSaveCampaign()" class="btn-admin primary" style="padding: 12px 28px; font-weight: 700;">Save Campaign</button>
            <button onclick="_rtSwitchTab('campaigns')" class="btn-admin" style="padding: 12px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
        </div>
    </div>`;
    const sel = document.getElementById('rtCampClient');
    if (typeof clients !== 'undefined') clients.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name || c.businessName || 'Client #' + c.id; sel.appendChild(o); });
}

async function _rtSaveCampaign() {
    const name = document.getElementById('rtCampName').value.trim();
    if (!name) { alert('Campaign name required.'); return; }
    const sel = document.getElementById('rtCampClient');
    const row = {
        client_id: sel.value || null,
        client_name: sel.options[sel.selectedIndex]?.textContent || '',
        platform: document.getElementById('rtCampPlatform').value,
        name: name,
        campaign_type: document.getElementById('rtCampType').value,
        status: document.getElementById('rtCampStatus').value,
        budget: parseFloat(document.getElementById('rtCampBudget').value) || null,
        impressions: parseInt(document.getElementById('rtCampImpressions').value) || null,
        clicks: parseInt(document.getElementById('rtCampClicks').value) || null,
        ctr: parseFloat(document.getElementById('rtCampCtr').value) || null,
        conversions: parseInt(document.getElementById('rtCampConversions').value) || null,
        spend: parseFloat(document.getElementById('rtCampSpend').value) || null
    };
    try {
        const { error } = await supabaseClient.from('retargeting_campaigns').insert(row);
        if (error) throw error;
        alert('✅ Campaign saved!');
        _rtLoadData();
        _rtCurrentTab = 'campaigns';
    } catch (e) { alert('Save failed: ' + e.message); }
}
