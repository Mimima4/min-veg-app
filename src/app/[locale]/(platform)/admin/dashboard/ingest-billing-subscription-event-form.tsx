"use client";

import { useFormStatus } from "react-dom";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
    >
      {pending ? "Recording..." : "Record billing subscription event"}
    </button>
  );
}

export default function IngestBillingSubscriptionEventForm({ action }: Props) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-stone-700">User email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            placeholder="lenkevich85@gmail.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-stone-700">Event type</span>
          <select
            name="eventType"
            required
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            defaultValue="subscription_renewed_success"
          >
            <option value="subscription_started_success">
              subscription_started_success
            </option>
            <option value="subscription_renewed_success">
              subscription_renewed_success
            </option>
            <option value="payment_failed">payment_failed</option>
            <option value="payment_recovered">payment_recovered</option>
            <option value="auto_renew_disabled">auto_renew_disabled</option>
            <option value="auto_renew_enabled">auto_renew_enabled</option>
            <option value="cancellation_scheduled">
              cancellation_scheduled
            </option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-stone-700">Billing cycle</span>
          <select
            name="billingCycle"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            defaultValue=""
          >
            <option value="">—</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-stone-700">
            External event ID
          </span>
          <input
            name="externalEventId"
            type="text"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            placeholder="optional-provider-event-id"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-stone-700">
            Current period starts at
          </span>
          <input
            name="currentPeriodStartsAt"
            type="datetime-local"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-stone-700">
            Current period ends at
          </span>
          <input
            name="currentPeriodEndsAt"
            type="datetime-local"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          />
        </label>
      </div>

      <p className="text-sm text-stone-500">
        Recording the event will also run billing notification sync automatically.
      </p>

      <SubmitButton />
    </form>
  );
}