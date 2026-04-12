"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChildOption = {
  id: string;
  displayName: string;
};

type Props = {
  locale: string;
  professionId: string;
  children: ChildOption[];
  initiallySavedChildIds: string[];
};

export default function SaveProfessionForChildForm({
  locale,
  professionId,
  children,
  initiallySavedChildIds,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const defaultChildId =
    children.find((child) => !initiallySavedChildIds.includes(child.id))?.id ??
    children[0]?.id ??
    "";

  const [selectedChildId, setSelectedChildId] = useState(defaultChildId);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isAlreadySaved = useMemo(() => {
    return initiallySavedChildIds.includes(selectedChildId);
  }, [initiallySavedChildIds, selectedChildId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("child_profession_interests")
      .upsert(
        {
          child_profile_id: selectedChildId,
          profession_id: professionId,
        },
        {
          onConflict: "child_profile_id,profession_id",
        }
      );

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    const routeResponse = await fetch("/api/internal/routes/create-initial-study-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childId: selectedChildId,
        targetProfessionId: professionId,
        locale,
      }),
    });

    const routePayload = await routeResponse.json().catch(() => null);

    setLoading(false);

    if (!routeResponse.ok || !routePayload?.ok) {
      setErrorMessage(
        routePayload?.error?.message ??
          "The profession was saved, but the initial route could not be created."
      );
      return;
    }

    setMessage("Profession saved for child and initial route created.");
    router.refresh();
  }

  if (children.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
        Create a child profile in Family before saving professions.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Select child</label>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.displayName}
            </option>
          ))}
        </select>
      </div>

      {isAlreadySaved ? (
        <p className="text-sm text-emerald-700">
          This profession is already saved for the selected child.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {message ? (
        <p className="text-sm text-emerald-700">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !selectedChildId || isAlreadySaved}
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save for child"}
      </button>
    </form>
  );
}