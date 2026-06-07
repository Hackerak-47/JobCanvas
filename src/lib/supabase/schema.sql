-- ============================================================
-- DevBoard Database Schema
-- Run this in the Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles table (auto-created on signup via trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  ai_analyses_count integer not null default 0,
  ai_analyses_reset_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Applications table
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  job_title text not null,
  job_url text,
  job_description text,
  status text not null default 'wishlist'
    check (status in ('wishlist', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'accepted')),
  position_order integer not null default 0,
  notes text,
  salary_range text,
  location text,
  job_type text default 'remote'
    check (job_type in ('remote', 'hybrid', 'onsite')),
  applied_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Resumes table
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_url text,
  extracted_text text,
  parsed_data jsonb,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- AI Analyses table
create table public.ai_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete set null,
  overall_score integer check (overall_score >= 0 and overall_score <= 100),
  skill_matches jsonb,
  experience_analysis jsonb,
  education_analysis jsonb,
  recommendations jsonb,
  raw_response text,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_applications_user_id on public.applications(user_id);
create index idx_applications_status on public.applications(status);
create index idx_applications_user_status on public.applications(user_id, status);
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_ai_analyses_user_id on public.ai_analyses(user_id);
create index idx_ai_analyses_application_id on public.ai_analyses(application_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.resumes enable row level security;
alter table public.ai_analyses enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Applications policies
create policy "Users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Users can create applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Resumes policies
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can upload resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- AI Analyses policies
create policy "Users can view own analyses"
  on public.ai_analyses for select
  using (auth.uid() = user_id);

create policy "Users can create analyses"
  on public.ai_analyses for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.applications
  for each row execute function public.handle_updated_at();

-- ============================================================
-- STORAGE
-- ============================================================

-- Storage bucket for resumes
insert into storage.buckets (id, name, public)
  values ('resumes', 'resumes', false);

-- Storage policies
create policy "Users can upload own resumes"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own resumes"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
