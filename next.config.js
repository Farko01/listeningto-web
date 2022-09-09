/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

require("dotenv").config();

module.exports = { 
  images: {
    domains: [process.env.DOMAIN]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ]
  },
}
