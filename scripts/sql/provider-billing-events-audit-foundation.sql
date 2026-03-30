create extension if not exists pgcrypto;

create table if not exists public.provider_billing_event_audits (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  provider_event_type text null,
  status text not null default 'received' check (
    status in ('received', 'processed', 'failed', 'rejected')
  ),
  signature_mode text not null default 'not_checked' check (
    signature_mode in ('not_checked', 'verified', 'not_configured')
  ),
  signature_verified boolean not null default false,
  webhook_secret_configured boolean not null default false,
  received_headers jsonb not null default '{}'::jsonb,
  raw_body text null,
  parsed_payload jsonb not null default '{}'::jsonb,
  mapped_event_type text null,
  mapped_external_event_id text null,
  mapped_payload jsonb not null default '{}'::jsonb,
  family_account_id uuid null,
  primary_user_id uuid null,
  billing_subscription_event_id uuid null,
  sync_result jsonb not null default '{}'::jsonb,
  error text null,
  received_at timestamptz not null default now(),
  processed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint provider_billing_event_audits_provider_event_unique
    unique (provider, provider_event_id)
);

create index if not exists provider_billing_event_audits_status_idx
  on public.provider_billing_event_audits(status, received_at desc);

create index if not exists provider_billing_event_audits_provider_idx
  on public.provider_billing_event_audits(provider, received_at desc);

create index if not exists provider_billing_event_audits_family_idx
  on public.provider_billing_event_audits(family_account_id, received_at desc);

create or replace function public.set_provider_billing_event_audits_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_provider_billing_event_audits_updated_at
  on public.provider_billing_event_audits;

create trigger trg_provider_billing_event_audits_updated_at
before update on public.provider_billing_event_audits
for each row
execute function public.set_provider_billing_event_audits_updated_at();
