-- Durable cache for relocation `maybe` Entur PT reach (soft 500 / hard 550 km).
-- Fail-open at runtime if this migration is not yet applied.

create table if not exists public.relocation_maybe_pt_reach_cache (
  home_municipality_code text not null,
  school_municipality_code text not null,
  policy_version text not null,
  admitted boolean not null,
  soft boolean not null,
  pt_network_km double precision,
  duration_sec integer,
  reason text not null,
  computed_at timestamptz not null default now(),
  primary key (home_municipality_code, school_municipality_code, policy_version)
);

create index if not exists relocation_maybe_pt_reach_cache_computed_at_idx
  on public.relocation_maybe_pt_reach_cache (computed_at desc);

comment on table public.relocation_maybe_pt_reach_cache is
  'Cached Entur bus+rail network-km verdicts for relocation maybe admit (policy_version keyed).';
