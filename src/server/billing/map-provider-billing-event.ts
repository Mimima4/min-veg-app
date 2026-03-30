import "server-only";

import type {
  BillingSubscriptionCycle,
  BillingSubscriptionEventType,
} from "@/server/billing/record-billing-subscription-event";

export type ProviderBillingEventInput = {
  provider: string;
  providerEventId: string;
  providerEventType: string;
  customerEmail: string;
  internalEventType?: BillingSubscriptionEventType | null;
  planCode?: string | null;
  subscriptionState?: string | null;
  billingCycle?: BillingSubscriptionCycle | null;
  occurredAt?: string | null;
  currentPeriodStartsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  nextBillingAt?: string | null;
  autoRenewEnabled?: boolean | null;
  gracePeriodEndsAt?: string | null;
  paymentFailedAt?: string | null;
  lastPaymentStatus?: string | null;
  canceledAt?: string | null;
  metadata?: Record<string, unknown> | null;
  rawPayload?: Record<string, unknown> | null;
};

export type ProviderMappedBillingEvent = {
  email: string;
  eventType: BillingSubscriptionEventType;
  eventAt: string | null;
  planCode: string | null;
  subscriptionState: string | null;
  billingCycle: BillingSubscriptionCycle | null;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  nextBillingAt: string | null;
  autoRenewEnabled: boolean | null;
  gracePeriodEndsAt: string | null;
  paymentFailedAt: string | null;
  lastPaymentStatus: string | null;
  canceledAt: string | null;
  source: string;
  externalEventId: string;
  payload: Record<string, unknown>;
};

function normalizeRequiredText(value: string | null | undefined, field: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeOptionalLowerText(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeOptionalIso(value: string | null | undefined): string | null {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid datetime value: ${value}`);
  }

  return parsed.toISOString();
}

function inferInternalEventType(
  providerEventType: string
): BillingSubscriptionEventType {
  const normalized = providerEventType.trim().toLowerCase();

  switch (normalized) {
    case "subscription_started_success":
    case "subscription.created":
    case "subscription.activated":
    case "checkout.completed":
    case "checkout.session.completed":
    case "initial_payment_succeeded":
      return "subscription_started_success";

    case "subscription_renewed_success":
    case "subscription.renewed":
    case "invoice.paid":
    case "renewal_payment_succeeded":
    case "recurring_payment_succeeded":
      return "subscription_renewed_success";

    case "payment_failed":
    case "invoice.payment_failed":
    case "payment.failed":
    case "charge.failed":
    case "renewal_payment_failed":
      return "payment_failed";

    case "payment_recovered":
    case "invoice.payment_recovered":
    case "payment.recovered":
    case "charge.recovered":
      return "payment_recovered";

    case "auto_renew_disabled":
    case "subscription.auto_renew_disabled":
    case "subscription.pause_renewal":
      return "auto_renew_disabled";

    case "auto_renew_enabled":
    case "subscription.auto_renew_enabled":
    case "subscription.resume_renewal":
      return "auto_renew_enabled";

    case "cancellation_scheduled":
    case "subscription.cancellation_scheduled":
    case "subscription.cancel_at_period_end":
      return "cancellation_scheduled";

    default:
      throw new Error(
        `Unsupported providerEventType: ${providerEventType}. Pass internalEventType explicitly if this provider event is valid but not mapped yet.`
      );
  }
}

function resolveSubscriptionState(args: {
  internalEventType: BillingSubscriptionEventType;
  explicitState: string | null;
  gracePeriodEndsAt: string | null;
}): string | null {
  if (args.explicitState) {
    return args.explicitState;
  }

  switch (args.internalEventType) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
    case "auto_renew_enabled":
    case "auto_renew_disabled":
      return "active";
    case "payment_failed":
      return args.gracePeriodEndsAt ? "grace_period" : "past_due";
    case "cancellation_scheduled":
      return "canceled";
    default:
      return null;
  }
}

function resolveLastPaymentStatus(args: {
  internalEventType: BillingSubscriptionEventType;
  explicitStatus: string | null;
}): string | null {
  if (args.explicitStatus) {
    return args.explicitStatus;
  }

  switch (args.internalEventType) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
      return "paid";
    case "payment_failed":
      return "failed";
    default:
      return null;
  }
}

export function mapProviderBillingEvent(
  input: ProviderBillingEventInput
): ProviderMappedBillingEvent {
  const provider = normalizeRequiredText(input.provider, "provider").toLowerCase();
  const providerEventId = normalizeRequiredText(
    input.providerEventId,
    "providerEventId"
  );
  const providerEventType = normalizeRequiredText(
    input.providerEventType,
    "providerEventType"
  );
  const email = normalizeRequiredText(input.customerEmail, "customerEmail").toLowerCase();

  const internalEventType =
    input.internalEventType ?? inferInternalEventType(providerEventType);

  const currentPeriodStartsAt = normalizeOptionalIso(input.currentPeriodStartsAt);
  const currentPeriodEndsAt = normalizeOptionalIso(input.currentPeriodEndsAt);
  const nextBillingAt = normalizeOptionalIso(input.nextBillingAt);
  const gracePeriodEndsAt = normalizeOptionalIso(input.gracePeriodEndsAt);
  const paymentFailedAt = normalizeOptionalIso(input.paymentFailedAt);
  const canceledAt = normalizeOptionalIso(input.canceledAt);

  const subscriptionState = resolveSubscriptionState({
    internalEventType,
    explicitState: normalizeOptionalLowerText(input.subscriptionState),
    gracePeriodEndsAt,
  });

  const lastPaymentStatus = resolveLastPaymentStatus({
    internalEventType,
    explicitStatus: normalizeOptionalLowerText(input.lastPaymentStatus),
  });

  return {
    email,
    eventType: internalEventType,
    eventAt: normalizeOptionalIso(input.occurredAt),
    planCode: normalizeOptionalLowerText(input.planCode),
    subscriptionState,
    billingCycle: input.billingCycle ?? null,
    currentPeriodStartsAt,
    currentPeriodEndsAt,
    nextBillingAt,
    autoRenewEnabled:
      typeof input.autoRenewEnabled === "boolean" ? input.autoRenewEnabled : null,
    gracePeriodEndsAt,
    paymentFailedAt:
      paymentFailedAt ??
      (internalEventType === "payment_failed"
        ? normalizeOptionalIso(input.occurredAt)
        : null),
    lastPaymentStatus,
    canceledAt:
      canceledAt ??
      (internalEventType === "cancellation_scheduled"
        ? normalizeOptionalIso(input.occurredAt)
        : null),
    source: `provider:${provider}`,
    externalEventId: `${provider}:${providerEventId}`,
    payload: {
      provider,
      providerEventId,
      providerEventType,
      internalEventType,
      metadata: input.metadata ?? {},
      rawPayload: input.rawPayload ?? {},
    },
  };
}
