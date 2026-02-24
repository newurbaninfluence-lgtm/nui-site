// save-moodboard.js — Supabase persistence for moodboards
// Replaces localStorage with real database storage
// POST: Save/update moodboard | GET: Load moodboard(s)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, PATCH, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const dbHeaders = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // GET — load moodboards
  if (event.httpMethod === 'GET') {
    const { id, clientId } = event.queryStringParameters || {};
    let url = `${SUPABASE_URL}/rest/v1/moodboards?order=updated_at.desc&limit=100`;
    if (id) url = `${SUPABASE_URL}/rest/v1/moodboards?id=eq.${id}&limit=1`;
    else if (clientId) url = `${SUPABASE_URL}/rest/v1/moodboards?client_id=eq.${clientId}&order=updated_at.desc`;

    try {
      const resp = await fetch(url, { headers: dbHeaders });
      if (!resp.ok) {
        const errText = await resp.text();
        if (errText.includes('does not exist')) {
          return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, moodboards: [] }) };
        }
        throw new Error(errText);
      }
      const data = await resp.json();
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, moodboards: data }) };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }

  // DELETE — remove moodboard
  if (event.httpMethod === 'DELETE') {
    const { id } = event.queryStringParameters || {};
    if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
    
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/moodboards?id=eq.${id}`, {
        method: 'DELETE', headers: dbHeaders
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Strip base64 images from collageItems — they should already be URLs from NuiImageStore
    // This prevents the DB record from being massive
    const cleanItems = (data.collageItems || []).map(item => {
      const clean = { ...item };
      if (clean.type === 'image' && clean.src && clean.src.startsWith('data:')) {
        // This shouldn't happen if images are uploaded properly, but safety check
        clean.src = '[pending-upload]';
        clean._needsUpload = true;
      }
      // Remove IndexedDB references — these are device-specific
      if (clean.src && clean.src.startsWith('idb://')) {
        clean.src = '[local-only]';
        clean._needsUpload = true;
      }
      delete clean.storageSrc;
      delete clean.src_stored;
      return clean;
    });

    const record = {
      id: data.id || `mb_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
      client_id: data.clientId || null,
      client_name: data.clientName || '',
      project_id: data.projectId || null,
      title: data.title || 'Untitled Moodboard',
      status: data.status || 'draft',
      collage_items: cleanItems,
      canvas_background: data.canvasBackground || '#0a0a0a',
      notes: data.notes || '',
      brief_id: data.briefId || null,
      brief_snapshot: data.briefSnapshot || null,
      brand_colors: data.brandColors || [],
      fonts: data.fonts || {},
      updated_at: new Date().toISOString()
    };

    // Check if record exists (for update vs insert)
    let isUpdate = false;
    if (data.id) {
      const checkResp = await fetch(
        `${SUPABASE_URL}/rest/v1/moodboards?id=eq.${data.id}&limit=1`,
        { headers: dbHeaders }
      );
      const existing = await checkResp.json();
      isUpdate = existing && existing.length > 0;
    }

    let url, method;
    if (isUpdate) {
      url = `${SUPABASE_URL}/rest/v1/moodboards?id=eq.${data.id}`;
      method = 'PATCH';
      delete record.id;
      delete record.created_at;
    } else {
      url = `${SUPABASE_URL}/rest/v1/moodboards`;
      method = 'POST';
      record.created_at = new Date().toISOString();
    }

    const resp = await fetch(url, {
      method,
      headers: dbHeaders,
      body: JSON.stringify(record)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      if (errText.includes('does not exist')) {
        // Auto-create table — won't work without exec_sql RPC, but provide SQL
        return {
          statusCode: 500, headers: CORS,
          body: JSON.stringify({
            error: 'Table not found. Run this SQL in Supabase:',
            sql: `CREATE TABLE moodboards (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  project_id TEXT,
  title TEXT DEFAULT 'Untitled',
  status TEXT DEFAULT 'draft',
  collage_items JSONB DEFAULT '[]',
  canvas_background TEXT DEFAULT '#0a0a0a',
  notes TEXT DEFAULT '',
  brief_id TEXT,
  brief_snapshot JSONB,
  brand_colors JSONB DEFAULT '[]',
  fonts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS client_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  service_type TEXT DEFAULT 'branding',
  responses JSONB DEFAULT '{}',
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`
          })
        };
      }
      throw new Error(errText);
    }

    const result = await resp.json();
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, moodboard: result[0] || result })
    };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
