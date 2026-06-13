import { createClient, type Session } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export async function resolveFamilyUserEmailForChild(childId: string): Promise<string> {
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  );

  const { data: child, error: childError } = await supabase
    .from("child_profiles")
    .select("family_account_id")
    .eq("id", childId)
    .maybeSingle();

  if (childError) {
    throw new Error(`child_profiles: ${childError.message}`);
  }
  if (!child?.family_account_id) {
    throw new Error(`Child ${childId} not found`);
  }

  const { data: family, error: familyError } = await supabase
    .from("family_accounts")
    .select("primary_user_id")
    .eq("id", child.family_account_id)
    .maybeSingle();

  if (familyError) {
    throw new Error(`family_accounts: ${familyError.message}`);
  }
  if (!family?.primary_user_id) {
    throw new Error(`Family account missing primary_user_id for child ${childId}`);
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
    family.primary_user_id
  );

  if (userError) {
    throw new Error(`auth admin getUserById: ${userError.message}`);
  }

  const email = userData.user?.email?.trim();
  if (!email) {
    throw new Error(`Primary user for child ${childId} has no email`);
  }

  return email;
}

export async function createFamilySessionForChild(childId: string): Promise<Session> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  const email = await resolveFamilyUserEmailForChild(childId);
  const admin = createClient(url, serviceKey);
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError) {
    throw new Error(`auth admin generateLink: ${linkError.message}`);
  }

  const tokenHash = linkData?.properties?.hashed_token?.trim();
  if (!tokenHash) {
    throw new Error("generateLink returned no hashed_token");
  }

  const publicClient = createClient(url, publishableKey);
  const { data: verified, error: verifyError } = await publicClient.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (verifyError) {
    throw new Error(`verifyOtp: ${verifyError.message}`);
  }
  if (!verified.session) {
    throw new Error("verifyOtp returned no session");
  }

  return verified.session;
}

type PlaywrightCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Lax" | "Strict" | "None";
};

export async function createFamilyPlaywrightCookies(params: {
  childId: string;
  cookieDomain: string;
}): Promise<PlaywrightCookie[]> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const session = await createFamilySessionForChild(params.childId);

  const stored = new Map<string, { value: string; options?: Record<string, unknown> }>();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return [...stored.entries()].map(([name, entry]) => ({
          name,
          value: entry.value,
        }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          stored.set(cookie.name, { value: cookie.value, options: cookie.options });
        }
      },
    },
  });

  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (error) {
    throw new Error(`setSession: ${error.message}`);
  }

  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

  return [...stored.entries()].map(([name, entry]) => ({
    name,
    value: entry.value,
    domain: params.cookieDomain,
    path: "/",
    expires,
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
  }));
}
