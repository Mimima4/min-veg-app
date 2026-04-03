import "server-only";

import { processBillingNotificationEvents } from "@/server/billing/process-billing-notification-events";

export async function runBillingNotificationProcessor(args?: {
  limit?: number;
}) {
  const result = await processBillingNotificationEvents(args?.limit ?? 50);

  return {
    ok: true,
    ...result,
  };
}