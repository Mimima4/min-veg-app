create table if not exists public.billing_revenue_schedule (
  id uuid primary key default gen_random_uuid(),

  ledger_entry_id uuid not null references public.billing_ledger_entries(id) on delete cascade,
  family_account_id uuid not null,

  schedule_type text not null,
  -- monthly_subscription
  -- yearly_subscription
  -- manual_adjustment

  period_index integer not null default 1,
  period_count integer not null default 1,

  period_start timestamptz not null,
  period_end timestamptz not null,

  recognition_amount integer not null,
  currency text not null,

  status text not null default 'scheduled',
  -- scheduled | recognized | canceled

  recognized_at timestamptz,
  payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_revenue_schedule_ledger
  on public.billing_revenue_schedule(ledger_entry_id);

create index if not exists idx_billing_revenue_schedule_family
  on public.billing_revenue_schedule(family_account_id);

create index if not exists idx_billing_revenue_schedule_status_period
  on public.billing_revenue_schedule(status, period_start);

create unique index if not exists uq_billing_revenue_schedule_period
  on public.billing_revenue_schedule(ledger_entry_id, period_index);
