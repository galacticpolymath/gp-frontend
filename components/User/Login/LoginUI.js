/* eslint-disable quotes */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { useContext } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import GoogleSignIn from "../GoogleSignIn";
import { useUserEntry } from "../../../customHooks/useUserEntry";
import { CustomInput } from "../formElements";

const LoginUI = ({
    className = '',
    headingTitleClassName = "text-white text-center mt-2",
}) => {
    const { _loginForm, handleLoginBtnClick, _isUserEntryInProcess, _userEntryErrors } = useUserEntry();
    const { _isCreateAccountModalDisplayed, _isPasswordResetModalOn } = useContext(ModalContext);
    const [, setLoginForm] = _loginForm;
    const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    const [, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
    const [isUserEntryInProcess] = _isUserEntryInProcess;
    const [userEntryErrors, setUserEntryErrors] = _userEntryErrors;
    const inputFieldClassName = 'col-12 col-sm-7';

    const handleOnInputChange = event => {
        const { name, value } = event.target;

        if (userEntryErrors.has(name)) {
            setUserEntryErrors(state => {
                const userEntryErrorsClone = structuredClone(state);

                userEntryErrorsClone.delete(name);

                return userEntryErrorsClone;
            });
        }

        setLoginForm(currentState => ({
            ...currentState,
            [name]: value,
        }));
    };

    const handleCreateOneBtnClick = () => {
        setIsCreateAccountModalDisplayed(true);
    };

    return (
        <div className={className}>
            <div className="d-flex justify-content-center align-items-center">
                <img
                    src='/imgs/gp_logo_gradient_transBG.png'
                    alt="gp_logo"
                    width={75}
                    height={75}
                />
            </div>
            <h5 className={headingTitleClassName}>GP Login</h5>
            <section>
                <form>
                    <div className="mt-3 d-flex justify-content-center align-items-center flex-column">
                        <label
                            className={`d-flex p-0 position-relative ${inputFieldClassName} ${userEntryErrors.has('email') ? 'text-danger' : ''}  fw-bold pb-2`}
                            htmlFor="email-input"

                        >
                            Email:
                        </label>
                        <CustomInput
                            onChange={event => {
                                handleOnInputChange(event);
                            }}
                            inputStyle={{ width: "100%", height: '45px', fontSize: '20px' }}
                            inputContainerCss={`${inputFieldClassName} rounded position-relative bg-light-blue ${userEntryErrors.has('email') ? 'border-danger' : 'border'}`}
                            inputClassName={`px-1 py-2 position-relative no-outline border-0 rounded bg-light-blue`}
                            inputId="email-input"
                            inputName="email"
                        />
                    </div>
                    <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                        <div className={`${inputFieldClassName} d-flex align-items-center position-relative`}>
                            <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>
                                {userEntryErrors.get('email') ?? ''}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 d-flex justify-content-center align-items-center flex-column">
                        <label
                            className={`d-flex p-0 position-relative ${userEntryErrors.has('password') ? 'text-danger' : ''} ${inputFieldClassName} fw-bold pb-2`}
                            htmlFor="password-input"

                        >
                            Password:
                        </label>
                        <CustomInput
                            onChange={event => {
                                handleOnInputChange(event);
                            }}
                            inputStyle={{
                                width: "90%",
                                height: '45px',
                                fontSize: '20px',
                                borderTopRightRadius: '0px',
                                borderBottomRightRadius: '0px',
                                borderTopLeftRadius: '6.75px',
                                borderBottomLeftRadius: '6.75px',
                            }}
                            iconContainerStyle={{ width: "10%", borderTopRightRadius: '6.75px', borderBottomRightRadius: '6.75px' }}
                            iconContainerClassName='h-100 end-0 position-absolute top-0 d-flex justify-content-center align-items-center bg-light-blue'
                            inputContainerCss={`${inputFieldClassName} ${userEntryErrors.has('password') ? 'border-danger text-danger' : 'border'} rounded position-relative`}
                            inputClassName='px-1 py-2 position-relative no-outline border-0 bg-light-blue'
                            inputId="password-input"
                            inputName="password"
                            isPasswordInput
                        />
                    </div>
                    <div className="my-2 py-1 d-flex justify-content-center align-items-center">
                        <div className={`d-flex align-items-center position-relative ${inputFieldClassName}`}>
                            <span style={{ fontSize: '16px' }} className='left-0 text-danger position-absolute'>
                                {userEntryErrors.get('password') ?? ''}
                            </span>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center px-2 px-sm-0 py-2 mt-3 row'>
                        <Button
                            handleOnClick={handleLoginBtnClick}
                            defaultStyleObj={{ borderRadius: '5px' }}
                            classNameStr={`bg-primary border-0 px-4 py-2 ${inputFieldClassName}`}
                        >
                            {isUserEntryInProcess
                                ?
                                (
                                    <div
                                        className="spinner-border spinner-border-sm text-light"
                                        role="status"
                                    >
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                )
                                :
                                <span className="text-white">Login</span>
                            }
                        </Button>
                    </div>
                    <div className="d-flex justify-content-center align-items-center mt-3 mb-4">
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
                            className={`d-block no-link-decoration ${inputFieldClassName}`}
                            handleOnClick={() => {
                                setIsPasswordResetModalOn(true);
                            }}
                        >
                            <span className='text-primary underline-on-hover'>
                                Forgot your password?
                            </span>
                        </Button>
                    </div>
                    <div className="d-flex justify-content-center mt-3 mb-2">
                        <div style={{ width: "48%" }} className='d-flex justify-content-center justify-content-sm-end align-items-center'>
                            <div style={{ height: "3px", width: '80%' }} className={`bg-black rounded`} />
                        </div>
                        <div style={{ width: "4%" }} className='d-flex justify-content-center align-items-center'>
                            <span className={`text-black`}>OR</span>
                        </div>
                        <div style={{ width: "48%" }} className='d-flex justify-content-center justify-content-sm-start align-items-center'>
                            <div style={{ height: "3px", width: '80%' }} className={`bg-black rounded`} />
                        </div>
                    </div>
                </form>
            </section>
            <section className="d-flex justify-content-center align-items-center pt-3 pb-4">
                <GoogleSignIn
                    callbackUrl={(typeof window !== 'undefined') ? window.location.href : ''}
                    className="rounded p-2 d-flex justify-content-center align-items-center border shadow"
                />
            </section>
            <div className="d-flex flex-sm-row flex-column justify-content-center align-items-center border-top pt-3 pb-5">
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
                    <span className='ms-1 text-primary underline-on-hover'>
                        Sign up.
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default LoginUI;