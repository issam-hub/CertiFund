import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output:'standalone',
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '**',
        search: '',
      },
    ],
  }
};

export default nextConfig;
