# Beca 18 + UNSM Smart Academy 2027

Sistema integral de preparación académica de alto rendimiento orientado al **Examen Nacional de Preselección (ENP - Beca 18 / PRONABEC)** y a la **Universidad Nacional de San Martín (UNSM - Tarapoto)**.

## 🚀 Arquitectura y Principios
- **Offline-First & Local-First**: Persistencia estructurada en `IndexedDB` (`SmartAcademyDB`) para funcionar sin interrupciones.
- **Trazabilidad y Autenticidad**: Preguntas oficiales catalogadas con documento de procedencia, número de página y solución detallada paso a paso.
- **Ciclo Cognitivo Activo**:
  - Diagnóstico & Recomendación adaptativa.
  - Práctica con opción *"No lo sé"* (aprende primero el concepto antes de penalizar).
  - Simuladores oficiales con temporizador absoluto basado en época (`epochTarget - Date.now()`).
  - Banco inteligente de errores ("Mis Errores") con reaprendizaje espaciado.
  - Fichas pedagógicas de alta densidad con teoría sintética, fórmulas, ejemplos, trampas y mini-prácticas.
  - Flashcards mnemotécnicas con algoritmo Leitner.

## 📁 Estructura del Proyecto
- `.agent/`: Reglas (`rules/`), Habilidades (`skills/`) y Flujos de trabajo (`workflows/`).
- `research/`: Inventario oficial de fuentes (`sources/`) y reportes de frecuencia histórica (`reports/`).
- `data/`: Repositorio canónico de preguntas, fichas temáticas, taxonomía, materiales y flashcards.
- `src/`: Capa de presentación (UI EdTech Premium), controladores de estado y almacenamiento local.

## 💻 Ejecución Local
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilación de producción
npm run build
```
Acceso local: `http://localhost:5173/`
