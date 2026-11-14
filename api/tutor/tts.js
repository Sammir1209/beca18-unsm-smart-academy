// Vercel serverless endpoint. Never expose ELEVENLABS_API_KEY to the browser.
import { enforceTutorUsage } from './_usage.js';
const MAX_TEXT_LENGTH = 1800;
const VOICES = {
  male: () => process.env.ELEVENLABS_VOICE_MALE_ID,
  female: () => process.env.ELEVENLABS_VOICE_FEMALE_ID,
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  // Accept only same-origin browser requests. Works for production and preview URLs
  // without maintaining a brittle APP_ORIGIN allowlist for each deployment.
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: 'Origin not allowed' });
    } catch {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!token || !supabaseUrl || !supabaseKey) {
    return res.status(401).json({ error: 'Inicia sesión para usar la voz neuronal.' });
  }

  let userId;
  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
    });
    if (!authResponse.ok) return res.status(401).json({ error: 'Sesión no válida. Vuelve a iniciar sesión.' });
    const authUser = await authResponse.json();
    userId = authUser?.id;
    if (!userId) return res.status(401).json({ error: 'Sesión no válida. Vuelve a iniciar sesión.' });
  } catch {
    return res.status(503).json({ error: 'No se pudo verificar tu sesión.' });
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const character = req.body?.character === 'female' ? 'female' : 'male';
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `El texto debe tener entre 1 y ${MAX_TEXT_LENGTH} caracteres.` });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = VOICES[character]();
  if (!apiKey || !voiceId) {
    return res.status(503).json({ error: 'La voz neuronal todavía no está configurada.' });
  }

  const quota = await enforceTutorUsage({ userId, token, supabaseUrl, supabaseKey, textLength: text.length });
  if (quota.unavailable) return res.status(503).json({ error: 'No se pudo validar el límite de uso de voz. Intenta más tarde.' });
  if (!quota.allowed) {
    res.setHeader('Retry-After', String(quota.retry_after_seconds || 60));
    return res.status(429).json({ error: 'Alcanzaste el límite temporal de voz. Espera un momento y vuelve a intentarlo.' });
  }

  try {
    const speech = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.48, similarity_boost: 0.78, style: 0.18, use_speaker_boost: true, speed: 1.0 },
      }),
    });
    if (!speech.ok) {
      const detail = await speech.text().catch(() => '');
      console.error('ElevenLabs TTS error:', speech.status, detail.slice(0, 300));
      return res.status(502).json({ error: 'El servicio de voz no pudo generar el audio.' });
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const audio = Buffer.from(await speech.arrayBuffer());
    return res.status(200).send(audio);
  } catch (error) {
    console.error('Tutor TTS failed:', error);
    return res.status(502).json({ error: 'No se pudo generar la voz. Intenta nuevamente.' });
  }
}
