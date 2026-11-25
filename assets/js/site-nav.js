// Phone menu for the standalone pages' nav (.nh-nav). The homepage uses its own menu in index.html.
(function() {
  var btn = document.querySelector('.nh-burger'), menu = document.getElementById('nhMenu');
  if (!btn || !menu) return;
  function set(open) {
    btn.setAttribute('aria-expanded', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  btn.addEventListener('click', function() { set(menu.hidden); });
  menu.addEventListener('click', function(e) { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', function(e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
})();
