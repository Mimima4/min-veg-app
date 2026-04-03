import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import {
  PriceCardView,
  type PricingPriceCardCtaKind,
} from "@/components/pricing/price-card-view";
import { getFamilySchoolOffer } from "@/server/billing/get-family-school-offer";
import {
  getUserAccessState,
  type UserAccessState,
} from "@/server/billing/get-user-access-state";

type FamilyPlanMatchKey =
  | "demo"
  | "trial"
  | "family_basic"
  | "family_plus"
  | "school_referred_family_basic"
  | "school_referred_family_plus"
  | "young_adult";

type PriceCard = {
  title: string;
  price: string;
  details: string;
  /** Path after `/${locale}` for the “Choose plan” link, e.g. `/demo` → `/{locale}/demo` */
  choosePath: string;
  matchKey?: FamilyPlanMatchKey;
  ctaKind: PricingPriceCardCtaKind;
};

function pricingCardHref(locale: string, choosePath: string): string {
  return `/${locale}${choosePath.startsWith("/") ? choosePath : `/${choosePath}`}`;
}

function normalizePlanToken(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isFamilyCardCurrent(
  access: UserAccessState,
  matchKey: FamilyPlanMatchKey
): boolean {
  if (
    access.kind === "anonymous" ||
    access.kind === "no_family_paid" ||
    access.kind === "no_family_trial_available" ||
    access.kind === "no_family_no_trial" ||
    access.kind === "institutional_pending"
  ) {
    return false;
  }

  if (!access.familyAccount || !access.activation) {
    return false;
  }

  const { familyAccount, activation, kind } = access;
  const planCode = normalizePlanToken(familyAccount.plan_code);
  const planType = normalizePlanToken(familyAccount.plan_type);

  switch (matchKey) {
    case "demo":
      return activation.billingStage === "demo";
    case "trial":
      return kind === "trial_active";
    case "family_basic":
      return planCode === "family_basic";
    case "family_plus":
      return planCode === "family_plus";
    case "school_referred_family_basic":
      return planCode === "school_referred_family_basic";
    case "school_referred_family_plus":
      return planCode === "school_referred_family_plus";
    case "young_adult":
      return planCode === "young_adult" || planType.includes("young_adult");
    default:
      return false;
  }
}

const FAMILY_CARDS: PriceCard[] = [
  {
    title: "Demo",
    price: "Free",
    details:
      "1 demo child profile, 3–5 professions, 1 example roadmap, no teacher-link, no full profile saving.",
    choosePath: "/demo",
    matchKey: "demo",
    ctaKind: "demo",
  },
  {
    title: "3-day trial",
    price: "3 days",
    details: "Full access to the family core for a short trial period.",
    choosePath: "/signup?entry=trial",
    matchKey: "trial",
    ctaKind: "trial",
  },
  {
    title: "Family Basic",
    price: "149 NOK / month · 1 290 NOK / year",
    details:
      "Up to 4 children, profession cards, study options, programmes, roadmap, and saved routes.",
    choosePath: "/pricing?entry=family",
    matchKey: "family_basic",
    ctaKind: "standard",
  },
  {
    title: "Family Plus",
    price: "199 NOK / month · 1 790 NOK / year",
    details:
      "Up to 6 children, everything in Basic, plus extended history and family planning depth.",
    choosePath: "/pricing?entry=family",
    matchKey: "family_plus",
    ctaKind: "standard",
  },
  {
    title: "School-referred Family Basic",
    price: "990 NOK / first year",
    details: "Discounted family activation through school.",
    choosePath: "/pricing?entry=family",
    matchKey: "school_referred_family_basic",
    ctaKind: "school_referred",
  },
  {
    title: "School-referred Family Plus",
    price: "1 390 NOK / first year",
    details: "Discounted extended family activation through school.",
    choosePath: "/pricing?entry=family",
    matchKey: "school_referred_family_plus",
    ctaKind: "school_referred",
  },
  {
    title: "Young Adult",
    price: "99 NOK / month · 890 NOK / year",
    details:
      "Self-owned path after school, roadmap import, early work pathway, no child profiles.",
    choosePath: "/pricing?entry=family",
    matchKey: "young_adult",
    ctaKind: "standard",
  },
];

const SCHOOL_CARDS: PriceCard[] = [
  {
    title: "School Starter",
    price: "29 900 NOK / year",
    details:
      "1 school, up to 15 staff, parent invitation flow, teacher-link, shared planning mode.",
    choosePath: "/pricing?entry=institutional",
    ctaKind: "standard",
  },
  {
    title: "School Plus",
    price: "49 900 NOK / year",
    details:
      "1 school, up to 40 staff, school dashboard, strengths analytics, school-level summary.",
    choosePath: "/pricing?entry=institutional",
    ctaKind: "standard",
  },
  {
    title: "Extra school",
    price: "+12 000 NOK / year",
    details: "For each additional school inside the same agreement.",
    choosePath: "/pricing?entry=institutional",
    ctaKind: "standard",
  },
];

const OWNER_CARDS: PriceCard[] = [
  {
    title: "Kommune Package",
    price: "69 000 NOK → 549 000 NOK / year",
    details:
      "Tiered by school count. Includes school dashboard, kommune dashboard, strengths block, trend block, and demand-interest mismatch.",
    choosePath: "/pricing?entry=institutional",
    ctaKind: "standard",
  },
  {
    title: "Fylke Package",
    price: "99 000 NOK → 629 000 NOK / year",
    details:
      "Tiered by upper secondary school scope / territorial coverage. Includes youth continuity, early work pathway, and regional analytics.",
    choosePath: "/pricing?entry=institutional",
    ctaKind: "standard",
  },
  {
    title: "Analytics / pilots / implementation",
    price: "Add-ons and pilot logic",
    details:
      "School Analytics, Kommune Analytics, Fylke Analytics, Regional Analytics, implementation, workshops, and pilot models.",
    choosePath: "/pricing?entry=institutional",
    ctaKind: "standard",
  },
];

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string; entry?: string; source?: string }>;
}) {
  const { locale } = await params;
  const { intent, entry } = await searchParams;

  const upgradeChildrenFlow = intent === "upgrade-children";
  const institutionalEntry = entry === "institutional";

  const title = upgradeChildrenFlow
    ? "Upgrade family capacity"
    : institutionalEntry
      ? "Institutional pricing"
      : "Pricing";

  const subtitle = upgradeChildrenFlow
    ? "Your current family subscription has reached its child limit. Review the upgrade path for adding more child profiles."
    : institutionalEntry
      ? "Review school, kommune, and fylke pricing as separate institutional entry paths."
      : "Choose the right paid entry path for families, school-referred families, and institutional rollout.";

  const backHref = upgradeChildrenFlow ? `/${locale}/app/family` : `/${locale}`;
  const backLabel = upgradeChildrenFlow ? "Back family" : "Back home";

  const accessState = await getUserAccessState();

  const schoolOffer =
    accessState.familyAccount != null
      ? await getFamilySchoolOffer({
          familyAccountId: accessState.familyAccount.id,
        })
      : null;
  const isSchoolOfferAvailable = schoolOffer != null;

  const isTrialAvailable =
    accessState.kind === "anonymous" ||
    accessState.kind === "no_family_trial_available" ||
    accessState.trialAvailable;

  const manageHref = `/${locale}/app/family`;

  return (
    <LocalePageShell
      locale={locale}
      title={title}
      subtitle={subtitle}
      backHref={backHref}
      backLabel={backLabel}
      navLinks={[
        { href: `/${locale}/demo`, label: "Demo" },
        { href: `/${locale}/signup?entry=trial`, label: "Start trial" },
        { href: `/${locale}/login`, label: "Sign in" },
      ]}
    >
      <div className="space-y-8">
        {upgradeChildrenFlow ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Increase the number of children on this subscription
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              The family account has reached its current child capacity. The
              next step is to move to a higher family plan or a larger
              child-capacity tier.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/app/family`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Return to family
              </Link>
            </div>
          </div>
        ) : null}

        <section>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              Family entry pricing
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Family pricing starts with controlled preview and short trial, then
              moves into paid family access. There is no permanent free tier.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FAMILY_CARDS.map((card) => (
              <PriceCardView
                key={card.title}
                title={card.title}
                price={card.price}
                details={card.details}
                chooseHref={pricingCardHref(locale, card.choosePath)}
                manageHref={manageHref}
                ctaKind={card.ctaKind}
                isTrialAvailable={isTrialAvailable}
                isCurrentPlan={
                  card.matchKey
                    ? isFamilyCardCurrent(accessState, card.matchKey)
                    : false
                }
                isSchoolReferred={card.ctaKind === "school_referred"}
                isSchoolOfferAvailable={isSchoolOfferAvailable}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              School entry
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Schools are not a later add-on. They are part of the main
              go-to-market logic and the main trust path into families.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SCHOOL_CARDS.map((card) => (
              <PriceCardView
                key={card.title}
                title={card.title}
                price={card.price}
                details={card.details}
                chooseHref={pricingCardHref(locale, card.choosePath)}
                manageHref={manageHref}
                ctaKind={card.ctaKind}
                isTrialAvailable={false}
                isCurrentPlan={false}
                isSchoolReferred={false}
                isSchoolOfferAvailable
              />
            ))}
          </div>
        </section>

        <section>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              Kommune, fylke, and rollout layer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Owner packages and analytics are separate institutional paths. They
              should not be hidden behind family pricing logic.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {OWNER_CARDS.map((card) => (
              <PriceCardView
                key={card.title}
                title={card.title}
                price={card.price}
                details={card.details}
                chooseHref={pricingCardHref(locale, card.choosePath)}
                manageHref={manageHref}
                ctaKind={card.ctaKind}
                isTrialAvailable={false}
                isCurrentPlan={false}
                isSchoolReferred={false}
                isSchoolOfferAvailable
              />
            ))}
          </div>
        </section>
      </div>
    </LocalePageShell>
  );
}

