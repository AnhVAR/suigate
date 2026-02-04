/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint 9 has breaking changes, skip during build for now
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Ensure admin uses its own React instance
  experimental: {
    externalDir: true,
  },
}

module.exports = nextConfig
