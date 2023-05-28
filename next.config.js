/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ALCHEMY_MUMBAI_URL: process.env.ALCHEMY_MUMBAI_URL,
  }
}

module.exports = nextConfig
