/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/** @type {import('next').NextConfig} */

const cspHeader = `
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com/ https://cdn.outseta.com/;
    style-src 'self' 'unsafe-inline';
    object-src 'none';
    base-uri 'self';
    connect-src 'self' https://galacticpolymath.com/api/auth/signin/google https://dev.galacticpolymath.com/api/auth/signin/google http://localhost:3000/api/auth/signin/google https://oauth2.googleapis.com/token https://www.google-analytics.com/ https://api.brevo.com/v3/smtp/email https://config.outseta.com/ https://cdn.outseta.com/ https://galactic-polymath.outseta.com/api/v1/nocode/init https://galactic-polymath.outseta.com/api/v1/widgets/emaillist/init https://galactic-polymath.outseta.com/api/v1/widgets/support/init https://galactic-polymath.outseta.com/api/v1/widgets/leadCapture/init https://galactic-polymath.outseta.com/api/v1/billing/plans https://galactic-polymath.outseta.com/api/v1/nonce https://galactic-polymath.outseta.com/api/v1/billing/subscriptions/compute-charge-summary https://galactic-polymath.outseta.com/api/v1/crm/registrations/validate;
`;

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "catalog.galacticpolymath.com",
      "gp-catalog.vercel.app",
      "i3.ytimg.com",
      "storage.googleapis.com",
      "into-the-dark.vercel.app",
      "echo-galactic-polymath.vercel.app",
      "drive.google.com",
      "img.youtube.com",
      "pacific-h2o.galacticpolymath.com",
      "energy-app.galacticpolymath.com",
    ],
  },
  async headers() {
    const headersVal = [
      {
        key: "Content-Security-Policy",
        value: cspHeader.replace(/\n/g, ""),
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
        source: "/(.*)",
        headers: headersVal,
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

    return config;
  },
};
