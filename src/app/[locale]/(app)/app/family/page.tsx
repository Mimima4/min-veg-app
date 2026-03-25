import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import UpgradeChildLimitButton from "./upgrade-child-limit-button";
import TrialStatusBanner from "@/components/billing/trial-status-banner";
import { getFamilyPageData } from "@/server/family/overview/get-family-page-data";

function SummaryMetricLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:bg-stone-50"
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
        {value}
      </div>
    </Link>
  );
}

function getBillingStageLabel(value: string): string {
  switch (value) {
    case "demo":
      return "Demo";
    case "trial":
      return "Trial";
    case "paid":
      return "Paid";
    case "inactive":
      return "Inactive";
    default:
      return "Unknown";
  }
}

function formatTrialRemainingLabel(trialEndsAt: string | null): string {
  if (!trialEndsAt) {
    return "—";
  }

  const endsAt = new Date(trialEndsAt);
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();

  if (Number.isNaN(endsAt.getTime()) || diff <= 0) {
    return "Trial expired";
  }

  const totalMinutes = Math.ceil(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

async function resetTrialFamily(locale: string) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: family } = await supabase
    .from("family_accounts")
    .select("id, plan_type, subscription_state")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (!family) {
    redirect(`/${locale}/app/family`);
  }

  const { data: childRows } = await supabase
    .from("child_profiles")
    .select("id")
    .eq("family_account_id", family.id);

  const childIds = (childRows ?? [])
    .map((row) => row.id as string)
    .filter(Boolean);

  if (childIds.length > 0) {
    await supabase
      .from("child_profession_interests")
      .delete()
      .in("child_profile_id", childIds);

    await supabase
      .from("child_saved_education_routes")
      .delete()
      .in("child_profile_id", childIds);
  }

  await supabase.from("child_profiles").delete().eq("family_account_id", family.id);

  await supabase
    .from("family_accounts")
    .delete()
    .eq("id", family.id)
    .eq("primary_user_id", user.id);

  redirect(`/${locale}/app/family/create?entry=trial`);
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const result = await getFamilyPageData({ locale });

  if (result.kind === "redirect") {
    redirect(result.href);
  }

  if (result.kind === "error") {
    return (
      <LocalePageShell
        locale={locale}
        title={result.title}
        subtitle={result.subtitle}
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {result.message}
        </div>
      </LocalePageShell>
    );
  }

  if (result.kind === "no_family") {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="This is where your family account and child profiles will live."
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No family account yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Create your family account to start building the parent and child
            area.
          </p>

          <div className="mt-5">
            <Link
              href={`/${locale}/app/family/create?entry=trial`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Start 3-day trial
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  const { familyAccount, entitlements, children } = result.data;
  const trialState = entitlements.activation?.trialState;
  const trialEndsAt = entitlements.activation?.trialEndsAt ?? null;
  const showTrialBanner = trialState === "active";
  const showExpiredBanner = trialState === "expired";

  return (
    <LocalePageShell
      locale={locale}
      title="Family"
      subtitle="Manage your family account and the child profiles connected to it."
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="mt-6 space-y-6">
        {showTrialBanner ? (
          <TrialStatusBanner
            tone="neutral"
            title="3-day trial active"
            body={`Time remaining: ${formatTrialRemainingLabel(trialEndsAt)}`}
            ctaHref={`/${locale}/pricing?entry=family`}
            ctaLabel="Choose family plan"
          />
        ) : null}

        {showExpiredBanner ? (
          <TrialStatusBanner
            tone="amber"
            title="Trial ended"
            body="The 3-day trial has ended. Your family account is still here, but full access now requires a paid family plan."
            ctaHref={`/${locale}/pricing?entry=family`}
            ctaLabel="Continue with paid family plan"
          />
        ) : null}

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-lg font-semibold text-stone-900">
              Family account
            </h2>

            <form action={resetTrialFamily.bind(null, locale)}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm text-red-700 transition hover:border-red-400 hover:bg-red-50"
              >
                Reset family state
              </button>
            </form>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-stone-500">Plan type</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.plan_type}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Status</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.status}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Billing stage</dt>
              <dd className="mt-1 text-base text-stone-900">
                {getBillingStageLabel(entitlements.billingStage)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Subscription state</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.subscription_state ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Plan code</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.plan_code ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Entry source</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.entry_source ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Activation source</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.activation_source ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Trial ends</dt>
              <dd className="mt-1 text-base text-stone-900">
                {trialEndsAt ? new Date(trialEndsAt).toLocaleString() : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Children</dt>
              <dd className="mt-1 text-base text-stone-900">
                {entitlements.childCount} / {entitlements.maxChildren}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Remaining child slots</dt>
              <dd className="mt-1 text-base text-stone-900">
                {entitlements.remainingChildSlots}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Created at</dt>
              <dd className="mt-1 text-base text-stone-900">
                {new Date(familyAccount.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>

          {entitlements.restrictionMessage ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {entitlements.restrictionMessage}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Child profiles
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Add and manage the children connected to this family account.
              </p>
            </div>

            {entitlements.canCreateChild ? (
              <Link
                href={`/${locale}/app/children/create`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                Create child profile
              </Link>
            ) : entitlements.needsUpgradeForMoreChildren ? (
              <UpgradeChildLimitButton locale={locale} />
            ) : (
              <div className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-stone-600">
                Child creation unavailable
              </div>
            )}
          </div>

          {children.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-base font-semibold text-stone-900">
                No child profiles yet
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Create the first child profile to continue building the family
                planning flow.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                >
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">
                        {child.displayName}
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-stone-500">
                        Fast parent-facing overview with quick access to deeper
                        planning details.
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_12.5rem] lg:items-start">
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm text-stone-500">Birth year</dt>
                          <dd className="mt-1 text-base text-stone-900">
                            {child.birthYear ?? "—"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-stone-500">
                            School stage
                          </dt>
                          <dd className="mt-1 text-base text-stone-900">
                            {child.schoolStageLabel}
                          </dd>
                        </div>
                      </dl>

                      <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <SummaryMetricLink
                            label="Current signals"
                            value={child.currentSignalsCount}
                            href={child.currentSignalsHref}
                          />
                          <SummaryMetricLink
                            label="Derived strengths"
                            value={child.derivedStrengthCount}
                            href={child.derivedStrengthsHref}
                          />
                          <SummaryMetricLink
                            label="Matching professions"
                            value={child.matchingProfessionCount}
                            href={child.matchingProfessionsHref}
                          />
                          <SummaryMetricLink
                            label="Saved professions"
                            value={child.savedProfessionCount}
                            href={child.savedProfessionsHref}
                          />
                          <SummaryMetricLink
                            label="Saved study routes"
                            value={child.savedStudyRouteCount}
                            href={child.savedStudyRoutesHref}
                          />
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 lg:min-w-[12.5rem]">
                        <Link
                          href={child.profileHref}
                          className="inline-flex w-full items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                        >
                          Open child profile
                        </Link>

                        <Link
                          href={child.summaryHref}
                          className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                        >
                          Open child summary
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LocalePageShell>
  );
}