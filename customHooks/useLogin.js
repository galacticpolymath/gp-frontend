/* eslint-disable quotes */
import { signIn } from "next-auth/react";
import { useState } from "react";

/* eslint-disable indent */
export const useLogin = () => {
    const [userErrorType, setUserErrorType] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    const sendFormToServer = (userInput = { email: '', password: '' }, formType = '') => {
        if (!userInput.email || !userInput.password || !formType) {
            setUserErrorType('emptyInputs');
            return;
        }

        signIn('credentials', { 
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