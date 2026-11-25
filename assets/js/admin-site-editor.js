// admin-site-editor.js: back office screen "Edit website".
// Lists the live changes kept in the Supabase table `site_edits` and lets an admin add, edit,
// switch off or delete them. The public site reads that table on every page load
// (assets/js/site-edits.js), so a save here is live with no deploy.
// Reads and writes go through the admin-query function, which checks the back office key.
(function() {
  var SITE = 'newurbaninfluence';
  var PROXY = '/.netlify/functions/admin-query';

  var PAGES = [
    ['*', 'Every page'], ['/', 'Home'], ['/restaurants-bars', 'Restaurants & bars'], ['/websites', 'Websites'],
    ['/how-it-works', 'How it works'], ['/about', 'About'], ['/contact', 'Contact'], ['/print', 'Print']
  ];

  // where: needs a spot on the page.  name: needs a setting name.  code: value is code.
  var ACTIONS = {
    text:   { label: 'Change the words', where: true, valueLabel: 'New words', hint: 'Get the demo' },
    attr:   { label: 'Change a link or setting', where: true, name: 'Setting name', nameHint: 'href', valueLabel: 'New value', hint: '/how-it-works#demo', code: true },
    style:  { label: 'Change a color or size', where: true, name: 'Style name', nameHint: 'background-color', valueLabel: 'New value', hint: '#e63946', code: true },
    html:   { label: 'Replace what is inside it (HTML code)', where: true, valueLabel: 'HTML code', hint: '<h2>New heading</h2>', code: true, big: true },
    after:  { label: 'Add a new block after it (HTML code)', where: true, valueLabel: 'HTML code', hint: '<section>...</section>', code: true, big: true },
    before: { label: 'Add a new block before it (HTML code)', where: true, valueLabel: 'HTML code', hint: '<section>...</section>', code: true, big: true },
    append: { label: 'Add a new block inside it, at the end (HTML code)', where: true, valueLabel: 'HTML code', hint: '<a class="btn" href="/contact">Contact us</a>', code: true, big: true },
    hide:   { label: 'Hide it', where: true },
    css:    { label: 'Add style code (CSS code)', valueLabel: 'CSS code', hint: '.hero h1 { font-size: 64px; }', code: true, big: true }
  };

  var S = { rows: [], page: '/', draft: null, msg: null, askDelete: null, loading: true, win: null };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function root() { return document.getElementById('adminSiteeditorPanel'); }
  function pageName(p) { for (var i = 0; i < PAGES.length; i++) if (PAGES[i][0] === p) return PAGES[i][1]; return p; }

  function ago(iso) {
    var m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
    var h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    var d = Math.round(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
  }

  // One request to Supabase through the back office proxy.
  function call(path, method, body) {
    return window.NuiAdminAuth.adminFetch(PROXY, {
      method: 'POST',
      body: JSON.stringify({ path: path, method: method || 'GET', headers: { Prefer: 'return=representation' }, body: body || null })
    }).then(function(r) {
      return r.text().then(function(t) {
        var data = null; try { data = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) throw new Error((data && (data.message || data.error)) || ('Request failed (' + r.status + ')'));
        return data;
      });
    });
  }

  function load() {
    S.loading = true; render();
    return call('/site_edits?site_id=eq.' + SITE + '&select=*&order=sort.asc').then(function(rows) {
      S.rows = rows || []; S.loading = false; render();
    }).catch(function(e) { S.loading = false; S.msg = { bad: true, text: 'Could not load the changes. ' + e.message }; render(); });
  }

  var CSS = '' +
    '.nse{max-width:980px;color:#fff;font-size:14px;line-height:1.5}' +
    '.nse h2{font-size:26px;font-weight:800;margin:0 0 6px;letter-spacing:-.3px}' +
    '.nse .nse-sub{color:rgba(255,255,255,.78);font-size:14px;margin:0 0 24px;max-width:640px}' +
    '.nse-bar{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:20px}' +
    '.nse-f{display:flex;flex-direction:column;gap:6px;min-width:0}' +
    '.nse-f label{font-size:13px;font-weight:600;color:#fff}' +
    '.nse-f .nse-hint{font-size:13px;color:rgba(255,255,255,.72)}' +
    '.nse input,.nse select,.nse textarea{width:100%;box-sizing:border-box;min-height:44px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.22);background:#141416;color:#fff;font:inherit;font-size:14px}' +
    '.nse textarea{min-height:92px;resize:vertical}' +
    '.nse textarea.nse-big{min-height:220px}' +
    '.nse .nse-code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px}' +
    '.nse input:focus,.nse select:focus,.nse textarea:focus,.nse button:focus-visible{outline:2px solid #ff4d4d;outline-offset:2px}' +
    '.nse-btn{min-height:44px;padding:0 18px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font:inherit;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}' +
    '.nse-btn:hover{border-color:#fff}' +
    '.nse-btn.solid{background:#e11d2a;border-color:#e11d2a}' +
    '.nse-btn.solid:hover{background:#c41622;border-color:#c41622}' +
    '.nse-btn[disabled]{opacity:.6;cursor:default}' +
    '.nse-card{background:#1b1b1e;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:20px;margin-bottom:14px}' +
    '.nse-row{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}' +
    '.nse-row .nse-what{flex:1 1 280px;min-width:0}' +
    '.nse-row .nse-title{font-size:15px;font-weight:600;margin:0 0 4px;overflow-wrap:anywhere}' +
    '.nse-row .nse-meta{font-size:13px;color:rgba(255,255,255,.78);margin:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '.nse-dot{width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block;flex:none}' +
    '.nse-dot.off{background:#9ca3af}' +
    '.nse-acts{display:flex;gap:8px;flex-wrap:wrap}' +
    '.nse-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
    '.nse-grid .wide{grid-column:1/-1}' +
    '.nse-where{display:flex;gap:8px}' +
    '.nse-where input{flex:1 1 auto;min-width:0}' +
    '.nse-msg{display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:10px;margin-bottom:16px;font-size:14px;font-weight:600;background:rgba(52,211,153,.14);border:1px solid rgba(52,211,153,.5);color:#fff}' +
    '.nse-msg.bad{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.6)}' +
    '.nse-empty{text-align:center;padding:36px 20px}' +
    '.nse-empty p{margin:0 0 16px;color:rgba(255,255,255,.85)}' +
    '.nse h3{font-size:18px;font-weight:700;margin:0 0 16px}' +
    '@media(max-width:700px){.nse-grid{grid-template-columns:1fr}.nse-where{flex-direction:column}.nse-bar .nse-f,.nse-bar .nse-btn{flex:1 1 100%;justify-content:center}.nse-acts{width:100%}.nse-acts .nse-btn{flex:1 1 auto;justify-content:center}}';

  var CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  function pageOptions(sel) {
    var seen = {}, out = '';
    PAGES.forEach(function(p) { seen[p[0]] = 1; out += '<option value="' + esc(p[0]) + '"' + (p[0] === sel ? ' selected' : '') + '>' + esc(p[1]) + '</option>'; });
    // Pages that already have changes but are not in the short list.
    S.rows.concat(sel ? [{ page: sel }] : []).forEach(function(r) {
      if (!seen[r.page]) { seen[r.page] = 1; out += '<option value="' + esc(r.page) + '"' + (r.page === sel ? ' selected' : '') + '>' + esc(r.page) + '</option>'; }
    });
    return out + '<option value="__other">Another page...</option>';
  }

  function rowCard(r) {
    var a = ACTIONS[r.action] || { label: r.action };
    var title = r.note || (a.label + (r.selector ? ': ' + r.selector : ''));
    var acts = S.askDelete === r.id
      ? '<span style="align-self:center;font-weight:600">Delete this change?</span>' +
        '<button class="nse-btn solid" data-act="del-yes" data-id="' + r.id + '">Yes, delete</button>' +
        '<button class="nse-btn" data-act="del-no">Keep it</button>'
      : '<button class="nse-btn" data-act="toggle" data-id="' + r.id + '">' + (r.enabled ? 'Turn off' : 'Turn on') + '</button>' +
        '<button class="nse-btn" data-act="edit" data-id="' + r.id + '">Edit</button>' +
        '<button class="nse-btn" data-act="del" data-id="' + r.id + '">Delete</button>';
    return '<div class="nse-card nse-row">' +
      '<div class="nse-what"><p class="nse-title">' + esc(title) + '</p>' +
      '<p class="nse-meta"><span class="nse-dot' + (r.enabled ? '' : ' off') + '"></span>' + (r.enabled ? 'Live' : 'Turned off') +
      '<span>' + esc(a.label) + '</span><span>Changed ' + ago(r.updated_at) + '</span></p></div>' +
      '<div class="nse-acts">' + acts + '</div></div>';
  }

  function form() {
    var d = S.draft, a = ACTIONS[d.action];
    var known = PAGES.some(function(p) { return p[0] === d.page; }) || S.rows.some(function(r) { return r.page === d.page; });
    var h = '<div class="nse-card"><h3>' + (d.id ? 'Edit this change' : 'New change') + '</h3><div class="nse-grid">';
    h += '<div class="nse-f"><label for="nsePage">Page</label><select id="nsePage" data-act="draft-page">' + pageOptions(d.otherPage ? '' : d.page).replace('value="__other"', 'value="__other"' + (d.otherPage ? ' selected' : '')) + '</select>' +
      (d.otherPage || !known ? '<label for="nsePath">Page address</label><input id="nsePath" class="nse-code" value="' + esc(d.page) + '"><span class="nse-hint">Example: /locations/detroit</span>' : '') + '</div>';
    h += '<div class="nse-f"><label for="nseAction">What to change</label><select id="nseAction" data-act="draft-action">' +
      Object.keys(ACTIONS).map(function(k) { return '<option value="' + k + '"' + (k === d.action ? ' selected' : '') + '>' + esc(ACTIONS[k].label) + '</option>'; }).join('') + '</select></div>';
    if (a.where) h += '<div class="nse-f wide"><label for="nseSel">Where on the page</label><div class="nse-where"><input id="nseSel" class="nse-code" value="' + esc(d.selector) + '">' +
      '<button class="nse-btn" data-act="pick">Pick it on the page</button></div><span class="nse-hint">Press "Pick it on the page", then click the thing you want to change. Example: .hero h1</span></div>';
    if (a.name) h += '<div class="nse-f wide"><label for="nseName">' + a.name + '</label><input id="nseName" class="nse-code" value="' + esc(d.name) + '"><span class="nse-hint">Example: ' + esc(a.nameHint) + '</span></div>';
    if (a.valueLabel) h += '<div class="nse-f wide"><label for="nseValue">' + a.valueLabel + '</label><textarea id="nseValue" class="' + (a.code ? 'nse-code ' : '') + (a.big ? 'nse-big' : '') + '" spellcheck="' + (a.code ? 'false' : 'true') + '">' + esc(d.value) + '</textarea>' +
      '<span class="nse-hint">Example: ' + esc(a.hint) + (a.big && d.action !== 'css' ? '. Scripts are removed for safety.' : '') + '</span></div>';
    h += '<div class="nse-f wide"><label for="nseNote">Name for this change</label><input id="nseNote" value="' + esc(d.note) + '"><span class="nse-hint">Example: Holiday banner on the home page</span></div>';
    h += '</div><div class="nse-acts" style="margin-top:20px">' +
      '<button class="nse-btn solid" data-act="save"' + (S.saving ? ' disabled' : '') + '>' + (S.saving ? 'Saving...' : 'Save and go live') + '</button>' +
      '<button class="nse-btn" data-act="try">Try it first</button>' +
      '<button class="nse-btn" data-act="cancel">Cancel</button></div></div>';
    return h;
  }

  function render() {
    var el = root(); if (!el) return;
    if (!document.getElementById('nseStyle')) { var st = document.createElement('style'); st.id = 'nseStyle'; st.textContent = CSS; document.head.appendChild(st); }
    var h = '<div class="nse"><h2>Edit website</h2><p class="nse-sub">Change words, links, colors or code on newurbaninfluence.com. A saved change is live right away. No deploy needed.</p>';
    if (S.msg) h += '<div class="nse-msg' + (S.msg.bad ? ' bad' : '') + '" role="status">' + (S.msg.bad ? '' : CHECK) + '<span>' + esc(S.msg.text) + '</span></div>';
    if (S.draft) { el.innerHTML = h + form() + '</div>'; return; }
    var list = S.rows.filter(function(r) { return r.page === S.page; });
    h += '<div class="nse-bar"><div class="nse-f" style="flex:1 1 240px"><label for="nseView">Page</label><select id="nseView" data-act="view">' + pageOptions(S.page).replace('<option value="__other">Another page...</option>', '') + '</select></div>' +
      '<button class="nse-btn solid" data-act="new">New change</button>' +
      (S.page !== '*' ? '<button class="nse-btn" data-act="open">Open this page</button>' : '') + '</div>';
    if (S.loading) h += '<div class="nse-card nse-empty"><p>Loading the changes...</p></div>';
    else if (!list.length) h += '<div class="nse-card nse-empty"><p>No changes here yet.</p><button class="nse-btn" data-act="new">Add the first change</button></div>';
    else h += '<p class="nse-sub" style="margin-bottom:12px">' + list.length + (list.length === 1 ? ' change' : ' changes') + ' on this page. Last one ' + ago(list.reduce(function(m, r) { return r.updated_at > m ? r.updated_at : m; }, '')) + '.</p>' + list.map(rowCard).join('');
    el.innerHTML = h + '</div>';
  }

  // Copy what is typed in the form back into the draft before the form is redrawn.
  function sync() {
    var d = S.draft; if (!d) return;
    var g = function(id) { var e = document.getElementById(id); return e ? e.value : null; };
    var v;
    if ((v = g('nsePath')) !== null) d.page = v.trim();
    if ((v = g('nseSel')) !== null) d.selector = v.trim();
    if ((v = g('nseName')) !== null) d.name = v.trim();
    if ((v = g('nseValue')) !== null) d.value = v;
    if ((v = g('nseNote')) !== null) d.note = v.trim();
  }

  // Returns a problem in plain words, or '' when the draft is ready to save.
  function problem(d) {
    var a = ACTIONS[d.action];
    if (!d.page || (d.page !== '*' && d.page.charAt(0) !== '/')) return 'Add the page address. It starts with a slash, like /websites.';
    if (a.where) {
      if (!d.selector) return 'Pick where on the page this change goes.';
      try { document.querySelector(d.selector); } catch (e) { return 'The "Where on the page" box is not written correctly. Use "Pick it on the page".'; }
    }
    if (a.name && !d.name) return 'Fill in "' + a.name + '".';
    if (a.valueLabel && !String(d.value || '').trim()) return 'Fill in "' + a.valueLabel + '".';
    return '';
  }

  function record(d) {
    var a = ACTIONS[d.action];
    return { site_id: SITE, page: d.page.replace(/\.html$/, '').replace(/(.)\/$/, '$1'), action: d.action, selector: a.where ? d.selector : null,
      name: a.name ? d.name : null, value: a.valueLabel ? d.value : null, note: d.note || null };
  }

  function save() {
    sync();
    var d = S.draft, bad = problem(d);
    if (bad) { S.msg = { bad: true, text: bad }; render(); return; }
    var rec = record(d); rec.updated_at = new Date().toISOString();
    S.saving = true; S.msg = null; render();
    var req;
    if (d.id) req = call('/site_edits?id=eq.' + d.id, 'PATCH', rec);
    else { rec.enabled = true; rec.sort = S.rows.reduce(function(m, r) { return Math.max(m, r.sort); }, 0) + 10; req = call('/site_edits', 'POST', rec); }
    req.then(function() {
      S.saving = false; S.draft = null; S.page = rec.page;
      S.msg = { text: 'Saved. It is live on the site now.' };
      return load();
    }).catch(function(e) { S.saving = false; S.msg = { bad: true, text: 'Not saved. ' + e.message }; render(); });
  }

  // ---- The page in its own tab: used to pick a spot and to try a change before saving. ----

  function openPage(path, ready) {
    var w = window.open((path === '*' ? '/' : path) + '?edit=' + Date.now(), 'nuiSitePreview');
    if (!w) { S.msg = { bad: true, text: 'The browser blocked the new tab. Allow pop-ups for this site and try again.' }; render(); return; }
    S.win = w;
    var tries = 0, t = setInterval(function() {
      tries++;
      var ok = false; try { ok = w.document.readyState === 'complete' && typeof w.nuiTrySiteEdit === 'function' && /edit=/.test(w.location.search); } catch (e) {}
      if (ok) { clearInterval(t); setTimeout(function() { ready(w); }, 400); }
      else if (tries > 80 || w.closed) clearInterval(t);
    }, 250);
  }

  function banner(w, text) {
    var b = w.document.createElement('div');
    b.textContent = text;
    b.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#111;color:#fff;font:600 15px/1.4 Inter,system-ui,sans-serif;padding:14px 16px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.4)';
    w.document.body.appendChild(b);
    return b;
  }

  // Shortest address for an element: from the nearest id or one-of-a-kind class, else from the body.
  function address(el, doc) {
    var parts = [];
    while (el && el.nodeType === 1 && el !== doc.body) {
      if (el.id && /^[A-Za-z][\w-]*$/.test(el.id) && doc.querySelectorAll('#' + el.id).length === 1) { parts.unshift('#' + el.id); return parts.join(' > '); }
      var cls = [].filter.call(el.classList, function(c) { return /^[A-Za-z][\w-]*$/.test(c); })[0];
      if (cls && doc.querySelectorAll(el.tagName + '.' + cls).length === 1) { parts.unshift(el.tagName.toLowerCase() + '.' + cls); return parts.join(' > '); }
      var tag = el.tagName.toLowerCase(), sibs = [].filter.call(el.parentElement.children, function(c) { return c.tagName === el.tagName; });
      parts.unshift(sibs.length > 1 ? tag + ':nth-of-type(' + (sibs.indexOf(el) + 1) + ')' : tag);
      el = el.parentElement;
    }
    return 'body > ' + parts.join(' > ');
  }

  function pick() {
    sync();
    var d = S.draft;
    if (!d.page || (d.page !== '*' && d.page.charAt(0) !== '/')) { S.msg = { bad: true, text: 'Choose the page first.' }; render(); return; }
    openPage(d.page, function(w) {
      var bar = banner(w, 'Click the thing you want to change.'), last = null;
      function over(e) { if (e.target === bar) return; if (last) last.style.outline = ''; last = e.target; last.style.outline = '3px solid #e11d2a'; }
      function click(e) {
        if (e.target === bar) return;
        e.preventDefault(); e.stopPropagation();
        if (last) last.style.outline = '';
        d.selector = address(e.target, w.document);
        w.close();
        S.msg = { text: 'Got it. Now fill in the change below.' }; render();
      }
      w.document.addEventListener('mouseover', over, true);
      w.document.addEventListener('click', click, true);
    });
  }

  function tryIt() {
    sync();
    var d = S.draft, bad = problem(d);
    if (bad) { S.msg = { bad: true, text: bad }; render(); return; }
    var rec = record(d); rec.id = 'try-' + Date.now();
    openPage(d.page, function(w) { w.nuiTrySiteEdit(rec); banner(w, 'Preview only. This is not saved yet. Close this tab and press "Save and go live".'); });
    S.msg = { text: 'The preview opened in a new tab. Nothing is saved yet.' }; render();
  }

  function onClick(e) {
    var b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT') return;
    var act = b.dataset.act, id = b.dataset.id, row = S.rows.filter(function(r) { return r.id === id; })[0];
    if (act === 'new') { S.msg = null; S.draft = { page: S.page, action: 'text', selector: '', name: '', value: '', note: '' }; render(); }
    else if (act === 'edit') { S.msg = null; S.draft = { id: row.id, page: row.page, action: row.action, selector: row.selector || '', name: row.name || '', value: row.value || '', note: row.note || '' }; render(); }
    else if (act === 'cancel') { S.draft = null; S.msg = null; render(); }
    else if (act === 'save') save();
    else if (act === 'pick') pick();
    else if (act === 'try') tryIt();
    else if (act === 'open') window.open(S.page, '_blank');
    else if (act === 'del') { S.askDelete = id; render(); }
    else if (act === 'del-no') { S.askDelete = null; render(); }
    else if (act === 'del-yes') {
      S.askDelete = null;
      call('/site_edits?id=eq.' + id, 'DELETE').then(function() { S.msg = { text: 'Deleted. It is off the site now.' }; return load(); })
        .catch(function(err) { S.msg = { bad: true, text: 'Not deleted. ' + err.message }; render(); });
    }
    else if (act === 'toggle') {
      call('/site_edits?id=eq.' + id, 'PATCH', { enabled: !row.enabled, updated_at: new Date().toISOString() })
        .then(function() { S.msg = { text: row.enabled ? 'Turned off. The site is back to how it was.' : 'Turned on. It is live on the site now.' }; return load(); })
        .catch(function(err) { S.msg = { bad: true, text: 'Not changed. ' + err.message }; render(); });
    }
  }

  function onChange(e) {
    var act = e.target.dataset.act;
    if (act === 'view') { S.page = e.target.value; S.msg = null; S.askDelete = null; render(); }
    else if (act === 'draft-action') { sync(); S.draft.action = e.target.value; render(); }
    else if (act === 'draft-page') {
      sync();
      if (e.target.value === '__other') { S.draft.otherPage = true; S.draft.page = '/'; }
      else { S.draft.otherPage = false; S.draft.page = e.target.value; }
      render();
    }
  }

  window.loadAdminSiteeditorPanel = function() {
    var el = root(); if (!el) return;
    if (!el.dataset.nseReady) { el.dataset.nseReady = '1'; el.addEventListener('click', onClick); el.addEventListener('change', onChange); }
    S.draft = null; S.msg = null; S.askDelete = null;
    load();
  };
})();
