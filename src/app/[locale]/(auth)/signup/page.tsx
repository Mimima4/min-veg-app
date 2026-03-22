import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import SignupForm from "./signup-form";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Create account"
      subtitle="Set up your Min Veg account to start planning."
      backHref={`/${locale}`}
      backLabel="Back home"
    >
      <SignupForm locale={locale} />

      <div className="mt-6 text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          href={`/${locale}/login`}
          className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
        >
          Sign in
        </Link>
      </div>
    </LocalePageShell>
  );
}