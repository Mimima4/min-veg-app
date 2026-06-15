-- Min Veg — carpenter (Tømrer) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-third-profession-expansion-owner-record.md
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
  '{"nb":"Tømrer","no":"Tømrer","en":"Carpenter"}'::jsonb,
  '{"nb":"Bygger og monterer trekonstruksjoner — fra bolig til innredning. Vanlig løp: VGS bygg og anlegg, læretid, fagbrev.","en":"Builds and installs timber structures — from housing to interiors. Typical path: upper secondary building trades, apprenticeship, trade certificate."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Tømrerfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Carpentry. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'medium',
  true,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  null
where not exists (
  select 1
  from professions p
  where p.slug = 'carpenter'
);

commit;
