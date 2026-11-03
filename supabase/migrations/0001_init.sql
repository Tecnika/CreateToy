-- CreateToy: initial schema, RLS policies, triggers and RPCs.
-- Apply with: node --env-file=.secrets/supabase.env scripts/db-migrate.mjs

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('buyer', 'manager', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'new',
    'contacted',
    'awaiting_payment',
    'paid',
    'in_production',
    'ready',
    'shipped',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role public.user_role not null default 'buyer',
  phone text,
  addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_addresses_array check (jsonb_typeof(addresses) = 'array')
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  price integer not null check (price >= 0),
  category text not null,
  holiday_ids text[] not null default '{}'::text[],
  template_id text not null,
  art jsonb not null,
  badge text,
  production_days integer not null default 3 check (production_days > 0),
  materials text not null default '',
  size text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_counters (
  order_year integer primary key,
  last_value integer not null default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  user_id uuid not null references public.profiles (id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address jsonb,
  comment text not null default '',
  delivery_method text,
  payment_method text,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0 check (subtotal >= 0),
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  total integer not null default 0 check (total >= 0),
  status public.order_status not null default 'new',
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb,
  constraint orders_items_array check (jsonb_typeof(items) = 'array'),
  constraint orders_history_array check (jsonb_typeof(history) = 'array')
);

create index if not exists orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_at_idx on public.orders (status, created_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured) where featured;

create table if not exists public.settings (
  id boolean primary key default true check (id),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.holiday_themes (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.configurator_templates (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('manager', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y integer := extract(year from now())::integer;
  n integer;
begin
  insert into public.order_counters (order_year, last_value)
  values (y, 1)
  on conflict (order_year)
  do update set last_value = public.order_counters.last_value + 1
  returning last_value into n;

  return 'CT-' || y::text || '-' || lpad(n::text, 4, '0');
end;
$$;

create or replace function public.orders_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.number := public.next_order_number();
    new.status := 'new';
    new.created_at := coalesce(new.created_at, now());
  else
    new.number := old.number;
    new.user_id := old.user_id;
    new.created_at := old.created_at;

    if new.status <> old.status and new.status = 'new' then
      raise exception 'Нельзя вернуть заказ в статус «новый».';
    end if;
  end if;

  new.subtotal := coalesce((
    select sum(
      coalesce((item ->> 'quantity')::integer, 0) *
      coalesce((item ->> 'unitPrice')::integer, 0)
    )
    from jsonb_array_elements(new.items) as item
  ), 0);
  new.shipping_cost := greatest(0, coalesce(new.shipping_cost, 0));
  new.total := new.subtotal + new.shipping_cost;
  new.updated_at := now();

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPCs used by the storefront
-- ---------------------------------------------------------------------------

create or replace function public.cancel_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.orders;
begin
  update public.orders
  set status = 'cancelled',
      history = history || jsonb_build_array(jsonb_build_object(
        'status', 'cancelled',
        'at', now(),
        'by', auth.uid(),
        'note', 'Отменён покупателем'
      ))
  where id = p_order_id
    and user_id = auth.uid()
    and status in ('new', 'contacted', 'awaiting_payment')
  returning * into result;

  if result.id is null then
    raise exception 'Заказ нельзя отменить или он вам не принадлежит.';
  end if;

  return result;
end;
$$;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role public.user_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
  current_role public.user_role;
begin
  if not public.is_admin() then
    raise exception 'Недостаточно прав.';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Нельзя изменить собственную роль.';
  end if;

  select role into current_role from public.profiles where id = p_user_id;
  if current_role is null then
    raise exception 'Пользователь не найден.';
  end if;

  if current_role = 'admin'
     and p_role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'Нельзя убрать последнего администратора.';
  end if;

  update public.profiles
  set role = p_role, updated_at = now()
  where id = p_user_id
  returning * into result;

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists orders_before_write_trigger on public.orders;
create trigger orders_before_write_trigger
  before insert or update on public.orders
  for each row execute function public.orders_before_write();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

drop trigger if exists holiday_themes_set_updated_at on public.holiday_themes;
create trigger holiday_themes_set_updated_at
  before update on public.holiday_themes
  for each row execute function public.set_updated_at();

drop trigger if exists configurator_templates_set_updated_at on public.configurator_templates;
create trigger configurator_templates_set_updated_at
  before update on public.configurator_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_counters enable row level security;
alter table public.settings enable row level security;
alter table public.holiday_themes enable row level security;
alter table public.configurator_templates enable row level security;

-- profiles
drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() and role = 'buyer');

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- products
drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists products_write_staff on public.products;
drop policy if exists products_write_admin on public.products;
create policy products_write_staff
  on public.products for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists products_update_staff on public.products;
drop policy if exists products_update_admin on public.products;
create policy products_update_staff
  on public.products for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- orders
drop policy if exists orders_select_own_or_staff on public.orders;
create policy orders_select_own_or_staff
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'new');

drop policy if exists orders_update_staff on public.orders;
create policy orders_update_staff
  on public.orders for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- settings
drop policy if exists settings_select_public on public.settings;
create policy settings_select_public
  on public.settings for select
  to anon, authenticated
  using (true);

drop policy if exists settings_insert_admin on public.settings;
create policy settings_insert_admin
  on public.settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists settings_update_admin on public.settings;
create policy settings_update_admin
  on public.settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- holiday themes
drop policy if exists holiday_themes_select_public on public.holiday_themes;
create policy holiday_themes_select_public
  on public.holiday_themes for select
  to anon, authenticated
  using (true);

drop policy if exists holiday_themes_write_admin on public.holiday_themes;
create policy holiday_themes_write_admin
  on public.holiday_themes for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists holiday_themes_update_admin on public.holiday_themes;
create policy holiday_themes_update_admin
  on public.holiday_themes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists holiday_themes_delete_admin on public.holiday_themes;
create policy holiday_themes_delete_admin
  on public.holiday_themes for delete
  to authenticated
  using (public.is_admin());

-- configurator templates
drop policy if exists configurator_templates_select_public on public.configurator_templates;
create policy configurator_templates_select_public
  on public.configurator_templates for select
  to anon, authenticated
  using (true);

drop policy if exists configurator_templates_write_admin on public.configurator_templates;
create policy configurator_templates_write_admin
  on public.configurator_templates for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists configurator_templates_update_admin on public.configurator_templates;
create policy configurator_templates_update_admin
  on public.configurator_templates for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists configurator_templates_delete_admin on public.configurator_templates;
create policy configurator_templates_delete_admin
  on public.configurator_templates for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
grant select, insert on public.profiles to authenticated;
grant update (display_name, phone, addresses) on public.profiles to authenticated;

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

revoke all on public.orders from anon, authenticated;
grant select, insert on public.orders to authenticated;
grant update on public.orders to authenticated;

revoke all on public.order_counters from anon, authenticated;

revoke all on public.settings from anon, authenticated;
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;

revoke all on public.holiday_themes from anon, authenticated;
grant select on public.holiday_themes to anon, authenticated;
grant insert, update, delete on public.holiday_themes to authenticated;

revoke all on public.configurator_templates from anon, authenticated;
grant select on public.configurator_templates to anon, authenticated;
grant insert, update, delete on public.configurator_templates to authenticated;

grant all on public.profiles, public.products, public.orders, public.settings,
  public.holiday_themes, public.configurator_templates, public.order_counters
  to service_role;

revoke execute on function public.next_order_number() from public, anon, authenticated;
revoke execute on function public.orders_before_write() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

revoke execute on function public.cancel_order(uuid) from public, anon;
grant execute on function public.cancel_order(uuid) to authenticated;

revoke execute on function public.admin_set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;
