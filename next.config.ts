import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Avoid Turbopack incorrectly inferring a monorepo root due to lockfiles elsewhere.
    root: process.cwd(),
  },
};

export default nextConfig;
