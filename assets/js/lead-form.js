// Small sign-up forms on the standalone pages: <form data-lead-form data-service="demo-request">.
// Sends to the same function as the free audit (submit-lead) and shows the result in the form.
document.querySelectorAll('form[data-lead-form]').forEach(function(f) {
  f.addEventListener('submit', async function(e) {
    e.preventDefault();
    var msg = f.querySelector('.nh-form-msg'), btn = f.querySelector('button[type=submit]');
    var name = f.elements.name.value.trim(), phone = f.elements.phone.value.trim();
    if (!name) { msg.textContent = 'Add your name so we know who to ask for.'; return; }
    if (phone.replace(/\D/g, '').length < 10) { msg.textContent = 'Add a 10-digit mobile number so we can text you.'; return; }
    var label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending...'; msg.textContent = '';
    try {
      var r = await fetch('/.netlify/functions/submit-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone, service: f.dataset.service, serviceName: f.dataset.label || f.dataset.service, bookingChoice: 'call', source: location.pathname }) });
      if (!r.ok) throw new Error(r.status);
      f.innerHTML = '<p class="nh-form-done">Got it, ' + name.split(' ')[0].replace(/</g, '') + '. ' + (f.dataset.done || "We'll text you soon.") + '</p>';
    } catch (err) {
      btn.disabled = false; btn.textContent = label;
      msg.textContent = "That didn't go through. Try again, or call (248) 487-8747.";
    }
  });
});
