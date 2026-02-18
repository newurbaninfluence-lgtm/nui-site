// upload-image.js — Server-side image upload to Supabase Storage
// Uses SUPABASE_SERVICE_KEY + REST API to bypass RLS policies
// No external dependencies needed (uses built-in fetch)

const BUCKET = 'nui-images';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return {
        statusCode: 500, headers,
        body: JSON.stringify({ error: 'Server misconfigured: missing Supabase credentials' })
      };
    }

    const body = JSON.parse(event.body);
    const { dataUrl, prefix } = body;

    if (!dataUrl || !prefix) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: 'Missing required fields: dataUrl, prefix' })
      };
    }

    // Parse data URL
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: 'Invalid data URL format' })
      };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_SIZE) {
      return {
        statusCode: 413, headers,
        body: JSON.stringify({ error: 'Image too large (max 10MB)' })
      };
    }

    // Determine file extension
    const extMap = {
      'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
      'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg',
      'video/mp4': 'mp4', 'video/webm': 'webm'
    };
    const ext = extMap[mimeType] || 'jpg';

    // Generate unique file path
    const timestamp = Date.now();
    const rand = Math.random().toString(36).substr(2, 8);
    const filePath = `${prefix}/${timestamp}_${rand}.${ext}`;

    // Ensure bucket exists (create if not — idempotent)
    try {
      await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({
          id: BUCKET,
          name: BUCKET,
          public: true,
          file_size_limit: MAX_SIZE
        })
      });
    } catch (be) {
      // Bucket likely exists already — ignore
    }

    // Upload to Supabase Storage via REST API
    const uploadResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': mimeType,
          'Cache-Control': '31536000',
          'x-upsert': 'true',
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: buffer
      }
    );

    if (!uploadResp.ok) {
      const errBody = await uploadResp.text();
      console.error('Supabase upload error:', uploadResp.status, errBody);
      return {
        statusCode: 500, headers,
        body: JSON.stringify({ error: 'Upload failed: ' + errBody })
      };
    }

    // Build public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        success: true,
        url: publicUrl,
        path: filePath,
        size: buffer.length,
        type: mimeType
      })
    };

  } catch (err) {
    console.error('Upload function error:', err);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: 'Server error: ' + err.message })
    };
  }
};
