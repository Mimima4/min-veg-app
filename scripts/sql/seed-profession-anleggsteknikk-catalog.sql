-- Min Veg — anleggsteknikk (Anleggsmaskinfører) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-anleggsteknikk-vilbli-branch-owner-record.md
-- Catalog shape: mirror plumber/painter rows (tags, salary, nb/nn/en i18n).
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
  'anleggsteknikk',
  '{"nb":"Anleggsmaskinfører","nn":"Anleggsmaskinførar","en":"Construction equipment operator"}'::jsonb,
  '{"nb":"Maskiner, anlegg og infrastruktur i bygg og anlegg.","nn":"Maskiner, anlegg og infrastruktur i bygg og anlegg.","en":"Machinery, construction sites and infrastructure in building and civil engineering."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Construction technology. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'medium',
  true,
  '["building","nature","technology"]'::jsonb,
  '["practical_precision","spatial_awareness","persistence"]'::jsonb,
  '["safety_awareness","machine_operation","teamwork"]'::jsonb,
  '["mathematics","technology","nature"]'::jsonb,
  '["machine operation","site work","practical work","safety awareness"]'::jsonb,
  540000
where not exists (
  select 1
  from professions p
  where p.slug = 'anleggsteknikk'
);

commit;
