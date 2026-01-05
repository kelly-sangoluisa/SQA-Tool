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

  // ⚡ Performance optimizations
  compiler: {
    // Limpia la consola en producción
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ⚡ Optimizar fuentes para reducir CLS
  optimizeFonts: true,

  // ⚡ Minificar para reducir bundle size
  swcMinify: true,

  // ⚡ Desabilitar source maps en producción (reduce bundle)
  productionBrowserSourceMaps: false,

  // ⚡ Optimizar CSS modules
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
  },

  // Turbopack config
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
