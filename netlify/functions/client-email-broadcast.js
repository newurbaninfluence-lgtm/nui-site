// client-email-broadcast.js — Warm Outreach to Client List
// Uses Hostinger SMTP (already configured) — NO new services needed
// Sends value-first emails to crm_contacts (Bravo Graphix legacy + NUI clients)
// Schedule: Tue + Thu 10am ET (netlify.toml)
// Rotates through 6 email angles — never sends same angle twice in a row
// 7-day cooldown per contact — no one gets two emails in the same week

const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SMTP_USER    = process.env.HOSTINGER_EMAIL;
const SMTP_PASS    = process.env.HOSTINGER_PASSWORD;
const MAIL_FROM    = process.env.MAIL_FROM || SMTP_USER;
const DAILY_LIMIT  = 80; // Hostinger safe send limit per run

const sbH = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};


// ── Email angles — rotate through all 6 before repeating ──────────────────
const EMAIL_ANGLES = [
  {
    id: 'reconnect',
    subject: (name) => `${name}, it's been a minute — Faren here`,
    html: (firstName, company) => `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.7;">
<div style="background:#111;padding:28px 24px;text-align:center;">
<span style="font-family:Georgia,sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
<p>Hey ${firstName},</p>
<p>It's Faren Young. You worked with me back when I was running Bravo Graphix — wanted to reach out and reconnect.</p>
<p>A lot has changed since then. We rebranded to <strong>New Urban Influence</strong> and expanded into full digital infrastructure — websites, AI systems, brand strategy, and marketing automation built specifically for Detroit small businesses.</p>
<p>If ${company ? company + ' is' : "you're"} still doing your thing, I'd love to see where you are now and find out if there's anything we can help with. No pitch — just a real conversation.</p>
<p>Reply to this email or book a free 15-min call below.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Book a Free Call →</a>
</div>
<p style="color:#555;font-size:14px;">— Faren Young<br>New Urban Influence<br>Detroit, MI · (248) 487-8747</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;">
New Urban Influence · Detroit, MI · <a href="https://newurbaninfluence.com" style="color:#D90429;">newurbaninfluence.com</a><br>
<a href="https://newurbaninfluence.com/unsubscribe" style="color:#999;">Unsubscribe</a>
</div>
</div>`
  },
  {
    id: 'value_tip',
    subject: (name) => `${name} — 3 things killing Detroit business visibility right now`,
    html: (firstName, company) => `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.7;">
<div style="background:#111;padding:28px 24px;text-align:center;">
<span style="font-family:Georgia,sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
<p>Hey ${firstName},</p>
<p>Quick one — three things I keep seeing that are hurting Detroit businesses right now:</p>
<p><strong>1. Google Business Profile is outdated.</strong> Most owners set it up once and never touched it again. Google Maps ranking drops fast when your profile looks abandoned.</p>
<p><strong>2. No follow-up system.</strong> A lead contacts you, you're busy, they don't hear back for 24 hours. They already booked someone else. This is fixable with automation.</p>
<p><strong>3. Brand looks different everywhere.</strong> Your Instagram looks nothing like your website, which looks nothing like your business card. Customers don't trust inconsistency.</p>
<p>Any of these sound familiar for ${company || 'your business'}? Reply and I'll tell you the fastest fix for each one.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Let's Fix It →</a>
</div>
<p style="color:#555;font-size:14px;">— Faren Young · New Urban Influence · Detroit</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;">
<a href="https://newurbaninfluence.com/unsubscribe" style="color:#999;">Unsubscribe</a>
</div>
</div>`
  },
  {
    id: 'social_proof',
    subject: (name) => `What changed for a Detroit business in 90 days`,
    html: (firstName, company) => `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.7;">
<div style="background:#111;padding:28px 24px;text-align:center;">
<span style="font-family:Georgia,sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
<p>Hey ${firstName},</p>
<p>Wanted to share what happened with one of our clients — a Detroit service business that came to us earlier this year.</p>
<p><strong>The problem:</strong> Invisible on Google, missing calls because they were always on the job, no consistent social presence.</p>
<p><strong>What we built:</strong> A Digital HQ — website with lead capture, AI phone staff that answers every call and books appointments automatically, and daily social content going out without them touching it.</p>
<p><strong>90 days later:</strong> Showing up in the top 3 on Google Maps for their service area. Zero missed leads. Brand looks like a real company.</p>
<p>This is what we do for Detroit businesses now. If ${company || 'your business'} needs any of this, I'm one reply away.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">See What's Possible →</a>
</div>
<p style="color:#555;font-size:14px;">— Faren · New Urban Influence</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;">
<a href="https://newurbaninfluence.com/unsubscribe" style="color:#999;">Unsubscribe</a>
</div>
</div>`
  },
  {
    id: 'ai_angle',
    subject: (name) => `${name} — AI is answering calls for Detroit businesses right now`,
    html: (firstName, company) => `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.7;">
<div style="background:#111;padding:28px 24px;text-align:center;">
<span style="font-family:Georgia,sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
<p>Hey ${firstName},</p>
<p>Not sure if you've looked into AI for your business yet, but I want to show you something real — not hype.</p>
<p>We're building what we call <strong>Digital Staff</strong> for Detroit businesses. An AI that picks up your phone 24/7, knows your business, answers questions, and books appointments — for $197/month.</p>
<p>That's less than one day of part-time payroll. And it never calls in sick.</p>
<p>Most of the businesses we set this up for say the biggest shock is finding out how many leads they were losing after hours. People call at 8pm and you're done for the day — now every one of those calls gets handled.</p>
<p>Would that solve a real problem for ${company || 'your business'}? Reply and I'll show you exactly how it works.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">See How It Works →</a>
</div>
<p style="color:#555;font-size:14px;">— Faren · New Urban Influence · Detroit</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;">
<a href="https://newurbaninfluence.com/unsubscribe" style="color:#999;">Unsubscribe</a>
</div>
</div>`
  },
  {
    id: 'free_audit',
    subject: (name) => `${name} — free brand audit for Detroit businesses this week`,
    html: (firstName, company) => `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.7;">
<div style="background:#111;padding:28px 24px;text-align:center;">
<span style="font-family:Georgia,sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
<p>Hey ${firstName},</p>
<p>This week we're doing free brand and digital audits for a handful of Detroit businesses — no strings attached.</p>
<p>Here's what you get: I look at your current branding, website, Google presence, and social media and tell you exactly what's working, what's hurting you, and what the fastest fix would be. 15 minutes on a call.</p>
<p>We do these because a lot of businesses don't know what they're missing until someone actually shows them. And sometimes the fix is cheap or free — it's just about knowing where to look.</p>
<p>${company ? 'I'd love to take a look at ' + company + '.' : "I'd love to take a look at your business."} Reply to this email or grab a time below.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Book Your Free Audit →</a>
</div>
<p style="color:#555;font-size:14px;">— Faren · New Urban Influence</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;">
<a href="https://newurbaninfluence.com/unsubscribe" style="color:#999;">Unsubscribe</a>
</div>
</div>`
  },
  {
    id: 'detroit_pride',
    subject: (name) => `Detroit businesses are winning right now — are you?`,
    html: (firstName, company) => `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a1a1a;line-height:1.7;">
<div style="background:#111;padding:28px 24px;text-align:center;">
<span style="font-family:Georgia,sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:2px;">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
</div>
<div style="padding:32px 24px;">
<p>Hey ${firstName},</p>
<p>Detroit is having a real moment right now. Small businesses that built strong brands and digital infrastructure coming out of the rough years are the ones growing the fastest.</p>
<p>The ones that are struggling are the ones that still rely only on word of mouth, have a website nobody can find, and haven't figured out how to use technology without it taking over their life.</p>
<p>We help Detroit businesses close that gap — branding, websites, AI automation, Google Maps visibility. We're not a big agency. We're built for exactly the kind of business ${company || 'you're running'}.</p>
<p>If now is the time to level up, I want to help. Book a free call and let's talk.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Let's Talk →</a>
</div>
<p style="color:#555;font-size:14px;">— Faren · New Urban Influence · Detroit 313</p>
</div>
<div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#999;">
<a href="https://newurbaninfluence.com/unsubscribe" style="color:#999;">Unsubscribe</a>
</div>
</div>`
  }
];


// ── Get next angle to use (round-robin, no repeat) ────────────────────────
async function getNextAngle() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs?agent_id=eq.email_broadcast&order=created_at.desc&limit=6`, { headers: sbH });
    const logs = await r.json();
    const used = (logs || []).map(l => l.metadata?.angle_id).filter(Boolean);
    return EMAIL_ANGLES.find(a => !used.includes(a.id)) || EMAIL_ANGLES[0];
  } catch { return EMAIL_ANGLES[0]; }
}

// ── Get contacts to email (7-day cooldown, status filter) ─────────────────
async function getContactBatch(limit) {
  const cooldown = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  // Get contacts with email who haven't been broadcast-emailed in 7 days
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/crm_contacts?email=not.is.null&status=in.(cold_lead,new_lead,warm_lead)&select=id,first_name,last_name,company,email&order=last_broadcast_at.asc.nullsfirst&limit=${limit}`,
    { headers: sbH }
  );
  const contacts = await r.json();
  // Filter out anyone emailed in last 7 days
  return (contacts || []).filter(c => !c.last_broadcast_at || new Date(c.last_broadcast_at) < new Date(cooldown));
}

// ── Log email sent ─────────────────────────────────────────────────────────
async function markEmailed(contactId, subject, angleId) {
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ last_broadcast_at: new Date().toISOString(), last_broadcast_subject: subject })
  }).catch(() => {});
  await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
    method: 'POST',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ channel: 'email', direction: 'outbound', subject, client_id: contactId, metadata: { handler: 'client-email-broadcast', angle_id: angleId }, created_at: new Date().toISOString() })
  }).catch(() => {});
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const isManual = event.httpMethod === 'POST';

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[Broadcast] SMTP not configured');
    return { statusCode: 500, body: JSON.stringify({ error: 'SMTP not configured' }) };
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  const body = isManual ? JSON.parse(event.body || '{}') : {};
  const limit = body.limit || DAILY_LIMIT;

  try {
    const angle = await getNextAngle();
    const contacts = await getContactBatch(limit);

    if (contacts.length === 0) {
      console.log('[Broadcast] No contacts ready — all on cooldown or no eligible contacts');
      return { statusCode: 200, body: JSON.stringify({ success: true, sent: 0, reason: 'no_eligible_contacts' }) };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com', port: 465, secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    let sent = 0, failed = 0;

    for (const contact of contacts) {
      const firstName = contact.first_name || 'there';
      const company = contact.company || null;
      const subject = angle.subject(firstName);
      const html = angle.html(firstName, company);

      try {
        await transporter.sendMail({
          from: `"Faren Young | New Urban Influence" <${SMTP_USER}>`,
          to: contact.email,
          subject,
          html,
          replyTo: MAIL_FROM
        });
        await markEmailed(contact.id, subject, angle.id);
        sent++;
        // Natural delay between sends
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.warn(`[Broadcast] Failed ${contact.email}:`, e.message);
        failed++;
      }
    }

    // Log run
    await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
      method: 'POST',
      headers: { ...sbH, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ agent_id: 'email_broadcast', status: 'success', metadata: { angle_id: angle.id, subject_preview: angle.subject('Test'), sent, failed, total_eligible: contacts.length }, created_at: new Date().toISOString() })
    }).catch(() => {});

    console.log(`[Broadcast] Done — ${sent} sent, ${failed} failed. Angle: ${angle.id}`);
    return { statusCode: 200, body: JSON.stringify({ success: true, sent, failed, angle: angle.id }) };

  } catch (err) {
    console.error('[Broadcast] Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
