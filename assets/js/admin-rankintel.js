// ============================================================
// RANK INTEL — Geo-Grid Tracking Panel
// New Urban Influence Admin
//
// Self-service local rank tracking:
// - 7×7 grid scan (49 points) around a business
// - Color-coded heat map of Google Maps rankings
// - Competitor comparison at each grid point
// - Monthly trend history via Supabase
// ============================================================

function loadAdminRankIntelPanel() {
    const panel = document.getElementById('adminRankintelPanel');
    if (!panel) return;

    // Load saved scans from Supabase
    const savedScans = [];

    panel.innerHTML = `
    <div style="padding: 32px; max-width: 1200px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
            <div>
                <h2 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                    <span style="color: var(--red);">Rank Intel</span> — Geo-Grid Tracking
                </h2>
                <p style="color: rgba(255,255,255,0.5); margin: 6px 0 0; font-size: 14px;">
                    See exactly where your clients rank on Google Maps, block by block.
                </p>
            </div>
            <button onclick="_riNewScan()" class="btn-admin primary" style="padding: 10px 20px; font-weight: 700;">
                + New Scan
            </button>
        </div>

        <!-- Scan History -->
        <div id="riScanHistory" style="margin-bottom: 32px;"></div>

        <!-- New Scan Form (hidden by default) -->
        <div id="riScanForm" style="display: none;">
            <div class="glass-panel" style="padding: 28px; margin-bottom: 24px;">
                <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 20px;">Configure Scan</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <!-- Client -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Client</label>
                        <select id="riClient" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                            <option value="">Select client...</option>
                        </select>
                    </div>
                    <!-- Business Name (as it appears on Google) -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Business Name (exact Google listing)</label>
                        <input type="text" id="riBizName" placeholder="e.g. Good Cakes and Bakes" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; box-sizing: border-box;">
                    </div>
                    <!-- Keyword -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Search Keyword</label>
                        <input type="text" id="riKeyword" placeholder="e.g. bakery near me" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; box-sizing: border-box;">
                    </div>
                    <!-- Center Address -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Center Address</label>
                        <input type="text" id="riAddress" placeholder="e.g. 19363 Livernois Ave, Detroit, MI" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; box-sizing: border-box;">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <!-- Grid Size -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Grid Size</label>
                        <select id="riGridSize" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                            <option value="3">3×3 (9 points — Quick)</option>
                            <option value="5">5×5 (25 points — Standard)</option>
                            <option value="7" selected>7×7 (49 points — Full)</option>
                        </select>
                    </div>
                    <!-- Radius -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Radius (miles)</label>
                        <select id="riRadius" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                            <option value="2">2 miles</option>
                            <option value="5" selected>5 miles</option>
                            <option value="8">8 miles</option>
                            <option value="10">10 miles</option>
                            <option value="15">15 miles</option>
                        </select>
                    </div>
                    <!-- Max Results per Point -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Check Top N Results</label>
                        <select id="riMaxResults" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit;">
                            <option value="3">Top 3</option>
                            <option value="5">Top 5</option>
                            <option value="10">Top 10</option>
                            <option value="20" selected>Top 20</option>
                        </select>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button onclick="_riRunScan()" id="riRunBtn" class="btn-admin primary" style="padding: 12px 28px; font-weight: 700; font-size: 15px;">
                        🔍 Run Scan
                    </button>
                    <button onclick="_riCancelScan()" class="btn-admin" style="padding: 12px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <!-- Scan Progress -->
        <div id="riProgress" style="display: none;">
            <div class="glass-panel" style="padding: 28px; text-align: center;">
                <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">Scanning Grid Points...</div>
                <div style="font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 16px;" id="riProgressText">0 / 49 points scanned</div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                    <div id="riProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--red), #ff4444); border-radius: 3px; transition: width 0.3s;"></div>
                </div>
            </div>
        </div>

        <!-- Results Grid -->
        <div id="riResults" style="display: none;"></div>
    </div>`;

    // Populate client dropdown
    _riPopulateClients();
    // Load scan history
    _riLoadHistory();
}


// ============================================================
// HELPERS
// ============================================================

function _riPopulateClients() {
    const sel = document.getElementById('riClient');
    if (!sel || typeof clients === 'undefined') return;
    clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name || c.businessName || 'Client #' + c.id;
        sel.appendChild(opt);
    });
}

function _riNewScan() {
    document.getElementById('riScanForm').style.display = 'block';
    document.getElementById('riResults').style.display = 'none';
}

function _riCancelScan() {
    document.getElementById('riScanForm').style.display = 'none';
}

// ============================================================
// GEO-GRID ENGINE
// ============================================================

// Generate grid of lat/lng points around a center
function _riGenerateGrid(centerLat, centerLng, radiusMiles, gridSize) {
    const points = [];
    const radiusKm = radiusMiles * 1.60934;
    const latDegPerKm = 1 / 110.574;
    const lngDegPerKm = 1 / (111.320 * Math.cos(centerLat * Math.PI / 180));
    const step = (radiusKm * 2) / (gridSize - 1);
    const startLat = centerLat + (radiusKm * latDegPerKm);
    const startLng = centerLng - (radiusKm * lngDegPerKm);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const lat = startLat - (row * step * latDegPerKm);
            const lng = startLng + (col * step * lngDegPerKm);
            points.push({
                row, col,
                lat: parseFloat(lat.toFixed(6)),
                lng: parseFloat(lng.toFixed(6)),
                rank: null,
                competitors: []
            });
        }
    }
    return points;
}

// Geocode an address to lat/lng using Netlify function
async function _riGeocode(address) {
    try {
        const res = await fetch('/.netlify/functions/geo-grid-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'geocode', address })
        });
        const data = await res.json();
        if (data.lat && data.lng) return data;
        throw new Error(data.error || 'Geocoding failed');
    } catch (e) {
        alert('Could not geocode address: ' + e.message);
        return null;
    }
}


// ============================================================
// RUN SCAN
// ============================================================

async function _riRunScan() {
    const bizName = document.getElementById('riBizName').value.trim();
    const keyword = document.getElementById('riKeyword').value.trim();
    const address = document.getElementById('riAddress').value.trim();
    const gridSize = parseInt(document.getElementById('riGridSize').value);
    const radius = parseInt(document.getElementById('riRadius').value);
    const maxResults = parseInt(document.getElementById('riMaxResults').value);
    const clientId = document.getElementById('riClient').value;

    if (!bizName || !keyword || !address) {
        alert('Please fill in Business Name, Keyword, and Address.');
        return;
    }

    // Geocode address
    document.getElementById('riRunBtn').disabled = true;
    document.getElementById('riRunBtn').textContent = 'Geocoding...';
    const geo = await _riGeocode(address);
    if (!geo) {
        document.getElementById('riRunBtn').disabled = false;
        document.getElementById('riRunBtn').textContent = '🔍 Run Scan';
        return;
    }

    // Generate grid
    const points = _riGenerateGrid(geo.lat, geo.lng, radius, gridSize);
    const total = points.length;

    // Show progress
    document.getElementById('riScanForm').style.display = 'none';
    document.getElementById('riProgress').style.display = 'block';
    document.getElementById('riResults').style.display = 'none';

    // Scan each point (batched — 3 at a time to stay under rate limits)
    let completed = 0;
    const batchSize = 3;

    for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        const promises = batch.map(pt =>
            fetch('/.netlify/functions/geo-grid-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'search',
                    lat: pt.lat,
                    lng: pt.lng,
                    keyword: keyword,
                    bizName: bizName,
                    maxResults: maxResults
                })
            })
            .then(r => r.json())
            .then(data => {
                pt.rank = data.rank;        // null = not found, 1-20 = position
                pt.competitors = data.top || [];
                completed++;
                document.getElementById('riProgressText').textContent = `${completed} / ${total} points scanned`;
                document.getElementById('riProgressBar').style.width = ((completed / total) * 100) + '%';
            })
            .catch(() => {
                pt.rank = null;
                pt.competitors = [];
                completed++;
            })
        );
        await Promise.all(promises);
        // Small delay between batches to respect rate limits
        if (i + batchSize < points.length) {
            await new Promise(r => setTimeout(r, 400));
        }
    }

    // Hide progress, show results
    document.getElementById('riProgress').style.display = 'none';
    _riRenderResults(points, gridSize, { bizName, keyword, address, radius, maxResults, clientId, centerLat: geo.lat, centerLng: geo.lng });
}


// ============================================================
// RENDER HEAT MAP GRID
// ============================================================

function _riRankColor(rank) {
    if (rank === null || rank === undefined) return { bg: 'rgba(220,38,38,0.25)', border: 'rgba(220,38,38,0.5)', text: '#ff6b6b', label: '—' };
    if (rank <= 3)  return { bg: 'rgba(34,197,94,0.25)', border: 'rgba(34,197,94,0.5)', text: '#4ade80', label: '#' + rank };
    if (rank <= 5)  return { bg: 'rgba(132,204,22,0.2)', border: 'rgba(132,204,22,0.4)', text: '#a3e635', label: '#' + rank };
    if (rank <= 10) return { bg: 'rgba(234,179,8,0.2)', border: 'rgba(234,179,8,0.4)', text: '#facc15', label: '#' + rank };
    if (rank <= 20) return { bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.4)', text: '#fb923c', label: '#' + rank };
    return { bg: 'rgba(220,38,38,0.25)', border: 'rgba(220,38,38,0.5)', text: '#ff6b6b', label: '20+' };
}

function _riRenderResults(points, gridSize, meta) {
    const container = document.getElementById('riResults');
    container.style.display = 'block';

    // Stats
    const ranked = points.filter(p => p.rank !== null);
    const top3 = points.filter(p => p.rank && p.rank <= 3).length;
    const top10 = points.filter(p => p.rank && p.rank <= 10).length;
    const notFound = points.filter(p => p.rank === null).length;
    const avgRank = ranked.length > 0 ? (ranked.reduce((s, p) => s + p.rank, 0) / ranked.length).toFixed(1) : '—';
    const coverage = ((ranked.length / points.length) * 100).toFixed(0);

    // Build grid HTML
    const cellSize = Math.min(72, Math.floor(600 / gridSize));
    let gridHTML = '';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const pt = points.find(p => p.row === row && p.col === col);
            const c = _riRankColor(pt?.rank);
            const isCenter = row === Math.floor(gridSize / 2) && col === Math.floor(gridSize / 2);
            const centerRing = isCenter ? 'box-shadow: 0 0 0 3px var(--red), 0 0 12px rgba(220,38,38,0.4);' : '';
            const competitorTip = pt?.competitors?.length
                ? pt.competitors.slice(0, 5).map((c, i) => `${i + 1}. ${c}`).join('\\n')
                : 'No results';

            gridHTML += `<div
                onclick="_riShowPointDetail(${pt?.lat}, ${pt?.lng}, ${JSON.stringify(pt?.competitors || []).replace(/"/g, '&quot;')}, ${pt?.rank})"
                title="${competitorTip}"
                style="
                    width: ${cellSize}px; height: ${cellSize}px;
                    display: flex; align-items: center; justify-content: center;
                    background: ${c.bg}; border: 1px solid ${c.border};
                    border-radius: 8px; cursor: pointer;
                    font-size: ${cellSize > 50 ? '16px' : '13px'}; font-weight: 800; color: ${c.text};
                    transition: all 0.2s; position: relative;
                    ${centerRing}
                "
                onmouseover="this.style.transform='scale(1.15)';this.style.zIndex='10';"
                onmouseout="this.style.transform='scale(1)';this.style.zIndex='1';"
            >${isCenter ? '📍' : c.label}</div>`;
        }
    }

    container.innerHTML = `
    <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
                <h3 style="font-size: 20px; font-weight: 800; margin: 0;">Scan Results</h3>
                <p style="color: rgba(255,255,255,0.4); margin: 4px 0 0; font-size: 13px;">
                    "${meta.keyword}" • ${meta.address} • ${meta.radius}mi radius • ${gridSize}×${gridSize} grid
                </p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="_riSaveScan(${JSON.stringify(meta).replace(/"/g, '&quot;')}, ${JSON.stringify(points).replace(/"/g, '&quot;')})" class="btn-admin primary" style="padding: 8px 16px; font-size: 13px;">💾 Save Scan</button>
                <button onclick="_riNewScan()" class="btn-admin" style="padding: 8px 16px; font-size: 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">+ New Scan</button>
            </div>
        </div>

        <!-- Stats Row -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px;">
            <div class="glass-panel" style="padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: ${parseFloat(avgRank) <= 5 ? '#4ade80' : parseFloat(avgRank) <= 10 ? '#facc15' : '#ff6b6b'};">${avgRank}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Avg Rank</div>
            </div>
            <div class="glass-panel" style="padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #4ade80;">${top3}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Top 3</div>
            </div>
            <div class="glass-panel" style="padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #facc15;">${top10}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Top 10</div>
            </div>
            <div class="glass-panel" style="padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #ff6b6b;">${notFound}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Not Found</div>
            </div>
            <div class="glass-panel" style="padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: ${parseInt(coverage) >= 70 ? '#4ade80' : parseInt(coverage) >= 40 ? '#facc15' : '#ff6b6b'};">${coverage}%</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Coverage</div>
            </div>
        </div>

        <!-- Heat Map Grid -->
        <div class="glass-panel" style="padding: 28px;">
            <div style="display: flex; align-items: flex-start; gap: 32px;">
                <div>
                    <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">RANK HEAT MAP</div>
                    <div style="display: grid; grid-template-columns: repeat(${gridSize}, ${cellSize}px); gap: 4px;">
                        ${gridHTML}
                    </div>
                </div>
                <!-- Legend -->
                <div style="min-width: 160px;">
                    <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">LEGEND</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(34,197,94,0.25); border: 1px solid rgba(34,197,94,0.5);"></div>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.7);">#1 – #3</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(132,204,22,0.2); border: 1px solid rgba(132,204,22,0.4);"></div>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.7);">#4 – #5</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(234,179,8,0.2); border: 1px solid rgba(234,179,8,0.4);"></div>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.7);">#6 – #10</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(249,115,22,0.2); border: 1px solid rgba(249,115,22,0.4);"></div>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.7);">#11 – #20</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(220,38,38,0.25); border: 1px solid rgba(220,38,38,0.5);"></div>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.7);">Not Found</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.7);">Business Location</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Point Detail Modal -->
    <div id="riPointDetail" style="display: none;"></div>`;
}


// ============================================================
// POINT DETAIL POPUP
// ============================================================

function _riShowPointDetail(lat, lng, competitors, rank) {
    const detail = document.getElementById('riPointDetail');
    if (!detail) return;
    const c = _riRankColor(rank);

    detail.style.display = 'block';
    detail.innerHTML = `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="if(event.target===this)document.getElementById('riPointDetail').style.display='none'">
        <div class="glass-panel" style="padding: 28px; width: 420px; max-height: 70vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; font-size: 16px; font-weight: 700;">Grid Point Details</h4>
                <button onclick="document.getElementById('riPointDetail').style.display='none'" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">✕</button>
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 16px;">
                📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 14px; background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 10px;">
                <div style="font-size: 32px; font-weight: 900; color: ${c.text};">${c.label}</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.6);">
                    ${rank ? 'Ranking position at this location' : 'Business not found in results at this location'}
                </div>
            </div>
            <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Top Results at This Point</div>
            ${competitors.length > 0 ? competitors.map((name, i) => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); ${i === (rank - 1) ? 'background: rgba(217,4,41,0.08); border-radius: 8px; border: 1px solid rgba(217,4,41,0.2);' : ''}">
                    <span style="font-size: 12px; font-weight: 800; color: ${i < 3 ? '#4ade80' : i < 10 ? '#facc15' : 'rgba(255,255,255,0.3)'}; min-width: 24px;">#${i + 1}</span>
                    <span style="font-size: 13px; color: ${i === (rank - 1) ? '#fff' : 'rgba(255,255,255,0.6)'}; font-weight: ${i === (rank - 1) ? '700' : '400'};">${name}</span>
                </div>
            `).join('') : '<div style="color: rgba(255,255,255,0.3); font-size: 13px; padding: 12px;">No results returned for this point.</div>'}
        </div>
    </div>`;
}

// ============================================================
// SAVE & LOAD SCAN HISTORY (Supabase)
// ============================================================

async function _riSaveScan(meta, points) {
    if (typeof db === 'undefined' || !db) {
        alert('Supabase not loaded. Scan data shown but not saved.');
        return;
    }

    try {
        const { data, error } = await db
            .from('geo_grid_scans')
            .insert({
                client_id: meta.clientId || null,
                biz_name: meta.bizName,
                keyword: meta.keyword,
                address: meta.address,
                center_lat: meta.centerLat,
                center_lng: meta.centerLng,
                radius_miles: meta.radius,
                grid_size: parseInt(document.getElementById('riGridSize')?.value || 7),
                max_results: meta.maxResults,
                points: points,
                avg_rank: (() => {
                    const ranked = points.filter(p => p.rank !== null);
                    return ranked.length > 0 ? parseFloat((ranked.reduce((s, p) => s + p.rank, 0) / ranked.length).toFixed(1)) : null;
                })(),
                coverage_pct: parseFloat(((points.filter(p => p.rank !== null).length / points.length) * 100).toFixed(0)),
                top3_count: points.filter(p => p.rank && p.rank <= 3).length,
                scanned_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;
        alert('✅ Scan saved!');
        _riLoadHistory();
    } catch (e) {
        console.error('Save scan error:', e);
        alert('Failed to save scan: ' + e.message);
    }
}


async function _riLoadHistory() {
    const histEl = document.getElementById('riScanHistory');
    if (!histEl) return;

    if (typeof db === 'undefined' || !db) {
        histEl.innerHTML = '<div class="glass-panel" style="padding: 20px; text-align: center; color: rgba(255,255,255,0.4); font-size: 14px;">Connect Supabase to save & view scan history.</div>';
        return;
    }

    try {
        const { data: scans, error } = await db
            .from('geo_grid_scans')
            .select('*')
            .order('scanned_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!scans || scans.length === 0) {
            histEl.innerHTML = `
            <div class="glass-panel" style="padding: 28px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 12px;">🗺️</div>
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No Scans Yet</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.4);">Run your first geo-grid scan to start tracking rankings.</div>
            </div>`;
            return;
        }

        histEl.innerHTML = `
        <div class="glass-panel" style="padding: 0; overflow: hidden;">
            <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 14px; font-weight: 700;">Recent Scans</span>
                <span style="font-size: 12px; color: rgba(255,255,255,0.3);">${scans.length} scan${scans.length !== 1 ? 's' : ''}</span>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                            <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
                            <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Business</th>
                            <th style="padding: 10px 16px; text-align: left; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Keyword</th>
                            <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Grid</th>
                            <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Avg Rank</th>
                            <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Top 3</th>
                            <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Coverage</th>
                            <th style="padding: 10px 16px; text-align: center; color: rgba(255,255,255,0.4); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scans.map(s => {
                            const d = new Date(s.scanned_at);
                            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const avgColor = s.avg_rank <= 5 ? '#4ade80' : s.avg_rank <= 10 ? '#facc15' : '#ff6b6b';
                            const covColor = s.coverage_pct >= 70 ? '#4ade80' : s.coverage_pct >= 40 ? '#facc15' : '#ff6b6b';
                            return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='none'">
                                <td style="padding: 12px 16px; color: rgba(255,255,255,0.6);">${dateStr}</td>
                                <td style="padding: 12px 16px; font-weight: 600;">${s.biz_name}</td>
                                <td style="padding: 12px 16px; color: rgba(255,255,255,0.6);">${s.keyword}</td>
                                <td style="padding: 12px 16px; text-align: center; color: rgba(255,255,255,0.5);">${s.grid_size}×${s.grid_size}</td>
                                <td style="padding: 12px 16px; text-align: center; font-weight: 800; color: ${avgColor};">${s.avg_rank || '—'}</td>
                                <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: #4ade80;">${s.top3_count}</td>
                                <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: ${covColor};">${s.coverage_pct}%</td>
                                <td style="padding: 12px 16px; text-align: center;">
                                    <button onclick="_riViewSavedScan(${s.id})" style="padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 12px; cursor: pointer;">View</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    } catch (e) {
        console.error('Load history error:', e);
        histEl.innerHTML = '<div class="glass-panel" style="padding: 20px; text-align: center; color: rgba(255,255,255,0.4);">Could not load scan history.</div>';
    }
}

async function _riViewSavedScan(scanId) {
    try {
        const { data, error } = await db
            .from('geo_grid_scans')
            .select('*')
            .eq('id', scanId)
            .single();

        if (error) throw error;

        _riRenderResults(data.points, data.grid_size, {
            bizName: data.biz_name,
            keyword: data.keyword,
            address: data.address,
            radius: data.radius_miles,
            maxResults: data.max_results,
            clientId: data.client_id,
            centerLat: data.center_lat,
            centerLng: data.center_lng
        });
    } catch (e) {
        alert('Failed to load scan: ' + e.message);
    }
}
