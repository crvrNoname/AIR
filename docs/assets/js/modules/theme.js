// src/js/modules/theme.js
const THEME_KEY = 'mi-sitio:theme';
const DEFAULT_THEME = 'actual';

// Prefijo correcto (local: relativo . / .. ; Pages: /REPO)
function getBasePrefix() {
  const hinted = document.getElementById('site-base')?.getAttribute('data-base') || '';
  const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(location.hostname);
  if (isLocal) return /\/pages\//.test(location.pathname) ? '..' : '.';
  if (hinted)  return hinted.replace(/\/+$/, '');
  if (location.hostname.endsWith('github.io')) {
    const seg = location.pathname.split('/').filter(Boolean)[0];
    return seg ? '/' + seg : '';
  }
  return '';
}

// 🧩 setea logo base si no hay src (para evitar ícono roto inicial en /pages/)
function ensureBaseLogos() {
  const base = getBasePrefix();
  const url = `${base}/assets/img/logo.svg`;
  document.querySelectorAll('img.js-logo').forEach(img => {
    if (!img.getAttribute('src')) img.setAttribute('src', url);
  });
}

export function applyTheme(theme) {
  const t = theme || DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch {}

  // marcar botón activo
  document.querySelectorAll('.js-theme').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.theme === t ? 'true' : 'false');
  });

  // meta theme-color (móviles)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#000';
    meta.setAttribute('content', bg);
  }

  // actualizar favicon + logos + whatsapp FAB icon
  updateFaviconForTheme(t);
  updateLogosForTheme(t);
  updateWhatsappFabForTheme(t);
}

export function initThemeSwitcher() {
  // Logo base primero (por si estás en /pages/ y no pusiste src)
  ensureBaseLogos();

  let saved = DEFAULT_THEME;
  try { saved = localStorage.getItem(THEME_KEY) || DEFAULT_THEME; } catch {}
  applyTheme(saved);

  document.querySelectorAll('.js-theme').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyTheme(btn.dataset.theme); }
    });
  });
}

// 🔗 favicon por tema (usa mismo prefijo que CSS/JS)
function updateFaviconForTheme(theme) {
  let link = document.querySelector('link[rel="icon"][type="image/svg+xml"]')
           || document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel  = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }

  const base = getBasePrefix();
  const map = {
    actual:    `${base}/assets/img/favicon.svg`,
    propuesta: `${base}/assets/img/favicon-dark.svg`,
    scania:    `${base}/assets/img/favicon-scania.svg`,
  };

  const href = (map[theme] || map.actual) + `?v=${Date.now()}`; // cache-busting
  link.href = href;

  let shortcut = document.querySelector('link[rel="shortcut icon"]');
  if (!shortcut) {
    shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    document.head.appendChild(shortcut);
  }
  shortcut.href = href;
}

// 🖼️ logos por tema (nombres: logo.svg, logo-dark.svg, logo-scania.svg)
function updateLogosForTheme(theme) {
  const base = getBasePrefix();
  const suffix = theme === 'propuesta' ? '-dark'
               : theme === 'scania'    ? '-scania'
               : '';
  const url = `${base}/assets/img/logo${suffix}.svg`;
  document.querySelectorAll('img.js-logo').forEach(img => {
    // conserva dimensiones; solo cambia src (con cache-busting opcional)
    img.setAttribute('src', url + `?v=${Date.now()}`);
  });

  // opcional: actualiza también la imagen Open Graph
  const og = document.querySelector('meta[property="og:image"]');
  if (og) og.setAttribute('content', url);
}

// 💬 WhatsApp FAB icon por tema
// Archivos esperados en docs/assets/img/float/:
//  - wsp-svgZip.svg        (actual)
//  - wsp-svgZipDark.svg    (propuesta)
//  - wsp-svgZipScania.svg  (scania)
function updateWhatsappFabForTheme(theme) {
  const base = getBasePrefix();
  const suffix = theme === 'propuesta' ? 'Dark'
               : theme === 'scania'    ? 'Scania'
               : '';
  const a = document.getElementById('waFloat');
  if (!a) return;

  const img = a.querySelector('img');
  if (!img) return;

  img.src = `${base}/assets/img/float/wsp-svgZip${suffix}.svg?v=${Date.now()}`;
}
