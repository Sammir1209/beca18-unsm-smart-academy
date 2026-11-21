# Questions & Bank Rules

## Estructura Universal de Pregunta
Cada ítem en el banco de preguntas debe cumplir el esquema canónico:
```json
{
  "id": "Q-UNSM-2024-ORD-001",
  "institution": "UNSM | PRONABEC",
  "examType": "ORDINARIO | EXTRAORDINARIO | CONCURSO_ESCOLAR | ENP | SIMULACRO",
  "year": 2024,
  "period": "I",
  "area": "MATEMATICA",
  "subject": "Algebra",
  "topic": "Ecuaciones Cuadraticas",
  "subtopic": "Propiedades de las Raices",
  "difficulty": "BASICO | INTERMEDIO | AVANZADO",
  "competency": "Resolucion de problemas de regularidad, equivalencia y cambio",
  "sourceType": "OFICIAL",
  "sourceReference": {
    "document": "Examen Ordinario UNSM 2024-I",
    "page": 4,
    "questionNumber": 23
  },
  "rawQuestion": "Si las raíces de la ecuación x² - (m+1)x + m = 0 son consecutivas...",
  "adaptedQuestion": null,
  "options": [
    { "id": "A", "text": "1" },
    { "id": "B", "text": "2" },
    { "id": "C", "text": "3" },
    { "id": "D", "text": "4" },
    { "id": "E", "text": "5" }
  ],
  "correctAnswer": "C",
  "explanation": {
    "solutionStepByStep": ["Paso 1: Usar discriminante...", "Paso 2: Diferencia de raíces..."],
    "keyConcept": "Diferencia de raíces cuadráticas: |r1 - r2| = √Δ / |a|",
    "quickTip": "Al ser consecutivas, |r1 - r2| = 1.",
    "commonPitfall": "Olvidar que m puede tener dos valores y no verificar restricciones."
  },
  "status": "VALIDATED"
}
```

## Calibración de Dificultad
No asignar dificultad arbitrariamente:
- **BÁSICO**: Aplicación directa de una única propiedad o fórmula elemental, 1-2 pasos de cálculo.
- **INTERMEDIO**: Articulación de 2 propiedades distintas, análisis algebraico o razonamiento deductivo de 3-4 pasos.
- **AVANZADO**: Alta abstracción, múltiples casos, combinación interdisciplinaria o distractores finos.

## Detección de Duplicados
- Todo nuevo ítem debe compararse mediante hash de texto normalizado y similitud semántica.
- Prohibido agregar variantes idénticas a menos que hayan sido reutilizadas oficialmente en años distintos (en cuyo caso se crea enlace histórico multiaño).


## Fixed Question / Recurrence Evidence (mandatory)

- `isFija` is not an independent editorial decision. Do not set it to true unless a recurrence cluster is `VERIFIED`.
- A verified fixed question must link to at least two distinct exam-source documents/convocations, each with page and original question number.
- Official provenance, high topic frequency, personal difficulty, or appearing in one prior exam do not establish a fixed question.
- Keep these classifications separate: exact repeat, near duplicate, same problem pattern, recurring topic, and recurring exam blueprint.
- Automated hash/fuzzy/embedding matches create candidates only. Human review is required before `VERIFIED`.
- Every fixed label must expose its evidence (exam editions and references). If evidence is absent, use `UNVERIFIED` or `CANDIDATE`.
- Preserve raw scans, OCR output, source references, keys and previous dataset versions. Never overwrite historical exam content silently.
