/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

require("dotenv").config();

module.exports = { 
  env: {
    DOMAIN: process.env.DOMAIN,
    API_URL: process.env.API_URL
  },
  images: {
    domains: [process.env.DOMAIN]
  },
  nextConfig 
}
