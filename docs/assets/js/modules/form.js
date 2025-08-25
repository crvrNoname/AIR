// src/js/modules/form.js
import { buildWhatsAppLink } from './contact.js';
import { SERVICES } from './services.js';

function fillSelect(selectEl) {
  const options = [
    ...SERVICES.mecanica.map(s => ({ value: s.title, label: `Mecánica – ${s.title}` })),
    ...SERVICES.electronica.map(s => ({ value: s.title, label: `Electrónica – ${s.title}` })),
  ];
  selectEl.innerHTML = `<option value="" disabled selected>Selecciona un servicio</option>` +
    options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
}

export function initQuoteForm(formSel, msgSel, selectSel, waSel, { phone }) {
  const form = document.querySelector(formSel);
  const msg = document.querySelector(msgSel);
  const select = document.querySelector(selectSel);
  const wa = document.querySelector(waSel);
  if (!form || !msg || !select || !wa) return;

  fillSelect(select);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.nombre || !data.email || !data.telefono || !data.servicio || !data.mensaje) {
      msg.textContent = 'Por favor completa todos los campos obligatorios.';
      return;
    }
    msg.textContent = '¡Gracias! Te contactaremos pronto.';
    form.reset();
  });

  wa.addEventListener('click', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const text =
      `Hola, quiero una *cotización*:%0A` +
      `• Nombre: ${data.nombre || '-'}%0A` +
      `• Teléfono: ${data.telefono || '-'}%0A` +
      `• Email: ${data.email || '-'}%0A` +
      `• Patente: ${data.patente || '-'}%0A` +
      `• Servicio: ${data.servicio || '-'}%0A` +
      `• Mensaje: ${data.mensaje || '-'}`;
    window.open(buildWhatsAppLink(phone, text), '_blank');
  });
}

export function initScheduleForm(formSel, msgSel, selectSel, waSel, { phone }) {
  const form = document.querySelector(formSel);
  const msg = document.querySelector(msgSel);
  const select = document.querySelector(selectSel);
  const wa = document.querySelector(waSel);
  if (!form || !msg || !select || !wa) return;

  fillSelect(select);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.nombre || !data.telefono || !data.fecha || !data.hora || !data.servicio) {
      msg.textContent = 'Completa los campos requeridos.';
      return;
    }
    msg.textContent = 'Reserva registrada (demo). Te confirmaremos por WhatsApp.';
    form.reset();
  });

  wa.addEventListener('click', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const text =
      `Hola, quiero *agendar*:%0A` +
      `• Nombre: ${data.nombre || '-'}%0A` +
      `• Teléfono: ${data.telefono || '-'}%0A` +
      `• Fecha: ${data.fecha || '-'}%0A` +
      `• Hora: ${data.hora || '-'}%0A` +
      `• Servicio: ${data.servicio || '-'}`;
    window.open(buildWhatsAppLink(phone, text), '_blank');
  });
}