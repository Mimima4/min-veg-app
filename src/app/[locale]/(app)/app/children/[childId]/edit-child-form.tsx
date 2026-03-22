"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SchoolStage =
  | "barneskole"
  | "ungdomsskole"
  | "vgs"
  | "student"
  | "young_adult";

type RelocationWillingness = "no" | "maybe" | "yes";

type Props = {
  locale: string;
  childId: string;
  initialDisplayName: string;
  initialBirthYear: number;
  initialSchoolStage: SchoolStage;
  initialCountryCode: string;
  initialRelocationWillingness: RelocationWillingness | null;
  initialInterests: string[];
  initialStrengths: string[];
};

function normalizeList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/,|\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function TagPreview({
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
  initialInterests,
  initialStrengths,
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

  const [interestsInput, setInterestsInput] = useState(
    initialInterests.join(", ")
  );
  const [strengthsInput, setStrengthsInput] = useState(
    initialStrengths.join(", ")
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const parsedInterests = useMemo(
    () => normalizeList(interestsInput),
    [interestsInput]
  );
  const parsedStrengths = useMemo(
    () => normalizeList(strengthsInput),
    [strengthsInput]
  );

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
        interests: parsedInterests,
        strengths: parsedStrengths,
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
    <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
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
          <h2 className="text-lg font-semibold text-stone-900">Interests</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Add interests separated by commas. Example: math, drawing, nature,
            robotics.
          </p>

          <div className="mt-4 space-y-4">
            <textarea
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              rows={4}
              placeholder="math, drawing, music"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
            />

            <TagPreview title="Interests preview" items={parsedInterests} />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">Strengths</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Add strengths separated by commas. Example: focus, empathy, logical
            thinking, teamwork.
          </p>

          <div className="mt-4 space-y-4">
            <textarea
              value={strengthsInput}
              onChange={(e) => setStrengthsInput(e.target.value)}
              rows={4}
              placeholder="focus, empathy, problem solving"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
            />

            <TagPreview title="Strengths preview" items={parsedStrengths} />
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