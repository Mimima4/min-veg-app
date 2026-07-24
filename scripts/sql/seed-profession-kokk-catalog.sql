-- Min Veg — kokk catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-kokk-vilbli-branch-owner-record.md
-- Catalog shape: mirror snekker/mechanic rows.
-- Scope: one professions row only; no PSA / programme links (pipeline materializes those).
-- Catalog title is Kokk (chef/cook — not waiter). Vilbli school VG2 remains Kokk- og servitørfag.

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
  'kokk',
  '{"nb":"Kokk","nn":"Kokk","en":"Cook"}'::jsonb,
  '{"nb":"Planlegger, tilbereder og anretter mat — fra restaurant og hotell til institusjonskjøkken.","nn":"Planlegg, tilbered og anrett mat — frå restaurant og hotell til institusjonskjøkken.","en":"Plans, prepares and plates food — from restaurants and hotels to institutional kitchens."}'::jsonb,
  '{"nb":"VGS: Restaurant- og matfag → Kokk- og servitørfag. Deretter lære og fagbrev (kokk / ernæringskokk).","nn":"VGS: Restaurant- og matfag → Kokk- og servitørfag. Deretter lære og fagbrev (kokk / ernæringskokk).","en":"Upper secondary: Restaurant and food studies → Cook and waiter programme. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'high',
  true,
  '["food","hospitality","practical_work","service"]'::jsonb,
  '["practical_precision","teamwork","creativity"]'::jsonb,
  '["food_safety","teamwork","quality","customer_service"]'::jsonb,
  '["mathematics","natural_sciences","norwegian"]'::jsonb,
  '["cooking","food preparation","kitchen hygiene","menu planning","teamwork"]'::jsonb,
  480000
where not exists (
  select 1
  from professions p
  where p.slug = 'kokk'
);

commit;
