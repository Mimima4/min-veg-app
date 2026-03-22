"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CompareOption = {
  id: string;
  title: string;
};

type Props = {
  locale: string;
  childId: string;
  options: CompareOption[];
};

export default function CompareLauncher({
  locale,
  childId,
  options,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelection(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
      return;
    }

    if (selectedIds.length >= 3) {
      alert("You can compare up to 3 professions at once.");
      return;
    }

    setSelectedIds([...selectedIds, id]);
  }

  function openCompare() {
    if (selectedIds.length < 2) return;

    const ids = selectedIds.join(",");
    router.push(`/${locale}/app/children/${childId}/compare?ids=${ids}`);
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  if (options.length < 2) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">
        Compare professions
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Select 2 to 3 professions to compare them side by side for this child.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleSelection(option.id)}
              className={
                selected
                  ? "inline-flex items-center rounded-full border border-stone-900 bg-stone-900 px-3 py-1.5 text-sm text-white"
                  : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:border-stone-400"
              }
            >
              {option.title}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openCompare}
          disabled={selectedIds.length < 2}
          className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          Compare selected
        </button>

        <button
          type="button"
          onClick={clearSelection}
          disabled={selectedIds.length === 0}
          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400 disabled:opacity-50"
        >
          Clear
        </button>

        <span className="text-sm text-stone-500">
          Selected: {selectedIds.length} / 3
        </span>
      </div>
    </div>
  );
}