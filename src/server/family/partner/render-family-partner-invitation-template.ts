import "server-only";

export type RenderFamilyPartnerInvitationTemplateArgs = {
  locale: string;
  recipientEmail: string;
  senderDisplayName: string | null;
};

export type RenderedFamilyPartnerInvitationTemplate = {
  subject: string;
  text: string;
};

export function renderFamilyPartnerInvitationTemplate(
  args: RenderFamilyPartnerInvitationTemplateArgs
): RenderedFamilyPartnerInvitationTemplate {
  const senderLine = args.senderDisplayName?.trim()
    ? `This invitation was sent by ${args.senderDisplayName.trim()}.`
    : "This invitation was sent from a Min Veg family account.";

  const loginUrl = `/${args.locale}/login`;

  return {
    subject: "You’ve been invited to join a family in Min Veg",
    text: [
      "Hi,",
      "",
      "You’ve been invited to join a family in Min Veg as the second parent.",
      "",
      "Min Veg helps parents support their child’s development, education, and future planning — together.",
      "",
      `👉 Sign in or create account: ${loginUrl}`,
      "",
      "If you already have an account, sign in with this email.",
      "If you’re new, create an account using this email to join the family.",
      "",
      senderLine,
      "",
      "If you weren’t expecting this, you can safely ignore this message.",
      "",
      "— Min Veg",
    ].join("\n"),
  };
}
