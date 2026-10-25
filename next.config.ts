import type { NextConfig } from "next";

// Static export: the site has no server features. Images are pre-sized in public/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
