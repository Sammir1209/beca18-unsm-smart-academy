# Banco de preguntas y simuladores UNSM · PRE - EINSTEIN

> Estado: investigación y diseño de dominio. Los hechos de convocatorias antiguas son referencias históricas, no configuración oficial automática para 2027-I. Pendiente obtener y validar el Prospecto y Reglamento 2026-II / 2027-I completos.

## 1. Conclusiones de la investigación

### Fuentes oficiales primarias

1. Dirección de Admisión: https://admision.unsm.edu.pe/
   - El portal actual publica el proceso 2027-I y diferencia Examen Ordinario, Extraordinario I y Extraordinario II / Concurso Escolar.
   - Para 2027-I el portal indica Prueba de Conocimientos del Ordinario para el 29 de noviembre de 2026 a las 09:00.
   - Para 2026-II hay enlaces a Prospecto y Reglamento, además de resultados de conocimientos del Ordinario y Extraordinario I.
2. Portal de Transparencia / Temario: https://transparencia.unsm.edu.pe/admision/temario
   - Publica un “Cuestionario para el examen” y un enlace a archivo adjunto. La página lista materias; el PDF adjunto no pudo recuperarse durante esta investigación y debe obtenerse directamente para extraer el contenido.
3. Reglamento de Admisión de Pregrado 2024-I (Resolución 1241-2023-UNSM/CU-R):
   https://transparencia.unsm.edu.pe/documentos/2024/transparencyportal/admission/432f0a36-4561-4d74-90df-c9e6b93d7826.pdf
   - Art. 52: Ordinario, Extraordinario I y Extraordinario II / Concurso Escolar: 100 preguntas, 150 minutos.
   - Arts. 63–67: para el modelo de ese reglamento, puntaje máximo de 200; Aptitud Académica (80) + Conocimientos (120) para Ordinario, Extraordinario I y Concurso Escolar. La ponderación varía según bloque/carrera y prospecto.
   - No se ha encontrado en el material revisado un respaldo para una penalización universal de -0.5 por respuesta incorrecta. No programar penalización hasta comprobar regla vigente.
4. Prospecto UNSM 2023-I con anexos de distribución:
   https://transparencia.unsm.edu.pe/documentos/2024/transparencyportal/transparencyportalmanagementdocuments/7057d77b-2949-451a-8960-4ab411fca302.pdf
   - Es una referencia histórica útil, no debe sustituir los parámetros 2026-II/2027-I.
5. Noticias institucionales 2026-I:
   https://www.gob.pe/institucion/unsm/noticias/1358067-unsm-realiza-examen-de-admision-extraordinario-2026-i
   - Reporta el examen Extraordinario I 2026-I como 100 preguntas, 2 horas y media.
6. Centro Preuniversitario: https://cpu.unsm.edu.pe/
   - Tiene su propio calendario, exámenes parciales y resultados. No mezclar CPU con el examen Ordinario o Concurso Escolar.

### Materias visibles en el cuestionario del portal oficial

- Razonamiento Verbal
- Razonamiento Matemático
- Física
- Matemática
- Aritmética
- Geometría Plana y del Espacio
- Trigonometría
- Biología
- Química
- Lenguaje y Literatura
- Ciencias Sociales
- Geografía
- Economía
- Filosofía y Lógica
- Psicología
- Cultura General y Educación Cívica
- Inglés

Este listado demuestra áreas publicadas, no el número de preguntas vigente por área ni el temario detallado de cada subtema.

## 2. Modalidades (no colapsar en un “Extraordinario” único)

| Código interno | Nombre de producto | Tratamiento |
|---|---|---|
| `ORDINARIO` | Examen Ordinario | Examen de conocimientos general. |
| `EXTRAORDINARIO_I` | Examen Extraordinario I | Categorías especiales y etapas propias; algunas categorías combinan expediente/entrevista/prueba técnica con conocimientos. |
| `CONCURSO_ESCOLAR` | Extraordinario II – Concurso Escolar | Modalidad para quinto año de secundaria. Mantener blueprint propio; el nombre visible depende de la convocatoria. |
| `CPU` | Centro Preuniversitario UNSM | Ciclo y evaluaciones propios; no es un examen de admisión ordinario. |
| `PRACTICA_LIBRE` | Práctica libre por áreas | Selección flexible de preguntas, no equivalente a un examen oficial. |

El portal actual 2027-I identifica Concurso Escolar de forma diferenciada. CPU tiene un portal/itinerario independiente y no debe presentarse como prueba general de admisión.

## 3. Bloques de carrera

Mantener los bloques como entidad versionada por prospecto, no como etiquetas arbitrarias en el código:

- Bloque A: Ingeniería y Tecnología (por ejemplo, Arquitectura, Ingeniería de Sistemas e Informática, Ingeniería Civil).
- Bloque B: Ingeniería y Ambiente / Ciencias Agrarias (por ejemplo, Agronomía, Ingeniería Agroindustrial, Ingeniería Ambiental, Ingeniería Sanitaria).
- Bloque C: Ciencias de la Salud (por ejemplo, Enfermería, Obstetricia, Medicina Humana, Medicina Veterinaria).
- Bloque D: Ciencias Económicas (por ejemplo, Administración, Contabilidad, Economía, Turismo).
- Bloque E: Educación, Humanidades y Ciencias Sociales (por ejemplo, Derecho, Educación Inicial, Educación Primaria, Educación Secundaria, Idiomas).

La relación carrera–bloque debe cargarse desde el prospecto vigente de cada edición y verificarse por el administrador académico; los nombres anteriores son orientación basada en documentos históricos.

## 4. Referencia cuantitativa histórica 2023-I

El prospecto 2023-I publica distribuciones por curso y bloque:

### Ordinario y Extraordinario II / Concurso Escolar (2023-I)

- 100 preguntas y 200 puntos.
- Aptitud Académica: 45 preguntas / 80 puntos:
  - Razonamiento Matemático: 15.
  - Razonamiento Verbal: 20.
  - Cultura General: 10.
- Conocimientos: 55 preguntas / 120 puntos:
  - Matemática: 10.
  - Física: 8.
  - Química: 7.
  - Biología: 7.
  - Lengua y Literatura: 5.
  - Historia y Geografía: 6.
  - Inglés: 2.
  - Psicología, Filosofía y Lógica: 3.
  - Economía: 5.
  - Educación Cívica: 2.

### Extraordinario I (2023-I)

El anexo específico presenta un examen de conocimientos de 70 preguntas / 100 puntos:
- Aptitud Académica: 28 preguntas / 40 puntos:
  - Razonamiento Matemático: 10.
  - Razonamiento Verbal: 13.
  - Cultura General: 5.
- Conocimientos: 42 preguntas / 60 puntos:
  - Matemática: 8.
  - Física: 6.
  - Química: 6.
  - Biología: 6.
  - Lengua y Literatura: 3.
  - Historia y Geografía: 4.
  - Inglés: 1.
  - Psicología, Filosofía y Lógica: 3.
  - Economía: 3.
  - Educación Cívica: 2.

El mismo prospecto 2023-I muestra etapas y ponderaciones adicionales para algunas categorías de Extraordinario I (expediente, entrevista y/o prueba técnica). Por ello, el simulador debe identificar la categoría del postulante y mostrar solo las etapas aplicables; no asumir que todas las categorías rinden idéntico componente.

Estos datos son **históricos 2023-I**, no plantillas oficiales vigentes por defecto. Aunque el Reglamento 2024-I y la nota institucional 2026-I respaldan 100 preguntas / 150 min para algunas pruebas, falta extraer el prospecto/reglamento 2026-II o 2027-I para fijar las distribuciones y puntajes actuales.

## 5. Fuentes secundarias y límites

Se localizaron:
- Studylib: prospecto histórico 2013-II, material aportado por usuario/terceros.
- Pre-U Advance: catálogo de bancos y exámenes UNSM históricos (2013–2021), parte detrás de acceso de curso.
- Repositorios de academias y PDFs con solucionarios.

Usarlos como pistas de investigación, no como autoridad ni para copiar automáticamente. No automatizar scraping de cursos privados, paywalls o repositorios con acceso restringido. No asumir que un solucionario es correcto. Respetar derechos de autor y permisos de reutilización. Crear preguntas originales alineadas al temario oficial cuando no haya licencia para importar el material exacto.

## 6. Arquitectura de contenido propuesta

Reutilizar entidades y tablas existentes en Supabase (`subjects`, `courses`, `topics`, `sources`, `source_documents`, `questions`, `question_options`, `question_answer_keys`, `validation_reviews`). No crear bancos duplicados.

Ampliar/versionar el modelo en torno a:

### Convocatorias y estructura
- `admission_editions`: `id`, `institution`, `academic_year`, `term`, `official_resolution`, `prospectus_source_id`, `effective_from`, `status`, `verified_at`.
- `admission_modalities`: `id`, `code`, `name`, `description`, `stages_json`.
- `career_blocks`: `id`, `edition_id`, `code` (A–E), `name`, `description`.
- `admission_programs`: programa/carrera, facultad, sede y relación con bloque/version.
- `exam_blueprints`: `edition_id`, `modality_id`, `block_id`, `section`, `question_count`, `time_limit_seconds`, `max_score`, `scoring_rules`, `status`.
- `exam_blueprint_subjects`: `blueprint_id`, `subject_id`, `question_count`, `weight`, `max_points`, `source_reference`.
- `exam_sessions`: snapshot inmutable de blueprint y versionado, lista de pregunta IDs, pesos, timestamps, estado.
- Reusar `practice_sessions`/ `attempts` si los campos existentes cubren el caso; revisar su schema antes de migrar.

### Contenido y evidencia
Cada pregunta debe tener:
- institución, edición, modalidad, sección (aptitud/conocimientos), bloque si el peso cambia, materia, tema, subtema, dificultad, competencia;
- enunciado original o adaptado con indicación explícita;
- alternativas únicas, clave y explicación validada;
- tipo de procedencia: `OFFICIAL`, `PROCESSED_FROM_OFFICIAL`, `USER_PROVIDED`, `SECONDARY`, `ORIGINAL_GENERATED`;
- origen, documento, página, número, checksum SHA-256 calculado sobre archivo real, año, licencia/permiso, fecha de revisión;
- estado editorial: `DRAFT`, `EXTRACTED`, `CLASSIFIED`, `REVIEW_REQUIRED`, `VALIDATED`, `PUBLISHED`, `REJECTED`.

Separar la clave de respuesta de la tabla expuesta al cliente; `question_answer_keys` sigue restringida a admins/revisores. El banco público entrega enunciados/opciones publicados, pero no la clave hasta el momento y contexto permitidos.

## 7. Pipeline de ingestión

1. Registrar una fuente (URL oficial, archivo institucional, documento del usuario o fuente secundaria).
2. Conservar archivo original y hash real; no inventar checksums ni afirmar procesado si el PDF no se ha abierto.
3. Extraer texto/tablas y conservar número de página.
4. Si OCR es necesario, mantener el texto OCR separado del original y marcar confianza.
5. Crear candidato de pregunta sin publicar ni clave automáticamente.
6. Normalizar alternativas y fórmulas; enlazar con catálogo de materia/tema.
7. Revisar respuesta y procedimiento de manera independiente.
8. Verificar coincidencias/duplicados por hash y similitud como candidatos.
9. Si se propone “fija”, exigir repetición confirmada en al menos dos documentos distintos con referencia de página y número de pregunta.
10. Revisión académica humana y doble aprobación para claves dudosas.
11. Publicar versión; guardar auditoría de cambios y no sobrescribir originales.

## 8. Motor de simulacros

El motor no debe tener números, duración ni puntaje hardcodeados como reglas universales.

Al iniciar:
1. Seleccionar edición vigente y modalidad exacta.
2. Seleccionar carrera/programa y resolver su bloque del prospecto vigente.
3. Cargar blueprint verificado correspondiente.
4. Comprobar que existen suficientes preguntas publicadas y válidas por sección, materia y bloque.
5. Seleccionar aleatoriamente sin duplicar, respetando distribución.
6. Congelar snapshot de preguntas, opciones, pesos y versión del blueprint.
7. Persistir inicio, fecha límite absoluta, respuestas y progreso.
8. Recuperar la sesión tras refrescar/cerrar, con temporizador calculado desde la fecha límite del servidor.
9. Al entregar, calificar con peso del blueprint snapshot y mostrar puntaje, resultados por área y diagnóstico.
10. Guardar revisión de respuestas y vincular errores a práctica adaptativa.
11. Nunca mostrar la clave antes de entregar una evaluación formal.
12. Si el banco no alcanza el número/configuración requerida, deshabilitar el modo “Simulacro oficial” y ofrecer práctica libre con etiqueta clara.

### Estados de sesión
`DRAFT -> READY -> IN_PROGRESS -> SUBMITTED -> GRADED -> REVIEWED`.
`EXPIRED` se genera por reloj absoluto; `ABANDONED` solo por decisión/regla explícita. Cada transición guarda auditoría.

### Scoring
- Guardar regla exacta: acierto, error, blanco, fracción si aplica, redondeo y puntaje máximo.
- No asumir penalización negativa; no está acreditada por los reglamentos revisados.
- El puntaje por materia puede variar por bloque A–E.
- No aplicar una distribución 2023-I a una edición 2027-I sin revisar el documento vigente.
- Conservar el cálculo histórico para que un simulacro anterior no cambie cuando se publica otro prospecto.

## 9. Requisitos de calidad

- Banco no vacío por modalidad/edición; conteos válidos por blueprint.
- Todas las preguntas publicadas tienen clave y explicación aprobadas.
- Alternativas no duplicadas y clave pertenece a una alternativa real.
- Fórmulas/rendering validados.
- Ninguna pregunta duplicada en un mismo simulacro.
- Ninguna mezcla silenciosa de modalidades o ediciones.
- Auditoría y procedencia completas.
- Pruebas del generador, score engine, reloj, persistencia y restauración.
- Revisión móvil, teclado, lectores de pantalla y modo offline.
- Cuadro de métricas de cobertura por edición, bloque, materia, tema y dificultad.

## 10. Próximas fuentes necesarias

Para configurar oficialmente la edición 2027-I se requiere incorporar/inspeccionar:
- Prospecto de Admisión 2026-II publicado por Dirección de Admisión.
- Reglamento de Admisión 2026-II.
- Cuestionario descargable del portal de Transparencia (PDF adjunto de temario).
- Resultados/actas o distribución oficial de la prueba de conocimientos del Ordinario 2026-II (no confundir resultados de ingresantes con cuadernillo de preguntas).
- Si existen, anexos oficiales de estructura/pesos por bloque para 2026-II/2027-I.

El portal oficial presenta enlaces a documentos 2026-II pero sus archivos Google Drive no fueron recuperables desde esta sesión; no se ha inspeccionado ese contenido. Solicitar copias directas a Admisión por transparencia o aportar los PDFs originales antes de fijar pesos exactos.

## 11. Referencias consultadas

- Admisión UNSM: https://admision.unsm.edu.pe/
- Temario / Cuestionario oficial: https://transparencia.unsm.edu.pe/admision/temario
- Reglamento 2024-I: https://transparencia.unsm.edu.pe/documentos/2024/transparencyportal/admission/432f0a36-4561-4d74-90df-c9e6b93d7826.pdf
- Prospecto 2023-I con anexos: https://transparencia.unsm.edu.pe/documentos/2024/transparencyportal/transparencyportalmanagementdocuments/7057d77b-2949-451a-8960-4ab411fca302.pdf
- Nota oficial Extraordinario I 2026-I: https://www.gob.pe/institucion/unsm/noticias/1358067-unsm-realiza-examen-de-admision-extraordinario-2026-i
- CPU UNSM: https://cpu.unsm.edu.pe/
- Catálogo secundario de bancos PRE-U Advance (acceso restringido): https://campus.preuadvance.com/course/view.php?id=3
- Prospecto histórico 2013-II (copia de terceros): https://studylib.es/doc/8512202/escuela-acad%C3%A9mico---universidad-nacional-de-san-mart%C3%ADn
