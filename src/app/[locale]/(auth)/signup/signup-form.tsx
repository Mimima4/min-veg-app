"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  entry?: string;
};

export default function SignupForm({ locale, entry }: Props) {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resolveEntrySource(value?: string): "trial" | "school" | "direct" {
    const normalized = (value ?? "").trim().toLowerCase();

    if (normalized === "trial") {
      return "trial";
    }

    if (normalized === "school") {
      return "school";
    }

    return "direct";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/resolve-access`,
        data: {
          entry_source: resolveEntrySource(entry),
          trial_used: false,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      entry === "trial"
        ? "Check your email to continue your 3-day trial. After confirming your email, return via Continue access—no new account is needed. The trial lasts exactly 3 days and cannot be extended."
        : entry === "paid"
          ? "Check your email to continue your paid family setup."
          : entry === "school"
            ? "Check your email to continue your school-referred family setup."
            : "Account created. You'll continue your activation flow after signup confirmation."
    );
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

      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}