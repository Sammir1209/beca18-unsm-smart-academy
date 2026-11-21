import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { challenge, config, cors, db, fingerprint, originOf, rate, respond } from "../_shared/captcha.ts";

Deno.serve(async (req: Request) => {
  const origin = originOf(req);
  if (req.method === "OPTIONS") {
    return origin ? new Response(null, { status: 204, headers: cors(origin) }) : new Response(null, { status: 403 });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!origin) return new Response("Origin not allowed", { status: 403 });

  try {
    const client = db();
    const secret = await config(client);
    const fp = await fingerprint(req, secret);
    if (!await rate(client, fp, "challenge", 8)) return respond({ error: "RATE_LIMITED" }, 429, origin);

    // Opportunistic cleanup avoids requiring a paid scheduler.
    await Promise.allSettled([
      client.from("captcha_challenges").delete().lt("expires_at", new Date().toISOString()),
      client.from("captcha_proofs").delete().lt("expires_at", new Date().toISOString()),
      client.from("captcha_rate_limits").delete().lt("updated_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()),
    ]);

    const payload = await challenge(secret);
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 180_000).toISOString();
    const { error } = await client.from("captcha_challenges").insert({
      id, challenge: payload, ip_fingerprint: fp, expires_at: expiresAt,
    });
    if (error) throw error;

    return respond({ challengeId: id, challenge: payload, expiresAt }, 200, origin);
  } catch (error) {
    console.error("captcha-challenge", error instanceof Error ? error.message : "unknown");
    return respond({ error: "CAPTCHA_UNAVAILABLE" }, 503, origin);
  }
});
