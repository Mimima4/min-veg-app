import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          Locale: {locale.toUpperCase()}
        </div>

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

