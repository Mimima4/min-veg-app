import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import { getUserAccessState } from "@/server/billing/get-user-access-state";
import type { UserAccessState } from "@/server/billing/get-user-access-state";

export default async function ResolveAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  const accessState = await getUserAccessState();
  const hasNextParam =
    typeof resolvedSearchParams.next === "string" &&
    resolvedSearchParams.next.trim().length > 0;

  if (accessState.kind === "anonymous") {
    redirect(`/${locale}/login`);
  }

  if (
    accessState.kind === "paid_active" ||
    accessState.kind === "trial_active" ||
    accessState.kind === "no_family_paid" ||
    accessState.kind === "no_family_trial_available" ||
    accessState.kind === "no_family_no_trial"
  ) {
    redirect(`/${locale}/app/family`);
  }

  if (accessState.kind === "institutional_pending") {
    return (
      <LocalePageShell
        locale={locale}
        title="Institutional access is still being prepared"
        subtitle="This usually takes a little time. You can continue later."
        backHref={`/${locale}/`}
        backLabel="Back"
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">
          {accessState.displayName ? (
            <p className="mb-3 text-sm text-stone-700">
              Hi {accessState.displayName} — your access request is being
              prepared.
            </p>
          ) : null}

          {hasNextParam ? (
            <p className="mb-3 text-xs text-stone-500">
              You were redirected here because this route requires active
              access.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/${locale}/pricing?entry=institutional`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
            >
              Continue to pricing
            </Link>
            <Link
              href={`/${locale}/app/family`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:bg-stone-50"
            >
              Go to family app
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  if (accessState.kind === "trial_expired") {
    return (
      <LocalePageShell
        locale={locale}
        title="Your trial has ended"
        subtitle="You can activate a family plan to regain access."
        backHref={`/${locale}/`}
        backLabel="Back"
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">
          {accessState.displayName ? (
            <p className="mb-3 text-sm text-stone-700">
              Hi {accessState.displayName} — your trial has ended.
            </p>
          ) : null}

          {hasNextParam ? (
            <p className="mb-3 text-xs text-stone-500">
              You were redirected here because this route requires active
              access.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/${locale}/pricing?entry=family`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
            >
              Choose a family plan
            </Link>
            <Link
              href={`/${locale}/app/profile`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:bg-stone-50"
            >
              View profile
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  if (accessState.kind === "inactive_access") {
    const activation = accessState.activation;

    const isPastDue = activation.subscriptionLifecycleState === "past_due";
    const hasPaymentFailed =
      Boolean(activation.paymentFailedAt) ||
      activation.lastPaymentStatus?.toLowerCase() === "failed";

    const isGracePeriod = activation.subscriptionLifecycleState === "grace_period";

    let explanation =
      "This account is currently not active. You can renew to regain access.";

    if (isPastDue || hasPaymentFailed) {
      explanation =
        "Payment status is currently past due. Renew your plan to regain access.";
    } else if (isGracePeriod) {
      explanation =
        "Your account is currently in a grace period. Renew soon to keep access.";
    }

    return (
      <LocalePageShell
        locale={locale}
        title="This account is not currently active"
        subtitle={explanation}
        backHref={`/${locale}/`}
        backLabel="Back"
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">
          {accessState.displayName ? (
            <p className="mb-3 text-sm text-stone-700">
              Hi {accessState.displayName} — we&apos;ll get you back when your
              subscription is active.
            </p>
          ) : null}

          {hasNextParam ? (
            <p className="mb-3 text-xs text-stone-500">
              You were redirected here because this route requires active
              access.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/${locale}/pricing?entry=family`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
            >
              Renew your access
            </Link>
            <Link
              href={`/${locale}/app/profile`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:bg-stone-50"
            >
              View profile
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  // Should be unreachable if access gating logic stays in sync.
  return (
    <LocalePageShell
      locale={locale}
      title="Access resolution needed"
      subtitle="Please return to your account and try again."
      backHref={`/${locale}/`}
      backLabel="Back"
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600" />
    </LocalePageShell>
  );
}