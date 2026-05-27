import { createBrowserClient } from "@supabase/ssr";

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  return { url, key };
}

export function createClient() {
  const { url, key } = getPublicSupabaseEnv();

  if (!url || !key) {
    // Static prerender runs client components on the server once. Avoid failing
    // the whole Vercel build when public env vars are not configured yet.
    if (typeof window === "undefined") {
      return createBrowserClient(
        "https://placeholder.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder"
      );
    }

    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
    );
  }

  return createBrowserClient(url, key);
}