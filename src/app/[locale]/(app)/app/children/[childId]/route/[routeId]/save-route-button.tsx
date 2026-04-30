"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  childId: string;
  routeId: string;
  locale: string;
  isSaved: boolean;
  selectedOptions?: Record<string, string>;
};

export default function SaveRouteButton({
  childId,
  routeId,
  locale,
  isSaved,
  selectedOptions,
}: Props) {
  if (isSaved) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        Saved
      </span>
    );
  }

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (isSaved || loading) {
      return;
    }

    setLoading(true);

    const response = await fetch("/api/internal/routes/save-study-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childId,
        routeId,
        locale,
        selectedOptions,
      }),
    });

    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok || !payload?.ok) {
      alert(payload?.error?.message ?? "Failed to save route.");
      return;
    }

    const nextRouteId = payload?.result?.routeId;
    if (typeof nextRouteId === "string" && nextRouteId.length > 0) {
      router.replace(`/${locale}/app/children/${childId}/route/${nextRouteId}`);
      router.refresh();
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
    >
      {loading ? "Saving route..." : "Save route"}
    </button>
  );
}
