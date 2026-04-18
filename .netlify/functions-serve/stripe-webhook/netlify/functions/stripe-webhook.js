// netlify/functions/stripe-webhook.js
var crypto = require("crypto");
function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured \u2014 rejecting webhook");
    return false;
  }
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [key, val] = part.split("=");
    acc[key] = val;
    return acc;
  }, {});
  const timestamp = parts.t;
  const signature = parts.v1;
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature || ""), Buffer.from(expected));
}
async function supabaseUpdate(url, serviceKey, table, match, data) {
  const query = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
  return fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(data)
  });
}
async function sendNotifyEmail(to, subject, html) {
  try {
    const nodemailer = require("nodemailer");
    const SMTP_USER = process.env.HOSTINGER_EMAIL;
    const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
    if (!SMTP_USER || !SMTP_PASS) return;
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({ from: `"New Urban Influence" <${SMTP_USER}>`, to, subject, html });
    console.log("Email sent to", to);
  } catch (e) {
    console.error("Email error:", e);
  }
}
var PORTAL_URL = "https://newurbaninfluence.com/app/#login";
var ADMIN_EMAIL = () => process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL;
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  try {
    const sig = event.headers["stripe-signature"];
    if (STRIPE_WEBHOOK_SECRET && sig) {
      if (!verifyStripeSignature(event.body, sig, STRIPE_WEBHOOK_SECRET)) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid signature" }) };
      }
    }
    const stripeEvent = JSON.parse(event.body);
    const eventType = stripeEvent.type;
    const obj = stripeEvent.data?.object;
    console.log(`Stripe webhook: ${eventType}`);
    const hasDB = SUPABASE_URL && SUPABASE_SERVICE_KEY;
    switch (eventType) {
      // ── Payment succeeded ──
      case "payment_intent.succeeded": {
        if (hasDB) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "payments",
            { stripe_payment_intent_id: obj.id },
            { status: "paid", paid_at: (/* @__PURE__ */ new Date()).toISOString() }
          );
          if (obj.metadata?.invoiceId) {
            await supabaseUpdate(
              SUPABASE_URL,
              SUPABASE_SERVICE_KEY,
              "invoices",
              { id: obj.metadata.invoiceId },
              { status: "paid", paid_at: (/* @__PURE__ */ new Date()).toISOString() }
            );
          }
        }
        break;
      }
      // ── Payment failed ──
      case "payment_intent.payment_failed": {
        if (hasDB) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "payments",
            { stripe_payment_intent_id: obj.id },
            { status: "failed", metadata: { failure_message: obj.last_payment_error?.message } }
          );
        }
        break;
      }
      // ── Invoice paid (recurring subscription) ──
      case "invoice.paid": {
        if (hasDB) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "invoices",
            { stripe_invoice_id: obj.id },
            { status: "paid", paid_at: (/* @__PURE__ */ new Date()).toISOString() }
          );
        }
        break;
      }
      // ── Subscription payment failed — AUTO EMAIL + SMS ──
      case "invoice.payment_failed": {
        const customerEmail = obj.customer_email;
        const customerName = obj.customer_name || "";
        if (hasDB) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "invoices",
            { stripe_invoice_id: obj.id },
            { status: "overdue" }
          );
        }
        if (obj.subscription && customerEmail) {
          await sendNotifyEmail(
            customerEmail,
            "\u26A0\uFE0F Payment Failed \u2014 Your Subscription Has Been Paused",
            `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
<h2 style="color:#ef4444;">\u26A0\uFE0F Payment Failed</h2>
<p style="color:#ccc;line-height:1.7;">Hi${customerName ? " " + customerName : ""}, we were unable to process your subscription payment. Your account has been paused and all active orders are on hold.</p>
<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:20px;margin:24px 0;">
<p style="color:#f59e0b;font-weight:600;margin:0 0 8px;">What this means:</p>
<p style="color:#999;font-size:14px;line-height:1.6;margin:0;">\u2022 All design orders are on hold<br>\u2022 No new orders accepted<br>\u2022 Files retained for 90 days<br>\u2022 After 90 days, files permanently deleted</p>
</div>
<div style="text-align:center;margin:24px 0;"><a href="${PORTAL_URL}" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Update Payment \u2192</a></div>
<p style="color:#666;font-size:13px;">Call (248) 487-8747 for help.</p>
<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;color:#555;font-size:12px;">New Urban Influence \u2022 Detroit, MI</div></div>`
          );
          await sendNotifyEmail(
            ADMIN_EMAIL(),
            "\u{1F6A8} Subscription Payment FAILED \u2014 " + customerEmail,
            `<h2 style="color:red;">Payment Failed</h2><p>Client: ${customerEmail} (${customerName})</p><p>Invoice: ${obj.id}</p><p><strong>Pause their subscription in admin panel and follow up.</strong></p>`
          );
        }
        break;
      }
      // ── Checkout completed — subscription activated ──
      case "checkout.session.completed": {
        const meta = obj.metadata || {};
        const clientEmail = obj.customer_email || obj.customer_details?.email;
        if (hasDB && meta.invoiceId) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "invoices",
            { id: meta.invoiceId },
            { status: "paid", paid_at: (/* @__PURE__ */ new Date()).toISOString() }
          );
        }
        if (clientEmail && obj.mode === "subscription") {
          await sendNotifyEmail(
            clientEmail,
            "\u2705 Subscription Activated \u2014 Welcome!",
            `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
<h2 style="color:#10b981;">\u2705 You're All Set!</h2>
<p style="color:#ccc;line-height:1.7;">Your design subscription is now active. Payment confirmed.</p>
<p style="color:#ccc;line-height:1.7;">Log in to your client portal to submit your first design order:</p>
<div style="text-align:center;margin:24px 0;"><a href="${PORTAL_URL}" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Open Client Portal \u2192</a></div>
<p style="color:#666;font-size:13px;">Questions? Call (248) 487-8747.</p>
<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;color:#555;font-size:12px;">New Urban Influence \u2022 Detroit, MI</div></div>`
          );
          await sendNotifyEmail(
            ADMIN_EMAIL(),
            "\u{1F4B0} New Subscription Payment \u2014 " + clientEmail,
            `<h2>Subscription Activated</h2><p>Client: ${clientEmail}</p><p>Client ID: ${meta.clientId || "N/A"}</p><p><strong>Set their status to Active in admin panel.</strong></p>`
          );
        }
        break;
      }
      // ── Subscription status changes ──
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        if (hasDB) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "clients",
            { stripe_customer_id: obj.customer },
            { subscription_status: obj.status, stripe_subscription_id: obj.id }
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        if (hasDB) {
          await supabaseUpdate(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            "clients",
            { stripe_customer_id: obj.customer },
            { subscription_status: "canceled", stripe_subscription_id: null }
          );
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${eventType}`);
    }
    return { statusCode: 200, body: JSON.stringify({ received: true, type: eventType }) };
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=stripe-webhook.js.map
