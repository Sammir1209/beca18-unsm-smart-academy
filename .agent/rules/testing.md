# Quality Assurance & Testing Rules

## Protocolos de Prueba
1. **Validación de Integridad de Preguntas**:
   - Cada pregunta debe poseer exactamente una clave correcta declarada en sus alternativas.
   - Las alternativas deben ser únicas, no vacías y libres de caracteres corruptos de OCR.
   - Toda pregunta debe tener solución o justificación conceptual verificada.
2. **Pruebas de Cálculo de Puntaje**:
   - Ponderación UNSM oficial: Puntos por acierto vs. penalización por error según reglamento.
   - Ponderación Beca 18 / ENP: Puntuación según bases oficiales (generalmente sin puntaje en contra o con tabla de conversión de percentiles específica).
3. **Pruebas de Resistencia del Temporizador**:
   - Comprobar que pausar, minimizar o avanzar el reloj local no corrompa el cálculo absoluto de tiempo restante.
4. **Pruebas de Responsive Design**:
   - Validar navegación en anchos móviles (360px - 414px) y pantallas de escritorio (1280px - 1920px).
