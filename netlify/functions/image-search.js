// image-search.js — Netlify Function
// Combined Pexels + Unsplash image search with color filtering
// GET ?query=...&color=...&source=pexels|unsplash|both&per_page=...
// Env vars: PEXELS_API_KEY, UNSPLASH_ACCESS_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const query = params.query;
  const color = params.color || '';
  const source = params.source || 'both';
  const perPage = parseInt(params.per_page) || 20;

  if (!query) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing query' }) };
  }

  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  const results = [];

  // ─── PEXELS ───
  if (PEXELS_KEY && (source === 'pexels' || source === 'both')) {
    try {
      let pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      if (color) pexelsUrl += `&color=${encodeURIComponent(color)}`;

      const resp = await fetch(pexelsUrl, { headers: { 'Authorization': PEXELS_KEY } });
      if (resp.ok) {
        const data = await resp.json();
        (data.photos || []).forEach(p => {
          results.push({
            id: 'pexels-' + p.id,
            source: 'pexels',
            thumb: p.src.tiny,
            medium: p.src.medium,
            large: p.src.large2x || p.src.large,
            width: p.width,
            height: p.height,
            alt: p.alt || query,
            photographer: p.photographer,
            color: p.avg_color || '',
            url: p.url
          });
        });
      }
    } catch (e) { console.warn('Pexels error:', e.message); }
  }

  // ─── UNSPLASH ───
  if (UNSPLASH_KEY && (source === 'unsplash' || source === 'both')) {
    try {
      let unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      if (color) unsplashUrl += `&color=${encodeURIComponent(color)}`;

      const resp = await fetch(unsplashUrl, {
        headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        (data.results || []).forEach(p => {
          results.push({
            id: 'unsplash-' + p.id,
            source: 'unsplash',
            thumb: p.urls.thumb,
            medium: p.urls.small,
            large: p.urls.regular,
            width: p.width,
            height: p.height,
            alt: p.alt_description || query,
            photographer: p.user?.name || 'Unknown',
            color: p.color || '',
            url: p.links?.html || ''
          });
        });
      }
    } catch (e) { console.warn('Unsplash error:', e.message); }
  }

  // No API keys configured
  if (!PEXELS_KEY && !UNSPLASH_KEY) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        photos: [],
        error: 'No image API keys configured. Set PEXELS_API_KEY and/or UNSPLASH_ACCESS_KEY in Netlify env vars.'
      })
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      photos: results,
      total: results.length,
      query,
      color: color || null,
      sources: {
        pexels: !!PEXELS_KEY,
        unsplash: !!UNSPLASH_KEY
      }
    })
  };
};
