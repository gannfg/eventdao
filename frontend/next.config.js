/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@solana/wallet-adapter-react', '@solana/web3.js'],
  },
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bfjuqmhzczpybbozrpgz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Compression
  compress: true,
  // Bundle analyzer (uncomment to analyze bundle size)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Optimize chunks for better caching
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Solana related packages
          solana: {
            name: 'solana',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@solana|@project-serum)[\\/]/,
            priority: 30,
          },
          // React related packages
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
          },
          // Other vendor packages
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
