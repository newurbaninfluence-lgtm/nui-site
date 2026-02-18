// ==================== PAYMENT GATING (CRITICAL) ====================
// Check if client has paid before allowing downloads
function canDownload(clientId) {
    const clientInvoices = invoices.filter(i => i.clientId === clientId);
    const clientPayments = payments.filter(p => p.clientId === clientId);

    // If no invoices, no downloads needed
    if (clientInvoices.length === 0) return true;

    const totalOwed = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Allow download only if paid >= owed
    return totalPaid >= totalOwed;
}

function downloadAsset(clientId, category, index) {
    // CRITICAL: Check payment status before allowing download
    if (!canDownload(clientId)) {
        alert('⚠️ Payment Required\n\nPlease complete payment before downloading brand assets. Contact us if you believe this is an error.');
        return;
    }

    const client = clients.find(c => c.id === clientId);
    if (!client || !client.assets || !client.assets[category]) {
        alert('Asset not found');
        return;
    }

    const asset = client.assets[category][index];
    if (asset?.data) {
        const link = document.createElement('a');
        link.href = asset.data;
        link.download = asset.name || `${category}-asset-${index}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Download started: ' + asset.name);
    } else if (asset?.url) {
        window.open(asset.url, '_blank');
    } else {
        alert('Asset not available for download');
    }
}

