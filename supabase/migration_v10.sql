-- v10: sold flag + índices
alter table public.products add column if not exists sold boolean not null default false;
create index if not exists products_sold_idx on public.products (sold);

-- Asegura que pedidos cancelados puedan existir en status
-- (status es text libre; no hay constraint)
