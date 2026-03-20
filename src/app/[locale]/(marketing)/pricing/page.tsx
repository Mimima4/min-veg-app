import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Pricing"
      subtitle="Marketing placeholder."
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/demo`, label: "Demo" },
        { href: `/${locale}/login`, label: "Login" },
      ]}
    />
  );
}

