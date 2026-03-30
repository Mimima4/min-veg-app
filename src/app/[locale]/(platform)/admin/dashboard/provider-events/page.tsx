import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import { createAdminClient } from "@/lib/supabase/admin";

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
  error: string | null;
  received_headers: Record<string, unknown> | null;
  parsed_payload: Record<string, unknown> | null;
  mapped_payload: Record<string, unknown> | null;
  sync_result: Record<string, unknown> | null;
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

const AUDIT_STATUS_FILTERS = new Set<ProviderAuditRow["status"]>([
  "received",
  "processed",
  "failed",
  "rejected",
]);

type ClassificationId =
  | "test-like"
  | "live-like"
  | "non-allowed-provider";

function classifyProviderAudit(
  row: ProviderAuditRow
): { classification: ClassificationId; replayed: boolean } {
  const replayed = (row.replay_count ?? 0) > 0;

  const errorLower = (row.error ?? "").toLowerCase();
  if (
    errorLower.includes(
      "not allowed by billing_provider_allowlist"
    )
  ) {
    return { classification: "non-allowed-provider", replayed };
  }

  const providerEventId = (row.provider_event_id ?? "").toLowerCase();
  const mappedExternalEventId = (
    row.mapped_external_event_id ?? ""
  ).toLowerCase();

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

function getShortSyncToken(
  syncResult: Record<string, unknown> | null
): string | null {
  if (!syncResult || Object.keys(syncResult).length === 0) {
    return null;
  }

  const insertedRaw = syncResult.insertedOrUpdated;
  const canceledRaw = syncResult.canceled;

  const hasInserted =
    insertedRaw !== undefined && insertedRaw !== null;
  const hasCanceled =
    canceledRaw !== undefined && canceledRaw !== null;

  if (!hasInserted && !hasCanceled) {
    return null;
  }

  const inserted = toNumber(insertedRaw) ?? 0;
  const canceled = toNumber(canceledRaw) ?? 0;

  return `sync: ${inserted} updated, ${canceled} canceled`;
}

function firstSearchParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return undefined;
}

/** Normalizes free-text for use inside a PostgREST `ilike` pattern (%…%). */
function normalizeForIlikePattern(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/,/g, " ")
    .replace(/"/g, "");
  if (!cleaned) {
    return null;
  }

  const escaped = cleaned
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  return `%${escaped}%`;
}

type PresetId =
  | "all"
  | "failed"
  | "rejected"
  | "processed"
  | "needs-attention"
  | "replay-used";

const PRESET_QUERY_VALUES = new Set<string>([
  "all",
  "failed",
  "rejected",
  "processed",
  "needs-attention",
  "replay-used",
]);

function normalizePreset(raw: string | undefined): PresetId {
  const t = raw?.trim().toLowerCase() ?? "";
  if (!t || t === "all") {
    return "all";
  }
  if (PRESET_QUERY_VALUES.has(t)) {
    return t as PresetId;
  }
  return "all";
}

function presetQueryParam(preset: PresetId): string | null {
  if (preset === "all") {
    return null;
  }
  return preset;
}

function presetSummaryLabel(preset: PresetId): string {
  switch (preset) {
    case "all":
      return "all";
    case "failed":
      return "failed";
    case "rejected":
      return "rejected";
    case "processed":
      return "processed";
    case "needs-attention":
      return "needs attention";
    case "replay-used":
      return "replay used";
    default:
      return preset;
  }
}

function applyPresetInMemory(
  rows: ProviderAuditRow[],
  preset: PresetId
): ProviderAuditRow[] {
  if (preset === "all") {
    return rows;
  }

  switch (preset) {
    case "failed":
      return rows.filter((r) => r.status === "failed");
    case "rejected":
      return rows.filter((r) => r.status === "rejected");
    case "processed":
      return rows.filter((r) => r.status === "processed");
    case "needs-attention":
      return rows.filter(
        (r) => r.status === "failed" || r.status === "rejected"
      );
    case "replay-used":
      return rows.filter((r) => (r.replay_count ?? 0) > 0);
    default:
      return rows;
  }
}

function buildProviderEventsListHref(
  locale: string,
  args: {
    preset: PresetId;
    statusRaw: string;
    providerRaw: string;
    qRaw: string;
    classificationRaw: string;
  }
): string {
  const params = new URLSearchParams();
  const presetParam = presetQueryParam(args.preset);
  if (presetParam) {
    params.set("preset", presetParam);
  }
  if (args.statusRaw) {
    params.set("status", args.statusRaw);
  }
  if (args.providerRaw) {
    params.set("provider", args.providerRaw);
  }
  if (args.qRaw) {
    params.set("q", args.qRaw);
  }
  if (args.classificationRaw) {
    params.set("classification", args.classificationRaw);
  }
  const qs = params.toString();
  const base = `/${locale}/admin/dashboard/provider-events`;
  return qs ? `${base}?${qs}` : base;
}

const QUICK_PRESETS: { id: PresetId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "failed", label: "Failed" },
  { id: "rejected", label: "Rejected" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "processed", label: "Processed" },
  { id: "replay-used", label: "Replay used" },
];

export default async function ProviderEventsPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const statusRaw = firstSearchParam(sp.status)?.trim();
  const statusFilter =
    statusRaw && AUDIT_STATUS_FILTERS.has(statusRaw as ProviderAuditRow["status"])
      ? (statusRaw as ProviderAuditRow["status"])
      : undefined;

  const providerRaw = firstSearchParam(sp.provider)?.trim() ?? "";
  const providerFilter = providerRaw.length > 0 ? providerRaw.toLowerCase() : undefined;

  const qRaw = firstSearchParam(sp.q)?.trim() ?? "";
  const searchPattern = qRaw.length > 0 ? normalizeForIlikePattern(qRaw) : null;

  const classificationRaw = firstSearchParam(sp.classification)?.trim().toLowerCase() ?? "";
  const classificationFilter =
    classificationRaw === "test-like" ||
    classificationRaw === "live-like" ||
    classificationRaw === "non-allowed-provider"
      ? (classificationRaw as ClassificationId)
      : undefined;

  const presetRaw = firstSearchParam(sp.preset)?.trim() ?? "";
  const activePreset = normalizePreset(presetRaw);

  const hasActiveFilters = Boolean(
    statusFilter ||
      providerFilter ||
      searchPattern ||
      activePreset !== "all" ||
      classificationFilter
  );

  const activeFilterSummaryParts: string[] = [];
  if (activePreset !== "all") {
    activeFilterSummaryParts.push(`preset: ${presetSummaryLabel(activePreset)}`);
  }
  if (classificationFilter) {
    activeFilterSummaryParts.push(
      `classification: ${classificationFilter}`
    );
  }
  if (statusFilter) {
    activeFilterSummaryParts.push(`status: ${statusFilter}`);
  }
  if (providerFilter) {
    activeFilterSummaryParts.push(`provider: ${providerFilter}`);
  }
  if (qRaw) {
    activeFilterSummaryParts.push(`search: ${qRaw}`);
  }
  const activeFilterSummary = activeFilterSummaryParts.join(" · ");

  const admin = createAdminClient();

  const selectColumns = [
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
    "error",
    "received_headers",
    "parsed_payload",
    "mapped_payload",
    "sync_result",
    "received_at",
    "processed_at",
  ].join(", ");

  let query = admin
    .from("provider_billing_event_audits")
    .select(selectColumns);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (providerFilter) {
    query = query.eq("provider", providerFilter);
  }

  if (searchPattern) {
    const quotedPattern = `"${searchPattern.replace(/"/g, '""')}"`;
    query = query.or(
      `provider_event_id.ilike.${quotedPattern},provider_event_type.ilike.${quotedPattern},mapped_external_event_id.ilike.${quotedPattern}`
    );
  }

  const { data, error } = await query
    .order("received_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Provider event audits"
        subtitle="Read-only visibility into incoming provider billing events."
        backHref={`/${locale}/admin/dashboard`}
        backLabel="Back to admin dashboard"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  const rowsFromDb = ((data ?? []) as unknown as ProviderAuditRow[]).map(
    (row) => ({
      ...row,
      received_headers: asRecord(row.received_headers),
      parsed_payload: asRecord(row.parsed_payload),
      mapped_payload: asRecord(row.mapped_payload),
      sync_result: asRecord(row.sync_result),
    })
  );

  const rowsWithPreset = applyPresetInMemory(rowsFromDb, activePreset);
  const rows = classificationFilter
    ? rowsWithPreset.filter(
        (row) => classifyProviderAudit(row).classification === classificationFilter
      )
    : rowsWithPreset;

  return (
    <LocalePageShell
      locale={locale}
      title="Provider event audits"
      subtitle="Read-only visibility into incoming provider billing events and how they were processed."
      backHref={`/${locale}/admin/dashboard`}
      backLabel="Back to admin dashboard"
      navLinks={[
        {
          href: `/${locale}/admin/dashboard/billing-events`,
          label: "Billing email previews",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((item) => {
            const href = buildProviderEventsListHref(locale, {
              preset: item.id,
              statusRaw: statusRaw ?? "",
              providerRaw,
              qRaw,
              classificationRaw: classificationFilter ?? "",
            });
            const isActive = activePreset === item.id;

            return (
              <Link
                key={item.id}
                href={href}
                className={
                  isActive
                    ? "inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-3 py-1.5 text-sm text-white transition hover:bg-stone-800"
                    : "inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-900 transition hover:bg-stone-50"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <form
          method="get"
          action={`/${locale}/admin/dashboard/provider-events`}
          className="rounded-2xl border border-stone-200 bg-white p-4"
        >
          {activePreset !== "all" ? (
            <input type="hidden" name="preset" value={activePreset} />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-sm text-stone-700">Status</span>
              <select
                name="status"
                defaultValue={statusFilter ?? ""}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900"
              >
                <option value="">All statuses</option>
                <option value="received">received</option>
                <option value="processed">processed</option>
                <option value="failed">failed</option>
                <option value="rejected">rejected</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-stone-700">Provider</span>
              <input
                name="provider"
                type="text"
                defaultValue={providerRaw}
                placeholder="e.g. stripe"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-stone-700">
                Classification
              </span>
              <select
                name="classification"
                defaultValue={classificationFilter ?? ""}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900"
              >
                <option value="">All classifications</option>
                <option value="test-like">test-like</option>
                <option value="live-like">live-like</option>
                <option value="non-allowed-provider">
                  non-allowed-provider
                </option>
              </select>
            </label>

            <label className="block sm:col-span-2 lg:col-span-2">
              <span className="mb-1 block text-sm text-stone-700">
                Search event id / type / mapped id
              </span>
              <input
                name="q"
                type="search"
                defaultValue={qRaw}
                placeholder="Substring match (case-insensitive)"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:bg-stone-50"
            >
              Apply filters
            </button>
            {hasActiveFilters ? (
              <Link
                href={`/${locale}/admin/dashboard/provider-events`}
                className="text-sm text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        <p className="text-xs text-stone-500">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
          {hasActiveFilters && activeFilterSummary
            ? ` · ${activeFilterSummary}`
            : null}
        </p>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
            {hasActiveFilters
              ? "No provider billing audit events match these filters."
              : "No provider billing audit events found yet."}
          </div>
        ) : null}

        {rows.map((row) => {
          const { classification, replayed } = classifyProviderAudit(row);
          const syncToken = getShortSyncToken(row.sync_result);

          return (
            <div
              key={row.id}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {row.provider}
                </p>
                <h2 className="text-lg font-semibold text-stone-900">
                  {row.provider_event_id}
                </h2>
                <p className="text-sm text-stone-600">
                  Provider event type: {row.provider_event_type ?? "—"}
                </p>
                {(() => {
                  const tokens: string[] = [];
                  if (row.billing_subscription_event_id) {
                    tokens.push("Billing event linked");
                  }
                  if (row.mapped_event_type) {
                    tokens.push(`mapped: ${row.mapped_event_type}`);
                  }
                  if (syncToken) {
                    tokens.push(syncToken);
                  }

                  const line = tokens.join(" · ");
                  return line ? (
                    <p className="text-xs text-stone-500">{line}</p>
                  ) : null;
                })()}
              </div>

              <div className="flex flex-wrap items-center gap-2">
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
                {replayed ? (
                  <div className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                    replayed
                  </div>
                ) : null}
                <Link
                  href={`/${locale}/admin/dashboard/provider-events/${row.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-900 transition hover:bg-stone-50"
                >
                  Open details
                </Link>
              </div>
            </div>

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
                <p className="mt-1 break-all text-sm text-stone-900">
                  {row.mapped_external_event_id ?? "—"}
                </p>
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

            <div className="mt-5 space-y-4">
              <details className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <summary className="cursor-pointer text-sm font-medium text-stone-900">
                  Received headers
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-stone-700">
                  {formatJson(row.received_headers)}
                </pre>
              </details>

              <details className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <summary className="cursor-pointer text-sm font-medium text-stone-900">
                  Parsed payload
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-stone-700">
                  {formatJson(row.parsed_payload)}
                </pre>
              </details>

              <details className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <summary className="cursor-pointer text-sm font-medium text-stone-900">
                  Mapped payload
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-stone-700">
                  {formatJson(row.mapped_payload)}
                </pre>
              </details>

              <details className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <summary className="cursor-pointer text-sm font-medium text-stone-900">
                  Sync result
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-stone-700">
                  {formatJson(row.sync_result)}
                </pre>
              </details>
            </div>
          </div>
            );
        })}
      </div>
    </LocalePageShell>
  );
}
