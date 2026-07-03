-- Min Veg — carpenter (Tømrer) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-third-profession-expansion-owner-record.md
-- Catalog shape: mirror electrician/mechanic rows (tags, salary, nb/nn/en i18n).
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
  'carpenter',
  '{"nb":"Tømrer","nn":"Tømrar","en":"Carpenter"}'::jsonb,
  '{"nb":"Bygger og monterer trekonstruksjoner — fra bolig til innredning.","nn":"Byggjer og monterer trekkonstruksjonar — frå bustad til innreiing.","en":"Builds and installs timber structures — from housing to interiors."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Tømrerfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Tømrarfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Carpentry. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'medium',
  true,
  '["building","technology","nature"]'::jsonb,
  '["practical_precision","structured_work","persistence"]'::jsonb,
  '["safety_awareness","manual_precision","tool_confidence"]'::jsonb,
  '["mathematics","technology","science"]'::jsonb,
  '["timber construction","manual skills","attention to detail","problem solving"]'::jsonb,
  555000
where not exists (
  select 1
  from professions p
  where p.slug = 'carpenter'
);

commit;
