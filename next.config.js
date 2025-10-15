/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // 优化构建
  experimental: {
    optimizePackageImports: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', 'lucide-react'],
  },
  // 压缩配置
  compress: true,
  // 生产环境优化
  swcMinify: true,
  // 输出配置
  output: 'standalone',
}

module.exports = nextConfig