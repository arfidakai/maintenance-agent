create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text,
  url text,
  created_at timestamptz
);

create table public.tasks (
  id uuid primary key,
  site_id uuid references public.sites(id) on delete cascade,
  title text,
  status text default 'todo',
  created_at timestamptz
);
