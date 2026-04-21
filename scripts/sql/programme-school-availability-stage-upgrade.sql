-- Min Veg
-- Upgrade: add stage-aware uniqueness to programme_school_availability
-- Purpose:
--   Make availability rows stage-specific (VG1/VG2/VG3/APPRENTICESHIP)
--   and prevent duplicates per (program, institution, county, stage, source).

begin;

alter table programme_school_availability
  add column if not exists stage text;

update programme_school_availability
set stage = 'VG1'
where stage is null;

alter table programme_school_availability
  alter column stage set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'programme_school_availability_stage_check'
      and conrelid = 'programme_school_availability'::regclass
  ) then
    alter table programme_school_availability
      add constraint programme_school_availability_stage_check
      check (stage in ('VG1', 'VG2', 'VG3', 'APPRENTICESHIP'));
  end if;
end
$$;

-- Replace old uniqueness (program + institution + source) with stage-aware key.
do $$
declare
  old_constraint text;
begin
  select c.conname
  into old_constraint
  from pg_constraint c
  where c.conrelid = 'programme_school_availability'::regclass
    and c.contype = 'u'
    and pg_get_constraintdef(c.oid) like '%education_program_id, institution_id, source%';

  if old_constraint is not null then
    execute format(
      'alter table programme_school_availability drop constraint %I',
      old_constraint
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'programme_school_availability_program_inst_county_stage_source_key'
      and conrelid = 'programme_school_availability'::regclass
  ) then
    alter table programme_school_availability
      add constraint programme_school_availability_program_inst_county_stage_source_key
      unique (education_program_id, institution_id, county_code, stage, source);
  end if;
end
$$;

create index if not exists idx_programme_school_availability_stage
  on programme_school_availability (stage);

create index if not exists idx_programme_school_availability_program_county_stage_active
  on programme_school_availability (education_program_id, county_code, stage, is_active);

commit;
