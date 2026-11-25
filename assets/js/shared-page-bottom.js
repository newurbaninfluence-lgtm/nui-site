// shared-page-bottom.js — injected at bottom of all NUI service pages
// Renders: booking CTA + financing section + footer (styled by /assets/css/site.css)
// Usage: <div id="page-bottom"></div><script src="/assets/js/shared-page-bottom.js"></script>

(function() {
  var svc = document.body.getAttribute('data-service') || '';
  var intakeURL = '/?view=intake&service=' + encodeURIComponent(svc);

  var html = `
<div class="cta">
  <p class="section-label">Ready to start</p>
  <h2>Have questions?<br><span class="red">Book a free call.</span></h2>
  <p>Book a free 15-minute strategy call. We'll look at your business, your goals, and tell you exactly what we'd build. No pitch, no obligation. Just Detroit-to-Detroit.</p>
  <div class="hero-btns">
    <button type="button" class="btn btn-red" data-intake="${svc}" data-label="${svc}">Book free strategy call</button>
    <a href="tel:+12484878747" class="btn btn-outline">Call (248) 487-8747</a>
  </div>
  <p style="font-size:14px;margin-top:20px">Response within 24 hours. Mon to Fri, 9 AM to 6 PM. Detroit, Michigan.</p>
</div>

<section style="text-align:center">
  <div class="container">
    <p class="section-label">Flexible financing</p>
    <h2>Don't let budget hold your brand back</h2>
    <p class="section-text" style="margin:16px auto 40px">Invest in your brand now, pay over time. 0% interest, no hidden fees, instant approval at checkout.</p>
    <div class="packages" style="text-align:left">
      <div class="package"><h3>Afterpay</h3><p class="section-text" style="font-size:15px;margin:8px 0 12px">Split any project into 4 equal payments over 6 weeks. No interest, no credit check. Instant approval.</p><p style="font-size:14px;font-weight:600;color:#ff5a64">$1 to $4,000, 4 payments, 0% interest</p></div>
      <div class="package"><h3>Klarna</h3><p class="section-text" style="font-size:15px;margin:8px 0 12px">Pay in 4 or choose a flexible monthly plan. Klarna covers up to $10,000 for bigger investments.</p><p style="font-size:14px;font-weight:600;color:#ff5a64">$1 to $10,000, flexible plans, 0% interest</p></div>
      <div class="package"><h3>Split payments</h3><p class="section-text" style="font-size:15px;margin:8px 0 12px">Prefer to pay in milestones? We also do 50/25/25 splits and custom 2 to 4 payment plans directly.</p><p style="font-size:14px;font-weight:600;color:#ff5a64">Custom schedule, deposit plus milestones</p></div>
    </div>
    <p class="section-text" style="font-size:14px;margin:28px auto 0">Financing is offered through Afterpay and Klarna via Stripe. Approval at checkout. NUI receives full payment upfront.</p>
  </div>
</section>
<footer class="nh-foot"><div class="in"><div class="nh-fgrid">
<div><a class="nh-flogo" href="/"><img src="/icons/icon-192.png" alt="" width="26" height="26">New Urban Influence</a><p style="margin-top:12px;max-width:280px">Websites and business software, built in Detroit.</p><p style="margin-top:8px;color:#fff;font-weight:600;user-select:all">(248) 487-8747</p><p style="margin-top:4px;user-select:all">info@newurbaninfluence.com</p></div>
<div><h4>What we build</h4><a href="/websites">Websites</a><a href="/restaurants-bars">Restaurant &amp; bar software</a><a href="/services/crm-integration-detroit">CRM &amp; automation</a><a href="https://nuiflyers.com" target="_blank" rel="noopener">Flyers &amp; videos</a><a href="/print">Print &amp; signage</a></div>
<div><h4>Company</h4><a href="/about">About</a><a href="/websites#builds">Our work</a><a href="/#how-it-works">How it works</a><a href="/contact">Contact</a><a href="/magazine">NUI Magazine</a><a href="/blog">Blog</a></div>
<div><h4>Log in</h4><a href="/app/">Client login</a><a href="/app/">Staff login</a></div>
</div>
<div class="nh-fareas"><h4>Service areas</h4><div><a href="/locations/detroit">Detroit</a><a href="/locations/southfield">Southfield</a><a href="/locations/farmington-hills">Farmington Hills</a><a href="/locations/royal-oak">Royal Oak</a><a href="/locations/troy">Troy</a><a href="/locations/dearborn">Dearborn</a><a href="/locations/ann-arbor">Ann Arbor</a><a href="/locations/birmingham">Birmingham</a><a href="/locations/novi">Novi</a><a href="/locations/sterling-heights">Sterling Heights</a><a href="/locations/livonia">Livonia</a><a href="/locations/warren">Warren</a><a href="/locations/pontiac">Pontiac</a><a href="/locations/hamtramck">Hamtramck</a><a href="/locations/highland-park">Highland Park</a></div></div>
<div class="nh-fbase"><span>&copy; 2026 New Urban Influence. Detroit, Michigan.</span><span><a href="/privacy-policy">Privacy</a> &nbsp;&middot;&nbsp; <a href="/terms-of-service">Terms</a> &nbsp;&middot;&nbsp; <a href="/sitemap.xml">Sitemap</a></span></div></div></footer>
`;

  var el = document.getElementById('page-bottom');
  el.innerHTML = html;
  // Wire the booking button with correct service
  setTimeout(function(){
    if(window.wireButtons) window.wireButtons();
    else if(window.openNuiIntake){
      var btn = el.querySelector('[data-intake]');
      if(btn && !btn._nuiWired){ btn._nuiWired=true; btn.addEventListener('click',function(e){ e.preventDefault(); window.openNuiIntake(svc,btn.getAttribute('data-price')||'',btn.getAttribute('data-label')||svc); }); }
    }
  }, 200);
})();
