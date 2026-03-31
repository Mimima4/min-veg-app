-- Family partner data access upgrade
-- Goal:
-- allow linked family partner to read family/child data
-- without changing billing ownership or write access rules beyond family-scoped child editing

-- ------------------------------------------------------------
-- family_accounts: allow linked family partner to SELECT family account
-- ------------------------------------------------------------
drop policy if exists "Family partners can view linked family account" on public.family_accounts;

create policy "Family partners can view linked family account"
on public.family_accounts
for select
to authenticated
using (
  exists (
    select 1
    from public.family_partner_links fpl
    where fpl.family_account_id = family_accounts.id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

-- ------------------------------------------------------------
-- child_profiles: allow linked family partner to SELECT/UPDATE/INSERT
-- within the linked family account
-- ------------------------------------------------------------
drop policy if exists "Family partners can view linked child profiles" on public.child_profiles;
create policy "Family partners can view linked child profiles"
on public.child_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.family_partner_links fpl
    where fpl.family_account_id = child_profiles.family_account_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

drop policy if exists "Family partners can update linked child profiles" on public.child_profiles;
create policy "Family partners can update linked child profiles"
on public.child_profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.family_partner_links fpl
    where fpl.family_account_id = child_profiles.family_account_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
)
with check (
  exists (
    select 1
    from public.family_partner_links fpl
    where fpl.family_account_id = child_profiles.family_account_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

drop policy if exists "Family partners can insert linked child profiles" on public.child_profiles;
create policy "Family partners can insert linked child profiles"
on public.child_profiles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.family_partner_links fpl
    where fpl.family_account_id = child_profiles.family_account_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

-- ------------------------------------------------------------
-- child_profession_interests: linked family partner can SELECT/INSERT/DELETE
-- through children in linked family account
-- ------------------------------------------------------------
drop policy if exists "Family partners can view linked child profession interests" on public.child_profession_interests;
create policy "Family partners can view linked child profession interests"
on public.child_profession_interests
for select
to authenticated
using (
  exists (
    select 1
    from public.child_profiles cp
    join public.family_partner_links fpl
      on fpl.family_account_id = cp.family_account_id
    where cp.id = child_profession_interests.child_profile_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

drop policy if exists "Family partners can insert linked child profession interests" on public.child_profession_interests;
create policy "Family partners can insert linked child profession interests"
on public.child_profession_interests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.child_profiles cp
    join public.family_partner_links fpl
      on fpl.family_account_id = cp.family_account_id
    where cp.id = child_profession_interests.child_profile_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

drop policy if exists "Family partners can delete linked child profession interests" on public.child_profession_interests;
create policy "Family partners can delete linked child profession interests"
on public.child_profession_interests
for delete
to authenticated
using (
  exists (
    select 1
    from public.child_profiles cp
    join public.family_partner_links fpl
      on fpl.family_account_id = cp.family_account_id
    where cp.id = child_profession_interests.child_profile_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

-- ------------------------------------------------------------
-- child_saved_education_routes: linked family partner can SELECT/INSERT/DELETE
-- through children in linked family account
-- ------------------------------------------------------------
drop policy if exists "Family partners can view linked child saved routes" on public.child_saved_education_routes;
create policy "Family partners can view linked child saved routes"
on public.child_saved_education_routes
for select
to authenticated
using (
  exists (
    select 1
    from public.child_profiles cp
    join public.family_partner_links fpl
      on fpl.family_account_id = cp.family_account_id
    where cp.id = child_saved_education_routes.child_profile_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

drop policy if exists "Family partners can insert linked child saved routes" on public.child_saved_education_routes;
create policy "Family partners can insert linked child saved routes"
on public.child_saved_education_routes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.child_profiles cp
    join public.family_partner_links fpl
      on fpl.family_account_id = cp.family_account_id
    where cp.id = child_saved_education_routes.child_profile_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);

drop policy if exists "Family partners can delete linked child saved routes" on public.child_saved_education_routes;
create policy "Family partners can delete linked child saved routes"
on public.child_saved_education_routes
for delete
to authenticated
using (
  exists (
    select 1
    from public.child_profiles cp
    join public.family_partner_links fpl
      on fpl.family_account_id = cp.family_account_id
    where cp.id = child_saved_education_routes.child_profile_id
      and fpl.partner_user_id = auth.uid()
      and fpl.status = 'linked'
  )
);
