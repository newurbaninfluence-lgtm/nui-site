const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// NUI Brand Knowledge — everything the chatbot needs to know
const SYSTEM_PROMPT = `You are Monty, the AI assistant for New Urban Influence (NUI), a boutique branding and design agency based in Detroit, Michigan. You help visitors understand NUI's services, recommend the right solutions, and guide them toward getting started.

PERSONALITY:
- Confident but not pushy — you're a knowledgeable guide, not a used car salesman
- Detroit energy — direct, real, no corporate fluff
- Keep responses concise (2-4 sentences usually). Don't write essays.
- Use "we" when talking about NUI. You're part of the team.
- Never use emojis excessively. One occasionally is fine.
- If someone asks something you don't know, say "Let me connect you with Faren (our founder) for that" and suggest booking a strategy call

LEAD CAPTURE BEHAVIOR:
- Naturally work in asking for the visitor's name, business name, phone, and email during conversation
- Don't ask all at once — weave it in naturally. Like: "What's your name, by the way?" or "What's the name of your business?"
- After recommending a service, say something like "Want me to have the team reach out? Drop your email or number and we'll follow up."
- If they share contact info, acknowledge it: "Got it, [name]! I'll make sure the team reaches out."

INDIVIDUAL SERVICES — MARKETING TECHNOLOGY:

1. Silent Visitor ID — $500 setup + $97/mo
   Identifies 15-30% of anonymous website visitors with name, email, company, LinkedIn. Uses RB2B technology. Includes real-time lead dashboard, page view history, lead pipeline, CSV export, weekly reports.

2. Facebook Pixel & Ads — $500 setup + $199/mo
   Meta Pixel installation, custom audience creation, retargeting ad campaigns on Facebook & Instagram, interest-based segments, lookalike audiences, monthly performance reports. Ad spend separate.

3. Google Ads Pixel — $500 setup + $199/mo
   Google Tag Manager setup, conversion tracking, remarketing audiences, display network retargeting across 2M+ websites, YouTube retargeting, monthly performance reports. Ad spend separate.

4. Email Automation — $750 setup + $97/mo (MOST POPULAR)
   5 custom email sequences, behavior-based triggers (sends emails based on pages people viewed), smart send scheduling with 7-day cooldown, open & click tracking, A/B subject testing, monthly optimization.

5. SMS Automation — $500 setup + $79/mo
   98% open rate text messages. SMS campaign builder, two-way messaging, appointment reminders, drip sequences, opt-in/opt-out compliance, delivery reports.

6. AI Phone Assistant — $1,500 setup + $197/mo
   AI receptionist answers calls 24/7. Custom voice & script, appointment booking, lead qualification, call transcripts & summaries, CRM auto-logging. Never miss a call again.

7. Geo-Fencing — $1,500 setup + $997/mo (HIGH ROI)
   Draw invisible fences around competitor locations — anyone who walks in sees your ads for 30 days. Fence up to 10 locations, custom ad creative, foot traffic attribution, conversion zone tracking, monthly ROI reports. Ad spend included.

8. Geo-Grid Tracking — $750 setup + $297/mo
   See exactly where you rank on Google Maps block by block across your entire service area. 7x7 grid scan (49 points), color-coded heat maps, competitor rank comparison, monthly trend reports, GBP optimization, 50 citation submissions.

9. CRM Integration — $1,000 one-time
   Connect all marketing data into one dashboard. Custom lead dashboard, pipeline automation, contact management, activity logging, team notifications, reporting & analytics.

BUNDLE PACKAGES (15% savings vs à la carte):

Brand Ready — $497/mo + $1,500 setup
Includes: Silent Visitor ID, Email Automation, CRM Integration
Best for: Businesses just starting with marketing tech.

Brand Loaded — $1,497/mo + $3,000 setup
Includes: Everything in Brand Ready + Facebook Pixel, Google Pixel, SMS Automation, Geo-Grid Tracking
Best for: Businesses ready for full digital coverage.

Brand Heavy — $2,497/mo + $5,000 setup
Includes: ALL 9 services. Everything in Brand Loaded + Geo-Fencing, AI Phone Assistant
Best for: Total market control.

CORE BRANDING SERVICES:
Brand Kit — $1,500 | Service Brand Identity — $3,500+ | Product Brand Identity — $4,500+

WEBSITE & DIGITAL:
Landing Page — $1,200 | Business Website — $3,500 | Online Store — $5,500 | Web Apps — $7,500+ | Mobile Apps — $12,000+

PRINT & PHYSICAL:
Business cards, banners, yard signs, vehicle wraps, postcards, acrylic signs. Design + print.

AI SYSTEMS & AUTOMATION — $997-$4,997/mo

IMPORTANT BEHAVIORS:
- Recommend the RIGHT service, not the most expensive one
- If they seem overwhelmed, start with Brand Ready
- Always mention the free strategy call as the next step
- Payment: "We offer flexible financing — 0% interest, pay over time."
- If asked for a discount: Point them to bundles (already 15% off)
- NEVER make up information

FOUNDER: Faren Young — founder and creative director. Based in Detroit.
LOCATION: Detroit, Michigan. Serve businesses nationwide.`;

// ── Lead extraction prompt — runs after conversation ──
const EXTRACT_PROMPT = `Analyze this conversation between a website visitor and Monty (NUI's AI assistant). Extract any contact information the visitor shared and assess their lead quality.

Return ONLY valid JSON (no markdown, no explanation):
{
  "first_name": null or string,
  "last_name": null or string,
  "email": null or string,
  "phone": null or string,
  "company": null or string,
  "industry": null or string,
  "service_interest": null or string (which NUI service they're most interested in),
  "budget_range": null or string,
  "timeline": null or string,
  "qualified": false or true (true if they showed real buying intent: asked about pricing, mentioned a timeline, described a specific need, or asked how to get started),
  "summary": "1-2 sentence summary of what they need"
}

Rules:
- Only extract info the visitor explicitly stated. Never guess.
- Phone must be digits only. If they said "313-555-1234" return "3135551234"
- qualified = true means they're a real potential buyer, not just browsing
- If no contact info was shared at all, return all nulls`;

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method not allowed' };
  }

  try {
    const { messages, sessionId } = JSON.parse(event.body);
    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Messages required' }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // Call Claude for the reply
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20)
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Claude API error:', response.status, errText);
      return { statusCode: 502, headers: corsHeaders(), body: JSON.stringify({ error: 'AI service unavailable' }) };
    }

    const data = await response.json();
    const reply = data.content[0]?.text || "Sorry, I couldn't process that. Try again?";

    // Non-blocking: log chat + extract lead info
    const fullMessages = [...messages, { role: 'assistant', content: reply }];
    logChat(sessionId, messages, reply).catch(e => console.warn('Chat log failed:', e));
    
    // Only run lead extraction after 3+ user messages (enough context)
    const userMsgCount = fullMessages.filter(m => m.role === 'user').length;
    if (userMsgCount >= 2) {
      extractAndSaveLead(apiKey, fullMessages, sessionId).catch(e => console.warn('Lead extract failed:', e));
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Chat function error:', err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Internal error' }) };
  }
};

// ── Extract lead info from conversation and save to CRM ──
async function extractAndSaveLead(apiKey, messages, sessionId) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;

  // Build conversation text for extraction
  const convoText = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role === 'user' ? 'Visitor' : 'Monty'}: ${m.content}`)
    .join('\n');

  // Ask Claude to extract contact info
  const extractRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: EXTRACT_PROMPT + '\n\nCONVERSATION:\n' + convoText
      }]
    })
  });

  if (!extractRes.ok) return;
  const extractData = await extractRes.json();
  const rawText = (extractData.content[0]?.text || '').trim();

  let lead;
  try {
    lead = JSON.parse(rawText);
  } catch (e) {
    // Try extracting JSON from markdown code block
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) lead = JSON.parse(match[1].trim());
    else return;
  }

  // Skip if no useful info extracted
  const hasContact = lead.first_name || lead.email || lead.phone || lead.company;
  if (!hasContact) return;

  const supabase = createClient(url, key);

  // Clean phone
  let phone = lead.phone;
  if (phone) {
    phone = phone.replace(/[^\d+]/g, '');
    if (phone.length === 10) phone = '+1' + phone;
    else if (phone.length === 11 && phone.startsWith('1')) phone = '+' + phone;
    else if (!phone.startsWith('+')) phone = '+1' + phone;
  }

  // Try to find existing contact by email or phone
  let existing = null;
  if (lead.email) {
    const { data } = await supabase.from('crm_contacts')
      .select('*').ilike('email', lead.email).maybeSingle();
    existing = data;
  }
  if (!existing && phone) {
    const { data } = await supabase.from('crm_contacts')
      .select('*').eq('phone', phone).maybeSingle();
    existing = data;
  }

  if (existing) {
    // Update existing contact with new info
    const updates = {};
    if (lead.first_name && !existing.first_name) updates.first_name = lead.first_name;
    if (lead.last_name && !existing.last_name) updates.last_name = lead.last_name;
    if (lead.email && !existing.email) updates.email = lead.email;
    if (phone && !existing.phone) updates.phone = phone;
    if (lead.company && !existing.company) updates.company = lead.company;
    if (lead.industry && !existing.industry) updates.industry = lead.industry;
    if (lead.service_interest) updates.service_interest = lead.service_interest;
    if (lead.budget_range) updates.budget_range = lead.budget_range;
    if (lead.timeline) updates.timeline = lead.timeline;
    if (lead.qualified && !existing.sona_qualified) updates.sona_qualified = true;
    updates.last_activity_at = new Date().toISOString();

    if (Object.keys(updates).length > 1) {
      await supabase.from('crm_contacts').update(updates).eq('id', existing.id);
      console.log('✅ Monty updated contact:', existing.id, updates);
    }

    // Log activity
    await supabase.from('activity_log').insert({
      contact_id: existing.id,
      type: 'monty_chat',
      direction: 'inbound',
      content: lead.summary || 'Chat conversation via Monty',
      metadata: { session_id: sessionId, qualified: lead.qualified, service_interest: lead.service_interest },
      read: false
    });

  } else {
    // Create new contact
    const newContact = {
      first_name: lead.first_name || null,
      last_name: lead.last_name || null,
      email: lead.email || null,
      phone: phone || null,
      company: lead.company || null,
      industry: lead.industry || null,
      source: 'monty_chat',
      status: lead.qualified ? 'qualified' : 'new_lead',
      sona_qualified: lead.qualified || false,
      service_interest: lead.service_interest || null,
      budget_range: lead.budget_range || null,
      timeline: lead.timeline || null,
      notes: lead.summary || null,
      last_activity_at: new Date().toISOString()
    };

    const { data: created, error } = await supabase.from('crm_contacts')
      .insert(newContact).select().single();

    if (created) {
      console.log('✅ Monty created new lead:', created.id, newContact.first_name);

      // Log the chat activity
      await supabase.from('activity_log').insert({
        contact_id: created.id,
        type: 'monty_chat',
        direction: 'inbound',
        content: lead.summary || 'New lead from Monty chat',
        metadata: { session_id: sessionId, qualified: lead.qualified, service_interest: lead.service_interest },
        read: false
      });
    }
    if (error) console.warn('Monty lead insert error:', error.message);
  }
}

async function logChat(sessionId, messages, reply) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;

  const supabase = createClient(url, key);
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  
  await supabase.from('chat_logs').insert({
    session_id: sessionId || 'unknown',
    user_message: lastUserMsg?.content || '',
    bot_reply: reply,
    message_count: messages.length,
    page_url: '',
    created_at: new Date().toISOString()
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://newurbaninfluence.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}
