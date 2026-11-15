# Registro, verificación y perfil del estudiante

## Flujo de cuenta

- Visitante: el menú "Mi cuenta" muestra únicamente "Iniciar sesión" y "Crear cuenta".
- Registro: nombre completo, correo, contraseña y confirmación de contraseña.
- El nombre se guarda como `user_metadata.full_name` en Supabase Auth.
- Al iniciar sesión, el menú muestra nombre, correo y acción para cerrar sesión.
- El dashboard saluda al estudiante usando su nombre.
- El progreso local se conserva aunque no haya sesión; al iniciar sesión se sincroniza con Supabase.

## Confirmación de correo

La app usa Supabase Auth con PKCE y cliente SPA. La página `#auth-confirm` soporta:

1. Callback de Supabase con `?auth=confirm&code=...` (intercambio PKCE automático de supabase-js).
2. Callback de plantilla personalizada con `/auth/confirm?token_hash=...&type=email` (verificación explícita mediante `verifyOtp`).
3. Reenvío de confirmación con `auth.resend({ type: 'signup', email, options: { emailRedirectTo } })`.

La app usa como redirect la URL del origen actual y la ruta `/?auth=confirm`.

## Configuración obligatoria en Supabase Dashboard

En **Authentication → URL Configuration**:

- Site URL de producción: `https://unsm-academy.vercel.app`
- Redirect URLs:
  - `https://unsm-academy.vercel.app/**`
  - `https://*-samirconter-1146s-projects.vercel.app/**`
  - `http://localhost:5173/**` (solo desarrollo local)

El patrón wildcard de Vercel Preview permite que los enlaces enviados desde despliegues Preview vuelvan al dominio exacto de esa preview. No se debe añadir `https://**` ni un comodín abierto a cualquier dominio.

## Plantilla de Confirm signup

En **Authentication → Emails → Confirm signup**, si se utiliza una plantilla personalizada basada en token hash, usar:

```html
<h2>Confirma tu correo electrónico</h2>
<p>Confirma tu dirección para activar tu cuenta de UNSM Academy.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a></p>
<p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
```

La variable `{{ .RedirectTo }}` debe conservar el redirect `/?auth=confirm` que envía el cliente. No reemplazarla por un dominio fijo de preview.

Si se mantiene la plantilla predeterminada, el enlace `{{ .ConfirmationURL }}` también debe conservar el parámetro `redirect_to` generado por Supabase.

## Diagnóstico

- Si Auth registra `user_repeated_signup`, el correo ya pertenece a una cuenta. El usuario debe iniciar sesión o recuperar su contraseña; un segundo signUp no crea otra cuenta.
- Si el correo no llega a una cuenta nueva, revisar Auth Logs y el proveedor SMTP.
- El SMTP de prueba de Supabase no es adecuado para envíos reales: para producción debe configurarse un SMTP propio con dominio autenticado.
- No desactivar la confirmación de correo para ocultar un problema de entrega.
