# PRE - EINSTEIN · Configuración de producción

## Variables del frontend

Configurar en el proveedor de hosting:

| Variable | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL pública del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key; nunca service_role |

No se necesita una clave pública de ALTCHA ni una cuenta externa para el núcleo open-source autohospedado.

## CAPTCHA propio PRE - EINSTEIN

El proyecto utilizará ALTCHA open-source (MIT) como motor Proof-of-Work, autohospedado en nuestra infraestructura. El widget se personalizará con el diseño de PRE - EINSTEIN. No se contratará ALTCHA Cloud, ALTCHA Sentinel, Turnstile, hCaptcha ni reCAPTCHA.

- Frontend: paquete `altcha`, importado por Vite.
- Backend: Supabase Edge Functions `captcha-challenge` y `captcha-verify`.
- Verificación: `altcha-lib` en servidor, más consumo atómico de nonce/proof.
- Barrera obligatoria: Supabase Auth Before User Created Hook.
- Secretos: exclusivamente en Supabase Edge Function Secrets y Auth Hooks; nunca en `VITE_*` ni en Git.

**Estado:** diseñado, no implementado ni desplegado todavía. La pantalla de registro del repositorio aún contiene referencias antiguas a Turnstile y deben eliminarse al integrar el widget propio. No habilitar registro en producción como si el CAPTCHA ya estuviera activo.

## Supabase Auth

- Site URL: dominio de producción de PRE - EINSTEIN.
- Redirect URLs: dominio de producción y URLs exactas de preview/desarrollo.
- Mantener confirmación de correo activada.
- Activar protección contra contraseñas filtradas y definir política de contraseña robusta.
- Revisar plantillas de confirmación y recuperación para el dominio de producción.
- Configurar y probar el hook Before User Created antes de permitir registros reales.

Con confirmación de correo activada, Supabase puede devolver `session: null` en el registro; el usuario confirma el correo y luego inicia sesión.

## Base de datos y seguridad

Las migraciones se guardan en `supabase/migrations`. No ejecutar SQL manual distinto del repositorio sin registrar una migración. Las tablas de progreso y estado de aprendizaje aplican RLS por `auth.uid()`. Las funciones `SECURITY DEFINER` expuestas deben mantener validaciones de identidad y límites estrictos.

Las tablas `tutor_chat_usage`, `tutor_live_usage` y `tutor_tts_usage` no tienen políticas de acceso directo deliberadamente: el acceso se realiza mediante funciones RPC que validan que `p_user_id = auth.uid()`. No abrir lectura/escritura directa a estudiantes.

## Banco de preguntas y simulacros

El banco actual del repositorio contiene 31 preguntas estáticas. La base de datos relacional `questions` y `question_options` está vacía. No declarar completo un examen de 60/80/100 preguntas hasta cargar suficientes ítems de esa modalidad, con claves y procedencia verificadas. No duplicar preguntas para alcanzar el número objetivo.

Las etiquetas `OFICIAL`, `VALIDATED` y `isFija` requieren evidencia documental, páginas y números de pregunta. Una pregunta fija necesita recurrencia verificada en al menos dos documentos distintos. No usar un examen como oficial por el mero hecho de que su nombre aparezca en un inventario.

## Verificación antes de producción

- [ ] Variables públicas de Supabase configuradas en el hosting.
- [ ] Paquetes ALTCHA fijados y lockfile actualizado.
- [ ] Migraciones CAPTCHA aplicadas y revisadas.
- [ ] Edge Functions challenge/verify desplegadas y secretos configurados.
- [ ] Auth Before User Created Hook activo y probado.
- [ ] El registro rechaza pruebas faltantes, inválidas, vencidas y reutilizadas.
- [ ] Site URL y Redirect URLs revisadas.
- [ ] Protección contra contraseñas filtradas activada.
- [ ] Registro, confirmación de correo, login, logout y recuperación probados con cuenta controlada.
- [ ] Persistencia probada tras refrescar, cerrar/abrir y cambiar de dispositivo.
- [ ] Simulacros solo habilitados cuando el banco validado cubre la cantidad completa de preguntas.
- [ ] Build y pruebas de flujo completados.
- [ ] Despliegue de hosting verificado desde su panel.
