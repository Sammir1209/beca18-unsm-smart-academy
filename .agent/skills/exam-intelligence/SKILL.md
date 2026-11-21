---
name: exam-intelligence
description: Curaduría basada en evidencia de exámenes UNSM/Beca 18, extracción documental, clasificación temática, recurrencia y verificación de preguntas fijas.
---

# Skill: Exam Intelligence

## Objetivo
Convertir fuentes de exámenes en datos fiables y trazables, separando repetición de preguntas, patrones de resolución y frecuencia de temas.

## Reglas inviolables
1. No marcar una pregunta como fija solo por ser oficial, importante, frecuente o provenir de un examen.
2. Una fija debe enlazar al menos dos preguntas de exámenes/convocatorias diferentes y tener estado `VERIFIED` tras revisión humana.
3. Similitud automática solo crea candidatos. Nunca publica una pregunta fija automáticamente.
4. Distinguir `EXACT_REPEAT`, `NEAR_DUPLICATE`, `SAME_PROBLEM_PATTERN`, `RECURRING_TOPIC` y `EXAM_BLUEPRINT_PATTERN`.
5. Cada enunciado y clave debe llevar fuente, convocatoria, página, número original y versión.
6. No completar texto, alternativas o fórmulas que OCR no haya podido leer; enviar a revisión.
7. No inventar claves. Si no hay clave oficial, resolver independientemente y conservar estado `SOLVED_AND_VERIFIED`; si aún no hay revisión, `UNVERIFIED`.
8. Priorizar portales oficiales. Las fuentes secundarias sirven para descubrir/contrastar, no para reemplazar documentos oficiales.
9. No automatizar descargas masivas que evadan suscripciones, autenticación o restricciones de uso.
10. No presentar frecuencia observada como certeza o probabilidad garantizada de aparecer.

## Flujo
1. Descubrir y registrar fuente.
2. Descargar/archivar documento original y calcular SHA-256.
3. Extraer con Docling; usar OCRmyPDF/PaddleOCR para escaneos o documentos complejos.
4. Segmentar pregunta y alternativas, preservar imágenes y fórmulas.
5. Normalizar texto para comparación sin alterar el enunciado original.
6. Sugerir clasificación usando `data/taxonomy/taxonomy.json`.
7. Verificar clave y explicación.
8. Ejecutar hashing, RapidFuzz y opcionalmente embeddings.
9. Enviar candidatos a revisión humana lado a lado.
10. Publicar solo registros aprobados con reporte de calidad.

## Clasificación de recurrencia
- Literal: coincidencia normalizada exacta entre documentos diferentes.
- Variante: similitud léxica/semántica alta y misma estructura; requiere confirmar cambios de números/contexto.
- Patrón: requiere el mismo método o competencia, pero no la misma pregunta.
- Tema recurrente: el tema aparece en convocatorias diferentes sin repetirse el enunciado.

La etiqueta "Fija verificada" se reserva para repetición literal o variante aprobada, nunca para patrón o tema.

## Reglas de modalidad y scoring
- Modelar por separado UNSM Ordinario, Extraordinario I y Extraordinario II/Concurso Escolar.
- Para UNSM usar 100 preguntas y 150 minutos cuando el prospecto de la convocatoria lo confirme.
- No descontar por error ni blanco.
- No hardcodear el valor por acierto: cargar la matriz de pesos vigente y versionada por convocatoria/bloque/carrera.
- Si no está disponible el prospecto o la matriz completa, marcar el simulacro como estimación, no "oficial".

## Salida requerida de una auditoría
- Lista de fuentes revisadas y nivel de autoridad.
- Exámenes comparados y cobertura por pregunta.
- Repeticiones exactas, variantes y temas recurrentes por separado.
- Claves no verificadas y OCR dudoso.
- Conteos de temas con denominador explícito (ej. 4/6 exámenes).
- Cambios sugeridos sin sobrescribir el histórico.
