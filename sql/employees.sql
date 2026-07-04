-- Employees table schema
-- Data seeding removed because records were already imported.
create table if not exists public.employees (
  id bigserial primary key,
  name text not null,
  is_active boolean not null default true,
  cutoff_tag text,
  position text not null,
  constraint employees_name_position_key unique (name, position)
);

alter table public.employees
  add column if not exists cutoff_tag text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'employees_cutoff_tag_fkey'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_cutoff_tag_fkey
      foreign key (cutoff_tag)
      references public.cutoff_list (tag)
      on update cascade
      on delete set null;
  end if;
end $$;

-- One-time migration path: backfill cutoff_tag using legacy date columns when available.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'first_co_start_date'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'first_co_end_date'
  ) then
    update public.employees as e
    set cutoff_tag = c.tag
    from public.cutoff_list as c
    where e.cutoff_tag is null
      and c.firstco_from_day = extract(day from e.first_co_start_date)::smallint
      and c.firstco_to_day = extract(day from e.first_co_end_date)::smallint;
  end if;
end $$;

alter table public.employees
  drop constraint if exists employees_first_co_start_date_check,
  drop constraint if exists employees_first_co_end_date_check,
  drop constraint if exists employees_second_co_day_check;

alter table public.employees
  drop column if exists first_co_start_date,
  drop column if exists first_co_end_date,
  drop column if exists second_co_day;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.employees to anon, authenticated;
grant usage, select on sequence public.employees_id_seq to anon, authenticated;

alter table public.employees enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'employees_select_all'
  ) then
    create policy employees_select_all
      on public.employees
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'employees_insert_all'
  ) then
    create policy employees_insert_all
      on public.employees
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'employees_update_all'
  ) then
    create policy employees_update_all
      on public.employees
      for update
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
