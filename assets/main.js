(function () {
  var html = document.documentElement;
  html.classList.add('js');

  // высота экрана в px, пересчёт только при смене ширины (иначе в Telegram дёргается)
  var lastW = 0;
  function setVh() {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    html.style.setProperty('--vh', window.innerHeight / 100 + 'px');
  }
  setVh();
  window.addEventListener('resize', setVh);

  // iOS: без пустого слушателя не показывает :active
  document.addEventListener('touchstart', function () {}, { passive: true });

  document.addEventListener('DOMContentLoaded', function () {
    var mm = document.getElementById('mm');
    var opener = document.querySelector('[data-mm-open]');
    function setMenu(open) {
      if (!mm) return;
      mm.classList.toggle('open', open);
      mm.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) mm.removeAttribute('inert'); else mm.setAttribute('inert', '');
      if (opener) opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { setTimeout(function () { var c = mm.querySelector('[data-mm-close]'); if (c) c.focus(); }, 50); } else if (opener) opener.focus({ preventScroll: true });
    }
    if (opener) opener.addEventListener('click', function () { setMenu(true); });
    document.querySelectorAll('[data-mm-close]').forEach(function (el) {
      el.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mm && mm.classList.contains('open')) setMenu(false);
    });

    document.querySelectorAll('[data-form]').forEach(initForm);
  });

  function initForm(f) {
    var phone = f.querySelector('[name=phone]');
    var phoneBox = f.querySelector('[data-req=phone]');
    var agree = f.querySelector('[name=agree]');
    var agreeBox = f.querySelector('[data-req=agree]');
    var btn = f.querySelector('button[type=submit]');
    var status = f.querySelector('.status');

    f.querySelector('[name=page]').value = location.href.split('#')[0];
    var utm = [];
    new URLSearchParams(location.search).forEach(function (v, k) { if (k.indexOf('utm_') === 0) utm.push(k + '=' + v); });
    f.querySelector('[name=utm]').value = utm.join('&');

    function digits() { return (phone.value.match(/\d/g) || []).length; }
    function phoneOk() { var n = digits(); return n >= 10 && n <= 12; }
    phone.addEventListener('input', function () { if (phoneOk()) phoneBox.classList.remove('bad'); });
    phone.addEventListener('blur', function () { if (phone.value && !phoneOk()) phoneBox.classList.add('bad'); });
    agree.addEventListener('change', function () { if (agree.checked) agreeBox.classList.remove('bad'); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      if (!phoneOk()) { phoneBox.classList.add('bad'); ok = false; }
      if (!agree.checked) { agreeBox.classList.add('bad'); ok = false; }
      status.className = 'status';
      if (!ok) { status.textContent = ''; (phoneOk() ? agree : phone).focus(); return; }

      if (/github\.io$/.test(location.hostname)) {
        status.className = 'status fail';
        status.textContent = 'Это тестовая копия сайта, заявки отсюда не отправляются';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok && d.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d && res.d.error);
          f.reset();
          status.className = 'status ok';
          status.textContent = 'Заявка отправлена. Скоро свяжемся с вами';
        })
        .catch(function (err) {
          status.className = 'status fail';
          status.textContent = (err && err.message) || 'Не удалось отправить. Позвоните нам: +7 (342) 202-75-55';
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Отправить заявку'; });
    });
  }
})();
