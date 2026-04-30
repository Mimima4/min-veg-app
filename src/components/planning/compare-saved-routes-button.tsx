"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  emitRouteCompareChanged,
  readRouteCompareIds,
  writeRouteCompareIds,
} from "@/lib/planning/route-compare-selection";

type Props = {
  locale: string;
  childId: string;
  validRouteIds?: string[];
};

export default function CompareSavedRoutesButton({
  locale,
  childId,
  validRouteIds,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const validRouteIdSet = validRouteIds ? new Set(validRouteIds) : null;

    function pruneIds(ids: string[]) {
      if (!validRouteIdSet) return ids;
      return ids.filter((id) => validRouteIdSet.has(id));
    }

    function sync() {
      const storedIds = readRouteCompareIds(childId);
      const filteredIds = pruneIds(storedIds);
      if (filteredIds.join(",") !== storedIds.join(",")) {
        writeRouteCompareIds(childId, filteredIds);
        emitRouteCompareChanged(childId);
      }
      setSelectedIds(filteredIds);
    }

    sync();

    function handleRouteCompareChanged(event: Event) {
      const customEvent = event as CustomEvent<{ childId?: string }>;
      if (!customEvent.detail?.childId || customEvent.detail.childId === childId) {
        sync();
      }
    }

    function handleStorage() {
      sync();
    }

    window.addEventListener(
      "minveg-route-compare-changed",
      handleRouteCompareChanged
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "minveg-route-compare-changed",
        handleRouteCompareChanged
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [childId, validRouteIds]);

  function handleOpenCompare() {
    const validRouteIdSet = validRouteIds ? new Set(validRouteIds) : null;
    const storedIds = readRouteCompareIds(childId);
    const filteredIds = validRouteIdSet
      ? storedIds.filter((id) => validRouteIdSet.has(id))
      : storedIds;
    writeRouteCompareIds(childId, filteredIds);
    setSelectedIds(filteredIds);
    emitRouteCompareChanged(childId);
    if (filteredIds.length < 2) return;
    router.push(
      `/${locale}/app/children/${childId}/route/compare?ids=${filteredIds.join(",")}`
    );
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
      Compare routes ({selectedIds.length})
    </button>
  );
}
