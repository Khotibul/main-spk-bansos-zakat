/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    turbo: {
      resolveAlias: {},
    },
  },
}

module.exports = nextConfig
