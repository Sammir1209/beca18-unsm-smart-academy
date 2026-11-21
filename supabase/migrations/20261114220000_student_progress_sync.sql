create table if not exists public.student_progress_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('attempt_recorded')),
  question_ref text not null,
  selected_option_key text,
  is_doubt boolean not null default false,
  time_spent_seconds integer not null default 0 check (time_spent_seconds between 0 and 86400),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index if not exists student_progress_events_user_occurred_idx
  on public.student_progress_events(user_id, occurred_at desc);
alter table public.student_progress_events enable row level security;
drop policy if exists student_progress_events_read_own on public.student_progress_events;
create policy student_progress_events_read_own on public.student_progress_events
for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.sync_student_progress(p_events jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event jsonb;
  v_inserted integer := 0;
  v_skipped integer := 0;
  v_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 100 then raise exception 'invalid_batch'; end if;
  for v_event in select value from jsonb_array_elements(p_events) loop
    if v_event->>'event_type' <> 'attempt_recorded'
       or coalesce(length(v_event->>'question_ref'), 0) = 0
       or length(v_event->>'question_ref') > 160 then raise exception 'invalid_progress_event'; end if;
    v_id := (v_event->>'id')::uuid;
    insert into public.student_progress_events
      (id,user_id,event_type,question_ref,selected_option_key,is_doubt,time_spent_seconds,occurred_at)
    values (
      v_id,v_user_id,'attempt_recorded',v_event->>'question_ref',
      nullif(v_event->>'selected_option_key',''),
      coalesce((v_event->>'is_doubt')::boolean,false),
      greatest(0,least(coalesce((v_event->>'time_spent_seconds')::integer,0),86400)),
      coalesce((v_event->>'occurred_at')::timestamptz,now())
    ) on conflict (id) do nothing;
    if found then v_inserted := v_inserted + 1; else v_skipped := v_skipped + 1; end if;
  end loop;
  return jsonb_build_object('inserted',v_inserted,'duplicates',v_skipped);
end;
$$;
revoke all on function public.sync_student_progress(jsonb) from public, anon;
grant execute on function public.sync_student_progress(jsonb) to authenticated;
revoke all on public.student_progress_events from anon, authenticated;
grant select on public.student_progress_events to authenticated;
