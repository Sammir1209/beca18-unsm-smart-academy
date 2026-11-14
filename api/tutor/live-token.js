// Mint a single-use, short-lived GPT-Live client token.
// The Vercel OIDC token is injected into this function request; it never reaches the browser.
const MODEL = 'openai/gpt-live-1';

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

async function getAuthenticatedUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\\s+/i, '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!token || !supabaseUrl || !supabaseKey) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? { id: user.id, token, supabaseUrl, supabaseKey } : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Origin not allowed' });

  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return res.status(401).json({ error: 'Inicia sesión para conversar con tu tutor.' });

    // 3 session starts/hour per student. The client closes each session after 5 minutes.
    const quotaResponse = await fetch(`${auth.supabaseUrl}/rest/v1/rpc/consume_tutor_live_quota`, {
      method: 'POST',
      headers: {
        apikey: auth.supabaseKey,
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_user_id: auth.id }),
      signal: AbortSignal.timeout(8000),
    });
    if (!quotaResponse.ok) {
      console.error('Tutor live quota failed:', quotaResponse.status);
      return res.status(503).json({ error: 'No se pudo validar el límite de sesiones. Intenta más tarde.' });
    }
    const quota = await quotaResponse.json();
    if (!quota?.allowed) {
      res.setHeader('Retry-After', String(quota?.retry_after_seconds || 3600));
      return res.status(429).json({ error: 'Alcanzaste el límite de sesiones de voz por hora. Intenta más tarde.' });
    }

    const oidcToken = req.headers['x-vercel-oidc-token'];
    if (!oidcToken) {
      return res.status(503).json({ error: 'La conexión segura con AI Gateway no está disponible en este despliegue.' });
    }

    const gatewayResponse = await fetch('https://ai-gateway.vercel.sh/v1/realtime/client-secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oidcToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, routeKind: 'live' }),
      signal: AbortSignal.timeout(10000),
    });
    if (!gatewayResponse.ok) {
      const detail = await gatewayResponse.text().catch(() => '');
      console.error('AI Gateway Live token error:', gatewayResponse.status, detail.slice(0, 240));
      return res.status(502).json({ error: 'No se pudo iniciar la sesión de voz en este momento.' });
    }
    const { token, expiresAt } = await gatewayResponse.json();
    if (!token || !expiresAt) return res.status(502).json({ error: 'AI Gateway devolvió una sesión incompleta.' });
    return res.status(200).json({ token, expiresAt, model: MODEL, maxSessionSeconds: 300 });
  } catch (error) {
    console.error('Tutor live token error:', error);
    return res.status(502).json({ error: 'No se pudo conectar con el tutor en tiempo real.' });
  }
}
