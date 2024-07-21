/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

const AccountPg = () => {
    const session = useSession();
    
    // get the user info in the session object 
    console.log('session: ', session);

    return (
        <Layout>
            <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
                
            </div>
        </Layout>
    );
};

export default AccountPg;