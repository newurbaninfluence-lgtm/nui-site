// netlify/functions/unsubscribe.js
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
var sbH = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" };
exports.handler = async (event) => {
  const { cid, token } = event.queryStringParameters || {};
  const page = (msg, color) => ({
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Urban Influence</title>
<style>body{font-family:Arial,sans-serif;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;max-width:400px;padding:40px;background:#1a1a1a;border-radius:12px;}
h2{color:${color};margin-bottom:16px;} p{color:#888;line-height:1.6;}
a{color:#D90429;} .logo{font-size:18px;font-weight:700;letter-spacing:2px;margin-bottom:24px;display:block;}
</style></head><body><div class="box">
<span class="logo">NEW URBAN <span style="color:#D90429;">INFLUENCE</span></span>
<h2>${msg.title}</h2><p>${msg.body}</p>
<p style="margin-top:24px;"><a href="https://newurbaninfluence.com">newurbaninfluence.com</a></p>
</div></body></html>`
  });
  if (!cid) return page({ title: "Invalid Link", body: "This unsubscribe link is missing required information." }, "#888");
  if (event.httpMethod === "GET") {
    return page({ title: "Unsubscribe", body: `Click below to remove your email from our list. We'll stop sending immediately.<br><br><form method="POST" action="/unsubscribe?cid=` + cid + "&token=" + (token || "") + '"><button type="submit" style="background:#D90429;color:#fff;border:none;padding:12px 28px;border-radius:6px;font-size:15px;cursor:pointer;font-weight:700;">Unsubscribe Me</button></form>' }, "#D90429");
  }
  if (event.httpMethod === "POST") {
    if (!SUPABASE_URL || !SUPABASE_KEY) return page({ title: "Error", body: "Could not process. Please reply to the email directly." }, "#888");
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${cid}`, {
        method: "PATCH",
        headers: sbH,
        body: JSON.stringify({ email_unsubscribed: true, email_unsubscribed_at: (/* @__PURE__ */ new Date()).toISOString(), status: "unsubscribed" })
      });
      await fetch(`${SUPABASE_URL}/rest/v1/sms_suppression`, {
        method: "POST",
        headers: { ...sbH, "Prefer": "return=minimal" },
        body: JSON.stringify({ phone: "email_unsub_" + cid, reason: "email_unsubscribe" })
      }).catch(() => {
      });
      console.log("[Unsub] Contact unsubscribed:", cid);
      return page({ title: "Done \u2713", body: "You've been removed from our email list. No more emails from us." }, "#2ecc71");
    } catch (e) {
      return page({ title: "Error", body: "Something went wrong. Please reply to the email to unsubscribe." }, "#888");
    }
  }
  return page({ title: "Invalid Request", body: "Unknown request method." }, "#888");
};
//# sourceMappingURL=unsubscribe.js.map
