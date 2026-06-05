-- Locale-specific official institution display names (nb from NSR; se from Vilbli slash aliases).
alter table education_institutions
  add column if not exists name_i18n jsonb;

comment on column education_institutions.name_i18n is
  'Locale-specific official display names. nb from NSR; se from Vilbli slash aliases when available.';

alter table education_institutions
  drop constraint if exists chk_education_institutions_name_i18n_object;

alter table education_institutions
  add constraint chk_education_institutions_name_i18n_object
  check (name_i18n is null or jsonb_typeof(name_i18n) = 'object');
