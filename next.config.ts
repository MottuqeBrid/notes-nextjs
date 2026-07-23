// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: "10gb",
  },
};

export default nextConfig;
