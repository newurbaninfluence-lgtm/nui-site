// ==================== PAYMENTS PANEL ====================
function loadAdminPaymentsPanel() {
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const completedPayments = payments.filter(p => p.status === 'completed');

    document.getElementById('adminPaymentsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">💳 Payments</h2>
<p class="panel-subtitle">Track payments, auto-pay schedules, and revenue</p>
</div>

        <!-- Stats Cards -->
<div class="stats-grid">
<div class="stat-card">
<div class="stat-label">Total Revenue</div>
<div class="stat-value">$${totalRevenue.toLocaleString()}</div>
</div>
<div class="stat-card">
<div class="stat-label">Pending</div>
<div class="stat-value" style="color: #f4a261;">${pendingPayments.length}</div>
</div>
<div class="stat-card">
<div class="stat-label">Completed</div>
<div class="stat-value" style="color: #2a9d8f;">${completedPayments.length}</div>
</div>
<div class="stat-card">
<div class="stat-label">This Month</div>
<div class="stat-value">$${payments.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}</div>
</div>
</div>

<div style="display: flex; justify-content: flex-end; margin-bottom: 24px; gap: 12px;">
<button class="btn-admin secondary" onclick="showPaymentPlansInfo()">📋 Payment Plan Info</button>
<button class="btn-admin primary" onclick="showRecordPaymentModal()">+ Record Payment</button>
</div>

        <!-- Auto-Pay Schedules -->
<div class="form-section">
<div class="form-section-title">⚡ Active Auto-Pay Schedules</div>
<div id="autoPaySchedules">
                ${renderAutoPaySchedules()}
</div>
</div>

        <!-- Recent Payments -->
<div class="form-section">
<div class="form-section-title">💰 Payment History</div>
<table class="data-table">
<thead>
<tr>
<th>Date</th>
<th>Client</th>
<th>Project</th>
<th>Amount</th>
<th>Type</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
                    ${payments.length === 0 ? '<tr><td colspan="7" style="text-align: center; opacity: 0.5;">No payments recorded yet</td></tr>' : ''}
                    ${payments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(payment => `
<tr>
<td>${new Date(payment.date).toLocaleDateString()}</td>
<td>${payment.clientName || 'N/A'}</td>
<td>${payment.projectName || 'N/A'}</td>
<td style="font-weight: 600; color: #2a9d8f;">$${payment.amount?.toLocaleString() || 0}</td>
<td><span class="tag">${payment.type || 'One-time'}</span></td>
<td><span class="status-badge ${payment.status}">${payment.status}</span></td>
<td>
<button class="btn-admin small" onclick="viewPaymentDetails(${payment.id})">View</button>
                                ${payment.status === 'pending' ? `<button class="btn-admin small primary" onclick="markPaymentComplete(${payment.id})">Mark Paid</button>` : ''}
</td>
</tr>
                    `).join('')}
</tbody>
</table>
</div>
    `;
}

function renderAutoPaySchedules() {
    const projectsWithAutoPay = projects.filter(p => p.paymentPlan && p.paymentPlan !== 'full');

    if (projectsWithAutoPay.length === 0) {
        return '<p style="color: rgba(255,255,255,0.5);">No active auto-pay schedules. Create a project with a payment plan to see schedules here.</p>';
    }

    return `
<div class="card-grid">
            ${projectsWithAutoPay.map(project => {
                const plan = paymentPlans[project.paymentPlan];
                const paidInstallments = project.paidInstallments || 0;
                const totalAmount = project.totalAmount || 0;

                return `
<div class="client-card">
<div class="client-card-header" style="background: linear-gradient(135deg, #2a9d8f, #264653);">
                            ${project.name?.charAt(0) || 'P'}
</div>
<div class="client-card-body">
<div class="client-card-name">${project.name}</div>
<div class="client-card-meta">${project.clientName || 'Client'}<br>Plan: ${plan?.name || 'Standard'}</div>
<div style="margin: 12px 0;">
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
<span style="font-size: 12px;">Progress</span>
<span style="font-size: 12px;">${paidInstallments}/${plan?.installments || 3} payments</span>
</div>
<div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
<div style="background: var(--red); height: 100%; width: ${(paidInstallments / (plan?.installments || 3)) * 100}%; transition: width 0.3s;"></div>
</div>
</div>
<div style="font-size: 13px; color: rgba(255,255,255,0.7);">
                                ${plan?.schedule?.map((pct, i) => `
<div style="display: flex; justify-content: space-between; padding: 4px 0; ${i < paidInstallments ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
<span>${plan.triggers?.[i] || `Payment ${i + 1}`}</span>
<span>$${Math.round(totalAmount * pct / 100).toLocaleString()} (${pct}%)</span>
</div>
                                `).join('') || ''}
</div>
</div>
</div>
                `;
            }).join('')}
</div>
    `;
}

function showPaymentPlansInfo() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'paymentPlansModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 700px;">
<div class="modal-header">
<h3 class="modal-title">Payment Plan Options</h3>
<button class="modal-close" onclick="document.getElementById('paymentPlansModal').remove()">×</button>
</div>
<div class="modal-body">
<div style="display: grid; gap: 16px;">
                    ${Object.entries(paymentPlans).map(([key, plan]) => `
<div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid var(--red);">
<h4 style="margin-bottom: 8px;">${plan.name} ${plan.discount > 0 ? `<span style="color: #2a9d8f;">(${plan.discount}% discount)</span>` : ''}</h4>
<p style="font-size: 14px; opacity: 0.7; margin-bottom: 12px;">${plan.installments} installment(s)</p>
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                ${plan.schedule.map((pct, i) => `
<div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 8px; text-align: center;">
<div style="font-size: 18px; font-weight: 600;">${pct}%</div>
<div style="font-size: 11px; opacity: 0.6;">${plan.triggers?.[i] || `Payment ${i + 1}`}</div>
</div>
                                `).join('')}
</div>
</div>
                    `).join('')}
</div>
</div>
<div class="modal-footer">
<button class="btn-admin primary" onclick="document.getElementById('paymentPlansModal').remove()">Got It</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function showRecordPaymentModal() {
    const allClients = window.clients || [];
    const allProjects = window.projects || [];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'recordPaymentModal';
    modal.innerHTML = `
<div class="modal" style="background: #1a1a1a; color: #fff;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title" style="color: #fff;">💳 Record Payment</h3>
<button class="modal-close" onclick="document.getElementById('recordPaymentModal').remove()" style="color: #fff;">×</button>
</div>
<div class="modal-body">
<div class="form-group">
<label class="form-label" style="color: #fff;">Client *</label>
<select id="paymentClient" class="form-select" onchange="loadClientProjects(this.value)" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="">-- Select Client --</option>
                        ${allClients.map(c => `<option value="${c.id}">${c.name}${c.company ? ' - ' + c.company : ''}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Project</label>
<select id="paymentProject" class="form-select" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="">-- Select Project (select client first) --</option>
                        ${allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Amount *</label>
<input type="number" id="paymentAmount" class="form-input" placeholder="0.00" step="0.01" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Payment Type</label>
<select id="paymentType" class="form-select" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="deposit">Deposit (50%)</option>
<option value="approval">Approval Payment (25%)</option>
<option value="final">Final Payment (25%)</option>
<option value="full">Full Payment</option>
<option value="monthly">Monthly Payment</option>
<option value="other">Other</option>
</select>
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Date</label>
<input type="date" id="paymentDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Notes</label>
<textarea id="paymentNotes" class="form-textarea" rows="2" placeholder="Payment notes..." style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);"></textarea>
</div>
</div>
<div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
<button class="btn-admin secondary" onclick="document.getElementById('recordPaymentModal').remove()" style="background: #333; color: #fff;">Cancel</button>
<button class="btn-admin primary" onclick="savePayment()" style="background: var(--red); color: #fff;">Record Payment</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function loadClientProjects(clientId) {
    const allProjects = window.projects || [];
    const clientProjects = clientId ? allProjects.filter(p => p.clientId == clientId) : allProjects;
    const select = document.getElementById('paymentProject');
    if (select) {
        select.innerHTML = `
<option value="">-- Select Project --</option>
            ${clientProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        `;
    }
}

function savePayment() {
    const clientSelect = document.getElementById('paymentClient');
    const projectSelect = document.getElementById('paymentProject');
    const allClients = window.clients || [];
    const client = allClients.find(c => c.id == clientSelect.value);
    const project = (window.projects || []).find(p => p.id == projectSelect.value);

    const payment = {
        id: Date.now(),
        clientId: clientSelect.value,
        clientName: client?.name || 'Unknown',
        projectId: projectSelect.value,
        projectName: project?.name || 'N/A',
        amount: parseFloat(document.getElementById('paymentAmount').value) || 0,
        type: document.getElementById('paymentType').value,
        date: document.getElementById('paymentDate').value,
        notes: document.getElementById('paymentNotes').value,
        status: 'completed',
        createdAt: new Date().toISOString()
    };

    payments.push(payment);
    savePayments();

    // Update project paid installments if applicable
    if (project && project.paymentPlan) {
        project.paidInstallments = (project.paidInstallments || 0) + 1;
        saveProjects();
    }

    document.getElementById('recordPaymentModal').remove();
    loadAdminPaymentsPanel();
    alert('Payment recorded successfully!');
}

function markPaymentComplete(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        payment.status = 'completed';
        payment.completedAt = new Date().toISOString();
        savePayments();
        loadAdminPaymentsPanel();
    }
}

function viewPaymentDetails(id) {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    alert(`Payment Details:\n\nClient: ${payment.clientName}\nProject: ${payment.projectName}\nAmount: $${payment.amount}\nType: ${payment.type}\nDate: ${payment.date}\nStatus: ${payment.status}\nNotes: ${payment.notes || 'None'}`);
}

// ==================== INVOICES PANEL ====================
function loadAdminInvoicesPanel(searchTerm = '', statusFilter = '') {
    let filtered = invoices;

    if (searchTerm) {
        filtered = filtered.filter(i =>
            (i.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.projectName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (statusFilter) {
        filtered = filtered.filter(i => i.status === statusFilter);
    }

    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent');
    const paidInvoices = invoices.filter(i => i.status === 'paid');

    document.getElementById('adminInvoicesPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📄 Invoices</h2>
<p class="panel-subtitle">Create, send, and track invoices</p>
</div>

        <!-- Stats Cards -->
<div class="stats-grid">
<div class="stat-card">
<div class="stat-label">Total Invoiced</div>
<div class="stat-value">$${totalInvoiced.toLocaleString()}</div>
</div>
<div class="stat-card">
<div class="stat-label">Pending</div>
<div class="stat-value" style="color: #f4a261;">${pendingInvoices.length}</div>
</div>
<div class="stat-card">
<div class="stat-label">Paid</div>
<div class="stat-value" style="color: #2a9d8f;">${paidInvoices.length}</div>
</div>
<div class="stat-card">
<div class="stat-label">Outstanding</div>
<div class="stat-value" style="color: #e63946;">$${pendingInvoices.reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}</div>
</div>
</div>

        <!-- Search, Filter, and Actions Bar -->
<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center;">
<input type="text" id="invoiceSearch" placeholder="Search invoices..." value="${searchTerm}"
                oninput="loadAdminInvoicesPanel(this.value, document.getElementById('invoiceStatusFilter').value)"
                style="flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px;">
<select id="invoiceStatusFilter" onchange="loadAdminInvoicesPanel(document.getElementById('invoiceSearch').value, this.value)"
                style="padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px; background: #fff;">
<option value="" ${!statusFilter ? 'selected' : ''}>All Status</option>
<option value="draft" ${statusFilter === 'draft' ? 'selected' : ''}>Draft</option>
<option value="sent" ${statusFilter === 'sent' ? 'selected' : ''}>Sent</option>
<option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending</option>
<option value="paid" ${statusFilter === 'paid' ? 'selected' : ''}>Paid</option>
<option value="overdue" ${statusFilter === 'overdue' ? 'selected' : ''}>Overdue</option>
</select>
<button onclick="selectAllInvoices()" style="padding: 10px 16px; background: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; cursor: pointer;">Select All</button>
<button onclick="deleteSelectedInvoices()" style="padding: 10px 16px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; cursor: pointer;">Delete Selected</button>
<button onclick="exportInvoicesCSV()" style="padding: 10px 16px; background: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; cursor: pointer;">Export CSV</button>
<button class="btn-admin primary" onclick="showCreateInvoiceModal()">+ Create Invoice</button>
</div>

        <!-- Invoices Table -->
<div class="form-section">
<div class="form-section-title">📋 ${filtered.length} of ${invoices.length} Invoices</div>
<table class="data-table">
<thead>
<tr>
<th style="width: 40px;"><input type="checkbox" id="selectAllInvoicesHeader" onchange="toggleAllInvoiceCheckboxes(this.checked)"></th>
<th>Invoice #</th>
<th>Client</th>
<th>Project</th>
<th>Amount</th>
<th>Date</th>
<th>Due Date</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
                    ${filtered.length === 0 ? '<tr><td colspan="9" style="text-align: center; opacity: 0.5;">No invoices found</td></tr>' : ''}
                    ${filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(invoice => `
<tr>
<td><input type="checkbox" class="invoice-checkbox" data-id="${invoice.id}"></td>
<td style="font-weight: 600;">#${invoice.invoiceNumber || invoice.id}</td>
<td>${invoice.clientName || 'N/A'}</td>
<td>${invoice.projectName || 'N/A'}</td>
<td style="font-weight: 600;">$${(invoice.total || 0).toLocaleString()}</td>
<td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
<td>${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
<td><span class="status-badge ${invoice.status}">${invoice.status}</span></td>
<td>
<button class="btn-admin small" onclick="viewInvoice(${invoice.id})">View</button>
<button class="btn-admin small" onclick="downloadInvoice(${invoice.id})">PDF</button>
                                ${invoice.status !== 'paid' ? '<button class="btn-admin small primary" onclick="markInvoicePaid(' + invoice.id + ')">Mark Paid</button>' : ''}
<button class="btn-admin small danger" onclick="deleteInvoice(${invoice.id})" style="background: #fee2e2; color: #dc2626;">×</button>
</td>
</tr>
                    `).join('')}
</tbody>
</table>
</div>
    `;
}

// Toggle all invoice checkboxes
function toggleAllInvoiceCheckboxes(checked) {
    document.querySelectorAll('.invoice-checkbox').forEach(cb => cb.checked = checked);
}

// Select all invoices button
function selectAllInvoices() {
    const checkboxes = document.querySelectorAll('.invoice-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
    const headerCb = document.getElementById('selectAllInvoicesHeader');
    if (headerCb) headerCb.checked = !allChecked;
}

// Bulk delete invoices
function deleteSelectedInvoices() {
    const checkboxes = document.querySelectorAll('.invoice-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one invoice to delete.');
        return;
    }

    if (!confirm('Are you sure you want to delete ' + checkboxes.length + ' invoice(s)? This cannot be undone.')) return;

    const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    invoices = invoices.filter(i => !idsToDelete.includes(i.id));
    saveInvoices();

    const search = document.getElementById('invoiceSearch')?.value || '';
    const status = document.getElementById('invoiceStatusFilter')?.value || '';
    loadAdminInvoicesPanel(search, status);
    alert(idsToDelete.length + ' invoice(s) deleted successfully.');
}

// Export invoices to CSV
function exportInvoicesCSV() {
    if (invoices.length === 0) {
        alert('No invoices to export.');
        return;
    }

    const headers = ['Invoice #', 'Client', 'Project', 'Amount', 'Status', 'Created Date', 'Due Date', 'Paid Date'];
    const rows = invoices.map(i => [
        i.invoiceNumber || i.id,
        i.clientName || '',
        i.projectName || '',
        i.total || 0,
        i.status || '',
        i.createdAt || '',
        i.dueDate || '',
        i.paidAt || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    downloadCSV(csv, 'nui-invoices-' + new Date().toISOString().split('T')[0] + '.csv');
}

function showCreateInvoiceModal() {
    const allClients = window.clients || [];
    const allProjects = window.projects || [];
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'createInvoiceModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 800px; background: #1a1a1a; color: #fff;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title" style="color: #fff;">📄 Create Invoice</h3>
<button class="modal-close" onclick="document.getElementById('createInvoiceModal').remove()" style="color: #fff;">×</button>
</div>
<div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
<div class="form-row">
<div class="form-group">
<label class="form-label" style="color: #fff;">Invoice Number</label>
<input type="text" id="invoiceNumber" class="form-input" value="${invoiceNumber}" readonly style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Due Date</label>
<input type="date" id="invoiceDueDate" class="form-input" value="${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
</div>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label" style="color: #fff;">Client *</label>
<select id="invoiceClient" class="form-select" onchange="loadInvoiceClientProjects(this.value)" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="">-- Select Client --</option>
                            ${allClients.map(c => `<option value="${c.id}">${c.name}${c.company ? ' - ' + c.company : ''}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Project</label>
<select id="invoiceProject" class="form-select" onchange="populateInvoiceFromProject(this.value)" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="">-- Select Project --</option>
                            ${allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
</select>
</div>
</div>

                <!-- Quick Add Service/Package -->
<div class="form-section" style="margin-top: 24px; background: rgba(255,59,48,0.15); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,59,48,0.3);">
<div class="form-section-title" style="color: var(--red); font-weight: 600;">⚡ Quick Add Service/Package</div>
<div class="form-row">
<div class="form-group">
<label class="form-label" style="color: #fff;">Packages</label>
<select id="quickAddPackage" class="form-select" onchange="quickAddServiceToInvoice('package', this.value)" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="">-- Select Package --</option>
                                ${servicePackages.map(p => '<option value="' + p.id + '">' + p.name + ' - $' + p.price + ' (' + p.turnaround + ')</option>').join('')}
</select>
</div>
<div class="form-group">
<label class="form-label" style="color: #fff;">Individual Services</label>
<select id="quickAddService" class="form-select" onchange="quickAddServiceToInvoice('service', this.value)" style="background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2);">
<option value="">-- Select Service --</option>
                                ${individualServices.map(s => '<option value="' + s.id + '">' + s.name + ' - $' + s.price + '</option>').join('')}
</select>
</div>
</div>
<button onclick="showCreateProductModal()" class="btn-admin" style="margin-top: 12px; background: #10b981; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">➕ Create New Product/Service</button>
</div>

<div class="form-section" style="margin-top: 24px;">
<div class="form-section-title">Line Items</div>
<div id="invoiceLineItems">
<div class="invoice-line-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: end;">
<div class="form-group" style="margin: 0;">
<label class="form-label">Description</label>
<input type="text" class="form-input line-desc" placeholder="Service description">
</div>
<div class="form-group" style="margin: 0;">
<label class="form-label">Qty</label>
<input type="number" class="form-input line-qty" value="1" min="1" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<label class="form-label">Rate</label>
<input type="number" class="form-input line-rate" placeholder="0.00" step="0.01" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<label class="form-label">Amount</label>
<input type="text" class="form-input line-amount" readonly value="$0.00">
</div>
<button class="btn-admin small" onclick="removeInvoiceLine(this)" style="margin-bottom: 4px;">×</button>
</div>
</div>
<button class="btn-admin secondary" onclick="addInvoiceLine()" style="margin-top: 12px;">+ Add Line Item</button>
</div>

                <!-- Discount Section -->
<div class="form-section" style="margin-top: 24px; background: rgba(46,204,113,0.1); padding: 16px; border-radius: 8px;">
<div class="form-section-title" style="color: #2ecc71;">💰 Discount</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Discount Type</label>
<select id="discountType" class="form-select" onchange="calculateInvoiceTotal()">
<option value="none">No Discount</option>
<option value="percent">Percentage (%)</option>
<option value="fixed">Fixed Amount ($)</option>
<option value="loyalty">Loyalty Reward</option>
</select>
</div>
<div class="form-group">
<label class="form-label">Discount Value</label>
<input type="number" id="discountValue" class="form-input" value="0" min="0" step="0.01" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group">
<label class="form-label">Discount Code (Optional)</label>
<input type="text" id="discountCode" class="form-input" placeholder="SAVE10">
</div>
</div>
</div>

<div style="display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
<div style="text-align: right; min-width: 200px;">
<div style="font-size: 14px; opacity: 0.7; margin-bottom: 8px;">Subtotal: <span id="invoiceSubtotal">$0.00</span></div>
<div style="font-size: 14px; color: #2ecc71; margin-bottom: 8px;" id="discountLine" style="display: none;">Discount: -<span id="invoiceDiscount">$0.00</span></div>
<div style="font-size: 24px; font-weight: 600;">Total: <span id="invoiceTotal" style="color: var(--red);">$0.00</span></div>
</div>
</div>

<div class="form-group" style="margin-top: 24px;">
<label class="form-label">Notes</label>
<textarea id="invoiceNotes" class="form-textarea" rows="3" placeholder="Payment terms, additional notes...">Payment due within 30 days. Thank you for your business!</textarea>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('createInvoiceModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="saveInvoice()">Create Invoice</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function addInvoiceLine() {
    const container = document.getElementById('invoiceLineItems');
    const lineItem = document.createElement('div');
    lineItem.className = 'invoice-line-item';
    lineItem.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: end;';
    lineItem.innerHTML = `
<div class="form-group" style="margin: 0;">
<input type="text" class="form-input line-desc" placeholder="Service description">
</div>
<div class="form-group" style="margin: 0;">
<input type="number" class="form-input line-qty" value="1" min="1" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<input type="number" class="form-input line-rate" placeholder="0.00" step="0.01" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<input type="text" class="form-input line-amount" readonly value="$0.00">
</div>
<button class="btn-admin small" onclick="removeInvoiceLine(this)" style="margin-bottom: 4px;">×</button>
    `;
    container.appendChild(lineItem);
}

function removeInvoiceLine(btn) {
    const lines = document.querySelectorAll('.invoice-line-item');
    if (lines.length > 1) {
        btn.closest('.invoice-line-item').remove();
        calculateInvoiceTotal();
    }
}

function calculateInvoiceTotal() {
    let subtotal = 0;
    document.querySelectorAll('.invoice-line-item').forEach(line => {
        const qty = parseFloat(line.querySelector('.line-qty').value) || 0;
        const rate = parseFloat(line.querySelector('.line-rate').value) || 0;
        const amount = qty * rate;
        line.querySelector('.line-amount').value = '$' + amount.toFixed(2);
        subtotal += amount;
    });

    // Calculate discount
    const discountType = document.getElementById('discountType')?.value || 'none';
    const discountValue = parseFloat(document.getElementById('discountValue')?.value) || 0;
    let discount = 0;

    if (discountType === 'percent') {
        discount = subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
        discount = discountValue;
    } else if (discountType === 'loyalty') {
        // Apply loyalty points (each point = $1)
        discount = discountValue;
    }

    discount = Math.min(discount, subtotal); // Can't discount more than subtotal
    const total = subtotal - discount;

    document.getElementById('invoiceSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('invoiceTotal').textContent = '$' + total.toFixed(2);

    // Show/hide discount line
    const discountLine = document.getElementById('discountLine');
    const discountDisplay = document.getElementById('invoiceDiscount');
    if (discountLine && discountDisplay) {
        if (discount > 0) {
            discountLine.style.display = 'block';
            discountDisplay.textContent = '$' + discount.toFixed(2);
        } else {
            discountLine.style.display = 'none';
        }
    }

    return { subtotal, discount, total };
}

// Quick add service/package to invoice
function quickAddServiceToInvoice(type, id) {
    if (!id) return;

    let item;
    if (type === 'package') {
        item = servicePackages.find(p => p.id === id);
    } else {
        item = individualServices.find(s => s.id === id);
    }

    if (!item) return;

    // Add as new line item
    const container = document.getElementById('invoiceLineItems');
    const lineItem = document.createElement('div');
    lineItem.className = 'invoice-line-item';
    lineItem.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: end;';
    lineItem.innerHTML = `
<div class="form-group" style="margin: 0;">
<input type="text" class="form-input line-desc" value="${item.name}${item.turnaround ? ' (' + item.turnaround + ')' : ''}">
</div>
<div class="form-group" style="margin: 0;">
<input type="number" class="form-input line-qty" value="1" min="1" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<input type="number" class="form-input line-rate" value="${item.price}" step="0.01" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<input type="text" class="form-input line-amount" readonly value="$${item.price.toFixed(2)}">
</div>
<button class="btn-admin small" onclick="removeInvoiceLine(this)" style="margin-bottom: 4px;">×</button>
    `;
    container.appendChild(lineItem);
    calculateInvoiceTotal();

    // Reset dropdown
    document.getElementById(type === 'package' ? 'quickAddPackage' : 'quickAddService').value = '';
}

function loadInvoiceClientProjects(clientId) {
    const clientProjects = projects.filter(p => p.clientId == clientId);
    const select = document.getElementById('invoiceProject');
    select.innerHTML = `
<option value="">-- Select Project --</option>
        ${clientProjects.map(p => `<option value="${p.id}">${p.name} - $${p.totalAmount || 0}</option>`).join('')}
    `;
}

function populateInvoiceFromProject(projectId) {
    const project = projects.find(p => p.id == projectId);
    if (!project) return;

    // Find the package or service
    const pkg = servicePackages.find(p => p.id === project.packageId || p.name === project.package);

    // Clear existing lines and add project line
    document.getElementById('invoiceLineItems').innerHTML = `
<div class="invoice-line-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: end;">
<div class="form-group" style="margin: 0;">
<label class="form-label">Description</label>
<input type="text" class="form-input line-desc" value="${project.name} - ${pkg?.name || project.package || 'Custom Project'}">
</div>
<div class="form-group" style="margin: 0;">
<label class="form-label">Qty</label>
<input type="number" class="form-input line-qty" value="1" min="1" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<label class="form-label">Rate</label>
<input type="number" class="form-input line-rate" value="${project.totalAmount || pkg?.price || 0}" step="0.01" onchange="calculateInvoiceTotal()">
</div>
<div class="form-group" style="margin: 0;">
<label class="form-label">Amount</label>
<input type="text" class="form-input line-amount" readonly value="$${project.totalAmount || pkg?.price || 0}">
</div>
<button class="btn-admin small" onclick="removeInvoiceLine(this)" style="margin-bottom: 4px;">×</button>
</div>
    `;
    calculateInvoiceTotal();
}

function saveInvoice() {
    const clientSelect = document.getElementById('invoiceClient');
    const projectSelect = document.getElementById('invoiceProject');
    const client = (crmData.clients || []).find(c => c.id == clientSelect.value);
    const project = projects.find(p => p.id == projectSelect.value);

    const lineItems = [];
    document.querySelectorAll('.invoice-line-item').forEach(line => {
        lineItems.push({
            description: line.querySelector('.line-desc').value,
            qty: parseFloat(line.querySelector('.line-qty').value) || 0,
            rate: parseFloat(line.querySelector('.line-rate').value) || 0,
            amount: parseFloat(line.querySelector('.line-amount').value.replace('$', '')) || 0
        });
    });

    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const invoice = {
        id: Date.now(),
        invoiceNumber: document.getElementById('invoiceNumber').value,
        clientId: clientSelect.value,
        clientName: client?.name || 'Unknown',
        clientEmail: client?.email || '',
        projectId: projectSelect.value,
        projectName: project?.name || 'N/A',
        lineItems: lineItems,
        subtotal: total,
        total: total,
        dueDate: document.getElementById('invoiceDueDate').value,
        notes: document.getElementById('invoiceNotes').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    invoices.push(invoice);
    saveInvoices();

    document.getElementById('createInvoiceModal').remove();
    loadAdminInvoicesPanel();
    alert('Invoice created successfully!');
}

function viewInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'viewInvoiceModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 700px;">
<div class="modal-header" style="background: var(--red);">
<h3 class="modal-title" style="color: #fff;">Invoice ${invoice.invoiceNumber}</h3>
<button class="modal-close" onclick="document.getElementById('viewInvoiceModal').remove()" style="color: #fff;">×</button>
</div>
<div class="modal-body" style="background: #fff; color: #1a1a1a;">
<div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
<div>
<h2 style="color: var(--red); margin-bottom: 8px;">NEW URBAN INFLUENCE</h2>
<p style="font-size: 14px; opacity: 0.7;">Detroit, MI<br>newurbaninfluence@gmail.com</p>
</div>
<div style="text-align: right;">
<p style="font-size: 14px;"><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
<p style="font-size: 14px;"><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
<p style="font-size: 14px;"><strong>Due:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
</div>
</div>

<div style="margin-bottom: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
<p style="font-weight: 600; margin-bottom: 4px;">Bill To:</p>
<p>${invoice.clientName}</p>
<p style="font-size: 14px; opacity: 0.7;">${invoice.clientEmail || ''}</p>
</div>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
<thead>
<tr style="border-bottom: 2px solid #1a1a1a;">
<th style="text-align: left; padding: 12px 8px;">Description</th>
<th style="text-align: center; padding: 12px 8px;">Qty</th>
<th style="text-align: right; padding: 12px 8px;">Rate</th>
<th style="text-align: right; padding: 12px 8px;">Amount</th>
</tr>
</thead>
<tbody>
                        ${invoice.lineItems?.map(item => `
<tr style="border-bottom: 1px solid #eee;">
<td style="padding: 12px 8px;">${item.description}</td>
<td style="text-align: center; padding: 12px 8px;">${item.qty}</td>
<td style="text-align: right; padding: 12px 8px;">$${item.rate?.toFixed(2)}</td>
<td style="text-align: right; padding: 12px 8px;">$${item.amount?.toFixed(2)}</td>
</tr>
                        `).join('') || ''}
</tbody>
</table>

<div style="display: flex; justify-content: flex-end;">
<div style="width: 250px;">
<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
<span>Subtotal:</span>
<span>$${invoice.subtotal?.toFixed(2)}</span>
</div>
<div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 20px; font-weight: 600;">
<span>Total:</span>
<span style="color: var(--red);">$${invoice.total?.toFixed(2)}</span>
</div>
</div>
</div>

                ${invoice.notes ? `
<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
<p style="font-weight: 600; margin-bottom: 8px;">Notes:</p>
<p style="font-size: 14px; opacity: 0.7;">${invoice.notes}</p>
</div>
                ` : ''}

<div style="text-align: center; margin-top: 32px; padding: 16px; background: ${invoice.status === 'paid' ? '#d4edda' : '#fff3cd'}; border-radius: 8px;">
<span style="font-weight: 600; text-transform: uppercase; color: ${invoice.status === 'paid' ? '#155724' : '#856404'};">
                        ${invoice.status === 'paid' ? '✓ PAID' : '⏳ ' + invoice.status.toUpperCase()}
</span>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('viewInvoiceModal').remove()">Close</button>
<button class="btn-admin primary" onclick="downloadInvoice(${id})">📥 Download PDF</button>
                ${invoice.status !== 'paid' ? `<button class="btn-admin primary" onclick="sendInvoiceToClient(${id})">📧 Send to Client</button>` : ''}
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function markInvoicePaid(id) {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();
        saveInvoices();

        // Record the payment
        const payment = {
            id: Date.now(),
            clientId: invoice.clientId,
            clientName: invoice.clientName,
            projectId: invoice.projectId,
            projectName: invoice.projectName,
            amount: invoice.total,
            type: 'invoice',
            date: new Date().toISOString().split('T')[0],
            notes: `Payment for Invoice ${invoice.invoiceNumber}`,
            status: 'completed',
            invoiceId: invoice.id,
            createdAt: new Date().toISOString()
        };
        payments.push(payment);
        savePayments();

        // Trigger workflow: Update loyalty points and order status
        triggerInvoicePaid(id);

        loadAdminInvoicesPanel();
        alert('Invoice marked as paid and payment recorded!');
    }
}

function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice? This cannot be undone.')) return;
    invoices = invoices.filter(i => i.id !== id);
    saveInvoices();
    loadAdminInvoicesPanel();
}

function downloadInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    // Create a printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
<html>
<head>
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .company { color: #e63946; font-size: 24px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 24px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                th { border-bottom: 2px solid #333; }
                .total-row { font-size: 20px; font-weight: bold; }
                .notes { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
                @media print { body { padding: 20px; } }
</style>
    <!-- Geo Meta Tags -->
    <meta name="geo.region" content="US-MI">
    <meta name="geo.placename" content="Detroit, Michigan">
    <meta name="geo.position" content="42.3314;-83.0458">
    <meta name="ICBM" content="42.3314, -83.0458">
</head>
<body>
<div class="header">
<div>
<div class="company">NEW URBAN INFLUENCE</div>
<p>Detroit, MI<br>newurbaninfluence@gmail.com</p>
</div>
<div style="text-align: right;">
<p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
<p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
<p><strong>Due:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
</div>
</div>
<div style="background: #f5f5f5; padding: 16px; margin-bottom: 24px;">
<strong>Bill To:</strong><br>${invoice.clientName}<br>${invoice.clientEmail || ''}
</div>
<table>
<thead><tr><th>Description</th><th>Qty</th><th style="text-align: right;">Rate</th><th style="text-align: right;">Amount</th></tr></thead>
<tbody>
                    ${invoice.lineItems?.map(item => `<tr><td>${item.description}</td><td>${item.qty}</td><td style="text-align: right;">$${item.rate?.toFixed(2)}</td><td style="text-align: right;">$${item.amount?.toFixed(2)}</td></tr>`).join('') || ''}
</tbody>
</table>
<div style="text-align: right;">
<p>Subtotal: $${invoice.subtotal?.toFixed(2)}</p>
<p class="total-row">Total: $${invoice.total?.toFixed(2)}</p>
</div>
            ${invoice.notes ? `<div class="notes"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
<scr` + `ipt>window.print();</scr` + `ipt>
</body>
</html>
    `);
    printWindow.document.close();
}

async function sendInvoiceToClient(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    const client = clients.find(c => c.id == invoice.clientId);
    const clientEmail = client?.email || invoice.clientEmail;
    if (!clientEmail) { alert('No email found for this client.'); return; }

    invoice.status = 'sent';
    invoice.sentAt = new Date().toISOString();
    saveInvoices();

    // Build line items HTML
    const lineItemsHtml = (invoice.lineItems || []).map(item =>
        `<tr><td style="padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 14px;">${item.description || item.name}</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity || 1}</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">$${(item.amount || item.price || 0).toLocaleString()}</td></tr>`
    ).join('');

    // Send real email
    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: clientEmail,
                subject: `Invoice ${invoice.invoiceNumber || '#' + invoice.id} from New Urban Influence`,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
<div style="background: linear-gradient(135deg, #ff0000, #cc0000); padding: 32px; text-align: center;">
<h2 style="color: #fff; margin: 0; font-size: 24px;">INVOICE</h2>
<p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${invoice.invoiceNumber || '#' + invoice.id}</p>
</div>
<div style="padding: 32px;">
<p style="font-size: 16px; color: #333;">Hi ${invoice.clientName || client?.name || 'there'},</p>
<p style="font-size: 14px; color: #666; line-height: 1.6;">Please find your invoice from New Urban Influence below. ${invoice.dueDate ? 'Payment is due by <strong>' + new Date(invoice.dueDate).toLocaleDateString() + '</strong>.' : ''}</p>

                            ${invoice.projectName ? '<p style="font-size: 14px; color: #666;"><strong>Project:</strong> ' + invoice.projectName + '</p>' : ''}

<table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
<thead>
<tr style="background: #f8f8f8;">
<th style="padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #888;">Description</th>
<th style="padding: 10px 16px; text-align: center; font-size: 12px; text-transform: uppercase; color: #888;">Qty</th>
<th style="padding: 10px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #888;">Amount</th>
</tr>
</thead>
<tbody>
                                    ${lineItemsHtml || '<tr><td colspan="3" style="padding: 16px; text-align: center; color: #888;">Service package</td></tr>'}
</tbody>
</table>

<div style="text-align: right; padding: 16px; background: #f8f8f8; border-radius: 8px;">
<span style="font-size: 14px; color: #666;">Total Due: </span>
<span style="font-size: 28px; font-weight: 700; color: #ff0000;">$${(invoice.total || invoice.amount || 0).toLocaleString()}</span>
</div>

<div style="text-align: center; margin-top: 32px;">
<a href="${typeof window !== 'undefined' ? window.location.origin : 'https://newurbaninfluence.com'}" style="display: inline-block; padding: 14px 32px; background: #ff0000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">View Invoice & Pay</a>
</div>

<p style="font-size: 12px; color: #999; margin-top: 32px; text-align: center;">New Urban Influence · Detroit, MI · (248) 487-8747</p>
</div>
</div>
                `,
                text: `Invoice ${invoice.invoiceNumber || '#' + invoice.id} from New Urban Influence. Total: $${(invoice.total || invoice.amount || 0).toLocaleString()}. Log in to your client portal to view and pay.`
            })
        });
        alert(`Invoice ${invoice.invoiceNumber || '#' + invoice.id} sent to ${clientEmail}!`);
    } catch (err) {
        console.error('Email send failed:', err);
        alert(`Invoice marked as sent, but email delivery failed. You may need to resend.`);
    }

    // Log to CRM
    if (typeof logProofActivity === 'function') {
        logProofActivity('invoice_sent', invoice.clientName || 'Client', `Invoice ${invoice.invoiceNumber || '#' + invoice.id} sent — $${(invoice.total || 0).toLocaleString()}`);
    }

    if (document.getElementById('viewInvoiceModal')) {
        document.getElementById('viewInvoiceModal').remove();
    }
    loadAdminInvoicesPanel();
}

// ==================== PAYOUTS PANEL ====================
let payoutSettings = JSON.parse(localStorage.getItem('nui_payouts')) || {
    designerRate: 40, // percentage
    profitMargin: 60,
    payoutSchedule: 'biweekly', // weekly, biweekly, monthly
    minimumPayout: 100,
    stripeEnabled: false
};
function savePayoutSettings() { localStorage.setItem('nui_payouts', JSON.stringify(payoutSettings)); }

let designerPayouts = JSON.parse(localStorage.getItem('nui_designer_payouts')) || [];
function saveDesignerPayouts() { localStorage.setItem('nui_designer_payouts', JSON.stringify(designerPayouts)); }

function loadAdminPayoutsPanel() {
    const designers = JSON.parse(localStorage.getItem('nui_designers')) || [];
    const completedOrders = orders.filter(o => o.status === 'delivered' && o.assignedDesigner);

    // Calculate earnings
    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.estimate || 0), 0);
    const designerPayout = Math.round(totalRevenue * (payoutSettings.designerRate / 100));
    const profit = totalRevenue - designerPayout;

    // Calculate per-designer earnings
    const designerEarnings = {};
    completedOrders.forEach(o => {
        if (o.assignedDesigner) {
            if (!designerEarnings[o.assignedDesigner]) {
                designerEarnings[o.assignedDesigner] = { orders: 0, total: 0, paid: 0, pending: 0 };
            }
            const designerCut = Math.round((o.estimate || 0) * (payoutSettings.designerRate / 100));
            designerEarnings[o.assignedDesigner].orders++;
            designerEarnings[o.assignedDesigner].total += designerCut;
            if (o.designerPaid) {
                designerEarnings[o.assignedDesigner].paid += designerCut;
            } else {
                designerEarnings[o.assignedDesigner].pending += designerCut;
            }
        }
    });

    // Monthly recurring revenue from subscriptions
    const monthlyRecurring = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.price || 0), 0);
    const totalIncome = totalRevenue + monthlyRecurring;

    document.getElementById('adminPayoutsPanel').innerHTML = `
<div class="panel-header" style="display:flex;justify-content:space-between;align-items:center;">
<div>
<h2 class="panel-title">💰 Payouts & Profit</h2>
<p class="panel-subtitle">Revenue breakdown, designer payouts, and profit tracking</p>
</div>
<button onclick="openPayoutSettingsModal()" style="padding:10px 20px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;">⚙️ Settings</button>
</div>

        <!-- Profit Overview -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">
<div style="background:linear-gradient(135deg,#10b981,#059669);padding:24px;border-radius:14px;">
<div style="font-size:12px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Total Revenue</div>
<div style="font-size:32px;font-weight:700;color:#fff;">$${totalRevenue.toLocaleString()}</div>
<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;">From paid orders</div>
</div>
<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:24px;border-radius:14px;">
<div style="font-size:12px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Designer Payouts (${payoutSettings.designerRate}%)</div>
<div style="font-size:32px;font-weight:700;color:#fff;">$${designerPayout.toLocaleString()}</div>
<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;">Owed to designers</div>
</div>
<div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:24px;border-radius:14px;">
<div style="font-size:12px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Net Profit</div>
<div style="font-size:32px;font-weight:700;color:#fff;">$${profit.toLocaleString()}</div>
<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;">${Math.round((profit / (totalRevenue || 1)) * 100)}% margin</div>
</div>
<div style="background:linear-gradient(135deg,#e63946,#d62839);padding:24px;border-radius:14px;">
<div style="font-size:12px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Monthly Recurring</div>
<div style="font-size:32px;font-weight:700;color:#fff;">$${monthlyRecurring.toLocaleString()}</div>
<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;">${subscriptions.filter(s => s.status === 'active').length} active subs</div>
</div>
</div>

        <!-- Payout Tiers -->
<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:14px;margin-bottom:28px;">
<h3 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:16px;">📊 Payout Tiers</h3>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
<div style="padding:20px;background:${payoutSettings.designerRate === 35 ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)'};border-radius:12px;border:2px solid ${payoutSettings.designerRate === 35 ? '#e63946' : 'rgba(255,255,255,0.08)'};text-align:center;">
<div style="font-size:13px;font-weight:600;color:${payoutSettings.designerRate === 35 ? '#e63946' : 'rgba(255,255,255,0.7)'};margin-bottom:6px;">🥉 Starter</div>
<div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:4px;">35% / 65%</div>
<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:12px;">New designers (0-5 projects)</div>
<button onclick="setPayoutTier(35, 65)" style="padding:8px 16px;background:${payoutSettings.designerRate === 35 ? '#e63946' : 'rgba(255,255,255,0.1)'};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;width:100%;">${payoutSettings.designerRate === 35 ? '✓ Active' : 'Apply'}</button>
</div>
<div style="padding:20px;background:${payoutSettings.designerRate === 40 ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)'};border-radius:12px;border:2px solid ${payoutSettings.designerRate === 40 ? '#e63946' : 'rgba(255,255,255,0.08)'};text-align:center;">
<div style="font-size:13px;font-weight:600;color:${payoutSettings.designerRate === 40 ? '#e63946' : 'rgba(255,255,255,0.7)'};margin-bottom:6px;">🥈 Standard</div>
<div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:4px;">40% / 60%</div>
<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:12px;">Established (6-20 projects)</div>
<button onclick="setPayoutTier(40, 60)" style="padding:8px 16px;background:${payoutSettings.designerRate === 40 ? '#e63946' : 'rgba(255,255,255,0.1)'};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;width:100%;">${payoutSettings.designerRate === 40 ? '✓ Active' : 'Apply'}</button>
</div>
<div style="padding:20px;background:${payoutSettings.designerRate === 50 ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)'};border-radius:12px;border:2px solid ${payoutSettings.designerRate === 50 ? '#e63946' : 'rgba(255,255,255,0.08)'};text-align:center;">
<div style="font-size:13px;font-weight:600;color:${payoutSettings.designerRate === 50 ? '#e63946' : 'rgba(255,255,255,0.7)'};margin-bottom:6px;">🥇 Senior</div>
<div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:4px;">50% / 50%</div>
<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:12px;">Top performers (20+ projects)</div>
<button onclick="setPayoutTier(50, 50)" style="padding:8px 16px;background:${payoutSettings.designerRate === 50 ? '#e63946' : 'rgba(255,255,255,0.1)'};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;width:100%;">${payoutSettings.designerRate === 50 ? '✓ Active' : 'Apply'}</button>
</div>
</div>
</div>

        <!-- Designer Earnings Table -->
<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:14px;margin-bottom:28px;">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
<h3 style="font-size:15px;font-weight:600;color:#fff;">👥 Designer Earnings</h3>
<button onclick="processAllPayouts()" style="padding:10px 20px;background:#10b981;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">💸 Process All Payouts</button>
</div>
<table style="width:100%;border-collapse:collapse;">
<thead>
<tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
<th style="text-align:left;padding:12px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Designer</th>
<th style="text-align:center;padding:12px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Projects</th>
<th style="text-align:right;padding:12px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Total Earned</th>
<th style="text-align:right;padding:12px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Paid Out</th>
<th style="text-align:right;padding:12px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Pending</th>
<th style="text-align:center;padding:12px 8px;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Action</th>
</tr>
</thead>
<tbody>
                    ${Object.entries(designerEarnings).map(([name, data]) => `
<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
<td style="padding:14px 8px;">
<div style="display:flex;align-items:center;gap:12px;">
<div style="width:36px;height:36px;background:linear-gradient(135deg,#e63946,#d62839);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:14px;">${name.charAt(0)}</div>
<span style="font-weight:600;color:#fff;">${name}</span>
</div>
</td>
<td style="text-align:center;padding:14px 8px;color:rgba(255,255,255,0.7);">${data.orders}</td>
<td style="text-align:right;padding:14px 8px;font-weight:600;color:#fff;">$${data.total.toLocaleString()}</td>
<td style="text-align:right;padding:14px 8px;color:#10b981;font-weight:500;">$${data.paid.toLocaleString()}</td>
<td style="text-align:right;padding:14px 8px;color:${data.pending > 0 ? '#f59e0b' : 'rgba(255,255,255,0.4)'};font-weight:${data.pending > 0 ? '600' : '400'};">$${data.pending.toLocaleString()}</td>
<td style="text-align:center;padding:14px 8px;">
                                ${data.pending > 0 ? `<button onclick="processDesignerPayout('${name}', ${data.pending})" style="padding:8px 16px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Pay $${data.pending}</button>` : '<span style="color:rgba(255,255,255,0.3);font-size:12px;">All paid</span>'}
</td>
</tr>
                    `).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.35);">No designer assignments yet. Assign designers to orders to track earnings.</td></tr>'}
</tbody>
</table>
</div>

        <!-- Payout History -->
<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:14px;">
<h3 style="font-size:15px;font-weight:600;color:#fff;margin-bottom:16px;">📋 Payout History</h3>
<div style="display:flex;flex-direction:column;gap:10px;">
                ${designerPayouts.slice(-10).reverse().map(p => `
<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
<div style="display:flex;align-items:center;gap:12px;">
<div style="width:32px;height:32px;background:rgba(16,185,129,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">💸</div>
<div>
<div style="font-weight:600;color:#fff;font-size:14px;">${p.designer}</div>
<div style="font-size:12px;color:rgba(255,255,255,0.4);">${new Date(p.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</div>
</div>
</div>
<div style="text-align:right;">
<div style="font-weight:700;color:#10b981;font-size:16px;">$${p.amount.toLocaleString()}</div>
<div style="font-size:11px;color:rgba(255,255,255,0.35);">${p.method || 'Stripe'}</div>
</div>
</div>
                `).join('') || '<div style="text-align:center;color:rgba(255,255,255,0.35);padding:32px;">No payouts processed yet</div>'}
</div>
</div>
    `;
}

function setPayoutTier(designerRate, profitMargin) {
    payoutSettings.designerRate = designerRate;
    payoutSettings.profitMargin = profitMargin;
    savePayoutSettings();
    loadAdminPayoutsPanel();
}

function processDesignerPayout(designerName, amount) {
    if (!confirm('Process payout of $' + amount + ' to ' + designerName + '?')) return;

    // Mark orders as paid
    orders.forEach(o => {
        if (o.assignedDesigner === designerName && !o.designerPaid) {
            o.designerPaid = true;
            o.designerPaidAt = new Date().toISOString();
        }
    });
    saveOrders();

    // Record payout
    designerPayouts.push({
        id: Date.now(),
        designer: designerName,
        amount: amount,
        date: new Date().toISOString(),
        method: payoutSettings.stripeEnabled ? 'Stripe' : 'Manual'
    });
    saveDesignerPayouts();

    loadAdminPayoutsPanel();
    alert('Successfully processed $' + amount + ' payout to ' + designerName + '!');
}

function processAllPayouts() {
    const pendingPayouts = [];
    const designerEarnings = {};

    orders.filter(o => o.status === 'delivered' && o.assignedDesigner && !o.designerPaid).forEach(o => {
        if (!designerEarnings[o.assignedDesigner]) designerEarnings[o.assignedDesigner] = 0;
        designerEarnings[o.assignedDesigner] += Math.round((o.estimate || 0) * (payoutSettings.designerRate / 100));
    });

    const total = Object.values(designerEarnings).reduce((sum, v) => sum + v, 0);
    if (total === 0) {
        alert('No pending payouts to process!');
        return;
    }

    if (!confirm('Process all pending payouts totaling $' + total.toLocaleString() + '?')) return;

    Object.entries(designerEarnings).forEach(([name, amount]) => {
        if (amount > 0) {
            processDesignerPayout(name, amount);
        }
    });
}

function openPayoutSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'payoutSettingsModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
<div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:480px;width:90%;padding:32px;position:relative;">
<button onclick="document.getElementById('payoutSettingsModal').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:rgba(255,255,255,0.5);">&times;</button>
<h2 style="font-size:18px;font-weight:700;color:#fff;margin-bottom:24px;">⚙️ Payout Settings</h2>
<div style="display:flex;flex-direction:column;gap:16px;">
<div>
<label style="display:block;font-size:12px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Designer Rate (%)</label>
<input type="number" id="psDesignerRate" value="${payoutSettings.designerRate}" min="10" max="80" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
</div>
<div>
<label style="display:block;font-size:12px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Payout Schedule</label>
<select id="psSchedule" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
<option value="weekly" ${payoutSettings.payoutSchedule === 'weekly' ? 'selected' : ''} style="background:#1a1a1a;">Weekly</option>
<option value="biweekly" ${payoutSettings.payoutSchedule === 'biweekly' ? 'selected' : ''} style="background:#1a1a1a;">Bi-Weekly</option>
<option value="monthly" ${payoutSettings.payoutSchedule === 'monthly' ? 'selected' : ''} style="background:#1a1a1a;">Monthly</option>
</select>
</div>
<div>
<label style="display:block;font-size:12px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Minimum Payout ($)</label>
<input type="number" id="psMinPayout" value="${payoutSettings.minimumPayout}" min="0" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
</div>
</div>
<div style="display:flex;gap:12px;margin-top:24px;">
<button onclick="document.getElementById('payoutSettingsModal').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,0.08);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Cancel</button>
<button onclick="savePayoutSettingsFromModal()" style="flex:1;padding:12px;background:#e63946;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Save Settings</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function savePayoutSettingsFromModal() {
    const rate = parseInt(document.getElementById('psDesignerRate').value) || 40;
    payoutSettings.designerRate = Math.min(80, Math.max(10, rate));
    payoutSettings.profitMargin = 100 - payoutSettings.designerRate;
    payoutSettings.payoutSchedule = document.getElementById('psSchedule').value;
    payoutSettings.minimumPayout = parseInt(document.getElementById('psMinPayout').value) || 100;
    savePayoutSettings();
    document.getElementById('payoutSettingsModal').remove();
    loadAdminPayoutsPanel();
}

