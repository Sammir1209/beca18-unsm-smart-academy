# Architecture Rules

## Principios de Diseño del Sistema
1. **Separación de Capas**:
   - `Core / Engine`: Modelos puros de datos, algoritmos de recomendación, temporizadores basados en epoch time, validadores y clasificadores (sin acoplamiento de framework).
   - `Storage / Repository`: Abstracción de datos con soporte offline-first (IndexedDB / LocalStorage / JSON precargado).
   - `UI / Presentation`: Componentes modulares, accesibles, diseño EdTech Premium sin saturación visual.
   - `Intelligence / Pipelines`: Extracción, OCR inteligente, detección de preguntas, cálculo de frecuencias temáticas.

2. **Gestión de Tiempo en Simulacros**:
   - El temporizador usa siempre timestamps absolutos (`targetEpoch - Date.now()`).
   - Resistente a recarga de página (`F5`), cambio de pestaña, cierre accidental de navegador y suspensión del dispositivo.

3. **Inmutabilidad de Fuentes**:
   - Archivos crudos en `content/raw/` son inmutables con hash SHA-256 de verificación.
   - Procesamiento en etapas: `raw -> processed -> validated -> published`.
