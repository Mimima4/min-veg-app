"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  childId: string;
  professionSlug: string;
  programSlug: string;
  isSaved: boolean;
};

export default function SaveStudyRouteButton({
  childId,
  professionSlug,
  programSlug,
  isSaved,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (isSaved) return;

    setLoading(true);

    const { error } = await supabase
      .from("child_saved_education_routes")
      .upsert(
        {
          child_profile_id: childId,
          profession_slug: professionSlug,
          program_slug: programSlug,
        },
        {
          onConflict: "child_profile_id,program_slug",
        }
      );

    setLoading(false);

    if (error) {
      alert(error.message);
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
      {loading ? "Saving..." : isSaved ? "Saved route" : "Save study route"}
    </button>
  );
}