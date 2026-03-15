// NUI Magazine — Index Page JS
// Version: 20260316v14

(function() {
  'use strict';

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // ── Build article card ───────────────────────────
  function buildCard(a) {
    const premiumBadge = a.premium ? `<div class="mag-card-premium-badge">★ FEATURED</div>` : '';
    const awardTag = a.award ? `<div class="mag-card-award-tag">🏆 Award Winner</div>` : '';
    const awardChip = a.award ? `<span class="mag-card-award-chip">🏆 Award</span>` : '';
    return `
      <a class="mag-card${a.premium ? ' is-premium' : ''}" href="/magazine/article.html?slug=${a.slug}">
        <div class="mag-card-img">
          ${a.heroImage ? `<img src="${a.heroImage}" alt="${a.title}" loading="lazy">` : `<span>${a.categoryLabel}</span>`}
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

  // ── Render hero — premium article first, else first featured ──
  function renderHero() {
    const hero = (NUI_MAG.getPremium?.() || []).concat(NUI_MAG.getFeatured())[0];
    if (!hero) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('heroTitle',  hero.title);
    set('heroDek',    hero.dek);
    set('heroAuthor', hero.author);
    set('heroDate',   fmtDate(hero.publishedAt));
    set('heroRead',   hero.readTime);

    document.getElementById('heroBtn').href = `/magazine/article.html?slug=${hero.slug}`;

    // Hero image
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      if (hero.heroImage) {
        heroImg.style.backgroundImage = `url('${hero.heroImage}')`;
        heroImg.style.backgroundSize  = 'cover';
        heroImg.style.backgroundPosition = 'center 20%';
        const lbl = heroImg.querySelector('#heroImgLabel, span');
        if (lbl) lbl.style.display = 'none';
      } else {
        const lbl = heroImg.querySelector('#heroImgLabel, span');
        if (lbl) lbl.textContent = `${hero.categoryLabel} · Detroit, MI`;
      }
    }

    const awardEl = document.getElementById('heroAward');
    if (awardEl) awardEl.style.display = hero.award ? '' : 'none';
  }

  // ── Render article grids ─────────────────────────
  function renderGrids(cat) {
    const featured = NUI_MAG.getFeatured().slice(0, 3);
    const articles = cat === 'all' ? NUI_MAG.getRecent(6) : NUI_MAG.getByCategory(cat);

    const fg = document.getElementById('featuredGrid');
    const ag = document.getElementById('articlesGrid');
    const fh = document.getElementById('featuredHead');

    if (cat !== 'all') {
      if (fh) fh.style.display = 'none';
      if (fg) fg.style.display = 'none';
    } else {
      if (fh) fh.style.display = '';
      if (fg) { fg.style.display = ''; fg.innerHTML = featured.map(buildCard).join(''); }
    }

    if (ag) {
      ag.innerHTML = articles.length
        ? articles.map(buildCard).join('')
        : `<div style="grid-column:1/-1;text-align:center;padding:48px;color:#555;font-size:14px">No articles in this category yet.</div>`;
    }
  }

  // ── Category filter ──────────────────────────────
  function initCatNav() {
    document.querySelectorAll('.mag-cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mag-cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        const heroSec = document.getElementById('heroSection');
        if (heroSec) heroSec.style.display = cat === 'all' ? '' : 'none';
        renderGrids(cat);
      });
    });
  }

  // ── Init ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    renderHero();
    renderGrids('all');
    initCatNav();
  });

})();
