/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/reset-password/:token',
        destination: '/?token=:token',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig; 