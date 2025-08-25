// src/js/modules/contact.js (sin cambios funcionales; funciona con placeholders)
export function buildWhatsAppLink(phoneE164, message) {
  const digits = phoneE164.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${message}`;
}

export function initWhatsAppLinks({ phone }) {
  document.querySelectorAll('[data-whatsapp]').forEach(a => {
    const text = encodeURIComponent('Hola, vengo del sitio web y necesito ayuda.');
    a.setAttribute('href', buildWhatsAppLink(phone, text));
  });
}

export function setCurrentYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}