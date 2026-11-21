// Shared, bounded per-user TTS usage guard.
// Uses Supabase Postgres RPC so limits apply across Vercel instances.
const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 8;
const MAX_CHARS_PER_WINDOW = 9000;

export async function enforceTutorUsage({ userId, token, supabaseUrl, supabaseKey, textLength }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_tutor_tts_quota`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_user_id: userId,
      p_text_length: textLength,
      p_window_seconds: WINDOW_SECONDS,
      p_max_requests: MAX_REQUESTS_PER_WINDOW,
      p_max_chars: MAX_CHARS_PER_WINDOW,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Tutor quota RPC failed:', response.status, detail.slice(0, 200));
    // Fail closed: do not make a paid ElevenLabs request if quota cannot be enforced.
    return { allowed: false, unavailable: true };
  }

  const result = await response.json();
  return typeof result?.allowed === 'boolean'
    ? result
    : { allowed: false, unavailable: true };
}
