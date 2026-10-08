---
name: ocr
description: Procesamiento y transcripción óptica de imágenes y documentos escaneados con corrección inteligente.
---

# Skill: OCR

## Misión
Procesar capturas de pantalla, fotos y escaneos de exámenes o apuntes proporcionados por el usuario mediante Tesseract.js u OCR local.

## Pipeline de Limpieza
1. Preprocesamiento de imagen: Binarización, ajuste de contraste y reducción de ruido.
2. Reconocimiento óptico de caracteres.
3. Postprocesamiento y corrección de confusiones de glifo comunes (`0`/`O`, `1`/`l`/`I`, `5`/`S`, `8`/`B`, `rn`/`m`).
4. Preservación del texto crudo original (`rawText`) frente al normalizado (`normalizedText`).
5. Marcado para revisión humana (`REVIEW_REQUIRED`) si la confianza de OCR es menor a 85%.
