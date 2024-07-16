/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const AuthResultPg = () => {
  const session = useSession();
  const [wasRendered, setWasRendered] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setWasRendered(true);
    }, 1500);
  }, []);

  if (!wasRendered) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
          <h1>Loading, please wait...</h1>
        </div>
      </Layout>
    );
  }

  if (!session && wasRendered) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
          <h1>This page is for the authentication result with google.</h1>
        </div>
      </Layout>
    );
  }

  if (!session?.data?.token && wasRendered) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
          <h1>Failed to generate token. You may have been authenticated already. Please try again.</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
        <p
          style={{
            maxWidth: '475px',
            whiteSpace: 'initial',
            overflow: 'contain',
            wordWrap: 'break-word',
            paddingTop: '10px',
            paddingBottom: '20px',
            borderBottom: '1px solid grey',
          }}
        >
          You have been successfully authenticated!
        </p>
        <Link href="/">
          Go back to the main page.
        </Link>
      </div>
    </Layout>
  );
};

export default AuthResultPg;
