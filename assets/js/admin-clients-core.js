// ==================== ADMIN CLIENTS ====================
// Clients, Orders, Leads, New Order/Client, Assets, CRM, Projects, Proofs, Delivery, Portal, Payments, Invoices, Payouts

function loadAdminClientsPanel(searchTerm = '') {
    const filtered = searchTerm
        ? clients.filter(c =>
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : clients;

    document.getElementById('adminClientsPanel').innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
<h2 style="font-size: 28px; font-weight: 700;">All Clients</h2>
<span style="color: #888;">${filtered.length} of ${clients.length} clients</span>
</div>
<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center;">
<input type="text" id="clientSearch" placeholder="Search clients by name, email, or industry..." value="${searchTerm}"
                oninput="loadAdminClientsPanel(this.value)"
                style="flex: 1; min-width: 250px; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px;">
<button onclick="showCsvImportModal()" style="padding: 10px 16px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">📥 Import CSV</button>
<button onclick="exportClientsCSV()" style="padding: 10px 16px; background: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; cursor: pointer;">📤 Export CSV</button>
<button onclick="showAdminPanel('newclient')" class="btn-cta">+ New Client</button>
</div>
<input type="file" id="csvFileInput" accept=".csv" style="display: none;" onchange="handleCsvUpload(event)">
        ${filtered.length > 0 ? `
<div class="card-grid">${filtered.map(c => renderClientCard(c)).join('')}</div>
        ` : '<p style="color: #888; text-align: center; padding: 40px;">No clients found.</p>'}
    `;
}

// Export clients to CSV
function exportClientsCSV() {
    if (clients.length === 0) {
        alert('No clients to export.');
        return;
    }

    const headers = ['ID', 'Name', 'Email', 'Industry', 'Website', 'Created Via', 'Email Verified', 'Created At'];
    const rows = clients.map(c => [
        c.id,
        c.name || '',
        c.email || '',
        c.industry || '',
        c.website || '',
        c.createdVia || 'manual',
        c.emailVerified ? 'Yes' : 'No',
        c.createdAt || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    downloadCSV(csv, 'nui-clients-' + new Date().toISOString().split('T')[0] + '.csv');
}

// CSV Import Modal
function showCsvImportModal() {
    const modal = document.createElement('div');
    modal.id = 'csvImportModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
<div style="background: #1a1a1a; border-radius: 16px; padding: 32px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
<h2 style="font-size: 24px; font-weight: 700;">📥 Import Clients from CSV</h2>
<button onclick="closeCsvImportModal()" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
</div>

<div style="background: #252525; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
<h3 style="font-size: 16px; margin-bottom: 12px; color: #10b981;">📋 Required CSV Format</h3>
<p style="color: #aaa; font-size: 14px; margin-bottom: 12px;">Your CSV should include the following columns (first row must be headers):</p>
<div style="background: #1a1a1a; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #10b981; overflow-x: auto;">
                        name,email,phone,industry,website,address,notes
</div>
<p style="color: #888; font-size: 12px; margin-top: 12px;">
<strong>Required:</strong> name, email<br>
<strong>Optional:</strong> phone, industry, website, address, notes
</p>
</div>

<div style="background: #252525; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
<h3 style="font-size: 16px; margin-bottom: 12px;">📄 Example CSV</h3>
<pre style="background: #1a1a1a; padding: 12px; border-radius: 8px; font-size: 11px; color: #aaa; overflow-x: auto; white-space: pre-wrap;">name,email,phone,industry,website,address,notes
John's Bakery,john@bakery.com,555-0101,Food & Beverage,www.johnsbakery.com,"123 Main St, Detroit MI",Referred by Sarah
Tech Startup Inc,hello@techstartup.io,555-0102,Technology,techstartup.io,"456 Innovation Blvd",Needs full rebrand
Fitness Plus,contact@fitnessplus.com,555-0103,Health & Fitness,,,"Met at networking event"</pre>
</div>

<div id="csvDropZone" style="border: 2px dashed #444; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s;"
                    onclick="document.getElementById('csvFileInput').click()"
                    ondragover="event.preventDefault(); this.style.borderColor='#10b981'; this.style.background='rgba(16,185,129,0.1)';"
                    ondragleave="this.style.borderColor='#444'; this.style.background='transparent';"
                    ondrop="handleCsvDrop(event)">
<div style="font-size: 48px; margin-bottom: 12px;">📁</div>
<p style="color: #fff; font-size: 16px; margin-bottom: 8px;">Drop your CSV file here</p>
<p style="color: #888; font-size: 14px;">or click to browse</p>
</div>

<div id="csvPreviewArea" style="display: none; margin-top: 20px;"></div>

<div style="display: flex; gap: 12px; margin-top: 24px;">
<button onclick="downloadSampleCSV()" style="flex: 1; padding: 12px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer;">
                        ⬇️ Download Sample CSV
</button>
<button onclick="closeCsvImportModal()" style="flex: 1; padding: 12px; background: #444; border: none; color: #fff; border-radius: 8px; cursor: pointer;">
                        Cancel
</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function closeCsvImportModal() {
    const modal = document.getElementById('csvImportModal');
    if (modal) modal.remove();
}

function downloadSampleCSV() {
    const sample = `name,email,phone,industry,website,address,notes
John's Bakery,john@bakery.com,555-0101,Food & Beverage,www.johnsbakery.com,"123 Main St, Detroit MI",Referred by Sarah
Tech Startup Inc,hello@techstartup.io,555-0102,Technology,techstartup.io,"456 Innovation Blvd",Needs full rebrand
Fitness Plus,contact@fitnessplus.com,555-0103,Health & Fitness,,,"Met at networking event"
Creative Agency,info@creativeagency.co,555-0104,Marketing & Advertising,creativeagency.co,"789 Design Ave",Hot lead
Local Restaurant,eat@localrestaurant.com,555-0105,Food & Beverage,localrestaurant.com,"321 Food St",Ready to start`;
    downloadCSV(sample, 'nui-clients-sample.csv');
}

function handleCsvDrop(event) {
    event.preventDefault();
    event.target.style.borderColor = '#444';
    event.target.style.background = 'transparent';

    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        processCsvFile(file);
    } else {
        alert('Please upload a .csv file');
    }
}

function handleCsvUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processCsvFile(file);
    }
}

function processCsvFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvText = e.target.result;
        const parsedData = parseCSV(csvText);

        if (parsedData.length === 0) {
            alert('No valid data found in CSV file.');
            return;
        }

        showCsvPreview(parsedData);
    };
    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    // Check for required columns
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');

    if (nameIdx === -1 || emailIdx === -1) {
        alert('CSV must contain "name" and "email" columns.');
        return [];
    }

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 2 && values[nameIdx] && values[emailIdx]) {
            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });
            data.push(row);
        }
    }

    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

function showCsvPreview(data) {
    const previewArea = document.getElementById('csvPreviewArea');
    const existingEmails = clients.map(c => c.email.toLowerCase());

    // Check for duplicates
    const newClients = [];
    const duplicates = [];

    data.forEach(row => {
        if (existingEmails.includes(row.email.toLowerCase())) {
            duplicates.push(row);
        } else {
            newClients.push(row);
        }
    });

    previewArea.style.display = 'block';
    previewArea.innerHTML = `
<div style="background: #252525; border-radius: 12px; padding: 20px;">
<h3 style="font-size: 16px; margin-bottom: 16px;">📊 Import Preview</h3>

<div style="display: flex; gap: 16px; margin-bottom: 16px;">
<div style="flex: 1; background: #10b981; color: #fff; padding: 16px; border-radius: 8px; text-align: center;">
<div style="font-size: 28px; font-weight: bold;">${newClients.length}</div>
<div style="font-size: 12px;">New Clients</div>
</div>
<div style="flex: 1; background: ${duplicates.length > 0 ? '#f59e0b' : '#333'}; color: #fff; padding: 16px; border-radius: 8px; text-align: center;">
<div style="font-size: 28px; font-weight: bold;">${duplicates.length}</div>
<div style="font-size: 12px;">Duplicates (skip)</div>
</div>
</div>

            ${newClients.length > 0 ? `
<div style="max-height: 200px; overflow-y: auto; margin-bottom: 16px;">
<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
<thead>
<tr style="background: #333;">
<th style="padding: 8px; text-align: left; border-bottom: 1px solid #444;">Name</th>
<th style="padding: 8px; text-align: left; border-bottom: 1px solid #444;">Email</th>
<th style="padding: 8px; text-align: left; border-bottom: 1px solid #444;">Industry</th>
</tr>
</thead>
<tbody>
                        ${newClients.slice(0, 10).map(c => `
<tr>
<td style="padding: 8px; border-bottom: 1px solid #333;">${c.name}</td>
<td style="padding: 8px; border-bottom: 1px solid #333;">${c.email}</td>
<td style="padding: 8px; border-bottom: 1px solid #333;">${c.industry || '-'}</td>
</tr>
                        `).join('')}
                        ${newClients.length > 10 ? `<tr><td colspan="3" style="padding: 8px; color: #888; text-align: center;">...and ${newClients.length - 10} more</td></tr>` : ''}
</tbody>
</table>
</div>

<button onclick="importCsvClients()" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                ✅ Import ${newClients.length} Client${newClients.length !== 1 ? 's' : ''}
</button>
            ` : `
<p style="color: #f59e0b; text-align: center; padding: 20px;">All clients in this CSV already exist in your database.</p>
            `}
</div>
    `;

    // Store for import
    window.pendingCsvImport = newClients;
}

function importCsvClients() {
    const newClients = window.pendingCsvImport || [];

    if (newClients.length === 0) {
        alert('No clients to import.');
        return;
    }

    const maxId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;

    newClients.forEach((row, idx) => {
        const newClient = {
            id: maxId + idx + 1,
            name: row.name,
            email: row.email,
            phone: row.phone || '',
            industry: row.industry || '',
            website: row.website || '',
            address: row.address || '',
            notes: row.notes || '',
            password: 'client123',
            createdAt: new Date().toISOString(),
            createdVia: 'csv_import',
            emailVerified: false,
            brandAssets: { logo: '', colors: ['#e11d48', '#1a1a1a', '#ffffff'], fonts: [] }
        };
        clients.push(newClient);

        // Also add to CRM contacts
        const crmContacts = JSON.parse(localStorage.getItem('nui_crm_contacts')) || [];
        crmContacts.push({
            id: Date.now() + idx,
            name: row.name,
            email: row.email,
            phone: row.phone || '',
            company: row.name,
            stage: 1,
            value: 0,
            source: 'CSV Import',
            createdAt: new Date().toISOString(),
            lastContact: null,
            activities: [{ type: 'note', date: new Date().toISOString(), content: 'Imported from CSV' }]
        });
        localStorage.setItem('nui_crm_contacts', JSON.stringify(crmContacts));
    });

    localStorage.setItem('nui_clients', JSON.stringify(clients));

    closeCsvImportModal();
    loadAdminClientsPanel();

    alert(`✅ Successfully imported ${newClients.length} client${newClients.length !== 1 ? 's' : ''}!`);
}

