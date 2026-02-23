// Netlify Function: Blog Post Management (service_role only)
// Handles upsert and delete for blog_posts table securely

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, post, postId } = body;

    if (action === 'upsert' && post) {
      const row = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        category: post.category || 'Branding',
        image: post.image || '',
        author: post.author || 'Faren Young',
        author_image: post.authorImage || post.author_image || '',
        date: post.date || '',
        read_time: post.readTime || post.read_time || '5 min read',
        content: post.content || '',
        published: post.published !== false,
        updated_at: new Date().toISOString()
      };

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?on_conflict=id`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(row)
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase upsert failed: ${res.status} ${errText}`);
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'upsert', id: post.id }) };
    }

    if (action === 'delete' && postId) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase delete failed: ${res.status} ${errText}`);
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'delete', id: postId }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action. Use "upsert" or "delete".' }) };

  } catch (err) {
    console.error('blog-manage error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
