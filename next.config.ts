import type { NextConfig } from "next";
import path from "node:path";

const requiredPublicSupabaseEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

if (process.env.VERCEL === "1") {
  const missing = requiredPublicSupabaseEnv.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length > 0) {
    throw new Error(
      [
        `Vercel build is missing: ${missing.join(", ")}.`,
        "Add them under Project Settings → Environment Variables.",
        "Use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (not NEXT_PUBLIC_SUPABASE_ANON_KEY).",
        "Enable Production and Preview (and any custom environment you deploy to), then redeploy.",
      ].join(" ")
    );
  }
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
  // Vercel serverless: scheduler spawns `scripts/*.mjs` (not static-imported by Next).
  outputFileTracingIncludes: {
    "/api/internal/vgs/run-contour-b-operational-scheduler": [
      "./scripts/**/*",
      "./node_modules/@supabase/**/*",
      "./node_modules/ws/**/*",
      "./node_modules/tslib/**/*",
    ],
  },
  // React Compiler left untouched — enable explicitly when ready
};

export default nextConfig;
