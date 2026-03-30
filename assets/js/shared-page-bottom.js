// shared-page-bottom.js — injected at bottom of all NUI service pages
// Renders: financing section + booking CTA + footer
// Usage: <div id="page-bottom"></div><script src="/assets/js/shared-page-bottom.js"></script>

(function() {
  var svc = document.body.getAttribute('data-service') || '';
  var intakeURL = '/?view=intake&service=' + encodeURIComponent(svc);

  var html = `

<!-- ═══ BOOKING CTA ═══ -->
<section style="padding:80px 48px;background:#000;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
  <div style="max-width:860px;margin:0 auto;">
    <p style="font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#D90429;margin-bottom:20px;">Ready to Start</p>
    <h2 style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,64px);text-transform:uppercase;color:#fff;line-height:1;margin-bottom:20px;letter-spacing:-0.5px;">Have Questions?<br><span style="color:#D90429;">Book a Free Call.</span></h2>
    <p style="font-size:17px;color:rgba(255,255,255,0.55);max-width:560px;margin:0 auto 40px;line-height:1.75;">Book a free 15-minute strategy call. We'll look at your business, your goals, and tell you exactly what we'd build — no pitch, no obligation. Just Detroit-to-Detroit.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
      <a href="${intakeURL}" style="display:inline-flex;align-items:center;background:#D90429;color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;padding:18px 48px;text-decoration:none;transition:background .2s;" onmouseover="this.style.background='#b5001f'" onmouseout="this.style.background='#D90429'">Book Free Strategy Call →</a>
      <a href="tel:2484878747" style="display:inline-flex;align-items:center;background:transparent;color:#fff;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;padding:18px 48px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.25);transition:border-color .2s;" onmouseover="this.style.borderColor='#fff'" onmouseout="this.style.borderColor='rgba(255,255,255,0.25)'">(248) 487-8747</a>
    </div>
    <p style="font-size:12px;color:rgba(255,255,255,0.2);letter-spacing:0.5px;">Response within 24 hours · Mon–Fri 9AM–6PM · Detroit, Michigan</p>
  </div>
</section>

<!-- ═══ FLEXIBLE FINANCING ═══ -->
<section style="padding:80px 48px;background:linear-gradient(180deg,#0a0a0a,#050505);text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
  <div style="max-width:900px;margin:0 auto;">
    <p style="font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#a855f7;margin-bottom:16px;">FLEXIBLE FINANCING</p>
    <h2 style="font-family:'Syne',sans-serif;font-size:clamp(28px,4.5vw,52px);font-weight:900;color:#fff;line-height:1.1;margin-bottom:16px;">Don't Let Budget<br>Hold Your Brand Back</h2>
    <p style="font-size:17px;color:rgba(255,255,255,0.55);max-width:600px;margin:0 auto 48px;line-height:1.65;">Invest in your brand now, pay over time. 0% interest, no hidden fees, instant approval at checkout.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;text-align:left;margin-bottom:48px;">
      <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:16px;padding:32px;">
        <div style="font-size:28px;margin-bottom:12px;">🟢</div>
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;">Afterpay</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:12px;">Split any project into 4 equal payments over 6 weeks. No interest, no credit check. Instant approval.</p>
        <div style="font-size:12px;color:#a855f7;font-weight:700;letter-spacing:1px;">$1–$4,000 · 4 PAYMENTS · 0% INTEREST</div>
      </div>
      <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);border-radius:16px;padding:32px;">
        <div style="font-size:28px;margin-bottom:12px;">🩷</div>
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;">Klarna</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:12px;">Pay in 4 or choose a flexible monthly plan. Klarna covers up to $10,000 for bigger investments.</p>
        <div style="font-size:12px;color:#3b82f6;font-weight:700;letter-spacing:1px;">$1–$10,000 · FLEXIBLE PLANS · 0% INTEREST</div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:32px;">
        <div style="font-size:28px;margin-bottom:12px;">💳</div>
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;">Split Payments</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:12px;">Prefer to pay in milestones? We also do 50/25/25 splits and custom 2–4 payment plans directly.</p>
        <div style="font-size:12px;color:rgba(255,255,255,0.35);font-weight:700;letter-spacing:1px;">CUSTOM SCHEDULE · DEPOSIT + MILESTONES</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:10px;"><div style="width:38px;height:38px;background:#000;border:1px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#b6f09c;">A</div><span style="font-size:13px;color:rgba(255,255,255,0.55);">Afterpay</span></div>
      <div style="display:flex;align-items:center;gap:10px;"><div style="width:38px;height:38px;background:#ffb3c7;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#000;">K</div><span style="font-size:13px;color:rgba(255,255,255,0.55);">Klarna</span></div>
      <div style="display:flex;align-items:center;gap:10px;"><div style="width:38px;height:38px;background:#635bff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;">S</div><span style="font-size:13px;color:rgba(255,255,255,0.55);">Stripe Secure</span></div>
    </div>
    <p style="font-size:12px;color:rgba(255,255,255,0.25);max-width:500px;margin:0 auto;">Financing is offered through Afterpay and Klarna via Stripe. Approval at checkout — NUI receives full payment upfront. Everyone wins.</p>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer style="background:#050505;border-top:1px solid rgba(255,255,255,0.06);">
  <div style="max-width:1200px;margin:0 auto;padding:64px 48px 40px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;">

    <div>
      <a href="/" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;margin-bottom:20px;">
        <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;letter-spacing:3px;text-transform:uppercase;color:#fff;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
      </a>
      <p style="font-size:14px;color:rgba(255,255,255,0.4);line-height:1.75;max-width:280px;margin-bottom:24px;">Detroit-based creative agency specializing in brand identity, web design, and digital marketing. Unapologetically Detroit.</p>
      <div style="display:flex;gap:12px;margin-bottom:28px;">
        <a href="https://instagram.com/newurbaninfluence" target="_blank" style="width:36px;height:36px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;text-decoration:none;color:#fff;">📷</a>
        <a href="https://facebook.com/newurbaninfluence" target="_blank" style="width:36px;height:36px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;text-decoration:none;color:#fff;">f</a>
        <a href="https://linkedin.com/company/newurbaninfluence" target="_blank" style="width:36px;height:36px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;text-decoration:none;color:#fff;">in</a>
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,0.35);line-height:2.2;">
        <div><span style="margin-right:8px;">📍</span>By Appointment · Metro Detroit</div>
        <div><a href="tel:2484878747" style="color:rgba(255,255,255,0.35);text-decoration:none;"><span style="margin-right:8px;">📞</span>(248) 487-8747</a></div>
        <div><a href="mailto:info@newurbaninfluence.com" style="color:rgba(255,255,255,0.35);text-decoration:none;"><span style="margin-right:8px;">✉️</span>info@newurbaninfluence.com</a></div>
        <div><span style="margin-right:8px;">🕐</span>Mon–Fri: 9AM–6PM</div>
      </div>
    </div>

    <div>
      <div style="font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;margin-bottom:20px;">Services</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <a href="/services/brand-kit-detroit" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Brand Architect</a>
        <a href="/services/business-website-detroit" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Digital HQ</a>
        <a href="/services/digital-staff-detroit" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Digital Staff</a>
        <a href="/services/social-media-management-detroit" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Digital Street Team</a>
        <a href="/services/press-feature-detroit" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">The Publicist</a>
        <a href="/services/event-team-detroit" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">The Event Team</a>
      </div>
    </div>

    <div>
      <div style="font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;margin-bottom:20px;">Company</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <a href="/" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Home</a>
        <a href="/?view=about" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">About Us</a>
        <a href="/?view=portfolio" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Portfolio</a>
        <a href="/?view=blog" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Blog</a>
        <a href="/?view=intake" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Contact</a>
        <a href="/?view=portal" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#D90429'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">Client Portal</a>
      </div>
    </div>

    <div>
      <div style="font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;margin-bottom:20px;">Service Areas</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
        ${['Detroit','Southfield','Royal Oak','Troy','Dearborn','Ann Arbor','Farmington Hills','Livonia','Warren','Sterling Heights','Novi','Birmingham'].map(c =>
          '<a href="/locations/'+c.toLowerCase().replace(/ /g,'-')+'" style="font-size:12px;color:rgba(255,255,255,0.35);text-decoration:none;transition:color .2s;" onmouseover="this.style.color=\'#D90429\'" onmouseout="this.style.color=\'rgba(255,255,255,0.35)\'">'+c+'</a>'
        ).join('')}
      </div>
    </div>

  </div>
  <div style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;max-width:1200px;margin:0 auto;">
    <span style="font-size:12px;color:rgba(255,255,255,0.25);">© ${new Date().getFullYear()} New Urban Influence. All rights reserved.</span>
    <span style="font-size:12px;color:rgba(255,255,255,0.25);">🔴 Built in Detroit with love</span>
    <div style="display:flex;gap:20px;">
      <a href="/privacy" style="font-size:12px;color:rgba(255,255,255,0.2);text-decoration:none;">Privacy Policy</a>
      <a href="/terms" style="font-size:12px;color:rgba(255,255,255,0.2);text-decoration:none;">Terms of Service</a>
      <a href="/sitemap.xml" style="font-size:12px;color:rgba(255,255,255,0.2);text-decoration:none;">Sitemap</a>
    </div>
  </div>
</footer>

<style>
@media(max-width:768px){
  footer > div:first-child{grid-template-columns:1fr!important;gap:32px!important;padding:48px 24px 32px!important;}
  footer > div:last-child{padding:20px 24px!important;flex-direction:column!important;text-align:center!important;}
  section[style*="padding:80px 48px"]{padding:60px 24px!important;}
}
</style>`;

  var el = document.getElementById('page-bottom');
  if (el) el.innerHTML = html;
})();
