import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Demo"
      subtitle="Marketing placeholder for demo."
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/pricing`, label: "Pricing" },
        { href: `/${locale}/app/dashboard`, label: "App Dashboard" },
      ]}
    />
  );
}

