// netlify/functions/gmb-reviews.js
// Pulls live Google Places reviews for a business
//
// Setup:
//   1. Get a Google Places API key from console.cloud.google.com
//      Enable: "Places API"
//   2. Add to Netlify env vars:
//      GOOGLE_PLACES_API_KEY = your_key_here
//
// Usage:
//   GET /.netlify/functions/gmb-reviews?slug=aj-photography-studio-detroit
//   Returns: { placeId, name, rating, reviewCount, reviews[] }
//
// Known GMB data (verified March 2026 from Google My Business listings)
// Rating and review counts are manually verified — review TEXT requires Places API
const KNOWN_GMB = {
  'aj-photography-studio-detroit': {
    name: 'AJ Photography Studio',
    rating: 4.9,
    reviewCount: 229,
    address: '21700 Greenfield Rd Ste LL18, Oak Park, MI 48237',
    phone: '+1 313-631-8819',
    // Place ID: find at maps.google.com → search "AJ Photography Oak Park MI" → Share → Embed
    // Copy the ID from: ...maps/place/.../@.../data=...1s{PLACE_ID}...
  },
  'larry-castleberry-detroit-storyteller-speaker': {
    name: 'Larry Castleberry',
    rating: 5.0,
    reviewCount: null, // No GMB profile found yet
  },
};

// Place IDs from env vars (set in Netlify dashboard)
const PLACE_IDS = {
  'aj-photography-studio-detroit':
    process.env.AJ_PHOTOGRAPHY_PLACE_ID || null,
  'larry-castleberry-detroit-storyteller-speaker':
    process.env.LARRY_CASTLEBERRY_PLACE_ID || null,
};

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600', // cache 1hr
    'Access-Control-Allow-Origin': '*',
  };

  const slug    = event.queryStringParameters?.slug;
  const placeId = event.queryStringParameters?.placeId || PLACE_IDS[slug];
  const apiKey  = process.env.GOOGLE_PLACES_API_KEY;

  // ── Guard: missing config ──────────────────────────
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'GOOGLE_PLACES_API_KEY not set in Netlify env vars',
        setup: 'Add GOOGLE_PLACES_API_KEY to Site settings → Environment variables',
      }),
    };
  }

  if (!placeId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'No place_id found for this slug',
        hint: 'Add the Place ID to PLACE_IDS map in gmb-reviews.js, or pass ?placeId=ChIJ... in the URL',
        findIt: 'maps.google.com → search business → Share → Embed a map → copy the CID from the iframe src',
      }),
    };
  }

  // ── Call Google Places API ─────────────────────────
  try {
    const fields = 'name,rating,user_ratings_total,reviews';
    const url    = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    const res    = await fetch(url);
    const data   = await res.json();

    if (data.status !== 'OK') {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `Google Places API returned: ${data.status}`,
          message: data.error_message || 'Unknown error',
        }),
      };
    }

    const place = data.result;

    // Normalize reviews to NUI format
    const reviews = (place.reviews || []).map(r => ({
      initials: r.author_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      name:     r.author_name,
      date:     new Date(r.time * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rating:   r.rating,
      text:     r.text,
      platform: 'Google',
      authorUrl: r.author_url,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        placeId,
        name:        place.name,
        rating:      place.rating,
        reviewCount: place.user_ratings_total,
        reviews,
        source:      'Google My Business (Places API)',
        fetchedAt:   new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
