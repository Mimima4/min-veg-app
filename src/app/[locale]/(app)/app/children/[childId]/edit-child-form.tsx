"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type { CountyMunicipalityGroup } from "@/lib/planning/norway-admin";
import {
  INTEREST_TAGS,
  OBSERVED_TRAIT_TAGS,
  getDerivedStrengthIds,
  getDerivedStrengthLabel,
  getInterestLabel,
  getObservedTraitLabel,
} from "@/lib/planning/child-tag-catalog";

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

type PreferredEducationLevel =
  | "open"
  | "certificate"
  | "vocational"
  | "bachelor"
  | "master"
  | "flexible";

type Props = {
  locale: string;
  childId: string;
  initialDisplayName: string;
  initialBirthYear: number;
  initialSchoolStage: SchoolStage;
  initialCountryCode: string;
  initialRelocationWillingness: RelocationWillingness | null;
  initialInterestIds: string[];
  initialObservedTraitIds: string[];
  initialDesiredIncomeBand: DesiredIncomeBand;
  initialPreferredWorkStyle: PreferredWorkStyle;
  initialPreferredEducationLevel: PreferredEducationLevel;
  initialPreferredMunicipalityCodes: string[];
  municipalityOptions: CountyMunicipalityGroup[];
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

const COUNTRY_OPTIONS = [{ code: "NO", label: "Norway" }] as const;

function getLocalizedLabel<T extends string>(
  labels: Record<T, Record<SupportedLocale, string>>,
  value: T,
  locale: SupportedLocale
): string {
  return labels[value][locale];
}

function ToggleTagButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "inline-flex items-center rounded-full border border-stone-900 bg-stone-900 px-3 py-1.5 text-sm text-white"
          : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:border-stone-400"
      }
    >
      {label}
    </button>
  );
}

function PreviewTags({
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
        <p className="mt-2 text-sm text-stone-500">No items yet.</p>
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

export default function EditChildForm({
  locale,
  childId,
  initialDisplayName,
  initialBirthYear,
  initialSchoolStage,
  initialCountryCode,
  initialRelocationWillingness,
  initialInterestIds,
  initialObservedTraitIds,
  initialDesiredIncomeBand,
  initialPreferredWorkStyle,
  initialPreferredEducationLevel,
  initialPreferredMunicipalityCodes,
  municipalityOptions,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const supportedLocale = locale as SupportedLocale;

  const currentYear = new Date().getFullYear();

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [birthYear, setBirthYear] = useState(initialBirthYear);
  const [schoolStage, setSchoolStage] =
    useState<SchoolStage>(initialSchoolStage);

  const normalizedInitialCountryCode =
    initialCountryCode.trim().toUpperCase() === "NO" ? "NO" : "NO";
  const [countryCode, setCountryCode] = useState(normalizedInitialCountryCode);

  const [relocationWillingness, setRelocationWillingness] = useState<
    RelocationWillingness
  >(initialRelocationWillingness ?? "no");

  const [desiredIncomeBand, setDesiredIncomeBand] =
    useState<DesiredIncomeBand>(initialDesiredIncomeBand);
  const [preferredWorkStyle, setPreferredWorkStyle] =
    useState<PreferredWorkStyle>(initialPreferredWorkStyle);
  const [preferredEducationLevel, setPreferredEducationLevel] =
    useState<PreferredEducationLevel>(initialPreferredEducationLevel);

  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>(
    initialInterestIds
  );
  const [selectedObservedTraitIds, setSelectedObservedTraitIds] = useState<
    string[]
  >(initialObservedTraitIds);
  const [selectedMunicipalityCodes, setSelectedMunicipalityCodes] = useState<
    string[]
  >(initialPreferredMunicipalityCodes);

  const [activeCountyCode, setActiveCountyCode] = useState<string>(() => {
    const initialCounty =
      municipalityOptions.find((county) =>
        county.municipalities.some((municipality) =>
          initialPreferredMunicipalityCodes.includes(municipality.code)
        )
      )?.code ?? municipalityOptions[0]?.code;

    return initialCounty ?? "03";
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const derivedStrengthIds = useMemo(
    () =>
      getDerivedStrengthIds({
        interestIds: selectedInterestIds,
        observedTraitIds: selectedObservedTraitIds,
      }),
    [selectedInterestIds, selectedObservedTraitIds]
  );

  const interestLabels = useMemo(
    () => selectedInterestIds.map((id) => getInterestLabel(id, supportedLocale)),
    [selectedInterestIds, supportedLocale]
  );

  const observedTraitLabels = useMemo(
    () =>
      selectedObservedTraitIds.map((id) =>
        getObservedTraitLabel(id, supportedLocale)
      ),
    [selectedObservedTraitIds, supportedLocale]
  );

  const derivedStrengthLabels = useMemo(
    () =>
      derivedStrengthIds.map((id) =>
        getDerivedStrengthLabel(id, supportedLocale)
      ),
    [derivedStrengthIds, supportedLocale]
  );

  const activeCounty = useMemo(
    () =>
      municipalityOptions.find((county) => county.code === activeCountyCode) ??
      municipalityOptions[0] ??
      null,
    [municipalityOptions, activeCountyCode]
  );

  const municipalityLookup = useMemo(() => {
    const map = new Map<string, { name: string; countyName: string }>();

    for (const county of municipalityOptions) {
      for (const municipality of county.municipalities) {
        map.set(municipality.code, {
          name: municipality.name,
          countyName: county.name,
        });
      }
    }

    return map;
  }, [municipalityOptions]);

  const selectedMunicipalityLabels = useMemo(() => {
    return selectedMunicipalityCodes
      .map((code) => municipalityLookup.get(code))
      .filter(
        (
          item
        ): item is {
          name: string;
          countyName: string;
        } => Boolean(item)
      )
      .map((item) => `${item.name} · ${item.countyName}`);
  }, [municipalityLookup, selectedMunicipalityCodes]);

  function toggleTag(
    id: string,
    currentValues: string[],
    setValues: (next: string[]) => void
  ) {
    if (currentValues.includes(id)) {
      setValues(currentValues.filter((item) => item !== id));
      return;
    }

    setValues([...currentValues, id]);
  }

  function toggleMunicipality(code: string) {
    if (selectedMunicipalityCodes.includes(code)) {
      setSelectedMunicipalityCodes(
        selectedMunicipalityCodes.filter((item) => item !== code)
      );
      return;
    }

    setSelectedMunicipalityCodes([...selectedMunicipalityCodes, code]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("child_profiles")
      .update({
        display_name: displayName.trim() || null,
        birth_year: birthYear,
        school_stage: schoolStage,
        country_code: countryCode || "NO",
        relocation_willingness: relocationWillingness,
        desired_income_band: desiredIncomeBand,
        preferred_work_style: preferredWorkStyle,
        preferred_education_level: preferredEducationLevel,
        preferred_municipality_codes: selectedMunicipalityCodes,
        interests: selectedInterestIds,
        observed_traits: selectedObservedTraitIds,
        strengths: derivedStrengthIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", childId);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Child profile saved successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-4xl space-y-6">
      <div className="grid gap-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Basic details
          </h2>

          <div className="mt-5 space-y-5">
            <div className="space-y-1">
              <label className="block text-sm text-stone-700">Child name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Miya"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm text-stone-700">
                  Birth year
                </label>
                <input
                  type="number"
                  min={currentYear - 30}
                  max={currentYear}
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm text-stone-700">
                  School stage
                </label>
                <select
                  value={schoolStage}
                  onChange={(e) =>
                    setSchoolStage(e.target.value as SchoolStage)
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  {(Object.keys(SCHOOL_STAGE_LABELS) as SchoolStage[]).map(
                    (value) => (
                      <option key={value} value={value}>
                        {getLocalizedLabel(
                          SCHOOL_STAGE_LABELS,
                          value,
                          supportedLocale
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm text-stone-700">Country</label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm text-stone-700">
                  Relocation willingness
                </label>
                <select
                  value={relocationWillingness}
                  onChange={(e) =>
                    setRelocationWillingness(
                      e.target.value as RelocationWillingness
                    )
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  {(
                    Object.keys(RELOCATION_LABELS) as RelocationWillingness[]
                  ).map((value) => (
                    <option key={value} value={value}>
                      {getLocalizedLabel(
                        RELOCATION_LABELS,
                        value,
                        supportedLocale
                      )}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">Interests</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Choose what the child is naturally drawn to. Use the buttons instead
            of writing your own labels.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const selected = selectedInterestIds.includes(tag.id);

              return (
                <ToggleTagButton
                  key={tag.id}
                  label={getInterestLabel(tag.id, supportedLocale)}
                  selected={selected}
                  onClick={() =>
                    toggleTag(
                      tag.id,
                      selectedInterestIds,
                      setSelectedInterestIds
                    )
                  }
                />
              );
            })}
          </div>

          <div className="mt-5">
            <PreviewTags title="Selected interests" items={interestLabels} />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Observed traits
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Choose what you actually observe in the child. These observations
            will be used to derive strengths automatically.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {OBSERVED_TRAIT_TAGS.map((tag) => {
              const selected = selectedObservedTraitIds.includes(tag.id);

              return (
                <ToggleTagButton
                  key={tag.id}
                  label={getObservedTraitLabel(tag.id, supportedLocale)}
                  selected={selected}
                  onClick={() =>
                    toggleTag(
                      tag.id,
                      selectedObservedTraitIds,
                      setSelectedObservedTraitIds
                    )
                  }
                />
              );
            })}
          </div>

          <div className="mt-5">
            <PreviewTags
              title="Selected observations"
              items={observedTraitLabels}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Derived strengths
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            These strengths are generated from selected interests and observed
            traits. They are not entered manually.
          </p>

          <div className="mt-5">
            <PreviewTags
              title="Derived strengths"
              items={derivedStrengthLabels}
            />
          </div>
        </div>

        <div
          id="planning-preferences"
          className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-stone-900">
            Planning preferences
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            These preferences shape suggestions and hide professions that do not
            fit the chosen direction.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm text-stone-700">
                Desired income band
              </label>
              <select
                value={desiredIncomeBand}
                onChange={(e) =>
                  setDesiredIncomeBand(e.target.value as DesiredIncomeBand)
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              >
                {(Object.keys(INCOME_BAND_LABELS) as DesiredIncomeBand[]).map(
                  (value) => (
                    <option key={value} value={value}>
                      {getLocalizedLabel(
                        INCOME_BAND_LABELS,
                        value,
                        supportedLocale
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-stone-700">
                Preferred work style
              </label>
              <select
                value={preferredWorkStyle}
                onChange={(e) =>
                  setPreferredWorkStyle(e.target.value as PreferredWorkStyle)
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              >
                {(Object.keys(WORK_STYLE_LABELS) as PreferredWorkStyle[]).map(
                  (value) => (
                    <option key={value} value={value}>
                      {getLocalizedLabel(
                        WORK_STYLE_LABELS,
                        value,
                        supportedLocale
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-stone-700">
                Preferred education level
              </label>
              <select
                value={preferredEducationLevel}
                onChange={(e) =>
                  setPreferredEducationLevel(
                    e.target.value as PreferredEducationLevel
                  )
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              >
                {(
                  Object.keys(
                    EDUCATION_LEVEL_LABELS
                  ) as PreferredEducationLevel[]
                ).map((value) => (
                  <option key={value} value={value}>
                    {getLocalizedLabel(
                      EDUCATION_LEVEL_LABELS,
                      value,
                      supportedLocale
                    )}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h3 className="text-sm font-semibold text-stone-900">
              Commune filter
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Choose one or more communes. This filter will be used in the next
              education layer and later to narrow study options and institutions.
            </p>

            <div className="mt-4 grid gap-5 lg:grid-cols-[16rem,1fr]">
              <div className="space-y-2">
                <label className="block text-sm text-stone-700">
                  Browse by fylke
                </label>
                <select
                  value={activeCountyCode}
                  onChange={(e) => setActiveCountyCode(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  {municipalityOptions.map((county) => (
                    <option key={county.code} value={county.code}>
                      {county.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedMunicipalityCodes([])}
                  className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 transition hover:border-stone-400"
                >
                  Clear commune selection
                </button>
              </div>

              <div>
                {activeCounty ? (
                  <div className="flex flex-wrap gap-2">
                    {activeCounty.municipalities.map((municipality) => (
                      <ToggleTagButton
                        key={municipality.code}
                        label={municipality.name}
                        selected={selectedMunicipalityCodes.includes(
                          municipality.code
                        )}
                        onClick={() => toggleMunicipality(municipality.code)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">
                    No municipality list available right now.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <PreviewTags
                title="Selected communes"
                items={selectedMunicipalityLabels}
              />
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {message ? (
        <p className="text-sm text-emerald-700">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save child profile"}
      </button>
    </form>
  );
}