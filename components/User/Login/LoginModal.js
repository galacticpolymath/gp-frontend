/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
import { useContext, useState } from "react";
import { CloseButton, Modal, ModalHeader } from "react-bootstrap";
import { MdOutlineMail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import GoogleSignIn from "../GoogleSignIn";
import ORTxtDivider from "../ORTxtDivider";
import { useUserEntry } from "../../../customHooks/useUserEntry";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

/**
 * @global
 * @typedef {'none' | 'userNotFound' | 'invalidCredentials' | 'googleLogin'} TUserLoginErrType

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {TUserLoginErrType}
 */
const getUserLoginErrType = async (email, password) => {
    try {
        const url = `${window.location.href}/api/can-login`;
        /**
         * @type {{ status: number, data: { errType: 'none' | 'userNotFound' | 'invalidCredentials' }}} */
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

const LoginModal = () => {
    const { _isLoginModalDisplayed, _isCreateAccountModalDisplayed, _isPasswordResetModalOn } = useContext(ModalContext);
    const [isLoginModalDisplayed, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    const [, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
    const { _loginForm, sendFormToServer } = useUserEntry();
    const [errors, setErrors] = useState(new Map());
    /**
   * @type {[import("../formElements").TFocusCss, import('react').Dispatch<import('react').SetStateAction<import("../formElements").TFocusCss>>]}
   */
    const [emailFocusCss, setEmailFocusCss] = useState("input-focus-blue");
    /**
    * @type {[import("../formElements").TFocusCss, import('react').Dispatch<import('react').SetStateAction<import("../formElements").TFocusCss>>]}
    */
    const [passwordFocusCss, setPasswordFocusCss] = useState("border-grey-dark");
    const [loginForm, setLoginForm] = _loginForm;

    const handleOnInputChange = event => {
        const { name, value } = event.target;

        if (errors.has(name)) {
            const errorsClone = structuredClone(errors);

            errorsClone.delete(name);

            setErrors(errorsClone);
        }

        setLoginForm(currentState => ({
            ...currentState,
            [name]: value,
        }));
    };

    const handleOnHide = () => {
        setIsLoginModalDisplayed(false);
    };

    const handleLoginBtnClick = async () => {

        const errors = new Map();

        if (!loginForm.email) {
            errors.set('email', 'This field is required.');
            setErrors(errors);
        }

        if (!loginForm.password) {
            errors.set('password', 'This field is required.');
            setErrors(errors);
        }

        if (errors.size > 0) {
            return;
        }

        const userLoginErrType = await getUserLoginErrType(loginForm.email, loginForm.password);

        if (userLoginErrType === "googleLogin") {
            errors.set('email', 'Try logging in with google instead.');
            setErrors(errors);
        }

        console.log('userLoginErrType: ', userLoginErrType);

        // const url = `${window.location.href}/api/can-login`;
        // /**
        //  * @type {{ status: number, data: { errType: 'none' | 'userNotFound' | 'invalidCredentials' }}} */
        // const response = await axios.post(
        //     url,
        //     {
        //         email: loginForm.email,
        //         password: loginForm.password,
        //     });

        // if (response.data.errType === 'userNotFound') {
        //     errors.set('email', 'This email is not found in our database.');
        //     setErrors(errors);
        //     return;
        // }

        // if (response.data.errType === 'invalidCredentials') {
        //     errors.set('email', 'Invalid credentials.');
        //     errors.set('password', 'Invalid credentials.');
        //     setErrors(errors);
        //     return;
        // }

        // if (response.data.errType === 'none') {
        //     sendFormToServer(
        //         "login",
        //         "credentials",
        //         {
        //             login: {
        //                 email: loginForm.email,
        //                 password: loginForm.password,
        //             },
        //         },
        //     );
        //     return;
        // }

        // errors.set('email', 'Unable to validate credentials.');

        // errors.set('password', 'Unable eto validate credentials.');

        // setErrors(errors);
    };

    const handleCreateOneBtnClick = () => {
        setIsLoginModalDisplayed(false);
        setTimeout(() => {
            setIsCreateAccountModalDisplayed(true);
        }, 300);
    };

    const handleForgotYourPasswordBtnClick = () => {
        setIsLoginModalDisplayed(false);
        setTimeout(() => {
            setIsPasswordResetModalOn(true);
        }, 300);
    };

    return (
        <Modal
            show={isLoginModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='login-ui-modal bg-white shadow-lg rounded pt-2 box-shadow-login-ui-modal'
        >
            <ModalHeader className='d-flex flex-column'>
                <CloseButton className='position-absolute top-0 end-0 me-2 mt-2 mb-3 text-grey' onClick={handleOnHide} />
                <img
                    className='position-absolute top-0 start-0 me-5 mt-1'
                    src='imgs/gp_logo_gradient_transBG.png'
                    alt="gp_logo"
                    width={50}
                    height={50}
                    style={{
                        transform: 'translate(17%, 6%)',
                    }}
                />
                <h5 className="text-black text-center mt-2">GP Login</h5>
            </ModalHeader>
            <div className="py-3 py-sm-2">
                <section className="d-flex justify-content-center align-items-center pt-3">
                    <GoogleSignIn
                        callbackUrl={(typeof window !== 'undefined') ? window.location.href : ''}
                        className="rounded shadow px-3 py-2 w-75 py-sm-4 px-sm-5 border"
                    >
                        <FcGoogle className="mx-2" size={31} />
                        <span style={{ fontSize: '18px' }}>
                            Log in with Google.
                        </span>
                    </GoogleSignIn>
                </section>
                <ORTxtDivider color="black" className="d-flex my-3 mb-2" />
                <section>
                    <form>
                        <div className="mt-3 d-flex justify-content-center align-items-center position-relative">
                            <label
                                style={{ width: '12.5%' }}
                                className="position-absolute d-none d-sm-flex start-0 d-flex justify-content-center align-items-center"
                                htmlFor="email-input"
                            >
                                <MdOutlineMail fontSize='31px' color={errors.has('email') ? 'red' : "#D6D6D6"} />
                            </label>
                            <input
                                id="email-input"
                                placeholder="Email"
                                autoFocus
                                onFocus={() => setEmailFocusCss('input-focus-blue')}
                                onBlur={() => setEmailFocusCss('border-grey-dark')}
                                style={{
                                    outline: 'none',
                                    borderRadius: "5px",
                                    fontSize: "18px",
                                    background: '#D6D6D6',
                                    color: errors.has('email') ? 'red' : 'black',
                                }}
                                className={`${errors.has('email') ? '' : emailFocusCss} p-1 py-2 login-modal-input ${errors.has('email') ? 'border-red' : ''}`}
                                name="email"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                        </div>
                        <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                            <div className='w-75 d-flex align-items-center position-relative'>
                                <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>{errors.get('email') ?? ''}</span>
                            </div>
                        </div>
                        <div className="mt-4 d-flex justify-content-center align-items-center">
                            <label
                                style={{ width: '12.5%' }}
                                className="position-absolute start-0 d-none d-sm-flex justify-content-center align-items-center"
                                htmlFor="password-input"
                            >
                                <FaLock fontSize='31px' color="#D6D6D6" />
                            </label>
                            <input
                                id='password-input'
                                placeholder="Password"
                                style={{
                                    borderRadius: "5px",
                                    fontSize: "18px",
                                    background: '#D6D6D6',
                                    border: errors.has("password") ? "solid 1.5px red" : passwordFocusCss,

                                }}
                                onFocus={() => setPasswordFocusCss('input-focus-blue')}
                                onBlur={() => setPasswordFocusCss('border-grey-dark')}
                                className={`no-outline p-1 login-modal-input py-2 ${errors.has('password') ? 'bg-danger text-danger' : ''}`}
                                name='password'
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                        </div>
                        <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                            <div className='w-75 d-flex align-items-center position-relative'>
                                <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>{errors.get('password') ?? ''}</span>
                            </div>
                        </div>
                        <div className='d-flex justify-content-center align-items-center py-2 mt-3'>
                            <Button
                                handleOnClick={handleLoginBtnClick}
                                classNameStr="bg-primary rounded border-0 px-4 py-2 login-modal-input"
                            >
                                <span className="text-white">
                                    Login
                                </span>
                            </Button>
                        </div>
                        <div className="d-flex justify-content-center align-items-center py-3">
                            <Button
                                color="#3C719F"
                                defaultStyleObj={{
                                    background: "none",
                                    color: "inherit",
                                    border: "none",
                                    font: "inherit",
                                    cursor: "pointer",
                                    outline: "inherit",
                                }}
                                className="d-block no-link-decoration"
                                handleOnClick={handleForgotYourPasswordBtnClick}
                            >
                                <span className='text-primary underline-on-hover'>
                                    Forgot your password?
                                </span>
                            </Button>
                        </div>
                    </form>
                </section>
                <div className="d-flex justify-content-center align-items-center border-top py-3 flex-column flex-sm-row">
                    <span className='text-black'>
                        Don{"'"}t have an account?
                    </span>
                    <Button
                        color="#3C719F"
                        defaultStyleObj={{
                            background: "none",
                            color: "inherit",
                            border: "none",
                            font: "inherit",
                            cursor: "pointer",
                            outline: "inherit",
                        }}
                        className="d-block no-link-decoration"
                        handleOnClick={handleCreateOneBtnClick}
                    >
                        <span className='text-primary underline-on-hover ms-1'>
                            Create one.
                        </span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default LoginModal;