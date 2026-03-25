import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { Suspense } from "react";
import TrialStatusBanner from "@/components/billing/trial-status-banner";
import {
  getMarketingAccountActivationState,
  type PendingEntrySource,
} from "@/server/billing/get-marketing-account-activation-state";

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
  institutionalTitle: string;
  institutionalSubtitle: string;
  signedInTitle: string;
  signedInSubtitle: string;
  signedInActions: {
    account: string;
    family: string;
    professions: string;
  };
  footerNote: string;
};

type MarketingLocale = "nb" | "nn" | "en";

const COPY: Record<MarketingLocale, MarketingCopy> = {
  nb: {
    heroTitle: "Min Veg",
    heroSubtitle: "Ein roleg, tillitsbasert start på barnet sin neste veg.",
    heroBody:
     "Min Veg blir bygd som ei Norway-first, parent-first og school-led plattform. Første skjerm skal vere activation-first: demo først, deretter trial gjennom registrering, så betalt familieinngang, og eit eige kommersielt spor for skular og kommunar.",
    familyEntryTitle: "Start som familie",
    familyEntrySubtitle:
      "Demo kjem først. Trial kjem berre gjennom registrering. Betalt familieinngang skal vere tydeleg frå første skjerm.",
    institutionalTitle: "For schools and municipalities",
    institutionalSubtitle:
      "Skule- og eigarinngang er ein eigen kommersiell og institusjonell flyt. Han skal ikkje liggje inne i family entry.",
    signedInTitle: "Du er allereie logga inn",
    signedInSubtitle:
      "Gå vidare frå den eksisterande kontoen. Trial skal ikkje startast på nytt frå første skjerm.",
    signedInActions: {
      account: "Open account",
      family: "Open family",
      professions: "Open professions",
    },
    footerNote:
      "Parent-first. School-led distributirst frå første skjerm. Bygd for web og future native mobile.",
  },
  nn: {
    heroTitle: "Min Veg",
    heroSubtitle: "Ein roleg, tillitsbasert start på barnet si neste reise.",
    heroBody:
      "Min Veg blir bygd som ei Norway-first, parent-first og school-led plattform. Første skjerm skal vere activation-first: demo først, deretter trial gjennom registrering, så betalt familieinngang, og eit eige kommersielt spor for skular og kommunar.",
    familyEntryTitle: "Start som familie",
    familyEntrySubtitle:
      "Demo kjem først. Trial kjem berre gjennom registrering. Betalt familieinngang skal vere tydeleg frå første skjerm.",
    institutionalTitle: "For schools and municipalities",
    institutionalSubtitle:
      "Skule- og eigarinngang er ein eigen kommersiell og institusjonell flyt. Han skal ikkje liggje inne i family entry.",
    signedInTitle: "Du er allereie innlogga",
    signedInSubtitle:
      "Gå vidare frå den eksisterande kontoen. Trial skal ikkje startast på nytt frå første skjerm.",
    signedInActions: {
      account: "Open account",
      family: "Open family",
      professions: "Open professions",
    },
    footerNote:
      "Parent-first. School-led distribution. Paid-first frå første skjerm. Bygd for web og future native mobile.",
  },
  en: {
    heroTitle: "Min Veg",
    heroSubtitle: "A calm, trust-first start to the child’s next path.",
    heroBody:
      "Min Veg is being built as a Norway-first, parent-first, school-led platform. The first screen should be activation-first: demo first, then trial through registration, then paid family entry, with a separate commercial path for schools and municipalities.",
    familyEntryTitle: "Start as a family",
    familyEntrySubtitle:
      "Demo comes first. Trial only comes through registration. Paid family entry should be explicit from the first screen.",
    institutionalTitle: "For schools and municipalities",
    institutionalSubtitle:
      "School and owner entry is a separate commercial and institutional flow. It should live inside the family entry block.",
    signedInTitle: "You are already signed in",
    signedInSubtitle:
      "Continue from the existing account. Trial should not restart from the first screen.",
    signedInActions: {
      account: "Open account",
      family: "Open family",
      professions: "Open professions",
    },
    footerNote:
      "Parent-first. School-led distribution. Paid-first from the first screen. Built for web and future native mobile.",
  },
};

function getCopy(locale: string): MarketingCopy {
  return COPY[locale as MarketingLocale] ?? COPY.en;
}

function getFamilyCreateHref(
  locale: string,
  pendingEntrySource: PendingEntrySource
): string {
  switch (pendingEntrySource) {
    case "trial":
      return `/${locale}/app/family/create?entry=trial`;
    case "paid":
      return `/${locale}/app/family/create?entry=paid`;
    case "school_referral":
      return `/${locale}/app/family/create?entry=school`;
    case "direct":
    case null:
    default:
      return `/${locale}/app/family/create?entry=trial`;
  }
}

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
  const copy = getCopy(locale);
  const accountState = await getMarketingAccountActivationState();
  const isArabic = locale === "ar";

  const demoCard: EntryCard = {
    eyebrow: "Controlled preview",
    title: "Try demo",
    description:
      "Open a controlled product overview before moving into registration or paid family entry.",
    href: "/demo",
    ctaLabel: "Open demo",
  };

  const trialCard: EntryCard =
    accountState.kind !== "anonymous"
      ? {
          eyebrow: "Trial already used",
          title: "Start 3-day trial",
          description:
            "For signed-in users, trial should not start again. This card now routes into paid family selection.",
          href:
            accountState.kind === "signed_in_no_family"
              ? getFamilyCreateHref(locale, accountState.pendingEntrySource)
              : "/pricing?entry=family",
          ctaLabel: "Choose family plan",
        }
      : {
          eyebrow: "Short trial",
          title: "Start 3-day trial",
          description:
            "Trial is only available through registration and should become a real account state, not a permanent free tier.",
          href: "/signup?entry=trial",
          ctaLabel: "Start trial",
          primary: true,
        };

  const paidCard: EntryCard = {
    eyebrow: "Paid family entry",
    title: "Choose family plan",
    description:
      "Go directly into paid family entry with a clear plan selection path from the first screen.",
    href: "/pricing?entry=family",
    ctaLabel: "Open family plans",
  };

  const accountCard: EntryCard =
    accountState.kind !== "anonymous"
      ? {
          eyebrow: "Live account",
          title: "Open account",
          description:
            "Continue from the live account instead of starting a new entry flow.",
          href: "/app/profile",
          ctaLabel: "Open account",
        }
      : {
          eyebrow: "Returning user",
          title: "Sign in",
          description: "Sign in to continue from an existing account.",
          href: "/login",
          ctaLabel: "Sign in",
        };

  const familyEntries: EntryCard[] = [
    demoCard,
    trialCard,
    paidCard,
    accountCard,
  ];

  const institutionalEntries: EntryCard[] = [
    {
      eyebrow: "School-led activation",
      title: "Activate through school",
      description:
        "Use a separate school-led path when family activation comes from school staff, a counselor, or a parent presentation.",
      href: "/signup?entry=school",
      ctaLabel: "School activation",
    },
    {
      eyebrow: "Institutional packages",
      title: "View school and municipality packages",
      description:
        "Review school, kommune, and fylke packages, pilot logic, and rollout direction.",
      href: "/pricing?entry=institutional",
      ctaLabel: "Open institutional pricing",
    },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-stone-50 px-6 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <div className="inline-flex min-w-14 items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
              {locale.toUpperCase()}
            </div>
          }
        >
          <LocaleSwitcher currentLocale={locale} />
        </Suspense>

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

          {accountState.kind !== "anonymous" ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600">
              Signed in as{" "}
              <span className="font-medium text-stone-900">
                {accountState.userEmail}
              </span>
            </div>
          ) : null}
        </section>

        {accountState.kind !== "anonymous" ? (
          <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              {copy.signedInTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
              {copy.signedInSubtitle}
            </p>

            {accountState.kind === "trial_active" ? (
              <div className="mt-4">
                <TrialStatusBanner
                  tone="neutral"
                  title="Trial active"
                  body={`Time remaining: ${accountState.trialRemainingLabel}`}
                />
              </div>
            ) : null}

            {accountState.kind === "trial_expired" ? (
              <div className="mt-4">
                <TrialStatusBanner
                  tone="amber"
                  title="Trial ended"
                  body="The 3-day trial has ended. It cannot be started again. Continue with a paid family plan."
                  ctaHref={`/${locale}/pricing?entry=family`}
                  ctaLabel="Choose family plan"
                />
              </div>
            ) : null}

            {accountState.kind === "signed_in_no_family" ? (
              <div className="mt-4">
                <TrialStatusBanner
                  tone="neutral"
                  title="Activation not completed"
                  body="Continue family activation from your existing account."
                />
              </div>
            ) : null}

            {accountState.kind === "paid_active" ? (
              <div className="mt-4">
                <TrialStatusBanner
                  tone="neutral"
                  title="Paid family access active"
                  body="This account already has active family access."
                />
              </div>
            ) : null}

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
        ) : null}

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
            {familyEntries.map((item) => (
              <EntryCardView key={`${item.title}-${item.href}`} locale={locale} item={item} />
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

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {institutionalEntries.map((item) => (
              <EntryCardView key={`${item.title}-${item.href}`} locale={locale} item={item} />
            ))}
          </div>
        </section>

        <footer className="mt-14 border-t border-stone-200 pt-6 text-sm text-stone-500">
          {copy.footerNote}
        </footer>
      </div>
    </main>
  );
}
