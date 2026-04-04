// agent-blogger.js — The Blogger Agent v2
// Upgraded: claude-sonnet-4-6, stronger prompts, better SEO structure
// TODO: Move to Cowork task (Mac Mini) when back online — will add web research
// Schedule: Wednesdays 7am CT (netlify.toml)

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Content-Type': 'application/json' };

const SB_URL  = process.env.SUPABASE_URL;
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE  = process.env.ANTHROPIC_API_KEY;
const SYNTH   = process.env.SYNTHESYS_API_KEY;
const PEXELS  = process.env.PEXELS_API_KEY;

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) } });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

const BLOG_TOPICS = [
  { topic: 'Why Detroit businesses are losing customers to competitors with weaker products but stronger brands', category: 'Branding', keywords: ['brand identity Detroit', 'Detroit business branding', 'local business brand strategy'] },
  { topic: 'The real reason your Detroit business is invisible on Google Maps — and how to fix it in 30 days', category: 'Digital Marketing', keywords: ['Google Maps Detroit', 'Google Business Profile optimization', 'local SEO Detroit'] },
  { topic: 'AI employees vs hiring: what $400 a month actually buys your Detroit business in 2026', category: 'AI & Automation', keywords: ['AI automation small business 2026', 'AI receptionist Detroit', 'business automation tools'] },
  { topic: 'What a $1,500 brand identity actually includes — and why most Detroit businesses need it before anything else', category: 'Branding', keywords: ['brand identity package Detroit', 'logo design cost Detroit', 'professional branding small business'] },
  { topic: 'Geo-fencing for Detroit businesses: how to show your ads to people walking into your competitor right now', category: 'Digital Marketing', keywords: ['geo-fencing Detroit businesses', 'competitor targeting marketing', 'local advertising Detroit'] },
  { topic: '5 reasons your Detroit business website is sending leads to your competition without you knowing', category: 'Web Design', keywords: ['website conversion Detroit', 'business website mistakes', 'Digital HQ Detroit'] },
  { topic: 'How NUI\'s Digital Staff answered 47 after-hours calls in one month for a Southfield business', category: 'Case Study', keywords: ['AI phone assistant Detroit', 'Digital Staff NUI', 'never miss a business call'] },
  { topic: 'The vendor event playbook: how Detroit small businesses capture 10x more leads at All Things Detroit and Eastern Market', category: 'Events & Marketing', keywords: ['All Things Detroit vendor tips', 'Eastern Market Detroit marketing', 'event lead capture small business'] },
  { topic: 'Silent Visitor ID: how to know exactly who visited your website today without them filling out a form', category: 'Digital Marketing', keywords: ['silent visitor identification', 'website visitor tracking', 'anonymous visitor identify'] },
  { topic: 'Built Heavy: the Detroit entrepreneur mindset that separates businesses that scale from ones that stall', category: 'Entrepreneurship', keywords: ['Built Heavy Faren Young', 'Detroit entrepreneur mindset', 'small business growth Detroit'] },
  { topic: 'Press features, Google reviews, and citations: the credibility stack that closes high-ticket Detroit clients', category: 'Branding', keywords: ['business credibility Detroit', 'NUI Magazine press feature', 'high ticket client trust signals'] },
  { topic: 'Holiday marketing for Detroit businesses: a 60-day print and promotion plan that actually drives foot traffic', category: 'Digital Marketing', keywords: ['holiday marketing Detroit business', 'holiday print promotions', 'seasonal business marketing Detroit'] }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

async function getNextTopic() {
  try {
    const logs = await sbFetch('agent_logs?agent_id=eq.blogger&order=created_at.desc&limit=12');
    const used = (logs || []).map(l => l.metadata?.topic_slug).filter(Boolean);
    return BLOG_TOPICS.find(t => !used.includes(slugify(t.topic))) || BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
  } catch { return BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)]; }
}


async function generateBlogPost(topic, category, keywords) {
  const prompt = `You are Faren Young — founder of New Urban Influence (NUI), a Detroit branding and AI automation agency. You write like you talk: direct, Detroit-grounded, no corporate fluff. Your readers are small business owners in Detroit and Michigan who are tired of being sold dreams and want real actionable info.

Write a complete SEO blog post on this topic:
"${topic}"

VOICE RULES:
— Write like you're talking directly to a Detroit business owner over coffee
— Drop real examples: neighborhoods (Southfield, 8 Mile, Livernois, Downtown), industries (barbershops, salons, contractors, photographers, restaurants, cannabis)
— Be specific with numbers, timeframes, and outcomes
— No "In today's fast-paced world" openings — ever
— No corporate jargon. Plain English.
— Slight edge — you've seen what happens when businesses don't take this seriously

SEO REQUIREMENTS:
— Category: ${category}
— Primary keywords (use naturally, never stuffed): ${keywords.join(', ')}
— Word count: 1,000–1,300 words
— H2 subheadings that would rank as featured snippets
— One Detroit-specific example or scenario minimum
— CTA at the end linking to https://newurbaninfluence.com/contact

Return ONLY valid JSON — no markdown, no fences, no explanation:
{
  "title": "SEO title 55-60 chars — direct, specific, Detroit or small business angle",
  "meta_description": "155 chars max — lead with the benefit, include primary keyword",
  "excerpt": "2 punchy sentences for the blog preview card",
  "read_time": "X min read",
  "content": "Full HTML using <h2> <p> <ul> <li> <strong> <blockquote> — NO inline styles. Include a <blockquote> with a bold NUI positioning statement somewhere mid-post.",
  "voice_script": "A 60-second spoken intro (about 150 words). Sounds like Faren talking into a mic — warm, direct, Detroit energy. Hooks the listener in the first 10 words. Ends with: 'Read the full post at newurbaninfluence.com'",
  "image_search_query": "4-6 word Pexels search query — specific to the topic"
}`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
  });
  const d = await r.json();
  const raw = d.content?.[0]?.text?.trim() || '{}';
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { const match = raw.match(/\{[\s\S]*\}/); if (match) { try { return JSON.parse(match[0]); } catch {} } throw new Error('Blog JSON parse failed: ' + raw.slice(0, 200)); }
}

async function generateVoiceover(script) {
  if (!SYNTH || !script) return { skipped: true, reason: !SYNTH ? 'no SYNTHESYS_API_KEY' : 'no script' };
  try {
    const r = await fetch('https://synthesys.live/api/actor/generateVoice', {
      method: 'POST',
      headers: { 'APIKey': SYNTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [{ actorId: 415, text: script, isUltraRealistic: true, features: [{ key: 'speed', value: '1.0' }] }] })
    });
    if (!r.ok) { const err = await r.text(); return { success: false, error: `Synthesys ${r.status}: ${err.slice(0, 200)}` }; }
    const d = await r.json();
    const audioUrl = d.url || d.audioUrl || d.data?.[0]?.url || d.result?.url || null;
    return audioUrl ? { success: true, audio_url: audioUrl } : { success: false, error: 'No audio URL', raw: JSON.stringify(d).slice(0, 200) };
  } catch (e) { return { success: false, error: e.message }; }
}

async function getHeroImage(query) {
  if (!PEXELS || !query) return null;
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`, { headers: { 'Authorization': PEXELS } });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 8))];
    return pick.src?.large2x || pick.src?.large || null;
  } catch { return null; }
}

async function logRun(data) {
  try { await sbFetch('agent_logs', { method: 'POST', body: JSON.stringify({ agent_id: 'blogger', status: data.success ? 'success' : 'error', metadata: data, created_at: new Date().toISOString() }) }); } catch {}
}

async function generateAndSave(topicObj, autoPublish = false) {
  const { topic, category, keywords } = topicObj;
  const topicSlug = slugify(topic);
  const blog = await generateBlogPost(topic, category, keywords);
  if (!blog.title) throw new Error('Blog generation failed — no title');
  const now = new Date();
  const slug = slugify(blog.title) + '-' + now.getFullYear();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const [voiceover, heroImage] = await Promise.all([generateVoiceover(blog.voice_script), getHeroImage(blog.image_search_query)]);
  let fullContent = blog.content || '';
  if (voiceover?.audio_url) {
    const audioBlock = `<div class="blog-voice-overview" style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px 24px;margin:24px 0;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><strong style="color:#C9A227;font-size:14px;">🎙 Listen to the Overview</strong></div><audio controls style="width:100%;height:44px;" preload="none"><source src="${voiceover.audio_url}" type="audio/mpeg"></audio><p style="color:#888;font-size:12px;margin:8px 0 0;">60-second audio overview by Faren Young</p></div>`;
    fullContent = fullContent.replace(/(<p[^>]*>)/, `${audioBlock}$1`);
    if (!fullContent.includes(audioBlock)) fullContent = audioBlock + fullContent;
  }
  fullContent += `<div class="blog-cta" style="background:#0a0a0a;border:1px solid #C9A227;border-radius:12px;padding:32px;margin-top:40px;text-align:center;"><h3 style="color:#C9A227;margin:0 0 12px;font-size:20px;">Ready to Build Something Real?</h3><p style="color:#ccc;margin:0 0 20px;">Book a free strategy call with Faren Young — no pitch, just a real conversation.</p><a href="https://newurbaninfluence.com/contact" style="display:inline-block;background:#D90429;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">Book Your Free Call →</a></div>`;
  const postData = { slug, title: blog.title, excerpt: blog.excerpt || '', meta_description: blog.meta_description || '', category, image: heroImage || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80', author: 'Faren Young', author_image: 'icons/icon-192.png', date: dateStr, read_time: blog.read_time || '6 min read', content: fullContent, voice_script: blog.voice_script || '', audio_url: voiceover?.audio_url || null, seo_keywords: keywords, ai_generated: true, published: autoPublish, created_at: now.toISOString(), updated_at: now.toISOString() };
  const rows = await sbFetch('blog_posts', { method: 'POST', body: JSON.stringify(postData) });
  return { success: true, post_id: rows?.[0]?.id, slug, title: blog.title, category, topic_slug: topicSlug, has_audio: !!voiceover?.audio_url, has_image: !!heroImage, published: autoPublish, url: `https://newurbaninfluence.com/blog/${slug}` };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const autoPublish = body.auto_publish === true;
    let topicObj = body.topic ? { topic: body.topic, category: body.category || 'Branding', keywords: body.keywords || ['Detroit branding', 'NUI agency', 'brand strategy'] } : await getNextTopic();
    const result = await generateAndSave(topicObj, autoPublish);
    await logRun(result);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    const r = { success: false, error: err.message };
    await logRun(r).catch(() => {});
    return { statusCode: 500, headers: CORS, body: JSON.stringify(r) };
  }
};
