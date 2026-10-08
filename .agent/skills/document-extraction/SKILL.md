---
name: document-extraction
description: Pipeline de extracción y estructuración de documentos académicos (PDF, DOCX, TXT) y exámenes.
---

# Skill: Document Extraction

## Misión
Transformar documentos en texto limpio estructurado, detectando páginas, secciones, encabezados de áreas curriculares y bloques individuales de examen.

## Capacidades
1. Extracción directa de texto para PDFs con capa de texto digital.
2. Detección de delimitadores de preguntas (`1.`, `01.`, `1)`, `1.-`).
3. Segmentación de alternativas múltiples (`A)`, `B)`, `C)`, `D)`, `E)` y `a)`, `b)`...).
4. Identificación de claves de respuesta si están presentes al pie o en matriz final.
5. Ingesta híbrida con fallback a OCR cuando se detectan páginas escaneadas o mapas de bits.
