// ========================================================================
// admin-push-reinvite.js  -  Admin-only UI to SMS people a push re-invite
// ========================================================================
// Renders a floating action button on /app/ pages. Opens a modal where
// Faren pastes a list of recipients (name, phone — one per line) and
// sends them an SMS with a ?push=1 link that triggers the opt-in banner
// on arrival.
//
// Endpoint: POST /.netlify/functions/push-reinvite
//   Body: { recipients: [{name, phone}], message_override?: string }
// ========================================================================

(function() {
  if (!location.pathname.startsWith('/app')) return;

  const DEFAULT_MSG =
    'Hey {name} — Faren from New Urban Influence. ' +
    'Tap to turn NUI updates back on in 5 seconds: ' +
    'https://newurbaninfluence.com/?push=1 ' +
    '(reply STOP to opt out)';

  const STYLE =
    '#nui-preinvite-fab{position:fixed;right:20px;bottom:20px;z-index:9997;' +
    'background:linear-gradient(135deg,#D90429,#C9A227);color:#fff;border:none;' +
    'border-radius:999px;padding:14px 20px;font-family:Inter,sans-serif;font-weight:700;' +
    'font-size:13px;letter-spacing:.3px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.4);' +
    'display:flex;align-items:center;gap:8px;transition:all .2s;}' +
    '#nui-preinvite-fab:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(217,4,41,0.4);}' +
    '#nui-preinvite-modal{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.7);' +
    'display:none;align-items:center;justify-content:center;padding:20px;' +
    'font-family:Inter,-apple-system,sans-serif;}' +
    '#nui-preinvite-modal.open{display:flex;}' +
    '#nui-preinvite-modal .pm-box{background:#0f0f0f;border:1px solid rgba(201,162,39,0.3);' +
    'border-radius:16px;padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;' +
    'color:#fff;}' +
    '#nui-preinvite-modal h2{margin:0 0 6px;font-size:20px;font-weight:800;}' +
    '#nui-preinvite-modal .pm-sub{color:#888;font-size:13px;margin:0 0 18px;line-height:1.5;}' +
    '#nui-preinvite-modal label{display:block;font-size:12px;text-transform:uppercase;' +
    'letter-spacing:.8px;color:#aaa;margin:14px 0 6px;font-weight:700;}' +
    '#nui-preinvite-modal textarea{width:100%;background:#1a1a1a;border:1px solid #333;' +
    'border-radius:8px;padding:12px;color:#fff;font-family:inherit;font-size:13px;' +
    'line-height:1.5;resize:vertical;box-sizing:border-box;}' +
    '#nui-preinvite-modal textarea:focus{outline:none;border-color:#C9A227;}' +
    '#nui-preinvite-modal .pm-actions{display:flex;gap:10px;margin-top:20px;}' +
    '#nui-preinvite-modal button{flex:1;padding:12px 18px;border:none;border-radius:8px;' +
    'font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;}' +
    '#nui-preinvite-modal .pm-send{background:#D90429;color:#fff;}' +
    '#nui-preinvite-modal .pm-send:hover{background:#b8021f;}' +
    '#nui-preinvite-modal .pm-send:disabled{opacity:0.5;cursor:not-allowed;}' +
    '#nui-preinvite-modal .pm-cancel{background:transparent;color:#888;border:1px solid #333;}' +
    '#nui-preinvite-modal .pm-cancel:hover{color:#fff;border-color:#555;}' +
    '#nui-preinvite-modal .pm-result{margin-top:16px;padding:12px;border-radius:8px;font-size:13px;' +
    'line-height:1.5;display:none;}' +
    '#nui-preinvite-modal .pm-result.show{display:block;}' +
    '#nui-preinvite-modal .pm-result.ok{background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.4);color:#86efac;}' +
    '#nui-preinvite-modal .pm-result.err{background:rgba(217,4,41,0.12);border:1px solid rgba(217,4,41,0.4);color:#fca5a5;}';

  function parseRecipients(raw) {
    // Each line: "Name, phone"  OR  "+15551234567"  OR  "Name 555-123-4567"
    const lines = raw.split(/\n/).map(s => s.trim()).filter(Boolean);
    const recipients = [];
    for (const line of lines) {
      // Split on comma first, fall back to last whitespace-separated phone
      let name = 'there';
      let phone = '';
      if (line.includes(',')) {
        const parts = line.split(',').map(s => s.trim());
        name = parts[0] || 'there';
        phone = parts[1] || '';
      } else {
        const match = line.match(/([+\d][\d\s\-().]{7,})\s*$/);
        if (match) {
          phone = match[1];
          name = line.substring(0, line.length - match[0].length).trim() || 'there';
        } else {
          phone = line;
        }
      }
      phone = phone.replace(/[^\d+]/g, '');
      if (phone.length >= 10) {
        recipients.push({ name, phone });
      }
    }
    return recipients;
  }

  function mount() {
    if (document.getElementById('nui-preinvite-fab')) return;

    const style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    const fab = document.createElement('button');
    fab.id = 'nui-preinvite-fab';
    fab.innerHTML = '📲 Re-invite to Push';
    document.body.appendChild(fab);

    const modal = document.createElement('div');
    modal.id = 'nui-preinvite-modal';
    modal.innerHTML =
      '<div class="pm-box">' +
      '  <h2>📲 Push Re-invite</h2>' +
      '  <p class="pm-sub">Sends each recipient an SMS with a link that pops the opt-in prompt on arrival. One line per person: <code>Name, phone</code> (or just a phone number).</p>' +
      '  <label for="pm-recipients">Recipients</label>' +
      '  <textarea id="pm-recipients" rows="6" placeholder="Ashley, 313-555-0101&#10;Damon, +12485551234&#10;555-987-6543"></textarea>' +
      '  <label for="pm-msg">Message (use {name} to personalize)</label>' +
      '  <textarea id="pm-msg" rows="4"></textarea>' +
      '  <div class="pm-result" id="pm-result"></div>' +
      '  <div class="pm-actions">' +
      '    <button class="pm-cancel">Cancel</button>' +
      '    <button class="pm-send">Send Invites</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('#pm-msg').value = DEFAULT_MSG;

    fab.addEventListener('click', function() { modal.classList.add('open'); });
    modal.querySelector('.pm-cancel').addEventListener('click', function() {
      modal.classList.remove('open');
      modal.querySelector('#pm-result').classList.remove('show', 'ok', 'err');
    });
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });

    const sendBtn = modal.querySelector('.pm-send');
    const resultBox = modal.querySelector('#pm-result');

    sendBtn.addEventListener('click', async function() {
      const raw = modal.querySelector('#pm-recipients').value || '';
      const msg = modal.querySelector('#pm-msg').value || '';
      const recipients = parseRecipients(raw);

      resultBox.className = 'pm-result';

      if (!recipients.length) {
        resultBox.textContent = 'No valid phone numbers found. Format: Name, phone (one per line).';
        resultBox.classList.add('show', 'err');
        return;
      }
      if (!confirm('Send SMS to ' + recipients.length + ' recipient(s)?')) return;

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending…';
      resultBox.textContent = '';
      resultBox.classList.remove('show');

      try {
        const token = (window.NuiAdminAuth && window.NuiAdminAuth.getToken()) || '';
        const res = await fetch('/.netlify/functions/push-reinvite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token
          },
          body: JSON.stringify({ recipients: recipients, message_override: msg })
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          resultBox.innerHTML = '✅ Sent: <b>' + data.sent + '</b> &nbsp;·&nbsp; Failed: <b>' + data.failed + '</b>' +
            (data.errors && data.errors.length ? '<br><small>' + data.errors.slice(0, 3).map(function(e) {
              return (e.recipient && e.recipient.phone ? e.recipient.phone : '?') + ': ' + (e.reason || 'error');
            }).join('<br>') + '</small>' : '');
          resultBox.classList.add('show', data.failed === 0 ? 'ok' : 'err');
        } else {
          resultBox.textContent = '❌ ' + (data.error || ('HTTP ' + res.status));
          resultBox.classList.add('show', 'err');
        }
      } catch (err) {
        resultBox.textContent = '❌ ' + err.message;
        resultBox.classList.add('show', 'err');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Invites';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
