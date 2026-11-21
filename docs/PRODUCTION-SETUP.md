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


## Auditoría de preparación para producción — 2026-11-21

- El workflow de calidad ejecuta instalación reproducible con `npm ci`, pruebas de integridad del banco y build de producción.
- Las pruebas de contenido verifican identificadores únicos, estructura de opciones, clave válida y procedencia mínima para cualquier ítem marcado como validado/publicado.
- El banco local contiene 31 preguntas con estado `REVIEW_REQUIRED`; no hay preguntas publicadas para simulacros oficiales.
- Las tablas Supabase `questions`, `question_options` y `question_answer_keys` están vacías. El motor de simulacros permanece bloqueado hasta que se verifique el blueprint por convocatoria y exista cobertura suficiente.
- La UI ya no presenta las modalidades como simulacros oficiales; los tiempos y puntajes no verificados no deben usarse como parámetros de examen.
- `captcha-verify` se actualizó a v3 para vincular la solución al fingerprint HMAC del cliente que recibió el desafío.

### Bloqueos que requieren configuración o prueba externa

- Activar leaked password protection desde Authentication → Security and Protection (la herramienta conectada no expone ese ajuste).
- Revisar Site URL, Redirect URLs, confirmación de correo y plantillas en Supabase Auth.
- Ejecutar E2E real en navegador móvil y escritorio; no se ha creado una cuenta de prueba.
- Revisar el alcance de los preview deployments de Cloudflare Pages y decidir si deben limitarse.
- Proteger la rama de integración con reglas de revisión/checks requeridos; la rama actual no tiene protección configurada.


## Configuración de hosting y APIs — 2026-11-21

### Cloudflare Pages

El despliegue de **producción** de Cloudflare Pages sigue correspondiendo a la versión anterior, estática. La **vista previa más reciente** de la rama de hardening ya incluye Pages Functions (`uses_functions=true`) y expone el proxy de las tres rutas del tutor. Se configuraron en producción y preview las variables públicas `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`; son credenciales publicables del cliente y nunca debe colocarse aquí una service-role key.

Las APIs de origen están implementadas como funciones serverless de Vercel en `api/tutor/`. La vista previa de Pages usa `functions/api/tutor/` como proxy de mismo origen. `TUTOR_API_BASE_URL` solo se configuró en el entorno **preview** y apunta al último backend Vercel disponible, que corresponde a un commit anterior de la rama. La variable **no existe en producción** y no se debe copiar a producción hasta contar con un deployment Vercel actualizado y validado.

### Vercel

El proyecto `unsm-academy` tiene dominio `unsm-academy.vercel.app` y variables Vercel de Supabase configuradas. El despliegue de producción registrado es anterior a la rama de hardening; los despliegues recientes de la rama de trabajo son previews. El último backend Vercel disponible para el proxy de Pages pertenece al commit `2b3ad22feaaf3c30ae6ad13428415639da2369f8`, no al HEAD actual. La creación de nuevos despliegues fue bloqueada por el límite diario gratuito de la API. No promover una URL o backend de preview a producción.

### Cuotas TTS

La migración `20261121223000_harden_tts_quota_parameters.sql` fija en servidor los límites de voz neuronal: 8 peticiones y 9,000 caracteres por ventana de 60 segundos, con máximo de 1,800 caracteres por solicitud. El RPC rechaza valores de política alterados por el cliente. La migración está aplicada en Supabase y versionada en el repositorio.


## Proxy de APIs del tutor en Cloudflare Pages

Se añadieron Pages Functions en `functions/api/tutor/` para exponer en el mismo origen las rutas `/api/tutor/chat`, `/api/tutor/tts` y `/api/tutor/live-token`. El proxy:

- Solo admite POST y comprueba el origen del navegador cuando se envía el encabezado `Origin`.
- Limita el cuerpo a 32 KiB y valida que el destino configurado sea un deployment HTTPS del proyecto Vercel `unsm-academy`.
- Reenvía únicamente `Authorization`, `Content-Type` y `Accept`; no reenvía cookies ni el encabezado `Origin`.
- Conserva el código HTTP, tipo de contenido y `Retry-After`, incluido el audio binario de TTS.
- Devuelve errores cerrados cuando falta la configuración o no responde el backend.

La variable `TUTOR_API_BASE_URL` está configurada solo en el entorno **preview** de Cloudflare Pages y apunta al deployment Vercel disponible para esta rama. La variable no está configurada en producción. Antes de promover la nueva versión a producción debe actualizarse el backend Vercel de producción y realizar pruebas autenticadas de chat, TTS y voz en tiempo real. No se debe usar una URL de preview como backend estable de producción.

Las pruebas automatizadas `tests/pages-tutor-proxy.test.js` cubren método, validación de origen, configuración ausente, lista de encabezados permitidos, respuestas binarias y rechazo de hosts externos.


## Progreso personal y aislamiento entre cuentas

- IndexedDB usa la versión 3 y dispone de un almacén de errores con clave compuesta `[userId, questionId]`; el historial de invitado se mantiene separado.
- Los intentos locales se etiquetan con el usuario activo. Los eventos sin propietario permanecen como progreso local de invitado y nunca se atribuyen a la siguiente cuenta que inicie sesión.
- El RPC `sync_student_progress` deriva `user_id` de `auth.uid()`, limita cada lote a 100 elementos y persiste el indicador de acierto como dato de práctica; nunca recibe ni almacena la clave correcta.
- Al restaurar progreso en otro dispositivo, la aplicación reconstruye el historial de errores a partir de eventos del mismo usuario.
- La puntuación es un diagnóstico de práctica personal, no un resultado oficial ni un dato de admisión.

## Trazabilidad documental y hashes

Los registros de `research/sources/source-inventory.json` son referencias catalogadas y no una certificación de sus documentos. Las huellas que no se calcularon sobre archivos originales se han eliminado y se marcan como `NOT_COMPUTED`. Las fuentes secundarias y los archivos aportados se identifican como tales en la vista de inventario. Las preguntas permanecen en revisión hasta comprobar el PDF original, página, enunciado, alternativas y clave.
