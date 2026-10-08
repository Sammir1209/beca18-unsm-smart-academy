# Security, Privacy & Integrity Rules

## Integridad de Datos y Privacidad Local
1. **Local First**: Todos los datos de estudio del alumno (respuestas, tiempos, errores, notas y favoritos) se conservan de forma segura en el almacenamiento local del navegador (`IndexedDB`).
2. **Exportación e Importación**: Se debe proporcionar un mecanismo de respaldo en JSON cifrado/firmado para que el estudiante pueda migrar su progreso entre dispositivos sin perder historial.
3. **Validación de Archivos Subidos**:
   - Todo archivo importado por el usuario (PDF, JPG, PNG) debe ser validado por tipo MIME y tamaño máximo (límite 25MB).
   - Sanitizar texto antes de inyectarlo en el DOM para prevenir XSS.
4. **Respeto a Infraestructura Externa**:
   - Respeto estricto a las políticas de rate-limiting al consultar portales oficiales.
   - Headers limpios e identificables sin falsificación de credenciales ni ataques de fuerza bruta.
