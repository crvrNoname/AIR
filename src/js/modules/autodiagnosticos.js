export const AUTODIAG = {
  ABS: {
    preguntas: [
      "¿Se enciende el testigo de ABS en el tablero al encender el vehículo y se apaga después?",
      "¿Ha sentido vibraciones o ruidos extraños en el pedal de freno al frenar fuerte?",
      "¿El auto mantiene la trayectoria en frenadas bruscas o se desvía?"
    ],
    pasos: [
      "Encender el vehículo y verificar si la luz de ABS se apaga a los pocos segundos.",
      "Realizar una frenada controlada en un lugar seguro para comprobar si el pedal vibra.",
      "Observar si alguna rueda tiende a bloquearse en una frenada brusca."
    ]
  },

  frenos: {
    preguntas: [
      "¿El pedal de freno se siente esponjoso, duro o demasiado bajo?",
      "¿Ha notado ruidos (chirridos, roces metálicos) al frenar?",
      "¿El auto se desvía hacia un lado al frenar?",
      "¿El freno de mano sostiene bien el auto en pendiente?"
    ],
    pasos: [
      "Revisar visualmente el nivel del líquido de frenos en el depósito.",
      "Inspeccionar discos y pastillas por desgaste.",
      "En una calle segura, probar que el freno de mano detenga el auto suavemente."
    ]
  },

  filtroParticulas: {
    preguntas: [
      "¿Se enciende el testigo del filtro de partículas en el tablero?",
      "¿Ha notado pérdida de potencia, consumo elevado o humo excesivo?",
      "¿El auto hace regeneraciones frecuentes?"
    ],
    pasos: [
      "Observar si sale humo negro o blanco del escape de manera anormal.",
      "Revisar si los recorridos suelen ser muy cortos.",
      "Realizar un trayecto largo (20–30 minutos en carretera) y ver si el testigo se apaga."
    ]
  },

  lights: {
    preguntas: [
      "¿Funcionan todas las luces: bajas, altas, freno, intermitentes y retroceso?",
      "¿Alguna luz parpadea o se ve más tenue de lo normal?",
      "¿El testigo de luces en el tablero marca alguna falla?"
    ],
    pasos: [
      "Encender todas las luces y comprobarlas desde fuera o con ayuda de otra persona.",
      "Revisar que las luces de freno se enciendan al presionar el pedal.",
      "Confirmar que las luces se vean de intensidad uniforme."
    ]
  },

  airbag: {
    preguntas: [
      "¿Se mantiene encendido el testigo del airbag en el tablero?",
      "¿El auto ha sufrido algún golpe o accidente reciente?",
      "¿Alguna luz o mensaje de error aparece en el tablero?"
    ],
    pasos: [
      "Verificar al encender el vehículo que el testigo de airbag se encienda y luego se apague.",
      "Observar si el asiento del acompañante detecta correctamente el peso."
    ]
  },

  motor: {
    preguntas: [
      "¿Se enciende el testigo 'check engine'?",
      "¿El motor arranca con normalidad o le cuesta más de lo habitual?",
      "¿Ha notado pérdida de potencia, vibraciones o ruidos extraños?",
      "¿El consumo de combustible es mayor al normal?"
    ],
    pasos: [
      "Observar el humo de escape (blanco, negro, azul).",
      "Revisar nivel de aceite y refrigerante.",
      "Escuchar ruidos irregulares al acelerar en neutro."
    ]
  },

  bateria: {
    preguntas: [
      "¿Cuesta encender el auto, sobre todo en las mañanas?",
      "¿Las luces del tablero se ven más tenues de lo normal?",
      "¿Se enciende el testigo de batería al conducir?"
    ],
    pasos: [
      "Revisar si los bornes de la batería están limpios y bien ajustados.",
      "Encender luces y radio con el motor apagado para ver si se debilitan rápido.",
      "Observar si el alternador carga correctamente."
    ]
  },

  TPMS: {
    preguntas: [
      "¿Se enciende el testigo de presión en el tablero?",
      "¿Algún neumático se ve más bajo de aire a simple vista?",
      "¿Siente vibraciones o ruidos extraños al manejar?"
    ],
    pasos: [
      "Revisar neumáticos visualmente por desgaste irregular o pinchazos.",
      "Medir presión con un manómetro y compararla con la recomendada.",
      "Verificar desgaste del dibujo y profundidad mínima (1,6 mm)."
    ]
  }
};
