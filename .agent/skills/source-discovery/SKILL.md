---
name: source-discovery
description: Localiza, cataloga y verifica fuentes oficiales y secundarias para Beca 18 / PRONABEC y UNSM.
---

# Skill: Source Discovery

## Misión
Localizar enlaces y documentos descargables oficiales (bases, prospectos, temarios, exámenes de admisión, resoluciones) para las convocatorias de Beca 18 y la Universidad Nacional de San Martín (UNSM).

## Jerarquía de Búsqueda
1. Portales Oficiales de PRONABEC (`pronabec.gob.pe`, `gob.pe/pronabec`).
2. Portales Oficiales de la UNSM (`unsm.edu.pe`, `admision.unsm.edu.pe`).
3. Repositorios institucionales y boletines universitarios.
4. Repositorios académicos secundarios confiables.

## Salida Estructurada
Generar y actualizar `research/sources/source-inventory.json` registrando metadatos:
- URL
- Título
- Tipo de documento (BASES, TEMARIO, EXAMEN, PROSPECTO)
- Año y Periodo
- Modalidad (Ordinario, Extraordinario, Concurso Escolar, Quinto Secundaria, ENP)
- Estado de disponibilidad (DISPONIBLE, DESCARGADO, MANUAL_IMPORT_REQUIRED)
