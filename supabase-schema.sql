-- ============================================================
-- LeadForge Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
-- Extended user profile (auto-created on signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  company_name text,
  website text,
  industry text,
  avatar_url text,
  -- n8n integration
  n8n_webhook_url text,
  n8n_auth_token text,
  -- outreach defaults
  calendly_link text,
  whatsapp_link text,
  portfolio_link text,
  from_name text,
  reply_to_email text,
  -- gmail credentials for n8n
  gmail_connected boolean default false,
  -- onboarding
  onboarding_completed boolean default false,
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CAMPAIGNS ───────────────────────────────────────────────
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Untitled Campaign',
  -- search config
  search_queries text[] default '{}',
  search_location text default 'USA',
  max_results integer default 10,
  max_pages integer default 3,
  -- schedule
  trigger_hour integer default 9,
  frequency text default 'daily',
  is_active boolean default true,
  -- toggles
  auto_send_emails boolean default true,
  generate_pdfs boolean default true,
  log_to_sheets boolean default true,
  scrape_websites boolean default true,
  -- outreach overrides (inherits from profile if null)
  calendly_link text,
  whatsapp_link text,
  portfolio_link text,
  email_subject text,
  -- google sheets
  google_sheet_id text,
  google_doc_template_id text,
  google_drive_folder_id text,
  -- filters
  min_quality_score integer default 30,
  require_email boolean default true,
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── LEADS ───────────────────────────────────────────────────
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  -- business info
  business_name text,
  email text,
  phone text,
  website_url text,
  industry text,
  location text,
  -- intelligence
  quality_score integer,
  has_website boolean default false,
  recommended_service text,
  website_issues text[],
  -- outreach
  email_status text default 'pending', -- pending | sent | failed | replied
  email_sent_at timestamptz,
  pdf_url text,
  -- dedup
  lead_hash text unique,
  -- raw
  raw_data jsonb,
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── RUN HISTORY ─────────────────────────────────────────────
create table public.run_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  -- results
  status text default 'running', -- running | success | failed
  leads_found integer default 0,
  emails_sent integer default 0,
  pdfs_generated integer default 0,
  duplicates_skipped integer default 0,
  errors text[],
  -- timing
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_seconds integer
);

-- ─── EMAIL TEMPLATES ─────────────────────────────────────────
create table public.email_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Default Template',
  subject text,
  body text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.run_history enable row level security;
alter table public.email_templates enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Campaigns
create policy "Users can CRUD own campaigns" on public.campaigns for all using (auth.uid() = user_id);

-- Leads
create policy "Users can CRUD own leads" on public.leads for all using (auth.uid() = user_id);

-- Run history
create policy "Users can CRUD own run history" on public.run_history for all using (auth.uid() = user_id);

-- Email templates
create policy "Users can CRUD own templates" on public.email_templates for all using (auth.uid() = user_id);

-- ─── INDEXES ─────────────────────────────────────────────────
create index idx_leads_user_id on public.leads(user_id);
create index idx_leads_campaign_id on public.leads(campaign_id);
create index idx_leads_email_status on public.leads(email_status);
create index idx_leads_created_at on public.leads(created_at desc);
create index idx_run_history_user_id on public.run_history(user_id);
create index idx_campaigns_user_id on public.campaigns(user_id);
