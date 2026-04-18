// netlify/functions/meta-pixel-analytics.js
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};
var PIXEL_ID = process.env.FB_PIXEL_ID || "711956342472188";
var FB_API = "https://graph.facebook.com/v19.0";
function getUnixRange(range) {
  const now = Math.floor(Date.now() / 1e3);
  const daysMap = { "7d": 7, "30d": 30, "90d": 90, "all": 365 };
  const days = daysMap[range] || 30;
  return { start: now - days * 86400, end: now };
}
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  const token = process.env.FB_ACCESS_TOKEN;
  if (!token) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ configured: false, error: "FB_ACCESS_TOKEN not set in Netlify env vars" })
    };
  }
  try {
    const range = (event.queryStringParameters || {}).range || "30d";
    const { start, end } = getUnixRange(range);
    const [statsResp, infoResp] = await Promise.all([
      fetch(`${FB_API}/${PIXEL_ID}/stats?aggregation=event_count&start_time=${start}&end_time=${end}&access_token=${token}`),
      fetch(`${FB_API}/${PIXEL_ID}?fields=name,creation_time,last_fired_time&access_token=${token}`)
    ]);
    if (!statsResp.ok) {
      const err = await statsResp.json();
      throw new Error(err.error?.message || `FB API error ${statsResp.status}`);
    }
    const statsData = await statsResp.json();
    const infoData = infoResp.ok ? await infoResp.json() : {};
    const eventTotals = {};
    for (const row of statsData.data || []) {
      const type = row.type || "Unknown";
      eventTotals[type] = (eventTotals[type] || 0) + (parseInt(row.event_count) || 0);
    }
    const totalFires = Object.values(eventTotals).reduce((s, v) => s + v, 0);
    const pageViews = eventTotals["PageView"] || 0;
    const leads = eventTotals["Lead"] || 0;
    const purchases = eventTotals["Purchase"] || 0;
    const viewContent = eventTotals["ViewContent"] || 0;
    const dailyMap = {};
    for (const row of statsData.data || []) {
      if (!row.timestamp) continue;
      const day = new Date(row.timestamp * 1e3).toISOString().split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + (parseInt(row.event_count) || 0);
    }
    const dailyArr = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));
    const dailyMax = Math.max(...dailyArr.map(([, v]) => v), 1);
    const dailyChart = dailyArr.slice(-7).map(([date, count]) => ({
      date,
      count,
      height: Math.round(count / dailyMax * 100)
    }));
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        configured: true,
        pixelId: PIXEL_ID,
        pixelName: infoData.name || "NUI Pixel",
        lastFired: infoData.last_fired_time || null,
        range,
        totalFires,
        pageViews,
        leads,
        purchases,
        viewContent,
        eventTotals,
        dailyChart,
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      })
    };
  } catch (err) {
    console.error("Meta Pixel analytics error:", err);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ configured: false, error: err.message })
    };
  }
};
//# sourceMappingURL=meta-pixel-analytics.js.map
