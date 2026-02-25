// ============================================================
// GEO-GRID SCAN — Netlify Function
// Handles geocoding + Google Places text search at grid points
//
// Required env var: GOOGLE_MAPS_API_KEY
// Enable these APIs in Google Cloud Console:
//   - Geocoding API
//   - Places API (New) OR Places API
// ============================================================

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
    }

    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'GOOGLE_MAPS_API_KEY not set' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    // ---- ACTION: GEOCODE ----
    if (body.action === 'geocode') {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(body.address)}&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== 'OK' || !data.results?.length) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Address not found', status: data.status }) };
            }

            const loc = data.results[0].geometry.location;
            return {
                statusCode: 200, headers,
                body: JSON.stringify({ lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address })
            };
        } catch (e) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Geocode failed: ' + e.message }) };
        }
    }

    // ---- ACTION: SEARCH (at a single grid point) ----
    if (body.action === 'search') {
        const { lat, lng, keyword, bizName, maxResults = 20 } = body;

        if (!lat || !lng || !keyword || !bizName) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'lat, lng, keyword, bizName required' }) };
        }

        try {
            // Use Places API Text Search with location bias
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&location=${lat},${lng}&radius=1500&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                return { statusCode: 200, headers, body: JSON.stringify({ rank: null, top: [], error: data.status }) };
            }

            const results = (data.results || []).slice(0, maxResults);
            const names = results.map(r => r.name);

            // Find the target business — fuzzy match
            const bizLower = bizName.toLowerCase().trim();
            let rank = null;
            for (let i = 0; i < names.length; i++) {
                const nameLower = names[i].toLowerCase().trim();
                // Exact match or contains
                if (nameLower === bizLower || nameLower.includes(bizLower) || bizLower.includes(nameLower)) {
                    rank = i + 1;
                    break;
                }
            }

            return {
                statusCode: 200, headers,
                body: JSON.stringify({ rank, top: names })
            };
        } catch (e) {
            return { statusCode: 200, headers, body: JSON.stringify({ rank: null, top: [], error: e.message }) };
        }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action. Use "geocode" or "search".' }) };
};
