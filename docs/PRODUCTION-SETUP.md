# PRE - EINSTEIN · Configuración de producción

## Variables de entorno del sitio

Configurar en Cloudflare Pages → Settings → Variables and Secrets → Build:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase `unsm-academy` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key del proyecto (nunca service_role) |
| `VITE_TURNSTILE_SITE_KEY` | Sitekey pública del widget Turnstile |

Aplicar las variables a Production y Preview según corresponda y volver a desplegar. No guardar claves privadas en el repositorio ni en variables `VITE_*`.

## Cloudflare Turnstile + Supabase Auth

1. Crear un widget Turnstile en Cloudflare.
2. Autorizar los dominios de producción y los dominios de preview que se usarán.
3. Copiar el **Sitekey** a `VITE_TURNSTILE_SITE_KEY` en Cloudflare Pages.
4. En Supabase → Authentication → Bot and Abuse Protection, activar CAPTCHA, seleccionar Cloudflare Turnstile y guardar el **Secret key** del widget.
5. Probar el registro con una cuenta controlada. El cliente envía `captchaToken` a `auth.signUp`; Supabase valida el token con el secret.

El Sitekey es público. El Secret key es privado y solo debe introducirse en el panel seguro de Supabase.

## Supabase Auth

- Site URL: dominio de producción de PRE - EINSTEIN.
- Redirect URLs: dominio de producción y URLs exactas de preview/desarrollo que se usen.
- Mantener la confirmación de correo activada para cuentas reales, salvo decisión explícita de priorizar registro inmediato sin verificación.
- Activar la protección contra contraseñas filtradas y definir una política de contraseña robusta.
- Revisar las plantillas de confirmación y recuperación para que apunten al dominio de producción.

Con confirmación de correo activada, Supabase puede devolver `session: null` en el registro; el usuario confirma el correo y luego inicia sesión. El inicio automático inmediato depende de la configuración de confirmación de email del proyecto.

## Base de datos y seguridad

Las migraciones se guardan en `supabase/migrations`. No ejecutar SQL manual distinto del repositorio sin registrar una migración. Las tablas de progreso y estado de aprendizaje aplican RLS por `auth.uid()`. Las funciones `SECURITY DEFINER` expuestas deben mantener validaciones de identidad y límites estrictos.

Las tablas `tutor_chat_usage`, `tutor_live_usage` y `tutor_tts_usage` no tienen políticas de acceso directo deliberadamente: el acceso se realiza mediante funciones RPC que validan que `p_user_id = auth.uid()`. No abrir lectura/escritura directa a estudiantes.

## Banco de preguntas y simulacros

El banco actual del repositorio contiene 31 preguntas estáticas. La base de datos relacional `questions` y `question_options` está vacía. No declarar completo un examen de 60/80/100 preguntas hasta cargar suficientes ítems de esa modalidad, con claves y procedencia verificadas. No duplicar preguntas para alcanzar el número objetivo.

Las etiquetas `OFICIAL`, `VALIDATED` y `isFija` requieren evidencia documental, páginas y números de pregunta. Una pregunta fija necesita recurrencia verificada en al menos dos documentos distintos. No usar un examen como oficial por el mero hecho de que su nombre aparezca en un inventario.

## Verificación antes de producción

- [ ] Variables de entorno configuradas en Cloudflare Pages.
- [ ] Turnstile activado tanto en Cloudflare como en Supabase.
- [ ] Site URL y Redirect URLs revisadas.
- [ ] Protección contra contraseñas filtradas activada.
- [ ] Registro, confirmación de correo, login, logout y recuperación probados con cuenta de prueba.
- [ ] Persistencia probada tras refrescar, cerrar/abrir y cambiar de dispositivo.
- [ ] Simulacros solo habilitados cuando el banco validado cubre la cantidad completa de preguntas.
- [ ] Build y pruebas de flujo completados.
- [ ] Despliegue de Cloudflare verificado desde el panel de Pages.
