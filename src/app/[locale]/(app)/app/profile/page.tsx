import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import SignOutButton from "@/components/auth/sign-out-button";
import ProfileForm from "./profile-form";
import { getUserAccessState } from "@/server/billing/get-user-access-state";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("display_name, interface_language, country_code")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Account"
        subtitle="There was a problem loading your account."
      >
        <AppPrivateNav locale={locale} currentPath="/app/profile" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  const accessState = await getUserAccessState();
  const hasSavedProfile = Boolean(profile?.display_name?.trim());
  const nextStep = (() => {
    switch (accessState.kind) {
      case "no_family_paid":
        return {
          label: "Create family account",
          href: `/${locale}/app/family/create?entry=paid`,
          helper:
            "Your paid access is already active. The next step is creating the family area.",
        };
      case "no_family_trial_available":
        return {
          label: "Start 3-day trial",
          href: `/${locale}/app/family/create?entry=trial`,
          helper:
            "Trial access is available for this account. Start the trial to create the family area.",
        };
      case "no_family_no_trial":
        return {
          label: "Choose family plan",
          href: `/${locale}/pricing?entry=family`,
          helper:
            "Trial is no longer available for this account. Choose a family plan to continue.",
        };
      case "institutional_pending":
        return {
          label: "View institutional pricing",
          href: `/${locale}/pricing?entry=institutional`,
          helper:
            "This account is waiting for an institutional activation path.",
        };
      case "paid_active":
      case "trial_active":
      case "trial_expired":
      case "inactive_access":
        return {
          label: "Open family",
          href: `/${locale}/app/family`,
          helper:
            "Your family area already exists or is the next place to continue.",
        };
      default:
        return {
          label: "Open family",
          href: `/${locale}/app/family`,
          helper:
            "Your family area already exists or is the next place to continue.",
        };
    }
  })();

  return (
    <LocalePageShell
      locale={locale}
      title="Account"
      subtitle="Manage your personal account details and interface settings."
    >
      <AppPrivateNav locale={locale} currentPath="/app/profile" />

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Signed in as</p>
          <p className="mt-1 text-base font-medium text-stone-900">
            {profile?.display_name?.trim() || user.email}
          </p>
        </div>

        {hasSavedProfile ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-base font-semibold text-stone-900">Next step</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Your account is ready. Continue with the next step below.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              {nextStep.helper}
            </p>

            <div className="mt-4">
              <Link
                href={nextStep.href}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                {nextStep.label}
              </Link>
            </div>
          </div>
        ) : null}

        <ProfileForm
          userId={user.id}
          userEmail={user.email ?? ""}
          initialDisplayName={profile?.display_name ?? ""}
          initialInterfaceLanguage={
            (profile?.interface_language as "nb" | "nn" | "en") ?? "nb"
          }
          initialCountryCode={profile?.country_code ?? "NO"}
        />

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold text-stone-900">
            Account actions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Manage password and session actions for this account.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/forgot-password?from=account`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Reset password
            </Link>

            <SignOutButton locale={locale} />
          </div>
        </div>
      </div>
    </LocalePageShell>
  );
}