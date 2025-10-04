// src/js/modules/theme.js
const THEME_KEY = 'mi-sitio:theme';
// Si tu tema base es Scania + su dark, conviene partir en 'scania'
const DEFAULT_THEME = 'scania';

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

  // actualizar favicon + logos + íconos dependientes de tema
  updateFaviconForTheme(t);
  updateLogosForTheme(t);
  updateWhatsappFabForTheme(t);
  updateThemeToggleIcons(t);
    updateSosFabForTheme(t); 
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

// 🔗 favicon por tema
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
    'scania-dark': `${base}/assets/img/favicon-scania.svg`, // mismo svg si no tienes variante
  };

  const href = (map[theme] || map.scania) + `?v=${Date.now()}`;
  link.href = href;

  let shortcut = document.querySelector('link[rel="shortcut icon"]');
  if (!shortcut) {
    shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    document.head.appendChild(shortcut);
  }
  shortcut.href = href;
}

// 🖼️ logos por tema (logo.svg, logo-dark.svg, logo-scania.svg opcional)
function updateLogosForTheme(theme) {
  const base = getBasePrefix();
  const suffix = theme === 'propuesta' ? '-dark'
               : theme === 'scania'    ? '-scania'
               : theme === 'scania-dark' ? '-scania' // usa mismo si no hay dark dedicado
               : '';
  const url = `${base}/assets/img/logo${suffix}.svg`;
  document.querySelectorAll('img.js-logo').forEach(img => {
    img.setAttribute('src', url + `?v=${Date.now()}`);
  });

  // opcional: Open Graph
  const og = document.querySelector('meta[property="og:image"]');
  if (og) og.setAttribute('content', url);
}

// 💬 WhatsApp FAB + FloatingBar icon por tema
function updateWhatsappFabForTheme(theme) {
  const base = getBasePrefix();
  const map = {
    scania:        `${base}/assets/img/float/wspScaniaDark.svg`, // claro
    'scania-dark': `${base}/assets/img/float/wspScania.svg`,     // oscuro
  };

  ['waFloat', 'waFloatBar'].forEach(id => {
    const a = document.getElementById(id);
    if (!a) return;
    const img = a.querySelector('img');
    if (!img) return;
    img.src = `${map[theme] || map['scania']}?v=${Date.now()}`;
  });
}

// ☀️🌙 Sol/Luna por tema (imágenes)
function updateThemeToggleIcons(theme) {
  const base = getBasePrefix();
  const map = {
    scania: {
      sun:  `${base}/assets/img/float/sunDark.svg`,
      moon: `${base}/assets/img/float/moonDark.svg`,
    },
    'scania-dark': {
      sun:  `${base}/assets/img/float/sun.svg`,
      moon: `${base}/assets/img/float/moon.svg`,
    }
  };

  const cfg = map[theme] || map['scania'];

  const sunBtn  = document.getElementById('btnThemeSun');
  const moonBtn = document.getElementById('btnThemeMoon');

  if (sunBtn) {
    const img = sunBtn.querySelector('img');
    if (img) img.src = `${cfg.sun}?v=${Date.now()}`;
  }
  if (moonBtn) {
    const img = moonBtn.querySelector('img');
    if (img) img.src = `${cfg.moon}?v=${Date.now()}`;
  }
}


// 🆘 SOS FAB + FloatingBar icon por tema
function updateSosFabForTheme(theme) {
  const base = getBasePrefix();
  const map = {
    scania:        `${base}/assets/img/float/sosDark.svg`, // claro
    'scania-dark': `${base}/assets/img/float/sos.svg`,     // oscuro
  };

  ['sosFloat', 'sosFloatBar'].forEach(id => {
    const a = document.getElementById(id);
    if (!a) return;
    const img = a.querySelector('img');
    if (!img) return;
    img.src = `${map[theme] || map['scania']}?v=${Date.now()}`;
  });
}
