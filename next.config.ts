import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // React Compiler left untouched — enable explicitly when ready
};

export default nextConfig;
