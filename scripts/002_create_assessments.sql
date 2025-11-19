-- Create assessments table for storing assessment results
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  assessment_type text not null default 'phq9',
  responses jsonb not null,
  scores jsonb not null,
  severity_level text not null,
  recommendations text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.assessments enable row level security;

-- Create policies for assessments
create policy "assessments_select_own"
  on public.assessments for select
  using (auth.uid() = user_id);

create policy "assessments_insert_own"
  on public.assessments for insert
  with check (auth.uid() = user_id);

create policy "assessments_update_own"
  on public.assessments for update
  using (auth.uid() = user_id);

create policy "assessments_delete_own"
  on public.assessments for delete
  using (auth.uid() = user_id);
