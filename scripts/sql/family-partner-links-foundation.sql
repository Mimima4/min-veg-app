create table if not exists public.family_partner_links (
  id uuid primary key default gen_random_uuid(),
  family_account_id uuid not null references public.family_accounts(id) on delete cascade,
  primary_user_id uuid not null references auth.users(id) on delete cascade,
  partner_email text not null,
  partner_user_id uuid null references auth.users(id) on delete set null,
  status text not null default 'pending_link' check (status in ('pending_link', 'linked')),
  replace_used boolean not null default false,
  invited_at timestamptz not null default now(),
  linked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint family_partner_links_family_account_unique unique (family_account_id)
);

create index if not exists family_partner_links_partner_email_idx
  on public.family_partner_links (lower(partner_email));

create index if not exists family_partner_links_primary_user_idx
  on public.family_partner_links (primary_user_id);

create or replace function public.set_family_partner_links_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

drop trigger if exists trg_family_partner_links_updated_at on public.family_partner_links;

create trigger trg_family_partner_links_updated_at
before update on public.family_partner_links
for each row
execute function public.set_family_partner_links_updated_at();

alter table public.family_partner_links enable row level security;

drop policy if exists "Users can view own family partner link" on public.family_partner_links;
create policy "Users can view own family partner link"
on public.family_partner_links
for select
to authenticated
using (auth.uid() = primary_user_id);

drop policy if exists "Users can insert own family partner link" on public.family_partner_links;
create policy "Users can insert own family partner link"
on public.family_partner_links
for insert
to authenticated
with check (auth.uid() = primary_user_id);

drop policy if exists "Users can update own family partner link" on public.family_partner_links;
create policy "Users can update own family partner link"
on public.family_partner_links
for update
to authenticated
using (auth.uid() = primary_user_id)
with check (auth.uid() = primary_user_id);
