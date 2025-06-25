/* eslint-disable quotes */

import Head from 'next/head';
import Footer from './Footer';
import Navbar from './Navbar';
import { Noto_Sans } from 'next/font/google';
import Script from 'next/script';
import useOutsetaInputValidation from '../customHooks/useOutsetaInputValidation';
import { useEffect } from 'react';

const notoSansLight = Noto_Sans({
  subsets: ['latin'],
  weight: 'variable',
});

export default function Layout({
  title,
  keywords = '',
  description,
  children,
  imgSrc,
  imgAlt,
  url,
  className = '',
  type = 'article',
  style = {},
  canonicalLink = '',
  defaultLink = '',
  langLinks,
}) {
  const isOnProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  useEffect(() => {
    // 1. Create the config script
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `
      var currentOrigin = window.location.origin;
      var o_options = {
        domain: 'galactic-polymath.outseta.com',
        load: 'auth,customForm,emailList,leadCapture,nocode,profile,support',
        auth: {
          authenticationCallbackUrl: currentOrigin + '/gp-sign-up-result',
          registrationConfirmationUrl: currentOrigin + '/gp-plus-set-password',
        }
      };
    `;

    document.body.appendChild(configScript);

    // 2. Create the main Outseta script
    const mainScript = document.createElement("script");
    mainScript.src = "https://cdn.outseta.com/outseta.min.js";
    mainScript.setAttribute("data-options", "o_options");
    mainScript.async = true;
    document.body.appendChild(mainScript);

    // 3. Cleanup on unmount
    return () => {
      document.body.removeChild(configScript);
      document.body.removeChild(mainScript);
    };
  }, []);

  useOutsetaInputValidation();

  return (
    <div style={style} className={`${notoSansLight.className} ${className}`}>
      <Head>
        <title>{title}</title>
        <meta property='og:title' content={title} />
        {!isOnProd && <meta name='robots' content='noindex, nofollow' />}
        <meta
          name='google-site-verification'
          content='87qwPzeD5oQKG15RKEP8BzbRr5VNhCbDPf98tLcZGUk'
        />
        <meta property='og:type' content={type} />
        <meta property='og:description' content={description} />
        {imgSrc && (
          <>
            <meta property='og:image' content={imgSrc} />
            <meta property='og:image:type' content='image/jpeg' />
            <meta property='og:image:width' content='1200' />
            <meta property='og:image:height' content='630' />
          </>
        )}
        {imgAlt && <meta property='og:image:alt' content={imgAlt} />}
        <meta property='og:url' content={url} />
        {keywords && (
          <meta
            property='og:keywords'
            name='keywords'
            content={keywords}
          />
        )}
        <meta
          property='og:viewport'
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
        <meta property='twitter:title' content={title} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@GalacticPolymath' />
        <meta name='twitter:creator' content='@GalacticPolymath' />
        <meta name='twitter:title' content={title} />
        {description && (
          <meta
            name='twitter:description'
            content={
              description.length > 200
                ? `${description.substring(0, 190)}...`
                : description
            }
          />
        )}
        {imgSrc && <meta name='twitter:image' content={imgSrc} />}
        {imgAlt && <meta name='twitter:image:alt' content={imgAlt} />}
        <meta name='twitter:domain' content='galacticpolymath.com' />
        <meta name='twitter:url' content={url} />
        {isOnProd && !!canonicalLink && (
          <link rel='canonical' href={canonicalLink} />
        )}
        {isOnProd &&
          langLinks?.length &&
          langLinks.map(([href, hrefLang], index) => (
            <link
              key={index}
              rel='alternate'
              hrefLang={hrefLang}
              href={href}
            />
          ))}
        {isOnProd && !!defaultLink && (
          <link
            rel='alternate'
            hrefLang='x-default'
            href={defaultLink}
          />
        )}
      </Head>
      <div style={{ height: '50px' }}>
        <Navbar />
      </div>
      {imgSrc && (
        <img
          src={imgSrc}
          alt=''
          style={{ display: 'none' }}
        />
      )}
      {children}
      <Footer />
    </div>
  );
}