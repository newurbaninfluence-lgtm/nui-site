function loadAdminLeadsPanel() {
    const newLeads = leads.filter(l => l.status === 'new').length;
    document.getElementById('adminLeadsPanel').innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
<h2 style="font-size: 28px; font-weight: 700;">Lead Management</h2>
<button onclick="addManualLead()" class="btn-cta">+ Add Lead</button>
</div>

<div class="stat-cards" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 32px;">
<div class="stat-card"><div class="num">${leads.length}</div><div class="lbl">Total Leads</div></div>
<div class="stat-card" style="border-color: var(--green);"><div class="num" style="color: var(--green);">${newLeads}</div><div class="lbl">New Leads</div></div>
<div class="stat-card"><div class="num">${leads.filter(l => l.status === 'converted').length}</div><div class="lbl">Converted</div></div>
</div>

<div class="form-section">
<div class="form-section-title">🎯 All Leads</div>
            ${leads.length > 0 ? `
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="border-bottom: 2px solid #e5e5e5; text-align: left;">
<th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #888;">Name</th>
<th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #888;">Contact</th>
<th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #888;">Service</th>
<th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #888;">Budget</th>
<th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #888;">Status</th>
<th style="padding: 12px 8px; font-size: 12px; text-transform: uppercase; color: #888;">Actions</th>
</tr>
</thead>
<tbody>
                    ${leads.map(lead => `
<tr style="border-bottom: 1px solid #e5e5e5;">
<td style="padding: 16px 8px;"><strong>${lead.name}</strong><br><span style="font-size: 12px; color: #888;">${lead.business || '-'}</span></td>
<td style="padding: 16px 8px;"><a href="mailto:${lead.email}" style="color: var(--red);">${lead.email}</a><br><span style="font-size: 12px; color: #888;">${lead.phone || '-'}</span></td>
<td style="padding: 16px 8px; font-size: 14px;">${lead.service || '-'}</td>
<td style="padding: 16px 8px; font-size: 14px;">${lead.budget || '-'}</td>
<td style="padding: 16px 8px;">
<select onchange="updateLeadStatus(${lead.id}, this.value)" style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; background: ${lead.status === 'new' ? '#fef3c7' : lead.status === 'contacted' ? '#dbeafe' : lead.status === 'converted' ? '#d1fae5' : '#f5f5f5'};">
<option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
<option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
<option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>Qualified</option>
<option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
<option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Lost</option>
</select>
</td>
<td style="padding: 16px 8px;">
<button onclick="convertLeadToClient(${lead.id})" style="padding: 6px 12px; background: var(--green); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 4px;">→ Client</button>
<button onclick="deleteLead(${lead.id})" style="padding: 6px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">×</button>
</td>
</tr>
                    `).join('')}
</tbody>
</table>
            ` : '<p style="text-align: center; color: #888; padding: 40px;">No leads yet. Generate a lead form to start capturing leads!</p>'}
</div>

<div class="form-section" style="margin-top: 24px;">
<div class="form-section-title">🔗 Get Your Lead Form</div>
<p style="color: #666; margin-bottom: 16px;">Go to <strong>New Order</strong> → Select a package → Click "Generate Lead Form" to get embeddable form code.</p>
<button onclick="showAdminPanel('neworder')" class="btn-cta">Go to New Order →</button>
</div>
    `;
}

function updateLeadStatus(leadId, newStatus) {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
        lead.status = newStatus;
        saveLeads();
        loadAdminLeadsPanel();
    }
}

function convertLeadToClient(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    if (!confirm('Convert ' + lead.name + ' to a client?')) return;

    // Create new client from lead
    const newClient = {
        id: Date.now(),
        name: lead.business || lead.name,
        email: lead.email,
        password: 'client' + Math.random().toString(36).substring(7),
        industry: '',
        website: '',
        colors: ['#ff0000', '#000000', '#ffffff'],
        fonts: { heading: 'Inter', body: 'Inter' },
        assets: { logos: [], mockups: [], social: [], video: [], banner: [], fonts: [], patterns: [], package: [] }
    };
    clients.push(newClient);
    saveClients();

    // Update lead status
    lead.status = 'converted';
    saveLeads();

    alert('Client created!\nEmail: ' + newClient.email + '\nPassword: ' + newClient.password);
    loadAdminLeadsPanel();
}

function deleteLead(leadId) {
    if (!confirm('Delete this lead?')) return;
    leads = leads.filter(l => l.id !== leadId);
    saveLeads();
    loadAdminLeadsPanel();
}

function addManualLead() {
    const name = prompt('Lead Name:');
    if (!name) return;
    const email = prompt('Email:');
    const phone = prompt('Phone:');
    const service = prompt('Service Interest:');
    const budget = prompt('Budget:');

    const newLead = {
        id: Date.now(),
        name, email, phone,
        business: '',
        service, budget,
        message: '',
        status: 'new',
        createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    saveLeads();

    // Trigger workflow: Add to pipeline and email subscribers
    triggerNewLead(newLead.id);

    loadAdminLeadsPanel();
}

// Service Packages defined globally at top of file

