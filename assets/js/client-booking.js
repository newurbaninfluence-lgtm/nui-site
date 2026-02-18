function openBookCallModal() {
    // Business hours: Mon–Thu 1:00–4:00 PM EST, Friday = booked (design work), Sat–Sun = closed
    const now = new Date();
    const estOffset = -5; // EST is UTC-5
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const estNow = new Date(utcMs + (3600000 * estOffset));
    const dayOfWeek = estNow.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const hour = estNow.getHours();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // Generate next 14 days of available slots
    let slotsHtml = '';
    let slotCount = 0;
    for (let d = 1; d <= 14 && slotCount < 8; d++) {
        const date = new Date(estNow);
        date.setDate(date.getDate() + d);
        const dow = date.getDay();
        // Only Mon-Thu (1-4) are available
        if (dow >= 1 && dow <= 4) {
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const isoDate = date.toISOString().split('T')[0];
            slotsHtml += '<div style="margin-bottom:8px;">' +
                '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:6px;">' + dateStr + '</div>' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                '<button onclick="selectCallSlot(this, \'' + isoDate + '\', \'1:00 PM\')" class="call-slot-btn" style="padding:8px 16px;background:#0a0a0a;border:1px solid #333;color:#ccc;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.2s;">1:00 PM</button>' +
                '<button onclick="selectCallSlot(this, \'' + isoDate + '\', \'1:30 PM\')" class="call-slot-btn" style="padding:8px 16px;background:#0a0a0a;border:1px solid #333;color:#ccc;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.2s;">1:30 PM</button>' +
                '<button onclick="selectCallSlot(this, \'' + isoDate + '\', \'2:00 PM\')" class="call-slot-btn" style="padding:8px 16px;background:#0a0a0a;border:1px solid #333;color:#ccc;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.2s;">2:00 PM</button>' +
                '<button onclick="selectCallSlot(this, \'' + isoDate + '\', \'2:30 PM\')" class="call-slot-btn" style="padding:8px 16px;background:#0a0a0a;border:1px solid #333;color:#ccc;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.2s;">2:30 PM</button>' +
                '<button onclick="selectCallSlot(this, \'' + isoDate + '\', \'3:00 PM\')" class="call-slot-btn" style="padding:8px 16px;background:#0a0a0a;border:1px solid #333;color:#ccc;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.2s;">3:00 PM</button>' +
                '<button onclick="selectCallSlot(this, \'' + isoDate + '\', \'3:30 PM\')" class="call-slot-btn" style="padding:8px 16px;background:#0a0a0a;border:1px solid #333;color:#ccc;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;transition:all 0.2s;">3:30 PM</button>' +
                '</div></div>';
            slotCount++;
        }
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;overflow-y:auto;';
    modal.innerHTML = `
<div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;">
<h3 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#fff;">📞 Book a Call</h3>
<p style="color:#888;margin-bottom:4px;">Schedule a call with your design team.</p>
<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
<p style="color:#888;font-size:13px;margin:0;"><strong style="color:#e11d48;">Hours:</strong> Monday – Thursday, 1:00 – 4:00 PM EST</p>
<p style="color:#666;font-size:12px;margin:4px 0 0;">Fridays reserved for design work • Weekends closed</p>
</div>
<div style="margin-bottom:20px;">
<label style="display:block;font-size:13px;font-weight:600;color:#aaa;margin-bottom:10px;">Select a time slot:</label>
${slotsHtml}
</div>
<input type="hidden" id="selectedCallDate" value="">
<input type="hidden" id="selectedCallTime" value="">
<div style="margin-bottom:16px;">
<label style="display:block;font-size:13px;font-weight:600;color:#aaa;margin-bottom:6px;">What would you like to discuss? (optional)</label>
<textarea id="callTopic" placeholder="Brief description of what you'd like to cover..." style="width:100%;min-height:80px;padding:12px 16px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
</div>
<div style="display:flex;gap:12px;">
<button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;padding:14px;background:transparent;border:1px solid #333;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">Cancel</button>
<button id="bookCallConfirmBtn" onclick="confirmBookCall()" style="flex:1;padding:14px;background:#333;border:none;color:#666;border-radius:8px;cursor:not-allowed;font-weight:600;font-family:inherit;" disabled>Select a Time</button>
</div>
</div>`;
    document.body.appendChild(modal);
}

function selectCallSlot(btn, date, time) {
    // Remove active from all slot buttons
    document.querySelectorAll('.call-slot-btn').forEach(b => {
        b.style.background = '#0a0a0a';
        b.style.borderColor = '#333';
        b.style.color = '#ccc';
    });
    // Highlight selected
    btn.style.background = '#e11d4820';
    btn.style.borderColor = '#e11d48';
    btn.style.color = '#e11d48';

    document.getElementById('selectedCallDate').value = date;
    document.getElementById('selectedCallTime').value = time;

    // Enable confirm button
    const confirmBtn = document.getElementById('bookCallConfirmBtn');
    if (confirmBtn) {
        confirmBtn.style.background = '#e11d48';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.disabled = false;
        confirmBtn.textContent = '📞 Book ' + time + ' Call';
    }
}

async function confirmBookCall() {
    const date = document.getElementById('selectedCallDate')?.value;
    const time = document.getElementById('selectedCallTime')?.value;
    const topic = document.getElementById('callTopic')?.value?.trim() || 'General discussion';

    if (!date || !time) { alert('Please select a time slot.'); return; }

    const clientId = currentUser?.clientId || currentUser?.id;
    const client = clients.find(c => c.id == clientId) || currentUser;
    const dateObj = new Date(date + 'T12:00:00');
    const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Store booking
    client.callBookings = client.callBookings || [];
    client.callBookings.push({
        id: Date.now(),
        date: date,
        time: time,
        topic: topic,
        status: 'confirmed',
        bookedAt: new Date().toISOString()
    });
    saveClients();

    // Send email to NUI team
    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'newurbaninfluence@gmail.com',
                subject: '📞 Call Booked: ' + (client.name || 'Client') + ' — ' + dateFormatted + ' at ' + time + ' EST',
                html: '<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);padding:32px;text-align:center;"><h2 style="margin:0;font-size:24px;color:#fff;">New Call Booked 📞</h2></div><div style="padding:32px;"><p style="color:#ccc;font-size:16px;"><strong>' + (client.name || 'Client') + '</strong> booked a call:</p><div style="background:#111;border:1px solid #333;border-radius:12px;padding:24px;margin:16px 0;"><div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;"><span style="color:#888;font-size:13px;">📅 Date:</span><span style="color:#fff;font-weight:600;">' + dateFormatted + '</span><span style="color:#888;font-size:13px;">🕐 Time:</span><span style="color:#fff;font-weight:600;">' + time + ' EST</span><span style="color:#888;font-size:13px;">📧 Email:</span><span style="color:#fff;">' + (client.email || 'N/A') + '</span><span style="color:#888;font-size:13px;">📋 Topic:</span><span style="color:#fff;">' + topic.replace(/</g, '&lt;') + '</span></div></div></div></div>',
                text: 'Call booked by ' + (client.name || 'Client') + ' for ' + dateFormatted + ' at ' + time + ' EST. Topic: ' + topic
            })
        });
    } catch (err) { console.log('Call booking email failed:', err.message); }

    // Send confirmation email to client
    if (client.email) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: client.email,
                    subject: '📞 Call Confirmed — ' + dateFormatted + ' at ' + time + ' EST',
                    html: '<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(135deg,#e11d48,#be185d);padding:32px;text-align:center;"><h2 style="margin:0;font-size:24px;color:#fff;">Your Call is Confirmed! 📞</h2></div><div style="padding:32px;"><p style="color:#ccc;font-size:16px;">Hey ' + (client.contact || client.name || 'there') + ',</p><p style="color:#ccc;font-size:16px;">Your call with New Urban Influence is confirmed:</p><div style="background:#111;border:1px solid #333;border-radius:12px;padding:24px;margin:20px 0;text-align:center;"><p style="color:#e11d48;font-size:24px;font-weight:700;margin:0 0 4px;">' + dateFormatted + '</p><p style="color:#fff;font-size:20px;font-weight:600;margin:0;">' + time + ' EST</p></div><p style="color:#888;font-size:14px;">We\'ll call you at the number on file. If you need to reschedule, contact us at <a href="tel:2484878747" style="color:#e11d48;text-decoration:none;">(248) 487-8747</a> or reply to this email.</p></div><div style="background:#050505;padding:20px;text-align:center;border-top:1px solid #222;"><p style="color:#666;font-size:12px;margin:0;">New Urban Influence • Detroit, MI</p></div></div>',
                    text: 'Your call is confirmed for ' + dateFormatted + ' at ' + time + ' EST. We\'ll call you at the number on file. To reschedule, call (248) 487-8747.'
                })
            });
        } catch (err) { console.log('Client confirmation email failed:', err.message); }
    }

    // Close modal
    const modal = document.querySelector('div[style*="fixed"][style*="inset"]');
    if (modal) modal.remove();

    alert('📞 Call booked!\n\n📅 ' + dateFormatted + '\n🕐 ' + time + ' EST\n\nYou\'ll receive a confirmation email shortly.');
}

