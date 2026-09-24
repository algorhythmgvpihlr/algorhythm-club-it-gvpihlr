import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: '55mb',
    serverActions: {
      bodySizeLimit: '55mb',
    },
  },
};

export default nextConfig;
