// ═══════════════════════════════════════════════════════════════
// MONTY ADMIN — AI Command Center for NUI Admin Panel
// Natural language in → System actions out
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Monty, the AI assistant for New Urban Influence (NUI), a Detroit-based branding and print agency.

You help the admin (Faren) manage the business by executing commands against the NUI system.

AVAILABLE ACTIONS (return as JSON array):

1. add_contact — Add a new client/contact
   { "action": "add_contact", "data": { "name": "...", "email": "...", "phone": "...", "company": "...", "industry": "...", "source": "...", "notes": "..." } }

2. create_job — Create a new job on the kanban board
   { "action": "create_job", "data": { "client_name": "...", "client_id": "...", "title": "...", "type": "branding|print|design", "status": "new", "services": [...], "notes": "...", "priority": "normal|high|urgent" } }

3. create_moodboard — Initialize a moodboard for a client
   { "action": "create_moodboard", "data": { "client_name": "...", "client_id": "...", "job_id": "...", "style_notes": "...", "industry": "..." } }

4. create_brand_guide — Initialize a brand guide
   { "action": "create_brand_guide", "data": { "client_name": "...", "client_id": "...", "job_id": "...", "business_name": "...", "industry": "..." } }

5. add_print_order — Create a print request
   { "action": "add_print_order", "data": { "client_name": "...", "client_email": "...", "product": "...", "quantity": "...", "details": "...", "price_shown": "...", "design_needed": true/false } }

6. send_email — Send email to a client
   { "action": "send_email", "data": { "to": "...", "subject": "...", "body": "..." } }

7. send_sms — Send SMS to a client
   { "action": "send_sms", "data": { "to": "...", "message": "..." } }

8. lookup_contact — Search for a client
   { "action": "lookup_contact", "data": { "query": "..." } }

9. update_job_status — Move a job to a new stage
   { "action": "update_job_status", "data": { "job_id": "...", "status": "new|inprogress|review|done" } }

10. list_jobs — List current jobs
    { "action": "list_jobs", "data": { "status": "all|new|inprogress|review|done" } }

11. add_note — Add a note/activity to a contact
    { "action": "add_note", "data": { "client_id": "...", "client_name": "...", "note": "..." } }

INDUSTRY OPTIONS: trades, marine, farming, manufacturing, bars, authors, apparel, tax, tech, events

RULES:
- Always return a JSON object with: { "actions": [...], "response": "human-friendly summary" }
- You can chain multiple actions in one response
- If info is missing, ask for it in the "response" field and return empty actions array
- For lookups, return the action and say you're searching
- Generate reasonable IDs using Date.now() when needed
- Keep responses conversational and brief
- If you can infer info (like industry from business type), do it
- Prices should use NUI standard markup (2.5x wholesale)`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { message, context } = JSON.parse(event.body);
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    let parsed;

    if (ANTHROPIC_KEY) {
      // ═══ MODE 1: Claude API — Full NL understanding ═══
      const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
      const aiRes = await (await fetch)('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            ...(context || []),
            { role: 'user', content: message }
          ]
        })
      });
      const aiData = await aiRes.json();
      const aiText = aiData.content?.[0]?.text || '{}';

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = aiText;
      const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      // Also try to find raw JSON object
      if (!jsonMatch) {
        const objMatch = aiText.match(/\{[\s\S]*"actions"[\s\S]*\}/);
        if (objMatch) jsonStr = objMatch[0];
      }

      try {
        parsed = JSON.parse(jsonStr.trim());
      } catch(e) {
        parsed = { actions: [], response: aiText };
      }
    } else {
      // ═══ MODE 2: Smart Pattern Matcher — No API key ═══
      parsed = parseCommand(message);
    }

    // ═══ EXECUTE ACTIONS ═══
    const results = [];
    const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

    for (const action of (parsed.actions || [])) {
      try {
        switch (action.action) {

          case 'add_contact': {
            const d = action.data;
            const id = 'c_' + Date.now();
            if (SB_URL && SB_KEY) {
              await (await fetch)(`${SB_URL}/rest/v1/contacts`, {
                method: 'POST',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
                body: JSON.stringify({
                  id, name: d.name, email: d.email || null, phone: d.phone || null,
                  company: d.company || null, industry: d.industry || null,
                  source: d.source || 'monty', notes: d.notes || null,
                  tags: d.tags || [], status: 'active',
                  created_at: new Date().toISOString()
                })
              });
            }
            results.push({ action: 'add_contact', success: true, id, name: d.name });
            break;
          }

          case 'create_job': {
            const d = action.data;
            const id = 'j_' + Date.now();
            if (SB_URL && SB_KEY) {
              await (await fetch)(`${SB_URL}/rest/v1/jobs`, {
                method: 'POST',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                  id, client_name: d.client_name, client_id: d.client_id || null,
                  title: d.title, type: d.type || 'branding', status: d.status || 'new',
                  services: d.services || [], notes: d.notes || null,
                  priority: d.priority || 'normal',
                  created_at: new Date().toISOString()
                })
              });
            }
            results.push({ action: 'create_job', success: true, id, title: d.title });
            break;
          }

          case 'create_moodboard': {
            const d = action.data;
            const id = 'mb_' + Date.now();
            if (SB_URL && SB_KEY) {
              await (await fetch)(`${SB_URL}/rest/v1/moodboards`, {
                method: 'POST',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                  id, client_name: d.client_name, client_id: d.client_id || null,
                  job_id: d.job_id || null, style_notes: d.style_notes || '',
                  industry: d.industry || '', items: [], status: 'draft',
                  created_at: new Date().toISOString()
                })
              });
            }
            results.push({ action: 'create_moodboard', success: true, id });
            break;
          }

          case 'create_brand_guide': {
            const d = action.data;
            const id = 'bg_' + Date.now();
            if (SB_URL && SB_KEY) {
              await (await fetch)(`${SB_URL}/rest/v1/brand_guides`, {
                method: 'POST',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                  id, client_name: d.client_name, client_id: d.client_id || null,
                  job_id: d.job_id || null, business_name: d.business_name || d.client_name,
                  industry: d.industry || '', status: 'draft', sections: {},
                  created_at: new Date().toISOString()
                })
              });
            }
            results.push({ action: 'create_brand_guide', success: true, id });
            break;
          }

          case 'add_print_order': {
            const d = action.data;
            if (SB_URL && SB_KEY) {
              await (await fetch)(`${SB_URL}/rest/v1/print_requests`, {
                method: 'POST',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                  client_name: d.client_name, client_email: d.client_email || null,
                  product: d.product, details: d.details || d.quantity || '',
                  price_shown: d.price_shown || 'TBD', status: 'new',
                  source: 'monty-admin',
                  created_at: new Date().toISOString()
                })
              });
            }
            results.push({ action: 'add_print_order', success: true, product: d.product });
            break;
          }

          case 'lookup_contact': {
            const d = action.data;
            if (SB_URL && SB_KEY) {
              const searchRes = await (await fetch)(`${SB_URL}/rest/v1/contacts?or=(name.ilike.*${encodeURIComponent(d.query)}*,email.ilike.*${encodeURIComponent(d.query)}*,company.ilike.*${encodeURIComponent(d.query)}*)&limit=5`, {
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
              });
              const contacts = await searchRes.json();
              results.push({ action: 'lookup_contact', success: true, contacts });
            }
            break;
          }

          case 'list_jobs': {
            const d = action.data;
            if (SB_URL && SB_KEY) {
              let url = `${SB_URL}/rest/v1/jobs?order=created_at.desc&limit=20`;
              if (d.status && d.status !== 'all') url += `&status=eq.${d.status}`;
              const jobsRes = await (await fetch)(url, {
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
              });
              const jobs = await jobsRes.json();
              results.push({ action: 'list_jobs', success: true, jobs });
            }
            break;
          }

          case 'update_job_status': {
            const d = action.data;
            if (SB_URL && SB_KEY && d.job_id) {
              await (await fetch)(`${SB_URL}/rest/v1/jobs?id=eq.${d.job_id}`, {
                method: 'PATCH',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: d.status, updated_at: new Date().toISOString() })
              });
              results.push({ action: 'update_job_status', success: true, job_id: d.job_id, status: d.status });
            }
            break;
          }

          case 'send_email': {
            const d = action.data;
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.hostinger.com',
              port: parseInt(process.env.SMTP_PORT || '465'), secure: true,
              auth: { user: process.env.SMTP_USER || process.env.EMAIL_USER, pass: process.env.SMTP_PASS || process.env.EMAIL_PASS }
            });
            await transporter.sendMail({
              from: `"New Urban Influence" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
              to: d.to, subject: d.subject,
              html: `<div style="font-family:Arial,sans-serif;background:#111;color:#fff;padding:32px;border-radius:12px"><img src="https://newurbaninfluence.com/logo-nav-cropped.png" height="32" style="margin-bottom:16px"><div style="white-space:pre-wrap;line-height:1.7">${d.body}</div><hr style="border:none;border-top:1px solid #333;margin:24px 0"><p style="color:#666;font-size:12px">New Urban Influence · Detroit, MI · (248) 487-8747</p></div>`
            });
            results.push({ action: 'send_email', success: true, to: d.to });
            break;
          }

          case 'send_sms': {
            const d = action.data;
            const smsRes = await (await fetch)(`https://api.openphone.com/v1/messages`, {
              method: 'POST',
              headers: { 'Authorization': process.env.OPENPHONE_API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ from: process.env.OPENPHONE_NUMBER || '+12484878747', to: [d.to], content: d.message })
            });
            results.push({ action: 'send_sms', success: smsRes.ok, to: d.to });
            break;
          }

          case 'add_note': {
            const d = action.data;
            if (SB_URL && SB_KEY) {
              await (await fetch)(`${SB_URL}/rest/v1/activity_log`, {
                method: 'POST',
                headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({
                  type: 'note', message: d.note,
                  metadata: { client_id: d.client_id, client_name: d.client_name, source: 'monty' },
                  created_at: new Date().toISOString()
                })
              });
            }
            results.push({ action: 'add_note', success: true });
            break;
          }
        }
      } catch (actionErr) {
        results.push({ action: action.action, success: false, error: actionErr.message });
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        response: parsed.response || 'Done.',
        actions: parsed.actions || [],
        results,
        mode: ANTHROPIC_KEY ? 'ai' : 'pattern'
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};

// ═══════════════════════════════════════════════════════════════
// SMART PATTERN MATCHER — Works without API key
// ═══════════════════════════════════════════════════════════════
function parseCommand(msg) {
  const m = msg.toLowerCase();
  const actions = [];
  let response = '';

  // ── ADD CLIENT ──
  if (m.includes('add') && (m.includes('client') || m.includes('contact'))) {
    const nameMatch = msg.match(/(?:add|new)\s+(?:client|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    const emailMatch = msg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = msg.match(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
    const industryMatch = msg.match(/(?:industry|type|field)[:\s]+(\w+)/i);

    if (nameMatch) {
      actions.push({
        action: 'add_contact',
        data: {
          name: nameMatch[1],
          email: emailMatch ? emailMatch[1] : null,
          phone: phoneMatch ? phoneMatch[1] : null,
          industry: industryMatch ? industryMatch[1] : null,
          source: 'monty'
        }
      });
      response = `Adding ${nameMatch[1]} to the system.`;
    } else {
      response = "I can add a client — what's their name? (Include email/phone if you have it)";
    }
  }

  // ── CREATE JOB ──
  else if ((m.includes('create') || m.includes('start') || m.includes('new')) && (m.includes('job') || m.includes('project'))) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    const typeMatch = m.includes('print') ? 'print' : m.includes('brand') ? 'branding' : 'design';
    const servicesFound = [];
    if (m.includes('logo')) servicesFound.push('logo');
    if (m.includes('card') || m.includes('business card')) servicesFound.push('business cards');
    if (m.includes('banner')) servicesFound.push('banners');
    if (m.includes('brand')) servicesFound.push('brand identity');
    if (m.includes('website') || m.includes('site')) servicesFound.push('website');
    if (m.includes('flyer')) servicesFound.push('flyers');
    if (m.includes('sign')) servicesFound.push('signage');

    if (forMatch) {
      actions.push({
        action: 'create_job',
        data: {
          client_name: forMatch[1],
          title: `${typeMatch.charAt(0).toUpperCase() + typeMatch.slice(1)} — ${forMatch[1]}`,
          type: typeMatch,
          services: servicesFound,
          status: 'new',
          priority: m.includes('urgent') || m.includes('rush') ? 'urgent' : m.includes('high') ? 'high' : 'normal'
        }
      });
      response = `Created a new ${typeMatch} job for ${forMatch[1]}${servicesFound.length ? ' with: ' + servicesFound.join(', ') : ''}.`;
    } else {
      response = "I can create a job — who's the client?";
    }
  }

  // ── MOODBOARD ──
  else if (m.includes('moodboard') || m.includes('mood board')) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (forMatch) {
      actions.push({ action: 'create_moodboard', data: { client_name: forMatch[1], style_notes: msg } });
      response = `Moodboard initialized for ${forMatch[1]}. You can open it in the Moodboards panel.`;
    } else {
      response = "Creating a moodboard — for which client?";
    }
  }

  // ── BRAND GUIDE ──
  else if (m.includes('brand guide') || m.includes('brandguide')) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (forMatch) {
      actions.push({ action: 'create_brand_guide', data: { client_name: forMatch[1], business_name: forMatch[1] } });
      response = `Brand guide created for ${forMatch[1]}. Head to Brand Guide panel to edit.`;
    } else {
      response = "Starting a brand guide — who's the client?";
    }
  }

  // ── SEND EMAIL ──
  else if (m.includes('email') && (m.includes('send') || m.includes('tell') || m.includes('let'))) {
    const emailMatch = msg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const bodyMatch = msg.match(/(?:say|tell|message|body|that)\s+["""']?(.+?)["""']?\s*$/i);
      actions.push({ action: 'send_email', data: { to: emailMatch[1], subject: 'Message from NUI', body: bodyMatch ? bodyMatch[1] : msg } });
      response = `Email sent to ${emailMatch[1]}.`;
    } else {
      response = "I need an email address to send to.";
    }
  }

  // ── LOOKUP ──
  else if (m.includes('find') || m.includes('look up') || m.includes('search') || m.includes('who is')) {
    const queryMatch = msg.match(/(?:find|look\s*up|search|who\s+is)\s+(.+)/i);
    if (queryMatch) {
      actions.push({ action: 'lookup_contact', data: { query: queryMatch[1].trim() } });
      response = `Searching for "${queryMatch[1].trim()}"...`;
    }
  }

  // ── LIST JOBS ──
  else if (m.includes('list') && m.includes('job') || m.includes('show') && m.includes('job') || m.includes('what') && m.includes('job')) {
    const status = m.includes('new') ? 'new' : m.includes('progress') ? 'inprogress' : m.includes('review') ? 'review' : m.includes('done') ? 'done' : 'all';
    actions.push({ action: 'list_jobs', data: { status } });
    response = `Pulling ${status === 'all' ? 'all' : status} jobs...`;
  }

  // ── PRINT ORDER ──
  else if (m.includes('print') && (m.includes('order') || m.includes('need') || m.includes('want') || m.includes('getting'))) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    const products = [];
    if (m.includes('card')) products.push('business cards');
    if (m.includes('banner')) products.push('banners');
    if (m.includes('sign') || m.includes('yard')) products.push('yard signs');
    if (m.includes('flyer')) products.push('flyers');
    if (m.includes('wrap')) products.push('vehicle wrap');
    if (m.includes('retract')) products.push('retractable banner');

    if (forMatch && products.length) {
      actions.push({ action: 'add_print_order', data: { client_name: forMatch[1], product: products.join(', '), details: msg, design_needed: m.includes('design') } });
      response = `Print order added for ${forMatch[1]}: ${products.join(', ')}.`;
    } else {
      response = `I can add a print order — who's the client and what do they need?`;
    }
  }

  // ── FALLBACK ──
  else {
    response = `I can help with:\n• **Add client** — "Add client John Smith john@email.com"\n• **Create job** — "Start a branding job for John Smith with logo and cards"\n• **Moodboard** — "Create moodboard for John Smith"\n• **Brand guide** — "Start brand guide for John Smith"\n• **Print order** — "John Smith needs 500 business cards and 2 banners"\n• **Send email** — "Email john@test.com say your proofs are ready"\n• **Find client** — "Look up John Smith"\n• **List jobs** — "Show all active jobs"\n\nJust tell me what you need!`;
  }

  return { actions, response };
}
