// NUI Magazine — Index Page JS
// Version: 20260316v1

(function() {
  'use strict';

  const BASE = 'https://newurbaninfluence.com';

  // ── Star helper ──────────────────────────────────
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

  // ── Format date ──────────────────────────────────
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // ── Build article card ───────────────────────────
  function buildCard(a) {
    const awardTag = a.award
      ? `<div class="mag-card-award-tag">🏆 Award Winner</div>` : '';
    const awardChip = a.award
      ? `<span class="mag-card-award-chip">🏆 Award</span>` : '';
    return `
      <a class="mag-card" href="/magazine/article.html?slug=${a.slug}">
        <div class="mag-card-img">
          ${a.heroImage ? `<img src="${a.heroImage}" alt="${a.title}">` : `<span>${a.categoryLabel}</span>`}
          ${awardTag}
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

  // ── Render hero from first featured ──────────────
  function renderHero() {
    const hero = NUI_MAG.getFeatured()[0];
    if (!hero) return;
    document.getElementById('heroTitle').textContent  = hero.title;
    document.getElementById('heroDek').textContent    = hero.dek;
    document.getElementById('heroAuthor').textContent = hero.author;
    document.getElementById('heroDate').textContent   = fmtDate(hero.publishedAt);
    document.getElementById('heroRead').textContent   = hero.readTime;
    document.getElementById('heroBtn').href = `/magazine/article.html?slug=${hero.slug}`;
    document.getElementById('heroImg').querySelector('span').textContent = `${hero.categoryLabel} · Detroit, MI`;
    const awardEl = document.getElementById('heroAward');
    if (!hero.award) awardEl.style.display = 'none';
  }

  // ── Render article grids ─────────────────────────
  function renderGrids(cat) {
    const featured  = NUI_MAG.getFeatured().slice(0, 3);
    const articles  = cat === 'all'
      ? NUI_MAG.getRecent(6)
      : NUI_MAG.getByCategory(cat);

    const fg = document.getElementById('featuredGrid');
    const ag = document.getElementById('articlesGrid');

    if (cat !== 'all') {
      fg.parentElement.previousElementSibling.style.display = 'none';
      fg.style.display = 'none';
    } else {
      fg.parentElement.previousElementSibling.style.display = '';
      fg.style.display = '';
      fg.innerHTML = featured.map(buildCard).join('');
    }

    ag.innerHTML = articles.length
      ? articles.map(buildCard).join('')
      : `<div style="grid-column:1/-1;text-align:center;padding:48px;color:#555;font-size:14px">No articles in this category yet. Check back soon.</div>`;
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
