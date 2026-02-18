// ==================== INVOICE ====================
function showInvoice(orderId) {
    const order = orders.find(o => o.id === orderId);
    const client = clients.find(c => c.id === order.clientId);
    document.getElementById('invoiceContent').innerHTML = `
<div class="invoice-preview" id="invoicePrint">
<div class="invoice-header">
<div><div class="invoice-logo">NEW URBAN INFLUENCE</div><p style="font-size: 12px; color: #666; margin-top: 8px;">Detroit's Premier Digital Agency<br>newurbaninfluence@gmail.com</p></div>
<div><div class="invoice-title">INVOICE</div><div class="invoice-meta">#${order.id}<br>${new Date(order.createdAt).toLocaleDateString()}</div></div>
</div>
<div class="invoice-parties">
<div class="invoice-party"><h4>Bill To</h4><p><strong>${client ? client.name : 'Client'}</strong><br>${client ? client.email : ''}<br>${client ? client.industry : ''}</p></div>
<div class="invoice-party"><h4>Project Details</h4><p><strong>Due Date:</strong> ${new Date(order.dueDate).toLocaleDateString()}<br><strong>Turnaround:</strong> ${order.turnaround}<br><strong>Status:</strong> ${order.status.replace('_', ' ')}</p></div>
</div>
<table class="invoice-table">
<thead><tr><th>Description</th><th class="text-right">Amount</th></tr></thead>
<tbody>
<tr><td><strong>${order.projectName}</strong><br><span class="text-muted-sm">${order.description || 'No description'}</span></td><td class="text-right">$${(order.estimate || 0).toLocaleString()}</td></tr>
</tbody>
</table>
<div class="invoice-total">Total: $${(order.estimate || 0).toLocaleString()}</div>
<p style="margin-top: 32px; font-size: 12px; color: #888; text-align: center;">Thank you for your business! • New Urban Influence • Unapologetically Detroit</p>
</div>
    `;
    document.getElementById('invoiceModal').classList.add('active');
}

function closeInvoiceModal() { document.getElementById('invoiceModal').classList.remove('active'); }

function printInvoice() {
    const content = document.getElementById('invoicePrint').innerHTML;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`<html><head><title>Invoice</title><style>body{font-family:Inter,sans-serif;padding:40px;}.invoice-preview{max-width:700px;margin:0 auto;}.invoice-header{display:flex;justify-content:space-between;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #000;}.invoice-logo{font-size:24px;font-weight:800;color:#ff0000;}.invoice-title{font-size:32px;font-weight:700;text-align:right;}.invoice-meta{font-size:13px;color:#666;text-align:right;}.invoice-parties{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;}.invoice-party h4{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}.invoice-table{width:100%;border-collapse:collapse;margin-bottom:24px;}.invoice-table th{text-align:left;padding:12px;border-bottom:2px solid #000;font-size:12px;text-transform:uppercase;}.invoice-table td{padding:12px;border-bottom:1px solid #e5e5e5;}.invoice-total{text-align:right;font-size:24px;font-weight:700;}</style>    <!-- Geo Meta Tags -->
    <meta name="geo.region" content="US-MI">
    <meta name="geo.placename" content="Detroit, Michigan">
    <meta name="geo.position" content="42.3314;-83.0458">
    <meta name="ICBM" content="42.3314, -83.0458">
</head><body>${content}</body></html>`);
    win.document.close();
    win.print();
}

