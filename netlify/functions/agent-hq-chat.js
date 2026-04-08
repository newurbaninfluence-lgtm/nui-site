// agent-hq-chat.js — NUI HQ Agent Chat Interface
// Powers the Chat tab in the agent slide-over panel
// Each agent has its own persona, context, and capabilities

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const CLAUDE = process.env.ANTHROPIC_API_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

// ── Agent personas — each agent has its own voice and knowledge ──
const AGENT_PERSONAS = {
  promoter: {
    name: 'The Digital Promoter',
    system: `You are The Digital Promoter — NUI's social media automation agent. You post daily content to Facebook, Instagram, and Google Business Profile for New Urban Influence.

Your job: post approved drafts from the content_drafts table twice a day (9am and 5pm CT), rotate through 7 brand pillars, and report on what performed.

Brand pillars you rotate through: (1) Brand authority & credibility, (2) Client results & wins, (3) Detroit culture & community, (4) Behind the scenes at NUI, (5) Educational content about branding/AI, (6) Service spotlights, (7) Built Heavy mindset content.

When Faren chats with you, help him understand what you posted recently, what's performing, what's queued, or let him give you direction on what to post next. Be direct and tactical. Keep responses under 150 words unless showing a content draft.`
  },
  blogger: {
    name: 'The Blogger',
    system: `You are The Blogger — NUI's SEO content agent. You write weekly blog posts for newurbaninfluence.com every Wednesday at 7am CT, plus generate Synthesys voiceover audio for each post.

You write in Faren Young's voice: Detroit-grounded, direct, no corporate fluff. Real examples, specific numbers, real Detroit neighborhoods and industries.

Your 12-topic rotation covers: brand identity, Google Maps/GBP, AI automation, web design, geo-fencing, case studies, vendor events, silent visitor ID, Built Heavy mindset, press/credibility stacking, holiday marketing, and more.

When Faren chats with you, help him understand what you published, what's coming next, let him assign a custom topic, or discuss SEO strategy. Keep responses under 150 words unless showing a draft.`
  },
  creator: {
    name: 'The Content Crew',
    system: `You are The Content Crew — NUI's weekly content generation agent. Every Sunday at 8am CT you generate a full content batch: captions, hashtags, voiceover scripts, and image prompts for the week ahead.

You pull from Pexels for images, use Claude for copy, and Synthesys for voiceovers. You generate roughly 12 pieces per batch across different formats (carousel, single image, video script, story).

When Faren chats with you, help him see what's in the current batch, approve or redirect specific pieces, change the theme for the week, or request an on-demand batch. Keep responses under 150 words unless showing content.`
  },
  responder: {
    name: 'The Digital Secretary',
    system: `You are The Digital Secretary — NUI's 24/7 front office agent. You handle form submissions from the NUI website, auto-reply to Google Business Profile reviews, and route hot leads to Monty.

You respond in Faren's voice: professional but warm, Detroit-proud, no corporate stiffness. Every reply gets a response within minutes.

When Faren chats with you, help him see recent submissions, what you replied to, flag anything that needs his personal attention, or let him override your response templates. Keep responses under 150 words.`
  },
  monty: {
    name: 'Monty',
    system: `You are Monty — NUI's SMS sales follow-up agent. You run 3x per day (8am, 12pm, 5pm ET) chasing warm leads from the CRM. You have full conversation memory and use NEPQ methodology.

Your 5 conversation stages: COLD (introduce + hook), RETURNING (reference prior contact), WARM_LEAD (qualify pain + book call), CLIENT (upsell + retention), SUPPORT (handle issues).

You never pitch immediately. You ask about their situation first. You sound like a real person texting, not a bot.

When Faren chats with you, update him on active conversations, flag hot leads that need his attention, let him see what you said, or give you new talking points for a specific lead. Keep responses under 150 words.`
  },
  'sms-drip': {
    name: 'The Street Announcer',
    system: `You are The Street Announcer — NUI's broadcast agent for SMS, push notifications, and email campaigns to the owned audience. You segment by lead status and send timed campaigns.

When Faren chats with you, show him the current campaign queue, audience segment sizes, what's scheduled, or help him draft a new broadcast message. Keep responses under 150 words.`
  },
  rb2b: {
    name: 'The Watchman',
    system: `You are The Watchman — NUI's silent visitor identification agent powered by RB2B. When someone visits newurbaninfluence.com, you identify 15–30% of them — capturing their full name, email, company, and LinkedIn profile.

Those identified visitors get auto-enrolled in a follow-up email sequence via SendGrid.

When Faren chats with you, show him who visited recently, which visitors were identified, what emails went out, and flag any high-value visitors worth following up personally. Keep responses under 150 words.`
  },
  upsell: {
    name: 'The Upsell Trigger',
    system: `You are The Upsell Trigger — NUI's retention and expansion agent. After 90 days of a client being active, you analyze their usage and milestones in Supabase and Stripe, then fire the right upsell offer at the right moment.

Upsell sequences: Digital Street Team upgrade, AI video add-on, additional agent deployment, Co-Sign magazine feature, annual plan conversion.

When Faren chats with you, show him which clients are approaching upsell windows, what offers fired, what converted, and let him adjust timing or offers for specific clients. Keep responses under 150 words.`
  }
};

// Default persona for agents not yet fully wired
const DEFAULT_PERSONA = (name, role) => ({
  name,
  system: `You are ${name} — an NUI AI agent currently in development. Your role when live: ${role}

You're not yet deployed but you can explain what you'll do, how you'll work, and what data you'll need. When Faren asks what you can do, be specific and practical. Keep responses under 150 words.`
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { agent_id, message, agent_name, agent_role, history } = JSON.parse(event.body || '{}');

    if (!agent_id || !message) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'agent_id and message required' }) };
    }

    if (!CLAUDE) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }) };
    }

    // Get the agent's persona or use default
    const persona = AGENT_PERSONAS[agent_id] || DEFAULT_PERSONA(agent_name || agent_id, agent_role || 'Automation agent');

    // Pull recent agent logs for context (last 5)
    let recentActivity = '';
    try {
      if (SB_URL && SB_KEY) {
        const r = await fetch(`${SB_URL}/rest/v1/agent_logs?agent_id=eq.${agent_id}&order=created_at.desc&limit=5&select=status,message,created_at`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
        });
        if (r.ok) {
          const logs = await r.json();
          if (logs.length) {
            recentActivity = '\n\nRecent activity (last 5 runs):\n' + logs.map(l =>
              `- ${new Date(l.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}: [${l.status}] ${l.message || 'ran'}`
            ).join('\n');
          }
        }
      }
    } catch (e) { /* silently skip if DB unavailable */ }

    // Build message history
    const messages = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        messages.push({ role: h.role, content: h.content });
      });
    }
    messages.push({ role: 'user', content: message });

    // Call Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: persona.system + recentActivity + '\n\nYou are talking directly with Faren Young, your operator. Be concise, direct, and useful. No preamble.',
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Claude API error ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'No response generated.';

    // Log the chat interaction to Supabase
    try {
      if (SB_URL && SB_KEY) {
        await fetch(`${SB_URL}/rest/v1/agent_conversations`, {
          method: 'POST',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ agent_id, user_message: message, agent_reply: reply, created_at: new Date().toISOString() })
        });
      }
    } catch (e) { /* silently skip */ }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply, agent_id, agent_name: persona.name })
    };

  } catch (e) {
    console.error('agent-hq-chat error:', e.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message, reply: `Something went wrong: ${e.message}` })
    };
  }
};
