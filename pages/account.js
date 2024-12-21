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
import { UserContext, userAccountDefault } from '../providers/UserProvider';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { getAllUrlVals, getChunks, getIsParsable, resetUrl } from '../globalFns';
import { FaUserAlt } from 'react-icons/fa';

export const getAboutUserFormForClient = userAccount => {
    const userAccountForClient = { ...userAccountDefault };
    const {
        reasonsForSiteVisit,
        subjects,
        gradesOrYears,
        classroomSize,
        zipCode,
        country,
        occupation,
        isTeacher,
    } = userAccount;

    if (reasonsForSiteVisit && Object.entries(reasonsForSiteVisit).length > 0) {
        const reasonsForSiteVisitMap = new Map(Object.entries(userAccount.reasonsForSiteVisit));
        userAccountForClient.reasonsForSiteVisit = reasonsForSiteVisitMap;
    }

    if (subjects && Object.entries(subjects).length > 0) {
        const subjectsTeaching = new Map(Object.entries(subjects));
        userAccountForClient.subjects = subjectsTeaching;
    } else if (subjects && Object.entries(subjects).length == 0) {
        userAccountForClient.subjects = userAccountDefault.subjects;
    }

    if (gradesOrYears && (Object.entries(gradesOrYears).length > 0)) {
        userAccountForClient.gradesOrYears = gradesOrYears;
    } else if (gradesOrYears && (Object.entries(gradesOrYears).length === 0)) {
        userAccountForClient.gradesOrYears = userAccountDefault.gradesOrYears
    }

    if (classroomSize) {
        userAccountForClient.classroomSize = classroomSize;
    }

    if (zipCode) {
        userAccountForClient.zipCode = zipCode;
    }

    if (country) {
        userAccountForClient.country = country;
    }

    if (occupation) {
        userAccountForClient.occupation = occupation;
    }

    userAccountForClient.isTeacher = isTeacher ?? false;

    return userAccountForClient;
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

const AccountPg = () => {
    const router = useRouter();
    const { _aboutUserForm } = useContext(UserContext);
    const { _isAboutMeFormModalDisplayed, _notifyModal, _isAccountSettingModalOn } = useContext(ModalContext);
    const [, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
    const [, setIsAccountSettingsModalOn] = _isAccountSettingModalOn;
    /** 
     * @type {[import('../providers/UserProvider').TUserAccount, import('react').Dispatch<import('react').SetStateAction<import('../providers/UserProvider').TUserAccount>>]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const [, setNotifyModal] = _notifyModal;
    const session = useSession();
    const { status, data } = session;
    const { user, token } = data ?? {};
    const { email, name, image } = user ?? {};
    const occupation = typeof localStorage === 'undefined' ? null : JSON.parse(localStorage.getItem('userAccount') ?? '{}').occupation;
    const firstName = aboutUserForm?.name?.first ? aboutUserForm.name.first : (name?.first ?? "");
    const lastName = aboutUserForm?.name?.last ? aboutUserForm.name.last : (name?.last ?? "");

    useEffect(() => {
        if (status === 'authenticated') {
            (async () => {
                try {
                    const paramsAndHeaders = {
                        params: { email: data.user.email },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const response = await axios.get(
                        '/api/get-user-account-data',
                        paramsAndHeaders,
                    );

                    if (response.status !== 200) {
                        throw new Error("Failed to get 'AboutUser' form for the target user.");
                    }

                    /** @type {import('../providers/UserProvider').TUserAccount} */
                    const userAccount = response.data;
                    /** @type {import('../providers/UserProvider').TAboutUserForm} */
                    const userAccountForClient = { ...userAccountDefault };
                    const {
                        reasonsForSiteVisit,
                        subjects,
                        gradesOrYears,
                        classroomSize,
                        zipCode,
                        country,
                        occupation,
                        isTeacher,
                        name,
                    } = userAccount;

                    console.log('name: ', name);

                    if (reasonsForSiteVisit && Object.entries(reasonsForSiteVisit).length > 0) {
                        const reasonsForSiteVisitMap = new Map(Object.entries(userAccount.reasonsForSiteVisit));
                        userAccountForClient.reasonsForSiteVisit = reasonsForSiteVisitMap;
                    }

                    if (subjects && Object.entries(subjects).length > 0) {
                        const subjectsTeaching = new Map(Object.entries(subjects));
                        userAccountForClient.subjects = subjectsTeaching;
                    } else if (subjects && Object.entries(subjects).length == 0) {
                        userAccountForClient.subjects = userAccountDefault.subjects;
                    }

                    if (gradesOrYears && (Object.entries(gradesOrYears).length > 0) && gradesOrYears.selection) {
                        userAccountForClient.gradesOrYears = gradesOrYears;
                    } else if (gradesOrYears && ((Object.entries(gradesOrYears).length === 0) || !gradesOrYears.selection || !gradesOrYears?.ageGroupsTaught?.length)) {
                        userAccountForClient.gradesOrYears = {
                            selection: 'U.S.',
                            ageGroupsTaught: [],
                        }
                    }

                    if (userAccount && ((Object.entries(userAccount).length === 0) || !userAccount.selection || !userAccount?.ageGroupsTaught?.length)) {
                        userAccount.gradesOrYears = {
                            selection: 'U.S.',
                            ageGroupsTaught: [],
                        }
                    }

                    if ((typeof classroomSize === 'object') && classroomSize) {
                        userAccountForClient.classroomSize = classroomSize;
                    } else if (typeof classroomSize === 'number') {
                        userAccountForClient.classroomSize = {
                            num: classroomSize,
                            isNotTeaching: false,
                        }
                    } else if (!classroomSize) {
                        userAccountForClient.classroomSize = {
                            num: 0,
                            isNotTeaching: false,
                        }
                    }

                    if (zipCode) {
                        userAccountForClient.zipCode = zipCode;
                    }

                    if (country) {
                        userAccountForClient.country = country;
                    }

                    if (occupation) {
                        userAccountForClient.occupation = occupation;
                    }

                    userAccountForClient.isTeacher = isTeacher ?? false;

                    localStorage.setItem('userAccount', JSON.stringify(userAccount));

                    setAboutUserForm(userAccountForClient);
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

        const urlVals = getAllUrlVals(router)?.flatMap(urlVal => urlVal.split('='));
        const urlValsChunks = urlVals?.length ? getChunks(urlVals, 2) : []
        const didPasswordChange = urlValsChunks.find(([key, val]) => {
            if ((key === 'password_changed') && getIsParsable(val)) {
                return JSON.parse(val);
            }

            return false;
        }) !== undefined;

        if ((status === "unauthenticated") && didPasswordChange) {
            setTimeout(() => {
                setNotifyModal({
                    isDisplayed: true,
                    bodyTxt: "",
                    headerTxt: 'Password updated! You can now login.',
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
        console.log('urlVal, yo there: ', urlVal);
        const accountSettingsModalOnUrlVals = urlVals?.length ? urlVals.find(([urlKey]) => urlKey === 'will-open-account-setting-modal') : null;

        if ((status === 'authenticated') && (urlVal?.length === 2) && getIsParsable(urlVal[1]) && JSON.parse(urlVal[1])) {
            setTimeout(() => {
                setIsAboutMeFormModalDisplayed(true);
            }, 300);

            // the second value in 'accountSettingsModalOnUrlVals is a boolean
        } else if ((status === 'authenticated') && (accountSettingsModalOnUrlVals?.length === 2) && getIsParsable(accountSettingsModalOnUrlVals[1]) && JSON.parse(accountSettingsModalOnUrlVals[1])) {
            setTimeout(() => {
                setIsAccountSettingsModalOn(true);
            }, 300);
        }

        const isOnMailingList = localStorage.getItem('isOnMailingList') ? JSON.parse(localStorage.getItem('isOnMailingList')) : false;

        if (isOnMailingList && (status === 'authenticated')) {
            (async () => {
                try {
                    const response = await axios.put(
                        '/api/update-user',
                        {
                            email,
                            isOnMailingListConfirmationUrl: `${window.location.origin}/mailing-list-confirmation`,
                            willUpdateMailingListStatusOnly: true,
                            willSendEmailListingSubConfirmationEmail: true,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ) ?? {};
                    const { status, data } = response;

                    console.log('response: ', response);

                    if (status !== 200) {
                        throw new Error("Failed to add user to email listing.");
                    }

                    console.log('Added user to mail listing. From server: ', data);

                    localStorage.removeItem('isOnMailingList');
                } catch (error) {
                    console.error("Failed to add user to mail listing. Reason: ", error);
                }

            })();
        }

        const urlValsChunks = urlVals?.length ? getChunks(urlVals.flat(), 2) : []
        const willOpenAccountSettingsModal = urlValsChunks.find(([key, val]) => {
            if ((key === 'will-open-account-settings-modal') && getIsParsable(val)) {
                return JSON.parse(val);
            }

            return false;
        }) !== undefined;

        // if the user is authenticated, if there is action parameter that contains 'open-account-settings-modal', then open the account setting modal
        if ((status === 'authenticated') && willOpenAccountSettingsModal) {
            setIsAccountSettingsModalOn(true);
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

    const handleViewAboutMeFormBtnClick = () => {
        setIsAboutMeFormModalDisplayed(true);
    };
    const handleAccontSettingsBtnClick = () => {
        setIsAccountSettingsModalOn(true);
    }

    return (
        <Layout>
            <div style={{ minHeight: '90vh', paddingTop: '10px' }} className="container pt-5 pt-sm-4">
                <section className='row border-bottom pb-4'>
                    <section className='col-12 d-flex justify-content-center align-items-center pt-4'>
                        {image ? (
                            <img
                                src={image}
                                alt='user_img'
                                width={35}
                                height={35}
                                style={{ objectFit: 'contain' }}
                                className='rounded-circle'
                            />
                        )
                            :
                            <FaUserAlt fontSize={35} color='#2C83C3' />}
                    </section>
                    <section className='col-12 d-flex justify-content-center align-items-center mt-3 flex-column'>
                        <h5 className='mb-0'>{firstName} {lastName}</h5>
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
                            handleOnClick={handleViewAboutMeFormBtnClick}
                            classNameStr='rounded px-3 border shadow mt-2'
                        >
                            <span
                                style={{ fontWeight: 410 }}
                                className='text-black'
                            >
                                View {"'"}About Me{"'"} form
                            </span>
                        </Button>
                        <Button
                            handleOnClick={handleAccontSettingsBtnClick}
                            classNameStr='rounded px-3 border shadow mt-2'
                        >
                            <span
                                style={{ fontWeight: 410 }}
                                className='text-black'
                            >
                                Account Settings
                            </span>
                        </Button>
                    </section>
                </section>
            </div>
        </Layout>
    );
};

export default AccountPg;