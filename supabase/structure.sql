-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Create 'businesses' table (serves as tenants)
create table if not exists public.businesses (
  id text not null primary key,
  name text not null,
  description text,
  escalation_policy text,
  tone text default 'Professional, empathetic, and concise.',
  created_at timestamptz not null default now()
);

-- Insert default business for backward compatibility or initial setup
insert into public.businesses (id, name, description, escalation_policy)
values (
  'default_business',
  'TechFlow Cloud',
  'A cloud infrastructure provider.',
  'Escalate if the issue requires database access or involves unverified account access attempts.'
) on conflict (id) do nothing;

-- Table to store high-level document metadata
create table if not exists public.documents (
    id uuid primary key default uuid_generate_v4(),
    tenant_id text not null references public.businesses(id) on delete cascade,
    file_name text not null,
    created_at timestamptz not null default now()
);

-- Table to store the vector embeddings
create table if not exists public.document_chunks (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid references public.documents(id) on delete cascade,
    tenant_id text not null references public.businesses(id) on delete cascade,
    content text not null,
    embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2
);

-- Create an HNSW index for fast similarity search
create index on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- Create 'messages' table for conversation history
create table if not exists public.messages (
  id uuid not null default uuid_generate_v4() primary key,
  client_id text not null, -- The unique session or phone number for the user
  tenant_id text not null references public.businesses(id) on delete cascade,
  sender text not null, -- 'user' or 'ai'
  text text not null,
  timestamp timestamptz not null default now()
);

-- Enable RLS (Row Level Security) on all tables
alter table public.businesses enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.messages enable row level security;

-- Basic Policies (can be refined based on auth needs)
create policy "Allow public read access to businesses" on public.businesses for select using (true);
create policy "Allow authenticated insert access to businesses" on public.businesses for insert with check (auth.role() = 'authenticated');
create policy "Allow owners update access to businesses" on public.businesses for update using (auth.uid()::text = id);

create policy "Allow service role full access to documents" on public.documents for all using (true);
create policy "Allow service role full access to document_chunks" on public.document_chunks for all using (true);

create policy "Allow service role full access to messages" on public.messages for all using (true);