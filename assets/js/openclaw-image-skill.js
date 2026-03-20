// openclaw-image-skill.js
// OpenClaw skill: receive image from Telegram → save to Supabase via upload-image.js
// Usage: tell Monty "save this image to [client-name] folder" when sending an image

const NUI_FUNCTION_URL = 'https://newurbaninfluence.com/.netlify/functions/upload-image';
const ADMIN_TOKEN = process.env.NUI_ADMIN_TOKEN || '';

/**
 * Main handler — called by OpenClaw when user sends an image
 * @param {string} imageUrl - Telegram image URL
 * @param {string} folder - destination folder prefix (e.g. "aj-photography", "nui-site")
 */
async function saveImageToSupabase(imageUrl, folder = 'general') {
  try {
    // 1. Download image from Telegram
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) throw new Error(`Failed to download image: ${imgResp.status}`);
    
    const buffer = await imgResp.arrayBuffer();
    const contentType = imgResp.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    // 2. Upload to Supabase via NUI function
    const uploadResp = await fetch(NUI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN
      },
      body: JSON.stringify({
        dataUrl,
        prefix: `openclaw/${folder}`
      })
    });

    const result = await uploadResp.json();
    
    if (!result.success) throw new Error(result.error || 'Upload failed');

    return {
      success: true,
      url: result.url,
      path: result.path,
      size: result.size,
      message: `✅ Image saved!\n📁 Folder: ${folder}\n🔗 URL: ${result.url}`
    };

  } catch (err) {
    return {
      success: false,
      message: `❌ Failed to save image: ${err.message}`
    };
  }
}

// Parse folder from user message
function parseFolderFromMessage(message = '') {
  const msg = message.toLowerCase();
  
  // Client folder patterns
  const patterns = [
    { match: /aj.photo/i, folder: 'aj-photography' },
    { match: /larry|castleberry/i, folder: 'larry-castleberry' },
    { match: /nui|new urban/i, folder: 'nui-site' },
    { match: /brewer/i, folder: 'brewer-transport' },
    { match: /drug.test/i, folder: 'drug-testing' },
    { match: /save to (.+)/i, folder: null }, // dynamic
  ];

  for (const p of patterns) {
    if (p.match.test(msg)) {
      if (p.folder) return p.folder;
      // Extract dynamic folder name
      const match = msg.match(/save to ([a-z0-9-]+)/i);
      if (match) return match[1].toLowerCase().replace(/\s+/g, '-');
    }
  }

  return 'general'; // default
}

module.exports = { saveImageToSupabase, parseFolderFromMessage };
