/* ═══════════════════════════════════════════════════════════
   design-tools.js — Font Browser, Font Pairing, Color Combos
   For NUI Moodboard Editor
   ═══════════════════════════════════════════════════════════ */

// ─── STATE ───
var _dtLocalFonts = [];
var _dtGoogleFonts = [];
var _dtGoogleLoaded = {};
var _dtSelectedHeading = 'Syne';
var _dtSelectedBody = 'Montserrat';

// ─── LOCAL FONT BROWSER ───
// Uses Local Font Access API (Chrome 103+) with fallback
async function loadLocalFonts() {
  if (_dtLocalFonts.length) return _dtLocalFonts;
  try {
    if ('queryLocalFonts' in window) {
      var fonts = await window.queryLocalFonts();
      var seen = new Set();
      fonts.forEach(function(f) {
        var fam = f.family;
        if (!seen.has(fam)) { seen.add(fam); _dtLocalFonts.push({ name: fam, postscript: f.postscriptName || fam }); }
      });
      _dtLocalFonts.sort(function(a,b) { return a.name.localeCompare(b.name); });
      return _dtLocalFonts;
    }
  } catch(e) { console.warn('Local Font Access denied or unavailable:', e); }
  // Fallback: use common system fonts + any loaded @font-face
  _dtLocalFonts = [
    'Arial','Helvetica','Verdana','Georgia','Times New Roman','Courier New',
    'Trebuchet MS','Impact','Comic Sans MS','Palatino','Garamond','Bookman',
    'Avant Garde','Futura','Century Gothic','Gill Sans','Lucida Grande',
    'Optima','Copperplate','Didot','Baskerville','Rockwell','Zapfino',
    'American Typewriter','Avenir','Avenir Next','Menlo','Monaco','SF Pro Display'
  ].map(function(n) { return { name: n, postscript: n }; });
  return _dtLocalFonts;
}

// ─── GOOGLE FONTS BROWSER ───
var GOOGLE_FONTS_TOP = [
  'Roboto','Open Sans','Lato','Montserrat','Oswald','Raleway','Poppins',
  'Merriweather','Nunito','Playfair Display','Inter','Work Sans','Syne',
  'DM Sans','DM Serif Display','Space Grotesk','Outfit','Lexend',
  'Cormorant Garamond','Libre Baskerville','Crimson Text','Source Serif Pro',
  'Abril Fatface','Bebas Neue','Archivo','Barlow','Fjalla One','Josefin Sans',
  'Karla','Lora','Mulish','Noto Sans','PT Sans','Quicksand','Rubik',
  'Titillium Web','Ubuntu','Bitter','Cabin','Catamaran','Dosis',
  'Exo 2','Fira Sans','Heebo','Inconsolata','Jost','Kanit',
  'Manrope','Noto Serif','Overpass','Prompt','Red Hat Display','Righteous',
  'Satisfy','Shadows Into Light','Signika','Space Mono','Spectral',
  'Vollkorn','Yeseva One','Zilla Slab','Climate Crisis','Bricolage Grotesque',
  'Fraunces','Instrument Serif','Instrument Sans','Geist','Sora','Unbounded'
];

function loadGoogleFont(name) {
  if (_dtGoogleLoaded[name]) return;
  _dtGoogleLoaded[name] = true;
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name) + ':wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function loadGoogleFontBatch(names) {
  var toLoad = names.filter(function(n) { return !_dtGoogleLoaded[n]; });
  if (!toLoad.length) return;
  toLoad.forEach(function(n) { _dtGoogleLoaded[n] = true; });
  var families = toLoad.map(function(n) { return 'family=' + encodeURIComponent(n) + ':wght@300;400;500;600;700'; }).join('&');
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?' + families + '&display=swap';
  document.head.appendChild(link);
}

// ─── FONT PANEL RENDERER ───
function renderFontPanel(containerId) {
  var c = document.getElementById(containerId);
  if (!c) return;
  // Load first batch of Google fonts for preview
  loadGoogleFontBatch(GOOGLE_FONTS_TOP.slice(0, 20));

  c.innerHTML = '<div class="dt-font-panel">' +
    '<div class="dt-tabs">' +
      '<button class="dt-tab dt-tab-active" onclick="dtSwitchFontTab(\'google\',this)">Google Fonts</button>' +
      '<button class="dt-tab" onclick="dtSwitchFontTab(\'local\',this)">My Fonts</button>' +
    '</div>' +
    '<input type="text" class="ml-finput dt-font-search" placeholder="Search fonts..." oninput="dtFilterFonts(this.value)" style="margin:8px 0;">' +
    '<div id="dtFontGrid" class="dt-font-grid"></div>' +
  '</div>';

  // Default to Google tab
  dtRenderGoogleFonts('');
}

var _dtFontTab = 'google';
function dtSwitchFontTab(tab, btn) {
  _dtFontTab = tab;
  document.querySelectorAll('.dt-tab').forEach(function(t) { t.classList.remove('dt-tab-active'); });
  if (btn) btn.classList.add('dt-tab-active');
  var search = document.querySelector('.dt-font-search');
  dtFilterFonts(search ? search.value : '');
}

function dtFilterFonts(q) {
  if (_dtFontTab === 'google') dtRenderGoogleFonts(q);
  else dtRenderLocalFonts(q);
}

function dtRenderGoogleFonts(q) {
  var grid = document.getElementById('dtFontGrid');
  if (!grid) return;
  var filtered = GOOGLE_FONTS_TOP.filter(function(f) {
    return !q || f.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  });
  if (!filtered.length) { grid.innerHTML = '<div class="dt-empty">No matching fonts</div>'; return; }
  // Load any that need loading
  loadGoogleFontBatch(filtered.slice(0, 30));

  grid.innerHTML = filtered.slice(0, 60).map(function(name) {
    return '<div class="dt-font-card" onclick="dtSelectFont(\'' + name.replace(/'/g,"\\'") + '\',\'google\')">' +
      '<div class="dt-font-preview" style="font-family:\'' + name + '\',sans-serif;">Aa</div>' +
      '<div class="dt-font-name">' + name + '</div>' +
    '</div>';
  }).join('');
}

async function dtRenderLocalFonts(q) {
  var grid = document.getElementById('dtFontGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="dt-empty">Loading system fonts...</div>';

  var fonts = await loadLocalFonts();
  var filtered = fonts.filter(function(f) {
    return !q || f.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  });
  if (!filtered.length) { grid.innerHTML = '<div class="dt-empty">No matching fonts</div>'; return; }

  grid.innerHTML = filtered.slice(0, 80).map(function(f) {
    return '<div class="dt-font-card" onclick="dtSelectFont(\'' + f.name.replace(/'/g,"\\'") + '\',\'local\')">' +
      '<div class="dt-font-preview" style="font-family:\'' + f.name + '\',sans-serif;">Aa</div>' +
      '<div class="dt-font-name">' + f.name + '</div>' +
    '</div>';
  }).join('');
}

function dtSelectFont(name, source) {
  // Add as text card to moodboard with this font
  if (source === 'google') loadGoogleFont(name);
  var state = window._mbEditorState;
  if (!state || !state.id) return;
  var mb = (typeof proofs !== 'undefined') ? proofs.find(function(p) { return p.id == state.id; }) : null;
  if (!mb) return;

  mb.collageItems.push({
    type: 'note', title: name,
    body: 'The quick brown fox jumps over the lazy dog',
    fontFamily: name, fontSize: 28,
    x: 80 + Math.random()*60, y: 80 + Math.random()*60,
    width: 320, height: 140, rotation: 0,
    color: '#ffffff', bgColor: 'rgba(255,255,255,0.05)',
    zIndex: mb.collageItems.length + 1
  });
  mb.updatedAt = new Date().toISOString();
  if (typeof saveProofs === 'function') saveProofs();
  if (typeof openMoodboardEditor === 'function') openMoodboardEditor(mb.id);
  if (typeof showNotification === 'function') showNotification(name + ' added!', 'success');
}

// ═══════════════════════════════════════════════════════
// FONT COMBINATION CREATOR
// ═══════════════════════════════════════════════════════
var FONT_PAIRINGS = [
  { heading:'Playfair Display', body:'Raleway', vibe:'Elegant & Modern' },
  { heading:'Syne', body:'Montserrat', vibe:'Bold & Clean' },
  { heading:'DM Serif Display', body:'DM Sans', vibe:'Editorial' },
  { heading:'Bebas Neue', body:'Open Sans', vibe:'Impact & Readable' },
  { heading:'Abril Fatface', body:'Poppins', vibe:'Luxury Statement' },
  { heading:'Oswald', body:'Lato', vibe:'Strong & Friendly' },
  { heading:'Cormorant Garamond', body:'Fira Sans', vibe:'Classic Refinement' },
  { heading:'Space Grotesk', body:'Inter', vibe:'Tech & Minimal' },
  { heading:'Instrument Serif', body:'Instrument Sans', vibe:'Contemporary' },
  { heading:'Fraunces', body:'Outfit', vibe:'Warm & Approachable' },
  { heading:'Righteous', body:'Quicksand', vibe:'Fun & Rounded' },
  { heading:'Josefin Sans', body:'Libre Baskerville', vibe:'Art Deco + Serif' },
  { heading:'Climate Crisis', body:'Work Sans', vibe:'Bold Activism' },
  { heading:'Unbounded', body:'Lexend', vibe:'Future Forward' },
  { heading:'Red Hat Display', body:'Red Hat Text', vibe:'Cohesive System' },
  { heading:'Vollkorn', body:'Cabin', vibe:'Warm Literary' },
  { heading:'Bricolage Grotesque', body:'Spectral', vibe:'Editorial Contrast' },
  { heading:'Archivo', body:'Karla', vibe:'No-Nonsense' },
];

function renderFontPairingPanel(containerId) {
  var c = document.getElementById(containerId);
  if (!c) return;
  // Preload all pairing fonts
  var allFonts = [];
  FONT_PAIRINGS.forEach(function(p) { allFonts.push(p.heading, p.body); });
  loadGoogleFontBatch(allFonts);

  c.innerHTML = '<div class="dt-pair-panel">' +
    '<div class="dt-pair-preview" id="dtPairPreview">' +
      '<div id="dtPairH" style="font-family:\'Syne\',sans-serif;font-size:28px;font-weight:700;margin-bottom:6px;">Heading Font</div>' +
      '<div id="dtPairB" style="font-family:\'Montserrat\',sans-serif;font-size:14px;line-height:1.5;opacity:0.7;">Body text preview shows how this combination reads in longer passages of content.</div>' +
      '<div id="dtPairLabel" style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:8px;">Syne + Montserrat — Bold & Clean</div>' +
    '</div>' +
    '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px;">Curated Pairings</div>' +
    '<div class="dt-pair-list" id="dtPairList"></div>' +
    '<button class="ml-fbtn" style="margin-top:8px;width:100%;" onclick="dtAddPairingToBoard()">+ Add This Pairing to Board</button>' +
  '</div>';

  dtRenderPairingList();
  dtUpdatePairPreview(FONT_PAIRINGS[1]); // Syne + Montserrat default
}

function dtRenderPairingList() {
  var list = document.getElementById('dtPairList');
  if (!list) return;
  list.innerHTML = FONT_PAIRINGS.map(function(p, i) {
    return '<div class="dt-pair-item' + (i===1?' dt-pair-active':'') + '" data-idx="' + i + '" onclick="dtPickPairing(' + i + ',this)">' +
      '<div style="font-family:\'' + p.heading + '\',sans-serif;font-weight:700;font-size:16px;">' + p.heading + '</div>' +
      '<div style="font-family:\'' + p.body + '\',sans-serif;font-size:11px;opacity:0.5;">' + p.body + ' — ' + p.vibe + '</div>' +
    '</div>';
  }).join('');
}

function dtPickPairing(idx, el) {
  document.querySelectorAll('.dt-pair-item').forEach(function(i) { i.classList.remove('dt-pair-active'); });
  if (el) el.classList.add('dt-pair-active');
  dtUpdatePairPreview(FONT_PAIRINGS[idx]);
}

function dtUpdatePairPreview(pair) {
  _dtSelectedHeading = pair.heading;
  _dtSelectedBody = pair.body;
  loadGoogleFont(pair.heading);
  loadGoogleFont(pair.body);
  var h = document.getElementById('dtPairH');
  var b = document.getElementById('dtPairB');
  var l = document.getElementById('dtPairLabel');
  if (h) { h.style.fontFamily = "'" + pair.heading + "',sans-serif"; h.textContent = 'Heading Font'; }
  if (b) { b.style.fontFamily = "'" + pair.body + "',sans-serif"; }
  if (l) l.textContent = pair.heading + ' + ' + pair.body + ' — ' + (pair.vibe || 'Custom');
}

function dtAddPairingToBoard() {
  var state = window._mbEditorState;
  if (!state || !state.id) return;
  var mb = (typeof proofs !== 'undefined') ? proofs.find(function(p) { return p.id == state.id; }) : null;
  if (!mb) return;
  loadGoogleFont(_dtSelectedHeading);
  loadGoogleFont(_dtSelectedBody);

  // Add heading card
  mb.collageItems.push({
    type:'note', title: _dtSelectedHeading,
    body: 'Your Brand Name Here', fontFamily: _dtSelectedHeading,
    fontSize: 36, x: 60, y: 60, width: 400, height: 80,
    rotation: 0, color:'#fff', bgColor:'rgba(255,255,255,0.04)',
    zIndex: mb.collageItems.length + 1
  });
  // Add body card
  mb.collageItems.push({
    type:'note', title: _dtSelectedBody,
    body: 'The quick brown fox jumps over the lazy dog. Every great brand tells a story worth sharing.',
    fontFamily: _dtSelectedBody, fontSize: 16,
    x: 60, y: 160, width: 400, height: 100,
    rotation: 0, color:'#ccc', bgColor:'rgba(255,255,255,0.04)',
    zIndex: mb.collageItems.length + 2
  });
  mb.updatedAt = new Date().toISOString();
  if (typeof saveProofs === 'function') saveProofs();
  if (typeof openMoodboardEditor === 'function') openMoodboardEditor(mb.id);
  if (typeof showNotification === 'function') showNotification(_dtSelectedHeading + ' + ' + _dtSelectedBody + ' added!', 'success');
}


// ═══════════════════════════════════════════════════════
// COLOR SWATCH COMBO GENERATOR
// ═══════════════════════════════════════════════════════

// Color harmony algorithms
function dtHexToHSL(hex) {
  hex = hex.replace('#','');
  var r=parseInt(hex.substr(0,2),16)/255, g=parseInt(hex.substr(2,2),16)/255, b=parseInt(hex.substr(4,2),16)/255;
  var max=Math.max(r,g,b), min=Math.min(r,g,b), h=0, s=0, l=(max+min)/2;
  if (max !== min) {
    var d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    if (max===r) h=((g-b)/d+(g<b?6:0))/6;
    else if (max===g) h=((b-r)/d+2)/6;
    else h=((r-g)/d+4)/6;
  }
  return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
}

function dtHSLToHex(h,s,l) {
  h/=360; s/=100; l/=100;
  var r,g,b;
  if(s===0){r=g=b=l;}else{
    function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
    var q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
  }
  return '#'+[r,g,b].map(function(x){var hex=Math.round(x*255).toString(16);return hex.length===1?'0'+hex:hex;}).join('');
}

function dtGenerateHarmony(baseHex, type) {
  var hsl = dtHexToHSL(baseHex);
  var h=hsl.h, s=hsl.s, l=hsl.l;
  var colors = [baseHex];
  switch(type) {
    case 'complementary':
      colors.push(dtHSLToHex((h+180)%360, s, l));
      colors.push(dtHSLToHex(h, Math.max(s-20,10), Math.min(l+25,90)));
      colors.push(dtHSLToHex((h+180)%360, Math.max(s-15,10), Math.min(l+20,90)));
      colors.push(dtHSLToHex(h, 8, 12)); // dark neutral
      break;
    case 'analogous':
      colors.push(dtHSLToHex((h+30)%360, s, l));
      colors.push(dtHSLToHex((h-30+360)%360, s, l));
      colors.push(dtHSLToHex((h+15)%360, Math.max(s-25,10), Math.min(l+30,90)));
      colors.push(dtHSLToHex(h, 6, 10));
      break;
    case 'triadic':
      colors.push(dtHSLToHex((h+120)%360, s, l));
      colors.push(dtHSLToHex((h+240)%360, s, l));
      colors.push(dtHSLToHex(h, 10, 92));
      colors.push(dtHSLToHex(h, 8, 10));
      break;
    case 'split':
      colors.push(dtHSLToHex((h+150)%360, s, l));
      colors.push(dtHSLToHex((h+210)%360, s, l));
      colors.push(dtHSLToHex(h, Math.max(s-30,5), Math.min(l+35,92)));
      colors.push(dtHSLToHex(h, 6, 8));
      break;
    case 'monochromatic':
      colors.push(dtHSLToHex(h, s, Math.min(l+20,90)));
      colors.push(dtHSLToHex(h, s, Math.max(l-20,10)));
      colors.push(dtHSLToHex(h, Math.max(s-30,5), Math.min(l+40,95)));
      colors.push(dtHSLToHex(h, Math.max(s-10,5), Math.max(l-35,5)));
      break;
    case 'tetradic':
      colors.push(dtHSLToHex((h+90)%360, s, l));
      colors.push(dtHSLToHex((h+180)%360, s, l));
      colors.push(dtHSLToHex((h+270)%360, s, l));
      colors.push(dtHSLToHex(h, 6, 10));
      break;
  }
  return colors;
}

var _dtBaseColor = '#2a9d8f';
var _dtHarmonyType = 'complementary';
var _dtCurrentPalette = [];

// Curated brand palettes
var DT_BRAND_PALETTES = [
  { name:'Ocean Luxe', colors:['#0d1b2a','#1b263b','#415a77','#778da9','#e0e1dd'] },
  { name:'Urban Gold', colors:['#0a0a0a','#1a1a1a','#c9a227','#e8d5a3','#f5f0e8'] },
  { name:'Forest Night', colors:['#0b1a0f','#1a3c2a','#2d6a4f','#52b788','#d8f3dc'] },
  { name:'Coral Slate', colors:['#2b2d42','#8d99ae','#ef233c','#edf2f4','#d90429'] },
  { name:'Royal Purple', colors:['#10002b','#240046','#7b2cbf','#c77dff','#e0aaff'] },
  { name:'Desert Warm', colors:['#1a1108','#6b4226','#d4a373','#faedcd','#fefae0'] },
  { name:'Midnight Tech', colors:['#03071e','#370617','#6a040f','#d00000','#e85d04'] },
  { name:'Cool Mint', colors:['#0b132b','#1c2541','#3a506b','#5bc0be','#6fffe9'] },
  { name:'Blush Studio', colors:['#1a0a0e','#4a1942','#9e4770','#e8a0bf','#fce4ec'] },
  { name:'Clean Mono', colors:['#000000','#333333','#666666','#cccccc','#ffffff'] },
];

function renderColorComboPanel(containerId) {
  var c = document.getElementById(containerId);
  if (!c) return;
  _dtCurrentPalette = dtGenerateHarmony(_dtBaseColor, _dtHarmonyType);

  c.innerHTML = '<div class="dt-color-panel">' +
    '<!-- Base Color Picker -->' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
      '<input type="color" id="dtBaseColorPick" value="' + _dtBaseColor + '" ' +
        'oninput="dtUpdateBaseColor(this.value)" style="width:36px;height:36px;border:none;background:none;cursor:pointer;padding:0;">' +
      '<div style="flex:1;">' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;">Base Color</div>' +
        '<input type="text" id="dtBaseColorHex" value="' + _dtBaseColor + '" class="ml-finput" ' +
          'style="margin:4px 0 0;font-family:monospace;font-size:12px;" onchange="dtUpdateBaseColor(this.value)">' +
      '</div>' +
    '</div>' +
    '<!-- Harmony Type Selector -->' +
    '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Harmony</div>' +
    '<div class="dt-harmony-btns" id="dtHarmonyBtns">' +
      '<button class="dt-harm-btn dt-harm-active" onclick="dtSetHarmony(\'complementary\',this)">Complementary</button>' +
      '<button class="dt-harm-btn" onclick="dtSetHarmony(\'analogous\',this)">Analogous</button>' +
      '<button class="dt-harm-btn" onclick="dtSetHarmony(\'triadic\',this)">Triadic</button>' +
      '<button class="dt-harm-btn" onclick="dtSetHarmony(\'split\',this)">Split</button>' +
      '<button class="dt-harm-btn" onclick="dtSetHarmony(\'monochromatic\',this)">Mono</button>' +
      '<button class="dt-harm-btn" onclick="dtSetHarmony(\'tetradic\',this)">Tetradic</button>' +
    '</div>' +
    '<!-- Generated Palette -->' +
    '<div id="dtPalettePreview" class="dt-palette-preview"></div>' +
    '<button class="ml-fbtn" style="width:100%;margin-top:6px;" onclick="dtAddPaletteToBoard()">+ Add Palette to Board</button>' +
    '<button class="ml-fbtn" style="width:100%;margin-top:4px;opacity:0.6;" onclick="dtRandomBaseColor()">🎲 Random Base</button>' +
    '<!-- Curated Palettes -->' +
    '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin:12px 0 6px;">Curated Palettes</div>' +
    '<div id="dtCuratedList" class="dt-curated-list"></div>' +
  '</div>';

  dtRenderPalettePreview();
  dtRenderCuratedPalettes();
}

function dtRenderPalettePreview() {
  var div = document.getElementById('dtPalettePreview');
  if (!div) return;
  div.innerHTML = '<div style="display:flex;border-radius:10px;overflow:hidden;height:60px;margin-top:8px;">' +
    _dtCurrentPalette.map(function(c, i) {
      var isLight = dtIsLightHex(c);
      return '<div style="flex:1;background:' + c + ';display:flex;align-items:center;justify-content:center;cursor:pointer;transition:flex .2s;" ' +
        'onclick="navigator.clipboard.writeText(\'' + c + '\');if(typeof showNotification===\'function\')showNotification(\'Copied ' + c + '\',\'success\')" ' +
        'onmouseover="this.style.flex=\'1.5\'" onmouseout="this.style.flex=\'1\'" title="Click to copy ' + c + '">' +
        '<span style="font-size:9px;font-family:monospace;color:' + (isLight ? '#000' : '#fff') + ';opacity:0.7;">' + c + '</span>' +
      '</div>';
    }).join('') +
  '</div>';
}

function dtIsLightHex(hex) {
  hex = hex.replace('#','');
  var r=parseInt(hex.substr(0,2),16), g=parseInt(hex.substr(2,2),16), b=parseInt(hex.substr(4,2),16);
  return (r*299+g*587+b*114)/1000 > 128;
}

function dtUpdateBaseColor(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  _dtBaseColor = hex;
  var pick = document.getElementById('dtBaseColorPick');
  var txt = document.getElementById('dtBaseColorHex');
  if (pick) pick.value = hex;
  if (txt) txt.value = hex;
  _dtCurrentPalette = dtGenerateHarmony(hex, _dtHarmonyType);
  dtRenderPalettePreview();
}

function dtSetHarmony(type, btn) {
  _dtHarmonyType = type;
  document.querySelectorAll('.dt-harm-btn').forEach(function(b) { b.classList.remove('dt-harm-active'); });
  if (btn) btn.classList.add('dt-harm-active');
  _dtCurrentPalette = dtGenerateHarmony(_dtBaseColor, _dtHarmonyType);
  dtRenderPalettePreview();
}

function dtRandomBaseColor() {
  var h = Math.floor(Math.random()*360);
  var s = 50 + Math.floor(Math.random()*40);
  var l = 35 + Math.floor(Math.random()*30);
  dtUpdateBaseColor(dtHSLToHex(h, s, l));
}

function dtRenderCuratedPalettes() {
  var list = document.getElementById('dtCuratedList');
  if (!list) return;
  list.innerHTML = DT_BRAND_PALETTES.map(function(p, i) {
    return '<div class="dt-curated-item" onclick="dtUseCuratedPalette(' + i + ')">' +
      '<div style="display:flex;border-radius:6px;overflow:hidden;height:28px;flex:1;">' +
        p.colors.map(function(c) { return '<div style="flex:1;background:' + c + ';"></div>'; }).join('') +
      '</div>' +
      '<div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:3px;">' + p.name + '</div>' +
    '</div>';
  }).join('');
}

function dtUseCuratedPalette(idx) {
  var p = DT_BRAND_PALETTES[idx];
  if (!p) return;
  _dtCurrentPalette = p.colors.slice();
  _dtBaseColor = p.colors[Math.floor(p.colors.length/2)];
  var pick = document.getElementById('dtBaseColorPick');
  var txt = document.getElementById('dtBaseColorHex');
  if (pick) pick.value = _dtBaseColor;
  if (txt) txt.value = _dtBaseColor;
  dtRenderPalettePreview();
}

function dtAddPaletteToBoard() {
  var state = window._mbEditorState;
  if (!state || !state.id) return;
  var mb = (typeof proofs !== 'undefined') ? proofs.find(function(p) { return p.id == state.id; }) : null;
  if (!mb) return;

  _dtCurrentPalette.forEach(function(color, i) {
    mb.collageItems.push({
      type: 'color', color: color,
      x: 60 + i * 90, y: 60,
      width: 80, height: 80, rotation: 0,
      zIndex: mb.collageItems.length + 1
    });
  });
  mb.updatedAt = new Date().toISOString();
  if (typeof saveProofs === 'function') saveProofs();
  if (typeof openMoodboardEditor === 'function') openMoodboardEditor(mb.id);
  if (typeof showNotification === 'function') showNotification('Palette added (' + _dtCurrentPalette.length + ' swatches)', 'success');
}

// ═══════════════════════════════════════════════════════
// EAGLE APP INTEGRATION
// Eagle runs a local API at localhost:41595
// ═══════════════════════════════════════════════════════
var _dtEagleConnected = false;
var _dtEagleFolders = [];

async function dtCheckEagle() {
  try {
    var resp = await fetch('http://localhost:41595/api/application/info');
    if (resp.ok) { _dtEagleConnected = true; return true; }
  } catch(e) {}
  _dtEagleConnected = false;
  return false;
}

async function dtGetEagleFolders() {
  try {
    var resp = await fetch('http://localhost:41595/api/folder/list');
    if (resp.ok) {
      var data = await resp.json();
      _dtEagleFolders = data.data || [];
      return _dtEagleFolders;
    }
  } catch(e) {}
  return [];
}

async function dtSearchEagle(query) {
  try {
    var url = 'http://localhost:41595/api/item/list?limit=30';
    if (query) url += '&keyword=' + encodeURIComponent(query);
    var resp = await fetch(url);
    if (resp.ok) {
      var data = await resp.json();
      return data.data || [];
    }
  } catch(e) { console.warn('Eagle search error:', e); }
  return [];
}

async function renderEaglePanel(containerId) {
  var c = document.getElementById(containerId);
  if (!c) return;

  var connected = await dtCheckEagle();
  if (!connected) {
    c.innerHTML = '<div class="dt-eagle-panel">' +
      '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.4);">' +
        '<div style="font-size:24px;margin-bottom:8px;">🦅</div>' +
        '<div style="font-size:13px;margin-bottom:4px;">Eagle not running</div>' +
        '<div style="font-size:11px;opacity:0.6;">Open Eagle app to browse your inspiration library</div>' +
        '<button class="ml-fbtn" style="margin-top:12px;" onclick="renderEaglePanel(\'' + containerId + '\')">Retry Connection</button>' +
      '</div></div>';
    return;
  }

  c.innerHTML = '<div class="dt-eagle-panel">' +
    '<div style="display:flex;gap:6px;margin-bottom:8px;">' +
      '<input type="text" id="dtEagleQuery" class="ml-finput" style="margin:0;flex:1;" placeholder="Search Eagle library..." ' +
        'onkeydown="if(event.key===\'Enter\') dtSearchEagleImages()">' +
      '<button onclick="dtSearchEagleImages()" class="ml-fbtn" style="width:auto;padding:8px 14px;margin:0;">Search</button>' +
    '</div>' +
    '<div id="dtEagleResults" class="dt-font-grid" style="max-height:350px;overflow-y:auto;">' +
      '<div style="grid-column:1/-1;text-align:center;padding:20px;color:rgba(255,255,255,0.3);">Loading recent items...</div>' +
    '</div>' +
  '</div>';

  // Load recent items
  var items = await dtSearchEagle('');
  dtRenderEagleResults(items);
}

async function dtSearchEagleImages() {
  var q = (document.getElementById('dtEagleQuery')?.value || '').trim();
  var resultsDiv = document.getElementById('dtEagleResults');
  if (resultsDiv) resultsDiv.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:rgba(255,255,255,0.4);">Searching...</div>';
  var items = await dtSearchEagle(q);
  dtRenderEagleResults(items);
}

function dtRenderEagleResults(items) {
  var div = document.getElementById('dtEagleResults');
  if (!div) return;
  var imageItems = items.filter(function(it) {
    return ['png','jpg','jpeg','gif','webp','svg'].indexOf((it.ext||'').toLowerCase()) !== -1;
  });
  if (!imageItems.length) {
    div.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:rgba(255,255,255,0.4);">No images found</div>';
    return;
  }
  div.innerHTML = imageItems.slice(0, 40).map(function(it) {
    // Eagle serves thumbnails from local API
    var thumb = 'http://localhost:41595/api/item/thumbnail?id=' + it.id;
    var tags = (it.tags||[]).join(', ');
    return '<div class="dt-font-card" style="aspect-ratio:1;overflow:hidden;" ' +
      'onclick="dtAddEagleImage(\'' + it.id + '\',\'' + (it.ext||'jpg') + '\',' + (it.width||400) + ',' + (it.height||300) + ')" ' +
      'title="' + (it.name||'') + (tags ? '\nTags: '+tags : '') + '">' +
      '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy" alt="' + (it.name||'Eagle image') + '">' +
    '</div>';
  }).join('');
}

function dtAddEagleImage(itemId, ext, w, h) {
  var state = window._mbEditorState;
  if (!state || !state.id) return;
  var mb = (typeof proofs !== 'undefined') ? proofs.find(function(p) { return p.id == state.id; }) : null;
  if (!mb) return;
  // Eagle serves full images from local API
  var src = 'http://localhost:41595/api/item/thumbnail?id=' + itemId;
  var cardW = 280, cardH = Math.round(cardW * (h/w));
  mb.collageItems.push({
    type:'image', src: src,
    caption: 'From Eagle Library',
    x: 60 + Math.random()*100, y: 60 + Math.random()*100,
    width: cardW, height: cardH, rotation: 0,
    zIndex: mb.collageItems.length + 1
  });
  mb.updatedAt = new Date().toISOString();
  if (typeof saveProofs === 'function') saveProofs();
  if (typeof openMoodboardEditor === 'function') openMoodboardEditor(mb.id);
  if (typeof showNotification === 'function') showNotification('Eagle image added!', 'success');
}
