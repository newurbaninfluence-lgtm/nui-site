// netlify/functions/client-email-broadcast.js
var nodemailer = require("nodemailer");
var dns = require("dns").promises;
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
var SMTP_USER = process.env.HOSTINGER_EMAIL;
var SMTP_PASS = process.env.HOSTINGER_PASSWORD;
var MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
var SITE_URL = "https://newurbaninfluence.com";
var WARMUP_RAMP = [
  { runsMin: 0, runsMax: 14, limit: 10 },
  { runsMin: 14, runsMax: 28, limit: 20 },
  { runsMin: 28, runsMax: 99, limit: 40 }
];
var sbH = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};
async function getDailyLimit() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs?agent_id=eq.email_broadcast&status=eq.success&select=id`, { headers: sbH });
    const logs = await r.json();
    const totalRuns = (logs || []).length;
    const tier = WARMUP_RAMP.find((t) => totalRuns >= t.runsMin && totalRuns < t.runsMax);
    return tier ? tier.limit : 10;
  } catch {
    return 10;
  }
}
async function verifyEmailDomain(email) {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}
var ANGLE_IDS = ["reconnect", "value_tip", "social_proof", "ai_angle", "free_audit", "detroit_pride"];
async function getNextAngle() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs?agent_id=eq.email_broadcast&order=created_at.desc&limit=6`, { headers: sbH });
    const logs = await r.json();
    const used = (logs || []).map((l) => l.metadata?.angle_id).filter(Boolean);
    return ANGLE_IDS.find((id) => !used.includes(id)) || ANGLE_IDS[0];
  } catch {
    return "reconnect";
  }
}
async function getContactBatch(limit) {
  const cooldown = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/crm_contacts?email=not.is.null&email_unsubscribed=eq.false&email_bounced=eq.false&status=in.(cold_lead,new_lead,warm_lead)&select=id,first_name,last_name,company,email,last_broadcast_at&order=last_broadcast_at.asc.nullsfirst&limit=${limit * 3}`,
    { headers: sbH }
  );
  const all = await r.json();
  return (all || []).filter((c) => !c.last_broadcast_at || new Date(c.last_broadcast_at) < new Date(cooldown)).slice(0, limit);
}
function buildEmail(contactId, sendId, angleId, firstName, company) {
  const trackBase = `${SITE_URL}/.netlify/functions/email-track`;
  const pixelUrl = `${trackBase}?cid=${contactId}&id=${sendId}`;
  const unsubUrl = `${SITE_URL}/.netlify/functions/unsubscribe?cid=${contactId}`;
  const trackLink = (url) => `${trackBase}?cid=${contactId}&id=${sendId}&url=${encodeURIComponent(url)}`;
  const ctaUrl = trackLink(`${SITE_URL}/contact`);
  const co = company || "your business";
  const bodyMap = {
    reconnect: {
      subject: `${firstName}, it's been a minute \u2014 Faren here`,
      body: `<p>Hey ${firstName},</p>
<p>It's Faren Young \u2014 you worked with me when I was running Bravo Graphix. Wanted to reach out and reconnect.</p>
<p>A lot has changed. We rebranded to <strong>New Urban Influence</strong> and now build full digital infrastructure for Detroit businesses \u2014 websites, AI phone staff, brand strategy, and marketing automation.</p>
<p>If ${co} is still going strong, I'd love to hear about it and see if there's anything we can help with. No pitch \u2014 just a real conversation.</p>`
    },
    value_tip: {
      subject: `${firstName} \u2014 3 things hurting Detroit businesses right now`,
      body: `<p>Hey ${firstName},</p>
<p>Three things I keep seeing hurt Detroit businesses:</p>
<p><strong>1. Outdated Google Business Profile.</strong> Set it up once and never touched it. Maps ranking drops fast when it looks abandoned.</p>
<p><strong>2. No follow-up system.</strong> Lead contacts you, you're busy, 24 hours pass. They already booked someone else.</p>
<p><strong>3. Inconsistent brand.</strong> Instagram looks nothing like the website. Customers don't trust inconsistency.</p>
<p>Any of these sound familiar for ${co}? Reply and I'll tell you the fastest fix.</p>`
    },
    social_proof: {
      subject: `What changed for a Detroit business in 90 days`,
      body: `<p>Hey ${firstName},</p>
<p>Quick story \u2014 a Detroit service business came to us earlier this year. Invisible on Google, missing after-hours calls, no consistent presence.</p>
<p>We built them a Digital HQ: lead capture website, AI phone staff that answers and books 24/7, daily social content on autopilot.</p>
<p>90 days later: top 3 on Google Maps, zero missed leads, brand looks like a real company.</p>
<p>That's what we do for Detroit businesses now. If ${co} needs any of this, I'm one reply away.</p>`
    },
    ai_angle: {
      subject: `${firstName} \u2014 AI is answering calls for Detroit businesses right now`,
      body: `<p>Hey ${firstName},</p>
<p>We built something called Digital Staff for Detroit businesses \u2014 an AI that picks up your phone 24/7, knows your business, answers questions, books appointments. $197/month.</p>
<p>Less than one day of part-time payroll. Never calls in sick.</p>
<p>Most owners are shocked by how many leads they were losing after hours. That's fixable now.</p>
<p>Would that solve a real problem for ${co}? Reply and I'll show you exactly how it works.</p>`
    },
    free_audit: {
      subject: `${firstName} \u2014 free brand audit for Detroit businesses this week`,
      body: `<p>Hey ${firstName},</p>
<p>This week I'm doing free brand and digital audits for a handful of Detroit businesses \u2014 no strings attached.</p>
<p>I look at your branding, website, Google presence, and social media and tell you what's working, what's hurting you, and the fastest fix. 15 minutes on a call.</p>
<p>I'd love to take a look at ${co}. Reply or grab a time below.</p>`
    },
    detroit_pride: {
      subject: `Detroit businesses are winning right now \u2014 are you?`,
      body: `<p>Hey ${firstName},</p>
<p>The Detroit businesses growing fastest right now built strong brands and digital infrastructure coming out of the rough years.</p>
<p>The ones struggling still rely on word of mouth, have a website nobody can find, and haven't figured out how to use technology without it taking over their life.</p>
<p>We help close that gap \u2014 branding, websites, AI automation, Google Maps visibility. Built for businesses like ${co}.</p>
<p>If now is the time to level up, I want to help.</p>`
    }
  };
  const angle = bodyMap[angleId] || bodyMap.reconnect;
  const html = `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.75;">
<div style="background:#111;padding:24px;text-align:center;">
<span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
${angle.body}
<div style="text-align:center;margin:28px 0;">
<a href="${ctaUrl}" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Book a Free Call \u2192</a>
</div>
<p style="color:#555;font-size:14px;margin-top:24px;">\u2014 Faren Young<br>New Urban Influence<br>Detroit, MI \xB7 (248) 487-8747</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;border-top:1px solid #e0e0e0;">
New Urban Influence \xB7 Detroit, MI \xB7 <a href="${trackLink(SITE_URL)}" style="color:#D90429;">newurbaninfluence.com</a><br>
<a href="${unsubUrl}" style="color:#999;">Unsubscribe</a>
</div>
<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />
</div>`;
  return { subject: angle.subject, html };
}
async function logSend(contactId, subject, angleId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
    method: "POST",
    headers: { ...sbH, "Prefer": "return=representation" },
    body: JSON.stringify({ channel: "email", direction: "outbound", subject, client_id: contactId, metadata: { handler: "client-email-broadcast", angle_id: angleId }, created_at: (/* @__PURE__ */ new Date()).toISOString() })
  });
  const rows = await r.json();
  return rows?.[0]?.id || null;
}
async function markContact(contactId, subject, bounced = false, bounceType = null) {
  const updates = { last_broadcast_at: (/* @__PURE__ */ new Date()).toISOString(), last_broadcast_subject: subject };
  if (bounced) {
    updates.email_bounced = true;
    updates.email_bounce_type = bounceType || "hard";
  } else {
    updates.email_send_count = { _increment: 1 };
  }
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: "PATCH",
    headers: { ...sbH, "Prefer": "return=minimal" },
    body: JSON.stringify(updates)
  }).catch(() => {
  });
}
exports.handler = async (event) => {
  const isManual = event.httpMethod === "POST";
  if (!SMTP_USER || !SMTP_PASS) return { statusCode: 500, body: JSON.stringify({ error: "SMTP not configured" }) };
  if (!SUPABASE_URL || !SUPABASE_KEY) return { statusCode: 500, body: JSON.stringify({ error: "Supabase not configured" }) };
  const body = isManual ? JSON.parse(event.body || "{}") : {};
  const dailyLimit = body.limit || await getDailyLimit();
  const angleId = body.angle || await getNextAngle();
  console.log(`[Broadcast] Starting \u2014 limit: ${dailyLimit}, angle: ${angleId}`);
  try {
    const contacts = await getContactBatch(dailyLimit);
    if (contacts.length === 0) {
      console.log("[Broadcast] No eligible contacts");
      return { statusCode: 200, body: JSON.stringify({ success: true, sent: 0, reason: "no_eligible_contacts" }) };
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    let sent = 0, bounced = 0, skipped = 0, failed = 0;
    const results = [];
    for (const contact of contacts) {
      const email = contact.email?.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        skipped++;
        continue;
      }
      const valid = await verifyEmailDomain(email);
      if (!valid) {
        console.log(`[Broadcast] Bad MX: ${email} \u2014 marking bounced`);
        await markContact(contact.id, "MX_VERIFY_FAILED", true, "mx_invalid");
        bounced++;
        results.push({ email, status: "mx_invalid" });
        continue;
      }
      const sendId = await logSend(contact.id, "pending", angleId);
      const firstName = contact.first_name || "there";
      const { subject, html } = buildEmail(contact.id, sendId, angleId, firstName, contact.company);
      if (sendId) {
        await fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${sendId}`, {
          method: "PATCH",
          headers: { ...sbH, "Prefer": "return=minimal" },
          body: JSON.stringify({ subject })
        }).catch(() => {
        });
      }
      try {
        await transporter.sendMail({
          from: `"Faren Young | New Urban Influence" <${SMTP_USER}>`,
          to: email,
          subject,
          html,
          replyTo: MAIL_FROM,
          headers: {
            "List-Unsubscribe": `<${SITE_URL}/.netlify/functions/unsubscribe?cid=${contact.id}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          }
        });
        await markContact(contact.id, subject);
        sent++;
        results.push({ email, status: "sent", angle: angleId });
        console.log(`[Broadcast] \u2713 ${email}`);
      } catch (e) {
        const isBounce = /bounce|reject|invalid|no such|does not exist|unavailable/i.test(e.message);
        if (isBounce) {
          await markContact(contact.id, subject, true, "hard");
          bounced++;
          results.push({ email, status: "bounced", error: e.message.slice(0, 80) });
        } else {
          failed++;
          results.push({ email, status: "failed", error: e.message.slice(0, 80) });
        }
        console.warn(`[Broadcast] \u2717 ${email}:`, e.message.slice(0, 80));
      }
      await new Promise((r) => setTimeout(r, 2e3));
    }
    await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
      method: "POST",
      headers: { ...sbH, "Prefer": "return=minimal" },
      body: JSON.stringify({ agent_id: "email_broadcast", status: "success", metadata: { angle_id: angleId, limit: dailyLimit, sent, bounced, skipped, failed, total_eligible: contacts.length }, created_at: (/* @__PURE__ */ new Date()).toISOString() })
    }).catch(() => {
    });
    console.log(`[Broadcast] Done \u2014 sent:${sent} bounced:${bounced} skipped:${skipped} failed:${failed}`);
    return { statusCode: 200, body: JSON.stringify({ success: true, sent, bounced, skipped, failed, angle: angleId, daily_limit: dailyLimit }) };
  } catch (err) {
    console.error("[Broadcast] Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=client-email-broadcast.js.map
