// save-submission.js — Netlify Function
// Saves form submissions / service intake to Supabase
// Fires: (1) auto-reply to client, (2) setup checklist email to Faren
// POST { serviceId, serviceName, price, contactName, email, phone, businessName, ... }

const nodemailer = require('nodemailer');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OP_KEY        = process.env.OPENPHONE_API_KEY;
const OP_FROM       = process.env.OPENPHONE_PHONE_NUMBER;
const ADMIN_EMAIL   = process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL;

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};


// ── Service setup checklists ────────────────────────────────────────────────
const SERVICE_CHECKLISTS = {
  'blueprint': {
    label: 'The Blueprint (Brand Identity)',
    setup: [
      'Create client folder in Obsidian → 01-CLIENTS',
      'Add client to admin portal + set status to Active',
      'Send brand questionnaire via client portal',
      'Schedule discovery/strategy call within 48 hrs',
      'Set up project in admin-orders with deliverables checklist'
    ],
    credentials: ['None needed — all brand files delivered to client'],
    day30report: 'Brand concepts presented, revision round 1 complete, client approval status',
    upsell: 'Digital HQ — "Your brand is built. Now build the system it runs on."'
  },
  'brand-kit': {
    label: 'Brand Kit ($1,500)',
    setup: [
      'Create client folder in Obsidian → 01-CLIENTS',
      'Add to admin portal, set status Active',
      'Send brand questionnaire link',
      'Schedule 30-min discovery call'
    ],
    credentials: ['None'],
    day30report: 'Logo concepts delivered, revision status, final files ETA',
    upsell: 'Digital HQ Lite — "Your brand is ready. Now build the website it deserves."'
  },
  'digital-hq': {
    label: 'Digital HQ (Website + Business System)',
    setup: [
      'Create GitHub repo under newurbaninfluence-lgtm org',
      'Set up Netlify site + connect GitHub auto-deploy',
      'Create Supabase project if needed (pause jcgvkyizoimwbolhfpta first if on free plan)',
      'Get client domain info — add A record + CNAME via their registrar',
      'Add entry to client_sites table in Supabase',
      'Inject status check script + NUI footer backlink into site',
      'Set up client record in admin portal'
    ],
    credentials: [
      'Client domain registrar login OR have them add DNS records themselves',
      'Client business email (for SMTP setup if needed)',
      'Any existing CRM or booking tool logins'
    ],
    day30report: 'Site live confirmation, lead capture test results, Google Business Profile status, first leads captured count',
    upsell: 'Digital Staff — "Your HQ is live. Now hire the AI staff to run it."'
  },
  'digital-staff': {
    label: 'Digital Staff (AI Business Automation)',
    setup: [
      'Confirm client has HQ Lite minimum — do not proceed without it',
      'Set up OpenPhone sub-number for client if doing Digital Secretary',
      'Program brand voice scripts (pull from brand questionnaire)',
      'Wire Lead Catcher to client website contact form + GBP',
      'Set up Ghostwriter with client CRM access',
      'Configure Money Reporter — set weekly delivery day',
      'Test all positions with sample leads before going live'
    ],
    credentials: [
      'Client OpenPhone number (or set up new sub-number)',
      'Client Google Business Profile access',
      'Client social media DM access if doing Lead Catcher'
    ],
    day30report: 'Calls answered count, leads captured, follow-up response times, appointments booked, Ghostwriter emails sent',
    upsell: 'Digital Promotion Team Content Crew — "Staff is running. Now give them something to promote."'
  },
  'digital-secretary': {
    label: 'Digital Secretary ($197/mo)',
    setup: [
      'Confirm client has HQ Lite',
      'Set up OpenPhone sub-number',
      'Program brand voice: tone, scripts, FAQs, decision rules',
      'Test with 5 sample call scenarios before go-live',
      'Set escalation rules — what goes to client vs handles itself'
    ],
    credentials: ['Client phone forwarding setup'],
    day30report: 'Total calls answered, leads captured from calls, appointments booked, escalations to client',
    upsell: 'Add Lead Catcher + Ghostwriter — "Secretary handles calls. Now catch every lead from every other channel."'
  },
  'content-crew': {
    label: 'Digital Promotion Team — Content Crew',
    setup: [
      'Get Instagram + Facebook manager access (not login — add NUI as partner)',
      'Build 30-day content calendar in social planner',
      'Source or shoot initial content batch (minimum 10 pieces)',
      'Set up posting schedule in admin-social-planner.js',
      'Program content pillars based on client brand voice doc'
    ],
    credentials: [
      'Instagram Business account — add @newurbaninfluence as partner manager',
      'Facebook Business Manager — add NUI as partner'
    ],
    day30report: 'Posts published count, reach, engagement rate, follower growth, top performing post',
    upsell: 'Digital Promoter + Watchman — "People are seeing your content. Now find out who they are."'
  },
  'block-captain': {
    label: 'Block Captain — Geo-Fencing',
    setup: [
      'Confirm client has HQ Command',
      'Define fence zones with client (competitor locations, event venues, territory)',
      'Set up programmatic ad campaigns via DSP platform',
      'Create ad creatives (minimum 3 variations per zone)',
      'Set 30-day retargeting window',
      'Configure conversion tracking'
    ],
    credentials: ['None — runs outside Facebook/Google ad systems'],
    day30report: 'Impressions by zone, clicks, click-through rate, conversions tracked, cost per conversion',
    upsell: 'Neighborhood Captain — "You are targeting people at competitor locations. Now dominate the map when they search from home."'
  },
  'neighborhood-captain': {
    label: 'Neighborhood Captain — Geo-Grid (Google Maps)',
    setup: [
      'Confirm client has HQ Command',
      'Run initial geo-grid scan across service territory',
      'Audit Google Business Profile — NAP consistency check',
      'Submit to all relevant local citations',
      'Begin weekly grid scans — log in geo-grid-scans table',
      'Build out service area pages on HQ'
    ],
    credentials: ['Google Business Profile owner/manager access'],
    day30report: 'Grid rank vs day 1, zip codes moved up, citations added, GBP views and actions',
    upsell: 'Block Captain — "You are ranking on Maps. Now target people at competitor locations with ads."'
  },
  'publicist': {
    label: 'The Publicist (NUI Magazine Feature)',
    setup: [
      'Schedule 30-min discovery interview with client',
      'Write 800-1,200 word editorial profile',
      'Send draft to client for approval (never publish without sign-off)',
      'Publish to /magazine on NUI site',
      'Export "As Featured In NUI Magazine" badge — send to client',
      'Post social announcement from NUI accounts'
    ],
    credentials: ['None'],
    day30report: 'Feature URL, Google index status, social announcement reach, badge delivered',
    upsell: 'Digital HQ — "Your credibility is established. Now build the system that converts it."'
  },
  'event-team': {
    label: 'The Event Team (Day-Rate Lead Capture)',
    setup: [
      'Confirm event date, location, and booth setup time',
      'Create branded photo overlay ($150 add-on if first time)',
      'Set up digital sign-in form wired to Supabase',
      'Test SMS photo delivery system before event day',
      'Configure push notification opt-in gate',
      'Prepare lead export — CRM sync if client has HQ Standard+'
    ],
    credentials: ['None — standalone service'],
    day30report: 'Total leads captured, push opt-ins, SMS delivery rate, store link clicks, post-event follow-up status',
    upsell: 'Digital Promotion Team — "You captured the leads. Now activate them with SMS, push, and retargeting."'
  },
  'print': {
    label: 'Print & Packaging',
    setup: [
      'Get brand files from client (or check if Blueprint client — files already on file)',
      'Confirm print specs: size, quantity, finish',
      'Confirm delivery address',
      'Send proof for approval before printing',
      'Place print order — $10 overnight Michigan shipping'
    ],
    credentials: ['None'],
    day30report: 'Delivered confirmation, client feedback',
    upsell: 'Blueprint or Digital HQ — "Print looks great. Now make sure the brand and website match."'
  }
};

function getChecklist(serviceName) {
  if (!serviceName) return SERVICE_CHECKLISTS['blueprint'];
  const s = serviceName.toLowerCase();
  if (s.includes('blueprint') || s.includes('brand kit') || s.includes('brand identity')) return SERVICE_CHECKLISTS['brand-kit'];
  if (s.includes('digital hq') || s.includes('hq lite') || s.includes('hq standard') || s.includes('hq command') || s.includes('website')) return SERVICE_CHECKLISTS['digital-hq'];
  if (s.includes('secretary')) return SERVICE_CHECKLISTS['digital-secretary'];
  if (s.includes('digital staff') || s.includes('full staff')) return SERVICE_CHECKLISTS['digital-staff'];
  if (s.includes('content crew') || s.includes('street team') || s.includes('promotion team') || s.includes('posted up') || s.includes('loaded')) return SERVICE_CHECKLISTS['content-crew'];
  if (s.includes('block captain') || s.includes('geo-fenc') || s.includes('geofenc')) return SERVICE_CHECKLISTS['block-captain'];
  if (s.includes('neighborhood captain') || s.includes('geo-grid') || s.includes('geogrid')) return SERVICE_CHECKLISTS['neighborhood-captain'];
  if (s.includes('publicist') || s.includes('press') || s.includes('magazine') || s.includes('feature')) return SERVICE_CHECKLISTS['publicist'];
  if (s.includes('event team') || s.includes('event')) return SERVICE_CHECKLISTS['event-team'];
  if (s.includes('print') || s.includes('packaging')) return SERVICE_CHECKLISTS['print'];
  return SERVICE_CHECKLISTS['blueprint'];
}


// ── Send setup email to Faren ──────────────────────────────────────────────
async function notifyFarenSetup(submission) {
  if (!ADMIN_EMAIL) return;
  const checklist = getChecklist(submission.service_name);
  const setupHTML = checklist.setup.map((s, i) => `<li style="padding:6px 0;color:#ccc;font-size:14px;"><span style="color:#C9A227;font-weight:700;">${i+1}.</span> ${s}</li>`).join('');
  const credsHTML = checklist.credentials.map(c => `<li style="padding:4px 0;color:#ccc;font-size:13px;">• ${c}</li>`).join('');

  const html = `
<div style="font-family:-apple-system,sans-serif;max-width:650px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;">
<div style="background:#D90429;padding:24px 32px;">
<h2 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🔔 New Service Inquiry</h2>
<p style="margin:6px 0 0;opacity:0.85;font-size:14px;">${new Date().toLocaleString('en-US', {timeZone:'America/Detroit'})}</p>
</div>
<div style="padding:32px;">
<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
<tr><td style="padding:8px 0;color:#888;font-size:13px;width:120px;">Client</td><td style="padding:8px 0;color:#fff;font-weight:600;font-size:15px;">${submission.contact_name || 'Unknown'}</td></tr>
<tr><td style="padding:8px 0;color:#888;font-size:13px;">Business</td><td style="padding:8px 0;color:#fff;font-size:14px;">${submission.business_name || '—'}</td></tr>
<tr><td style="padding:8px 0;color:#888;font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${submission.email}" style="color:#C9A227;">${submission.email || '—'}</a></td></tr>
<tr><td style="padding:8px 0;color:#888;font-size:13px;">Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${submission.phone}" style="color:#C9A227;">${submission.phone || '—'}</a></td></tr>
<tr><td style="padding:8px 0;color:#888;font-size:13px;">Industry</td><td style="padding:8px 0;color:#fff;font-size:14px;">${submission.industry || '—'}</td></tr>
<tr><td style="padding:8px 0;color:#888;font-size:13px;">Service</td><td style="padding:8px 0;font-size:15px;font-weight:700;color:#D90429;">${checklist.label}</td></tr>
</table>
<div style="background:#111;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
<h3 style="margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;">⚡ Your Setup Checklist</h3>
<ol style="margin:0;padding-left:0;list-style:none;">${setupHTML}</ol>
</div>
<div style="background:#111;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
<h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;">🔑 Credentials Needed</h3>
<ul style="margin:0;padding:0;list-style:none;">${credsHTML}</ul>
</div>
<div style="background:#111;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
<h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;">📊 Day 30 Report to Send Client</h3>
<p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${checklist.day30report}</p>
</div>
<div style="background:#1a1a0a;border:1px solid #C9A227;border-radius:8px;padding:16px 20px;">
<h3 style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#C9A227;">💡 90-Day Upsell Path</h3>
<p style="margin:0;color:#fff;font-size:14px;font-style:italic;">${checklist.upsell}</p>
</div>
</div>
<div style="padding:16px 32px;border-top:1px solid #1a1a1a;text-align:center;">
<a href="https://newurbaninfluence.com/app/#clients" style="color:#D90429;font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none;text-transform:uppercase;">Open Admin Portal →</a>
</div>
</div>`;

  try {
    const mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465, secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await mailer.sendMail({
      from: `"NUI System" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔔 New Inquiry: ${checklist.label} — ${submission.contact_name || 'Unknown'} (${submission.business_name || ''})`,
      html
    });
    console.log('[Admin Notify] Setup email sent to Faren');
  } catch (e) {
    console.warn('[Admin Notify] Failed:', e.message);
  }
}


// ── Generate AI reply ─────────────────────────────────────────────────────
async function generateReply(type, context) {
  const prompts = {
    email: `You are responding on behalf of New Urban Influence (NUI), a Detroit branding and AI automation agency founded by Faren Young. Voice: "Talk like the block, move like the boardroom." Bold, direct, no fluff.

A potential client just submitted an inquiry. Write a warm, direct email reply that:
- Acknowledges their specific interest
- Positions NUI as the right choice without being corporate
- Gives a clear next step (book a free call: https://newurbaninfluence.com/contact)
- Sounds like Faren wrote it — confident, Detroit-grounded

Context: ${context}
Write ONLY the email body (no subject line). Under 150 words.`,
    sms: `Write a 1-sentence SMS from New Urban Influence. Someone just submitted an inquiry. Sound real and warm. Under 160 chars. End with "- Faren". Context: ${context}`
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: type === 'email' ? 300 : 100,
      messages: [{ role: 'user', content: prompts[type] }] })
  });
  const d = await res.json();
  return d.content?.[0]?.text?.trim() || null;
}

async function sendEmail(toEmail, toName, emailBody) {
  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com', port: 465, secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await mailer.sendMail({
    from: `"Faren Young | NUI" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Re: Your inquiry to New Urban Influence`,
    text: emailBody,
    html: `<div style="font-family:sans-serif;max-width:600px;line-height:1.6;">${emailBody.replace(/\n/g,'<br>')}<br><br><img src="https://newurbaninfluence.com/assets/images/nui-logo.png" alt="NUI" style="height:40px;"><br><a href="https://newurbaninfluence.com/contact" style="background:#D90429;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:10px;">Book a Free Strategy Call</a></div>`
  });
}

async function sendSms(toPhone, message) {
  await fetch('https://api.openphone.com/v1/messages', {
    method: 'POST',
    headers: { 'Authorization': OP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message, from: OP_FROM, to: [toPhone] })
  });
}

async function markReplied(submissionId, results) {
  await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submissionId}`, {
    method: 'PATCH',
    headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ auto_replied: true, auto_replied_at: new Date().toISOString(), reply_results: results })
  }).catch(e => console.warn('markReplied failed:', e.message));
}

async function triggerAutomation(submission) {
  const context = [
    `Name: ${submission.contact_name || 'Unknown'}`,
    `Email: ${submission.email || 'none'}`,
    `Phone: ${submission.phone || 'none'}`,
    `Service interest: ${submission.service_name || 'general inquiry'}`,
    `Business: ${submission.business_name || 'not provided'}`,
    `Industry: ${submission.industry || 'not provided'}`
  ].join('. ');

  const results = { email: false, sms: false };

  if (submission.email && ANTHROPIC_KEY) {
    try {
      const emailBody = await generateReply('email', context);
      if (emailBody) { await sendEmail(submission.email, submission.contact_name, emailBody); results.email = true; }
    } catch (e) { console.warn('[AutoReply] Email failed:', e.message); }
  }

  if (submission.phone && OP_KEY && OP_FROM && ANTHROPIC_KEY) {
    try {
      const smsBody = await generateReply('sms', context);
      if (smsBody) { await sendSms(submission.phone, smsBody); results.sms = true; }
    } catch (e) { console.warn('[AutoReply] SMS failed:', e.message); }
  }

  // Notify Faren with setup checklist
  await notifyFarenSetup(submission);

  await markReplied(submission.id, results);
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!SUPABASE_URL || !SUPABASE_KEY) return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };

  try {
    const data = JSON.parse(event.body || '{}');

    const submissionResp = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST', headers: sbHeaders,
      body: JSON.stringify({
        service_id: data.serviceId || null, service_name: data.serviceName || '',
        price: data.price || null, contact_name: data.contactName || data.clientName || '',
        email: data.email || '', phone: data.phone || data.clientPhone || '',
        business_name: data.businessName || '', industry: data.industry || '',
        website: data.website || '', status: 'new', auto_replied: false,
        metadata: data, created_at: new Date().toISOString()
      })
    });

    if (!submissionResp.ok) {
      const errBody = await submissionResp.text();
      throw new Error(`Submission save failed: ${submissionResp.status} - ${errBody}`);
    }

    const [submission] = await submissionResp.json();

    fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        name: data.contactName || data.clientName || data.businessName || 'Unknown',
        email: data.email || '', phone: data.phone || data.clientPhone || '',
        business_name: data.businessName || '', source: 'website_intake',
        service_interest: data.serviceName || '', status: 'new',
        submission_id: submission.id, created_at: new Date().toISOString()
      })
    }).catch(e => console.warn('Lead creation failed:', e.message));

    // Log 90-day upsell trigger date in client record
    if (data.clientId) {
      const upsellDate = new Date();
      upsellDate.setDate(upsellDate.getDate() + 90);
      fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${data.clientId}`, {
        method: 'PATCH',
        headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          upsell_trigger_date: upsellDate.toISOString(),
          current_service: data.serviceName || '',
          service_started_at: new Date().toISOString()
        })
      }).catch(e => console.warn('Client upsell date failed:', e.message));
    }

    triggerAutomation(submission).catch(e => console.warn('[AutoReply] Automation error:', e.message));

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true, id: submission.id, submission }) };

  } catch (err) {
    console.error('save-submission error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message || 'Submission save failed' }) };
  }
};
