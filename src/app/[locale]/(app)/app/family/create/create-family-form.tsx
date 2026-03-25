"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  userId: string;
  entry?: string;
};

type TrialConfig = {
  isTrial: boolean;
  title: string;
  description: string;
};

function resolveConfig(entry?: string): TrialConfig {
  const normalized = (entry ?? "").trim().toLowerCase();

  if (normalized === "trial") {
    return {
      isTrial: true,
      title: "3-day trial",
      description:
        "Your 3-day trial starts when this family account is created. The trial duration is fixed and cannot be extended. Paid plan selection comes later only if you upgrade.",
    };
  }

  return {
    isTrial: false,
    title: "Create family account",
    description: "Create the base family container for your Min Veg area.",
  };
}

export default function CreateFamilyForm({ locale, userId, entry }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const config = useMemo(() => resolveConfig(entry), [entry]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const now = new Date();
    const trialEndsAt = new Date(
      now.getTime() + 3 * 24 * 60 * 60 * 1000
    ).toISOString();

    const payload = config.isTrial
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
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEndsAt,
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
          plan_type: "family_basic",
          plan_code: "family_basic",
          status: "active",
          subscription_state: "inactive",
          entry_source: "direct",
          activation_source: "self_serve",
          max_children: 4,
          trial_used: false,
          trial_started_at: null,
          trial_ends_at: null,
          current_period_starts_at: null,
          current_period_ends_at: null,
          next_billing_at: null,
          auto_renew_enabled: false,
          grace_period_ends_at: null,
          payment_failed_at: null,
          last_payment_status: "unknown",
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
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          {config.description}
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Access mode</label>
        <div className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900">
          {config.isTrial ? "3-day trial" : "Family setup"}
        </div>
      </div>

      {config.isTrial ? (
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