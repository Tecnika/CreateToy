-- Soft delete for products: managers can hide a card, only admins can restore it.
alter table public.products
  add column if not exists archived_at timestamptz;

create index if not exists products_archived_at_idx
  on public.products (archived_at)
  where archived_at is not null;

comment on column public.products.archived_at is
  'When set, the product is hidden from the storefront. Staff can set it, only admins restore or hard-delete.';
