// ==================== ORDER FUNCTIONS ====================
async function createOrder(e) {
    e.preventDefault();

    const clientId = parseInt(document.getElementById('orderClient').value);

    // Check subscription order limits
    const clientSubs = subscriptions.filter(s => s.clientId === clientId && s.status === 'active');
    const limitedSub = clientSubs.find(s => s.orderLimit);
    if (limitedSub) {
        const activeOrders = orders.filter(o => o.clientId === clientId && !['delivered', 'completed', 'cancelled'].includes(o.status));
        if (activeOrders.length >= limitedSub.orderLimit) {
            alert(`Order limit reached! Your ${limitedSub.plan} plan allows ${limitedSub.orderLimit} active orders at a time. Please wait for a current order to complete before submitting a new one.`);
            return;
        }
    }
    const client = clients.find(c => c.id === clientId);
    const pkgId = document.getElementById('orderPackage')?.value || '';
    const pkg = servicePackages.find(p => p.id === pkgId);
    const svc = pkgId.startsWith('svc-') ? individualServices.find(s => s.id == pkgId.replace('svc-', '')) : null;
    const turnaroundStr = document.getElementById('orderTurnaround').value;

    // Parse turnaround into days for deadline tracking
    const turnaroundMatch = turnaroundStr.match(/(\d+)/);
    const turnaroundDaysMin = turnaroundMatch ? parseInt(turnaroundMatch[1]) : 7;
    const turnaroundMatchMax = turnaroundStr.match(/(\d+)\s*[-–]\s*(\d+)/);
    const turnaroundDaysMax = turnaroundMatchMax ? parseInt(turnaroundMatchMax[2]) : turnaroundDaysMin;

    const order = {
        id: Date.now(),
        clientId: clientId,
        projectName: document.getElementById('orderProject').value,
        description: document.getElementById('orderDesc').value,
        estimate: parseFloat(document.getElementById('orderEstimate').value),
        turnaround: turnaroundStr,
        turnaroundDaysMin: turnaroundDaysMin,
        turnaroundDaysMax: turnaroundDaysMax,
        packageId: pkg ? pkg.id : (svc ? 'svc-' + svc.id : 'custom'),
        packageName: pkg ? pkg.name : (svc ? svc.name : 'Custom Order'),
        dueDate: document.getElementById('orderDueDate').value,
        status: document.getElementById('orderStatus').value,
        statusHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order created', user: currentUser?.name || 'Admin' }],
        createdAt: new Date().toISOString(),
        deliveredAt: null,
        deliverables: [],
        paymentStatus: 'unpaid'
    };
    orders.push(order);
    saveOrders();

    // === CREATE REAL INVOICE ===
    const invoice = {
        id: Date.now() + 1,
        invoiceNumber: 'INV-' + order.id,
        clientId: clientId,
        clientName: client?.name || 'Unknown',
        clientEmail: client?.email || '',
        orderId: order.id,
        projectName: order.projectName,
        lineItems: [{ description: order.projectName + (order.description ? ' — ' + order.description : ''), amount: order.estimate }],
        subtotal: order.estimate,
        total: order.estimate,
        dueDate: order.dueDate,
        notes: 'Turnaround: ' + turnaroundStr,
        status: 'pending',
        termsAccepted: false,
        createdAt: new Date().toISOString()
    };
    invoices.push(invoice);
    saveInvoices();
    order.invoiceId = invoice.id;
    saveOrders();

    // === NOTIFY CLIENT VIA EMAIL ===
    if (client?.email) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    clientId: clientId,
                    subject: `📋 New Project: ${order.projectName} — Invoice Ready`,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #e11d48, #ff6b6b); padding: 32px; text-align: center;">
<h2 style="margin: 0; font-size: 24px; color: #fff;">New Project Started!</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc; font-size: 16px;">Hey ${client.name},</p>
<p style="color: #ccc; font-size: 16px;">Your project <strong>${order.projectName}</strong> has been created and is ready to go!</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
<div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
<span style="color: #888;">Project</span>
<strong style="color: #fff;">${order.projectName}</strong>
</div>
<div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
<span style="color: #888;">Package</span>
<strong style="color: #fff;">${order.packageName}</strong>
</div>
<div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
<span style="color: #888;">Turnaround</span>
<strong style="color: #fff;">${turnaroundStr}</strong>
</div>
<div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
<span style="color: #888;">Due Date</span>
<strong style="color: #fff;">${new Date(order.dueDate).toLocaleDateString()}</strong>
</div>
<div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #333;">
<span style="color: #888;">Amount Due</span>
<strong style="color: #e11d48; font-size: 20px;">$${order.estimate.toLocaleString()}</strong>
</div>
</div>
<div style="text-align: center; margin: 24px 0;">
<a href="https://newurbaninfluence.com/#portal" style="display: inline-block; background: #e11d48; color: #fff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Invoice & Pay →</a>
</div>
<p style="color: #888; font-size: 13px; text-align: center;">Invoice #${invoice.invoiceNumber}</p>
</div>
<div style="background: #050505; padding: 20px; text-align: center; border-top: 1px solid #222;">
<p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Detroit, MI</p>
</div>
</div>`,
                    text: `New project "${order.projectName}" created! Amount: $${order.estimate.toLocaleString()}. Turnaround: ${turnaroundStr}. Log in to your client portal to view invoice and pay.`
                })
            });
            console.log('📧 New order email sent to ' + client.email);
        } catch (err) {
            console.log('Order email failed:', err.message);
        }
    }

    // === NOTIFY DESIGNERS OF AVAILABLE WORK ===
    if (!order.assignedDesigner) {
        const allDesigners = JSON.parse(localStorage.getItem('nui_designers')) || [];
        allDesigners.forEach(d => {
            if (d.id || d.name) {
                addDesignerMessage(d.id || d.name, order.id, `🆕 New project available: "${order.projectName}" — $${order.estimate.toLocaleString()} • ${turnaroundStr}`, 'system', true);
            }
        });
    }

    // === LOG TO CRM ===
    communicationsHub.inbox.unshift({
        id: Date.now() + 2,
        platform: 'system',
        clientId: clientId,
        clientName: client?.name || '',
        preview: `New order created: ${order.projectName} — $${order.estimate.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        unread: true,
        metadata: { type: 'order_created', orderId: order.id, invoiceId: invoice.id }
    });
    saveCommHub();

    showInvoice(order.id);
    showAdminPanel('orders');
    alert('✅ Order created!\n📄 Invoice #' + invoice.invoiceNumber + ' generated' + (client?.email ? '\n📧 Client notified via email' : ''));
}

async function createClient(e) {
    e.preventDefault();

    const email = document.getElementById('newClientEmail').value;
    const name = document.getElementById('newClientName').value;

    // Validate email format
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Check if email already exists
    if (clients.find(c => c.email.toLowerCase() === email.toLowerCase())) {
        alert('A client with this email already exists.');
        return;
    }

    const client = {
        id: Date.now(),
        name: name,
        contact: document.getElementById('newClientContact')?.value || '',
        email: email,
        phone: document.getElementById('newClientPhone')?.value || '',
        password: document.getElementById('newClientPassword').value,
        address: document.getElementById('newClientAddress')?.value || '',
        industry: document.getElementById('newClientIndustry').value,
        website: document.getElementById('newClientWebsite').value,
        social: document.getElementById('newClientSocial')?.value || '',
        servicePackageId: document.getElementById('newClientService')?.value || '',
        servicePackageName: (() => { const sel = document.getElementById('newClientService'); return sel?.value === 'custom' ? 'Custom / Multiple Services' : (servicePackages.find(p => p.id === sel?.value)?.name || ''); })(),
        referralSource: document.getElementById('newClientReferral')?.value || '',
        notes: document.getElementById('newClientNotes')?.value || '',
        colors: [document.getElementById('color1').value, document.getElementById('color2').value, document.getElementById('color3').value],
        fonts: { heading: document.getElementById('newClientHeadingFont').value || 'Inter', body: document.getElementById('newClientBodyFont').value || 'Inter' },
        assets: { logos: [], mockups: [], social: [], video: [], banner: [], fonts: [], patterns: [], package: [] },
        emailVerified: false,
        verificationToken: generateToken(),
        onboardingStatus: 'new',
        createdAt: new Date().toISOString()
    };
    clients.push(client);
    saveClients();

    // === CREATE SUPABASE AUTH ACCOUNT (so welcome email credentials work) ===
    try {
        if (window.NuiAuth && NuiAuth.isAvailable()) {
            await NuiAuth.signUp(client.email, client.password, {
                role: 'client',
                name: client.name,
                clientId: client.id
            });
            console.log('✅ Supabase auth account created for', client.email);
        } else {
            console.warn('⚠️ Supabase Auth not available — client will use localStorage login only');
        }
    } catch (authErr) {
        console.warn('Supabase auth signup failed (client can still use localStorage login):', authErr.message);
    }

    const sendWelcome = document.getElementById('sendWelcomeEmail')?.checked;
    const sendQuest = document.getElementById('sendQuestionnaire')?.checked;
    const addPipeline = document.getElementById('addToPipeline')?.checked;

    let actionsCompleted = [];

    // === SEND WELCOME EMAIL ===
    if (sendWelcome) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    clientId: client.id,
                    subject: `Welcome to New Urban Influence! 🎉`,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #e11d48, #ff6b6b); padding: 40px; text-align: center;">
<h2 style="margin: 0; font-size: 28px; color: #fff;">Welcome to the Family!</h2>
<p style="color: rgba(255,255,255,0.8); margin-top: 8px;">New Urban Influence</p>
</div>
<div style="padding: 32px;">
<p style="color: #ccc; font-size: 16px;">Hey ${client.contact || client.name},</p>
<p style="color: #ccc; font-size: 16px;">We're thrilled to have you on board! Your client portal has been set up and is ready to go.</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
<p style="color: #e11d48; font-weight: 600; margin-bottom: 16px;">🔐 Your Login Credentials:</p>
<p style="color: #ccc; margin: 8px 0;">Email: <strong>${client.email}</strong></p>
<p style="color: #ccc; margin: 8px 0;">Password: <strong>${client.password}</strong></p>
<p style="color: #888; font-size: 12px; margin-top: 12px;">We recommend changing your password after first login.</p>
</div>
<div style="text-align: center; margin: 24px 0;">
<a href="https://newurbaninfluence.com/#portal" style="display: inline-block; background: #e11d48; color: #fff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Log In to Your Portal →</a>
</div>
<div style="background: #111; border-left: 3px solid #e11d48; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
<p style="color: #fff; font-weight: 600; margin-bottom: 8px;">What's Next?</p>
<p style="color: #ccc; font-size: 14px; line-height: 1.8;">1. Log in and explore your portal<br>2. Complete the service questionnaire (check your inbox!)<br>3. Book a strategy call with our team<br>4. We start bringing your vision to life!</p>
</div>
<p style="color: #888; font-size: 13px;">Questions? Reply to this email or call us at (248) 487-8747.</p>
</div>
<div style="background: #050505; padding: 20px; text-align: center; border-top: 1px solid #222;">
<p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Unapologetically Detroit</p>
</div>
</div>`,
                    text: `Welcome to New Urban Influence! Your portal is ready. Login: ${client.email} / ${client.password}. Visit newurbaninfluence.com to get started.`
                })
            });
            actionsCompleted.push('Welcome email sent');
        } catch (err) { console.log('Welcome email failed:', err.message); }
    }

    // === SEND SERVICE QUESTIONNAIRE ===
    if (sendQuest) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    clientId: client.id,
                    subject: `📋 Quick Questionnaire — Help Us Serve You Better`,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 32px; text-align: center;">
<h2 style="margin: 0; font-size: 24px; color: #fff;">Tell Us About Your Project</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc; font-size: 16px;">Hey ${client.contact || client.name},</p>
<p style="color: #ccc; font-size: 16px;">To kick things off, we'd love to learn more about your business and what you're looking for. Please take a few minutes to fill out our questionnaire:</p>
<div style="text-align: center; margin: 32px 0;">
<a href="https://newurbaninfluence.com/#services" style="display: inline-block; background: #3b82f6; color: #fff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Questionnaire →</a>
</div>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
<p style="color: #fff; font-weight: 600; margin-bottom: 12px;">The questionnaire covers:</p>
<p style="color: #ccc; font-size: 14px; line-height: 1.8;">• Your business goals and target audience<br>• Design preferences and inspiration<br>• Budget and timeline expectations<br>• Any existing brand assets</p>
</div>
<p style="color: #888; font-size: 14px;">This helps us match you with the right service package and designer. Takes about 5-10 minutes.</p>
</div>
<div style="background: #050505; padding: 20px; text-align: center; border-top: 1px solid #222;">
<p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Detroit, MI</p>
</div>
</div>`,
                    text: `We'd love to learn about your project. Fill out our questionnaire at newurbaninfluence.com/#services to get started.`
                })
            });
            actionsCompleted.push('Questionnaire sent');
            client.onboardingStatus = 'questionnaire_sent';
            saveClients();
        } catch (err) { console.log('Questionnaire email failed:', err.message); }
    }

    // === ADD TO CRM PIPELINE ===
    if (addPipeline) {
        try {
            const newContact = {
                id: client.id,
                name: client.contact || client.name,
                email: client.email,
                phone: client.phone || '',
                company: client.name,
                value: 0,
                stage: 1, // New Lead
                clientId: client.id,
                source: client.referralSource || 'direct',
                createdAt: client.createdAt
            };
            if (typeof crmData !== 'undefined' && crmData && crmData.contacts) {
                if (!crmData.contacts.find(c => c.email === client.email)) {
                    crmData.contacts.push(newContact);
                    localStorage.setItem('nui_crm', JSON.stringify(crmData));
                }
                actionsCompleted.push('Added to CRM pipeline');
            }
        } catch(crmErr) { console.warn('CRM pipeline add failed:', crmErr.message); }
    }

    // === LOG TO COMMUNICATIONS ===
    try {
        if (typeof communicationsHub !== 'undefined' && communicationsHub && communicationsHub.inbox) {
            communicationsHub.inbox.unshift({
                id: Date.now() + 1, platform: 'system', clientId: client.id, clientName: client.name,
                preview: `New client onboarded: ${client.name} (${client.email})`,
                timestamp: new Date().toISOString(), unread: true,
                metadata: { type: 'client_created', actions: actionsCompleted }
            });
            if (typeof saveCommHub === 'function') saveCommHub();
        }
    } catch(commErr) { console.warn('CommHub log failed:', commErr.message); }

    // Show success with actions taken
    const actionsMsg = actionsCompleted.length > 0 ? '\n\n✅ ' + actionsCompleted.join('\n✅ ') : '';
    alert(`Client "${name}" created successfully!${actionsMsg}`);
    showAdminPanel('clients');
}

// Email validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate verification token
function generateToken() {
    return 'verify_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Send verification email (simulated)
function sendVerificationEmail(client) {
    console.log('Verification email sent to:', client.email);
    console.log('Verification link: https://newurbaninfluence.com/verify?token=' + client.verificationToken);
    // In production, this would send an actual email via an email service API
}

// Verify email with token
function verifyEmail(token) {
    const client = clients.find(c => c.verificationToken === token);
    if (client) {
        client.emailVerified = true;
        client.verificationToken = null;
        saveClients();
        alert('Email verified successfully! You can now log in.');
        return true;
    }
    alert('Invalid or expired verification token.');
    return false;
}

// Resend verification email
function resendVerification(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client && !client.emailVerified) {
        client.verificationToken = generateToken();
        saveClients();
        sendVerificationEmail(client);
        alert('Verification email resent to ' + client.email);
    }
}

function deleteClient(id) {
    if (!confirm('Delete this client and all their data?')) return;
    clients = clients.filter(c => c.id !== id);
    orders = orders.filter(o => o.clientId !== id);
    saveClients();
    saveOrders();
    loadAdminClientsPanel();
}

function updateOrderStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    // Show status update modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'statusUpdateModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 480px;">
<div class="modal-header">
<h3 class="modal-title">📋 Update Order Status</h3>
<button class="modal-close" onclick="document.getElementById('statusUpdateModal').remove()">×</button>
</div>
<div class="modal-body">
<p style="color: var(--admin-text-muted); margin-bottom: 16px;">Update status for: <strong>${order.projectName}</strong></p>

<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
<label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid ${order.status === 'pending' ? 'var(--red)' : 'var(--admin-border)'}; border-radius: 8px; cursor: pointer; background: ${order.status === 'pending' ? 'rgba(255,0,0,0.1)' : 'transparent'};">
<input type="radio" name="orderStatus" value="pending" ${order.status === 'pending' ? 'checked' : ''}>
<span style="font-size: 20px;">📥</span>
<div><strong>Pending</strong><br><span style="font-size: 12px; color: var(--admin-text-muted);">Awaiting assignment</span></div>
</label>
<label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid ${order.status === 'in_progress' ? 'var(--red)' : 'var(--admin-border)'}; border-radius: 8px; cursor: pointer; background: ${order.status === 'in_progress' ? 'rgba(255,0,0,0.1)' : 'transparent'};">
<input type="radio" name="orderStatus" value="in_progress" ${order.status === 'in_progress' ? 'checked' : ''}>
<span style="font-size: 20px;">🎨</span>
<div><strong>In Progress</strong><br><span style="font-size: 12px; color: var(--admin-text-muted);">Currently being worked on</span></div>
</label>
<label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid ${order.status === 'review' ? 'var(--red)' : 'var(--admin-border)'}; border-radius: 8px; cursor: pointer; background: ${order.status === 'review' ? 'rgba(255,0,0,0.1)' : 'transparent'};">
<input type="radio" name="orderStatus" value="review" ${order.status === 'review' ? 'checked' : ''}>
<span style="font-size: 20px;">👁️</span>
<div><strong>Under Review</strong><br><span style="font-size: 12px; color: var(--admin-text-muted);">Submitted for client review</span></div>
</label>
<label style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid ${order.status === 'delivered' ? 'var(--green)' : 'var(--admin-border)'}; border-radius: 8px; cursor: pointer; background: ${order.status === 'delivered' ? 'rgba(34,197,94,0.1)' : 'transparent'};">
<input type="radio" name="orderStatus" value="delivered" ${order.status === 'delivered' ? 'checked' : ''}>
<span style="font-size: 20px;">✅</span>
<div><strong>Delivered</strong><br><span style="font-size: 12px; color: var(--admin-text-muted);">Project completed</span></div>
</label>
</div>

<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; font-weight: 600;">Add Note (optional)</label>
<textarea id="statusNote" placeholder="Add a note about this status change..." style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; background: var(--admin-input-bg); color: var(--admin-text); min-height: 80px; resize: vertical;"></textarea>
</div>

<button onclick="applyStatusUpdate(${id})" class="btn-cta" style="width: 100%;">Update Status</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

async function applyStatusUpdate(id) {
    const order = orders.find(o => o.id === id);
    const newStatus = document.querySelector('input[name="orderStatus"]:checked')?.value;
    const note = document.getElementById('statusNote')?.value || '';

    if (order && newStatus) {
        const oldStatus = order.status;
        if (oldStatus === newStatus) {
            document.getElementById('statusUpdateModal')?.remove();
            return;
        }
        order.status = newStatus;
        if (newStatus === 'delivered') order.deliveredAt = new Date().toISOString();
        addStatusHistory(order, newStatus, note || `Status changed from ${oldStatus} to ${newStatus}`);
        saveOrders();
        document.getElementById('statusUpdateModal')?.remove();

        // === EMAIL CLIENT ABOUT STATUS CHANGE ===
        const client = clients.find(c => c.id === order.clientId);
        if (client?.email) {
            const statusLabels = {
                'pending': { label: 'Pending', color: '#f59e0b', icon: '📥', msg: 'Your project is queued and will begin shortly.' },
                'in_progress': { label: 'In Progress', color: '#3b82f6', icon: '🎨', msg: 'A designer is actively working on your project!' },
                'review': { label: 'Under Review', color: '#8b5cf6', icon: '👁️', msg: 'Your project is ready for review. You\'ll receive proof files soon!' },
                'delivered': { label: 'Delivered', color: '#10b981', icon: '✅', msg: 'Your project is complete! Log in to your portal to download your files.' }
            };
            const info = statusLabels[newStatus] || { label: newStatus, color: '#888', icon: '📋', msg: '' };

            try {
                await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: client.email,
                        clientId: client.id,
                        subject: `${info.icon} ${order.projectName} — Status: ${info.label}`,
                        html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: ${info.color}; padding: 32px; text-align: center;">
<h2 style="margin: 0; font-size: 24px; color: #fff;">${info.icon} Project Update</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc; font-size: 16px;">Hey ${client.name},</p>
<p style="color: #ccc; font-size: 16px;">Your project <strong>${order.projectName}</strong> status has been updated:</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
<div style="font-size: 32px; margin-bottom: 12px;">${info.icon}</div>
<div style="font-size: 24px; font-weight: 700; color: ${info.color}; margin-bottom: 8px;">${info.label}</div>
<p style="color: #888; font-size: 14px; margin: 0;">${info.msg}</p>
                                    ${note ? `<p style="color: #ccc; font-size: 14px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #333; font-style: italic;">"${note}"</p>` : ''}
</div>
                                ${newStatus === 'delivered' ? `<div style="text-align: center;"><a href="https://newurbaninfluence.com" style="display: inline-block; background: #10b981; color: #fff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">Download Files →</a></div>` : ''}
<p style="color: #888; font-size: 13px; margin-top: 24px;">Track your project anytime at <a href="https://newurbaninfluence.com/#portal" style="color: #e63946;">your Client Portal</a>.</p>
</div>
<div style="background: #050505; padding: 20px; text-align: center; border-top: 1px solid #222;"><p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Detroit, MI</p></div>
</div>`,
                        text: `Project "${order.projectName}" status updated to: ${info.label}. ${info.msg}`
                    })
                });
                console.log('📧 Status update email sent to ' + client.email);
            } catch (err) { console.log('Status email failed:', err.message); }
        }

        // Log to CRM
        logProofActivity('status_change', { clientId: order.clientId, projectName: order.projectName }, `"${order.projectName}" status: ${oldStatus} → ${newStatus}${note ? ' — ' + note : ''}`);

        // Notify designer if assigned
        if (order.assignedDesigner || order.assignedDesignerId) {
            addDesignerMessage(order.assignedDesignerId || order.assignedDesigner, order.id, `📋 Status updated to "${newStatus.replace('_', ' ')}" for "${order.projectName}"${note ? ': ' + note : ''}`, 'system', true);
        }

        loadAdminOrdersPanel();
    }
}

async function markDelivered(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    addStatusHistory(order, 'delivered', 'Project completed and delivered to client');
    saveOrders();

    const client = clients.find(c => c.id === order.clientId);

    // Trigger workflow: Send delivery notification
    triggerOrderDelivered(id);

    // Send real delivery email to client
    if (client?.email) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    clientId: client.id,
                    subject: `🎉 Your ${order.projectName || order.project || 'Project'} Has Been Delivered!`,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
<h2 style="margin: 0; font-size: 24px; color: #fff;">Your Project is Complete! 🎉</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc; font-size: 16px;">Hey ${client.name || 'there'},</p>
<p style="color: #ccc; font-size: 16px;">Great news — your <strong>${order.projectName || order.project}</strong> project has been completed and delivered!</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
<p style="color: #10b981; font-weight: 600; margin-bottom: 12px;">📦 What's included:</p>
<p style="color: #ccc; font-size: 14px;">All final files and assets are available in your <a href="https://newurbaninfluence.com/#portal" style="color: #e63946;">Client Portal</a>.</p>
</div>
<p style="color: #ccc; font-size: 14px;">We'd love a Google review if you're happy with the work! It helps us help more Detroit businesses. 🙏</p>
<p style="color: #888; font-size: 13px; margin-top: 24px;">Questions? Reply to this email or call (248) 487-8747.</p>
</div>
<div style="background: #050505; padding: 20px; text-align: center; border-top: 1px solid #222;">
<p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Detroit, MI</p>
</div>
</div>`,
                    text: `Your ${order.projectName || order.project} project has been delivered! Log into your client portal to download your files. — New Urban Influence`
                })
            });
            console.log('📧 Delivery email sent to ' + client.email);
        } catch (err) {
            console.log('Delivery email failed:', err.message);
        }
    }

    // Log to CRM
    logProofActivity('delivered', { clientId: order.clientId, projectName: order.projectName || order.project }, `Project "${order.projectName || order.project}" delivered to ${client?.name || 'client'}`);

    alert('Order marked as delivered!' + (client?.email ? '\n📧 Client notified via email.' : ''));
    // Refresh the active panel
    const activePanel = document.querySelector('.admin-panel.active');
    if (activePanel?.id === 'adminDeliveryPanel') {
        loadAdminDeliveryPanel();
    } else {
        loadAdminOrdersPanel();
    }
}

function viewClientAsAdmin(id) {
    const client = clients.find(c => c.id === id);
    if (client) {
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('clientPortal').style.display = 'block';
        showClientPortal(client);
    }
}

