-- Cache auth context once per statement instead of recalculating it for every row.
drop policy if exists questions_read_published_or_staff on public.questions;
create policy questions_read_published_or_staff
on public.questions
for select
to anon, authenticated
using (
  (question_status = 'published'::public.question_status
   and validation_status = 'verified'::public.validation_status)
  or
  ((select auth.uid()) is not null and (select private.is_staff()))
);

drop policy if exists options_read_published_or_staff on public.question_options;
create policy options_read_published_or_staff
on public.question_options
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.questions q
    where q.id = question_options.question_id
      and (
        (q.question_status = 'published'::public.question_status
         and q.validation_status = 'verified'::public.validation_status)
        or
        ((select auth.uid()) is not null and (select private.is_staff()))
      )
  )
);
