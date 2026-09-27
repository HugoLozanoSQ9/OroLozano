-- Oro Lozano — schema (run once in Supabase SQL Editor)
-- Project: wxsqgqddroilvmzczupe

create extension if not exists "pgcrypto";

-- USERS
create table if not exists public.users (
  id text primary key,
  username text not null unique,
  password text not null,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('admin', 'customer')),
  shipping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- PRODUCTS (piezas únicas)
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text,
  category text not null default 'anillos',
  description text not null default '',
  details text not null default '',
  metal text not null default 'Oro amarillo',
  purity text not null default '18k',
  karat text not null default '18k',
  weight_grams numeric not null default 0,
  price integer not null default 0,
  stock integer not null default 1,
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  active boolean not null default true,
  stones text not null default 'none',
  stones_note text not null default 'Sin piedras. Piezas con piedras solo sobre pedido.',
  certificate jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products (active);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_certificate_uuid_idx
  on public.products ((certificate->>'uuid'));

-- CARTS
create table if not exists public.carts (
  user_id text primary key references public.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ORDERS (eternos — no se borran)
create table if not exists public.orders (
  id text primary key,
  user_id text not null references public.users(id),
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0,
  status text not null default 'recibido',
  status_history jsonb not null default '[]'::jsonb,
  shipping_name text not null default '',
  shipping_city text not null default '',
  shipping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

-- SESSIONS (JWT complement / cookie session)
create table if not exists public.sessions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

-- RLS
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.sessions enable row level security;

-- Public can read active products (catalog)
drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

-- Grants for Data API (required on some projects)
grant usage on schema public to anon, authenticated, service_role;
grant select on public.products to anon, authenticated;
grant all on public.users to service_role;
grant all on public.products to service_role;
grant all on public.carts to service_role;
grant all on public.orders to service_role;
grant all on public.sessions to service_role;

-- Storage bucket for product images (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/svg+xml','image/gif']
)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "Service role manage product images" on storage.objects;
create policy "Service role manage product images"
  on storage.objects for all
  to service_role
  using (bucket_id = 'products')
  with check (bucket_id = 'products');

-- PASSWORD RESET OTPs
create table if not exists public.password_resets (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_resets_email_idx on public.password_resets (email);
create index if not exists password_resets_expires_at_idx on public.password_resets (expires_at);

alter table public.password_resets enable row level security;
grant all on public.password_resets to service_role;
