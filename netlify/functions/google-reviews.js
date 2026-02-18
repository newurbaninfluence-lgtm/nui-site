// google-reviews.js — Netlify Function
// Fetches Google Place reviews via Google Places API
// GET ?placeId=ChIJ... → returns reviews
// Env vars: GOOGLE_PLACES_API_KEY

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
    const placeId = params.placeId;

    if (!placeId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing placeId parameter' }) };
    }

    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    if (!API_KEY) {
      // Return empty array if no API key — frontend will show demo data
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, reviews: [], error: 'Google Places API not configured' })
      };
    }

    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,rating,user_ratings_total&key=${API_KEY}`
    );

    const data = await resp.json();

    if (data.status !== 'OK') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, reviews: [], error: data.status, errorMessage: data.error_message })
      };
    }

    const result = data.result || {};
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        reviews: result.reviews || [],
        rating: result.rating,
        totalReviews: result.user_ratings_total,
        source: 'google'
      })
    };
  } catch (err) {
    console.error('google-reviews error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Reviews fetch failed' })
    };
  }
};
