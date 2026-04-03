import Link from "next/link";

const BTN_PRIMARY =
  "inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800";

const CARD_BASE = "rounded-2xl border border-stone-200 bg-white p-6";

export type PricingPriceCardCtaKind =
  | "demo"
  | "trial"
  | "school_referred"
  | "standard";

type PriceCardViewProps = {
  title: string;
  price: string;
  details: string;
  chooseHref: string;
  manageHref: string;
  ctaKind: PricingPriceCardCtaKind;
  isTrialAvailable: boolean;
  isCurrentPlan: boolean;
  isSchoolReferred: boolean;
  isSchoolOfferAvailable: boolean;
};

export function PriceCardView({
  title,
  price,
  details,
  chooseHref,
  manageHref,
  ctaKind,
  isTrialAvailable,
  isCurrentPlan,
  isSchoolReferred,
  isSchoolOfferAvailable,
}: PriceCardViewProps) {
  const wrapperClass = [
    CARD_BASE,
    isSchoolReferred && !isSchoolOfferAvailable && "opacity-50 pointer-events-none",
  ]
    .filter(Boolean)
    .join(" ");

  const cta =
    ctaKind === "demo" ? (
      <Link href={chooseHref} className={BTN_PRIMARY}>
        Open demo
      </Link>
    ) : ctaKind === "trial" ? (
      isTrialAvailable ? (
        <Link href={chooseHref} className={BTN_PRIMARY}>
          Start trial
        </Link>
      ) : null
    ) : isCurrentPlan ? (
      <>
        <div className="mt-4 text-sm font-medium text-green-600">
          Current plan
        </div>
        <Link href={manageHref} className={`${BTN_PRIMARY} mt-2`}>
          Manage plan
        </Link>
      </>
    ) : isSchoolReferred ? (
      isSchoolOfferAvailable ? (
        <Link href={chooseHref} className={BTN_PRIMARY}>
          Choose plan
        </Link>
      ) : null
    ) : (
      <Link href={chooseHref} className={BTN_PRIMARY}>
        Choose plan
      </Link>
    );

  return (
    <div className={wrapperClass}>
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <div className="mt-3 text-sm font-medium text-stone-900">{price}</div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{details}</p>

      {cta ? <div className="mt-4">{cta}</div> : null}

      {isSchoolReferred && !isSchoolOfferAvailable ? (
        <div className="mt-3 text-xs text-stone-500">
          Available with school offer
        </div>
      ) : null}
    </div>
  );
}
