import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(appDir, "../..");
const monorepoPkgPath = path.join(monorepoRoot, "package.json");

function isMonorepoWorkspace(): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(monorepoPkgPath, "utf8")) as {
      workspaces?: unknown;
    };
    return Boolean(pkg.workspaces);
  } catch {
    return false;
  }
}

const nextConfig: NextConfig = {
  ...(isMonorepoWorkspace()
    ? {
        outputFileTracingRoot: monorepoRoot,
        turbopack: { root: monorepoRoot },
      }
    : {}),
  images: {
    unoptimized: true,
  },
  /** Served under /app when using the root dev proxy or a path-based reverse proxy */
  basePath: "/app",
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/medalverse-logo.svg",
        destination: "/app/assets/logos/medalverse-logo.svg",
        permanent: true,
        basePath: false,
      },
      {
        source: "/assets/logos/medalverse-logo.svg",
        destination: "/app/assets/logos/medalverse-logo.svg",
        permanent: true,
        basePath: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.AUTH_API_BASE_URL ||
          "http://localhost:8080"
        }/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
