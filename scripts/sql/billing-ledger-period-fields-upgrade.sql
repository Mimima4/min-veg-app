alter table public.billing_ledger_entries
  add column if not exists period_start timestamptz,
  add column if not exists period_end timestamptz;

comment on column public.billing_ledger_entries.period_start
  is 'Subscription service period start for accounting/export.';
comment on column public.billing_ledger_entries.period_end
  is 'Subscription service period end for accounting/export.';
