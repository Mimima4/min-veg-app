import { UserAccessState } from "@/server/billing/get-user-access-state";

export function isReadonlyAccess(state: UserAccessState): boolean {
  return (
    state.kind === "trial_expired" ||
    state.kind === "inactive_access"
  );
}
