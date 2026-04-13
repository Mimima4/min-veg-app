"use client";

import { useEffect, useRef, useState } from "react";

type CompetitionLevel = "low" | "medium" | "high" | "very_high";

type Props = {
  level: CompetitionLevel;
  tooltipItems?: string[];
};

export function CompetitionBadge({ level, tooltipItems }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  if (!level || level === "low") return null;

  const config = {
    medium: {
      label: "Moderate competition",
      className: "border-gray-300 text-gray-600",
    },
    high: {
      label: "High competition",
      className: "border-pink-400 text-pink-600",
    },
    very_high: {
      label: "Very high competition",
      className: "border-red-500 text-red-600",
    },
  } as const;

  const badge = config[level];
  if (!badge) return null;

  const hasTooltip = Array.isArray(tooltipItems) && tooltipItems.length > 0;

  if (!hasTooltip) {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  }

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {badge.label}
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-3 text-left shadow-sm">
          <div className="text-xs font-semibold text-stone-900">
            Requirements
          </div>
          <ul className="mt-2 space-y-1 text-xs text-stone-600">
            {tooltipItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </span>
  );
}
