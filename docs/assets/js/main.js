// src/js/main.js
import { initNav } from './modules/nav.js';
import { renderHomeServices, renderServicesPage } from './modules/services.js';
import { initQuoteForm, initScheduleForm } from './modules/form.js';
import { initWhatsAppLinks, setCurrentYear } from './modules/contact.js';
import { initThemeSwitcher } from './modules/theme.js';
import { includePartials } from './modules/partials.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1) incluir footer (y/o header si más adelante lo separas)
  await includePartials();

  // 2) ahora sí inicializa todo, ya existen botones de tema y el FAB
  initThemeSwitcher();
  initNav();
  initWhatsAppLinks({ phone: '{{WHATSAPP_E164}}' });
  setCurrentYear();

  if (document.body.classList.contains('page--home')) {
    renderHomeServices('#services-grid');
  }
  if (document.body.classList.contains('page--servicios')) {
    renderServicesPage('#services-grid-mecanica', '#services-grid-electronica');
  }
  if (document.body.classList.contains('page--cotiza')) {
    initQuoteForm('#quoteForm', '#quoteMsg', '#quoteServiceSelect', '#quoteWhatsApp', { phone: '{{WHATSAPP_E164}}' });
  }
  if (document.body.classList.contains('page--agendar')) {
    initScheduleForm('#scheduleForm', '#scheduleMsg', '#scheduleServiceSelect', '#scheduleWhatsApp', { phone: '{{WHATSAPP_E164}}' });
  }
});
