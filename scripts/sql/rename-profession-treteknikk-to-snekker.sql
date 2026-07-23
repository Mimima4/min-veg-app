-- Rename Contour B catalog profession treteknikk → snekker.
-- Keep Vilbli school VG2 as Treteknikk in programme titles / slug middles.
-- Safe-ish to re-run: guards on existence; does not delete orphan PSA rows.
--
-- Layers:
--   catalog title  = Snekker (distinct from carpenter / Tømrer)
--   school VG2     = Treteknikk (BATRT2)
--   NAV leaf       = håndverkere.tømrer-og-snekker (shared with carpenter; different navTitle in code)

begin;

-- 1) Ensure snekker profession row exists with correct titles.
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
  'snekker',
  '{"nb":"Snekker","nn":"Snekkar","en":"Joiner"}'::jsonb,
  '{"nb":"Lager møbler, innredning og treprodukter — fra verksted til industriell trevare.","nn":"Lagar møblar, innreiing og treprodukt — frå verkstad til industriell trevare.","en":"Makes furniture, interiors and wood products — from workshop to industrial timber goods."}'::jsonb,
  '{"nb":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekker / industrisnekker / trelast).","nn":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekkar / industrisnekkar / trelast).","en":"Upper secondary: Building and construction → Wood technology (Treteknikk). Then apprenticeship and trade certificate."}'::jsonb,
  coalesce(p.education_level, 'vocational'),
  coalesce(p.work_style, 'onsite'),
  coalesce(p.demand_level, 'high'),
  true,
  coalesce(p.interest_tags, '["building","practical_work","craftsmanship","materials"]'::jsonb),
  coalesce(p.strength_tags, '["practical_precision","spatial_awareness","craftsmanship"]'::jsonb),
  coalesce(p.development_focus_tags, '["safety_awareness","craftsmanship","teamwork","quality"]'::jsonb),
  coalesce(p.school_subject_tags, '["mathematics","natural_sciences","art_and_craft"]'::jsonb),
  coalesce(p.key_skills, '["woodworking","joinery","timber production","practical work","safety awareness"]'::jsonb),
  coalesce(p.avg_salary_nok, 520000)
from professions p
where p.slug = 'treteknikk'
  and not exists (select 1 from professions x where x.slug = 'snekker');

-- If snekker already exists (seed-only), force catalog titles.
update professions
set
  title_i18n = '{"nb":"Snekker","nn":"Snekkar","en":"Joiner"}'::jsonb,
  summary_i18n = '{"nb":"Lager møbler, innredning og treprodukter — fra verksted til industriell trevare.","nn":"Lagar møblar, innreiing og treprodukt — frå verkstad til industriell trevare.","en":"Makes furniture, interiors and wood products — from workshop to industrial timber goods."}'::jsonb,
  education_notes_i18n = '{"nb":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekker / industrisnekker / trelast).","nn":"VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekkar / industrisnekkar / trelast).","en":"Upper secondary: Building and construction → Wood technology (Treteknikk). Then apprenticeship and trade certificate."}'::jsonb,
  is_active = true
where slug = 'snekker';

-- 2) Rename education_programs slugs treteknikk-* → snekker-* (and codes).
-- Prefer update-in-place when target slug free; otherwise skip colliding rows.
update education_programs ep
set
  slug = regexp_replace(ep.slug, '^treteknikk-', 'snekker-'),
  program_code = regexp_replace(coalesce(ep.program_code, ''), '^TRETEKNIKK-', 'SNEKKER-')
where ep.slug like 'treteknikk-%'
  and not exists (
    select 1
    from education_programs other
    where other.slug = regexp_replace(ep.slug, '^treteknikk-', 'snekker-')
  );

-- 3) Repoint profession_program_links.
update profession_program_links
set
  profession_slug = 'snekker',
  program_slug = regexp_replace(program_slug, '^treteknikk-', 'snekker-')
where profession_slug = 'treteknikk'
  and not exists (
    select 1
    from profession_program_links other
    where other.profession_slug = 'snekker'
      and other.program_slug = regexp_replace(
        profession_program_links.program_slug,
        '^treteknikk-',
        'snekker-'
      )
  );

-- Drop leftover treteknikk links after successful rewrites.
delete from profession_program_links
where profession_slug = 'treteknikk';

-- 4) Continuations table.
update vgs_vilbli_home_vg2_continuations
set profession_slug = 'snekker'
where profession_slug = 'treteknikk'
  and not exists (
    select 1
    from vgs_vilbli_home_vg2_continuations other
    where other.profession_slug = 'snekker'
      and other.home_county_code = vgs_vilbli_home_vg2_continuations.home_county_code
      and other.institution_id = vgs_vilbli_home_vg2_continuations.institution_id
  );

delete from vgs_vilbli_home_vg2_continuations
where profession_slug = 'treteknikk';

-- 5) Source observations (if any).
update source_school_observations
set profession_slug = 'snekker'
where profession_slug = 'treteknikk';

-- 6) Deactivate old catalog row (keep row if FK leftovers; prefer soft-off).
update professions
set is_active = false
where slug = 'treteknikk';

commit;
