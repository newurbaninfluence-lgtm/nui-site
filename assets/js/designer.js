function loadDesignerDashboard() {
    if (!currentUser || currentUser.type !== 'designer') return;

    const myProjects = orders.filter(o => o.assignedDesigner === currentUser.id || o.assignedDesignerId === currentUser.id || o.assignedDesigner === currentUser.name);
    const activeProjects = myProjects.filter(o => o.status === 'in_progress');
    const pendingProjects = myProjects.filter(o => o.status === 'pending');
    const completedProjects = myProjects.filter(o => o.status === 'delivered');
    const unreadMessages = designerMessages.filter(m => (m.designerId === currentUser.id || m.designerId === currentUser.name) && !m.read).length;

    document.getElementById('adminDashboard').innerHTML = `
<div class="admin-container">
<aside class="admin-sidebar" style="background: #0a0a0a;">
<div class="admin-header">
<div class="admin-logo text-red">NUI Designer</div>
<div class="text-muted fs-12">Welcome, ${currentUser.name}</div>
</div>
<nav class="admin-nav">
<div class="admin-nav-group">
<a onclick="showDesignerPanel('dashboard')" class="admin-nav-link active" data-panel="dashboard">📊 Dashboard</a>
<a onclick="showDesignerPanel('myprojects')" class="admin-nav-link" data-panel="myprojects">📁 My Projects</a>
<a onclick="showDesignerPanel('available')" class="admin-nav-link" data-panel="available">🆕 Available Jobs</a>
<a onclick="showDesignerPanel('proofs')" class="admin-nav-link" data-panel="proofs">📤 Upload Proofs</a>
<a onclick="showDesignerPanel('messages')" class="admin-nav-link" data-panel="messages">💬 Messages ${unreadMessages > 0 ? '<span style="background: var(--red); color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">' + unreadMessages + '</span>' : ''}</a>
</div>
<div class="admin-nav-group" style="margin-top: auto;">
<a onclick="portalLogout()" class="admin-nav-link text-muted">🚪 Sign Out</a>
</div>
</nav>
</aside>
<main class="admin-main">
<div id="designerDashboardPanel" class="admin-panel active"></div>
<div id="designerMyprojectsPanel" class="admin-panel"></div>
<div id="designerAvailablePanel" class="admin-panel"></div>
<div id="designerProofsPanel" class="admin-panel"></div>
<div id="designerMessagesPanel" class="admin-panel"></div>
</main>
</div>
    `;
    showDesignerPanel('dashboard');
}

function showDesignerPanel(panel) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    const panelEl = document.getElementById('designer' + panel.charAt(0).toUpperCase() + panel.slice(1) + 'Panel');
    if (panelEl) panelEl.classList.add('active');
    document.querySelector(`[data-panel="${panel}"]`)?.classList.add('active');

    const loaders = {
        'dashboard': loadDesignerDashboardPanel,
        'myprojects': loadDesignerProjectsPanel,
        'available': loadDesignerAvailablePanel,
        'proofs': loadDesignerProofsPanel,
        'messages': loadDesignerMessagesPanel
    };
    if (loaders[panel]) loaders[panel]();
}

function loadDesignerDashboardPanel() {
    const myProjects = orders.filter(o => o.assignedDesigner === currentUser.id || o.assignedDesignerId === currentUser.id || o.assignedDesigner === currentUser.name);
    const active = myProjects.filter(o => o.status === 'in_progress');
    const urgent = active.filter(o => {
        const due = new Date(o.dueDate);
        const now = new Date();
        const hoursLeft = (due - now) / (1000 * 60 * 60);
        return hoursLeft < 24 && hoursLeft > 0;
    });

    document.getElementById('designerDashboardPanel').innerHTML = `
<h2 style="font-size: 28px; margin-bottom: 24px;">Designer Dashboard</h2>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
<div style="background: #111; padding: 24px; border-radius: 12px; border: 1px solid #222;">
<div style="font-size: 32px; font-weight: 700; color: var(--red);">${active.length}</div>
<div class="text-muted fs-14">Active Projects</div>
</div>
<div style="background: #111; padding: 24px; border-radius: 12px; border: 1px solid #222;">
<div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${urgent.length}</div>
<div class="text-muted fs-14">Due in 24hrs</div>
</div>
<div style="background: #111; padding: 24px; border-radius: 12px; border: 1px solid #222;">
<div style="font-size: 32px; font-weight: 700; color: #10b981;">${myProjects.filter(o => o.status === 'delivered').length}</div>
<div class="text-muted fs-14">Completed</div>
</div>
<div style="background: #111; padding: 24px; border-radius: 12px; border: 1px solid #222;">
<div style="font-size: 32px; font-weight: 700;">$${myProjects.reduce((sum, o) => sum + (o.estimate || 0), 0).toLocaleString()}</div>
<div class="text-muted fs-14">Total Earned</div>
</div>
</div>
<h2 style="font-size: 20px; margin-bottom: 16px;">⏰ Active Projects</h2>
        ${active.length > 0 ? active.map(p => {
            const client = clients.find(c => c.id === p.clientId);
            const due = new Date(p.dueDate);
            const now = new Date();
            const hoursLeft = Math.max(0, Math.floor((due - now) / (1000 * 60 * 60)));
            const isUrgent = hoursLeft < 24;
            return `<div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid ${isUrgent ? '#ef4444' : '#10b981'};">
<div class="flex-between">
<div>
<div style="font-weight: 600; font-size: 16px;">${p.projectName}</div>
<div class="text-muted-sm">Client: ${client?.name || 'Unknown'} · $${(p.estimate || 0).toLocaleString()}</div>
</div>
<div class="text-right">
<div style="font-size: 24px; font-weight: 700; color: ${isUrgent ? '#ef4444' : '#10b981'};">${hoursLeft}h</div>
<div style="font-size: 11px; color: #888;">remaining</div>
</div>
</div>
<div style="margin-top: 12px; display: flex; gap: 8px;">
<button onclick="showDesignerPanel('proofs'); selectProjectForProof(${p.id})" style="padding: 8px 16px; background: var(--red); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Upload Proof</button>
<button onclick="openDesignerChat(${p.id})" style="padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Message Admin</button>
</div>
</div>`;
        }).join('') : '<p class="text-muted">No active projects. Check available jobs!</p>'}
    `;
}

function loadDesignerProjectsPanel() {
    const myProjects = orders.filter(o => o.assignedDesigner === currentUser.id || o.assignedDesignerId === currentUser.id || o.assignedDesigner === currentUser.name);
    document.getElementById('designerMyprojectsPanel').innerHTML = `
<h2 style="font-size: 28px; margin-bottom: 24px;">My Projects</h2>
        ${myProjects.length > 0 ? myProjects.map(p => {
            const client = clients.find(c => c.id === p.clientId);
            return `<div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 12px;">
<div class="flex-between">
<div>
<div class="fw-600">${p.projectName}</div>
<div class="text-muted-sm">Client: ${client?.name || 'Unknown'}</div>
</div>
<span style="padding: 6px 12px; border-radius: 20px; font-size: 12px; background: ${p.status === 'delivered' ? '#10b98120' : p.status === 'in_progress' ? '#3b82f620' : '#f59e0b20'}; color: ${p.status === 'delivered' ? '#10b981' : p.status === 'in_progress' ? '#3b82f6' : '#f59e0b'};">${p.status}</span>
</div>
</div>`;
        }).join('') : '<p class="text-muted">No projects assigned yet.</p>'}
    `;
}

function loadDesignerAvailablePanel() {
    const available = orders.filter(o => !o.assignedDesigner && o.status !== 'delivered');
    document.getElementById('designerAvailablePanel').innerHTML = `
<h2 style="font-size: 28px; margin-bottom: 24px;">Available Jobs</h2>
<p class="text-muted mb-24">Accept a job to start the 72-hour timer</p>
        ${available.length > 0 ? available.map(p => {
            const client = clients.find(c => c.id === p.clientId);
            return `<div style="background: #111; padding: 20px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #333;">
<div style="display: flex; justify-content: space-between; align-items: start;">
<div>
<div style="font-weight: 600; font-size: 18px;">${p.projectName}</div>
<div style="color: #888; font-size: 13px; margin-top: 4px;">${p.description || 'No description'}</div>
<div style="margin-top: 12px; display: flex; gap: 16px; font-size: 13px;">
<span style="color: #10b981; font-weight: 600;">💰 $${(p.estimate || 0).toLocaleString()}</span>
<span class="text-muted">⏱️ ${p.turnaround || '72 hours'}</span>
</div>
</div>
<button onclick="acceptDesignerJob(${p.id})" style="padding: 12px 24px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Accept Job</button>
</div>
</div>`;
        }).join('') : '<p class="text-muted">No available jobs right now. Check back soon!</p>'}
    `;
}

async function acceptDesignerJob(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!confirm(`Accept "${order.projectName}" for $${(order.estimate || 0).toLocaleString()}?\n\nYou will have 72 hours to deliver the first proof.`)) return;

    order.assignedDesigner = currentUser.id;
    order.assignedDesignerId = currentUser.id;
    order.status = 'in_progress';
    order.acceptedAt = new Date().toISOString();
    // Use turnaround from service package if available, else default 72 hours
    const turnaroundHours = (order.turnaroundDaysMin || 3) * 24;
    order.dueDate = new Date(Date.now() + turnaroundHours * 60 * 60 * 1000).toISOString();
    addStatusHistory(order, 'assigned', `${currentUser.name} accepted the project`);
    addStatusHistory(order, 'in_progress', 'Work started');
    saveOrders();

    // Notify admin
    addDesignerMessage(currentUser.id, orderId, `${currentUser.name} accepted the project "${order.projectName}"`, 'system');

    // Notify client that work has begun
    const client = clients.find(c => c.id === order.clientId);
    if (client?.email) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    subject: `🎨 Work Started on ${order.projectName}!`,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 32px; text-align: center;">
<h2 class="m-0 fs-24 text-white">Your Project is Underway!</h2>
</div>
<div class="p-32">
<p style="color: #ccc;">Hey ${client.name}, a designer has started working on <strong>${order.projectName}</strong>. You'll receive proof files for review soon!</p>
<p style="color: #888; font-size: 14px; margin-top: 24px;">Estimated turnaround: <strong>${order.turnaround || 'TBD'}</strong></p>
</div>
<div class="admin-footer-bar"><p class="text-muted fs-12 m-0">New Urban Influence • Detroit, MI</p></div>
</div>`,
                    text: `Work has started on your project "${order.projectName}"! Estimated turnaround: ${order.turnaround || 'TBD'}.`
                })
            });
        } catch (err) { console.log('Client notification failed:', err.message); }
    }

    // Log to CRM
    logProofActivity('assigned', { clientId: order.clientId, projectName: order.projectName }, `Designer ${currentUser.name} accepted "${order.projectName}"`);

    alert('Job accepted! Turnaround: ' + (order.turnaround || '72 hours'));
    loadDesignerAvailablePanel();
}

function loadDesignerProofsPanel() {
    const myProjects = orders.filter(o => (o.assignedDesigner === currentUser.id || o.assignedDesignerId === currentUser.id || o.assignedDesigner === currentUser.name) && o.status === 'in_progress');
    document.getElementById('designerProofsPanel').innerHTML = `
<h2 style="font-size: 28px; margin-bottom: 24px;">Upload Proofs</h2>
<div class="mb-24">
<label style="display: block; margin-bottom: 8px; color: #888;">Select Project</label>
<select id="proofProjectSelect" onchange="loadProofUploadArea()" class="admin-input-dark">
<option value="">-- Select a project --</option>
                ${myProjects.map(p => `<option value="${p.id}">${p.projectName}</option>`).join('')}
</select>
</div>
<div id="proofUploadArea"></div>
    `;
}

function loadProofUploadArea() {
    const projectId = document.getElementById('proofProjectSelect')?.value;
    if (!projectId) {
        document.getElementById('proofUploadArea').innerHTML = '';
        return;
    }

    const project = orders.find(o => o.id == projectId);
    const projectProofs = proofs.filter(p => p.projectId == projectId);

    document.getElementById('proofUploadArea').innerHTML = `
<div style="background: #111; padding: 24px; border-radius: 12px; border: 2px dashed #333; text-align: center; margin-bottom: 24px;">
<input type="file" id="proofFileInput" multiple accept="image/*,.pdf" class="hidden" onchange="handleDesignerProofUpload(${projectId})">
<div style="font-size: 48px; margin-bottom: 12px;">📤</div>
<p class="mb-16">Drag & drop proof files or click to browse</p>
<button onclick="document.getElementById('proofFileInput').click()" style="padding: 12px 24px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer;">Select Files</button>
</div>
<div>
<label style="display: block; margin-bottom: 8px; color: #888;">Notes for Admin</label>
<textarea id="proofNotes" placeholder="Add any notes about this proof..." style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px; min-height: 100px;"></textarea>
</div>
        ${projectProofs.length > 0 ? `
<h3 style="margin-top: 24px; margin-bottom: 16px;">Previous Proofs</h3>
        ${projectProofs.map(p => `<div style="background: #111; padding: 16px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
<div>
<div style="font-weight: 500;">Version ${p.version}</div>
<div style="color: #888; font-size: 12px;">${new Date(p.uploadedAt).toLocaleDateString()}</div>
</div>
<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; background: ${p.status === 'approved' ? '#10b98120' : p.status === 'rejected' ? '#ef444420' : '#f59e0b20'}; color: ${p.status === 'approved' ? '#10b981' : p.status === 'rejected' ? '#ef4444' : '#f59e0b'};">${p.status}</span>
</div>`).join('')}
        ` : ''}
    `;
}

function handleDesignerProofUpload(projectId) {
    const files = document.getElementById('proofFileInput').files;
    const notes = document.getElementById('proofNotes')?.value || '';

    if (files.length === 0) return;

    const projectProofs = proofs.filter(p => p.projectId == projectId);
    const version = projectProofs.length + 1;
    const project = orders.find(o => o.id == projectId);
    const client = project ? clients.find(c => c.id === project.clientId) : null;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const newProof = {
                id: Date.now(),
                projectId: parseInt(projectId),
                designerId: currentUser.id,
                designerName: currentUser.name || currentUser.email,
                version: version,
                fileName: file.name,
                fileData: e.target.result,
                notes: notes,
                clientId: client?.id || null,
                clientName: client?.name || null,
                projectName: project?.projectName || project?.project || '',
                status: 'pending_admin', // Goes to admin first
                uploadedAt: new Date().toISOString()
            };
            proofs.push(newProof);
            saveProofs();

            // Notify admin via messaging
            addDesignerMessage(currentUser.id, projectId, `New proof uploaded for review (Version ${version})`, 'proof');

            // Send real email notification to admin
            try {
                await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: 'newurbaninfluence@gmail.com',
                        subject: `📤 New Proof Uploaded: ${project?.projectName || 'Project'} (v${version}) by ${currentUser.name}`,
                        html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #e63946, #ff6b6b); padding: 24px; text-align: center;">
<h2 style="margin: 0; font-size: 20px; color: #fff;">📤 New Proof Ready for Review</h2>
</div>
<div class="p-32">
<table style="width: 100%; border-collapse: collapse;">
<tr><td style="padding: 8px 0; color: #888;">Project</td><td style="padding: 8px 0; color: #fff; text-align: right; font-weight: 600;">${project?.projectName || 'N/A'}</td></tr>
<tr><td style="padding: 8px 0; color: #888;">Client</td><td style="padding: 8px 0; color: #fff; text-align: right;">${client?.name || 'N/A'}</td></tr>
<tr><td style="padding: 8px 0; color: #888;">Designer</td><td style="padding: 8px 0; color: #fff; text-align: right;">${currentUser.name}</td></tr>
<tr><td style="padding: 8px 0; color: #888;">Version</td><td style="padding: 8px 0; color: #fff; text-align: right;">v${version}</td></tr>
<tr><td style="padding: 8px 0; color: #888;">File</td><td style="padding: 8px 0; color: #fff; text-align: right;">${file.name}</td></tr>
                                    ${notes ? '<tr><td style="padding: 8px 0; color: #888;">Notes</td><td style="padding: 8px 0; color: #fff; text-align: right;">' + notes + '</td></tr>' : ''}
</table>
<p style="color: #888; font-size: 13px; margin-top: 24px;">Log into the admin panel → ✅ Proof Approval to review.</p>
</div>
</div>`,
                        text: `New proof uploaded for ${project?.projectName || 'project'} (v${version}) by ${currentUser.name}. File: ${file.name}. ${notes ? 'Notes: ' + notes : ''}`
                    })
                });
                console.log('📧 Admin notification sent for proof upload');
            } catch (err) {
                console.log('Admin email failed (non-fatal):', err.message);
            }

            // Log to CRM communications
            logProofActivity('upload', newProof, `${currentUser.name} uploaded proof v${version} for ${project?.projectName || 'project'}`);

            alert('Proof uploaded! Admin has been notified via email.');
            loadProofUploadArea();
        };
        reader.readAsDataURL(file);
    });
}

// ==================== DESIGNER-ADMIN MESSAGING ====================
let designerMessages = JSON.parse(localStorage.getItem('nui_designer_messages')) || [];
function saveDesignerMessages() { localStorage.setItem('nui_designer_messages', JSON.stringify(designerMessages)); syncToBackend('designer_messages', designerMessages); }

function addDesignerMessage(designerId, projectId, message, type = 'message', fromAdmin = false) {
    designerMessages.push({
        id: Date.now(),
        designerId,
        projectId,
        message,
        type,
        fromAdmin,
        read: false,
        createdAt: new Date().toISOString()
    });
    saveDesignerMessages();
}

// ═══════════════════════════════════════════════
// CLIENT MESSAGING SYSTEM
// ═══════════════════════════════════════════════
let clientMessages = JSON.parse(localStorage.getItem('nui_client_messages')) || [];
function saveClientMessages() { localStorage.setItem('nui_client_messages', JSON.stringify(clientMessages)); syncToBackend('client_messages', clientMessages); }

function addClientMessage(clientId, projectId, message, type = 'message', fromAdmin = false) {
    clientMessages.push({
        id: Date.now(),
        clientId,
        projectId,
        message,
        type,
        fromAdmin,
        read: false,
        createdAt: new Date().toISOString()
    });
    saveClientMessages();
}

function sendAdminMessageToClient(clientId, projectId) {
    const msg = prompt('Message to client:');
    if (!msg) return;
    addClientMessage(clientId, projectId, msg, 'message', true);
    alert('✅ Message sent to client');
    if (typeof loadAdminClientsPanel === 'function') loadAdminClientsPanel();
}

function loadClientMessagesPanel() {
    if (!currentUser) return;
    const clientId = currentUser.clientId || currentUser.id;
    const myMessages = clientMessages.filter(m => m.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Mark unread as read
    myMessages.filter(m => !m.read && m.fromAdmin).forEach(m => m.read = true);
    saveClientMessages();

    document.getElementById('clientPortalContent').innerHTML = `
<div style="max-width: 800px; margin: 0 auto; padding: 24px;">
<div class="flex-between mb-24">
<h2 style="font-size: 24px; margin: 0;">Messages</h2>
<button onclick="loadClientDashboard()" style="padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer;">← Back</button>
</div>

            <!-- Send Message -->
<div style="background: #111; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
<textarea id="clientMsgInput" placeholder="Send a message to your project manager..." style="width: 100%; min-height: 80px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 12px; color: #fff; font-size: 14px; resize: vertical; box-sizing: border-box;"></textarea>
<div style="display: flex; justify-content: flex-end; margin-top: 12px;">
<button onclick="submitClientMessage()" style="padding: 10px 24px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Send Message</button>
</div>
</div>

            <!-- Messages List -->
            ${myMessages.length > 0 ? myMessages.map(m => `
<div style="background: ${m.fromAdmin ? '#0a1628' : '#111'}; border: 1px solid ${m.fromAdmin ? '#1e3a5f' : '#333'}; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
<span style="font-weight: 600; color: ${m.fromAdmin ? '#3b82f6' : '#10b981'};">${m.fromAdmin ? '👤 NUI Team' : '💬 You'}</span>
<span style="font-size: 12px; color: #666;">${new Date(m.createdAt).toLocaleString()}</span>
</div>
<p style="margin: 0; color: #ddd; line-height: 1.5;">${m.message}</p>
                    ${m.projectId ? '<div style="font-size: 11px; color: #555; margin-top: 8px;">Project #' + m.projectId + '</div>' : ''}
</div>
            `).join('') : '<div style="text-align: center; padding: 40px; color: #888;"><div style="font-size: 48px; margin-bottom: 16px;">💬</div><p>No messages yet. Send a message to your project manager above!</p></div>'}
</div>
    `;
}

function submitClientMessage() {
    const input = document.getElementById('clientMsgInput');
    if (!input || !input.value.trim()) return;
    const clientId = currentUser.clientId || currentUser.id;
    addClientMessage(clientId, null, input.value.trim(), 'message', false);

    // Also log to CRM communications hub
    if (typeof communicationsHub !== 'undefined') {
        const client = clients.find(c => c.id === clientId);
        communicationsHub.inbox.unshift({
            id: Date.now(),
            type: 'client-message',
            subject: 'New message from ' + (client?.name || 'Client'),
            from: client?.email || 'client',
            to: 'admin',
            body: input.value.trim(),
            date: new Date().toISOString(),
            read: false,
            channel: 'client-portal'
        });
        if (typeof saveCommunicationsHub === 'function') saveCommunicationsHub();
    }

    loadClientMessagesPanel();
}

function loadDesignerMessagesPanel() {
    const myMessages = designerMessages.filter(m => m.designerId === currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Mark as read
    myMessages.forEach(m => m.read = true);
    saveDesignerMessages();

    document.getElementById('designerMessagesPanel').innerHTML = `
<h2 style="font-size: 28px; margin-bottom: 24px;">Messages with Admin</h2>
<div style="margin-bottom: 24px; display: flex; gap: 12px;">
<input type="text" id="newMessageInput" placeholder="Type a message to admin..." style="flex: 1; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
<button onclick="sendMessageToAdmin()" style="padding: 12px 24px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer;">Send</button>
</div>
<div style="max-height: 500px; overflow-y: auto;">
            ${myMessages.length > 0 ? myMessages.map(m => `
<div style="background: ${m.fromAdmin ? '#1a1a2e' : '#111'}; padding: 16px; border-radius: 12px; margin-bottom: 8px; border-left: 3px solid ${m.fromAdmin ? '#3b82f6' : 'var(--red)'};">
<div class="flex-between mb-8">
<span style="font-weight: 600; color: ${m.fromAdmin ? '#3b82f6' : 'var(--red)'};">${m.fromAdmin ? '👤 Admin' : '🎨 You'}</span>
<span style="color: #666; font-size: 12px;">${new Date(m.createdAt).toLocaleString()}</span>
</div>
<p class="m-0">${m.message}</p>
</div>
            `).join('') : '<p style="color: #888; text-align: center;">No messages yet.</p>'}
</div>
    `;
}

function sendMessageToAdmin() {
    const input = document.getElementById('newMessageInput');
    const message = input?.value?.trim();
    if (!message) return;

    addDesignerMessage(currentUser.id, null, message, 'message', false);
    input.value = '';
    loadDesignerMessagesPanel();
}

function openDesignerChat(projectId) {
    showDesignerPanel('messages');
}

// ==================== CLIENT DASHBOARD ====================
