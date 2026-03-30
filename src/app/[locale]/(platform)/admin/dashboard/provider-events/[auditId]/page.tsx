import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { LocalePageShell } from "@/components/layout/locale-page-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { reprocessProviderBillingEventAudit } from "@/server/billing/reprocess-provider-billing-event-audit";

type ProviderAuditRow = {
  id: string;
  provider: string;
  provider_event_id: string;
  provider_event_type: string | null;
  status: "received" | "processed" | "failed" | "rejected";
  signature_mode: "not_checked" | "verified" | "not_configured";
  signature_verified: boolean;
  webhook_secret_configured: boolean;
  mapped_event_type: string | null;
  mapped_external_event_id: string | null;
  family_account_id: string | null;
  primary_user_id: string | null;
  billing_subscription_event_id: string | null;
  replay_count: number | null;
  last_replayed_at: string | null;
  last_replay_reason: string | null;
  error: string | null;
  received_headers: Record<string, unknown> | null;
  parsed_payload: Record<string, unknown> | null;
  mapped_payload: Record<string, unknown> | null;
  sync_result: Record<string, unknown> | null;
  raw_body: string | null;
  received_at: string;
  processed_at: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
    hour12: false,
  });
}

function formatJson(value: Record<string, unknown> | null): string {
  if (!value || Object.keys(value).length === 0) {
    return "{}";
  }

  return JSON.stringify(value, null, 2);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getSyncImpact(
  syncResult: Record<string, unknown> | null
): {
  scanned: number;
  candidates: number;
  insertedOrUpdated: number;
  canceled: number;
} | null {
  if (!syncResult || Object.keys(syncResult).length === 0) {
    return null;
  }

  return {
    scanned: toNumber(syncResult.scanned) ?? 0,
    candidates: toNumber(syncResult.candidates) ?? 0,
    insertedOrUpdated: toNumber(syncResult.insertedOrUpdated) ?? 0,
    canceled: toNumber(syncResult.canceled) ?? 0,
  };
}

function buildTimeline(row: ProviderAuditRow): {
  label: string;
  at: string;
  condition?: boolean;
}[] {
  const events: Array<{
    label: string;
    at: string | null;
    condition?: boolean;
  }> = [
    { label: "Received", at: row.received_at },
    { label: "Processed", at: row.processed_at },
    { label: "Last replay", at: row.last_replayed_at },
    {
      label: "Billing event created",
      at: row.processed_at,
      condition: Boolean(row.billing_subscription_event_id),
    },
    {
      label: "Notification sync",
      at: row.processed_at,
      condition: Boolean(row.sync_result && Object.keys(row.sync_result).length > 0),
    },
  ];

  const timeline = events
    .filter(
      (event) =>
        Boolean(event.at) && (event.condition === undefined || event.condition)
    )
    .map((e) => ({
      label: e.label,
      at: e.at as string,
      condition: e.condition,
    }));

  timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return timeline;
}

type OperationalContextSeverity = "warning" | "success" | "neutral";

type OperationalContextType =
  | "rejected_provider"
  | "processed_success"
  | "failed_processing";

function deriveOperationalContext(
  row: ProviderAuditRow & { classification: ClassificationId }
): {
  type: OperationalContextType;
  message: string;
  action: string;
  severity: OperationalContextSeverity;
} {
  if (row.classification === "non-allowed-provider") {
    return {
      type: "rejected_provider",
      severity: "warning",
      message:
        "This provider event was blocked by allowlist rules and did not produce a billing context.",
      action:
        "Review provider allowlist configuration and mapping results before retrying.",
    };
  }

  if (row.billing_subscription_event_id) {
    return {
      type: "processed_success",
      severity: "success",
      message:
        "The provider event was processed successfully and produced a linked billing subscription event.",
      action:
        "Review the linked billing notification events and monitor notification delivery.",
    };
  }

  return {
    type: "failed_processing",
    severity: "warning",
    message:
      "The provider event was processed, but it did not result in a billing subscription event.",
    action:
      "Review provider classification, replay reason, and the raw payload before retrying.",
    };
}

function getOperationalContextBadgeClasses(
  severity: OperationalContextSeverity
): string {
  switch (severity) {
    case "success":
      return "border-green-200 bg-green-50 text-green-700";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

function getOperationalContextBgClass(
  severity: OperationalContextSeverity
): string {
  switch (severity) {
    case "success":
      return "bg-green-50";
    case "warning":
      return "bg-yellow-50";
    default:
      return "bg-stone-50";
  }
}

function getStatusClasses(status: ProviderAuditRow["status"]): string {
  switch (status) {
    case "processed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "failed":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

type ClassificationId =
  | "test-like"
  | "live-like"
  | "non-allowed-provider";

function classifyProviderAudit(
  row: ProviderAuditRow
): { classification: ClassificationId; replayed: boolean } {
  const replayed = (row.replay_count ?? 0) > 0;

  const errorLower = (row.error ?? "").toLowerCase();
  if (errorLower.includes("not allowed by billing_provider_allowlist")) {
    return { classification: "non-allowed-provider", replayed };
  }

  const providerEventId = (row.provider_event_id ?? "").toLowerCase();
  const mappedExternalEventId = (row.mapped_external_event_id ?? "").toLowerCase();

  const parsedPayloadJson = row.parsed_payload
    ? JSON.stringify(row.parsed_payload).toLowerCase()
    : "";

  const mappedPayloadJson = row.mapped_payload
    ? JSON.stringify(row.mapped_payload).toLowerCase()
    : "";

  const isTestLike =
    providerEventId.includes("test") ||
    providerEventId.includes("bad") ||
    mappedExternalEventId.includes("test") ||
    parsedPayloadJson.includes("test") ||
    parsedPayloadJson.includes("example") ||
    mappedPayloadJson.includes("test") ||
    mappedPayloadJson.includes("example");

  return { classification: isTestLike ? "test-like" : "live-like", replayed };
}

function getClassificationBadgeClasses(
  classification: ClassificationId
): string {
  switch (classification) {
    case "test-like":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "live-like":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "non-allowed-provider":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

function getReplayBanner(
  replay: string | undefined,
  message: string | undefined
): { tone: "success" | "error"; text: string } | null {
  if (replay === "ok") {
    return {
      tone: "success",
      text: "Replay completed successfully.",
    };
  }

  if (replay === "error") {
    return {
      tone: "error",
      text: message ? decodeURIComponent(message) : "Replay failed.",
    };
  }

  return null;
}

export default async function ProviderEventAuditDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; auditId: string }>;
  searchParams: Promise<{ replay?: string; message?: string }>;
}) {
  const { locale, auditId } = await params;
  const resolvedSearchParams = await searchParams;
  const admin = createAdminClient();

  async function replayAuditEvent(formData: FormData) {
    "use server";

    try {
      const replayReason = String(formData.get("replayReason") ?? "").trim();
      const confirmReplay = String(formData.get("confirmReplay") ?? "").trim();

      if (confirmReplay !== "yes") {
        revalidatePath(`/${locale}/admin/dashboard/provider-events`);
        revalidatePath(`/${locale}/admin/dashboard/provider-events/${auditId}`);

        redirect(
          `/${locale}/admin/dashboard/provider-events/${auditId}?replay=error&message=${encodeURIComponent(
            "Replay confirmation is required."
          )}`
        );
      }

      await reprocessProviderBillingEventAudit(auditId, replayReason);

      revalidatePath(`/${locale}/admin/dashboard/provider-events`);
      revalidatePath(`/${locale}/admin/dashboard/provider-events/${auditId}`);

      redirect(
        `/${locale}/admin/dashboard/provider-events/${auditId}?replay=ok`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Replay failed.";

      revalidatePath(`/${locale}/admin/dashboard/provider-events`);
      revalidatePath(`/${locale}/admin/dashboard/provider-events/${auditId}`);

      redirect(
        `/${locale}/admin/dashboard/provider-events/${auditId}?replay=error&message=${encodeURIComponent(
          message
        )}`
      );
    }
  }

  const { data, error } = await admin
    .from("provider_billing_event_audits")
    .select(
      [
        "id",
        "provider",
        "provider_event_id",
        "provider_event_type",
        "status",
        "signature_mode",
        "signature_verified",
        "webhook_secret_configured",
        "mapped_event_type",
        "mapped_external_event_id",
        "family_account_id",
        "primary_user_id",
        "billing_subscription_event_id",
        "replay_count",
        "last_replayed_at",
        "last_replay_reason",
        "error",
        "received_headers",
        "parsed_payload",
        "mapped_payload",
        "sync_result",
        "raw_body",
        "received_at",
        "processed_at",
      ].join(", ")
    )
    .eq("id", auditId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const auditRow = (data as unknown) as ProviderAuditRow;

  const row = {
    ...auditRow,
    received_headers: asRecord(auditRow.received_headers),
    parsed_payload: asRecord(auditRow.parsed_payload),
    mapped_payload: asRecord(auditRow.mapped_payload),
    sync_result: asRecord(auditRow.sync_result),
  };

  const { classification, replayed } = classifyProviderAudit(row);
  const syncImpact = getSyncImpact(row.sync_result);
  const timeline = buildTimeline(row);
  const operationalContext = deriveOperationalContext({
    ...row,
    classification,
  });
  const operationalBadgeLabel =
    operationalContext.type === "rejected_provider"
      ? "Provider blocked"
      : operationalContext.type === "processed_success"
        ? "Processed"
        : "Processing issue";
  const operationalBgClass = getOperationalContextBgClass(
    operationalContext.severity
  );

  const replayBanner = getReplayBanner(
    resolvedSearchParams.replay,
    resolvedSearchParams.message
  );

  return (
    <LocalePageShell
      locale={locale}
      title="Provider event detail"
      subtitle="Read-only provider audit detail with replay control."
      backHref={`/${locale}/admin/dashboard/provider-events`}
      backLabel="Back to provider event audits"
    >
      <div className="space-y-6">
        {replayBanner ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              replayBanner.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {replayBanner.text}
          </div>
        ) : null}

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-500">
                {row.provider}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-stone-900">
                {row.provider_event_id}
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                Provider event type: {row.provider_event_type ?? "—"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                  row.status
                )}`}
              >
                {row.status}
              </div>

              <div
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getClassificationBadgeClasses(
                  classification
                )}`}
              >
                {classification}
              </div>

              <div
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getOperationalContextBadgeClasses(
                  operationalContext.severity
                )}`}
              >
                {operationalBadgeLabel}
              </div>

              {replayed ? (
                <div className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                  replayed
                </div>
              ) : null}

              <form
                action={replayAuditEvent}
                className="flex flex-col items-end gap-2"
              >
                <label className="w-full max-w-md">
                  <span className="mb-1 block text-xs font-medium text-stone-700">
                    Reason for replay
                  </span>
                  <textarea
                    name="replayReason"
                    rows={3}
                    required
                    className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                    placeholder="Describe why this provider event should be replayed."
                  />
                </label>

                <label className="flex w-full max-w-md items-start gap-2 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    name="confirmReplay"
                    value="yes"
                    className="mt-0.5 h-4 w-4 rounded border-stone-300"
                    required
                  />
                  <span>
                    I understand this will reprocess the stored provider event
                    server-side.
                  </span>
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                >
                  Replay event
                </button>

                <p className="text-xs text-stone-500">
                  Replay reprocesses the stored provider event and may update
                  billing/admin state.
                </p>
              </form>
            </div>
          </div>

          <section className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Processing impact
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Billing subscription event
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <p className="break-all text-sm text-stone-900">
                    {row.billing_subscription_event_id ?? "—"}
                  </p>
                  {row.billing_subscription_event_id ? (
                    <Link
                      href={`/${locale}/admin/dashboard/billing-events`}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-900 transition hover:bg-stone-50"
                    >
                      Open billing notifications
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Mapped internal event
                </p>
                <p className="mt-1 text-sm text-stone-900">
                  {row.mapped_event_type ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Mapped external event id
                </p>
                <p className="mt-1 break-all text-sm text-stone-900">
                  {row.mapped_external_event_id ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-stone-900">
                Notification sync impact
              </p>

              {syncImpact ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      Scanned
                    </p>
                    <p className="mt-1 text-sm text-stone-900">
                      {syncImpact.scanned}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      Candidates
                    </p>
                    <p className="mt-1 text-sm text-stone-900">
                      {syncImpact.candidates}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      Inserted/updated
                    </p>
                    <p className="mt-1 text-sm text-stone-900">
                      {syncImpact.insertedOrUpdated}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      Canceled
                    </p>
                    <p className="mt-1 text-sm text-stone-900">
                      {syncImpact.canceled}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-600">
                  No sync impact recorded yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Related timeline
            </h2>

            {timeline.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">
                No timeline events yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {timeline.map((item) => (
                  <div
                    key={`${item.label}-${item.at}`}
                    className="border-l border-stone-200 pl-4"
                  >
                    <p className="text-sm font-semibold text-stone-900">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatDateTime(item.at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Next checks
            </h3>

            <div className="mt-3 space-y-2">
              {row.billing_subscription_event_id ? (
                <div>
                  <Link
                    href={`/${locale}/admin/dashboard/billing-events`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-900 transition hover:bg-stone-50"
                  >
                    Review billing notification events
                  </Link>
                </div>
              ) : null}

              {row.status === "rejected" || row.status === "failed" ? (
                <p className="text-sm text-stone-600">
                  Review provider classification, replay reason, and raw
                  payload before retrying.
                </p>
              ) : null}

              {row.status === "processed" ? (
                <p className="text-sm text-stone-600">
                  Review notification sync impact and billing event
                  linkage.
                </p>
              ) : null}
            </div>
          </section>

          <section
            className={`rounded-xl border border-stone-200 p-6 ${operationalBgClass}`}
          >
            <h3 className="text-lg font-semibold text-stone-900">
              What this means
            </h3>
            <p className="mt-2 text-sm text-stone-700">
              {operationalContext.message}
            </p>
          </section>

          <section className="rounded-xl border border-stone-200 bg-stone-50 p-6">
            <h3 className="text-lg font-semibold text-stone-900">
              Recommended action
            </h3>
            <p className="mt-2 text-sm text-stone-700">
              {operationalContext.action}
            </p>

            {row.billing_subscription_event_id ? (
              <div className="mt-3">
                <Link
                  href={`/${locale}/admin/dashboard/billing-events`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-900 transition hover:bg-stone-50"
                >
                  Open billing notification events
                </Link>
              </div>
            ) : null}
          </section>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Received at
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {formatDateTime(row.received_at)}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Processed at
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {formatDateTime(row.processed_at)}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Replay count
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {row.replay_count ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Last replay reason
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {row.last_replay_reason ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Classification
              </p>
              <p className="mt-1 text-sm text-stone-900">{classification}</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Last replayed at
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {formatDateTime(row.last_replayed_at)}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Signature mode
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {row.signature_mode}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Signature verified
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {row.signature_verified ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Webhook secret configured
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {row.webhook_secret_configured ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Mapped internal event
              </p>
              <p className="mt-1 text-sm text-stone-900">
                {row.mapped_event_type ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Mapped external event id
              </p>
              <div className="mt-1 break-all rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-sm text-stone-900">
                {row.mapped_external_event_id ?? "—"}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Billing subscription event
              </p>
              <p className="mt-1 break-all text-sm text-stone-900">
                {row.billing_subscription_event_id ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Family account
              </p>
              <p className="mt-1 break-all text-sm text-stone-900">
                {row.family_account_id ?? "—"}
              </p>
              {row.family_account_id ? (
                <p className="mt-2 text-xs text-stone-500">
                  Family context linked
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Primary user
              </p>
              <p className="mt-1 break-all text-sm text-stone-900">
                {row.primary_user_id ?? "—"}
              </p>
            </div>
          </div>

          {row.error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {row.error}
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
          <div>
            <p className="text-sm font-medium text-stone-900">Received headers</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-700">
              {formatJson(row.received_headers)}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-900">Parsed payload</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-700">
              {formatJson(row.parsed_payload)}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-900">Mapped payload</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-700">
              {formatJson(row.mapped_payload)}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-900">Sync result</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-700">
              {formatJson(row.sync_result)}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-900">Raw body</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-700">
              {row.raw_body ?? "—"}
            </pre>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-600">
            Replay uses the existing server-side replay flow. No browser-only billing
            logic is introduced here.
          </p>

          <div className="mt-4">
            <Link
              href={`/${locale}/admin/dashboard/provider-events`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-900 transition hover:bg-stone-50"
            >
              Back to provider event audits
            </Link>
          </div>
        </section>
      </div>
    </LocalePageShell>
  );
}
