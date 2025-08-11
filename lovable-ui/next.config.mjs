/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
    // next-on-pages recommends this to ensure standard fetch in Node contexts
    webpackBuildWorker: true,
  },
};

export default nextConfig;