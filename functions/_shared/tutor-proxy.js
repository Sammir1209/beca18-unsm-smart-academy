const MAX_BODY_BYTES = 32 * 1024;
const ALLOWED_HOST_SUFFIX = ".vercel.app";

function jsonError(status, message, headers = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

/**
 * Same-origin Pages edge proxy for the Vercel-hosted tutor API.
 * The backend origin is a deployment setting, never a browser-controlled value.
 */
export async function proxyTutorRequest(request, env, endpoint) {
  if (request.method !== "POST") {
    return jsonError(405, "Method not allowed", { Allow: "POST" });
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== requestUrl.origin) {
        return jsonError(403, "Origin not allowed");
      }
    } catch {
      return jsonError(403, "Origin not allowed");
    }
  }

  let upstream;
  try {
    const configuredBase = String(env.TUTOR_API_BASE_URL || "").trim();
    if (!configuredBase) return jsonError(503, "El tutor todavía no está conectado en este entorno.");

    const base = new URL(configuredBase);
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      base.search ||
      base.hash ||
      base.pathname !== "/" ||
      !base.hostname.startsWith("unsm-academy") ||
      !base.hostname.endsWith(ALLOWED_HOST_SUFFIX)
    ) {
      return jsonError(503, "La configuración del servicio de tutor no es válida.");
    }
    upstream = new URL(`/api/tutor/${endpoint}`, base);
  } catch {
    return jsonError(503, "La configuración del servicio de tutor no es válida.");
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonError(413, "La solicitud supera el tamaño permitido.");
  }

  let body;
  try {
    body = await request.arrayBuffer();
  } catch {
    return jsonError(400, "No se pudo leer la solicitud.");
  }
  if (body.byteLength > MAX_BODY_BYTES) {
    return jsonError(413, "La solicitud supera el tamaño permitido.");
  }

  const headers = new Headers();
  const authorization = request.headers.get("Authorization");
  const contentType = request.headers.get("Content-Type");
  const accept = request.headers.get("Accept");
  if (authorization) headers.set("Authorization", authorization);
  if (contentType) headers.set("Content-Type", contentType);
  if (accept) headers.set("Accept", accept);

  try {
    const response = await fetch(upstream, {
      method: "POST",
      headers,
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(endpoint === "tts" ? 60000 : 40000),
    });

    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["Content-Type", "Retry-After"]) {
      const value = response.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return jsonError(502, "No se pudo conectar con el servicio de tutor. Intenta nuevamente.");
  }
}
