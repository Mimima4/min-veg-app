"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import {
  DERIVED_STRENGTH_TAGS,
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
};

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
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [birthYear, setBirthYear] = useState(initialBirthYear);
  const [schoolStage, setSchoolStage] =
    useState<SchoolStage>(initialSchoolStage);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
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
    () =>
      selectedInterestIds.map((id) =>
        getInterestLabel(id, locale as SupportedLocale)
      ),
    [selectedInterestIds, locale]
  );

  const observedTraitLabels = useMemo(
    () =>
      selectedObservedTraitIds.map((id) =>
        getObservedTraitLabel(id, locale as SupportedLocale)
      ),
    [selectedObservedTraitIds, locale]
  );

  const derivedStrengthLabels = useMemo(
    () =>
      derivedStrengthIds.map((id) =>
        getDerivedStrengthLabel(id, locale as SupportedLocale)
      ),
    [derivedStrengthIds, locale]
  );

  function toggleTag(id: string, currentValues: string[], setValues: (next: string[]) => void) {
    if (currentValues.includes(id)) {
      setValues(currentValues.filter((item) => item !== id));
      return;
    }

    setValues([...currentValues, id]);
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
        country_code: countryCode.trim().toUpperCase() || "NO",
        relocation_willingness: relocationWillingness,
        desired_income_band: desiredIncomeBand,
        preferred_work_style: preferredWorkStyle,
        preferred_education_level: preferredEducationLevel,
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
                    setSchoolStage(
                      e.target.value as
                        | "barneskole"
                        | "ungdomsskole"
                        | "vgs"
                        | "student"
                        | "young_adult"
                    )
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  <option value="barneskole">barneskole</option>
                  <option value="ungdomsskole">ungdomsskole</option>
                  <option value="vgs">vgs</option>
                  <option value="student">student</option>
                  <option value="young_adult">young_adult</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm text-stone-700">
                  Country code
                </label>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="NO"
                  maxLength={2}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 uppercase outline-none focus:border-stone-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm text-stone-700">
                  Relocation willingness
                </label>
                <select
                  value={relocationWillingness}
                  onChange={(e) =>
                    setRelocationWillingness(
                      e.target.value as "no" | "maybe" | "yes"
                    )
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  <option value="no">no</option>
                  <option value="maybe">maybe</option>
                  <option value="yes">yes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
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
                  setDesiredIncomeBand(
                    e.target.value as
                      | "open"
                      | "up_to_600k"
                      | "600k_to_800k"
                      | "800k_plus"
                  )
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              >
                <option value="open">open</option>
                <option value="up_to_600k">up to 600k NOK</option>
                <option value="600k_to_800k">600k to 800k NOK</option>
                <option value="800k_plus">800k+ NOK</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-stone-700">
                Preferred work style
              </label>
              <select
                value={preferredWorkStyle}
                onChange={(e) =>
                  setPreferredWorkStyle(
                    e.target.value as
                      | "open"
                      | "onsite"
                      | "hybrid"
                      | "remote"
                      | "mixed"
                  )
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              >
                <option value="open">open</option>
                <option value="onsite">onsite</option>
                <option value="hybrid">hybrid</option>
                <option value="remote">remote</option>
                <option value="mixed">mixed</option>
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
                    e.target.value as
                      | "open"
                      | "certificate"
                      | "vocational"
                      | "bachelor"
                      | "master"
                      | "flexible"
                  )
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
              >
                <option value="open">open</option>
                <option value="certificate">certificate</option>
                <option value="vocational">vocational</option>
                <option value="bachelor">bachelor</option>
                <option value="master">master</option>
                <option value="flexible">flexible</option>
              </select>
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
                  label={getInterestLabel(tag.id, locale as SupportedLocale)}
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
                  label={getObservedTraitLabel(
                    tag.id,
                    locale as SupportedLocale
                  )}
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