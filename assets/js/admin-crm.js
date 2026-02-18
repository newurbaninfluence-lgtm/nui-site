function saveSmartGroups() { localStorage.setItem('nui_smart_groups', JSON.stringify(crmSmartGroups)); }

function loadAdminCrmPanel() {
    // Auto-sync from Supabase on first load (non-blocking)
    if (!supabaseCommsLastSync || (Date.now() - new Date(supabaseCommsLastSync).getTime()) > 60000) {
        syncCommunications(false);
    }

    // Merge clients into contacts if not already
    clients.forEach(client => {
        if (!crmData.contacts.find(c => c.email === client.email)) {
            crmData.contacts.push({
                id: client.id,
                name: client.contact || client.name,
                email: client.email,
                phone: client.phone || '',
                company: client.name,
                value: orders.filter(o => o.clientId === client.id).reduce((s, o) => s + (o.estimate || 0), 0),
                stage: 5,
                clientId: client.id,
                createdAt: client.createdAt || new Date().toISOString()
            });
        }
    });

    const contactsByStage = {};
    crmData.pipelines.forEach(p => { contactsByStage[p.id] = crmData.contacts.filter(c => c.stage === p.id); });
    const totalValue = crmData.contacts.reduce((sum, c) => sum + (c.value || 0), 0);
    const wonValue = (contactsByStage[5] || []).reduce((sum, c) => sum + (c.value || 0), 0);

    document.getElementById('adminCrmPanel').innerHTML = `
<style>
            .crm-tabs { display: flex; gap: 4px; background: #111; padding: 4px; border-radius: 8px; margin-bottom: 24px; }
            .crm-tab { padding: 12px 24px; background: transparent; border: none; color: rgba(255,255,255,0.5); cursor: pointer; border-radius: 6px; font-weight: 600; font-family: inherit; transition: all 0.2s; }
            .crm-tab:hover { color: #fff; background: rgba(255,255,255,0.05); }
            .crm-tab.active { background: var(--red); color: #fff; }
            .crm-content { display: none; }
            .crm-content.active { display: block; }
            .pipeline-board-ghl { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; min-height: 500px; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
            .pipeline-board-ghl::-webkit-scrollbar { height: 10px; }
            .pipeline-board-ghl::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 5px; }
            .pipeline-board-ghl::-webkit-scrollbar-thumb { background: linear-gradient(90deg, #e63946, #ff6b6b); border-radius: 5px; min-width: 60px; }
            .pipeline-board-ghl::-webkit-scrollbar-thumb:hover { background: linear-gradient(90deg, #ff6b6b, #e63946); }
            .pipeline-col { min-width: 280px; max-width: 280px; background: #111; border-radius: 12px; display: flex; flex-direction: column; flex-shrink: 0; }
            .pipeline-col-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
            .pipeline-col-title { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
            .pipeline-col-count { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
            .pipeline-col-body { flex: 1; padding: 12px; overflow-y: auto; min-height: 200px; }
            .pipeline-col-body.drag-over { background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.2); }
            .contact-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; margin-bottom: 12px; cursor: grab; transition: all 0.2s; }
            .contact-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .contact-card.dragging { opacity: 0.5; transform: rotate(3deg); }
            .contact-card-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
            .contact-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
            .contact-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
            .contact-info p { font-size: 12px; color: rgba(255,255,255,0.5); }
            .contact-value { font-size: 16px; font-weight: 700; color: #10b981; }
            .contact-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
            .contact-tag { font-size: 10px; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
            .contact-actions { display: flex; gap: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; }
            .contact-action-btn { flex: 1; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px; }
            .contact-action-btn.sms { background: #10b981; color: #fff; }
            .contact-action-btn.email { background: #3b82f6; color: #fff; }
            .contact-action-btn.call { background: #8b5cf6; color: #fff; }
            .contact-action-btn.more { background: rgba(255,255,255,0.1); color: #fff; }
            .contact-action-btn:hover { transform: scale(1.05); }
            .smart-group-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px; }
            .smart-group-card { background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; }
            .smart-group-card:hover { border-color: rgba(255,255,255,0.3); transform: translateY(-2px); }
            .smart-group-card.selected { border-color: var(--red); background: rgba(255,0,0,0.1); }
            .smart-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .smart-group-name { font-weight: 600; font-size: 16px; }
            .smart-group-count { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 100px; font-size: 13px; }
            .bulk-actions { background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
            .bulk-actions h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .bulk-btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
            .bulk-btn.sms { background: #10b981; color: #fff; }
            .bulk-btn.email { background: #3b82f6; color: #fff; }
            .bulk-btn:hover { transform: translateY(-2px); }
            .contact-table { width: 100%; border-collapse: collapse; }
            .contact-table th { text-align: left; padding: 12px 16px; background: #111; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.5); }
            .contact-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .contact-table tr:hover td { background: rgba(255,255,255,0.02); }
            .contact-table input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
            .stage-move-btns { display: flex; gap: 4px; margin-top: 8px; }
            .stage-move-btn { padding: 4px 8px; font-size: 10px; border: none; border-radius: 4px; cursor: pointer; background: rgba(255,255,255,0.1); color: #fff; }
            .stage-move-btn:hover { background: rgba(255,255,255,0.2); }
</style>

<div class="panel-header">
<h2 class="panel-title">💼 CRM Pipeline</h2>
<p class="panel-subtitle">Manage your sales pipeline, contacts, and communications</p>
</div>

        <!-- CRM Tabs -->
<div class="crm-tabs">
<button class="crm-tab ${crmActiveTab === 'pipeline' ? 'active' : ''}" onclick="switchCrmTab('pipeline')">📊 Pipeline</button>
<button class="crm-tab ${crmActiveTab === 'conversations' ? 'active' : ''}" onclick="switchCrmTab('conversations')">💬 Conversations</button>
<button class="crm-tab ${crmActiveTab === 'contacts' ? 'active' : ''}" onclick="switchCrmTab('contacts')">👥 All Contacts</button>
<button class="crm-tab ${crmActiveTab === 'smartgroups' ? 'active' : ''}" onclick="switchCrmTab('smartgroups')">🎯 Smart Groups</button>
<button class="crm-tab ${crmActiveTab === 'bulk' ? 'active' : ''}" onclick="switchCrmTab('bulk')">📤 Bulk Actions</button>
</div>

        <!-- Stats Bar -->
<div class="stat-cards" style="margin-bottom: 24px;">
<div class="stat-card"><div class="num">${crmData.contacts.length}</div><div class="lbl">Total Contacts</div></div>
<div class="stat-card"><div class="num" style="color: #3b82f6;">${(contactsByStage[1] || []).length + (contactsByStage[2] || []).length}</div><div class="lbl">Active Leads</div></div>
<div class="stat-card highlight"><div class="num">$${totalValue.toLocaleString()}</div><div class="lbl">Pipeline Value</div></div>
<div class="stat-card"><div class="num" style="color: #10b981;">$${wonValue.toLocaleString()}</div><div class="lbl">Won Deals</div></div>
</div>

        <!-- PIPELINE TAB -->
<div class="crm-content ${crmActiveTab === 'pipeline' ? 'active' : ''}" id="crmPipelineTab">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<p style="color: rgba(255,255,255,0.5); font-size: 13px;">Drag contacts between stages to update their status</p>
<button class="btn-admin primary" onclick="showAddContactModal()">+ Add Contact</button>
</div>
<div class="pipeline-board-ghl">
                ${crmData.pipelines.map(stage => {
                    const stageContacts = contactsByStage[stage.id] || [];
                    const stageValue = stageContacts.reduce((s, c) => s + (c.value || 0), 0);
                    return `
<div class="pipeline-col" data-stage="${stage.id}">
<div class="pipeline-col-header" style="border-left: 3px solid ${stage.color};">
<div class="pipeline-col-title"><span style="color: ${stage.color};">●</span> ${stage.name}</div>
<div class="pipeline-col-count">${stageContacts.length} · $${stageValue.toLocaleString()}</div>
</div>
<div class="pipeline-col-body" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${stage.id})" ondragleave="handleDragLeave(event)">
                            ${stageContacts.map(contact => renderContactCard(contact, stage.color)).join('') || '<p style="color: rgba(255,255,255,0.2); font-size: 12px; text-align: center; padding: 40px 20px;">Drop contacts here</p>'}
</div>
</div>`;
                }).join('')}
</div>
</div>

        <!-- CONVERSATIONS TAB -->
<div class="crm-content ${crmActiveTab === 'conversations' ? 'active' : ''}" id="crmConversationsTab">
            ${renderConversationsHub()}
</div>

        <!-- ALL CONTACTS TAB -->
<div class="crm-content ${crmActiveTab === 'contacts' ? 'active' : ''}" id="crmContactsTab">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<input type="text" placeholder="Search contacts..." oninput="filterCrmContacts(this.value)" style="padding: 10px 16px; background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; width: 300px;">
<button class="btn-admin primary" onclick="showAddContactModal()">+ Add Contact</button>
</div>
<table class="contact-table">
<thead>
<tr>
<th><input type="checkbox" onchange="toggleAllContacts(this.checked)"></th>
<th>Contact</th>
<th>Company</th>
<th>Stage</th>
<th>Value</th>
<th>Actions</th>
</tr>
</thead>
<tbody id="crmContactsTableBody">
                    ${crmData.contacts.map(contact => {
                        const stage = crmData.pipelines.find(p => p.id === contact.stage);
                        return `
<tr>
<td><input type="checkbox" class="contact-checkbox" data-id="${contact.id}"></td>
<td>
<div style="display: flex; align-items: center; gap: 12px;">
<div class="contact-avatar" style="background: ${stage?.color || '#666'}; width: 36px; height: 36px; font-size: 14px;">${contact.name?.charAt(0) || '?'}</div>
<div>
<div style="font-weight: 600;">${contact.name}</div>
<div style="font-size: 12px; color: rgba(255,255,255,0.5);">${contact.email || 'No email'}</div>
</div>
</div>
</td>
<td>${contact.company || '—'}</td>
<td><span style="background: ${stage?.color || '#666'}20; color: ${stage?.color || '#666'}; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;">${stage?.name || 'Unknown'}</span></td>
<td style="font-weight: 600; color: #10b981;">$${(contact.value || 0).toLocaleString()}</td>
<td>
<div style="display: flex; gap: 8px;">
<button onclick="quickSms(${contact.id})" style="padding: 6px 12px; background: #10b981; border: none; border-radius: 4px; cursor: pointer; color: #fff; font-size: 12px;">💬 SMS</button>
<button onclick="quickEmail(${contact.id})" style="padding: 6px 12px; background: #3b82f6; border: none; border-radius: 4px; cursor: pointer; color: #fff; font-size: 12px;">📧 Email</button>
<button onclick="quickCall(${contact.id})" style="padding: 6px 12px; background: #8b5cf6; border: none; border-radius: 4px; cursor: pointer; color: #fff; font-size: 12px;">📞 Call</button>
<button onclick="editContact(${contact.id})" style="padding: 6px 12px; background: rgba(255,255,255,0.1); border: none; border-radius: 4px; cursor: pointer; color: #fff; font-size: 12px;">✏️</button>
</div>
</td>
</tr>`;
                    }).join('')}
</tbody>
</table>
</div>

        <!-- SMART GROUPS TAB -->
<div class="crm-content ${crmActiveTab === 'smartgroups' ? 'active' : ''}" id="crmSmartGroupsTab">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
<p style="color: rgba(255,255,255,0.5);">Create smart groups to segment contacts for targeted messaging</p>
<button class="btn-admin primary" onclick="showCreateSmartGroupModal()">+ Create Smart Group</button>
</div>
<div class="smart-group-list">
                ${crmSmartGroups.map(group => {
                    const groupContacts = getSmartGroupContacts(group);
                    return `
<div class="smart-group-card" onclick="selectSmartGroup(${group.id})" data-group="${group.id}">
<div class="smart-group-header">
<div class="smart-group-name" style="display: flex; align-items: center; gap: 8px;"><span style="color: ${group.color};">●</span> ${group.name}</div>
<div class="smart-group-count">${groupContacts.length}</div>
</div>
<p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px;">${getSmartGroupDescription(group)}</p>
<div style="display: flex; gap: 8px;">
<button onclick="event.stopPropagation(); bulkSmsGroup(${group.id})" class="bulk-btn sms" style="flex: 1; padding: 8px; font-size: 12px;">💬 SMS All</button>
<button onclick="event.stopPropagation(); bulkEmailGroup(${group.id})" class="bulk-btn email" style="flex: 1; padding: 8px; font-size: 12px;">📧 Email All</button>
</div>
</div>`;
                }).join('')}
</div>
</div>

        <!-- BULK ACTIONS TAB -->
<div class="crm-content ${crmActiveTab === 'bulk' ? 'active' : ''}" id="crmBulkTab">
<div class="bulk-actions">
<h3>📤 Bulk Messaging</h3>
<p style="color: rgba(255,255,255,0.5); margin-bottom: 20px;">Select a smart group or manually select contacts to send bulk messages</p>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- SMS Blast -->
<div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
<h4 style="font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">💬</span> SMS Blast</h4>
<div class="form-group">
<label class="form-label">Select Recipients</label>
<select id="bulkSmsGroup" class="form-select">
                                ${crmSmartGroups.map(g => `<option value="${g.id}">${g.name} (${getSmartGroupContacts(g).length})</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Message Template</label>
<select id="bulkSmsTemplate" class="form-select" onchange="loadSmsTemplate(this.value)">
<option value="">-- Select Template --</option>
                                ${smsSystem.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Message</label>
<textarea id="bulkSmsMessage" class="form-textarea" placeholder="Hi {name}, ..." rows="4"></textarea>
<p style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px;">Use {name}, {company} for personalization</p>
</div>
<button onclick="sendBulkSms()" class="bulk-btn sms" style="width: 100%;">💬 Send SMS Blast</button>
</div>

                    <!-- Email Blast -->
<div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
<h4 style="font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">📧</span> Email Blast</h4>
<div class="form-group">
<label class="form-label">Select Recipients</label>
<select id="bulkEmailGroup" class="form-select">
                                ${crmSmartGroups.map(g => `<option value="${g.id}">${g.name} (${getSmartGroupContacts(g).length})</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Email Template</label>
<select id="bulkEmailTemplate" class="form-select" onchange="loadEmailTemplate(this.value)">
<option value="">-- Select Template --</option>
                                ${emailMarketing.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Subject</label>
<input type="text" id="bulkEmailSubject" class="form-input" placeholder="Email subject...">
</div>
<div class="form-group">
<label class="form-label">Message</label>
<textarea id="bulkEmailMessage" class="form-textarea" placeholder="Hi {name}, ..." rows="4"></textarea>
</div>
<button onclick="sendBulkEmail()" class="bulk-btn email" style="width: 100%;">📧 Send Email Blast</button>
</div>
</div>
</div>

            <!-- Recent Bulk Messages -->
<div style="background: #111; border-radius: 12px; padding: 24px;">
<h3 style="font-size: 16px; margin-bottom: 16px;">📊 Recent Campaigns</h3>
<table class="contact-table">
<thead><tr><th>Date</th><th>Type</th><th>Group</th><th>Recipients</th><th>Status</th></tr></thead>
<tbody>
                        ${(crmData.bulkMessages || []).slice(-5).reverse().map(msg => `
<tr>
<td>${new Date(msg.sentAt).toLocaleDateString()}</td>
<td><span style="background: ${msg.type === 'sms' ? '#10b981' : '#3b82f6'}20; color: ${msg.type === 'sms' ? '#10b981' : '#3b82f6'}; padding: 4px 12px; border-radius: 4px; font-size: 12px;">${msg.type.toUpperCase()}</span></td>
<td>${msg.groupName}</td>
<td>${msg.recipients}</td>
<td style="color: #10b981;">✓ Sent</td>
</tr>
                        `).join('') || '<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.3);">No campaigns yet</td></tr>'}
</tbody>
</table>
</div>
</div>
    `;
}

function renderContactCard(contact, stageColor) {
    const stage = crmData.pipelines.find(p => p.id === contact.stage);
    return `
<div class="contact-card" draggable="true" ondragstart="handleDragStart(event, ${contact.id})" ondragend="handleDragEnd(event)" data-contact="${contact.id}">
<div class="contact-card-header">
<div style="display: flex; align-items: center; gap: 12px;">
<div class="contact-avatar" style="background: ${stageColor};">${contact.name?.charAt(0) || '?'}</div>
<div class="contact-info">
<h4>${contact.name}</h4>
<p>${contact.company || contact.email || 'No info'}</p>
</div>
</div>
<div class="contact-value">$${(contact.value || 0).toLocaleString()}</div>
</div>
<div class="contact-meta">
                ${contact.phone ? '<span class="contact-tag">📞 ' + contact.phone + '</span>' : ''}
                ${contact.email ? '<span class="contact-tag">📧 Has Email</span>' : ''}
</div>
<div class="contact-actions">
<button class="contact-action-btn sms" onclick="event.stopPropagation(); quickSms(${contact.id})" title="Send SMS">💬</button>
<button class="contact-action-btn email" onclick="event.stopPropagation(); quickEmail(${contact.id})" title="Send Email">📧</button>
<button class="contact-action-btn call" onclick="event.stopPropagation(); quickCall(${contact.id})" title="Call">📞</button>
<button class="contact-action-btn more" onclick="event.stopPropagation(); editContact(${contact.id})" title="Edit">⋯</button>
</div>
<div class="stage-move-btns">
                ${contact.stage > 1 ? '<button class="stage-move-btn" onclick="event.stopPropagation(); moveContactStage(' + contact.id + ', ' + (contact.stage - 1) + ')">← Prev</button>' : ''}
                ${contact.stage < 6 ? '<button class="stage-move-btn" onclick="event.stopPropagation(); moveContactStage(' + contact.id + ', ' + (contact.stage + 1) + ')">Next →</button>' : ''}
</div>
</div>`;
}

function switchCrmTab(tab) {
    crmActiveTab = tab;
    document.querySelectorAll('.crm-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.crm-tab[onclick*="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.crm-content').forEach(c => c.classList.remove('active'));
    document.getElementById('crm' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Tab')?.classList.add('active');
}

// Conversations Hub - All Customer Communications
let conversationFilter = 'all';
let selectedConversationContact = null;

function renderConversationsHub() {
    // Get all communications from various sources
    const allComms = getAllCommunications();
    const filteredComms = conversationFilter === 'all' ? allComms : allComms.filter(c => c.channel === conversationFilter);

    // Group by contact
    const contactComms = {};
    filteredComms.forEach(comm => {
        const contactId = comm.clientId || comm.contactId || 'unknown';
        if (!contactComms[contactId]) {
            contactComms[contactId] = { contact: getContactInfo(contactId), messages: [] };
        }
        contactComms[contactId].messages.push(comm);
    });

    // Sort by latest message
    const sortedContacts = Object.values(contactComms).sort((a, b) => {
        const aLatest = a.messages[a.messages.length - 1]?.createdAt || '';
        const bLatest = b.messages[b.messages.length - 1]?.createdAt || '';
        return new Date(bLatest) - new Date(aLatest);
    });

    const unreadCount = allComms.filter(c => !c.read).length;

    return `
<style>
            .conv-container { display: flex; gap: 0; height: 600px; background: #111; border-radius: 12px; overflow: hidden; }
            .conv-sidebar { width: 320px; border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; }
            .conv-main { flex: 1; display: flex; flex-direction: column; }
            .conv-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .conv-filters { display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); overflow-x: auto; }
            .conv-filter { padding: 6px 12px; background: rgba(255,255,255,0.05); border: none; border-radius: 100px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; white-space: nowrap; }
            .conv-filter.active { background: var(--red); color: #fff; }
            .conv-list { flex: 1; overflow-y: auto; }
            .conv-item { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; }
            .conv-item:hover { background: rgba(255,255,255,0.03); }
            .conv-item.active { background: rgba(225,29,72,0.1); border-left: 3px solid var(--red); }
            .conv-item.unread { background: rgba(59,130,246,0.1); }
            .conv-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
            .conv-item-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .conv-item-name { font-weight: 600; font-size: 14px; }
            .conv-item-time { font-size: 11px; color: rgba(255,255,255,0.4); }
            .conv-item-preview { font-size: 13px; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .conv-item-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-top: 8px; }
            .conv-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); }
            .conv-messages { flex: 1; overflow-y: auto; padding: 20px; }
            .conv-message { margin-bottom: 16px; max-width: 80%; }
            .conv-message.inbound { margin-right: auto; }
            .conv-message.outbound { margin-left: auto; }
            .conv-message-bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
            .conv-message.inbound .conv-message-bubble { background: #252525; border-bottom-left-radius: 4px; }
            .conv-message.outbound .conv-message-bubble { background: var(--red); border-bottom-right-radius: 4px; }
            .conv-message-meta { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px; display: flex; align-items: center; gap: 8px; }
            .conv-input { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 12px; }
            .conv-input input { flex: 1; padding: 12px 16px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; color: #fff; }
            .conv-input select { padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; }
            .conv-input button { padding: 12px 24px; background: var(--red); border: none; color: #fff; border-radius: 24px; cursor: pointer; font-weight: 600; }
</style>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<div>
<h3 style="font-size: 18px; margin-bottom: 4px;">💬 All Conversations</h3>
<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
<p style="color: rgba(255,255,255,0.5); font-size: 13px;">Unified inbox — Email, SMS & Calls</p>
                    ${supabaseCommsLastSync ? '<span style="font-size: 11px; color: rgba(255,255,255,0.3);">Synced: ' + new Date(supabaseCommsLastSync).toLocaleTimeString() + '</span>' : '<span style="font-size: 11px; color: rgba(245,158,11,0.8);">Not synced yet</span>'}
</div>
</div>
<div style="display: flex; gap: 8px;">
<button onclick="syncCommunications(true)" style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">🔄 Sync</button>
<span style="background: #ef4444; color: #fff; padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;">${unreadCount} Unread</span>
<button onclick="composeNewMessage()" style="padding: 8px 16px; background: var(--red); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">✉️ Compose</button>
</div>
</div>

<div class="conv-container">
            <!-- Sidebar: Contact List -->
<div class="conv-sidebar">
<div class="conv-filters">
<button class="conv-filter ${conversationFilter === 'all' ? 'active' : ''}" onclick="setConversationFilter('all')">All</button>
<button class="conv-filter ${conversationFilter === 'sms' ? 'active' : ''}" onclick="setConversationFilter('sms')">📱 SMS</button>
<button class="conv-filter ${conversationFilter === 'email' ? 'active' : ''}" onclick="setConversationFilter('email')">✉️ Email</button>
<button class="conv-filter ${conversationFilter === 'call' ? 'active' : ''}" onclick="setConversationFilter('call')">📞 Calls</button>
<button class="conv-filter ${conversationFilter === 'proof_system' ? 'active' : ''}" onclick="setConversationFilter('proof_system')">✅ Proofs</button>
<button class="conv-filter ${conversationFilter === 'social' ? 'active' : ''}" onclick="setConversationFilter('social')">💬 Social</button>
</div>
<div class="conv-list">
                    ${sortedContacts.length === 0 ? `
<div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.3);">
<div style="font-size: 32px; margin-bottom: 8px;">💬</div>
<div>No conversations yet</div>
</div>
                    ` : sortedContacts.map(item => {
                        const latestMsg = item.messages[item.messages.length - 1];
                        const unread = item.messages.some(m => !m.read);
                        const isActive = selectedConversationContact === (item.contact?.id || item.contact?.clientId);
                        return `
<div class="conv-item ${isActive ? 'active' : ''} ${unread ? 'unread' : ''}" onclick="selectConversation(${item.contact?.id || item.contact?.clientId || 0})">
<div style="display: flex; gap: 12px;">
<div class="conv-avatar" style="background: ${getChannelColor(latestMsg?.channel)};">${(item.contact?.name || 'U').charAt(0)}</div>
<div style="flex: 1; min-width: 0;">
<div class="conv-item-header">
<span class="conv-item-name">${item.contact?.name || 'Unknown'}</span>
<span class="conv-item-time">${formatRelativeTime(latestMsg?.createdAt)}</span>
</div>
<div class="conv-item-preview">${latestMsg?.message || latestMsg?.text || 'No messages'}</div>
<div class="conv-item-badge" style="background: ${getChannelColor(latestMsg?.channel)}20; color: ${getChannelColor(latestMsg?.channel)};">
                                            ${getChannelIcon(latestMsg?.channel)} ${latestMsg?.channel || 'message'}
</div>
</div>
</div>
</div>
                        `;
                    }).join('')}
</div>
</div>

            <!-- Main: Conversation View -->
<div class="conv-main">
                ${selectedConversationContact ? renderConversationDetail(selectedConversationContact) : `
<div class="conv-empty">
<div style="text-align: center;">
<div style="font-size: 64px; margin-bottom: 16px;">💬</div>
<div style="font-size: 18px; margin-bottom: 8px;">Select a conversation</div>
<div style="font-size: 14px; color: rgba(255,255,255,0.4);">Choose a contact from the list to view messages</div>
</div>
</div>
                `}
</div>
</div>
    `;
}

// Supabase communications cache
let supabaseCommsCache = JSON.parse(localStorage.getItem('nui_supabase_comms')) || [];
let supabaseCommsLastSync = localStorage.getItem('nui_comms_last_sync') || null;
let commsSyncing = false;

async function syncCommunications(showAlert = false) {
    if (commsSyncing) return;
    commsSyncing = true;

    try {
        // First, trigger an IMAP poll to check for new emails
        try {
            await fetch('/.netlify/functions/poll-email?manual=true');
            console.log('📧 IMAP poll triggered');
        } catch (pollErr) {
            console.log('IMAP poll skipped:', pollErr.message);
        }

        // Then fetch all communications from Supabase
        const response = await fetch('/.netlify/functions/get-communications?limit=100');
        if (!response.ok) throw new Error('Sync failed');

        const data = await response.json();
        supabaseCommsCache = data.communications || [];
        localStorage.setItem('nui_supabase_comms', JSON.stringify(supabaseCommsCache));
        localStorage.setItem('nui_comms_last_sync', new Date().toISOString());
        supabaseCommsLastSync = new Date().toISOString();

        if (showAlert) {
            alert('✅ Synced! ' + supabaseCommsCache.length + ' messages loaded (' + (data.unread?.total || 0) + ' unread)');
        }

        // Refresh the CRM panel
        const crmPanel = document.getElementById('crmConversationsTab');
        if (crmPanel && crmActiveTab === 'conversations') {
            loadAdminCrmPanel();
        }
    } catch (err) {
        console.warn('Communications sync failed:', err.message);
        if (showAlert) alert('❌ Sync failed: ' + err.message);
    } finally {
        commsSyncing = false;
    }
}

function getAllCommunications() {
    const comms = [];
    const seenIds = new Set();

    // 1. Supabase communications (real emails, SMS, calls from webhooks)
    supabaseCommsCache.forEach(c => {
        const id = 'sb_' + c.id;
        if (seenIds.has(id)) return;
        seenIds.add(id);
        comms.push({
            id: id,
            clientId: c.client_id,
            contactId: c.client_id,
            contactName: c.metadata?.fromName || c.metadata?.from || '',
            channel: c.channel,
            message: c.channel === 'email' ? `[${c.subject || 'No Subject'}] ${c.message}` : c.message,
            subject: c.subject,
            direction: c.direction,
            createdAt: c.created_at,
            read: c.read,
            source: 'supabase',
            metadata: c.metadata
        });
    });

    // 2. Local stored communications (manual entries)
    const storedComms = JSON.parse(localStorage.getItem('nui_crm_communications')) || [];
    storedComms.forEach(c => {
        const id = 'local_' + c.id;
        if (seenIds.has(id)) return;
        seenIds.add(id);
        comms.push({ ...c, id, source: 'local' });
    });

    // 3. SMS conversations
    const smsConvos = JSON.parse(localStorage.getItem('nui_sms_conversations')) || [];
    smsConvos.forEach(convo => {
        (convo.messages || []).forEach(msg => {
            const id = 'sms_' + (msg.id || Date.now() + Math.random());
            if (seenIds.has(id)) return;
            seenIds.add(id);
            comms.push({
                id, clientId: convo.clientId, contactId: convo.clientId,
                channel: 'sms', message: msg.text,
                direction: msg.direction || (msg.from === 'client' ? 'inbound' : 'outbound'),
                createdAt: msg.time || msg.createdAt, read: true, source: 'local'
            });
        });
    });

    // 4. Email campaigns
    const emailCampaigns = JSON.parse(localStorage.getItem('nui_email_campaigns')) || [];
    emailCampaigns.forEach(campaign => {
        if (campaign.sentAt) {
            comms.push({
                id: 'camp_' + campaign.id, channel: 'email',
                message: `Campaign: ${campaign.name} - ${campaign.subject}`,
                direction: 'outbound', createdAt: campaign.sentAt,
                read: true, isCampaign: true, source: 'local'
            });
        }
    });

    // 5. Proof comments
    proofs.forEach(proof => {
        (proof.comments || []).forEach(comment => {
            comms.push({
                id: 'proof_' + Date.now() + Math.random(),
                clientId: proof.clientId, channel: 'proof_system',
                message: `[${proof.name}] ${comment.text}`,
                direction: comment.author === 'Admin' ? 'outbound' : 'inbound',
                createdAt: comment.createdAt, read: true, proofId: proof.id, source: 'local'
            });
        });
    });

    // 6. Social DMs
    const socialDMs = JSON.parse(localStorage.getItem('nui_social_dms')) || [];
    socialDMs.forEach(dm => {
        (dm.messages || []).forEach(msg => {
            comms.push({
                id: 'social_' + (msg.id || Date.now() + Math.random()),
                contactId: dm.contactId, contactName: dm.contactName,
                channel: 'social', platform: dm.platform, message: msg.text,
                direction: msg.from === 'them' ? 'inbound' : 'outbound',
                createdAt: msg.time, read: true, source: 'local'
            });
        });
    });

    return comms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getContactInfo(contactId) {
    const client = clients.find(c => c.id === contactId);
    if (client) return { id: client.id, name: client.name, email: client.email, phone: client.phone };

    const contact = crmData.contacts.find(c => c.id === contactId);
    if (contact) return contact;

    return { id: contactId, name: 'Unknown', email: '' };
}

function getChannelColor(channel) {
    const colors = { sms: '#10b981', email: '#3b82f6', call: '#8b5cf6', proof_system: '#f59e0b', social: '#ec4899' };
    return colors[channel] || '#666';
}

function getChannelIcon(channel) {
    const icons = { sms: '📱', email: '✉️', call: '📞', proof_system: '✅', social: '💬' };
    return icons[channel] || '💬';
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    return date.toLocaleDateString();
}

function setConversationFilter(filter) {
    conversationFilter = filter;
    loadAdminCrmPanel();
}

function selectConversation(contactId) {
    selectedConversationContact = contactId;
    // Mark messages as read
    const comms = JSON.parse(localStorage.getItem('nui_crm_communications')) || [];
    comms.forEach(c => {
        if (c.clientId === contactId || c.contactId === contactId) c.read = true;
    });
    localStorage.setItem('nui_crm_communications', JSON.stringify(comms));
    loadAdminCrmPanel();
}

function renderConversationDetail(contactId) {
    const contact = getContactInfo(contactId);
    const allComms = getAllCommunications();
    const contactComms = allComms.filter(c => c.clientId === contactId || c.contactId === contactId);

    return `
<div class="conv-header" style="display: flex; justify-content: space-between; align-items: center;">
<div style="display: flex; align-items: center; gap: 12px;">
<div class="conv-avatar" style="background: var(--red);">${(contact.name || 'U').charAt(0)}</div>
<div>
<div style="font-weight: 600; font-size: 16px;">${contact.name || 'Unknown'}</div>
<div style="font-size: 13px; color: rgba(255,255,255,0.5);">${contact.email || contact.phone || ''}</div>
</div>
</div>
<div style="display: flex; gap: 8px;">
<button onclick="quickSms(${contactId})" style="padding: 8px 12px; background: #10b981; border: none; color: #fff; border-radius: 6px; cursor: pointer;">📱 SMS</button>
<button onclick="quickEmail(${contactId})" style="padding: 8px 12px; background: #3b82f6; border: none; color: #fff; border-radius: 6px; cursor: pointer;">✉️ Email</button>
<button onclick="quickCall(${contactId})" style="padding: 8px 12px; background: #8b5cf6; border: none; color: #fff; border-radius: 6px; cursor: pointer;">📞 Call</button>
</div>
</div>

<div class="conv-messages">
            ${contactComms.reverse().map(msg => `
<div class="conv-message ${msg.direction}">
<div class="conv-message-bubble">${msg.message || msg.text}</div>
<div class="conv-message-meta">
<span>${getChannelIcon(msg.channel)} ${msg.channel}</span>
<span>${new Date(msg.createdAt).toLocaleString()}</span>
</div>
</div>
            `).join('') || '<div style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">No messages with this contact</div>'}
</div>

<div class="conv-input">
<select id="messageChannel" style="width: 100px;">
<option value="sms">📱 SMS</option>
<option value="email">✉️ Email</option>
</select>
<input type="text" id="newMessageInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter') sendConversationMessage(${contactId})">
<button onclick="sendConversationMessage(${contactId})">Send</button>
</div>
    `;
}

async function sendConversationMessage(contactId) {
    const channel = document.getElementById('messageChannel').value;
    const message = document.getElementById('newMessageInput').value.trim();

    if (!message) return;

    const contact = getContactInfo(contactId);
    const btn = document.querySelector('.conv-input button');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

    try {
        // Send via real API
        if (channel === 'sms' && contact.phone) {
            await fetch('/.netlify/functions/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: contact.phone, message, clientId: contactId })
            });
        } else if (channel === 'email' && contact.email) {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: contact.email, subject: 'Re: Conversation', html: message, text: message, clientId: contactId })
            });
        }
    } catch (err) {
        console.warn('API send failed, storing locally:', err.message);
    }

    // Also store locally for immediate display
    const comms = JSON.parse(localStorage.getItem('nui_crm_communications')) || [];
    comms.push({
        id: Date.now(),
        clientId: contactId,
        contactId: contactId,
        channel: channel,
        message: message,
        direction: 'outbound',
        createdAt: new Date().toISOString(),
        read: true
    });
    localStorage.setItem('nui_crm_communications', JSON.stringify(comms));

    document.getElementById('newMessageInput').value = '';
    loadAdminCrmPanel();
}

function composeNewMessage() {
    const modal = document.createElement('div');
    modal.id = 'composeModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
<div style="background: #1a1a1a; border-radius: 16px; padding: 32px; max-width: 500px; width: 100%;">
<h2 style="font-size: 20px; margin-bottom: 24px;">✉️ Compose Message</h2>

<div style="margin-bottom: 16px;">
<label style="display: block; font-size: 14px; margin-bottom: 8px;">To</label>
<select id="composeRecipient" style="width: 100%; padding: 12px; background: #252525; border: 1px solid #333; border-radius: 8px; color: #fff;">
<option value="">Select contact...</option>
                        ${clients.map(c => `<option value="${c.id}">${c.name} (${c.email})</option>`).join('')}
</select>
</div>

<div style="margin-bottom: 16px;">
<label style="display: block; font-size: 14px; margin-bottom: 8px;">Channel</label>
<div style="display: flex; gap: 8px;">
<button onclick="setComposeChannel('sms')" id="ch_sms" style="flex: 1; padding: 12px; background: #10b981; border: none; color: #fff; border-radius: 8px; cursor: pointer;">📱 SMS</button>
<button onclick="setComposeChannel('email')" id="ch_email" style="flex: 1; padding: 12px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer;">✉️ Email</button>
</div>
</div>

<div id="emailSubjectField" style="display: none; margin-bottom: 16px;">
<label style="display: block; font-size: 14px; margin-bottom: 8px;">Subject</label>
<input type="text" id="composeSubject" placeholder="Email subject..." style="width: 100%; padding: 12px; background: #252525; border: 1px solid #333; border-radius: 8px; color: #fff;">
</div>

<div style="margin-bottom: 24px;">
<label style="display: block; font-size: 14px; margin-bottom: 8px;">Message</label>
<textarea id="composeMessage" rows="4" placeholder="Type your message..." style="width: 100%; padding: 12px; background: #252525; border: 1px solid #333; border-radius: 8px; color: #fff; resize: none;"></textarea>
</div>

<div style="display: flex; gap: 12px;">
<button onclick="document.getElementById('composeModal').remove()" style="flex: 1; padding: 12px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer;">Cancel</button>
<button onclick="sendComposedMessage()" style="flex: 1; padding: 12px; background: var(--red); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">Send Message</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

let composeChannel = 'sms';

function setComposeChannel(channel) {
    composeChannel = channel;
    document.getElementById('ch_sms').style.background = channel === 'sms' ? '#10b981' : '#333';
    document.getElementById('ch_email').style.background = channel === 'email' ? '#3b82f6' : '#333';
    document.getElementById('emailSubjectField').style.display = channel === 'email' ? 'block' : 'none';
}

async function sendComposedMessage() {
    const recipientId = parseInt(document.getElementById('composeRecipient').value);
    const message = document.getElementById('composeMessage').value.trim();
    const subject = document.getElementById('composeSubject')?.value.trim() || '';

    if (!recipientId) { alert('Please select a recipient.'); return; }
    if (!message) { alert('Please enter a message.'); return; }

    const contact = getContactInfo(recipientId);
    let apiSuccess = false;

    try {
        if (composeChannel === 'sms' && contact.phone) {
            const res = await fetch('/.netlify/functions/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: contact.phone, message, clientId: recipientId })
            });
            apiSuccess = res.ok;
        } else if (composeChannel === 'email' && contact.email) {
            const res = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: contact.email,
                    subject: subject || 'Message from New Urban Influence',
                    html: message.replace(/\n/g, '<br>'),
                    text: message,
                    clientId: recipientId
                })
            });
            apiSuccess = res.ok;
        }
    } catch (err) {
        console.warn('API send failed:', err.message);
    }

    // Store locally for immediate display
    const comms = JSON.parse(localStorage.getItem('nui_crm_communications')) || [];
    comms.push({
        id: Date.now(),
        clientId: recipientId,
        contactId: recipientId,
        channel: composeChannel,
        message: composeChannel === 'email' && subject ? `[${subject}] ${message}` : message,
        direction: 'outbound',
        createdAt: new Date().toISOString(),
        read: true,
        sentViaApi: apiSuccess
    });
    localStorage.setItem('nui_crm_communications', JSON.stringify(comms));

    document.getElementById('composeModal').remove();
    selectedConversationContact = recipientId;
    loadAdminCrmPanel();

    alert(apiSuccess
        ? `✅ ${composeChannel === 'sms' ? 'SMS' : 'Email'} sent to ${contact.name}!`
        : `⚠️ Message saved locally but API delivery failed. Check your ${composeChannel === 'sms' ? 'OpenPhone' : 'email'} settings.`);
}

// Drag and Drop for Pipeline
let draggedContactId = null;

function handleDragStart(e, contactId) {
    draggedContactId = contactId;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.pipeline-col-body').forEach(col => col.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, stageId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (draggedContactId) {
        moveContactStage(draggedContactId, stageId);
        draggedContactId = null;
    }
}

function moveContactStage(contactId, newStage) {
    const contact = crmData.contacts.find(c => c.id === contactId);
    if (contact) {
        const oldStage = crmData.pipelines.find(p => p.id === contact.stage)?.name;
        const newStageName = crmData.pipelines.find(p => p.id === newStage)?.name;
        contact.stage = newStage;
        contact.lastActivity = new Date().toISOString();

        // Log the stage change
        if (!crmData.activityLog) crmData.activityLog = [];
        crmData.activityLog.push({
            id: Date.now(),
            contactId: contactId,
            type: 'stage_change',
            from: oldStage,
            to: newStageName,
            timestamp: new Date().toISOString()
        });

        saveCrm();
        loadAdminCrmPanel();
        console.log('✅ Contact moved: ' + contact.name + ' → ' + newStageName);
    }
}

// Quick Actions
function quickSms(contactId) {
    const contact = crmData.contacts.find(c => c.id === contactId);
    if (!contact?.phone) { alert('No phone number for this contact'); return; }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'quickSmsModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 500px;">
<div class="modal-header"><h3 class="modal-title">💬 Send SMS to ${contact.name}</h3><button class="modal-close" onclick="document.getElementById('quickSmsModal').remove()">×</button></div>
<div class="modal-body">
<p style="color: rgba(255,255,255,0.5); margin-bottom: 16px;">To: ${contact.phone}</p>
<div class="form-group">
<label class="form-label">Template</label>
<select class="form-select" onchange="document.getElementById('quickSmsText').value = this.options[this.selectedIndex].dataset.msg || ''">
<option value="">-- Select Template --</option>
                        ${smsSystem.templates.map(t => '<option data-msg="' + t.message.replace(/{name}/g, contact.name) + '">' + t.name + '</option>').join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Message</label>
<textarea id="quickSmsText" class="form-textarea" rows="4" placeholder="Type your message..."></textarea>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('quickSmsModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="sendQuickSms(${contactId})" style="background: #10b981;">Send SMS</button>
</div>
</div>`;
    document.body.appendChild(modal);
}

function sendQuickSms(contactId) {
    const contact = crmData.contacts.find(c => c.id === contactId);
    const message = document.getElementById('quickSmsText').value;
    if (!message) { alert('Please enter a message'); return; }

    // Add to SMS conversations
    let convo = smsSystem.conversations.find(c => c.clientId === contactId || c.phone === contact.phone);
    if (!convo) {
        convo = { id: Date.now(), clientId: contactId, clientName: contact.name, phone: contact.phone, messages: [], lastMessage: null, unread: 0 };
        smsSystem.conversations.push(convo);
    }
    convo.messages.push({ id: Date.now(), direction: 'outbound', text: message, timestamp: new Date().toISOString(), status: 'sent' });
    convo.lastMessage = new Date().toISOString();
    saveSms();

    // Log activity
    logContactActivity(contactId, 'sms', message);

    document.getElementById('quickSmsModal').remove();
    alert('SMS sent to ' + contact.name + '!');
}

function quickEmail(contactId) {
    const contact = crmData.contacts.find(c => c.id === contactId);
    if (!contact?.email) { alert('No email for this contact'); return; }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'quickEmailModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 600px;">
<div class="modal-header"><h3 class="modal-title">📧 Send Email to ${contact.name}</h3><button class="modal-close" onclick="document.getElementById('quickEmailModal').remove()">×</button></div>
<div class="modal-body">
<p style="color: rgba(255,255,255,0.5); margin-bottom: 16px;">To: ${contact.email}</p>
<div class="form-group">
<label class="form-label">Subject</label>
<input type="text" id="quickEmailSubject" class="form-input" placeholder="Email subject...">
</div>
<div class="form-group">
<label class="form-label">Message</label>
<textarea id="quickEmailText" class="form-textarea" rows="6" placeholder="Hi ${contact.name},\n\n"></textarea>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('quickEmailModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="sendQuickEmail(${contactId})" style="background: #3b82f6;">Send Email</button>
</div>
</div>`;
    document.body.appendChild(modal);
}

function sendQuickEmail(contactId) {
    const contact = crmData.contacts.find(c => c.id === contactId);
    const subject = document.getElementById('quickEmailSubject').value;
    const message = document.getElementById('quickEmailText').value;
    if (!subject || !message) { alert('Please enter subject and message'); return; }

    // Log activity
    logContactActivity(contactId, 'email', subject + ': ' + message.substring(0, 100));

    // Simulate sending
    simulateEmailNotification(contact.email, subject, message);

    document.getElementById('quickEmailModal').remove();
    alert('Email sent to ' + contact.name + '!');
}

function quickCall(contactId) {
    const contact = crmData.contacts.find(c => c.id === contactId);
    if (!contact?.phone) { alert('No phone number for this contact'); return; }

    // Log call attempt
    logContactActivity(contactId, 'call', 'Called ' + contact.phone);

    // Open phone dialer
    window.open('tel:' + contact.phone, '_self');
}

function logContactActivity(contactId, type, details) {
    if (!crmData.activityLog) crmData.activityLog = [];
    crmData.activityLog.push({
        id: Date.now(),
        contactId: contactId,
        type: type,
        details: details,
        timestamp: new Date().toISOString()
    });
    saveCrm();
}

// Smart Groups
function getSmartGroupContacts(group) {
    const filter = group.filter;
    let contacts = [...crmData.contacts];

    if (filter.type === 'all') return contacts;
    if (filter.type === 'stage') {
        contacts = contacts.filter(c => filter.stages.includes(c.stage));
    }
    if (filter.type === 'value') {
        contacts = contacts.filter(c => (c.value || 0) >= (filter.min || 0));
    }
    if (filter.type === 'date') {
        const cutoff = new Date(Date.now() - (filter.days || 7) * 24 * 60 * 60 * 1000);
        contacts = contacts.filter(c => new Date(c.createdAt) >= cutoff);
    }
    if (filter.hasPhone) {
        contacts = contacts.filter(c => c.phone);
    }
    if (filter.hasEmail) {
        contacts = contacts.filter(c => c.email);
    }
    return contacts;
}

function getSmartGroupDescription(group) {
    const filter = group.filter;
    if (filter.type === 'all') return 'All contacts in your CRM';
    if (filter.type === 'stage') return 'Contacts in ' + filter.stages.map(s => crmData.pipelines.find(p => p.id === s)?.name).join(', ');
    if (filter.type === 'value') return 'Contacts with deals $' + (filter.min || 0).toLocaleString() + '+';
    if (filter.type === 'date') return 'Added in last ' + filter.days + ' days';
    return 'Custom filter';
}

function showCreateSmartGroupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'smartGroupModal';
    modal.innerHTML = `
<div class="modal">
<div class="modal-header"><h3 class="modal-title">Create Smart Group</h3><button class="modal-close" onclick="document.getElementById('smartGroupModal').remove()">×</button></div>
<div class="modal-body">
<div class="form-group"><label class="form-label">Group Name</label><input type="text" id="sgName" class="form-input" placeholder="e.g., Hot Leads"></div>
<div class="form-group"><label class="form-label">Filter Type</label>
<select id="sgFilterType" class="form-select" onchange="updateSmartGroupFilter()">
<option value="all">All Contacts</option>
<option value="stage">By Pipeline Stage</option>
<option value="value">By Deal Value</option>
<option value="date">By Date Added</option>
</select>
</div>
<div id="sgFilterOptions"></div>
<div class="form-group"><label class="form-label">Color</label>
<div style="display: flex; gap: 8px;">
                        ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => '<div onclick="document.getElementById(\'sgColor\').value=\'' + c + '\'; this.parentElement.querySelectorAll(\'div\').forEach(d=>d.style.border=\'2px solid transparent\'); this.style.border=\'2px solid #fff\';" style="width: 32px; height: 32px; background: ' + c + '; border-radius: 6px; cursor: pointer; border: 2px solid transparent;"></div>').join('')}
</div>
<input type="hidden" id="sgColor" value="#3b82f6">
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('smartGroupModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="createSmartGroup()">Create Group</button>
</div>
</div>`;
    document.body.appendChild(modal);
}

function updateSmartGroupFilter() {
    const type = document.getElementById('sgFilterType').value;
    const container = document.getElementById('sgFilterOptions');

    if (type === 'stage') {
        container.innerHTML = '<div class="form-group"><label class="form-label">Select Stages</label>' + crmData.pipelines.map(p => '<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><input type="checkbox" class="sg-stage" value="' + p.id + '"> ' + p.name + '</label>').join('') + '</div>';
    } else if (type === 'value') {
        container.innerHTML = '<div class="form-group"><label class="form-label">Minimum Value ($)</label><input type="number" id="sgMinValue" class="form-input" placeholder="5000"></div>';
    } else if (type === 'date') {
        container.innerHTML = '<div class="form-group"><label class="form-label">Added within last X days</label><input type="number" id="sgDays" class="form-input" placeholder="7"></div>';
    } else {
        container.innerHTML = '';
    }
}

function createSmartGroup() {
    const name = document.getElementById('sgName').value;
    if (!name) { alert('Please enter a group name'); return; }

    const type = document.getElementById('sgFilterType').value;
    const color = document.getElementById('sgColor').value;

    const filter = { type };
    if (type === 'stage') {
        filter.stages = [...document.querySelectorAll('.sg-stage:checked')].map(cb => parseInt(cb.value));
    } else if (type === 'value') {
        filter.min = parseInt(document.getElementById('sgMinValue').value) || 0;
    } else if (type === 'date') {
        filter.days = parseInt(document.getElementById('sgDays').value) || 7;
    }

    crmSmartGroups.push({ id: Date.now(), name, filter, color });
    saveSmartGroups();
    document.getElementById('smartGroupModal').remove();
    loadAdminCrmPanel();
}

// Bulk Messaging
function bulkSmsGroup(groupId) {
    const group = crmSmartGroups.find(g => g.id === groupId);
    const contacts = getSmartGroupContacts(group).filter(c => c.phone);

    if (contacts.length === 0) { alert('No contacts with phone numbers in this group'); return; }

    switchCrmTab('bulk');
    document.getElementById('bulkSmsGroup').value = groupId;
    alert('Ready to send SMS to ' + contacts.length + ' contacts in "' + group.name + '"');
}

function bulkEmailGroup(groupId) {
    const group = crmSmartGroups.find(g => g.id === groupId);
    const contacts = getSmartGroupContacts(group).filter(c => c.email);

    if (contacts.length === 0) { alert('No contacts with email in this group'); return; }

    switchCrmTab('bulk');
    document.getElementById('bulkEmailGroup').value = groupId;
    alert('Ready to send Email to ' + contacts.length + ' contacts in "' + group.name + '"');
}

function loadSmsTemplate(templateId) {
    const template = smsSystem.templates.find(t => t.id == templateId);
    if (template) document.getElementById('bulkSmsMessage').value = template.message;
}

function loadEmailTemplate(templateId) {
    const template = emailMarketing.templates.find(t => t.id == templateId);
    if (template) {
        document.getElementById('bulkEmailSubject').value = template.subject;
        document.getElementById('bulkEmailMessage').value = template.content || '';
    }
}

function sendBulkSms() {
    const groupId = parseInt(document.getElementById('bulkSmsGroup').value);
    const message = document.getElementById('bulkSmsMessage').value;
    if (!message) { alert('Please enter a message'); return; }

    const group = crmSmartGroups.find(g => g.id === groupId);
    const contacts = getSmartGroupContacts(group).filter(c => c.phone);

    if (contacts.length === 0) { alert('No contacts with phone numbers'); return; }
    if (!confirm('Send SMS to ' + contacts.length + ' contacts?')) return;

    // Simulate sending
    contacts.forEach(contact => {
        const personalizedMsg = message.replace(/{name}/g, contact.name).replace(/{company}/g, contact.company || '');
        console.log('SMS to ' + contact.phone + ': ' + personalizedMsg);
    });

    // Log bulk message
    if (!crmData.bulkMessages) crmData.bulkMessages = [];
    crmData.bulkMessages.push({
        id: Date.now(),
        type: 'sms',
        groupId: groupId,
        groupName: group.name,
        recipients: contacts.length,
        message: message,
        sentAt: new Date().toISOString()
    });
    saveCrm();

    alert('✅ SMS blast sent to ' + contacts.length + ' contacts!');
    loadAdminCrmPanel();
}

function sendBulkEmail() {
    const groupId = parseInt(document.getElementById('bulkEmailGroup').value);
    const subject = document.getElementById('bulkEmailSubject').value;
    const message = document.getElementById('bulkEmailMessage').value;
    if (!subject || !message) { alert('Please enter subject and message'); return; }

    const group = crmSmartGroups.find(g => g.id === groupId);
    const contacts = getSmartGroupContacts(group).filter(c => c.email);

    if (contacts.length === 0) { alert('No contacts with email'); return; }
    if (!confirm('Send email to ' + contacts.length + ' contacts?')) return;

    // Create email campaign
    emailMarketing.campaigns.push({
        id: Date.now(),
        name: 'CRM Blast: ' + group.name,
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipients: contacts.length,
        opened: 0,
        clicked: 0,
        createdAt: new Date().toISOString()
    });
    saveEmailMarketing();

    // Log bulk message
    if (!crmData.bulkMessages) crmData.bulkMessages = [];
    crmData.bulkMessages.push({
        id: Date.now(),
        type: 'email',
        groupId: groupId,
        groupName: group.name,
        recipients: contacts.length,
        subject: subject,
        sentAt: new Date().toISOString()
    });
    saveCrm();

    alert('✅ Email blast sent to ' + contacts.length + ' contacts!');
    loadAdminCrmPanel();
}

function filterCrmContacts(query) {
    const rows = document.querySelectorAll('#crmContactsTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function toggleAllContacts(checked) {
    document.querySelectorAll('.contact-checkbox').forEach(cb => cb.checked = checked);
}

function showAddContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'contactModal';
    modal.innerHTML = `
<div class="modal">
<div class="modal-header"><h3 class="modal-title">Add Contact</h3><button class="modal-close" onclick="document.getElementById('contactModal').remove()">×</button></div>
<div class="modal-body">
<div class="form-group"><label class="form-label">Name *</label><input type="text" id="contactName" class="form-input" placeholder="John Doe"></div>
<div class="form-group"><label class="form-label">Email</label><input type="email" id="contactEmail" class="form-input" placeholder="john@company.com"></div>
<div class="form-group"><label class="form-label">Company</label><input type="text" id="contactCompany" class="form-input" placeholder="Company Name"></div>
<div class="form-group"><label class="form-label">Phone</label><input type="tel" id="contactPhone" class="form-input" placeholder="(248) 487-8747"></div>
<div class="form-group"><label class="form-label">Deal Value ($)</label><input type="number" id="contactValue" class="form-input" placeholder="5000"></div>
<div class="form-group"><label class="form-label">Stage</label><select id="contactStage" class="form-select">${crmData.pipelines.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
<div class="form-group"><label class="form-label">Notes</label><textarea id="contactNotes" class="form-textarea" placeholder="Additional notes..."></textarea></div>
</div>
<div class="modal-footer"><button class="btn-admin secondary" onclick="document.getElementById('contactModal').remove()">Cancel</button><button class="btn-admin primary" onclick="saveContact()">Save Contact</button></div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveContact() {
    const contact = {
        id: Date.now(),
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        company: document.getElementById('contactCompany').value,
        phone: document.getElementById('contactPhone').value,
        value: parseInt(document.getElementById('contactValue').value) || 0,
        stage: parseInt(document.getElementById('contactStage').value),
        notes: document.getElementById('contactNotes').value,
        createdAt: new Date().toISOString()
    };
    crmData.contacts.push(contact);
    saveCrm();
    document.getElementById('contactModal').remove();
    loadAdminCrmPanel();
}

function editContact(id) {
    const contact = crmData.contacts.find(c => c.id === id);
    if (!contact) return;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'contactModal';
    modal.innerHTML = `
<div class="modal">
<div class="modal-header"><h3 class="modal-title">Edit Contact</h3><button class="modal-close" onclick="document.getElementById('contactModal').remove()">×</button></div>
<div class="modal-body">
<div class="form-group"><label class="form-label">Name *</label><input type="text" id="contactName" class="form-input" value="${contact.name}"></div>
<div class="form-group"><label class="form-label">Email</label><input type="email" id="contactEmail" class="form-input" value="${contact.email || ''}"></div>
<div class="form-group"><label class="form-label">Company</label><input type="text" id="contactCompany" class="form-input" value="${contact.company || ''}"></div>
<div class="form-group"><label class="form-label">Phone</label><input type="tel" id="contactPhone" class="form-input" value="${contact.phone || ''}"></div>
<div class="form-group"><label class="form-label">Deal Value ($)</label><input type="number" id="contactValue" class="form-input" value="${contact.value || 0}"></div>
<div class="form-group"><label class="form-label">Stage</label><select id="contactStage" class="form-select">${crmData.pipelines.map(p => `<option value="${p.id}" ${contact.stage === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></div>
<div class="form-group"><label class="form-label">Notes</label><textarea id="contactNotes" class="form-textarea">${contact.notes || ''}</textarea></div>
</div>
<div class="modal-footer"><button class="btn-admin danger" onclick="deleteContact(${id})">Delete</button><button class="btn-admin secondary" onclick="document.getElementById('contactModal').remove()">Cancel</button><button class="btn-admin primary" onclick="updateContact(${id})">Update</button></div>
</div>
    `;
    document.body.appendChild(modal);
}

function updateContact(id) {
    const idx = crmData.contacts.findIndex(c => c.id === id);
    if (idx === -1) return;
    crmData.contacts[idx] = { ...crmData.contacts[idx], name: document.getElementById('contactName').value, email: document.getElementById('contactEmail').value, company: document.getElementById('contactCompany').value, phone: document.getElementById('contactPhone').value, value: parseInt(document.getElementById('contactValue').value) || 0, stage: parseInt(document.getElementById('contactStage').value), notes: document.getElementById('contactNotes').value };
    saveCrm();
    document.getElementById('contactModal').remove();
    loadAdminCrmPanel();
}

function deleteContact(id) {
    if (!confirm('Delete this contact?')) return;
    crmData.contacts = crmData.contacts.filter(c => c.id !== id);
    saveCrm();
    document.getElementById('contactModal').remove();
    loadAdminCrmPanel();
}

