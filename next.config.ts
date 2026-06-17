import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '172.29.16.1',
    '*.vicp.fun',
    '*.ngrok.io',
    '*.ngrok-free.app',
    '*.loca.lt',
    '*.localtunnel.com',
    'bmyy.bbs0.cc',
    '*.bbs0.cc',
  ],
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/douyin/data/:path*',
      },
      {
        source: '/images/:path*',
        destination: '/douyin/images/:path*',
      },
      {
        source: '/mock/:path*',
        destination: '/douyin/cdn/mock.min.js',
      },
    ];
  },
};

export default nextConfig;
