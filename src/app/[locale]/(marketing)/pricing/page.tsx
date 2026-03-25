import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";

type PriceCard = {
  title: string;
  price: string;
  details: string;
};

const FAMILY_CARDS: PriceCard[] = [
  {
    title: "Demo",
    price: "Free",
    details:
      "1 demo child profile, 3–5 professions, 1 example roadmap, no teacher-link, no full profile saving.",
  },
  {
    title: "3-day trial",
    price: "3 days",
    details: "Full access to the family core for a short trial period.",
  },
  {
    title: "Family Basic",
    price: "149 NOK / month · 1 290 NOK / year",
    details:
      "Up to 4 children, profession cards, study options, programmes, roadmap, and saved routes.",
  },
  {
    title: "Family Plus",
    price: "199 NOK / month · 1 790 NOK / year",
    details:
      "Up to 6 children, everything in Basic, plus extended history and family planning depth.",
  },
  {
    title: "School-referred Family Basic",
    price: "990 NOK / first year",
    details: "Discounted family activation through school.",
  },
  {
    title: "School-referred Family Plus",
    price: "1 390 NOK / first year",
    details: "Discounted extended family activation through school.",
  },
  {
    title: "Young Adult",
    price: "99 NOK / month · 890 NOK / year",
    details:
      "Self-owned path after school, roadmap import, early work pathway, no child profiles.",
  },
];

const SCHOOL_CARDS: PriceCard[] = [
  {
    title: "School Starter",
    price: "29 900 NOK / year",
    details:
      "1 school, up to 15 staff, parent invitation flow, teacher-link, shared planning mode.",
  },
  {
    title: "School Plus",
    price: "49 900 NOK / year",
    details:
      "1 school, up to 40 staff, school dashboard, strengths analytics, school-level summary.",
  },
  {
    title: "Extra school",
    price: "+12 000 NOK / year",
    details: "For each additional school inside the same agreement.",
  },
];

const OWNER_CARDS: PriceCard[] = [
  {
    title: "Kommune Package",
    price: "69 000 NOK → 549 000 NOK / year",
    details:
      "Tiered by school count. Includes school dashboard, kommune dashboard, strengths block, trend block, and demand-interest mismatch.",
  },
  {
    title: "Fylke Package",
    price: "99 000 NOK → 629 000 NOK / year",
    details:
      "Tiered by upper secondary school scope / territorial coverage. Includes youth continuity, early work pathway, and regional analytics.",
  },
  {
    title: "Analytics / pilots / implementation",
    price: "Add-ons and pilot logic",
    details:
      "School Analytics, Kommune Analytics, Fylke Analytics, Regional Analytics, implementation, workshops, and pilot models.",
  },
];

function PriceCardView({ title, price, details }: PriceCard) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <div className="mt-3 text-sm font-medium text-stone-900">{price}</div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{details}</p>
    </div>
  );
}

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
              <PriceCardView key={card.title} {...card} />
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
              <PriceCardView key={card.title} {...card} />
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
              <PriceCardView key={card.title} {...card} />
            ))}
          </div>
        </section>
      </div>
    </LocalePageShell>
  );
}

