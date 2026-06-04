import "server-only";

export type ContourBSchedulerBundle = {
  runContourBOperationalSchedulerBundled: (options: {
    dryRun?: boolean;
    profession?: string;
    county?: string;
  }) => Promise<{
    exitCode: number;
    summary: Record<string, unknown>;
    results: Array<{
      professionSlug: string;
      countyCode: string;
      action: string | null;
      reason: string | null;
      readiness: string | null;
    }>;
  }>;
  runContourBCountyRelay: (args: {
    professionSlug: string;
    countyCode: string;
    dryRun?: boolean;
    vilbliHtml: string;
  }) => Promise<{
    ok: boolean;
    action: string;
    reason: string | null;
    readiness: string | null;
  }>;
  probeVilbliCounty: (args: {
    professionSlug: string;
    countyCode: string;
  }) => Promise<Record<string, unknown>>;
};

/** Static relative import so Next/Vercel NFT includes the esbuild output. */
export async function loadContourBSchedulerBundle(): Promise<ContourBSchedulerBundle> {
  return (await import(
    "./generated/contour-b-scheduler.bundle.mjs"
  )) as ContourBSchedulerBundle;
}
