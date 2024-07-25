/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import { signIn } from "next-auth/react";
import { useState } from "react";

/**
* @typedef TLoginForm
* @property {string} email
* @property {string} password
*/

/**
* @typedef TCreateAccount
* @property {string} firstName
* @property {string} lastName
* @property {string} email
* @property {string} password
*/

export const useUserEntry = () => {
    const [userErrorType, setUserErrorType] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [createAccountForm, setCreateAccountForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    /**
    * Get all of the files for the target user.
    * @param {'login' | 'createAccount'} formType The client side user's access token.
    * @param {'credentials' | 'google'} providerType google drive service object
    * @param {{ email: string, password: string }} userInput    
    * @param {{ login: TLoginForm, createAccount: TCreateAccount }} form    
    * */
    const sendFormToServer = (formType, providerType, form) => {
        try {
            if ((form.createAccount && !Object.keys(form.createAccount).length) ||
                (form.login && !Object.keys(form.login).length) ||
                !formType
            ) {
                setUserErrorType('emptyInputs');

                throw new Error('Received empty inputs.');
            }

            if (form.createAccount && form.login) {
                throw new Error('Cannot have both a "createAccount" form and a "login" form.');
            }

            /** @type {TCreateAccount | TLoginForm} */
            const formToSend = form.createAccount ?? form.login;

            signIn(providerType, {
                ...formToSend,
                formType: formType,
            });
        } catch (error) {
            console.error('An error has occurred. Failed to send form to the server. Reason: ', error);
        }
    };

    return {
        sendFormToServer,
        userErrorType,
        _loginForm: [loginForm, setLoginForm],
        _createAccountForm: [createAccountForm, setCreateAccountForm],
    };
};