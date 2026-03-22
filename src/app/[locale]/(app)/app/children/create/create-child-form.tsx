"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  familyAccountId: string;
};

export default function CreateChildForm({
  locale,
  familyAccountId,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState(currentYear - 10);
  const [schoolStage, setSchoolStage] = useState<
    "barneskole" | "ungdomsskole" | "vgs" | "student" | "young_adult"
  >("barneskole");
  const [countryCode, setCountryCode] = useState("NO");
  const [relocationWillingness, setRelocationWillingness] = useState<
    "no" | "maybe" | "yes"
  >("no");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.from("child_profiles").insert({
      family_account_id: familyAccountId,
      display_name: displayName.trim() || null,
      birth_year: birthYear,
      school_stage: schoolStage,
      country_code: countryCode.trim().toUpperCase() || "NO",
      relocation_willingness: relocationWillingness,
      interests: [],
      strengths: [],
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(`/${locale}/app/children`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
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
          <label className="block text-sm text-stone-700">Birth year</label>
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
          <label className="block text-sm text-stone-700">School stage</label>
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
          <label className="block text-sm text-stone-700">Country code</label>
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

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create child profile"}
      </button>
    </form>
  );
}