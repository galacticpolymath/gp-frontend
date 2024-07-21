/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import LoginUI from '../components/User/Login/LoginUI';
import Button from '../components/General/Button';

const AccountPg = () => {
    const session = useSession();
    const { status, data } = session;
    console.log('session, yo there: ', session);

    if (status === 'loading') {
        return (
            <Layout>
                <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4 d-flex flex-column">
                    Loading...
                </div>
            </Layout>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Layout>
                <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
                    <LoginUI
                        className='pt-3'
                        headingTitleClassName='text-center text-black my-2'
                        isInputIconShow={false}
                    />
                </div>
            </Layout>
        );
    }

    const { email, name, image } = data.user;

    return (
        <Layout>
            <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
                <section className='row bg-danger'>
                    <section className='col-12 d-flex justify-content-center align-items-center pt-5'>
                        <img
                            src={image}
                            alt='user_img'
                            style={{ objectFit: 'contain' }}
                            className='rounded-circle'
                        />
                    </section>
                    <section className='col-12 d-flex justify-content-center align-items-center mt-3'>
                        <h5>{name.first} {name.last}</h5>
                    </section>
                </section>
            </div>
        </Layout>
    );
};

export default AccountPg;