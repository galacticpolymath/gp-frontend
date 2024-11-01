/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
import { FcGoogle } from "react-icons/fc";
import Button from "../General/Button";
import { signIn } from "next-auth/react";

const GoogleSignIn = ({
    children = (
        <>
            <FcGoogle className="mx-2" />
            <span style={{ fontSize: '16px' }}>
                Sign in with Google.
            </span>
        </>
    ),
    callbackUrl = '',
    handleGoogleBtnClickCustom,
    style = {},
    className = 'rounded p-2 d-flex justify-content-center align-items-center border',
}) => {
    
    const handleGoogleBtnClickDefault = event => {
        event.preventDefault();

        if (!callbackUrl) {
            console.error('The callback url cannot be empty.');
            return;
        }

        signIn('google', { callbackUrl: callbackUrl });
    };

    return (
        <Button
            defaultStyleObj={style}
            backgroundColor="white"
            classNameStr={className}
            handleOnClick={typeof handleGoogleBtnClickCustom === 'function' ? handleGoogleBtnClickCustom : handleGoogleBtnClickDefault}
        >
            {children}
        </Button>
    );
};

export default GoogleSignIn;