/* eslint-disable no-useless-escape */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
import axios from "axios";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { constructUrlWithSearchQuery, validateEmail } from "../globalFns";

/**
* @typedef TLoginForm
* @property {string} email
* @property {string} password
*/

/**
 * @global
 * @typedef {'none' | 'userNotFound' | 'invalidCredentials' | 'googleLogin'} TUserLoginErrType

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {TUserLoginErrType}
 */
export const getUserLoginErrType = async (email, password) => {
    try {
        const url = `${window.location.origin}/api/can-login`;
        /**
         * @type {{ status: number, data: { errType: 'none' | 'userNotFound' | 'invalidCredentials' }}} */
        console.log('url, what is up there: ', url);
        const response = await axios.post(
            url,
            {
                email,
                password,
            });

        return response.data.errType;
    } catch (error) {
        console.error('Cannot log user in. Reason: ', error);

        const { errType, msg } = error?.response?.data ?? {};

        console.error("Message from server: ", msg);

        return errType ?? "invalidCredentials";
    }
};

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
const getDoesEmailExist = async (email) => {
    try {
        const url = constructUrlWithSearchQuery(
            `${window.location.origin}/api/does-user-exist`,
            [["email", email]]
        );
        const { status, data } = await axios.get(url.href);

        if (status !== 200) {
            throw new Error("Received a non 200 response from the server.");
        }

        if (typeof data !== 'object' || typeof data?.doesUserExist !== 'boolean') {
            throw new Error("Receivded a invalid response body from the server.");
        }

        console.log('data: ', data);

        return data.doesUserExist;
    } catch (error) {
        console.error("Failed to check if the email exist. Reason: ", error);

        return false;
    }
};

export const useUserEntry = () => {
    const [userErrorType, setUserErrorType] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [userEntryErrors, setUserEntryErrors] = useState(new Map());
    const [isUserEntryInProcess, setIsUserEntryInProcess] = useState(false);
    const [createAccountForm, setCreateAccountForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    /**
     * @param {"login" | "createAccount"} formToValidate
     * @returns {Map<string, string>}
     */
    const validateForm = async (formToValidate = 'createAccount') => {
        if (formToValidate === "createAccount") {
            const { password, confirmPassword, email } = createAccountForm;
            const errors = new Map();

            if (password !== confirmPassword) {
                errors.set("password", "The passwords don't match.");
                errors.set("confirmPassword", "The passwords don't match.");
            } else if (!password && !confirmPassword) {
                errors.set("password", "This field is required.");
                errors.set("confirmPassword", "This field is required.");
            }

            const doesEmailExist = await getDoesEmailExist(email);

            console.log("doesEmailExist: ", doesEmailExist);

            if (doesEmailExist) {
                errors.set('email', 'This email has been taken.');
            } else if (!validateEmail(email)) {
                errors.set("email", "Invalid email.");
            }

            return errors;
        }
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

    const handleLoginBtnClick = async () => {
        setIsUserEntryInProcess(true);
        setUserEntryErrors(new Map());

        const errors = new Map();
        const { email, password } = loginForm;

        if (!email) {
            errors.set('email', 'This field is required.');
        } else if (!validateEmail(email)) {
            errors.set('email', "Invalid email.");
        }

        if (!password) {
            errors.set('password', 'This field is required.');
        }

        if (errors.size > 0) {
            setTimeout(() => {
                setIsUserEntryInProcess(false);
                setUserEntryErrors(errors);
            }, 200);
            return;
        }

        const userLoginErrType = await getUserLoginErrType(email, password);

        if (userLoginErrType === "googleLogin") {
            errors.set('email', 'This email exists but uses Google to log in.');
        } else if (userLoginErrType === "userNotFound") {
            errors.set("email", "Email not found.");
        } else if (userLoginErrType === "invalidCredentials") {
            errors.set("email", "Email or password is incorrect.");
            errors.set("password", "Email or password is incorrect.");
        }

        if (errors.size > 0) {
            setTimeout(() => {
                setIsUserEntryInProcess(false);
                setUserEntryErrors(errors);
            }, 200);
            return;
        }

        sendFormToServer(
            "login",
            "credentials",
            {
                login: {
                    email,
                    password,
                },
            },
        );
    };

    return {
        sendFormToServer,
        userErrorType,
        validateForm,
        handleOnInputChange,
        handleLoginBtnClick,
        _userEntryErrors: [userEntryErrors, setUserEntryErrors],
        _isUserEntryInProcess: [isUserEntryInProcess, setIsUserEntryInProcess],
        _loginForm: [loginForm, setLoginForm],
        _createAccountForm: [createAccountForm, setCreateAccountForm],
    };
};