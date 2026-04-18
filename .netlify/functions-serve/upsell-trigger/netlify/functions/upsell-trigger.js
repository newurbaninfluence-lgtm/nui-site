// netlify/functions/upsell-trigger.js
var nodemailer = require("nodemailer");
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
var ADMIN_EMAIL = process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL;
var sbHeaders = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};
var UPSELL_PATHS = {
  "blueprint": { next: "Digital HQ", pitch: "Your brand is built. Now build the system it runs on. A Digital HQ turns your brand into a 24/7 lead machine.", cta: "Digital HQ starts at $3,500 \u2014 split into 3 payments." },
  "brand-kit": { next: "Digital HQ Lite", pitch: "Your brand is ready. The next step is a website and lead capture system that actually converts visitors into clients.", cta: "Digital HQ Lite is $3,500 \u2014 or from $89/mo with Afterpay." },
  "digital-hq": { next: "Digital Staff", pitch: "Your HQ is running. Now hire the AI staff to answer calls, follow up on leads, and send your weekly business report.", cta: "Digital Secretary starts at $197/mo. Full bundle is $397/mo." },
  "digital-hq-lite": { next: "Digital Staff Bundle", pitch: "Your HQ Lite is running. The next level is hiring a full AI team \u2014 phone, follow-up, email, and weekly reporting.", cta: "Full Digital Staff bundle: $397/mo." },
  "digital-staff": { next: "Digital Promotion Team", pitch: "Your staff is running. Now give them something to promote. Content Crew posts daily so your brand never goes quiet.", cta: "Content Crew starts at $497/mo." },
  "digital-secretary": { next: "Lead Catcher + Ghostwriter", pitch: "You are not missing calls anymore. Now stop missing leads from your website, Google, and social DMs. Add the Lead Catcher.", cta: "Add Lead Catcher + Ghostwriter to your bundle for $397/mo total." },
  "content-crew": { next: "Watchman + Digital Promoter", pitch: "People are seeing your content. The Watchman identifies who visited your site. The Digital Promoter texts your list.", cta: "Watchman + Digital Promoter \u2014 call for territory pricing." },
  "event-team": { next: "Digital Promotion Team", pitch: "You captured the leads at the event. Now activate them with SMS campaigns, push notifications, and retargeting ads.", cta: "Content Crew Posted Up starts at $497/mo." },
  "publicist": { next: "Digital HQ", pitch: "Your NUI Magazine feature is live and indexed. Now build the system that converts that credibility into booked clients.", cta: "Digital HQ Lite is $3,500." },
  "print": { next: "Blueprint or Digital HQ", pitch: "Your print looks professional. Now make sure your brand and website match that same level. The Blueprint starts at $1,500.", cta: "Blueprint Brand Kit: $1,500. Digital HQ Lite: $3,500." }
};
function getUpsell(serviceName) {
  if (!serviceName) return UPSELL_PATHS["blueprint"];
  const s = serviceName.toLowerCase();
  if (s.includes("hq lite")) return UPSELL_PATHS["digital-hq-lite"];
  if (s.includes("digital hq") || s.includes("website")) return UPSELL_PATHS["digital-hq"];
  if (s.includes("secretary")) return UPSELL_PATHS["digital-secretary"];
  if (s.includes("digital staff") || s.includes("full staff")) return UPSELL_PATHS["digital-staff"];
  if (s.includes("content crew") || s.includes("street team") || s.includes("promotion team")) return UPSELL_PATHS["content-crew"];
  if (s.includes("event team") || s.includes("event")) return UPSELL_PATHS["event-team"];
  if (s.includes("publicist") || s.includes("press") || s.includes("magazine")) return UPSELL_PATHS["publicist"];
  if (s.includes("print") || s.includes("packaging")) return UPSELL_PATHS["print"];
  if (s.includes("blueprint") || s.includes("brand kit") || s.includes("brand identity")) return UPSELL_PATHS["brand-kit"];
  return UPSELL_PATHS["blueprint"];
}
async function sendMail(to, subject, html) {
  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await mailer.sendMail({ from: `"NUI System" <${process.env.SMTP_USER}>`, to, subject, html });
}
exports.handler = async () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("[Upsell] Supabase not configured");
    return { statusCode: 200, body: JSON.stringify({ skipped: "no db" }) };
  }
  try {
    const today = /* @__PURE__ */ new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?upsell_trigger_date=gte.${start.toISOString()}&upsell_trigger_date=lte.${end.toISOString()}&select=id,name,email,phone,business_name,current_service`,
      { headers: sbHeaders }
    );
    const clients = await resp.json();
    console.log(`[Upsell] Found ${clients.length} client(s) at 90-day mark`);
    for (const client of clients) {
      const upsell = getUpsell(client.current_service);
      await sendMail(
        ADMIN_EMAIL,
        `\u{1F4A1} 90-Day Upsell: ${client.name || client.business_name} \u2014 Offer ${upsell.next}`,
        `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;">
<div style="background:#C9A227;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
<h2 style="margin:0;color:#000;font-size:18px;font-weight:800;">\u{1F4A1} 90-Day Upsell Trigger</h2>
<p style="margin:4px 0 0;color:#000;font-size:13px;opacity:0.7;">Time to reach out to a current client</p>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
<tr><td style="padding:6px 0;color:#888;font-size:13px;width:100px;">Client</td><td style="color:#fff;font-weight:600;">${client.name || "Unknown"}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px;">Business</td><td style="color:#fff;">${client.business_name || "\u2014"}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px;">Email</td><td><a href="mailto:${client.email}" style="color:#C9A227;">${client.email || "\u2014"}</a></td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px;">Phone</td><td><a href="tel:${client.phone}" style="color:#C9A227;">${client.phone || "\u2014"}</a></td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px;">Has</td><td style="color:#D90429;font-weight:700;">${client.current_service || "\u2014"}</td></tr>
<tr><td style="padding:6px 0;color:#888;font-size:13px;">Offer</td><td style="color:#C9A227;font-weight:700;">${upsell.next}</td></tr>
</table>
<div style="background:#111;border-radius:8px;padding:20px;margin-bottom:16px;">
<h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;">What to Say</h3>
<p style="margin:0;color:#ccc;font-size:14px;line-height:1.7;">${upsell.pitch}</p>
</div>
<div style="background:#111;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
<h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;">The Offer</h3>
<p style="margin:0;color:#fff;font-size:14px;">${upsell.cta}</p>
</div>
<p style="color:#555;font-size:12px;text-align:center;margin:0;">A client email has also been sent to ${client.email} checking in on their results.</p>
</div>`
      );
      if (client.email) {
        await sendMail(
          client.email,
          `90 Days In \u2014 How Is Everything Going? | New Urban Influence`,
          `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
<h2 style="font-size:22px;font-weight:800;margin:0 0 8px;">90 Days In.</h2>
<p style="color:#888;margin:0 0 24px;font-size:14px;">New Urban Influence \u2014 Checking In</p>
<p style="color:#ccc;line-height:1.8;margin-bottom:16px;">Hey${client.name ? " " + client.name.split(" ")[0] : ""} \u2014 it's been about 90 days since we got your ${client.current_service || "service"} running. Wanted to check in and make sure everything is working the way it should.</p>
<p style="color:#ccc;line-height:1.8;margin-bottom:24px;">If you have questions, want to make adjustments, or want to know what the next step looks like for your business \u2014 just reply to this email or book a quick call.</p>
<div style="background:#111;border-left:3px solid #C9A227;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
<p style="margin:0;color:#fff;font-size:14px;line-height:1.7;font-style:italic;">${upsell.pitch}</p>
</div>
<div style="text-align:center;margin-bottom:24px;">
<a href="https://newurbaninfluence.com/contact" style="display:inline-block;background:#D90429;color:#fff;padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px;">Book a Quick Call \u2192</a>
</div>
<p style="color:#555;font-size:12px;text-align:center;">New Urban Influence \xB7 Detroit, MI \xB7 (248) 487-8747</p>
</div>`
        );
      }
      await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
        method: "POST",
        headers: { ...sbHeaders, "Prefer": "return=minimal" },
        body: JSON.stringify({
          event_type: "upsell_triggered",
          metadata: { client_id: client.id, current_service: client.current_service, upsell_offered: upsell.next, triggered_at: (/* @__PURE__ */ new Date()).toISOString() }
        })
      }).catch((e) => console.warn("Activity log failed:", e.message));
      await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${client.id}`, {
        method: "PATCH",
        headers: { ...sbHeaders, "Prefer": "return=minimal" },
        body: JSON.stringify({ upsell_trigger_date: null, last_upsell_at: (/* @__PURE__ */ new Date()).toISOString(), last_upsell_offered: upsell.next })
      }).catch((e) => console.warn("Client update failed:", e.message));
      console.log(`[Upsell] Fired for ${client.name} \u2192 ${upsell.next}`);
    }
    return { statusCode: 200, body: JSON.stringify({ processed: clients.length }) };
  } catch (err) {
    console.error("[Upsell] Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=upsell-trigger.js.map
