-- Keep the established auth.users trigger as the single profile bootstrap path.
drop trigger if exists on_auth_user_created_profile on auth.users;
drop function if exists private.handle_new_auth_user();

-- Remove broad table grants; authenticated students only read their own profile
-- and update non-privileged profile attributes under the existing RLS policies.
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
