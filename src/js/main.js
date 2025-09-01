// src/js/main.js
import { initNav } from './modules/nav.js';
import { renderHomeServices, renderServicesPage } from './modules/services.js';
import { initQuoteForm, initScheduleForm } from './modules/form.js';
import { initWhatsAppLinks, setCurrentYear } from './modules/contact.js';
import { initThemeSwitcher } from './modules/theme.js';
import { includePartials } from './modules/partials.js';
import { initMindMap } from './modules/mindmap.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Incluir parciales (footer/header)
  await includePartials();

  // 2) Inicializaciones globales
  initThemeSwitcher();
  initNav();
  initWhatsAppLinks({ phone: '+56988934851' }); // ← número directo
  setCurrentYear();

  // 3) Páginas
  if (document.body.classList.contains('page--home')) {
    renderHomeServices('#services-grid');
  }

  if (document.body.classList.contains('page--servicios')) {
    renderServicesPage('#services-grid-mecanica', '#services-grid-electronica');
    // inicializa el mindmap si existe el contenedor
    const mm = document.querySelector('#mindmap');
    if (mm) initMindMap('#mindmap', { phone: '+56988934851' });
  }

  if (document.body.classList.contains('page--cotiza')) {
    initQuoteForm(
      '#quoteForm', '#quoteMsg', '#quoteServiceSelect', '#quoteWhatsApp',
      { phone: '+56988934851' } // ← quita los {{...}}
    );
  }

  if (document.body.classList.contains('page--agendar')) {
    initScheduleForm(
      '#scheduleForm', '#scheduleMsg', '#scheduleServiceSelect', '#scheduleWhatsApp',
      { phone: '+56988934851' } // ← quita los {{...}}
    );
  }
});
