import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;
