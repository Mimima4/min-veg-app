import Link from "next/link";
import { Suspense } from "react";
import SignOutButton from "@/components/auth/sign-out-button";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { getUserAccessState } from "@/server/billing/get-user-access-state";

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
  footerNote: string;
};

const COPY: Record<string, MarketingCopy> = {
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
    footerNote:
      "Parent-first. School-led distribution. Paid-first frå første skjerm. Bygd for web og future native mobile.",
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
      "School and owner entry is a separate commercial and institutional flow. It should not live inside the family entry block.",
    footerNote:
      "Parent-first. School-led distribution. Paid-first from the first screen. Built for web and future native mobile.",
  },
};

function getCopy(locale: string): MarketingCopy {
  return COPY[locale] ?? COPY.en;
}

function formatTrialRemainingLabel(trialEndsAt: string | null): string {
  if (!trialEndsAt) {
    return "—";
  }

  const endsAt = new Date(trialEndsAt);
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();

  if (Number.isNaN(endsAt.getTime()) || diff <= 0) {
    return "Trial expired";
  }

  const totalMinutes = Math.ceil(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
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
  const accessState = await getUserAccessState();
  const signedInIdentity =
    accessState.displayName ?? accessState.email ?? "user";
  const showEntrySections =
    accessState.kind === "anonymous" ||
    accessState.kind === "no_family_paid" ||
    accessState.kind === "no_family_trial_available" ||
    accessState.kind === "no_family_no_trial" ||
    accessState.kind === "institutional_pending";

  const showNoFamilyCompactNotice =
    accessState.kind === "no_family_paid" ||
    accessState.kind === "no_family_trial_available" ||
    accessState.kind === "no_family_no_trial" ||
    accessState.kind === "institutional_pending";

  const canUseTrial = showNoFamilyCompactNotice
    ? accessState.trialAvailable
    : false;

  const familyEntries: EntryCard[] = [
    {
      eyebrow: "Controlled preview",
      title: "Try demo",
      description:
        "Open a limited preview before registration or paid family entry.",
      href: "/demo",
      ctaLabel: "Open demo",
    },
    {
      eyebrow: "Short trial",
      title: "Start 3-day trial",
      description:
        "Create an account and unlock the family core for a fixed 3-day trial.",
      href: "/signup?entry=trial",
      ctaLabel: "Start trial",
      primary: true,
    },
    {
      eyebrow: "Paid family entry",
      title: "Choose family plan",
      description:
        "Go directly into paid family entry with a clear next step.",
      href: "/pricing?entry=family",
      ctaLabel: "Open family plans",
    },
    {
      eyebrow: "Returning user",
      title: "Sign in",
      description: "Continue from your existing account state.",
      href: "/login",
      ctaLabel: "Sign in",
    },
  ];

  const visibleFamilyEntries =
    showNoFamilyCompactNotice
      ? familyEntries.filter((item) => {
          if (item.title === "Sign in") {
            return false;
          }

          if (item.title === "Try demo") {
            return false;
          }

          if (item.title === "Start 3-day trial") {
            return canUseTrial;
          }

          return true;
        })
      : familyEntries;

  const institutionalEntries: EntryCard[] = [
    {
      eyebrow: "School-led activation",
      title: "Activate through school",
      description:
        "Use a separate school-led path when family activation comes from school staff or a parent presentation.",
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
    <main className="min-h-screen bg-stone-50 px-6 py-16">
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
        </section>

        {showNoFamilyCompactNotice ? (
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
            <div className="text-sm text-stone-500">
              Signed in as{" "}
              <span className="font-medium text-stone-900">
                {signedInIdentity}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-stone-900">
              No family account yet
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
              Your account is ready. Choose the next step below to continue.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/app/profile`}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
              >
                Open account
              </Link>

              <SignOutButton locale={locale} />
            </div>
          </div>
        ) : null}

        {showEntrySections ? (
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
                {visibleFamilyEntries.map((item) => (
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

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {institutionalEntries.map((item) => (
                  <EntryCardView key={item.title} locale={locale} item={item} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
            <div className="text-sm text-stone-500">
              Signed in as{" "}
              <span className="font-medium text-stone-900">
                {signedInIdentity}
              </span>
            </div>

            {accessState.kind === "trial_active" ? (
              <>
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h2 className="text-base font-semibold text-stone-900">
                    3-day trial active
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-blue-900">
                    Time remaining:{" "}
                    {formatTrialRemainingLabel(
                      accessState.activation.trialEndsAt
                    )}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-blue-900/80">
                    After the trial ends, your account will stay saved.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/app/family`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                  >
                    Open family
                  </Link>

                  <Link
                    href={`/${locale}/pricing?entry=family`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Choose family plan
                  </Link>

                  <SignOutButton locale={locale} />
                </div>
              </>
            ) : null}

            {accessState.kind === "trial_expired" ? (
              <>
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h2 className="text-base font-semibold text-stone-900">
                    Trial ended
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-amber-900">
                    Continue with a family plan to keep going.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/pricing?entry=family`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                  >
                    Choose family plan
                  </Link>

                  <SignOutButton locale={locale} />
                </div>
              </>
            ) : null}

            {accessState.kind === "paid_active" ? (
              <>
                <h2 className="mt-4 text-lg font-semibold text-stone-900">
                  Paid access active
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
                  Your account is ready. Continue in your family area.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/app/family`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                  >
                    Open family
                  </Link>

                  <Link
                    href={`/${locale}/app/profile`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open account
                  </Link>

                  <SignOutButton locale={locale} />
                </div>
              </>
            ) : null}

            {accessState.kind === "inactive_access" ? (
              <>
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h2 className="text-base font-semibold text-stone-900">
                    Access inactive
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-amber-900">
                    Choose a family plan to continue.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={
                      (accessState.activation.entrySource ??
                        accessState.pendingEntrySource) === "school_referral" ||
                      (accessState.activation.entrySource ??
                        accessState.pendingEntrySource) === "school" ||
                      (accessState.activation.entrySource ??
                        accessState.pendingEntrySource) === "kommune" ||
                      (accessState.activation.entrySource ??
                        accessState.pendingEntrySource) === "fylke" ||
                      (accessState.activation.entrySource ??
                        accessState.pendingEntrySource) === "institutional"
                        ? `/${locale}/pricing?entry=institutional`
                        : `/${locale}/pricing?entry=family`
                    }
                    className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                  >
                    Restore access
                  </Link>

                  <SignOutButton locale={locale} />
                </div>
              </>
            ) : null}
          </section>
        )}

        <footer className="mt-14 border-t border-stone-200 pt-6 text-sm text-stone-500">
          {copy.footerNote}
        </footer>
      </div>
    </main>
  );
}