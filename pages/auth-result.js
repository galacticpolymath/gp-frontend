import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const AuthResultPg = () => {
  const session = useSession();
  const [wasRendered, setWasRendered] = useState(false);

  useEffect(() => {
    console.log('session: ', session);
    console.log('session.data: ', session.data);
    setTimeout(() => {
      setWasRendered(true);
    }, 500);
  }, []);

  if (!wasRendered) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container">
          <h1>Loading, please wait...</h1>
        </div>
      </Layout>
    );
  }

  if (!session && wasRendered) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container">
          <h1>You must be successfully authenticated to view this page.</h1>
        </div>
      </Layout>
    );
  }

  if (!session?.data?.token && wasRendered) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container">
          <h1>Failed to generate token. Please try again.</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container">
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
