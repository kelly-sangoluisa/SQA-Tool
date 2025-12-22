import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Habilitar standalone para Docker optimizado
  output: 'standalone',
  
  // ❌ REWRITES ELIMINADOS: En producción cross-domain (Vercel -> Railway),
  // los rewrites causan problemas con las cookies porque el navegador no sabe
  // el origen real. Mejor hacer peticiones directas a Railway.
  
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
