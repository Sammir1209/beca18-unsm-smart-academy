import fs from 'fs';

const currentFichas = JSON.parse(fs.readFileSync('data/fichas/fichas.json', 'utf8'));

const fichasExpandidas = [
  // 1. ÁLGEBRA: PRODUCTOS NOTABLES Y CAUCHY
  {
    id: "FICHA-ALG-PRODUCTOS-NOTABLES",
    title: "Productos Notables, Legendre y Cauchy",
    subject: "Algebra",
    topic: "Productos Notables y Factorizacion",
    subtopic: "Identidades de Legendre y Cauchy",
    level: "INTERMEDIO",
    iconKey: "zap",
    summary: "Los productos notables son multiplicaciones algebraicas cuyo resultado se escribe por simple inspección, sin necesidad de aplicar distributiva. Ahorran hasta 3 minutos por ejercicio en el examen.",
    concepts: [
      {
        name: "¿Qué es un Producto Notable?",
        description: "Formas canónicas como el binomio al cuadrado, binomio al cubo y diferencia de cuadrados que transforman operaciones complejas en igualdades inmediatas."
      },
      {
        name: "Identidades de Legendre",
        description: "Permiten sumar o restar binomios al cuadrado sin desarrollar trinomios: reducen el cálculo a un solo término."
      },
      {
        name: "Identidad Semidesarrollada de Cauchy",
        description: "Forma óptima para expresiones simétricas del tipo (x + 1/x) donde se conocen la suma y el producto."
      }
    ],
    formulas: [
      { label: "Legendre (Suma)", formula: "(a + b)² + (a - b)² = 2(a² + b²)" },
      { label: "Legendre (Resta)", formula: "(a + b)² - (a - b)² = 4ab" },
      { label: "Cauchy (Binomio al Cubo)", formula: "(a + b)³ = a³ + b³ + 3ab(a + b)" },
      { label: "Diferencia de Cuadrados", formula: "a² - b² = (a + b)(a - b)" },
      { label: "Truco x + 1/x = k", formula: "x² + 1/x² = k² - 2  |  x³ + 1/x³ = k³ - 3k" }
    ],
    examples: [
      {
        statement: "Si x + 1/x = 4, hallar x³ + 1/x³.",
        solution: [
          "Aplicamos la fórmula directa de Cauchy: E = k³ - 3k.",
          "Reemplazamos k = 4: E = 4³ - 3(4) = 64 - 12 = 52."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "Simplificar: M = [(x + 2y)² - (x - 2y)²] / (4xy)",
        steps: [
          "Reconocemos en el numerador la segunda identidad de Legendre: (a + b)² - (a - b)² = 4ab.",
          "Aquí a = x, b = 2y: Numerador = 4(x)(2y) = 8xy.",
          "Dividimos: M = 8xy / 4xy = 2."
        ],
        conclusion: "M = 2 en un solo paso gracias a Legendre."
      }
    ],
    commonMistakes: [
      "Olvidar el doble producto: creer erróneamente que (a + b)² = a² + b².",
      "Confundir Legendre resta (4ab) con Legendre suma (2(a² + b²))."
    ],
    tips: [
      "¡Memoria fotográfica!: Si te piden x³ + 1/x³, siempre es k³ - 3k.",
      "Si ves suma y resta de binomios al cuadrado, usa Legendre inmediatamente y no desarrolles término a término."
    ],
    miniPractice: [
      {
        question: "Si x + 1/x = 3, ¿cuánto vale x² + 1/x²?",
        options: ["7", "9", "6", "8", "5"],
        answer: "7",
        quickExplanation: "k² - 2 = 3² - 2 = 9 - 2 = 7."
      },
      {
        question: "Calcular: (√5 + √2)² - (√5 - √2)²",
        options: ["4√10", "2√10", "10", "4", "2"],
        answer: "4√10",
        quickExplanation: "Por Legendre resta: 4ab = 4(√5)(√2) = 4√10."
      },
      {
        question: "Factorizar x⁴ - 16:",
        options: ["(x² + 4)(x + 2)(x - 2)", "(x + 2)⁴", "(x² - 4)²", "(x - 2)⁴", "(x² + 4)²"],
        answer: "(x² + 4)(x + 2)(x - 2)",
        quickExplanation: "Doble diferencia de cuadrados: (x² + 4)(x² - 4) = (x² + 4)(x + 2)(x - 2)."
      }
    ],
    relatedQuestions: ["Q-UNSM-2024-ORD-015"],
    relatedMaterials: ["MAT-GUIA-ALGEBRA-CARDANO-01"]
  },

  // 2. GEOMETRÍA: RELACIONES MÉTRICAS
  {
    id: "FICHA-GEO-RELACIONES-METRICAS",
    title: "Relaciones Métricas en el Triángulo Rectángulo",
    subject: "Geometria",
    topic: "Semejanza y Relaciones Metricas",
    subtopic: "Teoremas de la Altura y Catetos",
    level: "INTERMEDIO",
    iconKey: "compass",
    summary: "Propiedades que vinculan las longitudes de los catetos, la hipotenusa, la altura relativa y las proyecciones ortogonales sin necesidad de recurrir a trigonometría.",
    concepts: [
      {
        name: "Proyección Ortogonal",
        description: "Sombra perpendicular que proyecta un cateto sobre la hipotenusa al trazar la altura relativa a ella (m y n)."
      },
      {
        name: "Teorema de la Altura",
        description: "La altura relativa a la hipotenusa es media geométrica entre las proyecciones de los catetos (h² = m * n)."
      },
      {
        name: "Teorema del Cateto",
        description: "Cada cateto al cuadrado es igual al producto de la hipotenusa total por su proyección (c² = a * m)."
      }
    ],
    formulas: [
      { label: "Teorema de Pitágoras", formula: "a² = b² + c²" },
      { label: "Altura al Cuadrado", formula: "h² = m * n" },
      { label: "Cateto al Cuadrado", formula: "b² = a * n  |  c² = a * m" },
      { label: "Producto de Catetos", formula: "b * c = a * h" },
      { label: "Inversa de Altura", formula: "1/h² = 1/b² + 1/c²" }
    ],
    examples: [
      {
        statement: "En un triángulo rectángulo, la hipotenusa mide 13 cm y un cateto mide 5 cm. Calcular la altura relativa a la hipotenusa.",
        solution: [
          "Por Pitágoras: el otro cateto mide √(13² - 5²) = √(169 - 25) = √144 = 12 cm.",
          "Usamos: b * c = a * h  =>  5 * 12 = 13 * h  =>  60 = 13h  =>  h = 60/13 cm."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "Las proyecciones de los catetos sobre la hipotenusa son 4 y 9. Hallar la altura relativa.",
        steps: [
          "Fórmula directa: h² = m * n = 4 * 9 = 36.",
          "h = √36 = 6."
        ],
        conclusion: "La altura es 6."
      }
    ],
    commonMistakes: [
      "Confundir la hipotenusa total con una sola proyección m.",
      "Olvidar que todas estas fórmulas exigen que el triángulo sea estrictamente RECTÁNGULO."
    ],
    tips: [
      "Si el problema te da las dos proyecciones de los catetos, piensa al instante en h = √(m * n).",
      "El producto de catetos siempre es igual a hipotenusa por altura: b*c = a*h."
    ],
    miniPractice: [
      {
        question: "Si m = 2 y n = 8, ¿cuánto vale la altura h?",
        options: ["4", "5", "6", "3", "8"],
        answer: "4",
        quickExplanation: "h = √(2 * 8) = √16 = 4."
      },
      {
        question: "Si los catetos son 6 y 8, la hipotenusa es 10. ¿Cuánto mide la altura h?",
        options: ["4.8", "5.2", "4.5", "5.0", "3.6"],
        answer: "4.8",
        quickExplanation: "6 * 8 = 10 * h => h = 48/10 = 4.8."
      },
      {
        question: "Si la hipotenusa es 25 y la proyección de un cateto es 9, ¿cuánto mide dicho cateto?",
        options: ["15", "12", "18", "20", "16"],
        answer: "15",
        quickExplanation: "c² = 25 * 9 = 225 => c = 15."
      }
    ],
    relatedQuestions: ["Q-UNSM-2023-ORD-018"],
    relatedMaterials: ["MAT-GUIA-PORCENTAJES-01"]
  },

  // 3. FÍSICA: ESTÁTICA Y EQUILIBRIO
  {
    id: "FICHA-FIS-ESTATICA-EQUILIBRIO",
    title: "Estática: Primera Condición de Equilibrio y DCL",
    subject: "Fisica",
    topic: "Estatica y Dinamica",
    subtopic: "Leyes de Newton y Equilibrio de Traslación",
    level: "INTERMEDIO",
    iconKey: "target",
    summary: "Estudio de las condiciones bajo las cuales un cuerpo permanece en reposo o en velocidad constante (MRU). Pilar fundamental de las preguntas de ciencias de la UNSM.",
    concepts: [
      {
        name: "Primera Ley de Newton (Inercia)",
        description: "Todo cuerpo persevera en su estado de reposo o movimiento rectilíneo uniforme a menos que actúe sobre él una fuerza neta no nula."
      },
      {
        name: "Diagrama de Cuerpo Libre (DCL)",
        description: "Gráfico aislado del cuerpo mostrando todas las fuerzas externas que actúan sobre él: Peso (mg), Normal (N), Tensión (T) y Rozamiento (f)."
      },
      {
        name: "Primera Condición de Equilibrio",
        description: "La fuerza resultante debe ser cero: ΣFx = 0 (fuerzas a la derecha = fuerzas a la izquierda) y ΣFy = 0 (fuerzas hacia arriba = fuerzas hacia abajo)."
      }
    ],
    formulas: [
      { label: "Equilibrio Vectorial", formula: "ΣF = 0" },
      { label: "Equilibrio Horizontal", formula: "ΣF(derecha) = ΣF(izquierda)" },
      { label: "Equilibrio Vertical", formula: "ΣF(arriba) = ΣF(abajo)" },
      { label: "Peso", formula: "P = m * g (siempre vertical hacia el centro terrestre)" },
      { label: "Fuerza Normal", formula: "Perpendicular a la superficie de contacto hacia el cuerpo" }
    ],
    examples: [
      {
        statement: "Un bloque de masa 8 kg está en reposo sobre un piso horizontal. Calcular la fuerza normal si g = 10 m/s².",
        solution: [
          "Peso: P = m * g = 8 * 10 = 80 N (hacia abajo).",
          "Como no hay aceleración vertical: Normal = Peso = 80 N (hacia arriba)."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "Una cuerda sostiene un bloque de 50 N y se tira de él hacia la derecha con 30 N manteniendo el equilibrio. ¿Cuál es la tensión en la cuerda?",
        steps: [
          "Formamos el triángulo de fuerzas cerrado: Tensión hipotenusa, Peso vertical (50 N), Fuerza horizontal (30 N).",
          "T² = (30)² + (50)² = 900 + 2500 = 3400 => T = √3400 ≈ 58.3 N."
        ],
        conclusion: "El triángulo de fuerzas se cierra al estar en equilibrio."
      }
    ],
    commonMistakes: [
      "Dibujar la fuerza normal en la misma dirección que la superficie en vez de perpendicular.",
      "Creer que la normal siempre es igual al peso cuando hay planos inclinados o fuerzas oblicuas."
    ],
    tips: [
      "¡Siempre haz el DCL antes de escribir una sola ecuación!",
      "Si actúan 3 fuerzas concurrentes no paralelas, forma un triángulo cerrado y usa triángulos notables (37°-53°)."
    ],
    miniPractice: [
      {
        question: "Si un bloque de 100 N descansa sobre una mesa horizontal, ¿cuánto vale la Normal?",
        options: ["100 N", "50 N", "0 N", "200 N", "98 N"],
        answer: "100 N",
        quickExplanation: "ΣFy = 0 => Normal = Peso = 100 N."
      },
      {
        question: "En un plano horizontal liso, si una fuerza de 20 N tira a la derecha y 20 N a la izquierda, la fuerza neta es:",
        options: ["0 N", "40 N", "20 N", "10 N", "5 N"],
        answer: "0 N",
        quickExplanation: "Fuerzas opuestas e iguales se anulan: Resultante = 0 N."
      },
      {
        question: "¿Hacia dónde apunta siempre el peso de un cuerpo?",
        options: ["Verticalmente hacia abajo", "Perpendicular a la superficie", "En dirección del movimiento", "Hacia el norte", "Paralelo al plano"],
        answer: "Verticalmente hacia abajo",
        quickExplanation: "La gravedad atrae los cuerpos hacia el centro de la Tierra en dirección vertical."
      }
    ],
    relatedQuestions: ["Q-UNSM-2023-ORD-055"],
    relatedMaterials: ["MAT-GUIA-FISICA-CINEMATICA-01"]
  },

  // 4. QUÍMICA: CONFIGURACIÓN ELECTRÓNICA
  {
    id: "FICHA-QUIM-CONFIGURACION-ELECTRONICA",
    title: "Estructura Atómica y Configuración Electrónica (Regla del Serrucho)",
    subject: "Quimica",
    topic: "Estructura Atomica y Tabla Periodica",
    subtopic: "Principio de Aufbau y Electrones de Valencia",
    level: "INTERMEDIO",
    iconKey: "brain",
    summary: "El ordenamiento de los electrones en niveles, subniveles y orbitales según el principio de mínima energía (Aufbau). Determina la ubicación de los elementos en la tabla periódica y su reactividad.",
    concepts: [
      {
        name: "Número Atómico (Z)",
        description: "Cantidad de protones en el núcleo. En un átomo neutro: Z = Protones = Electrones (PE = Z)."
      },
      {
        name: "Subniveles de Energía",
        description: "s (máx 2 e⁻), p (máx 6 e⁻), d (máx 10 e⁻), f (máx 14 e⁻). Mnemotecnia: 'Sopa De Fideos'."
      },
      {
        name: "Electrones de Valencia",
        description: "Los electrones ubicados exclusivamente en el nivel más externo (mayor n). Definen el grupo en la tabla periódica."
      }
    ],
    formulas: [
      { label: "Regla Mnemotécnica del Serrucho", formula: "Si Sopa Sopa Se Da Pensión Se Da Pensión Se Fue De Paseo..." },
      { label: "Capacidad por subnivel", formula: "s²  p⁶  d¹⁰  f¹⁴" },
      { label: "Electrones de Valencia", formula: "Electrones del mayor nivel n (s + p)" }
    ],
    examples: [
      {
        statement: "Determinar los electrones de valencia del Sodio (Z = 11).",
        solution: [
          "Configuración: 1s² 2s² 2p⁶ 3s¹.",
          "Mayor nivel es n = 3.",
          "En el nivel 3 solo hay 1 electrón (3s¹). Por lo tanto, tiene 1 electrón de valencia (Grupo IA / Alcalinos)."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "Hallar el periodo y grupo de un elemento con Z = 17.",
        steps: [
          "Configuración: 1s² 2s² 2p⁶ 3s² 3p⁵.",
          "Mayor nivel: n = 3 => Periodo 3.",
          "Electrones en el nivel 3: 2 + 5 = 7 electrones => Grupo VIIA (Halógenos)."
        ],
        conclusion: "Periodo 3, Grupo VIIA, 7 electrones de valencia."
      }
    ],
    commonMistakes: [
      "Contar los electrones del último subnivel en vez del último NIVEL completo (ej. en 3s² 3p⁵ decir que son 5 en vez de 7).",
      "Llenar 3d antes que 4s (4s tiene menor energía relativa y se llena primero: 1s 2s 2p 3s 3p 4s 3d)."
    ],
    tips: [
      "Usa gases nobles para resumir: [10Ne] 3s² 3p⁵ ahorra escribir toda la cadena.",
      "Mnemotecnia clásica peruana: 'Si Sopa Sopa Se Da Pensión Se Da Pensión...'."
    ],
    miniPractice: [
      {
        question: "¿Cuántos electrones como máximo acepta el subnivel p?",
        options: ["6", "2", "10", "14", "8"],
        answer: "6",
        quickExplanation: "s=2, p=6, d=10, f=14."
      },
      {
        question: "Un átomo con Z = 8 (Oxígeno) tiene en su último nivel cuántos electrones:",
        options: ["6", "8", "4", "2", "5"],
        answer: "6",
        quickExplanation: "1s² 2s² 2p⁴ => Mayor nivel es 2 con 2 + 4 = 6 electrones de valencia."
      },
      {
        question: "El elemento con configuración 1s² 2s² 2p⁶ 3s² pertenece al grupo:",
        options: ["IIA", "IA", "IIIA", "IVA", "VIIIA"],
        answer: "IIA",
        quickExplanation: "Termina en 3s² => 2 electrones de valencia en s => Grupo IIA (Alcalinotérreos)."
      }
    ],
    relatedQuestions: ["Q-UNSM-2024-ORD-062"],
    relatedMaterials: ["MAT-GUIA-PORCENTAJES-01"]
  },

  // 5. HISTORIA DEL PERÚ: HORIZONTES CULTURALES
  {
    id: "FICHA-HIST-HORIZONTES-CULTURALES",
    title: "Horizontes e Intermedios Culturales del Perú Prehispánico",
    subject: "Historia del Peru",
    topic: "Peru Prehispanico",
    subtopic: "Periodificación de John Rowe y Sociedades Andinas",
    level: "BASICO",
    iconKey: "book",
    summary: "La periodificación estándar del Perú prehispánico propuesta por John Rowe clasifica las culturas en Horizontes (etapas de síntesis e integración panandina) e Intermedios (etapas de florecimiento regional diversificado).",
    concepts: [
      {
        name: "Horizonte Cultural",
        description: "Periodo en el que una cultura ejerce hegemonía estilística, religiosa, económica o militar sobre gran parte del territorio andino (panandina)."
      },
      {
        name: "Intermedio Cultural",
        description: "Periodo de fragmentación y autonomía donde florecen culturas regionales ricas con identidades locales distintivas."
      },
      {
        name: "Trilogía de Horizontes",
        description: "Horizonte Temprano (Chavín y Paracas), Horizonte Medio (Wari y Tiahuanaco), Horizonte Tardío (Inca / Tahuantinsuyo)."
      }
    ],
    formulas: [
      { label: "Horizonte Temprano", formula: "Chavín (Panandina religiosa / formativo) + Paracas" },
      { label: "Intermedio Temprano", formula: "Mochica (Moche) + Nasca (maestros orfebres e hidráulicos)" },
      { label: "Horizonte Medio", formula: "Wari (Imperio urbano) + Tiahuanaco (colonias agrícolas altiplano)" },
      { label: "Intermedio Tardío", formula: "Chimú (Chan Chan) + Chachapoyas + Chincha (comercio)" },
      { label: "Horizonte Tardío", formula: "Imperio Inca (Tahuantinsuyo - Pachacútec)" }
    ],
    examples: [
      {
        statement: "¿Por qué Chavín es considerado el primer horizonte cultural?",
        solution: [
          "Porque su culto al felino y su iconografía religiosa se expandió por la costa, sierra norte y centro del Perú, unificando culturalmente el territorio andino."
        ]
      }
    ],
    solvedExamples: [
      {
        problem: "¿Cuál fue el primer imperio panandino planificador de ciudades?",
        steps: [
          "Wari en el Horizonte Medio.",
          "Fundó ciudades cabeceras de región como Piquillacta, Huiracochapampa y Cajamarquilla."
        ],
        conclusion: "Wari es el primer imperio urbano de los Andes."
      }
    ],
    commonMistakes: [
      "Creer que los incas fueron el primer horizonte (fueron el TERCERO y último).",
      "Confundir Mochica (Intermedio Temprano) con Chimú (Intermedio Tardío)."
    ],
    tips: [
      "Mnemotecnia de Horizontes: Cha-Wa-In (Chavín, Wari, Inca).",
      "Intermedio Temprano: Moche y Nasca. Intermedio Tardío: Chimú y Chachapoyas."
    ],
    miniPractice: [
      {
        question: "¿Qué cultura representa el Horizonte Temprano?",
        options: ["Chavín", "Wari", "Chimú", "Inca", "Mochica"],
        answer: "Chavín",
        quickExplanation: "Chavín es la cultura matriz del Horizonte Temprano."
      },
      {
        question: "La ciudadela de barro de Chan Chan pertenece a la cultura:",
        options: ["Chimú", "Mochica", "Paracas", "Chavín", "Sicán"],
        answer: "Chimú",
        quickExplanation: "Chan Chan fue la capital del reino Chimú en La Libertad."
      },
      {
        question: "Wari tuvo su centro de origen y expansión en el departamento de:",
        options: ["Ayacucho", "Cuzco", "Puno", "Junín", "Ancash"],
        answer: "Ayacucho",
        quickExplanation: "Wari se originó en Ayacucho a partir de la cultura Huarpa con influencias Nasca y Tiahuanaco."
      }
    ],
    relatedQuestions: ["Q-UNSM-HIST-003", "Q-UNSM-HIST-004"],
    relatedMaterials: ["MAT-GUIA-PORCENTAJES-01"]
  }
];

const mapAll = new Map();
currentFichas.forEach(f => mapAll.set(f.id, f));
fichasExpandidas.forEach(f => mapAll.set(f.id, f));

const resultFichas = Array.from(mapAll.values());
fs.writeFileSync('data/fichas/fichas.json', JSON.stringify(resultFichas, null, 2), 'utf8');
fs.writeFileSync('public/data/fichas/fichas.json', JSON.stringify(resultFichas, null, 2), 'utf8');

console.log('FICHAS EXPANDIDAS EXITOSAMENTE:', resultFichas.length);
