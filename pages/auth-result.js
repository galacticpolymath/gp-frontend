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

  const { token, user } = session.data;
  const isMatt = user.name === 'Matt Wilkins';

  return (
    <Layout>
      <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container">
        <h1>Authenticated as: </h1>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
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
          JWT: {token}
        </p>
        <Link href="/">
          {isMatt ? 'Go back to the main page or check the console.' : 'Go back to the main page.'}
        </Link>
      </div>
    </Layout>
  );
};

export default AuthResultPg;
