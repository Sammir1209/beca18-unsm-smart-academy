# Workflow 10: Run Quality Check & Anti-Hallucination

## Objetivo
Verificar la integridad documental, la coherencia de claves, la unicidad de alternativas y el cumplimiento de las reglas anti-alucinación antes de publicar o consumir contenido.

## Pasos de Ejecución
1. Barrido de validación en `data/questions/`:
   - Ninguna pregunta sin clave correcta (`correctAnswer`).
   - Ninguna opción vacía ni duplicada.
   - Todo ítem oficial debe poseer `sourceType`, `institution`, `year` y `sourceReference`.
2. Barrido en `data/fichas/`:
   - Presencia de conceptos, fórmulas, ejemplos resueltos y mini-prácticas.
3. Chequeo de consistencia de enlaces cruzados (Ficha -> Banco de Preguntas -> Material).
4. Generación de reporte de auditoría en `audit/audits.json`.
