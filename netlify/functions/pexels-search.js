// pexels-search.js — Netlify Function
// Searches Pexels API for stock images (used in moodboard builder)
// GET ?query=... → returns photos
// Env vars: PEXELS_API_KEY

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

    const API_KEY = process.env.PEXELS_API_KEY;
    if (!API_KEY) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ photos: [], total_results: 0, error: 'Pexels API not configured. Set PEXELS_API_KEY.' })
      };
    }

    const resp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
      {
        headers: { 'Authorization': API_KEY }
      }
    );

    if (!resp.ok) {
      throw new Error(`Pexels API error: ${resp.status}`);
    }

    const data = await resp.json();
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('pexels-search error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Pexels search failed' })
    };
  }
};
