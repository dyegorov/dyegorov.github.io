/* ВыпускникON — лендинг: интерактив */
(function () {
  'use strict';

  /* ---- фирменная иконка power (О из ON) ---- */
  var PW_COLORS = {
    pink: 'var(--vk-pink)', purple: 'var(--vk-purple)', blue: 'var(--vk-blue)',
    orange: 'var(--vk-orange)', white: '#fff', ink: 'var(--vk-ink)'
  };
  function injectPower() {
    document.querySelectorAll('[data-pw]').forEach(function (el) {
      if (el.dataset.pwDone) return;
      el.dataset.pwDone = '1';
      var size = parseInt(el.getAttribute('data-size') || '17', 10);
      var color = PW_COLORS[el.getAttribute('data-color')] || 'currentColor';
      el.innerHTML =
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
        'stroke="' + color + '" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M12 2.6 V11"/>' +
        '<path d="M6.3 6.3 a8 8 0 1 0 11.4 0"/></svg>';
    });
  }

  /* ---- плавная прокрутка с учётом шапки ---- */
  function headerH() {
    var h = document.querySelector('.hdr');
    return h ? h.offsetHeight : 0;
  }
  function scrollToId(id) {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var el = document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - headerH() + 2;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-nav]');
    if (!t) return;
    e.preventDefault();
    scrollToId(t.getAttribute('data-nav'));
    closeMenu();
  });

  /* ---- слайдер выпускников ---- */
  function initSlider() {
    var root = document.getElementById('heroSlider');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('heroDots');
    var i = 0, timer = null;
    slides.forEach(function (_, n) {
      var b = document.createElement('button');
      b.className = 'dot' + (n === 0 ? ' on' : '');
      b.setAttribute('aria-label', 'Слайд ' + (n + 1));
      b.addEventListener('click', function () { go(n); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);
    // слайд считается заполненным, если в нём есть фото (src или перетащенное)
    function filled(slide) {
      var sl = slide.querySelector('image-slot');
      return !!sl && (!!sl.getAttribute('src') || sl.hasAttribute('data-filled'));
    }
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }
    function next() {
      // автопрокрутка только по заполненным слайдам — пустые кадры не показываем
      var f = slides.map(function (s, k) { return filled(s) ? k : -1; }).filter(function (k) { return k >= 0; });
      if (f.length < 2) return;
      var pos = f.indexOf(i);
      go(f[(pos + 1) % f.length]);
    }
    function reset() { clearInterval(timer); timer = setInterval(next, 5000); }
    reset();
  }

  /* ---- попапы ---- */
  function openModal(name) {
    var ov = document.getElementById('ov-' + name);
    if (!ov) return;
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }
  function closeModals() {
    document.querySelectorAll('.ov.open').forEach(function (o) { o.classList.remove('open'); });
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-modal]');
    if (open) { e.preventDefault(); openModal(open.getAttribute('data-modal')); return; }
    if (e.target.closest('[data-close]')) { closeModals(); return; }
    if (e.target.classList && e.target.classList.contains('ov')) { closeModals(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModals(); closeMenu(); }
  });

  /* ---- мобильное меню ---- */
  var menuPanel = null;
  function buildMenu() {
    var nav = document.querySelector('.hdr-nav');
    if (!nav) return;
    menuPanel = document.createElement('div');
    menuPanel.id = 'mobileMenu';
    menuPanel.style.cssText =
      'position:fixed;top:0;right:0;bottom:0;width:78%;max-width:320px;background:var(--vk-ink);' +
      'z-index:120;transform:translateX(100%);transition:transform .26s ease;padding:90px 30px 30px;' +
      'display:flex;flex-direction:column;gap:6px;box-shadow:-20px 0 60px rgba(0,0,0,.4)';
    nav.querySelectorAll('a').forEach(function (a) {
      if (a.classList.contains('archive')) return; /* раздел ещё скрыт */
      var link = document.createElement('a');
      link.textContent = a.textContent;
      link.style.cssText = 'color:#fff;font-family:var(--font-display);text-transform:uppercase;' +
        'font-size:24px;font-weight:600;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.14);cursor:pointer';
      var navId = a.getAttribute('data-nav');
      link.addEventListener('click', function () { scrollToId(navId); closeMenu(); });
      menuPanel.appendChild(link);
    });
    document.body.appendChild(menuPanel);
  }
  function openMenu() { if (menuPanel) menuPanel.style.transform = 'translateX(0)'; }
  function closeMenu() { if (menuPanel) menuPanel.style.transform = 'translateX(100%)'; }
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      if (!menuPanel) buildMenu();
      if (menuPanel.style.transform === 'translateX(0px)' || menuPanel.style.transform === 'translateX(0)') closeMenu();
      else openMenu();
    });
  }

  /* ---- форма обратной связи (AJAX через FormSubmit) ---- */
  function initFeedback() {
    var form = document.querySelector('.fb-form');
    if (!form) return;
    var btn = form.querySelector('.fb-submit');
    var status = form.querySelector('.fb-status');
    function show(msg, kind) {
      status.textContent = msg;
      status.className = 'fb-status ' + kind;
      status.hidden = false;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_honey"]').value) return; /* спам-бот */
      var endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      btn.disabled = true;
      status.hidden = true;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            show('Спасибо! Сообщение отправлено — мы ответим на указанный e-mail.', 'ok');
          } else {
            show('Не удалось отправить. Попробуйте позже или напишите на d.yegorov@gmail.com.', 'err');
          }
        })
        .catch(function () {
          show('Ошибка сети. Проверьте подключение или напишите на d.yegorov@gmail.com.', 'err');
        })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ---- init ---- */
  function init() {
    injectPower();
    initSlider();
    initFeedback();
    if (window.lucide) window.lucide.createIcons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
