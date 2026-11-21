-- Create a student profile for every new Auth user without trusting client-supplied role values.
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do update
    set full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- Backfill accounts that predate this trigger; role remains the database default.
insert into public.profiles (id, full_name)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), '')
from auth.users u
on conflict (id) do nothing;

-- Students may edit their public profile fields, never their authorization role.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
