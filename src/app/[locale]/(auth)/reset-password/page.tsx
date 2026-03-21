import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Reset password"
      subtitle="Set a new password after opening the recovery link from your email."
      backHref={`/${locale}/login`}
    >
      <ResetPasswordForm locale={locale} />

      <div className="mt-6 text-sm text-stone-500">
        Back to{" "}
        <Link
          href={`/${locale}/login`}
          className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
        >
          Login
        </Link>
      </div>
    </LocalePageShell>
  );
}