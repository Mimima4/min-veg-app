import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/sign-out-button";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: familyAccount } = user
    ? await supabase
        .from("family_accounts")
        .select("id, plan_type, subscription_state, trial_ends_at")
        .eq("primary_user_id", user.id)
        .maybeSingle()
    : { data: null };

  const isSignedIn = Boolean(user);

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
        <div className="inline-flex min-w-14 items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
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
            {!familyAccount ? (
              <>
                <h2 className="text-lg font-semibold text-stone-900">
                  Continue as signed-in user
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
                  Your account is signed in, but no family container exists yet.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/app/family/create?entry=trial`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                  >
                    Start 3-day trial
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
            ) : (
              <>
                {familyAccount.plan_type === "trial" &&
                familyAccount.subscription_state === "trialing" ? (
                  <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <h2 className="text-base font-semibold text-stone-900">
                      3-day trial active
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-blue-900">
                      Time remaining:{" "}
                      {formatTrialRemainingLabel(familyAccount.trial_ends_at)}
                    </p>
                  </div>
                ) : null}

                <h2 className="text-lg font-semibold text-stone-900">
                  You are already signed in
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
                  Continue from your existing account instead of restarting entry
                  flow.
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

                  <Link
                    href={`/${locale}/app/professions`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open professions
                  </Link>

                  <SignOutButton locale={locale} />
                </div>
              </>
            )}
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
                {familyEntries.map((item) => (
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
        )}

        <footer className="mt-14 border-t border-stone-200 pt-6 text-sm text-stone-500">
          {copy.footerNote}
        </footer>
      </div>
    </main>
  );
}