/* eslint-disable react/jsx-indent */
import Head from 'next/head';
import Footer from './Footer';
import Navbar from './Navbar';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable',
});

export default function Layout({ title, keywords, className, description, children, imgPreview }) {
  return (
    <div className={`${montserrat.className} ${className}`}>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta name='keywords' content={keywords} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta property="og:image" content={imgPreview} />
      </Head>

      <Navbar />

      {children}

      <Footer />
    </div>
  );
}
