// ═══════════════════════════════════════════════════════════════
// MONTY ADMIN — AI Command Center for NUI Admin Panel
// Natural language in → System actions out
// v2: Graceful fallback, real error handling, verified executions
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Monty, the AI assistant for New Urban Influence (NUI), a Detroit-based branding and print agency.
You help the admin (Faren) manage the business by executing commands against the NUI system.

AVAILABLE ACTIONS (return as JSON array):

1. add_contact — Add a new client/contact
   { "action": "add_contact", "data": { "name": "...", "email": "...", "phone": "...", "company": "...", "industry": "...", "source": "...", "notes": "..." } }

2. create_job — Create a new job on the kanban board
   { "action": "create_job", "data": { "client_name": "...", "client_id": "...", "title": "...", "type": "branding|print|design|web", "status": "new|inprogress|review|done", "services": [...], "notes": "...", "priority": "normal|high|urgent", "price": "...", "paid": "...", "retainer": "..." } }

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

10. list_jobs — List current jobs (optionally filter by client_name or status)
    { "action": "list_jobs", "data": { "status": "all|new|inprogress|review|done", "client_name": "..." } }

11. add_note — Add a note/activity to a contact
    { "action": "add_note", "data": { "contact_id": "...", "client_name": "...", "note": "...", "type": "note|payment|meeting|call" } }

INDUSTRY OPTIONS: trades, marine, farming, manufacturing, bars, authors, apparel, tax, tech, events

RULES:
- Always return a JSON object with: { "actions": [...], "response": "human-friendly summary" }
- You can chain multiple actions in one response
- If info is missing, ask for it in the "response" field and return empty actions array
- For lookups, return the action and say you're searching
- Keep responses conversational and brief
- If you can infer info (like industry from business type), do it
- When creating multiple jobs for one client, chain add_contact + multiple create_job actions
- Include payment/pricing info in job notes when provided`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  try {
    const { message, context } = JSON.parse(event.body);
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    let parsed;
    let mode = 'pattern';

    // ═══ TRY AI MODE FIRST, FALL BACK TO PATTERN ═══
    if (ANTHROPIC_KEY) {
      try {
        const fetchMod = await import('node-fetch');
        const fetch = fetchMod.default;
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
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

        if (!aiRes.ok) {
          // API returned error (rate limit, usage exceeded, etc) — fall back
          console.log('Anthropic API error, falling back to pattern mode:', aiRes.status);
          parsed = parseCommand(message);
          mode = 'pattern-fallback';
        } else {
          const aiData = await aiRes.json();
          const aiText = aiData.content?.[0]?.text || '';

          if (!aiText) {
            parsed = parseCommand(message);
            mode = 'pattern-fallback';
          } else {
            // Extract JSON from response
            let jsonStr = aiText;
            const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) jsonStr = jsonMatch[1];
            if (!jsonMatch) {
              const objMatch = aiText.match(/\{[\s\S]*"actions"[\s\S]*\}/);
              if (objMatch) jsonStr = objMatch[0];
            }

            try {
              parsed = JSON.parse(jsonStr.trim());
              mode = 'ai';
            } catch(e) {
              // AI returned text but not valid JSON — use text as response
              parsed = { actions: [], response: aiText };
              mode = 'ai';
            }
          }
        }
      } catch (aiErr) {
        // Network error, timeout, etc — fall back to pattern
        console.log('AI mode failed, falling back:', aiErr.message);
        parsed = parseCommand(message);
        mode = 'pattern-fallback';
      }
    } else {
      parsed = parseCommand(message);
    }

    // ═══ EXECUTE ACTIONS AGAINST SUPABASE ═══
    const results = [];
    const fetchMod = await import('node-fetch');
    const fetch = fetchMod.default;

    // Helper for Supabase calls
    const sbFetch = async (path, opts = {}) => {
      if (!SB_URL || !SB_KEY) throw new Error('Database not connected');
      const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
        ...opts,
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': opts.prefer || 'return=representation',
          ...(opts.headers || {})
        }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = data?.message || data?.error || data?.details || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }
      return data;
    };


    for (const action of (parsed.actions || [])) {
      try {
        switch (action.action) {

          case 'add_contact': {
            const d = action.data;
            const id = 'c_' + Date.now();
            const data = await sbFetch('contacts', {
              method: 'POST',
              body: JSON.stringify({
                id, name: d.name, email: d.email || null, phone: d.phone || null,
                company: d.company || null, industry: d.industry || null,
                source: d.source || 'monty', notes: d.notes || null,
                tags: d.tags || [], status: d.status || 'active',
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'add_contact', success: true, id, name: d.name });
            break;
          }

          case 'create_job': {
            const d = action.data;
            const id = 'j_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
            const data = await sbFetch('jobs', {
              method: 'POST',
              body: JSON.stringify({
                id, client_name: d.client_name, client_id: d.client_id || null,
                title: d.title, type: d.type || 'branding', status: d.status || 'new',
                services: d.services || [], notes: d.notes || null,
                priority: d.priority || 'normal',
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'create_job', success: true, id, title: d.title });
            break;
          }

          case 'create_moodboard': {
            const d = action.data;
            const id = 'mb_' + Date.now();
            const data = await sbFetch('moodboards', {
              method: 'POST',
              body: JSON.stringify({
                id, client_name: d.client_name, client_id: d.client_id || null,
                job_id: d.job_id || null, style_notes: d.style_notes || '',
                industry: d.industry || '', items: [], status: 'draft',
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'create_moodboard', success: true, id });
            break;
          }

          case 'create_brand_guide': {
            const d = action.data;
            const id = 'bg_' + Date.now();
            const data = await sbFetch('brand_guides', {
              method: 'POST',
              body: JSON.stringify({
                id, client_name: d.client_name, client_id: d.client_id || null,
                job_id: d.job_id || null, business_name: d.business_name || d.client_name,
                industry: d.industry || '', status: 'draft', sections: {},
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'create_brand_guide', success: true, id });
            break;
          }

          case 'add_print_order': {
            const d = action.data;
            const data = await sbFetch('print_requests', {
              method: 'POST',
              body: JSON.stringify({
                client_name: d.client_name, client_email: d.client_email || null,
                product: d.product, details: d.details || d.quantity || '',
                price_shown: d.price_shown || 'TBD', status: 'new',
                source: 'monty-admin',
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'add_print_order', success: true, product: d.product });
            break;
          }

          case 'lookup_contact': {
            const d = action.data;
            const q = encodeURIComponent(d.query);
            const data = await sbFetch(`contacts?or=(name.ilike.*${q}*,email.ilike.*${q}*,company.ilike.*${q}*)&limit=10`);
            const found = Array.isArray(data) && data.length > 0;
            results.push({ 
              action: 'lookup_contact', success: found, 
              contacts: found ? data : [], query: d.query,
              message: found ? `Found ${data.length} result(s)` : `No contacts found matching "${d.query}"`
            });
            break;
          }

          case 'list_jobs': {
            const d = action.data;
            let url = 'jobs?order=created_at.desc&limit=20';
            if (d.status && d.status !== 'all') url += `&status=eq.${d.status}`;
            if (d.client_name) url += `&client_name=ilike.*${encodeURIComponent(d.client_name)}*`;
            const data = await sbFetch(url);
            const found = Array.isArray(data) && data.length > 0;
            results.push({ action: 'list_jobs', success: found, jobs: found ? data : [], message: found ? `Found ${data.length} job(s)` : 'No jobs found' });
            break;
          }

          case 'update_job_status': {
            const d = action.data;
            if (!d.job_id) throw new Error('No job_id provided');
            await sbFetch(`jobs?id=eq.${d.job_id}`, {
              method: 'PATCH',
              body: JSON.stringify({ status: d.status, updated_at: new Date().toISOString() })
            });
            results.push({ action: 'update_job_status', success: true, job_id: d.job_id, status: d.status });
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
            const smsRes = await fetch('https://api.openphone.com/v1/messages', {
              method: 'POST',
              headers: { 'Authorization': process.env.OPENPHONE_API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ from: process.env.OPENPHONE_NUMBER || '+12484878747', to: [d.to], content: d.message })
            });
            if (!smsRes.ok) throw new Error(`SMS failed: ${smsRes.status}`);
            results.push({ action: 'send_sms', success: true, to: d.to });
            break;
          }

          case 'add_note': {
            const d = action.data;
            await sbFetch('activity_log', {
              method: 'POST',
              prefer: 'return=minimal',
              body: JSON.stringify({
                type: d.type || 'note', message: d.note,
                contact_id: d.contact_id || null,
                metadata: { client_name: d.client_name, source: 'monty' },
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'add_note', success: true, note: d.note?.slice(0, 50) });
            break;
          }
        }
      } catch (actionErr) {
        results.push({ action: action.action, success: false, error: actionErr.message });
      }
    }

    // ═══ CHECK IF ANYTHING ACTUALLY HAPPENED ═══
    const anySuccess = results.some(r => r.success);
    const anyFailed = results.some(r => !r.success);
    let finalResponse = parsed.response || '';
    
    if (results.length === 0 && !finalResponse) {
      finalResponse = "I didn't catch a specific command there. Try something like 'add client John Smith' or 'create branding job for John'.";
    } else if (anyFailed && !anySuccess) {
      finalResponse += (finalResponse ? '\n\n' : '') + '⚠️ Actions failed — check the error details below.';
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        response: finalResponse,
        actions: parsed.actions || [],
        results,
        mode
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message, response: '⚠️ Something went wrong: ' + err.message }) };
  }
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
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
    const nameMatch = msg.match(/(?:add|new)\s+(?:client|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const emailMatch = msg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = msg.match(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
    const industryMatch = msg.match(/(?:industry|type|field)[:\s]+(\w+)/i);
    const companyMatch = msg.match(/(?:company|business|brand)[:\s]+(.+?)(?:\s*[-–—,]|\s*$)/i);

    if (nameMatch) {
      actions.push({
        action: 'add_contact',
        data: {
          name: nameMatch[1].trim(),
          email: emailMatch ? emailMatch[1] : null,
          phone: phoneMatch ? phoneMatch[1] : null,
          company: companyMatch ? companyMatch[1].trim() : null,
          industry: industryMatch ? industryMatch[1] : null,
          source: 'monty'
        }
      });
      response = `Adding ${nameMatch[1].trim()} to contacts.`;
    } else {
      response = "I can add a client — what's their name? (Include email/phone if you have it)";
    }
  }

  // ── CREATE JOB ──
  else if ((m.includes('create') || m.includes('start') || m.includes('new')) && (m.includes('job') || m.includes('project'))) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const titleMatch = msg.match(/(?:called|titled|named)\s+["']?(.+?)["']?(?:\s+for|\s*$)/i);
    const typeMatch = m.includes('print') ? 'print' : m.includes('web') ? 'web' : m.includes('brand') ? 'branding' : 'design';
    const servicesFound = [];
    if (m.includes('logo')) servicesFound.push('logo');
    if (m.includes('card') || m.includes('business card')) servicesFound.push('business cards');
    if (m.includes('banner')) servicesFound.push('banners');
    if (m.includes('brand kit') || m.includes('brand identity') || m.includes('branding kit')) servicesFound.push('brand identity');
    if (m.includes('website') || m.includes('site')) servicesFound.push('website');
    if (m.includes('flyer')) servicesFound.push('flyers');
    if (m.includes('sign')) servicesFound.push('signage');
    if (m.includes('social')) servicesFound.push('social media');

    if (forMatch) {
      const clientName = forMatch[1].trim();
      const title = titleMatch ? titleMatch[1] : `${typeMatch.charAt(0).toUpperCase() + typeMatch.slice(1)} — ${clientName}`;
      actions.push({
        action: 'create_job',
        data: {
          client_name: clientName,
          title,
          type: typeMatch,
          services: servicesFound.length ? servicesFound : [typeMatch],
          status: 'new',
          priority: m.includes('urgent') || m.includes('rush') ? 'urgent' : m.includes('high') ? 'high' : 'normal',
          notes: msg
        }
      });
      response = `Created ${typeMatch} job for ${clientName}${servicesFound.length ? ': ' + servicesFound.join(', ') : ''}.`;
    } else {
      response = "I can create a job — who's the client?";
    }
  }

  // ── MOODBOARD ──
  else if (m.includes('moodboard') || m.includes('mood board')) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (forMatch) {
      actions.push({ action: 'create_moodboard', data: { client_name: forMatch[1].trim(), style_notes: msg } });
      response = `Moodboard initialized for ${forMatch[1].trim()}.`;
    } else {
      response = "Creating a moodboard — for which client?";
    }
  }

  // ── BRAND GUIDE ──
  else if (m.includes('brand guide') || m.includes('brandguide')) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (forMatch) {
      actions.push({ action: 'create_brand_guide', data: { client_name: forMatch[1].trim(), business_name: forMatch[1].trim() } });
      response = `Brand guide created for ${forMatch[1].trim()}.`;
    } else {
      response = "Starting a brand guide — who's the client?";
    }
  }

  // ── SEND EMAIL ──
  else if (m.includes('email') && (m.includes('send') || m.includes('tell') || m.includes('let'))) {
    const emailMatch = msg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const bodyMatch = msg.match(/(?:say|tell|message|body|that)\s+[""']?(.+?)[""']?\s*$/i);
      actions.push({ action: 'send_email', data: { to: emailMatch[1], subject: 'Message from NUI', body: bodyMatch ? bodyMatch[1] : msg } });
      response = `Sending email to ${emailMatch[1]}.`;
    } else {
      response = "I need an email address to send to.";
    }
  }

  // ── SEND SMS ──
  else if (m.includes('text') || m.includes('sms')) {
    const phoneMatch = msg.match(/(\+?1?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
    if (phoneMatch) {
      const bodyMatch = msg.match(/(?:say|tell|message)\s+[""']?(.+?)[""']?\s*$/i);
      actions.push({ action: 'send_sms', data: { to: phoneMatch[1], message: bodyMatch ? bodyMatch[1] : 'Message from NUI' } });
      response = `Sending SMS to ${phoneMatch[1]}.`;
    } else {
      response = "I need a phone number to text.";
    }
  }

  // ── LOOKUP ──
  else if (m.includes('find') || m.includes('look up') || m.includes('lookup') || m.includes('search') || m.includes('who is') || m.includes('show me')) {
    const queryMatch = msg.match(/(?:find|look\s*up|lookup|search|who\s+is|show\s+me)\s+(?:client\s+|contact\s+)?(.+)/i);
    if (queryMatch) {
      const query = queryMatch[1].replace(/['"]/g, '').trim();
      actions.push({ action: 'lookup_contact', data: { query } });
      response = `Searching for "${query}"...`;
    }
  }

  // ── LIST JOBS ──
  else if ((m.includes('list') || m.includes('show') || m.includes('what')) && (m.includes('job') || m.includes('project'))) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const status = m.includes('new') ? 'new' : m.includes('progress') ? 'inprogress' : m.includes('review') ? 'review' : m.includes('done') || m.includes('complete') ? 'done' : 'all';
    const data = { status };
    if (forMatch) data.client_name = forMatch[1].trim();
    actions.push({ action: 'list_jobs', data });
    response = `Pulling ${data.client_name ? data.client_name + "'s " : ''}${status === 'all' ? 'all' : status} jobs...`;
  }

  // ── PRINT ORDER ──
  else if (m.includes('print') && (m.includes('order') || m.includes('need') || m.includes('want') || m.includes('getting'))) {
    const forMatch = msg.match(/(?:for|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const products = [];
    if (m.includes('card')) products.push('business cards');
    if (m.includes('banner')) products.push('banners');
    if (m.includes('sign') || m.includes('yard')) products.push('yard signs');
    if (m.includes('flyer')) products.push('flyers');
    if (m.includes('wrap')) products.push('vehicle wrap');
    if (m.includes('retract')) products.push('retractable banner');
    if (m.includes('sticker')) products.push('stickers');
    if (m.includes('poster')) products.push('posters');

    if (forMatch && products.length) {
      actions.push({ action: 'add_print_order', data: { client_name: forMatch[1].trim(), product: products.join(', '), details: msg, design_needed: m.includes('design') } });
      response = `Print order added for ${forMatch[1].trim()}: ${products.join(', ')}.`;
    } else {
      response = 'I can add a print order — who\'s the client and what do they need?';
    }
  }

  // ── ADD NOTE ──
  else if (m.includes('note') && (m.includes('add') || m.includes('log'))) {
    const forMatch = msg.match(/(?:for|about|on|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const noteMatch = msg.match(/(?:note|log)[:\s]+(.+)/i);
    if (forMatch && noteMatch) {
      actions.push({ action: 'add_note', data: { client_name: forMatch[1].trim(), note: noteMatch[1].trim() } });
      response = `Note added for ${forMatch[1].trim()}.`;
    } else {
      response = "I can add a note — who's it for and what should it say?";
    }
  }

  // ── FALLBACK ──
  else {
    response = `I can help with:\n• **Add client** — "Add client John Smith john@email.com"\n• **Create job** — "Create branding job for John Smith with logo and cards"\n• **Find client** — "Find Damian" or "Look up John"\n• **List jobs** — "Show all jobs" or "List jobs for Damian"\n• **Moodboard** — "Create moodboard for John"\n• **Print order** — "Print order for John: 500 business cards"\n• **Send email** — "Email john@test.com say your proofs are ready"\n• **Add note** — "Add note for John: deposit received $500"\n\nJust tell me what you need!`;
  }

  return { actions, response };
}
