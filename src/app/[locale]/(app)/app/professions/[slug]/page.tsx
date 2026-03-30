import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import {
  getDerivedStrengthLabel,
  getInterestLabel,
} from "@/lib/planning/child-tag-catalog";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import SaveProfessionForChildForm from "./save-profession-for-child-form";
import { requireAppAccess } from "@/server/billing/require-app-access";

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

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function TagGroup({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">No items listed yet.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProfessionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/professions/${slug}`,
  });
  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profession, error } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, education_notes_i18n"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Profession"
        subtitle="There was a problem loading this profession."
        backHref={`/${locale}/app/professions`}
        backLabel="Back professions"
      >
        <AppPrivateNav locale={locale} currentPath="/app/professions" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  if (!profession) {
    redirect(`/${locale}/app/professions`);
  }

  const title = getLocalizedValue(
    profession.title_i18n as Record<string, string>,
    locale as SupportedLocale
  );
  const summary = getLocalizedValue(
    profession.summary_i18n as Record<string, string>,
    locale as SupportedLocale
  );

  const skills = getStringArray(profession.key_skills);
  const interestLabels = getStringArray(profession.interest_tags).map((id) =>
    getInterestLabel(id, locale as SupportedLocale)
  );
  const strengthLabels = getStringArray(profession.strength_tags).map((id) =>
    getDerivedStrengthLabel(id, locale as SupportedLocale)
  );
  const developmentFocusLabels = getStringArray(
    profession.development_focus_tags
  ).map((id) => getDevelopmentFocusLabel(id, locale as SupportedLocale));
  const schoolSubjectLabels = getStringArray(profession.school_subject_tags).map(
    (id) => getSchoolSubjectLabel(id, locale as SupportedLocale)
  );
  const educationNotes = getLocalizedValue(
    profession.education_notes_i18n as Record<string, string>,
    locale as SupportedLocale
  );

  const { data: familyAccount } = await supabase
    .from("family_accounts")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  const children = familyAccount
    ? await supabase
        .from("child_profiles")
        .select("id, display_name")
        .eq("family_account_id", familyAccount.id)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  const savedLinks =
    familyAccount && children.data && children.data.length > 0
      ? await supabase
          .from("child_profession_interests")
          .select("child_profile_id")
          .eq("profession_id", profession.id)
      : { data: [], error: null };

  const childOptions =
    children.data?.map((child) => ({
      id: child.id,
      displayName: child.display_name || "Unnamed child",
    })) ?? [];

  const initiallySavedChildIds =
    savedLinks.data?.map((item) => item.child_profile_id) ?? [];

  const savedChildNames = childOptions
    .filter((child) => initiallySavedChildIds.includes(child.id))
    .map((child) => child.displayName);

  return (
    <LocalePageShell
      locale={locale}
      title={title}
      subtitle={summary}
      backHref={`/${locale}/app/professions`}
      backLabel="Back professions"
    >
      <AppPrivateNav locale={locale} currentPath="/app/professions" />

      <div className="mt-6 grid gap-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Profession overview
          </h2>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
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
              <dt className="text-sm text-stone-500">Education level</dt>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TagGroup title="Key skills" items={skills} />
          <TagGroup title="Relevant interests" items={interestLabels} />
          <TagGroup title="Helpful strengths" items={strengthLabels} />
          <TagGroup title="School subjects" items={schoolSubjectLabels} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TagGroup
            title="What to develop next"
            items={developmentFocusLabels}
          />

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-sm font-semibold text-stone-900">
              Education path notes
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {educationNotes || "No education notes listed yet."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Save for child
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Save this profession to one of the child profiles in your family
            account.
          </p>

          {savedChildNames.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              Already saved for: {savedChildNames.join(", ")}
            </div>
          ) : null}

          <div className="mt-5 max-w-xl">
            <SaveProfessionForChildForm
              locale={locale}
              professionId={profession.id}
              children={childOptions}
              initiallySavedChildIds={initiallySavedChildIds}
            />
          </div>
        </div>
      </div>
    </LocalePageShell>
  );
}