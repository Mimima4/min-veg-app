import { redirect } from "next/navigation";
import {
  getDefaultHrefForAccessState,
  getUserAccessState,
} from "@/server/billing/get-user-access-state";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const accessState = await getUserAccessState();
  const href = getDefaultHrefForAccessState(locale, accessState);

  redirect(href);
}