import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';

export default function Layout({ title, keywords, description, children }) {
  const router = useRouter();

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

      <div className="container">{children}</div>
      {/* <Footer /> */}
    </div>
  );
}
