import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-hosting (docs/architecture.md §9.1): a standalone build copies only the traced
  // production dependencies into `.next/standalone`, avoiding a full node_modules layer in the
  // runtime image.
  output: 'standalone',
  experimental: {
    // Without this, Next's file tracer only looks inside apps/web and misses the workspace
    // dependency on @btf/contracts (a pnpm-symlinked sibling package) — it would build fine but
    // the standalone output would be missing that package at runtime. Still `experimental` in
    // Next 14 (this project's version) — it only moved to the top level in Next 15.
    outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
  },
};

export default nextConfig;
