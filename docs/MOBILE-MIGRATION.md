# UNSM ACADEMY — Migración a la nueva aplicación móvil

## Situación verificada

- El repositorio principal contiene una aplicación Vite con JavaScript modular y persistencia local.
- La nueva interfaz móvil fue desplegada previamente como preview independiente de Next.js.
- La versión de preview no estaba versionada en este repositorio.
- Supabase contiene el esquema académico y políticas RLS; el banco de preguntas todavía no está poblado.
- El dominio de producción no debe cambiar hasta completar las pruebas funcionales.

## Objetivo de integración

Incorporar la nueva interfaz mobile-first al repositorio con una única fuente de verdad, conservando el historial de la aplicación anterior hasta decidir su retiro.

## Requisitos de aceptación

1. Diseño mobile-first con ancho de lectura optimizado para teléfonos, safe areas y navegación táctil.
2. Rutas protegidas y callback PKCE correcto.
3. Catálogo académico público disponible sin iniciar sesión.
4. Prácticas y simuladores registran intentos mediante operaciones seguras.
5. Panel administrativo restringido a perfiles autorizados.
6. Carga de fuentes y documentos con bucket privado.
7. Estados vacíos, errores, carga y conectividad contemplados.
8. Accesibilidad básica, contraste, teclado y tamaños táctiles.
9. Build reproducible desde GitHub y despliegue Preview de Vercel.
10. Pruebas de registro, confirmación, sesión, recuperación, RLS y flujos académicos.

## Secuencia de despliegue

1. Integrar y revisar el código móvil en esta rama.
2. Conectar un proyecto Preview de Vercel al repositorio/branch.
3. Ejecutar build y pruebas automatizadas.
4. Verificar autenticación con una cuenta de prueba.
5. Revisar el preview en teléfono real.
6. Promover a producción solo después de aprobar los criterios anteriores.

No configurar esta rama como producción ni cambiar el alias principal durante la fase de integración.