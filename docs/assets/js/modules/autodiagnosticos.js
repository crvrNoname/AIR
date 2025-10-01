export const AUTODIAG = {
  ABS: {
    preguntas: [
      { tipo: "siNo", texto: "¿Se enciende el testigo de ABS en el tablero al encender el vehículo y se apaga después?" },
      { tipo: "siNo", texto: "¿Ha sentido vibraciones o ruidos extraños en el pedal de freno al frenar fuerte?" },
      { tipo: "siNo", texto: "¿El auto mantiene la trayectoria en frenadas bruscas o se desvía?" }
    ],
    pasos: [
      { tipo: "check", texto: "Encender el vehículo y verificar si la luz de ABS se apaga a los pocos segundos." },
      { tipo: "check", texto: "Realizar una frenada controlada en un lugar seguro para comprobar si el pedal vibra." },
      { tipo: "check", texto: "Observar si alguna rueda tiende a bloquearse en una frenada brusca." }
    ]
  },

  frenos: {
    preguntas: [
      { tipo: "siNo", texto: "¿El pedal de freno se siente esponjoso, duro o demasiado bajo?" },
      { tipo: "siNo", texto: "¿Ha notado ruidos (chirridos, roces metálicos) al frenar?" },
      { tipo: "siNo", texto: "¿El auto se desvía hacia un lado al frenar?" },
      { tipo: "siNo", texto: "¿El freno de mano sostiene bien el auto en pendiente?" }
    ],
    pasos: [
      { tipo: "check", texto: "Revisar visualmente el nivel del líquido de frenos en el depósito." },
      { tipo: "check", texto: "Inspeccionar discos y pastillas por desgaste." },
      { tipo: "check", texto: "En una calle segura, probar que el freno de mano detenga el auto suavemente." }
    ]
  },

  filtroParticulas: {
    preguntas: [
      { tipo: "siNo", texto: "¿Se enciende el testigo del filtro de partículas en el tablero?" },
      { tipo: "siNo", texto: "¿Ha notado pérdida de potencia, consumo elevado o humo excesivo?" },
      { tipo: "siNo", texto: "¿El auto hace regeneraciones frecuentes?" }
    ],
    pasos: [
      { tipo: "opciones", texto: "Color de humo del escape", opciones: ["Blanco", "Negro", "Azul", "Ninguno"] },
      { tipo: "check", texto: "Revisar si los recorridos suelen ser muy cortos." },
      { tipo: "check", texto: "Realizar un trayecto largo (20–30 minutos en carretera) y ver si el testigo se apaga." }
    ]
  },

  lights: {
    preguntas: [
      { tipo: "siNo", texto: "¿Funcionan todas las luces: bajas, altas, freno, intermitentes y retroceso?" },
      { tipo: "siNo", texto: "¿Alguna luz parpadea o se ve más tenue de lo normal?" },
      { tipo: "siNo", texto: "¿El testigo de luces en el tablero marca alguna falla?" }
    ],
    pasos: [
      { tipo: "check", texto: "Encender todas las luces y comprobarlas desde fuera o con ayuda de otra persona." },
      { tipo: "check", texto: "Revisar que las luces de freno se enciendan al presionar el pedal." },
      { tipo: "check", texto: "Confirmar que las luces se vean de intensidad uniforme." }
    ]
  },

  airbag: {
    preguntas: [
      { tipo: "siNo", texto: "¿Se mantiene encendido el testigo del airbag en el tablero?" },
      { tipo: "siNo", texto: "¿El auto ha sufrido algún golpe o accidente reciente?" },
      { tipo: "siNo", texto: "¿Alguna luz o mensaje de error aparece en el tablero?" }
    ],
    pasos: [
      { tipo: "check", texto: "Verificar al encender el vehículo que el testigo de airbag se encienda y luego se apague." },
      { tipo: "check", texto: "Observar si el asiento del acompañante detecta correctamente el peso." }
    ]
  },

  motor: {
    preguntas: [
      { tipo: "siNo", texto: "¿Se enciende el testigo 'check engine'?" },
      { tipo: "siNo", texto: "¿El motor arranca con normalidad o le cuesta más de lo habitual?" },
      { tipo: "siNo", texto: "¿Ha notado pérdida de potencia, vibraciones o ruidos extraños?" },
      { tipo: "siNo", texto: "¿El consumo de combustible es mayor al normal?" }
    ],
    pasos: [
      { tipo: "opciones", texto: "Color de humo del escape", opciones: ["Blanco", "Negro", "Azul", "Ninguno"] },
      { tipo: "check", texto: "Revisar nivel de aceite y refrigerante." },
      { tipo: "check", texto: "Escuchar ruidos irregulares al acelerar en neutro." }
    ]
  },

  bateria: {
    preguntas: [
      { tipo: "siNo", texto: "¿Cuesta encender el auto, sobre todo en las mañanas?" },
      { tipo: "siNo", texto: "¿Las luces del tablero se ven más tenues de lo normal?" },
      { tipo: "siNo", texto: "¿Se enciende el testigo de batería al conducir?" }
    ],
    pasos: [
      { tipo: "check", texto: "Revisar si los bornes de la batería están limpios y bien ajustados." },
      { tipo: "check", texto: "Encender luces y radio con el motor apagado para ver si se debilitan rápido." },
      { tipo: "check", texto: "Observar si el alternador carga correctamente." }
    ]
  },

  TPMS: {
    preguntas: [
      { tipo: "siNo", texto: "¿Se enciende el testigo de presión en el tablero?" },
      { tipo: "siNo", texto: "¿Algún neumático se ve más bajo de aire a simple vista?" },
      { tipo: "siNo", texto: "¿Siente vibraciones o ruidos extraños al manejar?" }
    ],
    pasos: [
      { tipo: "check", texto: "Revisar neumáticos visualmente por desgaste irregular o pinchazos." },
      { tipo: "check", texto: "Medir presión con un manómetro y compararla con la recomendada." },
      { tipo: "check", texto: "Verificar desgaste del dibujo y profundidad mínima (1,6 mm)." }
    ]
  }
};
