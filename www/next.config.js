/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/abraxas',
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: { unoptimized: true },
};
module.exports = nextConfig;
