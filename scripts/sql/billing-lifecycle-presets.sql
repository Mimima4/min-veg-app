-- Billing lifecycle presets for fast testing
-- Usage:
-- 1. Open this file
-- 2. Change target_email if needed
-- 3. Change preset_name to one of:
--    - paid_active
--    - trial_active
--    - trial_expired
--    - grace_period
--    - past_due
--    - canceled_with_access
--    - canceled_ended
-- 4. Copy the whole file into Supabase SQL Editor and run it
-- 5. Then check the result queries at the bottom
-- 6. If needed, open /nb/admin/dashboard and click "Sync billing events"

do $$
declare
  target_email text := 'lenkevich85@gmail.com';
  preset_name text := 'paid_active';

  target_user_id uuid;
  existing_family_id uuid;

  user_entry_source text := 'paid';

  v_plan_type text := 'family_plus';
  v_plan_code text := 'family_plus';
  v_status text := 'active';
  v_subscription_state text := 'active';
  v_entry_source text := 'paid';
  v_activation_source text := 'self_serve_paid';
  v_max_children integer := 6;

  v_trial_used boolean := true;
  v_trial_started_at timestamptz := null;
  v_trial_ends_at timestamptz := null;

  v_current_period_starts_at timestamptz := now();
  v_current_period_ends_at timestamptz := now() + interval '30 days';
  v_next_billing_at timestamptz := now() + interval '30 days';

  v_auto_renew_enabled boolean := true;
  v_grace_period_ends_at timestamptz := null;
  v_payment_failed_at timestamptz := null;
  v_last_payment_status text := 'paid';
  v_canceled_at timestamptz := null;
begin
  select id
  into target_user_id
  from auth.users
  where email = target_email
  limit 1;

  if target_user_id is null then
    raise exception 'User with email % not found in auth.users', target_email;
  end if;

  case preset_name
    when 'paid_active' then
      user_entry_source := 'paid';

      v_plan_type := 'family_plus';
      v_plan_code := 'family_plus';
      v_status := 'active';
      v_subscription_state := 'active';
      v_entry_source := 'paid';
      v_activation_source := 'self_serve_paid';
      v_max_children := 6;

      v_trial_used := true;
      v_trial_started_at := null;
      v_trial_ends_at := null;

      v_current_period_starts_at := now();
      v_current_period_ends_at := now() + interval '30 days';
      v_next_billing_at := now() + interval '30 days';

      v_auto_renew_enabled := true;
      v_grace_period_ends_at := null;
      v_payment_failed_at := null;
      v_last_payment_status := 'paid';
      v_canceled_at := null;

    when 'trial_active' then
      user_entry_source := 'trial';

      v_plan_type := 'trial';
      v_plan_code := 'trial';
      v_status := 'active';
      v_subscription_state := 'trialing';
      v_entry_source := 'trial';
      v_activation_source := 'self_serve_trial';
      v_max_children := 2;

      v_trial_used := true;
      v_trial_started_at := now() - interval '2 days 18 hours';
      v_trial_ends_at := now() + interval '5 hours 30 minutes';

      v_current_period_starts_at := null;
      v_current_period_ends_at := null;
      v_next_billing_at := null;

      v_auto_renew_enabled := false;
      v_grace_period_ends_at := null;
      v_payment_failed_at := null;
      v_last_payment_status := 'not_applicable';
      v_canceled_at := null;

    when 'trial_expired' then
      user_entry_source := 'trial';

      v_plan_type := 'trial';
      v_plan_code := 'trial';
      v_status := 'expired';
      v_subscription_state := 'trial_expired';
      v_entry_source := 'trial';
      v_activation_source := 'self_serve_trial';
      v_max_children := 2;

      v_trial_used := true;
      v_trial_started_at := now() - interval '4 days';
      v_trial_ends_at := now() - interval '1 hour';

      v_current_period_starts_at := null;
      v_current_period_ends_at := null;
      v_next_billing_at := null;

      v_auto_renew_enabled := false;
      v_grace_period_ends_at := null;
      v_payment_failed_at := null;
      v_last_payment_status := 'not_applicable';
      v_canceled_at := null;

    when 'grace_period' then
      user_entry_source := 'paid';

      v_plan_type := 'family_plus';
      v_plan_code := 'family_plus';
      v_status := 'grace_period';
      v_subscription_state := 'grace_period';
      v_entry_source := 'paid';
      v_activation_source := 'self_serve_paid';
      v_max_children := 6;

      v_trial_used := true;
      v_trial_started_at := null;
      v_trial_ends_at := null;

      v_current_period_starts_at := now() - interval '29 days';
      v_current_period_ends_at := now() + interval '7 days';
      v_next_billing_at := now() + interval '7 days';

      v_auto_renew_enabled := true;
      v_grace_period_ends_at := now() + interval '24 hours';
      v_payment_failed_at := now() - interval '1 hour';
      v_last_payment_status := 'failed';
      v_canceled_at := null;

    when 'past_due' then
      user_entry_source := 'paid';

      v_plan_type := 'family_plus';
      v_plan_code := 'family_plus';
      v_status := 'past_due';
      v_subscription_state := 'past_due';
      v_entry_source := 'paid';
      v_activation_source := 'self_serve_paid';
      v_max_children := 6;

      v_trial_used := true;
      v_trial_started_at := null;
      v_trial_ends_at := null;

      v_current_period_starts_at := now() - interval '40 days';
      v_current_period_ends_at := now() - interval '2 days';
      v_next_billing_at := now() - interval '2 days';

      v_auto_renew_enabled := true;
      v_grace_period_ends_at := now() - interval '1 hour';
      v_payment_failed_at := now() - interval '2 days';
      v_last_payment_status := 'failed';
      v_canceled_at := null;

    when 'canceled_with_access' then
      user_entry_source := 'paid';

      v_plan_type := 'family_plus';
      v_plan_code := 'family_plus';
      v_status := 'canceled';
      v_subscription_state := 'canceled';
      v_entry_source := 'paid';
      v_activation_source := 'self_serve_paid';
      v_max_children := 6;

      v_trial_used := true;
      v_trial_started_at := null;
      v_trial_ends_at := null;

      v_current_period_starts_at := now() - interval '20 days';
      v_current_period_ends_at := now() + interval '10 days';
      v_next_billing_at := now() + interval '10 days';

      v_auto_renew_enabled := false;
      v_grace_period_ends_at := null;
      v_payment_failed_at := null;
      v_last_payment_status := 'paid';
      v_canceled_at := now() - interval '1 day';

    when 'canceled_ended' then
      user_entry_source := 'paid';

      v_plan_type := 'family_plus';
      v_plan_code := 'family_plus';
      v_status := 'canceled';
      v_subscription_state := 'canceled';
      v_entry_source := 'paid';
      v_activation_source := 'self_serve_paid';
      v_max_children := 6;

      v_trial_used := true;
      v_trial_started_at := null;
      v_trial_ends_at := null;

      v_current_period_starts_at := now() - interval '40 days';
      v_current_period_ends_at := now() - interval '1 day';
      v_next_billing_at := now() - interval '1 day';

      v_auto_renew_enabled := false;
      v_grace_period_ends_at := null;
      v_payment_failed_at := null;
      v_last_payment_status := 'paid';
      v_canceled_at := now() - interval '2 days';

    else
      raise exception 'Unknown preset_name: %', preset_name;
  end case;

  update auth.users
  set
    raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object(
        'role', 'platform_admin',
        'access_scope', 'full',
        'admin_access', true
      ),
    raw_user_meta_data =
      coalesce(raw_user_meta_data, '{}'::jsonb) ||
      jsonb_build_object(
        'entry_source', user_entry_source,
        'trial_used', v_trial_used
      )
  where id = target_user_id;

  select id
  into existing_family_id
  from public.family_accounts
  where primary_user_id = target_user_id
  limit 1;

  if existing_family_id is null then
    insert into public.family_accounts (
      primary_user_id,
      plan_type,
      plan_code,
      status,
      subscription_state,
      entry_source,
      activation_source,
      max_children,
      trial_used,
      trial_started_at,
      trial_ends_at,
      current_period_starts_at,
      current_period_ends_at,
      next_billing_at,
      auto_renew_enabled,
      grace_period_ends_at,
      payment_failed_at,
      last_payment_status,
      canceled_at
    )
    values (
      target_user_id,
      v_plan_type,
      v_plan_code,
      v_status,
      v_subscription_state,
      v_entry_source,
      v_activation_source,
      v_max_children,
      v_trial_used,
      v_trial_started_at,
      v_trial_ends_at,
      v_current_period_starts_at,
      v_current_period_ends_at,
      v_next_billing_at,
      v_auto_renew_enabled,
      v_grace_period_ends_at,
      v_payment_failed_at,
      v_last_payment_status,
      v_canceled_at
    );
  else
    update public.family_accounts
    set
      plan_type = v_plan_type,
      plan_code = v_plan_code,
      status = v_status,
      subscription_state = v_subscription_state,
      entry_source = v_entry_source,
      activation_source = v_activation_source,
      max_children = v_max_children,
      trial_used = v_trial_used,
      trial_started_at = v_trial_started_at,
      trial_ends_at = v_trial_ends_at,
      current_period_starts_at = v_current_period_starts_at,
      current_period_ends_at = v_current_period_ends_at,
      next_billing_at = v_next_billing_at,
      auto_renew_enabled = v_auto_renew_enabled,
      grace_period_ends_at = v_grace_period_ends_at,
      payment_failed_at = v_payment_failed_at,
      last_payment_status = v_last_payment_status,
      canceled_at = v_canceled_at
    where id = existing_family_id;
  end if;

  raise notice 'Applied preset % for %', preset_name, target_email;
end $$;

select
  au.email,
  au.raw_app_meta_data,
  au.raw_user_meta_data,
  fa.plan_type,
  fa.plan_code,
  fa.status,
  fa.subscription_state,
  fa.entry_source,
  fa.activation_source,
  fa.auto_renew_enabled,
  fa.trial_started_at,
  fa.trial_ends_at,
  fa.current_period_ends_at,
  fa.next_billing_at,
  fa.grace_period_ends_at,
  fa.payment_failed_at,
  fa.last_payment_status,
  fa.canceled_at
from auth.users au
left join public.family_accounts fa
  on fa.primary_user_id = au.id
where au.email = 'lenkevich85@gmail.com';

select
  event_type,
  status,
  scheduled_for,
  dedupe_key,
  created_at
from public.billing_notification_events
where primary_user_id = (
  select id
  from auth.users
  where email = 'lenkevich85@gmail.com'
  limit 1
)
order by created_at desc, scheduled_for asc;-- Add billing lifecycle SQL presets here.
