# Sistema de Inteligencia de Exámenes — UNSM Academy

**Estado:** diseño funcional y técnico v1.0  
**Rama objetivo:** `mobile-first-unsm-academy`  
**Principio rector:** ninguna pregunta se publica como oficial, validada o fija sin evidencia trazable.

## 1. Objetivo

Convertir exámenes y documentos de preparación en un banco versionado, auditable y útil para:

- Construir simulacros fieles a cada modalidad y convocatoria.
- Detectar preguntas idénticas y variantes reales entre exámenes.
- Identificar patrones de resolución y temas de alta frecuencia.
- Priorizar prácticas a partir de evidencia histórica y errores personales.
- Mantener la diferencia entre contenido oficial, adaptado, aportado por el usuario y generado.

El sistema no debe prometer que una pregunta volverá a aparecer. Debe mostrar evidencia, frecuencia observada y nivel de confianza.

## 2. Auditoría inicial del repositorio

En la versión revisada del banco hay 31 preguntas: 9 PRONABEC y 22 UNSM. Las 31 tienen `isFija: true`, aunque el conjunto incluye 5 registros `USER_PROVIDED` y 10 `PROCESADO_DESDE_OFICIAL`. La bandera actual no contiene evidencia de repetición entre convocatorias y, por tanto, no se debe presentar como una lista de fijas verificadas.

El inventario de fuentes conserva configuraciones antiguas para UNSM (180 minutos, 60/120 preguntas y descuento de -0.5). Debe tratarse como información pendiente de reconciliación, no como fuente normativa.

El simulador actual usa una modalidad genérica `EXTRAORDINARIO`; el reglamento UNSM separa `EXTRAORDINARIO_I` y `EXTRAORDINARIO_II_CONCURSO_ESCOLAR`.

## 3. Modalidades y reglas de evaluación

### UNSM

El Reglamento de Admisión de Pregrado 2024-I consultado establece:

- Ordinario: 100 preguntas, 150 minutos.
- Extraordinario I: 100 preguntas, 150 minutos.
- Extraordinario II (Concurso Escolar): 100 preguntas, 150 minutos.
- Puntaje máximo: 200.
- El resultado se calcula a partir de respuestas correctas por el peso que corresponda; el reglamento remite al prospecto vigente para esos pesos.
- Ordinario y Extraordinario se dividen en aptitud académica (80 puntos) y conocimientos (120 puntos).

No se debe restar puntaje por error o por pregunta en blanco: el artículo 64 describe el cómputo con la cantidad de respuestas correctas. El peso exacto por bloque/carrera debe provenir del prospecto vigente de la convocatoria. No asumir que todas las preguntas valen lo mismo ni fijar +2 como valor universal sin confirmar la matriz.

Fuentes normativas y de consulta:
- Reglamento UNSM 2024-I (arts. 13, 15, 52, 63–67): https://transparencia.unsm.edu.pe/documentos/2024/transparencyportal/admission/432f0a36-4561-4d74-90df-c9e6b93d7826.pdf
- Portal oficial de admisión: https://admision.unsm.edu.pe/
- Transparencia / temario: https://transparencia.unsm.edu.pe/admision/temario

La norma de 2024-I no sustituye al prospecto vigente 2026-II/2027-I. Antes de liberar un modelo de puntuación, contrastar el reglamento y prospecto del proceso exacto.

### PRONABEC

Mantener ENP separado de UNSM. La ficha de modalidad debe versionarse por convocatoria (número de preguntas, tiempo, distribución y escala de puntaje), respaldada por bases/guía oficial de esa convocatoria. No reutilizar parámetros de un año para otro sin validación.

## 4. Taxonomía y concepto de "fija"

Usar la taxonomía existente en `data/taxonomy/taxonomy.json` como catálogo inicial. Las asignaciones automáticas de materia/tema/subtema son sugerencias hasta revisión.

No utilizar un único booleano editable por cualquier agente. La condición de fija debe tener estados:

- `UNVERIFIED`: no se ha evaluado repetición.
- `CANDIDATE`: el algoritmo encontró coincidencias que deben revisarse.
- `VERIFIED`: un revisor confirmó evidencia de repetición entre documentos de examen distintos.
- `REJECTED`: coincidencia falsa o evidencia insuficiente.

Tipos de recurrencia separados:

1. `EXACT_REPEAT`: mismo enunciado y estructura de alternativas tras normalizar OCR, espacios, puntuación y variantes tipográficas.
2. `NEAR_DUPLICATE`: mismo problema con cambios menores de números, nombres o contexto. Requiere revisión humana.
3. `SAME_PROBLEM_PATTERN`: misma estrategia matemática/verbal, pero problema nuevo. Es patrón recurrente, no pregunta fija.
4. `RECURRING_TOPIC`: subtema evaluado en distintas convocatorias; no es una pregunta fija.
5. `EXAM_BLUEPRINT_PATTERN`: distribución recurrente de preguntas por áreas/temas.

Una pregunta solo puede ser `VERIFIED` si enlaza por lo menos dos preguntas-fuente de convocatorias distintas y conserva la referencia de cada una. La similitud semántica por sí sola nunca publica una fija.

## 5. Modelo de datos propuesto

### ExamSource

- `sourceId`, institución, modalidad exacta, año, periodo, fecha de examen.
- título, organismo/publicador, URL de origen, tipo de fuente (`OFFICIAL`, `SECONDARY`, `USER_PROVIDED`).
- `documentSha256` real del archivo descargado; nunca usar cadenas inventadas o hash del archivo vacío como checksum del documento.
- `acquisitionStatus`: DISCOVERED / DOWNLOADED / EXTRACTED / REVIEWED / APPROVED / REJECTED.
- permiso/condición de uso, fecha de consulta, versión del prospecto/reglamento asociado.

### ExamQuestion

- identificador estable, `sourceId`, página y número original.
- modalidad, convocatoria, área, curso, tema, subtema y competencia.
- enunciado con texto y LaTeX; alternativas originales; imágenes referenciadas como assets.
- clave de respuesta y origen de la clave (`OFFICIAL_KEY`, `SOLVED_AND_VERIFIED`, `UNVERIFIED`).
- explicación, solución revisada, referencias.
- `contentStatus`: RAW / OCR_REVIEW / CLASSIFICATION_REVIEW / KEY_REVIEW / APPROVED / PUBLISHED.
- `sourceConfidence`, `ocrConfidence`, `reviewedBy`, `reviewedAt`, `contentVersion`.

### RecurrenceEvidence

- `clusterId`, pregunta A, pregunta B, tipo de similitud.
- hash exacto, similitud léxica, similitud semántica, comparación de fórmulas y decisión del revisor.
- observación: qué se repite y qué cambia.
- evidencia de origen: documento A/B, convocatoria, año, página y número de pregunta.

La propiedad heredada `isFija` debe dejar de ser la fuente de verdad. En la migración, los valores antiguos se preservan como legado pero pasan a `UNVERIFIED` hasta que exista evidencia.

## 6. Pipeline de incorporación

1. **Descubrir:** buscar primero en admision.unsm.edu.pe, unsm.edu.pe, transparencia.unsm.edu.pe y gob.pe/pronabec. Fuentes secundarias sirven para localizar documentos o contrastar, nunca para sustituir una fuente oficial disponible.
2. **Registrar:** guardar metadatos, URL, fecha, modalidad y procedencia. No marcar como descargado si solo se encontró una página que menciona el examen.
3. **Adquirir:** conservar el PDF/imagen original y calcular SHA-256 real. Mantener el original inmutable.
4. **Extraer:** Docling para PDFs digitales y estructura; OCRmyPDF para añadir capa de texto a PDFs escaneados; PaddleOCR como alternativa para documentos difíciles, layouts, imágenes y fórmulas.
5. **Segmentar:** detectar cabeceras de pregunta, alternativas, gráficos, páginas y numeración. No confiar únicamente en OCR ni completar una fórmula ilegible por inferencia.
6. **Normalizar:** texto limpio para comparación, preservando el enunciado original y su versión visual/LaTeX.
7. **Clasificar:** sugerir curso/tema/subtema de la taxonomía; el revisor confirma.
8. **Validar clave:** cotejar solucionario oficial cuando exista; de lo contrario, resolver independientemente y marcar `SOLVED_AND_VERIFIED`. Sin respaldo, dejar clave `UNVERIFIED` y excluir de simulacros puntuables.
9. **Comparar recurrencias:** ejecutar hash exacto, similitud léxica y, en lote, similitud semántica; crear candidatos, no fijas automáticas.
10. **Revisión humana:** aprobar enunciado, opciones, clave, explicación, fuente y coincidencias.
11. **Publicar:** versionar dataset, generar reporte de validación y desplegar.

## 7. Herramientas open source evaluadas

| Herramienta | Uso recomendado | Decisión |
|---|---|---|
| Docling (MIT) | Parsear PDFs digitales preservando orden, tablas, fórmulas y estructura | Primera opción para extracción |
| OCRmyPDF (MPL-2.0) | Añadir capa de texto a escaneos y hacerlos buscables | Preprocesamiento opcional |
| PaddleOCR (Apache-2.0) | OCR/layout multilingüe y documentos más complejos | Fallback para escaneos difíciles |
| RapidFuzz (MIT) | Comparación léxica rápida para duplicados casi literales | Ejecutar en lote |
| sentence-transformers (Apache-2.0) | Embeddings para detectar variantes semánticas | Etapa posterior, solo genera candidatos |
| Label Studio (Apache-2.0) | Anotación colaborativa de datasets | No integrar al inicio; construir una revisión pequeña dentro de la app |
| pgvector (PostgreSQL) | Búsqueda vectorial integrada en Postgres | Opcional si el volumen lo justifica |
| Qdrant (Apache-2.0) | Base vectorial dedicada | No introducir ahora; sería complejidad innecesaria |

Repositorios:
- https://github.com/docling-project/docling
- https://github.com/ocrmypdf/OCRmyPDF
- https://github.com/PaddlePaddle/PaddleOCR
- https://github.com/rapidfuzz/RapidFuzz
- https://github.com/UKPLab/sentence-transformers
- https://github.com/HumanSignal/label-studio
- https://github.com/pgvector/pgvector
- https://github.com/qdrant/qdrant

Las estrellas de GitHub no sustituyen evaluación de licencia, mantenimiento, coste operativo ni ajuste a nuestro flujo.

## 8. Arquitectura proporcional al proyecto

Mantener la app Vite como cliente ligero, móvil y offline-first. La extracción y análisis documental deben ejecutarse en un pipeline de administración separado (CLI Python), no dentro del navegador del estudiante.

Salida del pipeline:
- JSON versionado del banco.
- inventario de exámenes/fuentes.
- clusters de recurrencia con evidencia.
- reporte de calidad y preguntas bloqueadas.

La app importa datasets aprobados a IndexedDB para uso offline. Supabase puede conservar autenticación, progreso y, si más adelante se requiere curaduría multiusuario, los registros editoriales. No desplegar Qdrant ni otro servicio vectorial para el banco actual.

## 9. Experiencia de usuario

### Administración / curaduría

- Fuentes: documentos encontrados, origen, estado, fecha y verificación.
- Exámenes: cada convocatoria con sus 100 preguntas, cobertura y faltantes.
- Cola de revisión: OCR, clasificación, clave y explicación pendientes.
- Coincidencias: comparación lado a lado con diff de enunciado, opciones y fórmulas.
- Fijas verificadas: solo registros `VERIFIED`, mostrando los exámenes donde aparecieron.
- Frecuencia: temas/patrones por número de convocatorias y años, con muestra visible.

### Estudiante

- Simulacros por modalidad exacta (Ordinario, Extraordinario I, Extraordinario II/Concurso Escolar).
- Práctica de Fijas verificadas.
- Práctica de temas frecuentes.
- Diagnóstico personal separado del análisis global de exámenes.
- En cada resultado: explicar si se trata de repetición literal, patrón recurrente o solo tema frecuente.

Mantener las pantallas enfocadas: un objetivo primario por vista, filtros avanzados plegados y detalles bajo demanda.

## 10. Métricas que se pueden mostrar

- Presencia por convocatoria: `5 de 8 exámenes revisados`.
- Repeticiones exactas y variantes confirmadas.
- Frecuencia por tema y tendencia reciente.
- Distribución porcentual por área/curso en cada modalidad.
- Cobertura documental: preguntas extraídas / preguntas esperadas.
- Calidad: preguntas con clave validada, clasificación revisada y fuente trazable.

No llamar "probabilidad de que salga" a una frecuencia histórica. Mostrar el tamaño de muestra y las fechas cubiertas.

## 11. Criterios de aceptación

- Cada pregunta publicada tiene fuente, convocatoria, página/número y estado de clave.
- Un registro no se convierte en fija por ser oficial, por haber sido estudiado o por ser un tema común.
- Los clusters tienen al menos dos documentos de examen distintos y una decisión de revisión.
- Ordinario, Extraordinario I y Extraordinario II están separados como modalidades.
- La duración y la puntuación vienen de la versión de prospecto/reglamento que se aplica a esa convocatoria.
- Error y blanco aportan cero descuento en UNSM; el puntaje positivo usa la matriz vigente de pesos por bloque/carrera.
- Un examen incompleto o con claves sin verificar no se usa para simulacros puntuables.
- No se sobrescriben documentos originales ni registros históricos; toda corrección genera nueva versión.
- Los tests verifican conteo de preguntas, número de alternativas, ausencia de duplicados, claves, modalidades y cálculo de puntaje.
