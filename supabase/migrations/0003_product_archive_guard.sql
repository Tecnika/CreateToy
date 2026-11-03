-- Managers may hide products, but only admins may restore them.
create or replace function public.products_guard_archive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.archived_at is not null
     and new.archived_at is null
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_admin() then
    raise exception 'Только администратор может восстановить товар.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists products_guard_archive on public.products;
create trigger products_guard_archive
  before update on public.products
  for each row execute function public.products_guard_archive();

revoke execute on function public.products_guard_archive() from public, anon, authenticated;
