import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import SignupForm from "./signup-form";

function getSignupCopy(entry?: string) {
  switch (entry) {
    case "trial":
      return {
        title: "Start 3-day trial",
        subtitle:
          "Create your account and unlock the full family core for a short trial period.",
      };
    case "school":
      return {
        title: "Activate through school",
        subtitle:
          "Create your account through a school-referred family entry path.",
      };
    default:
      return {
        title: "Create account",
        subtitle:
          "Set up your Min Veg account to start child planning and route building.",
      };
  }
}

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ entry?: string }>;
}) {
  const { locale } = await params;
  const { entry } = await searchParams;

  const copy = getSignupCopy(entry);

  return (
    <LocalePageShell
      locale={locale}
      title={copy.title}
      subtitle={copy.subtitle}
      backHref={`/${locale}`}
      backLabel="Back home"
    >
      <SignupForm locale={locale} entry={entry} />

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