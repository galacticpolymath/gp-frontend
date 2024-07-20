/* eslint-disable quotes */
import { signIn } from "next-auth/react";
import { useState } from "react";

/* eslint-disable indent */
export const useLogin = () => {
    const [userErrorType, setUserErrorType] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    /**
    * Get all of the files for the target user.
    * @param {'login' | 'createAccount'} formType The client side user's access token.
    * @param {'credentials' | 'google'} providerType google drive service object
    * @param {{ email: string, password: string }} userInput    
    * */
    const sendFormToServer = (userInput, formType, providerType) => {
        console.log(userInput);
        if (!userInput.email || !userInput.password || !formType) {
            setUserErrorType('emptyInputs');
            console.log('what is up ');
            return;
        }

        signIn(providerType, {
            email: userInput.email,
            password: userInput.password,
            formType: formType,
        });
    };

    return {
        sendFormToServer,
        userErrorType,
        _loginForm: [loginForm, setLoginForm],
    };
};