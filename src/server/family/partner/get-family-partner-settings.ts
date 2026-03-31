import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserAccessState } from "@/server/billing/get-user-access-state";

export type FamilyPartnerStatus = "none" | "pending_link" | "linked";

export type FamilyPartnerSettings = {
  canManage: boolean;
  visible: boolean;
  teaserOnly: boolean;
  readonly: boolean;
  availableOnPaidPlan: boolean;
  hasLinkedPartner: boolean;
  status: FamilyPartnerStatus;
  viewerRole: "primary_parent" | "family_partner" | "none";
  heading: string;
  description: string;
  partnerEmail: string | null;
  partnerDisplayName: string | null;
  partnerUserId: string | null;
  replaceUsed: boolean;
  canReplace: boolean;
  invitedAt: string | null;
  linkedAt: string | null;
};

export async function getFamilyPartnerSettings(): Promise<FamilyPartnerSettings> {
  const accessState = await getUserAccessState();

  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const noneHeading = "Second parent";
  const noneDescription =
    "Add the second parent to this family account. Available on paid plan only.";
  const visible = true;

  if (!user) {
    return {
      canManage: false,
      visible,
      teaserOnly: false,
      readonly: true,
      availableOnPaidPlan: true,
      hasLinkedPartner: false,
      status: "none",
      viewerRole: "none",
      heading: noneHeading,
      description: noneDescription,
      partnerEmail: null,
      partnerDisplayName: null,
      partnerUserId: null,
      replaceUsed: false,
      canReplace: false,
      invitedAt: null,
      linkedAt: null,
    };
  }

  const currentUserId = user.id;
  const { data: linkByPartner } = await admin
    .from("family_partner_links")
    .select(
      "id, family_account_id, primary_user_id, partner_email, partner_user_id, status, replace_used, invited_at, linked_at"
    )
    .eq("partner_user_id", currentUserId)
    .maybeSingle();

  // Highest-priority branch: linked family partner must never fall through
  // to primary/teaser logic.
  if (linkByPartner && linkByPartner.partner_user_id === currentUserId) {
    const primaryUserId = linkByPartner.primary_user_id ?? null;

    let primaryDisplayName: string | null = null;
    let primaryEmail: string | null = null;

    if (primaryUserId) {
      const { data: primaryProfile } = await admin
        .from("user_profiles")
        .select("display_name, email")
        .eq("id", primaryUserId)
        .maybeSingle();

      primaryDisplayName = primaryProfile?.display_name?.trim() ?? null;
      primaryEmail = primaryProfile?.email ?? null;
    }

    return {
      canManage: false,
      visible,
      teaserOnly: false,
      readonly: true,
      availableOnPaidPlan: true,
      hasLinkedPartner: true,
      status: "linked",
      viewerRole: "family_partner",
      heading: "Primary parent",
      description: "This is the primary parent linked to your family connection.",
      partnerEmail: primaryEmail,
      partnerDisplayName: primaryDisplayName,
      partnerUserId: primaryUserId,
      replaceUsed: Boolean(linkByPartner.replace_used),
      canReplace: false,
      invitedAt: linkByPartner.invited_at ?? null,
      linkedAt: linkByPartner.linked_at ?? null,
    };
  }

  const readonly =
    accessState.kind === "trial_expired" || accessState.kind === "inactive_access";

  const teaserOnly =
    accessState.kind === "no_family_trial_available" ||
    accessState.kind === "trial_active" ||
    accessState.familyAccount?.plan_type === "trial";

  const paidLike =
    accessState.kind === "paid_active" ||
    accessState.kind === "inactive_access" ||
    accessState.kind === "no_family_paid";

  const primaryFamilyAccountId = accessState.familyAccount?.id ?? null;

  const { data: linkByPrimaryFamily } = primaryFamilyAccountId
    ? await admin
        .from("family_partner_links")
        .select(
          "id, family_account_id, primary_user_id, partner_email, partner_user_id, status, replace_used, invited_at, linked_at"
        )
        .eq("family_account_id", primaryFamilyAccountId)
        .maybeSingle()
    : { data: null };

  // A) Current user is the family primary user + link exists for their family.
  if (
    linkByPrimaryFamily &&
    linkByPrimaryFamily.primary_user_id === currentUserId
  ) {
    let partnerDisplayName: string | null = null;
    const partnerUserId = linkByPrimaryFamily.partner_user_id ?? null;
    const partnerEmail = linkByPrimaryFamily.partner_email ?? null;

    if (partnerUserId) {
      const { data: partnerProfile } = await admin
        .from("user_profiles")
        .select("display_name")
        .eq("id", partnerUserId)
        .maybeSingle();

      partnerDisplayName = partnerProfile?.display_name?.trim() || partnerEmail;
    } else {
      // Pending link case: fallback to email.
      partnerDisplayName = partnerEmail;
    }

    const status: FamilyPartnerStatus = linkByPrimaryFamily.status ?? "none";

    return {
      canManage: paidLike && !readonly && !teaserOnly,
      visible,
      teaserOnly,
      readonly,
      availableOnPaidPlan: true,
      hasLinkedPartner: status === "linked" && Boolean(partnerUserId),
      status,
      viewerRole: "primary_parent",
      heading: "Second parent",
      description:
        "Add the second parent to this family account. Available on paid plan only.",
      partnerEmail: partnerEmail,
      partnerDisplayName,
      partnerUserId,
      replaceUsed: Boolean(linkByPrimaryFamily.replace_used),
      canReplace:
        Boolean(linkByPrimaryFamily) &&
        !Boolean(linkByPrimaryFamily.replace_used) &&
        paidLike &&
        !readonly,
      invitedAt: linkByPrimaryFamily.invited_at ?? null,
      linkedAt: linkByPrimaryFamily.linked_at ?? null,
    };
  }

  // C) Otherwise keep existing primary path none/pending behavior.
  if (!user) {
    // unreachable (handled above), but keep it safe
    return {
      canManage: false,
      visible,
      teaserOnly,
      readonly: true,
      availableOnPaidPlan: true,
      hasLinkedPartner: false,
      status: "none",
      viewerRole: "none",
      heading: noneHeading,
      description: noneDescription,
      partnerEmail: null,
      partnerDisplayName: null,
      partnerUserId: null,
      replaceUsed: false,
      canReplace: false,
      invitedAt: null,
      linkedAt: null,
    };
  }

  if (!paidLike && !teaserOnly) {
    return {
      canManage: false,
      visible,
      teaserOnly: false,
      readonly: true,
      availableOnPaidPlan: true,
      hasLinkedPartner: false,
      status: "none",
      viewerRole: "none",
      heading: noneHeading,
      description: noneDescription,
      partnerEmail: null,
      partnerDisplayName: null,
      partnerUserId: null,
      replaceUsed: false,
      canReplace: false,
      invitedAt: null,
      linkedAt: null,
    };
  }

  if (!primaryFamilyAccountId) {
    return {
      canManage: false,
      visible,
      teaserOnly,
      readonly: true,
      availableOnPaidPlan: true,
      hasLinkedPartner: false,
      status: "none",
      viewerRole: "none",
      heading: noneHeading,
      description: noneDescription,
      partnerEmail: null,
      partnerDisplayName: null,
      partnerUserId: null,
      replaceUsed: false,
      canReplace: false,
      invitedAt: null,
      linkedAt: null,
    };
  }

  // Primary path link lookup (same as old logic).
  const link = linkByPrimaryFamily;
  let partnerDisplayName: string | null = null;

  if (link?.partner_user_id) {
    const { data: partnerProfile } = await admin
      .from("user_profiles")
      .select("display_name")
      .eq("id", link.partner_user_id)
      .maybeSingle();

    partnerDisplayName = partnerProfile?.display_name?.trim() || link.partner_email;
  }

  const status: FamilyPartnerStatus = link?.status ?? "none";

  return {
    canManage: paidLike && !readonly && !teaserOnly,
    visible,
    teaserOnly,
    readonly,
    availableOnPaidPlan: true,
    hasLinkedPartner:
      (link?.status ?? "none") === "linked" && Boolean(link?.partner_user_id),
    status,
    viewerRole: "none",
    heading: noneHeading,
    description: noneDescription,
    partnerEmail: link?.partner_email ?? null,
    partnerDisplayName,
    partnerUserId: link?.partner_user_id ?? null,
    replaceUsed: Boolean(link?.replace_used),
    canReplace: Boolean(link) && !Boolean(link?.replace_used) && paidLike && !readonly,
    invitedAt: link?.invited_at ?? null,
    linkedAt: link?.linked_at ?? null,
  };
}
