---
name: recommendation
description: Motor adaptativo de diagnóstico y recomendación personalizado para preparación académica.
---

# Skill: Recommendation

## Misión
Evaluar el perfil del estudiante, detectar brechas temáticas específicas y guiar su ruta de estudio diaria de forma personalizada.

## Lógica del Algoritmo
1. **Detección de Brecha**: Calcular `% Dominio = (Aciertos / Total Intentos) * 100` por cada tema y subtema.
2. **Priorización de Urgencia**:
   - Temas marcados como "NO LO SÉ" o con tasa de error > 50%.
   - Temas de alta frecuencia histórica en el examen objetivo del estudiante.
3. **Prescripción Inmediata**:
   - Asignar lectura de Ficha Temática.
   - Proponer 3 ejercicios guiados de refuerzo.
   - Programar reevaluación en el Banco de Errores con espaciado temporal.
