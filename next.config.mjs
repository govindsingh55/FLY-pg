import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Your Next.js config here
  images: {
    // Increase timeout for image optimization
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'flycolive.com',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Add timeout and retry configuration
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Increase timeout for image processing
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    // Add loader configuration for better error handling
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
