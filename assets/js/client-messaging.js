// ==================== CLIENT PORTAL: CONTACT DESIGNER MESSAGING ====================
function openClientMessageDesigner(clientId) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
    modal.innerHTML = `
<div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;max-width:520px;width:100%;">
<h3 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#fff;">💬 Contact Your Designer</h3>
<p style="color:#888;margin-bottom:20px;">Send a message directly to your design team. We'll respond within 1 business day.</p>
<div style="margin-bottom:16px;">
<label style="display:block;font-size:13px;font-weight:600;color:#aaa;margin-bottom:6px;">Subject</label>
<select id="designerMsgSubject" style="width:100%;padding:12px 16px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;box-sizing:border-box;">
<option value="general">General Question</option>
<option value="proof">About My Proofs</option>
<option value="timeline">Project Timeline</option>
<option value="files">Files & Deliverables</option>
<option value="add-on">Add-on Services</option>
<option value="billing">Billing & Payments</option>
<option value="other">Other</option>
</select>
</div>
<div style="margin-bottom:16px;">
<label style="display:block;font-size:13px;font-weight:600;color:#aaa;margin-bottom:6px;">Message</label>
<textarea id="designerMsgBody" placeholder="Type your message here..." style="width:100%;min-height:140px;padding:16px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
</div>
<div style="display:flex;gap:12px;">
<button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;padding:14px;background:transparent;border:1px solid #333;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">Cancel</button>
<button onclick="sendClientDesignerMessage(${clientId})" style="flex:1;padding:14px;background:#e11d48;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">📨 Send Message</button>
</div>
</div>`;
    document.body.appendChild(modal);
}

async function sendClientDesignerMessage(clientId) {
    const subject = document.getElementById('designerMsgSubject')?.value || 'general';
    const body = document.getElementById('designerMsgBody')?.value?.trim();
    if (!body) { alert('Please type your message.'); return; }

    const client = clients.find(c => c.id == clientId);
    if (!client) return;

    const subjectLabels = {
        general: 'General Question', proof: 'About Proofs', timeline: 'Project Timeline',
        files: 'Files & Deliverables', 'add-on': 'Add-on Services', billing: 'Billing & Payments', other: 'Other'
    };

    // Store message in client record
    client.messages = client.messages || [];
    client.messages.push({
        id: Date.now(),
        from: 'client',
        subject: subjectLabels[subject] || subject,
        body: body,
        timestamp: new Date().toISOString(),
        read: false
    });
    saveClients();

    // Send email to NUI team
    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'newurbaninfluence@gmail.com',
                subject: '💬 Client Message: ' + (client.name || 'Client') + ' — ' + (subjectLabels[subject] || subject),
                html: '<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(135deg,#e11d48,#be185d);padding:32px;text-align:center;"><h2 style="margin:0;font-size:24px;color:#fff;">New Client Message 💬</h2></div><div style="padding:32px;"><div style="display:flex;justify-content:space-between;margin-bottom:20px;"><div><p style="color:#888;font-size:12px;margin:0;">FROM</p><p style="color:#fff;font-size:16px;font-weight:600;margin:4px 0 0;">' + (client.name || 'Client') + '</p><p style="color:#888;font-size:13px;margin:2px 0 0;">' + (client.email || '') + '</p></div><div style="text-align:right;"><p style="color:#888;font-size:12px;margin:0;">SUBJECT</p><p style="color:#e11d48;font-size:14px;font-weight:600;margin:4px 0 0;">' + (subjectLabels[subject] || subject) + '</p></div></div><div style="background:#111;border:1px solid #333;border-radius:12px;padding:24px;"><p style="color:#fff;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">' + body.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</p></div><p style="color:#888;font-size:13px;margin-top:20px;">Reply to this client from the admin panel or email them at ' + (client.email || 'N/A') + '</p></div></div>',
                text: 'New message from ' + (client.name || 'Client') + ' (' + (client.email || '') + ')\nSubject: ' + (subjectLabels[subject] || subject) + '\n\n' + body
            })
        });
    } catch (err) { console.log('Designer message email failed:', err.message); }

    // Close modal
    const modal = document.querySelector('div[style*="fixed"][style*="inset"]');
    if (modal) modal.remove();

    alert('✅ Message sent! We\'ll get back to you within 1 business day.');
}

// ==================== CLIENT PORTAL: BOOK A CALL ====================
