"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  userId: string;
  entry: "trial" | "paid";
};

type CreateConfig = {
  title: string;
  description: string;
  submitLabel: string;
};

function getConfig(entry: "trial" | "paid"): CreateConfig {
  if (entry === "paid") {
    return {
      title: "Create family account",
      description:
        "Your paid access is already active. Create the family container to continue.",
      submitLabel: "Create family account",
    };
  }

  return {
    title: "3-day trial",
    description:
      "Your 3-day trial starts when this family account is created. The trial duration is fixed and cannot be extended.",
    submitLabel: "Start 3-day trial",
  };
}

export default function CreateFamilyForm({
  locale,
  userId,
  entry,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const config = useMemo(() => getConfig(entry), [entry]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const now = new Date();
    const futurePaidDate = "2099-12-31T23:59:59.000Z";
    const trialEndsAt = new Date(
      now.getTime() + 3 * 24 * 60 * 60 * 1000
    ).toISOString();

    const payload =
      entry === "paid"
        ? {
            primary_user_id: userId,
            plan_type: "family_plus",
            plan_code: "family_plus",
            status: "active",
            subscription_state: "active",
            entry_source: "paid",
            activation_source: "self_serve_paid",
            max_children: 6,
            trial_used: true,
            trial_started_at: null,
            trial_ends_at: null,
            current_period_starts_at: now.toISOString(),
            current_period_ends_at: futurePaidDate,
            next_billing_at: futurePaidDate,
            auto_renew_enabled: false,
            grace_period_ends_at: null,
            payment_failed_at: null,
            last_payment_status: "paid",
            canceled_at: null,
          }
        : {
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
          };

    const { error } = await supabase.from("family_accounts").insert(payload);

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (entry === "trial") {
      await supabase.auth.updateUser({
        data: {
          trial_used: true,
          entry_source: "trial",
        },
      });
    }

    setLoading(false);
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

      {entry === "trial" ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Trial access is temporary. You can upgrade later without creating a new
          account.
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Paid access is already active for this account. This step only creates
          the family container.
        </div>
      )}

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Creating..." : config.submitLabel}
      </button>
    </form>
  );
}