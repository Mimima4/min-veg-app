alter table public.tripletex_customer_links
  add column if not exists sync_status text not null default 'pending',
  add column if not exists last_error text null;
