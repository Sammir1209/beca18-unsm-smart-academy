-- Durable per-user learning state for resumable practice and simulator sessions.
create table if not exists public.student_learning_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null check (state_key in ('practice', 'simulator', 'preferences')),
  state_data jsonb not null default '{}'::jsonb check (jsonb_typeof(state_data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, state_key),
  constraint student_learning_state_payload_size check (pg_column_size(state_data) <= 262144)
);

create index if not exists student_learning_state_updated_at_idx
  on public.student_learning_state (user_id, updated_at desc);

alter table public.student_learning_state enable row level security;

drop policy if exists student_learning_state_read_own on public.student_learning_state;
create policy student_learning_state_read_own
  on public.student_learning_state for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists student_learning_state_insert_own on public.student_learning_state;
create policy student_learning_state_insert_own
  on public.student_learning_state for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists student_learning_state_update_own on public.student_learning_state;
create policy student_learning_state_update_own
  on public.student_learning_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists student_learning_state_delete_own on public.student_learning_state;
create policy student_learning_state_delete_own
  on public.student_learning_state for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.student_learning_state from anon;
grant select, insert, update, delete on public.student_learning_state to authenticated;
