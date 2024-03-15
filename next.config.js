/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self' https://www.google-analytics.com/;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com/;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png https://echo-galactic-polymath.vercel.app/img/echoSim_banner.png https://into-the-dark.vercel.app/IntoTheDark_banner.jpg https://storage.googleapis.com/gp-cloud/lessons/BioInspired_en-US/JTF_logo_wtagline.png;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    block-all-mixed-content;
    upgrade-insecure-requests;
    frame-src 'self' https://www.youtube.com/ https://m.youtube.com/ https://youtube.com/embed/;
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
