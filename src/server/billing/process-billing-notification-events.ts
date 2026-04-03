import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBillingNotificationEvent,
  type BillingNotificationRow,
} from "@/server/billing/send-billing-notification-event";

type ProcessResult = {
  processed: number;
  sent: number;
  failed: number;
  scheduledForRetry: number;
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MINUTES = 5;

export async function processBillingNotificationEvents(
  limit = 50
): Promise<ProcessResult> {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from("billing_notification_events")
    .select(
      "id, primary_user_id, family_account_id, event_type, payload, status, retry_count, retryable, next_retry_at, scheduled_for"
    )
    .or(
      [
        `and(status.eq.pending,scheduled_for.lte.${nowIso})`,
        `and(status.eq.failed,retryable.eq.true,next_retry_at.lte.${nowIso})`,
      ].join(",")
    )
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(
      `Failed to load processable billing_notification_events: ${error.message}`
    );
  }

  const events = ((data ?? []) as unknown) as BillingNotificationRow[];

  if (events.length === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      scheduledForRetry: 0,
    };
  }

  let sent = 0;
  let failed = 0;
  let scheduledForRetry = 0;

  for (const event of events) {
    const result = await sendBillingNotificationEvent(event);

    if (result.status === "sent") {
      const { error: updateError } = await admin
        .from("billing_notification_events")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          failed_at: null,
          last_error: null,
          next_retry_at: null,
          payload: {
            ...(event.payload ?? {}),
            delivery: {
              provider: result.provider,
              messageId: result.messageId,
              subject: result.subject,
              previewText: result.previewText,
              textBody: result.textBody,
              htmlBody: result.htmlBody,
              processedAt: new Date().toISOString(),
            },
          },
        })
        .eq("id", event.id);

      if (updateError) {
        throw new Error(
          `Failed to mark billing_notification_event as sent: ${updateError.message}`
        );
      }

      sent += 1;
      continue;
    }

    const currentRetryCount =
      typeof event.retry_count === "number" ? event.retry_count : 0;
    const nextRetryCount = currentRetryCount + 1;
    const canRetry =
      (event.retryable ?? true) && nextRetryCount < MAX_RETRY_ATTEMPTS;

    const nextRetryAt = canRetry
      ? new Date(
          Date.now() + RETRY_DELAY_MINUTES * 60 * 1000
        ).toISOString()
      : null;

    const nextStatus = "failed";

    const { error: failError } = await admin
      .from("billing_notification_events")
      .update({
        status: nextStatus,
        failed_at: new Date().toISOString(),
        last_error: result.error,
        retry_count: nextRetryCount,
        retryable: canRetry,
        next_retry_at: nextRetryAt,
        payload: {
          ...(event.payload ?? {}),
          delivery: {
            provider: result.provider,
            processedAt: new Date().toISOString(),
          },
        },
      })
      .eq("id", event.id);

    if (failError) {
      throw new Error(
        `Failed to mark billing_notification_event as failed: ${failError.message}`
      );
    }

    if (canRetry) {
      scheduledForRetry += 1;
    } else {
      failed += 1;
    }
  }

  return {
    processed: events.length,
    sent,
    failed,
    scheduledForRetry,
  };
}