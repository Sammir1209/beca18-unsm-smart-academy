-- Consume signup proofs at the auth.users insertion boundary.
-- The optional Before User Created hook only pre-checks; this trigger is the atomic gate.
create or replace function public.hook_require_signup_captcha(event jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare v_token text; v_proof_id uuid;
begin
 v_token:=event->'user'->'user_metadata'->>'pre_einstein_captcha_proof';
 if v_token is null or length(v_token)<40 or length(v_token)>256 then
  return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','Completa la verificación de seguridad antes de crear tu cuenta.'));
 end if;
 select id into v_proof_id from public.captcha_proofs
  where proof_hash=encode(extensions.digest(v_token,'sha256'),'hex')
    and purpose='signup' and expires_at>now() and consumed_at is null;
 if v_proof_id is null then
  return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','La verificación venció o ya fue utilizada. Inténtalo nuevamente.'));
 end if;
 return '{}'::jsonb;
end; $$;

create or replace function public.require_signup_captcha_before_insert()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare v_token text; v_proof_id uuid;
begin
 v_token:=new.raw_user_meta_data->>'pre_einstein_captcha_proof';
 if v_token is null or length(v_token)<40 or length(v_token)>256 then
  raise exception 'CAPTCHA_REQUIRED' using errcode='P0001';
 end if;
 update public.captcha_proofs set consumed_at=now()
  where proof_hash=encode(extensions.digest(v_token,'sha256'),'hex')
    and purpose='signup' and expires_at>now() and consumed_at is null
  returning id into v_proof_id;
 if v_proof_id is null then
  raise exception 'CAPTCHA_INVALID_OR_USED' using errcode='P0001';
 end if;
 return new;
end; $$;
revoke all on function public.require_signup_captcha_before_insert() from public,anon,authenticated,supabase_auth_admin;
drop trigger if exists aa_require_signup_captcha on auth.users;
create trigger aa_require_signup_captcha before insert on auth.users for each row execute function public.require_signup_captcha_before_insert();
