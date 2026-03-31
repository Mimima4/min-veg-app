import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_OPTIONS } from "@/lib/profile/country-options";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import SignOutButton from "@/components/auth/sign-out-button";
import ProfileForm from "./profile-form";
import SubscriptionSettingsForm from "./subscription-settings-form";
import FamilyPartnerSettingsSection from "./family-partner-settings";
import { getUserAccessState } from "@/server/billing/get-user-access-state";
import { requireAppAccess } from "@/server/billing/require-app-access";
import { getFamilyPartnerSettings } from "@/server/family/partner/get-family-partner-settings";
import { sendFamilyPartnerInvitation } from "@/server/family/partner/send-family-partner-invitation";

function interfaceLanguageLabel(code: string | null | undefined): string {
  switch (code) {
    case "nb":
      return "nb — Bokmål";
    case "nn":
      return "nn — Nynorsk";
    case "en":
      return "en — English";
    default:
      return "—";
  }
}

function countryLabelForCode(code: string | null | undefined): string {
  const upper = (code ?? "").trim().toUpperCase();
  const match = COUNTRY_OPTIONS.find((c) => c.code === upper);
  return match?.label ?? (upper || "—");
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAppAccess({
    locale,
    pathname: `/${locale}/app/profile`,
  });

  const supabase = await createClient();

  async function updateAutoRenew(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/login`);
    }

    const { data: family } = await supabase
      .from("family_accounts")
      .select("id")
      .eq("primary_user_id", user.id)
      .maybeSingle();

    if (!family) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/app/profile`);
      revalidatePath(`/${locale}/app/family`);
      return;
    }

    const rawValue = formData.get("autoRenewEnabled");
    const autoRenewEnabled = rawValue === "on";

    await supabase
      .from("family_accounts")
      .update({ auto_renew_enabled: autoRenewEnabled })
      .eq("id", family.id);

    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/app/profile`);
    revalidatePath(`/${locale}/app/family`);
  }

  async function saveFamilyPartner(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/login`);
    }

    const { data: senderProfile } = await supabase
      .from("user_profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    const senderDisplayName = senderProfile?.display_name?.trim() || null;

    const accessState = await getUserAccessState();
    const paidActiveLike =
      accessState.kind === "paid_active" ||
      accessState.kind === "no_family_paid";

    if (!paidActiveLike) {
      revalidatePath(`/${locale}/app/profile`);
      revalidatePath(`/${locale}/app/family`);
      return;
    }

    const familyAccountId = accessState.familyAccount?.id;
    if (!familyAccountId) {
      return;
    }

    const partnerEmail = String(formData.get("partnerEmail") ?? "")
      .trim()
      .toLowerCase();

    if (!partnerEmail) {
      return;
    }

    // Basic email validation: must contain "@"
    if (!partnerEmail.includes("@")) {
      return;
    }

    // Prevent linking to the same email as the current user.
    const userEmail = user.email?.trim().toLowerCase();
    if (userEmail && partnerEmail === userEmail) {
      return;
    }

    const { data: existingRow } = await supabase
      .from("family_partner_links")
      .select("id, partner_email, replace_used")
      .eq("family_account_id", familyAccountId)
      .maybeSingle();

    const nowIso = new Date().toISOString();

    if (!existingRow) {
      await supabase.from("family_partner_links").insert({
        family_account_id: familyAccountId,
        primary_user_id: user.id,
        partner_email: partnerEmail,
        status: "pending_link",
        replace_used: false,
      });

      await sendFamilyPartnerInvitation({
        locale,
        recipientEmail: partnerEmail,
        senderDisplayName,
      });
    } else {
      const existingEmail = existingRow.partner_email?.toLowerCase() ?? null;

      if (existingEmail && existingEmail === partnerEmail) {
        // Same email: keep the current linked row untouched.
      } else {
        if (existingRow.replace_used === true) {
          return;
        }

        await supabase
          .from("family_partner_links")
          .update({
            partner_email: partnerEmail,
            partner_user_id: null,
            status: "pending_link",
            linked_at: null,
            invited_at: nowIso,
            replace_used: true,
          })
          .eq("id", existingRow.id);

        await sendFamilyPartnerInvitation({
          locale,
          recipientEmail: partnerEmail,
          senderDisplayName,
        });
      }
    }

    revalidatePath(`/${locale}/app/profile`);
    revalidatePath(`/${locale}/app/family`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("display_name, interface_language, country_code")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Account"
        subtitle="There was a problem loading your account."
      >
        <AppPrivateNav locale={locale} currentPath="/app/profile" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  const accessState = await getUserAccessState();
  const isFamilyPartner = accessState.isFamilyPartner === true;
  const readonlyProfileAccess =
    accessState.kind === "trial_expired" ||
    accessState.kind === "inactive_access";
  const familyPartnerSettings = await getFamilyPartnerSettings();
  const hasSavedProfile = Boolean(profile?.display_name?.trim());
  const initialAutoRenewEnabled = Boolean(
    accessState.familyAccount?.auto_renew_enabled ?? false
  );
  const nextStep = (() => {
    switch (accessState.kind) {
      case "no_family_paid":
        return {
          label: "Create family account",
          href: `/${locale}/app/family/create?entry=paid`,
          helper:
            "Your paid access is already active. The next step is creating the family area.",
        };
      case "no_family_trial_available":
        return {
          label: "Start 3-day trial",
          href: `/${locale}/app/family/create?entry=trial`,
          helper:
            "Trial access is available for this account. Start the trial to create the family area.",
        };
      case "no_family_no_trial":
        return {
          label: "Choose family plan",
          href: `/${locale}/pricing?entry=family`,
          helper:
            "Trial is no longer available for this account. Choose a family plan to continue.",
        };
      case "institutional_pending":
        return {
          label: "View institutional pricing",
          href: `/${locale}/pricing?entry=institutional`,
          helper:
            "This account is waiting for an institutional activation path.",
        };
      case "paid_active":
      case "trial_active":
      case "trial_expired":
      case "inactive_access":
        return {
          label: "Open family",
          href: `/${locale}/app/family`,
          helper:
            "Your family area already exists or is the next place to continue.",
        };
      default:
        return {
          label: "Open family",
          href: `/${locale}/app/family`,
          helper:
            "Your family area already exists or is the next place to continue.",
        };
    }
  })();

  const subscriptionCard = (() => {
    const defaultCard = {
      subscriptionLabel: "No active subscription",
      helperText: "Choose a family plan to continue.",
      canToggleAutoRenew: false,
      disabledReason: null as string | null,
    };

    switch (accessState.kind) {
      case "no_family_paid":
        return {
          subscriptionLabel: "Paid access active",
          helperText: "Create the family account to connect subscription settings.",
          canToggleAutoRenew: false,
          disabledReason: "Auto-renew will appear after the family account is created.",
        };
      case "no_family_trial_available":
        return {
          subscriptionLabel: "Trial available",
          helperText: "Start the trial to create the family area.",
          canToggleAutoRenew: false,
          disabledReason: null,
        };
      case "no_family_no_trial":
        return {
          subscriptionLabel: "No active subscription",
          helperText: "Choose a family plan to continue.",
          canToggleAutoRenew: false,
          disabledReason: null,
        };
      case "institutional_pending":
        return {
          subscriptionLabel: "Institutional activation",
          helperText:
            "Subscription settings are managed through the institutional setup.",
          canToggleAutoRenew: false,
          disabledReason: null,
        };
      case "trial_active":
        return {
          subscriptionLabel: "3-day trial active",
          helperText: "After the trial ends, your account will stay saved.",
          canToggleAutoRenew: false,
          disabledReason: null,
        };
      case "trial_expired":
        return {
          subscriptionLabel: "Trial ended",
          helperText: "Choose a family plan to continue.",
          canToggleAutoRenew: false,
          disabledReason: null,
        };
      case "paid_active": {
        const lifecycle = accessState.activation.subscriptionLifecycleState;

        if (lifecycle === "grace_period") {
          return {
            subscriptionLabel: "Payment issue — grace period",
            helperText:
              "Your access is still active for now. Update payment details soon.",
            canToggleAutoRenew: true,
            disabledReason: null,
          };
        }

        if (lifecycle === "canceled") {
          return {
            subscriptionLabel: "Subscription ends at period end",
            helperText:
              "Auto-renew is off. Access stays active until the current period ends.",
            canToggleAutoRenew: true,
            disabledReason: null,
          };
        }

        return {
          subscriptionLabel: "Subscription active",
          helperText: "Your paid access is active.",
          canToggleAutoRenew: true,
          disabledReason: null,
        };
      }
      case "inactive_access": {
        const lifecycle = accessState.activation.subscriptionLifecycleState;
        const isEligiblePaidFamily =
          accessState.familyAccount.plan_type !== "trial";

        if (lifecycle === "past_due") {
          return {
            subscriptionLabel: "Payment issue",
            helperText: "Update your payment to restore access.",
            canToggleAutoRenew: isEligiblePaidFamily,
            disabledReason: null,
          };
        }

        if (lifecycle === "canceled") {
          return {
            subscriptionLabel: "Subscription ended",
            helperText: "Choose a family plan to continue.",
            canToggleAutoRenew: isEligiblePaidFamily,
            disabledReason: null,
          };
        }

        return {
          subscriptionLabel: "Subscription inactive",
          helperText: "Choose a family plan to continue.",
          canToggleAutoRenew: isEligiblePaidFamily,
          disabledReason: null,
        };
      }
      default:
        return defaultCard;
    }
  })();

  const subscriptionSettings =
    readonlyProfileAccess
      ? {
          ...subscriptionCard,
          canToggleAutoRenew: false,
          disabledReason:
            "Subscription changes are unavailable while this account is in read-only access.",
        }
      : subscriptionCard;

  return (
    <LocalePageShell
      locale={locale}
      title="Account"
      subtitle="Manage your personal account details and interface settings."
    >
      <AppPrivateNav locale={locale} currentPath="/app/profile" />

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Signed in as</p>
          <p className="mt-1 text-base font-medium text-stone-900">
            {profile?.display_name?.trim() || "Your account"}
          </p>
        </div>

        {readonlyProfileAccess ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-base font-semibold text-stone-900">
              Read-only access
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              You can review account and family information, but changes and
              deeper product actions are currently disabled.
            </p>
          </div>
        ) : hasSavedProfile ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-base font-semibold text-stone-900">Next step</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Your account is ready. Continue with the next step below.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              {nextStep.helper}
            </p>

            <div className="mt-4">
              <Link
                href={nextStep.href}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                {nextStep.label}
              </Link>
            </div>
          </div>
        ) : null}

        {!isFamilyPartner ? (
          <SubscriptionSettingsForm
            action={updateAutoRenew}
            subscriptionLabel={subscriptionSettings.subscriptionLabel}
            helperText={subscriptionSettings.helperText}
            initialAutoRenewEnabled={initialAutoRenewEnabled}
            canToggleAutoRenew={subscriptionSettings.canToggleAutoRenew}
            disabledReason={subscriptionSettings.disabledReason}
          />
        ) : null}

        <FamilyPartnerSettingsSection
          locale={locale}
          settings={familyPartnerSettings}
          action={saveFamilyPartner}
        />

        {readonlyProfileAccess ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-base font-semibold text-stone-900">
              Profile
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-stone-500">Display name</dt>
                <dd className="mt-1 font-medium text-stone-900">
                  {profile?.display_name?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Email</dt>
                <dd className="mt-1 font-medium text-stone-900">
                  {user.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Interface language</dt>
                <dd className="mt-1 font-medium text-stone-900">
                  {interfaceLanguageLabel(
                    profile?.interface_language as string | undefined
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Country</dt>
                <dd className="mt-1 font-medium text-stone-900">
                  {countryLabelForCode(profile?.country_code)}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-stone-500">
              Profile editing is unavailable in read-only access.
            </p>
          </div>
        ) : (
          <ProfileForm
            userId={user.id}
            userEmail={user.email ?? ""}
            initialDisplayName={profile?.display_name ?? ""}
            initialInterfaceLanguage={
              (profile?.interface_language as "nb" | "nn" | "en") ?? "nb"
            }
            initialCountryCode={profile?.country_code ?? "NO"}
          />
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold text-stone-900">
            Account actions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Manage password and session actions for this account.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/forgot-password?from=account`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Reset password
            </Link>

            <SignOutButton locale={locale} />
          </div>
        </div>
      </div>
    </LocalePageShell>
  );
}