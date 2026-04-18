// netlify/functions/push-config.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600"
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "GET only" }) };
  }
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key || key.includes("YOUR_")) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "VAPID_PUBLIC_KEY not configured" })
    };
  }
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ vapid_public_key: key })
  };
};
//# sourceMappingURL=push-config.js.map
