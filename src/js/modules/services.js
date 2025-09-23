// src/js/modules/services.js
export const SERVICES = {
mecanica: [
  {
    id: 'motor',
    title: 'Ajuste de motor',
    img: ['motor/motor1.jpg', 'motor/motor2.jpg'],
    desc: 'Servicio especializado en calibración, sincronización y optimización del motor para mejorar el rendimiento, reducir el consumo de combustible y alargar la vida útil del vehículo.'
  },
  {
    id: 'filtroParticulas',
    title: 'Filtro de partículas',
    img: ['filtroParticulas/filtroParticulas1.jpg', 'filtroParticulas/filtroParticulas2.jpg'],
    desc: 'Limpieza, regeneración y mantenimiento del filtro de partículas (DPF), eliminando acumulación de hollín y garantizando una correcta circulación de gases para evitar averías y cumplir normas ambientales.'
  },
  {
    id: 'frenos',
    title: 'Frenos',
    img: ['frenos/frenos1.jpg', 'frenos/frenos2.jpg'],
    desc: 'Mantenimiento integral del sistema de frenos: inspección de pastillas, discos, líquido de frenos y purgado del circuito para asegurar una frenada segura y confiable.'
  },
  {
    id: 'airbag',
    title: 'Airbag',
    img: ['airbag/airbag1.jpg', 'airbag/airbag2.jpg'],
    desc: 'Revisión y diagnóstico de los sistemas de airbag, reemplazo de módulos defectuosos y verificación de conexiones para mantener la seguridad en caso de impacto.'
  },
  {
    id: 'ABS',
    title: 'ABS',
    img: ['ABS/ABS1.jpg', 'ABS/ABS2.jpg'],
    desc: 'Comprobación y reparación del sistema antibloqueo de frenos (ABS), incluyendo sensores de rueda, módulo electrónico y cableado para garantizar estabilidad y control en frenadas bruscas.'
  }
],
electronica: [
  {
    id: 'scanner',
    title: 'Diagnóstico con escáner',
    img: ['scanner/scanner1.jpg', 'scanner/scanner2.jpg'],
    desc: 'Lectura de códigos OBD-II y diagnóstico avanzado con escáner automotriz, permitiendo detectar fallas electrónicas y mecánicas de manera rápida y precisa.'
  },
  {
    id: 'bateria',
    title: 'Batería',
    img: ['bateria/bateria1.jpg', 'bateria/bateria2.jpg'],
    desc: 'Pruebas de carga, verificación de bornes y reemplazo de baterías defectuosas para asegurar el correcto arranque y funcionamiento de los sistemas eléctricos del vehículo.'
  },
  {
    id: 'TPMS',
    title: 'TPMS',
    img: ['tpms/tpms1.jpg', 'tpms/tpms2.jpg'],
    desc: 'Diagnóstico, reparación y calibración del sistema de monitoreo de presión de neumáticos (TPMS) para garantizar seguridad, reducir desgaste y mejorar la eficiencia del consumo de combustible.'
  },
  {
    id: 'lights',
    title: 'Luces',
    img: ['luces/luces1.jpg', 'luces/luces2.jpg'],
    desc: 'Inspección, reparación y sustitución de faros y luces auxiliares, asegurando una correcta iluminación para mayor seguridad y visibilidad en la conducción.'
  }
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
  const imgs = Array.isArray(item.img) ? item.img : [item.img]; // 🔑 siempre array
  const fallback = base === '.'
    ? './assets/img/services/no-image.svg'
    : '../assets/img/services/no-image.svg';
  const alt = `${item.title} – ${item.desc}`;

  // Si hay más de 1 imagen → grupo scroll horizontal
  const imgHTML = imgs.length > 1
    ? `
      <div class="card__media-group">
        ${imgs.map(img => `
          <img 
            src="${getImgUrl(img, base)}"
            alt="${alt}"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null;this.src='${fallback}'"
          />
        `).join('')}
      </div>`
    : `
      <img 
        class="card__media"
        src="${getImgUrl(imgs[0], base)}"
        alt="${alt}"
        loading="lazy"
        decoding="async"
        onerror="this.onerror=null;this.src='${fallback}'"
      />`;

  return `
  <article class="card">
    ${imgHTML}
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

function initCarousels() {
  document.querySelectorAll('.mm-media-group').forEach(group => {
    const track = group.querySelector('.mm-media-track');
    const prev = group.querySelector('.mm-prev');
    const next = group.querySelector('.mm-next');

    const scrollAmount = 360 + 8; // ancho img + gap

    prev?.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    next?.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Opcional: ocultar botones si no hay overflow
    function updateButtons() {
      if (track.scrollWidth <= track.clientWidth) {
        prev.style.display = next.style.display = 'none';
      } else {
        prev.style.display = 'flex';
        next.style.display = 'flex';
      }
    }
    updateButtons();
    window.addEventListener('resize', updateButtons);
  });
}

// Llamar al iniciar
document.addEventListener('DOMContentLoaded', initCarousels);
