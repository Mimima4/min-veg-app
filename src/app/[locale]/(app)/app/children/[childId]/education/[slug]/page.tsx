import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getNorwayCountyMunicipalityOptions } from "@/lib/planning/norway-admin";

type ProgramRow = {
  program_slug: string;
  fit_band: "strong" | "broader";
  note: string | null;
};

type InstitutionRow = {
  id: string;
  slug: string;
  name: string;
  institution_type: string;
  website_url: string | null;
  county_code: string;
  municipality_code: string;
  municipality_name: string;
};

type ProgramDetailsRow = {
  slug: string;
  title: string;
  education_level: string;
  study_mode: string;
  duration_years: number | null;
  description: string | null;
  institution_id: string;
};

function getEducationLevelLabel(level: string, locale: SupportedLocale) {
  const labels = {
    open: { nb: "Åpen", nn: "Open", en: "Open" },
    certificate: { nb: "Sertifikat", nn: "Sertifikat", en: "Certificate" },
    vocational: { nb: "Yrkesfaglig", nn: "Yrkesfagleg", en: "Vocational" },
    bachelor: { nb: "Bachelor", nn: "Bachelor", en: "Bachelor" },
    master: { nb: "Master", nn: "Master", en: "Master" },
    flexible: { nb: "Fleksibel", nn: "Fleksibel", en: "Flexible" },
  } as const;

  if (level in labels) {
    return labels[level as keyof typeof labels][locale];
  }

  return level;
}

function getStudyModeLabel(value: string, locale: SupportedLocale) {
  const labels = {
    full_time: { nb: "Heltid", nn: "Heiltid", en: "Full-time" },
    part_time: { nb: "Deltid", nn: "Deltid", en: "Part-time" },
    flexible: { nb: "Fleksibel", nn: "Fleksibel", en: "Flexible" },
  } as const;

  if (value in labels) {
    return labels[value as keyof typeof labels][locale];
  }

  return value;
}

function ProgramCard({
  locale,
  childId,
  program,
  institution,
  fitBand,
  note,
}: {
  locale: string;
  childId: string;
  program: ProgramDetailsRow;
  institution: InstitutionRow;
  fitBand: "strong" | "broader";
  note: string | null;
}) {
  const supportedLocale = locale as SupportedLocale;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span
              className={
                fitBand === "strong"
                  ? "inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                  : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
              }
            >
              {fitBand === "strong"
                ? "Strong study option"
                : "Broader study option"}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getEducationLevelLabel(program.education_level, supportedLocale)}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getStudyModeLabel(program.study_mode, supportedLocale)}
            </span>

            {program.duration_years ? (
              <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
                {program.duration_years} years
              </span>
            ) : null}
          </div>

          <h2 className="mt-4 text-lg font-semibold text-stone-900">
            {program.title}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {institution.name} · {institution.municipality_name}
          </p>

          {program.description ? (
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {program.description}
            </p>
          ) : null}

          {note ? (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
              <div className="text-sm font-semibold text-stone-900">
                Why this program is shown
              </div>
              <p className="mt-2">{note}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          {institution.website_url ? (
            <a
              href={institution.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Open institution page
            </a>
          ) : null}

          <Link
            href={`/${locale}/app/children/${childId}#planning-preferences`}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            Edit planning preferences
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ChildEducationRoutePage({
  params,
}: {
  params: Promise<{ locale: string; childId: string; slug: string }>;
}) {
  const { locale, childId, slug } = await params;
  const supportedLocale = locale as SupportedLocale;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: child }, { data: profession }] = await Promise.all([
    supabase
      .from("child_profiles")
      .select("id, display_name, preferred_municipality_codes")
      .eq("id", childId)
      .maybeSingle(),
    supabase
      .from("professions")
      .select("id, slug, title_i18n, summary_i18n, education_notes_i18n")
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (!child || !profession) {
    redirect(`/${locale}/app/children/${childId}/summary`);
  }

  const selectedMunicipalityCodes = Array.isArray(
    child.preferred_municipality_codes
  )
    ? child.preferred_municipality_codes.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  const municipalityOptions = await getNorwayCountyMunicipalityOptions().catch(
    () => []
  );

  const municipalityNameMap = new Map<string, string>(
    municipalityOptions.flatMap((county) =>
      county.municipalities.map((municipality) => [
        municipality.code,
        `${municipality.name} · ${county.name}`,
      ])
    )
  );

  const selectedMunicipalityLabels = selectedMunicipalityCodes.map(
    (code) => municipalityNameMap.get(code) ?? code
  );

  const { data: links, error: linksError } = await supabase
    .from("profession_program_links")
    .select("program_slug, fit_band, note")
    .eq("profession_slug", slug);

  if (linksError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Study options"
        subtitle="There was a problem loading education links."
        backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
        backLabel="Back child summary"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {linksError.message}
        </div>
      </LocalePageShell>
    );
  }

  const programSlugs = (links ?? []).map((item) => item.program_slug);

  if (programSlugs.length === 0) {
    return (
      <LocalePageShell
        locale={locale}
        title="Study options"
        subtitle="No study programs are linked to this profession yet."
        backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
        backLabel="Back child summary"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm leading-relaxed text-stone-600">
            This profession already has a study-options route, but no concrete
            programs are linked yet. The next data step is to add more program
            rows into the education tables.
          </p>
        </div>
      </LocalePageShell>
    );
  }

  const { data: programs, error: programsError } = await supabase
    .from("education_programs")
    .select(
      "slug, title, education_level, study_mode, duration_years, description, institution_id"
    )
    .in("slug", programSlugs)
    .eq("is_active", true);

  if (programsError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Study options"
        subtitle="There was a problem loading programs."
        backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
        backLabel="Back child summary"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {programsError.message}
        </div>
      </LocalePageShell>
    );
  }

  const institutionIds = (programs ?? []).map(
    (program) => program.institution_id
  );

  const { data: institutions, error: institutionsError } = await supabase
    .from("education_institutions")
    .select(
      "id, slug, name, institution_type, website_url, county_code, municipality_code, municipality_name"
    )
    .in("id", institutionIds)
    .eq("is_active", true);

  if (institutionsError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Study options"
        subtitle="There was a problem loading institutions."
        backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
        backLabel="Back child summary"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {institutionsError.message}
        </div>
      </LocalePageShell>
    );
  }

  const linkMap = new Map<string, ProgramRow>(
    (links ?? []).map((item) => [item.program_slug, item as ProgramRow])
  );

  const institutionMap = new Map<string, InstitutionRow>(
    (institutions ?? []).map((item) => [item.id, item as InstitutionRow])
  );

  const programRows = ((programs ?? []) as ProgramDetailsRow[])
    .map((program) => {
      const institution = institutionMap.get(program.institution_id);
      const link = linkMap.get(program.slug);

      if (!institution || !link) {
        return null;
      }

      return {
        program,
        institution,
        fitBand: link.fit_band,
        note: link.note,
      };
    })
    .filter(
      (
        item
      ): item is {
        program: ProgramDetailsRow;
        institution: InstitutionRow;
        fitBand: "strong" | "broader";
        note: string | null;
      } => Boolean(item)
    );

  const filteredRows =
    selectedMunicipalityCodes.length === 0
      ? programRows
      : programRows.filter((row) =>
          selectedMunicipalityCodes.includes(row.institution.municipality_code)
        );

  const professionTitle = getLocalizedValue(
    profession.title_i18n as Record<string, string>,
    supportedLocale
  );
  const professionSummary = getLocalizedValue(
    profession.summary_i18n as Record<string, string>,
    supportedLocale
  );
  const educationNotes = getLocalizedValue(
    profession.education_notes_i18n as Record<string, string>,
    supportedLocale
  );

  return (
    <LocalePageShell
      locale={locale}
      title={`${professionTitle} study options`}
      subtitle="Concrete study programs linked to this profession, with commune-aware filtering for the child profile."
      backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
      backLabel="Back child summary"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-stone-900">
            {professionTitle}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {professionSummary}
          </p>

          {educationNotes ? (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
              <div className="text-sm font-semibold text-stone-900">
                Education notes
              </div>
              <p className="mt-2">{educationNotes}</p>
            </div>
          ) : null}

          <div className="mt-5">
            <div className="text-sm font-medium text-stone-600">
              Selected commune filter
            </div>

            {selectedMunicipalityLabels.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">
                No communes selected. Showing the full starter program set.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMunicipalityLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredRows.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {selectedMunicipalityCodes.length > 0
                  ? "Filtered study options"
                  : "Available study options"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {selectedMunicipalityCodes.length > 0
                  ? "These programs are inside the communes selected in the child profile."
                  : "These programs are currently linked to this profession in the starter dataset."}
              </p>
            </div>

            {filteredRows.map((row) => (
              <ProgramCard
                key={row.program.slug}
                locale={locale}
                childId={childId}
                program={row.program}
                institution={row.institution}
                fitBand={row.fitBand}
                note={row.note}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              No study options found for the selected communes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              The current commune filter is active, but none of the linked study
              programs are located in the selected communes.
            </p>

            <div className="mt-5">
              <Link
                href={`/${locale}/app/children/${childId}#planning-preferences`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Edit planning preferences
              </Link>
            </div>
          </div>
        )}
      </div>
    </LocalePageShell>
  );
}