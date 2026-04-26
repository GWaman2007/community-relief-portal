import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Only allow LAN access in local development
  ...(process.env.NODE_ENV !== 'production' && {
    allowedDevOrigins: ['192.168.1.3', 'localhost', '127.0.0.1'],
  }),
  experimental: {
    // Tree-shake heavy icon/animation libraries to purge unused JS
    optimizePackageImports: ['lucide-react', 'framer-motion', '@supabase/supabase-js'],
    // Inline critical CSS into the HTML to eliminate render-blocking CSS requests
    inlineCss: true,
  },
  images: {
    // Allow base64 data URIs for user-uploaded report images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
