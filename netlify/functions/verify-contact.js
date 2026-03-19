// verify-contact.js
// Verifies email + phone for a CRM contact before campaigns
// Email: QuickEmailVerification (3,000 free/month)
// Phone: Veriphone (1,000 free/month)
// Usage: POST { email, phone, contact_id }
//        GET  ?email=x&phone=y&contact_id=z

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const QEV_KEY = process.env.QUICKEMAILVERIFICATION_API_KEY;
const VERIPHONE_KEY = process.env.VERIPHONE_API_KEY;

// ── Email verification ──────────────────────────────────────────────────────
async function verifyEmail(email) {
  if (!email) return { checked: false, reason: "no_email" };
  try {
    const url = `https://api.quickemailverification.com/v1/verify?email=${encodeURIComponent(email)}&apikey=${QEV_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    // result: "valid" | "invalid" | "unknown"
    const safe = data.result === "valid" && data.safe_to_send === "true";
    return {
      checked: true,
      valid: data.result === "valid",
      safe_to_send: safe,
      result: data.result,         // valid / invalid / unknown
      reason: data.reason,         // rejected_email, invalid_domain, etc.
      disposable: data.disposable === "true",
      role_based: data.role === "true",  // info@, admin@, etc.
      did_you_mean: data.did_you_mean || null,
    };
  } catch (err) {
    return { checked: false, reason: "api_error", error: err.message };
  }
}

// ── Phone verification ──────────────────────────────────────────────────────
async function verifyPhone(phone) {
  if (!phone) return { checked: false, reason: "no_phone" };
  try {
    // Clean phone — strip everything but digits and leading +
    const cleaned = phone.replace(/[^\d+]/g, "");
    const url = `https://api.veriphone.io/v2/verify?phone=${encodeURIComponent(cleaned)}&key=${VERIPHONE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    // phone_type: "mobile" | "landline" | "voip" | "unknown"
    const smsable = data.phone_valid && data.phone_type === "mobile";
    return {
      checked: true,
      valid: data.phone_valid,
      sms_safe: smsable,           // true only if mobile — don't SMS landlines/voip
      phone_type: data.phone_type, // mobile / landline / voip / unknown
      carrier: data.carrier || null,
      country: data.country || null,
      international_format: data.international_number || cleaned,
    };
  } catch (err) {
    return { checked: false, reason: "api_error", error: err.message };
  }
}

// ── Save results back to CRM ────────────────────────────────────────────────
async function saveResults(contact_id, emailResult, phoneResult) {
  if (!contact_id) return;
  const update = {
    email_verified: emailResult?.valid ?? null,
    email_risk: emailResult?.result ?? null,          // valid/invalid/unknown
    email_safe_to_send: emailResult?.safe_to_send ?? null,
    phone_verified: phoneResult?.valid ?? null,
    phone_type: phoneResult?.phone_type ?? null,
    phone_sms_safe: phoneResult?.sms_safe ?? null,
    phone_carrier: phoneResult?.carrier ?? null,
    verified_at: new Date().toISOString(),
  };
  await supabase.from("crm_contacts").update(update).eq("id", contact_id);
}

// ── Main handler ────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    let email, phone, contact_id, batch;

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      email = body.email;
      phone = body.phone;
      contact_id = body.contact_id;
      batch = body.batch; // array of {email, phone, contact_id} for bulk
    } else {
      const p = event.queryStringParameters || {};
      email = p.email;
      phone = p.phone;
      contact_id = p.contact_id;
    }

    // ── BATCH MODE — verify entire CRM list ──────────────────────────────
    if (batch) {
      // Pull unverified contacts from Supabase
      const { data: contacts } = await supabase
        .from("crm_contacts")
        .select("id, email, phone, full_name")
        .is("verified_at", null)
        .limit(100);

      if (!contacts || contacts.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "All contacts already verified", verified: 0 }),
        };
      }

      const results = [];
      for (const contact of contacts) {
        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 300));
        const [emailResult, phoneResult] = await Promise.all([
          verifyEmail(contact.email),
          verifyPhone(contact.phone),
        ]);
        await saveResults(contact.id, emailResult, phoneResult);
        results.push({
          id: contact.id,
          name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          email_safe: emailResult?.safe_to_send,
          phone_sms_safe: phoneResult?.sms_safe,
          email_result: emailResult?.result,
          phone_type: phoneResult?.phone_type,
        });
      }

      const safe = results.filter((r) => r.email_safe && r.phone_sms_safe).length;
      const bad_email = results.filter((r) => !r.email_safe).length;
      const bad_phone = results.filter((r) => r.phone_sms_safe === false).length;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          verified: results.length,
          campaign_ready: safe,
          bad_emails: bad_email,
          bad_phones: bad_phone,
          results,
        }),
      };
    }

    // ── SINGLE MODE — verify one contact ─────────────────────────────────
    const [emailResult, phoneResult] = await Promise.all([
      verifyEmail(email),
      verifyPhone(phone),
    ]);

    await saveResults(contact_id, emailResult, phoneResult);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        contact_id,
        email: emailResult,
        phone: phoneResult,
        campaign_ready: emailResult?.safe_to_send && phoneResult?.sms_safe,
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
