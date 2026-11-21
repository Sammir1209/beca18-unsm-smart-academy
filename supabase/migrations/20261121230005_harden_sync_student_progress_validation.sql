create or replace function public.sync_student_progress(p_events jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_event jsonb;
  v_inserted integer := 0;
  v_skipped integer := 0;
  v_id uuid;
  v_is_doubt boolean;
  v_is_correct boolean;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if p_events is null or jsonb_typeof(p_events) is distinct from 'array' then
    raise exception 'invalid_batch' using errcode = '22023';
  end if;

  if jsonb_array_length(p_events) > 100 then
    raise exception 'invalid_batch' using errcode = '22023';
  end if;

  for v_event in select value from jsonb_array_elements(p_events)
  loop
    if jsonb_typeof(v_event) is distinct from 'object'
       or v_event->>'event_type' is distinct from 'attempt_recorded'
       or coalesce(length(v_event->>'question_ref'), 0) = 0
       or length(v_event->>'question_ref') > 160
       or (v_event ? 'selected_option_key' and jsonb_typeof(v_event->'selected_option_key') not in ('string', 'null'))
       or ((v_event->>'selected_option_key') is not null and length(v_event->>'selected_option_key') > 20)
       or (v_event ? 'is_doubt' and jsonb_typeof(v_event->'is_doubt') is distinct from 'boolean')
       or (v_event ? 'is_correct' and jsonb_typeof(v_event->'is_correct') not in ('boolean', 'null')) then
      raise exception 'invalid_progress_event' using errcode = '22023';
    end if;

    begin
      v_id := (v_event->>'id')::uuid;
    exception when others then
      raise exception 'invalid_progress_event_id' using errcode = '22023';
    end;

    v_is_doubt := coalesce((v_event->>'is_doubt')::boolean, false);
    v_is_correct := case
      when v_is_doubt then null
      when jsonb_typeof(v_event->'is_correct') = 'boolean' then (v_event->>'is_correct')::boolean
      else null
    end;

    insert into public.student_progress_events
      (id, user_id, event_type, question_ref, selected_option_key, is_correct, is_doubt, time_spent_seconds, occurred_at)
    values (
      v_id,
      v_user_id,
      'attempt_recorded',
      v_event->>'question_ref',
      nullif(v_event->>'selected_option_key', ''),
      v_is_correct,
      v_is_doubt,
      greatest(0, least(coalesce((v_event->>'time_spent_seconds')::integer, 0), 86400)),
      coalesce((v_event->>'occurred_at')::timestamptz, now())
    )
    on conflict (id) do nothing;

    if found then
      v_inserted := v_inserted + 1;
    else
      v_skipped := v_skipped + 1;
    end if;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'duplicates', v_skipped);
end;
$function$;

revoke all on function public.sync_student_progress(jsonb) from public, anon;
grant execute on function public.sync_student_progress(jsonb) to authenticated, service_role;
