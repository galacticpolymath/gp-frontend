/* eslint-disable no-debugger */
/* eslint-disable no-console */
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
import { ModalContext } from '../providers/ModalProvider';
import { UserContext, aboutUserFormDefault } from '../providers/UserProvider';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

/**
 *  @param {import('next/router').NextRouter} router 
 *  @param {string} urlField 
 * */
export const getUrlVal = (router, urlField) => {
    const paths = router.asPath?.split('?');
    const urlKeyAndVal = paths?.[1]?.split("=");

    console.log('urlKeyAndVal: ', urlKeyAndVal);

    if ((urlKeyAndVal?.length === 2) && (urlKeyAndVal?.[0] === urlField)) {
        return paths[1].split("=")?.[1];
    }

    return null;
};

const AccountPg = () => {
    const session = useSession();
    const router = useRouter();
    const { status, data } = session;
    const { _aboutUserForm } = useContext(UserContext);
    const { _isAboutMeFormModalDisplayed, _notifyModal } = useContext(ModalContext);
    const [, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [, setAboutUserForm] = _aboutUserForm;
    const [, setNotifyModal] = _notifyModal;

    useEffect(() => {
        if (status === 'authenticated') {
            (async () => {
                try {
                    const paramsAndHeaders = {
                        params: { email: data.user.email },
                        headers: {
                            Authorization: `Bearer ${data.token}`,
                        },
                    };
                    const response = await axios.get(
                        `${window.location.origin}/api/get-about-user-form`,
                        paramsAndHeaders,
                    );

                    if (response.status !== 200) {
                        throw new Error("Failed to get 'AboutUser' form for the target user.");
                    }

                    /** @type {import('../providers/UserProvider').TAboutUserFormFromServer} */
                    const aboutUserFormFromServer = response.data;
                    /** @type {import('../providers/UserProvider').TAboutUserForm} */
                    const aboutUserFormForClient = { ...aboutUserFormDefault };

                    if (aboutUserFormFromServer.reasonsForSiteVisit && Object.entries(aboutUserFormFromServer.reasonsForSiteVisit).length > 0) {
                        const reasonsForSiteVisitMap = new Map(Object.entries(aboutUserFormFromServer.reasonsForSiteVisit));
                        aboutUserFormForClient.reasonsForSiteVisit = reasonsForSiteVisitMap;
                    }

                    if (aboutUserFormFromServer.subjects && Object.entries(aboutUserFormFromServer.subjects).length > 0) {
                        const subjectsTeaching = new Map(Object.entries(aboutUserFormFromServer.subjects));
                        aboutUserFormForClient.subjects = subjectsTeaching;
                    }

                    if (aboutUserFormFromServer.gradesOrYears && Object.entries(aboutUserFormFromServer.gradesOrYears).length > 0) {
                        aboutUserFormForClient.gradesOrYears = aboutUserFormFromServer.gradesOrYears;
                    }

                    if (aboutUserFormFromServer.classroomSize) {
                        aboutUserFormForClient.classroomSize = aboutUserFormFromServer.classroomSize;
                    }

                    if (aboutUserFormFromServer.zipCode) {
                        aboutUserFormForClient.zipCode = aboutUserFormFromServer.zipCode;
                    }

                    if (aboutUserFormFromServer.country) {
                        aboutUserFormForClient.country = aboutUserFormFromServer.country;
                    }

                    if (aboutUserFormFromServer.occupation) {
                        aboutUserFormForClient.occupation = aboutUserFormFromServer.occupation;
                    }

                    console.log('aboutUserFormForClient, yo there: ', aboutUserFormForClient);

                    localStorage.setItem('aboutUserForm', JSON.stringify(aboutUserFormFromServer));

                    setAboutUserForm(aboutUserFormForClient);
                } catch (error) {
                    console.error('Failed to get "AboutUser" form. Reason: ', error);
                }
            })();
            return;
        }

        if ((status === "unauthenticated") && getUrlVal(router, 'account-creation-err-type') === 'duplicate-email') {
            setTimeout(() => {
                setNotifyModal({
                    isDisplayed: true,
                    bodyTxt: '',
                    headerTxt: 'There is an account with that email. Sign in instead.',
                    handleOnHide: () => { },
                });
            }, 300);
        }
    }, [status]);

    useEffect(() => {
        const urlVal = getUrlVal(router, "show_about_user_form");

        console.log('urlVal: ', urlVal);

        if (JSON.parse(urlVal) && (status === 'authenticated')) {
            setTimeout(() => {
                setIsAboutMeFormModalDisplayed(true);
            }, 300);
        } else if (JSON.parse(urlVal) && (status === 'unauthenticated')) {
            const url = router.asPath;
            router.replace(url.split("?")[0]);
        }
    }, [status]);

    if (status === 'loading') {
        return (
            <Layout>
                <div style={{ minHeight: '100vh' }} className="container pt-5 mt-5 d-flex flex-column align-items-center">
                    <h5>Loading, please wait...</h5>
                    <Spinner className='text-dark' />
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

    const { email, name, image, occupation } = data.user;

    const handleBtnClick = () => {
        setIsAboutMeFormModalDisplayed(true);
    };

    return (
        <Layout>
            <div style={{ minHeight: '90vh', paddingTop: '10px' }} className="container pt-5 pt-sm-4">
                <section className='row border-bottom pb-4'>
                    <section className='col-12 d-flex justify-content-center align-items-center pt-4'>
                        <img
                            src={image ?? '/imgs/gp_logo_gradient_transBG.png'}
                            alt='user_img'
                            width={100}
                            height={100}
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
                            {occupation ?? 'UNANSWERED'}
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