import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import ProfileForm from "./profile-form";

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
        title="Profile"
        subtitle="There was a problem loading your profile."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/profile" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Profile"
      subtitle="Manage your basic account details and interface settings."
      backHref={`/${locale}/app/dashboard`}
      backLabel="Back dashboard"
    >
      <AppPrivateNav locale={locale} currentPath="/app/profile" />

      <ProfileForm
        userId={user.id}
        userEmail={user.email ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
        initialInterfaceLanguage={
          (profile?.interface_language as "nb" | "nn" | "en") ?? "nb"
        }
        initialCountryCode={profile?.country_code ?? "NO"}
      />
    </LocalePageShell>
  );
}