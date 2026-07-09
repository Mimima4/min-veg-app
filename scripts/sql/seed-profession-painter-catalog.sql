-- Min Veg — painter (Maler) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-painter-vilbli-branch-owner-record.md
-- Catalog shape: mirror plumber/carpenter rows (tags, salary, nb/nn/en i18n).
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
  'painter',
  '{"nb":"Maler","nn":"Malar","en":"Painter"}'::jsonb,
  '{"nb":"Overflater, maling og beskyttelse i bygg og anlegg.","nn":"Overflater, maling og vern i bygg og anlegg.","en":"Surfaces, painting and protection in building and construction."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Overflateteknikk. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Overflateteknikk. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Surface technology. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'medium',
  true,
  '["building","design","nature"]'::jsonb,
  '["practical_precision","attention_to_detail","persistence"]'::jsonb,
  '["safety_awareness","color_sense","surface_preparation"]'::jsonb,
  '["mathematics","art","technology"]'::jsonb,
  '["surface preparation","painting","practical work","safety awareness"]'::jsonb,
  520000
where not exists (
  select 1
  from professions p
  where p.slug = 'painter'
);

commit;
