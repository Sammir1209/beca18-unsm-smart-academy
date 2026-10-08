import fs from 'fs';

const existingQuestions = JSON.parse(fs.readFileSync('data/questions/questions.json', 'utf8'));

const newBatch = [
  // ==========================================
  // CULTURA GENERAL 2026-I (DOCUMENTO DEL USUARIO)
  // ==========================================
  {
    id: "Q-UNSM-CG-2026-001",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2026,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Cultura General",
    topic: "Premios Nobel Latinoamericanos",
    subtopic: "Literatura Latinoamericana",
    difficulty: "BASICO",
    competency: "Conocimiento del contexto cultural histórico",
    sourceType: "USER_PROVIDED",
    isFija: true,
    sourceReference: {
      document: "CULTURA GENERAL 2026 I.docx",
      page: 1,
      questionNumber: 1
    },
    rawQuestion: "¿Quién fue la primera figura latinoamericana y hasta el momento la única mujer de la región en recibir el Premio Nobel de Literatura (1945)?",
    options: [
      { id: "A", text: "Isabel Allende" },
      { id: "B", text: "Gabriela Mistral" },
      { id: "C", text: "Sor Juana Inés de la Cruz" },
      { id: "D", text: "Laura Restrepo" },
      { id: "E", text: "Blanca Varela" }
    ],
    correctAnswer: "B",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Identificar el galardón: Premio Nobel de Literatura de 1945.",
        "Paso 2: La poeta chilena Gabriela Mistral (Lucila Godoy Alcayaga) fue galardonada en 1945 con obras célebres como 'Desolación', 'Ternura' y 'Tala'.",
        "Paso 3: Es la primera personalidad de América Latina y la única mujer latinoamericana con el Nobel literario."
      ],
      keyConcept: "Gabriela Mistral (Chile): Primer Nobel de Literatura de Latinoamérica (1945).",
      quickTip: "Pablo Neruda lo ganó en 1971; Gabriela Mistral fue la pionera en 1945.",
      commonPitfall: "Confundirla con Isabel Allende (no tiene Nobel)."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-CG-2026-002",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2026,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Cultura General",
    topic: "Historia y Geografía de San Martín",
    subtopic: "Creación de la Universidad Nacional de San Martín",
    difficulty: "BASICO",
    competency: "Identidad regional y contexto institucional",
    sourceType: "USER_PROVIDED",
    isFija: true,
    sourceReference: {
      document: "CULTURA GENERAL 2026 I.docx",
      page: 2,
      questionNumber: 2
    },
    rawQuestion: "La Universidad Nacional de San Martín (UNSM), pionera casa superior de estudios de la región, fue creada por Decreto Ley Nº 22803 el 18 de diciembre de 1979 durante el gobierno de:",
    options: [
      { id: "A", text: "Fernando Belaúnde Terry" },
      { id: "B", text: "General Francisco Morales Bermúdez Cerruti" },
      { id: "C", text: "General Juan Velasco Alvarado" },
      { id: "D", text: "Alan García Pérez" },
      { id: "E", text: "Alberto Fujimori" }
    ],
    correctAnswer: "B",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Fecha de creación: 18 de diciembre de 1979 mediante Decreto Ley Nº 22803.",
        "Paso 2: En 1979 el presidente del gobierno de facto de las FF.AA. era el General de División EP Francisco Morales Bermúdez Cerruti.",
        "Paso 3: Dicha ley fue el fruto de la huelga y la lucha del pueblo sanmartinense por una universidad pública en Tarapoto."
      ],
      keyConcept: "UNSM creada el 18 de diciembre de 1979 bajo Morales Bermúdez (D.L. 22803).",
      quickTip: "Fija obligatoria en exámenes de admisión UNSM sobre historia institucional.",
      commonPitfall: "Marcar Belaúnde Terry (él asumió en julio de 1980 tras las elecciones)."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-CG-2026-003",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2026,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Cultura General",
    topic: "Geografía de la Región San Martín",
    subtopic: "División Política y Capital",
    difficulty: "BASICO",
    competency: "Espacio geográfico regional",
    sourceType: "USER_PROVIDED",
    isFija: true,
    sourceReference: {
      document: "CULTURA GENERAL 2026 I.docx",
      page: 2,
      questionNumber: 3
    },
    rawQuestion: "El departamento de San Martín consta de 10 provincias y 77 distritos. ¿Cuál es la capital del departamento y quién fundó la ciudad de Tarapoto el 20 de agosto de 1782?",
    options: [
      { id: "A", text: "Tarapoto - Francisco de Orellana" },
      { id: "B", text: "Moyobamba - Obispo Baltazar Jaime Martínez de Compagnon" },
      { id: "C", text: "Lamas - Martín de la Riva y Herrera" },
      { id: "D", text: "Juanjuí - José María Arguedas" },
      { id: "E", text: "Rioja - Toribio Rodríguez de Mendoza" }
    ],
    correctAnswer: "B",
    explanation: {
      solutionStepByStep: [
        "Paso 1: La capital oficial del departamento de San Martín es la ciudad de Moyobamba (la ciudad de las orquídeas).",
        "Paso 2: Tarapoto fue fundada el 20 de agosto de 1782 por el obispo español Baltazar Jaime Martínez de Compagnon y Bujanda.",
        "Paso 3: La combinación correcta es Capital Moyobamba y fundador de Tarapoto Martínez de Compagnon."
      ],
      keyConcept: "Capital: Moyobamba. Tarapoto fundada por el obispo Baltazar Jaime Martínez de Compagnon.",
      quickTip: "Muchos confunden la capital de San Martín pensando que es Tarapoto debido a su dinamismo comercial; la capital política es Moyobamba.",
      commonPitfall: "Marcar Tarapoto como capital del departamento."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-CG-2026-004",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2026,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Cultura General",
    topic: "Literatura Sanmartinense",
    subtopic: "Francisco Izquierdo Ríos",
    difficulty: "BASICO",
    competency: "Identidad cultural amazónica",
    sourceType: "USER_PROVIDED",
    isFija: true,
    sourceReference: {
      document: "CULTURA GENERAL 2026 I.docx",
      page: 2,
      questionNumber: 4
    },
    rawQuestion: "¿Cuál es el escritor sanmartinense nacido en Saposoa más insigne de la Amazonía peruana, autor de célebres obras como 'El bagrecico', 'Gregorillo' y 'Días oscuros'?",
    options: [
      { id: "A", text: "César Calvo" },
      { id: "B", text: "Francisco Izquierdo Ríos" },
      { id: "C", text: "Arturo Hernández" },
      { id: "D", text: "Ciro Alegría" },
      { id: "E", text: "Roger Rumrrill" }
    ],
    correctAnswer: "B",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Identificar autor de Saposoa (1910 - 1981) referente de la narrativa infantil y amazónica.",
        "Paso 2: Francisco Izquierdo Ríos escribió 'El bagrecico' (publicado en 'El colibrí con cola de pavo real'), 'Gregorillo', 'Selva y otros cuentos'.",
        "Paso 3: Es el escritor cumbre de la literatura regional sanmartinense evaluado en UNSM."
      ],
      keyConcept: "Francisco Izquierdo Ríos: Narrador por excelencia de la Amazonía y San Martín.",
      quickTip: "Si en el examen de la UNSM mencionan 'El bagrecico' o Saposoa, la respuesta es Francisco Izquierdo Ríos.",
      commonPitfall: "Confundir con Arturo Hernández (autor de 'Sangama')."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-CG-2026-005",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2026,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Cultura General",
    topic: "Constitución y Reforma Política",
    subtopic: "Bicameralidad del Congreso del Perú 2026",
    difficulty: "INTERMEDIO",
    competency: "Educación Cívica y Sistema Político",
    sourceType: "USER_PROVIDED",
    isFija: true,
    sourceReference: {
      document: "CULTURA GENERAL 2026 I.docx",
      page: 3,
      questionNumber: 5
    },
    rawQuestion: "A partir de la reforma constitucional ratificada para el periodo que asume en julio de 2026, el Congreso del Perú retornará al sistema bicameral compuesto por:",
    options: [
      { id: "A", text: "100 senadores y 100 diputados" },
      { id: "B", text: "60 senadores y 130 diputados" },
      { id: "C", text: "50 senadores y 120 diputados" },
      { id: "D", text: "80 senadores y 150 diputados" },
      { id: "E", text: "30 senadores y 130 diputados" }
    ],
    correctAnswer: "B",
    explanation: {
      solutionStepByStep: [
        "Paso 1: La reforma bicameral restablece dos cámaras en el Parlamento peruano.",
        "Paso 2: La Cámara de Diputados estará conformada por 130 diputados.",
        "Paso 3: El Senado estará integrado por 60 senadores elegidos por circunscripción nacional y departamental."
      ],
      keyConcept: "Congreso Bicameral Perú 2026: 60 Senadores + 130 Diputados (Total: 190 parlamentarios).",
      quickTip: "130 se mantiene para diputados y se adicionan exactamente 60 senadores.",
      commonPitfall: "Marcar 130 en total o asumir paridad 100-100."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },

  // ==========================================
  // HISTORIA DEL PERÚ (BANCO MISCELÁNEA I - UNSM)
  // ==========================================
  {
    id: "Q-UNSM-HIST-001",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Historia del Peru",
    topic: "Peru Prehispanico",
    subtopic: "Pobladores Líticos y Arcaicos",
    difficulty: "BASICO",
    competency: "Construye interpretaciones históricas",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Historia del Perú Miscelánea I",
      page: 1,
      questionNumber: 1
    },
    rawQuestion: "El hombre de Lauricocha fue hallado en el departamento de ________ y perteneció al periodo de aproximadamente ________:",
    options: [
      { id: "A", text: "Ayacucho - 20000 a.C." },
      { id: "B", text: "Puno - 8600 a.C." },
      { id: "C", text: "Huánuco - 9500 a.C." },
      { id: "D", text: "Piura - 9700 a.C." },
      { id: "E", text: "Lambayeque - 20000 a.C." }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Augusto Cardich descubrió las cuevas de Lauricocha en la provincia de Dos de Mayo, departamento de Huánuco.",
        "Paso 2: Su antigüedad radiocarbónica es de aproximadamente 9500 a.C. a 10000 a.C.",
        "Paso 3: Se hallaron los primeros restos fósiles humanos y evidencias de deformaciones craneanas y entierros rituales."
      ],
      keyConcept: "Lauricocha: Huánuco (9500 a.C.). Primeros restos óseos fósiles de la sierra.",
      quickTip: "Pacaicasa = Ayacucho (herramientas líticas). Lauricocha = Huánuco (esqueletos humanos).",
      commonPitfall: "Confundir Lauricocha (Huánuco) con Paiján (La Libertad)."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-HIST-002",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Historia del Peru",
    topic: "Peru Prehispanico",
    subtopic: "Primeras Pinturas Rupestres",
    difficulty: "BASICO",
    competency: "Construye interpretaciones históricas",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Historia del Perú Miscelánea I",
      page: 1,
      questionNumber: 5
    },
    rawQuestion: "Las primeras pinturas rupestres que representan escenas de caza colectiva (chaco de camélidos) en el Perú fueron descubiertas en las cavernas de:",
    options: [
      { id: "A", text: "Lauricocha" },
      { id: "B", text: "Pacaicasa" },
      { id: "C", text: "Toquepala" },
      { id: "D", text: "Guitarrero" },
      { id: "E", text: "Kotosh" }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Miomir Bojovich y Emilio González descubrieron la cueva del diablo en Toquepala (Tacna).",
        "Paso 2: Contiene escenas pictóricas policromas de chaco (caza ritual de guanacos).",
        "Paso 3: Es la manifestación de arte parietal y rupestre más antigua del Perú (aprox. 7600 a.C.)."
      ],
      keyConcept: "Toquepala (Tacna): Primeras pinturas rupestres y escenas de chaco.",
      quickTip: "Pinturas rupestres = Toquepala. Manos cruzadas = Kotosh.",
      commonPitfall: "Marcar Guitarrero (primer horticultor)."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-HIST-003",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Historia del Peru",
    topic: "Peru Prehispanico",
    subtopic: "Cultura Chimú y Orfebrería",
    difficulty: "BASICO",
    competency: "Construye interpretaciones históricas",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Historia del Perú Miscelánea I",
      page: 1,
      questionNumber: 17
    },
    rawQuestion: "¿Cuál fue la capital de la Cultura Chimú, considerada la ciudad de barro más grande de América prehispánica?",
    options: [
      { id: "A", text: "Cuzco" },
      { id: "B", text: "Cajamarca" },
      { id: "C", text: "Chan Chan" },
      { id: "D", text: "Chavín de Huántar" },
      { id: "E", text: "Sipán" }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: El reino Chimor floreció en la costa norte con centro en el valle de Moche (La Libertad).",
        "Paso 2: Su capital política y urbana fue la ciudadelaela de Chan Chan.",
        "Paso 3: Famosos por su extraordinaria orfebrería (cuchillo ceremonial Tumi) y palacios de adobe."
      ],
      keyConcept: "Chan Chan: Capital de Chimú (La Libertad).",
      quickTip: "Mochica = Huaca de la Luna / Señor de Sipán. Chimú = Chan Chan / Tumi.",
      commonPitfall: "Confundir la capital Chimú con Cahuachi (Nasca)."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-HIST-004",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Historia del Peru",
    topic: "Peru Prehispanico",
    subtopic: "Imperio Wari",
    difficulty: "INTERMEDIO",
    competency: "Construye interpretaciones históricas",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Historia del Perú Miscelánea I",
      page: 1,
      questionNumber: 20
    },
    rawQuestion: "El Horizonte Medio (500-900 d.C.) estuvo caracterizado en los Andes por la hegemonía y expansión del primer imperio panandino planificador de ciudades:",
    options: [
      { id: "A", text: "Chavín" },
      { id: "B", text: "Chimú" },
      { id: "C", text: "Wari" },
      { id: "D", text: "Sicán" },
      { id: "E", text: "Sipán" }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Horizonte Temprano = Chavín. Intermedio Temprano = Moche y Nasca.",
        "Paso 2: Horizonte Medio = Wari y Tiahuanaco.",
        "Paso 3: Wari (surgido en Ayacucho) expandió una red de ciudades cabeceras de región y urbanismo militar."
      ],
      keyConcept: "Wari: Primer imperio andino panandino del Horizonte Medio.",
      quickTip: "Horizonte Temprano: Chavín. Horizonte Medio: Wari. Horizonte Tardío: Inca.",
      commonPitfall: "Asumir que el primer imperio fue el Tahuantinsuyo."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-HIST-005",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Historia del Peru",
    topic: "Tahuantinsuyo",
    subtopic: "Pachacútec e Instituciones",
    difficulty: "BASICO",
    competency: "Construye interpretaciones históricas",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Historia del Perú Miscelánea I",
      page: 1,
      questionNumber: 33
    },
    rawQuestion: "El nombre del noveno Inca 'Pachacútec', quien derrotó a los chancas y dio inicio a la expansión imperial del Tahuantinsuyo, significa literalmente:",
    options: [
      { id: "A", text: "Gran guerrero inca" },
      { id: "B", text: "Hijo del Sol" },
      { id: "C", text: "El que transforma el mundo" },
      { id: "D", text: "Guerrero y legislador" },
      { id: "E", text: "Inca todopoderoso" }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Pacha = mundo o tiempo, Cuti = retorno, cambio o transformación.",
        "Paso 2: Pachacútec significa 'El que transforma el mundo' o 'El que cambia el tiempo'.",
        "Paso 3: Su nombre original era Cusi Yupanqui antes de vencer a Astoy Huaraca y Tumay Huaraca."
      ],
      keyConcept: "Pachacútec: 'El transformador de la tierra o del mundo'.",
      quickTip: "Recordar la raíz quechua: Pacha (tierra/espacio) + Cutiy (voltear/transformar).",
      commonPitfall: "Marcar 'Gran guerrero' o 'Inca del Sol'."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-HIST-006",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "CIENCIAS_SOCIALES",
    subject: "Historia del Peru",
    topic: "Independencia y República",
    subtopic: "Batalla de Ayacucho",
    difficulty: "BASICO",
    competency: "Construye interpretaciones históricas",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Historia del Perú Miscelánea I",
      page: 3,
      questionNumber: 88
    },
    rawQuestion: "¿En qué fecha se libró la Batalla de Ayacucho en las pampas de la Quinua, donde se selló definitivamente la independencia del Perú y de América del Sur?",
    options: [
      { id: "A", text: "09 de diciembre de 1824" },
      { id: "B", text: "06 de agosto de 1824" },
      { id: "C", text: "28 de julio de 1821" },
      { id: "D", text: "02 de mayo de 1866" },
      { id: "E", text: "08 de octubre de 1879" }
    ],
    correctAnswer: "A",
    explanation: {
      solutionStepByStep: [
        "Paso 1: La Batalla de Junín se libró el 6 de agosto de 1824 (caballería patriota).",
        "Paso 2: La Batalla de Ayacucho se libró el 9 de diciembre de 1824 al mando del general Antonio José de Sucre contra el virrey La Serna.",
        "Paso 3: Se firmó la Capitulación de Ayacucho ese mismo día."
      ],
      keyConcept: "Batalla de Ayacucho: 9 de diciembre de 1824.",
      quickTip: "Junín = 6 de agosto de 1824. Ayacucho = 9 de diciembre de 1824.",
      commonPitfall: "Confundirla con la fecha de Junín o la proclamación del 28 de julio."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },

  // ==========================================
  // RAZONAMIENTO VERBAL (BANCO VOCABULARIO Y ANALOGÍAS)
  // ==========================================
  {
    id: "Q-PRONABEC-RV-001",
    institution: "PRONABEC",
    examType: "ENP",
    year: 2024,
    period: "I",
    area: "COMUNICACION",
    subject: "Razonamiento Verbal",
    topic: "Relaciones Semanticas",
    subtopic: "Sinonimia Léxica",
    difficulty: "INTERMEDIO",
    competency: "Lee diversos tipos de textos",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Banco RV ENP Beca 18",
      page: 1,
      questionNumber: 2
    },
    rawQuestion: "Señale el sinónimo más preciso del término CONTUBERNIO:",
    options: [
      { id: "A", text: "Conspiración" },
      { id: "B", text: "Pacto" },
      { id: "C", text: "Consagración" },
      { id: "D", text: "Despreciable" },
      { id: "E", text: "Plan" }
    ],
    correctAnswer: "A",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Contubernio designa un acuerdo o alianza secreta y censurable con un fin ilícito o deshonesto.",
        "Paso 2: Conspiración refiere a un acuerdo secreto contra la ley o el poder establecido.",
        "Paso 3: Por afinidad semántica y matiz peyorativo, 'conspiración' es el sinónimo directo."
      ],
      keyConcept: "Contubernio = conspiración o alianza espuria.",
      quickTip: "Recuerda que contubernio no es un pacto cualquiera, tiene connotación ilícita o deshonesta.",
      commonPitfall: "Marcar 'Pacto' olvidando el rasgo clandestino y negativo de contubernio."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-PRONABEC-RV-002",
    institution: "PRONABEC",
    examType: "ENP",
    year: 2024,
    period: "I",
    area: "COMUNICACION",
    subject: "Razonamiento Verbal",
    topic: "Relaciones Semanticas",
    subtopic: "Antonimia Léxica",
    difficulty: "INTERMEDIO",
    competency: "Lee diversos tipos de textos",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Banco RV ENP Beca 18",
      page: 3,
      questionNumber: 4
    },
    rawQuestion: "Determine el antónimo exacto de la palabra EGREGIO:",
    options: [
      { id: "A", text: "Mediocre" },
      { id: "B", text: "Ignorante" },
      { id: "C", text: "Popular" },
      { id: "D", text: "Zopenco" },
      { id: "E", text: "Vanidoso" }
    ],
    correctAnswer: "A",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Egregio significa ilustre, insigne, sobresaliente o magnífico por sus méritos.",
        "Paso 2: Lo opuesto a lo egregio o descollante es lo común, vulgar o de calidad regular/baja.",
        "Paso 3: 'Mediocre' es el antónimo lexicológico exacto."
      ],
      keyConcept: "Egregio (insigne) ↔ Mediocre (ordinario o sin brillo).",
      quickTip: "Egregio = excelente/ilustre. Opuesto: mediocre.",
      commonPitfall: "Marcar ignorante (ignorante se opone a sabio, no a egregio)."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-UNSM-RV-003",
    institution: "UNSM",
    examType: "ORDINARIO",
    year: 2024,
    period: "I",
    area: "COMUNICACION",
    subject: "Razonamiento Verbal",
    topic: "Relaciones Semanticas",
    subtopic: "Analogías",
    difficulty: "INTERMEDIO",
    competency: "Razonamiento analógico y verbal",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Banco RV Examen Ordinario UNSM",
      page: 7,
      questionNumber: 19
    },
    rawQuestion: "ALTO AMAZONAS : YURIMAGUAS ::",
    options: [
      { id: "A", text: "Loreto : Iquitos" },
      { id: "B", text: "Ucayali : Pucallpa" },
      { id: "C", text: "Mariscal Cáceres : Juanjuí" },
      { id: "D", text: "Lima : Perú" },
      { id: "E", text: "Amazonas : Chachapoyas" }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Identificar la relación base: Alto Amazonas es una provincia del departamento de Loreto y Yurimaguas es su capital provincial.",
        "Paso 2: Relación: PROVINCIA : CAPITAL DE PROVINCIA (ámbito de la selva peruana).",
        "Paso 3: Evaluar: Loreto, Ucayali y Amazonas son departamentos (no provincias). En cambio, Mariscal Cáceres es provincia de San Martín y Juanjuí es su capital provincial.",
        "Paso 4: Por tanto, la analogía rigurosa es Mariscal Cáceres : Juanjuí."
      ],
      keyConcept: "Relación analógica de jerarquía político-territorial: Provincia a su respectiva Capital provincial.",
      quickTip: "Cuidado con la trampa de escala: no confundir Departamento:Capital con Provincia:Capital.",
      commonPitfall: "Elegir Loreto : Iquitos pensando en región en lugar de nivel provincial."
    },
    relatedFichaId: "FICHA-RV-COMPRENSION-TEXTUAL",
    status: "VALIDATED"
  },
  {
    id: "Q-PRONABEC-RM-OPER-001",
    institution: "PRONABEC",
    examType: "ENP",
    year: 2024,
    period: "I",
    area: "MATEMATICA",
    subject: "Razonamiento Matematico",
    topic: "Distribuciones y Operadores",
    subtopic: "Operadores Matemáticos Arbitrarios",
    difficulty: "INTERMEDIO",
    competency: "Resuelve problemas de regularidad y cambio",
    sourceType: "PROCESADO_DESDE_OFICIAL",
    isFija: true,
    sourceReference: {
      document: "Examen Único Nacional Beca 18 - Operadores",
      page: 1,
      questionNumber: 3
    },
    rawQuestion: "Se define el operador matemático en los reales: a * b = 2a + 3b - ab. Calcule el valor de (4 * 2) * 3.",
    options: [
      { id: "A", text: "6" },
      { id: "B", text: "9" },
      { id: "C", text: "3" },
      { id: "D", text: "12" },
      { id: "E", text: "15" }
    ],
    correctAnswer: "C",
    explanation: {
      solutionStepByStep: [
        "Paso 1: Resolver el paréntesis interior (4 * 2): a = 4, b = 2.",
        "Paso 2: 4 * 2 = 2(4) + 3(2) - (4)(2) = 8 + 6 - 8 = 6.",
        "Paso 3: Ahora calcular el resultado con el siguiente término: 6 * 3: a = 6, b = 3.",
        "Paso 4: 6 * 3 = 2(6) + 3(3) - (6)(3) = 12 + 9 - 18 = 21 - 18 = 3."
      ],
      keyConcept: "Operadores arbitrarios: sustitución ordenada respetando signos de agrupación.",
      quickTip: "Primero el paréntesis y luego el operador exterior.",
      commonPitfall: "Operar 4 * (2 * 3) sin respetar la no asociatividad del operador."
    },
    relatedFichaId: "FICHA-ALG-ECUACIONES-CUADRATICAS",
    status: "VALIDATED"
  }
];

// Merge avoiding duplicates by id
const map = new Map();
existingQuestions.forEach(q => map.set(q.id, q));
newBatch.forEach(q => map.set(q.id, q));

const combined = Array.from(map.values());
fs.writeFileSync('data/questions/questions.json', JSON.stringify(combined, null, 2), 'utf8');
fs.writeFileSync('public/data/questions/questions.json', JSON.stringify(combined, null, 2), 'utf8');

console.log('SUCCESS! TOTAL QUESTIONS:', combined.length);
