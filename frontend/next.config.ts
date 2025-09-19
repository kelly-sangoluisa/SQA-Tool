import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: __dirname,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false, // Changed from true to false to enable linting
  },
  // Enable type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
