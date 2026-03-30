import { redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import { createClient } from "@/lib/supabase/server";
import { getAccountEntitlements } from "@/server/billing/get-account-entitlements";
import UpgradeChildLimitButton from "../../family/upgrade-child-limit-button";
import CreateChildForm from "./create-child-form";
import { requireAppAccess } from "@/server/billing/require-app-access";

export default async function CreateChildPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/create`,
  });
  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  const supabase = await createClient();

  const entitlementsResult = await getAccountEntitlements({
    locale,
    supabase,
  });

  if (entitlementsResult.kind === "redirect") {
    redirect(entitlementsResult.href);
  }

  if (entitlementsResult.kind === "error") {
    return (
      <LocalePageShell
        locale={locale}
        title={entitlementsResult.title}
        subtitle={entitlementsResult.subtitle}
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {entitlementsResult.message}
        </div>
      </LocalePageShell>
    );
  }

  if (entitlementsResult.kind === "no_family") {
    redirect(`/${locale}/app/family`);
  }

  const entitlements = entitlementsResult.data;

  if (!entitlements.canCreateChild) {
    return (
      <LocalePageShell
        locale={locale}
        title="Create child profile"
        subtitle="Child creation is currently limited by the account entitlements."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Child creation is currently unavailable
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {entitlements.restrictionMessage ??
              "This family account cannot create another child profile right now."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {entitlements.needsUpgradeForMoreChildren ? (
              <UpgradeChildLimitButton locale={locale} />
            ) : null}
          </div>
        </div>
      </LocalePageShell>
    );
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Create child profile"
      subtitle="Add the next child profile to your family account."
      backHref={`/${locale}/app/family`}
      backLabel="Back family overview"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />
      <CreateChildForm
        locale={locale}
        familyAccountId={entitlements.familyAccount.id}
      />
    </LocalePageShell>
  );
}