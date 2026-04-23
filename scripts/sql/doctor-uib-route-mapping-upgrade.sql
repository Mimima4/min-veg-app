begin;

-- Add Universitetet i Bergen institution if missing
insert into education_institutions (
  id,
  slug,
  name,
  institution_type,
  website_url,
  country_code,
  county_code,
  municipality_code,
  municipality_name,
  is_active,
  nsr_organisasjonsnummer,
  source,
  is_route_relevant,
  is_private_school,
  created_at
)
select
  gen_random_uuid(),
  'uib-bergen',
  'Universitetet i Bergen',
  'higher_education',
  'https://www.uib.no',
  'NO',
  '46',
  '4601',
  'Bergen',
  true,
  null,
  'legacy',
  false,
  false,
  now()
where not exists (
  select 1
  from education_institutions
  where slug = 'uib-bergen'
     or name = 'Universitetet i Bergen'
);

-- Add doctor medicine professional degree at UiB if missing
insert into education_programs (
  id,
  institution_id,
  slug,
  program_code,
  title,
  education_level,
  study_mode,
  duration_years,
  description,
  is_active,
  created_at,
  programme_url
)
select
  gen_random_uuid(),
  ei.id,
  'doctor-medicine-professional-degree-uib',
  'MED-UIB',
  'Profesjonsstudium i medisin – Universitetet i Bergen',
  'professional_degree',
  'full_time',
  6,
  'Profesjonsstudium i medisin ved Universitetet i Bergen.',
  true,
  now(),
  'https://www.uib.no/studier/MEDPROF'
from education_institutions ei
where ei.slug = 'uib-bergen'
  and not exists (
    select 1
    from education_programs ep
    where ep.slug = 'doctor-medicine-professional-degree-uib'
  );

-- Link doctor profession to UiB program if missing
insert into profession_program_links (
  id,
  profession_slug,
  program_slug,
  fit_band,
  note,
  created_at
)
select
  gen_random_uuid(),
  'doctor',
  'doctor-medicine-professional-degree-uib',
  'strong',
  'Sterk profesjonsrute for lege i Bergen.',
  now()
where not exists (
  select 1
  from profession_program_links ppl
  where ppl.profession_slug = 'doctor'
    and ppl.program_slug = 'doctor-medicine-professional-degree-uib'
);

commit;
