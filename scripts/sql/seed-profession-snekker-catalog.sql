-- Min Veg — snekker catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-snekker-vilbli-branch-owner-record.md
-- Catalog shape: mirror plumber/painter/klima/murer/anleggsgartner rows.
-- Scope: one professions row only; no PSA / programme links (pipeline materializes those).
-- Catalog title is Snekker (distinct from carpenter / Tømrer). Vilbli school VG2 remains Treteknikk.

begin;

insert into professions (
  slug,
  title_i18n,
  summary_i18n,
  education_notes_i18n,
  education_level,
  work_style,
  demand_level,
  is_active,
  interest_tags,
  strength_tags,
  development_focus_tags,
  school_subject_tags,
  key_skills,
  avg_salary_nok
)
select
  'snekker',
  '{"nb":"Snekker","nn":"Snekkar","en":"Joiner"}'::jsonb,
  '{"nb":"Lager møbler, innredning og treprodukter — fra verksted til industriell trevare.","nn":"Lagar møblar, innreiing og treprodukt — frå verkstad til industriell trevare.","en":"Makes furniture, interiors and wood products — from workshop to industrial timber goods."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekker / industrisnekker / trelast).","nn":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekkar / industrisnekkar / trelast).","en":"Upper secondary: Building and construction → Wood technology (Treteknikk). Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'high',
  true,
  '["building","practical_work","craftsmanship","materials"]'::jsonb,
  '["practical_precision","spatial_awareness","craftsmanship"]'::jsonb,
  '["safety_awareness","craftsmanship","teamwork","quality"]'::jsonb,
  '["mathematics","natural_sciences","art_and_craft"]'::jsonb,
  '["woodworking","joinery","timber production","practical work","safety awareness"]'::jsonb,
  520000
where not exists (
  select 1
  from professions p
  where p.slug = 'snekker'
);

commit;
