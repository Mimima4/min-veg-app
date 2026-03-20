import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function MarketingHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "nb") {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-tight text-stone-900">
              Min Veg
            </h1>
            <p className="text-lg text-stone-500 font-light leading-relaxed">
              Planning the path forward.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900"
              >
                Pricing
              </Link>
              <div className="text-sm text-stone-500 font-light">
                Pricing = prices
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href={`/${locale}/demo`}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900"
              >
                Demo
              </Link>
              <div className="text-sm text-stone-500 font-light">
                Demo = try before paying
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900"
              >
                Login
              </Link>
              <div className="text-sm text-stone-500 font-light">
                Login = sign in
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href={`/${locale}/app/dashboard`}
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-stone-800 hover:border-stone-300 hover:text-stone-900"
              >
                Dashboard preview
              </Link>
              <div className="text-sm text-stone-500 font-light">
                Dashboard preview = future internal app area
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Min Veg"
      subtitle="Marketing placeholder."
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/pricing`, label: "Pricing" },
        { href: `/${locale}/demo`, label: "Demo" },
        { href: `/${locale}/login`, label: "Login" },
      ]}
    />
  );
}

