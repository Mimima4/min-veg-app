import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import LoginForm from "./login-form";

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
      subtitle="Sign in to continue to your Min Veg workspace."
      backHref={`/${locale}`}
    >
      <LoginForm locale={locale} />

      <div className="mt-6 space-y-3 text-sm text-stone-500">
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href={`/${locale}/signup`}
            className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
          >
            Create one
          </Link>
        </div>

        <div>
          Forgot your password?{" "}
          <Link
            href={`/${locale}/forgot-password`}
            className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
          >
            Reset it
          </Link>
        </div>
      </div>
    </LocalePageShell>
  );
}