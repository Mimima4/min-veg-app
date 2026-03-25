import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CreateFamilyForm from "./create-family-form";

function getPageCopy(entry?: string) {
  const normalized = (entry ?? "").trim().toLowerCase();

  if (normalized === "trial") {
    return {
      title: "Start 3-day trial",
      subtitle:
        "Create the temporary family container for your fixed 3-day trial.",
    };
  }

  if (normalized === "paid") {
    return {
      title: "Create family account",
      subtitle:
        "Create the base family container before continuing into paid setup.",
    };
  }

  if (normalized === "school") {
    return {
      title: "Create family account",
      subtitle:
        "Create the base family container before continuing school-referred setup.",
    };
  }

  return {
    title: "Create family account",
    subtitle: "Create the base family container for your Min Veg area.",
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

  const { data: existingFamily } = await supabase
    .from("family_accounts")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (existingFamily) {
    redirect(`/${locale}/app/family`);
  }

  const copy = getPageCopy(entry);

  return (
    <LocalePageShell
      locale={locale}
      title={copy.title}
      subtitle={copy.subtitle}
      backHref={`/${locale}/app/family`}
      backLabel="Back family overview"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />
      <CreateFamilyForm locale={locale} userId={user.id} entry={entry} />
    </LocalePageShell>
  );
}
