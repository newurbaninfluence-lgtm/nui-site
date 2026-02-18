// ==================== CLIENT PORTAL: PROOF APPROVE / REVISION ====================
// Generic approve any proof from client portal Proofs tab
async function clientApproveProof(proofId, clientId) {
    const p = proofs.find(x => x.id == proofId);
    if (!p) { alert('Proof not found.'); return; }

    p.status = 'approved';
    p.approvedAt = new Date().toISOString();
    p.updatedAt = new Date().toISOString();
    saveProofs();

    const client = clients.find(c => c.id == clientId);

    // If it's a brand guide proof, also update the brandGuide status
    if (p.type === 'brandguide' && client?.brandGuide) {
        client.brandGuide.status = 'approved';
        client.brandGuide.approvedAt = new Date().toISOString();
        client.brandGuide.proofComments = client.brandGuide.proofComments || [];
        client.brandGuide.proofComments.push({ type: 'Approved', comment: 'Client approved via portal', date: new Date().toISOString() });
        saveClients();
    }

    // Send email notification to admin/designer
    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'newurbaninfluence@gmail.com',
                subject: '✅ Proof Approved: ' + (p.title || p.name || 'Design Proof') + ' — ' + (client?.name || 'Client'),
                html: '<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;"><h2 style="margin:0;font-size:24px;color:#fff;">Proof Approved! ✅</h2></div><div style="padding:32px;"><p style="color:#ccc;font-size:16px;"><strong>' + (client?.name || 'Client') + '</strong> has approved:</p><div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;"><p style="color:#fff;font-weight:600;font-size:18px;margin:0 0 8px;">' + (p.title || p.name || 'Design Proof') + '</p><p style="color:#888;font-size:14px;margin:0;">' + (p.category || p.proofType || 'Proof') + ' • Version ' + (p.version || 1) + '</p></div><p style="color:#888;font-size:14px;">You can now proceed with final deliverables.</p></div></div>',
                text: (client?.name || 'Client') + ' approved "' + (p.title || p.name || 'Design Proof') + '". Proceed with final deliverables.'
            })
        });
    } catch (err) { console.log('Admin notification email failed:', err.message); }

    // Log to CRM
    if (typeof logProofActivity === 'function') {
        logProofActivity('approved', p, (client?.name || 'Client') + ' approved "' + (p.title || p.name) + '" from client portal');
    }

    alert('✅ Proof approved! Your designer will prepare your final deliverables.');
    if (client) showClientPortal(client);
}

// Generic request revision on any proof from client portal Proofs tab
function clientRequestProofRevision(proofId, clientId) {
    const p = proofs.find(x => x.id == proofId);
    if (!p) { alert('Proof not found.'); return; }

    // Show revision modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
    modal.innerHTML = `
<div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;max-width:500px;width:100%;">
<h3 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#fff;">🔄 Request Changes</h3>
<p style="color:#888;margin-bottom:8px;">Proof: <strong style="color:#fff;">${p.title || p.name || 'Design Proof'}</strong></p>
<p style="color:#888;margin-bottom:24px;">Describe the changes you'd like and we'll get on it ASAP.</p>
<textarea id="clientRevisionFeedback" placeholder="What changes would you like to see?&#10;&#10;Be as specific as possible — colors, layout, text, etc." style="width:100%;min-height:140px;padding:16px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
<div style="display:flex;gap:12px;margin-top:24px;">
<button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;padding:14px;background:transparent;border:1px solid #333;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">Cancel</button>
<button onclick="submitClientProofRevision(${proofId}, ${clientId})" style="flex:1;padding:14px;background:#ef4444;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">Send Feedback</button>
</div>
</div>`;
    document.body.appendChild(modal);
}

async function submitClientProofRevision(proofId, clientId) {
    const feedback = document.getElementById('clientRevisionFeedback')?.value?.trim();
    if (!feedback) { alert('Please describe the changes you need.'); return; }

    const p = proofs.find(x => x.id == proofId);
    if (!p) return;

    p.status = 'revision';
    p.revisionCount = (p.revisionCount || 0) + 1;
    p.comments = p.comments || [];
    p.comments.push({ author: 'Client', text: feedback, timestamp: new Date().toISOString() });
    p.updatedAt = new Date().toISOString();
    saveProofs();

    const client = clients.find(c => c.id == clientId);

    // If brand guide proof, also update brandGuide status
    if (p.type === 'brandguide' && client?.brandGuide) {
        client.brandGuide.status = 'revision_requested';
        client.brandGuide.proofComments = client.brandGuide.proofComments || [];
        client.brandGuide.proofComments.push({ type: 'Revision Requested', comment: feedback, date: new Date().toISOString() });
        saveClients();
    }

    // Notify designer
    if (p.designerId && typeof addDesignerMessage === 'function') {
        addDesignerMessage(p.designerId, p.projectId, '📝 Client "' + (client?.name || '') + '" requested revisions on "' + (p.title || p.name) + '": ' + feedback, 'revision', false);
    }

    // Send email to admin/designer
    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'newurbaninfluence@gmail.com',
                subject: '🔄 Revision Requested: ' + (p.title || p.name || 'Design Proof') + ' — ' + (client?.name || 'Client'),
                html: '<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;"><h2 style="margin:0;font-size:24px;color:#fff;">Revision Requested 🔄</h2></div><div style="padding:32px;"><p style="color:#ccc;font-size:16px;"><strong>' + (client?.name || 'Client') + '</strong> wants changes to:</p><div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;"><p style="color:#fff;font-weight:600;font-size:18px;margin:0 0 8px;">' + (p.title || p.name || 'Design Proof') + '</p><p style="color:#888;font-size:14px;margin:0;">Revision #' + (p.revisionCount || 1) + '</p></div><div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;"><p style="color:#888;font-size:12px;margin:0 0 8px;">CLIENT FEEDBACK:</p><p style="color:#fff;font-size:15px;line-height:1.6;margin:0;">' + feedback.replace(/\n/g, '<br>') + '</p></div></div></div>',
                text: (client?.name || 'Client') + ' requested revisions on "' + (p.title || p.name) + '": ' + feedback
            })
        });
    } catch (err) { console.log('Revision notification email failed:', err.message); }

    // Log to CRM
    if (typeof logProofActivity === 'function') {
        logProofActivity('revision', p, (client?.name || 'Client') + ' requested revisions on "' + (p.title || p.name) + '"');
    }

    // Close modal
    const modal = document.querySelector('div[style*="fixed"][style*="inset"]');
    if (modal) modal.remove();

    alert('📝 Revision request sent! Your designer will review your feedback and update the proof.');
    if (client) showClientPortal(client);
}

