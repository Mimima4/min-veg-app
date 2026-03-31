import "server-only";

import { renderFamilyPartnerInvitationTemplate } from "@/server/family/partner/render-family-partner-invitation-template";

export async function sendFamilyPartnerInvitation(args: {
  locale: string;
  recipientEmail: string;
  senderDisplayName: string | null;
}) {
  const rendered = renderFamilyPartnerInvitationTemplate({
    locale: args.locale,
    recipientEmail: args.recipientEmail,
    senderDisplayName: args.senderDisplayName,
  });

  return {
    provider: "stub",
    messageId: `family-partner-invite:${Date.now()}`,
    ...rendered,
  };
}
