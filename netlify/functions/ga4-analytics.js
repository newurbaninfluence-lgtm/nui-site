// GA4 Data API — returns real site analytics for the NUI admin dashboard
// GET /.netlify/functions/ga4-analytics?range=7d|30d|90d
// Env vars required:
//   GA4_PROPERTY_ID       — numeric GA4 property ID (e.g. 123456789)
//   GA4_SERVICE_ACCOUNT   — full service account JSON as a string

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// ── JWT helper — sign a Google service account JWT without any npm deps ──────
async function getGoogleAccessToken(serviceAccountJson) {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const header = b64({ alg: 'RS256', typ: 'JWT' });
  const payload = b64(claim);
  const signingInput = `${header}.${payload}`;

  // Import the RSA private key
  const pemBody = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const keyDer = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(sig).toString('base64url')}`;

  // Exchange JWT for access token
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const data = await resp.json();
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data));
  return data.access_token;
}

// ── Range helper ──────────────────────────────────────────────────────────────
function getDateRange(range) {
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const end = fmt(today);
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, 'all': 365 };
  const days = daysMap[range] || 30;
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  return { startDate: fmt(start), endDate: end };
}

// ── GA4 runReport helper ──────────────────────────────────────────────────────
async function runReport(propertyId, token, body) {
  const resp = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GA4 API error ${resp.status}: ${err}`);
  }
  return resp.json();
}


// ── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
  const SA_JSON     = process.env.GA4_SERVICE_ACCOUNT;

  if (!PROPERTY_ID || !SA_JSON) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ configured: false, error: 'GA4 not configured — add GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT to Netlify env vars' })
    };
  }

  try {
    const range  = (event.queryStringParameters || {}).range || '30d';
    const { startDate, endDate } = getDateRange(range);
    const token  = await getGoogleAccessToken(SA_JSON);

    // ── Run all reports in parallel ──────────────────────────────────────────
    const [overviewData, pagesData, sourcesData, dailyData] = await Promise.all([

      // 1. Overview — totals
      runReport(PROPERTY_ID, token, {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'sessions' }
        ]
      }),

      // 2. Top pages
      runReport(PROPERTY_ID, token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'bounceRate' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8
      }),

      // 3. Traffic sources
      runReport(PROPERTY_ID, token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 6
      }),

      // 4. Daily visitors for chart (last 7 days always)
      runReport(PROPERTY_ID, token, {
        dateRanges: [{ startDate: getDateRange('7d').startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      })
    ]);

    // ── Parse overview ───────────────────────────────────────────────────────
    const ov = overviewData.rows?.[0]?.metricValues || [];
    const totalUsers    = parseInt(ov[0]?.value || 0);
    const totalPageViews= parseInt(ov[1]?.value || 0);
    const avgSession    = parseFloat(ov[2]?.value || 0);
    const bounceRate    = parseFloat(ov[3]?.value || 0);
    const totalSessions = parseInt(ov[4]?.value || 0);

    const avgMins = Math.floor(avgSession / 60);
    const avgSecs = Math.floor(avgSession % 60);
    const avgSessionFmt = `${avgMins}:${String(avgSecs).padStart(2, '0')}`;

    // ── Parse top pages ──────────────────────────────────────────────────────
    const topPages = (pagesData.rows || []).map(r => ({
      page: r.dimensionValues[0].value,
      views: parseInt(r.metricValues[0].value),
      bounce: Math.round(parseFloat(r.metricValues[1].value) * 100)
    }));

    // ── Parse traffic sources ────────────────────────────────────────────────
    const sourceColors = {
      'Organic Search': '#10b981', 'Direct': '#3b82f6', 'Referral': '#f59e0b',
      'Organic Social': '#8b5cf6', 'Email': '#ec4899', 'Paid Search': '#ef4444',
      '(other)': '#6b7280'
    };
    const totalSrc = (sourcesData.rows || []).reduce((s, r) => s + parseInt(r.metricValues[0].value), 0) || 1;
    const trafficSources = (sourcesData.rows || []).map(r => ({
      source: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value),
      percent: Math.round((parseInt(r.metricValues[0].value) / totalSrc) * 100),
      color: sourceColors[r.dimensionValues[0].value] || '#6b7280'
    }));

    // ── Parse daily chart ────────────────────────────────────────────────────
    const dailyMax = Math.max(...(dailyData.rows || []).map(r => parseInt(r.metricValues[0].value)), 1);
    const dailyChart = (dailyData.rows || []).map(r => ({
      date: r.dimensionValues[0].value,
      users: parseInt(r.metricValues[0].value),
      height: Math.round((parseInt(r.metricValues[0].value) / dailyMax) * 100)
    }));

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configured: true,
        range,
        startDate,
        endDate,
        overview: {
          totalUsers,
          totalPageViews,
          totalSessions,
          avgSession: avgSessionFmt,
          bounceRate: Math.round(bounceRate * 100)
        },
        topPages,
        trafficSources,
        dailyChart,
        fetchedAt: new Date().toISOString()
      })
    };

  } catch (err) {
    console.error('GA4 analytics error:', err);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ configured: false, error: err.message })
    };
  }
};
