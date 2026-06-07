import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-a25c26cd10394d818d79893e73296a9a.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
