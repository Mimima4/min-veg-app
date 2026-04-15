-- Official-source admission and requirements realism foundation.
create table if not exists route_admission_realism_records (
  id uuid primary key default gen_random_uuid(),

  profession_slug text,
  program_slug text not null,
  institution_id uuid,

  source_family text not null,
  source_url text not null,
  source_label text not null,

  collected_at timestamptz not null,
  effective_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  review_status text not null default 'pending',
  confidence_level text not null default 'low',

  quota_payload jsonb,
  requirements_payload jsonb,
  thresholds_payload jsonb,
  eligibility_payload jsonb,
  notes_payload jsonb,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_route_admission_realism_program
on route_admission_realism_records(program_slug);

create index if not exists idx_route_admission_realism_institution
on route_admission_realism_records(institution_id);

create index if not exists idx_route_admission_realism_profession
on route_admission_realism_records(profession_slug);

create index if not exists idx_route_admission_realism_review
on route_admission_realism_records(review_status, confidence_level);

create index if not exists idx_route_admission_realism_active
on route_admission_realism_records(is_active, effective_at, collected_at);
