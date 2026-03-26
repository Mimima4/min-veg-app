"use client";

import { useFormStatus } from "react-dom";

type Props = {
  action: () => void | Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
    >
      {pending ? "Syncing..." : "Sync billing events"}
    </button>
  );
}

export default function SyncBillingEventsForm({ action }: Props) {
  return (
    <form action={action}>
      <SubmitButton />
    </form>
  );
}