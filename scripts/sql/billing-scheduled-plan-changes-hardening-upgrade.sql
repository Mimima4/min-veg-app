alter table public.billing_scheduled_plan_changes
  add column if not exists canceled_at timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists applied_at timestamptz,
  add column if not exists applied_subscription_event_id uuid;

comment on column public.billing_scheduled_plan_changes.canceled_at
  is 'Timestamp when the scheduled plan change was canceled or replaced.';

comment on column public.billing_scheduled_plan_changes.cancel_reason
  is 'Why the scheduled plan change was canceled or replaced.';

comment on column public.billing_scheduled_plan_changes.applied_at
  is 'Timestamp when the scheduled plan change was actually applied.';

comment on column public.billing_scheduled_plan_changes.applied_subscription_event_id
  is 'billing_subscription_events.id created when the scheduled plan change was applied.';
