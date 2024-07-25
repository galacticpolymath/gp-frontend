/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
import { useContext } from "react";
import { Modal } from "react-bootstrap";
import { MdOutlineMail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import CustomLink from "../../CustomLink";
import GoogleSignIn from "../GoogleSignIn";
import ORTxtDivider from "../ORTxtDivider";
import { useUserEntry } from "../../../customHooks/useUserEntry";

const LoginModal = () => {
    const { _isLoginModalDisplayed, _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const [isLoginModalDisplayed, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    const { _loginForm, sendFormToServer } = useUserEntry();
    const [loginForm, setLoginForm] = _loginForm;

    const handleOnInputChange = event => {
        const { name, value } = event.target;

        setLoginForm(currentState => ({
            ...currentState,
            [name]: value,
        }));
    };

    const handleOnHide = () => {
        setIsLoginModalDisplayed(false);
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
        setIsLoginModalDisplayed(false);
        setTimeout(() => {
            setIsCreateAccountModalDisplayed(true);
        }, 300);
    };

    return (
        <Modal
            show={isLoginModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='login-ui-modal bg-white shadow-lg rounded pt-2 box-shadow-login-ui-modal'
        >
            <div>
                <div className="d-flex justify-content-center align-items-center">
                    <img
                        src='imgs/gp_logo_gradient_transBG.png'
                        alt="gp_logo"
                        width={75}
                        height={75}
                    />
                </div>
                <h5 className="text-black text-center mt-2">GP Login</h5>
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
                                name="email"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
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
                                name='password'
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
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
                        <ORTxtDivider color="black" />
                    </form>
                </section>
                <section className="d-flex justify-content-center align-items-center pt-3 pb-4">
                    <GoogleSignIn callbackUrl={(typeof window !== 'undefined') ? window.location.href : ''} />
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
        </Modal>
    );
};

export default LoginModal;