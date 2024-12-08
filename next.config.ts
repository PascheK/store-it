import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.milton.edu',
      },
      {
        protocol: 'https',
        hostname: 'cloud.apprwrite.io',
      }
    ]
  }  
};

export default nextConfig;
