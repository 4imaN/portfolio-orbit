import type { NextConfig } from "next";
const config: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/portfolio-orbit.html", destination: "/" }];
  },
};
export default config;
