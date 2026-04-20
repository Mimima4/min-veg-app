"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  childId: string;
  professionId: string;
};

export default function RemoveSavedProfessionButton({
  childId,
  professionId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    const confirmed = window.confirm(
      "Are you sure you want to remove this saved profession from the child profile? All related routes for this profession will be removed from the active route list."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/internal/routes/remove-saved-profession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childId,
          professionId,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error?.message ?? "Failed to remove saved profession"
        );
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm text-red-700 transition hover:border-red-300 disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}