-- Min Veg — murer (Murer og betong / Betong og mur) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-murer-vilbli-branch-owner-record.md
-- Catalog shape: mirror plumber/painter/klima rows (tags, salary, nb/nn/en i18n).
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
  'murer',
  '{"nb":"Murer og betong","nn":"Murar og betong","en":"Bricklayer and concrete worker"}'::jsonb,
  '{"nb":"Muring, flislegging og betongarbeid i bygg — Betong og mur-kjeden.","nn":"Muring, flislegging og betongarbeid i bygg — Betong og mur-kjeda.","en":"Masonry, tiling and concrete work in buildings — the concrete and masonry pathway."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Betong og mur. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Betong og mur. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Concrete and masonry. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'high',
  true,
  '["building","craftsmanship","practical_work"]'::jsonb,
  '["practical_precision","spatial_awareness","persistence"]'::jsonb,
  '["safety_awareness","craftsmanship","teamwork"]'::jsonb,
  '["mathematics","technology","art_and_craft"]'::jsonb,
  '["masonry","tiling","concrete work","practical work","safety awareness"]'::jsonb,
  560000
where not exists (
  select 1
  from professions p
  where p.slug = 'murer'
);

commit;
