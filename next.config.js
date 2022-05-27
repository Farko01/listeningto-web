/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

require("dotenv").config();

module.exports = { 
  env: {
    domain: process.env.domain,
    api_url: process.env.api_url
  },
  images: {
    domains: [process.env.domain]
  },
  nextConfig 
}
