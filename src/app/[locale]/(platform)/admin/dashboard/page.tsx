import { revalidatePath } from "next/cache";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import SyncBillingEventsForm from "./sync-billing-events-form";
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
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          Billing notification sync
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Create or refresh pending billing notification events from the current
          family account state.
        </p>

        <div className="mt-5">
          <SyncBillingEventsForm action={runBillingEventSync} />
        </div>
      </div>
    </LocalePageShell>
  );
}

