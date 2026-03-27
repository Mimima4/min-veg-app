import { revalidatePath } from "next/cache";
import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import ProcessBillingEventsForm from "./process-billing-events-form";
import SyncBillingEventsForm from "./sync-billing-events-form";
import { processBillingNotificationEvents } from "@/server/billing/process-billing-notification-events";
import { syncBillingNotificationEvents } from "@/server/billing/sync-billing-notification-events";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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

  return (
    <LocalePageShell
      locale={locale}
      title="Admin Dashboard"
      subtitle={`Placeholder page for /${locale}/admin/dashboard.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/owner/dashboard`, label: "Owner Dashboard" },
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
      </div>
    </LocalePageShell>
  );
}

