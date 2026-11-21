-- PRE - EINSTEIN custom CAPTCHA (ALTCHA PoW) storage and mandatory signup hook.
create table if not exists public.captcha_config (
  singleton boolean primary key default true check (singleton),
  hmac_secret text not null,
  created_at timestamptz not null default now()
);
insert into public.captcha_config(singleton, hmac_secret)
values (true, encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (singleton) do nothing;
create table if not exists public.captcha_challenges (
  id uuid primary key default gen_random_uuid(), challenge jsonb not null, ip_fingerprint text not null,
  created_at timestamptz not null default now(), expires_at timestamptz not null, consumed_at timestamptz
);
create index if not exists captcha_challenges_expiry_idx on public.captcha_challenges (expires_at);
create index if not exists captcha_challenges_ip_created_idx on public.captcha_challenges (ip_fingerprint, created_at desc);
create table if not exists public.captcha_proofs (
  id uuid primary key default gen_random_uuid(), proof_hash text not null unique,
  purpose text not null check (purpose in ('signup')), created_at timestamptz not null default now(),
  expires_at timestamptz not null, consumed_at timestamptz
);
create index if not exists captcha_proofs_expiry_idx on public.captcha_proofs (expires_at);
create table if not exists public.captcha_rate_limits (
  fingerprint text not null, action text not null check (action in ('challenge','verify')),
  window_started_at timestamptz not null, attempts integer not null default 1 check (attempts >= 0),
  updated_at timestamptz not null default now(), primary key (fingerprint, action)
);
alter table public.captcha_config enable row level security;
alter table public.captcha_challenges enable row level security;
alter table public.captcha_proofs enable row level security;
alter table public.captcha_rate_limits enable row level security;
revoke all on public.captcha_config, public.captcha_challenges, public.captcha_proofs, public.captcha_rate_limits from anon, authenticated;
grant all on public.captcha_config, public.captcha_challenges, public.captcha_proofs, public.captcha_rate_limits to service_role;
create or replace function public.captcha_allow_request(p_fingerprint text,p_action text,p_max_attempts integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_attempts integer;
begin
 if p_fingerprint is null or length(p_fingerprint)<16 or p_action not in ('challenge','verify') or p_max_attempts<1 or p_window_seconds<1 then return false; end if;
 insert into public.captcha_rate_limits(fingerprint,action,window_started_at,attempts,updated_at)
 values(p_fingerprint,p_action,now(),1,now())
 on conflict(fingerprint,action) do update
 set window_started_at=case when public.captcha_rate_limits.window_started_at+make_interval(secs=>p_window_seconds)<=now() then now() else public.captcha_rate_limits.window_started_at end,
 attempts=case when public.captcha_rate_limits.window_started_at+make_interval(secs=>p_window_seconds)<=now() then 1 else public.captcha_rate_limits.attempts+1 end,
 updated_at=now()
 returning attempts into v_attempts;
 return v_attempts<=p_max_attempts;
end; $$;
revoke all on function public.captcha_allow_request(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.captcha_allow_request(text,text,integer,integer) to service_role;
create or replace function public.hook_require_signup_captcha(event jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare v_token text; v_proof_id uuid;
begin
 v_token:=event->'user'->'user_metadata'->>'pre_einstein_captcha_proof';
 if v_token is null or length(v_token)<40 or length(v_token)>256 then
  return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','Completa la verificación de seguridad antes de crear tu cuenta.'));
 end if;
 update public.captcha_proofs set consumed_at=now()
 where proof_hash=encode(extensions.digest(v_token,'sha256'),'hex') and purpose='signup' and expires_at>now() and consumed_at is null
 returning id into v_proof_id;
 if v_proof_id is null then
  return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','La verificación venció o ya fue utilizada. Inténtalo nuevamente.'));
 end if;
 return '{}'::jsonb;
end; $$;
revoke all on function public.hook_require_signup_captcha(jsonb) from public,anon,authenticated;
grant execute on function public.hook_require_signup_captcha(jsonb) to supabase_auth_admin;
create or replace function public.strip_signup_captcha_proof()
returns trigger language plpgsql security definer set search_path=pg_catalog,auth as $$
begin
 update auth.users set raw_user_meta_data=coalesce(raw_user_meta_data,'{}'::jsonb)-'pre_einstein_captcha_proof' where id=new.id;
 return new;
end; $$;
revoke all on function public.strip_signup_captcha_proof() from public,anon,authenticated,supabase_auth_admin;
drop trigger if exists zz_strip_signup_captcha_proof on auth.users;
create trigger zz_strip_signup_captcha_proof after insert on auth.users for each row execute function public.strip_signup_captcha_proof();
