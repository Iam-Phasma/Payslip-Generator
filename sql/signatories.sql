-- Signatories table schema
create table if not exists public.signatories (
  id bigserial primary key,
  tag text not null unique,
  prp_by text not null,
  chk_by text not null,
  ntd_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibility: support legacy column names if the table was created with prp/chk/ntd.
alter table public.signatories
  add column if not exists prp_by text,
  add column if not exists chk_by text,
  add column if not exists ntd_by text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'signatories'
      and column_name = 'prp'
  ) then
    execute 'update public.signatories set prp_by = coalesce(prp_by, prp)';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'signatories'
      and column_name = 'chk'
  ) then
    execute 'update public.signatories set chk_by = coalesce(chk_by, chk)';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'signatories'
      and column_name = 'ntd'
  ) then
    execute 'update public.signatories set ntd_by = coalesce(ntd_by, ntd)';
  end if;
end $$;

-- Ensure required values after backfill.
update public.signatories
set prp_by = coalesce(nullif(trim(prp_by), ''), 'N/A'),
    chk_by = coalesce(nullif(trim(chk_by), ''), 'N/A'),
    ntd_by = coalesce(nullif(trim(ntd_by), ''), 'N/A');

alter table public.signatories
  alter column prp_by set not null,
  alter column chk_by set not null,
  alter column ntd_by set not null;

create or replace function public.set_signatories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_signatories_updated_at on public.signatories;
create trigger trg_signatories_updated_at
before update on public.signatories
for each row
execute function public.set_signatories_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.signatories to anon, authenticated;
grant usage, select on sequence public.signatories_id_seq to anon, authenticated;

alter table public.signatories enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'signatories'
      and policyname = 'signatories_select_all'
  ) then
    create policy signatories_select_all
      on public.signatories
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'signatories'
      and policyname = 'signatories_insert_all'
  ) then
    create policy signatories_insert_all
      on public.signatories
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'signatories'
      and policyname = 'signatories_update_all'
  ) then
    create policy signatories_update_all
      on public.signatories
      for update
      to anon, authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'signatories'
      and policyname = 'signatories_delete_all'
  ) then
    create policy signatories_delete_all
      on public.signatories
      for delete
      to anon, authenticated
      using (true);
  end if;
end $$;
