-- Min Veg — anleggsgartner catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-anleggsgartner-vilbli-branch-owner-record.md
-- Catalog shape: mirror plumber/painter/klima/murer rows (tags, salary, nb/nn/en i18n).
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
  'anleggsgartner',
  '{"nb":"Anleggsgartner","nn":"Anleggsgartnar","en":"Landscape gardener"}'::jsonb,
  '{"nb":"Bygging, drift og vedlikehold av hager, parker, friområder og idrettsanlegg.","nn":"Bygging, drift og vedlikehald av hagar, parkar, friområde og idrettsanlegg.","en":"Building, operating and maintaining gardens, parks, open spaces and sports facilities."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Anleggsgartner. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Anleggsgartnar. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Landscape gardening. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'high',
  true,
  '["building","outdoors","practical_work","nature"]'::jsonb,
  '["practical_precision","physical_endurance","spatial_awareness"]'::jsonb,
  '["safety_awareness","craftsmanship","teamwork","sustainability"]'::jsonb,
  '["mathematics","natural_sciences","art_and_craft"]'::jsonb,
  '["landscaping","planting","outdoor construction","practical work","safety awareness"]'::jsonb,
  520000
where not exists (
  select 1
  from professions p
  where p.slug = 'anleggsgartner'
);

commit;
