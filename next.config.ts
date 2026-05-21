import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"]
  }
};

export default nextConfig;
