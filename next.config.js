/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   serverComponentsExternalPackages: ['@supabase/supabase-js']
  // },
  images: {
    domains: ['via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

module.exports = nextConfig
