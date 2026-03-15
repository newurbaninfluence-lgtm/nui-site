// NUI Magazine — Article Page JS
// Version: 20260316v1
// Handles: dynamic OG tags, JSON-LD schemas, citation sidebar, reviews, badge embed

(function() {
  'use strict';

  const BASE = 'https://newurbaninfluence.com';

  // ── Read slug from URL ────────────────────────────
  function getSlug() {
    return new URLSearchParams(window.location.search).get('slug') || '';
  }

  // ── Set meta tag helper ───────────────────────────
  function setMeta(id, attr, val) {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  }
  function setContent(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = val;
  }
  function setHtml(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  }

  // ── Format date ───────────────────────────────────
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  function fmtDateShort(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // ── Stars HTML ────────────────────────────────────
  function starsHTML(rating) {
    let h = '<div style="display:flex;align-items:center;gap:5px">';
    for (let n = 1; n <= 5; n++) {
      const f = n <= Math.floor(rating);
      h += `<svg width="13" height="13" viewBox="0 0 14 14">
        <polygon points="7,1 8.8,5.2 13.5,5.5 10,8.5 11.1,13 7,10.5 2.9,13 4,8.5 0.5,5.5 5.2,5.2"
          fill="${f ? '#ffd700' : 'none'}" stroke="#ffd700" stroke-width="0.8"/>
      </svg>`;
    }
    h += `</div><span class="mag-stars-val">${rating.toFixed(1)}</span>`;
    return h;
  }

  // ── Mini stars ────────────────────────────────────
  function miniStarsHTML(rating) {
    let h = '<div class="mag-mini-stars">';
    for (let n = 1; n <= 5; n++) {
      h += `<svg width="11" height="11" viewBox="0 0 10 10">
        <polygon points="5,1 6.2,3.8 9.5,4 7,6.3 7.8,9.5 5,7.8 2.2,9.5 3,6.3 0.5,4 3.8,3.8"
          fill="${n <= rating ? '#ffd700' : 'none'}" stroke="#ffd700" stroke-width="0.7"/>
      </svg>`;
    }
    return h + '</div>';
  }

  // ── Parse minimal markdown ────────────────────────
  function parseBody(text) {
    if (!text) return '';
    return text.split('\n').filter(l => l.trim()).map(line => {
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('> ')) return `<div class="mag-pull-quote"><p>${line.slice(2)}</p></div>`;
      return `<p>${line}</p>`;
    }).join('');
  }

  // ── Build all 3 schemas ───────────────────────────
  function buildSchemas(a) {
    const b   = a.business;
    const url = `${BASE}/magazine/article?slug=${a.slug}`;

    // 1 — NewsArticle
    const schemaArticle = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: a.title,
      description: a.dek,
      url: url,
      datePublished: a.publishedAt,
      image: a.ogImage ? `${BASE}${a.ogImage}` : `${BASE}/.netlify/functions/og-image?slug=${a.slug}`,
      author: { '@type': 'Organization', name: 'NUI Editorial', url: BASE },
      publisher: {
        '@type': 'Organization',
        name: 'New Urban Influence Magazine',
        url: `${BASE}/magazine`,
        logo: { '@type': 'ImageObject', url: `${BASE}/logo-nav.png` }
      },
      about: { '@id': `${url}#business` }
    };

    // 2 — LocalBusiness (the citation)
    const sameAsMap = {
      'Google':     `https://google.com/maps/search/${encodeURIComponent(b.name)}+Detroit+MI`,
      'Yelp':       `https://yelp.com/search?find_desc=${encodeURIComponent(b.name)}&find_loc=Detroit+MI`,
      'Facebook':   `https://facebook.com/search/top?q=${encodeURIComponent(b.name)}`,
      'Apple Maps': `https://maps.apple.com/?q=${encodeURIComponent(b.name)}`,
      'Bing':       `https://bing.com/search?q=${encodeURIComponent(b.name)}+Detroit`,
      'Foursquare': `https://foursquare.com/search?query=${encodeURIComponent(b.name)}`,
    };
    const schemaBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${url}#business`,
      name: b.name,
      description: `${b.category} based in ${b.city}, ${b.state}.`,
      url: b.website ? `https://${b.website}` : undefined,
      telephone: b.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: b.address,
        addressLocality: b.city,
        addressRegion: b.state,
        postalCode: b.zip,
        addressCountry: 'US'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: b.rating.toString(),
        reviewCount: b.reviewCount.toString(),
        bestRating: '5', worstRating: '1'
      },
      memberOf: {
        '@type': 'Organization',
        name: 'New Urban Influence Creator Network',
        url: `${BASE}/network`
      },
      sameAs: (b.sameAs || []).map(s => sameAsMap[s] || s)
    };

    // 3 — Reviews array
    const schemaReviews = (a.reviews || []).map((r, i) => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      '@id': `${url}#review-${i}`,
      itemReviewed: { '@id': `${url}#business` },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating.toString(), bestRating: '5' },
      author: { '@type': 'Person', name: r.name },
      datePublished: a.publishedAt,
      reviewBody: r.text,
      publisher: { '@type': 'Organization', name: 'New Urban Influence Magazine' }
    }));

    return { schemaArticle, schemaBusiness, schemaReviews };
  }

  // ── Inject all OG tags + schemas ─────────────────
  function injectMeta(a) {
    const b   = a.business;
    const url = `${BASE}/magazine/article?slug=${a.slug}`;
    const ogImg = `${BASE}/.netlify/functions/og-image?slug=${a.slug}`;

    // Page title
    document.title = `${a.title} | NUI Magazine`;

    // Canonical
    const canonEl = document.getElementById('artCanonical');
    if (canonEl) canonEl.setAttribute('href', url);

    // Standard meta
    setMeta('metaDesc', 'content', a.dek);

    // OG tags
    setMeta('artOgUrl',      'content', url);
    setMeta('artOgTitle',    'content', a.title);
    setMeta('artOgDesc',     'content', a.dek);
    setMeta('artOgImage',    'content', ogImg);
    setMeta('artOgImageSec', 'content', ogImg);
    setMeta('artOgImageAlt', 'content', a.title);
    setMeta('artPubTime',    'content', a.publishedAt);
    setMeta('artOgAuthor',   'content', 'NUI Editorial');
    setMeta('artOgSection',  'content', a.categoryLabel);

    // Twitter tags
    setMeta('artTwTitle',  'content', a.title);
    setMeta('artTwDesc',   'content', a.dek);
    setMeta('artTwImage',  'content', ogImg);
    setMeta('artTwImgAlt', 'content', a.title);
    setMeta('artTwUrl',    'content', url);

    // JSON-LD schemas
    const { schemaArticle, schemaBusiness, schemaReviews } = buildSchemas(a);
    document.getElementById('schemaArticle').textContent  = JSON.stringify(schemaArticle);
    document.getElementById('schemaBusiness').textContent = JSON.stringify(schemaBusiness);

    // Inject review schemas as individual scripts
    schemaReviews.forEach((r, i) => {
      let s = document.getElementById(`schemaReview${i}`);
      if (!s) {
        s = document.createElement('script');
        s.type = 'application/ld+json';
        s.id   = `schemaReview${i}`;
        document.head.appendChild(s);
      }
      s.textContent = JSON.stringify(r);
    });
  }

  // ── Render sidebar ────────────────────────────────
  function renderSidebar(a) {
    const b = a.business;

    setContent('sibBizName', b.name);
    setContent('sibBizCat',  b.category);

    // Stars
    document.getElementById('sibStars').innerHTML =
      starsHTML(b.rating) +
      `<span class="mag-stars-count">${b.reviewCount} reviews</span>`;

    // NAP — skip empty fields
    const napFields = [
      { label: 'Business Name', val: b.name },
      b.phone    && { label: 'Phone',   val: b.phone },
      b.address  && { label: 'Address', val: `${b.address}, ${b.city} ${b.state} ${b.zip}`.trim() },
      b.email    && { label: 'Email',   val: b.email },
      b.website  && { label: 'Website', val: b.website,
        extra: `<a href="https://${b.website}" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px">${b.website}</a>` },
    ].filter(Boolean);
    document.getElementById('sibNap').innerHTML = napFields.map(r => `
      <div>
        <span class="mag-nap-label">${r.label}</span>
        ${r.extra || `<div class="mag-nap-val">${r.val}</div>`}
      </div>`).join('');

    // Same-as chips
    document.getElementById('sibSameAs').innerHTML = (b.sameAs || [])
      .map(s => `<span class="mag-same-as-chip">${s}</span>`).join('');

    // Citation ID
    document.getElementById('sibCiteId').innerHTML =
      `Citation ID: <strong>${b.citationId}</strong><br>NAP verified by NUI editorial. Last confirmed ${b.verifiedDate}.`;
    document.getElementById('footerCiteId').textContent = `Citation ID: ${b.citationId}`;

    // Award
    if (a.award) {
      const aw = document.getElementById('sibAward');
      aw.style.display = 'flex';
      setContent('sibAwardTitle', a.award);
      setContent('sibAwardDesc',  a.awardLabel);
    }

    // Services
    if (b.services && b.services.length) {
      document.getElementById('sibServicesPills').innerHTML = b.services
        .map(s => `<span class="mag-services-pill">${s}</span>`).join('');
    } else {
      document.getElementById('sibServices').style.display = 'none';
    }

    // Schema preview
    const bizSnippet = {
      '@type': 'LocalBusiness',
      name: b.name,
      telephone: b.phone,
      aggregateRating: { ratingValue: b.rating, reviewCount: b.reviewCount },
      memberOf: { name: 'NUI Creator Network' }
    };
    document.getElementById('schemaPre').innerHTML =
      Object.entries(bizSnippet).map(([k, v]) =>
        typeof v === 'object'
          ? `<span class="k">"${k}"</span>: {<br>&nbsp;&nbsp;${Object.entries(v).map(([a,b]) => `<span class="k">"${a}"</span>: <span class="s">${JSON.stringify(b)}</span>`).join(', ')}<br>},`
          : `<span class="k">"${k}"</span>: <span class="s">${JSON.stringify(v)}</span>,`
      ).join('<br>');

    document.getElementById('schemaToggle').addEventListener('click', function() {
      const pre = document.getElementById('schemaPre');
      const show = pre.style.display === 'none';
      pre.style.display = show ? '' : 'none';
      this.textContent  = show ? 'Hide' : 'Show';
    });
  }

  // ── Render article body ───────────────────────────
  function renderBody(a) {
    const url = `${BASE}/magazine/article?slug=${a.slug}`;

    // Header
    setContent('artKicker', `${a.categoryLabel} · Detroit, MI`);
    setContent('artTitle',  a.title);
    setContent('artDek',    a.dek);
    setContent('artDate',   fmtDate(a.publishedAt));
    setContent('artRead',   a.readTime);

    // Hero image — real photo if available
    const heroEl = document.getElementById('artHero');
    if (a.heroImage) {
      heroEl.innerHTML = `<img src="${a.heroImage}" alt="${a.title}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%">`;
    } else {
      document.getElementById('artHeroLabel').textContent = `${a.business.name} · ${a.business.city}, ${a.business.state}`;
    }

    // Body
    setHtml('artBody', parseBody(a.body));

    // Tags
    document.getElementById('artTags').innerHTML = (a.tags || [])
      .map(t => `<span class="mag-body-tag">${t}</span>`).join('');

    // Breadcrumb
    setContent('breadCat', a.categoryLabel);
    document.getElementById('breadCat').onclick = () =>
      location.href = `/magazine?cat=${a.category}`;
    setContent('breadBiz', a.business.name);

    // Social share
    document.getElementById('btnX').onclick = () =>
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(a.title)}`, '_blank');
    document.getElementById('btnFB').onclick = () =>
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    document.getElementById('btnLI').onclick = () =>
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    document.getElementById('btnCopy').onclick = function() {
      navigator.clipboard && navigator.clipboard.writeText(url);
      this.textContent = '✓';
      setTimeout(() => { this.textContent = '⎘'; }, 2000);
    };
  }

  // ── Render reviews ────────────────────────────────
  function renderReviews(a) {
    document.getElementById('reviewCount').textContent = `${a.business.reviewCount} verified reviews`;
    document.getElementById('reviewList').innerHTML = (a.reviews || []).map(r => `
      <div class="mag-review-item">
        <div class="mag-review-top">
          <div class="mag-reviewer">
            <div class="mag-reviewer-dot">${r.initials}</div>
            <div>
              <div class="mag-reviewer-name">${r.name}</div>
              <div class="mag-reviewer-date">${r.date}</div>
            </div>
          </div>
          ${miniStarsHTML(r.rating)}
        </div>
        <div class="mag-review-text">${r.text}</div>
        <div class="mag-review-verified">✓ Verified client — NUI Creator Network</div>
      </div>`).join('');
  }

  // ── Badge embed code ──────────────────────────────
  function initBadge(a) {
    const url  = `${BASE}/magazine/article?slug=${a.slug}`;
    const code = `<a href="${url}" rel="dofollow" target="_blank">\n  <img src="${BASE}/images/badges/nui-featured.svg"\n       alt="As Seen on NUI Magazine" width="200">\n</a>`;
    let showing = false;
    document.getElementById('embedBtn').addEventListener('click', function() {
      showing = !showing;
      const ec = document.getElementById('embedCode');
      ec.style.display = showing ? '' : 'none';
      ec.textContent   = code;
      if (showing && navigator.clipboard) navigator.clipboard.writeText(code);
      this.textContent = showing ? 'Copied! ✓' : 'Get Embed Code';
    });
  }

  // ── Render related articles ───────────────────────
  function renderRelated(a) {
    const slug = a.slug;
    const related = NUI_MAG.getRecent(6).filter(r => r.slug !== slug).slice(0, 3);
    document.getElementById('relatedGrid').innerHTML = related.map(r => `
      <a class="mag-card" href="/magazine/article.html?slug=${r.slug}">
        <div class="mag-card-img"><span>${r.categoryLabel}</span></div>
        <div class="mag-card-cat">${r.categoryLabel}</div>
        <div class="mag-card-title">${r.title}</div>
        <div class="mag-card-meta"><span>${r.readTime}</span></div>
      </a>`).join('');
  }

  // ── INIT ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const slug    = getSlug();
    const article = NUI_MAG.getBySlug(slug);

    if (!article) {
      document.body.innerHTML = `<div style="text-align:center;padding:120px 24px;color:#fff">
        <h2 style="font-family:Syne,sans-serif;margin-bottom:16px">Article not found</h2>
        <a href="/magazine" style="color:#ff0000">← Back to Magazine</a>
      </div>`;
      return;
    }

    injectMeta(article);
    renderBody(article);
    renderSidebar(article);
    renderReviews(article);
    initBadge(article);
    renderRelated(article);
  });

})();
