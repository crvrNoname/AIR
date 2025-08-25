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
export async function includePartials(selector = '[data-include]') {
  const prefix = getBasePrefix();
  const nodes = document.querySelectorAll(selector);
  await Promise.all([...nodes].map(async (el) => {
    let path = el.getAttribute('data-include') || '';
    if (!path) return;

    // Si empieza con "/", la resolvemos con prefix; si no, le añadimos "/"
    const url = path.startsWith('/')
      ? `${prefix}${path}`
      : `${prefix}/${path}`;

    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      console.warn('[includePartials] No se pudo cargar', url, res.status);
      return;
    }
    const html = await res.text();

    // Insertar en el DOM (reemplazo del placeholder)
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    // Reemplaza el elemento por el contenido cargado
    el.replaceWith(...wrapper.childNodes);
  }));
}
