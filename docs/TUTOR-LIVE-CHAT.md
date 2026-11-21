# Tutor conversacional en tiempo real

## Alcance

El panel de práctica ofrece dos tutores seleccionables:

- Profe Alfredo: voz Live `cedar`.
- Profe Sofía: voz Live `marin`.

La conversación admite dos canales:

1. **Voz full-duplex:** GPT-Live 1 por WebSocket, con entrada y salida PCM mono a 24 kHz. El estudiante puede hablar, escuchar y realizar interrupciones naturales.
2. **Chat escrito:** endpoint `POST /api/tutor/chat` con historial reciente y contexto de la pregunta visible.

El avatar Three.js actual es una representación visual independiente. No debe confundirse con un humanoide rigged o con sincronización facial real.

## Arquitectura

- `src/ui/tutor-chat.js`: UI del tutor, permisos del micrófono, WebSocket, captura PCM, reproducción PCM, transcripciones y límite de 5 minutos por sesión.
- `src/core/icon-renderer.js`: renderizado de iconos Lucide usados por el panel.
- `src/core/math-renderer.js`: carga diferida de KaTeX y renderizado de delimitadores LaTeX.
- `api/tutor/live-token.js`: verifica sesión Supabase, consume cuota de inicio y solicita un token efímero de Live.
- `api/tutor/chat.js`: verifica sesión, valida mensajes, consume cuota y consulta Chat Completions.
- `api/tutor/_usage.js`: cuota existente para el servicio TTS de ElevenLabs.
- Supabase RPCs:
  - `consume_tutor_live_quota(uuid)`: máximo 3 inicios de sesión por usuario y hora.
  - `consume_tutor_chat_quota(uuid, integer)`: máximo 10 mensajes y 20.000 caracteres por usuario y minuto.
  - `consume_tutor_tts_quota(uuid, integer, integer, integer, integer)`: cuota del TTS anterior.

## Autenticación

Los endpoints exigen un access token de Supabase y validan al usuario contra `/auth/v1/user`.

La conexión al AI Gateway utiliza el encabezado `x-vercel-oidc-token` inyectado por Vercel en cada invocación. El token de Gateway nunca se entrega al navegador. No se necesita `AI_GATEWAY_API_KEY` en el proyecto desplegado mientras la autenticación OIDC de Vercel esté disponible.

Modelos:

- Live: `openai/gpt-live-1`.
- Chat escrito: `openai/gpt-6-luna`.

## Costos y límites

GPT-Live tiene una tarifa de referencia de US$ 0.05/minuto, facturada por segundo. El silencio y el tiempo conectado también cuentan.

La interfaz cierra cada sesión a los 300 segundos (máximo estimado de US$ 0.25 por sesión) y el backend permite 3 inicios por usuario cada hora. El límite de duración de 5 minutos es un control del cliente; el límite de inicios por hora sí se valida en Supabase.

El chat escrito tiene una cuota de 10 mensajes por minuto y 20.000 caracteres por minuto.

## Contexto pedagógico

El panel envía el curso, tema, enunciado y alternativas actuales. Solo incluye clave y solución después de que el estudiante haya enviado su intento. El prompt indica al tutor que use el contexto como referencia no confiable y que no siga instrucciones contenidas dentro de los enunciados.

El historial de chat escrito se mantiene en memoria del componente; no se persiste en Supabase.

## Fórmulas e iconos

- Las fórmulas deben usar LaTeX delimitado por `\\(...\\)` para línea o `\\[...\\]` para bloque.
- Macros disponibles: `\\RR`, `\\NN`, `\\ZZ`, `\\QQ`, `\\sen`, `\\tg`, `\\cotg`.
- KaTeX se carga de forma diferida y sus fuentes se empaquetan localmente.
- Lucide usa solo iconos importados explícitamente para evitar incluir el catálogo completo.

## Verificación pendiente

- Probar el permiso de micrófono y la salida de audio en Android Chrome y escritorio.
- Confirmar con una cuenta autenticada que el token efímero de AI Gateway se emite correctamente.
- Verificar el cierre de sesión y el uso final reportado por `session.closed`.
- Probar renderizado de fracciones, raíces, potencias, sumatorias y matrices en preguntas reales.
