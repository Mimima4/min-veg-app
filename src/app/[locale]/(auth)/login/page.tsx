import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Login"
      subtitle="Auth placeholder."
      backHref={`/${locale}`}
      navLinks={[{ href: `/${locale}/signup`, label: "Signup" }]}
    />
  );
}

