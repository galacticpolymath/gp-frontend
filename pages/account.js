/* eslint-disable semi */
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
import { getIsParsable, resetUrl } from '../globalFns';

export const getAboutUserFormForClient = aboutUserFormFromServer => {
    const aboutUserFormForClient = { ...aboutUserFormDefault };
    const {
        reasonsForSiteVisit,
        subjects,
        gradesOrYears,
        classroomSize,
        zipCode,
        country,
        occupation,
        isTeacher,
    } = aboutUserFormFromServer;

    if (reasonsForSiteVisit && Object.entries(reasonsForSiteVisit).length > 0) {
        const reasonsForSiteVisitMap = new Map(Object.entries(aboutUserFormFromServer.reasonsForSiteVisit));
        aboutUserFormForClient.reasonsForSiteVisit = reasonsForSiteVisitMap;
    }

    if (subjects && Object.entries(subjects).length > 0) {
        const subjectsTeaching = new Map(Object.entries(subjects));
        aboutUserFormForClient.subjects = subjectsTeaching;
    } else if (subjects && Object.entries(subjects).length == 0) {
        aboutUserFormForClient.subjects = aboutUserFormDefault.subjects;
    }

    if (gradesOrYears && (Object.entries(gradesOrYears).length > 0)) {
        aboutUserFormForClient.gradesOrYears = gradesOrYears;
    } else if (gradesOrYears && (Object.entries(gradesOrYears).length === 0)) {
        aboutUserFormForClient.gradesOrYears = aboutUserFormDefault.gradesOrYears
    }

    if (classroomSize) {
        aboutUserFormForClient.classroomSize = classroomSize;
    }

    if (zipCode) {
        aboutUserFormForClient.zipCode = zipCode;
    }

    if (country) {
        aboutUserFormForClient.country = country;
    }

    if (occupation) {
        aboutUserFormForClient.occupation = occupation;
    }

    aboutUserFormForClient.isTeacher = isTeacher ?? false;

    return aboutUserFormForClient;
}

/**
 *  @param {import('next/router').NextRouter} router 
 *  @param {string} urlField 
 * */
export const getUrlVal = (router, urlField) => {
    const paths = router.asPath?.split('?');
    const urlKeyAndVal = paths?.[1]?.split("=");

    if (urlKeyAndVal?.length && (urlKeyAndVal?.[0] === urlField)) {
        return paths[1].split("=")?.[1];
    }

    return null;
};

/**
 *  @param {import('next/router').NextRouter} router 
 *  @param {string} urlField 
 * */
export const getAllUrlVals = (router, willCreateSubTuples) => {
    const pathsStr = router.asPath.split('?')[1];
    let urlKeysAndVals = pathsStr?.split("&");

    if (urlKeysAndVals?.length && willCreateSubTuples) {
        const urlKeysAndValsTuples = urlKeysAndVals.map(keyAndValStr => {
            return keyAndValStr.split('=');
        });

        return urlKeysAndValsTuples;
    }

    return urlKeysAndVals;
};

const AccountPg = () => {
    const session = useSession();
    const { status, data } = session;
    const router = useRouter();
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
                    const {
                        reasonsForSiteVisit,
                        subjects,
                        gradesOrYears,
                        classroomSize,
                        zipCode,
                        country,
                        occupation,
                        isTeacher,
                    } = aboutUserFormFromServer;

                    if (reasonsForSiteVisit && Object.entries(reasonsForSiteVisit).length > 0) {
                        const reasonsForSiteVisitMap = new Map(Object.entries(aboutUserFormFromServer.reasonsForSiteVisit));
                        aboutUserFormForClient.reasonsForSiteVisit = reasonsForSiteVisitMap;
                    }

                    if (subjects && Object.entries(subjects).length > 0) {
                        const subjectsTeaching = new Map(Object.entries(subjects));
                        aboutUserFormForClient.subjects = subjectsTeaching;
                    } else if (subjects && Object.entries(subjects).length == 0) {
                        aboutUserFormForClient.subjects = aboutUserFormDefault.subjects;
                    }

                    if (gradesOrYears && (Object.entries(gradesOrYears).length > 0)) {
                        aboutUserFormForClient.gradesOrYears = gradesOrYears;
                    } else if (gradesOrYears && (Object.entries(gradesOrYears).length === 0)) {
                        aboutUserFormForClient.gradesOrYears = aboutUserFormDefault.gradesOrYears
                    }

                    if (classroomSize) {
                        aboutUserFormForClient.classroomSize = classroomSize;
                    }

                    if (zipCode) {
                        aboutUserFormForClient.zipCode = zipCode;
                    }

                    if (country) {
                        aboutUserFormForClient.country = country;
                    }

                    if (occupation) {
                        aboutUserFormForClient.occupation = occupation;
                    }

                    aboutUserFormForClient.isTeacher = isTeacher ?? false;

                    localStorage.setItem('aboutUserForm', JSON.stringify(aboutUserFormFromServer));

                    console.log("aboutUserFormForClient: ", aboutUserFormForClient);

                    setAboutUserForm(aboutUserFormForClient);
                } catch (error) {
                    console.error('Failed to get "AboutUser" form. Reason: ', error);
                }
            })();
            return;
        }

        if ((status === "unauthenticated") && router.asPath.includes('?') && getAllUrlVals(router).some(urlParam => urlParam.includes('duplicate-email'))) {
            const paths = getAllUrlVals(router, true);
            const providerUsedForUserEntryArr = paths.find(([urlKey]) => urlKey === 'provider-used');
            const providerUsed = providerUsedForUserEntryArr?.length === 2 ? providerUsedForUserEntryArr[1] : null;
            const bodyTxt = providerUsed?.toLowerCase() === 'google' ? "Try signing using your email and password." : "Try signing in with Google.";

            setTimeout(() => {

                setNotifyModal({
                    isDisplayed: true,
                    bodyTxt: bodyTxt,
                    headerTxt: 'Sign-in ERROR. There is an email with a different provider in our records.',
                    handleOnHide: () => {
                        resetUrl(router);
                    },
                });
            }, 300);
        }
    }, [status]);

    useEffect(() => {
        const urlVals = getAllUrlVals(router, true);
        const urlVal = urlVals?.length ? urlVals.find(([urlKey]) => urlKey === 'show_about_user_form') : null;

        if ((status === 'authenticated') && (urlVal?.length === 2) && getIsParsable(urlVal[1]) && JSON.parse(urlVal[1])) {
            setTimeout(() => {
                setIsAboutMeFormModalDisplayed(true);
            }, 300);
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
                        className='pt-5'
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
                            src={image || '/imgs/gp_logo_gradient_transBG.png'}
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
                                View {"'"}About Me{"'"} form
                            </span>
                        </Button>
                    </section>
                </section>
            </div>
        </Layout>
    );
};

export default AccountPg;