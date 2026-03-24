import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string; source?: string }>;
}) {
  const { locale } = await params;
  const { intent } = await searchParams;

  const upgradeChildrenFlow = intent === "upgrade-children";

  return (
    <LocalePageShell
      locale={locale}
      title={upgradeChildrenFlow ? "Upgrade family capacity" : "Pricing"}
      subtitle={
        upgradeChildrenFlow
          ? "Your current family subscription has reached its child limit. Review the upgrade path for adding more child profiles."
          : "Choose the right paid entry point for families, schools, and future institutional rollout."
      }
      backHref={upgradeChildrenFlow ? `/${locale}/app/family` : `/${locale}`}
      backLabel={upgradeChildrenFlow ? "Back family" : "Back home"}
      navLinks={[
        { href: `/${locale}/demo`, label: "Demo" },
        { href: `/${locale}/login`, label: "Login" },
      ]}
    >
      <div className="space-y-6">
        {upgradeChildrenFlow ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Increase the number of children on this subscription
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              The family account has reached its current child capacity. The next
              step is to move to a higher family plan or an expanded child-capacity
              tier.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="text-sm font-semibold text-stone-900">
                  Why this matters
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Child capacity is part of the paid family model. Increasing the
                  limit keeps the account usable without breaking the existing family
                  planning flow.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="text-sm font-semibold text-stone-900">
                  What this upgrade should unlock
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  More child profiles, more saved routes, and continued access to the
                  parent-facing planning layer inside the same family account.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <Link
                href={`/${locale}/app/family`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Return to family
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Family plans
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Paid family access should control depth, planning continuity, and child
              capacity. This is the natural upgrade path when a family needs more
              active child profiles.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Institutional direction
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              The long-term pricing model still needs to support school-led,
              owner-ready, and analytics-based expansion beyond the family layer.
            </p>
          </div>
        </div>
      </div>
    </LocalePageShell>
  );
}

