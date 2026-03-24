"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function CollapsibleSection({
  id,
  title,
  count,
  defaultOpen = false,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    function syncWithHash() {
      if (window.location.hash === `#${id}`) {
        setIsOpen(true);
      }
    }

    syncWithHash();
    window.addEventListener("hashchange", syncWithHash);

    return () => {
      window.removeEventListener("hashchange", syncWithHash);
    };
  }, [id]);

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
    >
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <span className="shrink-0 text-sm font-medium text-stone-500">
            {count}
          </span>
        </div>

        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.512a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div id={`${id}-content`} className="mt-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}