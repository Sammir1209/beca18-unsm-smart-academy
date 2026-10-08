# Data & Storage Rules

## Esquema de Almacenamiento Local (SmartAcademyDB)
Estructura de almacenes en `IndexedDB` (v1):
- `profile`: Datos del estudiante, objetivo seleccionado (`BECA18`, `UNSM_ORDINARIO`, etc.), meta diaria.
- `questions`: Banco local de preguntas con índices por `institution`, `examType`, `year`, `subject`, `topic`, `difficulty`.
- `fichas`: Fichas pedagógicas indexadas por `subject`, `topic`.
- `materials`: Guías, resúmenes, esquemas y tablas comparativas.
- `flashcards`: Tarjetas mnemotécnicas con algoritmo de repetición espaciada (SM-2 / Box System).
- `attempts`: Historial detallado de respuestas de cada sesión de práctica y simulacro.
- `mistakes`: Registro reactivo de errores pendientes y dominados.
- `auditLog`: Eventos de ingesta, validación y sincronización de fuentes.

## Reglas de Persistencia
- Cualquier mutación de sesión se persiste atómicamente.
- Las sesiones de simulacro guardan el estado en cada clic de respuesta para resistir cierres accidentales.
