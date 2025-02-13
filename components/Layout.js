/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable indent */

import Head from 'next/head';
import Footer from './Footer';
import Navbar from './Navbar';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable',
});

export default function Layout({
  title,
  keywords,
  description,
  children,
  imgSrc,
  imgAlt,
  url,
  className = '',
  type = 'article',
  style = {},
}) {
  return (
    <div style={style} className={`${montserrat.className} ${className}`}>
      <Head>
        <title>{title}</title>
        {process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' && <meta name="robots" content="noindex, nofollow" />}
        <meta property="og:title" content={title} />
        <meta property="og:type" content={type} />
        <meta property='og:description' content={description} />
        {imgSrc && (
          <>
            <meta property="og:image" content={imgSrc} />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {imgAlt && <meta property="og:image:alt" content={imgAlt} />}
        <meta property="og:url" content={url} />
        <meta property='og:keywords' name='keywords' content={keywords} />
        <meta property='og:viewport' name='viewport' content='width=device-width, initial-scale=1' />
        <meta property="twitter:title" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GalacticPolymath" />
        <meta name="twitter:creator" content="@GalacticPolymath" />
        <meta name="twitter:title" content={title} />
        {description && (
          <meta
            name="twitter:description"
            content={description.length > 200 ? `${description.substring(0, 190)}...` : description}
          />
        )}
        {imgSrc && <meta name="twitter:image" content={imgSrc} />}
        {imgAlt && <meta name="twitter:image:alt" content={imgAlt} />}
        <meta name="twitter:domain" content="galacticpolymath.com" />
        <meta name="twitter:url" content={url} />
      </Head>
      <div style={{ height: "50px" }}>
        <Navbar />
      </div>
      {imgSrc && <img src={imgSrc} alt="" style={{ display: 'none' }} />}
      {children}
      <Footer />
    </div>
  );
}