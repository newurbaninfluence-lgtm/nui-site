// Live site changes without a deploy.
// Reads rows from the Supabase table `site_edits` (site_id = newurbaninfluence) and applies them in the browser:
//   text   set an element's wording            html    set an element's inner HTML
//   attr   set an attribute (name = "href"...)  style   set a CSS property or variable (name = "--nh-red"...)
//   css    add a block of CSS (no selector)     hide    hide an element
//   before / after / append   add new HTML (a button, a section) next to or inside an element
// `page` is a path like "/websites", or "*" for every page. Rows are written with the service key only.
(function() {
  var SITE = 'newurbaninfluence', KEY = 'nui_site_edits';
  var URL_ = 'https://jcgvkyizoimwbolhfpta.supabase.co/rest/v1/site_edits?site_id=eq.' + SITE + '&enabled=is.true&select=id,page,selector,action,name,value&order=sort.asc';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ3ZreWl6b2ltd2JvbGhmcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDMwMjQsImV4cCI6MjA4NTg3OTAyNH0.a8gjkPoUHQ1kgROa2Lqaq3252opqg5CPMm6vR3t1NOk';
  var rules = [];

  function path() { var p = location.pathname.replace(/\.html$/, '').replace(/\/$/, ''); return p === '/index' || p === '' ? '/' : p; }

  // Added HTML never runs scripts: script tags and on* handlers are stripped.
  function safe(html) {
    var t = document.createElement('template'); t.innerHTML = html || '';
    t.content.querySelectorAll('script,iframe,object,embed').forEach(function(n) { n.remove(); });
    t.content.querySelectorAll('*').forEach(function(n) {
      [].slice.call(n.attributes).forEach(function(a) { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); });
    });
    return t;
  }

  function apply() {
    var here = path();
    rules.forEach(function(r) {
      if (r.page !== '*' && r.page !== here) return;
      if (r.action === 'css') {
        var id = 'se-' + r.id;
        if (!document.getElementById(id)) { var s = document.createElement('style'); s.id = id; s.textContent = r.value || ''; document.head.appendChild(s); }
        return;
      }
      var els; try { els = document.querySelectorAll(r.selector); } catch (e) { return; }
      els.forEach(function(el) {
        var mark = 'se' + r.id.replace(/-/g, '');
        if (el.dataset[mark]) return;          // already applied to this element
        el.dataset[mark] = '1';
        if (r.action === 'text') el.textContent = r.value || '';
        else if (r.action === 'html') { el.innerHTML = ''; el.appendChild(safe(r.value).content); }
        else if (r.action === 'attr' && r.name && !/^on/i.test(r.name)) el.setAttribute(r.name, r.value || '');
        else if (r.action === 'style' && r.name) el.style.setProperty(r.name, r.value || '');
        else if (r.action === 'hide') el.hidden = true;
        else if (r.action === 'before') el.before(safe(r.value).content);
        else if (r.action === 'after') el.after(safe(r.value).content);
        else if (r.action === 'append') el.appendChild(safe(r.value).content);
      });
    });
  }

  function start(list) { rules = list || []; if (!rules.length) return; apply(); }

  // Last known changes apply right away; fresh ones replace them as soon as they load.
  try { start(JSON.parse(sessionStorage.getItem(KEY) || '[]')); } catch (e) {}
  document.addEventListener('DOMContentLoaded', apply);

  // The homepage draws itself after load and when switching views, so re-apply when the page changes.
  var t; new MutationObserver(function() { clearTimeout(t); t = setTimeout(apply, 60); }).observe(document.documentElement, { childList: true, subtree: true });

  fetch(URL_, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } })
    .then(function(r) { return r.ok ? r.json() : []; })
    .then(function(list) { try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} start(list); })
    .catch(function() {});
})();
