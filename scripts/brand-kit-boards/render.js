// Brand Identity Kit Board renderer — pixel-perfect, no AI.
// Usage: node scripts/brand-kit-boards/render.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(__dirname, '..', '..', 'assets', 'img', 'brand-kits');
const SRC = 'https://jcgvkyizoimwbolhfpta.supabase.co/storage/v1/object/public/nui-images';

const BOARDS = [
  {
    id: 'good-cakes-and-bakes', name: 'Good Cakes and Bakes',
    logo: `${SRC}/brand-kits/src/gcb-logo.png`, logoW: 620,
    bg: '#FFF7F9', ink: '#2B2323', panel: '#2B2323', panelInk: '#FFF7F9',
    accent: '#DCA0B4',
    palette: [['#DCA0B4','Bakery Pink'],['#501428','Deep Berry'],['#2B2323','Ink'],['#FFF7F9','Cream']],
    headingFont: 'Playfair Display', bodyFont: 'Lato',
    slogan: 'Baked with Love, Served with Soul',
    tagline: 'Brand Identity + Web',
    rationale: 'A neighborhood bakery competing with chains has to feel like home, not a franchise. The system leads with bakery pink against near-black ink \u2014 sweetness with backbone \u2014 so the storefront, the box, and the feed all read as one brand. Serif warmth for heritage, clean sans for menus that stay legible at arm\u2019s length.',
    results: [['+340%','Revenue'],['+520%','Traffic'],['3x','Online Orders']]
  },
  {
    id: 'jos-gallery', name: 'Jos Gallery',
    logo: `${SRC}/asset/1771139093407_zif4r13u.webp`, logoW: 900,
    bg: '#0E0E0E', ink: '#FFFFFF', panel: '#FFFFFF', panelInk: '#0E0E0E',
    accent: '#F01428',
    palette: [['#F01428','Signal Red'],['#F08C14','Amber'],['#00C8F0','Cyan'],['#0E0E0E','Gallery Black'],['#FFFFFF','White']],
    headingFont: 'Bebas Neue', bodyFont: 'Open Sans',
    slogan: 'Your Art. Your Story. Your Canvas.',
    tagline: 'Social Media + Video',
    rationale: 'Fine art, custom framing, and thirty years of trust deserve more than a beige gallery brand. The mark frames primary-color shards inside a hard white keyline \u2014 literally art through a frame \u2014 so every post, label, and banner carries the collection\u2019s energy while the black field keeps the work itself the loudest thing in the room.',
    results: [['2K \u2192 50K','Followers'],['+680%','Traffic'],['+450%','Engagement']]
  },
  {
    id: 'deep-drama-design', name: 'Deep Drama Design',
    logo: `${SRC}/brand-kits/src/dd-logo.png`, logoW: 520,
    bg: '#1A1A1A', ink: '#FFFFFF', panel: '#003C64', panelInk: '#FFFFFF',
    accent: '#00A0F0',
    palette: [['#003C64','Stage Blue'],['#C05A2E','Set Orange'],['#00A0F0','Spot Cyan'],['#1A1A1A','House Black'],['#FFFFFF','White']],
    headingFont: 'Poppins', bodyFont: 'Inter',
    slogan: 'We Build and Design',
    tagline: 'Sets, Events + Commercial Spaces',
    rationale: 'An interior and event design firm sells transformation, so the identity runs on stage lighting logic: complementary blue and orange \u2014 the two colors every set designer reaches for \u2014 locked inside a broadcast-style badge. It reads equally at home on a call sheet, a venue wall, or a hard hat.',
    results: [['Sets','Broadcast + Stage'],['Events','Corporate + Private'],['Spaces','Commercial Build-outs']]
  }
];

function html(b) {
  const chips = b.palette.map(([hex, nm]) => `
    <div class="chip"><div class="sw" style="background:${hex}; ${hex.toUpperCase()==='#FFFFFF'||hex.toUpperCase()===b.bg.toUpperCase()?'box-shadow:inset 0 0 0 2px rgba(128,128,128,.35);':''}"></div>
      <div class="hx">${hex.toUpperCase()}</div><div class="nm">${nm}</div></div>`).join('');
  const stats = b.results.map(([v, l]) => `<div class="stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(b.headingFont)}:wght@400;700;800&family=${encodeURIComponent(b.bodyFont)}:wght@400;600&family=Syne:wght@700;800&family=Teko:wght@600&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:3840px; height:2160px; background:${b.bg}; color:${b.ink}; display:flex; overflow:hidden; }
    .left { width:62%; padding:140px 120px; display:flex; flex-direction:column; justify-content:space-between; }
    .kicker { font-family:Teko; font-size:44px; letter-spacing:10px; text-transform:uppercase; opacity:.65; }
    .logoWrap { flex:1; display:flex; align-items:center; justify-content:center; padding:60px 0; }
    .logoWrap img { width:${b.logoW * 2.4}px; max-width:88%; max-height:820px; object-fit:contain;
      filter:drop-shadow(0 24px 60px rgba(0,0,0,.25)); }
    .slogan { font-family:'${b.headingFont}'; font-size:76px; text-align:center; margin-bottom:90px; }
    .chips { display:flex; gap:44px; justify-content:center; }
    .chip { text-align:center; }
    .sw { width:230px; height:230px; border-radius:18px; box-shadow:0 18px 44px rgba(0,0,0,.28); }
    .hx { font-family:'${b.bodyFont}'; font-weight:600; font-size:34px; margin-top:26px; letter-spacing:2px; }
    .nm { font-family:'${b.bodyFont}'; font-size:28px; opacity:.6; margin-top:6px; }
    .type { display:flex; align-items:baseline; gap:60px; justify-content:center; margin-top:80px; }
    .type .big { font-family:'${b.headingFont}'; font-size:150px; }
    .type .desc { font-family:'${b.bodyFont}'; font-size:34px; opacity:.7; max-width:820px; line-height:1.5; }
    .right { width:38%; background:${b.panel}; color:${b.panelInk}; padding:150px 110px; display:flex; flex-direction:column; }
    .rk { font-family:Teko; font-size:42px; letter-spacing:9px; text-transform:uppercase; color:${b.accent}; }
    .rt { font-family:Syne; font-weight:800; font-size:96px; line-height:1.05; margin:34px 0 60px; }
    .rr { font-family:'${b.bodyFont}'; font-size:42px; line-height:1.65; opacity:.92; }
    .stats { margin-top:auto; display:flex; flex-direction:column; gap:52px; }
    .stat .v { font-family:Syne; font-weight:800; font-size:88px; color:${b.accent}; }
    .stat .l { font-family:Teko; font-size:40px; letter-spacing:6px; text-transform:uppercase; opacity:.75; margin-top:4px; }
    .foot { font-family:Teko; font-size:34px; letter-spacing:8px; text-transform:uppercase; opacity:.5; margin-top:70px; }
  </style></head><body>
    <div class="left">
      <div class="kicker">${b.tagline} \u2014 Brand Identity System</div>
      <div class="logoWrap"><img src="${b.logo}"></div>
      <div class="slogan">\u201C${b.slogan}\u201D</div>
      <div class="chips">${chips}</div>
      <div class="type"><div class="big">Aa</div>
        <div class="desc"><b>${b.headingFont}</b> for headlines \u2014 <b>${b.bodyFont}</b> for everything the customer reads. One voice, every touchpoint.</div></div>
    </div>
    <div class="right">
      <div class="rk">The System</div>
      <div class="rt">${b.name}</div>
      <div class="rr">${b.rationale}</div>
      <div class="stats">${stats}</div>
      <div class="foot">Built by New Urban Influence \u2022 Detroit</div>
    </div>
  </body></html>`;
}

(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const b of BOARDS) {
    const tmp = path.join(__dirname, `_${b.id}.html`);
    fs.writeFileSync(tmp, html(b));
    const out = path.join(OUT_DIR, `${b.id}-kit.png`);
    execFileSync(CHROME_PATH, [
      '--headless=new', '--no-sandbox', '--hide-scrollbars',
      '--window-size=3840,2160', '--force-device-scale-factor=1',
      '--virtual-time-budget=10000', '--run-all-compositor-stages-before-draw',
      `--screenshot=${out}`, 'file://' + tmp
    ], { stdio: 'pipe' });
    fs.unlinkSync(tmp);
    console.log('RENDERED', out);
  }
  console.log('DONE');
})();
