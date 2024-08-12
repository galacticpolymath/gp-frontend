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

/**
 * @param {string} userInput 
 * @returns {boolean}
 */
const getDoesEmailExist = (userInput) => {
    console.log(userInput);

    return true;
};

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
     * @returns {Map<string, string>}
     */
    const validateLoginForm = () => {

    };

    /**
     * @returns {Map<string, string>}
     */
    const validateCreateAccountForm = () => {
        const { password, confirmPassword, email } = createAccountForm;
        const errors = new Map();

        if (password !== confirmPassword) {
            errors.set("password", "The passwords don't match.");
            errors.set("confirmPassword", "The passwords don't match.");
        } else if (!password && !confirmPassword) {
            errors.set("password", "This field is required.");
            errors.set("confirmPassword", "This field is required.");
        }

        if (getDoesEmailExist(email)) {
            errors.set('email', 'This email has been taken.');
        }

        return errors;
    };

    /**
     * @param {"login" | "createAccount"} formToValidate
     * @returns {Map<string, string>}
     */
    const validateForm = (formToValidate = 'createAccount') => {
        if (formToValidate === "createAccount") {
            return validateCreateAccountForm();
        }

        return validateLoginForm();
    };

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

            if (!form.createAccount && !form.login) {
                throw new Error('No form was passed for the "form" argument.');
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
            alert('An error has occurred during the login process. Please refresh the page. If this error persist, please contact support.');
        }
    };

    const handleOnInputChange = event => {
        setCreateAccountForm(form => ({
            ...form,
            [event.target.name]: event.target.value,
        }));
    };

    return {
        sendFormToServer,
        userErrorType,
        validateForm,
        handleOnInputChange,
        _loginForm: [loginForm, setLoginForm],
        _createAccountForm: [createAccountForm, setCreateAccountForm],
    };
};