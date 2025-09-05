
// docs/assets/js/modules/mindmap.js
import { SERVICES } from './services.js';
import { buildWhatsAppLink } from './contact.js';


// Util: prefijo de rutas (igual criterio que usas en otros módulos)
function basePrefix() {
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
function imgUrl(filename) {
  const base = basePrefix();
  return `${base}/assets/img/services/${filename}`;
}
function fallbackImg() {
  const base = basePrefix();
  return `${base}/assets/img/services/no-image.svg`;
}

// Buscar servicio por id en tus datasets (mecánica/electrónica)
function findService(id) {
  const m = SERVICES.mecanica.find(s => s.id === id);
  if (m) return m;
  const e = SERVICES.electronica.find(s => s.id === id);
  if (e) return e;
  return null;
}

// Nodos del mapa (puedes ajustar/ordenar)
const NODES = [
  { id:'frenos',      title:'Frenos',         angle:   0 },
  { id:'suspension',  title:'Suspensión',     angle:  45 },
  { id:'mantencion',  title:'Mantención',     angle:  90 },
  { id:'ac',          title:'Aire Acond.',    angle: 135 },
  { id:'embrague',    title:'Embrague',       angle: 180 },
  { id:'motor',       title:'Motor',          angle: 225 },
  { id:'electricidad',title:'Electricidad',   angle: 270 },
  { id:'scanner',     title:'OBD / Scanner',  angle: 315 }, // también lo mostramos como nodo satélite
];

const MOBILE_ANGLES = {
  frenos:  -10,
  suspension:  35,
  mantencion:  80,
  ac:      135,
  embrague:  200,
  motor:   250,
  electricidad: 300,
  scanner:  340
};



// Inserta SVG de líneas
function drawLines(svg, center, nodes) {
  const { width, height } = svg.getBoundingClientRect();
  const cx = width / 2, cy = height / 2;   // ← centro del <svg> (x1,y1)

  nodes.forEach((n, idx) => {
    const el = document.querySelector(`.mindmap__node[data-idx="${idx}"]`);
    if (!el) return;

    const rect  = el.getBoundingClientRect();
    const srect = svg.getBoundingClientRect();

    // centro del nodo (x2,y2)
    const x = rect.left - srect.left + rect.width  / 2;
    const y = rect.top  - srect.top  + rect.height / 2;

    // aquí se crea la línea y se agrega al <svg>
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('mindmap__line');
    line.dataset.idx = String(idx);
    line.setAttribute('x1', String(cx));
    line.setAttribute('y1', String(cy));
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    svg.appendChild(line);
  });
}


// Modal accesible
function mountModal() {
  let modal = document.querySelector('.mm-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  el.style.zIndex = '2147483648';  
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
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.removeAttribute('open');
  });
  return modal;
}

function openModal(node, phone) {
  const modal = mountModal();
  const svc = findService(node.id);
  const title = svc?.title || node.title;
  const desc  = svc?.desc  || 'Servicio especializado.';
  const img   = svc?.img ? imgUrl(svc.img) : fallbackImg();

  modal.querySelector('.mm-media').setAttribute('src', img);
  modal.querySelector('.mm-media').setAttribute('alt', `${title} – AIR-Service`);
  modal.querySelector('.mm-title').textContent = title;
  modal.querySelector('.mm-desc').textContent  = desc;

  const text = encodeURIComponent(`Hola, quiero *${title}* luego de un diagnóstico con escáner.`);
  modal.querySelector('#mmWhatsapp').setAttribute('href', buildWhatsAppLink(phone, text));
  modal.setAttribute('open', '');
}

// Hover → iluminar línea
function setupHoverLines(container) {
  container.addEventListener('pointerover', (e) => {
    const node = e.target.closest('.mindmap__node');
    if (!node) return;
    const idx = node.dataset.idx;
    const line = container.querySelector(`.mindmap__line[data-idx="${idx}"]`);
    line?.classList.add('is-hover');
  });
  container.addEventListener('pointerout', (e) => {
    const node = e.target.closest('.mindmap__node');
    if (!node) return;
    const idx = node.dataset.idx;
    const line = container.querySelector(`.mindmap__line[data-idx="${idx}"]`);
    line?.classList.remove('is-hover');
  });
}

export function initMindMap(selector, { phone }) {
  const root = document.querySelector(selector);
  if (!root) return;

  // Estructura base
 root.innerHTML = `
  <svg class="mindmap__svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
  <div class="mindmap__center" role="button" tabindex="0" aria-label="Abrir diagnóstico con escáner">
    <div style="display:grid;place-items:center;gap:8px">
      <span class="mindmap__icon" aria-hidden="true">${iconSVG('scanner')}</span>
      
      </div>
      </div>`;
      // <h3>Diagnóstico</h3>

    // ➜ Centro participa en la dinámica: abre el modal del "scanner"
const center = root.querySelector('.mindmap__center');
center.addEventListener('click', () => openModal({ id:'scanner', title:'OBD / Scanner' }, phone));
center.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal({ id:'scanner', title:'OBD / Scanner' }, phone); }
});

center.addEventListener('pointerenter', () => showPortalFor(center));
center.addEventListener('pointerleave', () => hidePortal());
center.addEventListener('pointerup', () => {
  const now = Date.now();
  center._lastTap = center._lastTap || 0;
  if (now - center._lastTap > 800) {
    showPortalFor(center);
    center._lastTap = now;
  } else {
    hidePortal();
    openModal({ id:'scanner', title:'OBD / Scanner' }, phone);
  }
});
center.addEventListener('focusin',  () => showPortalFor(center));
center.addEventListener('focusout', () => hidePortal());


document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.mindmap__node') && !e.target.closest('.mindmap__center')) {
    hidePortal();
  }
}, { passive: true });

  // Crea nodos alrededor
  NODES.forEach((n, idx) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mindmap__node';
    el.dataset.idx = String(idx);
    el.style.setProperty('--a', `${n.angle}deg`);

    const svc = findService(n.id);
    const img = svc?.img ? imgUrl(svc.img) : fallbackImg();
    const desc = svc?.desc || '';

const iconName = ICON_BY_ID[n.id] || 'scanner';
el.classList.add('mindmap__node--icon');        // ⬅️ modo icon-only
el.setAttribute('aria-label', n.title);          // accesible
el.setAttribute('title', n.title);               // tooltip nativo opcional

el.innerHTML = `
  <span class="mindmap__icon">${iconSVG(iconName)}</span>
  <span class="mindmap__label" role="tooltip">${n.title}</span>
  `;
let lastTap = 0;

// Hover/focus (desktop & teclado)
el.addEventListener('pointerenter', () => showPortalFor(el));
el.addEventListener('pointerleave', () => hidePortal());
el.addEventListener('focusin',      () => showPortalFor(el));
el.addEventListener('focusout',     () => hidePortal());

// Tacto: 1º tap muestra label (portal); 2º tap (<800ms) abre modal
el.addEventListener('pointerup', () => {
  const now = Date.now();
  if (now - lastTap > 800) {
    showPortalFor(el);
    lastTap = now;
  } else {
    hidePortal();
    openModal(n, phone);
  }
});

// Accesibilidad teclado
el.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    hidePortal();
    openModal(n, phone);
  }
});


// Accesibilidad teclado (Enter/Espacio → abrir modal)
el.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openModal(n, phone);
  }
});

    el.addEventListener('click', () => openModal(n, phone));
    root.appendChild(el);
  });
  // ⇩⇩ después del NODES.forEach(...), aún dentro de initMindMap ⇩⇩
document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.mindmap__node--icon')) {
    root.querySelectorAll('.mindmap__node--icon[data-show-label="1"]')
        .forEach(n => n.removeAttribute('data-show-label'));
  }
}, { passive: true });


  // Dibuja líneas (una vez montados los nodos)
  const svg = root.querySelector('.mindmap__svg');
  // usamos un SVG que ocupa el contenedor completo; calculamos en px reales
  svg.setAttribute('viewBox', `0 0 ${root.clientWidth} ${root.clientHeight}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  drawLines(svg, root.querySelector('.mindmap__center'), NODES);

  setupHoverLines(root);

  // Recalcular líneas al redimensionar
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute('viewBox', `0 0 ${root.clientWidth} ${root.clientHeight}`);
      drawLines(svg, root.querySelector('.mindmap__center'), NODES);
    }, 120);
  });


  
}


// === Tooltip global (portal al <body>) ======================================
let MM_PORTAL = null;
let MM_ANCHOR = null; // el nodo al que está "pegado" el portal

function ensurePortal() {
  if (MM_PORTAL) return MM_PORTAL;
  const el = document.createElement('div');
  el.className = 'mm-tip';
  el.setAttribute('role', 'tooltip');
  el.style.position = 'fixed';
  el.style.zIndex = '2147483647';       // sobre TODO
  el.style.pointerEvents = 'none';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  MM_PORTAL = el;

  // Reposicionar cuando cambie el viewport/scroll
  ['scroll','resize'].forEach(evt => {
    window.addEventListener(evt, () => { if (MM_ANCHOR) positionPortal(MM_ANCHOR); }, { passive: true });
  });
  return el;
}

function positionPortal(anchorEl) {
  if (!MM_PORTAL) return;
  const r = anchorEl.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.bottom + 8; // 8px debajo del nodo
  MM_PORTAL.style.left = `${x}px`;
  MM_PORTAL.style.top  = `${y}px`;
  MM_PORTAL.style.transform = 'translate(-50%,0)';
}

function showPortalFor(anchorEl) {
  const label = anchorEl.querySelector('.mindmap__label');
  const text  = label?.textContent?.trim() || anchorEl.getAttribute('title') || anchorEl.getAttribute('aria-label') || '';
  if (!text) return;

  const tip = ensurePortal();
  tip.textContent = text;
  tip.classList.add('mm-tip--accent'); // color acento; quítalo si no lo quieres siempre
  MM_ANCHOR = anchorEl;
  positionPortal(anchorEl);
  tip.style.visibility = 'visible';
}

function hidePortal() {
  if (!MM_PORTAL) return;
  MM_PORTAL.style.visibility = 'hidden';
  MM_ANCHOR = null;
}


// ── Íconos monocromos (SVG inline, usan currentColor) ─────────────────────────
function iconSVG(name) {
  switch (name) {
    case 'scanner': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <rect x="6" y="8" width="12" height="6" rx="1"/>
        <path d="M8 16h8"/>
      </svg>`;
    case 'engine': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10h8l2-2h4v8h-4l-2 2H4z"/>
        <path d="M12 8v8"/>
      </svg>`;
    case 'gear': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/>
      </svg>`;
    case 'airbag': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="10" r="3"/>
        <path d="M12 12c3 0 5 2 6 6M6 14c1.5 3 4 5 7 5"/>
      </svg>`;
    case 'abs': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path d="M3 12a9 9 0 0 1 18 0M5 12a7 7 0 0 1 14 0"/>
      </svg>`;
    case 'oil': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10c2-2 3-4 5-6 3 3 5 5 5 8a5 5 0 0 1-10 0z"/>
        <path d="M18 5c.8 1 .8 2.5 0 3.5"/>
      </svg>`;
    case 'ac': return `
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
  <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <polyline points="13 2 4 14 11 14 9.5 22 20 8 13 8"></polyline>
  </svg>`;
    default: return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
      </svg>`;
  }
}



const ICON_BY_ID = {
  frenos:        'abs',
  suspension:    'shock',
  mantencion:    'engine',
  ac:            'ac',
  embrague:      'gear',
  motor:         'engine',
  electricidad:  'electric',
  scanner:       'scanner'
};
