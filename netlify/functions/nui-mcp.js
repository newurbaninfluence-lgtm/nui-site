// ========================================================================
// nui-mcp.js — MCP server for the NUI back office
// ========================================================================
// Lets Claude (or any MCP client) work in the back office directly:
// read and update clients, read messages and invoices, and edit the live
// newurbaninfluence.com site through site_edits (live with no deploy).
//
// URL   : https://newurbaninfluence.com/.netlify/functions/nui-mcp
// Auth  : Authorization: Bearer <ADMIN_SECRET>  (or X-Admin-Token) — the
//         same key the /app/ back office uses. Fails closed.
// Wire  : MCP Streamable HTTP, stateless — JSON-RPC over POST, JSON replies.
//
// Deliberately NOT here: sending texts/emails, deleting anything, changing
// billing status or suspending sites. Those stay in the back office where
// Faren approves them.
// ========================================================================

const { requireAdmin } = require('./utils/security');

const SERVER = { name: 'nui-back-office', version: '1.0.0' };
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, Mcp-Session-Id, Mcp-Protocol-Version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const READ_TABLES = ['client_sites', 'communications', 'invoices', 'payments', 'leads', 'crm_contacts', 'projects', 'orders', 'site_edits', 'agent_logs'];
const CLIENT_FIELDS = ['client_name', 'site_name', 'contact_phone', 'contact_email', 'notes', 'monthly_fee', 'domain', 'plan'];
const EDIT_ACTIONS = ['text', 'attr', 'style', 'html', 'after', 'before', 'append', 'hide', 'css'];

// ---------- Supabase REST (service key, server side only) ----------
async function sb(path, { method = 'GET', body, prefer } = {}) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Database said ' + res.status + ': ' + text.slice(0, 300));
  return text ? JSON.parse(text) : null;
}
const enc = encodeURIComponent;
const digits = (p) => String(p || '').replace(/\D/g, '').slice(-10);
const fee = (s) => Number(s.monthly_fee != null ? s.monthly_fee : s.monthly_rate) || 0;

function groupCustomers(sites) {
  const map = new Map();
  for (const s of sites) {
    const key = (s.billing_group || s.client_name || s.site_name || s.site_id || '').trim().toLowerCase();
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.entries()].map(([key, list]) => {
    const pick = (f) => (list.find((s) => s[f]) || {})[f] || null;
    const statuses = list.map((s) => s.billing_status || 'unbilled');
    const monthly = list.reduce((a, s) => a + (s.status === 'suspended' ? 0 : fee(s)), 0);
    let billing = 'not billed';
    if (list.every((s) => s.status === 'suspended')) billing = 'site paused';
    else if (statuses.includes('overdue')) billing = 'overdue';
    else if (statuses.includes('active')) billing = 'paying';
    else if (!monthly) billing = 'no price set';
    return {
      customer: list[0].client_name || list[0].site_name,
      key,
      monthly,
      billing,
      phone: pick('contact_phone'),
      email: pick('contact_email') || pick('client_email'),
      card_on_file: !!(pick('stripe_subscription_id') || pick('stripe_customer_id')),
      next_due: list.map((s) => s.next_due_date).filter(Boolean).sort()[0] || null,
      sites: list.map((s) => ({ site_id: s.site_id, site_name: s.site_name, domain: s.domain, monthly_fee: fee(s), status: s.status, billing_status: s.billing_status }))
    };
  });
}

const SITE_COLS = 'id,site_id,site_name,client_name,domain,status,billing_status,monthly_fee,monthly_rate,list_price,discount_amount,next_due_date,last_payment_at,contact_phone,contact_email,client_email,stripe_customer_id,stripe_subscription_id,billing_group,plan,notes,created_at';

// ---------- tools ----------
const TOOLS = [
  {
    name: 'list_clients',
    description: 'List every NUI customer (websites grouped by customer) with monthly price, billing state (paying / not billed / overdue / site paused / no price set), contact info and their sites.',
    inputSchema: { type: 'object', properties: { billing: { type: 'string', description: 'Optional filter: paying, not billed, overdue, site paused, no price set' } } },
    annotations: { readOnlyHint: true },
    async run({ billing } = {}) {
      const sites = await sb('client_sites?select=' + SITE_COLS + '&order=created_at.asc');
      let out = groupCustomers(sites);
      if (billing) out = out.filter((c) => c.billing === billing.toLowerCase());
      return out;
    }
  },
  {
    name: 'get_client',
    description: 'Full record for one customer: every site row, contact info, notes, invoices and their last 50 texts/emails. Search by customer name, business name, site_id or domain.',
    inputSchema: { type: 'object', properties: { search: { type: 'string' } }, required: ['search'] },
    annotations: { readOnlyHint: true },
    async run({ search }) {
      const q = String(search || '').replace(/[,()*]/g, ' ').trim();
      if (!q) throw new Error('search is required');
      const like = enc('*' + q + '*');
      const hit = await sb(`client_sites?select=${SITE_COLS}&or=(client_name.ilike.${like},site_name.ilike.${like},site_id.ilike.${like},domain.ilike.${like},billing_group.ilike.${like})`);
      if (!hit.length) return { found: false, message: 'No customer matches "' + q + '".' };
      const groupKey = (hit[0].billing_group || hit[0].client_name || '').trim();
      const sites = hit[0].billing_group
        ? await sb(`client_sites?select=${SITE_COLS}&billing_group=eq.${enc(hit[0].billing_group)}`)
        : await sb(`client_sites?select=${SITE_COLS}&client_name=eq.${enc(hit[0].client_name)}`);
      const c = groupCustomers(sites)[0];
      const ors = [];
      const p = digits(c.phone);
      if (p.length === 10) ors.push(`metadata->>to.ilike.*${p}`, `metadata->>from.ilike.*${p}`);
      if (c.email) ors.push(`metadata->>to.ilike."${c.email}"`);
      const messages = ors.length
        ? await sb(`communications?select=channel,direction,subject,message,status,created_at,opened_at&or=(${enc(ors.join(','))})&order=created_at.desc&limit=50`)
        : [];
      const iors = [];
      if (c.email) iors.push(`client_email.ilike."${c.email}"`);
      if (c.customer) iors.push(`client_name.ilike."${String(c.customer).replace(/[",()]/g, ' ')}"`);
      const invoices = iors.length ? await sb(`invoices?select=invoice_number,total,amount_paid,status,due_date,paid_at,created_at&or=(${enc(iors.join(','))})&order=created_at.desc&limit=50`) : [];
      return {
        found: true,
        group: groupKey,
        summary: c,
        site_rows: sites,
        invoices,
        messages: messages.map((m) => ({ ...m, message: String(m.message || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600) }))
      };
    }
  },
  {
    name: 'update_client',
    description: 'Change details on one website/customer row in client_sites, matched by site_id. Allowed fields: ' + CLIENT_FIELDS.join(', ') + '. Billing status, suspension and Stripe fields cannot be changed here. Only change client data when Faren has asked for it.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: { type: 'string' },
        changes: { type: 'object', description: 'Field → new value. Use null to clear a field.' },
        whole_customer: { type: 'boolean', description: 'For client_name / contact_phone / contact_email only: apply to every site of this customer (same billing_group or client_name).' }
      },
      required: ['site_id', 'changes']
    },
    async run({ site_id, changes, whole_customer }) {
      const patch = {};
      for (const [k, v] of Object.entries(changes || {})) {
        if (!CLIENT_FIELDS.includes(k)) throw new Error('Field "' + k + '" cannot be changed here. Allowed: ' + CLIENT_FIELDS.join(', '));
        patch[k] = k === 'monthly_fee' && v != null ? Number(v) : v;
      }
      if (!Object.keys(patch).length) throw new Error('No changes given');
      const rows = await sb(`client_sites?select=id,site_id,client_name,billing_group&site_id=eq.${enc(site_id)}`);
      if (!rows.length) throw new Error('No site with site_id "' + site_id + '"');
      let filter = `site_id=eq.${enc(site_id)}`;
      if (whole_customer) {
        const contactOnly = Object.keys(patch).every((k) => ['client_name', 'contact_phone', 'contact_email'].includes(k));
        if (!contactOnly) throw new Error('whole_customer only works for client_name, contact_phone and contact_email');
        filter = rows[0].billing_group ? `billing_group=eq.${enc(rows[0].billing_group)}` : `client_name=eq.${enc(rows[0].client_name)}`;
      }
      const updated = await sb('client_sites?' + filter + '&select=site_id,' + Object.keys(patch).join(','), { method: 'PATCH', body: patch, prefer: 'return=representation' });
      return { saved: true, rows_updated: updated.length, rows: updated };
    }
  },
  {
    name: 'add_client',
    description: 'Add a new customer website row to client_sites (status active, not billed yet).',
    inputSchema: {
      type: 'object',
      properties: {
        client_name: { type: 'string' }, site_name: { type: 'string' }, site_id: { type: 'string', description: 'Optional short id; made from site_name if left out' },
        domain: { type: 'string' }, contact_phone: { type: 'string' }, contact_email: { type: 'string' }, monthly_fee: { type: 'number' }, plan: { type: 'string' }, notes: { type: 'string' }
      },
      required: ['client_name', 'site_name']
    },
    async run(a) {
      const site_id = (a.site_id || a.site_name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      const row = { site_id, site_name: a.site_name, client_name: a.client_name, domain: a.domain || null, contact_phone: a.contact_phone || null, contact_email: a.contact_email || null, monthly_fee: a.monthly_fee != null ? Number(a.monthly_fee) : null, plan: a.plan || null, notes: a.notes || null, status: 'active', billing_status: 'unbilled' };
      const out = await sb('client_sites?select=site_id,site_name,client_name', { method: 'POST', body: row, prefer: 'return=representation' });
      return { saved: true, row: out[0] };
    }
  },
  {
    name: 'list_site_edits',
    description: 'List the live edits on a site (default newurbaninfluence.com). Each edit changes the page in the browser on load — words, links, styles, added blocks, hidden parts, extra CSS — with no deploy.',
    inputSchema: { type: 'object', properties: { site_id: { type: 'string', default: 'newurbaninfluence' }, page: { type: 'string', description: 'Optional page path like / or /restaurants-bars, or * for every page' } } },
    annotations: { readOnlyHint: true },
    async run({ site_id = 'newurbaninfluence', page } = {}) {
      return sb(`site_edits?select=id,page,selector,action,name,value,note,enabled,sort,updated_at&site_id=eq.${enc(site_id)}${page ? '&page=eq.' + enc(page) : ''}&order=page.asc,sort.asc`);
    }
  },
  {
    name: 'save_site_edit',
    description: 'Create or update one live site edit (goes live on the next page load, no deploy). Pass id to update an existing edit. To remove an edit, set enabled=false (edits are never deleted here). Actions: text (selector + value), attr (selector + name + value), style (selector + name + value), html/after/before/append (selector + HTML value), hide (selector), css (value only).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' }, site_id: { type: 'string', default: 'newurbaninfluence' }, page: { type: 'string', description: 'Page path, e.g. "/" or "*" for every page' },
        selector: { type: 'string' }, action: { type: 'string', enum: EDIT_ACTIONS }, name: { type: 'string' }, value: { type: 'string' },
        note: { type: 'string', description: 'Plain words: what this edit does' }, enabled: { type: 'boolean' }, sort: { type: 'integer' }
      }
    },
    async run(a) {
      const row = {};
      for (const k of ['page', 'selector', 'action', 'name', 'value', 'note', 'enabled', 'sort']) if (a[k] !== undefined) row[k] = a[k];
      if (row.action && !EDIT_ACTIONS.includes(row.action)) throw new Error('action must be one of ' + EDIT_ACTIONS.join(', '));
      if (row.action === 'attr' && /^on/i.test(row.name || '')) throw new Error('Event-handler attributes are not allowed');
      row.updated_at = new Date().toISOString();
      if (a.id) {
        const out = await sb(`site_edits?id=eq.${enc(a.id)}&select=id,page,selector,action,enabled`, { method: 'PATCH', body: row, prefer: 'return=representation' });
        if (!out.length) throw new Error('No edit with id ' + a.id);
        return { saved: true, edit: out[0] };
      }
      if (!row.page || !row.action) throw new Error('page and action are required for a new edit');
      if (row.action !== 'css' && !row.selector) throw new Error('selector is required for this action');
      row.site_id = a.site_id || 'newurbaninfluence';
      if (row.enabled === undefined) row.enabled = true;
      const out = await sb('site_edits?select=id,page,selector,action,enabled', { method: 'POST', body: row, prefer: 'return=representation' });
      return { saved: true, edit: out[0] };
    }
  },
  {
    name: 'read_table',
    description: 'Read rows from a back-office table (read only). Tables: ' + READ_TABLES.join(', ') + '.',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', enum: READ_TABLES },
        select: { type: 'string', default: '*' },
        equals: { type: 'object', description: 'column → exact value filters' },
        order: { type: 'string', description: 'e.g. created_at.desc' },
        limit: { type: 'integer', default: 50, maximum: 500 }
      },
      required: ['table']
    },
    annotations: { readOnlyHint: true },
    async run({ table, select = '*', equals = {}, order, limit = 50 }) {
      if (!READ_TABLES.includes(table)) throw new Error('Table not allowed');
      const parts = ['select=' + enc(select)];
      for (const [k, v] of Object.entries(equals || {})) {
        if (!/^[a-z_][a-z0-9_]*$/i.test(k)) throw new Error('Bad column name ' + k);
        parts.push(k + '=eq.' + enc(v));
      }
      if (order) parts.push('order=' + enc(order));
      parts.push('limit=' + Math.min(Number(limit) || 50, 500));
      return sb(table + '?' + parts.join('&'));
    }
  }
];

// ---------- JSON-RPC ----------
const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

async function handle(msg) {
  const { id, method, params = {} } = msg || {};
  const isNotification = id === undefined || id === null;
  switch (method) {
    case 'initialize': {
      const v = PROTOCOLS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOLS[0];
      return ok(id, {
        protocolVersion: v,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: 'NUI back office. Clients live in client_sites (one row per website; one customer can have several). Site content edits go in site_edits and are live immediately. Never change client data on someone else\'s say-so without Faren approving it. Texting/emailing clients is done by Faren in the back office, not here.'
      });
    }
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return null;
    case 'ping':
      return ok(id, {});
    case 'tools/list':
      return ok(id, { tools: TOOLS.map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, ...(annotations ? { annotations } : {}) })) });
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) return fail(id, -32602, 'Unknown tool: ' + params.name);
      try {
        const data = await tool.run(params.arguments || {});
        return ok(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
      } catch (e) {
        return ok(id, { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true });
      }
    }
    default:
      return isNotification ? null : fail(id, -32601, 'Method not found: ' + method);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: { ...HEADERS, Allow: 'POST' }, body: JSON.stringify({ error: 'POST only (stateless MCP)' }) };

  // Accept the back-office key as a Bearer token too (what MCP clients send).
  const h = event.headers || {};
  const bearer = (h.authorization || h.Authorization || '').replace(/^Bearer\s+/i, '');
  const auth = requireAdmin({ ...event, headers: { ...h, 'x-admin-token': h['x-admin-token'] || h['X-Admin-Token'] || bearer } });
  if (!auth.authorized) return { statusCode: 401, headers: { ...HEADERS, 'WWW-Authenticate': 'Bearer' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };

  let payload;
  try { payload = JSON.parse(event.body || 'null'); } catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify(fail(null, -32700, 'Parse error')) }; }

  if (Array.isArray(payload)) {
    const out = (await Promise.all(payload.map(handle))).filter(Boolean);
    return out.length ? { statusCode: 200, headers: HEADERS, body: JSON.stringify(out) } : { statusCode: 202, headers: HEADERS, body: '' };
  }
  const res = await handle(payload);
  return res ? { statusCode: 200, headers: HEADERS, body: JSON.stringify(res) } : { statusCode: 202, headers: HEADERS, body: '' };
};
