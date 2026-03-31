-- Allow linked family partner to read only their own partner-link row.
-- This is needed so downstream RLS policies on family/child data
-- can resolve membership through family_partner_links.

drop policy if exists "Family partners can view own linked partner row" on public.family_partner_links;

create policy "Family partners can view own linked partner row"
on public.family_partner_links
for select
to authenticated
using (
  partner_user_id = auth.uid()
  and status = 'linked'
);
