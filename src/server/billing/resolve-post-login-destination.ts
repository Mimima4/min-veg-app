import {
  getDefaultHrefForAccessState,
  getUserAccessState,
} from "@/server/billing/get-user-access-state";

export async function resolvePostLoginDestination({
  locale,
}: {
  locale: string;
}): Promise<string> {
  const accessState = await getUserAccessState();
  return getDefaultHrefForAccessState(locale, accessState);
}