// ========================================================================
// admin-client-hub.js — Clients panel (AJ / ShootOS-style client record)
// ========================================================================
// One place per customer: who they are, every text + email, what they pay,
// what they owe, their sites and notes.
//
// Source of truth: client_sites (one row per website, grouped into one
// customer by billing_group, else by client_name). Messages come from the
// communications log (send-sms / send-email / webhooks write there).
// All reads/writes go through admin-db.js → admin-query (admin token).
//
// Replaces the old card grid version of loadAdminClientsPanel(); every
// existing caller of loadAdminClientsPanel()/showAdminPanel('clients')
// lands here.
// ========================================================================

(function () {
  var state = { customers: [], openKey: null, filter: 'all', search: '', streamFilter: 'all', rail: 'money' };

  // ---------- helpers ----------
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    var v = Number(n) || 0;
    return '$' + v.toLocaleString('en-US', { maximumFractionDigits: v % 1 ? 2 : 0 });
  }
  function shortDate(d) {
    if (!d) return '';
    var dt = new Date(String(d).length === 10 ? d + 'T12:00:00' : d);
    if (isNaN(dt)) return '';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: dt.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
  }
  function when(d) {
    var dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '?';
  }
  function digits(p) { return String(p || '').replace(/\D/g, '').slice(-10); }
  function feeOf(s) {
    var f = s.monthly_fee != null && s.monthly_fee !== '' ? s.monthly_fee : s.monthly_rate;
    return Number(f) || 0;
  }
  function panel() { return document.getElementById('adminClientsPanel'); }
  function toast(msg, bad) {
    document.querySelectorAll('.ch-toast').forEach(function (old) { old.remove(); });
    var t = document.createElement('div');
    t.className = 'ch-toast' + (bad ? ' bad' : '');
    t.innerHTML = (bad ? '' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>') + esc(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 2600);
    setTimeout(function () { t.remove(); }, 3100);
  }
  var I = {
    phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>',
    doc: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    back: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    ext: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>'
  };

  // ---------- data ----------
  function db() { return window.supabaseClient || window.db; }

  function groupSites(sites) {
    var map = {};
    sites.forEach(function (s) {
      var key = (s.billing_group || s.client_name || s.site_name || s.site_id || '').trim().toLowerCase();
      if (!key) return;
      (map[key] = map[key] || []).push(s);
    });
    return Object.keys(map).map(function (key) {
      var list = map[key];
      var first = list[0];
      var pick = function (f) { for (var i = 0; i < list.length; i++) if (list[i][f]) return list[i][f]; return null; };
      var c = {
        key: key,
        name: first.client_name || first.site_name || first.site_id,
        sites: list,
        phone: pick('contact_phone'),
        email: pick('contact_email') || pick('client_email'),
        card: !!(pick('stripe_subscription_id') || pick('stripe_customer_id')),
        notes: list[0].notes || '',
        monthly: list.reduce(function (a, s) { return a + (s.status === 'suspended' ? 0 : feeOf(s)); }, 0),
        nextDue: list.map(function (s) { return s.next_due_date || s.next_payment_at || s.next_payment_due; }).filter(Boolean).sort()[0] || null,
        lastPaid: list.map(function (s) { return s.last_payment_at || s.last_payment_date; }).filter(Boolean).sort().pop() || null,
        paymentLink: pick('payment_link'),
        since: list.map(function (s) { return s.created_at; }).filter(Boolean).sort()[0] || null
      };
      var statuses = list.map(function (s) { return s.billing_status || 'unbilled'; });
      var allSuspended = list.every(function (s) { return s.status === 'suspended'; });
      if (allSuspended) c.billing = { label: 'Site paused', cls: 'x', group: 'paused' };
      else if (statuses.indexOf('overdue') > -1) c.billing = { label: 'Overdue', cls: 'r', group: 'overdue' };
      else if (statuses.indexOf('active') > -1) c.billing = { label: (c.card ? 'Autopay' : 'Paid') + (c.nextDue ? ' · next ' + shortDate(c.nextDue) : ''), cls: 'g', group: 'paying' };
      else if (!c.monthly) c.billing = { label: 'No price set', cls: 'a', group: 'unbilled' };
      else c.billing = { label: 'Not billed', cls: 'r', group: 'unbilled' };
      c.business = list.length > 1 ? list.length + ' websites' : (first.client_name && first.site_name && first.site_name !== first.client_name ? first.site_name : (first.domain || ''));
      c.owes = statuses.indexOf('overdue') > -1 ? c.monthly : 0;
      return c;
    }).sort(function (a, b) {
      var rank = { overdue: 0, paying: 1, unbilled: 2, paused: 3 };
      return (rank[a.billing.group] - rank[b.billing.group]) || a.name.localeCompare(b.name);
    });
  }

  async function loadCustomers() {
    var res = await db().from('client_sites').select('*').order('created_at', { ascending: true });
    if (res.error) throw new Error(res.error.message);
    state.customers = groupSites(res.data || []);
    return state.customers;
  }

  async function loadStream(c) {
    var out = [];
    var ors = [];
    var p = digits(c.phone);
    if (p.length === 10) { ors.push('metadata->>to.ilike.*' + p); ors.push('metadata->>from.ilike.*' + p); }
    if (c.email) ors.push('metadata->>to.ilike."' + c.email.trim().replace(/"/g, '') + '"');
    if (ors.length) {
      var r = await db().from('communications').select('id,channel,direction,message,subject,status,created_at,opened_at,metadata')
        .or(ors.join(',')).order('created_at', { ascending: false }).limit(200);
      if (!r.error) out = r.data || [];
    }
    return out;
  }

  async function loadInvoices(c) {
    var ors = [];
    if (c.email) ors.push('client_email.ilike."' + c.email.trim().replace(/"/g, '') + '"');
    if (c.name) ors.push('client_name.ilike."' + c.name.replace(/[",()]/g, ' ').trim() + '"');
    if (!ors.length) return [];
    var r = await db().from('invoices').select('id,invoice_number,total,amount_paid,status,due_date,paid_at,sent_at,created_at').or(ors.join(',')).order('created_at', { ascending: false }).limit(50);
    return r.error ? [] : (r.data || []);
  }

  async function updateSites(c, patch) {
    var ids = c.sites.map(function (s) { return s.id; });
    var r = await db().from('client_sites').update(patch).in('id', ids);
    if (r.error) throw new Error(r.error.message);
  }

  // ---------- list view ----------
  function renderList() {
    var cs = state.customers;
    var q = state.search.toLowerCase();
    var paying = cs.filter(function (c) { return c.billing.group === 'paying'; });
    var unbilled = cs.filter(function (c) { return c.billing.group === 'unbilled' && c.monthly; });
    var noPhone = cs.filter(function (c) { return !c.phone; });
    var needsSetup = function (c) { return !c.phone || !c.email || !c.card; };
    var siteCount = cs.reduce(function (a, c) { return a + c.sites.length; }, 0);
    var rows = cs.filter(function (c) {
      if (state.filter === 'paying' && c.billing.group !== 'paying') return false;
      if (state.filter === 'unbilled' && c.billing.group !== 'unbilled' && c.billing.group !== 'overdue') return false;
      if (state.filter === 'setup' && !needsSetup(c)) return false;
      if (!q) return true;
      return [c.name, c.business, c.phone, c.email].concat(c.sites.map(function (s) { return (s.site_name || '') + ' ' + (s.domain || ''); })).join(' ').toLowerCase().indexOf(q) > -1;
    });
    var chip = function (k, l) { return '<button class="ch-chip' + (state.filter === k ? ' on' : '') + '" onclick="NuiClientHub.setFilter(\'' + k + '\')">' + l + '</button>'; };
    var tag = function (ok, l) { return '<span class="ch-set' + (ok ? '' : ' no') + '">' + l + '</span>'; };

    panel().innerHTML =
      '<div class="ch">' +
      '<div class="ch-top"><div><h1 class="ch-h1">Clients</h1><p class="ch-sub">Every customer, their websites, what they pay and how to reach them.</p></div>' +
      '<button class="ch-btn red" onclick="NuiClientHub.addClient()">+ Add client</button></div>' +
      '<div class="ch-stats">' +
      '<div class="ch-stat"><span>Customers</span><b>' + cs.length + '</b><small>' + siteCount + ' websites</small></div>' +
      '<div class="ch-stat"><span>On billing</span><b>' + paying.length + '</b><small>' + money(paying.reduce(function (a, c) { return a + c.monthly; }, 0)) + ' a month</small></div>' +
      '<div class="ch-stat warn"><span>Not billed yet</span><b>' + money(unbilled.reduce(function (a, c) { return a + c.monthly; }, 0)) + '</b><small>a month · ' + unbilled.length + ' customers</small></div>' +
      '<div class="ch-stat warn"><span>Missing a phone number</span><b>' + noPhone.length + '</b><small>Can\'t text them yet</small></div>' +
      '</div>' +
      '<div class="ch-card ch-table">' +
      '<div class="ch-tools"><label class="ch-search">' + I.search + '<input id="chSearch" placeholder="Search by name, business, phone or website" value="' + esc(state.search) + '" oninput="NuiClientHub.search(this.value)"></label>' +
      chip('all', 'All') + chip('paying', 'Paying') + chip('unbilled', 'Not billed') + chip('setup', 'Needs setup') + '</div>' +
      (rows.length ? '<table><thead><tr><th>Customer</th><th class="ch-hide-m">Websites</th><th>Monthly</th><th>Billing</th><th class="ch-hide-m">Account setup</th></tr></thead><tbody>' +
        rows.map(function (c) {
          return '<tr onclick="NuiClientHub.openAt(' + state.customers.indexOf(c) + ')">' +
            '<td><div class="ch-who"><div class="ch-av">' + esc(initials(c.name)) + '</div><div><b>' + esc(c.name) + '</b><span>' + esc(c.business) + '</span></div></div></td>' +
            '<td class="ch-hide-m">' + c.sites.map(function (s) { return esc(s.site_name || s.domain || s.site_id); }).join(' · ') + '</td>' +
            '<td class="ch-money">' + money(c.monthly) + '</td>' +
            '<td><span class="ch-pill ' + c.billing.cls + '">' + esc(c.billing.label) + '</span></td>' +
            '<td class="ch-hide-m"><div class="ch-sets">' + tag(c.phone, 'Phone') + tag(c.email, 'Email') + tag(c.card, 'Card') + '</div></td></tr>';
        }).join('') + '</tbody></table>'
        : '<p class="ch-empty">No customers match.</p>') +
      '</div></div>';
  }

  // ---------- record view ----------
  async function renderRecord(c) {
    panel().innerHTML = '<div class="ch"><div class="ch-crumb"><button class="ch-btn" onclick="NuiClientHub.backToList()">' + I.back + 'Back</button><a onclick="NuiClientHub.backToList()">Clients</a> / <b>' + esc(c.name) + '</b></div><p class="ch-empty">Loading ' + esc(c.name) + '…</p></div>';
    var stream = [], invoices = [];
    try {
      var both = await Promise.all([loadStream(c), loadInvoices(c)]);
      stream = both[0]; invoices = both[1];
    } catch (e) { console.warn('Client record load:', e.message); }
    if (state.openKey !== c.key) return;
    c._stream = stream; c._invoices = invoices;
    paintRecord(c);
  }

  function paintRecord(c) {
    var texts = c._stream.filter(function (x) { return x.channel === 'sms'; }).length;
    var emails = c._stream.filter(function (x) { return x.channel === 'email'; }).length;
    var tl = c._stream.filter(function (x) { return state.streamFilter === 'all' || x.channel === state.streamFilter; }).slice().reverse();
    var sf = function (k, l) { return '<button class="ch-chip' + (state.streamFilter === k ? ' on' : '') + '" onclick="NuiClientHub.streamFilter(\'' + k + '\')">' + l + '</button>'; };
    var rt = function (k, l) { return '<button class="' + (state.rail === k ? 'on' : '') + '" onclick="NuiClientHub.rail(\'' + k + '\')">' + l + '</button>'; };
    var line = function (k, v, missing) { return '<div class="ch-line"><span>' + k + '</span>' + (v ? '<b>' + esc(v) + '</b>' : '<button class="ch-link" onclick="NuiClientHub.editDetails()">' + missing + '</button>') + '</div>'; };

    var bubbles = tl.length ? tl.map(function (x) {
      var out = x.direction === 'outbound';
      var meta = (x.channel === 'sms' ? 'Text' : 'Email') + (out && x.channel === 'sms' ? ' from NUI line' : '') + ' · ' + when(x.created_at) + (x.opened_at ? ' · opened' : '');
      if (x.channel === 'email') {
        return '<div class="ch-bub mail' + (out ? ' out-mail' : '') + '"><b>' + esc(x.subject || '(no subject)') + '</b><p>' + esc(String(x.message || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280)) + '</p><small>' + meta + '</small></div>';
      }
      return '<div class="ch-bub ' + (out ? 'out' : 'in') + '">' + esc(x.message) + '<small>' + meta + '</small></div>';
    }).join('') : '<p class="ch-empty">No ' + (state.streamFilter === 'all' ? 'texts or emails' : state.streamFilter === 'sms' ? 'texts' : 'emails') + ' with ' + esc(c.name) + ' yet.' + (!c.phone && !c.email ? ' Add their phone or email to start.' : '') + '</p>';

    var railBody = '';
    if (state.rail === 'money') {
      railBody =
        '<div class="ch-bal"><div><small>Owes</small><b class="' + (c.owes ? 'red' : '') + '">' + money(c.owes) + '</b></div><div><small>Next bill</small><b>' + (c.nextDue ? shortDate(c.nextDue) : '—') + '</b></div><div><small>Last paid</small><b>' + (c.lastPaid ? shortDate(c.lastPaid) : '—') + '</b></div></div>' +
        (c._invoices.length ? c._invoices.map(function (i) {
          var paid = i.status === 'paid' || (Number(i.amount_paid) >= Number(i.total) && Number(i.total) > 0);
          return '<div class="ch-inv"><div class="ch-ic ' + (paid ? 'g' : '') + '">' + (paid ? I.check : I.doc) + '</div><div><b>' + esc(i.invoice_number ? 'Invoice ' + i.invoice_number : 'Invoice') + '</b><span>' + (paid ? 'Paid ' + shortDate(i.paid_at || i.created_at) : (i.due_date ? 'Due ' + shortDate(i.due_date) : esc(i.status || 'Draft'))) + '</span></div><div class="ch-amt"><b>' + money(i.total) + '</b></div></div>';
        }).join('') : '<p class="ch-empty sm">No invoices on file yet.</p>') +
        (c.paymentLink ? '<button class="ch-btn wide" onclick="NuiClientHub.copyPayLink()">Copy payment link</button>' : '') +
        '<button class="ch-btn red wide" onclick="showAdminPanel(\'invoices\')">New invoice</button>';
    } else if (state.rail === 'notes') {
      railBody = '<textarea id="chNotes" class="ch-input ch-notes" placeholder="Anything to remember about ' + esc(c.name) + '…">' + esc(c.notes) + '</textarea><button class="ch-btn red wide" onclick="NuiClientHub.saveNotes()">Save notes</button>';
    } else {
      railBody = c.sites.map(function (s) {
        var url = s.domain ? (/^https?:/.test(s.domain) ? s.domain : 'https://' + s.domain) : '';
        return '<div class="ch-svc"><div><b>' + esc(s.site_name || s.site_id) + '</b><span>' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(s.domain) + ' ' + I.ext + '</a>' : 'No domain yet') + '</span></div><span class="ch-pill ' + (s.status === 'suspended' ? 'x' : 'g') + '">' + (s.status === 'suspended' ? 'Paused' : 'Live') + '</span></div>';
      }).join('') + '<button class="ch-btn wide" onclick="showAdminPanel(\'sites\')">Manage websites</button>';
    }

    panel().innerHTML =
      '<div class="ch">' +
      '<div class="ch-crumb"><button class="ch-btn" onclick="NuiClientHub.backToList()">' + I.back + 'Back</button><a onclick="NuiClientHub.backToList()">Clients</a> / <b>' + esc(c.name) + '</b></div>' +
      '<div class="ch-rec">' +
      // LEFT — who they are
      '<div class="ch-col">' +
      '<div class="ch-card ch-prof"><div class="ch-av big">' + esc(initials(c.name)) + '</div><h2>' + esc(c.name) + '</h2><p class="ch-sub">' + esc(c.business) + '</p>' +
      line('Phone', c.phone, '+ Add phone') + line('Email', c.email, '+ Add email') + line('Card on file', c.card ? 'Yes' : '', 'Not yet') + line('Customer since', c.since ? new Date(c.since).getFullYear() : '', '—') +
      '<button class="ch-btn wide" onclick="NuiClientHub.editDetails()">Edit details</button></div>' +
      '<div class="ch-card"><div class="ch-mini"><div><small>Texts</small><b>' + texts + '</b></div><div><small>Emails</small><b>' + emails + '</b></div><div><small>Monthly</small><b>' + money(c.monthly) + '</b></div><div><small>Websites</small><b>' + c.sites.length + '</b></div></div></div>' +
      '<div class="ch-card"><h3>What they pay for</h3>' +
      c.sites.map(function (s) {
        var disc = Number(s.discount_amount) || 0;
        return '<div class="ch-svc"><div><b>' + esc(s.site_name || s.site_id) + '</b><span>' + esc(s.plan || 'Website') + (disc ? ' · ' + money(disc) + ' off' : '') + '</span></div><div class="ch-r"><b>' + money(feeOf(s)) + '/mo</b></div></div>';
      }).join('') +
      (c.sites.length > 1 ? '<div class="ch-svc total"><div><b>Total</b><span>' + (c.sites[0].billing_group ? 'One bill for all' : 'Billed separately') + '</span></div><div class="ch-r"><b>' + money(c.monthly) + '/mo</b></div></div>' : '') +
      '</div></div>' +
      // MIDDLE — one conversation
      '<div class="ch-card ch-stream"><div class="ch-filters">' + sf('all', 'All') + sf('sms', 'Texts') + sf('email', 'Emails') + '</div>' +
      '<div class="ch-thread" id="chThread">' + bubbles + '</div>' +
      '<div class="ch-compose"><div class="ch-sw"><button id="chModeSms" class="on" onclick="NuiClientHub.mode(\'sms\')">Text</button><button id="chModeEmail" onclick="NuiClientHub.mode(\'email\')">Email</button></div>' +
      '<input id="chSubject" class="ch-input ch-subject" placeholder="Subject" style="display:none">' +
      '<textarea id="chMsg" class="ch-input" placeholder="Write a message to ' + esc(c.name.split(' ')[0]) + '…"></textarea>' +
      '<div class="ch-bar"><span id="chFromNote">' + (c.phone ? 'Sends from the NUI business line' : 'Add a phone number to text them') + '</span><button class="ch-btn red" id="chSend" onclick="NuiClientHub.send()">Send</button></div></div>' +
      '</div>' +
      // RIGHT — money · notes · sites
      '<div class="ch-card ch-rail"><div class="ch-rtabs">' + rt('money', 'Money') + rt('notes', 'Notes') + rt('sites', 'Sites') + '</div>' + railBody + '</div>' +
      '</div></div>';
    var th = document.getElementById('chThread');
    if (th) th.scrollTop = th.scrollHeight;
  }

  // ---------- modal ----------
  function modal(title, fields, onSave) {
    var m = document.createElement('div');
    m.className = 'ch-modal';
    m.innerHTML = '<div class="ch-modal-box"><h3>' + esc(title) + '</h3>' +
      fields.map(function (f) {
        return '<label class="ch-field"><span>' + esc(f.label) + '</span><input class="ch-input" id="chf_' + f.key + '" type="' + (f.type || 'text') + '" value="' + esc(f.value) + '" placeholder="' + esc(f.placeholder || '') + '"></label>';
      }).join('') +
      '<div class="ch-modal-acts"><button class="ch-btn" data-x>Cancel</button><button class="ch-btn red" data-save>Save</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.hasAttribute('data-x')) m.remove(); });
    m.querySelector('[data-save]').addEventListener('click', async function () {
      var vals = {};
      fields.forEach(function (f) { vals[f.key] = document.getElementById('chf_' + f.key).value.trim(); });
      this.disabled = true; this.textContent = 'Saving…';
      try { await onSave(vals); m.remove(); }
      catch (e) { this.disabled = false; this.textContent = 'Save'; toast('Not saved: ' + e.message, true); }
    });
    var firstInput = m.querySelector('input'); if (firstInput) firstInput.focus();
  }

  function current() { return state.customers.find(function (c) { return c.key === state.openKey; }); }

  // ---------- public API ----------
  var api = {
    async load(searchTerm) {
      if (typeof searchTerm === 'string') state.search = searchTerm;
      state.openKey = null;
      if (!panel()) return;
      panel().innerHTML = '<div class="ch"><p class="ch-empty">Loading clients…</p></div>';
      try { await loadCustomers(); renderList(); }
      catch (e) { panel().innerHTML = '<div class="ch"><div class="ch-card"><p class="ch-empty">Couldn\'t load clients: ' + esc(e.message) + '</p><button class="ch-btn" onclick="NuiClientHub.load()">Try again</button></div></div>'; }
    },
    setFilter(k) { state.filter = k; renderList(); },
    search(v) {
      state.search = v; renderList();
      var el = document.getElementById('chSearch'); if (el) { el.focus(); el.setSelectionRange(v.length, v.length); }
    },
    open(key) {
      var c = state.customers.find(function (x) { return x.key === key; });
      if (!c) return;
      state.openKey = key; state.streamFilter = 'all'; state.rail = 'money';
      renderRecord(c);
      window.scrollTo(0, 0);
    },
    openAt(i) { var c = state.customers[i]; if (c) api.open(c.key); },
    backToList() { state.openKey = null; renderList(); },
    streamFilter(k) { state.streamFilter = k; paintRecord(current()); },
    rail(k) { state.rail = k; paintRecord(current()); },
    mode(m) {
      var sms = m === 'sms';
      document.getElementById('chModeSms').classList.toggle('on', sms);
      document.getElementById('chModeEmail').classList.toggle('on', !sms);
      document.getElementById('chSubject').style.display = sms ? 'none' : '';
      var c = current();
      document.getElementById('chFromNote').textContent = sms ? (c.phone ? 'Sends from the NUI business line' : 'Add a phone number to text them') : (c.email ? 'Sends from NUI email' : 'Add an email to email them');
      api._mode = m;
    },
    async send() {
      var c = current(); var m = api._mode || 'sms';
      var msg = document.getElementById('chMsg').value.trim();
      if (!msg) return toast('Write a message first', true);
      var to = m === 'sms' ? c.phone : c.email;
      if (!to) return api.editDetails();
      var btn = document.getElementById('chSend'); btn.disabled = true; btn.textContent = 'Sending…';
      try {
        var e164 = digits(to).length === 10 ? '+1' + digits(to) : to;
        var body = m === 'sms' ? { to: e164, message: msg } : { to: to, subject: document.getElementById('chSubject').value.trim() || 'A message from New Urban Influence', text: msg, html: '<p>' + esc(msg).replace(/\n/g, '<br>') + '</p>' };
        var r = await fetch('/.netlify/functions/' + (m === 'sms' ? 'send-sms' : 'send-email'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        var d = await r.json().catch(function () { return {}; });
        if (!r.ok || d.error) throw new Error(d.error || ('HTTP ' + r.status));
        toast(m === 'sms' ? 'Text sent to ' + c.name : 'Email sent to ' + c.name);
        c._stream.unshift({ channel: m, direction: 'outbound', message: msg, subject: body.subject, created_at: new Date().toISOString(), metadata: { to: to } });
        paintRecord(c);
        if (m === 'email') api.mode('email');
      } catch (e) {
        btn.disabled = false; btn.textContent = 'Send';
        toast('Not sent: ' + e.message, true);
      }
    },
    editDetails() {
      var c = current();
      modal('Edit ' + c.name, [
        { key: 'name', label: 'Customer name', value: c.name },
        { key: 'phone', label: 'Phone', value: c.phone || '', type: 'tel', placeholder: '(313) 555-0100' },
        { key: 'email', label: 'Email', value: c.email || '', type: 'email', placeholder: 'name@business.com' }
      ], async function (v) {
        if (!v.name) throw new Error('Name is required');
        await updateSites(c, { client_name: v.name, contact_phone: v.phone || null, contact_email: v.email || null });
        toast('Saved ' + v.name);
        await loadCustomers();
        var again = state.customers.find(function (x) { return x.sites.some(function (s) { return s.id === c.sites[0].id; }); });
        if (again) api.open(again.key); else renderList();
      });
    },
    async saveNotes() {
      var c = current(); var v = document.getElementById('chNotes').value;
      var main = c.sites[0];
      try {
        var r = await db().from('client_sites').update({ notes: v }).eq('id', main.id);
        if (r.error) throw new Error(r.error.message);
        main.notes = v; c.notes = v; toast('Notes saved');
      }
      catch (e) { toast('Not saved: ' + e.message, true); }
    },
    copyPayLink() {
      var c = current();
      (navigator.clipboard ? navigator.clipboard.writeText(c.paymentLink) : Promise.reject()).then(function () { toast('Payment link copied'); }, function () { prompt('Payment link:', c.paymentLink); });
    },
    addClient() {
      modal('Add a client', [
        { key: 'client_name', label: 'Customer name', value: '' },
        { key: 'site_name', label: 'Business or website name', value: '' },
        { key: 'domain', label: 'Website address (optional)', value: '', placeholder: 'business.com' },
        { key: 'contact_phone', label: 'Phone', value: '', type: 'tel' },
        { key: 'contact_email', label: 'Email', value: '', type: 'email' },
        { key: 'monthly_fee', label: 'Monthly price', value: '', type: 'number', placeholder: '150' }
      ], async function (v) {
        if (!v.client_name || !v.site_name) throw new Error('Customer and business name are required');
        var siteId = v.site_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        var row = { site_id: siteId, site_name: v.site_name, client_name: v.client_name, domain: v.domain || null, contact_phone: v.contact_phone || null, contact_email: v.contact_email || null, monthly_fee: v.monthly_fee ? Number(v.monthly_fee) : null, status: 'active', billing_status: 'unbilled' };
        var r = await db().from('client_sites').insert(row);
        if (r.error) throw new Error(r.error.message);
        toast('Added ' + v.client_name);
        await api.load();
      });
    }
  };

  window.NuiClientHub = api;
  // Every existing caller (dashboard cards, router, import flows) lands on the hub.
  window.loadAdminClientsPanel = function (searchTerm) { return api.load(searchTerm); };
})();
