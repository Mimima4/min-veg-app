"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  childId: string;
  routeId: string;
};

export default function RemoveSavedStudyRouteButton({
  childId,
  routeId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    const confirmed = window.confirm(
      "Are you sure you want to remove this saved study route from the child profile?"
    );

    if (!confirmed) return;

    setLoading(true);

    const response = await fetch("/api/internal/routes/remove-saved-study-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childId,
        routeId,
      }),
    });

    const payload = await response.json().catch(() => null);

    setLoading(false);

    if (!response.ok || !payload?.ok) {
      alert(payload?.error?.message ?? "Failed to remove saved route.");
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