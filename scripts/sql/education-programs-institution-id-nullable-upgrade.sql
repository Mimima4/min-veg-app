-- Min Veg
-- Upgrade: allow programme-level rows without single institution binding
-- Scope:
--   Only drops NOT NULL from education_programs.institution_id.
--   No data rewrite, no FK changes, no other schema changes.

begin;

alter table education_programs
  alter column institution_id drop not null;

commit;
