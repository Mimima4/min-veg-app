-- Backfill catalog card fields for carpenter + plumber (match electrician/mechanic shape).
-- Safe to re-run: updates by slug only.

begin;

update professions
set
  title_i18n = '{"nb":"Tømrer","nn":"Tømrar","en":"Carpenter"}'::jsonb,
  summary_i18n = '{"nb":"Bygger og monterer trekonstruksjoner — fra bolig til innredning.","nn":"Byggjer og monterer trekkonstruksjonar — frå bustad til innreiing.","en":"Builds and installs timber structures — from housing to interiors."}'::jsonb,
  education_notes_i18n = '{"nb":"VGS: Bygg- og anleggsteknikk → Tømrerfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Tømrarfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Carpentry. Then apprenticeship and trade certificate."}'::jsonb,
  interest_tags = '["building","technology","nature"]'::jsonb,
  strength_tags = '["practical_precision","structured_work","persistence"]'::jsonb,
  development_focus_tags = '["safety_awareness","manual_precision","tool_confidence"]'::jsonb,
  school_subject_tags = '["mathematics","technology","science"]'::jsonb,
  key_skills = '["timber construction","manual skills","attention to detail","problem solving"]'::jsonb,
  avg_salary_nok = 555000
where slug = 'carpenter';

update professions
set
  title_i18n = '{"nb":"Rørlegger","nn":"Røyrleggjar","en":"Plumber"}'::jsonb,
  summary_i18n = '{"nb":"Installerer og vedlikeholder rør, sanitær og varmeanlegg.","nn":"Installerer og vedlikeheld rør, sanitær og varmeanlegg.","en":"Installs and maintains pipes, plumbing and heating systems."}'::jsonb,
  education_notes_i18n = '{"nb":"VGS: Bygg- og anleggsteknikk → Rørleggerfaget. Deretter lære og fagbrev.","nn":"VGS: Bygg- og anleggsteknikk → Røyrleggjarfaget. Deretter lære og fagbrev.","en":"Upper secondary: Building and construction → Plumbing. Then apprenticeship and trade certificate."}'::jsonb,
  interest_tags = '["building","technology","nature"]'::jsonb,
  strength_tags = '["practical_precision","structured_work","persistence"]'::jsonb,
  development_focus_tags = '["safety_awareness","technical_routines","fault_finding"]'::jsonb,
  school_subject_tags = '["mathematics","technology","science"]'::jsonb,
  key_skills = '["pipe installation","troubleshooting","practical work","safety awareness"]'::jsonb,
  avg_salary_nok = 575000
where slug = 'plumber';

commit;
