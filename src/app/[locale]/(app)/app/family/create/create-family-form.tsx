"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  userId: string;
};

export default function CreateFamilyForm({ locale, userId }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [planType, setPlanType] = useState<"trial" | "family_basic" | "family_plus">("trial");
  const [maxChildren, setMaxChildren] = useState(4);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.from("family_accounts").insert({
      primary_user_id: userId,
      plan_type: planType,
      status: "active",
      max_children: maxChildren,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(`/${locale}/app/family`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Plan type</label>
        <select
          value={planType}
          onChange={(e) =>
            setPlanType(e.target.value as "trial" | "family_basic" | "family_plus")
          }
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
        >
          <option value="trial">trial</option>
          <option value="family_basic">family_basic</option>
          <option value="family_plus">family_plus</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Max children</label>
        <input
          type="number"
          min={1}
          max={6}
          value={maxChildren}
          onChange={(e) => setMaxChildren(Number(e.target.value))}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create family account"}
      </button>
    </form>
  );
}
