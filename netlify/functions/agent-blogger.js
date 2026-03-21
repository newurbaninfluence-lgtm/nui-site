// agent-blogger.js — The Blogger Agent
// Auto-generates full SEO blog posts + Synthesys voice overview
// Saves to blog_posts table (published=false for review, or true for auto-publish)
// Runs weekly Wednesdays 7am CT (12:00 UTC) + can be triggered manually
//
// Pipeline:
//   1. Pick a topic from rotation (or use provided topic)
//   2. Claude Sonnet writes full blog post (HTML content, SEO meta, excerpt)
//   3. Claude Haiku writes 60-second voice overview script
//   4. Synthesys API generates MP3 voiceover
//   5. Pexels grabs hero image
//   6. Saves to blog_posts + logs to agent_logs
//   7. (Optional) Sends admin email notification
//
// Env vars: ANTHROPIC_API_KEY, SYNTHESYS_API_KEY, PEXELS_API_KEY
//           SUPABASE_URL, SUPABASE_SERVICE_KEY
//           SMTP_HOST, SMTP_USER, SMTP_PASS (for email notification)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const SB_URL   = process.env.SUPABASE_URL;
const SB_KEY   = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE   = process.env.ANTHROPIC_API_KEY;
const SYNTH    = process.env.SYNTHESYS_API_KEY;
const PEXELS   = process.env.PEXELS_API_KEY;

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) }
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

// ── Blog topic rotation ──────────────────────────────────────────────────────
const BLOG_TOPICS = [
  { topic: 'Why Detroit businesses lose customers without a strong brand identity', category: 'Branding', keywords: ['brand identity Detroit', 'Detroit business branding', 'local business brand'] },
  { topic: 'AI automation for small business: what actually saves time vs what\'s hype', category: 'AI & Automation', keywords: ['AI automation small business', 'business automation tools', 'AI marketing agency'] },
  { topic: 'The real cost of a cheap logo (and what it\'s doing to your revenue)', category: 'Branding', keywords: ['cheap logo design', 'professional logo cost', 'brand design ROI'] },
  { topic: 'How to dominate Google local search in Detroit without paying for ads', category: 'Digital Marketing', keywords: ['Google local SEO Detroit', 'local search optimization', 'Detroit SEO strategy'] },
  { topic: 'Built Heavy mindset: how pressure builds the entrepreneurs who last', category: 'Entrepreneurship', keywords: ['entrepreneur mindset', 'Built Heavy podcast', 'Detroit entrepreneur'] },
  { topic: '5 website mistakes that are costing Detroit businesses thousands', category: 'Web Design', keywords: ['website design mistakes', 'Detroit web design', 'website conversion optimization'] },
  { topic: 'How NUI helped a local Detroit business triple their social media reach', category: 'Case Study', keywords: ['Detroit marketing agency results', 'social media marketing Detroit', 'brand transformation'] },
  { topic: 'AI vs human design: when to use each and why most agencies get it wrong', category: 'Branding', keywords: ['AI design tools', 'human vs AI design', 'professional branding agency'] },
  { topic: 'The 7-step brand audit every Detroit business owner should do this year', category: 'Branding', keywords: ['brand audit checklist', 'brand strategy Detroit', 'brand evaluation'] },
  { topic: 'Push notifications, SMS, and email: which converts best for local businesses', category: 'Digital Marketing', keywords: ['push notifications marketing', 'SMS marketing local business', 'email vs SMS conversion'] },
  { topic: 'From side hustle to serious brand: the NUI framework for scaling up', category: 'Business Strategy', keywords: ['scale business Detroit', 'brand framework', 'business growth strategy'] },
  { topic: 'Google Business Profile in 2025: the complete guide for Detroit businesses', category: 'Digital Marketing', keywords: ['Google Business Profile 2025', 'GBP optimization Detroit', 'Google Maps ranking'] }
];

// ── Get next topic (avoid recent ones) ──────────────────────────────────────
async function getNextTopic() {
  try {
    const logs = await sbFetch('agent_logs?agent_id=eq.blogger&order=created_at.desc&limit=12');
    const used = (logs || []).map(l => l.metadata?.topic_slug).filter(Boolean);
    const next = BLOG_TOPICS.find(t => !used.includes(slugify(t.topic)));
    return next || BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
  } catch { return BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)]; }
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

// ── Step 1: Generate full blog post with Claude Sonnet ──────────────────────
async function generateBlogPost(topic, category, keywords) {
  const prompt = `You are Faren Young, founder of New Urban Influence (NUI), a Detroit branding and AI automation agency. You write expert blog content in a direct, confident, Detroit-grounded voice.

Write a complete, SEO-optimized blog post on this topic:
"${topic}"

REQUIREMENTS:
- Category: ${category}
- Target keywords: ${keywords.join(', ')}
- Word count: 900-1200 words
- Tone: Expert, direct, NUI brand voice — confident but not arrogant, Detroit-proud, real talk
- Opening hook that grabs attention immediately (no "In today's world" clichés)
- 3-5 H2 subheadings with actual value
- Include 1 real-world Detroit business example or anecdote
- End with a CTA to book a free brand strategy call at https://newurbaninfluence.com/book

Return ONLY valid JSON with these fields:
{
  "title": "Compelling SEO title (55-60 chars)",
  "meta_description": "SEO meta description (150-155 chars)",
  "excerpt": "2-sentence blog excerpt for previews",
  "read_time": "X min read",
  "content": "Full HTML blog content (use <h2>, <p>, <ul>, <li>, <strong>, <blockquote> — NO inline styles)",
  "voice_script": "60-second spoken overview (approx 150 words). Punchy, conversational, sounds great spoken aloud. Introduces the post topic and hooks the listener. Ends: 'Read the full post at New Urban Influence dot com.'",
  "image_search_query": "4-6 word Pexels query for hero image"
}

Return ONLY valid JSON. No markdown fences.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const d = await r.json();
  const raw = d.content?.[0]?.text?.trim() || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    // Try to extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error('Failed to parse blog JSON from Claude: ' + raw.slice(0, 200));
  }
}

// ── Step 2: Generate voiceover with Synthesys ────────────────────────────────
async function generateVoiceover(script) {
  if (!SYNTH || !script) return { skipped: true, reason: !SYNTH ? 'no SYNTHESYS_API_KEY' : 'no script' };
  try {
    const r = await fetch('https://synthesys.live/api/actor/generateVoice', {
      method: 'POST',
      headers: { 'APIKey': SYNTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [{ actorId: 11, text: script, features: [{ key: 'speed', value: '1.0' }] }] })
    });
    if (!r.ok) {
      const err = await r.text();
      return { success: false, error: `Synthesys ${r.status}: ${err.slice(0, 200)}` };
    }
    const d = await r.json();
    const audioUrl = d.url || d.audioUrl || d.data?.[0]?.url || d.result?.url || null;
    return audioUrl ? { success: true, audio_url: audioUrl } : { success: false, error: 'No audio URL returned', raw: JSON.stringify(d).slice(0, 200) };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Step 3: Get hero image from Pexels ───────────────────────────────────────
async function getHeroImage(query) {
  if (!PEXELS || !query) return null;
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`, {
      headers: { 'Authorization': PEXELS }
    });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
    return pick.src?.large2x || pick.src?.large || null;
  } catch { return null; }
}

// ── Step 4: Save to Supabase blog_posts ──────────────────────────────────────
async function saveBlogPost(postData) {
  const rows = await sbFetch('blog_posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  });
  return rows?.[0];
}

// ── Log run ───────────────────────────────────────────────────────────────────
async function logRun(data) {
  try {
    await sbFetch('agent_logs', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'blogger', status: data.success ? 'success' : 'error', metadata: data, created_at: new Date().toISOString() })
    });
  } catch {}
}

// ── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const mode = body.mode || 'single'; // 'single' | 'batch'
    const autoPublish = body.auto_publish === true; // default: save as draft

    // ── BATCH: generate 4 posts at once ──────────────────────────────────────
    if (mode === 'batch') {
      const count = Math.min(body.count || 1, 2);
      const results = [];
      // Use different topics for batch, avoiding recent
      const logs = await sbFetch('agent_logs?agent_id=eq.blogger&order=created_at.desc&limit=20').catch(() => []);
      const used = (logs || []).map(l => l.metadata?.topic_slug).filter(Boolean);
      const available = BLOG_TOPICS.filter(t => !used.includes(slugify(t.topic)));
      const batchTopics = (available.length >= count ? available : BLOG_TOPICS).slice(0, count);

      for (const topicObj of batchTopics) {
        try {
          const result = await generateAndSave(topicObj, autoPublish);
          results.push(result);
          // Stagger requests to avoid rate limits
          await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
          results.push({ success: false, error: e.message, topic: topicObj.topic });
        }
      }

      const summary = { success: true, mode: 'batch', posts_created: results.filter(r => r.success).length, results };
      await logRun(summary);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(summary) };
    }

    // ── SINGLE: generate one post ─────────────────────────────────────────────
    let topicObj;
    if (body.topic) {
      // Custom topic provided
      topicObj = {
        topic: body.topic,
        category: body.category || 'Branding',
        keywords: body.keywords || ['Detroit branding', 'NUI agency', 'brand strategy']
      };
    } else {
      topicObj = await getNextTopic();
    }

    const result = await generateAndSave(topicObj, autoPublish);
    await logRun(result);
    return { statusCode: result.success ? 200 : 500, headers: CORS, body: JSON.stringify(result) };

  } catch (err) {
    const r = { success: false, error: err.message };
    await logRun(r).catch(() => {});
    return { statusCode: 500, headers: CORS, body: JSON.stringify(r) };
  }
};

// ── Core: generate + voiceover + image + save ─────────────────────────────────
async function generateAndSave(topicObj, autoPublish = false) {
  const { topic, category, keywords } = topicObj;
  const topicSlug = slugify(topic);

  // 1. Generate blog content
  const blog = await generateBlogPost(topic, category, keywords);
  if (!blog.title) throw new Error('Blog generation failed — no title returned');

  const slug = slugify(blog.title) + '-' + now.getFullYear();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // 2. Generate voiceover + hero image in parallel
  const [voiceover, heroImage] = await Promise.all([
    generateVoiceover(blog.voice_script),
    getHeroImage(blog.image_search_query)
  ]);

  // 3. Build HTML content with audio player if we have audio
  let fullContent = blog.content || '';
  if (voiceover?.audio_url) {
    const audioBlock = `
<div class="blog-voice-overview" style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px 24px;margin:24px 0;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A843" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
    <strong style="color:#D4A843;font-size:14px;">🎙 Listen to the Overview</strong>
  </div>
  <audio controls style="width:100%;height:44px;" preload="none">
    <source src="${voiceover.audio_url}" type="audio/mpeg">
    Your browser doesn't support audio.
  </audio>
  <p style="color:#888;font-size:12px;margin:8px 0 0;">Quick 60-second audio summary by Faren Young</p>
</div>`;
    // Insert audio block right after the first <p> tag
    fullContent = fullContent.replace(/(<p[^>]*>)/, `${audioBlock}$1`);
    if (!fullContent.includes(audioBlock)) fullContent = audioBlock + fullContent;
  }

  // 4. Append CTA block
  fullContent += `
<div class="blog-cta" style="background:linear-gradient(135deg,#1a0a0a,#2a0e0e);border:1px solid #D4A843;border-radius:12px;padding:32px;margin-top:40px;text-align:center;">
  <h3 style="color:#D4A843;margin:0 0 12px;font-size:20px;">Ready to Build a Brand Detroit Respects?</h3>
  <p style="color:#ccc;margin:0 0 20px;">Book a free 30-minute strategy call with Faren Young.</p>
  <a href="https://newurbaninfluence.com/book" style="display:inline-block;background:#D4A843;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">Book Your Free Call →</a>
</div>`;

  // 5. Save to Supabase
  const postData = {
    slug,
    title: blog.title,
    excerpt: blog.excerpt || blog.meta_description?.slice(0, 160) || '',
    meta_description: blog.meta_description || '',
    category,
    image: heroImage || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    author: 'Faren Young',
    author_image: 'icons/icon-192.png',
    date: dateStr,
    read_time: blog.read_time || '6 min read',
    content: fullContent,
    voice_script: blog.voice_script || '',
    audio_url: voiceover?.audio_url || null,
    seo_keywords: keywords,
    ai_generated: true,
    published: autoPublish,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  const saved = await saveBlogPost(postData);

  return {
    success: true,
    post_id: saved?.id,
    slug,
    title: blog.title,
    category,
    topic_slug: topicSlug,
    has_audio: !!voiceover?.audio_url,
    has_image: !!heroImage,
    published: autoPublish,
    audio_error: voiceover?.error || null,
    url: `https://newurbaninfluence.com/blog/${slug}`
  };
}
