import "server-only";

/**
 * Ops alerts via `OPS_ALERT_WEBHOOK_URL` (Slack/Discord-compatible incoming webhook).
 * When unset, logs a warning and returns false — callers still return their HTTP response.
 */

export function isOpsAlertWebhookConfigured(): boolean {
  return Boolean(process.env.OPS_ALERT_WEBHOOK_URL?.trim());
}

export async function sendOpsAlert(
  message: string,
  context = "ops-alert"
): Promise<boolean> {
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn(`[${context}] ${message} (no OPS_ALERT_WEBHOOK_URL configured)`);
    return false;
  }
  try {
    // `text` (Slack) + `content` (Discord) so one URL works for either provider.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: message, content: message }),
    });
    if (!response.ok) {
      console.warn(`[${context}] webhook returned ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(
      `[${context}] webhook failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}
