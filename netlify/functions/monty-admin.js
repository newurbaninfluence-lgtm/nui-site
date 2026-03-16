
// ═══════════════════════════════════════════════════════════════
// MONTY ADMIN — AI Command Center for NUI Admin Panel
// Natural language in → System actions out
// v2: Graceful fallback, real error handling, verified executions
// ═══════════════════════════════════════════════════════════════

// SYSTEM_PROMPT is now built dynamically per-brand in handler
const BUILD_MONTY_PROMPT = (brand) => `You are Monty, the AI assistant for ${brand.agency_name}${brand.company_city ? ', a creative agency in ' + brand.company_city : ''}.
You help the admin (${brand.founder_name}) manage the business by executing commands against the system.
You operate with speed, precision, and loyalty to ${brand.founder_name}.
Always refer to the agency as "${brand.agency_name}" — never as NUI or New Urban Influence unless that IS the agency.`;

const { getBrand, getFromAddress, buildSmsSystemPrompt } = require('./utils/agency-brand');

// ═══════════════════════════════════════════════════════════════
// MONTY ADMIN — AI Command Center for NUI Admin Panel
// Natural language in → System actions out
// v2: Graceful fallback, real error handling, verified executions
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Monty, the AI assistant for New Urban Influence (NUI), a Detroit-based branding and print agency.
You help the admin (Faren) manage the business by executing commands against the NUI system.

AVAILABLE ACTIONS (return as JSON array):

1. add_contact — Add a new client/contact
   { "action": "add_contact", "data": { "first_name": "...", "last_name": "...", "email": "...", "phone": "...", "company": "...", "industry": "...", "source": "...", "notes": "..." } }

2. create_job — Create a new job on the kanban board
   { "action": "create_job", "data": { "client_name": "...", "client_id": "...", "title": "...", "type": "branding|print|design|web", "status": "new|inprogress|review|done", "services": [...], "notes": "...", "priority": "normal|high|urgent", "price": "...", "paid": "...", "retainer": "..." } }

3. create_moodboard — Initialize a moodboard for a client
   { "action": "create_moodboard", "data": { "client_name": "...", "client_id": "...", "job_id": "...", "style_notes": "...", "industry": "..." } }

4. create_brand_guide — Initialize a brand guide
   { "action": "create_brand_guide", "data": { "client_name": "...", "client_id": "...", "job_id": "...", "business_name": "...", "industry": "..." } }

5. add_print_order — Create a print request
   { "action": "add_print_order", "data": { "client_name": "...", "client_email": "...", "product_name": "...", "quantity": "...", "details": "...", "design_needed": true/false } }

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

12. write_blog_post — Write and publish a blog post to the NUI site
    { "action": "write_blog_post", "data": { "title": "...", "topic": "...", "category": "Branding|Marketing|Design|Business|Detroit", "keywords": ["..."], "tone": "professional|casual|educational", "length": "short|medium|long" } }
    Monty will generate the full post content using AI and publish it to Supabase.

13. post_to_social — Post content to Facebook Page and/or Instagram
    { "action": "post_to_social", "data": { "message": "...", "platform": "facebook|instagram|both", "image_url": "..." } }
    For Instagram, image_url is required. For Facebook, message-only posts are fine.

14. generate_image — Generate an AI image using Google Imagen 3 and show it to the admin
    { "action": "generate_image", "data": { "prompt": "...", "width": 1024, "height": 1024, "post_to": "facebook|instagram|both|none", "caption": "..." } }
    Generates the image, returns a preview URL to show the admin. If post_to is set, also posts it after generation.
    For Facebook covers use width:1640, height:624. For Instagram posts use width:1024, height:1024. For feed posts width:1200, height:630.

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
  // Resolve agency brand — admin Monty can act on behalf of any agency
  let agencyId = null;
  try { const b = JSON.parse(event.body||'{}'); agencyId = b.agency_id||null; } catch(e){}
  const brand = await getBrand(agencyId);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  // ── Auth: soft check — Monty is admin-panel only, already behind admin login ──
  // Full token auth available via NuiAdminAuth if needed in future

  try {
    const { message, context, _raw_caption } = JSON.parse(event.body);
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

    // ── Raw caption mode: just return AI text directly, no action parsing ──
    if (_raw_caption && ANTHROPIC_KEY) {
      const capRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 400, messages: [{ role: 'user', content: message }] })
      });
      const capData = await capRes.json();
      const text = capData.content?.[0]?.text || 'Could not generate caption.';
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ response: text, actions: [], results: [], mode: 'ai' }) };
    }
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    let parsed;
    let mode = 'pattern';

    // ═══ TRY AI MODE FIRST, FALL BACK TO PATTERN ═══
    if (ANTHROPIC_KEY) {
      try {
        const fetchMod = await import('node-fetch');
        const nfetch = fetchMod.default;
        const aiRes = await nfetch('https://api.anthropic.com/v1/messages', {
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
    const nfetch = fetchMod.default;

    // Helper for Supabase calls
    const sbFetch = async (path, opts = {}) => {
      if (!SB_URL || !SB_KEY) throw new Error('Database not connected');
      const res = await nfetch(`${SB_URL}/rest/v1/${path}`, {
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
            // Support both "name" (legacy) and "first_name"/"last_name" (new)
            let firstName = d.first_name || '';
            let lastName = d.last_name || '';
            if (!firstName && d.name) {
              const parts = d.name.trim().split(/\s+/);
              firstName = parts[0] || '';
              lastName = parts.slice(1).join(' ') || '';
            }
            const data = await sbFetch('crm_contacts', {
              method: 'POST',
              body: JSON.stringify({
                first_name: firstName, last_name: lastName,
                email: d.email || null, phone: d.phone || null,
                company: d.company || null, industry: d.industry || null,
                source: d.source || 'monty', notes: d.notes || null,
                tags: d.tags || [], status: d.status || 'active',
                created_at: new Date().toISOString()
              })
            });
            const contactId = Array.isArray(data) && data[0] ? data[0].id : null;
            results.push({ action: 'add_contact', success: true, id: contactId, name: `${firstName} ${lastName}`.trim() });
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
                product_name: d.product || d.product_name, notes: d.details || d.quantity || '',
                quantity: parseInt(d.quantity) || null,
                status: 'new', source: 'monty-admin',
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'add_print_order', success: true, product: d.product || d.product_name });
            break;
          }

          case 'lookup_contact': {
            const d = action.data;
            const q = encodeURIComponent(d.query);
            const data = await sbFetch(`crm_contacts?or=(first_name.ilike.*${q}*,last_name.ilike.*${q}*,email.ilike.*${q}*,company.ilike.*${q}*)&limit=10`);
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
              from: `${brand.agency_name} <${brand.smtp_user || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
              to: d.to, subject: d.subject,
              html: `<div style="font-family:Arial,sans-serif;background:#111;color:#fff;padding:32px;border-radius:12px"><img src="https://newurbaninfluence.com/logo-nav-cropped.png" height="32" style="margin-bottom:16px"><div style="white-space:pre-wrap;line-height:1.7">${d.body}</div><hr style="border:none;border-top:1px solid #333;margin:24px 0"><p style="color:#666;font-size:12px">New Urban Influence · Detroit, MI · (248) 487-8747</p></div>`
            });
            results.push({ action: 'send_email', success: true, to: d.to });
            break;
          }

          case 'send_sms': {
            const d = action.data;
            const keys = (brand._raw && brand._raw.integrations_config) || {};
            const opKey = brand.openphone_key || keys.openphone || (!agencyId ? process.env.OPENPHONE_API_KEY : null);
            const fromNumber = brand.openphone_number || keys.openphone_number || (!agencyId ? process.env.OPENPHONE_NUMBER : null);
            if (!opKey || !fromNumber) throw new Error('OpenPhone not configured for this agency');
            const smsRes = await nfetch('https://api.openphone.com/v1/messages', {
              method: 'POST',
              headers: { 'Authorization': opKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ from: fromNumber, to: [d.to], content: d.message })
            });
            if (!smsRes.ok) throw new Error(`SMS failed: ${smsRes.status}`);

            // Find contact by phone so we can link the activity
            const toDigits = (d.to || '').replace(/\D/g, '').slice(-10);
            let contactId = d.contact_id || null;
            if (!contactId && toDigits.length === 10) {
              const e164 = `+1${toDigits}`;
              const lookupRes = await sbFetch(`crm_contacts?or=(phone.eq.${encodeURIComponent(d.to)},phone.eq.${encodeURIComponent(e164)},phone.eq.${toDigits})&select=id&limit=1`);
              if (Array.isArray(lookupRes) && lookupRes[0]) contactId = lookupRes[0].id;
            }

            // Log to activity_log so Contact Hub sees it
            await sbFetch('activity_log', {
              method: 'POST',
              prefer: 'return=minimal',
              body: JSON.stringify({
                type: 'text',
                event_type: 'sms_sent',
                direction: 'outbound',
                content: d.message,
                contact_id: contactId,
                metadata: { from: fromNumber, to: d.to, source: 'monty', sent_at: new Date().toISOString() },
                created_at: new Date().toISOString()
              })
            });

            // Also log to communications table for Contact Hub SMS tab
            await sbFetch('communications', {
              method: 'POST',
              prefer: 'return=minimal',
              body: JSON.stringify({
                channel: 'sms',
                direction: 'outbound',
                subject: d.message.slice(0, 80),
                body: d.message,
                contact_id: contactId,
                client_id: d.client_id || null,
                metadata: { from: fromNumber, to: d.to, source: 'monty' },
                created_at: new Date().toISOString()
              })
            });

            results.push({ action: 'send_sms', success: true, to: d.to, logged: true });
            break;
          }

          case 'add_note': {
            const d = action.data;
            await sbFetch('activity_log', {
              method: 'POST',
              prefer: 'return=minimal',
              body: JSON.stringify({
                type: d.type || 'note', content: d.note,
                contact_id: d.contact_id || null,
                metadata: { client_name: d.client_name, source: 'monty' },
                created_at: new Date().toISOString()
              })
            });
            results.push({ action: 'add_note', success: true, note: d.note?.slice(0, 50) });
            break;
          }

          case 'write_blog_post': {
            const d = action.data;
            const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
            if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set');

            // Step 1: Generate blog content via Claude
            const wordCount = d.length === 'long' ? 1200 : d.length === 'short' ? 400 : 700;
            const blogPrompt = `Write a ${d.tone || 'professional'} blog post for New Urban Influence, a Detroit branding agency.

Title: "${d.title || d.topic}"
Topic: ${d.topic || d.title}
Category: ${d.category || 'Branding'}
Target keywords: ${(d.keywords || []).join(', ') || 'branding, Detroit, small business'}
Word count: ~${wordCount} words

Format the response as JSON only:
{
  "title": "final SEO title",
  "excerpt": "2-sentence summary under 160 chars",
  "content": "full HTML blog content with <h2>, <p>, <ul> tags",
  "read_time": "X min read"
}

Content must be helpful, NUI-branded, and end with a soft CTA toward booking a strategy call.`;

            const blogAI = await nfetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
              body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: blogPrompt }] })
            });
            const blogData = await blogAI.json();
            let blogText = blogData.content?.[0]?.text || '';
            const jsonMatch = blogText.match(/```(?:json)?\s*([\s\S]*?)```/) || blogText.match(/(\{[\s\S]*\})/);
            let blogPost;
            try { blogPost = JSON.parse(jsonMatch ? jsonMatch[1] : blogText); }
            catch(e) { throw new Error('Blog content generation failed: invalid JSON from AI'); }

            // Step 2: Save to Supabase blog_posts
            const slug = (blogPost.title || d.title || d.topic).toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
            const postId = 'blog_' + Date.now();
            const row = {
              id: postId, slug, title: blogPost.title || d.title,
              excerpt: blogPost.excerpt || '', category: d.category || 'Branding',
              image: d.image || '', author: 'Faren Young',
              author_image: '', date: new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
              read_time: blogPost.read_time || '5 min read',
              content: blogPost.content || '', published: true,
              updated_at: new Date().toISOString()
            };
            await sbFetch('blog_posts?on_conflict=id', {
              method: 'POST',
              headers: { 'Prefer': 'resolution=merge-duplicates' },
              body: JSON.stringify(row)
            });
            results.push({ action: 'write_blog_post', success: true, id: postId, slug, title: row.title, url: `https://newurbaninfluence.com/blog/${slug}` });
            break;
          }

          case 'post_to_social': {
            const d = action.data;
            const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
            const PAGE_ID = process.env.FB_PAGE_ID;
            const IG_USER_ID = process.env.IG_USER_ID;
            if (!PAGE_TOKEN || !PAGE_ID) throw new Error('FB_PAGE_ACCESS_TOKEN and FB_PAGE_ID not set in Netlify env vars');

            // ── Rate limit: max 5 posts per day across all platforms ──
            const DAILY_POST_LIMIT = 5;
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayPostsRes = await sbFetch(
              `activity_log?type=eq.social_post&created_at=gte.${todayStart.toISOString()}&select=id`
            ).catch(() => []);
            const todayCount = Array.isArray(todayPostsRes) ? todayPostsRes.length : 0;
            if (todayCount >= DAILY_POST_LIMIT) {
              results.push({
                action: 'post_to_social', success: false,
                error: `Daily post limit reached (${todayCount}/${DAILY_POST_LIMIT}). Try again tomorrow to keep your page in good standing.`
              });
              break;
            }

            const platform = d.platform || 'facebook';
            const posted = [];

            // Facebook post
            if (platform === 'facebook' || platform === 'both') {
              const fbBody = { message: d.message, access_token: PAGE_TOKEN };
              if (d.link) fbBody.link = d.link;
              const fbRes = await nfetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fbBody)
              });
              const fbData = await fbRes.json();
              if (!fbRes.ok) throw new Error(`Facebook post failed: ${fbData.error?.message || fbRes.status}`);
              posted.push({ platform: 'facebook', post_id: fbData.id });
            }

            // Instagram post (requires image)
            if ((platform === 'instagram' || platform === 'both') && d.image_url && IG_USER_ID) {
              // Step 1: Create media container
              const containerRes = await nfetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: d.image_url, caption: d.message, access_token: PAGE_TOKEN })
              });
              const containerData = await containerRes.json();
              if (!containerRes.ok) throw new Error(`Instagram container failed: ${containerData.error?.message}`);
              // Step 2: Publish container
              const publishRes = await nfetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creation_id: containerData.id, access_token: PAGE_TOKEN })
              });
              const publishData = await publishRes.json();
              if (!publishRes.ok) throw new Error(`Instagram publish failed: ${publishData.error?.message}`);
              posted.push({ platform: 'instagram', post_id: publishData.id });
            } else if (platform === 'instagram' && !d.image_url) {
              posted.push({ platform: 'instagram', skipped: true, reason: 'image_url required for Instagram' });
            }

            results.push({ action: 'post_to_social', success: true, posted, remaining_today: DAILY_POST_LIMIT - todayCount - 1 });

            // Log to activity_log so rate limiter tracks it
            await sbFetch('activity_log', {
              method: 'POST',
              prefer: 'return=minimal',
              body: JSON.stringify({
                type: 'social_post',
                event_type: 'monty_social_post',
                direction: 'outbound',
                content: d.message?.slice(0, 200),
                metadata: { platform: d.platform || 'facebook', posted, source: 'monty' },
                created_at: new Date().toISOString()
              })
            }).catch(e => console.warn('Social post log failed:', e.message));
            break;
          }

          case 'generate_image': {
            const d = action.data;
            const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;
            if (!GOOGLE_KEY) throw new Error('GOOGLE_AI_API_KEY not set in Netlify env vars');

            // Use Nano Banana 2 (Gemini 3.1 Flash Image) via generateContent
            const model = 'gemini-3.1-flash-image-preview';
            const genRes = await nfetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: d.prompt }] }],
                  generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
                })
              }
            );
            const genData = await genRes.json();
            if (!genRes.ok) throw new Error(`Nano Banana generation failed: ${JSON.stringify(genData.error || genData)}`);

            // Extract base64 image from response
            const parts = genData.candidates?.[0]?.content?.parts || [];
            const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
            if (!imgPart?.inlineData?.data) throw new Error('No image returned from Nano Banana');

            const b64 = imgPart.inlineData.data;
            const mimeType = imgPart.inlineData.mimeType || 'image/png';
            const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
            const SB_URL = process.env.SUPABASE_URL;
            const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
            const imgBuffer = Buffer.from(b64, 'base64');
            const fileName = `monty-gen-${Date.now()}.${ext}`;
            const uploadRes = await nfetch(`${SB_URL}/storage/v1/object/generated-images/${fileName}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SB_KEY}`,
                'apikey': SB_KEY,
              'Content-Type': mimeType,
                'x-upsert': 'true'
              },
              body: imgBuffer
            });
            if (!uploadRes.ok) {
              const err = await uploadRes.text();
              throw new Error(`Supabase upload failed: ${err}`);
            }
            const imageUrl = `${SB_URL}/storage/v1/object/public/generated-images/${fileName}`;

            // Step 3: If post_to is set, post to social after generation
            let posted = [];
            if (d.post_to && d.post_to !== 'none') {
              const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
              const PAGE_ID = process.env.FB_PAGE_ID;
              const IG_USER_ID = process.env.IG_USER_ID;
              const caption = d.caption || d.prompt;

              if ((d.post_to === 'facebook' || d.post_to === 'both') && PAGE_TOKEN && PAGE_ID) {
                const fbRes = await nfetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: imageUrl, caption, access_token: PAGE_TOKEN })
                });
                const fbData = await fbRes.json();
                if (fbRes.ok) posted.push({ platform: 'facebook', post_id: fbData.id });
              }

              if ((d.post_to === 'instagram' || d.post_to === 'both') && PAGE_TOKEN && IG_USER_ID) {
                const cRes = await nfetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image_url: imageUrl, caption, access_token: PAGE_TOKEN })
                });
                const cData = await cRes.json();
                if (cRes.ok) {
                  const pRes = await nfetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creation_id: cData.id, access_token: PAGE_TOKEN })
                  });
                  const pData = await pRes.json();
                  if (pRes.ok) posted.push({ platform: 'instagram', post_id: pData.id });
                }
              }
            }

            results.push({
              action: 'generate_image',
              success: true,
              image_url: imageUrl,
              posted,
              preview: imageUrl
            });
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

const { getCorsHeaders, requireAdmin, handleOptions } = require('./utils/security');
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
