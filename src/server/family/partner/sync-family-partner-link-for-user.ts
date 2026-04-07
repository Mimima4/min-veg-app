import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { consolidateDuplicateFamilyAccount } from "@/server/billing/consolidate-duplicate-family-account";

export async function syncFamilyPartnerLinkForUser(args: {
  userId: string;
  email: string | null | undefined;
}) {
  const normalizedEmail = (args.email ?? "").trim().toLowerCase();

  if (!normalizedEmail) {
    return;
  }

  const admin = createAdminClient();

  const { data: link } = await admin
    .from("family_partner_links")
    .select(
      "id, family_account_id, partner_email, partner_user_id, status, linked_at"
    )
    .eq("partner_email", normalizedEmail)
    .maybeSingle();

  if (!link) {
    return;
  }

  if ((link.partner_email ?? "").trim().toLowerCase() !== normalizedEmail) {
    return;
  }

  if (link.partner_user_id === args.userId) {
    return;
  }

  await admin
    .from("family_partner_links")
    .update({
      partner_user_id: args.userId,
      status: "linked",
      linked_at: link.linked_at ?? new Date().toISOString(),
    })
    .eq("id", link.id);

  const familyAccountId = link.family_account_id;

  if (familyAccountId) {
    await consolidateDuplicateFamilyAccount({
      canonicalFamilyAccountId: familyAccountId,
      partnerUserId: args.userId,
    });
  }
}
