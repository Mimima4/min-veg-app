-- Min Veg
-- Programme -> school availability foundation
-- Purpose:
--   Separate truth layer for programme availability by school/fylke.
--   Route engine must read this from our DB only, never from runtime external calls.
-- Scope:
--   Foundation only. No route-engine wiring yet. No fake availability guesses.

begin;

create table if not exists programme_school_availability (
  id uuid primary key default gen_random_uuid(),

  education_program_id uuid not null
    references education_programs(id)
    on delete cascade,

  institution_id uuid not null
    references education_institutions(id)
    on delete cascade,

  country_code text not null default 'NO',
  county_code text not null,
  municipality_code text,

  availability_scope text not null default 'programme_in_school'
    check (availability_scope in ('programme_in_school')),

  source text not null
    check (source in ('vilbli', 'manual_review', 'official_import')),

  source_reference_url text,
  source_snapshot_label text,

  is_active boolean not null default true,
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  last_seen_at timestamptz,
  verification_status text not null default 'verified'
    check (verification_status in ('verified', 'needs_review', 'rejected', 'superseded')),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (education_program_id, institution_id, source)
);

create index if not exists idx_programme_school_availability_program
  on programme_school_availability (education_program_id);

create index if not exists idx_programme_school_availability_institution
  on programme_school_availability (institution_id);

create index if not exists idx_programme_school_availability_county
  on programme_school_availability (county_code);

create index if not exists idx_programme_school_availability_active
  on programme_school_availability (is_active);

create index if not exists idx_programme_school_availability_verification
  on programme_school_availability (verification_status);

create index if not exists idx_programme_school_availability_program_county_active
  on programme_school_availability (education_program_id, county_code, is_active);

create or replace function set_programme_school_availability_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_programme_school_availability_updated_at
  on programme_school_availability;

create trigger trg_programme_school_availability_updated_at
before update on programme_school_availability
for each row
execute function set_programme_school_availability_updated_at();

comment on table programme_school_availability is
  'Programme -> school availability truth layer for route realism.';

comment on column programme_school_availability.source is
  'Origin of availability truth. vilbli = normalized public availability source.';

comment on column programme_school_availability.verification_status is
  'Operational review state; route should later read only trusted active rows.';

commit;
