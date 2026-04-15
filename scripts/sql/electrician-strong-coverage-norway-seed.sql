-- Min Veg — additive education dataset: electrician strong coverage (Norway-first baseline).
--
-- Purpose: widen geography-realistic strong programme options for profession_slug = 'electrician'
-- beyond a narrow Oslo/Bergen cluster, for route selection and realism testing.
--
-- Provenance: internal baseline seed aligned with publicly known upper-secondary (VGS) schools
-- that offer (or historically/commonly list) electricity / elektro VG2-style vocational lines.
-- This is NOT Samordna opptak / official admission ingestion; do not treat as authoritative
-- admission truth (see route_admission_realism layer for that contract).
--
-- Idempotent: safe to re-run; skips rows that already exist by slug.

begin;

-- ---------------------------------------------------------------------------
-- Institutions (one row per distinct municipality / school)
-- ---------------------------------------------------------------------------
insert into education_institutions (
  id,
  slug,
  name,
  institution_type,
  website_url,
  county_code,
  municipality_code,
  municipality_name,
  is_active
)
select *
from (
  values
    (
      'a1111111-1111-4111-8111-111111110001'::uuid,
      'mv-education-inst-strinda-vgs-trondheim',
      'Strinda videregående skole',
      'upper_secondary_school',
      null,
      '50',
      '5001',
      'Trondheim',
      true
    ),
    (
      'a1111111-1111-4111-8111-111111110002'::uuid,
      'mv-education-inst-godalen-vgs-stavanger',
      'Godalen videregående skole',
      'upper_secondary_school',
      null,
      '11',
      '1103',
      'Stavanger',
      true
    ),
    (
      'a1111111-1111-4111-8111-111111110003'::uuid,
      'mv-education-inst-kirkeparken-vgs-tromso',
      'Kirkeparken videregående skole',
      'upper_secondary_school',
      null,
      '55',
      '5501',
      'Tromsø',
      true
    ),
    (
      'a1111111-1111-4111-8111-111111110004'::uuid,
      'mv-education-inst-kvadraturen-vgs-kristiansand',
      'Kvadraturen videregående skole',
      'upper_secondary_school',
      null,
      '42',
      '4204',
      'Kristiansand',
      true
    ),
    (
      'a1111111-1111-4111-8111-111111110005'::uuid,
      'mv-education-inst-alta-vgs-alta',
      'Alta videregående skole',
      'upper_secondary_school',
      null,
      '56',
      '5403',
      'Alta',
      true
    )
) as v (
  id,
  slug,
  name,
  institution_type,
  website_url,
  county_code,
  municipality_code,
  municipality_name,
  is_active
)
where not exists (
  select 1 from education_institutions ei where ei.slug = v.slug
);

-- ---------------------------------------------------------------------------
-- Education programmes (VG2-style elektro / electricity vocational line)
-- ---------------------------------------------------------------------------
insert into education_programs (
  slug,
  title,
  education_level,
  study_mode,
  duration_years,
  description,
  institution_id,
  is_active
)
select v.slug,
       v.title,
       v.education_level,
       v.study_mode,
       v.duration_years,
       v.description,
       ei.id,
       true
from (
  values
    (
      'mv-electrician-voc-vg2-elektro-strinda-trondheim',
      'VG2 Elektrofag — Strinda vgs (Trondheim)',
      'vocational',
      'full_time',
      2::numeric,
      'Upper-secondary vocational electricity programme (baseline seed).'::text,
      'mv-education-inst-strinda-vgs-trondheim'::text
    ),
    (
      'mv-electrician-voc-vg2-elektro-godalen-stavanger',
      'VG2 Elektrofag — Godalen vgs (Stavanger)',
      'vocational',
      'full_time',
      2::numeric,
      'Upper-secondary vocational electricity programme (baseline seed).'::text,
      'mv-education-inst-godalen-vgs-stavanger'::text
    ),
    (
      'mv-electrician-voc-vg2-elektro-kirkeparken-tromso',
      'VG2 Elektrofag — Kirkeparken vgs (Tromsø)',
      'vocational',
      'full_time',
      2::numeric,
      'Upper-secondary vocational electricity programme (baseline seed).'::text,
      'mv-education-inst-kirkeparken-vgs-tromso'::text
    ),
    (
      'mv-electrician-voc-vg2-elektro-kvadraturen-kristiansand',
      'VG2 Elektrofag — Kvadraturen vgs (Kristiansand)',
      'vocational',
      'full_time',
      2::numeric,
      'Upper-secondary vocational electricity programme (baseline seed).'::text,
      'mv-education-inst-kvadraturen-vgs-kristiansand'::text
    ),
    (
      'mv-electrician-voc-vg2-elektro-alta-vgs',
      'VG2 Elektrofag — Alta vgs',
      'vocational',
      'full_time',
      2::numeric,
      'Upper-secondary vocational electricity programme (baseline seed).'::text,
      'mv-education-inst-alta-vgs-alta'::text
    )
) as v (
  slug,
  title,
  education_level,
  study_mode,
  duration_years,
  description,
  institution_slug
)
join education_institutions ei on ei.slug = v.institution_slug
where not exists (select 1 from education_programs ep where ep.slug = v.slug);

-- ---------------------------------------------------------------------------
-- Profession links: electrician — strong fit
-- ---------------------------------------------------------------------------
insert into profession_program_links (profession_slug, program_slug, fit_band, note)
select 'electrician',
       v.program_slug,
       'strong',
       'Baseline Norway-first seed (not official admission ingestion).'
from (
  values
    ('mv-electrician-voc-vg2-elektro-strinda-trondheim'::text),
    ('mv-electrician-voc-vg2-elektro-godalen-stavanger'::text),
    ('mv-electrician-voc-vg2-elektro-kirkeparken-tromso'::text),
    ('mv-electrician-voc-vg2-elektro-kvadraturen-kristiansand'::text),
    ('mv-electrician-voc-vg2-elektro-alta-vgs'::text)
) as v (program_slug)
where exists (select 1 from education_programs ep where ep.slug = v.program_slug and ep.is_active = true)
  and not exists (
        select 1
        from profession_program_links ppl
        where ppl.profession_slug = 'electrician'
          and ppl.program_slug = v.program_slug
      );

commit;

-- Verification (run manually after apply):
-- select count(*) filter (where ppl.fit_band = 'strong') as electrician_strong
-- from profession_program_links ppl
-- where ppl.profession_slug = 'electrician';
