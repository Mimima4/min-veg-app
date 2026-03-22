"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  emitCompareChanged,
  readCompareIds,
} from "@/lib/planning/compare-selection";

type Props = {
  locale: string;
  childId: string;
};

export default function CompareProfessionsButton({
  locale,
  childId,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    function sync() {
      setSelectedIds(readCompareIds(childId));
    }

    sync();

    function handleCompareChanged(event: Event) {
      const customEvent = event as CustomEvent<{ childId?: string }>;
      if (!customEvent.detail?.childId || customEvent.detail.childId === childId) {
        sync();
      }
    }

    function handleStorage() {
      sync();
    }

    window.addEventListener("minveg-compare-changed", handleCompareChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("minveg-compare-changed", handleCompareChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [childId]);

  function handleOpenCompare() {
    if (selectedIds.length < 2) return;

    router.push(`/${locale}/app/children/${childId}/compare?ids=${selectedIds.join(",")}`);
  }

  return (
    <button
      type="button"
      onClick={handleOpenCompare}
      disabled={selectedIds.length < 2}
      className={
        selectedIds.length >= 2
          ? "inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
          : "inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-500"
      }
    >
      Compare professions ({selectedIds.length})
    </button>
  );
}