# Sources & Authenticity Rules

## Jerarquía de Fuentes
1. **Fuente Oficial**:
   - `pronabec.gob.pe`, `gob.pe/pronabec`
   - `unsm.edu.pe`, `admision.unsm.edu.pe`
   - Documentos oficiales: Bases de concurso, resoluciones directorales, temarios oficiales, prospectos y exámenes oficiales.
2. **Fuente Secundaria Confiable**:
   - Repositorios universitarios, publicaciones académicas, exámenes pasados compilados con sello de origen identificado.
3. **Fuente Aportada por Usuario**:
   - Documentos subidos localmente por el estudiante/docente. Etiquetados como `USER_PROVIDED`.

## Metadatos Obligatorios por Recurso
```json
{
  "sourceId": "SRC-UNSM-2024-ORD-01",
  "sourceType": "OFICIAL | PROCESADO_DESDE_OFICIAL | SECUNDARIA | USER_PROVIDED",
  "sourceUrl": "https://admision.unsm.edu.pe/...",
  "sourceTitle": "Examen de Admisión Ordinario 2024-I",
  "sourceDate": "2024-03-15",
  "institution": "UNSM | PRONABEC",
  "documentType": "EXAMEN | TEMARIO | PROSPECTO | BASES | SIMULACRO",
  "retrievalDate": "2026-10-08",
  "originalFile": "unsm_ordinario_2024_1.pdf",
  "checksum": "sha256_hash_here"
}
```

## Regla de Scraping y Descargas Éticas
- Respetar `robots.txt` y términos de servicio de portales institucionales.
- Prohibido evadir CAPTCHAs, romper autenticaciones o saturar servidores.
- Cuando una descarga requiera sesión o interacción humana, marcar `MANUAL_IMPORT_REQUIRED` y solicitar el archivo al usuario mediante interfaz guiada.
