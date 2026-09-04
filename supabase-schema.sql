-- Run this entire file once in Supabase: Project > SQL Editor > New Query > Run

-- Table holding each client's signage configuration
create table if not exists public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text unique not null,
  company_name text default '',
  zip_code text default '',
  favorite_team text default '',
  logo_url text default '',
  created_at timestamp with time zone default now()
);

-- Table holding uploaded stills/videos for the main display panel
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  file_url text not null,
  file_type text not null, -- 'image' or 'video'
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

alter table public.clients enable row level security;
alter table public.media_items enable row level security;

-- Admins can only see/edit their own client row
create policy "Owners manage their own client row"
  on public.clients for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Public (anonymous) read access so the display page works without login
create policy "Public can read client rows"
  on public.clients for select
  using (true);

-- Admins manage their own media
create policy "Owners manage their own media"
  on public.media_items for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

-- Public (anonymous) read access to media for the display page
create policy "Public can read media"
  on public.media_items for select
  using (true);

-- Storage bucket for logos, stills, and video clips
insert into storage.buckets (id, name, public)
values ('signage-media', 'signage-media', true)
on conflict (id) do nothing;

create policy "Public read access to signage-media"
  on storage.objects for select
  using (bucket_id = 'signage-media');

create policy "Authenticated users can upload to signage-media"
  on storage.objects for insert
  with check (bucket_id = 'signage-media' and auth.role() = 'authenticated');

create policy "Owners can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'signage-media' and auth.uid()::text = (storage.foldername(name))[1]);
