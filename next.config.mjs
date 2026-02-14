/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    devtoolSegmentExplorer: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.giphy.com'
      }
    ]
  }
};

export default nextConfig;
