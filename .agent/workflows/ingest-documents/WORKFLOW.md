# Workflow 02: Ingest Documents

## Objetivo
Tomar documentos de fuentes autorizadas o provistos por el usuario, validar su integridad (checksum SHA-256) y prepararlos para extracción.

## Pasos de Ejecución
1. Recepción del documento (PDF, imagen, TXT).
2. Verificación de formato, tamaño y ausencia de corrupción.
3. Cálculo de huella digital SHA-256 para evitar duplicación.
4. Almacenamiento inmutable en `content/raw/{INSTITUCION}/{AÑO}/{MODALIDAD}/`.
5. Registro de entrada en `audit/audits.json`.
