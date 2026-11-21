import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { challenge, config, db, fingerprint, originOf, rate, respond } from "../_shared/captcha.ts";
Deno.serve(async (req:Request)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:{...corsPreflight(req)}});
 if(req.method!=="POST") return new Response("Method not allowed",{status:405});
 const origin=originOf(req); if(!origin) return new Response("Origin not allowed",{status:403});
 try {
  const client=db(), secret=await config(client), fp=await fingerprint(req,secret);
  if(!await rate(client,fp,"challenge",8)) return respond({error:"RATE_LIMITED"},429,origin);
  const payload=await challenge(secret), id=crypto.randomUUID(), expiresAt=new Date(Date.now()+180_000).toISOString();
  const {error}=await client.from("captcha_challenges").insert({id,challenge:payload,ip_fingerprint:fp,expires_at:expiresAt});
  if(error) throw error;
  return respond({challengeId:id,challenge:payload,expiresAt},200,origin);
 } catch(error) { console.error("captcha-challenge",error instanceof Error?error.message:"unknown"); return respond({error:"CAPTCHA_UNAVAILABLE"},503,origin); }
});
function corsPreflight(req:Request){return {"Access-Control-Allow-Origin":req.headers.get("origin")||"","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};}
