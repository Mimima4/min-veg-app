-- Min Veg — platearbeider-og-sveiser (Platearbeider og sveiser) catalog profession seed
-- Charter: docs/architecture/phase-0-6-contour-b-klima-vilbli-branch-owner-record.md
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
  'platearbeider-og-sveiser',
  '{"nb":"Platearbeider og sveiser","nn":"Platearbeidar og sveiser","en":"Sheet metal worker and welder"}'::jsonb,
  '{"nb":"Ventilasjon, blikk og klima i bygg — KEM-kjeden.","nn":"Ventilasjon, blikk og klima i bygg — KEM-kjeda.","en":"Ventilation, sheet metal and climate systems in buildings — KEM pathway."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Klima, energi og miljøteknikk. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Klima, energi og miljøteknikk. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Climate, energy and environmental technology. Then apprenticeship and trade certificate."}'::jsonb,
  'vocational',
  'onsite',
  'high',
  true,
  '["building","technology","nature"]'::jsonb,
  '["practical_precision","spatial_awareness","persistence"]'::jsonb,
  '["safety_awareness","craftsmanship","teamwork"]'::jsonb,
  '["mathematics","technology","nature"]'::jsonb,
  '["ventilation","sheet metal","practical work","safety awareness"]'::jsonb,
  560000
where not exists (
  select 1
  from professions p
  where p.slug = 'platearbeider-og-sveiser'
);

commit;
