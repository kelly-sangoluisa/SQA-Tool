import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar standalone para Docker optimizado
  output: 'standalone',
  
  async rewrites() {
    return [
      {
        // Cuando el front pida algo a /api/...
        source: "/api/:path*",
        // En producción usa la URL del VPS, en local usa el localhost
        destination: process.env.NODE_ENV === 'production'
          ? "https://sqa-tool-production.up.railway.app/api/:path*"
          : "http://localhost:3001/api/:path*",
      },
    ];
  },

  reactStrictMode: true,

  compiler: {
    // Limpia la consola en producción
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Turbopack config
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
