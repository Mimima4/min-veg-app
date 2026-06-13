import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createFamilyPlaywrightCookies } from "./lib/e2e-service-auth";

const authFile = path.join("e2e", ".auth", "user.json");

setup("authenticate family user via service-role session", async () => {
  const childId = process.env.E2E_CHILD_ID?.trim();
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  );

  setup.skip(!childId, "Set E2E_CHILD_ID in .env.local");
  setup.skip(
    !hasSupabaseEnv,
    "Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
  );

  const baseURL = process.env.E2E_BASE_URL?.trim() || "http://localhost:3000";
  const cookieDomain = new URL(baseURL).hostname;

  const cookies = await createFamilyPlaywrightCookies({
    childId: childId!,
    cookieDomain,
  });

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(authFile, JSON.stringify({ cookies, origins: [] }, null, 2));
});
