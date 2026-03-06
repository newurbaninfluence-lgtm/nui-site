// image-search.js — Netlify Function
// Combined Pexels + Unsplash + Pixabay search with color filtering
// GET ?query=...&color=...&per_page=...
// Env vars: PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY

const { requireAdmin } = require('./utils/security');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};
const PIXABAY_COLORS = {
  red:'red', orange:'orange', yellow:'yellow',
  green:'green', teal:'turquoise', blue:'blue',
  purple:'lilac', black:'black', white:'white'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode:204, headers:CORS, body:'' };
  if (event.httpMethod !== 'GET') return { statusCode:405, headers:CORS, body:'{"error":"Method not allowed"}' };

  const p = event.queryStringParameters || {};
  const query = p.query;
  if (!query) return { statusCode:400, headers:CORS, body:'{"error":"Missing query"}' };

  const color = p.color || '';
  const perPage = Math.min(parseInt(p.per_page)||15, 30);
  const PX = process.env.PEXELS_API_KEY;
  const UN = process.env.UNSPLASH_ACCESS_KEY;
  const PB = process.env.PIXABAY_API_KEY;
  const results = [];

  // ── PEXELS ──
  if (PX) {
    try {
      let u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      if (color) u += `&color=${encodeURIComponent(color)}`;
      const r = await fetch(u, { headers:{ Authorization: PX } });
      if (r.ok) {
        const d = await r.json();
        (d.photos||[]).forEach(x => results.push({
          id:'pexels-'+x.id, source:'pexels',
          thumb:x.src.tiny, medium:x.src.medium, large:x.src.large2x||x.src.large,
          width:x.width, height:x.height, alt:x.alt||query,
          photographer:x.photographer, color:x.avg_color||'', url:x.url
        }));
      }
    } catch(e) { console.warn('Pexels:', e.message); }
  }
  // ── UNSPLASH ──
  if (UN) {
    try {
      let u = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      if (color) u += `&color=${encodeURIComponent(color)}`;
      const r = await fetch(u, { headers:{ Authorization:`Client-ID ${UN}` } });
      if (r.ok) {
        const d = await r.json();
        (d.results||[]).forEach(x => results.push({
          id:'unsplash-'+x.id, source:'unsplash',
          thumb:x.urls.thumb, medium:x.urls.small, large:x.urls.regular,
          width:x.width, height:x.height, alt:x.alt_description||query,
          photographer:x.user?.name||'', color:x.color||'', url:x.links?.html||''
        }));
      }
    } catch(e) { console.warn('Unsplash:', e.message); }
  }

  // ── PIXABAY ──
  if (PB) {
    try {
      let u = `https://pixabay.com/api/?key=${PB}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo`;
      if (color && PIXABAY_COLORS[color]) u += `&colors=${PIXABAY_COLORS[color]}`;
      const r = await fetch(u);
      if (r.ok) {
        const d = await r.json();
        (d.hits||[]).forEach(x => results.push({
          id:'pixabay-'+x.id, source:'pixabay',
          thumb:x.previewURL, medium:x.webformatURL, large:x.largeImageURL,
          width:x.imageWidth, height:x.imageHeight, alt:x.tags||query,
          photographer:x.user||'', color:'', url:x.pageURL
        }));
      }
    } catch(e) { console.warn('Pixabay:', e.message); }
  }

  if (!PX && !UN && !PB) {
    return { statusCode:200, headers:CORS, body:JSON.stringify({
      photos:[], error:'No image API keys configured. Set PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, and/or PIXABAY_API_KEY.'
    })};
  }

  return { statusCode:200, headers:CORS, body:JSON.stringify({
    photos: results, total: results.length, query, color: color||null,
    sources: { pexels:!!PX, unsplash:!!UN, pixabay:!!PB }
  })};
};
