// docs/assets/js/modules/mindmap.js
import { SERVICES } from './services.js';
import { buildWhatsAppLink } from './contact.js';

function basePrefix() {
  const hinted = document.getElementById('site-base')?.getAttribute('data-base') || '';
  const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(location.hostname);
  if (isLocal) return /\/pages\//.test(location.pathname) ? '..' : '.';
  if (hinted) return hinted.replace(/\/+$/, '');
  if (location.hostname.endsWith('github.io')) {
    const seg = location.pathname.split('/').filter(Boolean)[0];
    return seg ? '/' + seg : '';
  }
  return '';
}
function imgUrl(filename) {
  const base = basePrefix();
  return `${base}/assets/img/services/${filename}`;
}
function fallbackImg() {
  const base = basePrefix();
  return `${base}/assets/img/services/no-image.svg`;
}

function findService(id) {
  const m = SERVICES.mecanica.find(s => s.id === id);
  if (m) return m;
  const e = SERVICES.electronica.find(s => s.id === id);
  if (e) return e;
  return null;
}

function mountModal() {
  let modal = document.querySelector('.mm-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.className = 'mm-modal';
  modal.innerHTML = `
    <div class="mm-backdrop" data-close></div>
    <div class="mm-dialog" role="dialog" aria-modal="true" aria-labelledby="mmTitle">
      <img class="mm-media" alt="" />
      <div class="mm-body">
        <h3 class="mm-title" id="mmTitle"></h3>
        <p class="mm-desc"></p>
        <div class="mm-actions">
          <a class="btn btn--wa" target="_blank" rel="noopener" id="mmWhatsapp">Pedir este servicio</a>
          <a class="btn btn--ghost" href="../pages/servicios.html" id="mmVerMas">Ver más</a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target && (e.target.matches('[data-close]') || e.target.closest('[data-close]'))) {
      modal.removeAttribute('open');
      document.documentElement.classList.remove('mm-open');
      hidePortal();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.removeAttribute('open');
      document.documentElement.classList.remove('mm-open');
      hidePortal();
    }
  });
  return modal;
}

function openModal(node, phone) {
  const modal = mountModal();
  const svc = findService(node.id);
  const title = svc?.title || node.title;
  const desc = svc?.desc || 'Servicio especializado.';
  const img = svc?.img ? imgUrl(svc.img) : fallbackImg();

  modal.querySelector('.mm-media').setAttribute('src', img);
  modal.querySelector('.mm-media').setAttribute('alt', `${title} – AIR-Service`);
  modal.querySelector('.mm-title').textContent = title;
  modal.querySelector('.mm-desc').textContent = desc;

  const text = encodeURIComponent(`Hola, quiero *${title}* luego de un diagnóstico con escáner.`);
  modal.querySelector('#mmWhatsapp').setAttribute('href', buildWhatsAppLink(phone, text));
  document.documentElement.classList.add('mm-open');
  hidePortal();
  modal.setAttribute('open', '');
}

export function initMindMap(selector, { phone }) {
  const root = document.querySelector(selector);
  if (!root) return;

  const NODES = [
    { id: 'frenos',        title: 'Frenos' },
    { id: 'suspension',    title: 'Suspensión' },
    { id: 'lights',        title: 'Luces' },
    { id: 'ac',            title: 'Aire Acond.' },
    { id: 'embrague',      title: 'Embrague' },
    { id: 'motor',         title: 'Motor' },
    { id: 'electricidad',  title: 'Batería' },
    { id: 'scanner',       title: 'OBD / Scanner' }
  ];
  const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]));
  const GRID_ORDER = [
    'motor', 'electricidad', 'scanner',
    'embrague', 'CENTER', 'frenos',
    'ac', 'lights', 'suspension'
  ];

  // ⬇️ Estructura base: SVG + grilla
  root.innerHTML = `
    <svg class="mindmap__svg"></svg>
    <div class="mindmap-grid"></div>
  `;

  const svg = root.querySelector('.mindmap__svg');
  const grid = root.querySelector('.mindmap-grid');

  let center = null;

  // Renderizar grilla
  GRID_ORDER.forEach(key => {
    if (key === 'CENTER') {
      center = document.createElement('button');
      center.type = 'button';
      center.className = 'mindmap__center';
      center.setAttribute('role', 'button');
      center.setAttribute('tabindex', '0');
      center.setAttribute('aria-label', 'Abrir diagnóstico con escáner');
      center.innerHTML = `
        <span class="mindmap__icon mindmap__icon--scanner">
          ${iconSVG('scanner')}
          <span class="mindmap__text">Abrir diagnóstico con escáner</span>
        </span>`;
      center.addEventListener('click', () =>
        openModal({ id: 'scanner', title: 'OBD / Scanner' }, phone)
      );
      center.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal({ id: 'scanner', title: 'OBD / Scanner' }, phone);
        }
      });
      grid.appendChild(center);
      return;
    }

    const id = key;
    const data = findService(id) || NODE_BY_ID[id] || { title: id };
    const title = data.title || id;
    const iconName = ICON_BY_ID[id] || 'scanner';

    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mindmap__node mindmap__node--icon';
    el.dataset.id = id;
    el.setAttribute('aria-label', title);
    el.setAttribute('title', title);
    el.innerHTML = `
      <span class="mindmap__icon mindmap__icon--${iconName}">
        ${iconSVG(iconName)}
        <span class="mindmap__text">${title}</span>
      </span>`;

    el.addEventListener('click', () => openModal({ id, title }, phone));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal({ id, title }, phone);
      }
    });

    grid.appendChild(el);
  });

  // ⬇️ Función para dibujar líneas desde el centro hacia cada nodo
  function drawLines(svg, center, nodes) {
    if (!center || !nodes.length) return;

    const svgRect = svg.getBoundingClientRect();
    const cRect = center.getBoundingClientRect();
    const cX = cRect.left + cRect.width / 2 - svgRect.left;
    const cY = cRect.top + cRect.height / 2 - svgRect.top;

    nodes.forEach(node => {
      const nRect = node.getBoundingClientRect();
      const nX = nRect.left + nRect.width / 2 - svgRect.left;
      const nY = nRect.top + nRect.height / 2 - svgRect.top;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.classList.add("mindmap__line");
      line.setAttribute("x1", cX);
      line.setAttribute("y1", cY);
      line.setAttribute("x2", nX);
      line.setAttribute("y2", nY);

      svg.appendChild(line);
    });
  }

  // ⬇️ Refrescar líneas
  function refreshLines() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', `0 0 ${root.clientWidth} ${root.clientHeight}`);
    drawLines(svg, center, root.querySelectorAll('.mindmap__node--icon'));
  }

  refreshLines();

  // ⬇️ Redibujar al redimensionar
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(refreshLines, 120);
  });

  // Cerrar tooltip global si haces click fuera
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.mindmap__node') && !e.target.closest('.mindmap__center')) {
      hidePortal();
    }
  }, { passive: true });
}


let MM_PORTAL = null;
let MM_HIDE_TIMER = null;

function ensurePortal() {
  if (MM_PORTAL) return MM_PORTAL;
  const el = document.createElement('div');
  el.className = 'mm-tip';
  el.setAttribute('role', 'tooltip');
  el.style.position = 'fixed';
  el.style.zIndex = '900';
  el.style.pointerEvents = 'none';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  MM_PORTAL = el;
  window.addEventListener('scroll', hidePortal, { passive: true });
  window.addEventListener('resize', hidePortal, { passive: true });
  window.addEventListener('blur', hidePortal, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hidePortal();
  });
  return el;
}

function hidePortal() {
  clearTimeout(MM_HIDE_TIMER);
  MM_HIDE_TIMER = null;
  if (!MM_PORTAL) return;
  MM_PORTAL.style.visibility = 'hidden';
}

function iconSVG(name) {
  switch (name) {
    case 'scanner': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <rect x="6" y="8" width="12" height="6" rx="1"/>
        <path d="M8 16h8"/>
      </svg>`;
    case 'engine': return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 990" x="0" y="0">
        <g transform="translate(200, 70) scale(2.0)">
          <g transform="translate(-220,560) scale(0.18,-0.18)">
            <path fill="currentColor" d="M1430 3830 l0 -140 263 -2 262 -3 3 -102 3 -103 -48 -1 c-26 -1 -181 -5 -343 -8 l-295 -6 -6 -185 c-4 -102 -7 -186 -8 -187 0 -2 -129 -3 -286 -3 l-285 0 0 -475 0 -475 -130 0 -130 0 -2 328 -3 327 -142 3 -143 3 0 -791 0 -790 144 0 143 0 5 320 c3 176 7 322 9 324 2 2 59 6 127 10 l122 7 0 -475 0 -476 324 0 324 0 43 -54 c24 -30 52 -67 61 -82 10 -16 56 -81 103 -144 48 -63 102 -137 121 -165 19 -27 67 -95 108 -150 l73 -100 374 -6 c206 -3 746 -7 1201 -8 l827 -1 11 43 c6 23 28 103 50 177 21 74 48 171 61 215 12 44 32 114 44 155 l23 75 76 3 77 3 39 -86 c22 -47 46 -105 54 -128 8 -23 27 -71 44 -107 16 -36 32 -77 35 -92 4 -15 20 -55 36 -90 15 -35 33 -78 39 -96 7 -17 17 -46 23 -62 l11 -30 424 0 424 0 0 1474 0 1474 -412 4 c-282 3 -417 1 -424 -6 -7 -6 -21 -36 -32 -66 -12 -30 -51 -127 -87 -215 -37 -88 -73 -178 -81 -200 -8 -22 -31 -79 -51 -127 l-36 -88 -79 0 c-54 0 -80 4 -82 13 -36 116 -164 562 -176 615 l-11 42 -209 0 -210 0 0 180 0 180 -340 0 -341 0 3 103 3 102 268 3 267 2 0 140 0 140 -1130 0 -1130 0 0 -140z m2119 -656 c2 -2 7 -77 10 -166 l6 -163 235 -5 234 -5 37 -125 c87 -299 113 -389 131 -460 10 -41 24 -78 31 -82 15 -10 538 -10 552 0 12 8 32 54 68 152 14 36 33 85 44 110 24 54 68 163 99 245 12 33 36 91 53 128 l31 69 172 -7 c95 -4 175 -10 178 -12 2 -2 6 -539 8 -1194 l4 -1189 -181 0 -181 0 -40 86 c-22 48 -40 91 -40 95 0 5 -17 51 -38 102 -45 108 -110 267 -142 352 -13 33 -28 63 -32 66 -12 8 -544 8 -557 0 -5 -4 -23 -56 -39 -116 -47 -176 -110 -394 -134 -470 l-23 -70 -1019 0 -1018 0 -30 35 c-16 19 -45 58 -64 85 -19 28 -47 66 -62 86 -36 49 -139 188 -182 249 -19 26 -66 90 -103 142 l-68 93 -257 5 -257 5 -3 793 c-2 630 0 792 10 793 7 0 119 0 248 -1 129 -1 254 2 278 6 l42 7 0 190 0 190 997 -7 c549 -4 1000 -9 1002 -12z"/>
          </g>
        </g>
      </svg>`;
    case 'lights': return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" role="img" aria-label="High Beam Headlights">
        <g fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="8"  x2="24" y2="8"/>
          <line x1="4" y1="16" x2="24" y2="16"/>
          <line x1="4" y1="24" x2="24" y2="24"/>
          <line x1="4" y1="32" x2="24" y2="32"/>
          <path d="M24 4 h12 a16 16 0 0 1 0 32 h-12 z"/>
        </g>
      </svg>`;
    case 'gear': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/>
      </svg>`;
    case 'ac': return `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="128.000000pt" height="128.000000pt" viewBox="0 0 128.000000 128.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.16, written by Peter Selinger 2001-2019
</metadata>
<g transform="translate(0.000000,128.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M322 1161 c-190 -65 -246 -327 -101 -469 62 -61 103 -77 204 -77 103
0 144 16 207 82 55 56 78 115 78 198 0 202 -192 334 -388 266z"/>
<path d="M853 1115 c-78 -34 -97 -146 -34 -208 28 -28 38 -32 87 -32 51 0 58
3 90 37 29 32 34 45 34 87 0 57 -25 96 -76 117 -41 17 -60 17 -101 -1z"/>
<path d="M1095 928 c-33 -23 -75 -52 -93 -65 l-32 -24 23 -32 c13 -18 27 -40
31 -51 3 -10 12 -16 19 -13 21 8 187 118 187 124 0 5 -70 103 -73 103 -1 0
-29 -19 -62 -42z"/>
<path d="M810 812 c-28 -13 -43 -34 -77 -102 l-42 -85 56 -152 c31 -84 59
-153 62 -153 3 1 44 80 91 177 90 189 99 227 66 279 -18 26 -71 54 -103 54
-10 0 -34 -8 -53 -18z"/>
<path d="M587 569 c-35 -22 -47 -34 -42 -47 3 -9 40 -111 83 -227 l79 -210 66
-3 c37 -2 67 1 67 5 0 18 -189 508 -197 510 -4 1 -30 -11 -56 -28z"/>
<path d="M273 545 c-11 -8 -61 -83 -111 -167 -110 -188 -112 -192 -112 -218 0
-27 52 -80 79 -80 48 0 71 24 147 152 43 72 82 132 88 134 6 2 54 -9 106 -26
52 -16 95 -28 96 -27 1 1 -15 47 -35 102 l-38 100 -69 22 c-82 26 -122 28
-151 8z"/>
</g>
</svg>
`;
    case 'abs': return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Brake Warning Light">
        <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="32" r="16"/>
          <path d="M12 18 A24 24 0 0 0 12 46"/>
          <path d="M52 18 A24 24 0 0 1 52 46"/>
        </g>
        <line x1="32" y1="23" x2="32" y2="34" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <circle cx="32" cy="41" r="1.8" fill="currentColor"/>
      </svg>`;
    case 'oil': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10c2-2 3-4 5-6 3 3 5 5 5 8a5 5 0 0 1-10 0z"/>
        <path d="M18 5c.8 1 .8 2.5 0 3.5"/>
      </svg>`;
    case 'airbag': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v20M4 6l16 12M4 18L20 6"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
    case 'shock': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 7l12 10M8 5l2 2M14 17l2 2"/>
        <rect x="4" y="4" width="6" height="4" rx="1"/>
        <rect x="14" y="16" width="6" height="4" rx="1"/>
      </svg>`;
    case 'electric': return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" role="img" aria-label="Battery Warning Light">
        <g fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">
          <rect x="8" y="12" width="48" height="28" rx="2" ry="2"/>
          <rect x="16" y="4" width="8" height="8" fill="currentColor" stroke="none"/>
          <rect x="40" y="4" width="8" height="8" fill="currentColor" stroke="none"/>
        </g>
        <line x1="20" y1="24" x2="28" y2="24" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <g stroke="currentColor" stroke-width="4" stroke-linecap="round">
          <line x1="40" y1="24" x2="48" y2="24"/>
          <line x1="44" y1="20" x2="44" y2="28"/>
        </g>
      </svg>`;
    default: return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
      </svg>`;
  }
}

const ICON_BY_ID = {
  frenos: 'abs',
  suspension: 'shock',
  lights: 'lights',
  ac: 'ac',
  embrague: 'gear',
  motor: 'engine',
  electricidad: 'electric',
  scanner: 'scanner'
};
