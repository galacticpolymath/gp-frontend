/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { ModalContext } from '../../../providers/ModalProvider';
import { useUserEntry } from '../../../customHooks/useUserEntry';
import Button from '../../General/Button';
import CreateAccountWithGoogle from '../GoogleSignIn';
import { FcGoogle } from 'react-icons/fc';
import { CreateAccountInputSection, ErrorTxt } from '../formElements';
import { signIn } from 'next-auth/react';
import { BiCheckbox, BiCheckboxChecked } from 'react-icons/bi';

const SignUpModal = () => {
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const { _createAccountForm, sendFormToServer, validateForm } = useUserEntry();
    const [errors, setErrors] = useState(new Map());
    const [createAccountForm, setCreateAccountForm] = _createAccountForm;
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    /**
     * @typedef {"I solemnly swear that I am a teacher 🤨." | "I solemnly swear that I am a teacher 🤨 (REQUIRED)."} TUserIsTeacherTxt
     * @type {[TUserIsTeacherTxt, import('react').Dispatch<import('react').SetStateAction<TUserIsTeacherTxt>>]}
     */
    const [userIsTeacherTxt, setUserIsTeacherTxt] = useState("I solemnly swear that I am a teacher 🤨.");
    const [wasChecked, setWasChecked] = useState(false);
    const callbackUrl = `${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`;
    const didCheckboxErrOccur = userIsTeacherTxt === "I solemnly swear that I am a teacher 🤨 (REQUIRED).";

    const handleOnHide = () => {
        setIsCreateAccountModalDisplayed(false);
        setTimeout(() => {
            setWasChecked(false);
            setErrors(new Map());
            setUserIsTeacherTxt("I solemnly swear that I am a teacher 🤨.");
        }, 200);
    };

    const handleCheckBoxClick = () => {
        setWasChecked(state => !state);
        setUserIsTeacherTxt("I solemnly swear that I am a teacher 🤨.");
    };

    const handleSubmitBtnClick = async () => {
        const errors = await validateForm("createAccount");

        console.log('errors: ', errors);

        if ((errors.size > 0) && !wasChecked) {
            alert("An error has occurred. Please check your inputs.");
            setErrors(errors);
            setUserIsTeacherTxt("I solemnly swear that I am a teacher 🤨 (REQUIRED).");
            return;
        } else if (!wasChecked) {
            alert("An error has occurred. Please check your inputs.");
            setUserIsTeacherTxt("I solemnly swear that I am a teacher 🤨 (REQUIRED).");
            return;
        } else if (errors.size > 0) {
            alert("An error has occurred. Please check your inputs.");
            setErrors(errors);
            return;
        }

        const url = window.location.href.includes('?') ? window.location.href.split('?')[0] : window.location.href;

        sendFormToServer(
            'createAccount',
            'credentials',
            {
                createAccount: {
                    email: createAccountForm.email,
                    firstName: createAccountForm.firstName,
                    lastName: createAccountForm.lastName,
                    password: createAccountForm.password,
                },
                callbackUrl: `${url}/account`,
            }
        );
    };

    const handleOnInputChange = event => {
        if (errors.has(event.target.name)) {
            setErrors(errors => {
                const errorsClone = structuredClone(errors);

                errorsClone.delete(event.target.name);

                return errorsClone;
            });
        }

        setCreateAccountForm(form => ({
            ...form,
            [event.target.name]: event.target.value,
        }));
    };

    const handleCreateAnAccountWithGoogleBtnClick = event => {
        event.preventDefault();

        if (!wasChecked) {
            setUserIsTeacherTxt("I solemnly swear that I am a teacher 🤨 (REQUIRED).");
            setTimeout(() => {
                alert("Please check off that you are a teacher.");
            }, 200);
            return;
        }

        if (!callbackUrl) {
            console.error('The callback url cannot be empty.');
            return;
        }

        signIn('google', { callbackUrl: callbackUrl });
    };

    return (
        <Modal
            show={isCreateAccountModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='create-account-ui-modal pt-2 box-shadow-login-ui-modal'
        >
            <ModalHeader style={{ height: "65px" }} className='d-flex flex-column'>
                <CloseButton onClick={handleOnHide} className='position-absolute top-0 end-0 me-1 mt-1' />
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
                <h5 className="text-black text-center mt-2 my-0">
                    Sign up
                </h5>
            </ModalHeader>
            <ModalBody className='pt-2 px-1 pb-2'>
                <section className='mt-2 d-flex justify-content-center align-items-center'>
                    <CreateAccountWithGoogle
                        handleGoogleBtnClickCustom={handleCreateAnAccountWithGoogleBtnClick}
                        callbackUrl={`${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`}
                        className='rounded shadow w-75 px-3 py-2  py-sm-4 px-sm-5 w-50 d-flex flex-column flex-sm-row justify-content-center align-items-center border google-sign-in-btn'
                        style={{ maxWidth: '400px' }}

                    >
                        <FcGoogle className="mx-2" size={31} />
                        <span className='d-inline-flex justify-content-center align-items-center h-100'>
                            Sign up with Google.
                        </span>
                    </CreateAccountWithGoogle>
                </section>
                <div className="d-flex justify-content-center mt-3 mb-2">
                    <div style={{ width: '48%' }} className='d-flex justify-content-center justify-content-sm-end align-items-center'>
                        <div style={{ height: '3px', width: '95%' }} className="bg-black rounded me-3 me-sm-2" />
                    </div>
                    <div style={{ width: '4%' }} className='d-flex justify-content-center align-items-center'>
                        <span className='text-black'>OR</span>
                    </div>
                    <div style={{ width: '48%' }} className='d-flex justify-content-center justify-content-sm-start align-items-center'>
                        <div style={{ height: '3px', width: '95%' }} className="bg-black rounded ms-3 ms-sm-2" />
                    </div>
                </div>
                <form className='mt-2 row d-flex justify-content-center align-items-center flex-column'>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex col-sm-6 flex-column ">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="first-name"
                            >
                                First name:
                            </label>
                            <input
                                id="first-name"
                                placeholder="First Name"
                                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                                className="border-0 p-1 w-100 py-2"
                                autoFocus
                                name="firstName"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('firstName') && <span>{errors.get('firstName')}</span>}
                            </section>
                        </div>
                        <CreateAccountInputSection
                            errors={errors}
                            errorsFieldName="lastName"
                            labelHtmlFor="last-name-id"
                            inputId="lastName"
                            inputName="lastName"
                            inputPlaceholder="Last Name"
                            labelTxt="Last Name"
                        />
                    </div>
                    <div className='row'>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Email:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Email"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    border: errors.has('email') ? 'solid 1px red' : '',
                                    background: '#D6D6D6',
                                }}
                                className={`${errors.has('email') ? '' : 'border-0'} p-1 w-100 py-2`}
                                name="email"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('email') && <ErrorTxt>{errors.get('email')}</ErrorTxt>}
                            </section>
                        </div>
                        <div className='col-6 d-none d-sm-block' />
                    </div>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Password:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Enter Your Password"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    background: '#D6D6D6',
                                    border: errors.has('password') ? 'solid 1px red' : '',
                                }}
                                className={`p-1 w-100 py-2 ${errors.has('password') ? 'text-danger' : 'border-0'}`}
                                name="password"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('password') && (
                                    <ErrorTxt>
                                        {errors.get('password')}
                                    </ErrorTxt>
                                )}
                            </section>
                        </div>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className="d-block w-100 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Confirm Password:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Confirm Your Password"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    background: '#D6D6D6',
                                    border: errors.has('password') ? 'solid 1px red' : '',
                                }}
                                className={`${(errors.size === 0) ? 'border-0' : ''} p-1 w-100 py-2`}
                                name="confirmPassword"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('password') && (
                                    <ErrorTxt>
                                        {errors.get('password')}
                                    </ErrorTxt>
                                )}
                            </section>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-2 mt-1'>
                        <Button
                            handleOnClick={handleSubmitBtnClick}
                            classNameStr="bg-primary rounded border-0 py-2 w-50 text-white underline-on-hover"
                        >
                            SIGN UP
                        </Button>
                    </div>
                </form>
            </ModalBody>
            <ModalFooter className='position-relative px-0 py-2'>
                <section className='d-flex flex-sm-row w-100'>
                    <section className='p-0 row w-100 m-0'>
                        <div className='d-flex justify-content-center justify-content-sm-end col-12 col-sm-4 ps-0 pb-0 pe-0 pt-1'>
                            {wasChecked ? (
                                <BiCheckboxChecked
                                    onClick={handleCheckBoxClick}
                                    fontSize="21px"
                                />
                            )
                                : (
                                    <BiCheckbox
                                        onClick={handleCheckBoxClick}
                                        color={didCheckboxErrOccur ? 'red' : ""}
                                        fontSize="21px"
                                    />
                                )}
                        </div>
                        <div className='d-flex justify-content-center justify-content-sm-start col-12 col-sm-8 p-0'>
                            <label
                                className={`${didCheckboxErrOccur ? 'text-danger' : ''} text-sm-start text-center`}
                                style={{
                                    fontSize: "18px",
                                }}
                            >
                                *{userIsTeacherTxt}
                            </label>
                        </div>
                    </section>
                </section>
            </ModalFooter>
        </Modal>
    );
};

export default SignUpModal;
