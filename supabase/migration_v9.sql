-- v9: productos vendidos
alter table public.products add column if not exists sold boolean not null default false;
create index if not exists products_sold_idx on public.products (sold);
