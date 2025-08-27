
-- 1) Cache table for AI insights (per user per day)
create table if not exists public.ai_insight_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target_date date not null,
  data_hash text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, target_date)
);

-- Enable RLS
alter table public.ai_insight_cache enable row level security;

-- RLS policies: users can read/write only their own cache rows
create policy "Users can view their own AI insight cache"
  on public.ai_insight_cache
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own AI insight cache"
  on public.ai_insight_cache
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own AI insight cache"
  on public.ai_insight_cache
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger to maintain updated_at
create trigger set_ai_insight_cache_updated_at
before update on public.ai_insight_cache
for each row
execute procedure public.set_updated_at();

-- Helpful index for lookups by user and date
create index if not exists ai_insight_cache_user_date_idx
on public.ai_insight_cache (user_id, target_date);
