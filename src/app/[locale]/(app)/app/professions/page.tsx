import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import ProfessionsBrowser from "./professions-browser";

export default async function ProfessionsPage({
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

  const { data: professions, error } = await supabase
    .from("professions")
    .select(
      "slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills"
    )
    .eq("is_active", true)
    .order("slug", { ascending: true });

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Professions"
        subtitle="There was a problem loading the professions catalog."
      >
        <AppPrivateNav locale={locale} currentPath="/app/professions" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Professions"
      subtitle="Explore the profession catalog and search for specific roles quickly."
    >
      <AppPrivateNav locale={locale} currentPath="/app/professions" />

      <ProfessionsBrowser
        locale={locale as SupportedLocale}
        professions={professions ?? []}
      />
    </LocalePageShell>
  );
}