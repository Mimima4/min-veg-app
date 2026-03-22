import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";

function formatSalary(value: number | null) {
  if (!value) return "—";
  return `${new Intl.NumberFormat("nb-NO").format(value)} NOK`;
}

function formatDemandLevel(value: string) {
  switch (value) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return value;
  }
}

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
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
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
      subtitle="Explore the first profession catalog that will later connect to child planning and recommendations."
      backHref={`/${locale}/app/dashboard`}
      backLabel="Back dashboard"
    >
      <AppPrivateNav locale={locale} currentPath="/app/professions" />

      <div className="mt-6 grid gap-4">
        {professions?.map((profession) => {
          const title = getLocalizedValue(
            profession.title_i18n as Record<string, string>,
            locale as SupportedLocale
          );
          const summary = getLocalizedValue(
            profession.summary_i18n as Record<string, string>,
            locale as SupportedLocale
          );

          const skills = Array.isArray(profession.key_skills)
            ? profession.key_skills.filter(
                (item): item is string => typeof item === "string"
              )
            : [];

          return (
            <div
              key={profession.slug}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {summary}
                  </p>

                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-stone-500">Average salary</dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {formatSalary(profession.avg_salary_nok)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-stone-500">Demand level</dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {formatDemandLevel(profession.demand_level)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-stone-500">
                        Education level
                      </dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {profession.education_level}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-stone-500">Work style</dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {profession.work_style}
                      </dd>
                    </div>
                  </dl>

                  {skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm text-stone-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <Link
                    href={`/${locale}/app/professions/${profession.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                  >
                    Open profession
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </LocalePageShell>
  );
}
