create extension if not exists pgcrypto;

create table if not exists public.billing_subscription_events (
  id uuid primary key default gen_random_uuid(),
  family_account_id uuid not null references public.family_accounts(id) on delete cascade,
  primary_user_id uuid not null,
  event_type text not null check (
    event_type in (
      'subscription_started_success',
      'subscription_renewed_success',
      'payment_failed',
      'payment_recovered',
      'auto_renew_disabled',
      'auto_renew_enabled',
      'cancellation_scheduled'
    )
  ),
  event_at timestamptz not null default now(),
  current_period_starts_at timestamptz null,
  current_period_ends_at timestamptz null,
  billing_cycle text null check (
    billing_cycle in ('monthly', 'yearly')
  ),
  source text not null default 'system',
  external_event_id text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists billing_subscription_events_external_event_idx
  on public.billing_subscription_events(external_event_id)
  where external_event_id is not null;

create index if not exists billing_subscription_events_family_idx
  on public.billing_subscription_events(family_account_id, event_at desc);

create index if not exists billing_subscription_events_user_idx
  on public.billing_subscription_events(primary_user_id, event_at desc);

create or replace function public.set_billing_subscription_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_billing_subscription_events_updated_at
  on public.billing_subscription_events;

create trigger trg_billing_subscription_events_updated_at
before update on public.billing_subscription_events
for each row
execute function public.set_billing_subscription_events_updated_at();