import "server-only";

export type BillingNotificationEventType =
  | "trial_ending_6h"
  | "trial_expired"
  | "renewal_7d"
  | "payment_failed"
  | "grace_period_ending_24h";

export type BillingNotificationRow = {
  id: string;
  primary_user_id: string;
  family_account_id: string;
  event_type: BillingNotificationEventType;
  payload: Record<string, unknown> | null;
};

export type BillingDeliveryResult =
  | {
      status: "sent";
      provider: "stub";
      messageId: string;
      subject: string;
      body: string;
    }
  | {
      status: "failed";
      provider: "stub";
      error: string;
    };

function getEmailFromPayload(payload: Record<string, unknown> | null): string | null {
  if (!payload) {
    return null;
  }

  const value = payload.email;

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function renderMessage(
  eventType: BillingNotificationEventType,
  payload: Record<string, unknown> | null
): { subject: string; body: string } {
  switch (eventType) {
    case "trial_ending_6h":
      return {
        subject: "Your 3-day trial ends soon",
        body: `Your trial ends in less than 6 hours. ${
          typeof payload?.trialEndsAt === "string"
            ? `Trial end: ${payload.trialEndsAt}. `
            : ""
        }After the trial ends, your account will stay saved.`,
      };

    case "trial_expired":
      return {
        subject: "Your trial has ended",
        body: `Your 3-day trial has ended. ${
          typeof payload?.trialEndsAt === "string"
            ? `Trial end: ${payload.trialEndsAt}. `
            : ""
        }Your account is still saved and you can continue with a family plan.`,
      };

    case "renewal_7d":
      return {
        subject: "Your subscription renews soon",
        body: `Your subscription renews in 7 days. ${
          typeof payload?.nextBillingAt === "string"
            ? `Renewal date: ${payload.nextBillingAt}. `
            : ""
        }`,
      };

    case "payment_failed":
      return {
        subject: "Payment issue detected",
        body: `We could not process your payment. ${
          typeof payload?.paymentFailedAt === "string"
            ? `Failure time: ${payload.paymentFailedAt}. `
            : ""
        }Please update your payment details to restore access.`,
      };

    case "grace_period_ending_24h":
      return {
        subject: "Grace period ends soon",
        body: `Your grace period ends in less than 24 hours. ${
          typeof payload?.gracePeriodEndsAt === "string"
            ? `Grace period end: ${payload.gracePeriodEndsAt}. `
            : ""
        }Please update your payment details to avoid losing access.`,
      };

    default:
      return {
        subject: "Billing notification",
        body: "A billing event requires your attention.",
      };
  }
}

export async function sendBillingNotificationEvent(
  event: BillingNotificationRow
): Promise<BillingDeliveryResult> {
  const email = getEmailFromPayload(event.payload);

  if (!email) {
    return {
      status: "failed",
      provider: "stub",
      error: "Missing recipient email in event payload.",
    };
  }

  const message = renderMessage(event.event_type, event.payload);

  return {
    status: "sent",
    provider: "stub",
    messageId: `stub:${event.id}`,
    subject: message.subject,
    body: message.body,
  };
}