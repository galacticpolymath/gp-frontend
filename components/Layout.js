/* eslint-disable react/jsx-indent */
import Head from 'next/head';
import Footer from './Footer';
import Navbar from './Navbar';
import { Montserrat } from 'next/font/google';
import { useState, useEffect } from 'react';

// testing out build file

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable',
});

export default function Layout({ title, keywords, className, description, children, imgPreview }) {
  // get the url of the page after the comp is rendered onto the UI within a useEffect 
  // and then pass it to the og:url meta tag
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);
  
  return (
    <div className={`${montserrat.className} ${className}`}>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name='og:description' content={description} />
        <meta name='keywords' content={keywords} />
        <meta property="og:url" content={url} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {imgPreview && <meta property="og:image" content={imgPreview} />}
      </Head>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
