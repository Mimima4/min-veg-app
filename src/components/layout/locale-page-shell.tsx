import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import LocaleSwitcher from "@/components/layout/locale-switcher";

type NavLink = {
  href: string;
  label: string;
};

export function LocalePageShell({
  locale,
  title,
  subtitle,
  backHref,
  backLabel = "Back home",
  navLinks,
  children,
}: {
  locale: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  navLinks?: NavLink[];
  children?: ReactNode;
}) {
  const isArabic = locale === "ar";

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-stone-50 px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <Suspense
          fallback={
            <div className="inline-flex min-w-14 items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
              {locale.toUpperCase()}
            </div>
          }
        >
          <LocaleSwitcher currentLocale={locale} />
        </Suspense>

        <div className="mt-6 space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-lg font-light leading-relaxed text-stone-600 sm:text-xl">
            {subtitle}
          </p>
        </div>

        {navLinks && navLinks.length > 0 ? (
          <nav className="mt-8">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {backHref ? (
          <div className="mt-8">
            <Link
              href={backHref}
              className="text-sm text-stone-700 underline underline-offset-4 hover:text-stone-900"
            >
              {backLabel}
            </Link>
          </div>
        ) : null}

        {children ? <section className="mt-10">{children}</section> : null}
      </div>
    </main>
  );
}
