-- Cut off list table schema
create table if not exists public.cutoff_list (
  id bigserial primary key,
  tag text not null unique,
  firstco_from_day smallint not null default 1,
  firstco_to_day smallint not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cutoff_list_days_check check (
    firstco_from_day between 1 and 30
    and firstco_to_day between 2 and 30
    and firstco_to_day > firstco_from_day
  )
);

alter table public.cutoff_list
  add column if not exists firstco_from_day smallint not null default 1,
  add column if not exists firstco_to_day smallint not null default 15;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cutoff_list'
      and column_name = 'firstco_day'
  ) then
    execute 'update public.cutoff_list set firstco_to_day = firstco_day where firstco_day is not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cutoff_list'
      and column_name = 'firstco'
  ) then
    execute 'update public.cutoff_list set firstco_to_day = extract(day from firstco)::smallint where firstco is not null';
    execute 'alter table public.cutoff_list alter column firstco drop not null';
  end if;

  execute 'update public.cutoff_list set firstco_to_day = 30 where firstco_to_day > 30';
  execute 'update public.cutoff_list set firstco_from_day = 1 where firstco_from_day < 1';
  execute 'update public.cutoff_list set firstco_from_day = 29 where firstco_from_day >= firstco_to_day';

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cutoff_list'
      and column_name = 'secondco_day'
  ) then
    execute 'alter table public.cutoff_list alter column secondco_day drop not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cutoff_list'
      and column_name = 'secondco'
  ) then
    execute 'alter table public.cutoff_list alter column secondco drop not null';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'cutoff_list_days_check'
      and conrelid = 'public.cutoff_list'::regclass
  ) then
    alter table public.cutoff_list
      drop constraint cutoff_list_days_check;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'cutoff_list_days_check'
      and conrelid = 'public.cutoff_list'::regclass
  ) then
    alter table public.cutoff_list
      add constraint cutoff_list_days_check
      check (
        firstco_from_day between 1 and 30
        and firstco_to_day between 2 and 30
        and firstco_to_day > firstco_from_day
      );
  end if;
end $$;

create or replace function public.set_cutoff_list_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cutoff_list_updated_at on public.cutoff_list;
create trigger trg_cutoff_list_updated_at
before update on public.cutoff_list
for each row
execute function public.set_cutoff_list_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.cutoff_list to anon, authenticated;
grant usage, select on sequence public.cutoff_list_id_seq to anon, authenticated;

alter table public.cutoff_list enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cutoff_list'
      and policyname = 'cutoff_list_select_all'
  ) then
    create policy cutoff_list_select_all
      on public.cutoff_list
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cutoff_list'
      and policyname = 'cutoff_list_insert_all'
  ) then
    create policy cutoff_list_insert_all
      on public.cutoff_list
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cutoff_list'
      and policyname = 'cutoff_list_update_all'
  ) then
    create policy cutoff_list_update_all
      on public.cutoff_list
      for update
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
