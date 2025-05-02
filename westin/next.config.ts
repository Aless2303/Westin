import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;