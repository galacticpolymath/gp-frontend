/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import LoginUI from '../components/User/Login/LoginUI';
import Button from '../components/General/Button';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getIsParsable } from '../globalFns';
import { ModalContext } from '../providers/ModalProvider';

const AccountPg = () => {
    const session = useSession();
    const router = useRouter();
    const { status, data } = session;
    const { _aboutUserForm } = useContext(ModalContext);
    const setAboutUserForm = _aboutUserForm[1];

    useEffect(() => {
        const paths = router.asPath?.split('?');

        if (
            router.asPath &&
            router?.asPath?.includes('?') &&
            paths?.[1]?.includes('show_about_me_form') &&
            paths[1].split("=")?.[1] &&
            getIsParsable(paths[1].split("=")?.[1]) &&
            JSON.parse(paths[1].split("=")?.[1]) && 
            (status === 'authenticated')
        ) {
            // make the form modal appear onto the ui
            setTimeout(() => {
                setAboutUserForm(state => ({ ...state, isModalDisplayed: true }));
            }, 300);
        }

    }, [status]);

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

    const { email, name, image, occupation, affiliation } = data.user;

    const handleBtnClick = () => {
        setAboutUserForm(state => ({ ...state, isModalDisplayed: true }));
    };

    return (
        <Layout>
            <div style={{ minHeight: '90vh', paddingTop: '10px' }} className="container pt-4">
                <section className='row border-bottom pb-4'>
                    <section className='col-12 d-flex justify-content-center align-items-center pt-4'>
                        <img
                            src={image}
                            alt='user_img'
                            style={{ objectFit: 'contain' }}
                            className='rounded-circle'
                        />
                    </section>
                    <section className='col-12 d-flex justify-content-center align-items-center mt-3 flex-column'>
                        <h5 className='mb-0'>{name.first} {name.last}</h5>
                        <span>{email}</span>
                    </section>
                    <section className='col-12 d-flex justify-content-center align-items-center flex-column mt-1 pt-2'>
                        <span className='d-inline-flex justify-content-center align-tiems-center'>Occupation: </span>
                        <span style={{ fontStyle: 'italic' }} className='d-inline-flex justify-content-center align-tiems-center '>
                            {occupation ?? 'Professor'}, {affiliation ?? "Cornell University"}
                        </span>
                    </section>
                    <section className='col-12 d-flex justify-content-center align-items-center flex-column mt-1 pt-2'>
                        <Button
                            handleOnClick={handleBtnClick}
                            classNameStr='rounded px-3 border shadow mt-2'
                        >
                            <span
                                style={{ fontWeight: 410 }}
                                className='text-black'
                            >
                                View 'About Me' form
                            </span>
                        </Button>
                    </section>
                </section>
            </div>
        </Layout>
    );
};

export default AccountPg;