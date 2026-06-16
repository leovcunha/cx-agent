-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create 'businesses' table
create table if not exists public.businesses (
  id text not null primary key,
  name text not null,
  description text,
  reward_details text,
  terms_and_conditions text,
  created_at timestamptz not null default now()
);

-- Insert default business for backwards compatibility
insert into public.businesses (id, name, description, reward_details, terms_and_conditions)
values (
  'default_business',
  'Refero Clinic',
  'A premier medical clinic offering top-notch healthcare services.',
  'R$50 de desconto na próxima consulta',
  'O indicado deve realizar uma consulta para que o indicador receba o desconto.'
) on conflict (id) do nothing;

-- Create 'persons' table (stores global personal details)
create table if not exists public.persons (
  id uuid not null default uuid_generate_v4() primary key,
  first_name text not null,
  phone text not null constraint persons_phone_unique unique,
  email text,
  language text not null default 'pt',
  created_at timestamptz not null default now()
);

-- Create 'business_clients' table (consolidated clients & referrals mapping)
create table if not exists public.business_clients (
  id uuid not null default uuid_generate_v4() primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  person_id uuid not null references public.persons(id) on delete cascade,
  chat_token text not null unique default uuid_generate_v4()::text,
  wallet_balance numeric not null default 0.00,
  client_type text not null default 'potential', -- 'potential' (referral) or 'existing' (customer)
  status text not null default 'new',             -- 'new', 'converted', 'declined', etc.
  crm_sync_status text not null default 'pending',
  referrer_id uuid references public.persons(id) on delete set null, -- person who referred this client
  created_at timestamptz not null default now(),
  constraint business_clients_uniq unique (business_id, person_id)
);

-- Create 'messages' table
create table if not exists public.messages (
  id uuid not null default uuid_generate_v4() primary key,
  client_id uuid not null references public.business_clients(id) on delete cascade,
  sender text not null, -- 'user' or 'ai'
  text text not null,
  timestamp timestamptz not null default now()
);

-- Enable RLS (Row Level Security) on all tables
alter table public.businesses enable row level security;
alter table public.persons enable row level security;
alter table public.business_clients enable row level security;
alter table public.messages enable row level security;

-- Policies for businesses
create policy "Allow public read access to businesses" on public.businesses for select using (true);
create policy "Allow authenticated insert access to businesses" on public.businesses for insert with check (auth.role() = 'authenticated');
create policy "Allow owners update access to businesses" on public.businesses for update using (auth.uid()::text = id);

-- Policies for persons
create policy "Allow select access to persons" on public.persons for select using (true);
create policy "Allow insert access to persons" on public.persons for insert with check (true);
create policy "Allow update access to persons" on public.persons for update using (true);

-- Policies for business_clients
create policy "Allow select access to business_clients" on public.business_clients for select using (true);
create policy "Allow owners insert/update/delete access to business_clients" on public.business_clients for all using (auth.uid()::text = business_id);

-- Policies for messages
create policy "Allow authorized select access to messages" on public.messages for select using (
  exists (
    select 1 from public.business_clients bc 
    where bc.id = messages.client_id 
    and (
      bc.business_id = auth.uid()::text
      or
      exists (
        select 1 from public.persons p 
        where p.id = bc.person_id and p.email = auth.jwt() ->> 'email'
      )
    )
  )
);

create policy "Allow authorized insert access to messages" on public.messages for insert with check (
  exists (
    select 1 from public.business_clients bc 
    where bc.id = messages.client_id 
    and (
      bc.business_id = auth.uid()::text
      or
      exists (
        select 1 from public.persons p 
        where p.id = bc.person_id and p.email = auth.jwt() ->> 'email'
      )
    )
  )
);