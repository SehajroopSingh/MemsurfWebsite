/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', // For GitHub Pages subdirectory deployment
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'www.tinderpressroom.com',
      },
    ],
  },
}

module.exports = nextConfig

