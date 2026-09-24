import { NextConfig } from "next";
const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '55mb',
    },
  },
};
