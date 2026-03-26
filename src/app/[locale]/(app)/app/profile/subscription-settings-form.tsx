"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  subscriptionLabel: string;
  helperText: string;
  initialAutoRenewEnabled: boolean;
  canToggleAutoRenew: boolean;
  disabledReason?: string | null;
};

function AutoRenewSwitch({
  checked,
  onToggle,
  canToggleAutoRenew,
}: {
  checked: boolean;
  onToggle: () => void;
  canToggleAutoRenew: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle auto-renew"
      disabled={!canToggleAutoRenew || pending}
      onClick={onToggle}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full transition",
        checked ? "bg-stone-900" : "bg-stone-300",
        !canToggleAutoRenew || pending
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 rounded-full bg-white transition",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function PendingMessage() {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return <p className="text-sm text-stone-500">Saving subscription settings…</p>;
}

export default function SubscriptionSettingsForm({
  action,
  subscriptionLabel,
  helperText,
  initialAutoRenewEnabled,
  canToggleAutoRenew,
  disabledReason,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [checked, setChecked] = useState(initialAutoRenewEnabled);

  useEffect(() => {
    setChecked(initialAutoRenewEnabled);
  }, [initialAutoRenewEnabled]);

  function handleToggle() {
    if (!canToggleAutoRenew) {
      return;
    }

    const nextValue = !checked;
    setChecked(nextValue);

    requestAnimationFrame(() => {
      formRef.current?.requestSubmit();
    });
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-stone-900">
        Current subscription
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {subscriptionLabel}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        {helperText}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div>
          <p className="text-sm font-medium text-stone-900">Auto-renew</p>
          <p className="mt-1 text-sm text-stone-600">
            {canToggleAutoRenew
              ? "Turn automatic renewal on or off for this subscription."
              : disabledReason ??
                "Auto-renew is available when an eligible paid subscription is active."}
          </p>
        </div>

        <input
          type="hidden"
          name="autoRenewEnabled"
          value={checked ? "on" : "off"}
        />

        <AutoRenewSwitch
          checked={checked}
          onToggle={handleToggle}
          canToggleAutoRenew={canToggleAutoRenew}
        />
      </div>

      <div className="mt-4">
        <PendingMessage />
      </div>
    </form>
  );
}