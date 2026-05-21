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
  },
  // Build алдаануудыг алгасах тохиргоо:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;