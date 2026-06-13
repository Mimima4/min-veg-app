#!/usr/bin/env node
/**
 * Resolve Playwright route smoke fixture (mechanic profession id).
 *
 * Usage:
 *   node --env-file=.env.local scripts/resolve-e2e-route-fixture.mjs
 *
 * Env:
 *   E2E_CHILD_ID — child UUID for route smoke (family user resolved via service role)
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — already in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { isMainModule } from "./lib/is-main-module.mjs";

async function main() {
  const childId = String(process.env.E2E_CHILD_ID ?? "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!childId) {
    throw new Error("Missing E2E_CHILD_ID");
  }
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);
  const { data: profession, error } = await supabase
    .from("professions")
    .select("id, slug")
    .eq("slug", "mechanic")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`professions: ${error.message}`);
  }
  if (!profession?.id) {
    throw new Error("Active mechanic profession not found");
  }

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select("id")
    .eq("child_id", childId)
    .eq("target_profession_id", profession.id)
    .is("archived_at", null)
    .eq("status", "draft")
    .maybeSingle();

  if (routeError) {
    throw new Error(`study_routes: ${routeError.message}`);
  }
  if (!route?.id) {
    throw new Error(`No draft mechanic route for child ${childId}`);
  }

  const minVg1Options = Number(process.env.E2E_MIN_VG1_OPTIONS ?? "3");

  console.log(
    JSON.stringify({
      childId,
      mechanicProfessionId: profession.id,
      routeId: route.id,
      minVg1Options: Number.isFinite(minVg1Options) ? minVg1Options : 3,
    })
  );
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
