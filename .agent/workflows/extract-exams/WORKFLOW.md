# Workflow 03: Extract Exams & OCR Processing

## Objetivo
Segmentar exámenes en texto plano e ítems independientes, aplicando OCR inteligente sobre páginas escaneadas o mapas de bits.

## Pasos de Ejecución
1. Detección de capas de texto digital; si carece de texto, invocar pipeline de OCR.
2. Limpieza de texto y normalización de glifos conflictivos.
3. Detección de patrones de pregunta (`1.`, `01.`, `1)`) y alternativas (`A)`, `B)`, `C)`, `D)`, `E)`).
4. Extracción de matriz de claves oficial si está incluida.
5. Emisión de documento estructurado intermedio en `content/processed/`.
