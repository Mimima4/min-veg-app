-- Min Veg
-- Seed: ensure VG2 Elenergi og ekom - Oslo exists in education_programs
-- Scope:
--   Adds only one program row if missing.
--   Does not modify Bergen row or any existing rows.

begin;

insert into education_programs (
  slug,
  program_code,
  title,
  education_level,
  study_mode,
  is_active
)
select
  'electrician-vg2-elenergi-oslo',
  'EL-VG2-OSLO',
  'VG2 Elenergi og ekom - Oslo',
  'upper_secondary',
  'full_time',
  true
where not exists (
  select 1
  from education_programs ep
  where ep.slug = 'electrician-vg2-elenergi-oslo'
     or ep.program_code = 'EL-VG2-OSLO'
     or ep.title = 'VG2 Elenergi og ekom - Oslo'
);

commit;
