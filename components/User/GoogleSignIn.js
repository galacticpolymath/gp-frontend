/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
import { FcGoogle } from "react-icons/fc";
import Button from "../General/Button";
import { signIn } from "next-auth/react";

const GoogleSignIn = ({ callbackUrl = '', className = 'rounded p-2 d-flex justify-content-center align-items-center border', txt = 'Sign in with Google.', isCreatingAccount }) => {
    const handleBtnClick = event => {
        event.preventDefault();

        console.log('callbackUrl: ', callbackUrl);
        
        if(!callbackUrl){
            console.error('The callback url cannot be empty.');
            return;
        }

        signIn('google', { callbackUrl: callbackUrl });
    };

    return (
        <Button
            backgroundColor="white"
            classNameStr={className}
            handleOnClick={handleBtnClick}
        >
            <FcGoogle className="mx-2" />
            <span style={{ fontSize: '16px' }}>
                {txt}
            </span>
        </Button>
    );
};

export default GoogleSignIn;