"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MAX_COMPARE_ROUTES,
  emitRouteCompareChanged,
  readRouteCompareIds,
  writeRouteCompareIds,
} from "@/lib/planning/route-compare-selection";

type Props = {
  childId: string;
  routeId: string;
};

export default function CompareSavedRouteButton({ childId, routeId }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    function sync() {
      setSelectedIds(readRouteCompareIds(childId));
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
  }, [childId]);

  const isSelected = useMemo(() => selectedIds.includes(routeId), [selectedIds, routeId]);
  const isDisabled = !isSelected && selectedIds.length >= MAX_COMPARE_ROUTES;

  function handleToggle() {
    const currentIds = readRouteCompareIds(childId);
    let nextIds: string[];

    if (currentIds.includes(routeId)) {
      nextIds = currentIds.filter((id) => id !== routeId);
    } else {
      if (currentIds.length >= MAX_COMPARE_ROUTES) {
        return;
      }
      nextIds = [...currentIds, routeId];
    }

    writeRouteCompareIds(childId, nextIds);
    setSelectedIds(nextIds);
    emitRouteCompareChanged(childId);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isDisabled}
      aria-label={isSelected ? "Remove route from compare" : "Add route to compare"}
      title={isSelected ? "Remove route from compare" : "Add route to compare"}
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
