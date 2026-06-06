-- Phase 4 LOSA — extend programme_school_availability for delivery-municipality scope.
-- Nationwide-applicable enum value; Finnmark is reference case only.
-- P4-LOSA-PSA schema gate: migration file only until owner applies to target DB.

begin;

-- 1) Expand availability_scope check (idempotent).
do $$
declare
  constraint_name text;
  constraint_def text;
begin
  select c.conname, pg_get_constraintdef(c.oid)
  into constraint_name, constraint_def
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'programme_school_availability'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%availability_scope%'
  limit 1;

  if constraint_name is not null
     and constraint_def not like '%losa_fjern_delivery_municipality%' then
    execute format(
      'alter table public.programme_school_availability drop constraint %I',
      constraint_name
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'programme_school_availability'
      and c.conname = 'programme_school_availability_availability_scope_check'
  ) then
    alter table public.programme_school_availability
      add constraint programme_school_availability_availability_scope_check
      check (
        availability_scope in (
          'programme_in_school',
          'losa_fjern_delivery_municipality'
        )
      );
  end if;
end
$$;

-- 2) LOSA rows require delivery municipality_code.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'programme_school_availability'
      and c.conname = 'programme_school_availability_losa_municipality_required'
  ) then
    alter table public.programme_school_availability
      add constraint programme_school_availability_losa_municipality_required
      check (
        availability_scope <> 'losa_fjern_delivery_municipality'
        or municipality_code is not null
      );
  end if;
end
$$;

-- 3) Replace single unique key with scope-aware partial uniques.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'programme_school_availability_program_inst_county_stage_source_key'
      and conrelid = 'public.programme_school_availability'::regclass
  ) then
    alter table public.programme_school_availability
      drop constraint programme_school_availability_program_inst_county_stage_source_key;
  end if;
end
$$;

create unique index if not exists programme_school_availability_ordinary_scope_key
  on public.programme_school_availability (
    education_program_id,
    institution_id,
    county_code,
    stage,
    source
  )
  where availability_scope = 'programme_in_school';

create unique index if not exists programme_school_availability_losa_scope_key
  on public.programme_school_availability (
    education_program_id,
    institution_id,
    county_code,
    stage,
    source,
    municipality_code
  )
  where availability_scope = 'losa_fjern_delivery_municipality';

create index if not exists idx_programme_school_availability_availability_scope
  on public.programme_school_availability (availability_scope);

comment on column public.programme_school_availability.availability_scope is
  'programme_in_school = ordinary on-campus VGS; losa_fjern_delivery_municipality = Phase 4 LOSA provider + delivery municipality (nationwide pattern).';

commit;
