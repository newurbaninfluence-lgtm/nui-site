// agent-creator.js — The Creator Agent
// Generates complete content packages: copy + Synthesys voiceover + background visual
// Saves drafts to Supabase for admin approval before publishing
// Can be triggered manually from admin panel OR run as weekly content batch
//
// Pipeline:
//   1. Claude writes post copy + voiceover script
//   2. Synthesys API generates MP3 audio from script
//   3. Pexels API gets background image/video
//   4. All saved to content_drafts table
//   5. Admin reviews in panel → 1-click approve → fires to social-schedule.js
//
// Env vars: ANTHROPIC_API_KEY, SYNTHESYS_API_KEY, PEXELS_API_KEY
//           SUPABASE_URL, SUPABASE_SERVICE_KEY

const SB_URL  = process.env.SUPABASE_URL;
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE  = process.env.ANTHROPIC_API_KEY;
const SYNTH_KEY = process.env.SYNTHESYS_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) }
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

// ── Synthesys voice IDs (from API docs — actorId) ──
// 11 = Marcus (US Male, confident)
// 23 = James (US Male, deep)
// 45 = Aria (US Female, warm)
const SYNTH_VOICES = {
  nui_male: 11,    // default NUI brand voice (Marcus)
  deep_male: 23,   // Built Heavy / podcast content
  female: 45       // for client-facing or feminine brands
};

// ── Step 1: Generate content with Claude ──
async function generateContent(topic, tone = 'nui_brand') {
  const tones = {
    nui_brand: 'New Urban Influence (NUI) brand voice — confident, Detroit-proud, direct, modern. Faren Young, founder.',
    built_heavy: 'Built Heavy podcast tone — raw, motivational, real-talk. About being forged by pressure and driven by purpose.',
    educational: 'Educational marketing expert — helpful, data-backed, practical. Makes complex topics simple.',
    client_promo: 'Excited client highlight — celebratory, specific, results-focused.'
  };

  const prompt = `You are creating a complete social content package for ${tones[tone] || tones.nui_brand}

Topic/Brief: ${topic}

Generate a JSON response with these exact fields:
{
  "post_caption": "150-250 char social post with 1 CTA, max 2 emojis, no hashtags",
  "hashtags": "5-7 relevant hashtags as a single string",
  "voiceover_script": "20-40 second voiceover script (approx 60-120 words). Punchy, sounds great spoken aloud. Ends with CTA.",
  "content_type": "tip|story|promo|spotlight|announcement",
  "image_search_query": "4-6 word Pexels search query for background visual",
  "platforms": ["facebook","instagram"]
}

Return ONLY valid JSON, no explanation, no markdown.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, messages: [{ role: 'user', content: prompt }] })
  });
  const d = await r.json();
  const text = d.content?.[0]?.text?.trim() || '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch { return { error: 'JSON parse failed', raw: text }; }
}

// ── Step 2: Generate voiceover with Synthesys API ──
async function generateVoiceover(script, voiceType = 'nui_male') {
  if (!SYNTH_KEY) return { skipped: true, reason: 'no SYNTHESYS_API_KEY set' };
  if (!script) return { skipped: true, reason: 'no script provided' };

  const actorId = SYNTH_VOICES[voiceType] || SYNTH_VOICES.nui_male;

  try {
    const r = await fetch('https://synthesys.live/api/actor/generateVoice', {
      method: 'POST',
      headers: { 'APIKey': SYNTH_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          actorId,
          text: script,
          features: [{ key: 'speed', value: '1.0' }]
        }]
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return { success: false, error: `Synthesys ${r.status}: ${err}` };
    }

    const d = await r.json();
    // Synthesys returns audio URL in various response shapes
    const audioUrl = d.url || d.audioUrl || d.data?.[0]?.url || d.result?.url || null;

    if (!audioUrl) {
      return { success: false, error: 'No audio URL in response', raw: JSON.stringify(d).slice(0, 200) };
    }

    return { success: true, audio_url: audioUrl, actor_id: actorId, char_count: script.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Step 3: Get background visual from Pexels ──
async function getBackground(query) {
  if (!PEXELS_KEY || !query) return null;
  try {
    const q = encodeURIComponent(query);
    const r = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=10&orientation=landscape`, {
      headers: { 'Authorization': PEXELS_KEY }
    });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
    return {
      image_url: pick.src?.large2x || pick.src?.large,
      thumb_url: pick.src?.medium,
      photographer: pick.photographer,
      pexels_url: pick.url
    };
  } catch { return null; }
}

// ── Step 4: Save draft to Supabase for admin review ──
async function saveDraft(draftData) {
  return await sbFetch('content_drafts', {
    method: 'POST',
    body: JSON.stringify({
      ...draftData,
      status: 'pending_approval',
      created_at: new Date().toISOString()
    })
  });
}

// ── Batch mode: create a week's worth of content ──
const WEEKLY_TOPICS = [
  { topic: 'Why most Detroit businesses have weak brand identities and what it costs them', tone: 'nui_brand' },
  { topic: 'NUI helped a local restaurant double their walk-in traffic with a brand refresh', tone: 'client_promo' },
  { topic: 'Built Heavy: the moment I knew I was built for this — a Detroit story', tone: 'built_heavy' },
  { topic: '3 things your website must have to convert Detroit visitors into clients in 2025', tone: 'educational' },
  { topic: 'Free brand audit offer — NUI is reviewing 5 Detroit business brands this week', tone: 'nui_brand' },
  { topic: 'AI automation saved our client 15 hours a week — here\'s how', tone: 'educational' },
  { topic: 'Detroit is rising: celebrating the businesses putting the city on the map', tone: 'nui_brand' }
];

// ── Main handler ──
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const mode = body.mode || 'single'; // 'single' | 'batch' | 'approve'

    // ── APPROVE MODE: move draft to scheduled_posts ──
    if (mode === 'approve') {
      const { draft_id, scheduled_for, platform } = body;
      if (!draft_id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'draft_id required' }) };

      const [draft] = await sbFetch(`content_drafts?id=eq.${draft_id}`);
      if (!draft) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'draft not found' }) };

      // Move to scheduled_posts
      const scheduled = await sbFetch('scheduled_posts', {
        method: 'POST',
        body: JSON.stringify({
          caption: `${draft.post_caption}\n\n${draft.hashtags}`,
          image_url: draft.image_url,
          audio_url: draft.audio_url,
          platform: platform || draft.platforms?.[0] || 'facebook',
          status: 'scheduled',
          scheduled_for: scheduled_for || new Date(Date.now() + 3600000).toISOString(),
          created_by: 'agent_creator'
        })
      });

      // Update draft status
      await sbFetch(`content_drafts?id=eq.${draft_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString() })
      });

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, scheduled_post: scheduled }) };
    }

    // ── BATCH MODE: create a week of drafts ──
    if (mode === 'batch') {
      const batchResults = [];
      for (const item of WEEKLY_TOPICS) {
        const content = await generateContent(item.topic, item.tone);
        if (content.error) { batchResults.push({ error: content.error, topic: item.topic }); continue; }

        const [voiceover, background] = await Promise.all([
          generateVoiceover(content.voiceover_script, item.tone === 'built_heavy' ? 'deep_male' : 'nui_male'),
          getBackground(content.image_search_query)
        ]);

        const draft = await saveDraft({
          topic: item.topic, tone: item.tone,
          post_caption: content.post_caption, hashtags: content.hashtags,
          voiceover_script: content.voiceover_script,
          audio_url: voiceover?.audio_url || null,
          image_url: background?.image_url || null,
          thumb_url: background?.thumb_url || null,
          platforms: content.platforms || ['facebook', 'instagram'],
          content_type: content.content_type
        });
        batchResults.push({ draft_id: draft?.[0]?.id, topic: item.topic, has_audio: !!voiceover?.audio_url });
      }

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, mode: 'batch', drafts_created: batchResults.length, results: batchResults }) };
    }

    // ── SINGLE MODE: create one draft from custom topic ──
    const topic = body.topic || 'How New Urban Influence helps Detroit businesses build brands that stand out';
    const tone  = body.tone  || 'nui_brand';
    const voiceType = body.voice || 'nui_male';

    const content = await generateContent(topic, tone);
    if (content.error) throw new Error(`Content generation failed: ${content.error}`);

    const [voiceover, background] = await Promise.all([
      generateVoiceover(content.voiceover_script, voiceType),
      getBackground(content.image_search_query)
    ]);

    const draft = await saveDraft({
      topic, tone,
      post_caption: content.post_caption, hashtags: content.hashtags,
      voiceover_script: content.voiceover_script,
      audio_url: voiceover?.audio_url || null,
      image_url: background?.image_url || null,
      thumb_url: background?.thumb_url || null,
      platforms: content.platforms || ['facebook', 'instagram'],
      content_type: content.content_type
    });

    return {
      statusCode: 200, headers: CORS,
      body: JSON.stringify({
        success: true, mode: 'single',
        draft_id: draft?.[0]?.id,
        preview: { caption: content.post_caption?.slice(0, 100), has_audio: !!voiceover?.audio_url, has_image: !!background?.image_url },
        content, voiceover, background
      })
    };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
