import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Habilitar standalone para Docker optimizado
  output: 'standalone',
  
  // ✅ REWRITES para evitar cookies de terceros
  // En producción, el frontend en Vercel hace proxy al backend de Railway
  // De esta forma, las cookies se guardan bajo el dominio de Vercel
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://sqa-tool-production.up.railway.app/api/:path*",
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
