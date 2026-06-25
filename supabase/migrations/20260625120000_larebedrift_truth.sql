-- Phase 4 — Verified Lærebedrift (apprenticeship employer) truth layer (P1 foundation).
-- Charter: docs/architecture/phase-4-verified-larebedrift-employer-layer-charter.md
-- Spec:    docs/architecture/phase-4-verified-larebedrift-employer-layer-p1-ingest-spec.md
--
-- Source-agnostic: rows are ingested at ops time from a verified source
-- (NLR API once an Udir key is granted; Vilbli relay / manual seed as fallback),
-- all ultimately sourced from VIGO. Runtime reads internal DB only — no live
-- external calls. Kept SEPARATE from programme_school_availability (no school/
-- employer mixing). Service role writes; public read (RLS select using(true)).

begin;

create table if not exists public.larebedrift_truth (
  id                     uuid primary key default gen_random_uuid(),
  org_number             text not null,
  legal_name             text not null,
  display_name           text,
  county_code            text not null,
  municipality_code      text not null,
  latitude               numeric,
  longitude              numeric,
  larefag_code           text not null,
  larefag_label          text,
  opplaringskontor_name  text,
  opplaringskontor_org   text,
  -- Only "godkjent" is publishable. Potensielle lærebedrifter MUST NOT enter.
  verification_status    text not null default 'godkjent'
    check (verification_status in ('godkjent')),
  source_reference_url   text not null,
  source_system          text not null
    check (source_system in ('nlr', 'vilbli', 'brreg', 'manual')),
  source_export_date     date,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- One truth row per (employer, fag); re-ingest upserts in place (idempotent).
create unique index if not exists larebedrift_truth_org_fag_uidx
  on public.larebedrift_truth (org_number, larefag_code);

-- Route-engine read path: active employers for a (fag, county) scope.
create index if not exists larebedrift_truth_fag_county_active_idx
  on public.larebedrift_truth (larefag_code, county_code)
  where is_active;

alter table public.larebedrift_truth enable row level security;

drop policy if exists larebedrift_truth_select on public.larebedrift_truth;
create policy larebedrift_truth_select
  on public.larebedrift_truth
  for select
  using (true);

comment on table public.larebedrift_truth is
  'Verified (godkjent) apprenticeship employers per lærefag, sourced from VIGO via NLR/Vilbli/manual seed. Read at recompute/create only; never live-fetched at runtime.';
comment on column public.larebedrift_truth.verification_status is
  'Only "godkjent" is publishable (DB check). Potensielle employers are excluded at ingest.';
comment on column public.larebedrift_truth.source_system is
  'Origin of the ingested row: nlr | vilbli | brreg | manual (all trace back to VIGO).';
comment on column public.larebedrift_truth.is_active is
  'Soft-retire flag: employers no longer in the latest export for a fag are set false, never hard-deleted.';

commit;
