-- Min Veg — electrician legacy VGS cleanup batch 2 (Oslo/Bergen/fagskole placeholders)
-- Charter: docs/architecture/phase-0-6-p06-electrician-legacy-vgs-cleanup-charter.md
-- Idempotent: safe to re-run; only touches L-06 … L-08 slugs.
-- Applied: 2026-06-10 (production)
-- Note: electrician-vg2-elenergi-oslo (orphan catalogue slug for Vilbli pilot) is intentionally out of scope.

begin;

delete from profession_program_links
where profession_slug = 'electrician'
  and program_slug in (
    'electrician-vg1-elektro-oslo',
    'electrician-vg2-elenergi-bergen',
    'electrician-fagskole-technical-oslo'
  );

update education_programs
set is_active = false
where slug in (
  'electrician-vg1-elektro-oslo',
  'electrician-vg2-elenergi-bergen',
  'electrician-fagskole-technical-oslo'
);

update education_institutions
set is_active = false
where slug in (
  'videregaende-oslo-electrical',
  'videregaende-bergen-electrical',
  'fagskolen-oslo-technical'
);

commit;

-- Post-check (expect 0 legacy VGS rows for electrician except orphan pilot slugs):
-- select ppl.program_slug, ei.slug, ei.source
-- from profession_program_links ppl
-- join education_programs ep on ep.slug = ppl.program_slug
-- join education_institutions ei on ei.id = ep.institution_id
-- where ppl.profession_slug = 'electrician' and ei.source = 'legacy'
--   and ep.education_level not in ('bachelor','professional_degree','master');
