import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Signup"
      subtitle="Auth placeholder."
      backHref={`/${locale}`}
      navLinks={[{ href: `/${locale}/login`, label: "Login" }]}
    />
  );
}

