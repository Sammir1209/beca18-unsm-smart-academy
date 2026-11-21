import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { createChallenge, randomInt } from "npm:altcha-lib@2.10.0";
import { deriveKey } from "npm:altcha-lib@2.10.0/algorithms/pbkdf2";

export const origins = new Set(["https://beca18-unsm-smart-academy.pages.dev","https://unsm-academy.vercel.app","http://localhost:5173","http://localhost:4173"]);
export const cors = (origin: string) => ({ "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" });
export function originOf(req: Request): string | null {
  const origin=req.headers.get("origin");
  const configured=(Deno.env.get("CAPTCHA_ALLOWED_ORIGINS")||"").split(",").map(x=>x.trim()).filter(Boolean);
  if(!origin) return null;
  try {
    const hostname=new URL(origin).hostname;
    const pages=hostname==="beca18-unsm-smart-academy.pages.dev"||hostname.endsWith(".beca18-unsm-smart-academy.pages.dev");
    return origins.has(origin)||configured.includes(origin)||pages ? origin : null;
  } catch { return null; }
}
export function respond(data: unknown,status: number,origin: string) {
  return new Response(JSON.stringify(data),{status,headers:{...cors(origin),"Content-Type":"application/json","Cache-Control":"no-store"}});
}
export function db() {
  const url=Deno.env.get("SUPABASE_URL"), key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key) throw new Error("Missing Supabase server environment");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function config(client: ReturnType<typeof db>) {
  const {data,error}=await client.from("captcha_config").select("hmac_secret").eq("singleton",true).single();
  if(error||!data?.hmac_secret) throw new Error("CAPTCHA config unavailable");
  return data.hmac_secret as string;
}
export async function fingerprint(req: Request,secret: string) {
  const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(ip)));
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
export async function rate(client: ReturnType<typeof db>,fp:string,action:"challenge"|"verify",max:number) {
  const {data,error}=await client.rpc("captcha_allow_request",{p_fingerprint:fp,p_action:action,p_max_attempts:max,p_window_seconds:600});
  if(error) throw new Error("Rate limiter unavailable");
  return data===true;
}
export async function challenge(secret:string) {
  return await createChallenge({algorithm:"PBKDF2/SHA-256",cost:3000,counter:randomInt(1_000_000,1),deriveKey,hmacSignatureSecret:secret,expiresAt:new Date(Date.now()+180_000)});
}
export { deriveKey };
