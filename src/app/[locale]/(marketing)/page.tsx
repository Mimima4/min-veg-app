import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/sign-out-button";
import type { SupportedLocale } from "@/lib/i18n/site-copy";

type EntryCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  primary?: boolean;
};

type MarketingCopy = {
  heroTitle: string;
  heroSubtitle: string;
  heroBody: string;
  familyEntryTitle: string;
  familyEntrySubtitle: string;
  familyEntries: EntryCard[];
  institutionalTitle: string;
  institutionalSubtitle: string;
  institutionalEntries: EntryCard[];
  signedInTitle: string;
  signedInSubtitle: string;
  signedInActions: {
    account: string;
    family: string;
    professions: string;
  };
  footerNote: string;
};

const COPY: Record<SupportedLocale, MarketingCopy> = {
  nb: {
    heroTitle: "Min Veg",
    heroSubtitle: "Ein betalt, tillitsbasert start på barnet sitt vidare løp.",
    heroBody:
      "Min Veg er bygd som ein parent-first, school-led plattform. Første møte med produktet skal derfor gjere entry path tydeleg: demo, kort trial, skule-aktivert familieinngang eller institusjonell kontakt.",
    familyEntryTitle: "Start som familie",
    familyEntrySubtitle:
      "Vel den rette inngangen frå første skjerm. Demo og kort trial er kontrollert entry modes, ikkje permanent free access.",
    familyEntries: [
      {
        eyebrow: "Full family core",
        title: "Start 3-day trial",
        description:
          "Create an account and unlock the full family core for a short paid-first trial experience.",
        href: "/signup?entry=trial",
        ctaLabel: "Start trial",
        primary: true,
      },
      {
        eyebrow: "Controlled preview",
        title: "Try demo",
        description:
          "Open a limited preview with one demo child, 3–5 professions, and one example roadmap.",
        href: "/demo",
        ctaLabel: "Open demo",
      },
      {
        eyebrow: "School-led entry",
        title: "Activate through school",
        description:
          "Enter through a school-referred family path when activation comes from school staff or a parent presentation.",
        href: "/signup?entry=school",
        ctaLabel: "School activation",
      },
      {
        eyebrow: "Returning user",
        title: "Sign in",
        description:
          "Continue from your existing family, school, or account state.",
        href: "/login",
        ctaLabel: "Sign in",
      },
    ],
    institutionalTitle: "For schools and municipalities",
    institutionalSubtitle:
      "Institutional entry is separate from family onboarding. Schools, kommune, and fylke should enter through pricing and rollout paths, not through family trial logic.",
    institutionalEntries: [
      {
        eyebrow: "School / kommune / fylke",
        title: "View institutional packages",
        description:
          "Review school, kommune, and fylke packages, pilots, and rollout direction.",
        href: "/pricing?entry=institutional",
        ctaLabel: "Open institutional pricing",
      },
    ],
    signedInTitle: "You already have access",
    signedInSubtitle:
      "Continue from the live account instead of restarting the entry flow.",
    signedInActions: {
      account: "Open account",
      family: "Open family",
      professions: "Open professions",
    },
    footerNote:
      "Parent-first. School-led distribution. Owner-ready analytics. Paid-first from the first screen.",
  },
  nn: {
    heroTitle: "Min Veg",
    heroSubtitle: "Ein betalt, tillitsbasert start på barnet si vidare reise.",
    heroBody:
      "Min Veg er bygd som ei parent-first, school-led plattform. Det første møtet med produktet skal derfor gjere entry path tydeleg: demo, kort trial, skule-aktivert familieinngang eller institusjonell kontakt.",
    familyEntryTitle: "Start som familie",
    familyEntrySubtitle:
      "Vel rett inngang frå første skjerm. Demo og kort trial er kontrollerte entry modes, ikkje permanent free access.",
    familyEntries: [
      {
        eyebrow: "Full family core",
        title: "Start 3-day trial",
        description:
          "Create an account and unlock the full family core for a short paid-first trial experience.",
        href: "/signup?entry=trial",
        ctaLabel: "Start trial",
        primary: true,
      },
      {
        eyebrow: "Controlled preview",
        title: "Try demo",
        description:
          "Open a limited preview with one demo child, 3–5 professions, and one example roadmap.",
        href: "/demo",
        ctaLabel: "Open demo",
      },
      {
        eyebrow: "School-led entry",
        title: "Activate through school",
        description:
          "Enter through a school-referred family path when activation comes from school staff or a parent presentation.",
        href: "/signup?entry=school",
        ctaLabel: "School activation",
      },
      {
        eyebrow: "Returning user",
        title: "Sign in",
        description:
          "Continue from your existing family, school, or account state.",
        href: "/login",
        ctaLabel: "Sign in",
      },
    ],
    institutionalTitle: "For skular og kommunar",
    institutionalSubtitle:
      "Institusjonell inngang er skild frå familie-onboarding. Skular, kommune og fylke skal inn gjennom pricing- og rollout-stiar, ikkje gjennom family trial logic.",
    institutionalEntries: [
      {
        eyebrow: "School / kommune / fylke",
        title: "View institutional packages",
        description:
          "Review school, kommune, and fylke packages, pilots, and rollout direction.",
        href: "/pricing?entry=institutional",
        ctaLabel: "Open institutional pricing",
      },
    ],
    signedInTitle: "Du har allereie tilgang",
    signedInSubtitle:
      "Gå vidare frå den levande kontoen i staden for å starte entry flow på nytt.",
    signedInActions: {
      account: "Open account",
      family: "Open family",
      professions: "Open professions",
    },
    footerNote:
      "Parent-first. School-led distribution. Owner-ready analytics. Paid-first frå første skjerm.",
  },
  en: {
    heroTitle: "Min Veg",
    heroSubtitle: "A paid, trust-first start to the child’s next path.",
    heroBody:
      "Min Veg is built as a parent-first, school-led platform. The first screen should therefore make the real entry paths clear: demo, short trial, school-activated family entry, or institutional contact.",
    familyEntryTitle: "Start as a family",
    familyEntrySubtitle:
      "Choose the right path from the first screen. Demo and short trial are controlled entry modes, not a permanent free tier.",
    familyEntries: [
      {
        eyebrow: "Full family core",
        title: "Start 3-day trial",
        description:
          "Create an account and unlock the full family core for a short paid-first trial experience.",
        href: "/signup?entry=trial",
        ctaLabel: "Start trial",
        primary: true,
      },
      {
        eyebrow: "Controlled preview",
        title: "Try demo",
        description:
          "Open a limited preview with one demo child, 3–5 professions, and one example roadmap.",
        href: "/demo",
        ctaLabel: "Open demo",
      },
      {
        eyebrow: "School-led entry",
        title: "Activate through school",
        description:
          "Enter through a school-referred family path when activation comes from school staff or a parent presentation.",
        href: "/signup?entry=school",
        ctaLabel: "School activation",
      },
      {
        eyebrow: "Returning user",
        title: "Sign in",
        description:
          "Continue from your existing family, school, or account state.",
        href: "/login",
        ctaLabel: "Sign in",
      },
    ],
    institutionalTitle: "For schools and municipalities",
    institutionalSubtitle:
      "Institutional entry is separate from family onboarding. Schools, kommune, and fylke should enter through pricing and rollout paths, not through family trial logic.",
    institutionalEntries: [
      {
        eyebrow: "School / kommune / fylke",
        title: "View institutional packages",
        description:
          "Review school, kommune, and fylke packages, pilots, and rollout direction.",
        href: "/pricing?entry=institutional",
        ctaLabel: "Open institutional pricing",
      },
    ],
    signedInTitle: "You already have access",
    signedInSubtitle:
      "Continue from the live account instead of restarting the entry flow.",
    signedInActions: {
      account: "Open account",
      family: "Open family",
      professions: "Open professions",
    },
    footerNote:
      "Parent-first. School-led distribution. Owner-ready analytics. Paid-first from the first screen.",
  },
};

function EntryCardView({
  locale,
  item,
}: {
  locale: string;
  item: EntryCard;
}) {
  return (
    <Link
      href={`/${locale}${item.href}`}
      className={
        item.primary
          ? "rounded-2xl border border-stone-900 bg-stone-900 p-6 text-white transition hover:bg-stone-800"
          : "rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-stone-300 hover:bg-stone-50"
      }
    >
      <div
        className={
          item.primary
            ? "text-xs font-medium uppercase tracking-[0.18em] text-stone-300"
            : "text-xs font-medium uppercase tracking-[0.18em] text-stone-500"
        }
      >
        {item.eyebrow}
      </div>
      <h2
        className={
          item.primary
            ? "mt-3 text-xl font-semibold tracking-tight text-white"
            : "mt-3 text-xl font-semibold tracking-tight text-stone-900"
        }
      >
        {item.title}
      </h2>
      <p
        className={
          item.primary
            ? "mt-3 text-sm leading-relaxed text-stone-200"
            : "mt-3 text-sm leading-relaxed text-stone-600"
        }
      >
        {item.description}
      </p>
      <div
        className={
          item.primary
            ? "mt-5 text-sm font-medium text-white"
            : "mt-5 text-sm font-medium text-stone-900"
        }
      >
        {item.ctaLabel}
      </div>
    </Link>
  );
}

export default async function MarketingHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = COPY[(locale as SupportedLocale) ?? "en"];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSignedIn = Boolean(user);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          {locale.toUpperCase()}
        </div>

        <section className="mt-8 max-w-4xl space-y-5">
          <h1 className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            {copy.heroTitle}
          </h1>

          <p className="text-lg font-light leading-relaxed text-stone-600 sm:text-xl">
            {copy.heroSubtitle}
          </p>

          <p className="max-w-3xl text-base leading-relaxed text-stone-700">
            {copy.heroBody}
          </p>

          {isSignedIn ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600">
              Signed in as{" "}
              <span className="font-medium text-stone-900">{user?.email}</span>
            </div>
          ) : null}
        </section>

        {isSignedIn ? (
          <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              {copy.signedInTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
              {copy.signedInSubtitle}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/app/profile`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                {copy.signedInActions.account}
              </Link>

              <Link
                href={`/${locale}/app/family`}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
              >
                {copy.signedInActions.family}
              </Link>

              <Link
                href={`/${locale}/app/professions`}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
              >
                {copy.signedInActions.professions}
              </Link>

              <SignOutButton locale={locale} />
            </div>
          </section>
        ) : (
          <>
            <section className="mt-12">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
                  {copy.familyEntryTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {copy.familyEntrySubtitle}
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {copy.familyEntries.map((item) => (
                  <EntryCardView key={item.title} locale={locale} item={item} />
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
                  {copy.institutionalTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {copy.institutionalSubtitle}
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-1">
                {copy.institutionalEntries.map((item) => (
                  <EntryCardView key={item.title} locale={locale} item={item} />
                ))}
              </div>
            </section>
          </>
        )}

        <footer className="mt-14 border-t border-stone-200 pt-6 text-sm text-stone-500">
          {copy.footerNote}
        </footer>
      </div>
    </main>
  );
}