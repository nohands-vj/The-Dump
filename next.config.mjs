/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/The-Dump',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
