import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings caused by browser extensions
  reactStrictMode: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  turbopack: {
    root: process.cwd()
  }
};

// Note: turbopack configuration is handled by Next.js automatically in this version

export default nextConfig;
