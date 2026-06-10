-- Min Veg — electrician legacy VGS cleanup batch 1 (mv-* placeholders)
-- Charter: docs/architecture/phase-0-6-p06-electrician-legacy-vgs-cleanup-charter.md
-- Idempotent: safe to re-run; only touches L-01 … L-05 slugs.
-- Applied: 2026-06-10 (production)

begin;

delete from profession_program_links
where profession_slug = 'electrician'
  and program_slug in (
    'mv-electrician-voc-vg2-elektro-strinda-trondheim',
    'mv-electrician-voc-vg2-elektro-godalen-stavanger',
    'mv-electrician-voc-vg2-elektro-kirkeparken-tromso',
    'mv-electrician-voc-vg2-elektro-kvadraturen-kristiansand',
    'mv-electrician-voc-vg2-elektro-alta-vgs'
  );

update education_programs
set is_active = false
where slug in (
  'mv-electrician-voc-vg2-elektro-strinda-trondheim',
  'mv-electrician-voc-vg2-elektro-godalen-stavanger',
  'mv-electrician-voc-vg2-elektro-kirkeparken-tromso',
  'mv-electrician-voc-vg2-elektro-kvadraturen-kristiansand',
  'mv-electrician-voc-vg2-elektro-alta-vgs'
);

update education_institutions
set is_active = false
where slug in (
  'mv-education-inst-strinda-vgs-trondheim',
  'mv-education-inst-godalen-vgs-stavanger',
  'mv-education-inst-kirkeparken-vgs-tromso',
  'mv-education-inst-kvadraturen-vgs-kristiansand',
  'mv-education-inst-alta-vgs-alta'
);

commit;

-- Post-check (expect 0 active mv-* rows):
-- select count(*) from education_institutions where slug like 'mv-%' and is_active = true;
-- select count(*) from education_programs where slug like 'mv-%' and is_active = true;
