/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { useEffect } from "react";
import CustomLink from "../components/CustomLink";
import Layout from "../components/Layout";
import axios from "axios";
import { updateUser } from "../apiServices/user/crudFns";
import { useSession } from "next-auth/react";

const MailingListConfirmation = () => {
    const session = useSession();
    const { status, data } = session;
    const { email } = data.user ?? {};

    useEffect(() => {
        if (status === 'authenticated') {
            (async () => {
                const paramsAndHeaders = {
                    params: { email: data.user.email },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };


                const responseBody = await updateUser({ email: email }, { isOnMailingList: true });
            })();
        }
    }, [status]);
    return (
        <Layout>
            <div
                className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column"
            >
                <span className="pt-3">You have been added to GP{"'"}s mailing list. Thanks for joining!</span>
                <span className='mt-2'>
                    Click <CustomLink hrefStr="/account" className="color-primary underline-on-hover">here</CustomLink> to go back to your account.
                </span>
            </div>
        </Layout>
    );
};

export default MailingListConfirmation;