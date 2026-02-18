// ==================== ADMIN SUBMISSIONS PANEL ====================
function loadAdminSubmissionsPanel(searchTerm = '') {
    const filtered = searchTerm
        ? formSubmissions.filter(s =>
            (s.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : formSubmissions;

    document.getElementById('adminSubmissionsPanel').innerHTML = `
<div class="flex-between mb-24">
<h2 class="fs-28 fw-700">Form Submissions</h2>
<span class="text-muted">${filtered.length} of ${formSubmissions.length} submissions</span>
</div>
<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center;">
<input type="text" id="submissionSearch" placeholder="Search submissions..." value="${searchTerm}"
                oninput="loadAdminSubmissionsPanel(this.value)"
                style="flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px;">
<button onclick="selectAllSubmissions()" style="padding: 10px 16px; background: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; cursor: pointer;">Select All</button>
<button onclick="deleteSelectedSubmissions()" style="padding: 10px 16px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; cursor: pointer;">Delete Selected</button>
<button onclick="exportSubmissionsCSV()" style="padding: 10px 16px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer;">Export CSV</button>
</div>
        ${filtered.length > 0 ? `
<div style="display: flex; flex-direction: column; gap: 16px;">
            ${filtered.slice().reverse().map(sub => `
<div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px;">
<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
<div class="flex-center-gap-12">
<input type="checkbox" class="submission-checkbox" data-id="${sub.id}" style="width: 18px; height: 18px; cursor: pointer;">
<strong style="font-size: 18px;">${sub.businessName || sub.contactName || 'Unknown'}</strong>
<span style="background: ${sub.status === 'pending_payment' ? '#fef3c7' : '#d1fae5'}; color: ${sub.status === 'pending_payment' ? '#92400e' : '#065f46'}; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${sub.status}</span>
</div>
<span class="text-muted-sm">${new Date(sub.submittedAt).toLocaleDateString()}</span>
</div>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; color: #666; font-size: 14px; margin-left: 30px;">
<div><strong>Service:</strong> ${sub.serviceName}</div>
<div><strong>Price:</strong> ${sub.price > 0 ? '$' + sub.price : 'Custom'}</div>
<div><strong>Ref:</strong> NUI-${sub.id}</div>
</div>
<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e5e5; display: flex; gap: 8px; flex-wrap: wrap; margin-left: 30px;">
<button onclick="viewSubmissionDetails(${sub.id})" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer;">View Details</button>
<button onclick="convertSubmissionToOrder(${sub.id})" style="padding: 8px 16px; background: var(--green); color: #fff; border: none; border-radius: 6px; cursor: pointer;">Convert to Order</button>
<button onclick="deleteSubmission(${sub.id})" style="padding: 8px 16px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
</div>
</div>
            `).join('')}
</div>
        ` : '<p style="color: #888; text-align: center; padding: 40px;">No submissions found.</p>'}
    `;
}

// Bulk selection for submissions
function selectAllSubmissions() {
    const checkboxes = document.querySelectorAll('.submission-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
}

// Bulk delete submissions
function deleteSelectedSubmissions() {
    const checkboxes = document.querySelectorAll('.submission-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one submission to delete.');
        return;
    }

    if (!confirm('Are you sure you want to delete ' + checkboxes.length + ' submission(s)? This cannot be undone.')) return;

    const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    formSubmissions = formSubmissions.filter(s => !idsToDelete.includes(s.id));
    saveSubmissions();
    loadAdminSubmissionsPanel(document.getElementById('submissionSearch')?.value || '');
    alert(idsToDelete.length + ' submission(s) deleted successfully.');
}

// Export submissions to CSV
function exportSubmissionsCSV() {
    if (formSubmissions.length === 0) {
        alert('No submissions to export.');
        return;
    }

    const headers = ['ID', 'Business Name', 'Contact Name', 'Email', 'Phone', 'Service', 'Price', 'Status', 'Date'];
    const rows = formSubmissions.map(s => [
        s.id,
        s.businessName || '',
        s.contactName || '',
        s.email || '',
        s.phone || '',
        s.serviceName || '',
        s.price || 0,
        s.status || '',
        s.submittedAt || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    downloadCSV(csv, 'nui-submissions-' + new Date().toISOString().split('T')[0] + '.csv');
}

// Helper to download CSV
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function viewSubmissionDetails(subId) {
    const sub = formSubmissions.find(s => s.id === subId);
    if (!sub) return;

    let details = Object.entries(sub).map(([key, value]) =>
        `<div style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>${key}:</strong> ${JSON.stringify(value)}</div>`
    ).join('');

    alert('Submission Details:\n\n' + JSON.stringify(sub, null, 2));
}

function convertSubmissionToOrder(subId) {
    const sub = formSubmissions.find(s => s.id === subId);
    if (!sub) return;

    // Create or find client
    let client = clients.find(c => c.name === sub.businessName);
    if (!client) {
        client = {
            id: Date.now(),
            name: sub.businessName || 'New Client',
            email: sub.email || '',
            password: 'client' + Math.random().toString(36).substring(7),
            industry: sub.industry || '',
            colors: ['#ff0000', '#000000', '#ffffff'],
            fonts: { heading: 'Inter', body: 'Inter' },
            assets: { logos: [], mockups: [], social: [], video: [], banner: [], fonts: [], patterns: [], package: [] }
        };
        clients.push(client);
        saveClients();
    }

    // Create order
    const order = {
        id: Date.now(),
        clientId: client.id,
        project: sub.serviceName,
        status: 'pending',
        estimate: sub.price,
        dueDate: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
        deliverables: []
    };
    orders.push(order);
    saveOrders();

    // Update submission status
    sub.status = 'converted';
    saveSubmissions();

    alert('Order created for ' + client.name + '!\nPassword: ' + client.password);
    loadAdminSubmissionsPanel();
}

function deleteSubmission(subId) {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    formSubmissions = formSubmissions.filter(s => s.id !== subId);
    saveSubmissions();
    loadAdminSubmissionsPanel();
}

// Add intake view to HTML structure
if (!document.getElementById('intakeView')) {
    const intakeDiv = document.createElement('div');
    intakeDiv.className = 'view';
    intakeDiv.id = 'intakeView';
    document.body.insertBefore(intakeDiv, document.querySelector('script'));
}

// Update services page to link to intake
function updateServicesWithIntake() {
    const servicesView = document.getElementById('servicesView');
    if (servicesView && servicesView.innerHTML) {
        // Services are already loaded, we can enhance them
    }
}


// ==================== CRM PANEL (GoHighLevel Style) ====================
let crmActiveTab = 'pipeline';
let crmSmartGroups = JSON.parse(localStorage.getItem('nui_smart_groups')) || [
    { id: 1, name: 'All Contacts', filter: { type: 'all' }, color: '#3b82f6' },
    { id: 2, name: 'New Leads (7 days)', filter: { type: 'date', days: 7, status: 'new' }, color: '#10b981' },
    { id: 3, name: 'High Value ($5k+)', filter: { type: 'value', min: 5000 }, color: '#f59e0b' },
    { id: 4, name: 'Needs Follow-up', filter: { type: 'stage', stages: [1, 2] }, color: '#ef4444' },
    { id: 5, name: 'Won Deals', filter: { type: 'stage', stages: [5] }, color: '#8b5cf6' }
];
