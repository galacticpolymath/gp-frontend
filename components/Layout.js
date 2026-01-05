/* eslint-disable quotes */

import Head from "next/head";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useEffect, useMemo } from "react";
import { removeLocalStorageItem } from "../shared/fns";
import {
  ensureAbsoluteUrl,
  summarizeDescription,
  toOgLocale,
} from "../shared/seo";

export default function Layout({
  title,
  keywords = "",
  description,
  children,
  imgSrc,
  imgAlt,
  url,
  className = "",
  type = "article",
  style = {},
  canonicalLink = "",
  defaultLink = "",
  langLinks,
  showNav = true,
  showFooter = true,
  structuredData = null,
  locale = "en-US",
}) {
  const isOnProd = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const resolvedDescription = summarizeDescription(description);
  const resolvedUrl = ensureAbsoluteUrl(url || canonicalLink || "");
  const resolvedCanonical = canonicalLink || url ? ensureAbsoluteUrl(canonicalLink || url) : null;
  const resolvedDefaultLink = defaultLink ? ensureAbsoluteUrl(defaultLink) : null;
  const structuredDataPayload = useMemo(() => {
    if (!structuredData) {
      return [];
    }

    return (Array.isArray(structuredData) ? structuredData : [structuredData]).filter(Boolean);
  }, [structuredData]);
  const ogLocale = toOgLocale(locale);

  useEffect(() => {
    window.Outseta?.on("signup", () => {
      removeLocalStorageItem("selectedGpPlusBillingType");
    });
  }, []);

  return (
    <div style={style} className={className}>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        {!isOnProd && <meta name="robots" content="noindex, nofollow" />}
        <meta
          name="google-site-verification"
          content="87qwPzeD5oQKG15RKEP8BzbRr5VNhCbDPf98tLcZGUk"
        />
        <meta property="og:type" content={type} />
        {resolvedDescription && (
          <>
            <meta name="description" content={resolvedDescription} />
            <meta property="og:description" content={resolvedDescription} />
          </>
        )}
        {imgSrc && (
          <>
            <meta property="og:image" content={imgSrc} />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        {imgAlt && <meta property="og:image:alt" content={imgAlt} />}
        <meta property="og:url" content={resolvedUrl} />
        <meta property="og:site_name" content="Galactic Polymath" />
        <meta property="og:locale" content={ogLocale} />
        {keywords && (
          <meta
            property="og:keywords"
            name="keywords"
            content={keywords}
          />
        )}
        <meta
          property="og:viewport"
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta property="twitter:title" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GalacticPolymath" />
        <meta name="twitter:creator" content="@GalacticPolymath" />
        <meta name="twitter:title" content={title} />
        {resolvedDescription && (
          <meta
            name="twitter:description"
            content={resolvedDescription}
          />
        )}
        {imgSrc && <meta name="twitter:image" content={imgSrc} />}
        {imgAlt && <meta name="twitter:image:alt" content={imgAlt} />}
        <meta name="twitter:domain" content="galacticpolymath.com" />
        <meta name="twitter:url" content={resolvedUrl} />
        {isOnProd && !!resolvedCanonical && (
          <link rel="canonical" href={resolvedCanonical} />
        )}
        {isOnProd &&
          langLinks?.length &&
          langLinks.map(([href, hrefLang], index) => (
            <link
              key={index}
              rel="alternate"
              hrefLang={hrefLang}
              href={ensureAbsoluteUrl(href)}
            />
          ))}
        {isOnProd && !!resolvedDefaultLink && (
          <link
            rel="alternate"
            hrefLang="x-default"
            href={resolvedDefaultLink}
          />
        )}
        {structuredDataPayload.map((schema, index) => (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            key={`ld-json-${index}`}
            type="application/ld+json"
          />
        ))}
      </Head>
      {showNav && (
        <div style={{ height: "50px" }}>
          <Navbar />
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          style={{ display: "none" }}
        />
      )}
      {children}
      {showFooter && <Footer />}
    </div>
  );
}
