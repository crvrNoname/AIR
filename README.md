# 🌐 AIR – Mecánica y Electrónica Automotriz

Sitio web estático desarrollado con **HTML, SCSS y JavaScript modular**.  
Diseñado para un taller automotriz, incluye secciones de servicios, contacto y cotización, con un diseño responsive y soporte para **cambio de tema dinámico** (paleta actual, propuesta y Scania).

---

## ✨ Características principales

- ⚡ **Frontend moderno**: HTML semántico, SCSS modular, variables y mixins.
- 🎨 **Temas personalizables**: selector de paletas (`actual`, `propuesta`, `Scania`).
- 🖼️ **Gestión de imágenes**: carga dinámica de servicios con fallback `no-image.svg`.
- 📱 **Responsive design**: adaptable a móviles, tablets y escritorio.
- 🔧 **SEO básico**: meta tags, Open Graph y descripciones.
- 🖍️ **Accesibilidad**: skip links, botones accesibles y contraste definido.
- 🔗 **GitHub Pages**: desplegado desde la carpeta `docs/`.

---

## 📂 Estructura del proyecto

```plaintext
webGenerica02/
├── docs/                  # Carpeta publicada en GitHub Pages
│   ├── assets/
│   │   ├── css/           # CSS compilado desde SCSS
│   │   ├── img/           # Imágenes y favicons
│   │   └── js/            # JS compilado
│   ├── pages/             # Subpáginas: contacto, servicios, etc.
│   └── index.html
├── src/                   # Código fuente
│   ├── js/                # Scripts modulares
│   └── styles/            # SCSS (variables, mixins, main.scss)
├── package.json
├── .gitignore
└── README.md
