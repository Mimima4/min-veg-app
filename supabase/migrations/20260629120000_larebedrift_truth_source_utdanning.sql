-- Phase 4 — Verified Lærebedrift layer: allow source_system = 'utdanning'.
-- Primary ingest source switched to the open Finnlærebedrift API
-- (api.utdanning.no/finnlarebedrift), recommended by Udir NXR service owner:
-- keyless and complete (all godkjent, incl. without a current lærekontrakt),
-- unlike NLR (subset with a running contract). Additive constraint change only.

begin;

alter table public.larebedrift_truth
  drop constraint if exists larebedrift_truth_source_system_check;

alter table public.larebedrift_truth
  add constraint larebedrift_truth_source_system_check
  check (source_system in ('utdanning', 'nlr', 'vilbli', 'brreg', 'manual'));

comment on column public.larebedrift_truth.source_system is
  'Origin of the ingested row: utdanning (Finnlærebedrift open API, primary) | nlr | vilbli | brreg | manual (all trace back to VIGO).';

commit;
