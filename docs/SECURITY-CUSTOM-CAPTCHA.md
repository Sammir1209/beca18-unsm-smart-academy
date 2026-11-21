# PRE - EINSTEIN Verify · CAPTCHA propio

> Estado: implementado en el repositorio y desplegado en Supabase. El flujo E2E de registro aún requiere prueba desde un navegador en el dominio público.

## Objetivo y límites

Sistema CAPTCHA de primera parte, sin Turnstile, hCaptcha, Google reCAPTCHA, ALTCHA Cloud ni Sentinel. Usa ALTCHA Proof-of-Work open-source MIT (versión 2.10.0) y una interfaz propia de PRE - EINSTEIN.

Proof-of-Work eleva el coste de automatización, pero no identifica personas ni detiene bots avanzados. Mantener confirmación de correo, rate limits y monitorización. El usuario no tiene que resolver imágenes ni depender de distinguir colores.

## Arquitectura desplegada

- Cliente: Vite; componente visual personalizado en `src/ui/auth-page.js`.
- Solver cliente: `altcha-lib@2.10.0` y algoritmo PBKDF2/SHA-256 desde esm.sh, versión fijada.
- Backend: Supabase Edge Functions `captcha-challenge` y `captcha-verify`.
- Persistencia: PostgreSQL, tablas con RLS activado y sin grants a `anon` ni `authenticated`.
- Protección de Auth: trigger BEFORE INSERT sobre `auth.users`; no depende de que el navegador invoque el endpoint ni de activar manualmente un Auth Hook.
- Limpieza: trigger AFTER INSERT elimina `pre_einstein_captcha_proof` de `raw_user_meta_data`.

## Flujo

1. El navegador solicita `captcha-challenge`.
2. La función genera un reto firmado HMAC, PBKDF2/SHA-256, con TTL de 3 minutos.
3. El navegador resuelve la prueba mediante `solveChallenge`.
4. `captcha-verify` verifica firma, expiración y solución en servidor.
5. La función consume el reto con un UPDATE condicional; una segunda solicitud concurrente no puede consumirlo.
6. Se genera un comprobante aleatorio; solo se guarda su SHA-256 y vence en 3 minutos.
7. `auth.signUp` envía el comprobante como metadata temporal.
8. El trigger BEFORE INSERT calcula su hash, lo consume atómicamente y rechaza el alta si falta, no existe, venció o ya se utilizó.
9. El trigger AFTER INSERT elimina la metadata temporal del usuario.

## Tablas

- `captcha_config`: secreto HMAC generado con `gen_random_bytes(32)`; solo service_role puede leerlo.
- `captcha_challenges`: reto firmado, fingerprint HMAC, expiración y consumo.
- `captcha_proofs`: hash del comprobante, propósito signup, expiración y consumo.
- `captcha_rate_limits`: contadores por fingerprint y acción.

Todas tienen RLS habilitado. Los roles anon y authenticated no tienen permisos de lectura/escritura. Las Edge Functions usan service_role, que nunca se expone al cliente.

## Endpoints

### `POST /functions/v1/captcha-challenge`
Emite `challengeId`, objeto `challenge` firmado y `expiresAt`. Límite inicial: 8 emisiones por fingerprint en 10 minutos.

### `POST /functions/v1/captcha-verify`
Recibe `challengeId`, `challenge` y `solution`. Verifica con `verifySolution`; si es válido, consume el reto y emite `proofToken`. Límite inicial: 15 verificaciones por fingerprint en 10 minutos.

Respuestas de error genéricas: payload inválido, challenge vencido/usado, límite excedido o servicio temporalmente no disponible. Nunca devuelve la clave HMAC ni el token original almacenado.

## Seguridad

- Secreto HMAC creado una sola vez en DB y leído solo por service_role.
- Fingerprint de IP con HMAC; no se almacena IP en claro.
- Validación de Origin y CORS con lista permitida para Pages, preview Pages, Vercel y localhost; se puede ampliar con `CAPTCHA_ALLOWED_ORIGINS`.
- Prueba de trabajo firmada; no se acepta una solución solo del cliente.
- Nonce/reto y comprobante de un solo uso con operaciones condicionales.
- TTL de 3 minutos.
- Rate limit transaccional.
- Registro falla cerrado si el comprobante falta o es inválido.

## Migraciones

- `20261121220000_pre_einstein_altcha_captcha.sql`
- `20261121221000_auth_signup_captcha_guard.sql`

## Pruebas que faltan

- E2E desde navegador móvil y escritorio.
- Alta real con email controlado y confirmación de correo.
- Rechazo de proof faltante, inválido, expirado y reutilizado.
- Revisión de logs y prueba de abuso/rate limit.
