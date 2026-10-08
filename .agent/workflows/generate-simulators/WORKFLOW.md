# Workflow 09: Generate Simulators & Diagnostic Engine

## Objetivo
Configurar y ejecutar simulacros de examen bajo condiciones oficiales realistas (duración cronometrada, estructura de áreas y ponderación de puntajes) con motor de diagnóstico posterior.

## Pasos de Ejecución
1. Selección de modalidad:
   - **Beca 18 (ENP)**: 60 preguntas (30 Matemática + 30 Comprensión Lectora / RV), 120 minutos.
   - **UNSM Ordinario**: 100 preguntas distribuidas según matriz oficial de ponderación, 180 minutos.
   - **UNSM Extraordinario / Concurso Escolar**: Distribución reglamentaria correspondiente.
2. Modo examen estricto: sin retroalimentación intermedia, sin pistas, cronómetro absoluto resistente a refresh (`epochTarget - Date.now()`).
3. Cierre y calificación automática (Aciertos, Errores, Blancas, Puntaje final).
4. Generación de Diagnóstico:
   - Mapa de dominio temático (% por materia).
   - Detección de brechas críticas.
   - Actualización del Banco de Errores y recomendación de fichas prioritarias.
