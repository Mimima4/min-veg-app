alter table public.billing_scheduled_plan_changes
  add column if not exists target_current_period_starts_at timestamptz,
  add column if not exists target_current_period_ends_at timestamptz,
  add column if not exists target_next_billing_at timestamptz;

comment on column public.billing_scheduled_plan_changes.target_current_period_starts_at
  is 'Scheduled billing snapshot start that should become active when the scheduled plan change is applied.';

comment on column public.billing_scheduled_plan_changes.target_current_period_ends_at
  is 'Scheduled billing snapshot end that should become active when the scheduled plan change is applied.';

comment on column public.billing_scheduled_plan_changes.target_next_billing_at
  is 'Scheduled next billing timestamp that should become active when the scheduled plan change is applied.';
