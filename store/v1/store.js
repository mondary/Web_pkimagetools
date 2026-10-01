'use strict';

const root = document.documentElement;
const range = document.querySelector('#compare-range');
const comparison = document.querySelector('#comparison');
const play = document.querySelector('#play-demo');
const cursor = document.querySelector('#demo-cursor');
const art = document.querySelector('#playground-art');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let activeBackground = 'transparent';
let frame = 0;
let startedAt = 0;
let playing = false;

const copy = {
  fr: { title: 'Store 2 — ImgRalph · Le sujet. Et c’est tout.', description: 'ImgRalph : détourez, ajustez et exportez vos images en PNG transparent. Découvrez une autre façon de garder l’essentiel.', play: 'Voir le geste', pause: 'Arrêter la démo', backgrounds: { transparent: 'Fond transparent', '#e7bda5': 'Fond argile', '#c9d3bd': 'Fond sauge', '#d7d8eb': 'Fond lavande', '#292b28': 'Fond encre' } },
  en: { title: 'Store 2 — ImgRalph · The subject. Nothing else.', description: 'ImgRalph: remove backgrounds, refine edges and export transparent PNGs. Discover a simpler way to keep what matters.', play: 'Play the demo', pause: 'Stop the demo', backgrounds: { transparent: 'Transparent background', '#e7bda5': 'Clay background', '#c9d3bd': 'Sage background', '#d7d8eb': 'Lavender background', '#292b28': 'Ink background' } }
};

function updatePlayLabel() {
  const label = playing ? 'pause' : 'play';
  for (const language of ['fr', 'en']) play.querySelector(`[lang="${language}"]`).textContent = copy[language][label];
  play.querySelector('[aria-hidden]').textContent = playing ? 'Ⅱ' : '▷';
  play.setAttribute('aria-pressed', String(playing));
}

function setLanguage(language, persist = false) {
  const lang = ['fr', 'en'].includes(language) ? language : 'fr';
  root.lang = lang;
  document.title = copy[lang].title;
  document.querySelector('meta[name="description"]').content = copy[lang].description;
  document.querySelector('meta[property="og:title"]').content = copy[lang].title;
  document.querySelector('meta[property="og:description"]').content = copy[lang].description;
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === lang)));
  document.querySelectorAll('[data-label-fr]').forEach(element => element.setAttribute('aria-label', element.dataset[lang === 'fr' ? 'labelFr' : 'labelEn']));
  document.querySelectorAll('[data-alt-fr]').forEach(element => element.alt = element.dataset[lang === 'fr' ? 'altFr' : 'altEn']);
  document.querySelector('#swatch-status').textContent = copy[lang].backgrounds[activeBackground];
  document.querySelector('.feature-strip').setAttribute('aria-label', lang === 'fr' ? 'Formats et fonctionnalités' : 'Formats and features');
  document.querySelector('.navigation').setAttribute('aria-label', lang === 'fr' ? 'Navigation principale' : 'Main navigation');
  updatePlayLabel();
  if (persist) { try { localStorage.setItem('imgralph-store2-language', lang); } catch {} }
}

function setSplit(value) {
  const position = Math.max(0, Math.min(100, Number(value) || 0));
  range.value = String(position);
  comparison.style.setProperty('--split', `${position}%`);
}

function stopDemo() {
  cancelAnimationFrame(frame);
  playing = false;
  cursor.style.opacity = '0';
  updatePlayLabel();
}

// Deterministic, shared with the media capture script. No fake processing or AI inference.
function seekDemo(seconds) {
  const t = Math.max(0, Math.min(8, seconds));
  const smooth = x => { const v = Math.max(0, Math.min(1, x)); return v * v * (3 - 2 * v); };
  let split = 52;
  if (t >= 1 && t < 3.5) split = 52 + 44 * smooth((t - 1) / 2.5);
  else if (t >= 3.5 && t < 6) split = 96 - 90 * smooth((t - 3.5) / 2.5);
  else if (t >= 6) split = 6 + 46 * smooth((t - 6) / 2);
  setSplit(split);
  cursor.style.opacity = String(t < .5 ? smooth(t / .5) : t > 7.5 ? 1 - smooth((t - 7.5) / .5) : 1);
  cursor.style.transform = `translate(${comparison.clientWidth * split / 100 + 7}px, ${comparison.clientHeight * .53 + 10}px)`;
}

function setBackground(value) {
  if (!Object.hasOwn(copy.fr.backgrounds, value)) return;
  activeBackground = value;
  art.classList.toggle('checker', value === 'transparent');
  art.classList.toggle('dark', value === '#292b28');
  art.style.backgroundColor = value === 'transparent' ? '' : value;
  document.querySelectorAll('[data-background]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.background === value)));
  document.querySelector('#swatch-status').textContent = copy[root.lang].backgrounds[value];
}

document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language, true)));
range.addEventListener('input', () => { stopDemo(); setSplit(range.value); });
range.addEventListener('pointerdown', stopDemo);
range.addEventListener('keydown', stopDemo);
play.addEventListener('click', () => {
  if (playing) { stopDemo(); return; }
  if (reducedMotion.matches) { setSplit(Number(range.value) > 50 ? 6 : 96); return; }
  playing = true;
  startedAt = performance.now();
  updatePlayLabel();
  const tick = now => {
    const elapsed = (now - startedAt) / 1000;
    seekDemo(elapsed);
    if (elapsed >= 8) { stopDemo(); return; }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
});
document.querySelectorAll('[data-background]').forEach(button => button.addEventListener('click', () => setBackground(button.dataset.background)));
document.querySelector('#reset').addEventListener('click', () => { stopDemo(); setSplit(52); setBackground('transparent'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopDemo(); });
reducedMotion.addEventListener('change', () => { stopDemo(); setSplit(52); });
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stopDemo(); }).observe(comparison);

const parameters = new URLSearchParams(location.search);
if (['banner', 'card', 'video'].includes(parameters.get('export'))) root.dataset.export = parameters.get('export');
setLanguage(parameters.has('lang') ? parameters.get('lang') : root.lang);

window.store2 = Object.freeze({ seekDemo, stopDemo, setLanguage, setBackground, setSplit });
Promise.all([document.fonts.ready, ...Array.from(document.images).filter(img => img.loading !== 'lazy').map(img => img.decode().catch(() => {}))]).then(() => { root.dataset.captureReady = 'true'; });
