/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/** @type {import('next').NextConfig} */

const cspHeader = `
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com/;
    style-src 'self' 'unsafe-inline';
    object-src 'none';
    base-uri 'self';
    connect-src 'self' https://galacticpolymath.com/api/auth/signin/google https://dev.galacticpolymath.com/api/auth/signin/google http://localhost:3000/api/auth/signin/google https://oauth2.googleapis.com/token https://www.google-analytics.com/ https://restcountries.com/ https://api.brevo.com/v3/smtp/email;
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
      'img.youtube.com',
      'pacific-h2o.galacticpolymath.com',
      'energy-app.galacticpolymath.com'
    ],
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
  },
  webpack(config) {
    config.resolve.fallback = {

      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };

    return config;
  },
};
