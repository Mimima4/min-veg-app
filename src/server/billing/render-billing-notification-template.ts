import "server-only";

export type BillingNotificationEventType =
  | "trial_ending_6h"
  | "trial_expired"
  | "renewal_7d"
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

function renderShell(args: {
  title: string;
  intro: string;
  bodyLines: string[];
  footer?: string;
}) {
  const textParts = [args.title, "", args.intro, "", ...args.bodyLines];

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

function getString(payload: Record<string, unknown> | null, key: string): string | null {
  if (!payload) {
    return null;
  }

  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function renderBillingNotificationTemplate(
  eventType: BillingNotificationEventType,
  payload: Record<string, unknown> | null
): BillingNotificationTemplate {
  switch (eventType) {
    case "trial_ending_6h": {
      const trialEndsAt = getString(payload, "trialEndsAt");

      const subject = "Your 3-day trial ends soon";
      const previewText =
        "Less than 6 hours remain. Your account will stay saved after the trial ends.";
      const intro =
        "Your 3-day trial is almost over. You can continue later with a family plan, and your account will stay saved.";
      const bodyLines = [
        trialEndsAt ? `Trial end: ${trialEndsAt}.` : "Less than 6 hours remain in your current trial.",
        "If you want to keep going without interruption, choose a family plan before the trial ends.",
      ];
      const footer =
        "This is a billing reminder from Min Veg. No action is required if you plan to continue later.";

      const shell = renderShell({
        title: subject,
        intro,
        bodyLines,
        footer,
      });

      return {
        subject,
        previewText,
        ...shell,
      };
    }

    case "trial_expired": {
      const trialEndsAt = getString(payload, "trialEndsAt");

      const subject = "Your trial has ended";
      const previewText =
        "Your account is still saved. Continue with a family plan when you are ready.";
      const intro =
        "Your 3-day trial has ended, but your account and saved setup are still there.";
      const bodyLines = [
        trialEndsAt ? `Trial end: ${trialEndsAt}.` : "The current trial period has ended.",
        "To continue using the family area, choose a family plan.",
      ];
      const footer =
        "This is a billing reminder from Min Veg. Your account is not deleted after trial expiry.";

      const shell = renderShell({
        title: subject,
        intro,
        bodyLines,
        footer,
      });

      return {
        subject,
        previewText,
        ...shell,
      };
    }

    case "renewal_7d": {
      const nextBillingAt = getString(payload, "nextBillingAt");

      const subject = "Your subscription renews soon";
      const previewText =
        "Your current subscription is scheduled to renew in 7 days.";
      const intro =
        "This is a reminder that your subscription is approaching its next renewal date.";
      const bodyLines = [
        nextBillingAt ? `Renewal date: ${nextBillingAt}.` : "Your subscription renews in 7 days.",
        "You can review your subscription settings and auto-renew option in your account.",
      ];
      const footer =
        "This is a billing reminder from Min Veg.";

      const shell = renderShell({
        title: subject,
        intro,
        bodyLines,
        footer,
      });

      return {
        subject,
        previewText,
        ...shell,
      };
    }

    case "payment_failed": {
      const paymentFailedAt = getString(payload, "paymentFailedAt");

      const subject = "Payment issue detected";
      const previewText =
        "We could not process your payment. Please update your payment details.";
      const intro =
        "We could not complete the latest payment for your subscription.";
      const bodyLines = [
        paymentFailedAt
          ? `Payment failure time: ${paymentFailedAt}.`
          : "A recent payment attempt failed.",
        "Please update your payment details to restore or keep access.",
      ];
      const footer =
        "This is a billing reminder from Min Veg.";

      const shell = renderShell({
        title: subject,
        intro,
        bodyLines,
        footer,
      });

      return {
        subject,
        previewText,
        ...shell,
      };
    }

    case "grace_period_ending_24h": {
      const gracePeriodEndsAt = getString(payload, "gracePeriodEndsAt");

      const subject = "Grace period ends soon";
      const previewText =
        "Less than 24 hours remain before access may be restricted.";
      const intro =
        "Your account is currently in a grace period because of a payment issue.";
      const bodyLines = [
        gracePeriodEndsAt
          ? `Grace period end: ${gracePeriodEndsAt}.`
          : "Less than 24 hours remain in the current grace period.",
        "Please update your payment details to avoid losing access.",
      ];
      const footer =
        "This is a billing reminder from Min Veg.";

      const shell = renderShell({
        title: subject,
        intro,
        bodyLines,
        footer,
      });

      return {
        subject,
        previewText,
        ...shell,
      };
    }

    default: {
      const subject = "Billing notification";
      const previewText = "A billing event requires your attention.";
      const intro = "A billing event requires your attention.";
      const bodyLines = ["Please review your subscription settings in your account."];
      const footer = "This is a billing reminder from Min Veg.";

      const shell = renderShell({
        title: subject,
        intro,
        bodyLines,
        footer,
      });

      return {
        subject,
        previewText,
        ...shell,
      };
    }
  }
}