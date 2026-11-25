// Homepage: industry picker, laptop + phone screens, and the 3-step free audit.
// Markup comes from loadHomeView() in marketing.js; the audit sheet lives in index.html (#nuiAuditRoot).

var NUI_IND = {
 food:{sync:'Union POS · synced 2 min ago',line:'Plugs into your register. Sales, voids and tips flow in on their own, no double entry. Union today, with Clover and Square next.',lt:"Tonight's bookings",list:[['Party of 6, birthday','8:30 pm · booth 4','Deposit paid'],['Party of 10, team dinner','9:15 pm · back room','Waiting on deposit'],['Jordan + 3, rewards member','9:45 pm · patio','Confirmed']],name:'Corner Kitchen',who:'Dana',phone:'phone-restaurant',side:['Today','Bookings','Guests & rewards','Staff schedule','Payroll','Bar stock','Kitchen & recipes','Promoters','Text campaigns','Reviews','Bills','Reports'],
  flag:'2 things need attention today. Start at the top.',rep:'Friday brought in <b>$8,420</b>, up 12% on last Friday. The bar ran clean: voids were 2.1%, under the 3% goal. One thing to fix: two bartenders stayed on the clock 70 minutes after the last sale, about $48 in pay with nothing to sell.',
  k:[['Sales, last 7 nights','$41,380','up 9% on the week before'],['Voids','2.1%','aim under 3%','g'],['Pour cost','24%','aim 18 to 22%','w'],['Labor','27%','aim 25 to 30% of sales','g'],['Bookings this week','64','11 tonight, 3 birthdays'],['Guests coming back','41%','up from 29% in March']],
  rows:[['r','Deposit missing: party of 10, Saturday 9:15 pm','Send reminder'],['w',"Tito's is low: 2 bottles left, order by Thursday",'Add to order']],
  p:[['Bartender called out','Shift covered by Jay in 4 min'],['3 bottles not rung up','Last night · about $64 in drinks'],['Synced with Union POS',"Friday's sales, voids and tips"]]},
 photo:{sync:'Stripe · synced just now',line:'Clients book, sign and pay online. Galleries go out on time, and late ones get flagged.',lt:'Coming up',list:[['Mia, headshots','Delivered late · day 4','Send now'],['Carter family','Sat 10 am · park','Deposit paid'],['Ray, brand shoot','Thu 2 pm · studio','Contract signed']],name:'Studio 313',who:'AJ',phone:'phone-photographer',side:['Today','Sessions','Clients','Galleries','Invoices','Contracts','Calendar','Packages','Text campaigns','Reviews','Reports'],
  flag:'1 gallery is late. Start at the top.',rep:"Tuesday you shot <b>3 sessions</b> and delivered 2 galleries. Mia's headshots are one day past your 72-hour promise, so send those first. Two clients opened their invoice but haven't paid yet.",
  k:[['Paid this month','$6,840','up 18% on last month'],['Sessions booked','23','5 this week'],['Galleries waiting','4','1 past the 72-hour promise','w'],['Unpaid invoices','$1,150','2 clients, sent Monday','w'],['Clients rebooking','38%','up from 22% last spring'],['Average order','$297','up $41 with add-ons']],
  rows:[['r',"Mia's headshots: 1 day late",'Deliver now'],['w','2 invoices opened, not paid','Send reminder']],
  p:[['Session booked','Family portraits · $350'],['Gallery downloaded','Tasha picked 14 photos'],['Invoice paid','$600 · just now']]},
 night:{sync:'Stripe · ticket sales live',line:"Sell tickets and booths, track every promoter's guests and pay them from one screen.",lt:'Saturday',list:[["Booth 3, Ty's party",'Sat · 8 guests','Deposit paid'],['Booth 7','Sat · 6 guests','No deposit'],["Jay's guest list",'Sat · 31 names','Checked in 0']],name:'Night Owl Events',who:'Shane',phone:'phone-nightlife',side:['Tonight','Parties','Booths','Guest list','Promoters','Tickets','Payouts','Flyers','Text blasts','Reports'],
  flag:'2 booths still unpaid for Saturday.',rep:"Friday's party sold <b>142 tickets</b> and 9 booths. Your top promoter brought 86 people. 2 booths for Saturday are held with no deposit, so release them by Thursday if they don't pay.",
  k:[['Ticket and booth sales','$12,460','last 3 parties'],['Booth deposits','$3,200','9 of 11 booths paid','g'],['Guest list','410','for Saturday'],['Top promoter','86','people brought Friday'],['Text blast','52','tickets from one message'],['Repeat guests','33%','came to 2+ parties']],
  rows:[['r','Booths 7 and 9: no deposit','Send reminder'],['w','Flyer for Dec 13 not approved','Review flyer']],
  p:[['Booth 3 booked','$400 deposit · just now'],['Promoter link used','Jay brought 12 guests'],['Ticket sold','2 general admission']]},
 author:{sync:'Shop · synced 5 min ago',line:'Sell signed books, take speaking requests and grow your reader list in one place.',lt:'This week',list:[['Southfield church','Speaking, March','Quote needed'],['Book club, Detroit','Reading, Jan 12','Confirmed'],['Order #1182','2 signed copies','Shipped']],name:'Speak & Write',who:'Sonya',phone:'phone-author',side:['Today','Books','Orders','Speaking','Events','Email list','Media kit','Reviews','Reports'],
  flag:'1 speaking request needs an answer.',rep:'This week you sold <b>64 books</b>, most from your newsletter link. A church in Southfield asked you to speak in March and is waiting on a quote.',
  k:[['Book sales this month','$1,920','64 books'],['Speaking booked','$4,500','2 talks this quarter'],['Requests waiting','1','asked 2 days ago','w'],['Email list','1,820','up 140 this month'],['Newsletter opens','48%','strong for authors','g'],['Readers buying again','21%','bought a 2nd book']],
  rows:[['r','Speaking request: March, Southfield','Send quote'],['w','Signed copies running low','Order more']],
  p:[['Book order','2 signed copies · $48'],['Speaking request',"Women's conference, April"],['New subscriber','from your reading guide']]},
 beauty:{sync:'Store · synced just now',line:'Orders, stock, rewards and cart reminders, so buyers come back for their next install.',lt:'Latest orders',list:[['Order #4471','3 bundles + closure','Paid'],['Cart left, $140','Dani, 18" straight','Reminder sent'],['Wholesale, Glam Bar','24 bundles','Invoice sent']],name:'Crown Hair Co.',who:'Malcolm',phone:'phone-beauty',side:['Today','Orders','Products','Customers','Rewards','Wholesale','Abandoned carts','Text campaigns','Reviews','Reports'],
  flag:'22 carts were left this week.',rep:'This week brought in <b>$9,940</b> from 118 orders. 22 people left items in their cart worth $1,460. A reminder text usually brings back about a third of them.',
  k:[['Sales this week','$9,940','118 orders'],['Left in carts','$1,460','22 shoppers','w'],['Repeat buyers','34%','up from 26%'],['Average order','$84','up $9 with closures'],['Best seller','18" straight','41 sold'],['Reviews','4.9','from 212 buyers','g']],
  rows:[['w','22 abandoned carts, $1,460','Send reminder'],['r','18" straight: 6 left','Reorder']],
  p:[['Order paid','3 bundles + closure · $286'],['Cart recovered','$140 after a reminder text'],['New 5-star review','"Best hair I\'ve bought"']]}
};

function _nhDash(d) {
  var side = d.side.map(function(s, i) { return '<span' + (i ? '' : ' class="on"') + '>' + s.replace('&', '&amp;') + '</span>'; }).join('');
  var kpis = d.k.map(function(k) {
    return '<div class="kpi"><small>' + (k[3] ? '<i class="dot ' + (k[3] === 'w' ? 'w' : '') + '"></i>' : '') + k[0] + '</small><strong>' + k[1] + '</strong><em' + (k[3] === 'w' ? ' class="y"' : '') + '>' + k[2] + '</em></div>';
  }).join('');
  var needs = d.rows.map(function(r) { return '<div class="row"><span><i class="dot ' + r[0] + '"></i>' + r[1] + '</span><span class="act">' + r[2] + '</span></div>'; }).join('');
  var list = d.list.map(function(r) { return '<div class="row"><span><b>' + r[0] + '</b><br>' + r[1] + '</span><span class="st">' + r[2] + '</span></div>'; }).join('');
  return '<div class="app"><div class="side"><b>' + d.name + '</b>' + side + '</div><div class="main"><div class="mh"><h4>Good evening, ' + d.who + '</h4><span class="sync"><i class="dot"></i>' + d.sync + '</span></div><p class="greet">' + d.flag + '</p><div class="report"><small>Yesterday, in plain words</small><p>' + d.rep + '</p></div><div class="kpis">' + kpis + '</div><div class="two"><div class="rows"><div class="row hd"><span>Needs you</span></div>' + needs + '</div><div class="rows"><div class="row hd"><span>' + d.lt + '</span></div>' + list + '</div></div></div></div>';
}

function _nhFit() {
  var sc = document.getElementById('lapScreen'), a = sc && sc.querySelector('.app');
  if (a) a.style.zoom = sc.clientWidth / 732;
}

function _nhShow(key) {
  var d = NUI_IND[key], phone = document.getElementById('phoneScr'), lap = document.getElementById('lapScreen');
  if (!d || !phone || !lap) return;
  [phone, lap.querySelector('.app')].forEach(function(e) { if (e) e.classList.add('fade'); });
  setTimeout(function() {
    lap.innerHTML = _nhDash(d); _nhFit();
    phone.style.backgroundImage = 'url(/assets/img/home/' + d.phone + '.webp)';
    d.p.forEach(function(p, i) {
      var el = document.getElementById('ping' + (i + 1));
      if (el) { el.querySelector('b').textContent = p[0]; el.querySelector('span').textContent = p[1]; }
    });
    document.getElementById('pickLine').textContent = d.line;
    phone.classList.remove('fade');
  }, 200);
  document.querySelectorAll('#homeView .pick button').forEach(function(b) { b.setAttribute('aria-selected', b.dataset.k === key); });
}

// ---------- Free audit: one sheet, three short steps ----------
var NUI_AUDIT = { step: 1, biz: '', leaks: [], name: '', phone: '', company: '', sending: false };
var NUI_AUDIT_BIZ = ['Restaurant or bar', 'Photographer', 'Nightlife or promoter', 'Author or speaker', 'Hair or beauty brand', 'Something else'];
var NUI_AUDIT_LEAK = ["People look, but don't buy", "Customers don't come back", 'Costs are eating my profit', "Too many apps, nothing connects", "Not sure, that's why I'm here"];
var NUI_PICK_TO_BIZ = { food: 0, photo: 1, night: 2, author: 3, beauty: 4 };

function _nhEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function _nhAudit() {
  var A = NUI_AUDIT, el = document.getElementById('sheet');
  var dots = '<div class="steps"><span class="steps-txt">Step ' + Math.min(A.step, 3) + ' of 3</span>' + [1, 2, 3].map(function(i) { return '<i aria-hidden="true" class="' + (i <= A.step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
  var top = '<div class="sheet-top">' + (A.step < 4 ? dots : '<span></span>') + '<button type="button" class="x" aria-label="Close" data-close>&times;</button></div>';
  var body = '';
  if (A.step === 1) body = '<h3 id="auditTitle">What kind of business?</h3><p class="hint">Tap one.</p><div class="opts">' + NUI_AUDIT_BIZ.map(function(b) { return '<button type="button" class="opt" aria-pressed="' + (A.biz === b) + '" data-biz="' + _nhEsc(b) + '">' + b + '</button>'; }).join('') + '</div><p class="err" id="aErr"></p><div class="sheet-bot"><span></span><button type="button" class="go" data-next>Next</button></div>';
  if (A.step === 2) body = '<h3 id="auditTitle">Where do you think money is slipping?</h3><p class="hint">Tap any that sound like you.</p><div class="opts">' + NUI_AUDIT_LEAK.map(function(b) { return '<button type="button" class="opt" aria-pressed="' + (A.leaks.indexOf(b) > -1) + '" data-leak="' + _nhEsc(b) + '">' + b + '</button>'; }).join('') + '</div><p class="err" id="aErr"></p><div class="sheet-bot"><button type="button" class="back" data-back>Back</button><button type="button" class="go" data-next>Next</button></div>';
  if (A.step === 3) body = '<h3 id="auditTitle">Where should we reach you?</h3><p class="hint">We\'ll text you to pick a time. The audit takes about 30 minutes and it\'s free.</p>'
    + '<div class="fld"><label for="aName">Your name</label><input id="aName" autocomplete="name" placeholder="e.g. Dana Brooks" value="' + _nhEsc(A.name) + '"></div>'
    + '<div class="fld"><label for="aPhone">Mobile number</label><input id="aPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. (313) 555-0142" value="' + _nhEsc(A.phone) + '"></div>'
    + '<div class="fld"><label for="aCo">Business name</label><input id="aCo" autocomplete="organization" placeholder="e.g. Corner Kitchen" value="' + _nhEsc(A.company) + '"></div>'
    + '<p class="err" id="aErr"></p><div class="sheet-bot"><button type="button" class="back" data-back>Back</button><button type="button" class="go" data-send' + (A.sending ? ' disabled' : '') + '>' + (A.sending ? 'Booking...' : 'Book my free audit') + '</button></div>';
  if (A.step === 4) body = '<div class="done"><div class="ok"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div><h3 id="auditTitle">You\'re booked in, ' + _nhEsc(A.name.split(' ')[0]) + '.</h3><p>We\'ll text you within one business day to pick a time. Come with your questions. You\'ll leave knowing where your money is going.</p><p>Rather talk now? Call us:</p><div class="phone-num">(248) 487-8747</div></div><div class="sheet-bot"><button type="button" class="go" data-close>Done</button></div>';
  el.innerHTML = top + body;
}

function nuiOpenAudit() {
  var A = NUI_AUDIT, sel = document.querySelector('#homeView .pick button[aria-selected=true]');
  var k = sel && sel.dataset.k;
  if (A.step === 4) { A.step = 1; A.leaks = []; }
  if (!A.biz && k && NUI_PICK_TO_BIZ[k] != null) A.biz = NUI_AUDIT_BIZ[NUI_PICK_TO_BIZ[k]];
  if (A.step > 3) A.step = 1;
  _nhAudit();
  document.getElementById('audit').hidden = false;
  var f = document.querySelector('#sheet .opt,#sheet .go'); if (f) f.focus();
}

async function _nhSendAudit() {
  var A = NUI_AUDIT, err = function(m) { var x = document.getElementById('aErr'); if (x) x.textContent = m; };
  A.name = document.getElementById('aName').value.trim();
  A.phone = document.getElementById('aPhone').value.trim();
  A.company = document.getElementById('aCo').value.trim();
  if (!A.name) return err('Add your name so we know who to ask for.');
  if (A.phone.replace(/\D/g, '').length < 10) return err('Add a 10-digit mobile number so we can text you.');
  if (!A.company) return err('Add your business name.');
  A.sending = true; _nhAudit();
  try {
    var r = await fetch('/.netlify/functions/submit-lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: A.name, phone: A.phone, business: A.company, service: 'free-audit', serviceName: 'Free audit · ' + A.biz, businessType: A.biz, leaks: A.leaks, bookingChoice: 'call', source: 'homepage-audit' })
    });
    if (!r.ok) throw new Error('status ' + r.status);
    A.sending = false; A.step = 4; _nhAudit();
  } catch (e) {
    A.sending = false; _nhAudit();
    err("That didn't go through. Try again, or call (248) 487-8747.");
  }
}

function _nhAuditClick(e) {
  var A = NUI_AUDIT, t = e.target.closest('button'), root = document.getElementById('audit');
  if (e.target === root || (t && t.hasAttribute('data-close'))) { root.hidden = true; return; }
  if (!t || A.sending) return;
  var err = function(m) { var x = document.getElementById('aErr'); if (x) x.textContent = m; };
  if (t.dataset.biz) { A.biz = t.dataset.biz; _nhAudit(); return; }
  if (t.dataset.leak) { var v = t.dataset.leak; A.leaks = A.leaks.indexOf(v) > -1 ? A.leaks.filter(function(x) { return x !== v; }) : A.leaks.concat(v); _nhAudit(); return; }
  if (t.hasAttribute('data-back')) { A.step--; _nhAudit(); return; }
  if (t.hasAttribute('data-next')) {
    if (A.step === 1 && !A.biz) return err('Pick the one closest to your business.');
    if (A.step === 2 && !A.leaks.length) return err('Pick at least one. "Not sure" counts.');
    A.step++; _nhAudit(); return;
  }
  if (t.hasAttribute('data-send')) _nhSendAudit();
}

// Page-wide listeners: added once, they look up the current homepage elements each time.
(function() {
  var root = document.getElementById('audit');
  if (root) root.addEventListener('click', _nhAuditClick);
  addEventListener('keydown', function(e) { if (e.key === 'Escape' && root) root.hidden = true; });
  addEventListener('resize', _nhFit);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer:fine)').matches) {
    addEventListener('mousemove', function(e) {
      var rig = document.getElementById('rig'); if (!rig) return;
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      rig.style.transform = 'rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
  }
})();

// Called by loadHomeView() after the markup is in place.
function initHome() {
  document.querySelectorAll('#homeView .pick button').forEach(function(b) {
    b.addEventListener('click', function() { _nhShow(b.dataset.k); b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); });
  });
  document.querySelectorAll('#homeView [data-audit]').forEach(function(b) { b.addEventListener('click', nuiOpenAudit); });
  var params = new URLSearchParams(location.search), q = params.get('k');
  _nhShow(q && NUI_IND[q] ? q : 'food');
  // Other pages' "Book free audit" buttons link to /?audit=1
  if (params.get('audit') === '1') setTimeout(nuiOpenAudit, 300);
}
