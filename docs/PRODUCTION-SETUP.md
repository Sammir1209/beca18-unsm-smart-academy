# PRE - EINSTEIN · Configuración de producción

## Variables del frontend

| Variable | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL pública del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key (nunca service_role) |

No se necesita una cuenta ALTCHA, una clave pública de CAPTCHA ni una suscripción. El cliente usa ALTCHA JS open-source con versión fijada.

## CAPTCHA propio PRE - EINSTEIN

**Implementación desplegada en Supabase:** ALTCHA Proof-of-Work (MIT), personalizado con la interfaz PRE - EINSTEIN.

- Frontend: `src/ui/auth-page.js`; importa `altcha-lib@2.10.0` desde esm.sh para resolver el reto en el navegador.
- Backend: Edge Functions `captcha-challenge` y `captcha-verify`.
- Persistencia: `captcha_config`, `captcha_challenges`, `captcha_proofs` y `captcha_rate_limits`.
- El secreto HMAC se genera una sola vez en PostgreSQL y solo se lee desde Edge Functions con service_role. No está en el bundle.
- Pruebas de un solo uso: el reto se consume con compare-and-set; el comprobante se guarda como SHA-256 y vence a los 3 minutos.
- Límite inicial: 8 emisiones y 15 verificaciones por fingerprint en ventana de 10 minutos.
- Protección obligatoria de altas: trigger BEFORE INSERT sobre `auth.users`, que valida y consume el comprobante incluso cuando se llama directamente a Supabase Auth. El trigger AFTER INSERT elimina la metadata temporal.
- El Before User Created Hook SQL está disponible como validación adicional opcional; no es requisito para que el trigger aplique la barrera.

No se usa Turnstile, hCaptcha, Google reCAPTCHA, ALTCHA Cloud ni Sentinel. ALTCHA PoW no identifica personas ni detiene toda automatización; debe combinarse con confirmación de correo, límites y monitorización.

## Estado de infraestructura

- [x] Migraciones CAPTCHA aplicadas a Supabase.
- [x] Tablas internas con RLS habilitado; sin acceso de lectura para anon/authenticated.
- [x] Edge Functions `captcha-challenge` y `captcha-verify` desplegadas.
- [x] Función de rate limit transaccional.
- [x] Trigger obligatorio de alta y trigger de limpieza de metadata instalados.
- [x] Widget de registro propio integrado y sin referencias a Turnstile.
- [ ] Probar el flujo real desde navegador móvil y escritorio en el dominio publicado.
- [ ] Activar protección contra contraseñas filtradas en Supabase Auth.
- [ ] Revisar Site URL, Redirect URLs y confirmación de correo.

## Dominios permitidos

Las funciones permiten el dominio Pages de producción y sus subdominios de preview, el dominio Vercel anterior y localhost de desarrollo. Para un dominio personalizado, agregar su origen exacto en el secreto de Edge Function `CAPTCHA_ALLOWED_ORIGINS` (lista separada por comas) y volver a desplegar o actualizar la configuración de la función.

## Supabase Auth

- Site URL: dominio de producción de PRE - EINSTEIN.
- Redirect URLs: dominio de producción y URLs exactas de preview/desarrollo.
- Mantener confirmación de correo activada.
- Activar protección contra contraseñas filtradas y definir política de contraseña robusta.
- Revisar plantillas de confirmación y recuperación para el dominio de producción.

Con confirmación de correo activada, Supabase puede devolver `session: null`; el usuario confirma el correo y luego inicia sesión.

## Base de datos y seguridad

Las migraciones se guardan en `supabase/migrations`. No ejecutar SQL manual distinto del repositorio sin registrar una migración. Las tablas de progreso y estado de aprendizaje aplican RLS por `auth.uid()`. Las funciones `SECURITY DEFINER` expuestas deben mantener validaciones de identidad y límites estrictos.

Las tablas `tutor_chat_usage`, `tutor_live_usage` y `tutor_tts_usage` no tienen políticas de acceso directo deliberadamente: el acceso se realiza mediante funciones RPC que validan `p_user_id = auth.uid()`. No abrir lectura/escritura directa a estudiantes.

## Banco de preguntas y simulacros

El banco actual del repositorio contiene 31 preguntas estáticas. La base de datos relacional `questions` y `question_options` está vacía. No declarar completo un examen de 60/80/100 preguntas hasta cargar suficientes ítems de esa modalidad, con claves y procedencia verificadas. No duplicar preguntas para alcanzar el número objetivo.

Las etiquetas `OFICIAL`, `VALIDATED` y `isFija` requieren evidencia documental, páginas y números de pregunta. Una pregunta fija necesita recurrencia verificada en al menos dos documentos distintos.

## Pendiente antes de declarar producción validada

- [ ] Prueba E2E de emisión, resolución, verificación y registro con email de prueba.
- [ ] Verificar rechazo de proof ausente, inválido, vencido y reutilizado.
- [ ] Verificar que la metadata temporal desaparece tras crear usuario.
- [ ] Confirmar build y despliegue del frontend desde el proveedor de hosting.
- [ ] Activar leaked password protection y revisar redirecciones Auth.
