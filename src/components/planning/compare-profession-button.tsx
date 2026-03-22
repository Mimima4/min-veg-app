"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MAX_COMPARE_PROFESSIONS,
  emitCompareChanged,
  readCompareIds,
  writeCompareIds,
} from "@/lib/planning/compare-selection";

type Props = {
  childId: string;
  professionId: string;
};

export default function CompareProfessionButton({
  childId,
  professionId,
}: Props) {
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

  const isSelected = useMemo(
    () => selectedIds.includes(professionId),
    [selectedIds, professionId]
  );

  const isDisabled = !isSelected && selectedIds.length >= MAX_COMPARE_PROFESSIONS;

  function handleToggle() {
    const currentIds = readCompareIds(childId);
    let nextIds: string[];

    if (currentIds.includes(professionId)) {
      nextIds = currentIds.filter((id) => id !== professionId);
    } else {
      if (currentIds.length >= MAX_COMPARE_PROFESSIONS) return;
      nextIds = [...currentIds, professionId];
    }

    writeCompareIds(childId, nextIds);
    setSelectedIds(nextIds);
    emitCompareChanged(childId);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isDisabled}
      aria-label={isSelected ? "Remove from compare" : "Add to compare"}
      title={isSelected ? "Remove from compare" : "Add to compare"}
      className={
        isSelected
          ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-300 bg-white text-blue-700"
          : isDisabled
          ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-300 opacity-60"
          : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-stone-400"
      }
    >
      <span aria-hidden="true">⚖</span>
    </button>
  );
}