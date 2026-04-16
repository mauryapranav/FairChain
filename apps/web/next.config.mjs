/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker (self-contained server.js bundle)
  output: 'standalone',

  // Compile @fairchain/shared TypeScript source inline — no pre-build needed in dev
  transpilePackages: ['@fairchain/shared'],

  // Proxy /api/* → Express backend (:4000) during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

