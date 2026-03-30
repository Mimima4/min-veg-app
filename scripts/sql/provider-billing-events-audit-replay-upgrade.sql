alter table public.provider_billing_event_audits
  add column if not exists replay_count integer not null default 0,
  add column if not exists last_replayed_at timestamptz null;
