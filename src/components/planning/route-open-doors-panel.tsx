"use client";

import Link from "next/link";
import { useState } from "react";

type OpenDoorItem = {
  slug: string;
  title: string;
  fitScore: number;
  matchedInterestLabels: string[];
  matchedStrengthLabels: string[];
  href: string;
};

type Props = {
  items: OpenDoorItem[];
};

export default function RouteOpenDoorsPanel({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isDisabled = items.length === 0;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          if (isDisabled) return;
          setIsOpen((value) => !value);
        }}
        disabled={isDisabled}
        aria-expanded={isDisabled ? false : isOpen}
        className={
          isDisabled
            ? "inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-4 py-2 text-sm text-stone-400 cursor-not-allowed"
            : "inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
        }
      >
        <span>This path can also open doors to</span>

        <span
          className={`inline-flex transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.512a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {!isDisabled && isOpen ? (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div
              key={item.slug}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="text-sm font-semibold text-stone-900">
                    {item.title}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.matchedInterestLabels.slice(0, 2).map((label) => (
                      <span
                        key={`${item.slug}-interest-${label}`}
                        className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                      >
                        {label}
                      </span>
                    ))}

                    {item.matchedStrengthLabels.slice(0, 2).map((label) => (
                      <span
                        key={`${item.slug}-strength-${label}`}
                        className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                  <div className="text-sm text-stone-500">
                    Fit score{" "}
                    <span className="font-medium text-stone-900">
                      {item.fitScore}
                    </span>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open profession
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}