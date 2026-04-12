-- Min Veg
-- Education / institution realism audit
-- Non-destructive read-only audit for current data contour

-- 1) High-level counts
select 'professions' as block, count(*) as total
from professions
where is_active = true

union all

select 'profession_program_links' as block, count(*) as total
from profession_program_links

union all

select 'education_programs' as block, count(*) as total
from education_programs
where is_active = true

union all

select 'education_institutions' as block, count(*) as total
from education_institutions
where is_active = true;

-- 2) Professions with zero linked programs
select
  p.slug as profession_slug,
  coalesce(p.title_i18n->>'en', p.title_i18n->>'nb', p.slug) as profession_title
from professions p
left join profession_program_links ppl
  on ppl.profession_slug = p.slug
where p.is_active = true
group by p.slug, p.title_i18n
having count(ppl.program_slug) = 0
order by profession_slug;

-- 3) Broken links: profession_program_links -> missing or inactive programs
select
  ppl.profession_slug,
  ppl.program_slug,
  ep.slug as matched_program_slug,
  ep.is_active as matched_program_active
from profession_program_links ppl
left join education_programs ep
  on ep.slug = ppl.program_slug
where ep.slug is null
   or ep.is_active is distinct from true
order by ppl.profession_slug, ppl.program_slug;

-- 4) Broken links: education_programs -> missing or inactive institutions
select
  ep.slug as program_slug,
  ep.title as program_title,
  ep.institution_id,
  ei.id as matched_institution_id,
  ei.is_active as matched_institution_active
from education_programs ep
left join education_institutions ei
  on ei.id = ep.institution_id
where ep.is_active = true
  and (
    ei.id is null
    or ei.is_active is distinct from true
  )
order by ep.slug;

-- 5) Program coverage per profession
select
  ppl.profession_slug,
  count(*) as linked_programs,
  count(*) filter (where ppl.fit_band = 'strong') as strong_links,
  count(*) filter (where ppl.fit_band = 'broader') as broader_links
from profession_program_links ppl
group by ppl.profession_slug
order by linked_programs asc, ppl.profession_slug asc;

-- 6) Institution coverage by municipality / county
select
  county_code,
  municipality_code,
  municipality_name,
  count(*) as active_institutions
from education_institutions
where is_active = true
group by county_code, municipality_code, municipality_name
order by county_code, municipality_name;

-- 7) Program coverage by education level
select
  education_level,
  count(*) as active_programs
from education_programs
where is_active = true
group by education_level
order by education_level;

-- 8) Route-target readiness view:
-- professions that have at least 1 linked active program
-- and that program has an active institution
select
  p.slug as profession_slug,
  coalesce(p.title_i18n->>'en', p.title_i18n->>'nb', p.slug) as profession_title,
  count(distinct ep.slug) as active_programs_with_active_institutions
from professions p
left join profession_program_links ppl
  on ppl.profession_slug = p.slug
left join education_programs ep
  on ep.slug = ppl.program_slug
 and ep.is_active = true
left join education_institutions ei
  on ei.id = ep.institution_id
 and ei.is_active = true
where p.is_active = true
group by p.slug, p.title_i18n
order by active_programs_with_active_institutions asc, profession_slug asc;

-- 9) Candidate professions for Electrician / Doctor manual validation
-- We do not assume final slugs. This helps find the exact rows first.
select
  p.slug,
  coalesce(p.title_i18n->>'en', p.title_i18n->>'nb', p.slug) as profession_title
from professions p
where p.is_active = true
  and (
    lower(p.slug) like '%elect%'
    or lower(p.slug) like '%doctor%'
    or lower(coalesce(p.title_i18n->>'en', '')) like '%electric%'
    or lower(coalesce(p.title_i18n->>'en', '')) like '%doctor%'
    or lower(coalesce(p.title_i18n->>'nb', '')) like '%elektr%'
    or lower(coalesce(p.title_i18n->>'nb', '')) like '%lege%'
  )
order by p.slug;

-- 10) Top active institutions with most active programs
select
  ei.slug as institution_slug,
  ei.name as institution_name,
  ei.municipality_name,
  ei.county_code,
  count(ep.slug) as active_program_count
from education_institutions ei
left join education_programs ep
  on ep.institution_id = ei.id
 and ep.is_active = true
where ei.is_active = true
group by ei.slug, ei.name, ei.municipality_name, ei.county_code
order by active_program_count desc, ei.name asc;