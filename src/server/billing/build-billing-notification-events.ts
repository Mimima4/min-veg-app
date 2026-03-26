import {
    resolveAccountActivation,
    type FamilyActivationSnapshot,
  } from "@/server/billing/resolve-account-activation";
  
  export type BillingNotificationEventType =
    | "trial_ending_6h"
    | "trial_expired"
    | "renewal_7d"
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
  
  type Input = {
    familyAccountId: string;
    primaryUserId: string;
    email: string | null;
    snapshot: FamilyActivationSnapshot;
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
        ...args.payload,
      },
    });
  }
  
  export function buildBillingNotificationEvents({
    familyAccountId,
    primaryUserId,
    email,
    snapshot,
    now = new Date(),
  }: Input): BillingNotificationCandidate[] {
    const activation = resolveAccountActivation(snapshot, now);
    const events: BillingNotificationCandidate[] = [];
  
    const trialEndsAt = parseDate(snapshot.trial_ends_at);
    const nextBillingAt = parseDate(snapshot.next_billing_at);
    const gracePeriodEndsAt = parseDate(snapshot.grace_period_ends_at);
    const paymentFailedAt = parseDate(snapshot.payment_failed_at);
  
    if (activation.subscriptionLifecycleState === "trialing" && trialEndsAt) {
      const sixHoursBeforeTrialEnd = new Date(
        trialEndsAt.getTime() - 6 * 60 * 60 * 1000
      );
  
      if (sixHoursBeforeTrialEnd.getTime() > now.getTime()) {
        pushCandidate(events, {
          familyAccountId,
          primaryUserId,
          email,
          eventType: "trial_ending_6h",
          scheduledFor: sixHoursBeforeTrialEnd,
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
        eventType: "trial_expired",
        scheduledFor: trialEndsAt,
        payload: {
          trialEndsAt: trialEndsAt.toISOString(),
        },
      });
    }
  
    if (
      activation.subscriptionLifecycleState === "active" &&
      nextBillingAt &&
      Boolean(snapshot.auto_renew_enabled)
    ) {
      const sevenDaysBeforeRenewal = new Date(
        nextBillingAt.getTime() - 7 * 24 * 60 * 60 * 1000
      );
  
      if (sevenDaysBeforeRenewal.getTime() > now.getTime()) {
        pushCandidate(events, {
          familyAccountId,
          primaryUserId,
          email,
          eventType: "renewal_7d",
          scheduledFor: sevenDaysBeforeRenewal,
          payload: {
            nextBillingAt: nextBillingAt.toISOString(),
            autoRenewEnabled: true,
          },
        });
      }
    }
  
    if (
      activation.subscriptionLifecycleState === "grace_period" &&
      gracePeriodEndsAt
    ) {
      const twentyFourHoursBeforeGraceEnd = new Date(
        gracePeriodEndsAt.getTime() - 24 * 60 * 60 * 1000
      );
  
      if (twentyFourHoursBeforeGraceEnd.getTime() > now.getTime()) {
        pushCandidate(events, {
          familyAccountId,
          primaryUserId,
          email,
          eventType: "grace_period_ending_24h",
          scheduledFor: twentyFourHoursBeforeGraceEnd,
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