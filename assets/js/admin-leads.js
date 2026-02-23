function loadAdminLeadsPanel() {
    // Sync any new meetings to leads first
    if (typeof syncMeetingsToLeads === 'function') syncMeetingsToLeads();

    const newLeads = leads.filter(l => l.status === 'new').length;
    const calendlyLeads = leads.filter(l => l.source === 'calendly').length;
    const completedMeetings = leads.filter(l => l.lastMeetingOutcome === 'completed').length;
    const missedMeetings = leads.filter(l => l.lastMeetingOutcome === 'missed').length;
    const rebookMeetings = leads.filter(l => l.lastMeetingOutcome === 'rebook').length;

    document.getElementById('adminLeadsPanel').innerHTML = `
<div class="flex-between mb-32">
    <h2 class="fs-28 fw-700">Submissions</h2>
    <div style="display: flex; gap: 8px;">
        <button onclick="addManualLead()" class="btn-cta">+ Add Submission</button>
        <button onclick="syncMeetingsToLeads(); loadAdminLeadsPanel();" style="padding: 10px 16px; background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; cursor: pointer; font-size: 13px;">🔄 Sync Meetings</button>
    </div>
</div>

<!-- Stat Cards -->
<div class="stat-cards" style="grid-template-columns: repeat(6, 1fr); margin-bottom: 32px;">
    <div class="stat-card"><div class="num">${leads.length}</div><div class="lbl">Total</div></div>
    <div class="stat-card" style="border-color: var(--green);"><div class="num" style="color: var(--green);">${newLeads}</div><div class="lbl">New</div></div>
    <div class="stat-card"><div class="num">${leads.filter(l => l.status === 'qualified').length}</div><div class="lbl">Qualified</div></div>
    <div class="stat-card"><div class="num">${leads.filter(l => l.status === 'converted').length}</div><div class="lbl">Converted</div></div>
    <div class="stat-card" style="border-color: #3b82f6;"><div class="num" style="color: #3b82f6;">${calendlyLeads}</div><div class="lbl">Calendly</div></div>
    <div class="stat-card" style="border-color: #10b981;"><div class="num" style="color: #10b981;">${completedMeetings}</div><div class="lbl">Good Meetings</div></div>
</div>

<!-- Meeting Outcome Summary -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
    <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700; color: #10b981;">${completedMeetings}</div>
        <div style="font-size: 12px; color: #6ee7b7;">✅ Good Meetings</div>
    </div>
    <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${missedMeetings}</div>
        <div style="font-size: 12px; color: #fca5a5;">❌ Missed</div>
    </div>
    <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 16px; text-align: center;">
        <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${rebookMeetings}</div>
        <div style="font-size: 12px; color: #fcd34d;">🔄 Need Rebook</div>
    </div>
</div>

<div class="form-section">
    <div class="form-section-title">📩 All Submissions</div>
    ${leads.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 2px solid var(--admin-border); text-align: left;">
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Name</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Contact</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Service</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Source</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Meeting</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Status</th>
                <th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted);">Actions</th>
            </tr>
        </thead>
        <tbody>
            ${leads.map(lead => {
                const outcomeColor = lead.lastMeetingOutcome === 'completed' ? '#10b981' : lead.lastMeetingOutcome === 'missed' ? '#ef4444' : lead.lastMeetingOutcome === 'rebook' ? '#f59e0b' : '#888';
                const outcomeLabel = lead.lastMeetingOutcome === 'completed' ? '✅ Good' : lead.lastMeetingOutcome === 'missed' ? '❌ Missed' : lead.lastMeetingOutcome === 'rebook' ? '🔄 Rebook' : '— None';
                const sourceLabel = lead.source === 'calendly' ? '<span style="padding: 2px 6px; background: rgba(59,130,246,0.15); color: #60a5fa; border-radius: 4px; font-size: 10px;">📅 Calendly</span>' : lead.source === 'portal' ? '<span style="padding: 2px 6px; background: rgba(168,85,247,0.15); color: #c084fc; border-radius: 4px; font-size: 10px;">🌐 Portal</span>' : '<span style="padding: 2px 6px; background: rgba(255,255,255,0.08); color: var(--admin-text-muted); border-radius: 4px; font-size: 10px;">✏️ Manual</span>';
                const statusBg = lead.status === 'new' ? '#fef3c7' : lead.status === 'contacted' ? '#dbeafe' : lead.status === 'qualified' ? '#e0e7ff' : lead.status === 'converted' ? '#d1fae5' : lead.status === 'lost' ? '#fee2e2' : '#f5f5f5';
                // Find related meetings for this lead
                const leadMeetings = (typeof meetings !== 'undefined' ? meetings : []).filter(m => {
                    const mEmail = m.clientEmail || m.client_email || '';
                    return mEmail && mEmail === lead.email;
                });
                const meetingCount = leadMeetings.length;
                const nextMeeting = leadMeetings.find(m => !m.outcome && new Date(m.date) >= new Date());
                return `
            <tr style="border-bottom: 1px solid var(--admin-border);">
                <td style="padding: 16px 8px;">
                    <strong style="color: var(--admin-text);">${lead.name}</strong>
                    <br><span style="color: var(--admin-text-muted); font-size: 12px;">${lead.business || '-'}</span>
                </td>
                <td style="padding: 16px 8px;">
                    <a href="mailto:${lead.email}" style="color: #f87171; text-decoration: none;">${lead.email}</a>
                    <br><a href="tel:${lead.phone}" style="color: var(--admin-text-muted); font-size: 12px; text-decoration: none;">${lead.phone || '-'}</a>
                </td>
                <td style="padding: 16px 8px; font-size: 14px; color: var(--admin-text);">${lead.service || '-'}</td>
                <td style="padding: 16px 8px;">${sourceLabel}</td>
                <td style="padding: 16px 8px;">
                    <span style="color: ${outcomeColor}; font-size: 13px; font-weight: 600;">${outcomeLabel}</span>
                    ${lead.lastMeetingDate ? '<br><span style="color: var(--admin-text-muted); font-size: 11px;">' + new Date(lead.lastMeetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>' : ''}
                    ${meetingCount > 0 ? '<br><span style="color: var(--admin-text-muted); font-size: 10px;">' + meetingCount + ' meeting' + (meetingCount > 1 ? 's' : '') + '</span>' : ''}
                    ${nextMeeting ? '<br><span style="color: #60a5fa; font-size: 10px;">📅 Next: ' + new Date(nextMeeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>' : ''}
                    <div style="display: flex; gap: 3px; margin-top: 6px;">
                        <button onclick="setLeadMeetingOutcome(${lead.id}, 'completed')" title="Good" style="padding: 3px 6px; font-size: 10px; border: 1px solid ${lead.lastMeetingOutcome === 'completed' ? '#10b981' : 'var(--admin-border)'}; background: ${lead.lastMeetingOutcome === 'completed' ? 'rgba(16,185,129,0.2)' : 'transparent'}; color: ${lead.lastMeetingOutcome === 'completed' ? '#10b981' : 'var(--admin-text-muted)'}; border-radius: 4px; cursor: pointer;">✅</button>
                        <button onclick="setLeadMeetingOutcome(${lead.id}, 'missed')" title="Missed" style="padding: 3px 6px; font-size: 10px; border: 1px solid ${lead.lastMeetingOutcome === 'missed' ? '#ef4444' : 'var(--admin-border)'}; background: ${lead.lastMeetingOutcome === 'missed' ? 'rgba(239,68,68,0.2)' : 'transparent'}; color: ${lead.lastMeetingOutcome === 'missed' ? '#ef4444' : 'var(--admin-text-muted)'}; border-radius: 4px; cursor: pointer;">❌</button>
                        <button onclick="setLeadMeetingOutcome(${lead.id}, 'rebook')" title="Rebook" style="padding: 3px 6px; font-size: 10px; border: 1px solid ${lead.lastMeetingOutcome === 'rebook' ? '#f59e0b' : 'var(--admin-border)'}; background: ${lead.lastMeetingOutcome === 'rebook' ? 'rgba(245,158,11,0.2)' : 'transparent'}; color: ${lead.lastMeetingOutcome === 'rebook' ? '#f59e0b' : 'var(--admin-text-muted)'}; border-radius: 4px; cursor: pointer;">🔄</button>
                    </div>
                </td>
                <td style="padding: 16px 8px;">
                    <select onchange="updateLeadStatus(${lead.id}, this.value)" style="padding: 6px 10px; border: 1px solid var(--admin-border); border-radius: 4px; font-size: 13px; background: ${statusBg}; color: #333; cursor: pointer;">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>🟡 New</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>📞 Contacted</option>
                        <option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>⭐ Qualified</option>
                        <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>✅ Converted</option>
                        <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>❌ Lost</option>
                    </select>
                </td>
                <td style="padding: 16px 8px;">
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        <button onclick="convertLeadToClient(${lead.id})" style="padding: 6px 10px; background: var(--green); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;" title="Convert to Client">→ Client</button>
                        <button onclick="viewLeadDetails(${lead.id})" style="padding: 6px 10px; background: rgba(59,130,246,0.15); color: #60a5fa; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;" title="View Details">👁️</button>
                        <button onclick="deleteLead(${lead.id})" style="padding: 6px 10px; background: rgba(239,68,68,0.15); color: #ef4444; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;" title="Delete">×</button>
                    </div>
                </td>
            </tr>
                `;}).join('')}
        </tbody>
    </table>
    ` : '<p style="text-align: center; color: var(--admin-text-muted); padding: 40px;">No submissions yet. Form fills and Calendly bookings will auto-appear here.</p>'}
</div>

<div class="form-section mt-24">
    <div class="form-section-title">🔗 Lead Pipeline Info</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="padding: 16px; background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: 12px;">
            <h4 style="color: var(--admin-text); margin-bottom: 8px; font-size: 14px;">📅 Meeting → Lead Flow</h4>
            <p style="color: var(--admin-text-muted); font-size: 13px; line-height: 1.6;">When a client books via Calendly or the portal, a lead is auto-created. Mark meetings as Good/Missed/Rebook on the Calendar or directly in this table.</p>
            <button onclick="showAdminPanel('calendar')" style="margin-top: 12px; padding: 8px 16px; background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); border-radius: 6px; cursor: pointer; font-size: 13px;">Go to Calendar →</button>
        </div>
        <div style="padding: 16px; background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: 12px;">
            <h4 style="color: var(--admin-text); margin-bottom: 8px; font-size: 14px;">🔄 Status Auto-Updates</h4>
            <p style="color: var(--admin-text-muted); font-size: 13px; line-height: 1.6;">
                ✅ Good meeting → Lead marked <strong>Qualified</strong><br>
                ❌ Missed meeting → Lead stays <strong>Contacted</strong><br>
                🔄 Rebook → Lead stays <strong>Contacted</strong><br>
                → Client button → Creates client + marks <strong>Converted</strong>
            </p>
        </div>
    </div>
</div>
    `;
}

// ==================== LEAD ACTION FUNCTIONS ====================

// --- Update lead status ---
function updateLeadStatus(leadId, newStatus) {
    const lead = leads.find(l => l.id == leadId);
    if (!lead) return;
    lead.status = newStatus;
    lead.updatedAt = new Date().toISOString();
    saveLeads();
    loadAdminLeadsPanel();
}

// --- Set meeting outcome directly from leads table ---
function setLeadMeetingOutcome(leadId, outcome) {
    const lead = leads.find(l => l.id == leadId);
    if (!lead) return;

    lead.lastMeetingOutcome = outcome;
    lead.lastMeetingDate = lead.lastMeetingDate || new Date().toISOString().split('T')[0];

    // Auto-update lead status based on outcome
    if (outcome === 'completed') {
        lead.status = 'qualified';
    } else if (outcome === 'missed') {
        if (lead.status === 'new') lead.status = 'contacted';
    } else if (outcome === 'rebook') {
        if (lead.status === 'new') lead.status = 'contacted';
    }

    // Also update the matching meeting in meetings array if it exists
    if (typeof meetings !== 'undefined' && lead.email) {
        const matchingMeeting = meetings.find(m => {
            const mEmail = m.clientEmail || m.client_email || '';
            return mEmail === lead.email;
        });
        if (matchingMeeting) {
            matchingMeeting.outcome = outcome;
            localStorage.setItem('nui_meetings', JSON.stringify(meetings));
            // Try to persist to backend
            if (matchingMeeting.id || matchingMeeting.serverId) {
                fetch('/.netlify/functions/save-booking', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: matchingMeeting.id || matchingMeeting.serverId, outcome: outcome })
                }).catch(err => console.warn('Backend sync skipped:', err));
            }
        }
    }

    saveLeads();
    loadAdminLeadsPanel();
}

// --- Convert lead to client ---
function convertLeadToClient(leadId) {
    const lead = leads.find(l => l.id == leadId);
    if (!lead) return;

    if (!confirm(`Convert "${lead.name}" to a client? This will create a new client account.`)) return;

    // Check if client already exists
    const existingClient = clients.find(c => c.email === lead.email);
    if (existingClient) {
        alert(`Client with email ${lead.email} already exists: ${existingClient.name}`);
        lead.status = 'converted';
        saveLeads();
        loadAdminLeadsPanel();
        return;
    }

    // Create new client
    const newClient = {
        id: Date.now(),
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        business: lead.business || '',
        type: 'client',
        password: 'nui2024',
        createdAt: new Date().toISOString(),
        convertedFrom: 'lead',
        leadId: lead.id
    };

    clients.push(newClient);
    localStorage.setItem('nui_clients', JSON.stringify(clients));
    if (typeof syncToBackend === 'function') syncToBackend('clients', clients);

    // Update lead status
    lead.status = 'converted';
    lead.convertedAt = new Date().toISOString();
    lead.convertedClientId = newClient.id;
    saveLeads();

    alert(`✅ "${lead.name}" is now a client! Default password: nui2024`);
    loadAdminLeadsPanel();
}

// --- Delete lead ---
function deleteLead(leadId) {
    const lead = leads.find(l => l.id == leadId);
    if (!lead) return;
    if (!confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return;

    const idx = leads.findIndex(l => l.id == leadId);
    if (idx > -1) leads.splice(idx, 1);
    saveLeads();
    loadAdminLeadsPanel();
}

// --- Add manual lead ---
function addManualLead() {
    const modal = document.createElement('div');
    modal.id = 'leadModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
    modal.innerHTML = `
<div style="background: var(--admin-card, #1a1a2e); border: 1px solid var(--admin-border, #333); border-radius: 16px; padding: 32px; width: 480px; max-width: 90vw; max-height: 90vh; overflow-y: auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="color: var(--admin-text, #fff); font-size: 20px; font-weight: 700;">+ Add New Lead</h3>
        <button onclick="document.getElementById('leadModal').remove()" style="background: none; border: none; color: var(--admin-text-muted, #888); font-size: 24px; cursor: pointer;">×</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
            <label style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px; display: block;">Name *</label>
            <input id="leadName" type="text" placeholder="Full name" style="width: 100%; padding: 10px 14px; background: var(--admin-bg, #0d0d1a); border: 1px solid var(--admin-border, #333); border-radius: 8px; color: var(--admin-text, #fff); font-size: 14px;" />
        </div>
        <div>
            <label style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px; display: block;">Email *</label>
            <input id="leadEmail" type="email" placeholder="email@example.com" style="width: 100%; padding: 10px 14px; background: var(--admin-bg, #0d0d1a); border: 1px solid var(--admin-border, #333); border-radius: 8px; color: var(--admin-text, #fff); font-size: 14px;" />
        </div>
        <div>
            <label style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px; display: block;">Phone</label>
            <input id="leadPhone" type="tel" placeholder="(555) 123-4567" style="width: 100%; padding: 10px 14px; background: var(--admin-bg, #0d0d1a); border: 1px solid var(--admin-border, #333); border-radius: 8px; color: var(--admin-text, #fff); font-size: 14px;" />
        </div>
        <div>
            <label style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px; display: block;">Business</label>
            <input id="leadBusiness" type="text" placeholder="Business name" style="width: 100%; padding: 10px 14px; background: var(--admin-bg, #0d0d1a); border: 1px solid var(--admin-border, #333); border-radius: 8px; color: var(--admin-text, #fff); font-size: 14px;" />
        </div>
        <div>
            <label style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px; display: block;">Service Interest</label>
            <select id="leadService" style="width: 100%; padding: 10px 14px; background: var(--admin-bg, #0d0d1a); border: 1px solid var(--admin-border, #333); border-radius: 8px; color: var(--admin-text, #fff); font-size: 14px;">
                <option value="">— Select Service —</option>
                <option value="Brand Identity Package">Brand Identity Package</option>
                <option value="Logo Design">Logo Design</option>
                <option value="Brand Strategy & Positioning">Brand Strategy & Positioning</option>
                <option value="Website Design">Website Design</option>
                <option value="Social Media Design">Social Media Design</option>
                <option value="Signage & Storefront Design">Signage & Storefront Design</option>
                <option value="Print Design">Print Design (Business Cards, Flyers, Menus)</option>
                <option value="Brand Guidelines">Brand Guidelines</option>
                <option value="Full Rebrand">Full Rebrand</option>
                <option value="Other">Other / Not Sure Yet</option>
            </select>
        </div>
        <div>
            <label style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px; display: block;">Notes</label>
            <textarea id="leadNotes" rows="3" placeholder="How did they find you? Any details..." style="width: 100%; padding: 10px 14px; background: var(--admin-bg, #0d0d1a); border: 1px solid var(--admin-border, #333); border-radius: 8px; color: var(--admin-text, #fff); font-size: 14px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
            <button onclick="saveManualLead()" style="flex: 1; padding: 12px; background: var(--red, #dc2626); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Save Lead</button>
            <button onclick="document.getElementById('leadModal').remove()" style="flex: 1; padding: 12px; background: transparent; color: var(--admin-text-muted, #888); border: 1px solid var(--admin-border, #333); border-radius: 8px; font-size: 14px; cursor: pointer;">Cancel</button>
        </div>
    </div>
</div>
    `;
    document.body.appendChild(modal);
    document.getElementById('leadName').focus();
}

// --- Save manual lead ---
function saveManualLead() {
    const name = document.getElementById('leadName').value.trim();
    const email = document.getElementById('leadEmail').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const business = document.getElementById('leadBusiness').value.trim();
    const service = document.getElementById('leadService').value;
    const notes = document.getElementById('leadNotes').value.trim();

    if (!name) { alert('Name is required'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Valid email is required'); return; }

    // Check for duplicates
    if (leads.find(l => l.email === email)) {
        alert(`A lead with email ${email} already exists.`);
        return;
    }

    leads.push({
        id: Date.now(),
        name,
        email,
        phone,
        business,
        service,
        budget: '',
        message: notes,
        status: 'new',
        source: 'manual',
        lastMeetingOutcome: null,
        lastMeetingDate: null,
        createdAt: new Date().toISOString()
    });

    saveLeads();
    document.getElementById('leadModal').remove();
    loadAdminLeadsPanel();
}

// --- View lead details modal ---
function viewLeadDetails(leadId) {
    const lead = leads.find(l => l.id == leadId);
    if (!lead) return;

    // Get all meetings for this lead
    const leadMeetings = (typeof meetings !== 'undefined' ? meetings : []).filter(m => {
        const mEmail = m.clientEmail || m.client_email || '';
        return mEmail && mEmail === lead.email;
    });

    const modal = document.createElement('div');
    modal.id = 'leadDetailModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
    modal.innerHTML = `
<div style="background: var(--admin-card, #1a1a2e); border: 1px solid var(--admin-border, #333); border-radius: 16px; padding: 32px; width: 540px; max-width: 90vw; max-height: 90vh; overflow-y: auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h3 style="color: var(--admin-text, #fff); font-size: 20px; font-weight: 700;">👤 ${lead.name}</h3>
        <button onclick="document.getElementById('leadDetailModal').remove()" style="background: none; border: none; color: var(--admin-text-muted, #888); font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888);">Email</div>
            <a href="mailto:${lead.email}" style="color: #f87171; text-decoration: none;">${lead.email}</a>
        </div>
        <div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888);">Phone</div>
            <a href="tel:${lead.phone}" style="color: #60a5fa; text-decoration: none;">${lead.phone || '—'}</a>
        </div>
        <div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888);">Service Interest</div>
            <div style="color: var(--admin-text, #fff);">${lead.service || '—'}</div>
        </div>
        <div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888);">Source</div>
            <div style="color: var(--admin-text, #fff);">${lead.source === 'calendly' ? '📅 Calendly' : lead.source === 'portal' ? '🌐 Portal' : '✏️ Manual'}</div>
        </div>
        <div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888);">Status</div>
            <div style="color: var(--admin-text, #fff); text-transform: capitalize;">${lead.status}</div>
        </div>
        <div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888);">Last Meeting</div>
            <div style="color: ${lead.lastMeetingOutcome === 'completed' ? '#10b981' : lead.lastMeetingOutcome === 'missed' ? '#ef4444' : lead.lastMeetingOutcome === 'rebook' ? '#f59e0b' : 'var(--admin-text, #fff)'};">
                ${lead.lastMeetingOutcome ? (lead.lastMeetingOutcome === 'completed' ? '✅ Good' : lead.lastMeetingOutcome === 'missed' ? '❌ Missed' : '🔄 Rebook') : '— None yet'}
                ${lead.lastMeetingDate ? ' · ' + new Date(lead.lastMeetingDate).toLocaleDateString() : ''}
            </div>
        </div>
    </div>

    ${lead.message ? `<div style="padding: 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px; margin-bottom: 16px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 4px;">Notes</div>
        <div style="color: var(--admin-text, #fff); font-size: 14px; line-height: 1.5;">${lead.message}</div>
    </div>` : ''}

    ${leadMeetings.length > 0 ? `
    <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; text-transform: uppercase; color: var(--admin-text-muted, #888); margin-bottom: 8px;">📅 Meeting History (${leadMeetings.length})</div>
        ${leadMeetings.map(m => `
        <div style="padding: 10px 12px; background: var(--admin-bg, #0d0d1a); border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="color: var(--admin-text, #fff); font-size: 13px;">${m.type === 'zoom' ? '💻 Zoom' : '📞 Phone'} — ${m.date}</span>
                <span style="font-size: 12px; color: var(--admin-text-muted, #888);"> at ${m.time || '—'}</span>
            </div>
            <span style="font-size: 12px; padding: 2px 8px; border-radius: 4px; background: ${m.outcome === 'completed' ? 'rgba(16,185,129,0.2)' : m.outcome === 'missed' ? 'rgba(239,68,68,0.2)' : m.outcome === 'rebook' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}; color: ${m.outcome === 'completed' ? '#10b981' : m.outcome === 'missed' ? '#ef4444' : m.outcome === 'rebook' ? '#f59e0b' : '#60a5fa'};">
                ${m.outcome === 'completed' ? '✅ Good' : m.outcome === 'missed' ? '❌ Missed' : m.outcome === 'rebook' ? '🔄 Rebook' : '📋 Scheduled'}
            </span>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button onclick="convertLeadToClient(${lead.id}); document.getElementById('leadDetailModal').remove();" style="flex: 1; padding: 12px; background: var(--green, #10b981); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">→ Convert to Client</button>
        <button onclick="document.getElementById('leadDetailModal').remove()" style="flex: 1; padding: 12px; background: transparent; color: var(--admin-text-muted, #888); border: 1px solid var(--admin-border, #333); border-radius: 8px; font-size: 14px; cursor: pointer;">Close</button>
    </div>
</div>
    `;
    document.body.appendChild(modal);
}
