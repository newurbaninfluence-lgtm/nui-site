// ═══════════════════════════════════════════════════════════════════
// NUI — Client History Import
// Bulk-add old clients with full order/invoice/project history
// Version: 20260323v1
// ═══════════════════════════════════════════════════════════════════

// ── State ──────────────────────────────────────────────────────────
var _importClientId   = null;   // resolved client id after step 1
var _importOrderRows  = [];     // [{id, el}]
var _importProjectRows = [];    // [{id, el}]
var _importRowCounter  = 0;

// ── Entry point ────────────────────────────────────────────────────
function showClientHistoryImport(preselectedClientId) {
    var existing = document.getElementById('clientHistoryImportModal');
    if (existing) existing.remove();

    _importClientId    = preselectedClientId || null;
    _importOrderRows   = [];
    _importProjectRows = [];
    _importRowCounter  = 0;

    var modal = document.createElement('div');
    modal.id  = 'clientHistoryImportModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);'
        + 'display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto;';

    modal.innerHTML = _buildImportShell(preselectedClientId);
    document.body.appendChild(modal);

    // If a client was preselected, skip to step 2 immediately
    if (preselectedClientId) {
        _importClientId = preselectedClientId;
        _showImportStep2();
    }
}

// ── Shell HTML ─────────────────────────────────────────────────────
function _buildImportShell(preselectedId) {
    var clientOptions = (typeof clients !== 'undefined' ? clients : [])
        .map(function(c) {
            return '<option value="' + c.id + '"' + (preselectedId == c.id ? ' selected' : '') + '>'
                + c.name + ' — ' + (c.email || 'no email') + '</option>';
        }).join('');

    return '<div id="himInner" style="background:#1a1a1a;border:1px solid #333;border-radius:20px;'
        + 'width:100%;max-width:860px;padding:0;overflow:hidden;">'

        // Header
        + '<div style="background:#111;padding:24px 28px;border-bottom:1px solid #2a2a2a;'
        + 'display:flex;justify-content:space-between;align-items:center;">'
        + '<div>'
        + '<h2 style="margin:0;font-size:22px;font-weight:700;">📥 Client History Import</h2>'
        + '<p style="margin:4px 0 0;color:#888;font-size:13px;">Add old clients with their full order, invoice &amp; project history in one shot</p>'
        + '</div>'
        + '<button onclick="document.getElementById(\'clientHistoryImportModal\').remove()" '
        + 'style="background:none;border:none;color:#666;font-size:24px;cursor:pointer;padding:4px 8px;">✕</button>'
        + '</div>'

        // Step 1 — Client
        + '<div id="himStep1" style="padding:28px;">'
        + '<div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#e11d48;'
        + 'font-weight:700;margin-bottom:16px;">Step 1 — Who is this client?</div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">'

        // Left: existing
        + '<div style="background:#242424;border:1px solid #333;border-radius:12px;padding:20px;">'
        + '<div style="font-weight:600;font-size:14px;margin-bottom:12px;">Existing client</div>'
        + '<select id="himExistingClient" class="form-input" style="width:100%;margin-bottom:12px;">'
        + '<option value="">— Select a client —</option>' + clientOptions
        + '</select>'
        + '<button onclick="_importSelectExisting()" style="width:100%;padding:12px;background:#e11d48;'
        + 'color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">'
        + 'Select &amp; Continue →</button>'
        + '</div>'

        // Right: new
        + '<div style="background:#242424;border:1px solid #333;border-radius:12px;padding:20px;">'
        + '<div style="font-weight:600;font-size:14px;margin-bottom:12px;">New client</div>'
        + '<input type="text" id="himNewName" class="form-input" placeholder="Business / Client Name *" '
        + 'style="width:100%;margin-bottom:8px;">'
        + '<input type="email" id="himNewEmail" class="form-input" placeholder="Email" '
        + 'style="width:100%;margin-bottom:8px;">'
        + '<input type="text" id="himNewContact" class="form-input" placeholder="Contact Person" '
        + 'style="width:100%;margin-bottom:12px;">'
        + '<button onclick="_importCreateNew()" style="width:100%;padding:12px;background:#242424;'
        + 'color:#fff;border:1px solid #555;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">'
        + 'Create &amp; Continue →</button>'
        + '</div>'
        + '</div>'
        + '</div>'  // end step 1

        // Step 2 — History (hidden until client chosen)
        + '<div id="himStep2" style="display:none;padding:0 28px 28px;">'
        + '<div id="himClientBadge" style="background:#242424;border:1px solid #333;border-radius:10px;'
        + 'padding:12px 16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">'
        + '<span id="himClientLabel" style="font-weight:600;"></span>'
        + '<button onclick="document.getElementById(\'himStep1\').style.display=\'block\';'
        + 'document.getElementById(\'himStep2\').style.display=\'none\';" '
        + 'style="background:none;border:none;color:#888;cursor:pointer;font-size:12px;">← change</button>'
        + '</div>'

        // ── Orders + Invoices section
        + '<div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#e11d48;'
        + 'font-weight:700;margin-bottom:14px;">Step 2 — Orders &amp; Invoices</div>'
        + '<div style="font-size:13px;color:#888;margin-bottom:16px;">'
        + 'Each order auto-generates a linked invoice. Add one row per service/job.</div>'
        + '<div id="himOrdersContainer"></div>'
        + '<button onclick="_importAddOrderRow()" style="width:100%;padding:12px;margin-bottom:28px;'
        + 'background:#242424;border:1px solid #444;border-radius:10px;cursor:pointer;'
        + 'color:#aaa;font-size:14px;font-family:inherit;">+ Add Order / Invoice</button>'

        // ── Projects section
        + '<div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#3b82f6;'
        + 'font-weight:700;margin-bottom:14px;">Step 3 — Projects &amp; Brand Guides</div>'
        + '<div style="font-size:13px;color:#888;margin-bottom:16px;">'
        + 'Add separate rows for brand guides, one-off projects, or anything not tied to an order.</div>'
        + '<div id="himProjectsContainer"></div>'
        + '<button onclick="_importAddProjectRow()" style="width:100%;padding:12px;margin-bottom:28px;'
        + 'background:#242424;border:1px solid #3b82f6;border-radius:10px;cursor:pointer;'
        + 'color:#aaa;font-size:14px;font-family:inherit;">+ Add Project / Brand Guide</button>'

        // ── Save
        + '<button onclick="_importSaveAll()" style="width:100%;padding:16px;background:#e11d48;'
        + 'color:#fff;border:none;border-radius:12px;cursor:pointer;font-weight:700;'
        + 'font-size:16px;font-family:inherit;">💾 Save All History</button>'
        + '</div>'  // end step 2

        + '</div>';  // end himInner
}

// ── Step navigation ─────────────────────────────────────────────────
function _importSelectExisting() {
    var sel = document.getElementById('himExistingClient');
    if (!sel || !sel.value) { alert('Please select a client.'); return; }
    _importClientId = parseInt(sel.value);
    var c = (typeof clients !== 'undefined') ? clients.find(function(x){ return x.id == _importClientId; }) : null;
    if (c) {
        document.getElementById('himClientLabel').textContent = '📋 Importing history for: ' + c.name;
    }
    _showImportStep2();
}

function _importCreateNew() {
    var name = (document.getElementById('himNewName').value || '').trim();
    if (!name) { alert('Client name is required.'); return; }
    var email   = document.getElementById('himNewEmail').value.trim();
    var contact = document.getElementById('himNewContact').value.trim();

    var newClient = {
        id:        Date.now(),
        name:      name,
        email:     email,
        contact:   contact,
        password:  'nui' + Math.floor(Math.random() * 9000 + 1000),
        colors:    ['#e11d48','#1a1a1a','#ffffff'],
        assets:    {},
        brandGuide: { status: 'approved', proofComments: [] },
        createdAt: new Date().toISOString(),
        isImported: true
    };

    if (typeof clients !== 'undefined') {
        clients.unshift(newClient);
        if (typeof saveClients === 'function') saveClients();
    }

    _importClientId = newClient.id;
    document.getElementById('himClientLabel').textContent = '📋 Importing history for: ' + name + ' (new)';
    _showImportStep2();
}

function _showImportStep2() {
    document.getElementById('himStep1').style.display = 'none';
    document.getElementById('himStep2').style.display  = 'block';
    // Add a first empty row for each section so the screen isn't blank
    if (_importOrderRows.length   === 0) _importAddOrderRow();
    if (_importProjectRows.length === 0) _importAddProjectRow();
}

// ── Order row ──────────────────────────────────────────────────────
function _importAddOrderRow() {
    var rowId = ++_importRowCounter;
    var container = document.getElementById('himOrdersContainer');
    if (!container) return;

    var div = document.createElement('div');
    div.id  = 'himOrder_' + rowId;
    div.style.cssText = 'background:#242424;border:1px solid #333;border-radius:12px;'
        + 'padding:18px;margin-bottom:12px;position:relative;';

    div.innerHTML = '<button onclick="_importRemoveRow(\'himOrder_' + rowId + '\',\'order\',' + rowId + ')" '
        + 'style="position:absolute;top:12px;right:14px;background:none;border:none;'
        + 'color:#555;cursor:pointer;font-size:18px;font-family:inherit;">✕</button>'

        + '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-bottom:10px;">'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Service / Order Name *</label>'
        + '<input id="himOrdName_' + rowId + '" type="text" class="form-input" '
        + 'placeholder="e.g. Brand Identity Package" style="width:100%;">'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Amount ($) *</label>'
        + '<input id="himOrdAmt_' + rowId + '" type="number" class="form-input" '
        + 'placeholder="2500" style="width:100%;">'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Date</label>'
        + '<input id="himOrdDate_' + rowId + '" type="date" class="form-input" '
        + 'value="' + new Date().toISOString().split('T')[0] + '" style="width:100%;">'
        + '</div>'
        + '</div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Order Status</label>'
        + '<select id="himOrdStatus_' + rowId + '" class="form-input" style="width:100%;">'
        + '<option value="delivered" selected>✅ Delivered / Complete</option>'
        + '<option value="in-progress">🔵 In Progress</option>'
        + '<option value="pending">⏳ Pending</option>'
        + '</select>'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Payment Status</label>'
        + '<select id="himOrdPaid_' + rowId + '" class="form-input" style="width:100%;">'
        + '<option value="paid" selected>💚 Paid in Full</option>'
        + '<option value="partial">🟡 Partially Paid</option>'
        + '<option value="unpaid">🔴 Unpaid / Outstanding</option>'
        + '</select>'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Notes</label>'
        + '<input id="himOrdNotes_' + rowId + '" type="text" class="form-input" '
        + 'placeholder="Optional" style="width:100%;">'
        + '</div>'
        + '</div>';

    container.appendChild(div);
    _importOrderRows.push({ id: rowId, el: div });
}

// ── Project row ────────────────────────────────────────────────────
function _importAddProjectRow() {
    var rowId = ++_importRowCounter;
    var container = document.getElementById('himProjectsContainer');
    if (!container) return;

    var div = document.createElement('div');
    div.id  = 'himProj_' + rowId;
    div.style.cssText = 'background:#0d1b2e;border:1px solid #1e3a5f;border-radius:12px;'
        + 'padding:18px;margin-bottom:12px;position:relative;';

    div.innerHTML = '<button onclick="_importRemoveRow(\'himProj_' + rowId + '\',\'project\',' + rowId + ')" '
        + 'style="position:absolute;top:12px;right:14px;background:none;border:none;'
        + 'color:#555;cursor:pointer;font-size:18px;font-family:inherit;">✕</button>'

        + '<div style="display:grid;grid-template-columns:2fr 1fr;gap:10px;margin-bottom:10px;">'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Project Name *</label>'
        + '<input id="himProjName_' + rowId + '" type="text" class="form-input" '
        + 'placeholder="e.g. Fat Boy Detroit — Brand Guide 2023" style="width:100%;">'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Type</label>'
        + '<select id="himProjType_' + rowId + '" class="form-input" style="width:100%;">'
        + '<option value="brand-guide">🎨 Brand Guide</option>'
        + '<option value="website">🌐 Website</option>'
        + '<option value="logo">✏ Logo Only</option>'
        + '<option value="social">📱 Social / Content</option>'
        + '<option value="print">🖨 Print / Signage</option>'
        + '<option value="video">🎬 Video / Motion</option>'
        + '<option value="one-off">⚡ One-Off / Custom</option>'
        + '</select>'
        + '</div>'
        + '</div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Stage</label>'
        + '<select id="himProjStage_' + rowId + '" class="form-input" style="width:100%;">'
        + '<option value="Delivery" selected>✅ Completed / Delivered</option>'
        + '<option value="Design">🎨 In Design</option>'
        + '<option value="Review">👀 In Review</option>'
        + '<option value="Discovery">🔍 Discovery</option>'
        + '</select>'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Date Completed</label>'
        + '<input id="himProjDate_' + rowId + '" type="date" class="form-input" '
        + 'value="' + new Date().toISOString().split('T')[0] + '" style="width:100%;">'
        + '</div>'
        + '<div>'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Proof Status</label>'
        + '<select id="himProjProof_' + rowId + '" class="form-input" style="width:100%;">'
        + '<option value="approved" selected>✅ Client Approved</option>'
        + '<option value="pending">⏳ Pending Review</option>'
        + '<option value="none">— No Proof</option>'
        + '</select>'
        + '</div>'
        + '</div>'

        + '<div style="margin-top:10px;">'
        + '<label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Project Notes</label>'
        + '<input id="himProjNotes_' + rowId + '" type="text" class="form-input" '
        + 'placeholder="e.g. Complete rebrand — 3 logo concepts, full brand guide PDF delivered" style="width:100%;">'
        + '</div>';

    container.appendChild(div);
    _importProjectRows.push({ id: rowId, el: div });
}

// ── Remove row ─────────────────────────────────────────────────────
function _importRemoveRow(elId, type, rowId) {
    var el = document.getElementById(elId);
    if (el) el.remove();
    if (type === 'order') {
        _importOrderRows = _importOrderRows.filter(function(r){ return r.id !== rowId; });
    } else {
        _importProjectRows = _importProjectRows.filter(function(r){ return r.id !== rowId; });
    }
}

// ── Save all ───────────────────────────────────────────────────────
function _importSaveAll() {
    if (!_importClientId) { alert('No client selected.'); return; }

    var client = (typeof clients !== 'undefined')
        ? clients.find(function(c){ return c.id == _importClientId; })
        : null;

    if (!client) { alert('Client not found in system.'); return; }

    var savedOrders   = 0;
    var savedInvoices = 0;
    var savedProjects = 0;

    // ── Process orders
    _importOrderRows.forEach(function(row) {
        var name   = (document.getElementById('himOrdName_'   + row.id)?.value || '').trim();
        var amt    =  parseFloat(document.getElementById('himOrdAmt_'    + row.id)?.value) || 0;
        var date   =  document.getElementById('himOrdDate_'   + row.id)?.value || new Date().toISOString().split('T')[0];
        var status =  document.getElementById('himOrdStatus_' + row.id)?.value || 'delivered';
        var paid   =  document.getElementById('himOrdPaid_'   + row.id)?.value || 'paid';
        var notes  = (document.getElementById('himOrdNotes_'  + row.id)?.value || '').trim();

        if (!name) return; // skip empty rows

        var orderId = Date.now() + Math.floor(Math.random() * 10000);
        var invNum  = 'INV-' + new Date(date).getFullYear()
            + '-' + String(Math.floor(Math.random() * 9000) + 1000);

        var order = {
            id:            orderId,
            clientId:      _importClientId,
            clientName:    client.name,
            packageName:   name,
            projectName:   name,
            total:         amt,
            status:        status,
            paymentStatus: paid,
            notes:         notes,
            createdAt:     date + 'T00:00:00.000Z',
            updatedAt:     date + 'T00:00:00.000Z',
            isImported:    true
        };

        var invoice = {
            id:            orderId + 1,
            orderId:       orderId,
            clientId:      _importClientId,
            clientName:    client.name,
            invoiceNumber: invNum,
            amount:        amt,
            status:        paid === 'paid' ? 'paid' : (paid === 'partial' ? 'partial' : 'unpaid'),
            paidAt:        paid === 'paid' ? date + 'T00:00:00.000Z' : null,
            items: [{ description: name, quantity: 1, rate: amt, total: amt }],
            createdAt:     date + 'T00:00:00.000Z',
            isImported:    true
        };

        if (typeof orders   !== 'undefined') { orders.unshift(order);     savedOrders++; }
        if (typeof invoices !== 'undefined') { invoices.unshift(invoice); savedInvoices++; }
    });

    // ── Process projects
    _importProjectRows.forEach(function(row) {
        var name      = (document.getElementById('himProjName_'  + row.id)?.value || '').trim();
        var type      =  document.getElementById('himProjType_'  + row.id)?.value || 'brand-guide';
        var stage     =  document.getElementById('himProjStage_' + row.id)?.value || 'Delivery';
        var date      =  document.getElementById('himProjDate_'  + row.id)?.value || new Date().toISOString().split('T')[0];
        var proofSt   =  document.getElementById('himProjProof_' + row.id)?.value || 'approved';
        var notes     = (document.getElementById('himProjNotes_' + row.id)?.value || '').trim();

        if (!name) return;

        var projId = Date.now() + Math.floor(Math.random() * 10000) + 100;

        var project = {
            id:          projId,
            clientId:    _importClientId,
            client_id:   _importClientId,
            clientName:  client.name,
            name:        name,
            type:        type,
            package:     type,
            stage:       stage,
            status:      stage === 'Delivery' ? 'completed' : 'active',
            notes:       notes,
            createdAt:   date + 'T00:00:00.000Z',
            completedAt: stage === 'Delivery' ? date + 'T00:00:00.000Z' : null,
            isImported:  true,
            activityLog: [{
                action:    'Project imported from history',
                timestamp: new Date().toISOString()
            }]
        };

        if (typeof projects !== 'undefined') { projects.unshift(project); savedProjects++; }

        // Auto-create an approved proof record if applicable
        if (proofSt !== 'none' && typeof proofs !== 'undefined') {
            proofs.unshift({
                id:            projId + 1,
                name:          name,
                clientId:      _importClientId,
                clientName:    client.name,
                project_id:    projId,
                projectId:     projId,
                type:          type === 'brand-guide' ? 'brandguide' : 'proof',
                category:      'Brand Identity',
                status:        proofSt,
                sentToClient:  true,
                notifyClient:  true,
                notes:         notes,
                comments:      [],
                createdAt:     date + 'T00:00:00.000Z',
                approvedAt:    proofSt === 'approved' ? date + 'T00:00:00.000Z' : null,
                isImported:    true
            });
        }
    });

    // ── Persist everything
    if (typeof saveOrders   === 'function') saveOrders();
    if (typeof saveInvoices === 'function') saveInvoices();
    if (typeof saveProjects === 'function') saveProjects();
    if (typeof saveProofs   === 'function') saveProofs();
    if (typeof saveClients  === 'function') saveClients();

    // ── Close & refresh
    document.getElementById('clientHistoryImportModal').remove();

    var msg = '✅ History imported for ' + client.name + '!\n\n'
        + '📦 ' + savedOrders   + ' order(s) added\n'
        + '📄 ' + savedOrders   + ' invoice(s) generated\n'
        + '📁 ' + savedProjects + ' project(s) added\n\n'
        + 'All records are now live in the system.';
    alert(msg);

    // Refresh whichever admin panel is currently visible
    if (typeof loadAdminClientsPanel === 'function') loadAdminClientsPanel();
    else if (typeof showAdminPanel   === 'function') showAdminPanel('clients');
}

// ── Hook into CRM client row context menu ──────────────────────────
// Call this from any existing "..." or action button on a client row
function importHistoryForClient(clientId) {
    showClientHistoryImport(clientId);
}
