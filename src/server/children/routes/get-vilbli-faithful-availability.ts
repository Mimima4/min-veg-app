import { spawnSync } from "node:child_process";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { VilbliFaithfulAvailabilityPayload } from "@/lib/vgs/vilbli-faithful-types";

const ENABLED_SCOPES = new Set(["56:electrician"]);

function isEnabledScope(countyCode: string, professionSlug: string) {
  return ENABLED_SCOPES.has(`${countyCode.trim()}:${professionSlug.trim()}`);
}

async function fetchVilbliFaithfulPayloadUncached(
  countyCode: string,
  professionSlug: string
): Promise<VilbliFaithfulAvailabilityPayload> {
  const scriptPath = path.join(process.cwd(), "scripts/build-vilbli-faithful-availability.mjs");
  const result = spawnSync(
    "node",
    [scriptPath, "--profession", professionSlug, "--county", countyCode],
    {
      cwd: process.cwd(),
      env: process.env,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (result.status !== 0) {
    throw new Error(
      `Vilbli-faithful extract failed: ${result.stderr?.trim() || result.stdout?.trim() || "unknown"}`
    );
  }

  const stdout = result.stdout.trim();
  const jsonStart = stdout.indexOf("{");
  if (jsonStart < 0) {
    throw new Error("Vilbli-faithful extract returned no JSON payload");
  }

  return JSON.parse(stdout.slice(jsonStart)) as VilbliFaithfulAvailabilityPayload;
}

function getCachedVilbliFaithfulPayload(countyCode: string, professionSlug: string) {
  return unstable_cache(
    async () => fetchVilbliFaithfulPayloadUncached(countyCode, professionSlug),
    ["vilbli-faithful-availability", countyCode, professionSlug],
    { revalidate: 3600 }
  )();
}

export async function getVilbliFaithfulAvailability(params: {
  countyCode: string;
  professionSlug: string;
}): Promise<{
  enabled: boolean;
  payload: VilbliFaithfulAvailabilityPayload | null;
}> {
  const countyCode = params.countyCode.trim();
  const professionSlug = params.professionSlug.trim();

  if (!isEnabledScope(countyCode, professionSlug)) {
    return { enabled: false, payload: null };
  }

  const payload = await getCachedVilbliFaithfulPayload(countyCode, professionSlug);
  return { enabled: true, payload };
}
