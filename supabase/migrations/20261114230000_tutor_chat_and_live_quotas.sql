create table if not exists public.tutor_chat_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  character_count integer not null default 0 check (character_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutor_live_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  session_count integer not null default 0 check (session_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.tutor_chat_usage enable row level security;
alter table public.tutor_live_usage enable row level security;
revoke all on table public.tutor_chat_usage from anon, authenticated;
revoke all on table public.tutor_live_usage from anon, authenticated;

create or replace function public.consume_tutor_chat_quota(p_user_id uuid, p_request_chars integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_row public.tutor_chat_usage%rowtype;
  v_now timestamptz := now();
  v_window integer := 60;
  v_max_requests integer := 10;
  v_max_chars integer := 20000;
begin
  if v_user is null or v_user <> p_user_id then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  if p_request_chars < 1 or p_request_chars > 8000 then
    raise exception 'invalid request size' using errcode = '22023';
  end if;

  insert into public.tutor_chat_usage(user_id, window_started_at, request_count, character_count, updated_at)
  values (v_user, v_now, 0, 0, v_now)
  on conflict (user_id) do nothing;

  select * into v_row from public.tutor_chat_usage where user_id = v_user for update;

  if v_now - v_row.window_started_at >= make_interval(secs => v_window) then
    update public.tutor_chat_usage
      set window_started_at = v_now, request_count = 0, character_count = 0, updated_at = v_now
      where user_id = v_user returning * into v_row;
  end if;

  if v_row.request_count >= v_max_requests or v_row.character_count + p_request_chars > v_max_chars then
    return jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', greatest(1, ceil(extract(epoch from (v_row.window_started_at + make_interval(secs => v_window) - v_now)))::integer)
    );
  end if;

  update public.tutor_chat_usage
    set request_count = request_count + 1, character_count = character_count + p_request_chars, updated_at = v_now
    where user_id = v_user returning * into v_row;

  return jsonb_build_object('allowed', true, 'requests_remaining', greatest(0, v_max_requests - v_row.request_count));
end;
$$;

create or replace function public.consume_tutor_live_quota(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_row public.tutor_live_usage%rowtype;
  v_now timestamptz := now();
  v_window integer := 3600;
  v_max_sessions integer := 3;
begin
  if v_user is null or v_user <> p_user_id then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  insert into public.tutor_live_usage(user_id, window_started_at, session_count, updated_at)
  values (v_user, v_now, 0, v_now)
  on conflict (user_id) do nothing;

  select * into v_row from public.tutor_live_usage where user_id = v_user for update;

  if v_now - v_row.window_started_at >= make_interval(secs => v_window) then
    update public.tutor_live_usage
      set window_started_at = v_now, session_count = 0, updated_at = v_now
      where user_id = v_user returning * into v_row;
  end if;

  if v_row.session_count >= v_max_sessions then
    return jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', greatest(1, ceil(extract(epoch from (v_row.window_started_at + make_interval(secs => v_window) - v_now)))::integer)
    );
  end if;

  update public.tutor_live_usage
    set session_count = session_count + 1, updated_at = v_now
    where user_id = v_user returning * into v_row;

  return jsonb_build_object('allowed', true, 'sessions_remaining', greatest(0, v_max_sessions - v_row.session_count));
end;
$$;

revoke all on function public.consume_tutor_chat_quota(uuid, integer) from public, anon;
revoke all on function public.consume_tutor_live_quota(uuid) from public, anon;
grant execute on function public.consume_tutor_chat_quota(uuid, integer) to authenticated;
grant execute on function public.consume_tutor_live_quota(uuid) to authenticated;