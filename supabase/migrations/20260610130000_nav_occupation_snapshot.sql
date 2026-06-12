-- P4-NM-B — materialized NAV / STYRK occupation snapshot (C-NAV-OCCUPATION).
-- Ingest: scripts/run-nav-occupation-snapshot-ingest.mjs (service role).
-- Route read: getCurrentNavOccupationSnapshot — no live arbeidsplassen fetch.

begin;

create table if not exists public.nav_occupation_snapshots (
  snapshot_version integer primary key,
  source_url text not null,
  source_fetched_at timestamptz not null,
  occupation_count integer not null check (occupation_count >= 0),
  path_family_map_version integer,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists nav_occupation_snapshots_one_current_idx
  on public.nav_occupation_snapshots (is_current)
  where is_current = true;

create table if not exists public.nav_occupation_snapshot_rows (
  snapshot_version integer not null
    references public.nav_occupation_snapshots (snapshot_version) on delete cascade,
  styrk_code text not null,
  label text not null,
  level1_code text,
  level1_label text,
  source_reference_url text not null,
  primary key (snapshot_version, styrk_code)
);

create index if not exists idx_nav_occupation_snapshot_rows_styrk_code
  on public.nav_occupation_snapshot_rows (styrk_code);

alter table public.nav_occupation_snapshots enable row level security;
alter table public.nav_occupation_snapshot_rows enable row level security;

drop policy if exists nav_occupation_snapshots_select on public.nav_occupation_snapshots;
create policy nav_occupation_snapshots_select
  on public.nav_occupation_snapshots
  for select
  using (true);

drop policy if exists nav_occupation_snapshot_rows_select on public.nav_occupation_snapshot_rows;
create policy nav_occupation_snapshot_rows_select
  on public.nav_occupation_snapshot_rows
  for select
  using (true);

comment on table public.nav_occupation_snapshots is
  'Versioned NAV STYRK taxonomy snapshots from arbeidsplassen.nav.no/stillinger.';

comment on table public.nav_occupation_snapshot_rows is
  'Occupation rows for a nav_occupation_snapshots version.';

commit;
