-- Min Veg — treteknikk catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-treteknikk-vilbli-branch-owner-record.md
-- Catalog shape: mirror plumber/painter/klima/murer/anleggsgartner rows.
-- Scope: one professions row only; no PSA / programme links (pipeline materializes those).

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
  'treteknikk',
  '{"nb":"Treteknikk","nn":"Treteknikk","en":"Wood technology"}'::jsonb,
  '{"nb":"Arbeid med tre, snekker- og industriell treproduksjon — fra VG2 Treteknikk til lære og fagbrev.","nn":"Arbeid med tre, snekkar- og industriell treproduksjon — frå VG2 Treteknikk til lære og fagbrev.","en":"Woodworking and industrial timber production — from VG2 Treteknikk through apprenticeship and trade certificate."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekker / industrisnekker / trelast).","nn":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekkar / industrisnekkar / trelast).","en":"Upper secondary: Building and construction → Wood technology. Then apprenticeship and trade certificate."}'::jsonb,
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
  where p.slug = 'treteknikk'
);

commit;
