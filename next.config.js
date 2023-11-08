/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    scrollRestoration: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'catalog.galacticpolymath.com',
      'gp-catalog.vercel.app',
      'i3.ytimg.com',
      'storage.googleapis.com',
      'into-the-dark.vercel.app',
      'echo-galactic-polymath.vercel.app'
    ],
  },
  async redirects() {
    return [
      {
        permanent: true,
        source: '/lessons/:lessonId',
        destination: '/lessons/en-US/:lessonId'
      },
    ]
  }
};
