create table if not exists public.billing_ledger_entries (
  id uuid primary key default gen_random_uuid(),

  family_account_id uuid not null,

  entry_type text not null,
  -- provider_payment_received
  -- scheduled_plan_change_applied
  -- refund_received (later)
  -- adjustment (later)

  direction text not null,
  -- credit | debit | neutral

  amount integer,
  currency text,

  plan_code text,
  billing_cycle text,

  occurred_at timestamptz not null,
  source text not null,

  provider text,
  provider_payment_id text,
  payment_intent_id uuid,

  scheduled_plan_change_id uuid,
  billing_subscription_event_id uuid,

  external_reference text,
  payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_billing_ledger_family_account
  on public.billing_ledger_entries(family_account_id);

create index if not exists idx_billing_ledger_occurred_at
  on public.billing_ledger_entries(occurred_at desc);

create unique index if not exists uq_billing_ledger_external_reference
  on public.billing_ledger_entries(external_reference)
  where external_reference is not null;

create table if not exists public.tripletex_export_queue (
  id uuid primary key default gen_random_uuid(),

  ledger_entry_id uuid not null references public.billing_ledger_entries(id) on delete cascade,

  export_type text not null,
  -- ledger_entry

  status text not null default 'pending',
  -- pending | processing | exported | failed

  attempts integer not null default 0,
  last_attempt_at timestamptz,
  exported_at timestamptz,
  failed_at timestamptz,

  tripletex_reference text,
  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tripletex_export_queue_status
  on public.tripletex_export_queue(status, created_at);

create unique index if not exists uq_tripletex_export_queue_ledger_entry
  on public.tripletex_export_queue(ledger_entry_id);
