"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EntryMode = "trial" | "paid" | "school" | "direct";
type PlanType = "trial" | "family_basic" | "family_plus";

type Props = {
  locale: string;
  userId: string;
  entry?: string;
};

type EntryConfig = {
  mode: EntryMode;
  title: string;
  description: string;
  planType: PlanType;
  planCode: string;
  status: string;
  subscriptionState: string;
  entrySource: string;
  activationSource: string;
  maxChildren: number;
  trialUsed: boolean;
  isTrial: boolean;
};

function resolveEntryConfig(entry?: string): EntryConfig {
  const normalized = (entry ?? "").trim().toLowerCase();

  if (normalized === "trial") {
    return {
      mode: "trial",
      title: "3-day trial",
      description:
        "Your 3-day trial starts when this family account is created.\nThe trial duration is fixed and cannot be extended.\nPaid plan selection comes later only if you upgrade.",
      planType: "trial",
      planCode: "trial",
      status: "active",
      subscriptionState: "trialing",
      entrySource: "trial",
      activationSource: "self_serve_trial",
      maxChildren: 2,
      trialUsed: true,
      isTrial: true,
    };
  }

  if (normalized === "paid") {
    return {
      mode: "paid",
      title: "Paid family setup",
      description:
        "Create the family container first. Paid billing details can be completed in the next step.",
      planType: "family_basic",
      planCode: "family_basic",
      status: "active",
      subscriptionState: "inactive",
      entrySource: "paid",
      activationSource: "self_serve_paid",
      maxChildren: 4,
      trialUsed: false,
      isTrial: false,
    };
  }

  if (normalized === "school") {
    return {
      mode: "school",
      title: "School-referred family setup",
      description:
        "Create the family container first. Institutional billing and access are handled separately.",
      planType: "family_basic",
      planCode: "family_basic",
      status: "active",
      subscriptionState: "inactive",
      entrySource: "school_referral",
      activationSource: "school_led",
      maxChildren: 4,
      trialUsed: false,
      isTrial: false,
    };
  }

  return {
    mode: "direct",
    title: "Create family account",
    description: "Create the base family container for your Min Veg area.",
    planType: "family_basic",
    planCode: "family_basic",
    status: "active",
    subscriptionState: "inactive",
    entrySource: "direct",
    activationSource: "self_serve",
    maxChildren: 4,
    trialUsed: false,
    isTrial: false,
  };
}

export default function CreateFamilyForm({ locale, userId, entry }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const config = useMemo(() => resolveEntryConfig(entry), [entry]);
  const isTrialEntry = config.mode === "trial";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const now = new Date();

    const payload = isTrialEntry
      ? {
          primary_user_id: userId,
          plan_type: "trial",
          plan_code: "trial",
          status: "active",
          subscription_state: "trialing",
          entry_source: "trial",
          activation_source: "self_serve_trial",
          max_children: 2,
          trial_used: true,
          trial_started_at: new Date().toISOString(),
          trial_ends_at: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          current_period_starts_at: null,
          current_period_ends_at: null,
          next_billing_at: null,
          auto_renew_enabled: false,
          grace_period_ends_at: null,
          payment_failed_at: null,
          last_payment_status: "not_applicable",
          canceled_at: null,
        }
      : {
          primary_user_id: userId,
          plan_type: config.planType,
          plan_code: config.planCode,
          status: config.status,
          subscription_state: config.subscriptionState,
          entry_source: config.entrySource,
          activation_source: config.activationSource,
          max_children: config.maxChildren,
          trial_used: config.trialUsed,
          trial_started_at: config.isTrial ? now.toISOString() : null,
          trial_ends_at: config.isTrial
            ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
            : null,
          current_period_starts_at: null,
          current_period_ends_at: null,
          next_billing_at: null,
          auto_renew_enabled: false,
          grace_period_ends_at: null,
          payment_failed_at: null,
          last_payment_status: config.isTrial ? "not_applicable" : "unknown",
          canceled_at: null,
        };

    const { error } = await supabase.from("family_accounts").insert(payload);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(`/${locale}/app/family`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-stone-900">{config.title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">
          {config.description}
        </p>
      </div>

      {isTrialEntry ? null : (
        <div className="space-y-1">
          <label className="block text-sm text-stone-700">Access mode</label>
          <div className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900">
            {config.isTrial ? "3-day trial" : "Family setup"}
          </div>
        </div>
      )}

      {isTrialEntry ? null : config.isTrial ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Trial access is temporary. You can upgrade later without creating a
          new account.
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create family account"}
      </button>
    </form>
  );
}
