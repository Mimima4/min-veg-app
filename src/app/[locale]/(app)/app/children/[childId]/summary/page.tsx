import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import {
  coerceInterestIds,
  coerceObservedTraitIds,
  getDerivedStrengthIds,
  getDerivedStrengthLabel,
  getInterestLabel,
  getObservedTraitLabel,
} from "@/lib/planning/child-tag-catalog";
import { getChildSummary } from "@/lib/planning/get-child-summary";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import type { EducationLevel } from "@/lib/planning/education-route";
import SaveProfessionToChildButton from "../save-profession-to-child-button";

type SchoolStage =
  | "barneskole"
  | "ungdomsskole"
  | "vgs"
  | "student"
  | "young_adult";

type RelocationWillingness = "no" | "maybe" | "yes";

type DesiredIncomeBand =
  | "open"
  | "up_to_600k"
  | "600k_to_800k"
  | "800k_plus";

type PreferredWorkStyle =
  | "open"
  | "onsite"
  | "hybrid"
  | "remote"
  | "mixed";

type PreferredEducationLevel = EducationLevel;

type NextStepCard = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

const SCHOOL_STAGE_LABELS: Record<
  SchoolStage,
  Record<SupportedLocale, string>
> = {
  barneskole: {
    nb: "Barneskole",
    nn: "Barneskule",
    en: "Primary school",
  },
  ungdomsskole: {
    nb: "Ungdomsskole",
    nn: "Ungdomsskule",
    en: "Lower secondary school",
  },
  vgs: {
    nb: "Videregående skole",
    nn: "Vidaregåande skule",
    en: "Upper secondary school",
  },
  student: {
    nb: "Student",
    nn: "Student",
    en: "Student",
  },
  young_adult: {
    nb: "Ung voksen",
    nn: "Ung vaksen",
    en: "Young adult",
  },
};

const RELOCATION_LABELS: Record<
  RelocationWillingness,
  Record<SupportedLocale, string>
> = {
  no: {
    nb: "Nei",
    nn: "Nei",
    en: "No",
  },
  maybe: {
    nb: "Kanskje",
    nn: "Kanskje",
    en: "Maybe",
  },
  yes: {
    nb: "Ja",
    nn: "Ja",
    en: "Yes",
  },
};

const INCOME_BAND_LABELS: Record<
  DesiredIncomeBand,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  up_to_600k: {
    nb: "Opptil 600k NOK",
    nn: "Opptil 600k NOK",
    en: "Up to 600k NOK",
  },
  "600k_to_800k": {
    nb: "600k til 800k NOK",
    nn: "600k til 800k NOK",
    en: "600k to 800k NOK",
  },
  "800k_plus": {
    nb: "800k+ NOK",
    nn: "800k+ NOK",
    en: "800k+ NOK",
  },
};

const WORK_STYLE_LABELS: Record<
  PreferredWorkStyle,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  onsite: {
    nb: "På stedet",
    nn: "På staden",
    en: "On-site",
  },
  hybrid: {
    nb: "Hybrid",
    nn: "Hybrid",
    en: "Hybrid",
  },
  remote: {
    nb: "Fjernarbeid",
    nn: "Fjernarbeid",
    en: "Remote",
  },
  mixed: {
    nb: "Blandet",
    nn: "Blanda",
    en: "Mixed",
  },
};

const EDUCATION_LEVEL_LABELS: Record<
  PreferredEducationLevel,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  certificate: {
    nb: "Sertifikat",
    nn: "Sertifikat",
    en: "Certificate",
  },
  vocational: {
    nb: "Yrkesfaglig",
    nn: "Yrkesfagleg",
    en: "Vocational",
  },
  bachelor: {
    nb: "Bachelor",
    nn: "Bachelor",
    en: "Bachelor",
  },
  master: {
    nb: "Master",
    nn: "Master",
    en: "Master",
  },
  flexible: {
    nb: "Fleksibel",
    nn: "Fleksibel",
    en: "Flexible",
  },
};

const STATIC_LABELS = {
  notSet: {
    nb: "Ikke satt",
    nn: "Ikkje sett",
    en: "Not set",
  },
  noPlanningFilters: {
    nb: "Ingen planleggingsfiltre satt ennå",
    nn: "Ingen planleggingsfilter sette enno",
    en: "No planning filters set yet",
  },
  age: {
    nb: "Alder",
    nn: "Alder",
    en: "Age",
  },
  schoolStage: {
    nb: "Skolesteg",
    nn: "Skulesteg",
    en: "School stage",
  },
  relocationWillingness: {
    nb: "Villighet til å flytte",
    nn: "Vilje til å flytte",
    en: "Relocation willingness",
  },
  incomePrefix: {
    nb: "Inntekt",
    nn: "Inntekt",
    en: "Income",
  },
  workStylePrefix: {
    nb: "Arbeidsform",
    nn: "Arbeidsform",
    en: "Work style",
  },
  educationPrefix: {
    nb: "Utdanning",
    nn: "Utdanning",
    en: "Education",
  },
};

function getLocalizedLabel<T extends string>(
  labels: Record<T, Record<SupportedLocale, string>>,
  value: T,
  locale: SupportedLocale
): string {
  return labels[value][locale];
}

function getStaticLabel(
  key: keyof typeof STATIC_LABELS,
  locale: SupportedLocale
): string {
  return STATIC_LABELS[key][locale];
}

function getSchoolStageLabel(
  value: string | null | undefined,
  locale: SupportedLocale
): string {
  if (!value) {
    return getStaticLabel("notSet", locale);
  }

  return SCHOOL_STAGE_LABELS[value as SchoolStage]?.[locale] ?? value;
}

function getRelocationLabel(
  value: string | null | undefined,
  locale: SupportedLocale
): string {
  if (!value) {
    return getStaticLabel("notSet", locale);
  }

  return RELOCATION_LABELS[value as RelocationWillingness]?.[locale] ?? value;
}

function buildPlanningDirectionLabels({
  desiredIncomeBand,
  preferredWorkStyle,
  preferredEducationLevel,
  locale,
}: {
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
  locale: SupportedLocale;
}): string[] {
  const labels: string[] = [];

  if (desiredIncomeBand !== "open") {
    labels.push(
      `${getStaticLabel("incomePrefix", locale)}: ${getLocalizedLabel(
        INCOME_BAND_LABELS,
        desiredIncomeBand,
        locale
      )}`
    );
  }

  if (preferredWorkStyle !== "open") {
    labels.push(
      `${getStaticLabel("workStylePrefix", locale)}: ${getLocalizedLabel(
        WORK_STYLE_LABELS,
        preferredWorkStyle,
        locale
      )}`
    );
  }

  if (preferredEducationLevel !== "open") {
    labels.push(
      `${getStaticLabel("educationPrefix", locale)}: ${getLocalizedLabel(
        EDUCATION_LEVEL_LABELS,
        preferredEducationLevel,
        locale
      )}`
    );
  }

  if (labels.length === 0) {
    return [getStaticLabel("noPlanningFilters", locale)];
  }

  return labels;
}

function formatDirectionLabel(term: string): string {
  return term
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBestNextStep({
  locale,
  childId,
  signalCount,
  hasPlanningFilters,
  matchingProfessionCount,
  savedProfessionCount,
}: {
  locale: string;
  childId: string;
  signalCount: number;
  hasPlanningFilters: boolean;
  matchingProfessionCount: number;
  savedProfessionCount: number;
}): NextStepCard {
  if (signalCount < 4) {
    return {
      title: "Add more child signals",
      description:
        "The profile is still light. Add more interests or observed traits to improve strength detection and profession quality.",
      ctaLabel: "Update child profile",
      href: `/${locale}/app/children/${childId}#current-signals`,
    };
  }

  if (!hasPlanningFilters) {
    return {
      title: "Set a clearer planning direction",
      description:
        "Adding income, work style, or education preferences will make profession matches more realistic and easier to compare.",
      ctaLabel: "Open planning preferences",
      href: `/${locale}/app/children/${childId}#planning-preferences`,
    };
  }

  if (matchingProfessionCount === 0) {
    return {
      title: "Widen the match set",
      description:
        "No professions are visible with the current planning filters. Review the planning direction and reopen more realistic study paths.",
      ctaLabel: "Review planning filters",
      href: `/${locale}/app/children/${childId}#planning-preferences`,
    };
  }

  if (savedProfessionCount === 0) {
    return {
      title: "Save the first strong option",
      description:
        "You already have viable matches. Save one or two promising professions so the family can compare them later.",
      ctaLabel: "Go to professions",
      href: `/${locale}/app/children/${childId}/summary#professions-worth-exploring`,
    };
  }

  return {
    title: "Compare your saved options",
    description:
      "The child profile is already strong enough to move from exploration into comparison and discussion.",
    ctaLabel: "Open compare flow",
    href: `/${locale}/app/children/${childId}/compare`,
  };
}

function TagList({
  title,
  items,
  highlight = false,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-stone-600">{title}</div>

      {items.length === 0 ? (
        <p className="mt-1 text-sm text-stone-500">No items yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              className={
                highlight
                  ? "inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                  : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
              }
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
        {value}
      </div>
      {hint ? (
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}

function DashboardCard({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-stone-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function NextStepCardView({
  step,
}: {
  step: NextStepCard;
}) {
  return (
    <div className="rounded-2xl border border-stone-900 bg-stone-900 p-6 text-white">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-stone-300">
        Best next step
      </div>
      <h2 className="mt-2 text-lg font-semibold">{step.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-200">
        {step.description}
      </p>
      <div className="mt-5">
        <Link
          href={step.href}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-4 py-2 text-sm text-stone-900 transition hover:bg-stone-100"
        >
          {step.ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export default async function ChildSummaryPage({
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
      "id, display_name, birth_year, school_stage, country_code, relocation_willingness, interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level"
    )
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child summary"
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

  const rawInterests = Array.isArray(child.interests)
    ? child.interests.filter((item): item is string => typeof item === "string")
    : [];

  const rawObservedTraits = Array.isArray(child.observed_traits)
    ? child.observed_traits.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  const interestIds = coerceInterestIds(rawInterests);
  const observedTraitIds = coerceObservedTraitIds(rawObservedTraits);
  const derivedStrengthIds = getDerivedStrengthIds({
    interestIds,
    observedTraitIds,
  });

  const desiredIncomeBand =
    (child.desired_income_band as DesiredIncomeBand) ?? "open";

  const preferredWorkStyle =
    (child.preferred_work_style as PreferredWorkStyle) ?? "open";

  const preferredEducationLevel =
    (child.preferred_education_level as PreferredEducationLevel) ?? "open";

  const { data: savedLinks } = await supabase
    .from("child_profession_interests")
    .select("profession_id")
    .eq("child_profile_id", child.id);

  const savedProfessionIds = new Set(
    (savedLinks ?? []).map((item) => item.profession_id)
  );

  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags"
    )
    .eq("is_active", true);

  if (professionsError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child summary"
        subtitle="There was a problem loading professions."
        backHref={`/${locale}/app/children/${child.id}`}
        backLabel="Back child profile"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {professionsError.message}
        </div>
      </LocalePageShell>
    );
  }

  const childSummary = getChildSummary({
    interestIds,
    derivedStrengthIds,
    professions: professions ?? [],
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
    savedProfessionCount: savedLinks?.length ?? 0,
  });

  const supportedLocale = locale as SupportedLocale;
  const currentYear = new Date().getFullYear();
  const age =
    typeof child.birth_year === "number" ? currentYear - child.birth_year : null;

  const interestLabels = interestIds.map((id) =>
    getInterestLabel(id, supportedLocale)
  );
  const observedTraitLabels = observedTraitIds.map((id) =>
    getObservedTraitLabel(id, supportedLocale)
  );
  const derivedStrengthLabels = derivedStrengthIds.map((id) =>
    getDerivedStrengthLabel(id, supportedLocale)
  );
  const directionLabels = childSummary.strongestDirectionTerms.map(
    formatDirectionLabel
  );
  const developmentLabels = [
    ...childSummary.priorityStrengthIds.map((id) =>
      getDerivedStrengthLabel(id, supportedLocale)
    ),
    ...childSummary.priorityDevelopmentFocusIds.map((id) =>
      getDevelopmentFocusLabel(id, supportedLocale)
    ),
  ];
  const schoolFocusLabels = childSummary.usefulSchoolSubjectIds.map((id) =>
    getSchoolSubjectLabel(id, supportedLocale)
  );

  const planningDirectionLabels = buildPlanningDirectionLabels({
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
    locale: supportedLocale,
  });

  const profileReady = interestIds.length > 0 || observedTraitIds.length > 0;
  const signalCount = interestIds.length + observedTraitIds.length;
  const hasPlanningFilters =
    desiredIncomeBand !== "open" ||
    preferredWorkStyle !== "open" ||
    preferredEducationLevel !== "open";

  const nextStep = getBestNextStep({
    locale,
    childId: child.id,
    signalCount,
    hasPlanningFilters,
    matchingProfessionCount: childSummary.matchingProfessionCount,
    savedProfessionCount: childSummary.savedProfessionCount,
  });

  return (
    <LocalePageShell
      locale={locale}
      title={`${child.display_name || "Child"} summary`}
      subtitle="A clean parent-facing readout of current signals, strongest directions, profession relevance, and next development priorities."
      backHref={`/${locale}/app/children/${child.id}`}
      backLabel="Back child profile"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-stone-900">
                Summary overview
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                This is the current parent-facing summary for this child profile.
                It should help a parent quickly understand where the child looks
                strongest right now, which directions are most realistic to
                explore, and what to build next.
              </p>
            </div>

            <div className="grid w-full max-w-[22rem] gap-3 sm:w-auto sm:max-w-none sm:grid-cols-2">
              <Link
                href={`/${locale}/app/children/${child.id}/matches`}
                className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
              >
                Explore professions
              </Link>

              <div className="[&>*]:w-full [&>*]:justify-center">
                <CompareProfessionsButton locale={locale} childId={child.id} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric
              label="Current signals"
              value={signalCount}
              hint="Selected interests and observed traits."
            />
            <SummaryMetric
              label="Derived strengths"
              value={derivedStrengthIds.length}
              hint="Generated automatically from the child profile."
            />
            <SummaryMetric
              label="Matching professions"
              value={childSummary.matchingProfessionCount}
              hint="Current matches after profile and planning filters."
            />
            <SummaryMetric
              label="Saved professions"
              value={childSummary.savedProfessionCount}
              hint="Professions already saved for this child."
            />
          </div>
        </div>

        {!profileReady ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Summary not ready yet
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
              Select interests and observed traits in the child profile first.
              That will unlock a much stronger summary, clearer profession
              relevance, and better development guidance.
            </p>

            <div className="mt-5">
              <Link
                href={`/${locale}/app/children/${child.id}`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Edit child profile
              </Link>
            </div>
          </div>
        ) : (
          <>
            <NextStepCardView step={nextStep} />

            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardCard title="Profile snapshot">
                <dl className="grid gap-3 text-sm text-stone-600">
                  <div>
                    <dt className="font-medium text-stone-900">
                      {getStaticLabel("age", supportedLocale)}
                    </dt>
                    <dd className="mt-1">
                      {age ?? getStaticLabel("notSet", supportedLocale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-900">
                      {getStaticLabel("schoolStage", supportedLocale)}
                    </dt>
                    <dd className="mt-1">
                      {getSchoolStageLabel(child.school_stage, supportedLocale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-900">
                      {getStaticLabel("relocationWillingness", supportedLocale)}
                    </dt>
                    <dd className="mt-1">
                      {getRelocationLabel(
                        child.relocation_willingness,
                        supportedLocale
                      )}
                    </dd>
                  </div>
                </dl>
              </DashboardCard>

              <DashboardCard id="derived-strengths" title="Strengths and direction">
                <TagList
                  title="Derived strengths"
                  items={derivedStrengthLabels}
                  highlight
                />
                <TagList
                  title="Strongest directions"
                  items={directionLabels}
                  highlight
                />
              </DashboardCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardCard title="Current signals">
                <TagList
                  title="Selected interests"
                  items={interestLabels}
                  highlight
                />
                <TagList
                  title="Observed traits"
                  items={observedTraitLabels}
                  highlight
                />
              </DashboardCard>

              <DashboardCard title="Development priorities">
                <TagList title="What to develop next" items={developmentLabels} />
                <TagList title="Useful school focus" items={schoolFocusLabels} />
              </DashboardCard>
            </div>

            <div
              id="professions-worth-exploring"
              className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Professions worth exploring now
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    These are the strongest current profession matches for this
                    child profile.
                  </p>
                </div>

                <div className="grid w-full max-w-[22rem] gap-3 sm:w-auto sm:max-w-none sm:grid-cols-2">
                  <Link
                    href={`/${locale}/app/children/${child.id}/matches`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open full explorer
                  </Link>

                  <div className="[&>*]:w-full [&>*]:justify-center">
                    <CompareProfessionsButton
                      locale={locale}
                      childId={child.id}
                    />
                  </div>
                </div>
              </div>

              {childSummary.topProfessions.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-base font-semibold text-stone-900">
                    No professions are visible with the current planning filters
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    The child profile still has useful signals, but the current
                    planning direction is filtering out all profession matches.
                    Review the planning preferences to reopen more realistic
                    study paths.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {planningDirectionLabels.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-amber-300 bg-white px-3 py-1 text-sm text-amber-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Link
                      href={`/${locale}/app/children/${child.id}#planning-preferences`}
                      className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                    >
                      Review planning filters
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  {childSummary.topProfessions.map((profession) => {
                    const title = getLocalizedValue(
                      profession.title_i18n,
                      supportedLocale
                    );
                    const summary = getLocalizedValue(
                      profession.summary_i18n,
                      supportedLocale
                    );

                    const matchedInterestLabels =
                      profession.matchedInterestIds.map((id) =>
                        getInterestLabel(id, supportedLocale)
                      );

                    const matchedStrengthLabels =
                      profession.matchedStrengthIds.map((id) =>
                        getDerivedStrengthLabel(id, supportedLocale)
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

                            <TagList
                              title="Matched interests"
                              items={matchedInterestLabels}
                              highlight
                            />
                            <TagList
                              title="Matched strengths"
                              items={matchedStrengthLabels}
                              highlight
                            />
                            <TagList
                              title="Matched preferences"
                              items={profession.matchedPreferences}
                              highlight
                            />
                          </div>

                          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                            <div className="text-sm text-stone-500">
                              Match score{" "}
                              <span className="font-medium text-stone-900">
                                {profession.matchScore}
                              </span>
                            </div>

                            <Link
                              href={`/${locale}/app/professions/${profession.slug}`}
                              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                            >
                              Open profession
                            </Link>

                            <Link
                              href={`/${locale}/app/children/${child.id}/education/${profession.slug}`}
                              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                            >
                              Open study options
                            </Link>

                            <SaveProfessionToChildButton
                              childId={child.id}
                              professionId={profession.id}
                              isSaved={savedProfessionIds.has(profession.id)}
                            />

                            <CompareProfessionButton
                              childId={child.id}
                              professionId={profession.id}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </LocalePageShell>
  );
}