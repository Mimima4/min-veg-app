import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LOCALES } from "./locales";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  // Next.js may provide params as a Promise in server components.
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) {
    notFound();
  }

  return <>{children}</>;
}

