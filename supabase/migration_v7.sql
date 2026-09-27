-- Oro Lozano v7 — ejecutar en SQL Editor DESPUÉS del schema base

create table if not exists public.admin_data (
  id text primary key default 'main',
  categories jsonb not null default '[
    {"id":"anillos","name":"Anillos","slug":"anillos"},
    {"id":"collares","name":"Collares","slug":"collares"},
    {"id":"aretes","name":"Aretes","slug":"aretes"},
    {"id":"pulseras","name":"Pulseras","slug":"pulseras"}
  ]'::jsonb,
  gold_spot_by_karat jsonb not null default '{}'::jsonb,
  margin_percent numeric not null default 35,
  iva_percent numeric not null default 16,
  updated_at timestamptz not null default now()
);

insert into public.admin_data (id) values ('main')
on conflict (id) do nothing;

alter table public.admin_data enable row level security;
grant all on public.admin_data to service_role;

-- Asegurar columnas útiles en products (si faltan)
alter table public.products add column if not exists price_breakdown jsonb;
