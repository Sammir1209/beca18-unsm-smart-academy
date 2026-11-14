# Tutor neuronal (ElevenLabs)

El endpoint `/api/tutor/tts` protege la API key en servidor y exige una sesión Supabase válida. El cliente nunca recibe la clave del proveedor.

Configurar en Vercel (Production, Preview y Development según corresponda):

- `ELEVENLABS_API_KEY`: API key privada de ElevenLabs.
- `ELEVENLABS_VOICE_MALE_ID`: ID de una voz masculina con español latino.
- `ELEVENLABS_VOICE_FEMALE_ID`: ID de una voz femenina con español latino.
- `APP_ORIGIN`: origen exacto autorizado, por ejemplo `https://unsm-academy.vercel.app` (opcional; si se configura, el endpoint rechaza otros orígenes).
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`: valores públicos ya usados por el frontend; el endpoint los usa para verificar el token en Supabase Auth.

Modelo inicial: `eleven_flash_v2_5`, por baja latencia y compatibilidad con español. La voz requiere internet y una sesión iniciada. El modo de dispositivo sigue siendo el respaldo offline.

No guardar API keys en variables `VITE_*`. El uso del servicio puede generar costes y está sujeto al plan y límites de ElevenLabs.
