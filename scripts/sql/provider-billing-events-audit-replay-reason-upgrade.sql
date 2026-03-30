alter table public.provider_billing_event_audits
  add column if not exists last_replay_reason text null;
