# PRE - EINSTEIN Verify · CAPTCHA propio

> Estado: arquitectura objetivo. No está implementado ni activado en producción. La interfaz actual todavía contiene integración de Cloudflare Turnstile; esta especificación define su reemplazo por un verificador propio.

## Objetivo

Diseñar un desafío CAPTCHA de primera parte, producido por PRE - EINSTEIN, sin hCaptcha, Turnstile ni Google reCAPTCHA. La validación debe ocurrir en servidor y también ser obligatoria al crear usuarios directamente contra Supabase Auth.

Un acertijo validado exclusivamente en JavaScript no es un control anti-bot: basta inspeccionar el bundle o llamar a Supabase directamente para omitirlo. El sistema propio no promete identificar personas ni ser imposible de automatizar; aumenta el coste de automatización junto con límites de frecuencia, tokens de un solo uso y controles de abuso.

## Arquitectura elegida

- Cliente: aplicación Vite. Renderiza el reto visual propio y captura la selección.
- Backend de reto: Cloudflare Pages Functions bajo `functions/api/captcha/*`. Nunca confía en la respuesta correcta enviada por el navegador.
- Persistencia: PostgreSQL de Supabase, tablas internas de CAPTCHA con RLS activado y sin permisos para `anon` ni `authenticated`. La Function utiliza un secreto de servidor; nunca se envía al cliente.
- Barrera de alta: Supabase Auth **Before User Created Hook**. El hook comprueba y consume de forma atómica el comprobante antes de que Supabase inserte la nueva cuenta.

Supabase documenta el hook Before User Created como punto de control previo al alta; recibe metadatos de la solicitud (incluida IP y request ID) y el usuario que está por crearse. Puede permitir con objeto vacío o rechazar con error 4xx. Referencias: [hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook), [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks).

## Flujo completo

```mermaid
sequenceDiagram
  participant B as Navegador PRE - EINSTEIN
  participant CF as CAPTCHA API (Pages Function)
  participant DB as Supabase PostgreSQL
  participant Auth as Supabase Auth Hook

  B->>CF: POST /api/captcha/challenge
  CF->>DB: Crear reto con respuesta hasheada, TTL y límites
  DB-->>CF: challenge_id + configuración visual
  CF-->>B: Reto público (sin respuesta)
  B->>CF: POST /api/captcha/verify (challenge_id, respuesta)
  CF->>DB: Verificar intento, caducidad y contador
  DB-->>CF: Acierto/fallo y consumo de reto
  CF->>DB: Emitir hash de comprobante de alta de un solo uso
  CF-->>B: proof_token opaco, corto y de un solo uso
  B->>Auth: signUp + metadata pre_einstein_captcha_proof
  Auth->>DB: Before User Created Hook
  DB->>DB: Hash del proof, verificar propósito, TTL y no consumido
  DB->>DB: Consumir proof atómicamente
  DB-->>Auth: Permitir o rechazar el alta
  Auth-->>B: Cuenta creada / error
```

## Diseño del desafío

### Reto base

Utilizar un reto visual de símbolos geométricos propios, renderizados como SVG (no imágenes de terceros). Ejemplo: “Selecciona todos los símbolos que tienen exactamente cuatro lados”. Cada reto genera de forma aleatoria:
- una instrucción seleccionada de un catálogo acotado;
- una cuadrícula de símbolos distintos con rotaciones, escalas y colores;
- una respuesta correcta aleatoria en el servidor;
- un identificador opaco con caducidad breve.

El navegador recibe solo los símbolos e instrucción. La respuesta correcta nunca se serializa ni se embebe en HTML, JavaScript, atributos, source map o URL. El servidor conserva un hash con salt aleatorio; la verificación consume el reto tras el número configurado de intentos.

La interfaz debe ofrecer teclado, lector de pantalla y una alternativa accesible equivalente. No depender de distinguir colores, tiempo de reacción, audio obligatorio ni habilidades cognitivas complejas. Permitir actualizar el reto y explicar errores sin revelar la clave.

### Defensa en profundidad

- Nonce criptográficamente aleatorio; no usar `Math.random()` para secretos.
- Respuestas normalizadas y hash con salt aleatorio; no guardar respuesta en claro.
- Challenge TTL configurable, por defecto 3 minutos.
- Máximo configurable de intentos por challenge; tras excederlo, invalidar.
- Comprobante opaco con propósito `signup`, expiración de 2–3 minutos y un solo uso.
- Almacenar solo el hash del comprobante, nunca el token original.
- Consumo atómico: UPDATE condicionado por hash, propósito, expiración y `consumed_at IS NULL`; solo una solicitud puede consumirlo.
- Límites por IP seudonimizada (HMAC con secreto rotatorio) y ventana temporal; no guardar IP sin necesidad.
- Honeypot invisible para usuarios, comprobación de campos inesperados y umbral mínimo razonable entre emitir y verificar.
- Rate limit para emisión, verificación y altas; mensajes no deben revelar si un correo existe.
- Logs sin contraseña, respuesta del reto, token ni PII innecesaria.
- Limpieza programada de retos caducados y eventos antiguos.
- Protección CSRF/origin y CORS restringido a los dominios de la academia.
- No aceptar IP indicada por el usuario. Obtener la IP únicamente de los encabezados confiables que Pages/Cloudflare añade en el borde.

Estos controles encarecen la automatización, pero no sustituyen rate limiting, verificación por email, monitorización y respuesta a abuso.

## Modelo de persistencia propuesto

Las siguientes tablas deben residir en un esquema interno/no expuesto o tener RLS, grants y políticas explícitas de acceso de servidor únicamente:

### `captcha_challenges`
- `id` UUID/ULID aleatorio (PK).
- `purpose` enum: `signup`, `password_reset` (habilitar solo cuando se implemente).
- `challenge_payload` JSONB público: instrucción y símbolos, sin clave.
- `answer_hash` TEXT (hash de respuesta + salt).
- `answer_salt` TEXT aleatorio.
- `attempt_count` INTEGER.
- `max_attempts` INTEGER.
- `ip_fingerprint` TEXT HMAC, nullable.
- `created_at`, `expires_at`, `consumed_at`.

### `captcha_proofs`
- `id` UUID.
- `proof_hash` TEXT UNIQUE.
- `purpose` enum, `expires_at`, `consumed_at`, `created_at`.
- Nunca guardar email, contraseña, token original ni user_id antes del alta.

### `captcha_rate_limits`
- `scope`, `subject_fingerprint`, `window_started_at`, `counter`, `updated_at`.
- UPSERT transaccional y límites separados para issue, verify y signup.
- El fingerprint se genera con HMAC y secreto rotatorio; nunca con IP cruda.

## Contrato API

### POST `/api/captcha/challenge`
Request: `{ purpose: "signup" }`.

Response: `{ challengeId, challenge: { instruction, symbols, layout }, expiresAt }`.
No responder `answer`, `answerHash`, salt ni proof.

Errores: `400` purpose no permitido, `429` rate limit, `503` servicio temporalmente no disponible.

### POST `/api/captcha/verify`
Request: `{ challengeId, answer }`.

Éxito: `{ verified: true, proofToken, expiresAt }`.
Fallo: `{ verified: false, errorCode: "CHALLENGE_INCORRECT" }`.
Tras fallar: incrementar contador atómicamente; tras superar el límite, invalidar el reto. No entregar tokens en fallo.

## Integración con Supabase Auth

El formulario envía el proof como metadata de solicitud:
`options.data.pre_einstein_captcha_proof = proofToken`.

El hook Before User Created:
1. Lee `user.user_metadata.pre_einstein_captcha_proof`.
2. Rechaza si falta, está malformado o excede la longitud máxima.
3. Calcula el hash y consume un único proof vigente cuyo purpose sea `signup`.
4. Si no consume exactamente una fila, retorna error 400 y detiene el registro.
5. Si tiene éxito, permite la creación.
6. Un trigger posterior elimina el campo temporal de la metadata del perfil para no conservar el proof.

El hook debe ejecutarse para cualquier alta de email y OAuth que esté habilitado; no confiar en que solo la UI de registro lo llama. El secreto de firma del hook y el secreto del backend deben almacenarse exclusivamente en Supabase/Cloudflare como secretos, nunca en el repo ni en variables `VITE_*`.

El hook oficial recibe `event.user.user_metadata` y `event.metadata.ip_address`; permite bloquear el alta con una respuesta `error` y estado 4xx. Supabase muestra cómo conceder `EXECUTE` a `supabase_auth_admin` y revocarlo de roles de cliente. Referencias: [Before User Created Hook inputs/outputs](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook), [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks).

## Integración frontend

- Crear un servicio `src/core/captcha-client.js` con `createChallenge()`, `verifyChallenge()` y `resetChallenge()`.
- Componente accesible `src/ui/captcha-widget.js`; estados `loading`, `ready`, `verifying`, `verified`, `expired`, `error`.
- Desactivar “Crear cuenta” hasta que el servidor devuelva el comprobante.
- El token se mantiene solo en memoria, se consume en el intento de registro y se descarta siempre tras respuesta/error.
- Ante error del Auth Hook, pedir un nuevo reto. No reusar proofs.
- La pantalla debe continuar ofreciendo la confirmación de correo de Supabase; CAPTCHA no la reemplaza.

## Variables de entorno de servidor (nunca VITE_)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (o secret key equivalente de servidor; exclusivamente Pages Function)
- `CAPTCHA_HMAC_SECRET` (mínimo 32 bytes aleatorios, con rotación/versionado)
- `CAPTCHA_ALLOWED_ORIGINS`
- `BEFORE_USER_CREATED_HOOK_SECRET` en Supabase Auth Hooks, según el método de hook configurado.

No se debe implementar mientras no estén provisionados los secretos en los dos paneles. El secreto service-role no se debe imprimir, commitear ni incluir en el bundle estático.

## Plan de construcción y pruebas

1. Esquema/migración privada, RLS/grants, índices y limpieza de caducados.
2. Pages Functions challenge/verify; validación de origin y límites transaccionales.
3. Hook Before User Created y trigger para retirar metadata temporal.
4. Widget accesible y flujo de alta; eliminar dependencia de Turnstile.
5. Pruebas unitarias de creación, normalización, hash, expiración y un solo uso.
6. Pruebas de integración: proof faltante, inválido, repetido, caducado, propósito equivocado, concurrencia doble, rate limit, origen no permitido, alta directa Auth que omite la interfaz, confirmación de email y rollback.
7. Pruebas E2E en Cloudflare Preview y luego Production.
8. Revisión Supabase Advisors, logs y política de retención.

## Riesgos aceptados y límites

- Un CAPTCHA propio no bloquea a todos los bots; atacantes pueden usar OCR, modelos multimodales, granjas humanas o navegadores reales.
- SVGs y retos visuales accesibles deben ser resistentes a enumeración básica, pero no “anti IA”.
- Rate limits por IP pueden afectar a redes escolares/NAT; combinar límites graduales, ventana y señales para no bloquear a todos los alumnos.
- Si el backend/hook no está disponible, fallar cerrado para nuevos registros y mostrar reintento; nunca dejar que el cliente omita el control.
