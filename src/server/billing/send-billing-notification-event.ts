import "server-only";

import {
  renderBillingNotificationTemplate,
  type BillingNotificationEventType,
} from "@/server/billing/render-billing-notification-template";

export type BillingNotificationRow = {
  id: string;
  primary_user_id: string;
  family_account_id: string;
  event_type: BillingNotificationEventType;
  payload: Record<string, unknown> | null;
  status?: "pending" | "sent" | "skipped" | "canceled" | "failed";
  retry_count?: number | null;
  retryable?: boolean | null;
  next_retry_at?: string | null;
  scheduled_for?: string | null;
};

export type BillingDeliveryResult =
  | {
      status: "sent";
      provider: "stub";
      messageId: string;
      subject: string;
      previewText: string;
      textBody: string;
      htmlBody: string;
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

  const template = renderBillingNotificationTemplate(
    event.event_type,
    event.payload
  );

  return {
    status: "sent",
    provider: "stub",
    messageId: `stub:${event.id}`,
    subject: template.subject,
    previewText: template.previewText,
    textBody: template.textBody,
    htmlBody: template.htmlBody,
  };
}
