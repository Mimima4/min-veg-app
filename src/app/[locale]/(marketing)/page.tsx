import Link from "next/link";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getSiteCopy } from "@/lib/i18n/site-copy";

export default async function MarketingHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // `locale` is validated by `src/app/[locale]/layout.tsx`.
  const copy = getSiteCopy(locale as SupportedLocale);

  return (
    <main className="min-h-screen px-6 py-16 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs font-medium tracking-widest text-stone-500 uppercase">
          {locale.toUpperCase()}
        </div>

        <section className="mt-8 space-y-5">
          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-tight text-stone-900">
              {copy.heroTitle}
            </h1>
            <p className="text-lg text-stone-500 font-light leading-relaxed">
              {copy.heroSubtitle}
            </p>
          </div>

          <p className="text-stone-700 text-base font-light leading-relaxed">
            {copy.shortExplanation}
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {copy.features.map((feature) => (
              <div key={feature.title} className="space-y-2">
                <div className="text-sm font-medium tracking-wide text-stone-900">
                  {feature.title}
                </div>
                <p className="text-stone-500 font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/${locale}/demo`}
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900 transition-colors"
            >
              {copy.ctas.tryDemo}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900 transition-colors"
            >
              {copy.ctas.viewPricing}
            </Link>
            <Link
              href={`/${locale}/app/dashboard`}
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900 transition-colors"
            >
              {copy.ctas.openDashboardPreview}
            </Link>
          </div>

          {copy.loginPrompt ? (
            <div className="text-sm text-stone-500 font-light">
              {copy.loginPrompt}{" "}
              <Link
                href={`/${locale}/login`}
                className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
              >
                Login
              </Link>
            </div>
          ) : null}
        </section>

        <footer className="mt-12 text-sm text-stone-500 font-light">
          {copy.footerNote}
        </footer>
      </div>
    </main>
  );
}

