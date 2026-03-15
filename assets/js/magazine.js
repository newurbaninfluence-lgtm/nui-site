// NUI Magazine — Index Page JS
// Version: 20260316v13

(function() {
  'use strict';

  const BASE = 'https://newurbaninfluence.com';

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function starsSVG(rating, size = 13) {
    let html = '';
    for (let n = 1; n <= 5; n++) {
      const filled = n <= Math.floor(rating);
      const half   = !filled && n <= rating + 0.5;
      html += `<svg width="${size}" height="${size}" viewBox="0 0 14 14">
        <polygon points="7,1 8.8,5.2 13.5,5.5 10,8.5 11.1,13 7,10.5 2.9,13 4,8.5 0.5,5.5 5.2,5.2"
          fill="${filled ? '#ffd700' : 'none'}" stroke="#ffd700"
          stroke-width="0.8" opacity="${half ? 0.4 : 1}"/>
      </svg>`;
    }
    return html;
  }

  // ── Build article card ───────────────────────────
  function buildCard(a) {
    const premiumBadge = a.premium
      ? `<div class="mag-card-premium-badge">★ FEATURED</div>` : '';
    const awardTag = a.award
      ? `<div class="mag-card-award-tag">🏆 Award Winner</div>` : '';
    const awardChip = a.award
      ? `<span class="mag-card-award-chip">🏆 Award</span>` : '';
    return `
      <a class="mag-card${a.premium ? ' is-premium' : ''}" href="/magazine/article.html?slug=${a.slug}">
        <div class="mag-card-img">
          ${a.heroImage
            ? `<img src="${a.heroImage}" alt="${a.title}" loading="lazy">`
            : `<span>${a.categoryLabel}</span>`}
          ${premiumBadge}${awardTag}
        </div>
        <div class="mag-card-cat">${a.categoryLabel}</div>
        <div class="mag-card-title">${a.title}</div>
        <div class="mag-card-dek">${a.dek}</div>
        <div class="mag-card-meta">
          <span>${a.author}</span><span>·</span>
          <span>${fmtDate(a.publishedAt)}</span><span>·</span>
          <span>${a.readTime}</span>
          ${awardChip}
        </div>
      </a>`;
  }

  // ── Render editorial hero ─────────────────────────
  // Cover story = premium article first, then first featured
  function renderEditorialHero() {
    const cover = NUI_MAG.getPremium?.()?.[0] || NUI_MAG.getFeatured()[0];
    if (!cover) return;

    // Background — use hero image from cover article
    const bg = document.getElementById('editorialBg');
    if (bg && cover.heroImage) {
      bg.style.backgroundImage =
        `linear-gradient(105deg, rgba(0,0,0,.97) 0%, rgba(0,0,0,.85) 45%, rgba(0,0,0,.4) 100%),
         url('${cover.heroImage}')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center 20%';
    }

    // Cover card image
    const coverImg = document.getElementById('coverImg');
    if (coverImg) {
      if (cover.heroImage) {
        coverImg.innerHTML = `<img src="${cover.heroImage}" alt="${cover.title}">`;
      } else {
        coverImg.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;
          height:100%;font-size:12px;color:#444;font-weight:600;letter-spacing:.06em;
          text-transform:uppercase">${cover.categoryLabel} · Detroit, MI</span>`;
      }
    }

    // Cover card text
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('coverCat',    cover.categoryLabel);
    set('coverTitle',  cover.title);
    set('coverDek',    cover.dek);
    set('coverAuthor', cover.author);
    set('coverRead',   cover.readTime);

    const btn = document.getElementById('coverBtn');
    if (btn) btn.href = `/magazine/article.html?slug=${cover.slug}`;
  }

  // ── Render article grids ─────────────────────────
  function renderGrids(cat) {
    const featured = NUI_MAG.getFeatured().slice(0, 3);
    const articles = cat === 'all'
      ? NUI_MAG.getRecent(6)
      : NUI_MAG.getByCategory(cat);

    const fg = document.getElementById('featuredGrid');
    const ag = document.getElementById('articlesGrid');
    const fHead = document.getElementById('featuredHead');

    if (cat !== 'all') {
      if (fHead) fHead.style.display = 'none';
      if (fg)    fg.style.display    = 'none';
    } else {
      if (fHead) fHead.style.display = '';
      if (fg) {
        fg.style.display = '';
        fg.innerHTML = featured.map(buildCard).join('');
      }
    }

    if (ag) {
      ag.innerHTML = articles.length
        ? articles.map(buildCard).join('')
        : `<div style="grid-column:1/-1;text-align:center;padding:48px;color:#555;font-size:14px">
            No articles in this category yet — check back soon.
           </div>`;
    }
  }

  // ── Category filter ──────────────────────────────
  function initCatNav() {
    document.querySelectorAll('.mag-cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mag-cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        const hero = document.getElementById('heroSection');
        if (hero) hero.style.display = cat === 'all' ? '' : 'none';
        renderGrids(cat);
      });
    });
  }

  // ── Init ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    renderEditorialHero();
    renderGrids('all');
    initCatNav();
  });

})();
