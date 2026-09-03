import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/omaesama/**" },
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/listing-images/**" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      { source: "/api/voice/:path*", destination: `${process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4000"}/api/voice/:path*` },
    ];
  },
};

export default nextConfig;
