import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone access over LAN
  allowedDevOrigins: ['192.168.1.3', 'localhost', '127.0.0.1'],
  devIndicators: false,
};

export default nextConfig;
