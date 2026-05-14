import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
  // Turbopack 配置 (Next.js 16 默认使用 Turbopack)
  turbopack: {},
  // 将有问题的 ESM 包排除在打包之外，让 Node.js 直接加载
  serverExternalPackages: ['coze-coding-dev-sdk'],
};

export default nextConfig;
