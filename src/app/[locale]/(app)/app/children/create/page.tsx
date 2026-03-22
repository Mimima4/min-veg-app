import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CreateChildForm from "./create-child-form";

export default async function CreateChildPage({
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

  const { data: familyAccount } = await supabase
    .from("family_accounts")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (!familyAccount) {
    redirect(`/${locale}/app/family`);
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Create child profile"
      subtitle="Add the first child profile to your family account."
      backHref={`/${locale}/app/family`}
      backLabel="Back family overview"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />
      <CreateChildForm locale={locale} familyAccountId={familyAccount.id} />
    </LocalePageShell>
  );
}