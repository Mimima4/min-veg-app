import { LocalePageShell } from "@/components/layout/locale-page-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  renderBillingNotificationTemplate,
  type BillingNotificationEventType,
} from "@/server/billing/render-billing-notification-template";

type NotificationRow = {
  id: string;
  event_type: BillingNotificationEventType;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  failed_at: string | null;
  last_error: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getString(
  record: Record<string, unknown> | null,
  key: string
): string | null {
  if (!record) {
    return null;
  }

  const value = record[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function BillingEventsPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("billing_notification_events")
    .select(
      "id, event_type, status, scheduled_for, sent_at, failed_at, last_error, payload, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Billing email previews"
        subtitle="Preview recent billing notification events and rendered email content."
        backHref={`/${locale}/admin/dashboard`}
        backLabel="Back to admin dashboard"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  const rows = (((data ?? []) as unknown) as NotificationRow[]).map((row) => {
    const payload = asRecord(row.payload);
    const delivery = asRecord(payload?.delivery);
    const rendered = renderBillingNotificationTemplate(row.event_type, payload);

    return {
      ...row,
      recipient: getString(payload, "email") ?? "—",
      recipientName: getString(payload, "recipientName") ?? "—",
      subject: rendered.subject,
      previewText: rendered.previewText,
      textBody: rendered.textBody,
      htmlBody: rendered.htmlBody,
      deliveredSubject: getString(delivery, "subject"),
      deliveredPreviewText: getString(delivery, "previewText"),
      deliveredTextBody: getString(delivery, "textBody"),
      deliveredHtmlBody: getString(delivery, "htmlBody"),
      provider: getString(delivery, "provider"),
      messageId: getString(delivery, "messageId"),
      processedAt: getString(delivery, "processedAt"),
    };
  });

  return (
    <LocalePageShell
      locale={locale}
      title="Billing email previews"
      subtitle="Preview recent billing notification events and rendered email content."
      backHref={`/${locale}/admin/dashboard`}
      backLabel="Back to admin dashboard"
    >
      <div className="space-y-6">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
            No billing notification events found yet.
          </div>
        ) : null}

        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-stone-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {row.event_type}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-stone-900">
                  {row.subject}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  {row.previewText}
                </p>
              </div>

              <div className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                {row.status}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Recipient
                </p>
                <p className="mt-1 text-sm text-stone-900">{row.recipient}</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Recipient name
                </p>
                <p className="mt-1 text-sm text-stone-900">
                  {row.recipientName}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Scheduled for
                </p>
                <p className="mt-1 text-sm text-stone-900">
                  {formatDateTime(row.scheduled_for)}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Sent at
                </p>
                <p className="mt-1 text-sm text-stone-900">
                  {formatDateTime(row.sent_at)}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Provider
                </p>
                <p className="mt-1 text-sm text-stone-900">
                  {row.provider ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Message ID
                </p>
                <p className="mt-1 break-all text-sm text-stone-900">
                  {row.messageId ?? "—"}
                </p>
              </div>
            </div>

            {row.last_error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {row.last_error}
              </div>
            ) : null}

            {row.processedAt ? (
              <p className="mt-4 text-xs text-stone-500">
                Processed at: {formatDateTime(row.processedAt)}
              </p>
            ) : null}

            <div className="mt-5">
              <p className="text-sm font-medium text-stone-900">Current template preview</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-700 whitespace-pre-wrap">
                {row.textBody}
              </pre>
            </div>

            {row.deliveredTextBody && row.deliveredTextBody !== row.textBody ? (
              <div className="mt-5">
                <p className="text-sm font-medium text-stone-900">
                  Delivered snapshot
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-stone-700 whitespace-pre-wrap">
                  {row.deliveredTextBody}
                </pre>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </LocalePageShell>
  );
}