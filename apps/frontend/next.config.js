/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_STRIPE_KEY: process.env.STRIPE_PUBLIC_KEY || '',
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:8080/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://api:3001'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
