import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["better-sqlite3"],
  output: "standalone", // Docker部署需要
};

export default nextConfig;
