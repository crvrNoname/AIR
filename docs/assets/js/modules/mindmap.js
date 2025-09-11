
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
  { id:'lights',  title:'Luces',     angle:  90 },
  { id:'ac',          title:'Aire Acond.',    angle: 135 },
  { id:'embrague',    title:'Embrague',       angle: 180 },
  { id:'motor',       title:'Motor',          angle: 225 },
  { id:'electricidad',title:'Bateria',   angle: 270 },
  { id:'scanner',     title:'OBD / Scanner',  angle: 315 }, // también lo mostramos como nodo satélite
];

const MOBILE_ANGLES = {
  frenos:  -10,
  suspension:  35,
  lights:  80,
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
}});
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
  document.documentElement.classList.add('mm-open');
hidePortal(); // por si hubiera uno visible
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
      <span class="mindmap__icon" aria-hidden="true">
        ${iconSVG('scanner')}
        <span class="mindmap__text">Abrir diagnóstico con escáner</span>
      </span>
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

// el.setAttribute('data-service', iconName);
el.innerHTML = `
  <span class="mindmap__icon mindmap__icon--${iconName}">${iconSVG(iconName)}
  <span class="mindmap__text" >${n.title}</span>
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
// Si el puntero sale del contenedor, oculta el tooltip (desktop)
root.addEventListener('pointerleave', hidePortal);
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
// let MM_PORTAL = null;
// let MM_ANCHOR = null; // el nodo al que está "pegado" el portal
// let MM_HIDE_TIMER = null;

// function ensurePortal() {
//   if (MM_PORTAL) return MM_PORTAL;
//   const el = document.createElement('div');
//   el.className = 'mm-tip';
//   el.setAttribute('role', 'tooltip');
//   el.style.position = 'fixed';
//   el.style.zIndex = '900';           // 👈 debajo del modal
//   el.style.pointerEvents = 'none';
//   el.style.visibility = 'hidden';
//   document.body.appendChild(el);
//   MM_PORTAL = el;

//   // En móvil/desktop: si scrolleas o cambia la pestaña → ocultar
//   window.addEventListener('scroll', hidePortal, { passive: true });
//   window.addEventListener('resize', hidePortal, { passive: true });
//   window.addEventListener('blur', hidePortal,   { passive: true });
//   document.addEventListener('visibilitychange', () => {
//     if (document.hidden) hidePortal();
//   });

//   return el;
// }

// function positionPortal(anchorEl) {
//   if (!MM_PORTAL) return;
//   const r = anchorEl.getBoundingClientRect();
//   const x = r.left + r.width / 2;
//   const y = r.bottom + 8; // 8px debajo del nodo
//   MM_PORTAL.style.left = `${x}px`;
//   MM_PORTAL.style.top  = `${y}px`;
//   MM_PORTAL.style.transform = 'translate(-50%,0)';
// }

// function showPortalFor(anchorEl) {
//   // Si hay modal abierto, nunca mostramos el tooltip
//   if (document.documentElement.classList.contains('mm-open')) return;

//   const label = anchorEl.querySelector('.mindmap__label');
//   const text  = label?.textContent?.trim()
//              || anchorEl.getAttribute('title')
//              || anchorEl.getAttribute('aria-label')
//              || '';
//   if (!text) return;

//   const tip = ensurePortal();
//   tip.textContent = text;
//   tip.classList.add('mm-tip--accent');

//   MM_ANCHOR = anchorEl;
//   positionPortal(anchorEl);
//   tip.style.visibility = 'visible';

//   // Auto-ocultar en pantallas táctiles
//   clearTimeout(MM_HIDE_TIMER);
//   if (matchMedia('(pointer: coarse)').matches) {
//     MM_HIDE_TIMER = setTimeout(hidePortal, 1500);
//   }
// }

// function hidePortal() {
//   clearTimeout(MM_HIDE_TIMER);
//   MM_HIDE_TIMER = null;
//   if (!MM_PORTAL) return;
//   MM_PORTAL.style.visibility = 'hidden';
//   MM_ANCHOR = null;
// }

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
     <!-- docs/assets/img/logo.svg --> <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 1600 990" style="enable-background:new 0 0 4455 990"  x="0" y="0"> <!-- Bloque turquesa (40x28) -->  <!-- Motor: centrado con padding (W ≈ 34px dentro de 40px) --> <!-- s = 34/586 ≈ 0.05802 ; dx = (40-34)/2 = 3 ; dy = 6 + (28 - 426*s)/2 ≈ 7.64 --> <g transform="translate(200, 70) scale(2.0)"> <!-- invertir eje Y del path original --> <g transform="translate(-220,560) scale(0.18,-0.18)"> <path fill="currentColor" d="M1430 3830 l0 -140 263 -2 262 -3 3 -102 3 -103 -48 -1 c-26 -1 -181 -5 -343 -8 l-295 -6 -6 -185 c-4 -102 -7 -186 -8 -187 0 -2 -129 -3 -286 -3 l-285 0 0 -475 0 -475 -130 0 -130 0 -2 328 -3 327 -142 3 -143 3 0 -791 0 -790 144 0 143 0 5 320 c3 176 7 322 9 324 2 2 59 6 127 10 l122 7 0 -475 0 -476 324 0 324 0 43 -54 c24 -30 52 -67 61 -82 10 -16 56 -81 103 -144 48 -63 102 -137 121 -165 19 -27 67 -95 108 -150 l73 -100 374 -6 c206 -3 746 -7 1201 -8 l827 -1 11 43 c6 23 28 103 50 177 21 74 48 171 61 215 12 44 32 114 44 155 l23 75 76 3 77 3 39 -86 c22 -47 46 -105 54 -128 8 -23 27 -71 44 -107 16 -36 32 -77 35 -92 4 -15 20 -55 36 -90 15 -35 33 -78 39 -96 7 -17 17 -46 23 -62 l11 -30 424 0 424 0 0 1474 0 1474 -412 4 c-282 3 -417 1 -424 -6 -7 -6 -21 -36 -32 -66 -12 -30 -51 -127 -87 -215 -37 -88 -73 -178 -81 -200 -8 -22 -31 -79 -51 -127 l-36 -88 -79 0 c-54 0 -80 4 -82 13 -36 116 -164 562 -176 615 l-11 42 -209 0 -210 0 0 180 0 180 -340 0 -341 0 3 103 3 102 268 3 267 2 0 140 0 140 -1130 0 -1130 0 0 -140z m2119 -656 c2 -2 7 -77 10 -166 l6 -163 235 -5 234 -5 37 -125 c87 -299 113 -389 131 -460 10 -41 24 -78 31 -82 15 -10 538 -10 552 0 12 8 32 54 68 152 14 36 33 85 44 110 24 54 68 163 99 245 12 33 36 91 53 128 l31 69 172 -7 c95 -4 175 -10 178 -12 2 -2 6 -539 8 -1194 l4 -1189 -181 0 -181 0 -40 86 c-22 48 -40 91 -40 95 0 5 -17 51 -38 102 -45 108 -110 267 -142 352 -13 33 -28 63 -32 66 -12 8 -544 8 -557 0 -5 -4 -23 -56 -39 -116 -47 -176 -110 -394 -134 -470 l-23 -70 -1019 0 -1018 0 -30 35 c-16 19 -45 58 -64 85 -19 28 -47 66 -62 86 -36 49 -139 188 -182 249 -19 26 -66 90 -103 142 l-68 93 -257 5 -257 5 -3 793 c-2 630 0 792 10 793 7 0 119 0 248 -1 129 -1 254 2 278 6 l42 7 0 190 0 190 997 -7 c549 -4 1000 -9 1002 -12z"/> </g> </g> 
</svg>
`;
    case 'lights': return `
     <!-- high-beam-warning-faithful.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" role="img" aria-label="High Beam Headlights">
  <g fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <!-- Líneas de luz (4) -->
    <line x1="4" y1="8"  x2="24" y2="8"/>
    <line x1="4" y1="16" x2="24" y2="16"/>
    <line x1="4" y1="24" x2="24" y2="24"/>
    <line x1="4" y1="32" x2="24" y2="32"/>
    <!-- Faro tipo "D" -->
    <path d="M24 4 
             h12 
             a16 16 0 0 1 0 32 
             h-12 
             z"/>
  </g>
</svg>
`;
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
  <!-- brake-warning.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Brake Warning Light">
  <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <!-- Círculo central -->
    <circle cx="32" cy="32" r="16"/>
    <!-- Arcos laterales -->
    <path d="M12 18 A24 24 0 0 0 12 46"/>
    <path d="M52 18 A24 24 0 0 1 52 46"/>
  </g>
  <!-- Signo de exclamación -->
  <line x1="32" y1="23" x2="32" y2="34" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <circle cx="32" cy="41" r="1.8" fill="currentColor"/>
</svg>
`;
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
  <!-- battery-warning.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" role="img" aria-label="Battery Warning Light">
  <g fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">
    <!-- Caja batería -->
    <rect x="8" y="12" width="48" height="28" rx="2" ry="2"/>
    <!-- Bornes -->
    <rect x="16" y="4" width="8" height="8" fill="currentColor" stroke="none"/>
    <rect x="40" y="4" width="8" height="8" fill="currentColor" stroke="none"/>
  </g>

  <!-- Símbolos + y - -->
  <line x1="20" y1="24" x2="28" y2="24" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <g stroke="currentColor" stroke-width="4" stroke-linecap="round">
    <line x1="40" y1="24" x2="48" y2="24"/>
    <line x1="44" y1="20" x2="44" y2="28"/>
  </g>
</svg>
`;
    default: return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
      </svg>`;
  }
}



const ICON_BY_ID = {
  frenos:        'abs',
  suspension:    'shock',
  lights:    'lights',
  ac:            'ac',
  embrague:      'gear',
  motor:         'engine',
  electricidad:  'electric',
  scanner:       'scanner'
};
