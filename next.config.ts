import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Only allow LAN access in local development
  ...(process.env.NODE_ENV !== 'production' && {
    allowedDevOrigins: ['192.168.1.3', 'localhost', '127.0.0.1'],
  }),
};

export default nextConfig;
