import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplica estas cabeceras en todas las rutas del sitio
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Evita clickjacking (embeber en un iframe en otro sitio)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Bloquea la suplantación de MIME types
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Solo envía referer en HTTPS del mismo origen
          },
        ],
      }
    ];
  },
};

export default nextConfig;
