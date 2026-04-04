// agent-creator.js — The Creator Agent v2
// Upgraded: claude-sonnet-4-6, stronger prompts, better content packages
// TODO: Move to Cowork task (Mac Mini) when back online
// Schedule: Sundays 8am CT (netlify.toml)

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Content-Type': 'application/json' };
const SB_URL    = process.env.SUPABASE_URL;
const SB_KEY    = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE    = process.env.ANTHROPIC_API_KEY;
const SYNTH_KEY = process.env.SYNTHESYS_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) } });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

const WEEKLY_TOPICS = [
  { topic: 'Why your Detroit business is invisible to the 70% of customers who never scroll past Google page one', tone: 'nui_brand' },
  { topic: 'What happened when a Southfield contractor added an AI phone staff to their operation for $197/mo', tone: 'client_promo' },
  { topic: 'Built Heavy: the specific moment Faren Young decided to stop working for other people and build NUI', tone: 'built_heavy' },
  { topic: '3 things every Detroit business website must have to convert a visitor into a booking in 2026', tone: 'educational' },
  { topic: 'Free brand audit: NUI is reviewing 5 Detroit business brands this week — here is what we look for', tone: 'nui_brand' },
  { topic: 'The geo-fencing play: how Detroit businesses are stealing customers from competitors without spending on ads', tone: 'educational' },
  { topic: 'Detroit is the most underrated city for business right now — here is the data and the opportunity', tone: 'nui_brand' }
];

async function generateContent(topic, tone) {
  const voices = {
    nui_brand: 'New Urban Influence brand voice — Faren Young. Bold, Detroit-proud, direct. "Talk like the block, move like the boardroom." Speaks to Detroit entrepreneurs and small business owners. Never generic.',
    built_heavy: 'Built Heavy voice — Faren\'s personal brand. Raw, motivational, real-talk. About being forged by pressure and driven by purpose. Vulnerable but not weak.',
    educational: 'Expert educator — helpful, data-backed, practical. Makes complex marketing and tech topics simple. Still has Detroit energy but leads with information.',
    client_promo: 'Victory lap for a client. Celebratory but specific — real outcomes, real numbers, real transformation. Keeps client anonymous but makes the result feel concrete.'
  };

  const prompt = `You are creating a complete social content package. Voice: ${voices[tone] || voices.nui_brand}

Topic: ${topic}

Return ONLY valid JSON — no markdown, no fences:
{
  "post_caption": "A punchy 200-250 char social post. Hook in first line. Specific outcome or truth. 1-2 emojis max. Direct CTA at end. No hashtags.",
  "hashtags": "8 targeted hashtags — mix of Detroit-specific, service-specific, and broad business",
  "voiceover_script": "A 30-45 second spoken script (80-120 words). Opens with a bold statement. Sounds great spoken aloud — short sentences, natural rhythm. Ends with: 'New Urban Influence. Detroit.' Do NOT write 'Hey everyone' or 'Welcome back.'",
  "content_type": "tip|story|promo|spotlight|announcement",
  "image_search_query": "5-7 specific Pexels search terms — include 'detroit' or 'urban' or 'entrepreneur' for relevance",
  "platforms": ["facebook","instagram"]
}`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
  });
  const d = await r.json();
  const text = d.content?.[0]?.text?.trim() || '{}';
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { return { error: 'JSON parse failed', raw: text }; }
}

async function generateVoiceover(script) {
  if (!SYNTH_KEY || !script) return { skipped: true };
  try {
    const r = await fetch('https://synthesys.live/api/actor/generateVoice', {
      method: 'POST',
      headers: { 'APIKey': SYNTH_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [{ actorId: 415, text: script, isUltraRealistic: true, features: [{ key: 'speed', value: '1.0' }] }] })
    });
    if (!r.ok) { const err = await r.text(); return { success: false, error: `Synthesys ${r.status}: ${err.slice(0,200)}` }; }
    const d = await r.json();
    const audioUrl = d.url || d.audioUrl || d.data?.[0]?.url || null;
    return audioUrl ? { success: true, audio_url: audioUrl } : { success: false, error: 'No audio URL' };
  } catch (e) { return { success: false, error: e.message }; }
}

async function getBackground(query) {
  if (!PEXELS_KEY || !query) return null;
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`, { headers: { 'Authorization': PEXELS_KEY } });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 8))];
    return { image_url: pick.src?.large2x || pick.src?.large, thumb_url: pick.src?.medium, photographer: pick.photographer };
  } catch { return null; }
}

async function saveDraft(data) {
  return await sbFetch('content_drafts', { method: 'POST', body: JSON.stringify({ ...data, status: 'pending_approval', created_at: new Date().toISOString() }) });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const mode = body.mode || 'batch';

    if (mode === 'approve') {
      const { draft_id, scheduled_for, platform } = body;
      if (!draft_id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'draft_id required' }) };
      const [draft] = await sbFetch(`content_drafts?id=eq.${draft_id}`);
      if (!draft) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'draft not found' }) };
      const scheduled = await sbFetch('scheduled_posts', { method: 'POST', body: JSON.stringify({ caption: `${draft.post_caption}\n\n${draft.hashtags}`, image_url: draft.image_url, audio_url: draft.audio_url, platform: platform || 'facebook', status: 'scheduled', scheduled_for: scheduled_for || new Date(Date.now() + 3600000).toISOString(), created_by: 'agent_creator' }) });
      await sbFetch(`content_drafts?id=eq.${draft_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString() }) });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, scheduled_post: scheduled }) };
    }

    const batchResults = [];
    const topics = mode === 'batch' ? WEEKLY_TOPICS : [{ topic: body.topic || WEEKLY_TOPICS[0].topic, tone: body.tone || 'nui_brand' }];

    for (const item of topics) {
      const content = await generateContent(item.topic, item.tone);
      if (content.error) { batchResults.push({ error: content.error, topic: item.topic }); continue; }
      const [voiceover, background] = await Promise.all([generateVoiceover(content.voiceover_script), getBackground(content.image_search_query)]);
      const draft = await saveDraft({ topic: item.topic, tone: item.tone, post_caption: content.post_caption, hashtags: content.hashtags, voiceover_script: content.voiceover_script, audio_url: voiceover?.audio_url || null, image_url: background?.image_url || null, thumb_url: background?.thumb_url || null, platforms: content.platforms || ['facebook','instagram'], content_type: content.content_type });
      batchResults.push({ draft_id: draft?.[0]?.id, topic: item.topic, has_audio: !!voiceover?.audio_url });
      await new Promise(r => setTimeout(r, 1500));
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, mode, drafts_created: batchResults.length, results: batchResults }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
