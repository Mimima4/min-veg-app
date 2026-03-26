import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CreateFamilyForm from "./create-family-form";

type EntryMode = "trial" | "paid";

function getPageCopy(entry: EntryMode) {
  if (entry === "paid") {
    return {
      title: "Create family account",
      subtitle: "Create the family container for your active paid access.",
    };
  }

  return {
    title: "Start 3-day trial",
    subtitle: "Create the temporary family container for your fixed 3-day trial.",
  };
}

export default async function CreateFamilyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ entry?: string }>;
}) {
  const { locale } = await params;
  const { entry } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const hasPermanentPaidAccess =
    user.app_metadata?.admin_access === true ||
    user.app_metadata?.role === "platform_admin";

  const trialUsed = Boolean(user.user_metadata?.trial_used);
  const entrySource =
    typeof user.user_metadata?.entry_source === "string"
      ? user.user_metadata.entry_source
      : null;

  const trialAvailable =
    entrySource === "trial" && !trialUsed && !hasPermanentPaidAccess;

  const requestedEntry: EntryMode | null =
    entry === "paid" ? "paid" : entry === "trial" ? "trial" : null;

  if (requestedEntry === "paid" && !hasPermanentPaidAccess) {
    redirect(`/${locale}/app/family`);
  }

  if (requestedEntry === "trial" && !trialAvailable) {
    redirect(`/${locale}/app/family`);
  }

  if (!requestedEntry) {
    redirect(`/${locale}/app/family`);
  }

  const { data: existingFamily } = await supabase
    .from("family_accounts")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (existingFamily) {
    redirect(`/${locale}/app/family`);
  }

  const copy = getPageCopy(requestedEntry);

  return (
    <LocalePageShell
      locale={locale}
      title={copy.title}
      subtitle={copy.subtitle}
      backHref={`/${locale}/app/family`}
      backLabel="Back family overview"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />
      <CreateFamilyForm
        locale={locale}
        userId={user.id}
        entry={requestedEntry}
      />
    </LocalePageShell>
  );
}