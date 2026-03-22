import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import SignOutButton from "@/components/auth/sign-out-button";

export default async function MarketingHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getSiteCopy(locale as SupportedLocale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSignedIn = Boolean(user);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          {locale.toUpperCase()}
        </div>

        <section className="mt-8 max-w-3xl space-y-5">
          <h1 className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            {copy.heroTitle}
          </h1>

          <p className="text-lg font-light leading-relaxed text-stone-600 sm:text-xl">
            {copy.heroSubtitle}
          </p>

          <p className="max-w-2xl text-base leading-relaxed text-stone-700">
            {copy.shortExplanation}
          </p>

          {isSignedIn ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600">
              Signed in as{" "}
              <span className="font-medium text-stone-900">{user?.email}</span>
            </div>
          ) : null}
        </section>

        {!isSignedIn ? (
          <section className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/demo`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
            >
              {copy.ctas.tryDemo}
            </Link>

            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
            >
              {copy.ctas.viewPricing}
            </Link>

            <Link
              href={`/${locale}/signup`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              {copy.ctas.createAccount}
            </Link>
          </section>
        ) : (
          <section className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/app/dashboard`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Open dashboard
            </Link>

            <Link
              href={`/${locale}/app/family`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Open family
            </Link>

            <Link
              href={`/${locale}/app/profile`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Open profile
            </Link>

            <SignOutButton locale={locale} />
          </section>
        )}

        <section className="mt-14 grid gap-6 sm:grid-cols-3">
          {copy.features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="text-sm font-semibold tracking-wide text-stone-900">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {!isSignedIn ? (
          <section className="mt-10 text-sm text-stone-500">
            <p>
              Har du allerede en konto?{" "}
              <Link
                href={`/${locale}/login`}
                className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
              >
                Logg inn
              </Link>
            </p>
          </section>
        ) : null}

        <footer className="mt-14 border-t border-stone-200 pt-6 text-sm text-stone-500">
          {copy.footerNote}
        </footer>
      </div>
    </main>
  );
}