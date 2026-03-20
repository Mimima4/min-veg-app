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
  navLinks,
  children,
}: {
  locale: string;
  title: string;
  subtitle: string;
  backHref: string;
  navLinks?: NavLink[];
  children?: ReactNode;
}) {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs font-medium tracking-widest text-stone-500 uppercase">
          Locale: {locale.toUpperCase()}
        </div>

        <div className="mt-6 space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="text-lg text-stone-500 font-light leading-relaxed">
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

        <div className="mt-8">
          <Link
            href={backHref}
            className="text-sm text-stone-700 underline underline-offset-4 hover:text-stone-900"
          >
            Back to main
          </Link>
        </div>

        {children ? <section className="mt-10">{children}</section> : null}
      </div>
    </main>
  );
}

