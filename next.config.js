/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'academy.iqiglobal.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'd1ax5z6c94xuwa.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
