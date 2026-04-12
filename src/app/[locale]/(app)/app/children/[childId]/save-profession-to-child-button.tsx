"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  childId: string;
  professionId: string;
  isSaved: boolean;
  locale: string;
};

export default function SaveProfessionToChildButton({
  childId,
  professionId,
  isSaved,
  locale,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (isSaved) return;

    setLoading(true);

    const { error } = await supabase.from("child_profession_interests").upsert(
      {
        child_profile_id: childId,
        profession_id: professionId,
      },
      {
        onConflict: "child_profile_id,profession_id",
      }
    );

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const routeResponse = await fetch("/api/internal/routes/create-initial-study-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childId,
        targetProfessionId: professionId,
        locale,
      }),
    });

    const routePayload = await routeResponse.json().catch(() => null);

    setLoading(false);

    if (!routeResponse.ok || !routePayload?.ok) {
      alert(
        routePayload?.error?.message ??
          "The profession was saved, but the initial route could not be created."
      );
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={loading || isSaved}
      className={
        isSaved
          ? "inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-500 opacity-70"
          : "inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      }
    >
      {loading ? "Saving..." : isSaved ? "Saved" : "Save profession"}
    </button>
  );
}