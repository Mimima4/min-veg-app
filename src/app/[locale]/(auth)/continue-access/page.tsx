import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import LoginForm from "../login/login-form";
import { resolvePostLoginDestination } from "@/server/billing/resolve-post-login-destination";

export default async function ContinueAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { locale } = await params;
  const { mode } = await searchParams;

  const resolvedMode = mode === "standard" ? "standard" : "continue";
  const resolution = await resolvePostLoginDestination({
    locale,
    mode: resolvedMode,
  });

  if (resolution.kind === "redirect") {
    redirect(resolution.href);
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Continue access"
      subtitle="Use this path to continue a 3-day trial, complete activation, or recover access after unpaid or inactive billing."
      backHref={`/${locale}`}
      backLabel="Back home"
    >
      <LoginForm locale={locale} mode="continue" />

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-base font-semibold text-stone-900">
          When to use this sign in
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-600">
          <li>Continue a 3-day trial after confirming your email.</li>
          <li>Finish family activation without creating a new account.</li>
          <li>Recover access after unpaid or inactive billing.</li>
          <li>
            Continue school, kommune, or fylke entry without standard product
            access.
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/pricing?entry=family`}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            Family pricing
          </Link>

          <Link
            href={`/${locale}/pricing?entry=institutional`}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            Institutional pricing
          </Link>
        </div>
      </div>
    </LocalePageShell>
  );
}