// netlify/functions/push-reinvite.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Content-Type": "application/json"
};
var DEFAULT_MSG = "Hey {name} \u2014 Faren from New Urban Influence. Tap to turn NUI updates back on in 5 seconds: https://newurbaninfluence.com/?push=1 (reply STOP to opt out)";
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "POST only" }) };
  }
  const ADMIN_TOKEN = process.env.NUI_ADMIN_TOKEN;
  const supplied = event.headers["x-admin-token"] || event.headers["X-Admin-Token"] || "";
  if (ADMIN_TOKEN && supplied !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }
  const OP_KEY = process.env.OPENPHONE_API_KEY;
  const OP_FROM = process.env.OPENPHONE_PHONE_NUMBER;
  if (!OP_KEY || !OP_FROM) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "OpenPhone not configured" })
    };
  }
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }
  const recipients = Array.isArray(body.recipients) ? body.recipients : [];
  if (!recipients.length) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "recipients required" }) };
  }
  const template = body.message_override && body.message_override.length > 20 ? body.message_override : DEFAULT_MSG;
  const results = { sent: 0, failed: 0, errors: [] };
  for (const r of recipients) {
    const phone = (r.phone || "").replace(/[^\d+]/g, "");
    const name = (r.name || "there").split(/\s+/)[0];
    if (!phone || phone.length < 10) {
      results.failed++;
      results.errors.push({ recipient: r, reason: "invalid phone" });
      continue;
    }
    const text = template.replace(/\{name\}/g, name);
    const toNumber = phone.startsWith("+") ? phone : "+" + (phone.length === 10 ? "1" + phone : phone);
    try {
      const res = await fetch("https://api.openphone.com/v1/messages", {
        method: "POST",
        headers: {
          "Authorization": OP_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: OP_FROM,
          to: [toNumber],
          content: text
        })
      });
      if (res.ok) {
        results.sent++;
      } else {
        results.failed++;
        const errText = await res.text().catch(() => "");
        results.errors.push({ recipient: r, reason: "openphone " + res.status, detail: errText.slice(0, 200) });
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ recipient: r, reason: "fetch error", detail: err.message });
    }
  }
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true, ...results })
  };
};
//# sourceMappingURL=push-reinvite.js.map
