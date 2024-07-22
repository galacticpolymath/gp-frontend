/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
import { FcGoogle } from "react-icons/fc";
import Button from "../General/Button";
import { signIn } from "next-auth/react";

const GoogleSignIn = ({ callbackUrl = '', className = 'rounded p-2 d-flex justify-content-center align-items-center border' }) => {
    const handleBtnClick = event => {
        event.preventDefault();
        
        let url = callbackUrl ? callbackUrl : window.location.href;
        url = url.includes('?') ? url.split('?')[0] : url;

        signIn('google', { callbackUrl: url });
    };

    return (
        <Button
            backgroundColor="white"
            classNameStr={className}
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