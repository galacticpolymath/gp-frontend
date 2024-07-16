/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
import Button from "../General/Button";
import { MdOutlineMail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { signIn } from 'next-auth/react';
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useLogin } from "../../customHooks/useLogin";
import CustomLink from "../CustomLink";

const GoogleSignIn = () => {
    const handleBtnClick = event => {
        event.preventDefault();
        signIn('google');
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

const LoginModal = ({
    className = 'position-absolute login-ui-modal rounded pt-2 box-shadow-login-ui-modal',
    styleObj = {},
}) => {

    // GOAL: present the login modal in bootstrap modal
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { sendUserInputToServer, userErrorType } = useLogin();

    const handleLoginBtnClick = () => {
        sendUserInputToServer(credentials);
    };

    return (
        <div className={className} style={styleObj}>
            <div className="d-flex justify-content-center align-items-center">
                <img
                    src='imgs/gp_logo_gradient_transBG.png'
                    alt="gp_logo"
                    width={75}
                    height={75}
                />
            </div>
            <h5 className="text-white text-center mt-2">GP Login</h5>
            <section>
                <form>
                    <div className="mt-3 d-flex justify-content-center align-items-center position-relative">
                        <label
                            style={{ width: '12.5%' }}
                            className="position-absolute start-0 d-flex justify-content-center align-items-center"
                            htmlFor="email-input"
                        >
                            <MdOutlineMail fontSize='31px' color="#D6D6D6" />
                        </label>
                        <input
                            id="email-input"
                            placeholder="Email"
                            style={{ borderRadius: "5px", fontSize: "18px", background: '#D6D6D6' }}
                            className="border-0 p-1 w-75 py-2"
                        />
                    </div>
                    <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                        <div className='w-75 d-flex align-items-center position-relative'>
                            <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>*Incorrect email or password.</span>
                        </div>
                    </div>
                    <div className="mt-4 d-flex justify-content-center align-items-center">
                        <label
                            style={{ width: '12.5%' }}
                            className="position-absolute start-0 d-flex justify-content-center align-items-center"
                            htmlFor="password-input"
                        >
                            <FaLock fontSize='31px' color="#D6D6D6" />
                        </label>
                        <input
                            id='password-input'
                            placeholder="Password"
                            style={{ borderRadius: "5px", fontSize: "18px", background: '#D6D6D6', border: 'solid 2px red' }}
                            className="no-outline p-1 w-75 py-2 text-danger"
                        />
                    </div>
                    <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                        <div className='w-75 d-flex align-items-center position-relative'>
                            <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>*Incorrect email or password.</span>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-2 mt-3'>
                        <Button
                            handleOnClick={handleLoginBtnClick}
                            classNameStr="bg-primary rounded border-0 px-4 py-2 w-75"
                        >
                            <span className="text-white">
                                Login
                            </span>
                        </Button>
                    </div>
                    <div className="d-flex justify-content-center align-items-center">
                        <CustomLink
                            color="#3C719F"
                            className="underline-on-hover no-link-decoration"
                        >
                            Forgot your email or password?
                        </CustomLink>
                    </div>
                    <div className="d-flex mt-3 mb-2">
                        <div style={{ width: "48%" }} className='d-flex justify-content-center align-items-center'>
                            <div style={{ height: "3px", width: '80%' }} className="bg-white rounded" />
                        </div>
                        <div style={{ width: "4%" }} className='d-flex justify-content-center align-items-center'>
                            <span className="text-white">OR</span>
                        </div>
                        <div style={{ width: "48%" }} className='d-flex justify-content-center align-items-center'>
                            <div style={{ height: "3px", width: '80%' }} className="bg-white rounded" />
                        </div>
                    </div>
                </form>
            </section>
            <section className="d-flex justify-content-center align-items-center pt-3 pb-4">
                <GoogleSignIn />
            </section>
            <div className="d-flex justify-content-center align-items-center border-top py-3">
                <span className='text-white'>
                    Don{"'"}t have an account?
                </span>
                <CustomLink
                    color="#3C719F"
                    className="ms-1 underline-on-hover no-link-decoration"
                >
                    Create one.
                </CustomLink>
            </div>
        </div>
    );
};

const LoginContainerForNavbar = ({ className = "position-relative" }) => {
    const handleOnClick = () => {

    };

    return (
        <div className={`login-container ${className}`}>
            <Button
                classNameStr='rounded px-3 border-0'
                handleOnClick={handleOnClick}
                backgroundColor="#333438"
            >
                <span style={{ color: 'white', fontWeight: 410 }}>
                    LOGIN
                </span>
            </Button>
            <LoginModal />
        </div>
    );
};

export default LoginContainerForNavbar;