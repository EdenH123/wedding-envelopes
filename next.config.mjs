import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a lockfile exists in the home dir,
  // which would otherwise make Next infer the wrong root).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
