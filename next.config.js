/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self' https://www.google-analytics.com/;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com/;
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://authjs.dev https://storage.googleapis.com/ https://media.giphy.com/media/xThuWpoG470Q0stGmI/giphy.gif https://bit.ly/gphi5 https://storage.googleapis.com/gp-cloud/lessons/FemalesSing_en-US/sponsor_logo_41be63750b.png https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png https://echo-galactic-polymath.vercel.app/img/echoSim_banner.png https://into-the-dark.vercel.app/IntoTheDark_banner.jpg https://storage.googleapis.com/gp-cloud/lessons/BioInspired_en-US/JTF_logo_wtagline.png https://drive.google.com/thumbnail https://drive.google.com/ https://*.lh3.googleusercontent.com/ https://lh3.googleusercontent.com/d/1IfgB7A0h8uuCrMpQ0fMg6Jyk9fsjYdN4FT7zmaeW_qY=s220?authuser=0 https://storage.googleapis.com/gp-cloud/lessons/BioInspired_en-US/bioinspired_assets-2-banner.png https://*.storage.googleapis.com/ https://storage.googleapis.com/gp-cloud/lessons/Photonics_en-US/Folland-Lab_logo.png https://storage.googleapis.com/gp-cloud/lessons/Photonics_en-US/Folland-Lab_logo.png https://storage.googleapis.com/gp-cloud/lessons/Photonics_en-US/photonics-banner.png;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action http://localhost:3000/api/auth/signin/google https://dev.galacticpolymath.com/api/auth/signin/google https://galacticpolymath.com/api/auth/signin/google;
    connect-src 'self' https://oauth2.googleapis.com/token;
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
