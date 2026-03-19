// manage-client.js
// Monty's direct line to create clients, projects, and push updates via Telegram
// Called by OpenClaw skill — secured with ADMIN_API_TOKEN
// Actions: create_client | create_project | update_project | add_update | list_projects | get_client

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Content-Type': 'application/json',
};

const SUPA_URL  = () => process.env.SUPABASE_URL;
const SUPA_KEY  = () => process.env.SUPABASE_SERVICE_KEY;
const ADMIN_TOK = () => process.env.ADMIN_API_TOKEN;

const db = (path, opts = {}) => fetch(`${SUPA_URL()}/rest/v1/${path}`, {
  ...opts,
  headers: {
    apikey: SUPA_KEY(),
    Authorization: `Bearer ${SUPA_KEY()}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...(opts.headers || {}),
  },
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };

  // Auth
  const token = event.headers['x-admin-token'] || '';
  if (token !== ADMIN_TOK()) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  const { action, data = {} } = body;

  try {
    switch (action) {

      // ── CREATE CLIENT ──────────────────────────────────────────
      // Creates contact in crm_contacts + Supabase Auth account
      // Returns login credentials to send to client
      case 'create_client': {
        const { first_name, last_name, email, phone, company, service, notes, send_invite = true } = data;
        if (!first_name || !email) return err('first_name and email required');

        // 1. Add to crm_contacts
        const full_name = `${first_name} ${last_name || ''}`.trim();
        const tempPassword = genPassword();

        const contactRes = await db('crm_contacts', {
          method: 'POST',
          body: JSON.stringify({
            first_name, last_name, full_name, email, phone,
            company, notes,
            lead_status: 'client',
            lead_source: 'monty',
            service_interest: service || 'General',
            portal_password: tempPassword,
            created_at: new Date().toISOString(),
          }),
        });
        const [contact] = await contactRes.json();

        // 2. Create Supabase Auth account for portal login
        let authUser = null;
        try {
          const authRes = await fetch(`${SUPA_URL()}/auth/v1/admin/users`, {
            method: 'POST',
            headers: { apikey: SUPA_KEY(), Authorization: `Bearer ${SUPA_KEY()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: { name: full_name, role: 'client', company, contact_id: contact?.id },
            }),
          });
          authUser = await authRes.json();
        } catch (e) { /* auth creation non-fatal */ }

        // 3. Send welcome SMS if phone provided
        if (send_invite && phone) {
          const msg = `Hi ${first_name}! Welcome to New Urban Influence. Your client portal is ready at newurbaninfluence.com — log in with ${email} / ${tempPassword}. Faren will be in touch soon!`;
          await fetch(`${process.env.URL || 'https://newurbaninfluence.com'}/.netlify/functions/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phone, message: msg }),
          }).catch(() => {});
        }

        // 4. Log activity
        await db('activity_log', {
          method: 'POST',
          body: JSON.stringify({
            contact_id: contact?.id,
            type: 'client_created',
            notes: `Client created by Monty. Service: ${service || 'TBD'}`,
            created_at: new Date().toISOString(),
          }),
        }).catch(() => {});

        return ok({
          client: contact,
          portal_email: email,
          portal_password: tempPassword,
          portal_url: 'https://newurbaninfluence.com/#portal',
          invite_sent: !!(send_invite && phone),
          message: `✅ Client created! ${full_name} can log in at newurbaninfluence.com/#portal with ${email} / ${tempPassword}`,
        });
      }

      // ── CREATE PROJECT ────────────────────────────────────────
      case 'create_project': {
        const { client_id, client_name, client_email, title, type, services = [], price, notes, priority = 'normal' } = data;
        if (!title) return err('title required');

        const jobRes = await db('jobs', {
          method: 'POST',
          body: JSON.stringify({
            client_id, client_name, client_email,
            title, type: type || 'branding',
            status: 'new',
            services, price, notes, priority,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
        const [job] = await jobRes.json();

        // Notify client via SMS if we have their phone
        if (client_id) {
          const cRes = await db(`crm_contacts?id=eq.${client_id}&select=phone,first_name`);
          const [c] = await cRes.json() || [];
          if (c?.phone) {
            await fetch(`${process.env.URL || 'https://newurbaninfluence.com'}/.netlify/functions/send-sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: c.phone, message: `Hi ${c.first_name}! Your project "${title}" has been started. Track progress in your portal at newurbaninfluence.com/#portal` }),
            }).catch(() => {});
          }
        }

        return ok({ job, message: `✅ Project "${title}" created (status: new). Client notified.` });
      }

      // ── UPDATE PROJECT STATUS ─────────────────────────────────
      case 'update_project': {
        const { job_id, status, notes, notify_client = true } = data;
        if (!job_id || !status) return err('job_id and status required');

        const validStatuses = ['new', 'inprogress', 'review', 'done'];
        if (!validStatuses.includes(status)) return err(`status must be one of: ${validStatuses.join(', ')}`);

        const statusLabels = { new: 'Just Started', inprogress: 'In Progress', review: 'Ready for Your Review', done: '✅ Complete!' };

        await db(`jobs?id=eq.${job_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status, notes, updated_at: new Date().toISOString() }),
        });

        // Pull job + client to notify
        const jobRes = await db(`jobs?id=eq.${job_id}&select=*`);
        const [job] = await jobRes.json() || [];

        if (notify_client && job?.client_id) {
          const cRes = await db(`crm_contacts?id=eq.${job.client_id}&select=phone,first_name`);
          const [c] = await cRes.json() || [];
          if (c?.phone) {
            const msg = `Hi ${c.first_name}! Update on "${job.title}": ${statusLabels[status]}. ${notes ? `Note: ${notes} ` : ''}View your portal at newurbaninfluence.com/#portal`;
            await fetch(`${process.env.URL || 'https://newurbaninfluence.com'}/.netlify/functions/send-sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: c.phone, message: msg }),
            }).catch(() => {});
          }
        }

        return ok({ job, message: `✅ Project updated to "${statusLabels[status]}". ${notify_client ? 'Client notified.' : ''}` });
      }

      // ── ADD PROJECT UPDATE / NOTE ─────────────────────────────
      case 'add_update': {
        const { job_id, update_text, notify_client = true } = data;
        if (!job_id || !update_text) return err('job_id and update_text required');

        // Pull job
        const jobRes = await db(`jobs?id=eq.${job_id}&select=*`);
        const [job] = await jobRes.json() || [];

        // Append note to existing notes
        const existingNotes = job?.notes || '';
        const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const newNotes = existingNotes ? `${existingNotes}\n\n[${timestamp}] ${update_text}` : `[${timestamp}] ${update_text}`;

        await db(`jobs?id=eq.${job_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ notes: newNotes, updated_at: new Date().toISOString() }),
        });

        // Log activity
        await db('activity_log', {
          method: 'POST',
          body: JSON.stringify({
            contact_id: job?.client_id,
            type: 'project_update',
            notes: `Project "${job?.title}": ${update_text}`,
            created_at: new Date().toISOString(),
          }),
        }).catch(() => {});

        // SMS client
        if (notify_client && job?.client_id) {
          const cRes = await db(`crm_contacts?id=eq.${job.client_id}&select=phone,first_name`);
          const [c] = await cRes.json() || [];
          if (c?.phone) {
            const msg = `Hi ${c.first_name}! Update on "${job.title}": ${update_text} — View your portal at newurbaninfluence.com/#portal`;
            await fetch(`${process.env.URL || 'https://newurbaninfluence.com'}/.netlify/functions/send-sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: c.phone, message: msg }),
            }).catch(() => {});
          }
        }

        return ok({ message: `✅ Update added to "${job?.title}". ${notify_client ? 'Client notified via SMS.' : ''}` });
      }

      // ── LIST PROJECTS ────────────────────────────────────────
      case 'list_projects': {
        const { client_id, client_name, status } = data;
        let query = 'jobs?select=*&order=updated_at.desc&limit=20';
        if (client_id)   query += `&client_id=eq.${client_id}`;
        if (client_name) query += `&client_name=ilike.${encodeURIComponent('%' + client_name + '%')}`;
        if (status && status !== 'all') query += `&status=eq.${status}`;
        const res = await db(query);
        const jobs = await res.json();
        return ok({ jobs, count: jobs.length });
      }

      // ── GET CLIENT ──────────────────────────────────────────
      case 'get_client': {
        const { query: q } = data;
        if (!q) return err('query required');
        const res = await db(`crm_contacts?or=(full_name.ilike.${encodeURIComponent('%'+q+'%')},email.ilike.${encodeURIComponent('%'+q+'%')},phone.ilike.${encodeURIComponent('%'+q+'%')},company.ilike.${encodeURIComponent('%'+q+'%')})&limit=5`);
        const contacts = await res.json();
        return ok({ contacts, count: contacts.length });
      }

      default:
        return err(`Unknown action: ${action}. Valid: create_client, create_project, update_project, add_update, list_projects, get_client`);
    }
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};

// ── Helpers ────────────────────────────────────────────────────
function ok(data)  { return { statusCode: 200, headers: CORS, body: JSON.stringify(data) }; }
function err(msg)  { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: msg }) }; }
function genPassword() {
  const words = ['brand', 'nui', 'build', 'grow', 'empire', 'detroit', 'rise', 'bold'];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(100 + Math.random() * 900);
  return `${w}${n}`;
}
