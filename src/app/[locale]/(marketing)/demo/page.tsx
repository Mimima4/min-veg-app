import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Demo"
      subtitle="A controlled preview of the product, not a permanent free version."
      backHref={`/${locale}`}
      backLabel="Back home"
      navLinks={[
        { href: `/${locale}/pricing`, label: "Pricing" },
        { href: `/${locale}/signup?entry=trial`, label: "Start trial" },
        { href: `/${locale}/login`, label: "Sign in" },
      ]}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            What the demo includes
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
            <li>1 demo child profile</li>
            <li>3–5 professions</li>
            <li>1 example roadmap</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            What the demo does not include
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
            <li>No teacher-link</li>
            <li>No full profile saving</li>
            <li>No full family core access</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Best next step after demo
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Use demo for quick understanding. Use trial when you want the full
            family product experience.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/signup?entry=trial`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Start 3-day trial
            </Link>

            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
            >
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </LocalePageShell>
  );
}
