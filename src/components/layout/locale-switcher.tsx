"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LOCALES,
  LOCALE_BUTTON_LABELS,
  LOCALE_MENU_LABELS,
  isLocale,
  type Locale,
} from "@/app/[locale]/locales";

function buildLocaleHref(
  pathname: string,
  searchParams: { toString(): string },
  nextLocale: Locale
): string {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return `/${nextLocale}`;
  }

  if (isLocale(parts[0])) {
    parts[0] = nextLocale;
  } else {
    parts.unshift(nextLocale);
  }

  const nextPath = `/${parts.join("/")}`;
  const query = searchParams.toString();

  return query ? `${nextPath}?${query}` : nextPath;
}

export default function LocaleSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const resolvedLocale: Locale = isLocale(currentLocale) ? currentLocale : "en";

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const items = useMemo(
    () =>
      LOCALES.map((locale) => ({
        locale,
        href: buildLocaleHref(pathname, searchParams, locale),
        menuLabel: LOCALE_MENU_LABELS[locale],
      })),
    [pathname, searchParams]
  );

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-w-14 items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700 transition hover:border-stone-400 hover:text-stone-900"
      >
        {LOCALE_BUTTON_LABELS[resolvedLocale]}
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 min-w-48 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = item.locale === resolvedLocale;

              return (
                <li key={item.locale}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "block rounded-xl bg-stone-900 px-3 py-2 text-sm text-white"
                        : "block rounded-xl px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
                    }
                  >
                    {item.menuLabel}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
