export const MAX_COMPARE_PROFESSIONS = 3;

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean))).slice(0, MAX_COMPARE_PROFESSIONS);
}

export function getCompareStorageKey(childId: string): string {
  return `minveg_compare_${childId}`;
}

export function readCompareIds(childId: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getCompareStorageKey(childId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return uniqueIds(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [];
  }
}

export function writeCompareIds(childId: string, ids: string[]) {
  if (typeof window === "undefined") return;

  const nextIds = uniqueIds(ids);
  window.localStorage.setItem(getCompareStorageKey(childId), JSON.stringify(nextIds));
}

export function emitCompareChanged(childId: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("minveg-compare-changed", {
      detail: { childId },
    })
  );
}