alter table public.billing_ledger_entries
  add column if not exists gross_amount integer,
  add column if not exists net_amount integer,
  add column if not exists mva_amount integer,
  add column if not exists mva_rate numeric(6,4),
  add column if not exists mva_code text,
  add column if not exists customer_type text,
  add column if not exists customer_org_number text;

comment on column public.billing_ledger_entries.gross_amount
  is 'Total amount including VAT/MVA in minor units.';
comment on column public.billing_ledger_entries.net_amount
  is 'Net revenue amount excluding VAT/MVA in minor units.';
comment on column public.billing_ledger_entries.mva_amount
  is 'VAT/MVA amount in minor units.';
comment on column public.billing_ledger_entries.mva_rate
  is 'Applied VAT/MVA rate, for example 0.25.';
comment on column public.billing_ledger_entries.mva_code
  is 'Accounting VAT code for Tripletex/export mapping.';
comment on column public.billing_ledger_entries.customer_type
  is 'b2b or b2c.';
comment on column public.billing_ledger_entries.customer_org_number
  is 'Customer organization number when available.';
