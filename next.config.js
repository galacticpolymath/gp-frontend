 
 
/** @type {import('next').NextConfig} */

const cspHeader = `
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com/ https://cdn.outseta.com/ https://js.stripe.com https://auth.magic.link/sdk https://apis.google.com https://accounts.google.com; object-src 'none';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
    base-uri 'self';
    img-src * data: blob:;
    connect-src 'self'
      https://galacticpolymath.com/api/auth/signin/google
      https://apis.google.com
      https://accounts.google.com
      https://dev.galacticpolymath.com/api/auth/signin/google
      http://localhost:3000/api/auth/signin/google
      https://oauth2.googleapis.com/
      https://www.google-analytics.com/
      https://api.brevo.com/v3/smtp/email
      https://config.outseta.com/
      https://cdn.outseta.com/
      https://galactic-polymath.outseta.com
      https://fonts.googleapis.com/icon
      https://fonts.googleapis.com/css;
`;

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  },
  reactStrictMode: true,
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  sassOptions: {
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'catalog.galacticpolymath.com' },
      { protocol: 'https', hostname: 'gp-catalog.vercel.app' },
      { protocol: 'https', hostname: 'i3.ytimg.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'into-the-dark.vercel.app' },
      { protocol: 'https', hostname: 'echo-galactic-polymath.vercel.app' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'pacific-h2o.galacticpolymath.com' },
      { protocol: 'https', hostname: 'energy-app.galacticpolymath.com' },
    ],
  },
  async headers() {
    const headersVal = [
      {
        key: 'Content-Security-Policy',
        value: cspHeader.replace(/\n/g, ''),
      },
    ];

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      headersVal.push({
        key: 'X-Robots-Tag',
        value: 'noindex',
      })
    }

    return [
      {
        source: '/(.*)',
        headers: headersVal,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/about',
        destination: 'https://www.galacticpolymath.com/about',
        permanent: true,
      },
      {
        source: '/hire-us',
        destination: 'https://www.galacticpolymath.com/for-scientists',
        permanent: true,
      },
    ];
  },
  webpack(config) {
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };
    config.ignoreWarnings = [
      { module: /node-fetch/ },
      { file: /node-fetch/ },
    ];

    return config;
  },
};
