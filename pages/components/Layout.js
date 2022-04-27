import Head from 'next/head';
import Navbar from './Navbar';

export default function Layout({ title, keywords, description, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta name='keywords' content={keywords} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <Navbar />

      {/* {router.pathname === '/' && <Showcase />} */}

      {children}
      
      {/* <Footer /> */}
    </div>
  );
}
