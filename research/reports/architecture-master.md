# Arquitectura Maestra del Sistema: Beca 18 + UNSM Smart Academy

## 1. Visión General y Principio Rector
Beca 18 + UNSM Smart Academy es un ecosistema educativo integral de ingeniería de software e investigación pedagógica. No es una simple plataforma web de cuestionarios; es una solución de aprendizaje adaptativo orientada a maximizar las probabilidades de ingreso a la Universidad Nacional de San Martín (UNSM) y de preselección/selección en Beca 18 (PRONABEC).

El sistema opera bajo el ciclo cognitivo continuo:
```
INVESTIGAR -> RECOPILAR -> EXTRAER -> CLASIFICAR -> ORGANIZAR -> ENSEÑAR -> PRACTICAR -> EVALUAR -> DIAGNOSTICAR -> REFORZAR -> VOLVER A PRACTICAR
```

---

## 2. Mapa Arquitectónico de Capas

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN (UI / UX)                       │
│  AppShell | Router | Dashboard | Simuladores | Práctica | Fichas       │
│  Materiales | Banco Preguntas | Flashcards | Diagnóstico | Admin Tool  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    CAPA DE NEGOCIO Y DOMINIO                           │
│  - Adaptive Engine (Cálculo de dominio %, espaciado SM-2)              │
│  - Simulation Engine (Temporizador absoluto, ponderación oficial)      │
│  - Question Bank Manager (Filtros multidimensionales, deduplicación)   │
│  - Study Planner (Multiobjetivo: Beca 18 vs UNSM y temas comunes)      │
│  - OCR & Ingestion Pipeline (Procesamiento y normalización de textos)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  CAPA DE DATOS Y PERSISTENCIA                          │
│  - IndexedDB (SmartAcademyDB): Perfil, respuestas, errores, sesiones   │
│  - JSON Master Stores: questions, fichas, materials, blueprints        │
│  - Offline Cache & Service Worker: PWA resiliente                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  CAPA DE AUDITORÍA Y TRAZABILIDAD                      │
│  - Registro de fuentes originales (checksum SHA-256)                   │
│  - Control de versiones de contenido y procedencia histórica           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Datos Canónico (Data Models)

### 3.1. Entidad: Pregunta (`Question`)
```typescript
interface Question {
  id: string; // Ej: "Q-UNSM-2024-ORD-023"
  institution: "PRONABEC" | "UNSM" | "GENERAL";
  examType: "ENP" | "ORDINARIO" | "EXTRAORDINARIO" | "CONCURSO_ESCOLAR" | "QUINTO_SECUNDARIA" | "SIMULACRO";
  year: number; // Ej: 2024
  period?: "I" | "II";
  area: "MATEMATICA" | "CIENCIAS" | "COMUNICACION" | "CIENCIAS_SOCIALES" | "HUMANIDADES" | "IDIOMAS";
  subject: string; // Ej: "Algebra"
  topic: string; // Ej: "Ecuaciones Cuadraticas"
  subtopic: string; // Ej: "Propiedades de las Raices"
  difficulty: "BASICO" | "INTERMEDIO" | "AVANZADO";
  competency?: string;
  sourceType: "OFICIAL" | "PROCESADO_DESDE_OFICIAL" | "USER_PROVIDED" | "GENERATED";
  sourceReference?: {
    document: string;
    page: number;
    questionNumber: number;
    sourceUrl?: string;
  };
  rawQuestion: string; // Texto original inalterado
  adaptedQuestion?: string; // Versión tipográfica optimizada si aplica
  options: Array<{
    id: "A" | "B" | "C" | "D" | "E";
    text: string;
  }>;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: {
    solutionStepByStep: string[];
    keyConcept: string;
    quickTip: string;
    commonPitfall: string;
  };
  relatedFichaId?: string; // Vínculo directo a Ficha pedagógica
  status: "RAW" | "PROCESSING" | "EXTRACTED" | "CLASSIFIED" | "REVIEW_REQUIRED" | "VALIDATED" | "PUBLISHED";
}
```

### 3.2. Entidad: Ficha Educativa (`Ficha`)
```typescript
interface Ficha {
  id: string; // Ej: "FICHA-MAT-ALG-002"
  title: string; // Ej: "Ecuaciones Cuadráticas y Propiedades de Raíces"
  subject: string;
  topic: string;
  subtopic: string;
  level: "BASICO" | "INTERMEDIO" | "AVANZADO";
  summary: string;
  concepts: Array<{
    name: string;
    description: string;
  }>;
  formulas: Array<{
    label: string;
    formula: string; // LaTeX o texto estructurado
  }>;
  examples: Array<{
    statement: string;
    solution: string[];
  }>;
  solvedExamples: Array<{
    problem: string;
    steps: string[];
    conclusion: string;
  }>;
  commonMistakes: string[];
  tips: string[];
  miniPractice: Array<{
    question: string;
    options: string[];
    answer: string;
    quickExplanation: string;
  }>;
  relatedQuestions: string[]; // IDs de preguntas históricas
  relatedMaterials: string[]; // IDs de resúmenes o guías
}
```

### 3.3. Entidad: Blueprint de Examen (`ExamBlueprint`)
```typescript
interface ExamBlueprint {
  id: string; // Ej: "BP-UNSM-ORD-2024-1"
  institution: "PRONABEC" | "UNSM";
  modality: "ORDINARIO" | "EXTRAORDINARIO" | "CONCURSO_ESCOLAR" | "ENP";
  year: number;
  period?: "I" | "II";
  durationMinutes: number; // Ej: 180 min (UNSM), 120 min (Beca 18)
  totalQuestions: number; // Ej: 100 (UNSM), 60 (Beca 18)
  markingScheme: {
    correct: number; // Puntaje positivo
    incorrect: number; // Penalización negativa
    blank: number;
  };
  distribution: Array<{
    subject: string;
    questionCount: number;
  }>;
  historicalFrequencyWeight: Record<string, "ALTA" | "MEDIA" | "BAJA">;
}
```

---

## 4. Estrategia Multiobjetivo: Beca 18 vs UNSM

El postulante peruano que aspira a Beca 18 y simultáneamente a la UNSM enfrenta dos estructuras con requerimientos específicos:

| Dimensión | Beca 18 (Examen Nacional de Preselección - ENP) | Examen de Admisión UNSM (Ordinario) |
| :--- | :--- | :--- |
| **Enfoque Principal** | Competencias matemáticas y comprensión lectora (modelo MINEDU). | Evaluación integral de 10-14 materias académicas (Ciencias, Matemáticas, Humanidades). |
| **Cantidad de Ítems** | 60 preguntas (30 Matemática, 30 Comunicación/Lectura). | 100 preguntas (Matemática, Física, Química, Biología, RV, Lenguaje, Historia, Geografía, etc.). |
| **Tiempo de Prueba** | 120 minutos (2 horas). | 180 minutos (3 horas). |
| **Penalización por Error**| Generalmente sin puntaje negativo en preselección. | Penalización reglamentaria oficial según estatuto de admisión UNSM. |
| **Áreas Compartidas (CORE)**| Aritmética, Álgebra, Geometría, Razonamiento Matemático, RV, Comprensión Lectora. |
| **Áreas Exclusivas UNSM** | Física, Química, Biología, Filosofía, Economía, Cívica, Historia Universal y del Perú. |

El sistema detecta automáticamente si el usuario selecciona **AMBOS OBJETIVOS** y organiza su plan de estudios señalando el "Core Común" para evitar duplicar esfuerzos, reservando las materias especializadas para sesiones programadas.
