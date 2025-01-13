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

const OnEmailListingCheckResultUI = ({
    resultTxt = "You are on the mailing list.",
    actionTxt = "to sign in.",
    href = "/account?open_sign_in_modal=true",
}) => {
    return (
        <span className="mt-2">
            {resultTxt}
            <br />
            <span className="mt-4">
                Click{" "}
                <CustomLink hrefStr={href} className="color-primary underline-on-hover">
                    here
                </CustomLink>{" "}
                {actionTxt}
            </span>
        </span>
    );
};

const getConfirmationMailListingId = () => {
    const paramsStr = window.location.search.replace(/\?/, "");
    const urlParams = paramsStr.split("=");

    if (
        urlParams.length !== 2 ||
        (urlParams.length === 2 && urlParams[0] === "confirmation-id")
    ) {
        return null;
    }

    return urlParams[1];
};

const MailingListConfirmation = () => {
    const session = useSession();
    const { status, data } = session;
    const { token } = data ?? {};
    const [
        isRetrievingUserMailingListStatus,
        setIsRetrievingUserMailingListStatus,
    ] = useState(true);
    const [userMailingListStatusResultUI, setUserMailingListStatusResultUI] =
        useState(
            <span className="mt-2">
                Unable to perform mailing list verification. This link is either expired or was
                already used.
                <br />
                <span className="mt-4">
                    Please{" "}
                    <CustomLink
                        hrefStr="/account"
                        className="color-primary underline-on-hover"
                    >
                        sign in
                    </CustomLink>{" "}
                    to check if you are on the mailing list.
                </span>
            </span>
        );
    const wasStatusRetrievalCompleted = useRef(false);

    const getUserMailingListStatus = async (path = "/api/get-brevo-status") => {
        try {
            const emailListingConfirmationId = getConfirmationMailListingId();

            console.log(
                "emailListingConfirmationId, yo there: ",
                emailListingConfirmationId
            );
            let headers = {};
            let params = { mailingListConfirmationId: emailListingConfirmationId };

            if (path === "/api/get-signed-in-user-brevo-status") {
                headers = {
                    Authorization: `Bearer ${token}`,
                };
                params = {};
            }
            // print the headers
            console.log("headers, sup there: ", headers);

            const origin = window.location.origin;
            const url = `${origin}${path}`;
            console.log("origin, yo there: ", url);
            const response = await axios.get(url, {
                params,
                headers,
            });

            // print the response
            console.log("response, yo there: ", response);

            const { status: resStatus, data } = response ?? {};

            if (resStatus !== 200) {
                throw new Error(
                    "Failed to retrieve the brevo status for the target user."
                );
            }

            if (data.isOnMailingList) {
                const actionTxt =
                    status === "unauthenticated"
                        ? "to sign in."
                        : "to return to your account.";
                const href =
                    status === "authenticated"
                        ? "/account"
                        : "/account?open-sign_in-modal=true";
                setUserMailingListStatusResultUI(
                    <OnEmailListingCheckResultUI
                        resultTxt="You are on the mailing list."
                        actionTxt={actionTxt}
                        href={href}
                    />
                );
                // set the cookies if the user is on the mailing list. { confirmationId: isOnMailingList }
            } else {
                const actionTxt =
                    status === "unauthenticated"
                        ? "to log in and sign up to GP's mailing list."
                        : "to return to your account and sign up.";
                const href =
                    status === "authenticated"
                        ? "/account?open-sign_in-modal=true"
                        : "/account?will-open-account-setting-modal=true";
                setUserMailingListStatusResultUI(
                    <OnEmailListingCheckResultUI
                        resultTxt="You are not on the mailing list."
                        actionTxt={actionTxt}
                        href={href}
                    />
                );
            }

            console.log("data: ", data);
        } catch (error) {
            const { msg, errType } = error?.response?.data ?? {};
            console.error(
                "Failed to get mailing list status for the target user. Reason: ",
                msg ?? error
            );

            console.error("Error type: ", errType);

            setUserMailingListStatusResultUI(
                <span className="mt-2">
                    Unable to perform mailing list verification. This link is either expired or was
                    already used.
                    <br />
                    <span className="mt-2 d-block">
                        Please{" "}
                        <CustomLink
                            hrefStr="/account"
                            className="color-primary underline-on-hover"
                        >
                            sign in
                        </CustomLink>{" "}
                        to check if you are on the mailing list.
                    </span>
                </span>
            );
        } finally {
            setIsRetrievingUserMailingListStatus(false);
            wasStatusRetrievalCompleted.current = true;
        }
    };

    useEffect(() => {
        (async () => {
            console.log("yo there bacon: status: ", status);
            if (
                status === "unauthenticated" &&
                wasStatusRetrievalCompleted.current === false
            ) {
                console.log("will get status for non-signed in user....");
                await getUserMailingListStatus();
            } else if (
                status === "authenticated" &&
                wasStatusRetrievalCompleted.current === false
            ) {
                console.log("will get status for signed in user....");
                await getUserMailingListStatus(
                    "/api/get-signed-in-user-brevo-status",
                    <>
                        <span className="mt-2">
                            You are now on the mailing list. You will receive emails from us.
                            Click{" "}
                            <CustomLink
                                hrefStr="/account"
                                className="color-primary underline-on-hover"
                            >
                                here
                            </CustomLink>{" "}
                            to go back to your account.
                        </span>
                    </>
                );
            }
        })();
    }, [status]);

    if (isRetrievingUserMailingListStatus) {
        return (
            <Layout>
                <div className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column">
                    <div className="d-flex justify-content-center flex-column col-sm-2 align-items-center">
                        <span className="pt-3 text-center">Loading, please wait...</span>
                        <Spinner size="sm" className="text-dark mt-2" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column">
                {userMailingListStatusResultUI}
            </div>
        </Layout>
    );
};

export default MailingListConfirmation;
