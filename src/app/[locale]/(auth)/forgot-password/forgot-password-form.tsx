"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  fromAccount?: boolean;
};

export default function ForgotPasswordForm({
  locale,
  fromAccount = false,
}: Props) {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const redirectSuffix = fromAccount ? "?from=account" : "";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password${redirectSuffix}`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {message ? (
        <p className="text-sm text-emerald-700">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send reset email"}
      </button>
    </form>
  );
}