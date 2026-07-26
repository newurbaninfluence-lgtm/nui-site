#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * NUI Magazine — Article Prerender
 *
 * Reads assets/js/magazine-data.js, renders a full static HTML file
 * per article (with baked-in meta tags, JSON-LD, and body content)
 * into magazine/articles/<slug>.html. These are what Google indexes.
 *
 * Canonical URL = https://newurbanmagazine.com/<slug>
 * Edge function maps clean URLs -> prerendered files.
 *
 * Usage: node scripts/prerender-articles.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'assets/js/magazine-data.js');
const OUT_DIR   = path.join(ROOT, 'magazine/articles');
const SITEMAP   = path.join(ROOT, 'magazine/sitemap.xml');

const CANON_HOST = 'https://newurbanmagazine.com';
const NUI_HOST   = 'https://newurbaninfluence.com';

// ── Load NUI_MAG from magazine-data.js ───────────────────
function loadMag() {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  // magazine-data.js declares `const NUI_MAG = {...}` — wrap and return it
  return new Function(code + '\nreturn NUI_MAG;')();
}

// ── Helpers ───────────────────────────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escAttr(s) { return esc(s); }

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });
}

function starsSVG(rating) {
  let h = '<div style="display:flex;align-items:center;gap:5px">';
  for (let n = 1; n <= 5; n++) {
    const filled = n <= Math.floor(rating);
    h += '<svg width="13" height="13" viewBox="0 0 14 14"><polygon points="7,1 8.8,5.2 13.5,5.5 10,8.5 11.1,13 7,10.5 2.9,13 4,8.5 0.5,5.5 5.2,5.2" fill="' + (filled ? '#ffd700' : 'none') + '" stroke="#ffd700" stroke-width="0.8"/></svg>';
  }
  h += '</div><span class="mag-stars-val">' + rating.toFixed(1) + '</span>';
  return h;
}

// Minimal markdown -> HTML. Matches parseBody() in magazine-article.js.
function parseBody(text) {
  if (!text) return '';
  return text.split('\n\n').filter(l => l.trim()).map(block => {
    block = block.trim();
    if (block.startsWith('## ')) return '<h2 class="mag-body-h2">' + esc(block.slice(3)) + '</h2>';
    if (/^\*".*"\*$/.test(block)) return '<div class="mag-pull-quote"><p>' + esc(block.replace(/^\*"|"\*$/g, '')) + '</p></div>';
    if (block.startsWith('> ')) return '<div class="mag-pull-quote"><p>' + esc(block.slice(2)) + '</p></div>';
    // Inline: **bold**, *italic*
    const inline = esc(block).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    return '<p>' + inline + '</p>';
  }).join('');
}

// ── JSON-LD Schema builders ───────────────────────────────
function buildSchemas(a) {
  const b   = a.business || {};
  const url = CANON_HOST + '/' + a.slug;
  const ogImg = a.heroImage ? (NUI_HOST + a.heroImage) : (NUI_HOST + '/.netlify/functions/og-image?slug=' + a.slug);

  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.dek,
    url,
    datePublished: a.publishedAt,
    dateModified:  a.publishedAt,
    image: ogImg,
    author:    { '@type': 'Organization', name: 'NUI Editorial', url: NUI_HOST },
    publisher: { '@type': 'Organization', name: 'NUI Magazine', url: CANON_HOST,
                 logo: { '@type': 'ImageObject', url: NUI_HOST + '/logo-nav.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };

  // LocalBusiness schema for the featured business
  const schemaBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': url + '#business',
    name: b.name,
    description: (b.category || '') + (b.city ? (' based in ' + b.city + ', ' + (b.state || '')) : ''),
    url: b.website ? ('https://' + b.website.replace(/^https?:\/\//, '')) : url,
    telephone: b.phone || undefined,
    email:     b.email || undefined,
    address: (b.city || b.state) ? {
      '@type': 'PostalAddress',
      streetAddress:   b.address || undefined,
      addressLocality: b.city    || undefined,
      addressRegion:   b.state   || undefined,
      postalCode:      b.zip     || undefined,
      addressCountry: 'US'
    } : undefined,
    aggregateRating: b.rating ? {
      '@type': 'AggregateRating',
      ratingValue: String(b.rating),
      reviewCount: String(b.reviewCount || 0),
      bestRating: '5', worstRating: '1'
    } : undefined,
    memberOf: { '@type': 'Organization', name: 'NUI Creator Network', url: NUI_HOST + '/network' }
  };

  // Person schema — triggers Knowledge Panel when someone Googles the owner name
  let schemaPerson = null;
  const ob = a.ownerBio;
  if (ob) {
    // Try to extract person's real name from ownerBio.label or body
    // e.g. "Founder & Creative Director — New Urban Influence" -> use business owner
    // Fallback: use business.name as the subject
    const personName = (a.authorName || ob.name || b.name || '').trim();
    schemaPerson = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personName,
      description: ob.headline || ob.body || a.dek,
      image: a.profileImage ? (NUI_HOST + a.profileImage) : undefined,
      jobTitle: ob.label,
      worksFor: { '@type': 'Organization', name: b.name, url: b.website ? ('https://' + b.website.replace(/^https?:\/\//, '')) : undefined },
      sameAs: (b.sameAs || []).map(s => typeof s === 'string' ? null : s.url).filter(Boolean)
    };
  }

  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Magazine', item: CANON_HOST + '/' },
      { '@type': 'ListItem', position: 2, name: a.categoryLabel, item: CANON_HOST + '/?cat=' + a.category },
      { '@type': 'ListItem', position: 3, name: a.title,         item: url }
    ]
  };

  return { schemaArticle, schemaBusiness, schemaPerson, schemaBreadcrumbs };
}

// ── Sidebar citation card ─────────────────────────────────
function buildSidebarHTML(a) {
  const b = a.business || {};
  const starsHTML = b.rating ? starsSVG(b.rating) + '<span class="mag-stars-count">' + (b.reviewCount || 0) + ' reviews</span>' : '';

  const napFields = [{ label: 'Business Name', val: b.name }];
  if (b.phone)   napFields.push({ label: 'Phone', val: b.phone });
  if (b.address && b.address !== b.city) napFields.push({ label: 'Address', val: [b.address, b.city, b.state, b.zip].filter(Boolean).join(', ') });
  if (b.email)   napFields.push({ label: 'Email', val: b.email });
  if (b.website) napFields.push({ label: 'Website', extra: '<a href="https://' + esc(b.website.replace(/^https?:\/\//, '')) + '" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px">' + esc(b.website) + '</a>' });

  const napHTML = napFields.map(r =>
    '<div><span class="mag-nap-label">' + esc(r.label) + '</span>' + (r.extra || '<div class="mag-nap-val">' + esc(r.val) + '</div>') + '</div>'
  ).join('');

  const sameAsHTML = (b.sameAs || []).map(s => '<span class="mag-same-as-chip">' + esc(typeof s === 'string' ? s : s.label) + '</span>').join('');

  const awardCard = a.award ? (
    '<div class="mag-award-card" style="display:flex">' +
      '<div class="mag-award-icon">🏆</div>' +
      '<div>' +
        '<div class="mag-award-title">' + esc(a.award) + '</div>' +
        '<div class="mag-award-desc">' + esc(a.awardLabel || '') + '</div>' +
      '</div>' +
    '</div>'
  ) : '';

  const servicesHTML = (b.services && b.services.length && !a.authorMode) ? (
    '<div class="mag-services-wrap">' +
      '<div class="mag-services-label">Services</div>' +
      '<div class="mag-services-pills">' + b.services.map(s => '<span class="mag-services-pill">' + esc(s) + '</span>').join('') + '</div>' +
    '</div>'
  ) : '';

  const badgeHTML = (
    '<div class="mag-badge-card">' +
      '<svg viewBox="0 0 200 80" width="180" style="display:block;margin:0 auto 12px">' +
        '<rect width="200" height="80" rx="3" fill="#0A0A0A"/>' +
        '<rect x="1" y="1" width="198" height="78" rx="2" fill="none" stroke="#ff0000" stroke-width="1.5"/>' +
        '<rect x="0" y="0" width="200" height="5" rx="2" fill="#ff0000"/>' +
        '<text x="100" y="26" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="#666" letter-spacing="3">AS SEEN ON</text>' +
        '<text x="100" y="48" text-anchor="middle" font-family="Impact,Arial" font-size="20" fill="#fff" letter-spacing="2">NUI</text>' +
        '<text x="100" y="58" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#ff0000" letter-spacing="5">MAGAZINE</text>' +
        '<line x1="40" y1="65" x2="160" y2="65" stroke="#222" stroke-width="1"/>' +
        '<text x="100" y="74" text-anchor="middle" font-family="Arial" font-size="7" fill="#444">newurbanmagazine.com</text>' +
      '</svg>' +
      '<div class="mag-badge-title">As Seen on NUI Magazine</div>' +
      '<div class="mag-badge-sub">Embed this badge on your site to earn a verified backlink.</div>' +
    '</div>'
  );

  return (
    '<aside class="mag-sidebar">' +
      '<div class="mag-citation-card">' +
        '<div class="mag-citation-head"><span>NUI Verified Citation</span><span class="mag-citation-check">✓ Verified</span></div>' +
        '<div class="mag-citation-body">' +
          '<div class="mag-biz-name">' + esc(b.name) + '</div>' +
          '<div class="mag-biz-cat">' + esc(b.category || '') + '</div>' +
          (starsHTML ? '<div class="mag-stars">' + starsHTML + '</div>' : '') +
          '<div class="mag-nap">' + napHTML + '</div>' +
          (sameAsHTML ? '<div class="mag-same-as-label">Also verified on</div><div class="mag-same-as-chips">' + sameAsHTML + '</div>' : '') +
          '<div class="mag-citation-id">Citation ID: <strong>' + esc(b.citationId || '') + '</strong><br>NAP verified by NUI editorial. Last confirmed ' + esc(b.verifiedDate || '') + '.</div>' +
        '</div>' +
      '</div>' +
      awardCard +
      badgeHTML +
      servicesHTML +
    '</aside>'
  );
}

// ── Owner profile feature block (Forbes 40-over-40 style) ──
function buildOwnerBlock(a) {
  if (!a.ownerBio || !a.profileImage) return '';
  const ob = a.ownerBio;
  const statsHTML = (ob.stats || []).map(s =>
    '<div class="mag-owner-stat"><div class="mag-owner-stat-val">' + esc(s.val) + '</div><div class="mag-owner-stat-label">' + esc(s.label) + '</div></div>'
  ).join('');
  const tagsHTML = (ob.tags || []).map(t => '<span class="mag-owner-bio-tag">' + esc(t) + '</span>').join('');

  return (
    '<div class="mag-owner-feature">' +
      '<div class="mag-owner-portrait">' +
        '<img src="' + esc(a.profileImage) + '" alt="' + esc(a.business.name) + '" loading="lazy">' +
        '<div class="mag-owner-verified-tag"><div class="mag-owner-verified-dot"></div> NUI Verified</div>' +
        '<div class="mag-owner-overlay">' +
          '<div class="mag-owner-overlay-label">NUI Creator Network</div>' +
          '<div class="mag-owner-overlay-name">' + esc(a.business.name) + '</div>' +
          '<div class="mag-owner-overlay-title">' + esc(ob.label || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mag-owner-bio-side">' +
        '<div class="mag-owner-bio-eyebrow">Owner Profile</div>' +
        '<div class="mag-owner-bio-headline">' + esc(ob.headline || '') + '</div>' +
        '<div class="mag-owner-bio-body">' + esc(ob.body || '') + '</div>' +
        (statsHTML ? '<div class="mag-owner-bio-stats">' + statsHTML + '</div>' : '') +
        (tagsHTML ? '<div class="mag-owner-bio-tags">' + tagsHTML + '</div>' : '') +
      '</div>' +
    '</div>'
  );
}

// ── Author profile card (circle + chips, above hero image) ──
function buildAuthorCard(a) {
  if (!a.profileImage) return '';
  const chips = (a.business.services || []).slice(0, 4).map(s => '<span class="mag-author-chip">' + esc(s) + '</span>').join('');
  return (
    '<div class="mag-author-card">' +
      '<div class="mag-author-photo-wrap">' +
        '<div class="mag-author-circle"><img src="' + esc(a.profileImage) + '" alt="' + esc(a.business.name) + '" loading="lazy"></div>' +
        '<div class="mag-author-verified-ring" title="NUI Verified">✓</div>' +
      '</div>' +
      '<div class="mag-author-info">' +
        '<div class="mag-author-name">' + esc(a.business.name) + '</div>' +
        '<div class="mag-author-title">' + esc(a.categoryLabel) + '</div>' +
        '<div class="mag-author-bio">' + esc(a.profileBio || a.dek) + '</div>' +
        '<div class="mag-author-chips">' + chips + '</div>' +
      '</div>' +
    '</div>'
  );
}

// ── Related articles grid (3 most recent, excluding self) ──
function buildRelatedHTML(mag, currentSlug) {
  const related = mag.getRecent(6).filter(r => r.slug !== currentSlug).slice(0, 3);
  const cards = related.map(r => {
    const img = r.heroImage
      ? '<img src="' + esc(r.heroImage) + '" alt="' + esc(r.title) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover">'
      : '<span>' + esc(r.categoryLabel) + '</span>';
    // Link to clean URL on branded domain
    return '<a class="mag-card" href="' + CANON_HOST + '/' + esc(r.slug) + '">' +
             '<div class="mag-card-img">' + img + '</div>' +
             '<div class="mag-card-cat">' + esc(r.categoryLabel) + '</div>' +
             '<div class="mag-card-title">' + esc(r.title) + '</div>' +
             '<div class="mag-card-meta"><span>' + esc(r.readTime) + '</span></div>' +
           '</a>';
  }).join('');
  return (
    '<div class="mag-related">' +
      '<div class="mag-section-head">More from NUI Magazine</div>' +
      '<div class="mag-grid">' + cards + '</div>' +
    '</div>'
  );
}

// ── Body assembly (body + owner block inserted after 2nd paragraph) ──
function assembleBodyHTML(a) {
  const bodyHTML = parseBody(a.body);
  const parts    = bodyHTML.split('</p>');
  const before   = parts.slice(0, 2).join('</p>') + (parts.length >= 2 ? '</p>' : '');
  const after    = parts.slice(2).join('</p>');
  const ownerBlock = buildOwnerBlock(a);
  return before + ownerBlock + after;
}

// ── MAIN: Build full HTML page for an article ─────────────
function buildArticleHTML(a, mag) {
  const b       = a.business || {};
  const canon   = CANON_HOST + '/' + a.slug;
  const ogImg   = a.heroImage ? (NUI_HOST + a.heroImage) : (NUI_HOST + '/.netlify/functions/og-image?slug=' + a.slug);
  const schemas = buildSchemas(a);

  const heroImgHTML = a.heroImage
    ? '<img src="' + esc(a.heroImage) + '" alt="' + esc(a.title) + '" style="width:100%;height:100%;object-fit:cover;object-position:center 20%">'
    : '<span>' + esc(b.name + ' · ' + (b.city || 'Detroit') + ', ' + (b.state || 'MI')) + '</span>';

  const schemaJsonLD = [schemas.schemaArticle, schemas.schemaBusiness, schemas.schemaBreadcrumbs];
  if (schemas.schemaPerson && schemas.schemaPerson.name) schemaJsonLD.push(schemas.schemaPerson);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(a.title)} | NUI Magazine</title>
<meta name="description" content="${esc(a.dek)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="keywords" content="${esc([a.categoryLabel, b.name, (a.tags || []).join(', '), b.city, b.state].filter(Boolean).join(', '))}">
<link rel="canonical" href="${esc(canon)}">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:site_name" content="NUI Magazine">
<meta property="og:url" content="${esc(canon)}">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(a.dek)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:image:secure_url" content="${esc(ogImg)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(a.title)}">
<meta property="og:locale" content="en_US">
<meta property="article:published_time" content="${esc(a.publishedAt)}T00:00:00Z">
<meta property="article:modified_time" content="${esc(a.publishedAt)}T00:00:00Z">
<meta property="article:author" content="${esc(a.author || 'NUI Editorial')}">
<meta property="article:section" content="${esc(a.categoryLabel || '')}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@newurbaninfluence">
<meta name="twitter:creator" content="@newurbaninfluence">
<meta name="twitter:title" content="${esc(a.title)}">
<meta name="twitter:description" content="${esc(a.dek)}">
<meta name="twitter:image" content="${esc(ogImg)}">
<meta name="twitter:image:alt" content="${esc(a.title)}">

<!-- JSON-LD Structured Data -->
${schemaJsonLD.map(s => '<script type="application/ld+json">' + JSON.stringify(s) + '</script>').join('\n')}

<!-- Fonts + CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/magazine.css">
<style>* { margin:0; padding:0; box-sizing:border-box; } body { background:#000; color:#fff; font-family:'Montserrat',sans-serif; }</style>
</head>
<body>

<div class="mag-topbar">NUI Magazine — Detroit's Creative Authority</div>

<header class="mag-masthead">
  <div class="mag-masthead-inner">
    <a class="mag-wordmark" href="${CANON_HOST}/">
      <span class="mag-wordmark-main">NUI</span>
      <span class="mag-wordmark-sub">Magazine</span>
    </a>
    <nav class="mag-nav">
      <a href="${CANON_HOST}/">Magazine</a>
      <a href="${NUI_HOST}/network">Directory</a>
      <a href="${CANON_HOST}/awards">Awards</a>
      <a href="${CANON_HOST}/subscribe" class="mag-nav-cta">Subscribe</a>
    </nav>
  </div>
</header>

<div class="mag-breadcrumb">
  <div class="mag-breadcrumb-inner">
    <a href="${CANON_HOST}/" style="cursor:pointer;color:inherit;text-decoration:none">Magazine</a>
    <span>›</span>
    <a href="${CANON_HOST}/?cat=${esc(a.category)}" style="cursor:pointer;color:inherit;text-decoration:none">${esc(a.categoryLabel)}</a>
    <span>›</span>
    <span class="active">${esc(b.name)}</span>
  </div>
</div>

<div class="mag-article-page">
  <div class="mag-article-header${a.premium && !a.authorMode ? ' is-premium' : ''}">
    <div class="mag-article-kicker">${esc(a.categoryLabel)} · ${esc((b.city || 'Detroit') + ', ' + (b.state || 'MI'))}</div>
    <h1 class="mag-article-title">${esc(a.title)}</h1>
    <p class="mag-article-dek">${esc(a.dek)}</p>
    <div class="mag-article-byline">
      <div class="mag-byline-dot">NUI</div>
      <div>
        <div class="mag-byline-name">${esc(a.author || 'NUI Editorial')}</div>
        <div class="mag-byline-pub">New Urban Influence Magazine</div>
      </div>
      <div class="mag-byline-sep"></div>
      <div class="mag-byline-info">${esc(fmtDate(a.publishedAt))}</div>
      <div class="mag-byline-sep"></div>
      <div class="mag-byline-info">${esc(a.readTime || '')}</div>
      <div class="mag-verified-tag"><div class="mag-verified-dot"></div> NUI Verified Business</div>
    </div>
  </div>

  ${buildAuthorCard(a)}

  <div class="mag-article-hero">${heroImgHTML}</div>

  <div class="mag-article-layout">
    <div>
      <div class="mag-body">${assembleBodyHTML(a)}</div>
      ${a.tags && a.tags.length ? '<div class="mag-body-tags">' + a.tags.map(t => '<span class="mag-body-tag">' + esc(t) + '</span>').join('') + '</div>' : ''}
      <div class="mag-share-row">
        <span class="mag-share-label">Share</span>
        <a class="mag-share-btn" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(canon)}&text=${encodeURIComponent(a.title)}" target="_blank" rel="noopener">𝕏</a>
        <a class="mag-share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canon)}" target="_blank" rel="noopener">f</a>
        <a class="mag-share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canon)}" target="_blank" rel="noopener">in</a>
      </div>
    </div>
    ${buildSidebarHTML(a)}
  </div>

  ${buildRelatedHTML(mag, a.slug)}
</div>

<footer class="mag-footer">
  <div class="mag-footer-inner">
    <div class="mag-footer-brand">
      <a class="mag-wordmark" href="${CANON_HOST}/">
        <span class="mag-wordmark-main">NUI</span>
        <span class="mag-wordmark-sub">Magazine</span>
      </a>
      <p>Detroit's Creative Network for Influencers &amp; Entrepreneurs. Features, citations, and verified profiles.</p>
    </div>
    <div class="mag-footer-col">
      <h4>Magazine</h4>
      <a href="${CANON_HOST}/">Latest Features</a>
      <a href="${CANON_HOST}/awards">Awards</a>
      <a href="${NUI_HOST}/network">Creator Directory</a>
    </div>
    <div class="mag-footer-col">
      <h4>NUI</h4>
      <a href="${NUI_HOST}/">Main Site</a>
      <a href="${NUI_HOST}/contact">Contact</a>
    </div>
  </div>
  <div class="mag-footer-bottom">
    <span>© 2026 New Urban Influence · Detroit, MI</span>
    <span>Citation ID: ${esc(b.citationId || '')}</span>
  </div>
</footer>

</body>
</html>
`;
}

// ── Sitemap generator ─────────────────────────────────────
function buildSitemapXML(articles) {
  const today = new Date().toISOString().slice(0, 10);
  const staticPages = [
    { loc: CANON_HOST + '/',           priority: '1.0', changefreq: 'weekly' },
    { loc: CANON_HOST + '/awards',     priority: '0.8', changefreq: 'monthly' },
    { loc: CANON_HOST + '/subscribe',  priority: '0.6', changefreq: 'monthly' },
    { loc: CANON_HOST + '/submit',     priority: '0.7', changefreq: 'monthly' },
  ];
  const articleEntries = articles.map(a => ({
    loc: CANON_HOST + '/' + a.slug,
    lastmod: a.publishedAt,
    priority: a.premium ? '0.9' : '0.8',
    changefreq: 'monthly',
    image: a.heroImage ? (NUI_HOST + a.heroImage) : null,
    title: a.title,
  }));

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    staticPages.map(p => (
      '  <url>\n' +
      '    <loc>' + p.loc + '</loc>\n' +
      '    <lastmod>' + today + '</lastmod>\n' +
      '    <changefreq>' + p.changefreq + '</changefreq>\n' +
      '    <priority>' + p.priority + '</priority>\n' +
      '  </url>\n'
    )).join('') +
    articleEntries.map(e => (
      '  <url>\n' +
      '    <loc>' + e.loc + '</loc>\n' +
      '    <lastmod>' + e.lastmod + '</lastmod>\n' +
      '    <changefreq>' + e.changefreq + '</changefreq>\n' +
      '    <priority>' + e.priority + '</priority>\n' +
      (e.image ? '    <image:image>\n      <image:loc>' + e.image + '</image:loc>\n      <image:title>' + esc(e.title) + '</image:title>\n    </image:image>\n' : '') +
      '  </url>\n'
    )).join('') +
    '</urlset>\n'
  );
}

// ── Main ──────────────────────────────────────────────────
function main() {
  const mag = loadMag();
  // Only render articles that have a body (skip category placeholders)
  const articles = mag.articles.filter(a => a.body && a.business);
  console.log('[prerender] Found ' + articles.length + ' articles with body content');

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0, fail = 0;
  for (const a of articles) {
    try {
      const html = buildArticleHTML(a, mag);
      const outPath = path.join(OUT_DIR, a.slug + '.html');
      fs.writeFileSync(outPath, html);
      const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
      console.log('  ✓ ' + a.slug + ' (' + kb + ' KB)');
      ok++;
    } catch (err) {
      console.error('  ✗ ' + a.slug + ': ' + err.message);
      fail++;
    }
  }

  // Sitemap
  const sitemap = buildSitemapXML(articles);
  fs.writeFileSync(SITEMAP, sitemap);
  console.log('[prerender] sitemap.xml updated (' + (Buffer.byteLength(sitemap) / 1024).toFixed(1) + ' KB)');

  console.log('[prerender] Done: ' + ok + ' ok, ' + fail + ' failed');
  if (fail > 0) process.exit(1);
}

main();
