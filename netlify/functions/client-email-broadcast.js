// client-email-broadcast.js — Email Warmup + Outreach v2
// EMAIL WARMUP MODE: 10 emails/day max. Slow ramp to build sender reputation.
// Tracks opens, clicks, bounces. Working unsubscribe. Verifies email format.
// Uses Hostinger SMTP — no new services needed.
// Schedule: daily 10am ET (netlify.toml)

const nodemailer = require('nodemailer');
const dns = require('dns').promises;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SMTP_USER    = process.env.HOSTINGER_EMAIL;
const SMTP_PASS    = process.env.HOSTINGER_PASSWORD;
const MAIL_FROM    = process.env.MAIL_FROM || SMTP_USER;
const SITE_URL     = 'https://newurbaninfluence.com';

// ── WARMUP SCHEDULE — increase slowly over weeks ──────────────────────────
// Week 1-2: 10/day | Week 3-4: 20/day | Week 5+: 40/day
// Check run count from agent_logs to auto-ramp
const WARMUP_RAMP = [
  { runsMin: 0,  runsMax: 14, limit: 10 },
  { runsMin: 14, runsMax: 28, limit: 20 },
  { runsMin: 28, runsMax: 99, limit: 40 }
];

const sbH = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};


// ── Get daily limit based on warmup ramp ──────────────────────────────────
async function getDailyLimit() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs?agent_id=eq.email_broadcast&status=eq.success&select=id`, { headers: sbH });
    const logs = await r.json();
    const totalRuns = (logs || []).length;
    const tier = WARMUP_RAMP.find(t => totalRuns >= t.runsMin && totalRuns < t.runsMax);
    return tier ? tier.limit : 10;
  } catch { return 10; }
}

// ── Verify email domain has MX records (basic check) ─────────────────────
async function verifyEmailDomain(email) {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch { return false; }
}

// ── Get next angle (rotate through 6 before repeating) ───────────────────
const ANGLE_IDS = ['reconnect', 'value_tip', 'social_proof', 'ai_angle', 'free_audit', 'detroit_pride'];
async function getNextAngle() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/agent_logs?agent_id=eq.email_broadcast&order=created_at.desc&limit=6`, { headers: sbH });
    const logs = await r.json();
    const used = (logs || []).map(l => l.metadata?.angle_id).filter(Boolean);
    return ANGLE_IDS.find(id => !used.includes(id)) || ANGLE_IDS[0];
  } catch { return 'reconnect'; }
}

// ── Get next batch of contacts ────────────────────────────────────────────
async function getContactBatch(limit) {
  const cooldown = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/crm_contacts?email=not.is.null&email_unsubscribed=eq.false&email_bounced=eq.false&status=in.(cold_lead,new_lead,warm_lead)&select=id,first_name,last_name,company,email,last_broadcast_at&order=last_broadcast_at.asc.nullsfirst&limit=${limit * 3}`,
    { headers: sbH }
  );
  const all = await r.json();
  return (all || []).filter(c => !c.last_broadcast_at || new Date(c.last_broadcast_at) < new Date(cooldown)).slice(0, limit);
}


// ── Build tracked HTML email ──────────────────────────────────────────────
// Two templates available:
//   'bold'  — V1 Bold Signature  (branded hero, dual CTA, Promotions-tab optimized)
//   'plain' — V3 Hybrid Plain    (looks like a 1:1 email, Primary-tab optimized)
function buildEmail(contactId, sendId, angleId, firstName, company, template = 'bold') {
  const trackBase = `${SITE_URL}/.netlify/functions/email-track`;
  const pixelUrl = `${trackBase}?cid=${contactId}&id=${sendId}`;
  const unsubUrl = `${SITE_URL}/.netlify/functions/unsubscribe?cid=${contactId}`;

  const trackLink = (url) =>
    `${trackBase}?cid=${contactId}&id=${sendId}&url=${encodeURIComponent(url)}`;

  const ctaUrl   = trackLink(`${SITE_URL}/contact`);
  const learnUrl = trackLink(SITE_URL);
  const co = company || 'your business';

  // Each angle has two variants:
  //   bold  — branded, HTML-heavy, longer, formal subject
  //   plain — conversational, short, lowercase subject, single link
  const angles = {
    reconnect: {
      bold: {
        subject: `${firstName}, it's been a minute — Faren here`,
        body: `<p>Hey ${firstName},</p>
<p>It's Faren Young — you worked with me when I was running Bravo Graphix. Wanted to reach out and reconnect.</p>
<p>A lot has changed. We rebranded to <strong>New Urban Influence</strong> and now build full digital infrastructure for Detroit businesses — websites, AI phone staff, brand strategy, and marketing automation.</p>
<p>If ${co} is still going strong, I'd love to hear about it and see if there's anything we can help with. No pitch — just a real conversation.</p>`,
        pullQuote: 'Stop renting attention. Own your system.',
        ctaText: 'Book my free audit'
      },
      plain: {
        subject: `quick hello, ${firstName.toLowerCase()}`,
        body: `Hey ${firstName},\n\nFaren Young here — small world, we used to work together when I ran Bravo Graphix.\n\nI'm not selling anything today. Just running free 15-minute audits for a handful of Detroit businesses this week. Looking at your site, your Google profile, your social — telling you what's working and what's leaking money.\n\nWorth 15 minutes if it shows you one thing you didn't know about ${co}?`,
        linkText: "Here's my calendar"
      }
    },
    value_tip: {
      bold: {
        subject: `${firstName} — 3 things hurting Detroit businesses right now`,
        body: `<p>Hey ${firstName},</p>
<p>Three things I keep seeing hurt Detroit businesses:</p>
<p><strong>1. Outdated Google Business Profile.</strong> Set it up once and never touched it. Maps ranking drops fast when it looks abandoned.</p>
<p><strong>2. No follow-up system.</strong> Lead contacts you, you're busy, 24 hours pass. They already booked someone else.</p>
<p><strong>3. Inconsistent brand.</strong> Instagram looks nothing like the website. Customers don't trust inconsistency.</p>
<p>Any of these sound familiar for ${co}? Reply and I'll tell you the fastest fix.</p>`,
        pullQuote: 'Small fixes. Big leverage.',
        ctaText: 'Show me the fix'
      },
      plain: {
        subject: `3 things hurting detroit businesses`,
        body: `Hey ${firstName},\n\nThree patterns I keep seeing hurt Detroit businesses:\n\n1. Google Business Profile set up once and forgotten. Ranking drops fast.\n2. No follow-up system. Lead comes in, 24 hours pass, they book someone else.\n3. Brand looks one way on Instagram, another way on the website. Customers don't trust inconsistency.\n\nAny of these sound familiar at ${co}? Reply and I'll tell you the fastest fix.`,
        linkText: 'Or book 15 minutes'
      }
    },
    social_proof: {
      bold: {
        subject: `What changed for a Detroit business in 90 days`,
        body: `<p>Hey ${firstName},</p>
<p>Quick story — a Detroit service business came to us earlier this year. Invisible on Google, missing after-hours calls, no consistent presence.</p>
<p>We built them a Digital HQ: lead capture website, AI phone staff that answers and books 24/7, daily social content on autopilot.</p>
<p>90 days later: top 3 on Google Maps, zero missed leads, brand looks like a real company.</p>
<p>That's what we do for Detroit businesses now. If ${co} needs any of this, I'm one reply away.</p>`,
        pullQuote: '90 days. Same city. Different results.',
        ctaText: 'See how we did it'
      },
      plain: {
        subject: `90 days, detroit business, big shift`,
        body: `Hey ${firstName},\n\nQuick story. Detroit service business came to us earlier this year — invisible on Google, missing after-hours calls, no consistent presence.\n\nWe built them a Digital HQ: lead capture site, AI phone staff answering 24/7, social on autopilot.\n\n90 days later — top 3 on Google Maps, zero missed leads, brand looks real.\n\nIf ${co} needs any of that, I'm one reply away.`,
        linkText: 'See what we built them'
      }
    },
    ai_angle: {
      bold: {
        subject: `${firstName} — AI is answering calls for Detroit businesses right now`,
        body: `<p>Hey ${firstName},</p>
<p>We built something called Digital Staff for Detroit businesses — an AI that picks up your phone 24/7, knows your business, answers questions, books appointments. $197/month.</p>
<p>Less than one day of part-time payroll. Never calls in sick.</p>
<p>Most owners are shocked by how many leads they were losing after hours. That's fixable now.</p>
<p>Would that solve a real problem for ${co}? Reply and I'll show you exactly how it works.</p>`,
        pullQuote: 'Answers every call. Never sleeps. $197 a month.',
        ctaText: 'See Monty in action'
      },
      plain: {
        subject: `ai answering your phones`,
        body: `Hey ${firstName},\n\nBuilt an AI that picks up the phone 24/7 — knows your business, answers questions, books appointments. $197/month.\n\nLess than one day of part-time payroll. Never calls in sick. Most owners are shocked how many leads they were losing after hours.\n\nWould that fix a real problem at ${co}?`,
        linkText: 'Watch it take a call'
      }
    },
    free_audit: {
      bold: {
        subject: `${firstName} — free brand audit for Detroit businesses this week`,
        body: `<p>Hey ${firstName},</p>
<p>This week I'm doing free brand and digital audits for a handful of Detroit businesses — no strings attached.</p>
<p>I look at your branding, website, Google presence, and social media and tell you what's working, what's hurting you, and the fastest fix. 15 minutes on a call.</p>
<p>I'd love to take a look at ${co}. Reply or grab a time below.</p>`,
        pullQuote: '15 minutes. Zero pitch. Real answers.',
        ctaText: 'Claim my audit'
      },
      plain: {
        subject: `free audit this week, ${firstName.toLowerCase()}?`,
        body: `Hey ${firstName},\n\nRunning free brand + digital audits for a handful of Detroit businesses this week. No strings.\n\nI look at your branding, website, Google presence, social — tell you what's working, what's leaking money, fastest fix. 15 minutes.\n\nWant me to look at ${co}?`,
        linkText: 'Grab a spot'
      }
    },
    detroit_pride: {
      bold: {
        subject: `Detroit businesses are winning right now — are you?`,
        body: `<p>Hey ${firstName},</p>
<p>The Detroit businesses growing fastest right now built strong brands and digital infrastructure coming out of the rough years.</p>
<p>The ones struggling still rely on word of mouth, have a website nobody can find, and haven't figured out how to use technology without it taking over their life.</p>
<p>We help close that gap — branding, websites, AI automation, Google Maps visibility. Built for businesses like ${co}.</p>
<p>If now is the time to level up, I want to help.</p>`,
        pullQuote: 'Detroit is building. Are you?',
        ctaText: 'Build with us'
      },
      plain: {
        subject: `detroit is building`,
        body: `Hey ${firstName},\n\nThe Detroit businesses winning right now built real brands and real digital infrastructure coming out of the rough years. The ones struggling still rely on word of mouth and a website nobody can find.\n\nWe close that gap — branding, websites, AI automation, Maps visibility. Built for businesses like ${co}.\n\nIf now's the time to level up, I want to help.`,
        linkText: 'Let me help'
      }
    }
  };

  const angleSet = angles[angleId] || angles.reconnect;

  if (template === 'plain') {
    return renderPlain(angleSet.plain, { ctaUrl, unsubUrl, pixelUrl });
  }
  return renderBold(angleSet.bold, { ctaUrl, learnUrl, unsubUrl, pixelUrl });
}

function renderBold(a, ctx) {
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;line-height:1.65;background:#fff;">
<div style="height:4px;background:#C9A227;"></div>
<div style="background:#000;padding:28px 24px;">
<div style="font-size:10px;color:#C9A227;letter-spacing:3px;font-weight:700;margin-bottom:8px;">NEW URBAN INFLUENCE &middot; DETROIT</div>
<div style="font-size:22px;color:#fff;font-weight:800;line-height:1.25;letter-spacing:-0.5px;">Designing culture.<br><span style="color:#D90429;">Building influence.</span></div>
</div>
<div style="padding:30px 26px;font-size:15px;">
${a.body}
<p style="margin:18px 0 22px;padding:14px 16px;background:#f8f6ef;border-left:3px solid #C9A227;font-style:italic;font-size:14px;color:#1a1a1a;">&ldquo;${a.pullQuote}&rdquo;</p>
<div style="margin:22px 0;">
<a href="${ctx.ctaUrl}" style="background:#D90429;color:#fff;padding:13px 26px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;letter-spacing:0.3px;">${a.ctaText} &rarr;</a>
<a href="${ctx.learnUrl}" style="color:#000;padding:13px 8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;border-bottom:2px solid #000;margin-left:8px;">See what we built &rarr;</a>
</div>
<p style="font-size:13px;color:#666;margin:8px 0 0;">15 minutes. No pitch. Just a real look at what's hurting your pipeline.</p>
<div style="border-top:1px solid #eee;margin-top:26px;padding-top:18px;">
<p style="margin:0;font-weight:700;font-size:14px;">Faren Young</p>
<p style="margin:0;font-size:13px;color:#666;">Founder, New Urban Influence<br>(248) 487-8747 &middot; newurbaninfluence.com</p>
</div>
</div>
<div style="background:#111;padding:18px 22px;font-size:11px;color:#888;line-height:1.7;">
<div style="color:#C9A227;font-weight:700;letter-spacing:2px;font-size:10px;margin-bottom:6px;">NUI HQ</div>
<div>New Urban Influence &middot; Detroit, MI 48201 &middot; (248) 487-8747</div>
<div style="margin-top:10px;">
<a href="${ctx.unsubUrl}" style="color:#fff;text-decoration:underline;">Unsubscribe</a>
</div>
</div>
<img src="${ctx.pixelUrl}" width="1" height="1" style="display:none;" alt="" />
</div>`;
  return { subject: a.subject, html };
}

function renderPlain(a, ctx) {
  // Paragraph-wrap body: \n\n -> paragraph break, single \n -> <br>
  const paragraphs = a.body.split(/\n\n+/).map(p => {
    const lines = p.split(/\n/).map(l => l.trim()).filter(Boolean);
    return '<p style="margin:0 0 14px;">' + lines.join('<br>') + '</p>';
  }).join('');

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#222;line-height:1.75;font-size:15px;padding:20px 4px;">
${paragraphs}
<p style="margin:0 0 22px;"><a href="${ctx.ctaUrl}" style="color:#D90429;text-decoration:underline;font-weight:600;">${a.linkText} &rarr;</a></p>
<p style="margin:0 0 4px;">&mdash; Faren</p>
<p style="margin:0;font-size:13px;color:#888;">New Urban Influence &middot; Detroit<br>(248) 487-8747</p>
<div style="margin-top:28px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#999;line-height:1.6;">
New Urban Influence &middot; Detroit, MI 48201 &middot; (248) 487-8747<br>
<a href="${ctx.unsubUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
</div>
<img src="${ctx.pixelUrl}" width="1" height="1" style="display:none;" alt="" />
</div>`;
  return { subject: a.subject, html };
}


// ── Log send to Supabase, get send ID back ───────────────────────────────
async function logSend(contactId, subject, angleId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
    method: 'POST',
    headers: { ...sbH, 'Prefer': 'return=representation' },
    body: JSON.stringify({ channel: 'email', direction: 'outbound', subject, client_id: contactId, metadata: { handler: 'client-email-broadcast', angle_id: angleId }, created_at: new Date().toISOString() })
  });
  const rows = await r.json();
  return rows?.[0]?.id || null;
}

async function markContact(contactId, subject, bounced = false, bounceType = null) {
  const updates = { last_broadcast_at: new Date().toISOString(), last_broadcast_subject: subject };
  if (bounced) { updates.email_bounced = true; updates.email_bounce_type = bounceType || 'hard'; }
  else { updates.email_send_count = { _increment: 1 }; }
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH', headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify(updates)
  }).catch(() => {});
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const isManual = event.httpMethod === 'POST';

  if (!SMTP_USER || !SMTP_PASS) return { statusCode: 500, body: JSON.stringify({ error: 'SMTP not configured' }) };
  if (!SUPABASE_URL || !SUPABASE_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'Supabase not configured' }) };

  const body = isManual ? JSON.parse(event.body || '{}') : {};
  const dailyLimit = body.limit || await getDailyLimit();
  const angleId = body.angle || await getNextAngle();

  console.log(`[Broadcast] Starting — limit: ${dailyLimit}, angle: ${angleId}`);

  try {
    const contacts = await getContactBatch(dailyLimit);
    if (contacts.length === 0) {
      console.log('[Broadcast] No eligible contacts');
      return { statusCode: 200, body: JSON.stringify({ success: true, sent: 0, reason: 'no_eligible_contacts' }) };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com', port: 465, secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    let sent = 0, bounced = 0, skipped = 0, failed = 0;
    const results = [];

    for (const contact of contacts) {
      const email = contact.email?.trim().toLowerCase();
      if (!email || !email.includes('@')) { skipped++; continue; }

      // Verify domain MX records
      const valid = await verifyEmailDomain(email);
      if (!valid) {
        console.log(`[Broadcast] Bad MX: ${email} — marking bounced`);
        await markContact(contact.id, 'MX_VERIFY_FAILED', true, 'mx_invalid');
        bounced++;
        results.push({ email, status: 'mx_invalid' });
        continue;
      }

      const sendId = await logSend(contact.id, 'pending', angleId);
      const firstName = contact.first_name || 'there';
      const { subject, html } = buildEmail(contact.id, sendId, angleId, firstName, contact.company);

      // Update subject in communications row
      if (sendId) {
        await fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${sendId}`, {
          method: 'PATCH', headers: { ...sbH, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ subject })
        }).catch(() => {});
      }

      try {
        await transporter.sendMail({
          from: `"Faren Young | New Urban Influence" <${SMTP_USER}>`,
          to: email,
          subject,
          html,
          replyTo: MAIL_FROM,
          headers: {
            'List-Unsubscribe': `<${SITE_URL}/.netlify/functions/unsubscribe?cid=${contact.id}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          }
        });
        await markContact(contact.id, subject);
        sent++;
        results.push({ email, status: 'sent', angle: angleId });
        console.log(`[Broadcast] ✓ ${email}`);
      } catch (e) {
        const isBounce = /bounce|reject|invalid|no such|does not exist|unavailable/i.test(e.message);
        if (isBounce) {
          await markContact(contact.id, subject, true, 'hard');
          bounced++;
          results.push({ email, status: 'bounced', error: e.message.slice(0, 80) });
        } else {
          failed++;
          results.push({ email, status: 'failed', error: e.message.slice(0, 80) });
        }
        console.warn(`[Broadcast] ✗ ${email}:`, e.message.slice(0, 80));
      }

      // Natural delay — don't blast Hostinger
      await new Promise(r => setTimeout(r, 2000));
    }

    // Log run for rotation + ramp tracking
    await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
      method: 'POST', headers: { ...sbH, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ agent_id: 'email_broadcast', status: 'success', metadata: { angle_id: angleId, limit: dailyLimit, sent, bounced, skipped, failed, total_eligible: contacts.length }, created_at: new Date().toISOString() })
    }).catch(() => {});

    console.log(`[Broadcast] Done — sent:${sent} bounced:${bounced} skipped:${skipped} failed:${failed}`);
    return { statusCode: 200, body: JSON.stringify({ success: true, sent, bounced, skipped, failed, angle: angleId, daily_limit: dailyLimit }) };

  } catch (err) {
    console.error('[Broadcast] Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
