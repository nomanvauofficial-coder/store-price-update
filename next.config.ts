import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: "output: standalone" is only for Docker/self-hosting.
  // On Vercel it causes 404 NOT_FOUND — must NOT be set here.
  // Include the SQLite database file in the serverless bundle
  // so Prisma can read it in production.
  outputFileTracingIncludes: {
    "/**": ["./db/**"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
