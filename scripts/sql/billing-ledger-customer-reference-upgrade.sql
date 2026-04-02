alter table public.billing_ledger_entries
  add column if not exists customer_reference text;

comment on column public.billing_ledger_entries.customer_reference
  is 'Internal customer reference for export, used for both B2B and B2C identification.';
