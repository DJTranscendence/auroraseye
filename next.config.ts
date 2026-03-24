import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/auroras-eye-films',
  assetPrefix: '/auroras-eye-films',
};

export default nextConfig;
