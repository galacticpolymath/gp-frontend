/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
import { useContext } from "react";
import { Modal } from "react-bootstrap";
import { ModalContext } from "../../providers/ModalProvider";
import { useLogin } from "../../customHooks/useLogin";
import GoogleSignIn from "./GoogleSignIn";
import CustomLink from "../CustomLink";
import { MdOutlineMail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import Button from "../General/Button";

const LoginModal = () => {
    const { _isLoginModalDisplayed } = useContext(ModalContext);
    const [isLoginModalDisplayed, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const { _loginForm } = useLogin();
    const [loginForm, setLoginForm] = _loginForm;

    const handleOnHide = () => {
        setIsLoginModalDisplayed(false);
    };

    const handleLoginBtnClick = () => {

    };

    return (
        <Modal
            show={isLoginModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='selected-gp-web-app-content'
        >
            <div className="">
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
        </Modal>
    );
};

export default LoginModal;