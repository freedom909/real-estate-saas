import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/voice/:path*",
        destination: "http://localhost:4300/api/voice/:path*",
      },
    ];
  },
};

export default nextConfig;
