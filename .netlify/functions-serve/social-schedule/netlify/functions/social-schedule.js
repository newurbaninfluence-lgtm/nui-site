// netlify/functions/social-schedule.js
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  const PAGE_ID = process.env.FB_PAGE_ID;
  const IG_USER_ID = process.env.IG_USER_ID;
  const sbFetch = async (path, opts = {}) => {
    const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
      ...opts,
      headers: {
        "apikey": SB_KEY,
        "Authorization": `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        "Prefer": opts.prefer || "return=representation",
        ...opts.headers || {}
      }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
  };
  try {
    const path = event.path || "";
    if (event.httpMethod === "POST" && path.includes("fire")) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const due = await sbFetch(
        `scheduled_posts?status=eq.scheduled&scheduled_for=lte.${now}&order=scheduled_for.asc&limit=10`
      );
      const fired = [];
      for (const post of due || []) {
        try {
          const results = [];
          if (post.platform === "facebook" || post.platform === "both") {
            const fbBody = { message: post.caption, access_token: PAGE_TOKEN };
            if (post.image_url) fbBody.url = post.image_url;
            const endpoint = post.image_url ? "photos" : "feed";
            const fbRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fbBody)
            });
            const fbData = await fbRes.json();
            results.push({ platform: "facebook", success: fbRes.ok, post_id: fbData.id, error: fbData.error?.message });
          }
          if ((post.platform === "instagram" || post.platform === "both") && post.image_url && IG_USER_ID) {
            const cRes = await fetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: post.image_url, caption: post.caption, access_token: PAGE_TOKEN })
            });
            const cData = await cRes.json();
            if (cRes.ok) {
              const pRes = await fetch(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ creation_id: cData.id, access_token: PAGE_TOKEN })
              });
              const pData = await pRes.json();
              results.push({ platform: "instagram", success: pRes.ok, post_id: pData.id });
            }
          }
          await sbFetch(`scheduled_posts?id=eq.${post.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "posted", posted_at: (/* @__PURE__ */ new Date()).toISOString(), results })
          });
          fired.push({ id: post.id, results });
        } catch (err) {
          await sbFetch(`scheduled_posts?id=eq.${post.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "failed", error: err.message })
          });
          fired.push({ id: post.id, error: err.message });
        }
      }
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ fired: fired.length, details: fired }) };
    }
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { caption, platform, image_url, scheduled_for, source } = body;
      if (!caption || !scheduled_for) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "caption and scheduled_for are required" }) };
      }
      const post = await sbFetch("scheduled_posts", {
        method: "POST",
        body: JSON.stringify({
          caption,
          platform: platform || "facebook",
          image_url: image_url || null,
          scheduled_for: new Date(scheduled_for).toISOString(),
          status: "scheduled",
          source: source || "monty",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true, post: post[0] }) };
    }
    if (event.httpMethod === "GET") {
      const posts = await sbFetch("scheduled_posts?order=scheduled_for.asc&limit=20");
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ posts }) };
    }
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=social-schedule.js.map
