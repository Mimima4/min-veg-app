import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
  // React Compiler left untouched — enable explicitly when ready
};

export default nextConfig;
