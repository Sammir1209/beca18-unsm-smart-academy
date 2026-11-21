create or replace function public.consume_tutor_tts_quota(
  p_user_id uuid,
  p_text_length integer,
  p_window_seconds integer default 60,
  p_max_requests integer default 8,
  p_max_chars integer default 9000
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_row public.tutor_tts_usage%rowtype;
  v_now timestamptz := now();
  -- These values are policy, not caller-controlled configuration.
  v_window integer := 60;
  v_max_requests integer := 8;
  v_max_chars integer := 9000;
begin
  if v_user is null or v_user <> p_user_id then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  if p_text_length is null or p_text_length < 1 or p_text_length > 1800
     or p_window_seconds is distinct from 60
     or p_max_requests is distinct from 8
     or p_max_chars is distinct from 9000 then
    raise exception 'invalid quota parameters' using errcode = '22023';
  end if;

  insert into public.tutor_tts_usage(user_id, window_started_at, request_count, character_count, updated_at)
  values (v_user, v_now, 0, 0, v_now)
  on conflict (user_id) do nothing;

  select * into v_row
  from public.tutor_tts_usage
  where user_id = v_user
  for update;

  if v_now - v_row.window_started_at >= make_interval(secs => v_window) then
    update public.tutor_tts_usage
      set window_started_at = v_now,
          request_count = 0,
          character_count = 0,
          updated_at = v_now
    where user_id = v_user
    returning * into v_row;
  end if;

  if v_row.request_count >= v_max_requests
     or v_row.character_count + p_text_length > v_max_chars then
    return jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', greatest(1, ceil(extract(epoch from (v_row.window_started_at + make_interval(secs => v_window) - v_now)))::integer)
    );
  end if;

  update public.tutor_tts_usage
    set request_count = request_count + 1,
        character_count = character_count + p_text_length,
        updated_at = v_now
  where user_id = v_user
  returning * into v_row;

  return jsonb_build_object(
    'allowed', true,
    'requests_remaining', greatest(0, v_max_requests - v_row.request_count),
    'characters_remaining', greatest(0, v_max_chars - v_row.character_count)
  );
end;
$$;

revoke all on function public.consume_tutor_tts_quota(uuid, integer, integer, integer, integer) from public, anon;
grant execute on function public.consume_tutor_tts_quota(uuid, integer, integer, integer, integer) to authenticated;
