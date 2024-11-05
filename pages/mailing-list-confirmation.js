/* eslint-disable no-console */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { useEffect, useState } from "react";
import CustomLink from "../components/CustomLink";
import Layout from "../components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { Spinner } from "react-bootstrap";

const MailingListConfirmation = () => {
    const session = useSession();
    const { status, data } = session;
    const { email, token } = data?.user ?? {};
    const [isRetrievingUserMailingListStatus, setIsRetrievingUserMailingListStatus] = useState(true);
    const [userMailingListStatusResultUI, setUserMailingListStatusResultUI] = useState(
        <>
            <span className="pt-3">You must be signed in to access this page.</span>
            <span className='mt-2'>
                Click <CustomLink hrefStr="/account" className="color-primary underline-on-hover">here</CustomLink> to go to the sign-in page.
            </span>
        </>
    );
    const wasStatusRetrievalCompleted = useRef(false);

    useEffect(() => {
        if ((status === 'authenticated') && (wasStatusRetrievalCompleted.current === false)) {
            (async () => {
                try {
                    const headers = {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",

                    };
                    const paramsStr = window.location.search.replace(/\?/, '');
                    const urlParams = paramsStr.split('=');

                    if ((urlParams.length !== 2) && !urlParams.find(param => param === 'confirmation-id')) {
                        throw new Error('Invalid URL parameters');
                    }

                    const { status, data } = await axios.put(
                        '/api/user-confirms-mailing-list-sub',
                        {
                            email,
                            mailingListConfirmationEmailId: urlParams[1],
                        },
                        {
                            headers,
                        });
                    if (status !== 200) {
                        console.log('An error has occurred: ', data);
                        setUserMailingListStatusResultUI(
                            <>
                                <span className="pt-3">Server error has occurred. Please try again.</span>
                                <span className='mt-2'>
                                    Click <CustomLink hrefStr="/account?will-open-account-setting-modal=true" className="color-primary underline-on-hover">here</CustomLink> to sign up and try again.
                                </span>
                            </>
                        );
                        return;
                    }

                    const { mailingListStatus } = data ?? {};

                    if (mailingListStatus === "alreadyOnMailingList") {
                        setUserMailingListStatusResultUI(
                            <>
                                <span className="pt-3">You are already on the mailing list 👍.</span>
                                <span className='mt-2'>
                                    Click <CustomLink hrefStr="/account" className="color-primary underline-on-hover">here</CustomLink> to go back to your account.
                                </span>
                            </>
                        );
                        return;
                    }

                    setUserMailingListStatusResultUI(
                        <>
                            <span className="pt-3">You are all set! You will now receive GP{"'"}s newsletter emails.</span>
                            <span className='mt-2'>
                                Click <CustomLink hrefStr="/account" className="color-primary underline-on-hover">here</CustomLink> to go back to your account.
                            </span>
                        </>
                    );

                    console.log('The user is officially on the mailing list.');
                } catch (error) {
                    const { msg, errType } = error?.response?.data ?? {};
                    console.error('Failed to get mailing list status for the target user. Reason: ', msg);

                    if (errType === "mailingListConfirmationEmailIdMismatch") {
                        setUserMailingListStatusResultUI(
                            <>
                                <span className="pt-3">An error has occurred. You may have confirm the wrong email. Click the latest email that you have received to confirm your subscription</span>
                                <span className='mt-2'>
                                    You can click <CustomLink hrefStr="/account?will-open-account-setting-modal=true" className="color-primary underline-on-hover">here</CustomLink> to sign up and try again.
                                </span>
                            </>
                        );
                        return;
                    }

                    setUserMailingListStatusResultUI(
                        <>
                            <span className="pt-3">An error has occurred. You may not be subscribed to GP{"'"}s mailing list.</span>
                            <span className='mt-2'>
                                Click <CustomLink hrefStr="/account?will-open-account-setting-modal=true" className="color-primary underline-on-hover">here</CustomLink> to sign up and try again.
                            </span>
                        </>
                    );
                } finally {
                    setIsRetrievingUserMailingListStatus(false);
                    wasStatusRetrievalCompleted.current = true;
                }
            })();
        } else if ((status === "unauthenticated") && !wasStatusRetrievalCompleted.current) {
            wasStatusRetrievalCompleted.current = true;
            setIsRetrievingUserMailingListStatus(false);
        }
    }, [status]);

    if (isRetrievingUserMailingListStatus) {
        return (
            <Layout>
                <div
                    className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column"
                >
                    <div className="d-flex justify-content-center flex-column col-sm-2 align-items-center">
                        <span className="pt-3 text-center">Loading, please wait...</span>
                        <Spinner size="sm" className='text-dark mt-2' />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div
                className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column"
            >
                {userMailingListStatusResultUI}
            </div>
        </Layout>
    );
};

export default MailingListConfirmation;