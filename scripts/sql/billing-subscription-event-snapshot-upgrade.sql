alter table public.billing_subscription_events
  add column if not exists plan_code text,
  add column if not exists subscription_state text,
  add column if not exists next_billing_at timestamptz,
  add column if not exists auto_renew_enabled boolean,
  add column if not exists grace_period_ends_at timestamptz,
  add column if not exists payment_failed_at timestamptz,
  add column if not exists last_payment_status text,
  add column if not exists canceled_at timestamptz;

update public.billing_subscription_events
set
  plan_code = coalesce(
    plan_code,
    nullif(payload ->> 'planCode', '')
  ),
  subscription_state = coalesce(
    subscription_state,
    nullif(payload ->> 'subscriptionState', ''),
    case event_type
      when 'subscription_started_success' then 'active'
      when 'subscription_renewed_success' then 'active'
      when 'payment_recovered' then 'active'
      when 'payment_failed' then 'past_due'
      when 'cancellation_scheduled' then 'canceled'
      else null
    end
  ),
  next_billing_at = coalesce(
    next_billing_at,
    case
      when coalesce(payload ->> 'nextBillingAt', '') <> ''
        then (payload ->> 'nextBillingAt')::timestamptz
      else null
    end
  ),
  auto_renew_enabled = coalesce(
    auto_renew_enabled,
    case
      when payload ? 'autoRenewEnabled' then (payload ->> 'autoRenewEnabled')::boolean
      when event_type = 'auto_renew_disabled' then false
      when event_type = 'auto_renew_enabled' then true
      when event_type = 'cancellation_scheduled' then false
      else null
    end
  ),
  grace_period_ends_at = coalesce(
    grace_period_ends_at,
    case
      when coalesce(payload ->> 'gracePeriodEndsAt', '') <> ''
        then (payload ->> 'gracePeriodEndsAt')::timestamptz
      else null
    end
  ),
  payment_failed_at = coalesce(
    payment_failed_at,
    case
      when coalesce(payload ->> 'paymentFailedAt', '') <> ''
        then (payload ->> 'paymentFailedAt')::timestamptz
      else null
    end
  ),
  last_payment_status = coalesce(
    last_payment_status,
    nullif(payload ->> 'lastPaymentStatus', '')
  ),
  canceled_at = coalesce(
    canceled_at,
    case
      when coalesce(payload ->> 'canceledAt', '') <> ''
        then (payload ->> 'canceledAt')::timestamptz
      else null
    end
  );

create index if not exists billing_subscription_events_family_projection_idx
  on public.billing_subscription_events(family_account_id, event_at desc, created_at desc);
