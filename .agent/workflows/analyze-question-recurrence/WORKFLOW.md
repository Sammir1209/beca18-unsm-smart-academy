# Workflow: Analyze Exam Recurrence & Verify Fijas

## Input
Uno o varios documentos de admisión con fuente, institución, modalidad, año/periodo y URL o archivo original.

## Procedure
1. Verificar que el documento corresponde al examen indicado; registrar origen, fecha, SHA-256 y condición de uso.
2. Distinguir fuente oficial, secundaria y documento aportado por usuario.
3. Comprobar integridad: páginas legibles, numeración, cantidad de preguntas y anexos.
4. Extraer mediante Docling; para escaneos aplicar OCRmyPDF y/o PaddleOCR. Guardar coordenadas/página y referencias de imágenes.
5. Segmentar ítems; no fusionar enunciados entre páginas ni perder gráficos.
6. Validar alternativas y clave. Si la clave no tiene evidencia, excluir de simulacros puntuables hasta revisión.
7. Normalizar una copia del texto para hashes; conservar sin cambios el original.
8. Buscar:
   - hashes exactos,
   - candidatos RapidFuzz para casi duplicados,
   - candidatos semánticos opcionales.
9. Agrupar solo candidatos con evidencia de fuente. Comparar uno a uno y documentar qué se repite y qué cambia.
10. Asignar categoría: exact repeat, near duplicate, pattern, recurring topic o exam blueprint.
11. Un revisor aprueba/rechaza cada candidato. Solo aprobados pasan a `VERIFIED`.
12. Calcular frecuencia temática por número de exámenes distintos, no por preguntas totales únicamente.
13. Generar informe de cobertura, incidencias OCR, claves pendientes y evidencias de repetición.
14. No actualizar ni borrar datasets publicados directamente; emitir nueva versión y pruebas de no regresión.

## Quality gates
- No faltan números de pregunta sin explicación.
- Cada ítem tiene página y fuente.
- No existen preguntas con opciones incompletas en el banco puntuable.
- No se atribuye "fija" a un tema frecuente.
- No se considera un examen "completo" si solo hay extractos.
- No se publican puntos por acierto hasta importar los pesos de la convocatoria correspondiente.
