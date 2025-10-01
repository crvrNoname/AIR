// src/js/modules/mindmap.js
import { SERVICES } from './services.js';
import { buildWhatsAppLink } from './contact.js';
import { AUTODIAG } from './autodiagnosticos.js';

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
          <a class="btn btn--ghost" href="../pages/cotiza.html" id="mmVerMas">Ver más</a>
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
  const desc  = svc?.desc  || 'Servicio especializado.';

  const imgs = Array.isArray(svc?.img) ? svc.img : [svc?.img];
  const fallback = fallbackImg();

  // Generamos grupo si hay más de 1 imagen
  // Generamos grupo si hay más de 1 imagen
const mediaHTML = imgs.length > 1
  ? `
    <div class="mm-media-group">
      <button class="mm-prev" aria-label="Anterior">‹</button>
      <div class="mm-media-track">
        ${imgs.map(src => `
          <img 
            class="mm-media"
            src="${imgUrl(src)}"
            alt="${title} – AIR-Service"
            onerror="this.onerror=null;this.src='${fallback}'"
          />`).join('')}
      </div>
      <button class="mm-next" aria-label="Siguiente">›</button>
    </div>
  `
  : `
    <img 
      class="mm-media"
      src="${imgUrl(imgs[0])}"
      alt="${title} – AIR-Service"
      onerror="this.onerror=null;this.src='${fallback}'"
    />
  `;


  modal.querySelector('.mm-dialog').innerHTML = `
    ${mediaHTML}
    <div class="mm-body">
      <h3 class="mm-title" id="mmTitle">${title}</h3>
      <p class="mm-desc">${desc}</p>
      <div class="mm-actions">
  <a class="btn btn--wa" target="_blank" rel="noopener" id="mmWhatsapp">
    Pedir este servicio
  </a>
  <button class="btn btn--secondary is-hidden" id="mmSendDiag">
    Enviar por WhatsApp
  </button>
  <button class="btn btn--ghost" id="mmToggleDiag">
    Autodiagnóstico
  </button>
</div>



    </div>
  `;

  const text = encodeURIComponent(`Hola, quiero *${title}* luego de un diagnóstico con escáner.`);
  modal.querySelector('#mmWhatsapp').setAttribute('href', buildWhatsAppLink(phone, text));
const autodiagBtn = modal.querySelector('#mmToggleDiag');
const sendDiagBtn = modal.querySelector('#mmSendDiag');

if (autodiagBtn) {
  autodiagBtn.addEventListener('click', () => {
    const dialog = modal.querySelector('.mm-dialog');
    const body   = modal.querySelector('.mm-body');
    let diag     = body.querySelector('.mm-autodiag');
    const media  = dialog.querySelector('.mm-media, .mm-media-group');
    const title  = body.querySelector('.mm-title');
    const desc   = body.querySelector('.mm-desc');

 // crear autodiagnóstico si no existe
if (!diag) {
  const diagHTML = renderAutodiag(node.id);
  body.querySelector('.mm-actions').insertAdjacentHTML('beforebegin', diagHTML);
  diag = body.querySelector('.mm-autodiag');

  if (!diag) {
    console.error("❌ No se pudo crear el autodiagnóstico. node.id =", node.id);
    return; // salimos para no romper
  }
}

// toggle
const showingDiag = diag.classList.toggle('is-visible');
if (showingDiag) {
  media?.classList.add('is-hidden');
  title?.classList.add('is-hidden');
  desc?.classList.add('is-hidden');
  diag.style.display = 'block';
  autodiagBtn.textContent = 'Cerrar';
  sendDiagBtn?.classList.remove('is-hidden'); // mostrar botón
} else {
  media?.classList.remove('is-hidden');
  title?.classList.remove('is-hidden');
  desc?.classList.remove('is-hidden');
  diag.style.display = 'none';
  autodiagBtn.textContent = 'Autodiagnóstico';
  sendDiagBtn?.classList.add('is-hidden'); // ocultar botón
}

  });
}



  if (imgs.length > 1) {
  enableCarousel(modal.querySelector('.mm-media-group'));
}

// Botón Enviar por WhatsApp (Autodiagnóstico)
const btnSendDiag = modal.querySelector('#mmSendDiag');
if (btnSendDiag) {
  btnSendDiag.addEventListener('click', () => {
    const text = encodeURIComponent(getCheckedAutodiag(modal, title));
    const link = buildWhatsAppLink(phone, text);
    window.open(link, '_blank');
  });
}

  modal.setAttribute('open', '');



}   
function renderAutodiag(id) {
  const diag = AUTODIAG[id];
  if (!diag) {
    console.warn("⚠️ No hay autodiagnóstico definido para:", id);
    return '<p>No hay autodiagnóstico disponible.</p>';
  }

  const renderChecklist = (items, id) => `
    <ul class="mm-checklist">
      ${items.map((item, i) => {
        // Caso 1: string simple → checkbox
        if (typeof item === "string") {
          return `
            <li>
              <label>
                <input type="checkbox" class="mm-check" data-tipo="check" id="${id}-c${i}" />
                <span>${item}</span>
              </label>
            </li>`;
        }

        // Caso 2: Sí / No → radios
        if (item.tipo === "siNo") {
          const name = `${id}-sn${i}`;
          return `
            <li>
              <span>${item.texto}</span>
              <label style="margin-left:.5rem;">
                <input type="radio" name="${name}" value="Sí" data-tipo="siNo"> Sí
              </label>
              <label style="margin-left:.75rem;">
                <input type="radio" name="${name}" value="No" data-tipo="siNo"> No
              </label>
            </li>`;
        }

        // Caso 3: Opciones → select
        if (item.tipo === "opciones") {
          return `
            <li>
              <span>${item.texto}</span>
              <select name="${id}-op${i}" data-tipo="opciones" style="margin-left:.5rem;">
                <option value="">Seleccione</option>
                ${item.opciones.map(op => `<option value="${op}">${op}</option>`).join("")}
              </select>
            </li>`;
        }

        // Caso 4: fallback (objeto inesperado) → checkbox con texto
        return `
          <li>
            <label>
              <input type="checkbox" class="mm-check" data-tipo="check" id="${id}-c${i}" />
              <span>${item.texto ?? ""}</span>
            </label>
          </li>`;
      }).join("")}
    </ul>
  `;

  return `
    <div class="mm-autodiag">
      <h4>📌 Preguntas base</h4>
      ${renderChecklist(diag.preguntas, id)}

      <h4>🔧 Autodiagnóstico</h4>
      ${renderChecklist(diag.pasos, id)}
    </div>
  `;
}


function getCheckedAutodiag(modal, title) {
  let msg = `📝 Informe de Autodiagnóstico – *${title}*\n\n`;

  // Checkboxes
  modal.querySelectorAll('.mm-check[data-tipo="check"]:checked').forEach(c => {
    const txt = c.nextElementSibling?.textContent.trim();
    if (txt) msg += `✔️ ${txt}\n`;
  });

  // Sí/No
  modal.querySelectorAll('input[data-tipo="siNo"]:checked').forEach(r => {
    const pregunta = r.closest('li').querySelector('span')?.textContent.trim();
    if (pregunta) msg += `${pregunta}: ${r.value === "Sí" ? "✔️ Sí" : "❌ No"}\n`;
  });

  // Opciones
  modal.querySelectorAll('select[data-tipo="opciones"]').forEach(sel => {
    if (sel.value) {
      const pregunta = sel.closest('li').querySelector('span')?.textContent.trim();
      msg += `${pregunta}: ${sel.value}\n`;
    }
  });

  msg += "\n📩 Solicito asesoría sobre este servicio. 🚗";
  return msg;
}




export function initMindMap(selector, { phone }) {
  const root = document.querySelector(selector);
  if (!root) return;

  const NODES = [
    { id: 'frenos',        title: 'Frenos' },
    { id: 'ABS',    title: 'ABS' },
    { id: 'lights',        title: 'Luces' },
    { id: 'airbag',            title: 'Airbag' },
    { id: 'filtroParticulas',      title: 'Filtro particulas' },
    { id: 'motor',         title: 'Motor' },
    { id: 'bateria',  title: 'Batería' },
    { id: 'TPMS',       title: 'TPMS' }
  ];
  const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]));
  const GRID_ORDER = [
    'motor', 'bateria', 'TPMS',
    'filtroParticulas', 'CENTER', 'frenos',
    'airbag', 'lights', 'ABS'
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

function enableCarousel(container) {
  const track = container.querySelector('.mm-media-track');
  const prev  = container.querySelector('.mm-prev');
  const next  = container.querySelector('.mm-next');
  if (!track) return;

  prev?.addEventListener('click', () => {
    track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
  });
  next?.addEventListener('click', () => {
    track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
  });
}

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
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 1024.000000 1024.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M5162 8219 c-61 -12 -95 -40 -146 -122 -155 -249 -343 -741 -480
-1257 -295 -1111 -314 -2172 -60 -3310 121 -538 306 -1074 514 -1490 121 -241
141 -257 310 -246 242 14 635 70 970 136 755 149 1501 443 2075 817 728 475
1156 982 1359 1611 73 226 116 550 101 767 -16 229 -78 502 -161 705 -158 383
-464 787 -844 1114 -819 703 -1983 1162 -3196 1260 -250 20 -390 25 -442 15z
m513 -654 c505 -58 876 -145 1325 -312 644 -240 1187 -571 1586 -968 333 -332
508 -628 586 -989 31 -142 31 -378 0 -523 -77 -359 -294 -720 -630 -1045 -367
-355 -892 -667 -1522 -905 -424 -159 -973 -293 -1410 -342 -47 -5 -103 -13
-126 -16 -35 -6 -42 -4 -47 11 -3 11 -26 65 -51 122 -57 130 -159 427 -221
642 -312 1094 -333 2146 -65 3290 81 347 213 759 317 993 l26 57 51 0 c28 0
110 -7 181 -15z"/>
<path d="M704 7707 c-2 -7 -3 -137 -2 -290 l3 -277 1724 0 c948 0 1726 2 1729
5 4 4 169 531 175 558 3 18 -3622 23 -3629 4z"/>
<path d="M702 6203 l3 -288 1590 0 1590 0 51 260 c28 143 54 272 57 288 l7 27
-1650 0 -1650 0 2 -287z"/>
<path d="M704 5261 c-2 -2 -4 -130 -4 -283 l0 -278 1573 2 1572 3 3 278 2 277
-807 0 c-445 0 -1152 1 -1571 2 -420 2 -766 1 -768 -1z"/>
<path d="M700 3740 l0 -290 1650 0 c908 0 1653 1 1658 3 11 3 6 33 -40 237
-22 102 -48 219 -57 260 l-16 75 -1598 3 -1597 2 0 -290z"/>
<path d="M700 2515 l0 -295 1830 0 c1214 0 1830 3 1830 10 0 8 -118 491 -136
558 l-6 22 -1759 0 -1759 0 0 -295z"/>
</g>
</svg>`;
    case 'filtroParticulas': return `
     <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1024.000000 1024.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M2090 7436 c-165 -46 -281 -154 -341 -319 -22 -60 -23 -74 -27 -484
l-3 -423 -603 0 c-455 0 -605 -3 -614 -12 -15 -15 -17 -1412 -2 -1452 l10 -26
605 0 605 0 0 -397 c0 -434 6 -488 57 -592 34 -70 132 -168 204 -204 121 -61
-43 -57 2459 -57 2528 0 2348 -4 2471 61 75 40 158 123 198 199 56 105 61 151
61 603 l0 407 453 0 c494 0 542 -5 639 -57 74 -40 151 -115 243 -237 44 -58
86 -106 93 -106 23 0 592 421 917 678 234 186 285 230 285 246 0 18 -170 249
-252 344 -83 95 -228 227 -343 309 -226 163 -490 261 -760 283 -66 5 -380 10
-697 10 l-578 0 0 388 c0 213 -4 414 -10 446 -23 139 -121 277 -245 343 -129
68 60 63 -2481 62 -1804 -1 -2309 -3 -2344 -13z m4678 -235 c31 -14 70 -43 96
-72 77 -86 76 -78 76 -639 0 -372 3 -499 12 -508 9 -9 173 -12 678 -12 382 0
712 -4 774 -10 342 -33 604 -153 866 -398 98 -91 233 -250 224 -264 -13 -20
-824 -648 -837 -648 -3 0 -49 44 -104 99 -82 82 -112 105 -183 139 -164 79
-133 76 -803 79 -446 3 -602 1 -613 -8 -12 -10 -14 -95 -14 -518 0 -568 -1
-579 -67 -652 -20 -22 -60 -53 -87 -67 l-51 -27 -2285 0 -2285 0 -52 24 c-29
13 -69 41 -89 63 -71 79 -68 56 -74 638 l-5 525 -615 5 -615 5 -1 115 c-1 63
0 122 2 130 3 13 25 15 131 13 71 -2 395 -3 721 -3 l592 0 0 -654 c0 -360 3
-661 6 -670 6 -15 216 -16 2284 -16 2068 0 2278 1 2284 16 3 9 6 310 6 669 0
360 3 655 8 657 4 2 356 1 782 -3 704 -5 780 -7 835 -23 119 -36 242 -101 337
-179 37 -30 51 -36 65 -28 45 24 328 278 328 293 0 23 -158 163 -260 232 -141
95 -272 153 -440 193 -62 15 -164 17 -862 20 l-793 4 -2 662 -3 662 -2265 3
c-1246 1 -2275 0 -2287 -3 l-23 -5 0 -660 0 -660 -720 0 c-473 0 -720 3 -721
10 -1 6 -1 33 -1 60 0 28 0 82 1 120 l1 70 604 0 c485 0 606 3 614 13 8 9 12
173 14 518 3 492 4 505 25 551 28 62 93 123 156 147 51 20 76 20 2317 18
l2265 -2 53 -24z m-1000 -381 l752 0 0 -1365 0 -1365 -2070 0 -2070 0 0 1364
0 1365 43 3 c23 2 616 2 1317 1 701 -2 1614 -3 2028 -3z"/>
<path d="M2870 6689 c-115 -23 -222 -108 -274 -219 -39 -83 -48 -208 -21 -291
78 -240 343 -351 571 -239 74 36 146 110 182 188 24 51 27 69 27 167 0 98 -3
116 -27 167 -79 170 -269 264 -458 227z m193 -262 c66 -50 85 -155 39 -216
-77 -104 -216 -99 -290 10 -20 28 -23 43 -20 87 5 59 27 94 79 130 48 34 141
28 192 -11z"/>
<path d="M3845 6686 c-78 -20 -116 -40 -172 -90 -95 -86 -140 -199 -130 -325
8 -90 21 -129 68 -200 167 -251 567 -227 699 42 79 161 58 323 -57 447 -105
114 -262 162 -408 126z m181 -242 c42 -20 70 -55 85 -104 27 -90 -30 -177
-130 -199 -51 -11 -58 -10 -105 14 -67 33 -89 65 -94 135 -4 64 19 108 77 147
41 28 117 31 167 7z"/>
<path d="M4850 6689 c-119 -23 -221 -103 -277 -217 -36 -73 -38 -80 -38 -177
0 -97 2 -104 38 -177 60 -123 163 -196 306 -218 132 -21 258 26 356 131 76 83
99 147 100 274 0 88 -4 107 -27 157 -79 169 -269 264 -458 227z m174 -252 c57
-32 91 -100 81 -164 -13 -86 -109 -153 -196 -137 -136 25 -187 188 -87 281 51
48 138 57 202 20z"/>
<path d="M5850 6690 c-148 -25 -274 -144 -316 -298 -15 -56 -16 -75 -6 -144
34 -231 233 -380 464 -348 224 32 374 233 338 455 -38 237 -237 376 -480 335z
m171 -253 c18 -12 44 -38 57 -57 20 -29 23 -44 20 -93 -4 -46 -10 -63 -34 -88
-42 -44 -76 -59 -136 -59 -173 1 -233 200 -89 297 26 17 48 23 91 23 43 0 65
-6 91 -23z"/>
<path d="M3287 5830 c-105 -33 -197 -116 -245 -218 -23 -50 -27 -70 -27 -162
0 -93 3 -111 27 -162 55 -117 175 -207 305 -229 180 -29 366 67 441 230 37 79
43 212 14 294 -72 203 -305 315 -515 247z m196 -224 c18 -7 47 -29 64 -49 94
-107 13 -267 -134 -267 -58 0 -104 26 -141 80 -31 46 -28 130 8 179 42 61 134
86 203 57z"/>
<path d="M4306 5830 c-113 -40 -187 -107 -238 -215 -30 -64 -33 -78 -32 -160
0 -101 22 -172 74 -244 83 -113 262 -180 405 -151 138 28 241 106 297 225 30
65 33 78 33 170 0 89 -3 107 -29 163 -38 82 -129 169 -212 201 -86 34 -218 39
-298 11z m202 -226 c103 -43 138 -146 81 -239 -58 -97 -229 -98 -287 -3 -87
145 51 307 206 242z"/>
<path d="M5357 5840 c-198 -50 -329 -246 -299 -445 34 -216 243 -370 459 -336
143 22 258 106 317 231 28 59 31 74 31 165 0 93 -2 105 -32 166 -41 82 -111
150 -199 191 -54 25 -81 31 -152 34 -48 2 -104 -1 -125 -6z m179 -239 c129
-59 130 -230 2 -297 -74 -39 -184 -2 -225 75 -29 55 -29 95 0 151 40 80 136
110 223 71z"/>
<path d="M2870 5019 c-111 -22 -225 -111 -277 -218 -25 -50 -28 -67 -28 -161
0 -97 2 -110 32 -172 39 -84 103 -147 191 -190 62 -31 73 -33 172 -33 97 0
110 2 172 32 89 42 151 101 191 182 30 61 32 72 32 171 0 93 -3 112 -27 162
-80 171 -268 264 -458 227z m156 -238 c128 -58 137 -224 15 -288 -56 -29 -105
-29 -161 0 -56 28 -81 63 -87 120 -10 84 25 143 102 171 54 20 82 19 131 -3z"/>
<path d="M3860 5016 c-122 -26 -229 -109 -285 -221 -27 -54 -30 -69 -30 -160
0 -92 3 -105 32 -167 64 -135 188 -217 343 -226 220 -12 392 119 430 327 38
210 -106 410 -325 450 -71 13 -94 13 -165 -3z m141 -227 c141 -47 157 -234 27
-298 -56 -27 -101 -26 -158 2 -77 39 -111 136 -74 212 20 43 44 64 91 81 47
16 71 17 114 3z"/>
<path d="M4840 5016 c-199 -44 -319 -204 -308 -412 8 -148 86 -261 226 -327
62 -29 75 -32 172 -32 135 1 192 22 282 105 95 86 123 152 123 285 0 89 -3
106 -28 156 -57 118 -158 198 -283 224 -82 17 -110 17 -184 1z m153 -230 c50
-18 76 -42 98 -91 24 -52 24 -79 -2 -131 -75 -155 -319 -100 -319 71 0 66 29
112 90 143 50 25 79 27 133 8z"/>
<path d="M5840 5016 c-116 -26 -228 -114 -278 -217 -92 -191 -4 -423 197 -522
62 -30 72 -32 176 -32 105 0 114 2 180 34 120 59 192 157 215 294 20 111 -17
235 -94 324 -60 69 -218 135 -315 132 -14 0 -51 -6 -81 -13z m170 -238 c61
-31 90 -77 90 -142 0 -149 -179 -219 -286 -112 -84 84 -52 221 61 261 56 20
84 18 135 -7z"/>
</g>
</svg>`;
    case 'airbag': return `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 128.000000 128.000000"
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
    case 'frenos': return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Brake Warning Light">
        <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="32" r="16"/>
          <path d="M12 18 A24 24 0 0 0 12 46"/>
          <path d="M52 18 A24 24 0 0 1 52 46"/>
        </g>
        <line x1="32" y1="23" x2="32" y2="34" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <circle cx="32" cy="41" r="1.8" fill="currentColor"/>
      </svg>`;
    case 'ABS': return `
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 1024.000000 1024.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M1969 8158 c-278 -305 -424 -496 -589 -767 -403 -662 -608 -1366
-627 -2151 -11 -459 38 -829 176 -1315 168 -594 478 -1151 912 -1640 54 -60
127 -139 162 -174 l65 -64 205 209 205 209 -137 140 c-457 470 -756 1002 -917
1634 -138 545 -148 1106 -29 1667 146 692 449 1269 968 1844 l86 95 -92 95
c-51 52 -140 144 -198 203 l-105 108 -85 -93z"/>
<path d="M4716 8234 c-609 -69 -1196 -327 -1671 -734 -571 -490 -962 -1224
-1050 -1969 -106 -894 146 -1735 727 -2426 260 -310 673 -618 1057 -790 627
-281 1233 -366 1856 -260 784 133 1464 530 1960 1145 272 337 482 772 584
1205 60 260 81 443 82 715 1 490 -102 946 -310 1375 -230 474 -531 829 -986
1160 -414 301 -900 496 -1431 571 -158 23 -649 28 -818 8z m809 -493 c384 -69
735 -208 1044 -415 664 -445 1068 -1080 1172 -1841 26 -190 28 -501 5 -687
-73 -584 -315 -1079 -730 -1494 -157 -156 -242 -226 -411 -337 -347 -227 -721
-368 -1145 -433 -142 -22 -547 -26 -685 -6 -414 59 -810 207 -1135 424 -326
217 -604 507 -799 830 -268 446 -397 971 -363 1479 27 402 105 706 261 1024
369 750 1052 1279 1867 1444 164 34 254 40 534 36 217 -2 287 -7 385 -24z"/>
<path d="M6490 6274 c-264 -78 -410 -289 -410 -593 0 -186 45 -321 143 -427
54 -59 153 -128 237 -164 173 -73 233 -106 270 -146 59 -64 74 -141 45 -225
-33 -91 -118 -139 -249 -139 -112 0 -303 57 -359 108 -25 22 -32 8 -47 -92 -6
-45 -20 -130 -31 -191 -10 -60 -15 -112 -11 -116 20 -18 181 -71 259 -84 115
-21 298 -20 399 0 341 71 525 326 500 692 -8 116 -34 201 -86 280 -80 121
-143 164 -461 311 -47 21 -101 54 -121 71 -116 101 -98 264 37 333 62 32 180
36 287 9 89 -22 205 -65 223 -82 5 -5 15 -9 22 -9 10 0 13 43 13 203 l0 204
-77 26 c-120 42 -220 57 -366 56 -110 0 -146 -4 -217 -25z"/>
<path d="M3421 6247 c-18 -47 -260 -873 -450 -1535 -71 -249 -133 -462 -136
-473 -6 -19 -2 -19 191 -17 l198 3 61 220 61 220 304 3 305 2 61 -222 61 -223
198 -3 c182 -2 197 -1 191 15 -4 9 -31 96 -60 192 -156 516 -405 1339 -474
1571 l-79 265 -212 3 -211 2 -9 -23z m259 -577 c17 -69 63 -238 101 -377 38
-138 69 -254 69 -257 0 -3 -92 -6 -205 -6 -113 0 -205 4 -205 8 0 5 35 139 79
298 43 159 86 323 95 364 21 91 25 104 30 99 3 -2 19 -60 36 -129z"/>
<path d="M4620 5246 l0 -1026 369 0 c422 0 465 5 599 71 192 94 292 258 292
478 0 162 -40 270 -135 366 -63 62 -136 102 -217 119 l-62 13 72 38 c162 85
248 209 267 386 27 250 -109 469 -338 546 l-82 27 -382 4 -383 3 0 -1025z
m662 612 c44 -20 62 -36 83 -72 72 -124 24 -302 -95 -350 -53 -21 -184 -39
-227 -31 l-33 6 0 241 0 241 108 -5 c88 -4 117 -9 164 -30z m40 -827 c92 -44
141 -119 142 -216 1 -78 -25 -144 -74 -189 -55 -50 -120 -66 -262 -66 l-118 0
0 251 0 252 133 -5 c111 -4 141 -8 179 -27z"/>
<path d="M8034 8103 c-76 -82 -164 -174 -193 -205 l-53 -57 67 -73 c346 -373
643 -859 828 -1358 334 -897 296 -1923 -101 -2795 -182 -398 -405 -725 -701
-1028 l-135 -138 199 -199 c110 -110 203 -200 207 -200 3 0 64 62 134 138 536
579 850 1122 1028 1775 113 415 157 745 157 1172 1 958 -286 1842 -845 2595
-102 138 -421 509 -444 518 -4 1 -71 -64 -148 -145z"/>
</g>
</svg>`;
    case 'TPMS': return `
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 1024.000000 1024.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
fill="currentColor
" stroke="none">
<path d="M2414 8771 c-53 -14 -113 -53 -140 -92 -36 -52 -48 -100 -79 -302
-30 -202 -59 -328 -116 -510 -76 -242 -155 -398 -348 -687 -188 -280 -268
-424 -361 -651 -123 -298 -203 -643 -231 -984 -14 -182 -6 -551 16 -715 70
-519 253 -1043 505 -1445 171 -273 341 -487 583 -730 104 -104 194 -196 200
-204 8 -10 13 -109 17 -335 5 -321 5 -322 31 -371 18 -35 39 -59 74 -80 l48
-30 382 -3 c314 -2 384 0 393 11 8 9 13 93 14 258 l3 244 110 0 110 0 5 -255
c3 -140 7 -256 8 -257 1 -2 189 -3 417 -3 399 0 415 1 425 19 6 12 10 114 10
260 l0 241 110 0 110 0 0 -248 c0 -180 3 -251 12 -260 18 -18 773 -17 785 1 4
6 10 122 13 257 l5 245 99 3 c73 2 102 -1 108 -10 4 -7 8 -120 7 -250 0 -130
2 -242 6 -247 10 -17 831 -15 842 1 4 7 10 123 13 258 l5 245 108 3 107 3 0
-249 c0 -179 3 -251 12 -260 17 -17 744 -17 799 -1 50 16 105 61 132 112 21
40 22 55 27 368 l5 327 185 188 c467 476 750 927 941 1496 88 263 143 522 175
821 19 180 14 574 -10 752 -35 263 -106 552 -190 767 -94 244 -192 426 -365
678 -130 189 -189 286 -251 410 -105 210 -180 471 -224 780 -41 289 -54 330
-120 387 -59 53 -180 66 -346 39 -236 -39 -436 -157 -470 -279 -44 -161 65
-617 227 -941 87 -175 135 -252 298 -480 181 -254 264 -388 350 -569 129 -270
209 -560 246 -887 19 -166 16 -561 -5 -740 -85 -716 -387 -1336 -901 -1846
-85 -84 -148 -138 -178 -152 l-47 -22 -1988 0 -1988 0 -51 25 c-89 45 -373
349 -541 580 -247 341 -433 788 -506 1220 -39 228 -49 382 -43 664 15 669 163
1115 546 1651 212 296 286 407 346 523 125 238 196 439 250 701 43 205 30 290
-56 376 -60 60 -199 131 -314 161 -86 23 -296 35 -351 20z"/>
<path d="M5070 7894 c-14 -2 -52 -9 -85 -15 -217 -38 -423 -239 -481 -469 -15
-58 -16 -121 -11 -550 12 -951 27 -1676 38 -1735 6 -33 28 -97 50 -142 77
-161 227 -279 405 -319 101 -22 253 -15 341 16 175 61 327 219 384 400 24 73
29 203 49 1085 16 734 14 1186 -5 1260 -55 214 -236 394 -451 449 -63 16 -193
27 -234 20z"/>
<path d="M5011 4365 c-170 -31 -322 -147 -400 -307 -23 -46 -46 -107 -51 -137
-66 -357 203 -681 563 -681 175 0 302 54 420 180 176 187 216 432 105 644 -42
80 -164 202 -245 244 -75 40 -198 72 -267 71 -28 0 -84 -7 -125 -14z"/>
</g>
</svg>`;
    case 'shock': return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 7l12 10M8 5l2 2M14 17l2 2"/>
        <rect x="4" y="4" width="6" height="4" rx="1"/>
        <rect x="14" y="16" width="6" height="4" rx="1"/>
      </svg>`;
    case 'bateria': return `
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1024.000000 1024.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="none">
<path d="M2565 8224 c-11 -3 -40 -10 -65 -16 -155 -39 -287 -174 -319 -326 -7
-32 -11 -169 -11 -342 l0 -288 -302 -5 c-342 -5 -352 -6 -508 -83 -80 -40
-109 -61 -185 -138 -101 -102 -152 -183 -193 -301 l-27 -80 -3 -2003 c-2
-1966 -2 -2006 17 -2087 61 -256 246 -452 511 -541 53 -18 172 -19 3595 -22
3217 -2 3547 -1 3620 14 150 30 265 93 380 208 91 92 143 175 183 291 l27 80
3 1975 c3 2137 4 2062 -51 2198 -41 102 -87 172 -172 258 -123 125 -268 200
-431 224 -38 5 -180 10 -316 10 l-248 0 0 278 c0 152 -4 304 -10 336 -25 152
-135 278 -298 339 -55 20 -75 21 -516 25 -509 4 -554 0 -663 -52 -127 -62
-216 -170 -242 -294 -7 -31 -11 -171 -11 -342 l0 -290 -1204 0 -1204 0 -4 313
c-5 267 -8 319 -23 362 -47 131 -135 218 -280 276 l-60 24 -485 2 c-267 0
-494 -1 -505 -3z m6087 -1517 c32 -16 71 -45 88 -65 64 -78 60 64 60 -2026 l0
-1901 -24 -50 c-24 -52 -72 -101 -129 -132 -30 -17 -205 -18 -3506 -21 -2248
-1 -3486 1 -3510 8 -62 16 -127 65 -158 117 l-28 48 -3 1910 c-2 1432 0 1921
9 1953 21 76 113 161 195 181 23 5 1418 8 3494 8 l3455 -2 57 -28z"/>
<path d="M7087 5824 c-4 -4 -7 -193 -7 -421 l0 -413 -382 0 c-211 0 -389 0
-396 0 -10 0 -12 -55 -10 -257 l3 -258 392 -3 393 -2 2 -398 3 -397 253 -3
252 -2 0 400 0 400 388 2 387 3 3 257 2 258 -387 2 -388 3 -5 415 -5 415 -246
3 c-135 1 -248 -1 -252 -4z"/>
<path d="M2018 4983 c-2 -5 -2 -122 0 -260 l3 -253 899 0 900 0 0 260 0 260
-899 0 c-495 0 -901 -3 -903 -7z"/>
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
  frenos: 'frenos',
  ABS: 'ABS',
  lights: 'lights',
  airbag: 'airbag',
  filtroParticulas: 'filtroParticulas',
  motor: 'engine',
  bateria: 'bateria',
  TPMS: 'TPMS'
};
