/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

require("dotenv").config();

module.exports = { 
  images: {
    domains: [process.env.DOMAIN]
  },
  nextConfig 
}
