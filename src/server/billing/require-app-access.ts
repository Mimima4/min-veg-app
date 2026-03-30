import "server-only";

import { redirect } from "next/navigation";
import {
  getUserAccessState,
  type UserAccessState,
} from "@/server/billing/get-user-access-state";
import { isReadonlyAccess } from "@/server/billing/is-readonly-access";

export type AppAccessGateResult = {
  accessState: UserAccessState;
  readonly: boolean;
  allowedInAppShell: boolean;
  allowedProductAccess: boolean;
};

function canEnterAppShell(accessState: UserAccessState): boolean {
  switch (accessState.kind) {
    case "trial_active":
    case "paid_active":
    case "no_family_paid":
    case "no_family_trial_available":
    case "no_family_no_trial":
    case "institutional_pending":
      return true;
    default:
      return false;
  }
}

function hasFullProductAccess(accessState: UserAccessState): boolean {
  return (
    accessState.kind === "trial_active" || accessState.kind === "paid_active"
  );
}

function isReadonlyAllowedPath(pathname: string, locale: string): boolean {
  const normalizedPathname = pathname.startsWith(`/${locale}/`)
    ? pathname.slice(locale.length + 1)
    : pathname;

  return (
    normalizedPathname === "/app/profile" || normalizedPathname === "/app/family"
  );
}

export async function requireAppAccess(args: {
  locale: string;
  pathname: string;
}): Promise<AppAccessGateResult> {
  const accessState = await getUserAccessState();

  if (accessState.kind === "anonymous") {
    redirect(`/${args.locale}/login`);
  }

  const allowedProductAccess = hasFullProductAccess(accessState);
  const readonly = isReadonlyAccess(accessState);
  const allowedInAppShell = readonly
    ? isReadonlyAllowedPath(args.pathname, args.locale)
    : canEnterAppShell(accessState);

  if (!allowedInAppShell) {
    const next = encodeURIComponent(args.pathname);
    redirect(`/${args.locale}/resolve-access?next=${next}`);
  }

  return {
    accessState,
    readonly,
    allowedInAppShell,
    allowedProductAccess,
  };
}
