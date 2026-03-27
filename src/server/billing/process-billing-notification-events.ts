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
};

export async function processBillingNotificationEvents(
  limit = 50
): Promise<ProcessResult> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("billing_notification_events")
    .select("id, primary_user_id, family_account_id, event_type, payload")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(
      `Failed to load pending billing_notification_events: ${error.message}`
    );
  }

  const events = ((data ?? []) as unknown) as BillingNotificationRow[];

  if (events.length === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
    };
  }

  let sent = 0;
  let failed = 0;

  for (const event of events) {
    const result = await sendBillingNotificationEvent(event);

    if (result.status === "sent") {
      const { error: updateError } = await admin
        .from("billing_notification_events")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
          payload: {
            ...(event.payload ?? {}),
            delivery: {
              provider: result.provider,
              messageId: result.messageId,
              subject: result.subject,
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

    const { error: failError } = await admin
      .from("billing_notification_events")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        last_error: result.error,
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

    failed += 1;
  }

  return {
    processed: events.length,
    sent,
    failed,
  };
}