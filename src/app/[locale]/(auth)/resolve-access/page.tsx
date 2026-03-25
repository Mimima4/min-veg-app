import { redirect } from "next/navigation";
import { resolvePostLoginDestination } from "@/server/billing/resolve-post-login-destination";

export default async function ResolveAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const href = await resolvePostLoginDestination({ locale });

  redirect(href);
}