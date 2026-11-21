-- Add indexes for foreign-key columns flagged by the Supabase performance advisor.
-- These indexes improve joins and deletes/updates on referenced records.
create index if not exists question_answer_keys_verified_by_idx
  on public.question_answer_keys (verified_by);

create index if not exists questions_created_by_idx
  on public.questions (created_by);

create index if not exists questions_reviewed_by_idx
  on public.questions (reviewed_by);

create index if not exists review_schedule_user_id_idx
  on public.review_schedule (user_id);

create index if not exists source_documents_uploaded_by_idx
  on public.source_documents (uploaded_by);

create index if not exists sources_created_by_idx
  on public.sources (created_by);

create index if not exists topics_parent_topic_id_idx
  on public.topics (parent_topic_id);

create index if not exists validation_reviews_reviewer_id_idx
  on public.validation_reviews (reviewer_id);
