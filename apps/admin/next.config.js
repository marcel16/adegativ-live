/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '/admin',
  assetPrefix: '/admin',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.API_URL || 'http://api:3001'}/:path*` },
    ];
  },
};

module.exports = nextConfig;
