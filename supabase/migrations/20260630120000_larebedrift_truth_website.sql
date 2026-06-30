-- Verified lærebedrift layer (P4): optional employer website.
-- Captured at ingest from Brønnøysund `hjemmeside` when the employer has one.
-- When absent, the route reader falls back to the authoritative Brønnøysund
-- entity page so every employer always has a "learn more / contact" link.
alter table public.larebedrift_truth
  add column if not exists website text;
