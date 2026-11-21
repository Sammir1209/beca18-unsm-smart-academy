# Autenticación y sincronización offline

## Arquitectura
- IndexedDB sigue siendo el almacenamiento principal del dispositivo.
- Supabase Auth usa el cliente oficial y PKCE.
- `sync_outbox` guarda eventos pendientes con UUID estable; los reintentos son idempotentes.
- `sync_student_progress` asocia el usuario desde `auth.uid()`, nunca desde un user_id enviado por el navegador.
- La tabla remota almacena la selección y referencia local, no la respuesta correcta ni una calificación confiada al cliente.

## Variables Vercel
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (o `VITE_SUPABASE_PUBLISHABLE_KEY`)

Solo usar la clave pública/publishable. Nunca incluir service_role en Vite.

## Flujo
1. El estudiante practica sin cuenta; el intento y evento de sincronización se guardan localmente.
2. Al iniciar sesión, se envía la cola en lotes de hasta 50.
3. Si falla la red, el lote permanece en IndexedDB para el siguiente intento.
4. La RPC deduplica por UUID y deriva la identidad desde la sesión JWT.
5. Cerrar sesión no elimina datos locales.

## Limitaciones actuales
- Los eventos remotos aún no son intentos calificados: las preguntas locales usan IDs string y el banco normalizado de Supabase usa UUIDs.
- La importación y validación de preguntas al catálogo canónico, y la reconciliación de progreso entre dispositivos, requieren un proceso de publicación de preguntas y un modelo de dominio posterior.
- No se fusiona automáticamente el progreso local anónimo con una cuenta. Evita vincular datos de un dispositivo compartido a la cuenta equivocada.
- Activar Auth email confirmation y configurar redirect URLs en Supabase Dashboard antes de aceptar usuarios reales.
