import {
  resolveAccountActivation,
  type FamilyActivationSnapshot,
} from "@/server/billing/resolve-account-activation";

export type BillingNotificationEventType =
  | "trial_ending_6h"
  | "trial_expired"
  | "subscription_ending_3d"
  | "subscription_ending_7d"
  | "subscription_started_success"
  | "subscription_renewed_success"
  | "payment_failed"
  | "grace_period_ending_24h";

export type BillingNotificationCandidate = {
  familyAccountId: string;
  primaryUserId: string;
  eventType: BillingNotificationEventType;
  dedupeKey: string;
  scheduledFor: string;
  payload: Record<string, unknown>;
};

type ExtendedSnapshot = FamilyActivationSnapshot & {
  current_period_starts_at?: string | null;
  current_period_ends_at?: string | null;
};

type Input = {
  familyAccountId: string;
  primaryUserId: string;
  email: string | null;
  recipientName: string | null;
  snapshot: ExtendedSnapshot;
  now?: Date;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function makeDedupeKey(
  familyAccountId: string,
  eventType: BillingNotificationEventType,
  scheduledForIso: string
): string {
  return `${familyAccountId}:${eventType}:${scheduledForIso}`;
}

function pushCandidate(
  bucket: BillingNotificationCandidate[],
  args: {
    familyAccountId: string;
    primaryUserId: string;
    email: string | null;
    recipientName: string | null;
    eventType: BillingNotificationEventType;
    scheduledFor: Date;
    payload?: Record<string, unknown>;
  }
) {
  const scheduledForIso = args.scheduledFor.toISOString();

  bucket.push({
    familyAccountId: args.familyAccountId,
    primaryUserId: args.primaryUserId,
    eventType: args.eventType,
    dedupeKey: makeDedupeKey(
      args.familyAccountId,
      args.eventType,
      scheduledForIso
    ),
    scheduledFor: scheduledForIso,
    payload: {
      email: args.email,
      recipientName: args.recipientName,
      ...args.payload,
    },
  });
}

function getDurationDays(start: Date | null, end: Date | null): number | null {
  if (!start || !end) {
    return null;
  }

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

function getReminderSchedule({
  eventTime,
  reminderMs,
  now,
}: {
  eventTime: Date;
  reminderMs: number;
  now: Date;
}): Date | null {
  const reminderTime = new Date(eventTime.getTime() - reminderMs);

  if (eventTime.getTime() <= now.getTime()) {
    return null;
  }

  if (reminderTime.getTime() > now.getTime()) {
    return reminderTime;
  }

  return now;
}

export function buildBillingNotificationEvents({
  familyAccountId,
  primaryUserId,
  email,
  recipientName,
  snapshot,
  now = new Date(),
}: Input): BillingNotificationCandidate[] {
  const activation = resolveAccountActivation(snapshot, now);
  const events: BillingNotificationCandidate[] = [];

  const trialEndsAt = parseDate(snapshot.trial_ends_at);
  const gracePeriodEndsAt = parseDate(snapshot.grace_period_ends_at);
  const paymentFailedAt = parseDate(snapshot.payment_failed_at);
  const currentPeriodStartsAt = parseDate(snapshot.current_period_starts_at);
  const currentPeriodEndsAt = parseDate(snapshot.current_period_ends_at);

  const autoRenewEnabled = Boolean(snapshot.auto_renew_enabled);

  if (activation.subscriptionLifecycleState === "trialing" && trialEndsAt) {
    const scheduledFor = getReminderSchedule({
      eventTime: trialEndsAt,
      reminderMs: 6 * 60 * 60 * 1000,
      now,
    });

    if (scheduledFor) {
      pushCandidate(events, {
        familyAccountId,
        primaryUserId,
        email,
        recipientName,
        eventType: "trial_ending_6h",
        scheduledFor,
        payload: {
          trialEndsAt: trialEndsAt.toISOString(),
        },
      });
    }
  }

  if (activation.subscriptionLifecycleState === "trial_expired" && trialEndsAt) {
    pushCandidate(events, {
      familyAccountId,
      primaryUserId,
      email,
      recipientName,
      eventType: "trial_expired",
      scheduledFor: trialEndsAt,
      payload: {
        trialEndsAt: trialEndsAt.toISOString(),
      },
    });
  }

  if (
    activation.hasActiveAccess &&
    !autoRenewEnabled &&
    currentPeriodEndsAt
  ) {
    const durationDays = getDurationDays(currentPeriodStartsAt, currentPeriodEndsAt);
    const isMonthly = durationDays !== null ? durationDays <= 45 : true;

    const scheduledFor = getReminderSchedule({
      eventTime: currentPeriodEndsAt,
      reminderMs: isMonthly
        ? 3 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000,
      now,
    });

    if (scheduledFor) {
      pushCandidate(events, {
        familyAccountId,
        primaryUserId,
        email,
        recipientName,
        eventType: isMonthly
          ? "subscription_ending_3d"
          : "subscription_ending_7d",
        scheduledFor,
        payload: {
          currentPeriodEndsAt: currentPeriodEndsAt.toISOString(),
          autoRenewEnabled: false,
          planCode: snapshot.plan_code ?? null,
          billingCycle: isMonthly ? "monthly" : "yearly",
        },
      });
    }
  }

  if (
    activation.subscriptionLifecycleState === "grace_period" &&
    gracePeriodEndsAt
  ) {
    const scheduledFor = getReminderSchedule({
      eventTime: gracePeriodEndsAt,
      reminderMs: 24 * 60 * 60 * 1000,
      now,
    });

    if (scheduledFor) {
      pushCandidate(events, {
        familyAccountId,
        primaryUserId,
        email,
        recipientName,
        eventType: "grace_period_ending_24h",
        scheduledFor,
        payload: {
          gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
        },
      });
    }
  }

  if (
    activation.subscriptionLifecycleState === "past_due" &&
    paymentFailedAt
  ) {
    pushCandidate(events, {
      familyAccountId,
      primaryUserId,
      email,
      recipientName,
      eventType: "payment_failed",
      scheduledFor: paymentFailedAt,
      payload: {
        paymentFailedAt: paymentFailedAt.toISOString(),
        lastPaymentStatus: activation.lastPaymentStatus,
      },
    });
  }

  return events;
}