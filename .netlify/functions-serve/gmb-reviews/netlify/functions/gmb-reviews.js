// netlify/functions/gmb-reviews.js
var PLACE_IDS = {
  "aj-photography-studio-detroit": process.env.AJ_PHOTOGRAPHY_PLACE_ID || null,
  "larry-castleberry-detroit-storyteller-speaker": process.env.LARRY_CASTLEBERRY_PLACE_ID || null
};
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    // cache 1hr
    "Access-Control-Allow-Origin": "*"
  };
  const slug = event.queryStringParameters?.slug;
  const placeId = event.queryStringParameters?.placeId || PLACE_IDS[slug];
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "GOOGLE_PLACES_API_KEY not set in Netlify env vars",
        setup: "Add GOOGLE_PLACES_API_KEY to Site settings \u2192 Environment variables"
      })
    };
  }
  if (!placeId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "No place_id found for this slug",
        hint: "Add the Place ID to PLACE_IDS map in gmb-reviews.js, or pass ?placeId=ChIJ... in the URL",
        findIt: "maps.google.com \u2192 search business \u2192 Share \u2192 Embed a map \u2192 copy the CID from the iframe src"
      })
    };
  }
  try {
    const fields = "name,rating,user_ratings_total,reviews";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK") {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `Google Places API returned: ${data.status}`,
          message: data.error_message || "Unknown error"
        })
      };
    }
    const place = data.result;
    const reviews = (place.reviews || []).map((r) => ({
      initials: r.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      name: r.author_name,
      date: new Date(r.time * 1e3).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      rating: r.rating,
      text: r.text,
      platform: "Google",
      authorUrl: r.author_url
    }));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        placeId,
        name: place.name,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        reviews,
        source: "Google My Business (Places API)",
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
//# sourceMappingURL=gmb-reviews.js.map
