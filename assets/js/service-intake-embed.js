// service-intake-embed.js
// Standalone multi-step intake form for NUI service pages
// Injects a full-screen overlay intake wizard triggered by any btn with data-intake
// Usage: <button data-intake="brand-kit" data-price="1500" data-label="Brand Kit">Get Started</button>

(function(){
'use strict';

// ─── SALES COPY PER SERVICE ─────────────────────────────────────────────────
var COPY = {
  'brand-kit':        { hook:'Stop losing customers to competitors with better branding.', problem:'Right now, potential customers are scrolling past your business because your brand looks DIY. They\'re choosing competitors who look more established — even if your product is better.', agitate:'Every day without professional branding costs you sales. People judge in 0.05 seconds. A weak brand = weak trust = lost revenue.', solution:'Get a complete brand identity that makes you look like the premium choice. Logo, colors, voice, social presence — everything you need to command higher prices and close more deals.', proof:'50+ Detroit businesses transformed. Average client sees 3x more engagement within 30 days.' },
  'service-brand':    { hook:'Charge more. Win more. Look like the obvious choice.', problem:'You\'re competing on price because your brand doesn\'t communicate value. Prospects haggle with you while paying premium prices to competitors with better presentation.', agitate:'Every proposal you send with a generic logo screams "small operation." And small operations get small budgets.', solution:'Get the brand presence that commands premium pricing — banners, business cards, uniforms, collateral, website. Look like the company that charges 2x more.', proof:'Service businesses we brand report 40% higher close rates on proposals.' },
  'product-brand':    { hook:'Your product deserves packaging that sells itself.', problem:'Great products fail every day because they look like every other option on the shelf. Customers can\'t tell you\'re different if you look the same.', agitate:'You\'re spending money on ads to drive people to products with forgettable packaging. That\'s like paying for a first date and showing up in pajamas.', solution:'Get packaging and branding that stops the scroll, wins the shelf, and turns browsers into buyers. Labels to social content — we build brands that print money.', proof:'Our product brands average 340% increase in online sales within 90 days.' },
  'digital-hq':       { hook:'Your website is either making you money or costing you money.', problem:'Your current site is a digital brochure that does nothing. Visitors come, see nothing compelling, and leave. No calls. No sales. Just a monthly hosting bill.', agitate:'You\'re paying for ads that send traffic to a website that doesn\'t convert. That\'s literally paying to lose customers.', solution:'Get a Digital HQ built to convert visitors into customers 24/7 — strategic design, lead capture, booking, CRM, and AI staff all connected.', proof:'Average client sees 280% increase in website inquiries within 60 days.' },
  'digital-staff':    { hook:'Stop working in your business. Let AI work for you.', problem:'You\'re losing leads overnight while you sleep. A customer calls, hits voicemail, calls your competitor. They\'re not loyal to you yet — they go to whoever picks up.', agitate:'Every missed call, every slow follow-up, every manual task is money your business is bleeding. Your competitors are already automating this.', solution:'Get an AI team that answers calls 24/7, follows up on every lead within 5 minutes, and writes personalized emails in your brand voice. Never lose another lead to a slow response.', proof:'Our AI clients save 15+ hours/week and see 3x faster lead response times within 30 days.' },
  'street-team':      { hook:'Your brand is invisible where your customers are making buying decisions.', problem:'Social media platforms block your ads, your audience is rented not owned, and your competitor\'s content is everywhere while yours is nowhere.', agitate:'Every day you\'re not putting your brand in front of your ideal customer is a day they\'re seeing your competitor instead.', solution:'Get a Digital Street Team — AI creates your content, sends digital flyers and text blasts to opted-in phones, geofences your competitor\'s locations, and dominates Google Maps in every zip code you serve.', proof:'Street Team clients see 4x increase in local visibility and 60% more inbound inquiries within 90 days.' },
  'publicist':        { hook:'You\'re losing jobs to businesses that look more credible.', problem:'Not because they\'re better. Because they have a press feature, a case study, or a publication backing them up — and you only have your own word.', agitate:'For high-ticket services, the buying decision happens before the first call. Credibility signals shape that decision before you have a chance to make your case.', solution:'Get professionally written and published in NUI Magazine. A permanent URL, "As Featured In" badge, and editorial profile that closes deals before you pick up the phone.', proof:'Featured businesses report 40% higher close rates on proposals and estimates.' },
  'event-team':       { hook:'You\'re meeting hundreds of people. Leaving with none of them.', problem:'Every vendor show, every pop-up, every market day — hundreds of people see your product and walk away. Most of them will never find you again.', agitate:'You spend money on the table, the tent, the product, the event fee. People stop. They look. They tell you they love it. Then they leave with no way for you to reach them again.', solution:'Deploy The Event Team — photographer, digital sign-in, instant photo delivery via SMS with your store link, and a push notification opt-in gate. Every person who stops leaves as a verified, opted-in lead.', proof:'ATD vendors using the Event Team capture 100+ verified leads per event and convert 20-30% within 30 days.' },
  'default':          { hook:'Ready to grow your business?', problem:'Every day you wait is a day your competitor gets ahead.', agitate:'The businesses winning right now built their systems early. The best time to start was a year ago. The second best time is today.', solution:'Let\'s build the system that keeps your business running and growing — even when you\'re not working.', proof:'50+ Detroit businesses built. Average client ROI: 5x within 12 months.' }
};

// ─── STEPS PER SERVICE ───────────────────────────────────────────────────────
var STEPS = {
  'brand-kit':     ['Contact Info','Your Background','Brand Vision','Preferences','Review & Book'],
  'service-brand': ['Contact Info','Your Background','Brand Vision','Preferences','Review & Book'],
  'product-brand': ['Contact Info','Your Background','Brand Vision','Preferences','Review & Book'],
  'digital-hq':    ['Contact Info','Your Business','Goals & Features','Tech & Timeline','Review & Book'],
  'digital-staff': ['Contact Info','Your Business','Current Situation','AI Preferences','Review & Book'],
  'street-team':   ['Contact Info','Your Business','Visibility Goals','Content & Budget','Review & Book'],
  'publicist':     ['Contact Info','Your Story','Audience & Goals','Package','Review & Book'],
  'event-team':    ['Contact Info','Your Business','Event Details','Lead Goals','Review & Book'],
  'default':       ['Contact Info','Your Business','Goals','Details','Review & Book']
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
var style = document.createElement('style');
style.textContent = `
#nui-intake-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;overflow-y:auto;display:none;-webkit-font-smoothing:antialiased;}
#nui-intake-overlay.open{display:flex;align-items:flex-start;justify-content:center;padding:24px 16px 48px;}
.nui-intake-wrap{width:100%;max-width:720px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);margin-top:24px;}
.nui-intake-close{position:fixed;top:20px;right:20px;width:40px;height:40px;background:rgba(255,255,255,0.08);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10000;}
.nui-intake-close:hover{background:rgba(255,255,255,0.15);}
/* SALES PANEL */
.nui-sales{padding:40px 40px 32px;border-bottom:1px solid rgba(255,255,255,0.08);}
.nui-badge{display:inline-block;background:#D90429;color:#fff;font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;margin-bottom:20px;}
.nui-svc-name{font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,44px);font-weight:800;text-transform:uppercase;color:#fff;margin-bottom:4px;line-height:1;}
.nui-svc-price{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#D90429;margin-bottom:24px;}
.nui-copy-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:28px 32px;margin-bottom:20px;}
.nui-copy-hook{font-size:18px;font-weight:700;color:#fff;line-height:1.4;margin-bottom:12px;}
.nui-copy-body{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.75;margin-bottom:12px;}
.nui-copy-solution{font-size:14px;color:rgba(255,255,255,0.7);line-height:1.75;margin-bottom:12px;}
.nui-copy-solution strong{color:#D90429;}
.nui-copy-proof{font-size:13px;color:#D90429;font-weight:600;display:flex;gap:10px;align-items:flex-start;}
.nui-trust{display:flex;gap:20px;flex-wrap:wrap;margin-top:0;}
.nui-trust-item{font-size:12px;color:rgba(255,255,255,0.45);display:flex;align-items:center;gap:6px;}
.nui-trust-item::before{content:'✓';color:#D90429;font-weight:700;}
/* STEPS */
.nui-steps-bar{padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.06);background:#050505;}
.nui-steps-row{display:flex;align-items:center;gap:0;}
.nui-step-item{display:flex;flex-direction:column;align-items:center;flex:1;position:relative;}
.nui-step-item:not(:last-child)::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:1px;background:rgba(255,255,255,0.1);}
.nui-step-item.done::after{background:#D90429;}
.nui-step-num{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:11px;font-weight:800;color:rgba(255,255,255,0.4);position:relative;z-index:1;margin-bottom:6px;transition:all .25s;}
.nui-step-item.active .nui-step-num{background:#D90429;border-color:#D90429;color:#fff;}
.nui-step-item.done .nui-step-num{background:#D90429;border-color:#D90429;color:#fff;font-size:14px;}
.nui-step-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.25);text-align:center;}
.nui-step-item.active .nui-step-lbl{color:#fff;}
/* PANELS */
.nui-panel{display:none;padding:36px 40px 24px;}
.nui-panel.active{display:block;}
.nui-panel-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;color:#fff;margin-bottom:4px;}
.nui-panel-sub{font-size:13px;color:rgba(255,255,255,0.35);margin-bottom:28px;letter-spacing:.5px;}
/* FIELDS */
.nui-field{margin-bottom:20px;}
.nui-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:8px;display:block;}
.nui-label .req{color:#D90429;}
.nui-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:'Inter',sans-serif;font-size:14px;padding:14px 16px;outline:none;transition:border-color .2s;}
.nui-input:focus{border-color:rgba(255,255,255,0.3);}
.nui-input::placeholder{color:rgba(255,255,255,0.2);}
.nui-textarea{resize:vertical;min-height:88px;}
.nui-select option{background:#111;}
.nui-radio-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.nui-radio-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:16px;cursor:pointer;transition:all .2s;position:relative;}
.nui-radio-card.selected{background:rgba(217,4,41,0.1);border-color:#D90429;}
.nui-radio-card h5{font-family:'Syne',sans-serif;font-size:12px;font-weight:800;text-transform:uppercase;color:#fff;margin-bottom:4px;}
.nui-radio-card p{font-size:12px;color:rgba(255,255,255,0.45);line-height:1.5;}
.nui-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
/* BUTTONS */
.nui-btn-row{display:flex;gap:12px;padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);margin-top:8px;}
.nui-btn{font-family:'Syne',sans-serif;font-weight:800;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;border:none;cursor:pointer;flex:1;transition:all .2s;}
.nui-btn-back{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);}
.nui-btn-back:hover{background:rgba(255,255,255,0.1);}
.nui-btn-next{background:#D90429;color:#fff;}
.nui-btn-next:hover{background:#b5001f;}
/* REVIEW PANEL */
.nui-review-summary{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:24px;margin-bottom:24px;}
.nui-review-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;}
.nui-review-row:last-child{border-bottom:none;}
.nui-review-key{color:rgba(255,255,255,0.4);}
.nui-review-val{color:#fff;font-weight:600;text-align:right;max-width:60%;}
.nui-book-opts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;}
.nui-book-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);padding:24px;text-align:center;cursor:pointer;transition:all .25s;}
.nui-book-card:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.25);}
.nui-book-card.selected{background:rgba(217,4,41,0.1);border-color:#D90429;}
.nui-book-icon{font-size:28px;margin-bottom:10px;}
.nui-book-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;text-transform:uppercase;color:#fff;margin-bottom:4px;}
.nui-book-desc{font-size:12px;color:rgba(255,255,255,0.4);line-height:1.5;}
/* SUCCESS */
.nui-success{padding:60px 40px;text-align:center;}
.nui-success h3{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;text-transform:uppercase;color:#fff;margin-bottom:12px;}
.nui-success p{font-size:15px;color:rgba(255,255,255,0.55);margin-bottom:28px;line-height:1.75;}
.nui-success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
@media(max-width:600px){
  .nui-sales,.nui-panel,.nui-btn-row{padding-left:24px;padding-right:24px;}
  .nui-steps-bar{padding:20px 16px;}
  .nui-step-lbl{display:none;}
  .nui-field-row,.nui-radio-grid,.nui-book-opts{grid-template-columns:1fr;}
}`;
document.head.appendChild(style);

// ─── STATE ───────────────────────────────────────────────────────────────────
var state = { serviceId:'', serviceName:'', price:'', label:'', step:1, totalSteps:5, data:{}, bookingChoice:'' };

// ─── BUILD OVERLAY ───────────────────────────────────────────────────────────
var overlay = document.createElement('div');
overlay.id = 'nui-intake-overlay';
overlay.innerHTML = '<button class="nui-intake-close" id="nui-close">✕</button><div class="nui-intake-wrap" id="nui-wrap"></div>';
document.body.appendChild(overlay);

document.getElementById('nui-close').onclick = function(){ overlay.classList.remove('open'); };
overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.classList.remove('open'); });

// ─── OPEN ─────────────────────────────────────────────────────────────────────
window.openNuiIntake = function(serviceId, price, label) {
  state.serviceId = serviceId;
  state.price = price;
  state.label = label || serviceId;
  state.step = 1;
  state.data = { optinEmail: false, optinSMS: true, optinPush: true }; // SMS+push default on
  state.bookingChoice = '';
  var steps = STEPS[serviceId] || STEPS['default'];
  state.totalSteps = steps.length;
  render();
  overlay.classList.add('open');
  overlay.scrollTop = 0;
};

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  var wrap = document.getElementById('nui-wrap');
  var copy = COPY[state.serviceId] || COPY['default'];
  var steps = STEPS[state.serviceId] || STEPS['default'];
  var isReview = state.step === state.totalSteps;

  var stepsHtml = steps.map(function(s, i) {
    var n = i + 1;
    var cls = 'nui-step-item' + (n < state.step ? ' done' : '') + (n === state.step ? ' active' : '');
    var num = n < state.step ? '✓' : n;
    return '<div class="'+cls+'"><div class="nui-step-num">'+num+'</div><div class="nui-step-lbl">'+s+'</div></div>';
  }).join('');

  var salesHtml = '<div class="nui-sales">' +
    '<div class="nui-badge">Service Intake</div>' +
    '<div class="nui-svc-name">'+state.label+'</div>' +
    (state.price ? '<div class="nui-svc-price">$'+Number(state.price).toLocaleString()+'</div>' : '') +
    '<div class="nui-copy-card">' +
      '<div class="nui-copy-hook">'+copy.hook+'</div>' +
      '<p class="nui-copy-body">'+copy.problem+'</p>' +
      '<p class="nui-copy-body">'+copy.agitate+'</p>' +
      '<p class="nui-copy-solution"><strong>The Solution:</strong> '+copy.solution+'</p>' +
      '<div class="nui-copy-proof">📈 '+copy.proof+'</div>' +
    '</div>' +
    '<div class="nui-trust"><span class="nui-trust-item">24–48hr Response</span><span class="nui-trust-item">Satisfaction Guaranteed</span><span class="nui-trust-item">Detroit-Based Team</span></div>' +
    '<p style="font-size:13px;color:rgba(255,255,255,0.3);margin-top:16px;">Complete this quick form and we\'ll get back to you within 24 hours with next steps.</p>' +
    '</div>';

  var panelHtml = isReview ? renderReview(steps) : renderStep(state.step, steps);

  var backBtn = state.step > 1
    ? '<button class="nui-btn nui-btn-back" onclick="window._nuiBack()">← Back</button>'
    : '';
  var nextBtn = isReview
    ? '<button class="nui-btn nui-btn-next" onclick="window._nuiSubmit()">Submit & Book →</button>'
    : '<button class="nui-btn nui-btn-next" onclick="window._nuiNext()">Continue →</button>';

  wrap.innerHTML = salesHtml +
    '<div class="nui-steps-bar"><div class="nui-steps-row">'+stepsHtml+'</div></div>' +
    panelHtml +
    '<div class="nui-btn-row">'+backBtn+nextBtn+'</div>';
}

function renderStep(step, steps) {
  var title = steps[step-1];
  var fields = getFields(state.serviceId, step);
  var fieldsHtml = fields.map(renderField).join('');
  return '<div class="nui-panel active">' +
    '<div class="nui-panel-title">'+title+'</div>' +
    '<div class="nui-panel-sub">Step '+step+' of '+state.totalSteps+' — '+steps[state.totalSteps-1]+'</div>' +
    fieldsHtml +
    '</div>';
}

function renderReview(steps) {
  var rows = [
    { k:'Service', v: state.label },
    state.price ? { k:'Investment', v: '$'+Number(state.price).toLocaleString() } : null,
    { k:'Name', v: state.data.name || '—' },
    { k:'Email', v: state.data.email || '—' },
    { k:'Phone', v: state.data.phone || '—' },
    { k:'Business', v: state.data.business || '—' },
    { k:'Email Updates', v: state.data.optinEmail ? '✓ Yes' : 'No' },
    { k:'SMS Deals', v: state.data.optinSMS ? '✓ Yes' : 'No' },
    { k:'Push Alerts', v: state.data.optinPush ? '✓ Yes' : 'No' },
  ].filter(Boolean);

  var rowsHtml = rows.map(function(r) {
    return '<div class="nui-review-row"><span class="nui-review-key">'+r.k+'</span><span class="nui-review-val">'+r.v+'</span></div>';
  }).join('');

  return '<div class="nui-panel active">' +
    '<div class="nui-panel-title">Review &amp; Book</div>' +
    '<div class="nui-panel-sub">Almost there — choose how to proceed</div>' +
    '<div class="nui-review-summary">'+rowsHtml+'</div>' +
    '<div style="font-family:Syne,sans-serif;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:14px;">How Would You Like to Proceed?</div>' +
    '<div class="nui-book-opts">' +
      '<div class="nui-book-card" id="nui-book-call" onclick="window._nuiChoose(\'call\')">' +
        '<div class="nui-book-icon">📞</div>' +
        '<div class="nui-book-title">Book a Free Call</div>' +
        '<div class="nui-book-desc">Schedule a 15-minute strategy call. We\'ll walk you through the plan, answer every question, and make sure this is the right fit.</div>' +
      '</div>' +
      '<div class="nui-book-card" id="nui-book-pay" onclick="window._nuiChoose(\'pay\')">' +
        '<div class="nui-book-icon">💳</div>' +
        '<div class="nui-book-title">Pay &amp; Get Started</div>' +
        '<div class="nui-book-desc">Ready to go? Lock in your project and start immediately. 0% financing through Afterpay &amp; Klarna available at checkout.</div>' +
      '</div>' +
    '</div>' +
    '</div>';
}

// ─── FIELDS ───────────────────────────────────────────────────────────────────
function getFields(svcId, step) {
  var common1 = [
    { id:'name', type:'text', label:'Your Full Name', req:true, placeholder:'First Last' },
    { id:'email', type:'text', label:'Email Address', req:true, placeholder:'you@example.com' },
    { id:'phone', type:'text', label:'Phone Number', req:true, placeholder:'(248) 000-0000' },
    { id:'business', type:'text', label:'Business Name', req:true, placeholder:'Your Business Name' },
    { id:'heard', type:'select', label:'How did you hear about us?', options:['Google Search','Instagram','Facebook','TikTok','Referral','Saw Our Work','Local Event','Other'] },
    { id:'_optins', type:'optins' },
  ];
  var common2 = [
    { id:'website', type:'text', label:'Current Website (if any)', req:false, placeholder:'https://' },
    { id:'returning', type:'radio', label:'Have you worked with us before?', options:[{v:'yes',t:'Yes, returning client'},{v:'no',t:'No, first time'}] },
    { id:'timeline', type:'select', label:'Desired Start Timeline', options:['As soon as possible','Within 2 weeks','Within a month','I\'m flexible'] },
  ];

  var maps = {
    'brand-kit':     { 2:common2.concat([{id:'targetAudience',type:'textarea',label:'Describe your ideal customer',req:true,placeholder:'Who do you want to reach?'}]),
                       3:[{id:'brandPersonality',type:'radio',label:'Brand Personality',options:[{v:'bold',t:'Bold & Edgy — Make a statement'},{v:'professional',t:'Professional & Trust — Corporate, reliable'},{v:'playful',t:'Playful & Fun — Energetic, youthful'},{v:'luxury',t:'Luxury & Premium — High-end, exclusive'}]},{id:'brandWords',type:'text',label:'3 words that describe your brand',req:true,placeholder:'e.g. Bold, Modern, Detroit'}],
                       4:[{id:'colorPrefs',type:'textarea',label:'Color preferences or colors to avoid',req:false,placeholder:'e.g. "Red and black, no purple"'},{id:'competitors',type:'textarea',label:'Brands you admire (2-3 examples)',req:false,placeholder:'Links or names of brands you like'},{id:'notes',type:'textarea',label:'Anything else we should know?',req:false,placeholder:'Special requirements, questions, context...'}] },
    'service-brand': { 2:common2.concat([{id:'yearsInBiz',type:'select',label:'Years in Business',options:['Startup (< 1 year)','1–2 years','3–5 years','5+ years']}]),
                       3:[{id:'mission',type:'textarea',label:'Your mission statement',req:true,placeholder:'What do you do and why?'},{id:'unique',type:'textarea',label:'What makes you different?',req:true,placeholder:'Why should someone hire you over a competitor?'}],
                       4:[{id:'brandPersonality',type:'radio',label:'Brand Personality',options:[{v:'bold',t:'Bold & Edgy'},{v:'professional',t:'Professional & Trust'},{v:'luxury',t:'Luxury & Premium'}]},{id:'notes',type:'textarea',label:'Notes or questions',req:false}] },
    'product-brand': { 2:common2.concat([{id:'productType',type:'text',label:'What type of products do you sell?',req:true,placeholder:'e.g. candles, clothing, food, beauty'}]),
                       3:[{id:'shelfPresence',type:'radio',label:'Primary sales channel',options:[{v:'retail',t:'Physical retail / shelf'},{v:'online',t:'Online / e-commerce'},{v:'both',t:'Both retail and online'},{v:'events',t:'Events / pop-ups'}]},{id:'productGoal',type:'textarea',label:'What do you want your packaging to say?',req:true}],
                       4:[{id:'colorPrefs',type:'textarea',label:'Color preferences',req:false},{id:'competitors',type:'textarea',label:'Competitor brands you admire',req:false},{id:'notes',type:'textarea',label:'Additional notes',req:false}] },
    'digital-hq':   { 2:common2.concat([{id:'hqLevel',type:'radio',label:'HQ Level you\'re interested in',options:[{v:'lite',t:'HQ Lite — $3,500'},{v:'standard',t:'HQ Standard — $5,500'},{v:'command',t:'HQ Command — $8,500+'}]}]),
                       3:[{id:'websiteGoal',type:'radio',label:'Primary Website Goal',options:[{v:'leads',t:'Generate Leads & Calls'},{v:'booking',t:'Book Appointments'},{v:'sales',t:'Sell Products Online'},{v:'info',t:'Showcase Services'}]},{id:'features',type:'textarea',label:'Special features needed',req:false,placeholder:'e.g. booking system, gallery, member portal, blog'}],
                       4:[{id:'hasBrand',type:'radio',label:'Do you have existing brand assets?',options:[{v:'yes',t:'Yes, I have a logo and brand'},{v:'partial',t:'Partial — some assets'},{v:'no',t:'No — need branding first'}]},{id:'notes',type:'textarea',label:'Notes or questions',req:false}] },
    'digital-staff':{ 2:common2.concat([{id:'currentVolume',type:'select',label:'How many leads/calls per week?',options:['Just starting','1–10','10–30','30–50','50+']}]),
                       3:[{id:'missedLeads',type:'radio',label:'How often do you miss leads?',options:[{v:'often',t:'Often — it\'s a real problem'},{v:'sometimes',t:'Sometimes — could be better'},{v:'rarely',t:'Rarely — mostly handled'}]},{id:'currentTools',type:'textarea',label:'What tools do you currently use?',req:false,placeholder:'CRM, scheduling apps, email tools...'}],
                       4:[{id:'aiPackage',type:'radio',label:'Which staff position interests you most?',options:[{v:'secretary',t:'Digital Secretary — $197/mo (calls 24/7)'},{v:'full',t:'Full Digital Staff — $397/mo (calls + follow-up)'},{v:'ghostwriter',t:'The Ghostwriter — AI email writing'},{v:'reporter',t:'The Money Reporter — weekly AI insights'}]},{id:'notes',type:'textarea',label:'Questions or context',req:false}] },
    'street-team':  { 2:common2.concat([{id:'industry',type:'text',label:'Your industry',req:true,placeholder:'e.g. restaurant, nightlife, contractor, retail'}]),
                       3:[{id:'biggestGap',type:'radio',label:'Biggest visibility problem right now',options:[{v:'content',t:'Social media looks dead'},{v:'reach',t:'Not reaching new people'},{v:'maps',t:'Invisible on Google Maps'},{v:'ads',t:'Platform keeps blocking my ads'}]},{id:'currentPlatforms',type:'text',label:'Platforms you\'re on',req:false,placeholder:'Instagram, Facebook, TikTok...'}],
                       4:[{id:'stTeamPackage',type:'radio',label:'Which positions interest you?',options:[{v:'content',t:'Content Crew — $497–$2,997/mo'},{v:'promoter',t:'Digital Promoter — SMS + push'},{v:'block',t:'Block Captain — geofencing'},{v:'neighbor',t:'Neighborhood Captain — Google Maps'}]},{id:'notes',type:'textarea',label:'Notes or questions',req:false}] },
    'publicist':    { 2:common2.concat([{id:'industry',type:'text',label:'Your industry or niche',req:true}]),
                       3:[{id:'story',type:'textarea',label:'Tell us your story in a few sentences',req:true,placeholder:'Why you started, what makes you different, what you\'ve accomplished...'},{id:'audience',type:'textarea',label:'Who reads your feature — who is your ideal client?',req:true}],
                       4:[{id:'pubPackage',type:'radio',label:'Which package interests you?',options:[{v:'feature',t:'Feature — $1,500 (editorial profile + badge)'},{v:'bundle',t:'Bundle — $3,500 (feature + photography + video)'}]},{id:'notes',type:'textarea',label:'Notes or questions',req:false}] },
    'event-team':   { 2:common2.concat([{id:'eventType',type:'text',label:'What type of events do you do?',req:true,placeholder:'e.g. ATD vendor, pop-up, market, trade show'}]),
                       3:[{id:'eventFreq',type:'select',label:'How often do you do events?',options:['One-time','Monthly','Weekly','Multiple per month']},{id:'avgAttendance',type:'select',label:'Estimated event attendance',options:['Under 50','50–150','150–500','500+']}],
                       4:[{id:'evtPackage',type:'radio',label:'Which package interests you?',options:[{v:'half',t:'Half Day — $497 (4 hrs, 100 captures)'},{v:'full',t:'Full Day — $897 (8 hrs, unlimited)'},{v:'weekend',t:'Weekend — $1,497 (2 days + Monday follow-up)'}]},{id:'notes',type:'textarea',label:'Notes or questions',req:false}] },
  };

  if (step === 1) return common1;
  var svcMap = maps[svcId];
  if (svcMap && svcMap[step]) return svcMap[step];
  return [{ id:'notes'+step, type:'textarea', label:'Additional details', req:false, placeholder:'Tell us more...' }];
}

function renderField(f) {
  var saved = state.data[f.id] || '';
  var lbl = '<label class="nui-label" for="nui_'+f.id+'">'+f.label+(f.req ? ' <span class="req">*</span>' : '')+'</label>';

  if (f.type === 'optins') {
    var eChecked = state.data.optinEmail ? 'checked' : '';
    var sChecked = state.data.optinSMS !== false ? 'checked' : '';
    var pChecked = state.data.optinPush !== false ? 'checked' : '';
    return `<div class="nui-field" style="border:1px solid rgba(255,255,255,0.08);padding:20px;background:rgba(255,255,255,0.02);margin-top:8px;">
<div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:14px;">Exclusive Access — Optional</div>
<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;margin-bottom:12px;">
<input type="checkbox" id="nui_optinEmail" onchange="window._nuiOptin('optinEmail',this.checked)" ${eChecked} style="margin-top:3px;accent-color:#D90429;width:16px;height:16px;flex-shrink:0;">
<div><div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:2px;">📧 Send me tips &amp; exclusive discounts by email</div><div style="font-size:11px;color:rgba(255,255,255,0.35);line-height:1.5;">Get first-access offers, brand-building tips, and Detroit business insights. Unsubscribe anytime.</div></div>
</label>
<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;margin-bottom:12px;">
<input type="checkbox" id="nui_optinSMS" onchange="window._nuiOptin('optinSMS',this.checked)" ${sChecked} style="margin-top:3px;accent-color:#D90429;width:16px;height:16px;flex-shrink:0;">
<div><div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:2px;">📱 Text me deals &amp; reminders directly to my phone</div><div style="font-size:11px;color:rgba(255,255,255,0.35);line-height:1.5;">Get your first-order discount, seasonal promos, and updates via text. Reply STOP to opt out anytime. Msg &amp; data rates may apply.</div></div>
</label>
<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">
<input type="checkbox" id="nui_optinPush" onchange="window._nuiOptin('optinPush',this.checked)" ${pChecked} style="margin-top:3px;accent-color:#D90429;width:16px;height:16px;flex-shrink:0;">
<div><div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:2px;">🔔 Push alerts for flash drops &amp; new openings</div><div style="font-size:11px;color:rgba(255,255,255,0.35);line-height:1.5;">Be first to know when new slots open or limited-time offers drop. Disable in browser settings anytime.</div></div>
</label>
<div style="margin-top:12px;font-size:10px;color:rgba(255,255,255,0.2);line-height:1.5;">By checking boxes above, you consent to receive marketing communications from New Urban Influence. We never sell your info. See our <a href="/privacy" style="color:rgba(255,255,255,0.3);">Privacy Policy</a>.</div>
</div>`;
  }
  if (f.type === 'select') {
    var opts = (f.options||[]).map(function(o){ return '<option value="'+o+'"'+(saved===o?' selected':'')+'>'+o+'</option>'; }).join('');
    return '<div class="nui-field">'+lbl+'<select id="nui_'+f.id+'" class="nui-input nui-select"><option value="">Select...</option>'+opts+'</select></div>';
  }
  if (f.type === 'textarea') {
    return '<div class="nui-field">'+lbl+'<textarea id="nui_'+f.id+'" class="nui-input nui-textarea" placeholder="'+(f.placeholder||'')+'">'+saved+'</textarea></div>';
  }
  if (f.type === 'radio') {
    var cards = (f.options||[]).map(function(o){
      var val = o.v || o; var title = o.t || o;
      var sel = saved === val ? ' selected' : '';
      return '<div class="nui-radio-card'+sel+'" data-field="'+f.id+'" data-val="'+val+'" onclick="window._nuiRadio(this)"><h5>'+title+'</h5></div>';
    }).join('');
    return '<div class="nui-field">'+lbl+'<div class="nui-radio-grid">'+cards+'</div></div>';
  }
  return '<div class="nui-field">'+lbl+'<input type="text" id="nui_'+f.id+'" class="nui-input" placeholder="'+(f.placeholder||'')+'" value="'+saved+'"></div>';
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
window._nuiOptin = function(field, val) { state.data[field] = val; };

window._nuiRadio = function(el) {
  var field = el.getAttribute('data-field');
  var val = el.getAttribute('data-val');
  document.querySelectorAll('[data-field="'+field+'"]').forEach(function(c){ c.classList.remove('selected'); });
  el.classList.add('selected');
  state.data[field] = val;
};

window._nuiChoose = function(choice) {
  state.bookingChoice = choice;
  document.querySelectorAll('.nui-book-card').forEach(function(c){ c.classList.remove('selected'); });
  document.getElementById('nui-book-'+choice).classList.add('selected');
};

function collectStep() {
  var steps = STEPS[state.serviceId] || STEPS['default'];
  var isReview = state.step === state.totalSteps;
  if (isReview) return true;
  var fields = getFields(state.serviceId, state.step);
  var ok = true;
  // Capture checkbox opt-ins if visible
  ['optinEmail','optinSMS','optinPush'].forEach(function(k){
    var el = document.getElementById('nui_'+k);
    if(el) state.data[k] = el.checked;
  });
  fields.forEach(function(f) {
    if (f.type === 'radio') {
      // radio values set by _nuiRadio
    } else {
      var el = document.getElementById('nui_'+f.id);
      if (el) {
        var v = el.value.trim();
        state.data[f.id] = v;
        if (f.req && !v) { el.style.borderColor = '#D90429'; ok = false; } else { el.style.borderColor = ''; }
      }
    }
  });
  // required radio check
  fields.forEach(function(f) {
    if (f.type === 'radio' && f.req !== false) {
      // optional — don't block
    }
  });
  return ok;
}

window._nuiNext = function() {
  if (!collectStep()) return;
  state.step++;
  render();
  document.getElementById('nui-wrap').scrollIntoView({behavior:'smooth',block:'start'});
};

window._nuiBack = function() {
  state.step--;
  render();
  document.getElementById('nui-wrap').scrollIntoView({behavior:'smooth',block:'start'});
};

window._nuiSubmit = function() {
  if (!state.bookingChoice) {
    alert('Please choose how you\'d like to proceed — Book a Call or Pay & Get Started.');
    return;
  }
  var payload = Object.assign({}, state.data, {
    service: state.serviceId,
    serviceName: state.label,
    price: state.price,
    bookingChoice: state.bookingChoice,
    source: window.location.pathname,
    timestamp: new Date().toISOString()
  });
  fetch('/.netlify/functions/submit-lead', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  }).catch(function(){});

  var wrap = document.getElementById('nui-wrap');
  if (state.bookingChoice === 'call') {
    wrap.innerHTML = '<div class="nui-success">' +
      '<div style="font-size:48px;margin-bottom:16px;">📞</div>' +
      '<h3>We\'ll Be in Touch Within 24 Hours.</h3>' +
      '<p>Your intake has been submitted. A member of our Detroit team will reach out to schedule your free strategy call. No pitch — just a real conversation about what we\'d build for you.</p>' +
      '<div class="nui-success-actions">' +
        '<a href="tel:2484878747" style="display:inline-flex;align-items:center;background:#D90429;color:#fff;font-family:Syne,sans-serif;font-weight:800;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;text-decoration:none;">Call Now: (248) 487-8747</a>' +
        '<button onclick="document.getElementById(\'nui-intake-overlay\').classList.remove(\'open\')" style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);font-family:Syne,sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;border:none;cursor:pointer;">Close</button>' +
      '</div></div>';
  } else {
    wrap.innerHTML = '<div class="nui-success">' +
      '<div style="font-size:48px;margin-bottom:16px;">💳</div>' +
      '<h3>Your Intake Is Submitted.</h3>' +
      '<p>We\'ll reach out within 24 hours with your invoice and payment link. You\'ll be able to pay via Afterpay, Klarna, or card — 0% interest on qualifying orders.</p>' +
      '<div class="nui-success-actions">' +
        '<a href="tel:2484878747" style="display:inline-flex;align-items:center;background:#D90429;color:#fff;font-family:Syne,sans-serif;font-weight:800;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;text-decoration:none;">Speed It Up: Call Us</a>' +
        '<button onclick="document.getElementById(\'nui-intake-overlay\').classList.remove(\'open\')" style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);font-family:Syne,sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;border:none;cursor:pointer;">Close</button>' +
      '</div></div>';
  }
};

// ─── WIRE ALL DATA-INTAKE BUTTONS ─────────────────────────────────────────────
function wireButtons() {
  document.querySelectorAll('[data-intake]').forEach(function(btn) {
    if (btn._nuiWired) return;
    btn._nuiWired = true;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var svcId = btn.getAttribute('data-intake');
      var price = btn.getAttribute('data-price') || '';
      var label = btn.getAttribute('data-label') || svcId;
      window.openNuiIntake(svcId, price, label);
    });
  });
}

// Wire on load + after any dynamic inserts
wireButtons();
document.addEventListener('DOMContentLoaded', wireButtons);
setTimeout(wireButtons, 1000);

})();
