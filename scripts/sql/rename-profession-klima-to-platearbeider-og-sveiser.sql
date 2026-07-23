-- Rename Contour B catalog profession klima → platearbeider-og-sveiser.
-- Keep Vilbli school VG2 as Klima/energi/miljø in programme titles / slug middles (vg2-klima).
-- Prefer the Node runner (clones programmes + remaps PSA + study_routes):
--   node --env-file=.env.local scripts/rename-profession-klima-to-platearbeider-og-sveiser.mjs
--
-- Layers:
--   catalog title  = Platearbeider og sveiser
--   school VG2     = Klima, energi og miljøteknikk (BAKEM2)
--   NAV leaf       = håndverkere.platearbeider-og-sveiser (unchanged labels; key remapped in code)

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
  coalesce(p.education_level, 'vocational'),
  coalesce(p.work_style, 'onsite'),
  coalesce(p.demand_level, 'high'),
  true,
  p.interest_tags,
  p.strength_tags,
  p.development_focus_tags,
  p.school_subject_tags,
  p.key_skills,
  coalesce(p.avg_salary_nok, 560000)
from professions p
where p.slug = 'klima'
  and not exists (select 1 from professions x where x.slug = 'platearbeider-og-sveiser');

update professions
set
  title_i18n = '{"nb":"Platearbeider og sveiser","nn":"Platearbeidar og sveiser","en":"Sheet metal worker and welder"}'::jsonb,
  summary_i18n = '{"nb":"Ventilasjon, blikk og klima i bygg — KEM-kjeden.","nn":"Ventilasjon, blikk og klima i bygg — KEM-kjeda.","en":"Ventilation, sheet metal and climate systems in buildings — KEM pathway."}'::jsonb,
  education_notes_i18n = '{"nb":"VGS: Bygg- og anleggsteknikk → Klima, energi og miljøteknikk. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Klima, energi og miljøteknikk. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Climate, energy and environmental technology. Then apprenticeship and trade certificate."}'::jsonb,
  is_active = true
where slug = 'platearbeider-og-sveiser';

update education_programs ep
set
  slug = regexp_replace(ep.slug, '^klima-', 'platearbeider-og-sveiser-'),
  program_code = regexp_replace(coalesce(ep.program_code, ''), '^KLIMA-', 'PLATEARBEIDER-OG-SVEISER-')
where ep.slug like 'klima-%'
  and not exists (
    select 1
    from education_programs other
    where other.slug = regexp_replace(ep.slug, '^klima-', 'platearbeider-og-sveiser-')
  );

update profession_program_links
set
  profession_slug = 'platearbeider-og-sveiser',
  program_slug = regexp_replace(program_slug, '^klima-', 'platearbeider-og-sveiser-')
where profession_slug = 'klima'
  and not exists (
    select 1
    from profession_program_links other
    where other.profession_slug = 'platearbeider-og-sveiser'
      and other.program_slug = regexp_replace(
        profession_program_links.program_slug,
        '^klima-',
        'platearbeider-og-sveiser-'
      )
  );

delete from profession_program_links
where profession_slug = 'klima';

update vgs_vilbli_home_vg2_continuations
set profession_slug = 'platearbeider-og-sveiser'
where profession_slug = 'klima'
  and not exists (
    select 1
    from vgs_vilbli_home_vg2_continuations other
    where other.profession_slug = 'platearbeider-og-sveiser'
      and other.home_county_code = vgs_vilbli_home_vg2_continuations.home_county_code
      and other.institution_id = vgs_vilbli_home_vg2_continuations.institution_id
  );

delete from vgs_vilbli_home_vg2_continuations
where profession_slug = 'klima';

update source_school_observations
set profession_slug = 'platearbeider-og-sveiser'
where profession_slug = 'klima';

-- CRITICAL: study_routes remapping.
update study_routes sr
set
  status = 'archived',
  archived_at = coalesce(sr.archived_at, now())
where sr.target_profession_id = (select id from professions where slug = 'klima')
  and sr.archived_at is null
  and exists (
    select 1
    from study_routes other
    where other.child_id = sr.child_id
      and other.target_profession_id = (select id from professions where slug = 'platearbeider-og-sveiser')
      and other.archived_at is null
  );

update study_routes
set target_profession_id = (select id from professions where slug = 'platearbeider-og-sveiser')
where target_profession_id = (select id from professions where slug = 'klima')
  and archived_at is null;

delete from child_profession_interests cpi
where cpi.profession_id = (select id from professions where slug = 'klima')
  and exists (
    select 1
    from child_profession_interests other
    where other.child_profile_id = cpi.child_profile_id
      and other.profession_id = (select id from professions where slug = 'platearbeider-og-sveiser')
  );

update child_profession_interests
set profession_id = (select id from professions where slug = 'platearbeider-og-sveiser')
where profession_id = (select id from professions where slug = 'klima');

update professions
set is_active = false
where slug = 'klima';

commit;
