// src/js/modules/services.js
export const SERVICES = {
  mecanica: [
    { id: 'embrague',      title: 'Cambio de embrague',       img: 'embrague.jpg',              desc: 'Reemplazo y ajuste del sistema de embrague.' },
    { id: 'mantencion',    title: 'Mantención',               img: 'mantencion.jpg',            desc: 'Servicios de mantención preventiva.' },
    { id: 'suspension',    title: 'Suspensión',               img: 'suspension.jpg',            desc: 'Diagnóstico y reparación de suspensión.' },
    { id: 'frenos',        title: 'Frenos',                   img: 'frenos.jpg',                desc: 'Pastillas, discos, líquido y purgado.' },
    { id: 'aire',          title: 'Aire',                     img: 'aire.jpg',                  desc: 'Mantenimiento de sistema de aire.' },
    { id: 'motor',         title: 'Ajuste de motor',          img: 'motor.jpg',                 desc: 'Ajustes y sincronización.' },
    { id: 'ac',            title: 'Aire acondicionado',       img: 'aireAcondicionado.jpg',     desc: 'Carga, revisión y reparación del A/C.' },
  ],
  electronica: [
    { id: 'scanner',       title: 'Diagnóstico con escáner',  img: 'scanner.jpg',               desc: 'Lectura de códigos OBD y análisis.' },
    { id: 'electricidad',  title: 'Electricidad automotriz',  img: 'electricidadAutomotriz.jpg',desc: 'Reparación de circuitos y componentes.' },
  ]
};

// 🔧 Normalizador de rutas de imagen
function getImgUrl(input, base = '..') {
  const filename = (input || '').split('/').pop();
  const prefix = base === '.' ? './assets/img/services/' : '../assets/img/services/';
  return `${prefix}${filename}`;
}

// 🔧 Generador de tarjeta con fallback
function cardHTML(item, base = '..') {
  const img = getImgUrl(item.img, base);
  const fallback = base === '.' 
    ? './assets/img/services/no-image.svg' 
    : '../assets/img/services/no-image.svg';
  const alt = `${item.title} – ${item.desc}`;

  return `
  <article class="card">
    <img 
      class="card__media" 
      src="${img}" 
      alt="${alt}" 
      loading="lazy" 
      decoding="async"
      onerror="this.onerror=null;this.src='${fallback}'"
    />
    <div class="card__body">
      <h3 class="card__title">${item.title}</h3>
      <p class="card__desc">${item.desc}</p>
    </div>
  </article>`;
}

// Home (index en docs/): base = '.'
export function renderHomeServices(selector) {
  const grid = document.querySelector(selector);
  if (!grid) return;
  const items = [
    SERVICES.mecanica.find(x => x.id === 'frenos'),
    SERVICES.mecanica.find(x => x.id === 'suspension'),
    SERVICES.electronica.find(x => x.id === 'scanner'),
    SERVICES.mecanica.find(x => x.id === 'ac'),
    SERVICES.mecanica.find(x => x.id === 'mantencion'),
    SERVICES.electronica.find(x => x.id === 'electricidad'),
  ].filter(Boolean);

  grid.innerHTML = items.map(i => cardHTML(i, '.')).join('');
}

// Página /pages/services.html: base = '..'
export function renderServicesPage(selMec, selElec) {
  const gridM = document.querySelector(selMec);
  const gridE = document.querySelector(selElec);
  if (gridM) gridM.innerHTML = SERVICES.mecanica.map(i => cardHTML(i, '..')).join('');
  if (gridE) gridE.innerHTML = SERVICES.electronica.map(i => cardHTML(i, '..')).join('');
}
