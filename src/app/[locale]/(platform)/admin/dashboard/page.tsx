import { getPaymentFactsForBillingSubject } from "@/server/billing/get-payment-facts-for-billing-subject";
import { getAccountEntitlements } from "@/server/billing/get-account-entitlements";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import IngestBillingSubscriptionEventForm from "./ingest-billing-subscription-event-form";
import ProcessBillingEventsForm from "./process-billing-events-form";
import ReconcilePaymentUnappliedForm from "./reconcile-payment-unapplied-form";
import SyncBillingEventsForm from "./sync-billing-events-form";
import { ingestBillingSubscriptionEvent } from "@/server/billing/ingest-billing-subscription-event";
import { processBillingNotificationEvents } from "@/server/billing/process-billing-notification-events";
import { reconcilePaymentUnapplied } from "@/server/billing/reconcile-payment-unapplied";
import { syncBillingNotificationEvents } from "@/server/billing/sync-billing-notification-events";

type ProviderAuditHealthRow = {
  id: string;
  status: string;
  replay_count: number | null;
  received_at: string;
};

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const admin = createAdminClient();
  const { data: auditData, error: auditError } = await admin
    .from("provider_billing_event_audits")
    .select("id, status, replay_count, received_at")
    .order("received_at", { ascending: false })
    .limit(200);

  const auditRows: ProviderAuditHealthRow[] = auditError
    ? []
    : (((auditData ?? []) as unknown) as ProviderAuditHealthRow[]);

  let processedCount = 0;
  let failedCount = 0;
  let rejectedCount = 0;
  let replayUsedCount = 0;

  for (const row of auditRows) {
    if (row.status === "processed") {
      processedCount += 1;
    }
    if (row.status === "failed") {
      failedCount += 1;
    }
    if (row.status === "rejected") {
      rejectedCount += 1;
    }
    if ((row.replay_count ?? 0) > 0) {
      replayUsedCount += 1;
    }
  }

  const needsAttentionCount = failedCount + rejectedCount;
  const auditsEmpty = !auditError && auditRows.length === 0;

  async function runBillingEventSync() {
    "use server";

    await syncBillingNotificationEvents();
    revalidatePath(`/${locale}/admin/dashboard`);
  }

  async function runBillingEventProcessing() {
    "use server";

    await processBillingNotificationEvents();
    revalidatePath(`/${locale}/admin/dashboard`);
  }

  async function runBillingSubscriptionEventIngest(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const eventType = String(formData.get("eventType") ?? "").trim();
    const billingCycleRaw = String(formData.get("billingCycle") ?? "").trim();
    const externalEventId = String(formData.get("externalEventId") ?? "").trim();
    const currentPeriodStartsAt = String(
      formData.get("currentPeriodStartsAt") ?? ""
    ).trim();
    const currentPeriodEndsAt = String(
      formData.get("currentPeriodEndsAt") ?? ""
    ).trim();

    await ingestBillingSubscriptionEvent({
      email,
      eventType: eventType as
        | "subscription_started_success"
        | "subscription_renewed_success"
        | "payment_failed"
        | "payment_recovered"
        | "auto_renew_disabled"
        | "auto_renew_enabled"
        | "cancellation_scheduled",
      billingCycle:
        billingCycleRaw === "monthly" || billingCycleRaw === "yearly"
          ? billingCycleRaw
          : null,
      externalEventId: externalEventId || null,
      currentPeriodStartsAt: currentPeriodStartsAt || null,
      currentPeriodEndsAt: currentPeriodEndsAt || null,
      source: "admin_manual",
    });

    revalidatePath(`/${locale}/admin/dashboard`);
    revalidatePath(`/${locale}/admin/dashboard/billing-events`);
  }

  async function runPaymentUnappliedReconciliation() {
    "use server";

    await reconcilePaymentUnapplied({
      locale,
      familyAccountId: "61e089f7-1f53-40f6-871d-ce22ee67d9cd",
    });

    revalidatePath(`/${locale}/admin/dashboard`);
  }


  
  const { data: reconciliationAudits } = await admin
    .from("billing_reconciliation_audits")
    .select("action, provider, previous_last_payment_status, new_last_payment_status, created_at")
    .eq("family_account_id", "61e089f7-1f53-40f6-871d-ce22ee67d9cd")
    .order("created_at", { ascending: false })
    .limit(3);

const paymentFacts = await getPaymentFactsForBillingSubject({
    billingSubjectType: "family",
    billingSubjectId: "61e089f7-1f53-40f6-871d-ce22ee67d9cd",
  });

  const accountEntitlements = await getAccountEntitlements({
    locale,
  });

  return (
    <LocalePageShell
      locale={locale}
      title="Admin Dashboard"
      subtitle={`Placeholder page for /${locale}/admin/dashboard.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/owner/dashboard`, label: "Owner Dashboard" },
        { href: `/${locale}/admin/dashboard/provider-events`, label: "Provider Events" },
      ]}
    >
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Billing notification sync
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Create, refresh, and reconcile pending billing notification events from
            the current family account state.
          </p>

          <div className="mt-5">
            <SyncBillingEventsForm action={runBillingEventSync} />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Billing notification delivery
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Process pending billing notification events and mark them as sent or
            failed.
          </p>

          <div className="mt-5">
            <ProcessBillingEventsForm action={runBillingEventProcessing} />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Billing email previews
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Open a read-only preview page for recent billing notification events
            and rendered email content.
          </p>

          <div className="mt-5">
            <Link
              href={`/${locale}/admin/dashboard/billing-events`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Open billing email previews
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Billing subscription event ingest
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Record a billing subscription event and sync notification candidates
            from it.
          </p>

          <div className="mt-5">
            <IngestBillingSubscriptionEventForm
              action={runBillingSubscriptionEventIngest}
            />

          </div>
        </div>

          
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Reconciliation audit (latest)
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Last reconciliation actions for this family account.
          </p>

          <div className="mt-4 space-y-3 text-sm text-stone-900">
            {!reconciliationAudits || reconciliationAudits.length === 0 ? (
              <p className="text-stone-500">
                No reconciliation actions yet.
              </p>
            ) : (
              reconciliationAudits.map((row, idx) => (
                <div key={idx} className="rounded-xl border border-stone-200 p-3">
                  <p>
                    <span className="font-medium text-stone-600">Action:</span>{" "}
                    {row.action}
                  </p>
                  <p>
                    <span className="font-medium text-stone-600">Provider:</span>{" "}
                    {row.provider ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-600">Change:</span>{" "}
                    {row.previous_last_payment_status ?? "—"} → {row.new_last_payment_status ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium text-stone-600">At:</span>{" "}
                    {row.created_at}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>


        <div className="rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-900">
            Payment summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Read-only summary of payment facts for the current test family billing subject.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Latest valid payment
              </p>
              <p className="mt-2 text-sm text-stone-900">
                Provider: {paymentFacts.latestValidPayment?.provider ?? "—"}
              </p>
              <p className="mt-1 text-sm text-stone-900">
                Amount: {paymentFacts.latestValidPayment ? `${paymentFacts.latestValidPayment.amount} ${paymentFacts.latestValidPayment.currency}` : "—"}
              </p>
              <p className="mt-1 text-sm text-stone-900">
                Paid at: {paymentFacts.latestValidPayment?.paidAt ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Latest intent
              </p>
              <p className="mt-2 text-sm text-stone-900">
                Plan: {paymentFacts.latestIntent?.planCode ?? "—"}
              </p>
              <p className="mt-1 text-sm text-stone-900">
                Cycle: {paymentFacts.latestIntent?.billingCycle ?? "—"}
              </p>
              <p className="mt-1 text-sm text-stone-900">
                Status: {paymentFacts.latestIntent?.status ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Payment answers
              </p>
              <p className="mt-2 text-sm text-stone-900">
                Valid payment: {paymentFacts.paymentAnswers.hasValidProviderPayment ? "Yes" : "No"}
              </p>
              <p className="mt-1 text-sm text-stone-900">
                Blocked intent: {paymentFacts.paymentAnswers.hasBlockedIntent ? "Yes" : "No"}
              </p>
              <p className="mt-1 text-sm text-stone-900">
                Latest payment at: {paymentFacts.paymentAnswers.latestPaymentAt ?? "—"}
              </p>
            </div>
          </div>
        </div>


        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Billing diagnostics
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Compact read-only summary from the billing contour for the current test family.
          </p>

          <div className="mt-5 space-y-2 text-sm text-stone-900">
            <p>
              <span className="font-medium text-stone-600">Mismatch:</span>{" "}
              {accountEntitlements.kind === "ok" && accountEntitlements.data.billingDiagnostics.hasPaymentMismatch
                ? "Yes"
                : "No"}
            </p>
            <p>
              <span className="font-medium text-stone-600">Reason:</span>{" "}
              {accountEntitlements.kind === "ok"
                ? accountEntitlements.data.billingDiagnostics.reason ?? "—"
                : "—"}
            </p>
            <p>
              <span className="font-medium text-stone-600">Latest payment at:</span>{" "}
              {paymentFacts.paymentAnswers.latestPaymentAt ?? "—"}
            </p>
            <p>
              <span className="font-medium text-stone-600">Reconciliation:</span>{" "}
              {accountEntitlements.kind === "ok"
                ? accountEntitlements.data.billingDiagnostics.reconciliationStatus
                : "—"}
            </p>
            <p>
              <span className="font-medium text-stone-600">Recommendation:</span>{" "}
              {accountEntitlements.kind === "ok"
                ? accountEntitlements.data.billingDiagnostics.reconciliationRecommendation
                : "—"}
            </p>
          </div>

          {accountEntitlements.kind === "ok" &&
          accountEntitlements.data.billingDiagnostics.reconciliationStatus === "payment_unapplied" &&
          accountEntitlements.data.billingDiagnostics.reconciliationRecommendation ===
            "safe_reconcile_payment_to_billing" ? (
            <div className="mt-5">
              <ReconcilePaymentUnappliedForm
                action={runPaymentUnappliedReconciliation}
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-900">
            Provider event health
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Quick visibility into recent webhook and provider processing state
            (last 200 audit rows). Open a slice on the audits page with one click.
          </p>

          {auditError ? (
            <p className="mt-3 text-xs text-stone-500">
              Unable to load provider audit summary: {auditError.message}
            </p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Link
              href={`/${locale}/admin/dashboard/provider-events?preset=processed`}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100"
            >
              <p className="text-2xl font-semibold tabular-nums text-stone-900">
                {processedCount}
              </p>
              <p className="mt-1 text-sm text-stone-600">Processed</p>
            </Link>
            <Link
              href={`/${locale}/admin/dashboard/provider-events?preset=failed`}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100"
            >
              <p className="text-2xl font-semibold tabular-nums text-stone-900">
                {failedCount}
              </p>
              <p className="mt-1 text-sm text-stone-600">Failed</p>
            </Link>
            <Link
              href={`/${locale}/admin/dashboard/provider-events?preset=rejected`}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100"
            >
              <p className="text-2xl font-semibold tabular-nums text-stone-900">
                {rejectedCount}
              </p>
              <p className="mt-1 text-sm text-stone-600">Rejected</p>
            </Link>
            <Link
              href={`/${locale}/admin/dashboard/provider-events?preset=needs-attention`}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100"
            >
              <p className="text-2xl font-semibold tabular-nums text-stone-900">
                {needsAttentionCount}
              </p>
              <p className="mt-1 text-sm text-stone-600">Needs attention</p>
            </Link>
            <Link
              href={`/${locale}/admin/dashboard/provider-events?preset=replay-used`}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:bg-stone-100"
            >
              <p className="text-2xl font-semibold tabular-nums text-stone-900">
                {replayUsedCount}
              </p>
              <p className="mt-1 text-sm text-stone-600">Replay used</p>
            </Link>
          </div>


          {auditsEmpty ? (
            <p className="mt-3 text-xs text-stone-500">
              No provider audit events yet.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-900">
            Provider event audits
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Open a read-only page for provider/webhook audit events, replay history,
            mapping results, and processing errors.
          </p>

          <div className="mt-5">
            <Link
              href={`/${locale}/admin/dashboard/provider-events`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Open provider event audits
            </Link>
          </div>
        </div>
      </div>
    </LocalePageShell>
  );
}

