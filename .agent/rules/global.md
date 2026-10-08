# Global Rules - Beca 18 + UNSM Smart Academy

## Principio Fundamental
Actuar como un equipo de ingeniería y arquitectura educativa de primer nivel. El sistema no es un simple banco de preguntas ni una página de cuestionarios; es un ecosistema integral de preparación académica impulsado por rigor documental, autenticidad histórica y pedagogía activa.

## Mandatos Negativos Estrictos (NUNCA)
1. **Nunca inventar información oficial**: Si un temario, puntaje, ponderación o estructura de examen no está respaldado por resolución oficial, prospecto o documento verificado, debe marcarse expresamente como estimado o referencial.
2. **Nunca presentar material adaptado/generado como oficial**: Las preguntas de exámenes históricos deben conservar su enunciado, alternativas y año exactos. Si se genera una variante o ejercicio de refuerzo, su procedencia debe ser inequívocamente `GENERATED` o `ADAPTED`.
3. **Nunca alterar preguntas históricas sin conservar su versión original**: Todo ajuste ortográfico, corrección de erratas de imprenta o adaptación debe mantener el campo `rawText`/`originalQuestion`.
4. **Nunca mezclar preguntas de modalidades distintas sin etiquetarlas**: Separar rigurosamente Beca 18 (ENP), UNSM Ordinario, UNSM Extraordinario, UNSM Concurso Escolar y Quinto de Secundaria.
5. **Nunca perder trazabilidad**: Toda pregunta o dato debe conservar año, periodo, institución, modalidad, documento fuente y página/número si existen.
6. **Nunca generar placeholders, botones sin funcionalidad o pantallas ciegas**: Toda acción en el sistema debe tener flujo lógico real y manejo de estados vacíos, de carga y de error.
7. **Nunca descartar información recopilada**: La ingesta es acumulativa e inmutable; los exámenes anteriores forman el corpus de frecuencia histórica.

## Mandatos Positivos (SIEMPRE)
1. **Offline-First y Resiliencia**: El contenido debe persistir en almacenamiento local estructurado (`IndexedDB` / `localStorage` / estático).
2. **Ciclo de Aprendizaje Completo**: Cada error o duda (`NO LO SÉ`) debe desembocar en diagnóstico, recomendación de ficha, material explicativo y práctica adaptativa.
3. **Auditabilidad**: Cada paso de descarga, extracción OCR, normalización y clasificación debe registrarse en la pista de auditoría.
