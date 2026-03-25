import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "./locales";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <>{children}</>;
}
