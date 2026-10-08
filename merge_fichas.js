import fs from 'fs';

const existingFichas = JSON.parse(fs.readFileSync('data/fichas/fichas.json', 'utf8'));

const newFichas = [
  {
    id: "FICHA-CG-NOBEL-SANMARTIN",
    title: "Cultura General: Nobel Latinoamericanos e Identidad de San Martín",
    subject: "Cultura General",
    topic: "Premios Nobel y Región San Martín",
    subtopic: "Nobel de Literatura e Historia UNSM",
    level: "BASICO",
    summary: "Compendio esencial sobre los galardonados con el Premio Nobel de Literatura en América Latina y los hitos fundacionales de la Universidad Nacional de San Martín y sus 10 provincias.",
    concepts: [
      {
        name: "Premios Nobel Latinoamericanos",
        description: "Gabriela Mistral (1945, Chile, primera mujer y figura latina), Miguel Ángel Asturias (1967, Guatemala), Pablo Neruda (1971, Chile), Gabriel García Márquez (1982, Colombia), Octavio Paz (1990, México) y Mario Vargas Llosa (2010, Perú)."
      },
      {
        name: "Creación de la UNSM",
        description: "Creada por Decreto Ley Nº 22803 el 18 de diciembre de 1979 durante el régimen militar de Francisco Morales Bermúdez Cerruti, como fruto de las demandas del pueblo de Tarapoto."
      },
      {
        name: "Geografía de San Martín",
        description: "10 provincias: Moyobamba (capital departamental), Rioja, Lamas, El Dorado, San Martín (Tarapoto), Picota, Bellavista, Huallaga, Mariscal Cáceres y Tocache. 77 distritos."
      }
    ],
    formulas: [
      { label: "Primer Nobel Latina", formula: "Gabriela Mistral (1945) - Poesía" },
      { label: "Nobel del Perú", formula: "Mario Vargas Llosa (2010) - La ciudad y los perros" },
      { label: "Fundación de Tarapoto", formula: "20 de agosto de 1782 (Obispo Martínez de Compagnon)" }
    ],
    examples: [
      {
        statement: "¿Quién escribió 'El bagrecico' y en qué provincia nació?",
        solution: [
          "El autor es Francisco Izquierdo Ríos, nacido en Saposoa (provincia de Huallaga, San Martín).",
          "Figura clave de la literatura infantil y amazónica del Perú."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "¿Cuál es la reforma parlamentaria que regirá en el Perú desde 2026?",
        steps: [
          "Retorno al Congreso Bicameral.",
          "Composición: 130 Diputados + 60 Senadores (Total 190)."
        ],
        conclusion: "Aprobado por reforma constitucional."
      }
    ],
    commonMistakes: [
      "Creer que Tarapoto es la capital política del departamento (la capital es Moyobamba).",
      "Confundir la fecha del Nobel de Vargas Llosa (2010) con premios anteriores como el Cervantes (1994)."
    ],
    tips: [
      "Si la pregunta de UNSM menciona Saposoa o relatos de selva infantil, la clave es Francisco Izquierdo Ríos.",
      "Para las 10 provincias, acuérdate de las capitales fluviales del río Huallaga y del río Mayo."
    ],
    miniPractice: [
      {
        question: "¿En qué año recibió Mario Vargas Llosa el Premio Nobel de Literatura?",
        options: ["1990", "1994", "2000", "2010", "2015"],
        answer: "2010",
        quickExplanation: "Recibió el galardón en 2010 por su cartografía de las estructuras de poder."
      },
      {
        question: "¿Cuántas provincias integran el departamento de San Martín?",
        options: ["8", "10", "12", "7", "15"],
        answer: "10",
        quickExplanation: "Consta de exactamente 10 provincias y 77 distritos."
      },
      {
        question: "¿Quién fundó la ciudad de Tarapoto el 20 de agosto de 1782?",
        options: ["Francisco de Orellana", "Baltazar Jaime Martínez de Compagnon", "Morales Bermúdez", "Pedro de Urzúa", "Lope de Aguirre"],
        answer: "Baltazar Jaime Martínez de Compagnon",
        quickExplanation: "El obispo de Trujillo Baltazar Jaime Martínez de Compagnon y Bujanda."
      }
    ],
    relatedQuestions: ["Q-UNSM-CG-2026-001", "Q-UNSM-CG-2026-002", "Q-UNSM-CG-2026-003"],
    relatedMaterials: ["MAT-GUIA-PORCENTAJES-01"]
  },
  {
    id: "FICHA-RM-OPERADORES",
    title: "Operadores Matemáticos Arbitrarios y Reglas de Correspondencia",
    subject: "Razonamiento Matematico",
    topic: "Distribuciones y Operadores",
    subtopic: "Operadores con Ley Explícita e Implícita",
    level: "INTERMEDIO",
    summary: "Los operadores arbitrarios definen relaciones funcionales mediante símbolos no convencionales (*, #, Δ, ⊕) sujetos a reglas de correspondencia algebraica que deben respetarse en orden estricto.",
    concepts: [
      {
        name: "Operador Matemático",
        "description": "Símbolo que por sí mismo no posee significado hasta que se le asocia una ley matemática formal (ej: a * b = 2a + 3b - ab)."
      },
      {
        name: "Principio de Sustitución Directa",
        description: "Identificar el primer y segundo componente e insertarlos en la regla numérica sin alterar signos de agrupación."
      }
    ],
    formulas: [
      { label: "Operador Binario Estándar", formula: "x # y = f(x, y)" },
      { label: "Operador en Tablas de Doble Entrada", formula: "Fila (primer elemento) ∩ Columna (segundo elemento)" }
    ],
    examples: [
      {
        statement: "Si a ⊕ b = (a + b) / (a - b), calcular 5 ⊕ 3.",
        solution: [
          "Identificar: a = 5, b = 3.",
          "5 ⊕ 3 = (5 + 3) / (5 - 3) = 8 / 2 = 4."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "Si a * b = 2a + 3b - ab, hallar (4 * 2) * 3.",
        steps: [
          "Paso 1: 4 * 2 = 2(4) + 3(2) - (4)(2) = 8 + 6 - 8 = 6.",
          "Paso 2: 6 * 3 = 2(6) + 3(3) - (6)(3) = 12 + 9 - 18 = 3."
        ],
        conclusion: "El valor numérico final es 3."
      }
    ],
    commonMistakes: [
      "Asumir propiedad asociativa o conmutativa sin que esté demostrada en el operador.",
      "Invertir el orden de los elementos a y b al evaluar expresiones anidadas."
    ],
    tips: [
      "Siempre resuelve de adentro hacia afuera respetando los paréntesis.",
      "Si el operador es recursivo, busca el valor numérico del bucle o un patrón cíclico."
    ],
    miniPractice: [
      {
        question: "Si x Δ y = 3x - 2y, calcular 4 Δ 5:",
        options: ["2", "1", "3", "4", "0"],
        answer: "2",
        quickExplanation: "3(4) - 2(5) = 12 - 10 = 2."
      },
      {
        question: "Si m # n = m² - n, ¿cuál es el valor de 3 # (2 # 1)?",
        options: ["6", "5", "7", "4", "8"],
        answer: "6",
        quickExplanation: "2 # 1 = 2² - 1 = 3. Luego 3 # 3 = 3² - 3 = 9 - 3 = 6."
      },
      {
        question: "Si a ∇ b = 2a + b, hallar x en: x ∇ 4 = 14.",
        options: ["4", "5", "6", "7", "3"],
        answer: "5",
        quickExplanation: "2x + 4 = 14 => 2x = 10 => x = 5."
      }
    ],
    relatedQuestions: ["Q-PRONABEC-RM-OPER-001"],
    relatedMaterials: ["MAT-GUIA-ALGEBRA-CARDANO-01"]
  }
];

const mapF = new Map();
existingFichas.forEach(f => mapF.set(f.id, f));
newFichas.forEach(f => mapF.set(f.id, f));

const combinedF = Array.from(mapF.values());
fs.writeFileSync('data/fichas/fichas.json', JSON.stringify(combinedF, null, 2), 'utf8');
fs.writeFileSync('public/data/fichas/fichas.json', JSON.stringify(combinedF, null, 2), 'utf8');

console.log('SUCCESS! TOTAL FICHAS:', combinedF.length);
