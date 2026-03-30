import "server-only";

export type BillingNotificationEventType =
  | "trial_ending_6h"
  | "trial_expired"
  | "subscription_ending_3d"
  | "subscription_ending_7d"
  | "subscription_started_success"
  | "subscription_renewed_success"
  | "payment_failed"
  | "grace_period_ending_24h";

export type BillingNotificationTemplate = {
  subject: string;
  previewText: string;
  textBody: string;
  htmlBody: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getString(payload: Record<string, unknown> | null, key: string): string | null {
  if (!payload) {
    return null;
  }

  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getGreetingName(payload: Record<string, unknown> | null): string | null {
  const recipientName = getString(payload, "recipientName");

  if (recipientName) {
    return recipientName;
  }

  return null;
}

function formatDateTimeForNorway(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const formatted = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Oslo",
  }).format(parsed);

  return formatted;
}

function getFormattedDateTime(
  payload: Record<string, unknown> | null,
  key: string
): string | null {
  return formatDateTimeForNorway(getString(payload, key));
}

function renderShell(args: {
  title: string;
  greetingName: string | null;
  intro: string;
  bodyLines: string[];
  footer?: string;
}) {
  const greetingLine = args.greetingName ? `Hi ${args.greetingName},` : "Hi,";

  const textParts = [
    greetingLine,
    "",
    args.title,
    "",
    args.intro,
    "",
    ...args.bodyLines,
  ];

  if (args.footer) {
    textParts.push("", args.footer);
  }

  const textBody = textParts.join("\n");

  const htmlBody = `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:Inter,Arial,sans-serif;color:#1c1917;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:20px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;">
          Min Veg
        </p>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#44403c;">
          ${escapeHtml(greetingLine)}
        </p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#1c1917;">
          ${escapeHtml(args.title)}
        </h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#44403c;">
          ${escapeHtml(args.intro)}
        </p>
        ${args.bodyLines
          .map(
            (line) => `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#44403c;">
          ${escapeHtml(line)}
        </p>`
          )
          .join("")}
        ${
          args.footer
            ? `
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e7e5e4;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;">
            ${escapeHtml(args.footer)}
          </p>
        </div>`
            : ""
        }
      </div>
    </div>
  </body>
</html>`.trim();

  return { textBody, htmlBody };
}

export function renderBillingNotificationTemplate(
  eventType: BillingNotificationEventType,
  payload: Record<string, unknown> | null
): BillingNotificationTemplate {
  const greetingName = getGreetingName(payload);

  switch (eventType) {
    case "trial_ending_6h": {
      const trialEndsAt = getFormattedDateTime(payload, "trialEndsAt");
      const subject = "Your 3-day trial ends soon";
      const previewText =
        "Less than 6 hours remain. Your account will stay saved after the trial ends.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Your 3-day trial is almost over. You can continue later with a family plan, and your account will stay saved.",
        bodyLines: [
          trialEndsAt
            ? `Trial end: ${trialEndsAt}.`
            : "Less than 6 hours remain in your current trial.",
          "If you want to keep going without interruption, choose a family plan before the trial ends.",
        ],
        footer:
          "This is a billing reminder from Min Veg. No action is required if you plan to continue later.",
      });

      return { subject, previewText, ...shell };
    }

    case "trial_expired": {
      const trialEndsAt = getFormattedDateTime(payload, "trialEndsAt");
      const subject = "Your trial has ended";
      const previewText =
        "Your account is still saved. Continue with a family plan when you are ready.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Your 3-day trial has ended, but your account and saved setup are still there.",
        bodyLines: [
          trialEndsAt
            ? `Trial end: ${trialEndsAt}.`
            : "The current trial period has ended.",
          "To continue using the family area, choose a family plan.",
        ],
        footer:
          "This is a billing reminder from Min Veg. Your account is not deleted after trial expiry.",
      });

      return { subject, previewText, ...shell };
    }

    case "subscription_ending_3d": {
      const currentPeriodEndsAt = getFormattedDateTime(payload, "currentPeriodEndsAt");
      const subject = "Your monthly subscription ends soon";
      const previewText =
        "Your subscription is set to end in 3 days because auto-renew is turned off.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Your current monthly subscription is approaching its end date because auto-renew is turned off.",
        bodyLines: [
          currentPeriodEndsAt
            ? `Access end date: ${currentPeriodEndsAt}.`
            : "Your current subscription ends in 3 days.",
          "If you want uninterrupted access, renew before the current period ends.",
        ],
        footer: "This is a billing reminder from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }

    case "subscription_ending_7d": {
      const currentPeriodEndsAt = getFormattedDateTime(payload, "currentPeriodEndsAt");
      const subject = "Your yearly subscription ends soon";
      const previewText =
        "Your subscription is set to end in 7 days because auto-renew is turned off.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Your current yearly subscription is approaching its end date because auto-renew is turned off.",
        bodyLines: [
          currentPeriodEndsAt
            ? `Access end date: ${currentPeriodEndsAt}.`
            : "Your current subscription ends in 7 days.",
          "If you want uninterrupted access, renew before the current period ends.",
        ],
        footer: "This is a billing reminder from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }

    case "subscription_started_success": {
      const currentPeriodEndsAt = getFormattedDateTime(payload, "currentPeriodEndsAt");
      const subject = "Your subscription is active";
      const previewText =
        "Thank you for your trust and for choosing Min Veg. This confirms your first successful paid activation.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Thank you for your trust and for choosing Min Veg. This message confirms the successful activation of your paid subscription.",
        bodyLines: [
          currentPeriodEndsAt
            ? `Current billing period end: ${currentPeriodEndsAt}.`
            : "Your paid subscription has been activated successfully.",
          "You can review subscription settings and auto-renew in your account at any time.",
        ],
        footer: "This is a billing confirmation from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }

    case "subscription_renewed_success": {
      const currentPeriodEndsAt = getFormattedDateTime(payload, "currentPeriodEndsAt");
      const subject = "Your subscription has been renewed";
      const previewText =
        "Payment for Min Veg was processed successfully. Thank you for your continued trust and for choosing the app.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Your payment for Min Veg was processed successfully, and your subscription has been renewed. Thank you for your continued trust and for choosing the app.",
        bodyLines: [
          currentPeriodEndsAt
            ? `Current billing period end: ${currentPeriodEndsAt}.`
            : "A new paid subscription period has started successfully.",
          "This confirmation helps you identify that the recent charge was for Min Veg.",
        ],
        footer: "This is a billing confirmation from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }

    case "payment_failed": {
      const paymentFailedAt = getFormattedDateTime(payload, "paymentFailedAt");
      const subject = "Payment issue detected";
      const previewText =
        "We could not process your payment. Please update your payment details.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "We could not complete the latest payment for your subscription.",
        bodyLines: [
          paymentFailedAt
            ? `Payment failure time: ${paymentFailedAt}.`
            : "A recent payment attempt failed.",
          "Please update your payment details to restore or keep access.",
        ],
        footer: "This is a billing reminder from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }

    case "grace_period_ending_24h": {
      const gracePeriodEndsAt = getFormattedDateTime(payload, "gracePeriodEndsAt");
      const subject = "Grace period ends soon";
      const previewText =
        "Less than 24 hours remain before access may be restricted.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro:
          "Your account is currently in a grace period because of a payment issue.",
        bodyLines: [
          gracePeriodEndsAt
            ? `Grace period end: ${gracePeriodEndsAt}.`
            : "Less than 24 hours remain in the current grace period.",
          "Please update your payment details to avoid losing access.",
        ],
        footer: "This is a billing reminder from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }

    default: {
      const subject = "Billing notification";
      const previewText = "A billing event requires your attention.";

      const shell = renderShell({
        title: subject,
        greetingName,
        intro: "A billing event requires your attention.",
        bodyLines: [
          "Please review your subscription settings in your account.",
        ],
        footer: "This is a billing reminder from Min Veg.",
      });

      return { subject, previewText, ...shell };
    }
  }
}