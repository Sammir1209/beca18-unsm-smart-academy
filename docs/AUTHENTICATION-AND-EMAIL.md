# UNSM ACADEMY — Autenticación y correos

Este documento define la configuración prevista para el dominio canónico:

- Producción: https://unsm-academy.vercel.app
- Callback: https://unsm-academy.vercel.app/auth/callback

## Reglas de seguridad

1. No fijar el dominio de producción dentro de las plantillas de correo.
2. Usar los enlaces de Supabase (`{{ .ConfirmationURL }}`) y conservar el Redirect URL solicitado por la aplicación.
3. La aplicación que inicia el flujo PKCE debe completar el intercambio del código en el mismo origen que creó el verifier.
4. No reenviar códigos de verificación, tokens ni enlaces de un solo uso.
5. No exponer la Supabase service_role key en el navegador. La aplicación cliente solo puede utilizar la publishable/anon key.
6. Mantener RLS activado y validar los permisos en servidor/base de datos.

## Redirect URLs de Supabase

En Authentication → URL Configuration:

- Site URL: `https://unsm-academy.vercel.app`
- Redirect URLs:
  - `https://unsm-academy.vercel.app/**`
  - Añadir la URL exacta del preview de Vercel mientras se prueban previews, y retirarla cuando deje de utilizarse.

No usar un comodín abierto para cualquier dominio.

## Plantillas

Las plantillas versionadas del proyecto están en:

- `supabase/templates/confirmation.html`
- `supabase/templates/recovery.html`

En Supabase Dashboard → Authentication → Email Templates, copiar el HTML correspondiente en Confirm signup y Reset password.

La variable `{{ .ConfirmationURL }}` es el enlace de acción generado por Supabase. No sustituirla por un dominio fijo.

## Callback de la aplicación

El callback debe:

- Leer el parámetro `code` de la URL.
- Ejecutar `supabase.auth.exchangeCodeForSession(code)` desde el mismo origen del flujo PKCE.
- Mostrar estados de carga, éxito y error sin revelar el código.
- Limpiar el parámetro sensible de la URL después del intercambio.
- Redirigir al área privada solo después de confirmar la sesión.

La ruta debe implementarse en la aplicación web activa y probarse con una cuenta de prueba antes de cambiar producción.

## Checklist de validación

- [ ] Registro nuevo desde el dominio canónico.
- [ ] Correo recibido con diseño correcto.
- [ ] Confirmación devuelve al callback canónico.
- [ ] Sesión establecida correctamente.
- [ ] Inicio de sesión y cierre de sesión.
- [ ] Recuperación y cambio de contraseña.
- [ ] Redirecciones de preview no interfieren con producción.
- [ ] RLS impide leer datos privados desde otra cuenta.

## Estado

Este repositorio contiene actualmente una aplicación Vite/JavaScript anterior. La nueva aplicación móvil Next.js desplegada como preview todavía debe incorporarse al control de versiones antes de que este callback pueda considerarse implementado. Las plantillas HTML aquí guardadas son artefactos versionados; no se instalan automáticamente en el proyecto Supabase.