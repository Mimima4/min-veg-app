-- Rename Contour B catalog profession anleggsteknikk → maskin-og-kranforer.
-- Keep Vilbli school VG2 as Anleggsteknikk in programme titles / slug middles (vg2-anleggsteknikk).
-- Prefer the Node runner (clones programmes + remaps PSA + study_routes):
--   node --env-file=.env.local scripts/rename-profession-anleggsteknikk-to-maskin-og-kranforer.mjs
--
-- Layers:
--   catalog title  = Maskin- og kranfører
--   school VG2     = Anleggsteknikk (BAANL2)
--   NAV leaf       = bygg-og-anlegg.maskin--og-kranfører (unchanged labels; key remapped in code)

begin;

-- 1) Ensure new profession row exists with correct titles.
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
  'maskin-og-kranforer',
  '{"nb":"Maskin- og kranfører","nn":"Maskin- og kranførar","en":"Machine and crane operator"}'::jsonb,
  '{"nb":"Maskiner, anlegg og infrastruktur i bygg og anlegg.","nn":"Maskiner, anlegg og infrastruktur i bygg og anlegg.","en":"Machinery, construction sites and infrastructure in building and civil engineering."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Construction technology. Then apprenticeship and trade certificate."}'::jsonb,
  coalesce(p.education_level, 'vocational'),
  coalesce(p.work_style, 'onsite'),
  coalesce(p.demand_level, 'medium'),
  true,
  p.interest_tags,
  p.strength_tags,
  p.development_focus_tags,
  p.school_subject_tags,
  p.key_skills,
  coalesce(p.avg_salary_nok, 540000)
from professions p
where p.slug = 'anleggsteknikk'
  and not exists (select 1 from professions x where x.slug = 'maskin-og-kranforer');

update professions
set
  title_i18n = '{"nb":"Maskin- og kranfører","nn":"Maskin- og kranførar","en":"Machine and crane operator"}'::jsonb,
  summary_i18n = '{"nb":"Maskiner, anlegg og infrastruktur i bygg og anlegg.","nn":"Maskiner, anlegg og infrastruktur i bygg og anlegg.","en":"Machinery, construction sites and infrastructure in building and civil engineering."}'::jsonb,
  education_notes_i18n = '{"nb":"VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Construction technology. Then apprenticeship and trade certificate."}'::jsonb,
  is_active = true
where slug = 'maskin-og-kranforer';

-- 2) Rename education_programs slugs anleggsteknikk-* → maskin-og-kranforer-* (prefix only).
update education_programs ep
set
  slug = regexp_replace(ep.slug, '^anleggsteknikk-', 'maskin-og-kranforer-'),
  program_code = regexp_replace(coalesce(ep.program_code, ''), '^ANLEG-', 'MASKIN-OG-KRANFORER-')
where ep.slug like 'anleggsteknikk-%'
  and not exists (
    select 1
    from education_programs other
    where other.slug = regexp_replace(ep.slug, '^anleggsteknikk-', 'maskin-og-kranforer-')
  );

-- 3) Repoint profession_program_links.
update profession_program_links
set
  profession_slug = 'maskin-og-kranforer',
  program_slug = regexp_replace(program_slug, '^anleggsteknikk-', 'maskin-og-kranforer-')
where profession_slug = 'anleggsteknikk'
  and not exists (
    select 1
    from profession_program_links other
    where other.profession_slug = 'maskin-og-kranforer'
      and other.program_slug = regexp_replace(
        profession_program_links.program_slug,
        '^anleggsteknikk-',
        'maskin-og-kranforer-'
      )
  );

delete from profession_program_links
where profession_slug = 'anleggsteknikk';

-- 4) Continuations.
update vgs_vilbli_home_vg2_continuations
set profession_slug = 'maskin-og-kranforer'
where profession_slug = 'anleggsteknikk'
  and not exists (
    select 1
    from vgs_vilbli_home_vg2_continuations other
    where other.profession_slug = 'maskin-og-kranforer'
      and other.home_county_code = vgs_vilbli_home_vg2_continuations.home_county_code
      and other.institution_id = vgs_vilbli_home_vg2_continuations.institution_id
  );

delete from vgs_vilbli_home_vg2_continuations
where profession_slug = 'anleggsteknikk';

-- 5) Source observations (if any).
update source_school_observations
set profession_slug = 'maskin-og-kranforer'
where profession_slug = 'anleggsteknikk';

-- 6) CRITICAL: study_routes remapping (avoid orphan drafts on deactivated profession).
-- Archive old route when child already has a non-archived draft for the new profession.
update study_routes sr
set
  status = 'archived',
  archived_at = coalesce(sr.archived_at, now())
where sr.target_profession_id = (select id from professions where slug = 'anleggsteknikk')
  and sr.archived_at is null
  and exists (
    select 1
    from study_routes other
    where other.child_id = sr.child_id
      and other.target_profession_id = (select id from professions where slug = 'maskin-og-kranforer')
      and other.archived_at is null
  );

update study_routes
set target_profession_id = (select id from professions where slug = 'maskin-og-kranforer')
where target_profession_id = (select id from professions where slug = 'anleggsteknikk')
  and archived_at is null;

-- 7) child_profession_interests (drop duplicates, then remapped).
delete from child_profession_interests cpi
where cpi.profession_id = (select id from professions where slug = 'anleggsteknikk')
  and exists (
    select 1
    from child_profession_interests other
    where other.child_profile_id = cpi.child_profile_id
      and other.profession_id = (select id from professions where slug = 'maskin-og-kranforer')
  );

update child_profession_interests
set profession_id = (select id from professions where slug = 'maskin-og-kranforer')
where profession_id = (select id from professions where slug = 'anleggsteknikk');

-- 8) Soft-deactivate old catalog row.
update professions
set is_active = false
where slug = 'anleggsteknikk';

commit;
