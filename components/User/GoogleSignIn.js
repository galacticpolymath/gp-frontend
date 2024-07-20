/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
import { FcGoogle } from "react-icons/fc";
import Button from "../General/Button";
import { signIn } from "next-auth/react";

const GoogleSignIn = ({ callbackUrl = '' }) => {
    const handleBtnClick = event => {
        event.preventDefault();
        // check if the user exists: 
        // the user has to have credentials for their provider
        // if so, then save their last path on the site to redirect the user to that location

        // GOAL: get the user from the database
        signIn('google', { formType: 'createAccount', callbackUrl: callbackUrl ? callbackUrl : window.location.href });
    };

    return (
        <Button
            backgroundColor="white"
            classNameStr="rounded py-1 px-2 d-flex justify-content-center align-items-center border-0"
            handleOnClick={handleBtnClick}
        >
            <FcGoogle className="mx-2" />
            <span style={{ fontSize: '16px' }}>
                Sign in with Google.
            </span>
        </Button>
    );
};

export default GoogleSignIn;