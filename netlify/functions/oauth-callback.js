// oauth-callback.js — Netlify Function
// Handles OAuth callbacks for Instagram, Facebook, LinkedIn
// GET ?platform=instagram&code=... → exchanges code for token, stores in Supabase
// Env vars: INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET,
//           LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const { platform, code, error: oauthError } = params;
    const SITE_URL = process.env.URL || process.env.SITE_URL || 'https://soft-rolypoly-668214.netlify.app';
    const redirectUri = `${SITE_URL}/.netlify/functions/oauth-callback?platform=${platform}`;

    if (oauthError) {
      return redirectToApp(SITE_URL, platform, null, oauthError);
    }

    if (!platform || !code) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing platform or code' }) };
    }

    let accessToken = null;
    let profileData = null;

    switch (platform) {
      case 'instagram': {
        const APP_ID = process.env.INSTAGRAM_APP_ID;
        const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
        if (!APP_ID || !APP_SECRET) throw new Error('Instagram OAuth not configured');

        // Exchange code for short-lived token
        const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: APP_ID,
            client_secret: APP_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code
          })
        });
        const tokenData = await tokenResp.json();
        if (tokenData.error_message) throw new Error(tokenData.error_message);

        // Exchange for long-lived token
        const longResp = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${APP_SECRET}&access_token=${tokenData.access_token}`
        );
        const longData = await longResp.json();
        accessToken = longData.access_token || tokenData.access_token;

        // Get profile
        const profileResp = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`);
        profileData = await profileResp.json();
        break;
      }

      case 'facebook': {
        const APP_ID = process.env.FACEBOOK_APP_ID;
        const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
        if (!APP_ID || !APP_SECRET) throw new Error('Facebook OAuth not configured');

        const tokenResp = await fetch(
          `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
        );
        const tokenData = await tokenResp.json();
        if (tokenData.error) throw new Error(tokenData.error.message);
        accessToken = tokenData.access_token;

        const profileResp = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        profileData = await profileResp.json();
        break;
      }

      case 'linkedin': {
        const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
        const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
        if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('LinkedIn OAuth not configured');

        const tokenResp = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
          })
        });
        const tokenData = await tokenResp.json();
        if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
        accessToken = tokenData.access_token;

        const profileResp = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        profileData = await profileResp.json();
        break;
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ error: `Unknown platform: ${platform}` }) };
    }

    // Store integration in Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && accessToken) {
      await fetch(`${SUPABASE_URL}/rest/v1/integrations`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          platform,
          access_token: accessToken,
          profile: profileData,
          status: 'connected',
          connected_at: new Date().toISOString()
        })
      }).catch(err => console.warn('Integration save failed:', err.message));
    }

    return redirectToApp(SITE_URL, platform, profileData, null);
  } catch (err) {
    console.error('oauth-callback error:', err);
    const SITE_URL = process.env.URL || process.env.SITE_URL || 'https://soft-rolypoly-668214.netlify.app';
    return redirectToApp(SITE_URL, event.queryStringParameters?.platform, null, err.message);
  }
};

function redirectToApp(siteUrl, platform, profile, error) {
  const params = new URLSearchParams();
  if (platform) params.set('platform', platform);
  if (error) params.set('error', error);
  if (profile) params.set('connected', 'true');
  if (profile?.username) params.set('username', profile.username);
  if (profile?.name) params.set('name', profile.name);

  return {
    statusCode: 302,
    headers: {
      'Location': `${siteUrl}?oauth=${platform}&${params.toString()}`
    },
    body: ''
  };
}
