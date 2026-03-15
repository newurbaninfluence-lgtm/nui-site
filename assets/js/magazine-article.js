// NUI Magazine — Article Page JS
// Version: 20260316v19 — podcast player, book placeholder, authorMode

(function() {
  'use strict';

  const BASE = 'https://newurbaninfluence.com';

  function getSlug() {
    return new URLSearchParams(window.location.search).get('slug') || '';
  }
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
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  function starsHTML(rating) {
    var h = '<div style="display:flex;align-items:center;gap:5px">';
    for (var n = 1; n <= 5; n++) {
      var f = n <= Math.floor(rating);
      h += '<svg width="13" height="13" viewBox="0 0 14 14"><polygon points="7,1 8.8,5.2 13.5,5.5 10,8.5 11.1,13 7,10.5 2.9,13 4,8.5 0.5,5.5 5.2,5.2" fill="' + (f ? '#ffd700' : 'none') + '" stroke="#ffd700" stroke-width="0.8"/></svg>';
    }
    h += '</div><span class="mag-stars-val">' + rating.toFixed(1) + '</span>';
    return h;
  }
  function miniStarsHTML(rating) {
    var h = '<div class="mag-mini-stars">';
    for (var n = 1; n <= 5; n++) {
      h += '<svg width="11" height="11" viewBox="0 0 10 10"><polygon points="5,1 6.2,3.8 9.5,4 7,6.3 7.8,9.5 5,7.8 2.2,9.5 3,6.3 0.5,4 3.8,3.8" fill="' + (n <= rating ? '#ffd700' : 'none') + '" stroke="#ffd700" stroke-width="0.7"/></svg>';
    }
    return h + '</div>';
  }

  function parseBody(text) {
    if (!text) return '';
    return text.split('\n\n').filter(function(l) { return l.trim(); }).map(function(block) {
      block = block.trim();
      if (block.startsWith('## ')) return '<h2 class="mag-body-h2">' + block.slice(3) + '</h2>';
      if (/^\*".*"\*$/.test(block)) return '<div class="mag-pull-quote"><p>' + block.replace(/^\*"|"\*$/g,'') + '</p></div>';
      if (block.startsWith('> ')) return '<div class="mag-pull-quote"><p>' + block.slice(2) + '</p></div>';
      return '<p>' + block + '</p>';
    }).join('');
  }

  function buildSchemas(a) {
    var b   = a.business;
    var url = BASE + '/magazine/article?slug=' + a.slug;
    var schemaArticle = {
      '@context': 'https://schema.org', '@type': 'NewsArticle',
      headline: a.title, description: a.dek, url: url, datePublished: a.publishedAt,
      image: BASE + '/.netlify/functions/og-image?slug=' + a.slug,
      author: { '@type': 'Organization', name: 'NUI Editorial', url: BASE },
      publisher: { '@type': 'Organization', name: 'NUI Magazine', url: BASE + '/magazine', logo: { '@type': 'ImageObject', url: BASE + '/logo-nav.png' } }
    };
    var schemaBusiness = {
      '@context': 'https://schema.org', '@type': 'LocalBusiness',
      '@id': url + '#business', name: b.name,
      description: b.category + ' based in ' + b.city + ', ' + b.state + '.',
      url: b.website ? 'https://' + b.website : undefined,
      telephone: b.phone,
      address: { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: b.city, addressRegion: b.state, postalCode: b.zip, addressCountry: 'US' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: b.rating.toString(), reviewCount: b.reviewCount.toString(), bestRating: '5', worstRating: '1' },
      memberOf: { '@type': 'Organization', name: 'NUI Creator Network', url: BASE + '/network' }
    };
    var schemaReviews = (a.reviews || []).map(function(r, i) {
      return { '@context': 'https://schema.org', '@type': 'Review', '@id': url + '#review-' + i, itemReviewed: { '@id': url + '#business' }, reviewRating: { '@type': 'Rating', ratingValue: r.rating.toString(), bestRating: '5' }, author: { '@type': 'Person', name: r.name }, datePublished: a.publishedAt, reviewBody: r.text };
    });
    return { schemaArticle: schemaArticle, schemaBusiness: schemaBusiness, schemaReviews: schemaReviews };
  }

  function injectMeta(a) {
    var url   = BASE + '/magazine/article?slug=' + a.slug;
    var ogImg = BASE + '/.netlify/functions/og-image?slug=' + a.slug;
    document.title = a.title + ' | NUI Magazine';
    var canon = document.getElementById('artCanonical');
    if (canon) canon.setAttribute('href', url);
    setMeta('artOgUrl','content',url); setMeta('artOgTitle','content',a.title);
    setMeta('artOgDesc','content',a.dek); setMeta('artOgImage','content',ogImg);
    setMeta('artOgImageSec','content',ogImg); setMeta('artOgImageAlt','content',a.title);
    setMeta('artPubTime','content',a.publishedAt); setMeta('artOgSection','content',a.categoryLabel);
    setMeta('artTwTitle','content',a.title); setMeta('artTwDesc','content',a.dek);
    setMeta('artTwImage','content',ogImg); setMeta('artTwImgAlt','content',a.title);
    var schemas = buildSchemas(a);
    var sa = document.getElementById('schemaArticle');
    var sb = document.getElementById('schemaBusiness');
    if (sa) sa.textContent = JSON.stringify(schemas.schemaArticle);
    if (sb) sb.textContent = JSON.stringify(schemas.schemaBusiness);
    schemas.schemaReviews.forEach(function(r, i) {
      var s = document.getElementById('schemaReview' + i);
      if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'schemaReview' + i; document.head.appendChild(s); }
      s.textContent = JSON.stringify(r);
    });
  }

  function renderSidebar(a) {
    var b = a.business;
    setContent('sibBizName', b.name); setContent('sibBizCat', b.category);
    var starsEl = document.getElementById('sibStars');
    if (starsEl) starsEl.innerHTML = starsHTML(b.rating) + '<span class="mag-stars-count">' + b.reviewCount + ' reviews</span>';
    var napFields = [{ label: 'Business Name', val: b.name }];
    if (b.phone)   napFields.push({ label: 'Phone',   val: b.phone });
    if (b.address && b.address !== b.city) napFields.push({ label: 'Address', val: (b.address + ', ' + b.city + ' ' + b.state + ' ' + b.zip).trim() });
    if (b.email)   napFields.push({ label: 'Email',   val: b.email });
    if (b.website) napFields.push({ label: 'Website', extra: '<a href="https://' + b.website + '" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px">' + b.website + '</a>' });
    var napEl = document.getElementById('sibNap');
    if (napEl) napEl.innerHTML = napFields.map(function(r) { return '<div><span class="mag-nap-label">' + r.label + '</span>' + (r.extra || '<div class="mag-nap-val">' + r.val + '</div>') + '</div>'; }).join('');
    var saEl = document.getElementById('sibSameAs');
    if (saEl) saEl.innerHTML = (b.sameAs || []).map(function(s) { return '<span class="mag-same-as-chip">' + s + '</span>'; }).join('');
    var citeEl = document.getElementById('sibCiteId');
    if (citeEl) citeEl.innerHTML = 'Citation ID: <strong>' + b.citationId + '</strong><br>NAP verified by NUI editorial. Last confirmed ' + b.verifiedDate + '.';
    var footerCite = document.getElementById('footerCiteId');
    if (footerCite) footerCite.textContent = 'Citation ID: ' + b.citationId;
    if (a.award) { var aw = document.getElementById('sibAward'); if (aw) { aw.style.display = 'flex'; setContent('sibAwardTitle', a.award); setContent('sibAwardDesc', a.awardLabel); } }
    if (b.services && b.services.length) {
      var spEl = document.getElementById('sibServicesPills');
      // Author mode: hide the services block entirely
      if (a.authorMode) { var svWrap = document.getElementById('sibServices'); if (svWrap) svWrap.style.display = 'none'; }
      else if (spEl) spEl.innerHTML = b.services.map(function(s) { return '<span class="mag-services-pill">' + s + '</span>'; }).join('');
    } else { var svEl = document.getElementById('sibServices'); if (svEl) svEl.style.display = 'none'; }
    var preEl = document.getElementById('schemaPre');
    if (preEl) preEl.innerHTML = JSON.stringify({ '@type': 'LocalBusiness', name: b.name, aggregateRating: { ratingValue: b.rating, reviewCount: b.reviewCount } }, null, 2);
    var tog = document.getElementById('schemaToggle');
    if (tog) tog.addEventListener('click', function() { var show = preEl.style.display === 'none'; preEl.style.display = show ? '' : 'none'; tog.textContent = show ? 'Hide' : 'Show'; });
  }

  function buildOwnerBlock(a) {
    var ob = a.ownerBio;
    var statsHTML = (ob.stats || []).map(function(s) { return '<div class="mag-owner-stat"><div class="mag-owner-stat-val">' + s.val + '</div><div class="mag-owner-stat-label">' + s.label + '</div></div>'; }).join('');
    var tagsHTML  = (ob.tags  || []).map(function(t) { return '<span class="mag-owner-bio-tag">' + t + '</span>'; }).join('');
    return '<div class="mag-owner-feature"><div class="mag-owner-portrait"><img src="' + a.profileImage + '" alt="' + a.business.name + '" loading="lazy"><div class="mag-owner-verified-tag"><div class="mag-owner-verified-dot"></div> NUI Verified</div><div class="mag-owner-overlay"><div class="mag-owner-overlay-label">NUI Creator Network</div><div class="mag-owner-overlay-name">' + a.business.name + '</div><div class="mag-owner-overlay-title">' + ob.label + '</div></div></div><div class="mag-owner-bio-side"><div class="mag-owner-bio-eyebrow">Owner Profile</div><div class="mag-owner-bio-headline">' + ob.headline + '</div><div class="mag-owner-bio-body">' + ob.body + '</div><div class="mag-owner-bio-stats">' + statsHTML + '</div><div class="mag-owner-bio-tags">' + tagsHTML + '</div></div></div>';
  }

  function buildPodcastPlayer(url) {
    return '<div class="mag-podcast-player">' +
      '<div class="mag-podcast-header">' +
        '<div class="mag-podcast-icon">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ff0000" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="#ff0000"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</div>' +
        '<div class="mag-podcast-info">' +
          '<div class="mag-podcast-label">Audio Overview</div>' +
          '<div class="mag-podcast-title">From Detroit Snack Hustler to Brand Architect</div>' +
          '<div class="mag-podcast-sub">Built Heavy Podcast</div>' +
        '</div>' +
      '</div>' +
      '<audio id="builtHeavyAudio" preload="metadata"><source src="' + url + '" type="audio/mp4"></audio>' +
      '<a class="mag-podcast-btn" id="podcastPlayBtn" href="#" onclick="event.preventDefault();(function(){' +
        'var a=document.getElementById(\'builtHeavyAudio\');' +
        'var b=document.getElementById(\'podcastPlayBtn\');' +
        'if(a.paused){a.play();b.innerHTML=\'<svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot;><rect x=&quot;6&quot; y=&quot;4&quot; width=&quot;4&quot; height=&quot;16&quot;/><rect x=&quot;14&quot; y=&quot;4&quot; width=&quot;4&quot; height=&quot;16&quot;/></svg> Pause\';}' +
        'else{a.pause();b.innerHTML=\'<svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot;><polygon points=&quot;5,3 19,12 5,21&quot;/></svg> Listen to the AI Discussion\';}' +
      '})()">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Listen to the AI Discussion' +
      '</a>' +
    '</div>';
  }

  function buildBookPlaceholder() {
    return '<div class="mag-book-placeholder">' +
      '<div class="mag-book-cover">' +
        '<div class="mag-book-spine"></div>' +
        '<div class="mag-book-face">' +
          '<div class="mag-book-face-title">BUILT<br>HEAVY</div>' +
          '<div class="mag-book-face-sub">Forged by Pressure<br>Driven by Purpose</div>' +
          '<div class="mag-book-face-author">FAREN YOUNG</div>' +
        '</div>' +
      '</div>' +
      '<div class="mag-book-placeholder-text">' +
        '<div class="mag-book-placeholder-label">📖 Book Cover</div>' +
        '<p>Upload your final book cover to replace this placeholder.</p>' +
      '</div>' +
    '</div>';
  }

  function renderBody(a) {
    var url = BASE + '/magazine/article?slug=' + a.slug;
    setContent('artKicker', a.categoryLabel + ' · Detroit, MI');
    setContent('artTitle',  a.title);
    setContent('artDek',    a.dek);
    setContent('artDate',   fmtDate(a.publishedAt));
    setContent('artRead',   a.readTime);

    // Hero image
    var heroEl = document.getElementById('artHero');
    if (heroEl) {
      if (a.heroImage) {
        heroEl.innerHTML = '<img src="' + a.heroImage + '" alt="' + a.title + '" style="width:100%;height:100%;object-fit:cover;object-position:center 20%">';
      } else {
        var lbl = document.getElementById('artHeroLabel');
        if (lbl) lbl.textContent = a.business.name + ' · ' + a.business.city + ', ' + a.business.state;
      }
    }

    // Author profile card above hero
    if (a.profileImage && heroEl) {
      var card = document.createElement('div');
      card.className = 'mag-author-card';
      var chips = (a.business.services || []).slice(0,4).map(function(s) { return '<span class="mag-author-chip">' + s + '</span>'; }).join('');
      card.innerHTML = '<div class="mag-author-photo-wrap"><div class="mag-author-circle"><img src="' + a.profileImage + '" alt="' + a.business.name + '" loading="lazy"></div><div class="mag-author-verified-ring" title="NUI Verified">✓</div></div><div class="mag-author-info"><div class="mag-author-name">' + a.business.name + '</div><div class="mag-author-title">' + a.categoryLabel + '</div><div class="mag-author-bio">' + (a.profileBio || a.dek) + '</div><div class="mag-author-chips">' + chips + '</div></div>';
      heroEl.parentNode.insertBefore(card, heroEl);
    }

    // Body with owner block injected after 2nd paragraph
    var bodyHTML = parseBody(a.body);
    var parts    = bodyHTML.split('</p>');
    var before   = parts.slice(0, 2).join('</p>') + '</p>';
    var after    = parts.slice(2).join('</p>');
    var ownerBlock = (a.ownerBio && a.profileImage) ? buildOwnerBlock(a) : '';
    setHtml('artBody', before + ownerBlock + after);

    var bodyEl = document.getElementById('artBody');

    // Book image placeholder — authorMode only, at top of body
    if (a.authorMode && bodyEl) {
      bodyEl.insertAdjacentHTML('afterbegin', buildBookPlaceholder());
    }

    // Podcast player — authorMode only, right after book placeholder
    if (a.podcastUrl && a.authorMode && bodyEl) {
      var bookEl = bodyEl.querySelector('.mag-book-placeholder');
      var playerHTML = buildPodcastPlayer(a.podcastUrl);
      if (bookEl) {
        bookEl.insertAdjacentHTML('afterend', playerHTML);
      } else {
        bodyEl.insertAdjacentHTML('afterbegin', playerHTML);
      }
    }

    // YouTube embed at end of body
    if (a.videoUrl && bodyEl) {
      bodyEl.insertAdjacentHTML('beforeend',
        '<div class="mag-video-wrap"><div class="mag-video-label"><span class="mag-video-rule"></span>Watch</div>' +
        '<div class="mag-video-frame"><iframe src="' + a.videoUrl + '?rel=0&modestbranding=1" title="' + a.title + '" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div></div>'
      );
    }

    // Tags
    var tagsEl = document.getElementById('artTags');
    if (tagsEl) tagsEl.innerHTML = (a.tags || []).map(function(t) { return '<span class="mag-body-tag">' + t + '</span>'; }).join('');

    // Premium NUI branding extras — SKIP for authorMode articles
    if (a.premium && !a.authorMode) {
      var hdr = document.querySelector('.mag-article-header');
      if (hdr) hdr.classList.add('is-premium');
      var pressBar = '<div class="mag-press-bar"><div class="mag-press-label">As Featured In</div><div class="mag-press-logos"><span class="mag-press-item">Rolling Out</span><span class="mag-press-item">Detroit Free Press</span><span class="mag-press-item">Model D Media</span><span class="mag-press-item">Clutch.co</span><span class="mag-press-item">Yelp</span></div></div>';
      var statRow  = '<div class="mag-stat-row"><div class="mag-stat-cell"><div class="mag-stat-cell-val">20+</div><div class="mag-stat-cell-label">Years in Detroit</div></div><div class="mag-stat-cell"><div class="mag-stat-cell-val">50+</div><div class="mag-stat-cell-label">Brands Built</div></div><div class="mag-stat-cell"><div class="mag-stat-cell-val">4.9★</div><div class="mag-stat-cell-label">Google Rating</div></div><div class="mag-stat-cell"><div class="mag-stat-cell-val">$1.5K</div><div class="mag-stat-cell-label">Packages From</div></div></div>';
      var svcs = [['Brand Identity','Logo, color, type, guidelines.'],['Web Design','Mobile-first, conversion-ready.'],['AI Systems','Chatbots and lead automation.'],['Silent Visitor ID','Identify anonymous visitors.'],['Geo-Fencing','Target competitor locations.'],['Print & Packaging','Turnkey design + print.']];
      var svcGrid = '<div class="mag-services-showcase">' + svcs.map(function(s,i) { return '<div class="mag-service-tile"><div class="mag-service-tile-num">0'+(i+1)+'</div><div class="mag-service-tile-name">'+s[0]+'</div><div class="mag-service-tile-desc">'+s[1]+'</div></div>'; }).join('') + '</div>';
      if (bodyEl) bodyEl.insertAdjacentHTML('beforeend', pressBar + statRow + svcGrid);
    }

    // Breadcrumb + share buttons
    setContent('breadCat', a.categoryLabel); setContent('breadBiz', a.business.name);
    var bc = document.getElementById('breadCat');
    if (bc) bc.onclick = function() { location.href = '/magazine?cat=' + a.category; };
    var btnX = document.getElementById('btnX');   if (btnX) btnX.onclick = function() { window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(a.title), '_blank'); };
    var btnFB = document.getElementById('btnFB'); if (btnFB) btnFB.onclick = function() { window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank'); };
    var btnLI = document.getElementById('btnLI'); if (btnLI) btnLI.onclick = function() { window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url), '_blank'); };
    var btnCp = document.getElementById('btnCopy'); if (btnCp) btnCp.onclick = function() { if (navigator.clipboard) navigator.clipboard.writeText(url); btnCp.textContent = '✓'; setTimeout(function() { btnCp.textContent = '⎘'; }, 2000); };
  }

  function renderReviews(a) {
    var rcEl = document.getElementById('reviewCount');
    if (rcEl) rcEl.textContent = a.business.reviewCount + ' verified reviews';
    var rlEl = document.getElementById('reviewList');
    if (rlEl) rlEl.innerHTML = (a.reviews || []).map(function(r) {
      return '<div class="mag-review-item"><div class="mag-review-top"><div class="mag-reviewer"><div class="mag-reviewer-dot">' + r.initials + '</div><div><div class="mag-reviewer-name">' + r.name + '</div><div class="mag-reviewer-date">' + r.date + '</div></div></div>' + miniStarsHTML(r.rating) + '</div><div class="mag-review-text">' + r.text + '</div><div class="mag-review-verified">✓ Verified — ' + (r.platform || 'NUI Creator Network') + '</div></div>';
    }).join('');
  }

  function initBadge(a) {
    var url  = BASE + '/magazine/article.html?slug=' + a.slug;
    var code = '<a href="' + url + '" rel="dofollow" target="_blank">\n  <img src="' + BASE + '/images/badges/nui-featured.svg" alt="As Seen on NUI Magazine" width="200">\n</a>';
    var btn = document.getElementById('embedBtn');
    var ec  = document.getElementById('embedCode');
    if (!btn || !ec) return;
    var showing = false;
    btn.addEventListener('click', function() {
      showing = !showing;
      ec.style.display = showing ? '' : 'none';
      ec.textContent = code;
      if (showing && navigator.clipboard) navigator.clipboard.writeText(code);
      btn.textContent = showing ? 'Copied! ✓' : 'Get Embed Code';
    });
  }

  function renderRelated(a) {
    var el = document.getElementById('relatedGrid');
    if (!el) return;
    var related = NUI_MAG.getRecent(6).filter(function(r) { return r.slug !== a.slug; }).slice(0, 3);
    el.innerHTML = related.map(function(r) {
      var img = r.heroImage ? '<img src="' + r.heroImage + '" alt="' + r.title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover">' : '<span>' + r.categoryLabel + '</span>';
      return '<a class="mag-card" href="/magazine/article.html?slug=' + r.slug + '"><div class="mag-card-img">' + img + '</div><div class="mag-card-cat">' + r.categoryLabel + '</div><div class="mag-card-title">' + r.title + '</div><div class="mag-card-meta"><span>' + r.readTime + '</span></div></a>';
    }).join('');
  }

  function fetchGMBReviews(slug) {
    return fetch('/.netlify/functions/gmb-reviews?slug=' + slug)
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) { return (d && !d.error && d.reviews && d.reviews.length) ? d : null; })
      .catch(function() { return null; });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var slug    = getSlug();
    var article = NUI_MAG.getBySlug(slug);
    if (!article) {
      document.body.innerHTML = '<div style="text-align:center;padding:120px 24px;color:#fff"><h2 style="font-family:Syne,sans-serif;margin-bottom:16px">Article not found</h2><p style="color:#555;margin-bottom:24px">Slug: "' + slug + '"</p><a href="/magazine" style="color:#ff0000">← Back to Magazine</a></div>';
      return;
    }
    injectMeta(article);
    renderBody(article);
    renderSidebar(article);
    renderReviews(article);
    initBadge(article);
    renderRelated(article);
    fetchGMBReviews(article.slug).then(function(gmb) {
      if (!gmb) return;
      article.business.rating = gmb.rating; article.business.reviewCount = gmb.reviewCount; article.reviews = gmb.reviews;
      renderReviews(article);
      var starsEl = document.getElementById('sibStars');
      if (starsEl) starsEl.innerHTML = starsHTML(gmb.rating) + '<span class="mag-stars-count">' + gmb.reviewCount + ' Google reviews</span>';
    });
  });

})();
