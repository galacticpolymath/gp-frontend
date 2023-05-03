/* eslint-disable react/jsx-indent */
import Head from 'next/head';
import Footer from './Footer';
import Navbar from './Navbar';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable',
});

export default function Layout({ title, keywords, className, description, children, imgSrc, imgAlt, url, href }) {
  return (
    <div className={`${montserrat.className} ${className}`}>
      <Head>
        <title>{title}</title>

        {/* {href && <link rel="icon" href={href} />} */}
        <meta property="pinterest" content="true" />
        <meta property="pinterest:description" content={description} />
        <meta property="pinterest:media" content={url} />
        <meta property="pinterest:type" content="article" />

        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property='og:description' content={description} />
        {imgSrc && <meta property="og:image" content={imgSrc} />}
        {imgSrc && <meta property="og:image:type" content="image/jpeg" />}
        {imgSrc && <meta property="og:image:width" content="1200" />}
        {imgSrc && <meta property="og:image:height" content="630" />}
        {imgAlt && <meta property="og:image:alt" content={imgAlt} />}
        <meta property="og:url" content={url} />
        <meta property='og:keywords' name='keywords' content={keywords} />
        <meta property='og:viewport' name='viewport' content='width=device-width, initial-scale=1' />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GalacticPolymath" />
        <meta name="twitter:creator" content="@GalacticPolymath" />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={(description.length > 200) ? `${description.substring(0, 190)}...` : description} />}
        {imgSrc && <meta name="twitter:image" content={imgSrc} />}
        {imgAlt && <meta name="twitter:image:alt" content={imgAlt} />}
        <meta name="twitter:domain" content="galacticpolymath.com" />
        <meta name="twitter:url" content={url} />
      </Head>
      <Navbar />
      {imgSrc && <img src={imgSrc} alt="" style={{ display: 'none'}} />}

      {children}

      <Footer />
    </div>
  );
}
