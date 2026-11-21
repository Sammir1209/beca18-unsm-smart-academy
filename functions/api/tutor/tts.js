import { proxyTutorRequest } from "../../../_shared/tutor-proxy.js";

export function onRequest({ request, env }) {
  return proxyTutorRequest(request, env, "tts");
}
