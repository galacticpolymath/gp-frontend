/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/** @type {import('next').NextConfig} */

const cspHeader = `
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com/;
    style-src 'self' 'unsafe-inline';
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    connect-src 'self' https://galacticpolymath.com/api/auth/signin/google https://dev.galacticpolymath.com/api/auth/signin/google http://localhost:3000/api/auth/signin/google https://oauth2.googleapis.com/token https://www.google-analytics.com/;
    block-all-mixed-content;
    upgrade-insecure-requests;
    frame-src 'self' https://drive.google.com/ https://www.youtube.com/ https://m.youtube.com/ https://youtube.com/embed/ https://docs.google.com/ https://lh3.googleusercontent.com/;
`

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'catalog.galacticpolymath.com',
      'gp-catalog.vercel.app',
      'i3.ytimg.com',
      'storage.googleapis.com',
      'into-the-dark.vercel.app',
      'echo-galactic-polymath.vercel.app',
      'drive.google.com',
      'img.youtube.com'
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
  },
  async rewrites() {
    return [
      {
        source: '/web-app',
        destination: '/public/web-apps/into-the-dark/src/index.html',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  }
};
