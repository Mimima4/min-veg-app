import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import UpgradeChildLimitButton from "./upgrade-child-limit-button";
import ResetFamilyStateButton from "./reset-family-state-button";
import { getFamilyPageData } from "@/server/family/overview/get-family-page-data";
import { getUserAccessState } from "@/server/billing/get-user-access-state";
import { getActiveComplimentaryAccessGrant } from "@/server/billing/get-active-complimentary-access-grant";
import { getFamilySchoolOffer } from "@/server/billing/get-family-school-offer";
import { requireAppAccess } from "@/server/billing/require-app-access";

function SummaryMetricLink({
  label,
  value,
  href,
  disabled = false,
}: {
  label: string;
  value: string | number;
  href: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-4 opacity-70">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
          {value}
        </div>
      </div>
    );
  }

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

/** Human-readable time remaining until `endsAtIso`, or null if unknown / already passed. */
function formatRemainingUntilLabel(endsAtIso: string | null): string | null {
  if (!endsAtIso) {
    return null;
  }

  const endsAt = new Date(endsAtIso);
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();

  if (Number.isNaN(endsAt.getTime()) || diff <= 0) {
    return null;
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

function formatCountdown(endsAtIso: string | null): string {
  return formatRemainingUntilLabel(endsAtIso) ?? "—";
}

function accessContinuesUntilHumanLabel(endsAtIso: string | null): string {
  if (!endsAtIso) {
    return "—";
  }

  const remaining = formatRemainingUntilLabel(endsAtIso);
  if (remaining) {
    return remaining;
  }

  return formatDateTime(endsAtIso);
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

function inferBillingCycle(
  planCode: string | null | undefined,
  planType: string | null | undefined
): "monthly" | "yearly" | null {
  const normalized = `${planCode ?? ""} ${planType ?? ""}`.toLowerCase();

  if (normalized.includes("yearly") || normalized.includes("annual")) {
    return "yearly";
  }

  if (normalized.includes("monthly") || normalized.includes("month")) {
    return "monthly";
  }

  return null;
}

function DisabledActionPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-stone-600 opacity-70">
      {label}
    </div>
  );
}

async function resetFamilySetup(locale: string) {
  "use server";

  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: family } = await admin
    .from("family_accounts")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (!family) {
    redirect(`/${locale}/app/family`);
  }

  const { data: childIds } = await admin
    .from("child_profiles")
    .select("id")
    .eq("family_account_id", family.id);

  const ids = (childIds ?? []).map((item) => item.id);

  if (ids.length > 0) {
    await admin
      .from("child_profession_interests")
      .delete()
      .in("child_profile_id", ids);

    await admin
      .from("child_saved_education_routes")
      .delete()
      .in("child_profile_id", ids);

    await admin.from("child_profiles").delete().in("id", ids);
  }

  await admin.from("family_accounts").delete().eq("id", family.id);

  redirect(`/${locale}/app/family`);
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAppAccess({
    locale,
    pathname: `/${locale}/app/family`,
  });

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
    const accessState = await getUserAccessState();

    if (accessState.kind === "no_family_paid") {
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
                href={`/${locale}/app/family/create?entry=paid`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                Create family account
              </Link>
            </div>
          </div>
        </LocalePageShell>
      );
    }

    if (accessState.kind === "no_family_trial_available") {
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
              Start your 3-day trial to create the family area.
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
            Choose a family plan to continue.
          </p>

          <div className="mt-5">
            <Link
              href={`/${locale}/pricing?entry=family`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Choose family plan
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  const { familyAccount, entitlements, children } = result.data;
  const accessState = await getUserAccessState();
  const isFamilyPartner = accessState.isFamilyPartner === true;
  const admin = createAdminClient();
  const readonlyFamilyAccess =
    accessState.kind === "trial_expired" ||
    accessState.kind === "inactive_access";

  const { data: parentLink } = await admin
    .from("family_partner_links")
    .select("primary_user_id, partner_user_id, partner_email, status")
    .eq("family_account_id", familyAccount.id)
    .maybeSingle();

  let primaryParentLabel =
    accessState.displayName?.trim() || accessState.email || "—";
  let familyPartnerLabel = "Not added yet";

  if (parentLink?.primary_user_id) {
    const { data: primaryProfile } = await admin
      .from("user_profiles")
      .select("display_name, email")
      .eq("id", parentLink.primary_user_id)
      .maybeSingle();

    primaryParentLabel =
      primaryProfile?.display_name?.trim() ||
      primaryProfile?.email ||
      primaryParentLabel;
  }

  if (parentLink?.status === "linked") {
    if (parentLink.partner_user_id) {
      const { data: partnerProfile } = await admin
        .from("user_profiles")
        .select("display_name, email")
        .eq("id", parentLink.partner_user_id)
        .maybeSingle();

      familyPartnerLabel =
        partnerProfile?.display_name?.trim() ||
        partnerProfile?.email ||
        parentLink.partner_email ||
        "Not added yet";
    } else if (parentLink.partner_email) {
      familyPartnerLabel = parentLink.partner_email;
    }
  }

  const trialState = entitlements.activation?.trialState;
  const trialEndsAt = entitlements.activation?.trialEndsAt ?? null;
  const lifecycleState = entitlements.activation.subscriptionLifecycleState;
  const billingCycle = inferBillingCycle(
    familyAccount.plan_code,
    familyAccount.plan_type
  );
  const gracePeriodEndsAt = entitlements.activation.gracePeriodEndsAt ?? null;
  const graceCountdown = formatRemainingUntilLabel(gracePeriodEndsAt);
  const graceFallbackDate =
    !graceCountdown && gracePeriodEndsAt
      ? formatDateTime(gracePeriodEndsAt)
      : null;
  const gracePeriodSecondaryLine = (() => {
    if (graceCountdown || graceFallbackDate) {
      return null;
    }
    const periodEnd = entitlements.activation.currentPeriodEndsAt ?? null;
    if (!periodEnd) {
      return null;
    }
    const rem = formatRemainingUntilLabel(periodEnd);
    if (rem) {
      return { prefix: "Access may stop in:", value: rem };
    }
    return {
      prefix: "Current paid period reference:",
      value: formatDateTime(periodEnd),
    };
  })();

  const graceBillingCycleNote =
    billingCycle === "monthly"
      ? "For monthly plans, the grace window after a failed payment is often around 24 hours — exact timing depends on your provider."
      : billingCycle === "yearly"
        ? "For yearly plans, the grace window after a failed payment is often around 72 hours — exact timing depends on your provider."
        : null;

  const canceledAccessEndsAt = entitlements.activation.currentPeriodEndsAt;
  const isGracePeriod =
    lifecycleState === "grace_period" ||
    (entitlements.activation.billingStage as string) === "grace";
  const isCanceledWithAccess =
    lifecycleState === "canceled" && entitlements.activation.hasActiveAccess;
  const activeComplimentaryGrant = await getActiveComplimentaryAccessGrant({
    familyAccountId: familyAccount.id,
  });
  const schoolOffer = await getFamilySchoolOffer({
    familyAccountId: familyAccount.id,
  });
  const accessSourceLabel = activeComplimentaryGrant
    ? "Complimentary"
    : trialState === "active" || trialState === "expired"
      ? "Trial"
      : entitlements.activation.hasActiveAccess
        ? "Paid"
        : "Inactive";
  const activeUntilLabel = activeComplimentaryGrant
    ? activeComplimentaryGrant.ends_at
      ? formatDateTime(activeComplimentaryGrant.ends_at)
      : "Permanent"
    : trialState === "active" || trialState === "expired"
      ? formatDateTime(trialEndsAt)
      : formatDateTime(entitlements.activation.currentPeriodEndsAt ?? null);

  return (
    <LocalePageShell
      locale={locale}
      title="Family"
      subtitle="Manage your family account and the child profiles connected to it."
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="mt-6 space-y-6">
        {trialState === "active" ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-base font-semibold text-stone-900">
              3-day trial active
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-900">
              Trial ends in: {formatCountdown(trialEndsAt)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-blue-900/80">
              After the trial ends, your account will stay saved.
            </p>

            <div className="mt-4">
              {readonlyFamilyAccess || isFamilyPartner ? (
                <DisabledActionPill label="Choose family plan" />
              ) : (
                <Link
                  href={`/${locale}/pricing?entry=family`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                >
                  Choose family plan
                </Link>
              )}
            </div>
          </div>
        ) : null}

        {trialState === "expired" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-base font-semibold text-stone-900">
              Trial ended
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              The 3-day trial has ended. Your family data is still here, but
              full access now requires a paid family plan.
            </p>

            <div className="mt-4">
              <Link
                href={`/${locale}/pricing?entry=family`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Continue with paid family plan
              </Link>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-lg font-semibold text-stone-900">
              Family account
            </h2>

            <ResetFamilyStateButton
              action={resetFamilySetup.bind(null, locale)}
              disabled={readonlyFamilyAccess}
            />
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-stone-500">Plan type</dt>
              <dd className="mt-1 text-base">
                <Link
                  href={`/${locale}/pricing?entry=family`}
                  className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  {familyAccount.plan_type}
                </Link>
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Children</dt>
              <dd className="mt-1 text-base text-stone-900">
                {entitlements.childCount} / {entitlements.maxChildren}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Created at</dt>
              <dd className="mt-1 text-base text-stone-900">
                {formatDateTime(familyAccount.created_at)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Access source</dt>
              <dd className="mt-1 text-base text-stone-900">
                {accessSourceLabel}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Active until</dt>
              <dd className="mt-1 text-base text-stone-900">
                {activeUntilLabel}
              </dd>
            </div>

            {schoolOffer ? (
              <div>
                <dt className="text-sm text-stone-500">School offer active until</dt>
                <dd className="mt-1 text-base text-stone-900">
                  {formatDateTime(schoolOffer.validUntil)}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-900">Parents</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-stone-500">Primary parent</dt>
                <dd className="text-stone-900">{primaryParentLabel}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Family partner</dt>
                <dd className="text-stone-900">{familyPartnerLabel}</dd>
              </div>
            </dl>
          </div>

          {isGracePeriod ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-stone-800">
              <h3 className="font-semibold text-stone-900">
                Grace period active
              </h3>
              <p className="mt-2 leading-relaxed text-stone-700">
                Your access is still active for now, but it may stop soon if
                payment is not resolved.
              </p>
              <p className="mt-3 text-stone-800">
                <span className="text-stone-600">Access ends in:&nbsp;</span>
                <span className="font-medium">
                  {formatCountdown(
                    gracePeriodEndsAt ?? entitlements.activation.currentPeriodEndsAt
                  )}
                </span>
              </p>
              {graceCountdown ? (
                <p className="mt-3 text-stone-800">
                  <span className="text-stone-600">
                    Access may stop in:&nbsp;
                  </span>
                  <span className="font-medium">{graceCountdown}</span>
                </p>
              ) : graceFallbackDate ? (
                <p className="mt-3 text-stone-700">
                  <span className="text-stone-600">Grace reference:&nbsp;</span>
                  {graceFallbackDate}
                </p>
              ) : gracePeriodSecondaryLine ? (
                <p className="mt-3 text-stone-800">
                  <span className="text-stone-600">
                    {gracePeriodSecondaryLine.prefix}&nbsp;
                  </span>
                  <span className="font-medium">
                    {gracePeriodSecondaryLine.value}
                  </span>
                </p>
              ) : null}
              {graceBillingCycleNote ? (
                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                  {graceBillingCycleNote}
                </p>
              ) : null}
            </div>
          ) : null}

          {isCanceledWithAccess ? (
            <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              <h3 className="font-semibold text-stone-900">
                Access remains active
              </h3>
              <p className="mt-2 leading-relaxed text-stone-600">
                Auto-renew is off. Your access stays active until the end of the
                current paid period.
              </p>
              <p className="mt-3 text-stone-700">
                <span className="text-stone-600">Access active until:&nbsp;</span>
                {formatDateTime(canceledAccessEndsAt)}
              </p>
              <p className="mt-3 text-stone-800">
                <span className="text-stone-600">
                  Countdown:&nbsp;
                </span>
                <span className="font-medium">
                  {formatCountdown(canceledAccessEndsAt)}
                </span>
              </p>
            </div>
          ) : null}

          {readonlyFamilyAccess ? (
            <div className="mt-5 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p className="leading-relaxed">
                This account is currently in read-only access. You can review
                family information, but actions and deeper planning routes are
                disabled.
              </p>
            </div>
          ) : null}

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

            {readonlyFamilyAccess ? (
              entitlements.canCreateChild ? (
                <DisabledActionPill label="Create child profile" />
              ) : entitlements.needsUpgradeForMoreChildren ? (
                <DisabledActionPill label="Child limit reached" />
              ) : (
                <DisabledActionPill label="Child creation unavailable" />
              )
            ) : entitlements.canCreateChild ? (
              <Link
                href={`/${locale}/app/children/create`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                Create child profile
              </Link>
            ) : entitlements.needsUpgradeForMoreChildren ? (
              isFamilyPartner ? (
                <DisabledActionPill label="Child limit reached" />
              ) : (
              <UpgradeChildLimitButton locale={locale} />
              )
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
                            disabled={readonlyFamilyAccess}
                          />
                          <SummaryMetricLink
                            label="Derived strengths"
                            value={child.derivedStrengthCount}
                            href={child.derivedStrengthsHref}
                            disabled={readonlyFamilyAccess}
                          />
                          <SummaryMetricLink
                            label="Matching professions"
                            value={child.matchingProfessionCount}
                            href={child.matchingProfessionsHref}
                            disabled={readonlyFamilyAccess}
                          />
                          <SummaryMetricLink
                            label="Saved professions"
                            value={child.savedProfessionCount}
                            href={child.savedProfessionsHref}
                            disabled={readonlyFamilyAccess}
                          />
                          <SummaryMetricLink
                            label="Saved study routes"
                            value={child.savedStudyRouteCount}
                            href={child.savedStudyRoutesHref}
                            disabled={readonlyFamilyAccess}
                          />
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 lg:min-w-[12.5rem]">
                        {readonlyFamilyAccess ? (
                          <>
                            <DisabledActionPill label="Open child profile" />
                            <DisabledActionPill label="Open child summary" />
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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