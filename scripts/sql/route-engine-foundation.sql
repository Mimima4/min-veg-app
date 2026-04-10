-- Route Engine Foundation v1

-- =========================
-- study_routes
-- =========================
create table if not exists study_routes (
  id uuid primary key default gen_random_uuid(),

  child_id uuid not null,
  target_profession_id uuid not null,

  status text not null default 'saved',

  current_variant_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_meaningful_change_at timestamptz not null default now(),

  created_by_type text not null,
  created_by_user_id uuid,

  archived_at timestamptz
);

create index if not exists idx_study_routes_child_id on study_routes(child_id);
create index if not exists idx_study_routes_profession_id on study_routes(target_profession_id);

-- =========================
-- study_route_variants
-- =========================
create table if not exists study_route_variants (
  id uuid primary key default gen_random_uuid(),

  route_id uuid not null references study_routes(id) on delete cascade,

  variant_label text,
  variant_reason text,

  is_current boolean not null default false,
  status text not null default 'draft',

  based_on_variant_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  superseded_at timestamptz,

  created_by_type text not null,
  created_by_user_id uuid
);

create index if not exists idx_route_variants_route_id on study_route_variants(route_id);

-- =========================
-- study_route_snapshots
-- =========================
create table if not exists study_route_snapshots (
  id uuid primary key default gen_random_uuid(),

  route_variant_id uuid not null references study_route_variants(id) on delete cascade,

  snapshot_version int not null default 1,
  snapshot_kind text not null,

  generation_reason text,

  stage_context jsonb,
  selected_steps_payload jsonb not null,
  signals_payload jsonb,
  available_professions_payload jsonb,
  alternatives_teaser_payload jsonb,

  generated_at timestamptz not null default now(),
  is_current_snapshot boolean not null default true
);

create index if not exists idx_route_snapshots_variant_id on study_route_snapshots(route_variant_id);

-- =========================
-- study_route_recompute_runs
-- =========================
create table if not exists study_route_recompute_runs (
  id uuid primary key default gen_random_uuid(),

  route_id uuid not null references study_routes(id) on delete cascade,
  route_variant_id uuid,

  trigger_reason text not null,

  triggered_by_type text not null,
  triggered_by_user_id uuid,

  started_at timestamptz not null default now(),
  completed_at timestamptz,

  result_status text,
  new_variant_created boolean,
  new_route_available boolean,

  error_code text,
  error_message text
);

create index if not exists idx_route_recompute_route_id on study_route_recompute_runs(route_id);
