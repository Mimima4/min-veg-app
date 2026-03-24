"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  childId: string;
  programSlug: string;
};

export default function RemoveSavedStudyRouteButton({
  childId,
  programSlug,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    const confirmed = window.confirm(
      "Are you sure you want to remove this saved study route from the child profile?"
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("child_saved_education_routes")
      .delete()
      .eq("child_profile_id", childId)
      .eq("program_slug", programSlug);

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
      onClick={handleRemove}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm text-red-700 transition hover:border-red-300 disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove saved route"}
    </button>
  );
}