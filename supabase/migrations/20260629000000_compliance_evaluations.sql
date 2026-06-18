-- Create 'message_evaluations' table
create table if not exists public.message_evaluations (
  id uuid not null default uuid_generate_v4() primary key,
  message_id uuid not null references public.messages(id) on delete cascade unique,
  tenant_id text not null, -- denormalized for easy aggregated queries per business
  sop_adherence_score integer not null check (sop_adherence_score >= 0 and sop_adherence_score <= 100),
  policy_violations text[] not null default '{}',
  tone_pass boolean not null,
  hallucination_flag boolean not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.message_evaluations enable row level security;

-- Policies
create policy "Allow select access to message_evaluations" on public.message_evaluations for select using (true);
create policy "Allow insert access to message_evaluations" on public.message_evaluations for insert with check (true);
create policy "Allow update access to message_evaluations" on public.message_evaluations for update using (true);

-- Index for fast aggregation by tenant
create index idx_message_evals_tenant on public.message_evaluations(tenant_id);
