// unsplash-search.js — Netlify Function
// Searches Unsplash API for stock images (used in moodboard builder)
// GET ?query=... → returns photos
// Env vars: UNSPLASH_ACCESS_KEY

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

  try {
    const params = event.queryStringParameters || {};
    const query = params.query;
    const perPage = params.per_page || 20;
    const page = params.page || 1;

    if (!query) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing query parameter' }) };
    }

    const API_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (!API_KEY) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ results: [], total: 0, error: 'Unsplash API not configured. Set UNSPLASH_ACCESS_KEY.' })
      };
    }

    const resp = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
      {
        headers: { 'Authorization': `Client-ID ${API_KEY}` }
      }
    );

    if (!resp.ok) {
      throw new Error(`Unsplash API error: ${resp.status}`);
    }

    const data = await resp.json();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('unsplash-search error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Unsplash search failed' })
    };
  }
};
