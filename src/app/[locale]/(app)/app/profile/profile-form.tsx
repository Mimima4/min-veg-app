"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  userEmail: string;
  initialDisplayName: string;
  initialInterfaceLanguage: "nb" | "nn" | "en";
  initialCountryCode: string;
};

export default function ProfileForm({
  userId,
  userEmail,
  initialDisplayName,
  initialInterfaceLanguage,
  initialCountryCode,
}: Props) {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [interfaceLanguage, setInterfaceLanguage] =
    useState(initialInterfaceLanguage);
  const [countryCode, setCountryCode] = useState(initialCountryCode);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.from("user_profiles").upsert(
      {
        id: userId,
        email: userEmail,
        display_name: displayName.trim() || null,
        interface_language: interfaceLanguage,
        country_code: countryCode.trim().toUpperCase() || "NO",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Profile saved successfully.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Email</label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-stone-700">Display name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm text-stone-700">
            Interface language
          </label>
          <select
            value={interfaceLanguage}
            onChange={(e) =>
              setInterfaceLanguage(e.target.value as "nb" | "nn" | "en")
            }
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
          >
            <option value="nb">nb — Bokmål</option>
            <option value="nn">nn — Nynorsk</option>
            <option value="en">en — English</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-stone-700">Country code</label>
          <input
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            placeholder="NO"
            maxLength={2}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 uppercase outline-none focus:border-stone-500"
          />
        </div>
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
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}