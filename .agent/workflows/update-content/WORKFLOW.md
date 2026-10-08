# Workflow 11: Update Content & Historical Ingestion

## Objetivo
Incorporar nuevos exámenes, temarios o bases publicadas sin romper ni sobrescribir los datos históricos existentes.

## Pasos de Ejecución
1. Detección de nuevo documento.
2. Descarga y cálculo de checksum SHA-256.
3. Comprobación de no duplicidad.
4. Extracción y segmentación de ítems.
5. Ingesta acumulativa en `content/raw/` y actualización de índices.
6. Recálculo automático de la matriz de frecuencias históricas de temas.
