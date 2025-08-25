// src/js/modules/nav.js
export function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Cerrar al navegar en móvil
  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (target?.closest('a')) {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}