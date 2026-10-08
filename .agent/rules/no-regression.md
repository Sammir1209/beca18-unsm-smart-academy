# No-Regression Rules

## Preservación del Conocimiento y Compatibilidad
1. **Inmutabilidad de Registros Históricos**:
   - Una vez ingerido un examen del 2023, 2024 o 2025 con su hash de archivo, queda congelado. Ninguna actualización puede sobrescribir o desindexar preguntas históricas válidas.
2. **Compatibilidad Hacia Atrás**:
   - Las migraciones de esquema de datos en `IndexedDB` deben conservar sin pérdida las respuestas, rachas, diagnósticos y fichas creadas por el usuario.
3. **Control de Versiones de Contenido**:
   - Toda ficha o material tiene versión semántica. Al actualizar una explicación, se conserva la referencia histórica.
4. **Verificación de Cero Errores en Tiempo de Ejecución**:
   - Prohibido hacer deploys con referencias rotas a fichas, cursos o preguntas faltantes.
