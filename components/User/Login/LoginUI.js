/* eslint-disable quotes */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { useContext } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import { MdOutlineMail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import Button from "../../General/Button";
import CustomLink from "../../CustomLink";
import GoogleSignIn from "../GoogleSignIn";
import { useUserEntry } from "../../../customHooks/useUserEntry";

const LoginUI = ({
    className = '',
    headingTitleClassName = "text-white text-center mt-2",
    isInputIconShow = true,
}) => {
    const { sendFormToServer, _loginForm } = useUserEntry();
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const [loginForm, setLoginForm] = _loginForm;
    const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    const inputFieldClassName = 'col-7';

    const handleOnInputChange = event => {
        const { name, value } = event.target;

        setLoginForm(currentState => ({
            ...currentState,
            [name]: value,
        }));
    };

    const handleLoginBtnClick = () => {
        sendFormToServer(
            "login",
            "credentials",
            {
                login: {
                    email: loginForm.email,
                    password: loginForm.password,
                },
            },
        );
    };

    const handleCreateOneBtnClick = () => {
        // setIsLoginModalDisplayed(false);
        setIsCreateAccountModalDisplayed(true);
    };

    return (
        <div className={className}>
            <div className="d-flex justify-content-center align-items-center">
                <img
                    src='imgs/gp_logo_gradient_transBG.png'
                    alt="gp_logo"
                    width={75}
                    height={75}
                />
            </div>
            <h5 className={headingTitleClassName}>GP Login</h5>
            <section>
                <form>
                    <div className="mt-3 d-flex justify-content-center align-items-center position-relative row">
                        <label
                            style={{ width: '12.5%', display: isInputIconShow ? 'flex' : 'none' }}
                            className="position-absolute bg-danger start-0 justify-content-center align-items-center"
                            htmlFor="email-input"
                        >
                            <MdOutlineMail fontSize='31px' color="#D6D6D6" />
                        </label>
                        <input
                            id="email-input"
                            placeholder="Email"
                            style={{ borderRadius: "5px", fontSize: "18px", background: '#D6D6D6' }}
                            className={`border-0 p-1 ${inputFieldClassName} py-2`}
                            name="email"
                            onChange={event => {
                                handleOnInputChange(event);
                            }}
                        />
                    </div>
                    <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                        <div className={`${inputFieldClassName} d-flex align-items-center position-relative`}>
                            <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>*Incorrect email or password.</span>
                        </div>
                    </div>
                    <div className="mt-4 d-flex justify-content-center align-items-center row">
                        <label
                            style={{ width: '12.5%', display: isInputIconShow ? 'flex' : 'none' }}
                            className="position-absolute start-0 justify-content-center align-items-center"
                            htmlFor="email-input"
                        >
                            <FaLock fontSize='31px' color="#D6D6D6" />
                        </label>
                        <input
                            id='password-input'
                            placeholder="Password"
                            style={{ borderRadius: "5px", fontSize: "18px", background: '#D6D6D6', border: 'solid 2px red' }}
                            className={`no-outline p-1 py-2 text-danger ${inputFieldClassName}`}
                            name='password'
                            onChange={event => {
                                handleOnInputChange(event);
                            }}
                        />
                    </div>
                    <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                        <div className={`d-flex align-items-center position-relative ${inputFieldClassName}`}>
                            <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>*Incorrect email or password.</span>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-2 mt-3 row'>
                        <Button
                            handleOnClick={handleLoginBtnClick}
                            classNameStr={`bg-primary rounded-pill border-0 px-4 py-2 ${inputFieldClassName}`}
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
                    <div className="d-flex justify-content-center mt-3 mb-2">
                        {/* <div style={{ width: "48%" }} className='d-flex justify-content-center align-items-center'>
                            <div style={{ height: "3px", width: '80%' }} className={`bg-black rounded`} />
                        </div> */}
                        <div style={{ width: "4%" }} className='d-flex justify-content-center align-items-center'>
                            <span className={`text-black`}>OR</span>
                        </div>
                        {/* <div style={{ width: "48%" }} className='d-flex justify-content-center align-items-center'>
                            <div style={{ height: "3px", width: '80%' }} className={`bg-black rounded`} />
                        </div> */}
                    </div>
                </form>
            </section>
            <section className="d-flex justify-content-center align-items-center pt-3 pb-4">
                <GoogleSignIn
                    callbackUrl={(typeof window !== 'undefined') ? window.location.href : ''}
                    className="rounded p-2 d-flex justify-content-center align-items-center border shadow"
                />
            </section>
            <div className="d-flex justify-content-center align-items-center border-top py-3">
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
                    <span className='text-primary underline-on-hover'>
                        Create one.
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default LoginUI;