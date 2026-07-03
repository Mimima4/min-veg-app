-- Min Veg — plumber (Rørlegger) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-plumber-vilbli-branch-owner-record.md
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
  'plumber',
  '{"nb":"Rørlegger","nn":"Røyrleggjar","en":"Plumber"}'::jsonb,
  '{"nb":"Installerer og vedlikeholder rør, sanitær og varmeanlegg.","nn":"Installerer og vedlikeheld rør, sanitær og varmeanlegg.","en":"Installs and maintains pipes, plumbing and heating systems."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Rørleggerfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Røyrleggjarfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Plumbing. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'medium',
  true,
  '["building","technology","nature"]'::jsonb,
  '["practical_precision","structured_work","persistence"]'::jsonb,
  '["safety_awareness","technical_routines","fault_finding"]'::jsonb,
  '["mathematics","technology","science"]'::jsonb,
  '["pipe installation","troubleshooting","practical work","safety awareness"]'::jsonb,
  575000
where not exists (
  select 1
  from professions p
  where p.slug = 'plumber'
);

commit;
