import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifySolution } from "npm:altcha-lib@2.10.0";
import { config, cors, db, deriveKey, fingerprint, originOf, rate, respond } from "../_shared/captcha.ts";

function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return "{" + Object.keys(record).sort().map((key) => JSON.stringify(key) + ":" + stable(record[key])).join(",") + "}";
  }
  return JSON.stringify(value);
}

async function sha256(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  const origin = originOf(req);
  if (req.method === "OPTIONS") {
    return origin ? new Response(null, { status: 204, headers: cors(origin) }) : new Response(null, { status: 403 });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!origin) return new Response("Origin not allowed", { status: 403 });

  try {
    const body = await req.json();
    const id = typeof body?.challengeId === "string" ? body.challengeId : "";
    const payload = body?.challenge;
    const solution = body?.solution;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !payload || typeof solution !== "object" || !solution) {
      return respond({ error: "INVALID_PAYLOAD" }, 400, origin);
    }

    const client = db();
    const secret = await config(client);
    const fp = await fingerprint(req, secret);
    if (!await rate(client, fp, "verify", 15)) return respond({ error: "RATE_LIMITED" }, 429, origin);

    const { data: stored, error: readError } = await client.from("captcha_challenges")
      .select("challenge,expires_at,consumed_at").eq("id", id).maybeSingle();
    if (readError) throw readError;
    if (!stored || stored.consumed_at || new Date(stored.expires_at).getTime() <= Date.now()) {
      return respond({ error: "CHALLENGE_EXPIRED_OR_USED" }, 410, origin);
    }
    if (stable(stored.challenge) !== stable(payload)) return respond({ error: "CHALLENGE_MISMATCH" }, 400, origin);

    const result = await verifySolution({ challenge: payload, solution, deriveKey, hmacSignatureSecret: secret });
    if (!result.verified) return respond({ error: result.expired ? "CHALLENGE_EXPIRED" : "CHALLENGE_INVALID" }, 400, origin);

    // Compare-and-set ensures only one concurrent request can consume this challenge.
    const { data: consumed, error: consumeError } = await client.from("captcha_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", id).is("consumed_at", null).gt("expires_at", new Date().toISOString())
      .select("id").maybeSingle();
    if (consumeError) throw consumeError;
    if (!consumed) return respond({ error: "CHALLENGE_ALREADY_USED" }, 409, origin);

    const proofToken = "pei_" + crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const { error: proofError } = await client.from("captcha_proofs").insert({
      proof_hash: await sha256(proofToken), purpose: "signup",
      expires_at: new Date(Date.now() + 180_000).toISOString(),
    });
    if (proofError) throw proofError;

    return respond({ verified: true, proofToken, expiresAt: new Date(Date.now() + 180_000).toISOString() }, 200, origin);
  } catch (error) {
    console.error("captcha-verify", error instanceof Error ? error.message : "unknown");
    return respond({ error: "CAPTCHA_UNAVAILABLE" }, 503, origin);
  }
});
