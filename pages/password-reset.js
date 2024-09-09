/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Layout from '../components/Layout';
import PasswordResetForm from '../components/User/Password/PasswordResetForm';

const PasswordResetPg = () => {
    return (
        <Layout>
            <div
                style={{ minHeight: '100vh', paddingTop: '10px' }}
                className="container pt-4"
            >
                <section className='d-flex justify-content-center pt-2'>
                    <img
                        src='/imgs/gp-logos/GP_Stacked_logo+wordmark_gradient_transBG.png'
                        alt='gp_logo'
                        style={{
                            maxHeight: '305px',
                            maxWidth: '305px',
                        }}
                    />
                </section>
                <section className='d-flex justify-content-center flex-column pt-2'>
                    <PasswordResetForm />
                </section>
            </div>
        </Layout>
    );
};

export default PasswordResetPg;
