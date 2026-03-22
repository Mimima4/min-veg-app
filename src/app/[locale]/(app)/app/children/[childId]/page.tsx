import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import { getSuggestedProfessions } from "@/lib/planning/get-suggested-professions";
import EditChildForm from "./edit-child-form";
import RemoveSavedProfessionButton from "./remove-saved-profession-button";

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: child, error } = await supabase
    .from("child_profiles")
    .select(
      "id, display_name, birth_year, school_stage, country_code, relocation_willingness, interests, strengths"
    )
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading this child profile."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  if (!child) {
    redirect(`/${locale}/app/family`);
  }

  const interests = Array.isArray(child.interests)
    ? child.interests.filter((item): item is string => typeof item === "string")
    : [];

  const strengths = Array.isArray(child.strengths)
    ? child.strengths.filter((item): item is string => typeof item === "string")
    : [];

  const { data: savedLinks } = await supabase
    .from("child_profession_interests")
    .select("profession_id, created_at")
    .eq("child_profile_id", child.id)
    .order("created_at", { ascending: true });

  const professionIds =
    savedLinks?.map((item) => item.profession_id).filter(Boolean) ?? [];

  const professionQuery =
    professionIds.length > 0
      ? await supabase
          .from("professions")
          .select(
            "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, key_skills"
          )
          .in("id", professionIds)
      : { data: [], error: null };

  const professionMap = new Map(
    (professionQuery.data ?? []).map((profession) => [profession.id, profession])
  );

  const savedProfessions =
    savedLinks
      ?.map((link) => professionMap.get(link.profession_id))
      .filter(Boolean) ?? [];

  const savedProfessionIds = new Set(
    savedProfessions.map((profession) => profession!.id)
  );

  const { data: allProfessions } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, key_skills"
    )
    .eq("is_active", true);

  const suggestedProfessions = getSuggestedProfessions({
    interests,
    strengths,
    professions: (allProfessions ?? []).filter(
      (profession) => !savedProfessionIds.has(profession.id)
    ),
  }).slice(0, 4);

  return (
    <LocalePageShell
      locale={locale}
      title={child.display_name || "Child profile"}
      subtitle="Review and update the basic details, interests, and strengths for this child profile."
      backHref={`/${locale}/app/family`}
      backLabel="Back family overview"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="space-y-6">
        <EditChildForm
          locale={locale}
          childId={child.id}
          initialDisplayName={child.display_name ?? ""}
          initialBirthYear={child.birth_year}
          initialSchoolStage={
            child.school_stage as
              | "barneskole"
              | "ungdomsskole"
              | "vgs"
              | "student"
              | "young_adult"
          }
          initialCountryCode={child.country_code}
          initialRelocationWillingness={
            child.relocation_willingness as "no" | "maybe" | "yes" | null
          }
          initialInterests={interests}
          initialStrengths={strengths}
        />

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Suggested professions
          </h2>

          {interests.length === 0 && strengths.length === 0 ? (
            <p className="mt-3 text-sm text-stone-600">
              Add interests and strengths to get profession suggestions.
            </p>
          ) : suggestedProfessions.length === 0 ? (
            <p className="mt-3 text-sm text-stone-600">
              No suggested professions yet. Try adding more interests or strengths.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {suggestedProfessions.map((profession) => {
                const title = getLocalizedValue(
                  profession.title_i18n as Record<string, string>,
                  locale as SupportedLocale
                );
                const summary = getLocalizedValue(
                  profession.summary_i18n as Record<string, string>,
                  locale as SupportedLocale
                );

                return (
                  <div
                    key={profession.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <h3 className="text-base font-semibold text-stone-900">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {summary}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {profession.matchedTerms.map((term) => (
                            <span
                              key={term}
                              className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-stone-500">
                          Match score:{" "}
                          <span className="font-medium text-stone-900">
                            {profession.matchScore}
                          </span>
                        </div>

                        <Link
                          href={`/${locale}/app/professions/${profession.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                        >
                          Open profession
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Saved professions
          </h2>

          {!savedProfessions || savedProfessions.length === 0 ? (
            <p className="mt-3 text-sm text-stone-600">
              No professions saved for this child yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {savedProfessions.map((profession) => {
                const title = getLocalizedValue(
                  profession!.title_i18n as Record<string, string>,
                  locale as SupportedLocale
                );
                const summary = getLocalizedValue(
                  profession!.summary_i18n as Record<string, string>,
                  locale as SupportedLocale
                );

                return (
                  <div
                    key={profession!.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <h3 className="text-base font-semibold text-stone-900">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {summary}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/${locale}/app/professions/${profession!.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                        >
                          Open profession
                        </Link>

                        <RemoveSavedProfessionButton
                          childId={child.id}
                          professionId={profession!.id}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LocalePageShell>
  );
}