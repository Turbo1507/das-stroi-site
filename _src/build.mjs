// Собирает статические страницы из data.json: node _src/build.mjs [prod]
// prod — без noindex (для выкладки на das-stroi.ru)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, '_src/data.json'), 'utf8'));
const S = D.site;
const PROD = process.argv[2] === 'prod';
const V = Date.now().toString(36);

// неразрывные пробелы после коротких слов и у чисел, без точки в конце фразы
const SHORT = /(^|[\s(«])([А-Яа-яЁёA-Za-z]{1,2}|для|без|над|под|при|про|или|что|как)\s+/g;
const ty = (s) => esc(s).replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ').replace(/(\d)\s+(?=[А-Яа-яё])/g, '$1 ').replace(/\s+—\s+/g, ' — ');
const nd = (s) => s.replace(/\.\s*$/, '');
const t = (s) => ty(nd(s));
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
const enc = (f) => f.split('/').map(encodeURIComponent).join('/');

const I = {
  tg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 13 1.5 11.5c-1-.3-1-1 .2-1.5L20.6 2.8c.9-.3 1.6.2 1.3 1.5z"/></svg>',
  ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pipes: '<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 56h36v-24h40v24h36"/><rect x="34" y="50" width="12" height="20" rx="2"/><rect x="74" y="50" width="12" height="20" rx="2"/><path d="M60 32V10M52 10h16"/><path d="M4 70h112" stroke-dasharray="4 8"/></svg>',
  adv: [
    '<path d="M4 7h16M4 12h10M4 17h7"/><circle cx="18" cy="16" r="3"/>',
    '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/>',
    '<path d="M4 20V10l8-6 8 6v10z"/><path d="M10 20v-6h4v6"/>',
    '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 10h2l2-3 2 6 2-3h2"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  ]
};
const ic = (p) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

function head({ r, title, desc, url, schema }) {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${PROD ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${S.url}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${S.name}">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${S.url}${url}">
<meta property="og:image" content="${S.url}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${S.name}: ${esc(S.slogan)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${r}assets/style.css?v=${V}">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script src="${r}assets/main.js?v=${V}" defer></script>
</head>
<body>`;
}

const org = {
  '@type': 'HomeAndConstructionBusiness', '@id': S.url + '#org', name: S.name, url: S.url,
  logo: S.url + 'LogonoFields2.svg', image: S.url + 'og.jpg', telephone: S.phone.full.replace(/[^\d+]/g, ''),
  email: S.email, areaServed: 'Пермский край', address: { '@type': 'PostalAddress', addressLocality: 'Пермь', addressCountry: 'RU' },
  sameAs: [S.telegram.href, S.channel.href]
};

function header(r, home) {
  const h = home ? '' : `${r}`;
  return `<header class="hdr">
  <div class="wrap hdr-in">
    <a class="logo" href="${r || './'}" aria-label="${S.name}, на главную"><img src="${r}LogonoFields2.svg" alt="${S.name}" width="80" height="32"></a>
    <nav class="nav" aria-label="Основное меню"><a href="${h}#services">Услуги</a><a href="${h}#contacts">Контакты</a></nav>
    <div class="hdr-r">
      <a class="hdr-ph" href="${S.phone.href}">${S.phone.full}</a>
      <a class="ico hdr-tg" href="${S.telegram.href}" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram">${I.tg}</a>
      <a class="btn btn-p" href="${h}#contacts">Обсудить проект</a>
      <a class="ico burger-call burger" href="${S.phone.href}" aria-label="Позвонить ${S.phone.full}">${I.ph}</a>
      <button class="ico burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mm" data-mm-open>${I.menu}</button>
    </div>
  </div>
</header>
<div class="mm" id="mm" aria-hidden="true" inert role="dialog" aria-label="Меню">
  <div class="mm-top"><a class="logo" href="${r || './'}"><img src="${r}LogonoFields2.svg" alt="${S.name}" width="80" height="32"></a><button class="ico" type="button" aria-label="Закрыть меню" data-mm-close>${I.close}</button></div>
  <nav class="mm-list" aria-label="Меню">
    <a href="${h}#services" data-mm-close>Услуги</a>
    ${D.services.map((s) => `<a class="sub" href="${r}uslugi/${s.slug}/" data-mm-close>${esc(s.title)}</a>`).join('\n    ')}
    <a href="${h}#contacts" data-mm-close>Контакты</a>
  </nav>
  <div class="mm-foot"><a class="btn btn-p" href="${h}#contacts" data-mm-close>Обсудить проект</a><a class="btn btn-s" href="${S.phone.href}">${I.ph}${S.phone.full}</a></div>
</div>`;
}

function footer(r) {
  return `<footer class="ftr">
  <div class="wrap">
    <div class="ftr-g">
      <div><a class="logo" href="${r || './'}"><img src="${r}LogonoFields1.svg" alt="${S.name}" width="80" height="32"></a><p>${t(S.slogan)}. ${t(S.region)}</p></div>
      <div><h4>Услуги</h4><ul>${D.services.map((s) => `<li><a href="${r}uslugi/${s.slug}/">${t(s.title)}</a></li>`).join('')}</ul></div>
      <div><h4>Контакты</h4><ul>
        <li><a href="${S.phone.href}">${S.phone.full}</a></li>
        <li><a href="${S.max.href}">MAX ${S.max.text}</a></li>
        <li><a href="${S.telegram.href}" target="_blank" rel="noopener noreferrer">Telegram ${S.telegram.text}</a></li>
        <li><a href="mailto:${S.email}">${S.email}</a></li>
      </ul></div>
    </div>
    <div class="ftr-b"><span>© ${new Date().getFullYear()} ${S.name}</span><a href="${r}privacy/">Политика конфиденциальности</a></div>
  </div>
</footer>
</body>
</html>
`;
}

const photo = (r, s, cls) => s.img
  ? `<div class="${cls}"><img src="${r}img/${enc(s.img)}" alt="${esc(s.alt)}" width="1200" height="900" loading="lazy" decoding="async"></div>`
  : `<div class="${cls} draw">${I.pipes}</div>`;

const SVC_IC = {
  kotelnaya: '<path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/>',
  otoplenie: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 6v12M11 6v12M15 6v12M19 6v12M5 21h2M17 21h2"/>',
  vodosnabzhenie: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  avtomatika: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/><circle cx="12" cy="10" r="3"/><path d="M12 7V5M12 15v-2"/>',
  ventilyaciya: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7 2 0 2 3 0 5M14 12c4 0 7 1 7 4 0 2-3 2-5 0M12 14c0 4-1 7-4 7-2 0-2-3 0-5M10 12c-4 0-7-1-7-4 0-2 3-2 5 0"/>',
  'naruzhnye-seti': '<path d="M2 9h6v6h8V9h6"/><rect x="7" y="13" width="2" height="6"/><rect x="15" y="13" width="2" height="6"/><path d="M2 21h20"/>'
};
const svcIc = (s) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVC_IC[s.slug]}</svg>`;

const card = (r, s) => `<a class="card" href="${r}uslugi/${s.slug}/">
        ${photo(r, s, 'card-ph')}
        <div class="card-b"><h3 class="h3">${t(s.title)}</h3><p class="txt">${t(s.card)}</p>
          <ul class="tags">${s.items.slice(0, 2).map(([h]) => `<li>${t(h)}</li>`).join('')}<li>ещё ${s.items.length - 2}</li></ul>
          <span class="btn btn-s">Смотреть услуги</span></div>
      </a>`;

const sh = (h, lead, tag = 'h2') => `<div class="sh"><${tag} class="h2">${t(h)}</${tag}>${lead ? `<p class="lead">${t(lead)}</p>` : ''}</div>`;

const steps = (list) => `<ol class="tiles steps">${list.map((x, i) => { const [h, p] = Array.isArray(x) ? x : [x, '']; return `<li class="tile"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${t(h)}</h3>${p ? `<p class="txt">${t(p)}</p>` : ''}</li>`; }).join('')}</ol>`;

function form(r, pre) {
  const opt = (arr, sel) => arr.map((o) => `<option${o === sel ? ' selected' : ''}>${esc(o)}</option>`).join('');
  return `<form class="form" action="${r}send.php" method="post" novalidate data-form>
        <h3 class="h3">${pre ? 'Получить расчёт' : 'Оставить заявку'}</h3>
        <p class="sub">${t('Перезвоним или напишем удобным для вас способом')}</p>
        <div class="fields">
          <div class="f"><label for="f-name">Имя</label><input id="f-name" name="name" autocomplete="name" maxlength="80"></div>
          <div class="f" data-req="phone"><label for="f-phone">Телефон *</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required maxlength="24"><p class="err">Укажите номер, например +7 900 000-00-00</p></div>
          <div class="f"><label for="f-svc">Услуга</label><select id="f-svc" name="service">${pre ? '' : '<option value="">Выберите услугу</option>'}${opt(D.formServices, pre)}</select></div>
          <div class="f"><label for="f-obj">Объект</label><select id="f-obj" name="object"><option value="">Не указан</option>${opt(D.formObjects)}</select></div>
          <div class="f f-wide"><label for="f-msg">Комментарий</label><textarea id="f-msg" name="message" maxlength="2000" placeholder="${esc('Опишите задачу, если удобно')}"></textarea></div>
          <fieldset class="f f-wide"><legend class="lab">Как связаться</legend><div class="chips">
            ${['Телефон', 'MAX', 'Telegram'].map((c, i) => `<label class="chip"><input type="radio" name="channel" value="${c}"${i ? '' : ' checked'}><span>${c}</span></label>`).join('')}
          </div></fieldset>
        </div>
        <div class="hp" aria-hidden="true"><label>Сайт<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <input type="hidden" name="page"><input type="hidden" name="utm">
        <label class="agree" data-req="agree"><input type="checkbox" name="agree" value="1" required><span>Согласен на обработку персональных данных и с <a href="${r}privacy/" target="_blank">политикой конфиденциальности</a></span></label>
        <button class="btn btn-p" type="submit">Отправить заявку</button>
        <p class="status" role="status" aria-live="polite"></p>
      </form>`;
}

function ctaBlock(r, pre, title) {
  return `<section class="sec cta" id="contacts">
  <div class="wrap cta-g">
    <div>
      <h2 class="h2">${t(title)}</h2>
      <p class="lead">${t('Оставьте заявку или свяжитесь с нами напрямую')}</p>
      <div class="ct-list">
        <a class="ct-row" href="${S.phone.href}"><span class="l">Телефон</span><span class="v">${S.phone.full}</span></a>
        <a class="ct-row" href="${S.max.href}"><span class="l">MAX</span><span class="v">${S.max.text}</span></a>
        <a class="ct-row" href="${S.telegram.href}" target="_blank" rel="noopener noreferrer"><span class="l">Telegram</span><span class="v">${S.telegram.text}</span></a>
        <a class="ct-row" href="mailto:${S.email}"><span class="l">Почта</span><span class="v">${S.email}</span></a>
      </div>
    </div>
    ${form(r, pre)}
  </div>
</section>`;
}

function write(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  console.log('ok', rel);
}

// главная
{
  const r = '';
  const schema = { '@context': 'https://schema.org', '@graph': [org, { '@type': 'WebSite', name: S.name, url: S.url, inLanguage: 'ru' }] };
  write('index.html', head({ r, title: `${S.name}: инженерные системы под ключ в Перми`, desc: S.description, url: '', schema }) + header(r, true) + `
<main>
<section class="hero">
  <div class="wrap hero-g">
    <div class="hero-tx">
      <p class="eb">${t(S.region)}</p>
      <h1 class="h1">${t(S.slogan)}</h1>
      <p class="lead">${t(S.subtitle)}</p>
      <div class="hero-act"><a class="btn btn-p" href="#contacts">Обсудить проект</a><a class="btn btn-s" href="#projects">Посмотреть проекты</a></div>
    </div>
    <div class="hero-ph"><img src="img/hero2.webp" alt="Инженер ${S.name}" width="1192" height="1800" fetchpriority="high"></div>
  </div>
  <div class="wrap">
    <nav class="dirs" aria-label="Направления">
      ${D.services.map((s) => `<a href="uslugi/${s.slug}/">${svcIc(s)}<span>${t(s.short)}</span></a>`).join('\n      ')}
    </nav>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    ${sh('Направления работ', 'Каждое направление ведём от подбора оборудования до запуска и автоматики')}
    <div class="cards">
      ${D.services.map((s) => card(r, s)).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec alt" id="why">
  <div class="wrap">
    <div class="why-g">
      <div class="why-l">
        <h2 class="h2">Почему ДАС-СТРОЙ</h2>
        <p class="lead">${t(S.whyLead)}</p>
        <dl class="facts">${S.facts.map((f) => `<div><dt>${f.num}</dt><dd>${t(f.text)}</dd></div>`).join('')}</dl>
      </div>
      <div class="adv">
        ${D.advantages.map(([h, p], i) => `<div class="tile">${ic(I.adv[i])}<h3 class="h3">${t(h)}</h3><p class="txt">${t(p)}</p></div>`).join('\n        ')}
        <div class="tile tile-cta"><h3 class="h3">${t('Расскажите о вашем объекте')}</h3><a class="btn btn-w" href="#contacts">Обсудить проект</a></div>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="projects">
  <div class="wrap">
    <div class="sh sh-row">
      <div><h2 class="h2">${t('Реализованные проекты')}</h2><p class="lead">${t('Фотографии объектов и монтажа публикуем в Telegram-канале')}</p></div>
      <a class="btn btn-s" href="${S.channel.href}" target="_blank" rel="noopener noreferrer">${I.tg}Все проекты в Telegram</a>
    </div>
    <div class="gal">
      ${D.gallery.map(([f, cap, slug]) => `<a class="gal-i" href="uslugi/${slug}/"><img src="img/${enc(f)}" alt="${esc(cap)}" width="1200" height="900" decoding="async"><span>${t(cap)}</span></a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec alt" id="process">
  <div class="wrap">
    ${sh('Как проходит работа')}
    ${steps(D.process)}
  </div>
</section>

${ctaBlock(r, '', 'Обсудим инженерные задачи вашего объекта?')}
</main>
` + footer(r));
}

// страницы услуг
for (const s of D.services) {
  const r = '../../';
  const url = `uslugi/${s.slug}/`;
  const schema = { '@context': 'https://schema.org', '@graph': [org,
    { '@type': 'Service', name: s.title, description: nd(s.intro), provider: { '@id': S.url + '#org' }, areaServed: 'Пермский край', url: S.url + url },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: S.url }, { '@type': 'ListItem', position: 2, name: s.title, item: S.url + url }] }] };
  const rel = s.related.map((x) => D.services.find((y) => y.slug === x)).filter(Boolean);
  write(url + 'index.html', head({ r, title: `${s.seoTitle}: ${S.name}`, desc: nd(s.intro), url, schema }) + header(r) + `
<main>
<section class="svc-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Хлебные крошки"><a href="${r}">Главная</a><span aria-hidden="true">/</span><a href="${r}#services">Услуги</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.title)}</span></nav>
    <div class="svc-g">
      <div>
        <h1 class="h1">${t(s.title)}</h1>
        <p class="lead">${t(s.intro)}</p>
        <div class="hero-act"><a class="btn btn-p" href="#contacts">Получить расчёт</a><a class="btn btn-s" href="${S.phone.href}">${I.ph}${S.phone.full}</a></div>
      </div>
      ${s.img ? `<div class="svc-ph"><img src="${r}img/${enc(s.img)}" alt="${esc(s.alt)}" width="1200" height="900" fetchpriority="high"></div>` : `<div class="svc-ph draw">${I.pipes}</div>`}
    </div>
  </div>
</section>

<section class="sec" id="items">
  <div class="wrap">
    ${sh('Что входит в работу')}
    <div class="tiles">
      ${s.items.map(([h, p], i) => `<div class="tile"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${t(h)}</h3><p class="txt">${t(p)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec alt" id="process">
  <div class="wrap">
    ${sh(s.steps ? 'Этапы работ' : 'Как проходит работа')}
    ${steps(s.steps || D.process)}
  </div>
</section>

<section class="sec" id="related">
  <div class="wrap">
    ${sh('Смежные направления')}
    <div class="cards">
      ${rel.map((x) => card(r, x)).join('\n      ')}
    </div>
  </div>
</section>

${ctaBlock(r, s.title, 'Рассчитаем стоимость под ваш объект')}
</main>
` + footer(r));
}

// политика конфиденциальности
{
  const r = '../';
  const schema = { '@context': 'https://schema.org', '@graph': [org] };
  const P = (x) => `<p>${t(x)}</p>`;
  write('privacy/index.html', head({ r, title: `Политика конфиденциальности: ${S.name}`, desc: 'Как ДАС-СТРОЙ обрабатывает персональные данные из заявок на сайте', url: 'privacy/', schema }) + header(r) + `
<main>
<section class="sec">
  <div class="wrap doc">
    <h1 class="h2">Политика конфиденциальности</h1>
    <h2>Какие данные мы получаем</h2>
    ${P('Имя, телефон, выбранную услугу, тип объекта, комментарий и удобный способ связи, которые вы указываете в форме заявки. Также адрес страницы, с которой отправлена заявка, и метки рекламной кампании, если вы пришли по рекламе')}
    <h2>Зачем</h2>
    ${P('Чтобы связаться с вами, уточнить задачу и подготовить расчёт. Данные не используются для рассылок и не передаются третьим лицам, кроме случаев, предусмотренных законом')}
    <h2>Как храним</h2>
    ${P('Заявки приходят на почту компании и хранятся не дольше, чем нужно для работы по обращению. Доступ к ним есть только у сотрудников, которые обрабатывают заявки')}
    <h2>Ваши права</h2>
    ${P('Вы можете запросить сведения о своих данных, их исправление или удаление, а также отозвать согласие на обработку. Напишите на ' + S.email + ' или позвоните по номеру ' + S.phone.full)}
  </div>
</section>
</main>
` + footer(r));
}
