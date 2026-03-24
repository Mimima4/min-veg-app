"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  locale: string;
};

export default function UpgradeChildLimitButton({ locale }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleClick() {
    const confirmed = window.confirm(
      "You have reached the current child limit for this subscription. Do you want to open the upgrade page to increase the number of children?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    router.push(`/${locale}/pricing?intent=upgrade-children&source=family-limit`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 disabled:opacity-60"
    >
      {loading ? "Opening upgrade page..." : "Child limit reached"}
    </button>
  );
}