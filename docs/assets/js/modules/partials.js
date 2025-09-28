// src/js/modules/partials.js
function getBasePrefix() {
  const meta = document.getElementById('site-base');
  const hinted = (meta && meta.getAttribute('data-base')) || '';
  const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(location.hostname);
  if (isLocal) return /\/pages\//.test(location.pathname) ? '..' : '.';
  if (hinted)  return hinted.replace(/\/+$/, '');
  if (location.hostname.endsWith('github.io')) {
    const seg = location.pathname.split('/').filter(Boolean)[0];
    return seg ? '/' + seg : '';
  }
  return '';
}

/**
 * Reemplaza nodos con data-include="/partials/footer.html"
 * por el HTML remoto. Acepta rutas que empiecen con "/" (recomendado).
 */
// src/js/modules/partials.js
export async function includePartials(selector = '[data-include]') {
  const prefix = getBasePrefix();
  const nodes = document.querySelectorAll(selector);
  await Promise.all([...nodes].map(async (el) => {
    let path = el.getAttribute('data-include') || '';
    if (!path) return;

    const url = path.startsWith('/')
      ? `${prefix}${path}`
      : `${prefix}/${path}`;

    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      console.warn('[includePartials] No se pudo cargar', url, res.status);
      return;
    }
    const html = await res.text();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    // 🔑 Ajustar rutas dinámicamente
    wrapper.querySelectorAll('[data-link]').forEach(link => {
      let target = link.getAttribute('data-link');
      if (/\/pages\//.test(location.pathname)) {
        // Estamos dentro de /pages → subir un nivel
        link.setAttribute('href', `../${target}`);
      } else {
        // Estamos en index → usar normal
        link.setAttribute('href', `./${target}`);
      }
    });

    // Reemplaza el placeholder por el contenido cargado
    el.replaceWith(...wrapper.childNodes);
  }));
}

