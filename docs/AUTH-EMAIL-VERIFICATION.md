# Autenticación de UNSM Academy

## Flujo temporal activo

La aplicación utiliza únicamente registro e inicio de sesión con correo y contraseña mediante Supabase Auth.

- Registro: nombre completo, correo, contraseña y confirmación de contraseña.
- Inicio de sesión: correo y contraseña.
- No se ofrece recuperación por correo ni verificación de correo desde la interfaz.
- No se envía `emailRedirectTo` ni se procesa un callback de confirmación o recuperación.

## Configuración obligatoria en Supabase

Para que el registro inicie sesión inmediatamente, desactiva **Confirm email** en el proveedor Email de Supabase:

Authentication → Providers → Email → Confirm email → OFF.

Si esta opción continúa activada, Supabase devolverá un usuario sin sesión y la interfaz mostrará una explicación en vez de simular que el registro quedó listo.

## Seguridad

- Mantener contraseñas con un mínimo de 8 caracteres.
- No exponer nunca la clave `service_role` en el navegador.
- Mantener RLS y políticas de propiedad en todas las tablas con datos personales.
- La recuperación y la verificación por correo podrán reintroducirse más adelante como un flujo independiente.
