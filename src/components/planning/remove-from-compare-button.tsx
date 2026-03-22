"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  emitCompareChanged,
  readCompareIds,
  writeCompareIds,
} from "@/lib/planning/compare-selection";

type Props = {
  locale: string;
  childId: string;
  professionId: string;
  fallbackIds: string[];
};

export default function RemoveFromCompareButton({
  locale,
  childId,
  professionId,
  fallbackIds,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleRemove() {
    setLoading(true);

    const currentIds = readCompareIds(childId);
    const baseIds = currentIds.length > 0 ? currentIds : fallbackIds;
    const nextIds = baseIds.filter((id) => id !== professionId);

    writeCompareIds(childId, nextIds);
    emitCompareChanged(childId);

    if (nextIds.length >= 2) {
      router.push(`/${locale}/app/children/${childId}/compare?ids=${nextIds.join(",")}`);
    } else {
      router.push(`/${locale}/app/children/${childId}/matches`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400 disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove from compare"}
    </button>
  );
}